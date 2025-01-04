import {Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
import {Subscription} from "rxjs";
import {SubscriptionUtils} from "../../../../util/subscription.utils";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {PaymentModel} from "../../../../models/RequestModels";
import {ModalOptions, ModalSize} from "../../../../util/modal.utils";
import {PaymentForm} from "../../../../models/FormModels";
import {ErrorModel} from "../../../../models/ErrorModel";
import BigNumber from "bignumber.js";
import {NumberUtils} from "../../../../util/number.utils";

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrl: './payment.component.css'
})
export class PaymentComponent implements OnInit, OnDestroy {
  @ViewChild('paymentModal') paymentModal: any;
  @Input() idBudget: string;
  @Output() refreshPaymentEvent = new EventEmitter<boolean>();
  protected subscriptions: Subscription[];
  protected errorModel: ErrorModel;
  protected paymentForm: PaymentForm;
  protected isEditing: boolean;

  constructor(
    private modalService: NgbModal) {
  }


  ngOnInit(): void {
    this.subscriptions = [];
    this.errorModel = new ErrorModel();
    this.isEditing = false;
  }

  ngOnDestroy(): void {
    SubscriptionUtils.unsubscribeAll(this.subscriptions);
  }

  open(paymentData?: PaymentModel): void {
    this.setDefaultIncomeForm();
    this.isEditing = paymentData != null;

    this.modalService.open(this.paymentModal, ModalOptions.default(ModalSize.BIG));
  }

  private setDefaultIncomeForm(): void {
    this.paymentForm = {
      name: "",
      price: BigNumber(0.00),
      refund: BigNumber(0.00),
      isPaid: false,
      comment: ""
    } as PaymentForm;
  }

  protected readonly NumberUtils = NumberUtils;
}
