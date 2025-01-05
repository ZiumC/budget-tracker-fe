import {Component, EventEmitter, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
import {Subscription} from "rxjs";
import {ErrorModel} from "../../../../models/ErrorModel";
import {SubscriptionUtils} from "../../../../util/subscription.utils";
import {BudgetModel} from "../../../../models/RequestModels";
import {ModalOptions} from "../../../../util/modal.utils";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {BudgetForm, BudgetFormPicker} from "../../../../models/FormModels";
import {DateUtils} from "../../../../util/date.utils";
import {SpinnerSize} from "../../shared/spinner/spinner.component";
import {HttpResponse} from "@angular/common/http";
import {HttpService} from "../../../../services/http/httpService";

@Component({
  selector: 'app-budget-modal',
  templateUrl: './budget-modal.component.html',
  styleUrl: './budget-modal.component.css'
})
export class BudgetModalComponent implements OnInit, OnDestroy {
  @ViewChild('budgetModal') budgetModal: any;
  @Output() refreshIncomeEvent = new EventEmitter<boolean>();
  protected readonly SpinnerSize = SpinnerSize;
  protected subscriptions: Subscription[];
  protected errorModel: ErrorModel;
  protected budgetForm: BudgetFormPicker;
  protected isEditing: boolean;
  protected displayLoader: boolean;
  protected displayError: boolean;
  private idBudget: string;

  constructor(
    private modalService: NgbModal,
    private httpService: HttpService) {
  }

  ngOnDestroy(): void {
    SubscriptionUtils.unsubscribeAll(this.subscriptions);
  }

  ngOnInit(): void {
    this.setDefaultBudgetForm();
    this.errorModel = new ErrorModel();
    this.subscriptions = [];
    this.displayLoader = false;
    this.displayError = false;
    this.isEditing = false;
  }

  open(budgetData?: BudgetModel): void {
    this.setDefaultBudgetForm();
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
    this.displayLoader = true;

    setTimeout((): void => {
      if (this.isEditing) {
        this.updateBudget();
      } else {

      }
    }, 500);
  }

  private updateBudget(): void {
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
        },
        error: (err): void => {
          this.onRequestFailed(err);
        }
      })
    )
  }

  private onRequestSuccess(response: HttpResponse<any>): void {
    this.refreshIncomeEvent.emit(true);
    this.errorModel.responseStatusCode = response.status;
    this.modalService.dismissAll();
    setTimeout((): void => {
      this.displayLoader = false;
    }, 500)
  }

  private onRequestFailed(err: any): void {
    this.errorModel.traceId = err.headers.get('X-Trace-Id');
    this.errorModel.responseStatusCode = err.status;
    this.errorModel.responseErrorModel = err.error;
    this.displayLoader = false;
    this.displayError = true;
  }

  private setDefaultBudgetForm(): void {
    const now = new Date();
    const firsDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    this.budgetForm = {
      name: "",
      dateStart: DateUtils.convertToDatePicker(firsDay),
      dateEnd: DateUtils.convertToDatePicker(lastDay)
    } as BudgetFormPicker;
  }
}
