import {Component, EventEmitter, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
import {Subscription} from "rxjs";
import {SubscriptionUtils} from "../../../../util/subscription.utils";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {ModalOptions, ModalSize} from "../../../../util/modal.utils";
import {BudgetModel, IncomeModel, PaymentModel} from "../../../../models/RequestModels";

@Component({
  selector: 'app-delete-modal',
  templateUrl: './delete-modal.component.html',
  styleUrl: './delete-modal.component.css'
})
export class DeleteModalComponent implements OnInit, OnDestroy {
  @ViewChild('deleteModal') deleteModal: any;
  @Output() refreshIncomeEvent = new EventEmitter<boolean>();
  protected subscriptions: Subscription[];
  private paymentModel: PaymentModel | null;
  private budgetModel: BudgetModel | null;
  private incomeModel: IncomeModel | null;

  constructor(private modalService: NgbModal) {
  }

  ngOnInit(): void {
    this.subscriptions = [];
  }

  ngOnDestroy(): void {
    SubscriptionUtils.unsubscribeAll(this.subscriptions);
  }

  openWithPayment(payment: PaymentModel) {
    this.paymentModel = new PaymentModel();

    this.paymentModel = payment;
    this.modalService
      .open(this.deleteModal, ModalOptions.default(ModalSize.SMALL))
  }

  openWithIncome(income: IncomeModel) {
    this.incomeModel = new IncomeModel();

    this.incomeModel = income;
    this.modalService
      .open(this.deleteModal, ModalOptions.default(ModalSize.SMALL))
  }

  openWithBudget(budget: BudgetModel) {
    this.budgetModel = new BudgetModel();

    this.budgetModel = budget;
    this.modalService
      .open(this.deleteModal, ModalOptions.default(ModalSize.SMALL))
  }

  delete(): void {
    console.log(this.budgetModel?.id)
    console.log(this.paymentModel?.id)
    console.log(this.incomeModel?.id)

    this.incomeModel = null;
    this.budgetModel = null;
    this.paymentModel = null;
  }
}
