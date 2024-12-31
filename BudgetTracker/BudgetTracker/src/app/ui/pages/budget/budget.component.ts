import {Component, OnDestroy, OnInit} from '@angular/core';
import {SpinnerSize} from "../../components/shared/spinner/spinner.component";
import {IncomeModel} from "../../../models/RequestModels";
import {Subscription, switchMap} from "rxjs";
import {ErrorModel} from "../../../models/ErrorModel";
import {RequestParamModel} from "../../../models/RequestParamModel";
import {DateUtils} from '../../../util/date.utils';
import {HttpService} from "../../../services/http/httpService";
import {ActivatedRoute, Params} from "@angular/router";
import {HttpResponse} from "@angular/common/http";
import {SubscriptionUtils} from "../../../util/subscription.utils";

@Component({
  selector: 'app-budget',
  templateUrl: './budget.component.html',
  styleUrl: './budget.component.css'
})
export class BudgetComponent implements OnInit, OnDestroy {
  protected readonly DateUtils = DateUtils;
  protected readonly SpinnerSize = SpinnerSize;
  protected incomes: IncomeModel[] | null;
  protected subscriptions: Subscription[] = [];
  protected errorModel: ErrorModel;
  protected requestParamModel: RequestParamModel;

  protected isLoaded: boolean = false;
  protected selectedIncome: IncomeModel;

  constructor(
    private httpService: HttpService,
    private activatedRoute: ActivatedRoute) {
  }

  ngOnInit(): void {
    let currentYear = new Date().getFullYear();
    this.requestParamModel = new RequestParamModel({
      pageSize: 15,
      fromDate: DateUtils.format(new Date(currentYear, 0, 1)),
      toDate: DateUtils.format(new Date(currentYear, 11, 31))
    })
    this.errorModel = new ErrorModel();
    this.incomes = [];

    this.subscriptions.push(
      this.activatedRoute.queryParams.pipe(
        switchMap((queryParams: Params) => {
            const idBudget: string = queryParams['id'];
            return this.httpService.getBudgetIncomes(
              this.requestParamModel,
              idBudget);
          }
        )
      ).subscribe({
        next: (response: HttpResponse<IncomeModel[]>): void => {
          this.incomes = response.body;
          console.log(this.incomes);
          this.errorModel.responseStatusCode = response.status
          this.isLoaded = true;
        },
        error: (err) => {
          this.errorModel.traceId = err.headers.get('X-Trace-Id');
          this.errorModel.responseStatusCode = err.status;
          this.errorModel.responseErrorModel = err.error;
          this.isLoaded = true;
        }
      })
    );
  }

  ngOnDestroy(): void {
    SubscriptionUtils.unsubscribeAll(this.subscriptions);
  }
}
