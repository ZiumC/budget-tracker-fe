import {Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
import {Subscription} from "rxjs";
import {SubscriptionUtils} from "../../../../util/subscription.utils";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {ResponseModel} from "../../../../models/response.model";
import {SpinnerSize} from "../../shared/spinner/spinner.component";
import {HttpResponse} from "@angular/common/http";
import {HttpService} from "../../../../services/http/http.service";
import {TimerUtils} from "../../../../util/timer.utils";
import {ConfigService} from "../../../../services/config/config.service";
import {AppConfig} from "../../../../models/config/config";
import {ModalOptions, ModalSize, ModalUtils} from "../../../../util/modal.utils";
import {Form} from "../../../../models/config/form.model.config";
import {formatString} from "../../../../util/string.utils";
import {subtract} from "../../../../util/number.util";
import {GetPaymentDto, PaymentDto} from "../../../../models/dto/payment.model.dto";

@Component({
  selector: 'app-payment-modal',
  templateUrl: './payment-modal.component.html',
  styleUrl: './payment-modal.component.css'
})
export class PaymentModalComponent implements OnInit, OnDestroy {
  @ViewChild('paymentModal') paymentModal: any;
  @ViewChild('errorModal') errorModal: any;
  @Input() idBudget: string;
  @Output() refreshPaymentEvent = new EventEmitter<boolean>();
  protected readonly formatString = formatString;
  protected readonly subtract = subtract;
  protected readonly ModalUtils = ModalUtils;
  protected readonly SpinnerSize = SpinnerSize;
  protected appConfig: AppConfig;
  protected formConfig: Form;
  protected subscriptions: Subscription[];
  protected responseErrorModel: ResponseModel;
  protected paymentForm: PaymentDto;
  protected idPayment: string;
  protected isEditing: boolean;
  protected displayLoader: boolean;
  protected buttonCopyName: string;

  constructor(
    private modalService: NgbModal,
    private httpService: HttpService,
    private configService: ConfigService) {
  }

  ngOnInit(): void {
    this.subscriptions = [];
    this.responseErrorModel = new ResponseModel();
    this.displayLoader = false;
    this.isEditing = false;
    this.buttonCopyName = "Copy";

    this.configService.config.subscribe(config => {
      if (config) {
        this.appConfig = config.app;
        if (config.app.form) {
          this.formConfig = config.app.form;
        } else {
          throw Error("Form config not defined");
        }
      } else {
        throw Error("Config not defined");
      }
    })

  }

  ngOnDestroy(): void {
    SubscriptionUtils.unsubscribeAll(this.subscriptions);
  }

  open(paymentData?: GetPaymentDto): void {
    this.setDefaultPaymentForm();
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

    new TimerUtils(this.appConfig.animation.duration.default).start()
      .subscribe(finished => {
        if (finished) {
          if (this.isEditing) {
            this.updatePayment();
          } else {
            this.createBudgetPayment();
          }
        }
      });
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
    this.responseErrorModel.statusCode = response.status;
    this.modalService.dismissAll();
    this.displayLoader = false;
  }

  private onRequestFailed(err: any): void {
    this.responseErrorModel.traceId = err.headers.get('X-Trace-Id');
    this.responseErrorModel.statusCode = err.status;
    this.responseErrorModel.statusCode = err.error;
    this.displayLoader = false;
    this.errorModal.open(this.responseErrorModel);
  }

  private setDefaultPaymentForm(): void {
    this.paymentForm = {
      name: "",
      isPaid: false,
      comment: ""
    } as PaymentDto;
  }
}
