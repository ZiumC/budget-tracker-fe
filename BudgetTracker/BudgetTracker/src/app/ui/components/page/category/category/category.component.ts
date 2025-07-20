import {Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
import {SubscriptionUtils} from "../../../../../util/subscription.utils";
import {AppConfig} from "../../../../../models/config/config";
import {Observable, Subscription} from "rxjs";
import {ResponseModel} from "../../../../../models/response.model";
import {CategoryType, GetCategoryDto} from "../../../../../models/dto/category.model.dto";
import {HttpService} from "../../../../../services/http/http.service";
import {ConfigService} from "../../../../../services/config/config.service";
import {formatString} from "../../../../../util/string.utils";
import {TimerUtils} from "../../../../../util/timer.utils";
import {DateUtil} from "../../../../../util/date.util";
import {OrderOptions} from "../../../shared/order/order.component";
import {HttpResponse} from "@angular/common/http";
import {generateErrorModel} from "../../../../../util/http.util";
import {RequestParams} from "../../../../../models/requestParams";
import {PageDto} from "../../../../../models/dto/page.model.dto";

@Component({
  selector: 'app-category',
  templateUrl: './category.component.html',
  styleUrl: './category.component.css'
})
export class CategoryComponent implements OnInit, OnDestroy {
  @ViewChild('errorModal') errorModal: any;
  @Input() type: CategoryType;
  @Input() displayName: string;
  @Input() searchEvent: Observable<string>;
  @Input() clearEvent: Observable<boolean>;
  @Input() refreshCategoryEvent: Observable<string[]>;
  @Output() categoryChangeTypeEvent = new EventEmitter<string[]>();
  protected readonly formatString = formatString;
  protected readonly DateUtil = DateUtil;
  protected appConfig: AppConfig;
  protected subscriptions: Subscription[];
  protected categoryResponseModel: ResponseModel;
  protected categoryRequestParams: RequestParams = new RequestParams();
  protected copiedCategoriesDto: GetCategoryDto[] | null = [];
  protected categoriesDto: GetCategoryDto[] | null;
  protected selectedCategory: GetCategoryDto;
  protected categoriesLoader: boolean;
  protected categoriesTotalPages: number;
  private lastSearchedPhrase: string | undefined;

  constructor(
    private httpService: HttpService,
    private configService: ConfigService) {
  }

  ngOnInit(): void {
    const appCfg = this.configService.getAppConfig();
    if (appCfg) {
      this.appConfig = appCfg;
    } else {
      throw Error("Config not provided");
    }

    if (!this.type) {
      throw Error("Category type is required");
    }

    this.categoryResponseModel = new ResponseModel();
    this.subscriptions = [];

    this.defaultOrderParams();
    this.getCategories();

    this.subscriptions.push(
      this.searchEvent.subscribe((phrase): void => {
        this.lastSearchedPhrase = phrase;
        this.searchInCategories(phrase);
      })
    );

    this.subscriptions.push(
      this.clearEvent.subscribe(clear => {
        if (clear) {
          this.lastSearchedPhrase = undefined;
          this.getCategories();
        }
      })
    )

    this.subscriptions.push(
      this.refreshCategoryEvent.subscribe(categories => {
        for (let category of categories) {
          if (category == this.type) {
            this.onRefreshCategories();
          }
        }
      })
    )
  }

  ngOnDestroy(): void {
    SubscriptionUtils.unsubscribeAll(this.subscriptions);
  }

  onOrderEvent(orderOptions: OrderOptions): void {
    if (orderOptions.orderType.applyForApi) {
      this.categoryRequestParams.orderBy = orderOptions.orderType.value;
      if (orderOptions.orderType.displayDirections) {
        this.categoryRequestParams.order = orderOptions.orderDirection!.value;
      } else {
        this.categoryRequestParams.order = null;
      }
      this.onRefreshCategories();
    }
  }

  onPageSizeEvent(pageSize: number): void {
    this.categoryRequestParams.page = this.appConfig.request.pagination.defaultPage;
    this.categoryRequestParams.pageSize = pageSize;
    this.onRefreshCategories();
  }

  onPageEvent(page: number): void {
    this.categoryRequestParams.page = page;
    this.onRefreshCategories();
  }

  protected onRefreshCategories(): void {
    this.markCategoriesAsLoaded(false);
    this.getCategories();
  }

  protected onCategoryChange(types: string[]): void {
    this.categoryChangeTypeEvent.emit(types);
  }

  private getCategories(): void {
    let getCategories = this.httpService
      .getPaymentCategories(this.type, this.categoryRequestParams);

    if (this.type == CategoryType.INCOMES) {
      getCategories = this.httpService
        .getIncomeCategories(this.categoryRequestParams);
    }

    this.subscriptions.push(
      getCategories.subscribe({
        next: (response: HttpResponse<GetCategoryDto[]>): void => {
          this.categoriesDto = response.body;
          this.categoryResponseModel.statusCode = response.status;
        },
        error: (err): void => {
          const response = generateErrorModel(err);
          this.categoryResponseModel = response;
          if (response.statusCode != 404) {
            this.errorModal.open(response);
          }
          this.markCategoriesAsLoaded(true);
        },
        complete: (): void => {
          if (this.lastSearchedPhrase) {
            this.searchInCategories(this.lastSearchedPhrase);
          }
          this.getCategoriesTotalPages();
          this.markCategoriesAsLoaded(true);
          this.copiedCategoriesDto?.push(...this.categoriesDto!);
        }
      }))
  }

  private markCategoriesAsLoaded(isLoaded: boolean): void {
    if (isLoaded) {
      new TimerUtils(this.appConfig.animation.duration.default).start()
        .subscribe(finished => {
          if (finished) {
            this.categoriesLoader = isLoaded;
          }
        });
    } else {
      this.categoriesLoader = isLoaded;
    }
  }

  private getCategoriesTotalPages(): void {
    let categoryPages = this.httpService
      .getPaymentCategoryPages(this.type, this.categoryRequestParams);

    if (this.type == CategoryType.INCOMES) {
      categoryPages = this.httpService
        .getIncomeCategoryPages(this.categoryRequestParams);
    }

    this.subscriptions.push(
      categoryPages.subscribe({
        next: (response: HttpResponse<PageDto>): void => {
          this.categoriesTotalPages = response.body!.pages;
        }
      })
    )
  }

  private defaultOrderParams(): void {
    this.categoryRequestParams.orderBy =
      this.appConfig.request.order.paymentCategoryTypes[0].value;
    this.categoryRequestParams.order =
      this.appConfig.request.order.orderDirections[0].value;
  }

  private searchInCategories(phrase: string): void {
    this.categoriesDto = [];
    this.categoriesDto.push(...this.copiedCategoriesDto!);
    const filteredResult = this.categoriesDto?.filter(
      category => category.name.toLowerCase().includes(phrase) ||
        category.description.toLowerCase().includes(phrase));
    if (filteredResult) {
      this.categoriesDto = [];
      filteredResult.forEach(val => this.categoriesDto?.push(val));
    }
  }
}
