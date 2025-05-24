import {
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import {AppConfig} from "../../../../models/config/config";
import {
  debounceTime,
  distinctUntilChanged,
  map,
  merge,
  Observable,
  Subject,
  Subscription
} from "rxjs";
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
import {generateErrorModel} from "../../../../util/http.util";
import {TimerUtils} from "../../../../util/timer.utils";
import {CategoryType, GetCategoryDto} from "../../../../models/dto/category.model.dto";
import {getPaymentType} from "../../../../util/category.utils";
import {RequestParams} from "../../../../models/requestParams";

@Component({
  selector: 'app-planned-payments-modal',
  templateUrl: './planned-payments-modal.component.html',
  styleUrl: './planned-payments-modal.component.css'
})
export class PlannedPaymentsModalComponent implements OnInit, OnDestroy {
  @ViewChild('plannedPaymentModal') plannedPaymentModal: any;
  @ViewChild('errorModal') errorModal: any;
  @ViewChild('typeahead') typeahead: any;
  @Input() idBudget: string;
  @Input() assignmentStatusCode: number;
  @Output() refreshEvent = new EventEmitter<boolean>();
  protected readonly SpinnerSize = SpinnerSize;
  protected readonly ModalUtils = ModalUtils;
  protected readonly formatString = formatString;
  // protected readonly CategoryType = CategoryType;
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
  protected categoryDto: GetCategoryDto;


  // protected categoriesDto: GetCategoryDto[] | null;
  // protected focusSubject = new Subject<string>();
  // protected clickSubject = new Subject<string>();
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

        this.categoryDto = plannedPaymentAssignment.category;
        this.plannedPaymentDto.assignmentComment = plannedPaymentAssignment.comment;


        // this.onClickedCategory();
      }
    }

    this.modalService.open(this.plannedPaymentModal, ModalOptions.default(ModalSize.BIG));
  }

  protected onChildChanged(isValid: boolean): void {
    this.isChildValid = isValid;
  }

  protected savePlannedPayment(): void {
    this.displayLoader = true;

    const isPaid = String(this.plannedPaymentDto.isPaid);
    this.plannedPaymentDto.isPaid = JSON.parse(isPaid)
    this.plannedPaymentDto.idPaymentCategory = this.categoryDto.id;

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

  // protected typeaheadFormatter = (x: GetCategoryDto): string => x.name;
  //
  // protected typeaheadSearch = (text$: Observable<string>): Observable<GetCategoryDto[]> => {
  //   const debouncedText = text$.pipe(debounceTime(200), distinctUntilChanged());
  //   return merge(debouncedText, this.focusSubject, this.clickSubject).pipe(
  //     map(term => {
  //       let result: GetCategoryDto[] = [];
  //       if (this.categoriesDto) {
  //         result = this.categoriesDto;
  //         if (term.length >= 1) {
  //           result = this.categoriesDto.filter(v => v.name.toLowerCase().includes(term.toLowerCase())).slice(0, 5);
  //           if (result.length == 0) {
  //             result = [{name: this.formConfig.messages.typeahead.notfound} as GetCategoryDto];
  //           }
  //         }
  //       }
  //       return result;
  //     }));
  // }
  //
  // protected onTypeaheadChange(): void {
  //   if (this.categoryDto?.name == this.formConfig.messages.typeahead.notfound) {
  //     this.typeheadClear();
  //   }
  // }
  //
  // protected typeheadClear(): void {
  //   this.categoryDto = new GetCategoryDto();
  // }
  //
  // protected onClickedCategory(type?: CategoryType): void {
  //   if (type && type != this.categoryType) {
  //     this.categoryDto = new GetCategoryDto();
  //     this.categoryType = type;
  //   }
  //
  //   const categoriesOrder = this.appConfig.request.order;
  //   const params: RequestParams = {
  //     page: 1,
  //     pageSize: 300,
  //     orderBy: categoriesOrder.paymentCategoryTypes[0].value,
  //     order: categoriesOrder.orderDirections[0].value
  //   } as RequestParams;
  //
  //   if (this.categoryType) {
  //     this.subscriptions.push(
  //       this.httpService.getCategories(
  //         this.categoryType,
  //         params
  //       ).subscribe({
  //         next: (response: HttpResponse<GetCategoryDto[]>): void => {
  //           this.categoriesDto = response.body;
  //         }
  //       })
  //     )
  //   }
  // }

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
    this.categoryType = null;
    // this.typeheadClear();
    // this.plannedPaymentDto = new PlannedPaymentDto();
    this.plannedPaymentDto = {
      name: "",
      isPaid: false,
      comment: "",
      idPaymentCategory: "",
      assignmentComment: ""
    } as PlannedPaymentDto;
  }
}
