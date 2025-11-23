import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import {HttpService} from "../../../../../services/http/http.service";
import {ConfigService} from "../../../../../services/config/config.service";
import {Subscription} from "rxjs";
import {SubscriptionUtils} from "../../../../../util/subscription.utils";
import {AppConfig} from "../../../../../models/config/config";
import {RequestModel} from "../../../../../models/request.model";
import {HttpResponse} from "@angular/common/http";
import {GetPlannedPaymentDto} from "../../../../../models/dto/planned-payment.model.dto";
import {ResponseModel} from "../../../../../models/response.model";
import {getErrorResponse} from "../../../../../util/http.util";
import {formatString} from "../../../../../util/string.utils";
import {TimerUtils} from "../../../../../util/timer.utils";
import {format, subtract} from "../../../../../util/number.util";
import {DateUtil} from "../../../../../util/date.util";
import {OrderOptions} from "../../../shared/order/order.component";
import {PageDto} from "../../../../../models/dto/page.model.dto";
import BigNumber from "bignumber.js";
import {PaymentStatusDto} from "../../../../../models/dto/payment.model.dto";
import {GetPaymentAssignmentDto} from "../../../../../models/dto/assignment.model.dto";
import {getPaymentType} from "../../../../../util/category.utils";
import {ErrorImage, ErrorType} from "../../../../../models/error.model";
import {BudgetTab} from "../../../../../models/components/budget.component";

