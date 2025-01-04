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

@Component({
  selector: 'app-income',
  templateUrl: './income.component.html',
  styleUrl: './income.component.css'
})
export class IncomeComponent implements OnInit, OnDestroy {
  @ViewChild('incomeModal') content: any;
  @Input() idBudget: string;
  @Output() refreshEvent = new EventEmitter<boolean>();
  protected readonly SpinnerSize = SpinnerSize;
  protected subscriptions: Subscription[];
  protected errorModel: ErrorModel;
  protected incomeData: IncomeModel;
  protected displayModalLoader: boolean;
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
    this.displayModalLoader = false;
    this.isEditing = false;
  }

  open(incomeData?: IncomeModel) {
    this.setDefaultIncomeForm();

    this.isEditing = incomeData != null;
    if (incomeData) {
      this.incomeData = incomeData;
    }

    this.modalService.open(this.content, ModalOptions.default());
  }

  protected saveIncome() {
    this.displayModalLoader = true;

    const incomeForm = {
      name: this.incomeData.name,
      wage: this.incomeData.wage,
      isSurplus: JSON.parse(String(this.incomeData.isSurplus))
    } as IncomeForm;

    if (this.isEditing) {
      this.updateIncome(incomeForm, this.incomeData.id)
    } else {
      this.createIncome(incomeForm);
    }
  }

  private updateIncome(incomeForm: IncomeForm, idIncome: string) {
    this.subscriptions.push(
      this.httpService.updateBudgetIncome(incomeForm, idIncome).subscribe({
        next: () => {
          this.refreshEvent.emit(true);
          setTimeout(() => {
            this.displayModalLoader = false;
            this.modalService.dismissAll();
          }, 500)
        },
        error: (err) => {
          this.errorModel.traceId = err.headers.get('X-Trace-Id');
          this.errorModel.responseStatusCode = err.status;
          this.errorModel.responseErrorModel = err.error;
          this.displayModalLoader = false;
        }
      })
    )
  }

  private createIncome(incomeForm: IncomeForm) {
    this.subscriptions.push(
      this.httpService.createBudgetIncome(incomeForm, this.idBudget).subscribe({
        next: () => {
          this.refreshEvent.emit(true);
          setTimeout(() => {
            this.displayModalLoader = false;
            this.modalService.dismissAll();
          }, 500)
        },
        error: (err) => {
          this.errorModel.traceId = err.headers.get('X-Trace-Id');
          this.errorModel.responseStatusCode = err.status;
          this.errorModel.responseErrorModel = err.error;
          this.displayModalLoader = false;
        }
      })
    )
  }

  private setDefaultIncomeForm() {
    this.incomeData = {
      name: "",
      wage: new BigNumber(0.00),
      isSurplus: false
    } as IncomeModel;
  }
}
