import {AfterViewInit, Component, ElementRef, HostListener, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {format, subtract} from "../../../../../util/number.util";
import {DateUtil} from "../../../../../util/date.util";
import {formatString} from "../../../../../util/string.utils";
import {Subscription} from "rxjs";
import {SubscriptionUtils} from "../../../../../util/subscription.utils";
import {HttpService} from "../../../../../services/http/http.service";
import {ConfigService} from "../../../../../services/config/config.service";
import {AppConfig} from "../../../../../models/config/config";
import {ResponseModel} from "../../../../../models/response.model";
import {RequestParams} from "../../../../../models/requestParams";
import {GetPaymentDto, PaymentStatusDto} from "../../../../../models/dto/payment.model.dto";
import {generateErrorModel} from "../../../../../util/http.util";
import {TimerUtils} from "../../../../../util/timer.utils";
import {HttpResponse} from "@angular/common/http";
import {PageDto} from "../../../../../models/dto/page.model.dto";
import {OrderOptions} from "../../../shared/order/order.component";
import {SortPayment} from "../../../../../util/arrays.utils";
import {getPaymentType} from "../../../../../util/category.utils";
import {GetPaymentAssignmentDto} from "../../../../../models/dto/assignment.model.dto";

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrl: './payment.component.css'
})
export class PaymentComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('paymentComponentPage') element: ElementRef;
  @ViewChild('errorModal') errorModal: any;
  @ViewChild('paymentModal') paymentModal: any;
  @Input() idBudget: string;
  private pageWidth: any;
  private componentDimension = {width: 0, height: 0};
  protected readonly format = format;
  protected readonly DateUtils = DateUtil;
  protected readonly formatString = formatString;
  protected readonly subtract = subtract;
  protected readonly getPaymentType = getPaymentType;
  protected subscriptions: Subscription[];
  protected appConfig: AppConfig;
  protected requestParams: RequestParams;
  protected paymentResponseModel: ResponseModel;
  protected paymentsDto: GetPaymentDto[] | null;
  protected selectedPayment: GetPaymentDto;
  protected paymentTotalPages: number | undefined;
  protected paymentLoader: boolean;
  protected paymentStatusLoader: boolean;
  protected assignmentStatusCode: number;

  constructor(
    private httpService: HttpService,
    private configService: ConfigService) {
  }

  ngAfterViewInit(): void {
    this.setComponentDimensions();
  }

  ngOnInit(): void {
    const appCfg = this.configService.getAppConfig();
    if (appCfg) {
      this.appConfig = appCfg;
    } else {
      throw Error("Config not provided")
    }

    this.pageWidth = window.innerWidth;
    this.paymentResponseModel = new ResponseModel();
    this.subscriptions = [];

    this.requestParams = new RequestParams({
      page: this.appConfig.request.pagination.defaultPage,
      pageSize: this.appConfig.request.pagination.defaultPageSizeOptions[0],
    });

    this.getPayments();
    this.defaultOrderParams();
    this.getPaymentTotalPages();
  }

  openModal(): void {
    this.paymentModal.open();
  }

  @HostListener('window:resize', ['$event'])
  onResize(): void {
    this.pageWidth = window.innerWidth;
  }

  ngOnDestroy(): void {
    SubscriptionUtils.unsubscribeAll(this.subscriptions);
  }

  protected onPaymentSelect(plannedPayment: GetPaymentDto): void {
    if (this.selectedPayment !== plannedPayment) {
      this.getPaymentAssignment(plannedPayment.id);
    }
    this.selectedPayment = plannedPayment;
  }

  protected displayMobileView(): boolean {
    return this.pageWidth <= this.appConfig.pageMobileWidth;
  }

  protected onPageSizeEvent(pageSize: number): void {
    this.requestParams.page = this.appConfig.request.pagination.defaultPage;
    this.requestParams.pageSize = pageSize;
    this.onRefreshPayment();
  }

  protected onPageEvent(page: number): void {
    this.requestParams.page = page;
    this.onRefreshPayment();
  }

  protected onOrderEvent(orderOptions: OrderOptions): void {
    if (orderOptions.orderType.applyForApi) {
      this.requestParams.orderBy = orderOptions.orderType.value;
      if (orderOptions.orderType.displayDirections) {
        this.requestParams.order = orderOptions.orderDirection!.value;
      } else {
        this.requestParams.order = null;
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
    this.getPaymentTotalPages();
    this.getPayments();
  }

  protected patchPaymentStatus(isPaid: boolean, idPayment: string): void {
    this.paymentStatusLoader = true;
    this.subscriptions.push(
      this.httpService.patchPaymentStatus(
        idPayment,
        {
          isPaid: isPaid
        } as PaymentStatusDto,
        false
      ).subscribe({
        next: (): void => {
          for (let payment of this.paymentsDto!) {
            if (payment.id == idPayment) {
              payment.isPaid = isPaid;
              payment.dateUpdated = new Date();
            }
          }
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

  private getPaymentAssignment(idPayment: string): void {
    this.subscriptions.push(
      this.httpService.getPaymentAssignment(
        idPayment,
        false).subscribe({
        next: (response: HttpResponse<GetPaymentAssignmentDto>): void => {
          for (let payment of this.paymentsDto!) {
            if (payment.id == idPayment) {
              payment.assignment = response.body;
            }
          }
          this.assignmentStatusCode = response.status;
        },
        error: (err): void => {
          this.assignmentStatusCode = err.status;
        },
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
      this.httpService.getBudgetPayments<GetPaymentDto[]>(
        this.idBudget,
        this.requestParams,
        false).subscribe({
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
        this.idBudget,
        this.requestParams).subscribe({
        next: (response: HttpResponse<PageDto>): void => {
          this.paymentTotalPages = response.body!.pages;
        }
      })
    )
  }

  private setComponentDimensions(): void {
    this.componentDimension.width = this.element.nativeElement.offsetWidth;
    this.componentDimension.height = this.element.nativeElement.offsetHeight;
  }

  private defaultOrderParams(): void {
    this.requestParams.orderBy =
      this.appConfig.request.order.paymentTypes[0].value;
    this.requestParams.order =
      this.appConfig.request.order.orderDirections[0].value;
  }
}
