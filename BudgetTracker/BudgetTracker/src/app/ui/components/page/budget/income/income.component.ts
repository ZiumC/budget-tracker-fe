import {
  Component, Input, OnDestroy, OnInit,
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
import {generateErrorModel} from "../../../../../util/http.util";
import {TimerUtils} from "../../../../../util/timer.utils";
import {OrderOptions} from "../../../shared/order/order.component";
import {PageDto} from "../../../../../models/dto/page.model.dto";

@Component({
  selector: 'app-income',
  templateUrl: './income.component.html',
  styleUrl: './income.component.css'
})
export class IncomeComponent implements OnInit, OnDestroy {
  @ViewChild('errorModal') errorModal: any;
  @ViewChild('incomeModal') incomeModal: any;
  @Input() idBudget: string;
  protected readonly formatString = formatString;
  protected readonly DateUtils = DateUtil;
  protected readonly format = format;
  protected readonly SpinnerSize = SpinnerSize;
  protected subscriptions: Subscription[];
  protected appConfig: AppConfig;
  protected incomesDto: GetIncomeDto[] | null;
  protected selectedIncome: GetIncomeDto;
  protected incomeTotalPages: number | undefined;
  protected incomeRequestModel: RequestModel;
  protected incomeResponseModel: ResponseModel;
  protected incomeLoader: boolean;
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

    this.incomeResponseModel = new ResponseModel();

    this.innerWidth = window.innerWidth;
    this.subscriptions = [];

    this.incomeRequestModel = new RequestModel({
      page: this.appConfig.request.pagination.defaultPage,
      pageSize: this.appConfig.request.pagination.defaultPageSizeOptions[0],
    })

    this.getIncomes();
    this.defaultOrderParams();
    this.getIncomeTotalPages();
  }

  openModal(): void {
    this.incomeModal.open();
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
    this.getIncomes();
  }

  private getIncomes(): void {
    this.subscriptions.push(
      this.httpService.getBudgetIncomes(
        this.incomeRequestModel,
        this.idBudget).subscribe({
        next: (response: HttpResponse<GetIncomeDto[]>): void => {
          this.incomesDto = response.body;
          this.incomeResponseModel.statusCode = response.status;
        },
        error: (err): void => {
          const response = generateErrorModel(err);
          this.incomeResponseModel = response;
          if (response.statusCode != 404) {
            this.errorModal.open(response);
          }
          this.markIncomesAsLoaded(true);
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
        this.incomeRequestModel,
        this.idBudget).subscribe({
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
}
