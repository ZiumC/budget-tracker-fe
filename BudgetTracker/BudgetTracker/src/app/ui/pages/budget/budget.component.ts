import {Component, HostListener, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {SpinnerSize} from "../../components/shared/spinner/spinner.component";
import {Subscription} from "rxjs";
import {ResponseModel} from "../../../models/response.model";
import {RequestModel} from "../../../models/request.model";
import {DateUtil} from '../../../util/date.util';
import {HttpService} from "../../../services/http/http.service";
import {ActivatedRoute, Params, Router} from "@angular/router";
import {HttpResponse} from "@angular/common/http";
import {SubscriptionUtils} from "../../../util/subscription.utils";
import {SortIncome, SortPayment} from "../../../util/sort.utils";
import {ORDER_TYPES} from "../../components/shared/order/order.component";
import {format, subtract} from "../../../util/number.util";
import {GetPaymentDto, PaymentStatusDto} from "../../../models/dto/payment.model.dto";
import {GetIncomeDto} from "../../../models/dto/income.model.dto";
import {GetBudgetDto} from "../../../models/dto/budget.model.dto";
import {PageDto} from "../../../models/dto/page.model.dto";

@Component({
  selector: 'app-budget',
  templateUrl: './budget.component.html',
  styleUrl: './budget.component.css'
})
export class BudgetComponent implements OnInit, OnDestroy {
  @ViewChild('errorModal') errorModal: any;
  public readonly mobileWidth: number = 770;
  protected readonly format = format;
  protected readonly subtract = subtract;
  protected readonly ORDER_TYPES = ORDER_TYPES;
  protected readonly DateUtils = DateUtil;
  protected readonly SpinnerSize = SpinnerSize;
  protected incomes: GetIncomeDto[] | null;
  protected budget: GetBudgetDto | null;
  protected payments: GetPaymentDto[] | null;
  protected subscriptions: Subscription[];
  protected selectedIncome: GetIncomeDto;
  protected selectedPayment: GetPaymentDto;
  protected requestIncomeParam: RequestModel;
  protected requestPaymentParam: RequestModel;

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
      budget: new ResponseModel(),
      incomes: new ResponseModel(),
      payments: new ResponseModel(),
      paymentStatus: new ResponseModel()
    };

    this.commentRows = 1;
    this.innerWidth = window.innerWidth;
    this.subscriptions = [];

    this.requestIncomeParam = new RequestModel({
      page: 1,
      pageSize: 6,
    })

    this.requestPaymentParam = new RequestModel({
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
        next: (response: HttpResponse<GetBudgetDto>): void => {
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
        } as PaymentStatusDto,
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

  private onRequestFailed(response: ResponseModel, err: any): void {
    response.traceId = err.headers.get('X-Trace-Id');
    response.statusCode = err.status;
    response.error = err.error;
    this.errorModal.open(response);
  }

  private getBudgetIncomes(): void {
    this.subscriptions.push(
      this.httpService.getBudgetIncomes(
        this.requestIncomeParam,
        this.idBudget).subscribe({
        next: (response: HttpResponse<GetIncomeDto[]>): void => {
          this.incomes = SortIncome.surplusFirst(response.body);
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
        next: (response: HttpResponse<GetPaymentDto[]>): void => {
          this.payments = SortPayment.paidFirst(response.body);
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
        next: (response: HttpResponse<PageDto>): void => {
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
        next: (response: HttpResponse<PageDto>): void => {
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
