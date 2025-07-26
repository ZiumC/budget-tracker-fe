import {Component, EventEmitter, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
import {SpinnerSize} from "../../shared/spinner/spinner.component";
import {ModalOptions, ModalUtils} from "../../../../util/modal.utils";
import {
  CategoryType,
  GetCategoryDto,
  GetPaymentCategoryDto, IncomeCategoryDto,
  PaymentCategoryDto
} from "../../../../models/dto/category.model.dto";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {HttpService} from "../../../../services/http/http.service";
import {ConfigService} from "../../../../services/config/config.service";
import {Subscription} from "rxjs";
import {SubscriptionUtils} from "../../../../util/subscription.utils";
import {AppConfig} from "../../../../models/config/config";
import {FormConfig} from "../../../../models/config/form.model.config";
import {ResponseModel} from "../../../../models/response.model";
import {formatString} from "../../../../util/string.utils";
import {generateErrorModel} from "../../../../util/http.util";
import {TimerUtils} from "../../../../util/timer.utils";
import {HttpResponse} from "@angular/common/http";

@Component({
  selector: 'app-category-modal',
  templateUrl: './category-modal.component.html',
  styleUrl: './category-modal.component.css'
})
export class CategoryModalComponent implements OnInit, OnDestroy {
  @ViewChild('categoryModal') categoryModal: any;
  @ViewChild('errorModal') errorModal: any;
  @Output() categoryChangeTypeEvent = new EventEmitter<string[]>();
  protected readonly SpinnerSize = SpinnerSize;
  protected readonly ModalUtils = ModalUtils;
  protected readonly formatString = formatString;
  protected readonly CategoryType = CategoryType;
  protected subscriptions: Subscription[] = [];
  protected responseModel: ResponseModel;
  protected appConfig: AppConfig;
  protected formConfig: FormConfig;
  protected categoryDto: GetPaymentCategoryDto;
  protected categoryType: string;
  protected selectedCategoryName: string;
  protected displayLoader: boolean;
  protected isEditing: boolean;

  constructor(
    private modalService: NgbModal,
    private httpService: HttpService,
    private configService: ConfigService) {
  }

  ngOnInit(): void {
    this.setDefaultCategoryForm();
    this.responseModel = new ResponseModel();
    this.categoryDto = new GetPaymentCategoryDto();
    ModalUtils.defaultSettings(this.displayLoader, this.isEditing);

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

  open(categoryType: CategoryType, categoryData?: GetCategoryDto): void {
    this.setDefaultCategoryForm();
    this.isEditing = categoryData != null;
    this.categoryType = categoryType.valueOf();
    this.selectedCategoryName = categoryType.valueOf();

    if (categoryData) {
      this.categoryDto.id = categoryData.id;
      this.categoryDto.name = categoryData.name;
      this.categoryDto.dateUpdated = categoryData.dateUpdated;
      this.categoryDto.description = categoryData.description;

      if (categoryType != CategoryType.INCOMES) {
        this.categoryDto.isSavings = (categoryData as GetPaymentCategoryDto).isSavings;
        this.categoryDto.isNeeds = (categoryData as GetPaymentCategoryDto).isNeeds;
        this.categoryDto.isWants = (categoryData as GetPaymentCategoryDto).isWants;
      }
    }

    this.modalService.open(this.categoryModal, ModalOptions.default());
  }

  protected save(): void {
    this.displayLoader = true;

    let categoryToSave: PaymentCategoryDto | IncomeCategoryDto;
    if (this.categoryType == CategoryType.INCOMES) {
      categoryToSave = new IncomeCategoryDto();
      categoryToSave.name = this.categoryDto.name;
      categoryToSave.description = this.categoryDto.description;

    } else {
      const categoryForm = this.formConfig.categoryModal;
      this.categoryDto.isNeeds = this.selectedCategoryName == categoryForm.needsName;
      this.categoryDto.isWants = this.selectedCategoryName == categoryForm.wantsName;
      this.categoryDto.isSavings = this.selectedCategoryName == categoryForm.savingsName;

      categoryToSave = {
        name: this.categoryDto.name,
        description: this.categoryDto.description,
        isNeeds: JSON.parse(String(this.categoryDto.isNeeds)),
        isWants: JSON.parse(String(this.categoryDto.isWants)),
        isSavings: JSON.parse(String(this.categoryDto.isSavings))
      } as PaymentCategoryDto;
    }

    new TimerUtils(this.appConfig.animation.duration.default).start()
      .subscribe(finished => {
        if (finished) {
          if (this.isEditing) {
            this.updateCategory(this.categoryDto.id, categoryToSave);
          } else {
            this.createCategory(categoryToSave);
          }
        }
      });
  }

  private updateCategory(categoryId: string, categoryToSave: IncomeCategoryDto | PaymentCategoryDto): void {
    if (categoryToSave instanceof IncomeCategoryDto) {
      this.subscriptions.push(
        this.httpService.updateIncomeCategory(
          categoryId,
          categoryToSave
        ).subscribe({
          next: (response: HttpResponse<any>): void => {
            this.onRequestSuccess(response);
          },
          error: (err): void => {
            this.onRequestFailed(err);
          }
        })
      );
    } else {
      this.subscriptions.push(
        this.httpService.updatePaymentCategory(
          categoryId,
          categoryToSave
        ).subscribe({
          next: (response: HttpResponse<any>): void => {
            this.onRequestSuccess(response);
          },
          error: (err): void => {
            this.onRequestFailed(err);
          }
        })
      );
    }
  }

  private createCategory(categoryToSave: IncomeCategoryDto | PaymentCategoryDto): void {
    if (categoryToSave instanceof IncomeCategoryDto) {
      this.subscriptions.push(
        this.httpService.createIncomeCategory(
          categoryToSave
        ).subscribe({
          next: (response: HttpResponse<any>): void => {
            this.onRequestSuccess(response);
          },
          error: (err): void => {
            this.onRequestFailed(err);
          }
        })
      );
    } else {
      this.subscriptions.push(
        this.httpService.createPaymentCategory(
          categoryToSave
        ).subscribe({
          next: (response: HttpResponse<any>): void => {
            this.onRequestSuccess(response);
          },
          error: (err): void => {
            this.onRequestFailed(err);
          }
        })
      );
    }
  }

  private onRequestSuccess(response: HttpResponse<any>): void {
    const types = [this.categoryType, this.selectedCategoryName];
    this.categoryChangeTypeEvent.emit(types);
    this.responseModel.statusCode = response.status;
    this.modalService.dismissAll();
    this.displayLoader = false;
  }

  private onRequestFailed(err: any): void {
    this.responseModel = generateErrorModel(err);
    this.displayLoader = false;
    this.errorModal.open(this.responseModel);
  }

  private setDefaultCategoryForm(): void {
    this.categoryDto = new GetPaymentCategoryDto();
  }
}
