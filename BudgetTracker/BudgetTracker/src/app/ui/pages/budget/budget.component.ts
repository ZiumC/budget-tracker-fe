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
import {GetBudgetDto, GetBudgetStatsDto} from "../../../models/dto/budget.model.dto";
import {AppConfig} from "../../../models/config/config";
import {ConfigService} from "../../../services/config/config.service";
import {formatString} from "../../../util/string.utils";
import {generateErrorModel} from "../../../util/http.util";
import {TimerUtils} from "../../../util/timer.utils";
import {LegendPosition} from "@swimlane/ngx-charts";
import {
  GetCategoryStatsDto,
  IncomeCategoryDetails, PlannedPaymentCategoryDetails,
  RegularPaymentCategoryDetails
} from "../../../models/dto/statistics.model.dto";
import {ErrorImage, ErrorType} from "../../../models/error.model";
import {
  BudgetCategoryDetails,
  BudgetHorizontalChartData,
  BudgetLoaders,
  BudgetPieChartData,
  BudgetTabs
} from "../../../models/components/budget.component";
import {
  formatPercent,
  getPieChartClassFor,
  transformIncomeToPieChartData,
  transformPlannedPaymentToPieChartData,
  transformRegularPaymentToPieChartData,
  transformToIncomeDetails,
  transformToPlannedDetails,
  transformToRegularDetails
} from "../../../util/chart.utils";
import {format} from "../../../util/number.util";

@Component({
  selector: 'app-budget',
  templateUrl: './budget.component.html',
  styleUrl: './budget.component.css'
})
export class BudgetComponent implements OnInit, OnDestroy {
  @ViewChild('errorModal') errorModal: any;
  protected readonly formatString = formatString;
  protected readonly format = format;
  protected readonly DateUtils = DateUtil;
  protected readonly SpinnerSize = SpinnerSize;
  protected readonly LegendPosition = LegendPosition;
  protected readonly ErrorType = ErrorType;
  protected readonly ErrorImage = ErrorImage;
  protected readonly BudgetTabs = BudgetTabs;
  protected readonly formatPercent = formatPercent;
  protected readonly BigNumber = BigNumber;
  protected readonly getPieChartClassFor = getPieChartClassFor;
  protected appConfig: AppConfig;
  protected budgetDto: GetBudgetDto | null;
  protected budgetStatsDto: GetBudgetStatsDto | null;
  protected subscriptions: Subscription[];
  protected responseModels: BudgetResponse;
  protected idBudget: string;
  protected loaders: BudgetLoaders;
  protected budgetStatisticDetails: BudgetCategoryDetails;
  protected pieChartDataResult: BudgetPieChartData;
  protected horizontalChartDataResult: BudgetHorizontalChartData;
  protected currentTab: BudgetTabs;
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

    this.currentTab = BudgetTabs.IncomeTab;
    this.pieChartDataResult = {
      income: [],
      planned: [],
      regular: []
    }

    this.budgetStatisticDetails = {
      income: [],
      planned: [],
      regular: []
    }

    this.horizontalChartDataResult = new BudgetHorizontalChartData();
    this.loaders = new BudgetLoaders();

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


    this.getBudgetStatistics();
    this.getPlannedPaymentStats();
    this.getRegularPaymentStats();
    this.getIncomeStats();

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

  private markIncomeStatsAsLoaded(isLoaded: boolean): void {
    if (isLoaded) {
      new TimerUtils(this.appConfig.animation.duration.default).start()
        .subscribe(finished => {
          if (finished) {
            this.loaders.incomeStats = isLoaded;
          }
        });
    } else {
      this.loaders.incomeStats = isLoaded;
    }
  }

  private markRegularPaymentStatsAsLoaded(isLoaded: boolean): void {
    if (isLoaded) {
      new TimerUtils(this.appConfig.animation.duration.default).start()
        .subscribe(finished => {
          if (finished) {
            this.loaders.regularStats = isLoaded;
          }
        });
    } else {
      this.loaders.regularStats = isLoaded;
    }
  }

  private markPlannedPaymentStatsAsLoaded(isLoaded: boolean): void {
    if (isLoaded) {
      new TimerUtils(this.appConfig.animation.duration.default).start()
        .subscribe(finished => {
          if (finished) {
            this.loaders.plannedStats = isLoaded;
          }
        });
    } else {
      this.loaders.plannedStats = isLoaded;
    }
  }

  private getIncomeStats(): void {
    this.markIncomeStatsAsLoaded(false);
    let stats: GetCategoryStatsDto | null;
    this.subscriptions.push(
      this.httpService.getIncomeCategoriesStats(this.idBudget).subscribe({
        next: (response: HttpResponse<GetCategoryStatsDto>): void => {
          stats = response.body;
          this.responseModels.incomeStats.statusCode = response.status;
          this.budgetStatisticDetails.income = transformToIncomeDetails(stats);
        },
        error: (err): void => {
          this.responseModels.incomeStats = generateErrorModel(err);
          this.markIncomeStatsAsLoaded(true);
        },
        complete: (): void => {
          this.pieChartDataResult.income = transformIncomeToPieChartData(this.budgetStatisticDetails.income);
          this.markIncomeStatsAsLoaded(true);

        }
      })
    );
  }

  private getRegularPaymentStats(): void {
    this.markRegularPaymentStatsAsLoaded(false);
    let stats: GetCategoryStatsDto | null;
    this.subscriptions.push(
      this.httpService.getRegularPaymentCategoriesStats(this.idBudget).subscribe({
        next: (response: HttpResponse<GetCategoryStatsDto>): void => {
          stats = response.body;
          this.responseModels.regularStats.statusCode = response.status;
          this.budgetStatisticDetails.regular = transformToRegularDetails(stats);
        },
        error: (err): void => {
          this.responseModels.regularStats = generateErrorModel(err);
          this.markRegularPaymentStatsAsLoaded(true);
        },
        complete: (): void => {
          this.pieChartDataResult.regular = transformRegularPaymentToPieChartData(this.budgetStatisticDetails.regular);
          this.markRegularPaymentStatsAsLoaded(true);
        }
      })
    );
  }

  private getPlannedPaymentStats(): void {
    this.markPlannedPaymentStatsAsLoaded(false);
    let stats: GetCategoryStatsDto | null;
    this.subscriptions.push(
      this.httpService.getPlannedPaymentCategoriesStats(this.idBudget).subscribe({
        next: (response: HttpResponse<GetCategoryStatsDto>): void => {
          stats = response.body;
          this.responseModels.plannedStats.statusCode = response.status;
          this.budgetStatisticDetails.planned = transformToPlannedDetails(stats);
        },
        error: (err): void => {
          this.responseModels.plannedStats = generateErrorModel(err);
          this.markPlannedPaymentStatsAsLoaded(true);
        },
        complete: (): void => {
          this.pieChartDataResult.planned = transformPlannedPaymentToPieChartData(this.budgetStatisticDetails.planned);
          this.markPlannedPaymentStatsAsLoaded(true);
        }
      })
    );
  }

}
