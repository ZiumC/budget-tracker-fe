import {Component, HostListener, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {HttpService} from "../../../../../services/http/http.service";
import {ConfigService} from "../../../../../services/config/config.service";
import {Subscription} from "rxjs";
import {SubscriptionUtils} from "../../../../../util/subscription.utils";
import {AppConfig} from "../../../../../models/config/config";
import {RequestParams} from "../../../../../models/requestParams";
import {HttpResponse} from "@angular/common/http";
import {GetPlannedPaymentDto} from "../../../../../models/dto/planned-payment.model.dto";
import {ResponseModel} from "../../../../../models/response.model";
import {generateErrorModel} from "../../../../../util/http.util";
import {formatString} from "../../../../../util/string.utils";
import {TimerUtils} from "../../../../../util/timer.utils";
import {format, subtract} from "../../../../../util/number.util";
import {DateUtil} from "../../../../../util/date.util";
import {OrderOptions} from "../../../shared/order/order.component";
import {PageDto} from "../../../../../models/dto/page.model.dto";
import BigNumber from "bignumber.js";
import {PaymentStatusDto} from "../../../../../models/dto/payment.model.dto";

@Component({
  selector: 'app-planned-payment',
  templateUrl: './planned-payment.component.html',
  styleUrl: './planned-payment.component.css'
})
export class PlannedPaymentComponent implements OnInit, OnDestroy {
  @ViewChild('plannedPaymentModal') plannedPaymentModal: any;
  @ViewChild('errorModal') errorModal: any;
  @Input() idBudget: string;
  protected readonly formatString = formatString;
  protected readonly DateUtils = DateUtil;
  protected readonly format = format;
  protected readonly subtract = subtract;
  protected subscriptions: Subscription[];
  protected appConfig: AppConfig;
  protected plannedPaymentsDto: GetPlannedPaymentDto[] | null;
  protected selectedPlannedPayment: GetPlannedPaymentDto;
  protected requestParams: RequestParams;
  protected responseModel: ResponseModel;
  protected requiredStatusCode: number;
  protected plannedPaymentsLoader: boolean;
  protected plannedPaymentStatusLoader: boolean;
  protected totalPages: number;
  public innerWidth: any;

  constructor(
    private httpService: HttpService,
    private configService: ConfigService) {
  }

  ngOnInit(): void {
    const appCfg = this.configService.getAppConfig();
    if (appCfg) {
      this.appConfig = appCfg;
      this.requiredStatusCode = appCfg.response.required.plannedPaymentStatus
    } else {
      throw Error("Config not provided")
    }

    this.innerWidth = window.innerWidth;
    this.responseModel = new ResponseModel();
    this.subscriptions = [];

    this.requestParams = new RequestParams({
      page: this.appConfig.request.pagination.defaultPage,
      pageSize: this.appConfig.request.pagination.defaultPageSizeOptions[0],
    })

    this.getPlannedPayments();
    this.defaultOrderParams();
    this.getPlannedPaymentTotalPages();
  }

  @HostListener('window:resize', ['$event'])
  onResize(): void {
    this.innerWidth = window.innerWidth;
  }

  openModal(): void {
    this.plannedPaymentModal.open();
  }

  ngOnDestroy(): void {
    SubscriptionUtils.unsubscribeAll(this.subscriptions);
  }

  protected onPageSizeEvent(pageSize: number): void {
    this.requestParams.page = this.appConfig.request.pagination.defaultPage;
    this.requestParams.pageSize = pageSize;
    this.onRefreshPlannedPayment();
  }

  protected onPageEvent(page: number): void {
    this.requestParams.page = page;
    this.onRefreshPlannedPayment();
  }

  protected onOrderEvent(orderOptions: OrderOptions): void {
    if (orderOptions.orderType.applyForApi) {
      this.requestParams.orderBy = orderOptions.orderType.value;
      if (orderOptions.orderType.displayDirections) {
        this.requestParams.order = orderOptions.orderDirection!.value;
      } else {
        this.requestParams.order = null;
      }
      this.onRefreshPlannedPayment();
    }
  }

  protected onRefreshPlannedPayment(): void {
    this.markPlannedPaymentsAsLoaded(false);
    this.getPlannedPayments();
  }

  protected patchPlannedPaymentStatus(isPaid: boolean, idPlannedPayment: string): void {
    this.plannedPaymentStatusLoader = true;
    this.subscriptions.push(
      this.httpService.patchPaymentStatus(
        {
          isPaid: isPaid
        } as PaymentStatusDto,
        idPlannedPayment,
        true
      ).subscribe({
        next: (): void => {
          this.plannedPaymentsDto!
            .find((payment): boolean => payment.id == idPlannedPayment)!.isPaid! = isPaid;
        },
        error: (err): void => {
          const response = generateErrorModel(err);
          this.responseModel = response;
          this.errorModal.open(response);
          this.plannedPaymentStatusLoader = false;
        },
        complete: (): void => {
          this.plannedPaymentStatusLoader = false;
        }
      })
    )
  }

  private getPlannedPayments(): void {
    this.subscriptions.push(
      this.httpService.getPlannedPayment(
        this.requestParams,
        this.idBudget
      ).subscribe({
        next: (response: HttpResponse<GetPlannedPaymentDto[]>): void => {
          this.plannedPaymentsDto = response.body;
          this.responseModel.statusCode = response.status;
        }, error: (err): void => {
          const response = generateErrorModel(err);
          this.responseModel = response;
          if (response.statusCode != 404) {
            this.errorModal.open(response);
          }
          this.markPlannedPaymentsAsLoaded(true);
        },
        complete: (): void => {
          this.markPlannedPaymentsAsLoaded(true);
        }
      })
    )
  }

  private markPlannedPaymentsAsLoaded(isLoaded: boolean): void {
    if (isLoaded) {
      new TimerUtils(this.appConfig.animation.duration.default).start()
        .subscribe(finished => {
          if (finished) {
            this.plannedPaymentsLoader = isLoaded;
          }
        })
    } else {
      this.plannedPaymentsLoader = isLoaded;
    }
  }

  private getPlannedPaymentTotalPages(): void {
    this.subscriptions.push(
      this.httpService.getPlannedPaymentPages(
        this.requestParams,
        this.idBudget).subscribe({
        next: (response: HttpResponse<PageDto>): void => {
          this.totalPages = response.body!.pages;
        }
      })
    )
  }

  private defaultOrderParams(): void {
    this.requestParams.orderBy =
      this.appConfig.request.order.plannedPaymentTypes[0].value;
    this.requestParams.order =
      this.appConfig.request.order.orderDirections[0].value;
  }

  protected readonly BigNumber = BigNumber;
}
