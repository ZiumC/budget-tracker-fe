import {Component, EventEmitter, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {ModalOptions, ModalSize} from "../../../../util/modal.utils";
import {DatePickerModel} from "../../../../models/FormModels";
import {DateUtils} from "../../../../util/date.utils";
import {HttpService} from "../../../../services/http/httpService";
import {forkJoin, Subscription} from "rxjs";
import {HttpResponse} from "@angular/common/http";
import {SubscriptionUtils} from "../../../../util/subscription.utils";


@Component({
  selector: 'app-budgets-modal',
  templateUrl: './budgets-modal.component.html',
  styleUrl: './budgets-modal.component.css'
})
export class BudgetsModalComponent implements OnInit, OnDestroy {
  @ViewChild('budgetsModal') budgetsModal: any;
  @Output() indexPageEvent = new EventEmitter<boolean>();
  protected readonly budgetsLimit: number = 3;
  protected readonly DateUtils = DateUtils;
  protected subscriptions: Subscription[];
  protected budgetFields: DatePickerModel[];
  protected budgetResponses: BudgetStatus[];
  protected disableForm: boolean;
  protected disableRemove: boolean;
  protected lastDate: Date;

  constructor(private modalService: NgbModal,
              private httpService: HttpService) {
  }

  ngOnInit(): void {
    this.subscriptions = [];
    this.resetBudgetStatus();
    this.budgetFields = [];
    this.lastDate = new Date();
    this.disableForm = false;
    this.disableRemove = false;
    this.add();
  }

  ngOnDestroy(): void {
    SubscriptionUtils.unsubscribeAll(this.subscriptions);
  }

  open(): void {
    this.resetBudgetStatus();
    this.budgetFields = [];
    this.lastDate = new Date();
    this.add();
    this.modalService.open(this.budgetsModal, ModalOptions.default(ModalSize.BIG));
  }

  protected add(): void {
    if (this.budgetFields.length < this.budgetsLimit) {
      this.budgetFields.push(DateUtils.convertToDatePicker(this.lastDate));
      this.lastDate = new Date(this.lastDate.setMonth(this.lastDate.getMonth() + 1));
    }
  }

  protected remove(index: number): void {
    const budgetToRemove = DateUtils.convertToDate(this.budgetFields[index]);
    this.budgetFields = this.budgetFields.filter((_, i) => i !== index);
    if (this.lastDate > budgetToRemove) {
      this.lastDate = new Date(this.lastDate.setMonth(this.lastDate.getMonth() + 1));
    }
    this.lastDate = new Date(this.lastDate.setMonth(this.lastDate.getMonth() - 1));
  }

  protected onDateChanged(index: number): void {
    let maxDate: Date = DateUtils.convertToDate(this.budgetFields[index]);
    for (const date of this.budgetFields) {
      const convertedDate = DateUtils.convertToDate(date);
      if (convertedDate > maxDate) {
        maxDate = convertedDate;
      }
    }
    this.lastDate = new Date(maxDate.setMonth(maxDate.getMonth() + 1));
  }

  protected saveBudgets(): void {
    this.disableRemove = true;
    this.disableForm = true;

    for (let i = 0; i < this.budgetFields.length; i++) {
      if (!this.budgetResponses[i].status || this.isUndefined(this.budgetResponses[i])) {
        const date = this.budgetFields[i];
        const formatedDate = DateUtils.formatDatePicker(date);
        this.subscriptions.push(
          this.httpService.createBudget(formatedDate).subscribe({
            next: (response: HttpResponse<any>): void => {
              this.onRequestSuccess(i, response);
            },
            error: (err): void => {
              this.onRequestFailed(i, err);
            }
          }));
      }
    }

    setTimeout((): void => {
      this.disableForm = false;
      let autoCloseModal = true;
      for (const budgetResponse of this.budgetResponses) {
        if (!this.isUndefined(budgetResponse) && !budgetResponse.status) {
          autoCloseModal = false;
        }
      }

      if (autoCloseModal) {
        this.modalService.dismissAll();
        this.indexPageEvent.emit(true);
      }
    }, 1000)
  }

  protected isUndefined(budgetStatus: BudgetStatus): boolean {
    return typeof budgetStatus.status === "undefined" &&
      typeof budgetStatus.message === "undefined"
  }

  private resetBudgetStatus(): void {
    this.budgetResponses = [];
    for (let i = 0; i < this.budgetsLimit; i++) {
      this.budgetResponses.push(new BudgetStatus());
    }
  }

  private onRequestSuccess(index: number, response: HttpResponse<any>): void {
    const status = response.status;
    const isSuccess = status >= 200 && status <= 299;
    this.budgetResponses[index] = {
      status: isSuccess,
      message: status + " - Ok"
    } as BudgetStatus;
  }

  private onRequestFailed(index: number, err: any) {
    this.budgetResponses[index] = {
      status: false,
      message: err.status + " - " + err.error["title"]
    } as BudgetStatus;
  }
}

export class BudgetStatus {
  status: boolean;
  message: string;
}
