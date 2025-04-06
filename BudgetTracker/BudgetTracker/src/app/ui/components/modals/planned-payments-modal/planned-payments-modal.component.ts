import {Component, HostListener, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {AppConfig} from "../../../../models/config/config";
import {Subscription} from "rxjs";
import {ResponseModel} from "../../../../models/response.model";
import {SubscriptionUtils} from "../../../../util/subscription.utils";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {HttpService} from "../../../../services/http/http.service";
import {ConfigService} from "../../../../services/config/config.service";
import {ModalOptions, ModalSize, ModalUtils} from "../../../../util/modal.utils";
import {GetPlannedPaymentDto, PlannedPaymentDto} from "../../../../models/dto/planned-payment.model.dto";
import {SpinnerSize} from "../../shared/spinner/spinner.component";
import {formatString} from "../../../../util/string.utils";
import {subtract} from "../../../../util/number.util";
import {FormConfig} from "../../../../models/config/form.model.config";

@Component({
  selector: 'app-planned-payments-modal',
  templateUrl: './planned-payments-modal.component.html',
  styleUrl: './planned-payments-modal.component.css'
})
export class PlannedPaymentsModalComponent implements OnInit, OnDestroy {
  @ViewChild('plannedPaymentModal') plannedPaymentModal: any;
  @ViewChild('errorModal') errorModal: any;
  @Input() idBudget: string;
  protected readonly SpinnerSize = SpinnerSize;
  protected readonly ModalUtils = ModalUtils;
  protected readonly formatString = formatString;
  protected readonly subtract = subtract;
  protected subscriptions: Subscription[] = [];
  protected appConfig: AppConfig;
  protected responseModel: ResponseModel;
  protected plannedPaymentDto: PlannedPaymentDto;
  protected displayLoader: boolean;
  protected isEditing: boolean;
  protected idPlannedPayment: string;
  protected formConfig: FormConfig;
  public innerWidth: any;

  constructor(
    private modalService: NgbModal,
    private httpService: HttpService,
    private configService: ConfigService) {
  }

  ngOnInit(): void {
    const appCfg = this.configService.getAppConfig();
    if (appCfg) {
      this.appConfig = appCfg;
      this.formConfig = appCfg.form;
    } else {
      throw Error("Config not provided")
    }

    this.responseModel = new ResponseModel();
    ModalUtils.defaultSettings(this.displayLoader, this.isEditing);
    this.innerWidth = window.innerWidth;
  }

  @HostListener('window:resize', ['$event'])
  onResize(): void {
    this.innerWidth = window.innerWidth;
  }

  ngOnDestroy(): void {
    SubscriptionUtils.unsubscribeAll(this.subscriptions);
  }

  open(plannedPaymentData?: GetPlannedPaymentDto): void {
    this.setDefaultPlannedPaymentForm();
    this.isEditing = plannedPaymentData != null;

    if (plannedPaymentData) {
      this.idPlannedPayment = plannedPaymentData.id;
      this.plannedPaymentDto.name = plannedPaymentData.name;
      this.plannedPaymentDto.estimated = plannedPaymentData.estimated;
      this.plannedPaymentDto.realPrice = plannedPaymentData.realPrice;
      this.plannedPaymentDto.isPaid = plannedPaymentData.isPaid;
      this.plannedPaymentDto.comment = plannedPaymentData.comment;
    }

    this.modalService.open(this.plannedPaymentModal, ModalOptions.default(ModalSize.BIG));
  }

  protected savePayment(): void {

  }

  private setDefaultPlannedPaymentForm(): void {
    this.plannedPaymentDto = {
      name: "",
      isPaid: false,
      comment: ""
    } as PlannedPaymentDto;
  }
}
