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
import {SpinnerSize} from "../../shared/spinner/spinner.component";
import {HttpResponse} from "@angular/common/http";
import {HttpService} from "../../../../services/http/httpService";

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrl: './payment.component.css'
})
export class PaymentComponent implements OnInit, OnDestroy {
  @ViewChild('paymentModal') paymentModal: any;
  @Input() idBudget: string;
  @Output() refreshPaymentEvent = new EventEmitter<boolean>();
  protected readonly SpinnerSize = SpinnerSize;
  protected readonly NumberUtils = NumberUtils;
  protected subscriptions: Subscription[];
  protected errorModel: ErrorModel;
  protected paymentForm: PaymentForm;
  protected idPayment: string;
  protected isEditing: boolean;
  protected displayLoader: boolean;
  protected displayError: boolean;
  protected buttonCopyName: string;

  constructor(
    private modalService: NgbModal,
    private httpService: HttpService) {
  }

  ngOnInit(): void {
    this.subscriptions = [];
    this.errorModel = new ErrorModel();
    this.displayLoader = false;
    this.displayError = false;
    this.isEditing = false;
    this.buttonCopyName = "Copy";
  }

  ngOnDestroy(): void {
    SubscriptionUtils.unsubscribeAll(this.subscriptions);
  }

  open(paymentData?: PaymentModel): void {
    this.setDefaultPaymentForm();
    this.displayError = false;
    this.isEditing = paymentData != null;

    if (paymentData) {
      this.idPayment = paymentData.id;
      this.paymentForm.name = paymentData.name;
      this.paymentForm.price = paymentData.price;
      this.paymentForm.refund = paymentData.refund;
      this.paymentForm.isPaid = paymentData.isPaid;
      this.paymentForm.comment = paymentData.comment;
    }

    this.modalService.open(this.paymentModal, ModalOptions.default(ModalSize.BIG));
  }

  protected savePayment(): void {
    this.displayLoader = true;

    const isPaid = String(this.paymentForm.isPaid);
    this.paymentForm.isPaid = JSON.parse(isPaid)

    setTimeout((): void => {
      if (this.isEditing) {
        this.updatePayment();
      } else {
        this.createBudgetPayment();
      }
    }, 500);
  }

  protected copy(inputElement: any): any {
    this.buttonCopyName = "Copied";
    inputElement.select();
    //this is so far deprecated but
    //there is no any best alternatives for now
    document.execCommand('copy');
    inputElement.setSelectionRange(0, 0);
    setTimeout((): void => {
      this.buttonCopyName = "Copy";
    }, 2500)
  }

  private updatePayment(): void {
    this.subscriptions.push(
      this.httpService.updatePayment(
        this.paymentForm,
        this.idPayment).subscribe({
        next: (response: HttpResponse<any>): void => {
          this.onRequestSuccess(response);
        },
        error: (err): void => {
          this.onRequestFailed(err);
        }
      })
    )
  }

  private createBudgetPayment(): void {
    this.subscriptions.push(
      this.httpService.createBudgetPayment(
        this.paymentForm,
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
    this.refreshPaymentEvent.emit(true);
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

  private setDefaultPaymentForm(): void {
    this.paymentForm = {
      name: "",
      price: BigNumber(0.00),
      refund: BigNumber(0.00),
      isPaid: false,
      comment: ""
    } as PaymentForm;
  }
}
