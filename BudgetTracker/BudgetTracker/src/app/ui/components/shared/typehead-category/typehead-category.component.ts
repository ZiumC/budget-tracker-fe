import {Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
import {CategoryType, GetPaymentCategoryDto} from "../../../../models/dto/category.model.dto";
import {formatString} from "../../../../util/string.utils";
import {ModalUtils} from "../../../../util/modal.utils";
import {debounceTime, distinctUntilChanged, map, merge, Observable, Subject, Subscription} from "rxjs";
import {RequestParams} from "../../../../models/requestParams";
import {HttpResponse} from "@angular/common/http";
import {HttpService} from "../../../../services/http/http.service";
import {ConfigService} from "../../../../services/config/config.service";
import {SubscriptionUtils} from "../../../../util/subscription.utils";
import {FormConfig} from "../../../../models/config/form.model.config";
import {AppConfig} from "../../../../models/config/config";

@Component({
  selector: 'app-typehead-category',
  templateUrl: './typehead-category.component.html',
  styleUrl: './typehead-category.component.css'
})
export class TypeheadCategoryComponent implements OnInit, OnDestroy {
  @ViewChild('typeahead') typeahead: any;
  @Input() categoryType: CategoryType | null;
  @Input() selectedCategoryDto: GetPaymentCategoryDto = new GetPaymentCategoryDto();
  @Input() assignmentComment: string;
  @Input() isEditing: boolean;
  @Input() assignmentStatusCode: number;
  @Output() validationEvent = new EventEmitter<boolean>();
  @Output() categoryEvent = new EventEmitter<{ category: GetPaymentCategoryDto, assignmentComment: string }>();
  protected readonly CategoryType = CategoryType;
  protected readonly formatString = formatString;
  protected readonly ModalUtils = ModalUtils;
  protected formConfig: FormConfig;
  protected appConfig: AppConfig;
  protected subscriptions: Subscription[] = [];
  protected categoriesDto: GetPaymentCategoryDto[] | null;
  protected focusSubject = new Subject<string>();
  protected clickSubject = new Subject<string>();
  protected deleteSubject = new Subject<string>();

  constructor(
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

    if (!this.isEditing || this.assignmentStatusCode != 200) {
      this.typeheadClear();
    }

    this.getCategories();
    this.emitValidation();
  }

  ngOnDestroy(): void {
    SubscriptionUtils.unsubscribeAll(this.subscriptions);
  }

  protected typeaheadFormatter = (x: GetPaymentCategoryDto): string => x.name;

  protected typeaheadSearch = (text$: Observable<string>): Observable<GetPaymentCategoryDto[]> => {
    const debouncedText = text$.pipe(debounceTime(200), distinctUntilChanged());
    return merge(debouncedText, this.focusSubject, this.clickSubject, this.deleteSubject).pipe(
      map(term => {
        let result: GetPaymentCategoryDto[] = [];
        if (this.categoriesDto) {
          result = this.categoriesDto;
          if (term.length >= 1) {
            result = this.categoriesDto.filter(v => v.name.toLowerCase().includes(term.toLowerCase())).slice(0, 5);
            if (result.length == 0) {
              result = [{name: this.formConfig.messages.typeahead.notfound} as GetPaymentCategoryDto];
            }
          }
        }
        return result;
      }));
  }

  protected onTypeaheadChange(): void {
    if (this.selectedCategoryDto?.name == this.formConfig.messages.typeahead.notfound) {
      this.typeheadClear();
    }
    this.emitCategoryData();
    this.emitValidation();
  }

  private emitValidation(): void {
    let result = false;
    if (this.categoryType && this.selectedCategoryDto.id) {
      result = true;
    }
    this.validationEvent.emit(result);
  }

  protected emitCategoryData(): void {
    this.categoryEvent.emit({
      category: this.selectedCategoryDto,
      assignmentComment: this.assignmentComment
    });
  }

  protected onClickedCategory(type?: CategoryType): void {
    if (type && type != this.categoryType) {
      this.typeheadClear();
      this.categoryType = type;
    }
    this.getCategories();
    this.emitValidation();
  }

  protected typeheadClear(): void {
    this.selectedCategoryDto = new GetPaymentCategoryDto();
    this.assignmentComment = "";
    this.emitValidation();
  }

  private getCategories(): void {
    const categoriesOrder = this.appConfig.request.order;
    const params: RequestParams = {
      page: 1,
      pageSize: 300,
      orderBy: categoriesOrder.paymentCategoryTypes[0].value,
      order: categoriesOrder.orderDirections[0].value
    } as RequestParams;

    if (this.categoryType) {
      this.subscriptions.push(
        this.httpService.getPaymentCategories(
          this.categoryType,
          params
        ).subscribe({
          next: (response: HttpResponse<GetPaymentCategoryDto[]>): void => {
            this.categoriesDto = response.body;
          }
        })
      )
    }
  }
}
