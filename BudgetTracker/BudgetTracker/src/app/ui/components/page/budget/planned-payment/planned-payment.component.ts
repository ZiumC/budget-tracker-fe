import {Component, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {HttpService} from "../../../../../services/http/http.service";
import {ConfigService} from "../../../../../services/config/config.service";
import {Subscription} from "rxjs";
import {SubscriptionUtils} from "../../../../../util/subscription.utils";
import {AppConfig} from "../../../../../models/config/config";
import {RequestParams} from "../../../../../models/requestParams";
import {HttpResponse} from "@angular/common/http";
import {GetPlannedPaymentDto} from "../../../../../models/dto/planned-payment.model.dto";
import {ResponseModel} from "../../../../../models/response.model";
import {generateErrorModel} from "../../../../../util/http.util";
import {formatString} from "../../../../../util/string.utils";
import {TimerUtils} from "../../../../../util/timer.utils";

@Component({
  selector: 'app-planned-payment',
  templateUrl: './planned-payment.component.html',
  styleUrl: './planned-payment.component.css'
})
export class PlannedPaymentComponent implements OnInit, OnDestroy {
  @ViewChild('errorModal') errorModal: any;
  @Input() idBudget: string;
  protected readonly formatString = formatString;
  protected subscriptions: Subscription[];
  protected appConfig: AppConfig;
  protected plannedPaymentsDto: GetPlannedPaymentDto[] | null;
  protected requestParams: RequestParams;
  protected responseModel: ResponseModel;
  protected plannedPaymentLoader: boolean;

  constructor(
    private httpService: HttpService,
    private configService: ConfigService) {
  }

  ngOnInit(): void {
    const appCfg = this.configService.getAppConfig();
    if (appCfg) {
      this.appConfig = appCfg;
    } else {
      throw Error("Config not provided")
    }

    this.responseModel = new ResponseModel();
    this.subscriptions = [];

    this.requestParams = new RequestParams({
      page: this.appConfig.request.pagination.defaultPage,
      pageSize: this.appConfig.request.pagination.defaultPageSizeOptions[0],
    })

    this.getPlannedPayments();
  }

  ngOnDestroy(): void {
    SubscriptionUtils.unsubscribeAll(this.subscriptions);
  }

  protected onRefreshPlannedPayment(): void {
    this.markPlannedPaymentsAsLoaded(false);
    this.getPlannedPayments();
  }

  private getPlannedPayments(): void {
    this.subscriptions.push(
      this.httpService.getPlannedPayment(
        this.requestParams,
        this.idBudget
      ).subscribe({
        next: (response: HttpResponse<GetPlannedPaymentDto[]>): void => {
          this.plannedPaymentsDto = response.body;
          this.responseModel.statusCode = response.status;
        }, error: (err): void => {
          const response = generateErrorModel(err);
          this.responseModel = response;
          if (response.statusCode != 404) {
            this.errorModal.open(response);
          }
          this.markPlannedPaymentsAsLoaded(true);
        },
        complete: (): void => {
          this.markPlannedPaymentsAsLoaded(true);
        }
      })
    )
  }

  private markPlannedPaymentsAsLoaded(isLoaded: boolean): void {
    if (isLoaded) {
      new TimerUtils(this.appConfig.animation.duration.default).start()
        .subscribe(finished => {
          if (finished) {
            this.plannedPaymentLoader = isLoaded;
          }
        })
    } else {
      this.plannedPaymentLoader = isLoaded;
    }
  }
}
