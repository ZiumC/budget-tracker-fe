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
import {DataResult, Loaders, StatisticsTab} from "../../../models/components/budget.component";
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
  protected budgetSummary: GetBudgetSummaryDto | null;
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

    // this.statisticsDto = {
    //   budgetSummary: null,
    //   generalCategories: null,
    //   income: [],
    //   planned: [],
    //   regular: []
    // }

    this.loaders = {
      budget: false,
      incomeCategories: false,
      regularPaymentCategories: false,
      plannedPaymentCategories: false,
      budgetGeneralCategories: false
    }

    this.responseModels = {
      budget: new ResponseModel(),
      incomes: new ResponseModel(),
      payments: new ResponseModel(),
      paymentStatus: new ResponseModel(),
      incomeStats: new ResponseModel(),
      regularStats: new ResponseModel(),
      plannedStats: new ResponseModel(),
      budgetStats: new ResponseModel(),
      budgetSummary: new ResponseModel()
    };

    this.getBudgetSummary();
    this.getBudgetGeneralCategoryStats();
    this.getIncomeCategoryStats();
    this.getRegularCategoryStats();
    this.getPlannedCategoryStats();

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
        this.getIncomeCategoryStats();
        this.getRegularCategoryStats();
        this.getPlannedCategoryStats();
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
    this.markBudgetGeneralCategoryStatsAsLoaded(false);
    this.subscriptions.push(
      this.httpService.getBudgetGeneralCategories(this.idBudget).subscribe({
        next: (response: HttpResponse<GetBudgetGeneralCategoryDto>): void => {
          const responseData = response.body;
          this.responseModels.budgetStats.statusCode = response.status;
          this.chartData.pieChartGrid.generalCategories = generalCategoriesToPieChartGrid(responseData);
          this.markBudgetGeneralCategoryStatsAsLoaded(true);
        },
        error: (err): void => {
          this.chartData.pieChartGrid.generalCategories = [];
          this.responseModels.budgetStats.statusCode = err.status;
          this.markBudgetGeneralCategoryStatsAsLoaded(true);
        }
      })
    );
  }

  private getBudgetSummary(): void {
    this.subscriptions.push(
      this.httpService.getBudgetSummary(this.idBudget).subscribe({
        next: (response: HttpResponse<GetBudgetSummaryDto>): void => {
          const responseData = response.body;
          this.budgetSummary = responseData;
          this.responseModels.budgetSummary.statusCode = response.status;
          this.chartData.horizontalChart.moneyLeftData = budgetUsageToHorizontalChartData(responseData);
        },
        error: (err): void => {
          this.chartData.horizontalChart.moneyLeftData = [];
          this.responseModels.budgetSummary.statusCode = err.status;
        }
      })
    );
  }

  private getIncomeCategoryStats(): void {
    this.markIncomeCategoryStatsAsLoaded(false);
    this.subscriptions.push(
      this.httpService.getIncomeCategoriesStats(this.idBudget).subscribe({
        next: (response: HttpResponse<GetIncomeStatsDto>): void => {
          this.responseModels.incomeStats.statusCode = response.status;
          const responseData = transformToIncomeDto(response.body);
          this.chartData.pieChart.income = incomeToPieChartData(responseData);
          this.markIncomeCategoryStatsAsLoaded(true);
        },
        error: (err): void => {
          this.chartData.pieChart.income = [];
          this.responseModels.incomeStats.statusCode = err.status;
          this.markIncomeCategoryStatsAsLoaded(true);
        }
      })
    );
  }

  private getRegularCategoryStats(): void {
    this.markRegularCategoryStatsAsLoaded(false);
    this.subscriptions.push(
      this.httpService.getRegularPaymentCategoriesStats(this.idBudget).subscribe({
        next: (response: HttpResponse<GetRegularPaymentStatsDto>): void => {
          this.responseModels.regularStats.statusCode = response.status;
          const responseData = transformToRegularDto(response.body);
          this.chartData.pieChart.regular = regularPaymentToPieChartData(responseData);
          this.markRegularCategoryStatsAsLoaded(true);
        },
        error: (err): void => {
          this.chartData.pieChart.regular = [];
          this.responseModels.regularStats.statusCode = err.status;
          this.markRegularCategoryStatsAsLoaded(true);
        }
      })
    );
  }

  private getPlannedCategoryStats(): void {
    this.markPlannedCategoryStatsAsLoaded(false);
    this.subscriptions.push(
      this.httpService.getPlannedPaymentCategoriesStats(this.idBudget).subscribe({
        next: (response: HttpResponse<GetPlannedPaymentStatsDto>): void => {
          this.responseModels.plannedStats.statusCode = response.status;
          const responseData = transformToPlannedDto(response.body);
          this.chartData.pieChart.planned = plannedPaymentToPieChartData(responseData);
          this.markPlannedCategoryStatsAsLoaded(true);
        },
        error: (err): void => {
          this.chartData.pieChart.planned = [];
          this.responseModels.plannedStats.statusCode = err.status;
          this.markPlannedCategoryStatsAsLoaded(true);
        }
      })
    );
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

  private markIncomeCategoryStatsAsLoaded(isLoaded: boolean): void {
    if (isLoaded) {
      new TimerUtils(this.appConfig.animation.duration.default).start()
        .subscribe(finished => {
          if (finished) {
            this.loaders.incomeCategories = isLoaded;
          }
        });
    } else {
      this.loaders.incomeCategories = isLoaded;
    }
  }

  private markRegularCategoryStatsAsLoaded(isLoaded: boolean): void {
    if (isLoaded) {
      new TimerUtils(this.appConfig.animation.duration.default).start()
        .subscribe(finished => {
          if (finished) {
            this.loaders.regularPaymentCategories = isLoaded;
          }
        });
    } else {
      this.loaders.regularPaymentCategories = isLoaded;
    }
  }

  private markPlannedCategoryStatsAsLoaded(isLoaded: boolean): void {
    if (isLoaded) {
      new TimerUtils(this.appConfig.animation.duration.default).start()
        .subscribe(finished => {
          if (finished) {
            this.loaders.plannedPaymentCategories = isLoaded;
          }
        });
    } else {
      this.loaders.plannedPaymentCategories = isLoaded;
    }
  }

  private markBudgetGeneralCategoryStatsAsLoaded(isLoaded: boolean): void {
    if (isLoaded) {
      new TimerUtils(this.appConfig.animation.duration.default).start()
        .subscribe(finished => {
          if (finished) {
            this.loaders.budgetGeneralCategories = isLoaded;
          }
        });
    } else {
      this.loaders.budgetGeneralCategories = isLoaded;
    }
  }
}
