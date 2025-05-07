import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {SpinnerSize} from "../../shared/spinner/spinner.component";
import {ModalOptions, ModalUtils} from "../../../../util/modal.utils";
import {GetCategoryDto} from "../../../../models/dto/category.model.dto";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {HttpService} from "../../../../services/http/http.service";
import {ConfigService} from "../../../../services/config/config.service";
import {Subscription} from "rxjs";
import {SubscriptionUtils} from "../../../../util/subscription.utils";
import {AppConfig} from "../../../../models/config/config";
import {FormConfig} from "../../../../models/config/form.model.config";
import {ResponseModel} from "../../../../models/response.model";
import {formatString} from "../../../../util/string.utils";

@Component({
  selector: 'app-category-modal',
  templateUrl: './category-modal.component.html',
  styleUrl: './category-modal.component.css'
})
export class CategoryModalComponent implements OnInit, OnDestroy {
  @ViewChild('categoryModal') categoryModal: any;
  @ViewChild('errorModal') errorModal: any;
  protected readonly SpinnerSize = SpinnerSize;
  protected readonly ModalUtils = ModalUtils;
  protected readonly formatString = formatString;
  protected subscriptions: Subscription[] = [];
  protected responseModel: ResponseModel;
  protected appConfig: AppConfig;
  protected formConfig: FormConfig;
  protected displayLoader: boolean;
  protected isEditing: boolean;
  protected categoryDto: GetCategoryDto;
  private categoryId: string;


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

  open(categoryData?: GetCategoryDto): void {
    this.setDefaultCategoryForm();
    this.isEditing = categoryData != null;

    if (categoryData) {
      this.categoryId = categoryData.id;
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

  }

  private setDefaultCategoryForm(): void {

  }
}
