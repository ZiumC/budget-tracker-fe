import {Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
import {IncomeForm} from "../../../../models/FormModels";
import {IncomeModel} from "../../../../models/RequestModels";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {ModalOptions} from "../../../../util/modal.utils";
import BigNumber from "bignumber.js";
import {Subscription} from "rxjs";
import {HttpService} from "../../../../services/http/httpService";
import {ErrorModel} from "../../../../models/ErrorModel";
import {SubscriptionUtils} from "../../../../util/subscription.utils";
import {SpinnerSize} from "../../shared/spinner/spinner.component";
import {HttpResponse} from "@angular/common/http";

@Component({
  selector: 'app-income',
  templateUrl: './income.component.html',
  styleUrl: './income.component.css'
})
export class IncomeComponent implements OnInit, OnDestroy {
  @ViewChild('incomeModal') content: any;
  @Input() idBudget: string;
  @Output() refreshIncomeEvent = new EventEmitter<boolean>();
  protected readonly SpinnerSize = SpinnerSize;
  protected subscriptions: Subscription[];
  protected errorModel: ErrorModel;
  protected incomeForm: IncomeForm;
  protected idIncome: string;
  protected displayLoader: boolean;
  protected isEditing: boolean;


  constructor(
    private modalService: NgbModal,
    private httpService: HttpService) {
  }

  ngOnDestroy(): void {
    SubscriptionUtils.unsubscribeAll(this.subscriptions);
  }

  ngOnInit(): void {
    this.setDefaultIncomeForm();
    this.errorModel = new ErrorModel();
    this.subscriptions = [];
    this.displayLoader = false;
    this.isEditing = false;
  }

  open(incomeData?: IncomeModel): void {
    this.setDefaultIncomeForm();
    this.isEditing = incomeData != null;

    if (incomeData) {
      this.idIncome = incomeData.id;
      this.incomeForm.name = incomeData.name;
      this.incomeForm.wage = incomeData.wage;
      this.incomeForm.isSurplus = incomeData.isSurplus;
    }

    this.modalService.open(this.content, ModalOptions.default());
  }

  protected saveIncome(): void {
    this.displayLoader = true;

    const surplus = String(this.incomeForm.isSurplus);
    this.incomeForm.isSurplus = JSON.parse(surplus)

    if (this.isEditing) {
      this.updateIncome()
    } else {
      this.createIncome();
    }
  }

  private updateIncome(): void {
    this.subscriptions.push(
      this.httpService.updateIncome(
        this.incomeForm,
        this.idIncome).subscribe({
        next: (response: HttpResponse<any>): void => {
          this.onRequestSuccess(response);
        },
        error: (err): void => {
          this.onRequestFailed(err);
        }
      })
    )
  }

  private createIncome(): void {
    this.subscriptions.push(
      this.httpService.createBudgetIncome(
        this.incomeForm,
        this.idBudget).subscribe({
        next: (response: HttpResponse<any>): void => {
          this.onRequestSuccess(response);
        },
        error: (err): void => {
          this.onRequestFailed(err);
        }
      })
    )
  }

  private onRequestSuccess(response: HttpResponse<any>): void {
    this.refreshIncomeEvent.emit(true);
    this.errorModel.responseStatusCode = response.status;
    setTimeout(() => {
      this.displayLoader = false;
      this.modalService.dismissAll();
    }, 400)
  }

  private onRequestFailed(err: any): void {
    this.errorModel.traceId = err.headers.get('X-Trace-Id');
    this.errorModel.responseStatusCode = err.status;
    this.errorModel.responseErrorModel = err.error;
    this.displayLoader = false;
  }

  private setDefaultIncomeForm(): void {
    this.incomeForm = {
      name: "",
      wage: new BigNumber(0.00),
      isSurplus: false
    } as IncomeModel;
  }
}
