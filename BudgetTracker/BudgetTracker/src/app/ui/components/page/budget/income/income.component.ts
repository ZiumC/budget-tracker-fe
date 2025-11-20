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
import {formatString} from "../../../../../util/string.utils";
import {DateUtil} from "../../../../../util/date.util";
import {format} from "../../../../../util/number.util";
import {HttpService} from "../../../../../services/http/http.service";
import {ConfigService} from "../../../../../services/config/config.service";
import {Subscription} from "rxjs";
import {SubscriptionUtils} from "../../../../../util/subscription.utils";
import {AppConfig} from "../../../../../models/config/config";
import {GetIncomeDto} from "../../../../../models/dto/income.model.dto";
import {RequestModel} from "../../../../../models/request.model";
import {ResponseModel} from "../../../../../models/response.model";
import {SpinnerSize} from '../../../shared/spinner/spinner.component';
import {HttpResponse} from "@angular/common/http";
import {getErrorResponse} from "../../../../../util/http.util";
import {TimerUtils} from "../../../../../util/timer.utils";
import {OrderOptions} from "../../../shared/order/order.component";
import {PageDto} from "../../../../../models/dto/page.model.dto";
import {GetIncomeAssignmentDto} from "../../../../../models/dto/assignment.model.dto";
import {ErrorImage, ErrorType} from "../../../../../models/error.model";
import {BudgetTab} from "../../../../../models/components/budget.component";

@Component({
  selector: 'app-income',
  templateUrl: './income.component.html',
  styleUrl: './income.component.css'
})
export class IncomeComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('incomeComponentPage') element: ElementRef;
  @ViewChild('errorModal') errorModal: any;
  @ViewChild('incomeModal') incomeModal: any;
  @Input() idBudget: string;
  @Input() selectedTab: BudgetTab;
  @Output() refreshEvent = new EventEmitter<boolean>();
  private componentDimension = {width: 0, height: 0};
  private pageWidth: number;
  protected readonly formatString = formatString;
  protected readonly DateUtils = DateUtil;
  protected readonly format = format;
  protected readonly SpinnerSize = SpinnerSize;
  protected readonly ErrorImage = ErrorImage;
  protected readonly ErrorType = ErrorType;
  protected subscriptions: Subscription[];
  protected appConfig: AppConfig;
  protected incomesDto: GetIncomeDto[] | null;
  protected selectedIncome: GetIncomeDto;
  protected incomeTotalPages: number | undefined;
  protected incomeRequestModel: RequestModel;
  protected incomeResponseModel: ResponseModel;
  protected requiredStatusCode: number;
  protected assignmentStatusCode: number = 0;
  protected incomeLoader: boolean;

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

    this.incomeResponseModel = new ResponseModel();
    this.requiredStatusCode = this.appConfig.response.required.incomeStatus;
    this.pageWidth = window.innerWidth;
    this.subscriptions = [];

    this.incomeRequestModel = new RequestModel({
      page: this.appConfig.request.pagination.defaultPage,
      pageSize: this.appConfig.request.pagination.defaultPageSizeOptions[0],
    })

    if (this.selectedTab == BudgetTab.IncomeTab){
      this.getIncomes();
    }

    this.defaultOrderParams();
  }

  openModal(): void {
    this.incomeModal.open();
  }

  @HostListener('window:resize', ['$event'])
  onResize(): void {
    this.pageWidth = window.innerWidth;
    this.setComponentDimensions();
  }

  ngOnDestroy(): void {
    SubscriptionUtils.unsubscribeAll(this.subscriptions);
  }

  protected onPageSizeEvent(pageSize: number): void {
    this.incomeRequestModel.page = this.appConfig.request.pagination.defaultPage;
    this.incomeRequestModel.pageSize = pageSize;
    this.onRefreshIncome();
  }

  protected onPageEvent(page: number): void {
    this.incomeRequestModel.page = page;
    this.onRefreshIncome();
  }

  protected onOrderEvent(orderOptions: OrderOptions): void {
    if (orderOptions.orderType.applyForApi) {
      this.incomeRequestModel.orderBy = orderOptions.orderType.value;
      if (orderOptions.orderType.displayDirections) {
        this.incomeRequestModel.order = orderOptions.orderDirection.value;
      } else {
        this.incomeRequestModel.order = null;
      }
      this.onRefreshIncome();
    }
  }

  protected onRefreshIncome(): void {
    this.markIncomesAsLoaded(false);
    this.refreshEvent.next(true);
    this.getIncomes();
  }

  protected displayMobileView(): boolean {
    return this.pageWidth <= this.appConfig.pageMobileWidth ||
      this.componentDimension.width <= this.appConfig.componentMobileWidth;
  }

  protected onIncomeSelect(income: GetIncomeDto): void {
    if (this.selectedIncome !== income) {
      this.getIncomeAssignment(income.id);
    }
    this.selectedIncome = income;
  }

  private getIncomes(): void {
    this.subscriptions.push(
      this.httpService.getBudgetIncomes(
        this.idBudget,
        this.incomeRequestModel).subscribe({
        next: (response: HttpResponse<GetIncomeDto[]>): void => {
          this.incomesDto = response.body;
          this.incomeResponseModel.statusCode = response.status;
        },
        error: (err): void => {
          const response = getErrorResponse(err);
          this.incomeResponseModel = response;
          if (response.statusCode != 404) {
            this.errorModal.open(response);
          }
          this.markIncomesAsLoaded(true);
          this.refreshEvent.next(false);
        },
        complete: (): void => {
          this.getIncomeTotalPages();
          this.markIncomesAsLoaded(true);
        }
      })
    )
  }

  private getIncomeTotalPages(): void {
    this.subscriptions.push(
      this.httpService.getIncomePages(
        this.idBudget,
        this.incomeRequestModel).subscribe({
        next: (response: HttpResponse<PageDto>): void => {
          this.incomeTotalPages = response.body!.pages;
        }
      })
    )
  }

  private markIncomesAsLoaded(isLoaded: boolean): void {
    if (isLoaded) {
      new TimerUtils(this.appConfig.animation.duration.default).start()
        .subscribe(finished => {
          if (finished) {
            this.incomeLoader = isLoaded;
          }
        });
    } else {
      this.incomeLoader = isLoaded;
    }
  }

  private defaultOrderParams(): void {
    this.incomeRequestModel.orderBy =
      this.appConfig.request.order.incomeTypes[0].value;
    this.incomeRequestModel.order =
      this.appConfig.request.order.orderDirections[0].value;
  }

  private setComponentDimensions(): void {
    this.componentDimension.width = this.element.nativeElement.offsetWidth;
    this.componentDimension.height = this.element.nativeElement.offsetHeight;
  }

  private getIncomeAssignment(idIncome: string): void {
    this.subscriptions.push(
      this.httpService.getIncomeAssignment(
        idIncome).subscribe({
        next: (response: HttpResponse<GetIncomeAssignmentDto>): void => {
          for (let income of this.incomesDto!) {
            if (income.id == idIncome) {
              income.assignment = response.body;
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
}
