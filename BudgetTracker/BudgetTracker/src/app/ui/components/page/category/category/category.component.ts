import {Component, HostListener, Input, OnDestroy, OnInit} from '@angular/core';
import {SubscriptionUtils} from "../../../../../util/subscription.utils";
import {AppConfig} from "../../../../../models/config/config";
import {Subscription} from "rxjs";
import {ResponseModel} from "../../../../../models/response.model";
import {GetCategoryDto} from "../../../../../models/dto/category.model.dto";
import {HttpService} from "../../../../../services/http/http.service";
import {ConfigService} from "../../../../../services/config/config.service";
import {formatString} from "../../../../../util/string.utils";
import {TimerUtils} from "../../../../../util/timer.utils";
import {DateUtil} from "../../../../../util/date.util";
import {OrderOptions} from "../../../shared/order/order.component";

@Component({
    selector: 'app-category',
    templateUrl: './category.component.html',
    styleUrl: './category.component.css'
})
export class CategoryComponent implements OnInit, OnDestroy {
    @Input() id: string;
    @Input() displayName: string;
    protected readonly formatString = formatString;
    protected readonly DateUtil = DateUtil;
    protected appConfig: AppConfig;
    protected subscriptions: Subscription[];
    protected categoryResponseModel: ResponseModel;
    protected categoriesDto: GetCategoryDto[];
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
            throw Error("Config not provided")
        }

        this.categoryResponseModel = new ResponseModel();

        this.categoriesDto = [
            {
                id: '3b7362f4-e2a2-4c3e-9e90-1c29ce3cacb0',
                name: "Test name",
                description: "test description",
                dateUpdated: new Date(),
                isNeeds: true,
                isWants: false,
                isSavings: false
            } as GetCategoryDto,
            {
                id: '00af9ee9-8dc3-4c96-b6f3-206955f0e45b',
                name: "Some name",
                description: "description",
                dateUpdated: new Date(),
                isNeeds: false,
                isWants: true,
                isSavings: false
            } as GetCategoryDto,
            {
                id: 'bb926e23-4fdb-4bb0-aa70-48ea4c6a129c',
                name: "name",
                description: "some description",
                dateUpdated: new Date(),
                isNeeds: false,
                isWants: false,
                isSavings: true
            } as GetCategoryDto,
        ];

        this.categoriesTotalPages = 2;
        new TimerUtils(this.appConfig.animation.duration.default).start()
            .subscribe(finished => {
                if (finished) {
                    this.categoryResponseModel.statusCode = 200;
                    this.categoriesLoader = true;
                }
            });
    }

    ngOnDestroy(): void {
        SubscriptionUtils.unsubscribeAll(this.subscriptions);
    }

    onOrderEvent(orderOptions: OrderOptions): void {

    }

    onPageSizeEvent(pageSize: number): void {

    }

    onPageEvent(page: number): void{

    }
}
