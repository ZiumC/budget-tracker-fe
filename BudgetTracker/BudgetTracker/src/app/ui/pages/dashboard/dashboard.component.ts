import {Component, HostListener, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {HttpService} from '../../../services/http/http.service';
import {Subscription} from 'rxjs';
import {HttpResponse} from '@angular/common/http';
import {SubscriptionUtils} from '../../../util/subscription.utils';
import {DatePickerUtil, DateUtil} from "../../../util/date.util";
import {RequestModel} from "../../../models/request.model";
import {SpinnerSize} from "../../components/shared/spinner/spinner.component";
import {DatePicker} from "../../../models/datepicker.model";
import {TimerUtils} from "../../../util/timer.utils";
import {getCookie, setCookie} from "../../../util/cookie.utils";
import {GetBudgetDto, GetBudgetGeneralCategoryDto, GetBudgetSummaryDto} from "../../../models/dto/budget.model.dto";
import {ResponseModel} from "../../../models/response.model";
import {AppConfig} from "../../../models/config/config";
import {FormConfig} from "../../../models/config/form.model.config";
import {ConfigService} from "../../../services/config/config.service";
import {RequestConfig} from "../../../models/config/request.model.config";
import {formatString} from "../../../util/string.utils";
import {ModalUtils} from "../../../util/modal.utils";
import {generateErrorModel} from "../../../util/http.util";
import {ErrorImage, ErrorType} from "../../../models/error.model";
import {
  DashboardResponse,
  DataResult,
  IncomeStatisticsTab,
  Loaders,
  PaymentStatisticsTab
} from "../../../models/components/dashboard.component";
import {
  generalCategoriesToPieChartGrid,
  getPieChartClassFor
} from "../../../util/chart.utils";
import {LegendPosition} from "@swimlane/ngx-charts";
import BigNumber from "bignumber.js";
import {format} from "../../../util/number.util";
import {BudgetIncomeSummary, IncomeChartType} from "../../../util/chart/budget/budget-income.chart.util";

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit, OnDestroy {
  @ViewChild('errorModal') errorModal: any;
  protected readonly formatString = formatString;
  protected readonly ModalUtils = ModalUtils;
  protected readonly DateUtils = DateUtil;
  protected readonly SpinnerSize = SpinnerSize;
  protected readonly ErrorType = ErrorType;
  protected readonly ErrorImage = ErrorImage;
  protected readonly LegendPosition = LegendPosition;
  protected readonly getPieChartClassFor = getPieChartClassFor;
  protected readonly IncomeStatisticsTab = IncomeStatisticsTab;
  protected readonly PaymentStatisticsTab = PaymentStatisticsTab;
  protected appConfig: AppConfig;
  protected formConfig: FormConfig;
  protected requestConfig: RequestConfig;
  protected budgets: GetBudgetDto[] | null;
  protected budget: GetBudgetDto | null;
  protected subscriptions: Subscription[];
  protected requestModel: RequestModel;
  protected fromDatePicker: DatePicker;
  protected toDatePicker: DatePicker;
  protected toCurrentYear: boolean;
  protected responseModels: DashboardResponse;
  protected idRefreshBudget: string;
  protected chartData: DataResult;
  protected loaders: Loaders;
  protected incomeStatisticTab: IncomeStatisticsTab;
  protected paymentStatisticTab: PaymentStatisticsTab;
  public innerWidth: any;

  constructor(private httpService: HttpService,
              private configService: ConfigService) {
  }

  ngOnInit(): void {
    const appCfg = this.configService.getAppConfig();
    if (appCfg) {
      this.appConfig = appCfg;
      this.formConfig = appCfg.form;
      this.requestConfig = appCfg.request;
    } else {
      throw Error("Config not provided")
    }

    this.requestModel = new RequestModel();
    this.requestModel.page = this.requestConfig.pagination.defaultPage;
    this.requestModel.pageSize = this.requestConfig.pagination.defaultBudgetsPageSize;

    const dateFromCookie = this.readDateCookie(this.requestConfig.cookies.names.fromDate);
    const dateToCookie = this.readDateCookie(this.requestConfig.cookies.names.toDate);

    if (dateFromCookie) {
      this.fromDatePicker = DatePickerUtil.convertToDatePicker(dateFromCookie);
    } else {
      this.fromDatePicker =
        DatePickerUtil.firstDayOfCurrentYear();
    }

    if (dateToCookie) {
      this.toDatePicker = DatePickerUtil.convertToDatePicker(dateToCookie);
    } else {
      this.toDatePicker =
        DatePickerUtil.lastDayOfCurrentYear();
    }

    this.requestModel.fromDate = DatePickerUtil.formatDatePicker(this.fromDatePicker);
    this.requestModel.toDate = DatePickerUtil.formatDatePicker(this.toDatePicker);
    this.toCurrentYear = !this.isCurrentYear();

    this.budgets = [];
    this.subscriptions = [];
    this.responseModels = {
      budgets: new ResponseModel(),
      budget: new ResponseModel(),
      budgetSummary: new ResponseModel(),
      budgetCategories: new ResponseModel()
    }

    this.chartData = {
      budgetWage: [],
      budgetSurplus: [],
      budgetCategories: []
    }

    this.loaders = {
      page: false,
      budgets: false,
      budgetSummary: false,
      budgetCategories: false
    }

    this.incomeStatisticTab = IncomeStatisticsTab.BudgetTab;
    this.paymentStatisticTab = PaymentStatisticsTab.RegularTab;

    this.getBudgets(this.requestModel);
    this.getBudgetCategories(this.requestModel);
    this.getBudgetSummary(this.requestModel);
    this.onResize();
  }

  ngOnDestroy(): void {
    SubscriptionUtils.unsubscribeAll(this.subscriptions);
  }

  @HostListener('window:resize', ['$event'])
  onResize(): void {
    this.innerWidth = window.innerWidth;
  }

  protected isMobileView(): boolean {
    return innerWidth <= this.appConfig.pageMobileWidth;
  }

  protected formatAxisY(val: string): string {
    return val + " PLN";
  }

  protected reloadPage(): void {
    this.markPageAsLoaded(false);
    this.responseModels.budgets = new ResponseModel();
    this.responseModels.budgetCategories = new ResponseModel();
    this.getBudgets(this.requestModel);
    this.getBudgetCategories(this.requestModel);
    this.getBudgetSummary(this.requestModel);
  }

  protected updateBudget(idBudget: string): void {
    if (idBudget) {
      this.markBudgetAsLoaded(false);
      this.idRefreshBudget = idBudget;
      this.responseModels.budget = new ResponseModel();
      this.getBudget(idBudget);
    } else {
      this.errorModal.open(this.responseModels);
    }
  }

  protected searchBudgets(toCurrentDate: boolean): void {
    let fromDate: Date;
    let toDate: Date;

    if (toCurrentDate) {
      fromDate = DateUtil.firstDayOfCurrentYear();
      toDate = DateUtil.lastDayOfCurrentYear();
      this.fromDatePicker = DatePickerUtil.convertToDatePicker(fromDate);
      this.toDatePicker = DatePickerUtil.convertToDatePicker(toDate);
    } else {
      fromDate = DatePickerUtil.convertToDate(this.fromDatePicker);
      toDate = DatePickerUtil.convertToDate(this.toDatePicker);
    }

    this.requestModel.fromDate = DateUtil.format(fromDate);
    this.requestModel.toDate = DateUtil.format(toDate);

    this.saveDateCookie(this.requestConfig.cookies.names.fromDate, fromDate);
    this.saveDateCookie(this.requestConfig.cookies.names.toDate, toDate);

    this.toCurrentYear = !this.isCurrentYear();

    this.reloadPage();
  }

  protected buttonOptionsClass(): string {
    const isMobileView = innerWidth <= this.appConfig.pageMobileWidth;

    if (isMobileView) {
      return "budget-button-options-rows";
    }

    if (!this.toCurrentYear) {
      return "budget-button-options-2-cols";
    } else {
      return "budget-button-options-3-cols";
    }
  }

  protected budgetCardContainerClass(): string {
    const isMobileView = innerWidth <= this.appConfig.pageMobileWidth;
    const budgetsLength = this.budgets!.length;

    if (isMobileView) {
      return "budget-card-container-rows";
    }

    if (budgetsLength < 3) {
      if (budgetsLength % 3 == 1) {
        return "budget-card-container-1-cols";
      } else {
        return "budget-card-container-2-cols";
      }
    } else {
      if (innerWidth <= this.appConfig.pageMediumWidth) {
        return "budget-card-container-2-cols";
      } else {
        return "budget-card-container-3-cols";
      }
    }
  }

  protected getBudgetCategories(requestModel: RequestModel): void {
    this.markBudgetCategoriesAsLoaded(false);
    this.subscriptions.push(
      this.httpService.getBudgetGeneralCategoriesInRange(requestModel).subscribe({
        next: (response: HttpResponse<GetBudgetGeneralCategoryDto>): void => {
          this.responseModels.budgetCategories.statusCode = response.status;
          this.chartData.budgetCategories = generalCategoriesToPieChartGrid(response.body);
          this.markBudgetCategoriesAsLoaded(true);
        },
        error: (err): void => {
          this.responseModels.budgetCategories = generateErrorModel(err);
          this.markBudgetCategoriesAsLoaded(true);
        }
      })
    )
  }

  protected getBudgetSummary(requestModel: RequestModel): void {
    this.markBudgetSummaryAsLoaded(false);
    this.subscriptions.push(
      this.httpService.getBudgetSummaryInRange(requestModel).subscribe({
        next: (response: HttpResponse<GetBudgetSummaryDto[]>): void => {
          this.responseModels.budgetSummary.statusCode = response.status;
          this.chartData.budgetWage = BudgetIncomeSummary.toLineChart(response.body, IncomeChartType.WAGE_AND_SURPLUS);
          this.chartData.budgetSurplus = BudgetIncomeSummary.toLineChart(response.body, IncomeChartType.SAVINGS_AND_SURPLUS);
          this.markBudgetSummaryAsLoaded(true);
        },
        error: (err): void => {
          this.responseModels.budgetSummary = generateErrorModel(err);
          this.markBudgetSummaryAsLoaded(true);
        }
      })
    )
  }

  private isCurrentYear(): boolean {
    const currentYear = new Date().getFullYear();
    return this.fromDatePicker.year == currentYear &&
      this.toDatePicker.year == currentYear;
  }

  private getBudget(idBudget: string): void {
    this.subscriptions.push(
      this.httpService.getBudget(idBudget).subscribe({
        next: (response: HttpResponse<GetBudgetDto>): void => {
          this.budget = response.body;
          this.responseModels.budget.statusCode = response.status
        },
        error: (err): void => {
          this.responseModels.budget = generateErrorModel(err);
          this.markBudgetAsLoaded(true);
        },
        complete: (): void => {
          this.budgets!.forEach((item, index): void => {
            if (item.id == idBudget && this.budgets) {
              this.budgets[index] = this.budget!;
            }
          });
          this.markBudgetAsLoaded(true);
        }
      })
    )
  }

  private getBudgets(requestParamModel: RequestModel): void {
    this.subscriptions.push(
      this.httpService.getBudgets(requestParamModel).subscribe({
        next: (response: HttpResponse<GetBudgetDto[]>): void => {
          this.budgets = response.body;
          this.responseModels.budgets.statusCode = response.status
        },
        error: (err): void => {
          this.responseModels.budgets = generateErrorModel(err);
          this.markPageAsLoaded(true);
        },
        complete: (): void => {
          this.markPageAsLoaded(true);
        }
      })
    )
  }

  private markPageAsLoaded(value: boolean): void {
    if (value) {
      new TimerUtils(this.appConfig.timer.duration.default).start()
        .subscribe(finished => {
          if (finished) {
            this.loaders.page = value;
          }
        });
    } else {
      this.loaders.page = value;
    }
  }

  private markBudgetAsLoaded(value: boolean): void {
    if (value) {
      new TimerUtils(this.appConfig.timer.duration.default).start()
        .subscribe(finished => {
          if (finished) {
            this.loaders.budgets = value;
          }
        });
    } else {
      this.loaders.budgets = value;
    }
  }

  private markBudgetCategoriesAsLoaded(value: boolean): void {
    if (value) {
      new TimerUtils(this.appConfig.timer.duration.default).start()
        .subscribe(finished => {
          if (finished) {
            this.loaders.budgetCategories = value;
          }
        });
    } else {
      this.loaders.budgetCategories = value;
    }
  }

  private markBudgetSummaryAsLoaded(value: boolean): void {
    if (value) {
      new TimerUtils(this.appConfig.timer.duration.default).start()
        .subscribe(finished => {
          if (finished) {
            this.loaders.budgetSummary = value;
          }
        });
    } else {
      this.loaders.budgetSummary = value;
    }
  }

  private saveDateCookie(dateName: string, date: Date): void {
    setCookie(dateName, date.toString());
  }

  private readDateCookie(dateName: string): Date | null {
    const cookieDate = getCookie(dateName);
    return cookieDate ? new Date(cookieDate) : null;
  }

  protected readonly BigNumber = BigNumber;
  protected readonly format = format;
}
