import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {ResponseErrorModel} from '../../../models/ResponseErrorModel';
import {BudgetModel} from '../../../models/RequestModels';
import {HttpService} from '../../../services/http/http.service';
import {Subscription} from 'rxjs';
import {HttpResponse} from '@angular/common/http';
import {SubscriptionUtils} from '../../../util/subscription.utils';
import {DatePickerUtil, DateUtil, isInvalidDate} from "../../../util/date.util";
import {RequestParamModel} from "../../../models/RequestParamModel";
import {SpinnerSize} from "../../components/shared/spinner/spinner.component";
import {DatePicker} from "../../../models/FormModels";
import {
  AnimationsConfig,
  AppDictionary,
  CookieNames,
  DateConfig,
  DateMessageConfig,
  RequestConfig
} from "../../../app-config";
import {TimerUtils} from "../../../util/timer.utils";
import {NgModel} from "@angular/forms";
import {getCookie, setCookie} from "../../../util/cookie.utils";

@Component({
  selector: 'app-index',
  templateUrl: './index.component.html',
  styleUrl: './index.component.css'
})
export class IndexComponent implements OnInit, OnDestroy {
  @ViewChild('errorModal') errorModal: any;
  protected readonly DateUtils = DateUtil;
  protected readonly SpinnerSize = SpinnerSize;
  protected readonly RequestConfig = RequestConfig;
  protected readonly AppDictionary = AppDictionary;
  protected budgets: BudgetModel[] | null;
  protected budget: BudgetModel | null;
  protected subscriptions: Subscription[];
  protected requestParams: RequestParamModel;
  protected fromDatePicker: DatePicker;
  protected toDatePicker: DatePicker;
  protected toCurrentYear: boolean;
  protected responseErrorModel: any;
  protected loaders: any;
  protected idRefreshBudget: string;

  constructor(private httpService: HttpService) {
  }

  ngOnInit(): void {
    this.requestParams = new RequestParamModel();
    this.requestParams.page = RequestConfig.BUDGETS_DEFAULT_PAGE;
    this.requestParams.pageSize = RequestConfig.BUDGETS_DEFAULT_PAGE_SIZE;

    const dateFromCookie = this.readDateCookie(CookieNames.FROM_DATE);
    const dateToCookie = this.readDateCookie(CookieNames.TO_DATE);

    if (dateFromCookie) {
      this.fromDatePicker = DatePickerUtil.convertToDatePicker(dateFromCookie);
    } else {
      this.fromDatePicker =
        DatePickerUtil.convertToDatePicker(DateConfig.FIRST_DAY_OF_CURRENT_YEAR)
    }

    if (dateToCookie) {
      this.toDatePicker = DatePickerUtil.convertToDatePicker(dateToCookie);
    } else {
      this.toDatePicker =
        DatePickerUtil.convertToDatePicker(DateConfig.LAST_DAY_OF_CURRENT_YEAR);
    }

    this.requestParams.fromDate = DatePickerUtil.formatDatePicker(this.fromDatePicker);
    this.requestParams.toDate = DatePickerUtil.formatDatePicker(this.toDatePicker);
    this.toCurrentYear = this.isCurrentYear();

    this.budgets = [];
    this.subscriptions = [];
    this.responseErrorModel = {
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

  protected reloadPage(): void {
    this.markPageAsLoaded(false);
    this.responseErrorModel.budgets = new ResponseErrorModel();
    this.getBudgets(this.requestParams);
  }

  protected updateBudget(idBudget: string): void {
    if (idBudget) {
      this.markBudgetAsLoaded(false);
      this.idRefreshBudget = idBudget;
      this.responseErrorModel.budget = new ResponseErrorModel();
      this.getBudget(idBudget);
    } else {
      this.errorModal.open(this.responseErrorModel);
    }
  }

  protected searchBudgets(toCurrentDate: boolean): void {
    let fromDate: Date;
    let toDate: Date;

    if (toCurrentDate) {
      fromDate = DateConfig.FIRST_DAY_OF_CURRENT_YEAR;
      toDate = DateConfig.LAST_DAY_OF_CURRENT_YEAR;
      this.fromDatePicker = DatePickerUtil.convertToDatePicker(fromDate);
      this.toDatePicker = DatePickerUtil.convertToDatePicker(toDate);
    } else {
      fromDate = DatePickerUtil.convertToDate(this.fromDatePicker);
      toDate = DatePickerUtil.convertToDate(this.toDatePicker);
    }

    this.requestParams.fromDate = DateUtil.format(fromDate);
    this.requestParams.toDate = DateUtil.format(toDate);

    this.saveDateCookie(CookieNames.FROM_DATE, fromDate);
    this.saveDateCookie(CookieNames.TO_DATE, toDate);

    this.toCurrentYear = this.isCurrentYear();

    this.reloadPage();
  }

  protected onDatesChanged(fromDateInput: NgModel, toDateInput: NgModel): void {
    const isInvalidFromDate = isInvalidDate(this.fromDatePicker);
    const isInvalidToDate = isInvalidDate(this.toDatePicker);

    if (isInvalidFromDate) {
      fromDateInput.control.setErrors({ngbDate: true});
    } else if (isInvalidToDate) {
      toDateInput.control.setErrors({ngbDate: true});
    } else {
      const fromDate = DatePickerUtil.convertToDate(this.fromDatePicker);
      const toDate = DatePickerUtil.convertToDate(this.toDatePicker);

      if (toDate <= fromDate) {
        fromDateInput.control.setErrors({invalidRange: DateMessageConfig.RANGE_MESSAGE});
        toDateInput.control.setErrors({invalidRange: DateMessageConfig.RANGE_MESSAGE});
      } else {
        fromDateInput.control.setErrors(null);
        toDateInput.control.setErrors(null);
      }
    }
  }

  private getBudget(idBudget: string): void {
    this.subscriptions.push(
      this.httpService.getBudget(idBudget).subscribe({
        next: (response: HttpResponse<BudgetModel>): void => {
          this.budget = response.body;
          this.responseErrorModel.budget.responseStatusCode = response.status
        },
        error: (err): void => {
          this.onRequestFailed(this.responseErrorModel.budget, err);
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
          this.responseErrorModel.budgets.responseStatusCode = response.status
        },
        error: (err): void => {
          this.onRequestFailed(this.responseErrorModel.budgets, err);
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

  private saveDateCookie(dateName: string, date: Date): void {
    console.log(date.toString())
    setCookie(dateName, date.toString());
  }

  private readDateCookie(dateName: string): Date | null {
    const cookieDate = getCookie(dateName);
    return cookieDate ? new Date(cookieDate) : null;
  }

  private isCurrentYear(): boolean {
    const currentYear = new Date().getFullYear();
    return !(this.fromDatePicker.year == currentYear &&
      this.toDatePicker.year == currentYear);
  }
}
