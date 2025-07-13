import {Component, Input, OnInit} from '@angular/core';
import {formatString} from "../../../../util/string.utils";
import {ModalUtils} from "../../../../util/modal.utils";
import {ConfigService} from "../../../../services/config/config.service";
import {FormConfig} from "../../../../models/config/form.model.config";
import {AppConfig} from "../../../../models/config/config";
import {GetIncomeCategoryDto, GetPaymentCategoryDto} from "../../../../models/dto/category.model.dto";
import {debounceTime, distinctUntilChanged, map, merge, Observable, Subject} from "rxjs";

@Component({
  selector: 'app-typehead',
  templateUrl: './typehead.component.html',
  styleUrl: './typehead.component.css'
})
export class TypeheadComponent implements OnInit {
  @Input() categoriesDto: GetPaymentCategoryDto[] | GetIncomeCategoryDto[] | null;
  @Input() isPaymentCategories: boolean;
  protected readonly formatString = formatString;
  protected readonly ModalUtils = ModalUtils;
  protected selectedCategoryDto: GetPaymentCategoryDto | GetIncomeCategoryDto;
  protected assignmentComment: string;
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

    if (this.isPaymentCategories == undefined){
      throw Error("Unknown is this payment category or income category");
    }

    if (this.isPaymentCategories) {
      this.selectedCategoryDto = new GetPaymentCategoryDto();
    } else {
      this.selectedCategoryDto = new GetIncomeCategoryDto();
    }
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

  protected onTypeaheadChange(): void {
    if (this.selectedCategoryDto?.name == this.formConfig.messages.typeahead.notfound) {
      this.typeheadClear();
    }
  }

  protected typeheadClear(): void {
    if (this.isPaymentCategories){
      this.selectedCategoryDto = new GetPaymentCategoryDto();
    } else {
      this.selectedCategoryDto = new GetIncomeCategoryDto();
    }
    this.assignmentComment = "";
  }
}
