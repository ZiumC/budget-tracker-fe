import {Component, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {IncomeForm} from "../../../../models/FormModels";
import {IncomeModel} from "../../../../models/RequestModels";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {ModalOptions} from "../../../../util/modal.utils";
import BigNumber from "bignumber.js";
import {Subscription} from "rxjs";
import {HttpService} from "../../../../services/http/httpService";
import {HttpResponse} from "@angular/common/http";
import {ErrorModel} from "../../../../models/ErrorModel";

@Component({
  selector: 'app-income',
  templateUrl: './income.component.html',
  styleUrl: './income.component.css'
})
export class IncomeComponent implements OnInit, OnDestroy {
  @ViewChild('incomeModal') content: any;
  @Input() idBudget: string;
  protected subscriptions: Subscription[] = [];
  protected errorModel: ErrorModel;
  protected incomeFormModel: IncomeForm;
  protected isEditing: boolean = false;

  constructor(
    private modalService: NgbModal,
    private httpService: HttpService) {
  }

  ngOnDestroy(): void {
  }

  ngOnInit(): void {
    this.setDefaultIncomeForm();
    this.errorModel = new ErrorModel();
  }

  open(incomeData?: IncomeModel) {
    this.isEditing = incomeData != null;

    if (incomeData) {
      this.incomeFormModel.name = incomeData.name;
      this.incomeFormModel.wage = incomeData.wage;
      this.incomeFormModel.isSurplus = incomeData.isSurplus;
    }

    this.modalService.open(this.content, ModalOptions.default())
      .result.then(
      (result) => {
        if (result == 'Save') {
          if (incomeData){
            this.updateIncome(incomeData.id)
          } else {
            this.createIncome()
          }
        } else {
          this.setDefaultIncomeForm();
        }
      }
    );
  }

  private updateIncome(idIncome: string) {
    this.subscriptions.push(
      this.httpService.updateBudgetIncome(
        this.incomeFormModel,
        idIncome).subscribe({
        next: (response: HttpResponse<any>): void => {
          this.errorModel.responseStatusCode = response.status
        },
        error: (err) => {
          this.errorModel.traceId = err.headers.get('X-Trace-Id');
          this.errorModel.responseStatusCode = err.status;
          this.errorModel.responseErrorModel = err.error;
        }
      })
    )
  }

  private createIncome() {
    this.subscriptions.push(
      this.httpService.createBudgetIncome(
        this.incomeFormModel,
        this.idBudget).subscribe({
        next: (response: HttpResponse<any>): void => {
          this.errorModel.responseStatusCode = response.status
        },
        error: (err) => {
          this.errorModel.traceId = err.headers.get('X-Trace-Id');
          this.errorModel.responseStatusCode = err.status;
          this.errorModel.responseErrorModel = err.error;
        }
      })
    )
  }

  private setDefaultIncomeForm() {
    this.incomeFormModel = {
      name: "",
      wage: new BigNumber(0.00),
      isSurplus: false
    } as IncomeForm;
  }
}
