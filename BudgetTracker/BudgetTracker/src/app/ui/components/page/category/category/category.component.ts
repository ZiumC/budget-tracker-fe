import {Component, HostListener, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {SubscriptionUtils} from "../../../../../util/subscription.utils";
import {AppConfig} from "../../../../../models/config/config";
import {Subscription} from "rxjs";
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
    protected readonly formatString = formatString;
    protected readonly DateUtil = DateUtil;
    protected appConfig: AppConfig;
    protected subscriptions: Subscription[];
    protected categoryResponseModel: ResponseModel;
    protected categoryRequestParams: RequestParams;
    protected categoriesDto: GetCategoryDto[] | null;
    protected selectedCategory: GetCategoryDto;
    protected categoriesLoader: boolean;
    protected categoriesTotalPages: number;
    public innerWidth: any;

    constructor(
        private httpService: HttpService,
        private configService: ConfigService) {
    }

    @HostListener('window:resize', ['$event'])
    onResize(): void {
        this.innerWidth = window.innerWidth;
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
        this.categoryRequestParams = new RequestParams({
            page: this.appConfig.request.pagination.defaultPage,
            pageSize: this.appConfig.request.pagination.defaultPageSizeOptions[0],
        })
        this.subscriptions = [];

        this.defaultOrderParams();
        this.getCategories();
    }

    ngOnDestroy(): void {
        SubscriptionUtils.unsubscribeAll(this.subscriptions);
    }

    onOrderEvent(orderOptions: OrderOptions): void {

    }

    onPageSizeEvent(pageSize: number): void {

    }

    onPageEvent(page: number): void {

    }

    private getCategories(): void {
        this.subscriptions.push(
            this.httpService.getCategories(
                this.categoryRequestParams,
                this.type).subscribe({
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
                    this.getCategoriesTotalPages();
                    this.markCategoriesAsLoaded(true);
                }
            })
        )
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
        this.subscriptions.push(
            this.httpService.getCategoryPages(
                this.categoryRequestParams,
                this.type).subscribe({
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
}
