import {Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
import {CategoryType, GetCategoryDto} from "../../../../models/dto/category.model.dto";
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
  @Input() selectedCategoryDto: GetCategoryDto = new GetCategoryDto();
  @Input() assignmentComment: string;
  @Input() isEditing: boolean;
  @Input() assignmentStatusCode: number;
  @Output() validationEvent: EventEmitter<boolean> = new EventEmitter<boolean>();
  // @Input() validationEvents: Observable<void>;
  // @Output() isValidEvent: EventEmitter<boolean> = new EventEmitter<boolean>;
  protected readonly CategoryType = CategoryType;
  protected readonly formatString = formatString;
  protected readonly ModalUtils = ModalUtils;
  protected formConfig: FormConfig;
  protected appConfig: AppConfig;
  protected subscriptions: Subscription[] = [];
  protected categoriesDto: GetCategoryDto[] | null;
  protected focusSubject = new Subject<string>();
  protected clickSubject = new Subject<string>();

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

    if (!this.isEditing || this.assignmentStatusCode != 200){
      this.typeheadClear();
    }
  }

  ngOnDestroy(): void {
    SubscriptionUtils.unsubscribeAll(this.subscriptions);
  }

  protected typeaheadFormatter = (x: GetCategoryDto): string => x.name;

  protected typeaheadSearch = (text$: Observable<string>): Observable<GetCategoryDto[]> => {
    const debouncedText = text$.pipe(debounceTime(200), distinctUntilChanged());
    return merge(debouncedText, this.focusSubject, this.clickSubject).pipe(
      map(term => {
        let result: GetCategoryDto[] = [];
        if (this.categoriesDto) {
          result = this.categoriesDto;
          if (term.length >= 1) {
            result = this.categoriesDto.filter(v => v.name.toLowerCase().includes(term.toLowerCase())).slice(0, 5);
            if (result.length == 0) {
              result = [{name: this.formConfig.messages.typeahead.notfound} as GetCategoryDto];
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
    this.emitValidation();
  }

  private emitValidation(): void {
    let result = false;
    if (this.categoryType && this.selectedCategoryDto.id) {
      result = true;
    }
    this.validationEvent.emit(result);
  }

  protected onClickedCategory(type?: CategoryType): void {
    if (type && type != this.categoryType) {
      this.typeheadClear();
      this.categoryType = type;
    }

    const categoriesOrder = this.appConfig.request.order;
    const params: RequestParams = {
      page: 1,
      pageSize: 300,
      orderBy: categoriesOrder.paymentCategoryTypes[0].value,
      order: categoriesOrder.orderDirections[0].value
    } as RequestParams;

    if (this.categoryType) {
      this.subscriptions.push(
        this.httpService.getCategories(
          this.categoryType,
          params
        ).subscribe({
          next: (response: HttpResponse<GetCategoryDto[]>): void => {
            this.categoriesDto = response.body;
          }
        })
      )
    }

    this.emitValidation();
  }

  protected typeheadClear(): void {
    this.selectedCategoryDto = new GetCategoryDto();
    this.categoryType = null;
    this.emitValidation();
  }
}
