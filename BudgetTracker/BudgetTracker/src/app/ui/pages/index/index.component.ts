import {Component, OnDestroy, OnInit} from '@angular/core';
import {ErrorModel} from '../../../models/ErrorModel';
import {Budget} from '../../../models/Budget';
import {HttpService} from '../../../services/http/httpService';
import {Subscription} from 'rxjs';
import {HttpResponse} from '@angular/common/http';
import {SubscriptionUtils} from '../../../util/subscription.utils';
import {DateUtils} from "../../../util/date.utils";
import {RequestModel} from "../../../models/RequestModel";

@Component({
  selector: 'app-index',
  templateUrl: './index.component.html',
  styleUrl: './index.component.css'
})
export class IndexComponent implements OnInit, OnDestroy {
  protected requiredStatusCode: number = 200;
  protected errorModel: ErrorModel;
  protected budgets: Budget[] | null;
  protected subscriptions: Subscription[];
  protected requestParams: RequestModel;
  protected currentYear: number = new Date().getFullYear();

  constructor(private httpService: HttpService) {
  }

  ngOnInit(): void {
    this.requestParams = new RequestModel();
    this.requestParams.page = 1;
    this.requestParams.pageSize = 12;
    this.requestParams.fromDate = DateUtils
      .format(new Date(this.currentYear, 0, 1));
    this.requestParams.toDate = DateUtils
      .format(new Date(this.currentYear, 11, 31));
    this.budgets = [];
    this.subscriptions = [];
    this.errorModel = new ErrorModel();

    this.subscriptions.push(
      this.httpService.getBudgets(this.requestParams).subscribe({
        next: (response: HttpResponse<Budget[]>): void => {
          this.budgets = response.body;
          this.errorModel.responseStatusCode = response.status
        },
        error: (err) => {
          this.errorModel.responseErrorMessage = err
        }
      })
    )

  }


  ngOnDestroy(): void {
    SubscriptionUtils.unsubscribeAll(this.subscriptions);
  }

  protected readonly DateUtils = DateUtils;
}
