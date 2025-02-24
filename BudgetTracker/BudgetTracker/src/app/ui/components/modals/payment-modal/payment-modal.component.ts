import {Component, EventEmitter, HostListener, Input, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
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
import {FormConfig} from "../../../../models/config/form.model.config";
import {formatString} from "../../../../util/string.utils";
import {subtract} from "../../../../util/number.util";
import {GetPaymentDto, PaymentDto} from "../../../../models/dto/payment.model.dto";
import {generateErrorModel} from "../../../../util/http.util";

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
  protected formConfig: FormConfig;
  protected subscriptions: Subscription[] = [];
  protected responseModel: ResponseModel;
  protected paymentDto: PaymentDto;
  protected idPayment: string;
  protected isEditing: boolean;
  protected displayLoader: boolean;
  protected innerWidth: any;

  constructor(
    private modalService: NgbModal,
    private httpService: HttpService,
    private configService: ConfigService) {
  }

  ngOnInit(): void {
    this.setDefaultPaymentForm();
    this.responseModel = new ResponseModel();
    ModalUtils.defaultSettings(this.displayLoader, this.isEditing);

    this.innerWidth = window.innerWidth;

    const appCfg = this.configService.getAppConfig();
    if (appCfg) {
      this.appConfig = appCfg;
      this.formConfig = appCfg.form;
    } else {
      throw Error("Config not provided")
    }
  }

  ngOnDestroy(): void {
    SubscriptionUtils.unsubscribeAll(this.subscriptions);
  }

  open(paymentData?: GetPaymentDto): void {
    this.setDefaultPaymentForm();
    this.isEditing = paymentData != null;

    if (paymentData) {
      this.idPayment = paymentData.id;
      this.paymentDto.name = paymentData.name;
      this.paymentDto.price = paymentData.price;
      this.paymentDto.refund = paymentData.refund;
      this.paymentDto.isPaid = paymentData.isPaid;
      this.paymentDto.comment = paymentData.comment;
    }

    this.modalService.open(this.paymentModal, ModalOptions.default(ModalSize.BIG));
  }

  @HostListener('window:resize', ['$event'])
  onResize(): void {
    this.innerWidth = window.innerWidth;
  }

  protected savePayment(): void {
    this.displayLoader = true;

    const isPaid = String(this.paymentDto.isPaid);
    this.paymentDto.isPaid = JSON.parse(isPaid)

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
        this.paymentDto,
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
        this.paymentDto,
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
    this.responseModel.statusCode = response.status;
    this.modalService.dismissAll();
    this.displayLoader = false;
  }

  private onRequestFailed(err: any): void {
    this.responseModel = generateErrorModel(err);
    this.displayLoader = false;
    this.errorModal.open(this.responseModel);
  }

  private setDefaultPaymentForm(): void {
    this.paymentDto = {
      name: "",
      isPaid: false,
      comment: ""
    } as PaymentDto;
  }
}
