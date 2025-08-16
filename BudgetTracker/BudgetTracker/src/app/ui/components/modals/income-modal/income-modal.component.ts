import {Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {Subscription} from "rxjs";
import {HttpService} from "../../../../services/http/http.service";
import {ResponseModel} from "../../../../models/response.model";
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
import {generateErrorModel} from "../../../../util/http.util";
import {RequestModel} from "../../../../models/request.model";
import {GetIncomeCategoryDto} from "../../../../models/dto/category.model.dto";

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
  protected responseModel: ResponseModel;
  protected incomeDto: IncomeDto;
  protected displayLoader: boolean;
  protected isEditing: boolean;
  protected isChildValid: boolean;
  protected incomeCategoriesDto: GetIncomeCategoryDto[] | null;
  protected assignedCategoryDto: GetIncomeCategoryDto;
  private idIncome: string;

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
    this.responseModel = new ResponseModel();

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

      const incomeAssignment = incomeData.assignment;
      if (incomeAssignment) {
        this.assignedCategoryDto = incomeAssignment.category;
        this.incomeDto.assignmentComment = incomeAssignment.comment;
      }
    }

    this.modalService.open(this.incomeModal, ModalOptions.default(ModalSize.BIG));
  }

  protected saveIncome(): void {
    this.displayLoader = true;

    const surplus = String(this.incomeDto.isSurplus);
    this.incomeDto.isSurplus = JSON.parse(surplus);
    this.incomeDto.idIncomeCategory = this.assignedCategoryDto.id;

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
        next: (response: HttpResponse<any>): void => {
          this.onRequestSuccess(response);
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
    this.refreshIncomeEvent.emit(true);
    this.responseModel.statusCode = response.status;
    this.modalService.dismissAll();
    this.displayLoader = false;
  }

  private onRequestFailed(err: any): void {
    this.responseModel = generateErrorModel(err);
    this.displayLoader = false;
    this.errorModal.open(this.responseModel);
  }

  private setDefaultIncomeForm(): void {
    this.incomeDto = {
      name: "",
      isSurplus: false,
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

}
