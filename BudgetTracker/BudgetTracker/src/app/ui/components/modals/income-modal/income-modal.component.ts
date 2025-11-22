import {Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {Subscription} from "rxjs";
import {HttpService} from "../../../../services/http/http.service";
import {SubscriptionUtils} from "../../../../util/subscription.utils";
import {SpinnerSize} from "../../shared/spinner/spinner.component";
import {HttpResponse} from "@angular/common/http";
import {ModalOptions, ModalSize, ModalUtils} from "../../../../util/modal.utils";
import {GetIncomeDto, IncomeDto} from "../../../../models/dto/income.model.dto";
import {AppConfig} from "../../../../models/config/config";
import {FormConfig} from "../../../../models/config/form.model.config";
import {ConfigService} from "../../../../services/config/config.service";
import {formatString} from "../../../../util/string.utils";
import {TimerUtils} from "../../../../util/timer.utils";
import {getErrorResponse} from "../../../../util/http.util";
import {RequestModel} from "../../../../models/request.model";
import {GetIncomeCategoryDto} from "../../../../models/dto/category.model.dto";
import {NgModel} from "@angular/forms";
import BigNumber from "bignumber.js";
import {format, subtract} from "../../../../util/number.util";
import {GetIncomeAssignmentDto} from "../../../../models/dto/assignment.model.dto";

@Component({
  selector: 'app-income-modal',
  templateUrl: './income-modal.component.html',
  styleUrl: './income-modal.component.css'
})
export class IncomeModalComponent implements OnInit, OnDestroy {
  @ViewChild('incomeModal') incomeModal: any;
  @ViewChild('errorModal') errorModal: any;
  @Input() idBudget: string;
  @Input() assignmentStatusCode: number;
  @Output() refreshIncomeEvent = new EventEmitter<boolean>();
  protected readonly SpinnerSize = SpinnerSize;
  protected readonly ModalUtils = ModalUtils;
  protected readonly formatString = formatString;
  protected appConfig: AppConfig;
  protected formConfig: FormConfig;
  protected subscriptions: Subscription[] = [];
  protected incomeDto: IncomeDto;
  protected displayLoader: boolean;
  protected isEditing: boolean;
  protected isChildValid: boolean;
  protected incomeCategoriesDto: GetIncomeCategoryDto[] | null;
  protected assignedCategoryDto: GetIncomeCategoryDto;
  private idIncome: string;
  public innerWidth: any;

  constructor(
    private modalService: NgbModal,
    private httpService: HttpService,
    private configService: ConfigService) {
  }

  ngOnDestroy(): void {
    SubscriptionUtils.unsubscribeAll(this.subscriptions);
  }

  ngOnInit(): void {
    this.setDefaultIncomeForm();
    ModalUtils.defaultSettings(this.displayLoader, this.isEditing);

    const appCfg = this.configService.getAppConfig();
    if (appCfg) {
      this.appConfig = appCfg;
      this.formConfig = appCfg.form;
    } else {
      throw Error("Config not provided")
    }

    this.isChildValid = false;
  }

  open(incomeData?: GetIncomeDto): void {
    this.getCategories();
    this.setDefaultIncomeForm();
    this.isEditing = incomeData != null;

    if (incomeData) {
      this.idIncome = incomeData.id;
      this.incomeDto.name = incomeData.name;
      this.incomeDto.wage = incomeData.wage;
      this.incomeDto.savings = incomeData.savings;
      this.incomeDto.isSurplus = incomeData.isSurplus;
      this.incomeDto.forSavings = incomeData.forSavings;

      const incomeAssignment = incomeData.assignment;
      if (incomeAssignment) {
        this.assignedCategoryDto = incomeAssignment.category;
        this.incomeDto.assignmentComment = incomeAssignment.comment;
      }
    }

    this.modalService.open(this.incomeModal, ModalOptions.default(ModalSize.BIG));
  }

  protected validateSavings(wageModel: NgModel, savingsModel: NgModel): void {
    const wage = new BigNumber(this.incomeDto.wage!).toNumber();
    const savings = new BigNumber(this.incomeDto.savings!).toNumber();

    wageModel.control.markAsTouched();
    savingsModel.control.markAsTouched();

    if (wage < savings) {
      wageModel.control.setErrors({wageTooLow: true});
      savingsModel.control.setErrors({savingsTooBig: true});
    } else if (wage >= savings) {
      wageModel.control.setErrors({wageTooLow: null});
      wageModel.control.updateValueAndValidity();
      savingsModel.control.setErrors({savingsTooBig: null});
      savingsModel.control.updateValueAndValidity();
    } else if (!savings){
      wageModel.control.setErrors({wageTooLow: null});
      wageModel.control.updateValueAndValidity();
    }

    if (this.incomeDto.forSavings){
      savingsModel.control.setErrors({savingsTooBig: null});
      savingsModel.control.updateValueAndValidity();
    }
  }

  protected onSurplusTypeChange(wageModel: NgModel): void {
    this.incomeDto.wage = null;
    wageModel.control.markAsTouched();
  }

  protected saveIncome(): void {
    this.displayLoader = true;

    const surplus = String(this.incomeDto.isSurplus);
    this.incomeDto.isSurplus = JSON.parse(surplus);
    this.incomeDto.idIncomeCategory = this.assignedCategoryDto.id;

    if (!this.incomeDto.savings) {
      this.incomeDto.savings = new BigNumber(0);
    }

    if (!this.incomeDto.wage) {
      this.incomeDto.wage = new BigNumber(0);
    }

    new TimerUtils(this.appConfig.animation.duration.default).start()
      .subscribe(finished => {
        if (finished) {
          if (this.isEditing) {
            this.updateIncome()
          } else {
            this.createIncome();
          }
        }
      })
  }

  protected onTypeheadChanged(isValid: boolean): void {
    this.isChildValid = isValid;
  }

  protected onCategoryChanged(result: { category: GetIncomeCategoryDto, assignmentComment: string }): void {
    this.assignedCategoryDto = result.category;
    this.incomeDto.assignmentComment = result.assignmentComment;
  }

  private updateIncome(): void {
    this.subscriptions.push(
      this.httpService.updateIncome(
        this.idIncome,
        this.incomeDto).subscribe({
        next: (): void => {
          this.onRequestSuccess();
        },
        error: (err): void => {
          this.onRequestFailed(err);
        }
      })
    )
  }

  private createIncome(): void {
    this.subscriptions.push(
      this.httpService.createBudgetIncome(
        this.idBudget,
        this.incomeDto).subscribe({
        next: (): void => {
          this.onRequestSuccess();
        },
        error: (err): void => {
          this.onRequestFailed(err);
        }
      })
    )
  }

  private onRequestSuccess(): void {
    this.refreshIncomeEvent.emit(true);
    this.modalService.dismissAll();
    this.displayLoader = false;
  }

  private onRequestFailed(err: any): void {
    this.displayLoader = false;
    this.errorModal.open(getErrorResponse(err));
  }

  private setDefaultIncomeForm(): void {
    this.incomeDto = {
      name: "",
      isSurplus: false,
      forSavings: false,
      idIncomeCategory: "",
      assignmentComment: ""
    } as IncomeDto;
  }

  private getCategories(): void {
    this.subscriptions.push(
      this.httpService.getIncomeCategories(
        this.getRequestParams()
      ).subscribe({
        next: (response: HttpResponse<GetIncomeCategoryDto[]>): void => {
          this.incomeCategoriesDto = response.body;
        }
      })
    );
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

  protected readonly console = console;
  protected readonly BigNumber = BigNumber;
  protected readonly format = format;
  protected readonly subtract = subtract;
}
