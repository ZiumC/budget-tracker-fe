import {Component, OnDestroy, OnInit} from '@angular/core';
import {CategoryType} from "../../../models/dto/category.model.dto";
import {AppConfig} from "../../../models/config/config";
import {HttpService} from "../../../services/http/http.service";
import {ConfigService} from "../../../services/config/config.service";
import {FormConfig} from "../../../models/config/form.model.config";
import {formatString} from "../../../util/string.utils";
import {Subject} from "rxjs";

@Component({
  selector: 'app-category-page',
  templateUrl: './category-page.component.html',
  styleUrl: './category-page.component.css'
})
export class CategoryPageComponent implements OnInit {
  protected readonly formatString = formatString;
  protected readonly CategoryType = CategoryType;
  protected searchSubject: Subject<string> = new Subject<string>();
  protected clearSubject: Subject<boolean> = new Subject<boolean>();
  protected formConfig: FormConfig;
  protected searchBox: string;

  constructor(
    private configService: ConfigService) {
  }

  ngOnInit(): void {
    const appCfg = this.configService.getAppConfig();
    if (appCfg) {
      this.formConfig = appCfg.form;
    } else {
      throw Error("Config not provided");
    }

    this.searchBox = "";
  }

  protected clearInput(): void {
    if (this.searchBox.length != 0) {
      this.searchBox = "";
      this.clearSubject.next(true);
    } else {
      this.clearSubject.next(false);
    }
  }

  protected emitSearchSubject(): void {
    this.searchSubject.next(this.searchBox);
  }
}
