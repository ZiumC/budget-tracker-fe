import { Component, OnDestroy, OnInit } from '@angular/core';
import { ErrorModel } from '../../../models/ErrorModel';
import { Budget } from '../../../models/Budget';
import { HttpService } from '../../../services/http/httpService';
import { Subscription } from 'rxjs';
import { HttpResponse } from '@angular/common/http';
import { SubscriptionUtils } from '../../../util/subscription.utils';
import {DateUtils} from "../../../util/date.utils";

@Component({
  selector: 'app-index',
  templateUrl: './index.component.html',
  styleUrl: './index.component.css'
})
export class IndexComponent implements OnInit, OnDestroy {
  protected errorModel: ErrorModel;
  protected budgets: Budget[] | null;
  protected subscriptions: Subscription[];

  constructor(private httpService: HttpService) { }

  ngOnInit(): void {
    this.budgets = [];
    this.subscriptions = [];
    this.errorModel = new ErrorModel();
    this.subscriptions.push(
      this.httpService.getBudgets(1, 12).subscribe({
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

  public test() {
    console.log(this.budgets);
  }

  ngOnDestroy(): void {
    SubscriptionUtils.unsubscribeAll(this.subscriptions);
  }

  protected readonly DateUtils = DateUtils;
}
