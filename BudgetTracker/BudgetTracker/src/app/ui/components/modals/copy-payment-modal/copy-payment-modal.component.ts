import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {ModalOptions, ModalSize, ModalUtils} from "../../../../util/modal.utils";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {HttpService} from "../../../../services/http/http.service";
import {ConfigService} from "../../../../services/config/config.service";
import {formatString} from "../../../../util/string.utils";
import {NgModel} from "@angular/forms";
import {DatePicker} from "../../../../models/datepicker.model";
import {DatePickerUtil, DateUtil, isInvalidDate} from "../../../../util/date.util";
import {AppConfig} from "../../../../models/config/config";
import {FormConfig} from "../../../../models/config/form.model.config";
import {format} from "../../../../util/number.util";
import {GetBudgetDto} from "../../../../models/dto/budget.model.dto";
import {ResponseModel} from "../../../../models/response.model";

@Component({
  selector: 'app-copy-payment-modal',
  templateUrl: './copy-payment-modal.component.html',
  styleUrl: './copy-payment-modal.component.css'
})
export class CopyPaymentModalComponent implements OnInit, OnDestroy {
  @ViewChild('copyPaymentModal') copyModal: any;
  protected readonly formatString = formatString;
  protected readonly DateUtils = DateUtil;
  protected readonly ModalUtils = ModalUtils;
  protected selectedBudgets: string[] = [];
  protected budgets: GetBudgetDto[] | null;
  protected budgetsResponseModel: ResponseModel;
  protected currentStep: number = 1;
  protected fromDatePicker: DatePicker;
  protected toDatePicker: DatePicker;
  protected appConfig: AppConfig;
  protected formConfig: FormConfig;


  constructor(
    private modalService: NgbModal,
    private httpService: HttpService,
    private configService: ConfigService) {
  }


  ngOnDestroy(): void {
  }

  ngOnInit(): void {
    const appCfg = this.configService.getAppConfig();
    if (appCfg) {
      this.appConfig = appCfg;
      this.formConfig = appCfg.form;
    } else {
      throw Error("Config not provided");
    }

    this.setDefaultDates();
    this.searchBudgets();
    this.budgets = [{
      id: "aaaa",
      name: "Janurary",
      dateStart: new Date(),
      dateEnd: new Date()
    } as GetBudgetDto, {id: "bbbbbb", name: "Feb", dateStart: new Date(), dateEnd: new Date()} as GetBudgetDto]
  }

  onCheckBudget(id: string): void {
    let selectedBudgetIndex = this.selectedBudgets.indexOf(id);
    if (selectedBudgetIndex > -1) {
      this.selectedBudgets = this.selectedBudgets.filter((_, i) => i !== selectedBudgetIndex);
    } else {
      this.selectedBudgets.push(id);
    }
  }

  protected setDefaultDates(): void {
    const fromDate = DateUtil.setMonthsToDate(DateUtil.firstDayOfCurrentMonth(), 1);
    const toDate = DateUtil.setMonthsToDate(DateUtil.lastDayOfCurrentMonth(), 7);

    this.fromDatePicker = DatePickerUtil.convertToDatePicker(fromDate);
    this.toDatePicker = DatePickerUtil.convertToDatePicker(toDate);
  }

  protected searchBudgets(): void {
    let fromDate: Date = DatePickerUtil.convertToDate(this.fromDatePicker);
    let toDate: Date = DatePickerUtil.convertToDate(this.toDatePicker);

    //TO DO...
  }

  open(): void {
    this.selectedBudgets = [];
    this.setDefaultDates();
    this.modalService.open(this.copyModal, ModalOptions.default(ModalSize.BIG));
  }

  protected goNext(): void {
    this.currentStep = this.currentStep + 1;
  }

  protected goBack(): void {
    this.currentStep = this.currentStep - 1;
  }

  protected save(): void {

  }
}
