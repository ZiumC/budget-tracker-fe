import {Component, OnDestroy, OnInit} from '@angular/core';
import {ErrorModel} from '../../../models/ErrorModel';
import {BudgetModel} from '../../../models/RequestModels';
import {HttpService} from '../../../services/http/httpService';
import {Subscription} from 'rxjs';
import {HttpResponse} from '@angular/common/http';
import {SubscriptionUtils} from '../../../util/subscription.utils';
import {DateUtils} from "../../../util/date.utils";
import {RequestParamModel} from "../../../models/RequestParamModel";
import {SpinnerSize} from "../../components/shared/spinner/spinner.component";
import {DatePickerModel} from "../../../models/FormModels";
import {CookieUtils} from "../../../util/cookie.utils";

@Component({
  selector: 'app-index',
  templateUrl: './index.component.html',
  styleUrl: './index.component.css'
})
export class IndexComponent implements OnInit, OnDestroy {
  private readonly currentYear = new Date().getFullYear();
  private readonly firstDayOfYear = new Date(this.currentYear, 0, 1);
  private readonly lastDayOfYear = new Date(this.currentYear, 11, 31);
  private readonly cookieUtils = new CookieUtils();
  protected readonly DateUtils = DateUtils;
  protected readonly SpinnerSize = SpinnerSize;
  protected readonly fromDateName: string = "from-date"
  protected readonly toDateName: string = "to-date"
  protected requiredStatusCode: number = 200;
  protected budgets: BudgetModel[] | null;
  protected budget: BudgetModel | null;
  protected subscriptions: Subscription[];
  protected requestParams: RequestParamModel;
  protected fromDatePicker: DatePickerModel;
  protected toDatePicker: DatePickerModel;

  protected displayNowButton: boolean;
  protected errorModels: any;
  protected loaders: any;
  protected idRefreshBudget: string;

  constructor(private httpService: HttpService) {
  }

  ngOnInit(): void {
    this.displayNowButton = this.isCurrentYear();

    this.requestParams = new RequestParamModel();
    this.requestParams.page = 1;
    this.requestParams.pageSize = 36;

    const fromDatePickerCookie = this.readDateFromCookie(this.fromDateName);
    const toDatePickerCookie = this.readDateFromCookie(this.toDateName);

    if (fromDatePickerCookie) {
      this.setFromDate(DateUtils.convertToDate(fromDatePickerCookie));
    } else {
      this.setFromDate(this.firstDayOfYear);
    }

    if (toDatePickerCookie) {
      this.setToDate(DateUtils.convertToDate(toDatePickerCookie));
    } else {
      this.setToDate(this.lastDayOfYear);
    }

    this.budgets = [];
    this.subscriptions = [];
    this.errorModels = {
      budgets: new ErrorModel(),
      budget: new ErrorModel()
    }

    this.loaders = {
      page: false,
      budget: false,
    }

    this.getBudgets(this.requestParams);
  }

  ngOnDestroy(): void {
    SubscriptionUtils.unsubscribeAll(this.subscriptions);
  }

  protected onPageReload(reload: boolean): void {
    if (reload) {
      this.markPageAsLoaded(false);
      this.errorModels.budgets = new ErrorModel();
      this.getBudgets(this.requestParams);
    }
  }

  protected onBudgetUpdate(idBudget: string): void {
    if (idBudget) {
      this.markBudgetAsLoaded(false);
      this.idRefreshBudget = idBudget;
      this.errorModels.budget = new ErrorModel();
      this.getBudget(idBudget);
    }
  }

  protected onBudgetsSearch(): void {
    const fromDate = DateUtils.convertToDate(this.fromDatePicker);
    const toDate = DateUtils.convertToDate(this.toDatePicker);

    this.requestParams.fromDate = DateUtils.format(fromDate);
    this.requestParams.toDate = DateUtils.format(toDate);

    this.saveDateToCookie(this.fromDateName, fromDate);
    this.saveDateToCookie(this.toDateName, toDate);

    this.displayNowButton = this.isCurrentYear();

    this.onPageReload(true);
  }

