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
  selector: 'app-income-modal',
  templateUrl: './income-modal.component.html',
  styleUrl: './income-modal.component.css'
})
export class IncomeModalComponent implements OnInit, OnDestroy {
  @ViewChild('incomeModal') incomeModal: any;
  @Input() idBudget: string;
  @Output() refreshIncomeEvent = new EventEmitter<boolean>();
  protected readonly SpinnerSize = SpinnerSize;
  protected subscriptions: Subscription[];
  protected errorModel: ErrorModel;
  protected incomeForm: IncomeForm;
  protected idIncome: string;
  protected displayLoader: boolean;
  protected displayError: boolean;
  protected isEditing: boolean;
  protected buttonCopyName: string;

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
    this.displayError = false;
    this.isEditing = false;
    this.buttonCopyName = "Copy";
  }

  open(incomeData?: IncomeModel): void {
    this.setDefaultIncomeForm();
    this.displayError = false;
    this.isEditing = incomeData != null;

    if (incomeData) {
      this.idIncome = incomeData.id;
      this.incomeForm.name = incomeData.name;
      this.incomeForm.wage = incomeData.wage;
      this.incomeForm.isSurplus = incomeData.isSurplus;
    }

    this.modalService.open(this.incomeModal, ModalOptions.default());
  }

  protected saveIncome(): void {
    this.displayLoader = true;

    const surplus = String(this.incomeForm.isSurplus);
    this.incomeForm.isSurplus = JSON.parse(surplus)

    setTimeout((): void => {
      if (this.isEditing) {
        this.updateIncome()
      } else {
        this.createIncome();
      }
    }, 500);
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
    this.modalService.dismissAll();
    setTimeout((): void => {
      this.displayLoader = false;
    }, 500)
  }

  private onRequestFailed(err: any): void {
    this.errorModel.traceId = err.headers.get('X-Trace-Id');
    this.errorModel.responseStatusCode = err.status;
    this.errorModel.responseErrorModel = err.error;
    this.displayLoader = false;
    this.displayError = true;
  }

  private setDefaultIncomeForm(): void {
    this.displayError = false;
    this.incomeForm = {
      name: "",
      wage: new BigNumber(0.00),
      isSurplus: false
    } as IncomeModel;
  }
}
