import {Component, EventEmitter, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {ModalOptions} from "../../../../util/modal-options.utils";
import {DatePicker} from "../../../../models/FormModels";
import {DateUtils} from "../../../../util/date.utils";
import {HttpService} from "../../../../services/http/httpService";
import {catchError, forkJoin, Observable, of, Subscription} from "rxjs";
import {HttpResponse} from "@angular/common/http";
import {SubscriptionUtils} from "../../../../util/subscription.utils";
import {BudgetStatus} from "../../../../models/modal-models/BudgetStatusModel";
import {ModalUtils} from "../../../../util/modal.utils";
import {DatesConfig, LoadersConfig} from "../../../../app-config";
import {AbstractControl, NgForm, NgModel} from "@angular/forms";

@Component({
  selector: 'app-budgets-modal',
  templateUrl: './budgets-modal.component.html',
  styleUrl: './budgets-modal.component.css'
})
export class BudgetsModalComponent implements OnInit, OnDestroy {
  @ViewChild('budgetsModal') budgetsModal: any;
  @Output() refreshPageEvent = new EventEmitter<boolean>();
  protected readonly LoadersConfig = LoadersConfig;
  protected readonly budgetsLimit: number = 6;
  protected readonly DateUtils = DateUtils;
  protected readonly ModalUtils = ModalUtils;
  protected subscriptions: Subscription[];
  protected budgetPickers: DatePicker[];
  protected budgetStatusIcons: BudgetStatus[];
  protected displayTimer: boolean;
  protected autoCloseModal: boolean;
  protected disableTimer: boolean;
  protected lastDate: Date;

  constructor(private modalService: NgbModal,
              private httpService: HttpService) {
  }

  ngOnInit(): void {
    this.subscriptions = [];
    this.budgetPickers = [];
    this.lastDate = new Date();
    this.resetBudgetStatus();
    this.resetModalOptions();
    this.add();
  }

  ngOnDestroy(): void {
    SubscriptionUtils.unsubscribeAll(this.subscriptions);
  }

  open(): void {
    this.budgetPickers = [];
    this.lastDate = new Date();
    this.resetBudgetStatus();
    this.resetModalOptions();
    this.add();
    this.modalService.open(this.budgetsModal, ModalOptions.default());
  }

  protected add(): void {
    if (this.budgetPickers.length < this.budgetsLimit) {
      let maxDate = this.getMaxDate();

      if (this.budgetPickers.length > 0) {
        maxDate.setMonth(maxDate.getMonth() + 1);
      }

      this.budgetPickers.push(DateUtils.convertToDatePicker(maxDate));
      this.budgetStatusIcons.push(new BudgetStatus());
    }
  }

  protected remove(index: number, formControls: NgForm): void {
    this.budgetPickers = this.budgetPickers.filter((_, i) => i !== index);
    this.budgetStatusIcons = this.budgetStatusIcons.filter((_, i) => i !== index);

    if (!this.hasDuplicatedMonths()) {
      for (let i = 0; i < this.budgetPickers.length; i++) {
        let fieldControl = formControls.controls['budget-date' + i];
        if (fieldControl) {
          fieldControl.setErrors(null);
        }
      }
    }

    if (this.budgetStatusIcons.length > 0 && this.hasAllSuccess()) {
      this.displayTimer = true;
    }
  }

  protected onDateChanged(index: number, ngModel: NgModel): void {
    const changedPicker = this.budgetPickers[index];

    if (this.hasDuplicatedMonths()) {
      ngModel.control.setErrors({alreadyExist: DatesConfig.MONTH_ALREADY_EXIST_MESSAGE});
    } else if (DateUtils.isInvalidDate(changedPicker)) {
      ngModel.control.setErrors({ngbDate: true});
    } else {
      ngModel.control.setErrors(null);
    }
  }

  protected saveBudgets(formControls: NgForm): void {
    this.autoCloseModal = false;

    const budgetRequests = [];
    for (let i = 0; i < this.budgetPickers.length; i++) {
      const field = this.budgetPickers[i];
      const formatedDate = DateUtils.formatDatePicker(field);
      if (!this.budgetStatusIcons[i].status ||
        ModalUtils.isUndefinedBudgetStatus(this.budgetStatusIcons[i])) {
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
          for (let i = 0; i < this.budgetStatusIcons.length; i++) {
            let budgetResponse = this.budgetStatusIcons[i];
            //when previous request status was invalid
            // - retry that request. All success requests
            // are skipping
            if (!budgetResponse.status) {
              const response = responses[newRequestIndex];
              if (response.status >= 200 && response.status <= 299) {
                this.onRequestSuccess(i, response);
              } else {
                this.onRequestFailed(i, response, formControls.controls['budget-date-' + newRequestIndex]);
              }
              newRequestIndex++;
            }
          }
        },
        complete: (): void => {
          this.autoCloseModal = true;
          this.budgetStatusIcons.forEach((value): void => {
            if (!ModalUtils.isUndefinedBudgetStatus(value) &&
              !value.status) {
              this.autoCloseModal = false;
            }
          });
          if (this.autoCloseModal) {
            this.displayTimer = true;
          }
        }
      }));
  }

  protected close(modal: any): void {
    let pageReload = false;
    for (const budgetResponse of this.budgetStatusIcons) {
      if (!ModalUtils.isUndefinedBudgetStatus(budgetResponse) &&
        budgetResponse.status) {
        pageReload = true;
      }
    }

    if (pageReload) {
      this.disableTimer = true;
      this.refreshPageEvent.emit(true);
    }

    modal.close();
  }

  protected onTimerFinishedEvent(modal: any): void {
    this.refreshPageEvent.emit(true);
    modal.close();
  }

  private getMaxDate(): Date {
    let maxDate: Date = new Date();
    for (const datePicker of this.budgetPickers) {
      const convertedDate = DateUtils.convertToDate(datePicker);
      if (convertedDate > maxDate) {
        maxDate = convertedDate;
      }
    }
    return maxDate;
  }

  private hasDuplicatedMonths(): boolean {
    const months: number[] = [];

    this.budgetPickers.forEach(b => {
      if (b) {
        months.push(b.month);
      }
    })

    return new Set(months).size < months.length;
  }

  private hasAllSuccess(): boolean {
    return this.budgetStatusIcons.every(s => s && s.status);
  }

  private resetBudgetStatus(): void {
    this.budgetStatusIcons = [];
    for (let i = 0; i < this.budgetPickers.length; i++) {
      this.budgetStatusIcons.push(new BudgetStatus());
    }
  }

  private onRequestSuccess(index: number, response: HttpResponse<any>): void {
    const status = response.status;
    const isSuccess = status >= 200 && status <= 299;
    this.budgetStatusIcons[index] = {
      status: isSuccess,
      message: status + " - Ok"
    } as BudgetStatus;
  }

  private onRequestFailed(index: number, err: any, control: AbstractControl): void {
    control.setErrors({'responseMessage': err.error["message"]});
    this.budgetStatusIcons[index] = {
      status: false,
      message: err.status + " - " + err.error["title"]
    } as BudgetStatus;
  }

  private resetModalOptions(): void {
    this.autoCloseModal = false;
    this.disableTimer = false;
    this.displayTimer = false;
  }
}
