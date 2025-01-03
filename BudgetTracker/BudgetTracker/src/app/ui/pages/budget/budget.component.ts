import {Component, HostListener, OnDestroy, OnInit} from '@angular/core';
import {SpinnerSize} from "../../components/shared/spinner/spinner.component";
import {BudgetModel, IncomeModel, PaymentModel} from "../../../models/RequestModels";
import {Subscription} from "rxjs";
import {ErrorModel} from "../../../models/ErrorModel";
import {RequestParamModel} from "../../../models/RequestParamModel";
import {DateUtils} from '../../../util/date.utils';
import {HttpService} from "../../../services/http/httpService";
import {ActivatedRoute, Params} from "@angular/router";
import {HttpResponse} from "@angular/common/http";
import {SubscriptionUtils} from "../../../util/subscription.utils";
import {NumberUtils} from "../../../util/number.utils";
import BigNumber from "bignumber.js";
import {Sort} from "../../../util/model.utils";

@Component({
  selector: 'app-budget',
  templateUrl: './budget.component.html',
  styleUrl: './budget.component.css'
})
export class BudgetComponent implements OnInit, OnDestroy {
  public readonly mobileWidth: number = 770;
  protected readonly DateUtils = DateUtils;
  protected readonly NumberUtils = NumberUtils;
  protected readonly SpinnerSize = SpinnerSize;
  protected incomes: IncomeModel[] | null;
  protected budget: BudgetModel | null;
  protected payments: PaymentModel[] | null;
  protected subscriptions: Subscription[] = [];
  protected selectedIncome: IncomeModel;
  protected selectedPayment: PaymentModel;

  protected pageLoaded: boolean = false;
  protected requestLoaded: any;
  protected requiredStatusCode: any;
  protected errorModels: any;
  protected commentRows: number;

  protected idBudget: string;
  public innerWidth: any;

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

    this.requestLoaded = {
      budget: false,
      incomes: false,
      payments: false
    };

    this.errorModels = {
      budget: new ErrorModel(),
      incomes: new ErrorModel(),
      payments: new ErrorModel()
    };

    this.commentRows = 1;
    this.innerWidth = window.innerWidth;

    const requestParam = new RequestParamModel({
      page: 1,
      pageSize: 15
    })

    this.activatedRoute.queryParams.subscribe((params: Params) => {
      this.idBudget = params['id'];
    });

    this.subscriptions.push(
      this.httpService.getBudget(this.idBudget).subscribe({
        next: (response: HttpResponse<BudgetModel>): void => {
          this.budget = response.body;
          this.errorModels.budget.responseStatusCode = response.status
          this.requestLoaded.budget = true;
        },
        error: (err) => {
          this.errorModels.budget.traceId = err.headers.get('X-Trace-Id');
          this.errorModels.budget.responseStatusCode = err.status;
          this.errorModels.budget.responseErrorModel = err.error;
          this.requestLoaded.budget = true;
        }
      })
    )

    this.subscriptions.push(
      this.httpService.getBudgetIncomes(
        requestParam,
        this.idBudget).subscribe({
        next: (response: HttpResponse<IncomeModel[]>): void => {
          this.incomes = Sort.incomeSurplusFirst(response.body);
          this.errorModels.incomes.responseStatusCode = response.status
          this.requestLoaded.incomes = true;
        },
        error: (err) => {
          this.errorModels.incomes.traceId = err.headers.get('X-Trace-Id');
          this.errorModels.incomes.responseStatusCode = err.status;
          this.errorModels.incomes.responseErrorModel = err.error;
          this.requestLoaded.incomes = true;
        }
      })
    )

    this.subscriptions.push(
      this.httpService.getBudgetPayments(
        requestParam,
        this.idBudget).subscribe({
        next: (response: HttpResponse<PaymentModel[]>): void => {
          this.payments = Sort.incomePaidFirst(response.body);
          this.errorModels.payments.responseStatusCode = response.status
          this.requestLoaded.payments = true;
        },
        error: (err) => {
          this.errorModels.payments.traceId = err.headers.get('X-Trace-Id');
          this.errorModels.payments.responseStatusCode = err.status;
          this.errorModels.payments.responseErrorModel = err.error;
          this.requestLoaded.payments = true;
        }
      })
    )

    let retryCount = 0;
    setTimeout(() => {
      while (!this.pageLoaded) {
        if ((this.requestLoaded.incomes &&
          this.requestLoaded.budget &&
          this.requestLoaded.payments) ||
        retryCount == 5) {
          this.pageLoaded = true;
        }
        retryCount++;
      }
    }, 1500);
  }


  protected computeRealCost(payment: PaymentModel): BigNumber {
    const price = payment.price;
    const refund = payment.refund;
    const result = new BigNumber(price).minus(new BigNumber(refund));
    return new BigNumber(result);
  }

  protected displayComment(comment: string) {
    if (comment) {
      const length = comment.length;
      if (length == 0) {
        return "No comment"
      } else {
        switch (length) {
          case 100:
            this.commentRows = 2;
            break;
          case 200:
            this.commentRows = 3;
            break;
          case 300:
            this.commentRows = 4;
            break;
          case 400:
            this.commentRows = 5;
            break;
          case 500:
            this.commentRows = 6;
            break;
        }
      }
      return comment;
    } else {
      return "No comment"
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.innerWidth = window.innerWidth;
  }

  ngOnDestroy(): void {
    SubscriptionUtils.unsubscribeAll(this.subscriptions);
  }
}
