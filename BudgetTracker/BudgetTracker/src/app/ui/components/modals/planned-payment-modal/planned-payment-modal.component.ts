import {Component, EventEmitter, HostListener, Input, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
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
import {FormConfig} from "../../../../models/config/form.model.config";
import {HttpResponse} from "@angular/common/http";
import {getErrorResponse} from "../../../../util/http.util";
import {TimerUtils} from "../../../../util/timer.utils";
import {CategoryType, GetPaymentCategoryDto} from "../../../../models/dto/category.model.dto";
import {getPaymentType} from "../../../../util/category.utils";
import BigNumber from "bignumber.js";
import {RequestModel} from "../../../../models/request.model";

@Component({
  selector: 'app-planned-payments-modal',
  templateUrl: './planned-payment-modal.component.html',
  styleUrl: './planned-payment-modal.component.css'
})
export class PlannedPaymentModalComponent implements OnInit, OnDestroy {
  @ViewChild('plannedPaymentModal') plannedPaymentModal: any;
  @ViewChild('errorModal') errorModal: any;
  @ViewChild('typeahead') typeahead: any;
  @Input() idBudget: string;
  @Input() assignmentStatusCode: number;
  @Output() refreshEvent = new EventEmitter<boolean>();
  protected readonly SpinnerSize = SpinnerSize;
  protected readonly ModalUtils = ModalUtils;
  protected readonly formatString = formatString;
  protected readonly CategoryType = CategoryType;
  protected subscriptions: Subscription[] = [];
  protected appConfig: AppConfig;
  protected formConfig: FormConfig;
  protected responseModel: ResponseModel;
  protected plannedPaymentDto: PlannedPaymentDto;
  protected displayLoader: boolean;
  protected isEditing: boolean;
  protected idPlannedPayment: string;
  protected isChildValid: boolean;
  protected categoryType: CategoryType | null;
  protected selectedPaymentCategoryType: CategoryType | null;
  protected assignedCategoryDto: GetPaymentCategoryDto;
  protected categoriesDto: GetPaymentCategoryDto[] | null;
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

      const plannedPaymentAssignment = plannedPaymentData.assignment;
      if (plannedPaymentAssignment) {
        let paymentType: string = getPaymentType(plannedPaymentAssignment, false, this.appConfig);
        switch (paymentType) {
          case this.formConfig.categoryModal.needsName:
            this.categoryType = CategoryType.NEEDS;
            break;
          case this.formConfig.categoryModal.wantsName:
            this.categoryType = CategoryType.WANTS;
            break;
          case this.formConfig.categoryModal.savingsName:
            this.categoryType = CategoryType.SAVINGS;
            break;
          default:
            this.categoryType = null;
        }

        this.selectedPaymentCategoryType = this.categoryType;
        this.assignedCategoryDto = plannedPaymentAssignment.category;
        this.plannedPaymentDto.assignmentComment = plannedPaymentAssignment.comment;
      }
    }

    this.modalService.open(this.plannedPaymentModal, ModalOptions.default(ModalSize.BIG));
  }

  protected onTypeheadChanged(isValid: boolean): void {
    this.isChildValid = isValid;
  }

  protected onCategoryChanged(result: { category: GetPaymentCategoryDto, assignmentComment: string }): void {
    this.assignedCategoryDto = result.category;
    this.plannedPaymentDto.assignmentComment = result.assignmentComment;
  }

  protected paidStatusEnabled(): boolean {
    if (this.plannedPaymentDto.realPrice) {
      return new BigNumber(this.plannedPaymentDto.realPrice).gt(0);
    }
    return false;
  }

  protected onClickedCategory(type?: CategoryType): void {
    if (type && type != this.selectedPaymentCategoryType) {
      this.selectedPaymentCategoryType = type;
    }
    this.getCategories();
  }

  protected savePlannedPayment(): void {
    this.displayLoader = true;

    const isPaid = String(this.plannedPaymentDto.isPaid);
    this.plannedPaymentDto.isPaid = JSON.parse(isPaid);
    this.plannedPaymentDto.idPaymentCategory = this.assignedCategoryDto.id;

    if (!this.plannedPaymentDto.realPrice) {
      this.plannedPaymentDto.realPrice = new BigNumber(0);
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

  private updatePayment(): void {
    this.subscriptions.push(
      this.httpService.updatePayment(
        this.idPlannedPayment,
        this.plannedPaymentDto,
        true).subscribe({
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
      this.httpService.createBudgetPlannedPayment(
        this.idBudget,
        this.plannedPaymentDto).subscribe({
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
    this.refreshEvent.emit(true);
    this.responseModel.statusCode = response.status;
    this.modalService.dismissAll();
    this.displayLoader = false;
  }

  private onRequestFailed(err: any): void {
    this.responseModel = getErrorResponse(err);
    this.displayLoader = false;
    this.errorModal.open(this.responseModel);
  }

  private setDefaultPlannedPaymentForm(): void {
    this.selectedPaymentCategoryType = null;
    this.categoryType = null;
    this.plannedPaymentDto = {
      name: "",
      isPaid: false,
      comment: "",
      idPaymentCategory: "",
      assignmentComment: ""
    } as PlannedPaymentDto;
  }

  private getCategories(): void {
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
}
