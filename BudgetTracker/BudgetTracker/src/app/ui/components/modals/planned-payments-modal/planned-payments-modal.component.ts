import {Component, EventEmitter, HostListener, Input, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
import {AppConfig} from "../../../../models/config/config";
import {debounceTime, distinctUntilChanged, map, Observable, OperatorFunction, Subscription} from "rxjs";
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
import {HttpResponse} from "@angular/common/http";
import {generateErrorModel} from "../../../../util/http.util";
import {TimerUtils} from "../../../../util/timer.utils";
import {GetCategoryDto} from "../../../../models/dto/category.model.dto";
import {GetAssignmentDto} from "../../../../models/dto/assignment.model.dto";
import {getPaymentType} from "../../../../util/category.utils";

@Component({
  selector: 'app-planned-payments-modal',
  templateUrl: './planned-payments-modal.component.html',
  styleUrl: './planned-payments-modal.component.css'
})
export class PlannedPaymentsModalComponent implements OnInit, OnDestroy {
  @ViewChild('plannedPaymentModal') plannedPaymentModal: any;
  @ViewChild('errorModal') errorModal: any;
  @Input() idBudget: string;
  @Output() refreshEvent = new EventEmitter<boolean>();
  protected readonly SpinnerSize = SpinnerSize;
  protected readonly ModalUtils = ModalUtils;
  protected readonly formatString = formatString;
  protected subscriptions: Subscription[] = [];
  protected appConfig: AppConfig;
  protected responseModel: ResponseModel;
  protected plannedPaymentDto: PlannedPaymentDto;
  protected selectedCategory: string;
  protected displayLoader: boolean;
  protected isEditing: boolean;
  protected idPlannedPayment: string;
  protected formConfig: FormConfig;
  model: string = '';
  fruits = ['Apple', 'Banana', 'Orange', 'Grape', 'Mango', 'Pineapple'];
  public innerWidth: any;

  constructor(
    private modalService: NgbModal,
    private httpService: HttpService,
    private configService: ConfigService) {
  }

  search = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      map(term => term.length < 1 ? []
        : this.fruits.filter(v => v.toLowerCase().includes(term.toLowerCase())).slice(0, 5))
    );

  ngOnInit(): void {
    const appCfg = this.configService.getAppConfig();
    if (appCfg) {
      this.appConfig = appCfg;
      this.formConfig = appCfg.form;
    } else {
      throw Error("Config not provided")
    }

    this.selectedCategory = "";
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
      this.selectedCategory = getPaymentType(plannedPaymentData, false, this.appConfig);
    }

    this.modalService.open(this.plannedPaymentModal, ModalOptions.default(ModalSize.BIG));
  }

  protected savePlannedPayment(): void {
    this.displayLoader = true;

    const isPaid = String(this.plannedPaymentDto.isPaid);
    this.plannedPaymentDto.isPaid = JSON.parse(isPaid)

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
    this.responseModel = generateErrorModel(err);
    this.displayLoader = false;
    this.errorModal.open(this.responseModel);
  }

  private setDefaultPlannedPaymentForm(): void {
    this.plannedPaymentDto = {
      name: "",
      isPaid: false,
      comment: ""
    } as PlannedPaymentDto;
  }

  protected readonly getPaymentType = getPaymentType;
}
