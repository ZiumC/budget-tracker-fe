import {Component, OnDestroy, OnInit} from '@angular/core';
import {ResponseErrorModel} from '../../../models/ResponseErrorModel';
import {BudgetModel} from '../../../models/RequestModels';
import {HttpService} from '../../../services/http/httpService';
import {Subscription} from 'rxjs';
import {HttpResponse} from '@angular/common/http';
import {SubscriptionUtils} from '../../../util/subscription.utils';
import {DateUtils} from "../../../util/date.utils";
import {RequestParamModel} from "../../../models/RequestParamModel";
import {SpinnerSize} from "../../components/shared/spinner/spinner.component";
import {DatePicker} from "../../../models/FormModels";
import {CookieUtils} from "../../../util/cookie.utils";
import {AnimationsConfig, CookieNames, DatesConfig, RequestConfig} from "../../../app-config";
import {TimerUtils} from "../../../util/timer.utils";

@Component({
  selector: 'app-index',
  templateUrl: './index.component.html',
  styleUrl: './index.component.css'
})
export class IndexComponent implements OnInit, OnDestroy {
  private readonly cookieUtils = new CookieUtils();
  protected readonly DateUtils = DateUtils;
  protected readonly SpinnerSize = SpinnerSize;
  protected budgets: BudgetModel[] | null;
  protected budget: BudgetModel | null;
  protected subscriptions: Subscription[];
  protected requestParams: RequestParamModel;
  protected fromDatePicker: DatePicker;
  protected toDatePicker: DatePicker;

  protected displayNowButton: boolean;
  protected errorModels: any;
  protected loaders: any;
  protected idRefreshBudget: string;

  constructor(private httpService: HttpService) {
  }

  ngOnInit(): void {
    this.displayNowButton = this.isCurrentYear();

    this.requestParams = new RequestParamModel();
    this.requestParams.page = RequestConfig.BUDGETS_DEFAULT_PAGE;
    this.requestParams.pageSize = RequestConfig.BUDGETS_DEFAULT_PAGE_SIZE;

    const fromDatePickerCookie = this.readDateFromCookie(CookieNames.FROM_DATE);
    const toDatePickerCookie = this.readDateFromCookie(CookieNames.TO_DATE);

    if (fromDatePickerCookie) {
      this.setFromDate(DateUtils.convertToDate(fromDatePickerCookie));
    } else {
      this.setFromDate(DatesConfig.FIRST_DAY_OF_CURRENT_YEAR);
    }

    if (toDatePickerCookie) {
      this.setToDate(DateUtils.convertToDate(toDatePickerCookie));
    } else {
      this.setToDate(DatesConfig.LAST_DAY_OF_CURRENT_YEAR);
    }

    this.budgets = [];
    this.subscriptions = [];
    this.errorModels = {
      budgets: new ResponseErrorModel(),
      budget: new ResponseErrorModel()
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
      this.errorModels.budgets = new ResponseErrorModel();
      this.getBudgets(this.requestParams);
    }
  }

  protected onBudgetUpdate(idBudget: string): void {
    if (idBudget) {
      this.markBudgetAsLoaded(false);
      this.idRefreshBudget = idBudget;
      this.errorModels.budget = new ResponseErrorModel();
      this.getBudget(idBudget);
    }
  }

  protected onBudgetsSearch(): void {
    const fromDate = DateUtils.convertToDate(this.fromDatePicker);
    const toDate = DateUtils.convertToDate(this.toDatePicker);

    this.requestParams.fromDate = DateUtils.format(fromDate);
    this.requestParams.toDate = DateUtils.format(toDate);

    this.saveDateToCookie(CookieNames.FROM_DATE, fromDate);
    this.saveDateToCookie(CookieNames.TO_DATE, toDate);

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
    this.saveDateToCookie(CookieNames.FROM_DATE, DatesConfig.FIRST_DAY_OF_CURRENT_YEAR);
    this.saveDateToCookie(CookieNames.TO_DATE, DatesConfig.LAST_DAY_OF_CURRENT_YEAR);
    this.setFromDate(DatesConfig.FIRST_DAY_OF_CURRENT_YEAR);
    this.setToDate(DatesConfig.LAST_DAY_OF_CURRENT_YEAR);
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

  private onRequestFailed(errorModel: ResponseErrorModel, err: any): void {
    errorModel.traceId = err.headers.get('X-Trace-Id');
    errorModel.responseStatusCode = err.status;
    errorModel.responseErrorModel = err.error;
  }

  private markPageAsLoaded(value: boolean): void {
    if (value) {
      new TimerUtils(AnimationsConfig.DEFAULT_DURATION).start()
        .subscribe(finished => {
          if (finished) {
            this.loaders.page = value;
          }
        });
    } else {
      this.loaders.page = value;
    }
  }

  private markBudgetAsLoaded(value: boolean): void {
    if (value) {
      new TimerUtils(AnimationsConfig.DEFAULT_DURATION).start()
        .subscribe(finished => {
          if (finished) {
            this.loaders.budget = value;
          }
        });
    } else {
      this.loaders.budget = value;
    }
  }

  private saveDateToCookie(dateName: string,
                           date: Date): void {
    this.cookieUtils.setCookie(dateName, date.toString());
  }

  private readDateFromCookie(dateName: string): DatePicker | null {
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
    const fromDatePickerCookie = this.readDateFromCookie(CookieNames.FROM_DATE);
    const toDatePickerCookie = this.readDateFromCookie(CookieNames.TO_DATE);

    const firstDayDatePicker = DateUtils.convertToDatePicker(DatesConfig.FIRST_DAY_OF_CURRENT_YEAR);
    const lastDayDatePicker = DateUtils.convertToDatePicker(DatesConfig.LAST_DAY_OF_CURRENT_YEAR);

    return fromDatePickerCookie?.year != firstDayDatePicker.year ||
      toDatePickerCookie?.year != lastDayDatePicker.year;
  }

  protected readonly RequestConfig = RequestConfig;
}
