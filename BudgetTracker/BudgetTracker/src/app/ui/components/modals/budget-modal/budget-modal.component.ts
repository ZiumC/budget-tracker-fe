import {
  Component,
  EventEmitter,
  OnDestroy,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import {Subscription} from "rxjs";
import {SubscriptionUtils} from "../../../../util/subscription.utils";
import {BudgetModel} from "../../../../models/RequestModels";
import {ModalOptions} from "../../../../util/modal-options.utils";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {BudgetForm, BudgetPickerForm, DatePickerModel} from "../../../../models/FormModels";
import {DateUtils} from "../../../../util/date.utils";
import {SpinnerSize} from "../../shared/spinner/spinner.component";
import {HttpResponse} from "@angular/common/http";
import {HttpService} from "../../../../services/http/httpService";
import {BudgetStatus} from "../../../../models/modal-models/BudgetStatusModel";
import {ModalUtils} from "../../../../util/modal.utils";
import {AbstractControl, NgForm, NgModel} from "@angular/forms";
import {ErrorModel} from "../../../../models/ErrorModel";

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
  protected subscriptions: Subscription[];
  protected budgetResponse: BudgetStatus;
  protected budgetForm: BudgetPickerForm;
  protected budgetDate: DatePickerModel;
  protected responseErrorModel: ErrorModel;
  protected isEditing: boolean;
  protected displayTimer: boolean;
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
    this.resetBudgetStatus();
    this.resetDatePicker();
    this.subscriptions = [];
    this.responseErrorModel = new ErrorModel();
    this.isEditing = false;
    this.displayTimer = false;
    this.disableForm = false;
  }

  open(budgetData?: BudgetModel): void {
    this.resetBudgetStatus();
    this.resetDatePicker();
    this.responseErrorModel = new ErrorModel();

    this.isEditing = budgetData != null;
    this.displayTimer = false;
    this.disableForm = false;

    if (budgetData) {
      this.idBudget = budgetData.id;
      this.budgetForm.name = budgetData.name;
      this.budgetForm.dateStart = DateUtils
        .convertToDatePicker(budgetData.dateStart);
      this.budgetForm.dateEnd = DateUtils
        .convertToDatePicker(budgetData.dateEnd);
    }

    this.modalService.open(this.budgetModal, ModalOptions.default());
  }

  protected onDatesChanged(input1: NgModel, input2: NgModel): void {
    const dateStart = this.budgetForm.dateStart;
    const dateEnd = this.budgetForm.dateEnd;

    const monthsMessage = 'Months in both dates should be equal.'
    const yearsMessage = 'Years in both dates should be equal.'

    if (dateStart.month != dateEnd.month) {
      input1.control.setErrors({invalidMonth: monthsMessage});
      input2.control.setErrors({invalidMonth: monthsMessage});
    } else if (dateStart.year != dateEnd.year) {
      input1.control.setErrors({invalidYear: yearsMessage});
      input2.control.setErrors({invalidYear: yearsMessage});
    } else {
      input1.control.setErrors(null);
      input2.control.setErrors(null);
    }
  }

  protected onDateChanged(input: NgModel): void {
    this.resetBudgetStatus();
    input.control.setErrors(null);
  }

  protected onFinishedEvent(modal: any): void {
    this.refreshPageEvent.emit(true);
    modal.close();
  }

  protected saveBudget(formControls: NgForm): void {
    this.disableForm = true;
    if (this.isEditing) {
      this.updateBudget(formControls);
    } else {
      this.createBudget(formControls);
    }
  }

  protected close(modal: any): void {
    if (!ModalUtils.isUndefinedBudgetStatus(this.budgetResponse) &&
      this.budgetResponse.status) {
      this.refreshPageEvent.emit(true);
    }

    modal.close();
  }

  private updateBudget(formControls: NgForm): void {
    this.budgetForm.dateStart.day++;
    this.budgetForm.dateEnd.day++;

    const budgetForm = {
      name: this.budgetForm.name,
      dateStart: DateUtils.convertToDate(this.budgetForm.dateStart),
      dateEnd: DateUtils.convertToDate(this.budgetForm.dateEnd)
    } as BudgetForm;

    this.subscriptions.push(
      this.httpService.updateBudget(
        budgetForm,
        this.idBudget).subscribe({
        next: (response: HttpResponse<any>): void => {
          this.onRequestSuccess(response);
          this.updateBudgetEvent.emit(this.idBudget);
        },
        error: (err): void => {
          this.onRequestFailed(err, this.responseErrorModel);
          this.errorModal.open(this.responseErrorModel);
        }
      })
    )
  }

  private createBudget(formControls: NgForm): void {
    const budgetDate = DateUtils
      .format(DateUtils.convertToDate(this.budgetDate));

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
    this.budgetResponse = {
      status: isSuccess,
      message: status + " - Ok"
    } as BudgetStatus;
  }

  private onRequestFailed(err: any, control: AbstractControl | ErrorModel): void {
    if (control instanceof AbstractControl) {
      control.setErrors({'responseMessage': err.error["message"]})
    } else {
      this.responseErrorModel.traceId = err.headers.get('X-Trace-Id');
      this.responseErrorModel.responseStatusCode = err.status;
      this.responseErrorModel.responseErrorModel = err.error;
    }

    this.budgetResponse = {
      status: false,
      message: err.status + " - " + err.error["title"]
    } as BudgetStatus;

    this.disableForm = false;
  }

  private resetDatePicker(): void {
    const now = new Date();
    const firsDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    this.budgetForm = {
      name: "",
      dateStart: DateUtils.convertToDatePicker(firsDay),
      dateEnd: DateUtils.convertToDatePicker(lastDay)
    } as BudgetPickerForm;

    this.budgetDate = DateUtils.convertToDatePicker(firsDay);
  }

  private resetBudgetStatus(): void {
    this.budgetResponse = new BudgetStatus();
  }
}
