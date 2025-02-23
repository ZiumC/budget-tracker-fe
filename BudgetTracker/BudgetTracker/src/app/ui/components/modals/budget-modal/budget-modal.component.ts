import {Component, EventEmitter, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
import {Subscription} from "rxjs";
import {SubscriptionUtils} from "../../../../util/subscription.utils";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {DatePicker} from "../../../../models/datepicker.model";
import {DatePickerUtil, DateUtil, isInvalidDate} from "../../../../util/date.util";
import {SpinnerSize} from "../../shared/spinner/spinner.component";
import {HttpResponse} from "@angular/common/http";
import {HttpService} from "../../../../services/http/http.service";
import {BudgetDatePicker, BudgetStatus} from "../../../../models/modal/budget.model.modal";
import {ModalOptions, ModalUtils} from "../../../../util/modal.utils";
import {AbstractControl, NgForm, NgModel} from "@angular/forms";
import {ResponseModel} from "../../../../models/response.model";
import {TimerUtils} from "../../../../util/timer.utils";
import {BudgetDto, GetBudgetDto} from "../../../../models/dto/budget.model.dto";
import {AppConfig} from "../../../../models/config/config";
import {FormConfig} from "../../../../models/config/form.model.config";
import {ConfigService} from "../../../../services/config/config.service";
import {formatString} from "../../../../util/string.utils";

@Component({
  selector: 'app-budget-modal',
  templateUrl: './budget-modal.component.html',
  styleUrl: './budget-modal.component.css'
})
export class BudgetModalComponent implements OnInit, OnDestroy {
  @ViewChild('budgetModal') budgetModal: any;
  @ViewChild('errorModal') errorModal: any;
  @Output() refreshPageEvent = new EventEmitter<boolean>();
  @Output() updateBudgetEvent = new EventEmitter<string>();
  protected readonly DatePickerUtil = DatePickerUtil;
  protected readonly ModalUtils = ModalUtils;
  protected readonly SpinnerSize = SpinnerSize;
  protected readonly formatString = formatString;
  protected appConfig: AppConfig;
  protected formConfig: FormConfig;
  protected subscriptions: Subscription[];
  protected editBudgetDatePicker: BudgetDatePicker;
  protected addBudgetDatePicker: DatePicker;
  protected budgetStatusIcon: BudgetStatus;
  protected responseModel: ResponseModel;
  protected isEditing: boolean;
  protected displayTimer: boolean;
  protected displayLoader: boolean;
  protected disableForm: boolean;
  private idBudget: string;

  constructor(
    private modalService: NgbModal,
    private httpService: HttpService,
    private configService: ConfigService) {
  }

  ngOnDestroy(): void {
    SubscriptionUtils.unsubscribeAll(this.subscriptions);
  }

  ngOnInit(): void {
    this.subscriptions = [];
    this.responseModel = new ResponseModel();
    this.resetBudgetStatus();
    this.resetDatePicker();
    this.resetModalOptions();

    const appCfg = this.configService.getAppConfig();
    if (appCfg) {
      this.appConfig = appCfg;
      this.formConfig = appCfg.form;
    } else {
      throw Error("Config not provided")
    }
  }

  open(budgetData?: GetBudgetDto): void {
    this.resetBudgetStatus();
    this.resetDatePicker();
    this.resetModalOptions();

    this.responseModel = new ResponseModel();
    this.isEditing = budgetData != null;

    if (budgetData) {
      this.idBudget = budgetData.id;
      this.editBudgetDatePicker.name = budgetData.name;
      this.editBudgetDatePicker.dateStart = DatePickerUtil
        .convertToDatePicker(budgetData.dateStart);
      this.editBudgetDatePicker.dateEnd = DatePickerUtil
        .convertToDatePicker(budgetData.dateEnd);
    }

    this.modalService.open(this.budgetModal, ModalOptions.default());
  }

  protected onDatesChanged(dateStartInput: NgModel, dateEndInput: NgModel): void {
    const datePickerStart = this.editBudgetDatePicker.dateStart;
    const datePickerEnd = this.editBudgetDatePicker.dateEnd;

    const isInvalidStartDate = isInvalidDate(datePickerStart);
    const isInvalidEndDate = isInvalidDate(datePickerEnd);

    if (isInvalidStartDate) {
      dateStartInput.control.setErrors({ngbDate: true});
    } else if (isInvalidEndDate) {
      dateEndInput.control.setErrors({ngbDate: true});
    } else {

      const dateStart = DatePickerUtil.convertToDate(datePickerStart);
      const dateEnd = DatePickerUtil.convertToDate(datePickerEnd);

      if (datePickerStart.month != datePickerEnd.month) {
        dateStartInput.control.setErrors({invalidMonth: true});
        dateEndInput.control.setErrors({invalidMonth: true});
      } else if (datePickerStart.year != datePickerEnd.year) {
        dateStartInput.control.setErrors({invalidYear: true});
        dateEndInput.control.setErrors({invalidYear: true});
      } else if (dateStart >= dateEnd) {
        dateStartInput.control.setErrors({invalidRange: true});
        dateEndInput.control.setErrors({invalidRange: true});
      } else {
        dateStartInput.control.setErrors(null);
        dateEndInput.control.setErrors(null);
      }
    }
  }

  protected onDateChanged(input: NgModel): void {
    if (isInvalidDate(this.addBudgetDatePicker)) {
      input.control.setErrors({ngbDate: true});
    } else {
      this.resetBudgetStatus();
      input.control.setErrors(null);
    }
  }

  protected onTimerFinishedEvent(modal: any): void {
    this.refreshPageEvent.emit(true);
    modal.close();
  }

  protected saveBudget(formControls: NgForm): void {
    this.disableForm = true;
    if (this.isEditing) {
      this.updateBudget();
    } else {
      this.createBudget(formControls);
    }
  }

  protected close(modal: any): void {
    if (!ModalUtils.isUndefinedBudgetStatus(this.budgetStatusIcon) &&
      this.budgetStatusIcon.status) {
      this.refreshPageEvent.emit(true);
    }

    modal.close();
  }

  private updateBudget(): void {
    this.displayLoader = true;

    //need to convert to number because days and months are -1
    this.editBudgetDatePicker.dateStart.day++;
    this.editBudgetDatePicker.dateEnd.day++;

    const budgetForm = {
      name: this.editBudgetDatePicker.name,
      dateStart: DatePickerUtil.convertToDate(this.editBudgetDatePicker.dateStart),
      dateEnd: DatePickerUtil.convertToDate(this.editBudgetDatePicker.dateEnd)
    } as BudgetDto;

    this.subscriptions.push(
      this.httpService.updateBudget(
        budgetForm,
        this.idBudget).subscribe({
        next: (response: HttpResponse<any>): void => {
          this.onRequestSuccess(response);
        },
        error: (err): void => {
          this.onRequestFailed(err, this.responseModel);
        },
        complete: (): void => {
          this.updateBudgetEvent.emit(this.idBudget);
          new TimerUtils(this.appConfig.animation.duration.default).start()
            .subscribe(finished => {
              if (finished) {
                this.modalService.dismissAll();
              }
            })
        }
      })
    )
  }

  private createBudget(formControls: NgForm): void {
    const budgetDate = DateUtil
      .format(DatePickerUtil.convertToDate(this.addBudgetDatePicker));

    this.subscriptions.push(
      this.httpService.createBudget(
        budgetDate
      ).subscribe({
        next: (response: HttpResponse<any>): void => {
          this.onRequestSuccess(response);
        },
        error: (err): void => {
          this.onRequestFailed(err, formControls.controls['budget-date']);
        },
        complete: (): void => {
          this.displayTimer = true;
        }
      })
    )
  }

  private onRequestSuccess(response: HttpResponse<any>): void {
    const status = response.status;
    const isSuccess = status >= 200 && status <= 299;
    this.budgetStatusIcon = {
      status: isSuccess,
      message: status + " - Ok"
    } as BudgetStatus;
  }

  private onRequestFailed(err: any, control: AbstractControl | ResponseModel): void {
    if (control instanceof AbstractControl) {
      control.setErrors({'responseMessage': err.error["message"]})
    } else {
      this.responseModel.traceId = err.headers.get('X-Trace-Id');
      this.responseModel.statusCode = err.status;
      this.responseModel.error = err.error;
      this.errorModal.open(this.responseModel);
    }

    this.budgetStatusIcon = {
      status: false,
      message: err.status + " - " + err.error["title"]
    } as BudgetStatus;

    this.disableForm = false;
  }

  private resetDatePicker(): void {
    this.editBudgetDatePicker = {
      name: "",
      dateStart: DatePickerUtil.firstDayOfCurrentMonth(),
      dateEnd: DatePickerUtil.lastDayOfCurrentMonth()
    };
    this.addBudgetDatePicker = DatePickerUtil.firstDayOfCurrentMonth();
  }

  private resetBudgetStatus(): void {
    this.budgetStatusIcon = new BudgetStatus();
  }

  private resetModalOptions(): void {
    this.isEditing = false;
    this.displayTimer = false;
    this.disableForm = false;
    this.displayLoader = false;
  }
}
