import {Component, EventEmitter, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
import {Subscription} from "rxjs";
import {SubscriptionUtils} from "../../../../util/subscription.utils";
import {BudgetModel} from "../../../../models/RequestModels";
import {ModalOptions} from "../../../../util/modal-options.utils";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {BudgetDateForm, BudgetPickerForm, DatePicker} from "../../../../models/FormModels";
import {DateUtils} from "../../../../util/date.utils";
import {SpinnerSize} from "../../shared/spinner/spinner.component";
import {HttpResponse} from "@angular/common/http";
import {HttpService} from "../../../../services/http/httpService";
import {BudgetStatus} from "../../../../models/modal-models/BudgetStatusModel";
import {ModalUtils} from "../../../../util/modal.utils";
import {AbstractControl, NgForm, NgModel} from "@angular/forms";
import {ResponseErrorModel} from "../../../../models/ResponseErrorModel";
import {TimerUtils} from "../../../../util/timer.utils";
import {AnimationsConfig, DatesConfig, LoadersConfig} from "../../../../app-config";

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
  protected readonly DateUtils = DateUtils;
  protected readonly ModalUtils = ModalUtils;
  protected readonly SpinnerSize = SpinnerSize;
  protected readonly LoadersConfig = LoadersConfig;
  protected subscriptions: Subscription[];
  protected budgetPickerForm: BudgetPickerForm;
  protected budgetPicker: DatePicker;
  protected budgetStatusIcon: BudgetStatus;
  protected responseErrorModel: ResponseErrorModel;
  protected isEditing: boolean;
  protected displayTimer: boolean;
  protected displayLoader: boolean;
  protected disableForm: boolean;
  private idBudget: string;

  constructor(
    private modalService: NgbModal,
    private httpService: HttpService) {
  }

  ngOnDestroy(): void {
    SubscriptionUtils.unsubscribeAll(this.subscriptions);
  }

  ngOnInit(): void {
    this.subscriptions = [];
    this.responseErrorModel = new ResponseErrorModel();
    this.resetBudgetStatus();
    this.resetDatePicker();
    this.resetModalOptions();
  }

  open(budgetData?: BudgetModel): void {
    this.resetBudgetStatus();
    this.resetDatePicker();
    this.resetModalOptions();

    this.responseErrorModel = new ResponseErrorModel();
    this.isEditing = budgetData != null;

    if (budgetData) {
      this.idBudget = budgetData.id;
      this.budgetPickerForm.name = budgetData.name;
      this.budgetPickerForm.dateStart = DateUtils
        .convertToDatePicker(budgetData.dateStart);
      this.budgetPickerForm.dateEnd = DateUtils
        .convertToDatePicker(budgetData.dateEnd);
    }

    this.modalService.open(this.budgetModal, ModalOptions.default());
  }

  protected onDatesChanged(dateStartInput: NgModel, dateEndInput: NgModel): void {
    const datePickerStart = this.budgetPickerForm.dateStart;
    const datePickerEnd = this.budgetPickerForm.dateEnd;

    const dateStart = DateUtils.convertToDate(datePickerStart);
    const dateEnd = DateUtils.convertToDate(datePickerEnd);

    if (datePickerStart.month != datePickerEnd.month) {
      dateStartInput.control.setErrors({invalidMonth: DatesConfig.MONTHS_MESSAGE});
      dateEndInput.control.setErrors({invalidMonth: DatesConfig.MONTHS_MESSAGE});
    } else if (datePickerStart.year != datePickerEnd.year) {
      dateStartInput.control.setErrors({invalidYear: DatesConfig.YEARS_MESSAGE});
      dateEndInput.control.setErrors({invalidYear: DatesConfig.YEARS_MESSAGE});
    } else if (dateStart >= dateEnd) {
      dateStartInput.control.setErrors({invalidRange: DatesConfig.RANGE_MESSAGE});
      dateEndInput.control.setErrors({invalidRange: DatesConfig.RANGE_MESSAGE});
    } else if (DateUtils.isInvalidDate(dateStart)) {
      dateStartInput.control.setErrors({ngbDate: true});
    } else if (DateUtils.isInvalidDate(dateEnd)) {
      dateEndInput.control.setErrors({ngbDate: true});
    } else {
      dateStartInput.control.setErrors(null);
      dateEndInput.control.setErrors(null);
    }
  }

  protected onDateChanged(input: NgModel): void {
    if (DateUtils.isInvalidDate(this.budgetPicker)) {
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
    this.budgetPickerForm.dateStart.day++;
    this.budgetPickerForm.dateEnd.day++;

    const budgetForm = {
      name: this.budgetPickerForm.name,
      dateStart: DateUtils.convertToDate(this.budgetPickerForm.dateStart),
      dateEnd: DateUtils.convertToDate(this.budgetPickerForm.dateEnd)
    } as BudgetDateForm;

    this.subscriptions.push(
      this.httpService.updateBudget(
        budgetForm,
        this.idBudget).subscribe({
        next: (response: HttpResponse<any>): void => {
          this.onRequestSuccess(response);
        },
        error: (err): void => {
          this.onRequestFailed(err, this.responseErrorModel);
        },
        complete: (): void => {
          this.updateBudgetEvent.emit(this.idBudget);
          new TimerUtils(AnimationsConfig.DEFAULT_DURATION).start()
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
    const budgetDate = DateUtils
      .format(DateUtils.convertToDate(this.budgetPicker));

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

  private onRequestFailed(err: any, control: AbstractControl | ResponseErrorModel): void {
    if (control instanceof AbstractControl) {
      control.setErrors({'responseMessage': err.error["message"]})
    } else {
      this.responseErrorModel.traceId = err.headers.get('X-Trace-Id');
      this.responseErrorModel.responseStatusCode = err.status;
      this.responseErrorModel.responseErrorModel = err.error;
      this.errorModal.open(this.responseErrorModel);
    }

    this.budgetStatusIcon = {
      status: false,
      message: err.status + " - " + err.error["title"]
    } as BudgetStatus;

    this.disableForm = false;
  }

  private resetDatePicker(): void {
    this.budgetPickerForm = DatesConfig.DEFAULT_PICKER;
    this.budgetPicker = DateUtils.convertToDatePicker(DatesConfig.FIRST_DAY);
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
