import {Component, HostListener, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
import {SpinnerSize} from "../../components/shared/spinner/spinner.component";
import {BudgetModel, IncomeModel, PageModel, PaymentModel} from "../../../models/RequestModels";
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
import {PaymentStatusForm} from "../../../models/FormModels";

@Component({
  selector: 'app-budget',
  templateUrl: './budget.component.html',
  styleUrl: './budget.component.css'
})
export class BudgetComponent implements OnInit, OnDestroy {
  @ViewChild('errorModal') errorModal: any;
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
  protected requestIncomeParam: RequestParamModel;
  protected requestPaymentParam: RequestParamModel;

  protected idBudget: string;
  protected loaders: any;
  protected requiredStatusCode: any;
  protected errorModels: any;
  protected commentRows: number;
  protected incomeTotalPages: number | undefined;
  protected paymentTotalPages: number | undefined;

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
      payments: false,
      paymentStatusBtn: false
    };

    this.errorModels = {
      budget: new ErrorModel(),
      incomes: new ErrorModel(),
      payments: new ErrorModel(),
      paymentStatus: new ErrorModel()
    };

    this.commentRows = 1;
    this.innerWidth = window.innerWidth;
    this.subscriptions = [];

    this.requestIncomeParam = new RequestParamModel({
      page: 1,
      pageSize: 6,
    })

    this.requestPaymentParam = new RequestParamModel({
      page: 1,
      pageSize: 6
    })

    this.incomeTotalPages = 0;
    this.paymentTotalPages = 0;

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
      this.getBudgetIncomes();
    }
  }

  protected onRefreshPayment(refresh: boolean): void {
    if (refresh) {
      this.markPaymentsAsLoaded(false);
      this.getBudgetPayments();
    }
  }

  protected onRedirectToIndex(redirect: boolean): void {
    if (redirect) {
      this.router.navigate(['/']);
    }
  }

  protected onPageSizeEvent(pageSize: number, isIncome: boolean): void {
    if (isIncome) {
      this.requestIncomeParam.pageSize = pageSize;
      this.requestIncomeParam.page = 1;
      this.onRefreshIncome(true);
    } else {
      this.requestPaymentParam.pageSize = pageSize;
      this.requestPaymentParam.page = 1;
      this.onRefreshPayment(true);
    }
  }

  protected onPageEvent(page: number, isIncome: boolean): void {
    if (isIncome) {
      this.requestIncomeParam.page = page;
      this.onRefreshIncome(true);
    } else {
      this.requestPaymentParam.page = page;
      this.onRefreshPayment(true);
    }
  }

  protected patchPaymentStatus(isPaid: boolean, idPayment: string): void {
    this.loaders.paymentStatusBtn = true;
    this.subscriptions.push(
      this.httpService.patchPaymentStatus(
        {
          isPaid: isPaid
        } as PaymentStatusForm,
        idPayment
      ).subscribe({
        next: (): void => {
          this.payments!.find((payment): boolean => payment.id == idPayment)!.isPaid! = isPaid;
          this.loaders.paymentStatusBtn = false;
        },
        error: (err): void => {
          this.onRequestFailed(this.errorModels.paymentStatus, err);
          this.loaders.paymentStatusBtn = false;
        },
        complete: (): void => {
          this.loaders.paymentStatusBtn = false;
        }
      })
    )
  }

  private onRequestFailed(errorModel: ErrorModel, err: any): void {
    errorModel.traceId = err.headers.get('X-Trace-Id');
    errorModel.responseStatusCode = err.status;
    errorModel.responseErrorModel = err.error;
    this.errorModal.open(errorModel);
  }

  private getBudgetIncomes(): void {
    this.subscriptions.push(
      this.httpService.getBudgetIncomes(
        this.requestIncomeParam,
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
          this.getIncomeTotalPages();
          this.markIncomesAsLoaded(true);
        }
      })
    )
  }

  private getBudgetPayments(): void {
    this.subscriptions.push(
      this.httpService.getBudgetPayments(
        this.requestPaymentParam,
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
          this.getPaymentTotalPages();
          this.markPaymentsAsLoaded(true);
        }
      })
    )
  }

  private getIncomeTotalPages(): void {
    this.subscriptions.push(
      this.httpService.getIncomePages(
        this.requestIncomeParam,
        this.idBudget).subscribe({
        next: (response: HttpResponse<PageModel>): void => {
          this.incomeTotalPages = response.body?.pages;
        }
      })
    )
  }

  private getPaymentTotalPages(): void {
    this.subscriptions.push(
      this.httpService.getPaymentPages(
        this.requestPaymentParam,
        this.idBudget).subscribe({
        next: (response: HttpResponse<PageModel>): void => {
          this.paymentTotalPages = response.body?.pages;
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
