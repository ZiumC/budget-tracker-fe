import {Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {formatString} from "../../../../util/string.utils";
import {ModalUtils} from "../../../../util/modal.utils";
import {ConfigService} from "../../../../services/config/config.service";
import {FormConfig} from "../../../../models/config/form.model.config";
import {AppConfig} from "../../../../models/config/config";
import {CategoryType, GetIncomeCategoryDto, GetPaymentCategoryDto} from "../../../../models/dto/category.model.dto";
import {debounceTime, distinctUntilChanged, map, merge, Observable, Subject} from "rxjs";

@Component({
  selector: 'app-typehead',
  templateUrl: './typehead.component.html',
  styleUrl: './typehead.component.css'
})
export class TypeheadComponent implements OnInit {
  @Input() categoriesDto: GetPaymentCategoryDto[] | GetIncomeCategoryDto[] | null;
  @Input() selectedCategoryDto: GetPaymentCategoryDto | GetIncomeCategoryDto;
  @Input() isPaymentCategories: boolean;
  @Input() assignmentComment: string;
  @Input() paymentCategoryType: CategoryType;
  @Output() validationEvent = new EventEmitter<boolean>();
  @Output() categoryEvent = new EventEmitter<{
    category: GetPaymentCategoryDto | GetIncomeCategoryDto,
    assignmentComment: string
  }>();
  @Input() isEditing: boolean;
  @Input() assignmentStatusCode: number;
  @ViewChild('form') typeheadForm: any;
  protected readonly formatString = formatString;
  protected readonly ModalUtils = ModalUtils;
  protected formConfig: FormConfig;
  protected appConfig: AppConfig;
  protected focusSubject = new Subject<string>();
  protected clickSubject = new Subject<string>();
  protected deleteSubject = new Subject<string>();

  constructor(private configService: ConfigService) {
  }

  ngOnInit(): void {
    const appCfg = this.configService.getAppConfig();
    if (appCfg) {
      this.appConfig = appCfg;
      this.formConfig = appCfg.form;
    } else {
      throw Error("Config not provided")
    }

    if (this.isPaymentCategories == undefined) {
      throw Error("Unknown is this payment category or income category");
    } else if (this.isPaymentCategories && this.paymentCategoryType == undefined) {
      throw Error("Payment category type is not provided");
    }

    if (!this.isEditing || this.assignmentStatusCode != 200) {
      this.typeheadClear();
    }

    this.emitValidation();
  }

  protected typeaheadFormatter = (x: GetPaymentCategoryDto | GetIncomeCategoryDto): string => x.name;

  protected typeaheadSearch = (text$: Observable<string>): Observable<GetPaymentCategoryDto[] | GetIncomeCategoryDto[]> => {
    const debouncedText = text$.pipe(debounceTime(200), distinctUntilChanged());
    return merge(debouncedText, this.focusSubject, this.clickSubject, this.deleteSubject).pipe(
      map(term => {
        let result: GetPaymentCategoryDto[] | GetIncomeCategoryDto[] = [];
        if (this.categoriesDto) {
          result = this.categoriesDto;
          if (term.length >= 1) {
            result = this.categoriesDto.filter(v => v.name.toLowerCase().includes(term.toLowerCase())).slice(0, 5);
            if (result.length == 0) {
              result = [{name: this.formConfig.messages.typeahead.notfound} as GetPaymentCategoryDto | GetIncomeCategoryDto];
            }
          }
        }
        return result;
      }));
  }

  protected onTypeaheadNameChange(): void {
    if (this.selectedCategoryDto?.name == this.formConfig.messages.typeahead.notfound) {
      this.typeheadClear();
    }
    this.emitCategoryData();
    this.emitValidation();
  }

  protected onTypeaheadCommentChange(): void {
    this.emitCategoryData();
    this.emitValidation();
  }

  protected typeheadClear(): void {
    if (this.isPaymentCategories) {
      this.selectedCategoryDto = new GetPaymentCategoryDto();
    } else {
      this.selectedCategoryDto = new GetIncomeCategoryDto();
    }
    this.assignmentComment = "";

    this.emitValidation();
  }

  protected emitCategoryData(): void {
    this.categoryEvent.emit({
      category: this.selectedCategoryDto,
      assignmentComment: this.assignmentComment
    });
  }

  private emitValidation(): void {
    let result: boolean[] = [];

    if (this.isPaymentCategories) {
      if (this.paymentCategoryType && this.selectedCategoryDto.id) {
        result.push(true);
      } else {
        result.push(false);
      }
    } else {
      if (this.selectedCategoryDto.id) {
        result.push(true);
      } else {
        result.push(false);
      }
    }

    if (this.typeheadForm) {
      result.push(this.typeheadForm.valid);
    }

    this.validationEvent.emit(result.every(e => {
      return e;
    }));
  }
}
