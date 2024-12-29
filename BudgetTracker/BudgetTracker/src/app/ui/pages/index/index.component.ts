import {Component, OnDestroy, OnInit} from '@angular/core';
import {ErrorModel} from '../../../models/ErrorModel';
import {Budget} from '../../../models/Budget';
import {HttpService} from '../../../services/http/httpService';
import {Subscription} from 'rxjs';
import {HttpResponse} from '@angular/common/http';
import {SubscriptionUtils} from '../../../util/subscription.utils';
import {DateUtils} from "../../../util/date.utils";
import {RequestModel} from "../../../models/RequestModel";
import {SpinnerSize} from "../../components/shared/spinner/spinner.component";

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
  protected requestModel: RequestModel;
  protected readonly DateUtils = DateUtils;
  protected readonly SpinnerSize = SpinnerSize;
  protected isLoaded: boolean = false;

  constructor(private httpService: HttpService) {
  }

  ngOnInit(): void {
    const currentYear = new Date().getFullYear();
    this.requestModel = new RequestModel();
    this.requestModel.page = 1;
    this.requestModel.pageSize = 12;
    this.requestModel.fromDate = DateUtils
      .format(new Date(currentYear, 0, 1));
    this.requestModel.toDate = DateUtils
      .format(new Date(currentYear, 11, 31));
    this.budgets = [];
    this.subscriptions = [];
    this.errorModel = new ErrorModel();

    this.subscriptions.push(
      this.httpService.getBudgets(this.requestModel).subscribe({
        next: (response: HttpResponse<Budget[]>): void => {
          this.budgets = response.body;
          this.errorModel.responseStatusCode = response.status
          this.isLoaded = true;
        },
        error: (err) => {
          this.errorModel.responseErrorMessage = err
          this.isLoaded = true;
        }
      })
    )

  }


  ngOnDestroy(): void {
    SubscriptionUtils.unsubscribeAll(this.subscriptions);
  }
}
