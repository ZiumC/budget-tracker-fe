import {Component, HostListener, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {SpinnerSize} from "../../components/shared/spinner/spinner.component";
import {Subscription} from "rxjs";
import {BudgetResponse, ResponseModel} from "../../../models/response.model";
import {DateUtil} from '../../../util/date.util';
import {HttpService} from "../../../services/http/http.service";
import {ActivatedRoute, Params, Router} from "@angular/router";
import {HttpResponse} from "@angular/common/http";
import {SubscriptionUtils} from "../../../util/subscription.utils";
import {format} from "../../../util/number.util";
import {GetBudgetDto, GetBudgetStatsDto} from "../../../models/dto/budget.model.dto";
import {AppConfig} from "../../../models/config/config";
import {ConfigService} from "../../../services/config/config.service";
import {formatString} from "../../../util/string.utils";
import {generateErrorModel} from "../../../util/http.util";
import {TimerUtils} from "../../../util/timer.utils";
import {ColorHelper, LegendPosition} from "@swimlane/ngx-charts";
import {StatisticsDataResult} from "../../../models/dto/statistics.model.dto";

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
  protected appConfig: AppConfig;
  protected budgetDto: GetBudgetDto | null;
  protected budgetStatsDto: GetBudgetStatsDto | null;
  protected subscriptions: Subscription[];
  protected responseModels: BudgetResponse;
  protected idBudget: string;
  protected budgetLoader: boolean;
  protected incomeStatsData: StatisticsDataResult[] = [];
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

    for (let i = 0; i < 21; i++) {
      this.incomeStatsData.push({
        name: 'Cat no. ' + i,
        value: i * 10
      } as StatisticsDataResult)
    }

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
      budgetStats: new ResponseModel()
    };

    this.innerWidth = window.innerWidth;
    this.subscriptions = [];

    this.activatedRoute.queryParams.subscribe((params: Params): void => {
      this.idBudget = params['id'];
    });

    this.getBudgetStatistics();

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
    if (data.length <= 8) {
      return 'doughnut-height-s';
    } else if (data.length > 8 && data.length <= 15) {
      return 'doughnut-height-m';
    } else {
      return 'doughnut-height-xl'
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

  protected readonly LegendPosition = LegendPosition;
  protected readonly ColorHelper = ColorHelper;
}
