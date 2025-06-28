import {Component, EventEmitter, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {DatePicker} from "../../../../models/datepicker.model";
import {DatePickerUtil, isInvalidDate} from "../../../../util/date.util";
import {HttpService} from "../../../../services/http/http.service";
import {catchError, forkJoin, Observable, of, Subscription} from "rxjs";
import {HttpResponse} from "@angular/common/http";
import {SubscriptionUtils} from "../../../../util/subscription.utils";
import {ModalOptions, ModalUtils} from "../../../../util/modal.utils";
import {AbstractControl, NgForm, NgModel} from "@angular/forms";
import {AppConfig} from "../../../../models/config/config";
import {FormConfig} from "../../../../models/config/form.model.config";
import {ConfigService} from "../../../../services/config/config.service";
import {isSuccess} from "../../../../util/http.util";
import {formatString} from "../../../../util/string.utils";
import {Status} from "../../../../models/response.model";

@Component({
  selector: 'app-budgets-modal',
  templateUrl: './budgets-modal.component.html',
  styleUrl: './budgets-modal.component.css'
})
export class BudgetsModalComponent implements OnInit, OnDestroy {
  @ViewChild('budgetsModal') budgetsModal: any;
  @Output() refreshPageEvent = new EventEmitter<boolean>();
  protected readonly formatString = formatString;
  protected readonly DatePickerUtil = DatePickerUtil;
  protected readonly ModalUtils = ModalUtils;
  protected budgetsLimit: number;
  protected appConfig: AppConfig;
  protected formConfig: FormConfig;
  protected subscriptions: Subscription[];
  protected budgetPickers: DatePicker[];
  protected budgetStatusIcons: Status[];
  protected displayTimer: boolean;
  protected disableTimer: boolean;

  constructor(private modalService: NgbModal,
              private httpService: HttpService,
              private configService: ConfigService) {
  }

  ngOnInit(): void {
    this.subscriptions = [];
    this.budgetPickers = [];
    this.resetBudgetStatus();
    this.resetModalOptions();

    const appCfg = this.configService.getAppConfig();
    if (appCfg) {
      this.appConfig = appCfg;
      this.formConfig = appCfg.form;
      this.budgetsLimit = appCfg.budgetLimit;
    } else {
      throw Error("Config not provided")
    }

    this.add();
  }

  ngOnDestroy(): void {
    SubscriptionUtils.unsubscribeAll(this.subscriptions);
  }

  open(): void {
    this.budgetPickers = [];
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

      this.budgetPickers.push(DatePickerUtil.convertToDatePicker(maxDate));
      this.budgetStatusIcons.push(new Status());
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

    if (this.budgetStatusIcons.length > 0 && this.allSuccessIcons()) {
      this.displayTimer = true;
    }
  }

  protected onDateChanged(index: number, ngModel: NgModel): void {
    const changedPicker = this.budgetPickers[index];

    if (this.hasDuplicatedMonths()) {
      ngModel.control.setErrors({alreadyExist: true});
    } else if (isInvalidDate(changedPicker)) {
      ngModel.control.setErrors({ngbDate: true});
    } else {
      ngModel.control.setErrors(null);
      this.budgetStatusIcons[index] = new Status();
    }
  }

  protected saveBudgets(formControls: NgForm): void {
    const budgetRequests = [];
    for (let i = 0; i < this.budgetPickers.length; i++) {
      const field = this.budgetPickers[i];
      const formatedDate = DatePickerUtil.formatDatePicker(field);
      if (!this.budgetStatusIcons[i].isSuccess ||
        ModalUtils.isUndefinedStatus(this.budgetStatusIcons[i])) {
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
            if (!budgetResponse.isSuccess) {
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
          if (this.allSuccessIcons()) {
            this.displayTimer = true;
          }
        }
      }));
  }

  protected close(modal: any): void {
    if (this.atLeastSuccessIcon()) {
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
      const convertedDate = DatePickerUtil.convertToDate(datePicker);
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

  private allSuccessIcons(): boolean {
    return this.budgetStatusIcons.every(s => s && s.isSuccess);
  }

  private atLeastSuccessIcon(): boolean {
    return this.budgetStatusIcons.some(s => s && s.isSuccess);
  }

  private resetBudgetStatus(): void {
    this.budgetStatusIcons = [];
    for (let i = 0; i < this.budgetPickers.length; i++) {
      this.budgetStatusIcons.push(new Status());
    }
  }

  private onRequestSuccess(index: number, response: HttpResponse<any>): void {
    this.budgetStatusIcons[index] = {
      isSuccess: isSuccess(response),
      message: "Ok"
    } as Status;
  }

  private onRequestFailed(index: number, err: any, control: AbstractControl): void {
    control.setErrors({'responseMessage': err.error["message"]});
    this.budgetStatusIcons[index] = {
      isSuccess: false,
      message: err.error["title"]
    } as Status;
  }

  private resetModalOptions(): void {
    this.disableTimer = false;
  }
}
