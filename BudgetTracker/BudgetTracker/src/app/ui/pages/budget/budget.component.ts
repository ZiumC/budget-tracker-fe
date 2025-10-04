import {Component, HostListener, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {SpinnerSize} from "../../components/shared/spinner/spinner.component";
import BigNumber from "bignumber.js";
import {forkJoin, Subscription} from "rxjs";
import {BudgetResponse, ResponseModel} from "../../../models/response.model";
import {DateUtil} from '../../../util/date.util';
import {HttpService} from "../../../services/http/http.service";
import {ActivatedRoute, Params, Router} from "@angular/router";
import {HttpResponse} from "@angular/common/http";
import {SubscriptionUtils} from "../../../util/subscription.utils";
import {GetBudgetDto, GetBudgetGeneralCategoryDto, GetBudgetSummaryDto} from "../../../models/dto/budget.model.dto";
import {AppConfig} from "../../../models/config/config";
import {ConfigService} from "../../../services/config/config.service";
import {formatString} from "../../../util/string.utils";
import {generateErrorModel} from "../../../util/http.util";
import {TimerUtils} from "../../../util/timer.utils";
import {LegendPosition} from "@swimlane/ngx-charts";
import {
  GetIncomeStatsDto,
  GetPlannedPaymentStatsDto,
  GetRegularPaymentStatsDto
} from "../../../models/statistics.model";
import {ErrorImage, ErrorType} from "../../../models/error.model";
import {DataResult, Loaders, StatisticsDto, StatisticsTab} from "../../../models/components/budget.component";
import {
  budgetUsageToHorizontalChartData,
  formatPercent, generalCategoriesToPieChartGrid,
  getPieChartClassFor,
  getPieChartGridClassFor,
  incomeToPieChartData,
  plannedPaymentToPieChartData,
  regularPaymentToPieChartData,
  transformToIncomeDto,
  transformToPlannedDto,
  transformToRegularDto,
} from "../../../util/chart.utils";
import {add, format, subtract} from "../../../util/number.util";
import {getStatisticType, StatisticType} from "../../../util/statistic.utils";

@Component({
  selector: 'app-budget',
  templateUrl: './budget.component.html',
  styleUrl: './budget.component.css'
})
export class BudgetComponent implements OnInit, OnDestroy {
  @ViewChild('errorModal') errorModal: any;
  protected readonly DateUtils = DateUtil;
  protected readonly SpinnerSize = SpinnerSize;
  protected readonly LegendPosition = LegendPosition;
  protected readonly ErrorType = ErrorType;
  protected readonly ErrorImage = ErrorImage;
  protected readonly BudgetTabs = StatisticsTab;
  protected readonly format = format;
  protected readonly formatString = formatString;
  protected readonly formatPercent = formatPercent;
  protected readonly BigNumber = BigNumber;
  protected readonly getPieChartClassFor = getPieChartClassFor;
  protected readonly getPieChartGridClassFor = getPieChartGridClassFor;
  protected readonly subtract = subtract;
  protected appConfig: AppConfig;
  protected budgetDto: GetBudgetDto | null;
  protected subscriptions: Subscription[];
  protected responseModels: BudgetResponse;
  protected idBudget: string;
  protected loaders: Loaders;
  protected statisticsDto: StatisticsDto;
  protected chartData: DataResult = new DataResult();
  protected currentTab: StatisticsTab;
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

    this.innerWidth = window.innerWidth;
    this.subscriptions = [];

    this.activatedRoute.queryParams.subscribe((params: Params): void => {
      this.idBudget = params['id'];
    });

    this.currentTab = StatisticsTab.IncomeTab;
    this.chartData.pieChart = {
      income: [],
      planned: [],
      regular: []
    }

    this.chartData.pieChartGrid = {
      generalCategories: []
    }

    this.chartData.horizontalChart = {
      moneyLeftData: []
    }

    this.statisticsDto = {
      budgetSummary: null,
      generalCategories: null,
      income: [],
      planned: [],
      regular: []
    }

    this.loaders = {
      budget: false,
      statistics: false
    }

    this.responseModels = {
      budget: new ResponseModel(),
      incomes: new ResponseModel(),
      payments: new ResponseModel(),
      paymentStatus: new ResponseModel(),
      incomeStats: new ResponseModel(),
      regularStats: new ResponseModel(),
      plannedStats: new ResponseModel(),
      budgetSummary: new ResponseModel()
    };

    this.getBudgetSummary();
    this.getBudgetGeneralCategoryStats();
    this.getBudgetCategoryStats();

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

  protected onRefreshStatisticsEvent(refresh: boolean, allStatistics: boolean): void {
    if (refresh) {
      if (allStatistics) {
        this.getBudgetCategoryStats();
        this.getBudgetSummary();
        this.getBudgetGeneralCategoryStats();
      } else {
        this.getBudgetSummary();
        this.getBudgetGeneralCategoryStats();
      }
    }
  }

  protected computePercent(moneyCategory: number): string {
    let totalMoney = new BigNumber(0);
    for (let money of this.chartData.horizontalChart.moneyLeftData[0].series) {
      totalMoney = add(totalMoney, new BigNumber(money.value));
    }
    return format(new BigNumber((moneyCategory / totalMoney.toNumber()) * 100)) + "%";
  }

  private getBudgetGeneralCategoryStats(): void {
    this.subscriptions.push(
      this.httpService.getBudgetGeneralCategories(this.idBudget).subscribe({
        next: (response: HttpResponse<GetBudgetGeneralCategoryDto>): void => {
          this.statisticsDto.generalCategories = response.body;
        },
        error: (): void => {
          this.chartData.pieChartGrid.generalCategories = [];
        },
        complete: (): void => {
          this.chartData.pieChartGrid.generalCategories = generalCategoriesToPieChartGrid(this.statisticsDto.generalCategories);
        }
      })
    );
  }

  private getBudgetSummary(): void {
    this.subscriptions.push(
      this.httpService.getBudgetSummary(this.idBudget).subscribe({
        next: (response: HttpResponse<GetBudgetSummaryDto>): void => {
          this.statisticsDto.budgetSummary = response.body;
          this.responseModels.budgetSummary.statusCode = response.status;
        },
        error: (err): void => {
          this.chartData.horizontalChart.moneyLeftData = [];
          this.responseModels.budgetSummary.statusCode = err.status;
        },
        complete: (): void => {
          this.chartData.horizontalChart.moneyLeftData = budgetUsageToHorizontalChartData(this.statisticsDto.budgetSummary);
        }
      })
    )
  }

  private getBudgetCategoryStats(): void {
    this.markStatsAsLoaded(false);

    const budgetRequestStats = [
      this.httpService.getIncomeCategoriesStats(this.idBudget),
      this.httpService.getRegularPaymentCategoriesStats(this.idBudget),
      this.httpService.getPlannedPaymentCategoriesStats(this.idBudget)
    ];

    this.subscriptions.push(
      forkJoin(budgetRequestStats).subscribe({
        next: (responses): void => {
          for (let response of responses) {
            switch (getStatisticType(response.body)) {
              case StatisticType.INCOME:
                let incomeStats = response.body as GetIncomeStatsDto;
                this.statisticsDto.income = transformToIncomeDto(incomeStats);
                this.responseModels.incomeStats.statusCode = response.status;
                break;
              case StatisticType.PLANNED_PAYMENT:
                let plannedStats = response.body as GetPlannedPaymentStatsDto;
                this.statisticsDto.planned = transformToPlannedDto(plannedStats);
                this.responseModels.plannedStats.statusCode = response.status;
                break;
              case StatisticType.REGULAR_PAYMENT:
                let regularStats = response.body as GetRegularPaymentStatsDto;
                this.statisticsDto.regular = transformToRegularDto(regularStats);
                this.responseModels.regularStats.statusCode = response.status;
                break;
              default:
                throw Error("Unknown statistic type");
            }
          }
        },
        error: (err): void => {
          if (err.status == 404) {
            this.chartData.pieChart.income = [];
            this.chartData.pieChart.planned = [];
            this.chartData.pieChart.regular = [];
          }
          this.markStatsAsLoaded(true);
        },
        complete: (): void => {
          this.chartData.pieChart.income = incomeToPieChartData(this.statisticsDto.income);
          this.chartData.pieChart.planned = plannedPaymentToPieChartData(this.statisticsDto.planned);
          this.chartData.pieChart.regular = regularPaymentToPieChartData(this.statisticsDto.regular);
          this.markStatsAsLoaded(true);
        }
      })
    )
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

  private markStatsAsLoaded(isLoaded: boolean): void {
    if (isLoaded) {
      new TimerUtils(this.appConfig.animation.duration.default).start()
        .subscribe(finished => {
          if (finished) {
            this.loaders.statistics = isLoaded;
          }
        });
    } else {
      this.loaders.statistics = isLoaded;
    }
  }
}
