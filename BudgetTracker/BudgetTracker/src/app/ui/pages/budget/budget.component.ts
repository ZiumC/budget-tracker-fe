import {Component, HostListener, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {SpinnerSize} from "../../components/shared/spinner/spinner.component";
import {Subscription} from "rxjs";
import {BudgetResponse, ResponseModel} from "../../../models/response.model";
import {RequestModel} from "../../../models/request.model";
import {DateUtil} from '../../../util/date.util';
import {HttpService} from "../../../services/http/http.service";
import {ActivatedRoute, Params, Router} from "@angular/router";
import {HttpResponse} from "@angular/common/http";
import {SubscriptionUtils} from "../../../util/subscription.utils";
import {SortPayment} from "../../../util/sort.utils";
import {OrderOptions} from "../../components/shared/order/order.component";
import {format, subtract} from "../../../util/number.util";
import {GetPaymentDto, PaymentStatusDto} from "../../../models/dto/payment.model.dto";
import {GetIncomeDto} from "../../../models/dto/income.model.dto";
import {GetBudgetDto} from "../../../models/dto/budget.model.dto";
import {PageDto} from "../../../models/dto/page.model.dto";
import {AppConfig} from "../../../models/config/config";
import {ConfigService} from "../../../services/config/config.service";
import {formatString} from "../../../util/string.utils";
import {generateErrorModel} from "../../../util/http.util";
import {TimerUtils} from "../../../util/timer.utils";

@Component({
  selector: 'app-budget',
  templateUrl: './budget.component.html',
  styleUrl: './budget.component.css'
})
export class BudgetComponent implements OnInit, OnDestroy {
  @ViewChild('errorModal') errorModal: any;
  protected readonly format = format;
  protected readonly subtract = subtract;
  protected readonly formatString = formatString;
  protected readonly DateUtils = DateUtil;
  protected readonly SpinnerSize = SpinnerSize;
  protected appConfig: AppConfig;
  protected incomesDto: GetIncomeDto[] | null;
  protected paymentsDto: GetPaymentDto[] | null;
  protected budgetDto: GetBudgetDto | null;
  protected subscriptions: Subscription[];
  protected selectedIncome: GetIncomeDto;
  protected selectedPayment: GetPaymentDto;
  protected incomeRequestModel: RequestModel;
  protected paymentRequestModel: RequestModel;
  protected responseModels: BudgetResponse;
  protected idBudget: string;
  protected incomeTotalPages: number | undefined;
  protected paymentTotalPages: number | undefined;
  protected loaders: any;
  public innerWidth: any;

  constructor(
    private httpService: HttpService,
    private activatedRoute: ActivatedRoute,
    private configService: ConfigService,
    private router: Router) {
  }

  ngOnDestroy(): void {
    SubscriptionUtils.unsubscribeAll(this.subscriptions);
  }

  ngOnInit(): void {
    const appCfg = this.configService.getAppConfig();
    if (appCfg) {
      this.appConfig = appCfg;
    } else {
      throw Error("Config not provided")
    }

    this.loaders = {
      budget: false,
      incomes: false,
      payments: false,
      paymentStatusBtn: false
    };

    this.responseModels = {
      budget: new ResponseModel(),
      incomes: new ResponseModel(),
      payments: new ResponseModel(),
      paymentStatus: new ResponseModel()
    };

    this.innerWidth = window.innerWidth;
    this.subscriptions = [];

    this.incomeRequestModel = new RequestModel({
      page: this.appConfig.request.pagination.defaultPage,
      pageSize: this.appConfig.request.pagination.defaultPageSizeOptions[0],
    })

    this.paymentRequestModel = new RequestModel({
      page: this.appConfig.request.pagination.defaultPage,
      pageSize: this.appConfig.request.pagination.defaultPageSizeOptions[0],
    })

    this.activatedRoute.queryParams.subscribe((params: Params): void => {
      this.idBudget = params['id'];
    });

    this.subscriptions.push(
      this.httpService.getBudget(this.idBudget).subscribe({
        next: (response: HttpResponse<GetBudgetDto>): void => {
          this.budgetDto = response.body;
          this.responseModels.budget.statusCode = response.status;
        },
        error: (err): void => {
          const response = generateErrorModel(err);
          this.responseModels.budget = response;
          if (response.statusCode != 404) {
            this.errorModal.open(response);
          }
          this.markBudgetAsLoaded(true);
        },
        complete: (): void => {
          this.markBudgetAsLoaded(true);
        }
      })
    )
    this.getPaymentTotalPages();

    this.getBudgetPayments();
  }

  @HostListener('window:resize', ['$event'])
  onResize(): void {
    this.innerWidth = window.innerWidth;
  }

  protected onRefreshPayment(): void {
    this.markPaymentsAsLoaded(false);
    this.getBudgetPayments();
  }

  protected onRedirectToIndex(): void {
    this.router.navigate(['/']);
  }

  private getBudgetPayments(): void {
    this.subscriptions.push(
      this.httpService.getBudgetPayments(
        this.paymentRequestModel,
        this.idBudget).subscribe({
        next: (response: HttpResponse<GetPaymentDto[]>): void => {
          this.paymentsDto = response.body;
          this.responseModels.payments.statusCode = response.status;
        },
        error: (err): void => {
          const response = generateErrorModel(err);
          this.responseModels.payments = response;
          if (response.statusCode != 404) {
            this.errorModal.open(response);
          }
          this.markPaymentsAsLoaded(true);
        },
        complete: (): void => {
          this.getPaymentTotalPages();
          this.markPaymentsAsLoaded(true);
        }
      })
    )
  }

  private getPaymentTotalPages(): void {
    this.subscriptions.push(
      this.httpService.getPaymentPages(
        this.paymentRequestModel,
        this.idBudget).subscribe({
        next: (response: HttpResponse<PageDto>): void => {
          this.paymentTotalPages = response.body!.pages;
        }
      })
    )
  }

  private markPaymentsAsLoaded(isLoaded: boolean): void {
    if (isLoaded) {
      new TimerUtils(this.appConfig.animation.duration.default).start()
        .subscribe(finished => {
          if (finished) {
            this.loaders.payments = isLoaded;
          }
        })
    } else {
      this.loaders.payments = isLoaded;
    }
  }

  private markBudgetAsLoaded(isLoaded: boolean): void {
    if (isLoaded) {
      new TimerUtils(this.appConfig.animation.duration.default).start()
        .subscribe(finished => {
          if (finished) {
            this.loaders.budget = isLoaded;
          }
        });
    } else {
      this.loaders.budget = isLoaded;
    }
  }
}