@Component({
  selector: 'app-planned-payment',
  templateUrl: './planned-payment.component.html',
  styleUrl: './planned-payment.component.css'
})
export class PlannedPaymentComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('plannedPaymentComponentPage') element: ElementRef;
  @ViewChild('plannedPaymentModal') plannedPaymentModal: any;
  @ViewChild('errorModal') errorModal: any;
  @Input() idBudget: string;
  @Input() selectedTab: BudgetTab;
  @Output() refreshAllStatisticsEvent = new EventEmitter<boolean>();
  @Output() refreshSummaryEvent = new EventEmitter<boolean>();
  private componentDimension = {width: 0, height: 0};
  protected pageWidth: number;
  protected readonly formatString = formatString;
  protected readonly DateUtils = DateUtil;
  protected readonly format = format;
  protected readonly subtract = subtract;
  protected readonly BigNumber = BigNumber;
  protected readonly getPaymentType = getPaymentType;
  protected readonly ErrorImage = ErrorImage;
  protected readonly ErrorType = ErrorType;
  protected subscriptions: Subscription[];
  protected appConfig: AppConfig;
  protected plannedPaymentsDto: GetPlannedPaymentDto[] | null;
  protected selectedPlannedPayment: GetPlannedPaymentDto;
  protected requestParams: RequestModel;
  protected paymentResponseModel: ResponseModel;
  protected requiredStatusCode: number;
  protected plannedPaymentsLoader: boolean;
  protected plannedPaymentStatusLoader: boolean;
  protected totalPages: number;
  protected assignmentStatusCode: number;
  protected name: string;

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
      this.requiredStatusCode = appCfg.response.required.plannedPaymentStatus
    } else {
      throw Error("Config not provided")
    }

    this.name = this.selectedTab + '-pagination'
    this.pageWidth = window.innerWidth;
    this.paymentResponseModel = new ResponseModel();
    this.subscriptions = [];

    this.requestParams = new RequestModel({
      page: this.appConfig.request.pagination.defaultPage,
      pageSize: this.appConfig.request.pagination.defaultPageSizeOptions[0],
    })

    this.defaultOrderParams();

    if (this.selectedTab == BudgetTab.PlannedPaymentTab) {
      const page = localStorage.getItem(this.name + '-page');
      if (page) {
        this.requestParams.page = Number(page);
        this.totalPages = Number(page);
      }

      const pageSize = localStorage.getItem(this.name + '-pageSize');
      if (pageSize) {
        this.requestParams.pageSize = Number(pageSize);
      }

      this.getPlannedPayments();
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(): void {
    this.pageWidth = window.innerWidth;
    this.setComponentDimensions();
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
    this.onRefreshPlannedPayment(true);
  }

  protected onPageEvent(page: number): void {
    this.requestParams.page = page;
    this.onRefreshPlannedPayment(true);
  }

  protected paidBtnDisabled(plannedPayment: GetPlannedPaymentDto): boolean {
    let hasRealPrice = new BigNumber(plannedPayment.actual!).toNumber() > 0;
    let hasAssignment = false;

    if (plannedPayment.assignment) {
      hasAssignment = true;
    }

    return hasAssignment && hasRealPrice;
  }

  protected onOrderEvent(orderOptions: OrderOptions): void {
    if (orderOptions.orderType.applyForApi) {
      this.requestParams.orderBy = orderOptions.orderType.value;
      if (orderOptions.orderType.displayDirections) {
        this.requestParams.order = orderOptions.orderDirection!.value;
      } else {
        this.requestParams.order = null;
      }
      this.onRefreshPlannedPayment(true);
    }
  }

  protected onRefreshPlannedPayment(isRefreshByOrder: boolean): void {
    this.markPlannedPaymentsAsLoaded(false);
    if (!isRefreshByOrder){
      this.refreshAllStatisticsEvent.next(true);
    }
    this.getPlannedPayments();
  }

  protected displayMobileView(): boolean {
    return this.pageWidth <= this.appConfig.pageMobileWidth ||
      this.componentDimension.width <= this.appConfig.componentMobileWidth;
  }

  protected patchPlannedPaymentStatus(isPaid: boolean, idPlannedPayment: string): void {
    this.plannedPaymentStatusLoader = true;
    this.subscriptions.push(
      this.httpService.patchPaymentStatus(
        idPlannedPayment,
        {
          isPaid: isPaid
        } as PaymentStatusDto,
        true
      ).subscribe({
        next: (): void => {
          for (let plannedPayment of this.plannedPaymentsDto!) {
            if (plannedPayment.id == idPlannedPayment) {
              plannedPayment.isPaid = isPaid;
              plannedPayment.dateUpdated = new Date();
            }
          }
        },
        error: (err): void => {
          const response = getErrorResponse(err);
          this.errorModal.open(response);
          this.plannedPaymentStatusLoader = false;
        },
        complete: (): void => {
          this.plannedPaymentStatusLoader = false;
          this.refreshSummaryEvent.emit(true);
        }
      })
    )
  }

  protected onPlannedPaymentSelect(plannedPayment: GetPlannedPaymentDto): void {
    if (this.selectedPlannedPayment !== plannedPayment) {
      this.getPlannedPaymentAssignment(plannedPayment.id);
    }
    this.selectedPlannedPayment = plannedPayment;
  }

  private getPlannedPayments(): void {
    this.subscriptions.push(
      this.httpService.getBudgetPayments<GetPlannedPaymentDto[]>(
        this.idBudget,
        this.requestParams,
        true).subscribe({
        next: (response: HttpResponse<GetPlannedPaymentDto[]>): void => {
          this.plannedPaymentsDto = response.body;
          this.paymentResponseModel.statusCode = response.status;
          if (this.plannedPaymentsDto!.length >= this.requestParams.pageSize || this.totalPages > 1) {
            this.getPlannedPaymentTotalPages();
          }
        }, error: (err): void => {
          const response = getErrorResponse(err);
          this.paymentResponseModel = response;
          if (response.statusCode != 404) {
            this.errorModal.open(response);
          }
          this.markPlannedPaymentsAsLoaded(true);
          this.refreshAllStatisticsEvent.next(false);
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
        this.idBudget,
        this.requestParams).subscribe({
        next: (response: HttpResponse<PageDto>): void => {
          this.totalPages = response.body!.pages;
        }
      })
    )
  }

  private getPlannedPaymentAssignment(idPayment: string): void {
    this.subscriptions.push(
      this.httpService.getPaymentAssignment(
        idPayment,
        true).subscribe({
        next: (response: HttpResponse<GetPaymentAssignmentDto>): void => {
          for (let payment of this.plannedPaymentsDto!) {
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

  private setComponentDimensions(): void {
    this.componentDimension.width = this.element.nativeElement.offsetWidth;
    this.componentDimension.height = this.element.nativeElement.offsetHeight;
  }


  private defaultOrderParams(): void {
    this.requestParams.orderBy =
      this.appConfig.request.order.plannedPaymentTypes[0].value;
    this.requestParams.order =
      this.appConfig.request.order.orderDirections[0].value;
  }
}
