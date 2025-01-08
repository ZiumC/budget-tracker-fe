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
  protected requestParamModel: RequestParamModel;
  protected errorModels: any;
  protected loaders: any;
  protected idRefreshBudget: string;

  constructor(private httpService: HttpService) {
  }

  ngOnInit(): void {
    const currentYear = new Date().getFullYear() - 1;
    this.requestParamModel = new RequestParamModel();
    this.requestParamModel.page = 1;
    this.requestParamModel.pageSize = 12;
    this.requestParamModel.fromDate = DateUtils
      .format(new Date(currentYear, 0, 1));
    this.requestParamModel.toDate = DateUtils
      .format(new Date(currentYear, 11, 31));

    this.budgets = [];
    this.subscriptions = [];
    this.errorModels = {
      budgets: new ErrorModel(),
      budget: new ErrorModel()
    }

    this.loaders = {
      page: false,
      budget: false
    }

    this.getBudgets(this.requestParamModel);
  }

  ngOnDestroy(): void {
    SubscriptionUtils.unsubscribeAll(this.subscriptions);
  }

  protected onPageIndex(reload: boolean): void {
    if (reload) {
      this.loaders.page = false;
      this.errorModels.budgets = new ErrorModel();
      this.getBudgets(this.requestParamModel);
    }
  }

  protected onBudgetUpdate(idBudget: string): void {
    if (idBudget) {
      this.loaders.budget = true;
      this.idRefreshBudget = idBudget;
      this.errorModels.budget = new ErrorModel();
      this.getBudget(idBudget);
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
        },
        complete: (): void =>{
          setTimeout((): void => {
            this.budgets!.forEach((item, index): void => {
              if (item.id == idBudget && this.budgets) {
                this.budgets[index] = this.budget!;
              }
            })
            this.loaders.budget = false;
          }, 500);
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
        },
        complete: (): void => {
          this.loaders.page = true;
        }
      })
    )
  }

  private onRequestFailed(errorModel: ErrorModel, err: any): void {
    errorModel.traceId = err.headers.get('X-Trace-Id');
    errorModel.responseStatusCode = err.status;
    errorModel.responseErrorModel = err.error;
  }
}
