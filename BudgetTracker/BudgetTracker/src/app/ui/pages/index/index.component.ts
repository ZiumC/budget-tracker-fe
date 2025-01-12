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

@Component({
  selector: 'app-index',
  templateUrl: './index.component.html',
  styleUrl: './index.component.css'
})
export class IndexComponent implements OnInit, OnDestroy {
  protected readonly DateUtils = DateUtils;
  protected readonly SpinnerSize = SpinnerSize;
  protected requiredStatusCode: number = 200;
  protected budgets: BudgetModel[] | null;
  protected budget: BudgetModel | null;
  protected subscriptions: Subscription[];
  protected requestParams: RequestParamModel;
  protected fromDatePicker: DatePickerModel;
  protected toDatePicker: DatePickerModel;
  protected errorModels: any;
  protected loaders: any;
  protected idRefreshBudget: string;

  constructor(private httpService: HttpService) {
  }

  ngOnInit(): void {
    const currentYear = new Date().getFullYear();
    const firstDayOfYear = new Date(currentYear, 0, 1);
    const lastDayOfYear = new Date(currentYear, 11, 31);

    this.requestParams = new RequestParamModel();
    this.requestParams.page = 1;
    this.requestParams.pageSize = 36;
    this.requestParams.fromDate = DateUtils.format(firstDayOfYear);
    this.requestParams.toDate = DateUtils.format(lastDayOfYear);

    this.fromDatePicker = DateUtils.convertToDatePicker(firstDayOfYear);
    this.toDatePicker = DateUtils.convertToDatePicker(lastDayOfYear);

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

  protected onPageIndex(reload: boolean): void {
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

    console.log(this.requestParams);

    this.onPageIndex(true);
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
          })
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
}
