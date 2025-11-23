import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  OnInit,
  Renderer2,
  ViewChild
} from '@angular/core';
import {SpinnerSize} from "../../components/shared/spinner/spinner.component";
import BigNumber from "bignumber.js";
import {Subscription} from "rxjs";
import {BudgetResponse, ResponseModel} from "../../../models/response.model";
import {DateUtil} from '../../../util/date.util';
import {HttpService} from "../../../services/http/http.service";
import {ActivatedRoute, Params, Router} from "@angular/router";
import {HttpResponse} from "@angular/common/http";
import {SubscriptionUtils} from "../../../util/subscription.utils";
import {
  GetBudgetDto,
  GetBudgetGeneralCategoryDto,
  GetBudgetStatisticsSummaryDto
} from "../../../models/dto/budget.model.dto";
import {AppConfig} from "../../../models/config/config";
import {ConfigService} from "../../../services/config/config.service";
import {formatString} from "../../../util/string.utils";
import {getErrorResponse} from "../../../util/http.util";
import {TimerUtils} from "../../../util/timer.utils";
import {LegendPosition} from "@swimlane/ngx-charts";
import {
  GetIncomeStatsDto,
  GetPlannedPaymentStatsDto,
  GetRegularPaymentStatsDto
} from "../../../models/statistics.model";
import {ErrorImage, ErrorType} from "../../../models/error.model";
import {BudgetTab, DataResult, Loaders} from "../../../models/components/budget.component";
import {
  computePercent,
  formatPercent,
  getPieChartClassFor,
  getPieChartGridClassFor,
} from "../../../util/chart/chart.utils";
import {format} from "../../../util/number.util";
import {BudgetIncome, BudgetPlannedPayment, BudgetRegularPayment} from "../../../util/statistic.utils";
import {BudgetPaymentSummary} from "../../../util/chart/budget/budget-payment.chart.util";
import {BudgetIncomeSummary} from "../../../util/chart/budget/budget-income.chart.util";
import {BudgetSummary} from "../../../util/chart/budget/budget.chart.util";
import {Title} from "@angular/platform-browser";

@Component({
  selector: 'app-budget',
  templateUrl: './budget.component.html',
  styleUrl: './budget.component.css'
})
export class BudgetComponent implements OnInit, OnDestroy {
  @ViewChild('errorModal') errorModal: any;
  @ViewChild('budgetMenu') budgetMenu: any;
  protected readonly DateUtils = DateUtil;
  protected readonly SpinnerSize = SpinnerSize;
  protected readonly LegendPosition = LegendPosition;
  protected readonly ErrorType = ErrorType;
  protected readonly ErrorImage = ErrorImage;
  protected readonly BudgetTabs = BudgetTab;
  protected readonly BudgetPlannedPayment = BudgetPlannedPayment;
  protected readonly BudgetRegularPayment = BudgetRegularPayment;
  protected readonly format = format;
  protected readonly formatString = formatString;
  protected readonly formatPercent = formatPercent;
  protected readonly BigNumber = BigNumber;
  protected readonly getPieChartClassFor = getPieChartClassFor;
  protected readonly getPieChartGridClassFor = getPieChartGridClassFor;
  protected readonly computePercent = computePercent;
  protected readonly BudgetIncome = BudgetIncome;
  protected appConfig: AppConfig;
  protected budgetDto: GetBudgetDto | null;
  protected subscriptions: Subscription[];
  protected responseModels: BudgetResponse;
  protected idBudget: string;
  protected loaders: Loaders;
  protected budgetSummary: GetBudgetStatisticsSummaryDto | null;
  protected chartData: DataResult = new DataResult();
  protected statisticCurrentTab: BudgetTab;
  protected budgetCurrentTab: BudgetTab;
  protected displayBudgetSubMenu: boolean;
  public innerWidth: any;
  @ViewChild('budgetMenu') menuBtn: ElementRef;

  constructor(
    private httpService: HttpService,
    private activatedRoute: ActivatedRoute,
    private configService: ConfigService,
    private router: Router,
    private renderer: Renderer2,
    private titleService: Title) {
    this.renderer.listen('window', 'click', (e: Event): void => {
      if (e.target !== this.menuBtn.nativeElement && e.target !== this.menuBtn.nativeElement.firstChild) {
        this.displayBudgetSubMenu = false;
      }
    });
    this.titleService.setTitle("BudgetTracker - budget details");
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

    this.statisticCurrentTab = BudgetTab.IncomeTab;
    this.budgetCurrentTab = BudgetTab.IncomeTab;
    this.displayBudgetSubMenu = false;
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

    this.loaders = {
      budget: false,
      incomeCategories: false,
      regularPaymentCategories: false,
      plannedPaymentCategories: false,
      budgetGeneralCategories: false,
      budgetSummary: false
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
          const response = getErrorResponse(err);
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

  private getBudgetGeneralCategoryStats(): void {
    this.markBudgetGeneralCategoryStatsAsLoaded(false);
    this.subscriptions.push(
      this.httpService.getBudgetGeneralCategories(this.idBudget).subscribe({
        next: (response: HttpResponse<GetBudgetGeneralCategoryDto>): void => {
          const responseData = response.body;
          this.responseModels.budgetStats.statusCode = response.status;
          this.chartData.pieChartGrid.generalCategories = BudgetSummary.toPieChartGrid(responseData);
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
    this.markBudgetSummaryAsLoaded(false);
    this.subscriptions.push(
      this.httpService.getBudgetSummary(this.idBudget).subscribe({
        next: (response: HttpResponse<GetBudgetStatisticsSummaryDto>): void => {
          const responseData = response.body;
          this.budgetSummary = responseData;
          this.responseModels.budgetSummary.statusCode = response.status;
          this.chartData.horizontalChart.moneyLeftData = BudgetPaymentSummary.toHorizontalChart(responseData);
          this.markBudgetSummaryAsLoaded(true);
        },
        error: (err): void => {
          this.chartData.horizontalChart.moneyLeftData = [];
          this.responseModels.budgetSummary.statusCode = err.status;
          this.markBudgetSummaryAsLoaded(true);
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
          this.chartData.pieChart.income = BudgetIncomeSummary.toPieChart(response.body);
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
          this.chartData.pieChart.regular = BudgetPaymentSummary.toPieChart(response.body);
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
          this.chartData.pieChart.planned = BudgetPaymentSummary.toPieChart(response.body);
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

  private markBudgetSummaryAsLoaded(isLoaded: boolean): void {
    if (isLoaded) {
      new TimerUtils(this.appConfig.animation.duration.default).start()
        .subscribe(finished => {
          if (finished) {
            this.loaders.budgetSummary = isLoaded;
          }
        });
    } else {
      this.loaders.budgetSummary = isLoaded;
    }
  }
}
