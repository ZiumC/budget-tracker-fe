import {Component, OnDestroy, OnInit} from '@angular/core';
import {SpinnerSize} from "../../components/shared/spinner/spinner.component";
import {BudgetModel, IncomeModel} from "../../../models/RequestModels";
import {Subscription} from "rxjs";
import {ErrorModel} from "../../../models/ErrorModel";
import {RequestParamModel} from "../../../models/RequestParamModel";
import {DateUtils} from '../../../util/date.utils';
import {HttpService} from "../../../services/http/httpService";
import {ActivatedRoute, Params} from "@angular/router";
import {HttpResponse} from "@angular/common/http";
import {SubscriptionUtils} from "../../../util/subscription.utils";
import {NumberUtils} from "../../../util/number.utils";

@Component({
  selector: 'app-budget',
  templateUrl: './budget.component.html',
  styleUrl: './budget.component.css'
})
export class BudgetComponent implements OnInit, OnDestroy {
  protected readonly DateUtils = DateUtils;
  protected readonly SpinnerSize = SpinnerSize;
  protected incomes: IncomeModel[] | null;
  protected budget: BudgetModel | null;
  protected subscriptions: Subscription[] = [];
  protected requestParamModel: RequestParamModel;

  protected selectedIncome: IncomeModel;
  protected pageLoader: any;
  protected requiredStatusCode: any;
  protected errorModels: any;
  private idBudget: string;

  constructor(
    private httpService: HttpService,
    private activatedRoute: ActivatedRoute) {
  }

  ngOnInit(): void {
    this.requiredStatusCode = {
      budget: 200,
      incomes: 200,
      payments: 200
    };
    this.pageLoader = {
      budget: false,
      incomes: false,
      payments: false
    };
    this.errorModels = {
      budget: new ErrorModel(),
      incomes: new ErrorModel(),
      payments: new ErrorModel()
    };
    let currentYear = new Date().getFullYear();
    this.requestParamModel = new RequestParamModel({
      pageSize: 15,
      fromDate: DateUtils.format(new Date(currentYear, 0, 1)),
      toDate: DateUtils.format(new Date(currentYear, 11, 31))
    })
    this.incomes = [];

    this.activatedRoute.queryParams.subscribe((params: Params) => {
      this.idBudget = params['id'];
    });

    this.subscriptions.push(
      this.httpService.getBudget(this.idBudget).subscribe({
        next: (response: HttpResponse<BudgetModel>): void => {
          this.budget = response.body;
          this.errorModels.budget.responseStatusCode = response.status
          this.pageLoader.budget = true;
        },
        error: (err) => {
          this.errorModels.budget.traceId = err.headers.get('X-Trace-Id');
          this.errorModels.budget.responseStatusCode = err.status;
          this.errorModels.budget.responseErrorModel = err.error;
          this.pageLoader.budget = true;
        }
      })
    )

    this.subscriptions.push(
      this.httpService.getBudgetIncomes(
        this.requestParamModel,
        this.idBudget).subscribe({
        next: (response: HttpResponse<IncomeModel[]>): void => {
          this.incomes = response.body;
          this.errorModels.incomes.responseStatusCode = response.status
          this.pageLoader.incomes = true;
        },
        error: (err) => {
          this.errorModels.incomes.traceId = err.headers.get('X-Trace-Id');
          this.errorModels.incomes.responseStatusCode = err.status;
          this.errorModels.incomes.responseErrorModel = err.error;
          this.pageLoader.incomes = true;
        }
      })
    )
  }

  ngOnDestroy(): void {
    SubscriptionUtils.unsubscribeAll(this.subscriptions);
  }

  protected readonly NumberUtils = NumberUtils;
}