  protected validateDate(input1: any, input2: any): void {
    const fromDate = DateUtils.convertToDate(this.fromDatePicker);
    const toDate = DateUtils.convertToDate(this.toDatePicker);

    if (toDate <= fromDate) {
      input1.control.setErrors({invalidDateRange: 'Invalid date'});
      input2.control.setErrors({invalidDateRange: 'Invalid date'});
    } else {
      input1.control.setErrors(null);
      input2.control.setErrors(null);
    }
  }

  protected toCurrentDate(): void {
    this.displayNowButton = false;
    this.saveDateToCookie(this.fromDateName, this.firstDayOfYear);
    this.saveDateToCookie(this.toDateName, this.lastDayOfYear);
    this.setFromDate(this.firstDayOfYear);
    this.setToDate(this.lastDayOfYear);
    this.onPageReload(true);
  }

  private getBudget(idBudget: string): void {
    this.subscriptions.push(
      this.httpService.getBudget(idBudget).subscribe({
        next: (response: HttpResponse<BudgetModel>): void => {
          this.budget = response.body;
          this.errorModels.budget.responseStatusCode = response.status
        },
        error: (err): void => {
          this.onRequestFailed(this.errorModels.budget, err);
          this.markBudgetAsLoaded(true);
        },
        complete: (): void => {
          this.budgets!.forEach((item, index): void => {
            if (item.id == idBudget && this.budgets) {
              this.budgets[index] = this.budget!;
            }
          });
          this.markBudgetAsLoaded(true);
        }
      })
    )
  }

  private getBudgets(requestParamModel: RequestParamModel): void {
    this.subscriptions.push(
      this.httpService.getBudgets(requestParamModel).subscribe({
        next: (response: HttpResponse<BudgetModel[]>): void => {
          this.budgets = response.body;
          this.errorModels.budgets.responseStatusCode = response.status
        },
        error: (err): void => {
          this.onRequestFailed(this.errorModels.budgets, err);
          this.markPageAsLoaded(true);
        },
        complete: (): void => {
          this.markPageAsLoaded(true);
        }
      })
    )
  }

  private onRequestFailed(errorModel: ErrorModel, err: any): void {
    errorModel.traceId = err.headers.get('X-Trace-Id');
    errorModel.responseStatusCode = err.status;
    errorModel.responseErrorModel = err.error;
  }

  private markPageAsLoaded(value: boolean): void {
    setTimeout((): void => {
      this.loaders.page = value;
    }, value ? 500 : 0)
  }

  private markBudgetAsLoaded(value: boolean): void {
    setTimeout((): void => {
      this.loaders.budget = value;
    }, value ? 500 : 0)
  }

  private saveDateToCookie(dateName: string,
                           date: Date): void {
    this.cookieUtils.setCookie(dateName, date.toString());
  }

  private readDateFromCookie(dateName: string): DatePickerModel | null {
    const cookieDate = this.cookieUtils.getCookie(dateName);
    return cookieDate ? DateUtils.convertToDatePicker(new Date(cookieDate)) : null;
  }

  private setFromDate(date: Date): void {
    this.fromDatePicker = DateUtils.convertToDatePicker(date);
    this.requestParams.fromDate = DateUtils.format(date);
  }

  private setToDate(date: Date): void {
    this.toDatePicker = DateUtils.convertToDatePicker(date);
    this.requestParams.toDate = DateUtils.format(date);
  }

  private isCurrentYear(): boolean {
    const fromDatePickerCookie = this.readDateFromCookie(this.fromDateName);
    const toDatePickerCookie = this.readDateFromCookie(this.toDateName);

    const firstDayDatePicker = DateUtils.convertToDatePicker(this.firstDayOfYear);
    const lastDayDatePicker = DateUtils.convertToDatePicker(this.lastDayOfYear);

    return fromDatePickerCookie?.year != firstDayDatePicker.year ||
      toDatePickerCookie?.year != lastDayDatePicker.year;
  }
}
