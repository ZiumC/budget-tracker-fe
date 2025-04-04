import {Component, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {format, subtract} from "../../../../../util/number.util";
import {DateUtil} from "../../../../../util/date.util";
import {formatString} from "../../../../../util/string.utils";
import {Subscription} from "rxjs";
import {SubscriptionUtils} from "../../../../../util/subscription.utils";
import {HttpService} from "../../../../../services/http/http.service";
import {ConfigService} from "../../../../../services/config/config.service";
import {AppConfig} from "../../../../../models/config/config";
import {ResponseModel} from "../../../../../models/response.model";
import {RequestModel} from "../../../../../models/request.model";
import {GetPaymentDto, PaymentStatusDto} from "../../../../../models/dto/payment.model.dto";
import {generateErrorModel} from "../../../../../util/http.util";
import {TimerUtils} from "../../../../../util/timer.utils";
import {HttpResponse} from "@angular/common/http";
import {PageDto} from "../../../../../models/dto/page.model.dto";
import {OrderOptions} from "../../../shared/order/order.component";
import {SortPayment} from "../../../../../util/sort.utils";

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrl: './payment.component.css'
})
export class PaymentComponent implements OnInit, OnDestroy {
  @ViewChild('errorModal') errorModal: any;
  @ViewChild('paymentModal') paymentModal: any;
  @Input() idBudget: string;
  protected readonly format = format;
  protected readonly DateUtils = DateUtil;
  protected readonly formatString = formatString;
  protected readonly subtract = subtract;
  protected subscriptions: Subscription[];
  protected appConfig: AppConfig;
  protected paymentRequestModel: RequestModel;
  protected paymentResponseModel: ResponseModel;
  protected paymentsDto: GetPaymentDto[] | null;
  protected selectedPayment: GetPaymentDto;
  protected paymentTotalPages: number | undefined;
  protected paymentLoader: boolean;
  protected paymentStatusLoader: boolean;
  public innerWidth: any;

  constructor(
    private httpService: HttpService,
    private configService: ConfigService) {
  }

  ngOnInit(): void {
    const appCfg = this.configService.getAppConfig();
    if (appCfg) {
      this.appConfig = appCfg;
    } else {
      throw Error("Config not provided")
    }

    this.paymentResponseModel = new ResponseModel();

    this.innerWidth = window.innerWidth;
    this.subscriptions = [];

    this.paymentRequestModel = new RequestModel({
      page: this.appConfig.request.pagination.defaultPage,
      pageSize: this.appConfig.request.pagination.defaultPageSizeOptions[0],
    })

    this.getPayments();
    this.defaultOrderParams();
    this.getPaymentTotalPages();
  }

  openModal(): void {
    this.paymentModal.open();
  }

  ngOnDestroy(): void {
    SubscriptionUtils.unsubscribeAll(this.subscriptions);
  }

  protected onPageSizeEvent(pageSize: number): void {
    this.paymentRequestModel.page = this.appConfig.request.pagination.defaultPage;
    this.paymentRequestModel.pageSize = pageSize;
    this.onRefreshPayment();
  }

  protected onPageEvent(page: number): void {
    this.paymentRequestModel.page = page;
    this.onRefreshPayment();
  }

  protected onOrderEvent(orderOptions: OrderOptions): void {
    if (orderOptions.orderType.applyForApi) {
      this.paymentRequestModel.orderBy = orderOptions.orderType.value;
      if (orderOptions.orderType.displayDirections) {
        this.paymentRequestModel.order = orderOptions.orderDirection!.value;
      } else {
        this.paymentRequestModel.order = null;
      }
      this.onRefreshPayment();
    } else {
      const isAscending = orderOptions.orderDirection.value ==
        this.appConfig.request.order.orderDirections[0].value;

      this.paymentsDto = SortPayment.realCost(this.paymentsDto, isAscending);
    }
  }

  protected onRefreshPayment(): void {
    this.markPaymentsAsLoaded(false);
    this.getPayments();
  }

  protected patchPaymentStatus(isPaid: boolean, idPayment: string): void {
    this.paymentStatusLoader = true;
    this.subscriptions.push(
      this.httpService.patchPaymentStatus(
        {
          isPaid: isPaid
        } as PaymentStatusDto,
        idPayment
      ).subscribe({
        next: (): void => {
          this.paymentsDto!
            .find((payment): boolean => payment.id == idPayment)!.isPaid! = isPaid;
        },
        error: (err): void => {
          const response = generateErrorModel(err);
          this.paymentResponseModel = response;
          this.errorModal.open(response);
          this.paymentStatusLoader = false;
        },
        complete: (): void => {
          this.paymentStatusLoader = false;
        }
      })
    )
  }

  private markPaymentsAsLoaded(isLoaded: boolean): void {
    if (isLoaded) {
      new TimerUtils(this.appConfig.animation.duration.default).start()
        .subscribe(finished => {
          if (finished) {
            this.paymentLoader = isLoaded;
          }
        })
    } else {
      this.paymentLoader = isLoaded;
    }
  }

  private getPayments(): void {
    this.subscriptions.push(
      this.httpService.getBudgetPayments(
        this.paymentRequestModel,
        this.idBudget).subscribe({
        next: (response: HttpResponse<GetPaymentDto[]>): void => {
          this.paymentsDto = response.body;
          this.paymentResponseModel.statusCode = response.status;
        },
        error: (err): void => {
          const response = generateErrorModel(err);
          this.paymentResponseModel = response;
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

  private defaultOrderParams(): void {
    this.paymentRequestModel.orderBy =
      this.appConfig.request.order.paymentTypes[0].value;
    this.paymentRequestModel.order =
      this.appConfig.request.order.orderDirections[0].value;
  }
}
