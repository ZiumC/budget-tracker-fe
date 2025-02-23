import {Component, EventEmitter, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
import {Subscription} from "rxjs";
import {SubscriptionUtils} from "../../../../util/subscription.utils";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {HttpService} from "../../../../services/http/http.service";
import {HttpResponse} from "@angular/common/http";
import {ResponseModel} from "../../../../models/response.model";
import {SpinnerSize} from "../../shared/spinner/spinner.component";
import {ModalOptions, ModalSize} from "../../../../util/modal.utils";
import {GetBudgetDto} from "../../../../models/dto/budget.model.dto";
import {GetIncomeDto} from "../../../../models/dto/income.model.dto";
import {GetPaymentDto} from "../../../../models/dto/payment.model.dto";

@Component({
  selector: 'app-delete-modal',
  templateUrl: './delete-modal.component.html',
  styleUrl: './delete-modal.component.css'
})
export class DeleteModalComponent implements OnInit, OnDestroy {
  @ViewChild('deleteModal') deleteModal: any;
  @ViewChild('errorModal') errorModal: any;
  @Output() indexPageEvent = new EventEmitter<boolean>();
  @Output() refreshIncomeEvent = new EventEmitter<boolean>();
  @Output() refreshPaymentEvent = new EventEmitter<boolean>();
  protected readonly SpinnerSize = SpinnerSize;
  protected subscriptions: Subscription[];
  private paymentModel: GetPaymentDto | null;
  private budgetModel: GetBudgetDto | null;
  private incomeModel: GetIncomeDto | null;
  protected errorModel: ResponseModel;
  protected displayLoader: boolean;

  constructor(
    private modalService: NgbModal,
    private httpService: HttpService) {
  }

  ngOnInit(): void {
    this.displayLoader = false;
    this.subscriptions = [];
    this.errorModel = new ResponseModel();
  }

  ngOnDestroy(): void {
    SubscriptionUtils.unsubscribeAll(this.subscriptions);
  }

  openWithPayment(payment: GetPaymentDto): void {
    this.displayLoader = false;
    this.paymentModel = new GetPaymentDto();
    this.paymentModel = payment;

    this.modalService
      .open(this.deleteModal, ModalOptions.default(ModalSize.SMALL))
  }

  openWithIncome(income: GetIncomeDto): void {
    this.displayLoader = false;
    this.incomeModel = new GetIncomeDto();
    this.incomeModel = income;

    this.modalService
      .open(this.deleteModal, ModalOptions.default(ModalSize.SMALL))
  }

  openWithBudget(budget: GetBudgetDto): void {
    this.displayLoader = false;
    this.budgetModel = new GetBudgetDto();
    this.budgetModel = budget;

    this.modalService
      .open(this.deleteModal, ModalOptions.default(ModalSize.SMALL))
  }

  delete(): void {
    this.displayLoader = true;
    const idBudget = this.budgetModel?.id;
    const idIncome = this.incomeModel?.id;
    const idPayment = this.paymentModel?.id;

    setTimeout((): void => {
      if (idBudget) {
        this.deleteBudget(idBudget);
      } else if (idIncome) {
        this.deleteIncome(idIncome);
      } else if (idPayment) {
        this.deletePayment(idPayment);
      } else {
        this.displayLoader = false;
      }
    }, 500)

    this.removeReferences();
  }

  close(): void {
    this.removeReferences();
    this.modalService.dismissAll();
  }

  private removeReferences(): void {
    this.incomeModel = null;
    this.budgetModel = null;
    this.paymentModel = null;
  }

  private deletePayment(idPayment: string): void {
    this.subscriptions.push(
      this.httpService.deletePayment(idPayment).subscribe({
        next: (response: HttpResponse<any>): void => {
          this.onRequestSuccess(response);
          this.refreshPaymentEvent.emit(true);
        },
        error: (err): void => {
          this.onRequestFailed(err);
        }
      })
    )
  }

  private deleteIncome(idIncome: string): void {
    this.subscriptions.push(
      this.httpService.deleteIncome(idIncome).subscribe({
        next: (response: HttpResponse<any>): void => {
          this.onRequestSuccess(response);
          this.refreshIncomeEvent.emit(true);
        },
        error: (err): void => {
          this.onRequestFailed(err);
        }
      })
    )
  }

  private deleteBudget(idBudget: string): void {
    this.subscriptions.push(
      this.httpService.deleteBudget(idBudget).subscribe({
        next: (response: HttpResponse<any>): void => {
          this.onRequestSuccess(response);
          this.indexPageEvent.emit(true);
        },
        error: (err): void => {
          this.onRequestFailed(err);
        }
      })
    )
  }

  private onRequestSuccess(response: HttpResponse<any>): void {
    this.errorModel.statusCode = response.status;
    this.modalService.dismissAll();
    setTimeout((): void => {
      this.displayLoader = false;
    }, 500)
  }

  private onRequestFailed(err: any): void {
    this.errorModel.traceId = err.headers.get('X-Trace-Id');
    this.errorModel.statusCode = err.status;
    this.errorModel.error = err.error;
    this.displayLoader = false;
    this.errorModal.open(this.errorModel);
  }
}
