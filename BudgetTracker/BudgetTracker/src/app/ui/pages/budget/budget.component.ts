import {Component, HostListener, OnDestroy, OnInit} from '@angular/core';
import {SpinnerSize} from "../../components/shared/spinner/spinner.component";
import {BudgetModel, IncomeModel, PaymentModel} from "../../../models/RequestModels";
import {Subscription} from "rxjs";
import {ErrorModel} from "../../../models/ErrorModel";
import {RequestParamModel} from "../../../models/RequestParamModel";
import {DateUtils} from '../../../util/date.utils';
import {HttpService} from "../../../services/http/httpService";
import {ActivatedRoute, Params, Router} from "@angular/router";
import {HttpResponse} from "@angular/common/http";
import {SubscriptionUtils} from "../../../util/subscription.utils";
import {NumberUtils} from "../../../util/number.utils";
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
  protected subscriptions: Subscription[];
  protected selectedIncome: IncomeModel;
  protected selectedPayment: PaymentModel;
  protected requestParam: RequestParamModel;
  protected idBudget: string;

  protected loaders: any;
  protected requiredStatusCode: any;
  protected errorModels: any;
  protected commentRows: number;

  public innerWidth: any;

  constructor(
    private httpService: HttpService,
    private activatedRoute: ActivatedRoute,
    private router: Router) {
  }

  ngOnDestroy(): void {
    SubscriptionUtils.unsubscribeAll(this.subscriptions);
  }

  ngOnInit(): void {
    this.requiredStatusCode = {
      budget: 200,
      incomes: 200,
      payments: 200
    };

    this.loaders = {
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
    this.subscriptions = [];

    this.requestParam = new RequestParamModel({
      page: 1,
      pageSize: 15
    })

    this.activatedRoute.queryParams.subscribe((params: Params): void => {
      this.idBudget = params['id'];
    });

    this.subscriptions.push(
      this.httpService.getBudget(this.idBudget).subscribe({
        next: (response: HttpResponse<BudgetModel>): void => {
          this.budget = response.body;
          this.errorModels.budget.responseStatusCode = response.status;
        },
        error: (err): void => {
          this.onRequestFailed(this.errorModels.budget, err);
          this.markBudgetAsLoaded(true);
        },
        complete: (): void => {
          this.markBudgetAsLoaded(true);
        }
      })
    )

    this.getBudgetIncomes();
    this.getBudgetPayments();
  }

  @HostListener('window:resize', ['$event'])
  onResize(): void {
    this.innerWidth = window.innerWidth;
  }

  protected onRefreshIncome(refresh: boolean): void {
    if (refresh) {
      this.markIncomesAsLoaded(false);
      this.errorModels.incomes = new ErrorModel();
      this.getBudgetIncomes();
    }
  }

  protected onRefreshPayment(refresh: boolean): void {
    if (refresh) {
      this.markPaymentsAsLoaded(false);
      this.errorModels.payments = new ErrorModel();
      this.getBudgetPayments();
    }
  }

  protected onRedirectToIndex(redirect: boolean): void {
    if (redirect) {
      this.router.navigate(['/']);
    }
  }

  private onRequestFailed(errorModel: ErrorModel, err: any): void {
    errorModel.traceId = err.headers.get('X-Trace-Id');
    errorModel.responseStatusCode = err.status;
    errorModel.responseErrorModel = err.error;
  }

  private getBudgetIncomes(): void {
    this.subscriptions.push(
      this.httpService.getBudgetIncomes(
        this.requestParam,
        this.idBudget).subscribe({
        next: (response: HttpResponse<IncomeModel[]>): void => {
          this.incomes = Sort.incomeSurplusFirst(response.body);
          this.errorModels.incomes.responseStatusCode = response.status;
        },
        error: (err): void => {
          this.onRequestFailed(this.errorModels.incomes, err);
          this.markIncomesAsLoaded(true);
        },
        complete: (): void => {
          this.markIncomesAsLoaded(true);
        }
      })
    )
  }

  private getBudgetPayments(): void {
    this.subscriptions.push(
      this.httpService.getBudgetPayments(
        this.requestParam,
        this.idBudget).subscribe({
        next: (response: HttpResponse<PaymentModel[]>): void => {
          this.payments = Sort.incomePaidFirst(response.body);
          this.errorModels.payments.responseStatusCode = response.status;
        },
        error: (err): void => {
          this.onRequestFailed(this.errorModels.payments, err);
          this.markPaymentsAsLoaded(true);
        },
        complete: (): void => {
          this.markPaymentsAsLoaded(true);
        }
      })
    )
  }

  private markPaymentsAsLoaded(value: boolean): void {
    setTimeout((): void => {
      this.loaders.payments = value;
    }, value ? 500 : 0)
  }

  private markIncomesAsLoaded(value: boolean): void {
    setTimeout((): void => {
      this.loaders.incomes = value;
    }, value ? 500 : 0)
  }

  private markBudgetAsLoaded(value: boolean): void {
    setTimeout((): void => {
      this.loaders.budget = value;
    }, value ? 500 : 0)
  }
}
