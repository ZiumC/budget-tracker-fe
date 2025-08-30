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
import {GetBudgetDto, GetBudgetStatsDto} from "../../../models/dto/budget.model.dto";
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
import {
  Loaders,
  StatisticsTab, DataResult, StatisticDetails
} from "../../../models/components/budget.component";
import {
  formatPercent,
  getPieChartClassFor,
  incomeToPieChartData,
  plannedPaymentToPieChartData,
  regularPaymentToPieChartData, budgetUsageToHorizontalChartDataResult,
  transformToIncomeDetails,
  transformToPlannedDetails,
  transformToRegularDetails, getPieChartGridClassFor,

} from "../../../util/chart.utils";
import {add, format} from "../../../util/number.util";
import {getStatisticType, StatisticType} from "../../../util/statistic.utils";
import {HorizontalChartData,} from "../../../models/charts.model";

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
  protected appConfig: AppConfig;
  protected budgetDto: GetBudgetDto | null;
  protected subscriptions: Subscription[];
  protected responseModels: BudgetResponse;
  protected idBudget: string;
  protected loaders: Loaders;
  protected statisticDetails: StatisticDetails;
  protected chartData: DataResult = new DataResult();
  protected currentTab: StatisticsTab;
  protected mockData: any;
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
    this.mockData = [
      {
        name: "Needs",
        value: 40632,
      },
      {
        name: "Wants",
        value: 50000,
      },
      {
        name: "Savings",
        value: 36745,
      }
    ];
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
    this.chartData.horizontalChart = new HorizontalChartData();

    this.statisticDetails = {
      budget: new GetBudgetStatsDto(),
      income: [],
      planned: [],
      regular: []
    }

    this.loaders = new Loaders();

    this.responseModels = {
      budget: new ResponseModel(),
      incomes: new ResponseModel(),
      payments: new ResponseModel(),
      paymentStatus: new ResponseModel(),
      budgetStats: new ResponseModel(),
      incomeStats: new ResponseModel(),
      regularStats: new ResponseModel(),
      plannedStats: new ResponseModel()
    };

    this.getBudgetStats();


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


  protected onRefreshEvent(refresh: boolean): void {
    if (refresh) {
      this.getBudgetStats();
    }
  }

  protected computePercent(moneyCategory: number): string {
    let totalMoney = new BigNumber(0);
    for (let money of this.chartData.horizontalChart.moneyLeftData[0].series) {
      totalMoney = add(totalMoney, new BigNumber(money.value));
    }
    return format(new BigNumber((moneyCategory / totalMoney.toNumber()) * 100)) + "%";
  }

  private getBudgetStats(): void {
    this.markStatsAsLoaded(false);

    const budgetRequestStats = [
      this.httpService.getBudgetStats(this.idBudget),
      this.httpService.getIncomeCategoriesStats(this.idBudget),
      this.httpService.getRegularPaymentCategoriesStats(this.idBudget),
      this.httpService.getPlannedPaymentCategoriesStats(this.idBudget)
    ];

    this.subscriptions.push(
      forkJoin(budgetRequestStats).subscribe({
        next: (responses): void => {
          for (let response of responses) {
            switch (getStatisticType(response.body)) {
              case StatisticType.BUDGET:
                this.statisticDetails.budget = response.body as GetBudgetStatsDto;
                this.responseModels.budgetStats.statusCode = response.status;
                break;
              case StatisticType.INCOME:
                let incomeStats = response.body as GetIncomeStatsDto;
                this.statisticDetails.income = transformToIncomeDetails(incomeStats);
                this.responseModels.incomeStats.statusCode = response.status;
                break;
              case StatisticType.PLANNED_PAYMENT:
                let plannedStats = response.body as GetPlannedPaymentStatsDto;
                this.statisticDetails.planned = transformToPlannedDetails(plannedStats);
                this.responseModels.plannedStats.statusCode = response.status;
                break;
              case StatisticType.REGULAR_PAYMENT:
                let regularStats = response.body as GetRegularPaymentStatsDto;
                this.statisticDetails.regular = transformToRegularDetails(regularStats);
                this.responseModels.regularStats.statusCode = response.status;
                break;
              default:
                break;
            }
          }
        },
        complete: (): void => {
          this.transformToChartData();
          this.markStatsAsLoaded(true);
        }
      })
    )
  }

  private transformToChartData(): void {
    this.chartData.pieChart.income = incomeToPieChartData(this.statisticDetails.income);
    this.chartData.pieChart.planned = plannedPaymentToPieChartData(this.statisticDetails.planned);
    this.chartData.pieChart.regular = regularPaymentToPieChartData(this.statisticDetails.regular);
    this.chartData.horizontalChart.moneyLeftData = budgetUsageToHorizontalChartDataResult(this.statisticDetails);
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
