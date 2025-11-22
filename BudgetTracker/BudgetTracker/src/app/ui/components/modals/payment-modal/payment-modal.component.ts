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
import {format, subtract} from "../../../../util/number.util";
import {GetPaymentDto, PaymentDto} from "../../../../models/dto/payment.model.dto";
import {getErrorResponse} from "../../../../util/http.util";
import {CategoryType, GetPaymentCategoryDto} from "../../../../models/dto/category.model.dto";
import {getPaymentType} from "../../../../util/category.utils";
import {RequestModel} from "../../../../models/request.model";
import BigNumber from "bignumber.js";
import {NgModel} from "@angular/forms";

@Component({
  selector: 'app-payment-modal',
  templateUrl: './payment-modal.component.html',
  styleUrl: './payment-modal.component.css'
})
export class PaymentModalComponent implements OnInit, OnDestroy {
  @ViewChild('paymentModal') paymentModal: any;
  @ViewChild('errorModal') errorModal: any;
  @ViewChild('typeheadComponent') typeheadComponent: any;
  @Input() idBudget: string;
  @Input() assignmentStatusCode: number;
  @Output() refreshPaymentEvent = new EventEmitter<boolean>();
  protected readonly formatString = formatString;
  protected readonly subtract = subtract;
  protected readonly ModalUtils = ModalUtils;
  protected readonly SpinnerSize = SpinnerSize;
  protected readonly CategoryType = CategoryType;
  protected appConfig: AppConfig;
  protected formConfig: FormConfig;
  protected subscriptions: Subscription[] = [];
  protected responseModel: ResponseModel;
  protected categoriesDto: GetPaymentCategoryDto[] | null;
  protected paymentDto: PaymentDto;
  protected idPayment: string;
  protected isEditing: boolean;
  protected displayLoader: boolean;
  protected isChildValid: boolean;
  protected selectedPaymentCategoryType: CategoryType | null;
  protected assignedCategoryDto: GetPaymentCategoryDto;
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

      const paymentAssignment = paymentData.assignment;
      if (paymentAssignment) {
        let paymentType: string = getPaymentType(paymentAssignment, false, this.appConfig);
        switch (paymentType) {
          case this.formConfig.categoryModal.needsName:
            this.selectedPaymentCategoryType = CategoryType.NEEDS;
            break;
          case this.formConfig.categoryModal.wantsName:
            this.selectedPaymentCategoryType = CategoryType.WANTS;
            break;
          default:
            this.selectedPaymentCategoryType = null;
        }

        this.assignedCategoryDto = paymentAssignment.category;
        this.paymentDto.assignmentComment = paymentAssignment.comment;
      }
    }

    this.modalService.open(this.paymentModal, ModalOptions.default(ModalSize.BIG));
  }

  @HostListener('window:resize', ['$event'])
  onResize(): void {
    this.innerWidth = window.innerWidth;
  }

  protected onTypeheadChanged(isValid: boolean): void {
    this.isChildValid = isValid;
  }

  protected onCategoryChanged(result: { category: GetPaymentCategoryDto, assignmentComment: string }): void {
    this.assignedCategoryDto = result.category;
    this.paymentDto.assignmentComment = result.assignmentComment;
  }

  protected savePayment(): void {
    this.displayLoader = true;

    const isPaid = String(this.paymentDto.isPaid);
    this.paymentDto.isPaid = JSON.parse(isPaid);
    this.paymentDto.idPaymentCategory = this.assignedCategoryDto.id;

    if (!this.paymentDto.refund) {
      this.paymentDto.refund = new BigNumber(0);
    }

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

  protected onClickedCategory(type?: CategoryType): void {
    if (type && type != this.selectedPaymentCategoryType) {
      this.selectedPaymentCategoryType = type;
    }
    this.getCategories();
  }

  private updatePayment(): void {
    this.subscriptions.push(
      this.httpService.updatePayment(
        this.idPayment,
        this.paymentDto,
        false).subscribe({
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
        this.idBudget,
        this.paymentDto).subscribe({
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
    this.responseModel = getErrorResponse(err);
    this.displayLoader = false;
    this.errorModal.open(this.responseModel);
  }

  private setDefaultPaymentForm(): void {
    this.selectedPaymentCategoryType = null;
    this.paymentDto = {
      name: "",
      isPaid: false,
      comment: "",
      idPaymentCategory: "",
      assignmentComment: ""
    } as PaymentDto;
  }

  private getCategories(): void {
    this.categoriesDto = null;
    if (this.selectedPaymentCategoryType) {
      this.subscriptions.push(
        this.httpService.getPaymentCategories(
          this.selectedPaymentCategoryType,
          this.getRequestParams()
        ).subscribe({
          next: (response: HttpResponse<GetPaymentCategoryDto[]>): void => {
            this.categoriesDto = response.body;
          }
        })
      )
    }
  }

  private getRequestParams(): RequestModel {
    const categoriesOrder = this.appConfig.request.order;
    return {
      page: 1,
      pageSize: 300,
      orderBy: categoriesOrder.paymentCategoryTypes[0].value,
      order: categoriesOrder.orderDirections[0].value
    } as RequestModel;
  }

  protected readonly BigNumber = BigNumber;
  protected readonly format = format;
}
