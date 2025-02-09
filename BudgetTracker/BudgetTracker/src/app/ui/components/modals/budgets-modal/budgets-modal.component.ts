import {Component, EventEmitter, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {ModalOptions} from "../../../../util/modal-options.utils";
import {DatePicker} from "../../../../models/FormModels";
import {DateUtils} from "../../../../util/date.utils";
import {HttpService} from "../../../../services/http/httpService";
import {catchError, forkJoin, interval, Observable, of, Subscription, takeWhile} from "rxjs";
import {HttpResponse} from "@angular/common/http";
import {SubscriptionUtils} from "../../../../util/subscription.utils";
import {BudgetStatus} from "../../../../models/modal-models/BudgetStatusModel";
import {ModalUtils} from "../../../../util/modal.utils";


@Component({
  selector: 'app-budgets-modal',
  templateUrl: './budgets-modal.component.html',
  styleUrl: './budgets-modal.component.css'
})
export class BudgetsModalComponent implements OnInit, OnDestroy {
  @ViewChild('budgetsModal') budgetsModal: any;
  @Output() indexPageEvent = new EventEmitter<boolean>();
  protected readonly budgetsLimit: number = 6;
  protected readonly maxTime = 25;
  protected readonly DateUtils = DateUtils;
  protected readonly ModalUtils = ModalUtils;
  protected subscriptions: Subscription[];
  protected budgetDateFields: DatePicker[];
  protected budgetResponses: BudgetStatus[];
  protected disableForm: boolean;
  protected autoCloseModal: boolean;
  protected disableTimer: boolean;
  protected lastDate: Date;
  protected timeLeft: number;

  constructor(private modalService: NgbModal,
              private httpService: HttpService) {
  }

  ngOnInit(): void {
    this.subscriptions = [];
    this.resetBudgetStatus();
    this.budgetDateFields = [];
    this.lastDate = new Date();
    this.disableForm = false;
    this.autoCloseModal = false;
    this.disableTimer = false;
    this.timeLeft = this.maxTime;
    this.add();
  }

  ngOnDestroy(): void {
    SubscriptionUtils.unsubscribeAll(this.subscriptions);
  }

  open(): void {
    this.resetBudgetStatus();
    this.budgetDateFields = [];
    this.lastDate = new Date();
    this.timeLeft = this.maxTime;
    this.disableTimer = false;
    this.autoCloseModal = false;
    this.disableForm = false;
    this.add();
    this.modalService.open(this.budgetsModal, ModalOptions.default());
  }

  protected add(): void {
    if (this.budgetDateFields.length == 0) {
      this.lastDate = new Date();
    }

    if (this.budgetDateFields.length < this.budgetsLimit) {
      this.budgetDateFields.push(DateUtils.convertToDatePicker(this.lastDate));
      this.lastDate = new Date(this.lastDate.setMonth(this.lastDate.getMonth() + 1));
    }
  }

  protected remove(index: number): void {
    const budgetToRemove = DateUtils.convertToDate(this.budgetDateFields[index]);
    this.budgetDateFields = this.budgetDateFields.filter((_, i) => i !== index);
    if (this.lastDate > budgetToRemove) {
      this.lastDate = new Date(this.lastDate.setMonth(this.lastDate.getMonth() + 1));
    }
    this.lastDate = new Date(this.lastDate.setMonth(this.lastDate.getMonth() - 1));
  }

  protected validateMonthsOccurs(index: number, ngModel: any): void {
    const changedField = this.budgetDateFields[index];

    for (let i = 0; i < this.budgetDateFields.length; i++) {
      const field = this.budgetDateFields[i];
      if (field.month == changedField.month && i != index) {
        ngModel.control.setErrors({invalidMonth: 'Invalid month'});
        i = this.budgetDateFields.length;
      } else {
        ngModel.control.setErrors(null);
      }
    }

    let maxDate: Date = DateUtils.convertToDate(changedField);
    for (const date of this.budgetDateFields) {
      const convertedDate = DateUtils.convertToDate(date);
      if (convertedDate > maxDate) {
        maxDate = convertedDate;
      }
    }

    this.lastDate = new Date(maxDate.setMonth(maxDate.getMonth() + 1));
  }

  protected saveBudgets(): void {
    this.disableForm = true;
    this.autoCloseModal = false;

    const budgetRequests = [];

    for (let i = 0; i < this.budgetDateFields.length; i++) {
      const field = this.budgetDateFields[i];
      const formatedDate = DateUtils.formatDatePicker(field);
      if (!this.budgetResponses[i].status ||
        ModalUtils.isUndefinedBudgetStatus(this.budgetResponses[i])) {
        budgetRequests.push(this.httpService.createBudget(formatedDate).pipe(
          catchError((err): Observable<HttpResponse<any>> => {
            return of(err);
          })
        ))
      }
    }

    this.subscriptions.push(
      forkJoin(budgetRequests).subscribe({
        next: (responses): void => {
          let newRequestIndex = 0;
          //iterate through last requests
          //that was made by clicking save btn
          for (let i = 0; i < this.budgetResponses.length; i++) {
            let budgetResponse = this.budgetResponses[i];
            //when previous request status was invalid
            // - retry that request. All success requests
            // are skipping
            if (!budgetResponse.status) {
              const response = responses[newRequestIndex];
              if (response.status >= 200 && response.status <= 299) {
                this.onRequestSuccess(i, response);
              } else {
                this.onRequestFailed(i, response);
              }
              newRequestIndex++;
            }
          }
        },
        complete: (): void => {
          this.autoCloseModal = true;
          this.budgetResponses.forEach((value): void => {
            if (!ModalUtils.isUndefinedBudgetStatus(value) &&
              !value.status) {
              this.autoCloseModal = false;
            }
          });
          if (this.autoCloseModal) {
            this.startTimer();
          }
        }
      }));

    this.disableForm = false;
  }

  protected close(modal: any): void {
    let pageReload = false;
    for (const budgetResponse of this.budgetResponses) {
      if (!ModalUtils.isUndefinedBudgetStatus(budgetResponse) &&
        budgetResponse.status) {
        pageReload = true;
      }
    }

    if (pageReload) {
      this.disableTimer = true;
      this.indexPageEvent.emit(true);
    }

    modal.close();
  }

  protected startTimer(): void {
    this.subscriptions
      .push(interval(100)
        .pipe(takeWhile((): boolean => this.timeLeft > 0))
        .subscribe((): void => {
          this.timeLeft--;
          if (this.disableTimer) {
            this.timeLeft = 0;
          }
          if (this.timeLeft == 0) {
            this.modalService.dismissAll();
            this.indexPageEvent.emit(true);
          }
        }));
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
