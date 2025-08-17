import {Component, HostListener, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {SpinnerSize} from "../../components/shared/spinner/spinner.component";
import BigNumber from "bignumber.js";
import {Subscription} from "rxjs";
import {BudgetResponse, ResponseModel} from "../../../models/response.model";
import {DateUtil} from '../../../util/date.util';
import {HttpService} from "../../../services/http/http.service";
import {ActivatedRoute, Params, Router} from "@angular/router";
import {HttpResponse} from "@angular/common/http";
import {SubscriptionUtils} from "../../../util/subscription.utils";
import {add, format, subtract} from "../../../util/number.util";
import {GetBudgetDto, GetBudgetStatsDto} from "../../../models/dto/budget.model.dto";
import {AppConfig} from "../../../models/config/config";
import {ConfigService} from "../../../services/config/config.service";
import {formatString} from "../../../util/string.utils";
import {generateErrorModel} from "../../../util/http.util";
import {TimerUtils} from "../../../util/timer.utils";
import {LegendPosition} from "@swimlane/ngx-charts";
import {
  GetCategoryStatsDto,
  StatisticsDataResult
} from "../../../models/dto/statistics.model.dto";
import {ErrorImage, ErrorType} from "../../../models/error.model";

@Component({
  selector: 'app-budget',
  templateUrl: './budget.component.html',
  styleUrl: './budget.component.css'
})
export class BudgetComponent implements OnInit, OnDestroy {
  @ViewChild('errorModal') errorModal: any;
  protected readonly format = format;
  protected readonly formatString = formatString;
  protected readonly DateUtils = DateUtil;
  protected readonly SpinnerSize = SpinnerSize;
  protected readonly LegendPosition = LegendPosition;
  protected readonly ErrorType = ErrorType;
  protected readonly ErrorImage = ErrorImage;
  protected appConfig: AppConfig;
  protected budgetDto: GetBudgetDto | null;
  protected budgetStatsDto: GetBudgetStatsDto | null;
  protected subscriptions: Subscription[];
  protected responseModels: BudgetResponse;
  protected idBudget: string;
  protected budgetLoader: boolean;
  protected incomeStatsLoader: boolean;
  protected regularPaymentStatsLoader: boolean;
  protected incomeStatsData: StatisticsDataResult[] = [];
  protected regularPaymentStatsData: StatisticsDataResult[] = [];
  protected currentTabId: number;
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
    this.currentTabId = 1;
    const appCfg = this.configService.getAppConfig();

    if (appCfg) {
      this.appConfig = appCfg;
    } else {
      throw Error("Config not provided")
    }
    this.responseModels = {
      budget: new ResponseModel(),
      incomes: new ResponseModel(),
      payments: new ResponseModel(),
      paymentStatus: new ResponseModel(),
      budgetStats: new ResponseModel(),
      incomeStats: new ResponseModel(),
      regularPaymentStats: new ResponseModel()
    };

    this.innerWidth = window.innerWidth;

    this.subscriptions = [];
    this.activatedRoute.queryParams.subscribe((params: Params): void => {

      this.idBudget = params['id'];
    });

    this.getBudgetStatistics();
    this.getBudgetIncomeStats();
    this.getBudgetRegularPaymentStats();

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
  }

  @HostListener('window:resize', ['$event'])
  onResize(): void {
    this.innerWidth = window.innerWidth;
  }

  protected isMobileView(): boolean {
    return innerWidth <= this.appConfig.pageMobileWidth;
  }

  protected onRedirectToIndex(): void {
    this.router.navigate(['/']);
  }

  protected getBudgetStatistics(): void {
    this.subscriptions.push(
      this.httpService.getBudgetStats(this.idBudget).subscribe({
        next: (response: HttpResponse<GetBudgetStatsDto>): void => {
          this.budgetStatsDto = response.body;
          this.responseModels.budgetStats.statusCode = response.status;
        },
        error: (err): void => {
          this.responseModels.budgetStats = generateErrorModel(err);
        }
      })
    )
  }

  protected onRefreshEvent(refresh: boolean): void {
    if (refresh) {
      this.getBudgetStatistics();
    }
  }

  protected onIncomeStats(): void {
    this.currentTabId = 1;
  }

  protected onPaymentStats(isPlanned: boolean): void {
    this.currentTabId = isPlanned ? 2 : 3;
  }

  protected onDataSize(data: StatisticsDataResult[]): string {
    if (data.length > 0 && data.length <= 0) {
      return this.isMobileView() ? 'mobile-doughnut-height' : 'doughnut-height-s';
    } else if (data.length > 8 && data.length <= 15) {
      return this.isMobileView() ? 'mobile-doughnut-height' : 'doughnut-height-m';
    } else if (data.length > 15) {
      return this.isMobileView() ? 'mobile-doughnut-height' : 'doughnut-height-l';
    } else {
      return '';
    }
  }

  private markBudgetAsLoaded(isLoaded: boolean): void {
    if (isLoaded) {
      new TimerUtils(this.appConfig.animation.duration.default).start()
        .subscribe(finished => {
          if (finished) {
            this.budgetLoader = isLoaded;
          }
        });
    } else {
      this.budgetLoader = isLoaded;
    }
  }

  private markIncomeStatsAsLoaded(isLoaded: boolean): void {
    if (isLoaded) {
      new TimerUtils(this.appConfig.animation.duration.default).start()
        .subscribe(finished => {
          if (finished) {
            this.incomeStatsLoader = isLoaded;
          }
        });
    } else {
      this.incomeStatsLoader = isLoaded;
    }
  }

  private markRegularPaymentStatsAsLoaded(isLoaded: boolean): void {
    if (isLoaded) {
      new TimerUtils(this.appConfig.animation.duration.default).start()
        .subscribe(finished => {
          if (finished) {
            this.regularPaymentStatsLoader = isLoaded;
          }
        });
    } else {
      this.regularPaymentStatsLoader = isLoaded;
    }
  }


  private getBudgetIncomeStats(): void {
    this.markIncomeStatsAsLoaded(false);
    let stats: GetCategoryStatsDto | null;
    this.subscriptions.push(
      this.httpService.getIncomeCategoriesStats(this.idBudget).subscribe({
        next: (response: HttpResponse<GetCategoryStatsDto>): void => {
          stats = response.body;
          this.responseModels.incomeStats.statusCode = response.status;
          this.transformToChartDataResult(stats);
        },
        error: (err): void => {
          this.responseModels.incomeStats = generateErrorModel(err);
          this.markIncomeStatsAsLoaded(true);
        },
        complete: (): void => {
          this.markIncomeStatsAsLoaded(true);
        }
      })
    );
  }

  private getBudgetRegularPaymentStats(): void {
    this.markRegularPaymentStatsAsLoaded(false);
    let stats: GetCategoryStatsDto | null;
    this.subscriptions.push(
      this.httpService.getRegularPaymentCategoriesStats(this.idBudget).subscribe({
        next: (response: HttpResponse<GetCategoryStatsDto>): void => {
          stats = response.body;
          this.responseModels.regularPaymentStats.statusCode = response.status;
          this.transformToChartDataResult(stats);
        },
        error: (err): void => {
          this.responseModels.regularPaymentStats = generateErrorModel(err);
          this.markRegularPaymentStatsAsLoaded(true);
        },
        complete: (): void => {
          this.markRegularPaymentStatsAsLoaded(true);
        }
      })
    );
  }

  private transformToChartDataResult(data: GetCategoryStatsDto | null): void {
    if (data) {
      let totalSavings = new BigNumber(0);
      let totalRefund = new BigNumber(0);

      Object.entries(data).forEach(([key, value]): void => {
        if ('IncomeSum' in value && 'SavingsSum' in value) {
          totalSavings = add(new BigNumber(totalSavings), new BigNumber(value.SavingsSum));
          this.incomeStatsData.push({
            name: key,
            value: subtract(new BigNumber(value.IncomeSum), new BigNumber(value.SavingsSum)).toNumber()
          } as StatisticsDataResult);
        } else if ('PriceSum' in value && 'RefundSum' in value) {
          totalRefund = add(new BigNumber(totalRefund), new BigNumber(value.RefundSum));
          this.regularPaymentStatsData.push({
            name: key,
            value: subtract(new BigNumber(value.PriceSum), new BigNumber(value.RefundSum)).toNumber()
          } as StatisticsDataResult);
        }
      });

      if (totalSavings.toNumber() > 0) {
        this.incomeStatsData.push({
          name: 'Savings',
          value: totalSavings.toNumber()
        } as StatisticsDataResult);
      }

      if (totalRefund.toNumber() > 0) {
        this.regularPaymentStatsData.push({
          name: 'Refund',
          value: totalRefund.toNumber()
        } as StatisticsDataResult)
      }
    }
  }
}
