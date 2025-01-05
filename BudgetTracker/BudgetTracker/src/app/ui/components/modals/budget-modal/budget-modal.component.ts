import {Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
import {Subscription} from "rxjs";
import {ErrorModel} from "../../../../models/ErrorModel";
import {SubscriptionUtils} from "../../../../util/subscription.utils";
import {BudgetModel} from "../../../../models/RequestModels";
import {ModalOptions} from "../../../../util/modal.utils";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";

@Component({
  selector: 'app-budget-modal',
  templateUrl: './budget-modal.component.html',
  styleUrl: './budget-modal.component.css'
})
export class BudgetModalComponent implements OnInit, OnDestroy {
  @ViewChild('budgetModal') budgetModal: any;
  @Output() refreshIncomeEvent = new EventEmitter<boolean>();
  protected subscriptions: Subscription[];
  protected errorModel: ErrorModel;
  protected isEditing: boolean;

  constructor(
    private modalService: NgbModal) {
  }

  ngOnDestroy(): void {
    SubscriptionUtils.unsubscribeAll(this.subscriptions);
  }

  ngOnInit(): void {
    this.errorModel = new ErrorModel();
    this.subscriptions = [];
    this.isEditing = false;
  }

  open(budgetData?: BudgetModel): void {
    this.isEditing = budgetData != null;

    this.modalService.open(this.budgetModal, ModalOptions.default());
  }
}
