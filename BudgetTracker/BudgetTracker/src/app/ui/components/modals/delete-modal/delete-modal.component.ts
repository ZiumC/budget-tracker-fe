import {Component, EventEmitter, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
import {Subscription} from "rxjs";
import {SubscriptionUtils} from "../../../../util/subscription.utils";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {HttpService} from "../../../../services/http/http.service";
import {HttpResponse} from "@angular/common/http";
import {ResponseModel} from "../../../../models/response.model";
import {SpinnerSize} from "../../shared/spinner/spinner.component";
import {ModalOptions, ModalSize} from "../../../../util/modal.utils";
import {GetBudgetDto} from "../../../../models/dto/budget.model.dto";
import {GetIncomeDto} from "../../../../models/dto/income.model.dto";
import {GetPaymentDto} from "../../../../models/dto/payment.model.dto";
import {ConfigService} from "../../../../services/config/config.service";
import {AppConfig} from "../../../../models/config/config";
import {TimerUtils} from "../../../../util/timer.utils";
import {generateErrorModel} from "../../../../util/http.util";
import {GetPlannedPaymentDto} from "../../../../models/dto/planned-payment.model.dto";
import {GetCategoryDto} from "../../../../models/dto/category.model.dto";

@Component({
  selector: 'app-delete-modal',
  templateUrl: './delete-modal.component.html',
  styleUrl: './delete-modal.component.css'
})
export class DeleteModalComponent implements OnInit, OnDestroy {
  @ViewChild('deleteModal') deleteModal: any;
  @ViewChild('errorModal') errorModal: any;
  @Output() indexPageEvent = new EventEmitter<boolean>();
  @Output() refreshIncomeEvent = new EventEmitter<boolean>();
  @Output() refreshPaymentEvent = new EventEmitter<boolean>();
  @Output() refreshPlannedPaymentEvent = new EventEmitter<boolean>();
  @Output() refreshCategoryEvent = new EventEmitter<boolean>();
  protected readonly SpinnerSize = SpinnerSize;
  protected appConfig: AppConfig;
  protected subscriptions: Subscription[];
  protected responseModel: ResponseModel;
  protected displayLoader: boolean;
  private paymentDto: GetPaymentDto | null;
  private plannedPaymentDto: GetPlannedPaymentDto | null;
  private budgetDto: GetBudgetDto | null;
  private incomeDto: GetIncomeDto | null;
  private categoryDto: GetCategoryDto | null;

  constructor(
    private modalService: NgbModal,
    private httpService: HttpService,
    private configService: ConfigService) {
  }

  ngOnInit(): void {
    this.displayLoader = false;
    this.subscriptions = [];
    this.responseModel = new ResponseModel();

    const appCfg = this.configService.getAppConfig();
    if (appCfg) {
      this.appConfig = appCfg;
    } else {
      throw Error("Config not provided")
    }
  }

  ngOnDestroy(): void {
    SubscriptionUtils.unsubscribeAll(this.subscriptions);
  }

  openWithCategory(category: GetCategoryDto): void {
    this.displayLoader = false;
    this.categoryDto = new GetCategoryDto();
    this.categoryDto = category;

    this.modalService
      .open(this.deleteModal, ModalOptions.default(ModalSize.SMALL));
  }

  openWithPayment(payment: GetPaymentDto): void {
    this.displayLoader = false;
    this.paymentDto = new GetPaymentDto();
    this.paymentDto = payment;

    this.modalService
      .open(this.deleteModal, ModalOptions.default(ModalSize.SMALL));
  }

  openWithPlannedPayment(plannedPayment: GetPlannedPaymentDto): void {
    this.displayLoader = false;
    this.plannedPaymentDto = new GetPlannedPaymentDto();
    this.plannedPaymentDto = plannedPayment;

    this.modalService
      .open(this.deleteModal, ModalOptions.default(ModalSize.SMALL));
  }

  openWithIncome(income: GetIncomeDto): void {
    this.displayLoader = false;
    this.incomeDto = new GetIncomeDto();
    this.incomeDto = income;

    this.modalService
      .open(this.deleteModal, ModalOptions.default(ModalSize.SMALL));
  }

  openWithBudget(budget: GetBudgetDto): void {
    this.displayLoader = false;
    this.budgetDto = new GetBudgetDto();
    this.budgetDto = budget;

    this.modalService
      .open(this.deleteModal, ModalOptions.default(ModalSize.SMALL));
  }

  delete(): void {
    this.displayLoader = true;
    const idBudget = this.budgetDto?.id;
    const idIncome = this.incomeDto?.id;
    const idPayment = this.paymentDto?.id;
    const idPlannedPayment = this.plannedPaymentDto?.id;
    const idCategory = this.categoryDto?.id;

    new TimerUtils(this.appConfig.animation.duration.default).start()
      .subscribe(finished => {
        if (finished) {
          if (idBudget) {
            this.deleteBudget(idBudget);
          } else if (idIncome) {
            this.deleteIncome(idIncome);
          } else if (idPayment) {
            this.deletePayment(idPayment);
          } else if (idPlannedPayment) {
            this.deletePlannedPayment(idPlannedPayment);
          } else if (idCategory) {
            this.deleteCategory(idCategory);
          } else {
            this.displayLoader = false;
          }
        }
      })

    this.removeReferences();
  }

  cancel(): void {
    this.removeReferences();
    this.modalService.dismissAll();
  }

  private removeReferences(): void {
    this.incomeDto = null;
    this.budgetDto = null;
    this.paymentDto = null;
    this.plannedPaymentDto = null;
    this.categoryDto = null;
  }

  private deletePayment(idPayment: string): void {
    this.subscriptions.push(
      this.httpService.deletePayment(
        idPayment,
        false).subscribe({
        next: (response: HttpResponse<any>): void => {
          this.onRequestSuccess(response);
          this.refreshPaymentEvent.emit(true);
        },
        error: (err): void => {
          this.onRequestFailed(err);
        }
      })
    )
  }

  private deletePlannedPayment(idPlannedPayment: string): void {
    this.subscriptions.push(
      this.httpService.deletePayment(
        idPlannedPayment,
        true).subscribe({
        next: (response: HttpResponse<any>): void => {
          this.onRequestSuccess(response);
          this.refreshPlannedPaymentEvent.emit(true);
        },
        error: (err): void => {
          this.onRequestFailed(err);
        }
      })
    )
  }

  private deleteIncome(idIncome: string): void {
    this.subscriptions.push(
      this.httpService.deleteIncome(idIncome).subscribe({
        next: (response: HttpResponse<any>): void => {
          this.onRequestSuccess(response);
          this.refreshIncomeEvent.emit(true);
        },
        error: (err): void => {
          this.onRequestFailed(err);
        }
      })
    )
  }

  private deleteBudget(idBudget: string): void {
    this.subscriptions.push(
      this.httpService.deleteBudget(idBudget).subscribe({
        next: (response: HttpResponse<any>): void => {
          this.onRequestSuccess(response);
          this.indexPageEvent.emit(true);
        },
        error: (err): void => {
          this.onRequestFailed(err);
        }
      })
    )
  }

  private deleteCategory(idCategory: string): void {
    this.subscriptions.push(
      this.httpService.deleteCategory(idCategory).subscribe({
        next: (response: HttpResponse<any>): void => {
          this.onRequestSuccess(response);
          this.refreshCategoryEvent.emit(true);
        },
        error: (err): void => {
          this.onRequestFailed(err);
        }
      })
    )
  }

  private onRequestSuccess(response: HttpResponse<any>): void {
    this.responseModel.statusCode = response.status;
    this.modalService.dismissAll();
    this.displayLoader = false;
  }

  private onRequestFailed(err: any): void {
    this.displayLoader = false;
    this.responseModel = generateErrorModel(err);
    this.errorModal.open(this.responseModel);
  }
}
