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
  protected requiredStatusCode: number = 200;
  protected errorModel: ErrorModel;
  protected budgets: BudgetModel[] | null;
  protected subscriptions: Subscription[];
  protected requestParamModel: RequestParamModel;
  protected readonly DateUtils = DateUtils;
  protected readonly SpinnerSize = SpinnerSize;
  protected isLoaded: boolean = false;

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
    this.errorModel = new ErrorModel();

    this.getBudgets(this.requestParamModel);
  }

  ngOnDestroy(): void {
    SubscriptionUtils.unsubscribeAll(this.subscriptions);
  }

  protected onPageIndex(reload: boolean): void {
    if (reload) {
      this.isLoaded = false;
      this.errorModel = new ErrorModel();
      this.getBudgets(this.requestParamModel);
    }
  }

  private getBudgets(requestParamModel: RequestParamModel): void {
    this.subscriptions.push(
      this.httpService.getBudgets(requestParamModel).subscribe({
        next: (response: HttpResponse<BudgetModel[]>): void => {
          this.budgets = response.body;
          this.errorModel.responseStatusCode = response.status
        },
        error: (err): void => {
          this.onRequestFailed(err);
        },
        complete: (): void => {
          this.isLoaded = true;
        }
      })
    )
  }

  private onRequestFailed(err: any): void {
    this.errorModel.traceId = err.headers.get('X-Trace-Id');
    this.errorModel.responseStatusCode = err.status;
    this.errorModel.responseErrorModel = err.error;
  }
}
