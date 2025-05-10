import {Component, EventEmitter, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
import {SpinnerSize} from "../../shared/spinner/spinner.component";
import {ModalOptions, ModalUtils} from "../../../../util/modal.utils";
import {CategoryDto, GetCategoryDto} from "../../../../models/dto/category.model.dto";
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
  @Output() refreshCategoryTypesEvent = new EventEmitter<string[]>();
  protected readonly SpinnerSize = SpinnerSize;
  protected readonly ModalUtils = ModalUtils;
  protected readonly formatString = formatString;
  protected subscriptions: Subscription[] = [];
  protected responseModel: ResponseModel;
  protected appConfig: AppConfig;
  protected formConfig: FormConfig;
  protected categoryDto: GetCategoryDto;
  protected selectedCategory: string;
  protected categoryType: string;
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
    this.categoryDto = new GetCategoryDto();
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

  open(categoryType: string, categoryData?: GetCategoryDto): void {
    this.setDefaultCategoryForm();
    this.isEditing = categoryData != null;
    this.categoryType = categoryType;
    this.selectedCategory = categoryType;

    if (categoryData) {
      this.categoryDto.id = categoryData.id;
      this.categoryDto.name = categoryData.name;
      this.categoryDto.dateUpdated = categoryData.dateUpdated;
      this.categoryDto.description = categoryData.description;
      this.categoryDto.isSavings = categoryData.isSavings;
      this.categoryDto.isNeeds = categoryData.isNeeds;
      this.categoryDto.isWants = categoryData.isWants;
    }

    this.modalService.open(this.categoryModal, ModalOptions.default());
  }

  protected saveCategory(): void {
    const categoryModal = this.formConfig.categoryModal;
    this.categoryDto.isNeeds = this.selectedCategory == categoryModal.needsName;
    this.categoryDto.isWants = this.selectedCategory == categoryModal.wantsName;
    this.categoryDto.isSavings = this.selectedCategory == categoryModal.savingsName;

    const categoryToSave = {
      name: this.categoryDto.name,
      description: this.categoryDto.description,
      isNeeds: JSON.parse(String(this.categoryDto.isNeeds)),
      isWants: JSON.parse(String(this.categoryDto.isWants)),
      isSavings: JSON.parse(String(this.categoryDto.isSavings)),
    } as CategoryDto;

    this.displayLoader = true;

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

  private updateCategory(categoryId: string, categoryToSave: CategoryDto): void {
    this.subscriptions.push(
      this.httpService.updateCategory(
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

  private createCategory(categoryToSave: CategoryDto): void {
    this.subscriptions.push(
      this.httpService.createCategory(
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

  private onRequestSuccess(response: HttpResponse<any>): void {
    const types = [this.categoryType, this.selectedCategory];
    this.refreshCategoryTypesEvent.emit(types);
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
    this.categoryDto = new GetCategoryDto();
  }
}
