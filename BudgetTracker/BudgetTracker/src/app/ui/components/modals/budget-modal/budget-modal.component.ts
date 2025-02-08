import {Component, EventEmitter, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
import {interval, Subscription, takeWhile} from "rxjs";
import {ErrorModel} from "../../../../models/ErrorModel";
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

@Component({
  selector: 'app-budget-modal',
  templateUrl: './budget-modal.component.html',
  styleUrl: './budget-modal.component.css'
})
export class BudgetModalComponent implements OnInit, OnDestroy {
  @ViewChild('budgetModal') budgetModal: any;
  @Output() indexPageEvent = new EventEmitter<boolean>();
  @Output() budgetUpdateEvent = new EventEmitter<string>();
  protected readonly DateUtils = DateUtils;
  protected readonly SpinnerSize = SpinnerSize;
  protected readonly maxTime = 25;
  protected subscriptions: Subscription[];
  protected budgetResponse: BudgetStatus;
  protected errorModel: ErrorModel;
  protected budgetForm: BudgetPickerForm;
  protected budgetDate: DatePickerModel;
  protected isEditing: boolean;
  protected displayLoader: boolean;
  protected displayError: boolean;
  protected autoCloseModal: boolean;
  protected timeLeft: number;
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
    this.setDefaultBudgetToSendForm();
    this.errorModel = new ErrorModel();
    this.subscriptions = [];
    this.displayLoader = false;
    this.displayError = false;
    this.isEditing = false;
    this.autoCloseModal = false;
  }

  open(budgetData?: BudgetModel): void {
    this.resetBudgetStatus();
    this.setDefaultBudgetToSendForm();
    this.autoCloseModal = false;

    this.isEditing = budgetData != null;

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

  protected validateDate(input1: any, input2: any): void {
    const dateStart = this.budgetForm.dateStart;
    const dateEnd = this.budgetForm.dateEnd;

    if (dateStart.month != dateEnd.month) {
      input1.control.setErrors({invalidMonth: 'Invalid month'});
      input2.control.setErrors({invalidMonth: 'Invalid month'});
    } else if (dateStart.year != dateEnd.year) {
      input1.control.setErrors({invalidYear: 'Invalid year'});
      input2.control.setErrors({invalidYear: 'Invalid year'});
    } else {
      input1.control.setErrors(null);
      input2.control.setErrors(null);
    }
  }

  protected saveBudget(): void {
    this.autoCloseModal = false;

    if (this.isEditing) {
      this.updateBudget();
    } else {
      this.createBudget();
    }
  }

  private updateBudget(): void {
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
          this.budgetUpdateEvent.emit(this.idBudget);
        },
        error: (err): void => {
          this.onRequestFailed(err);
        }
      })
    )
  }

  private createBudget(): void {
    const budgetDate = DateUtils
      .format(DateUtils.convertToDate(this.budgetDate));

    this.subscriptions.push(
      this.httpService.createBudget(
        budgetDate
      ).subscribe({
        next: (response: HttpResponse<any>): void => {
          this.onRequestSuccess(response);
          this.indexPageEvent.emit(true);
        },
        error: (err): void => {
          this.onRequestFailed(err);
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

  private onRequestFailed(err: any): void {
    this.errorModel.traceId = err.headers.get('X-Trace-Id');
    this.budgetResponse = {
      status: false,
      message: err.status + " - " + err.error["title"]
    } as BudgetStatus;
  }

  private setDefaultBudgetToSendForm(): void {
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

  protected readonly ModalUtils = ModalUtils;
}
