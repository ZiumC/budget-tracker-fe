import {Component, HostListener, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {ModalOptions, ModalSize, ModalUtils} from "../../../../util/modal.utils";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {HttpService} from "../../../../services/http/http.service";
import {ConfigService} from "../../../../services/config/config.service";
import {formatString} from "../../../../util/string.utils";
import {DatePicker} from "../../../../models/datepicker.model";
import {DatePickerUtil, DateUtil} from "../../../../util/date.util";
import {AppConfig} from "../../../../models/config/config";
import {FormConfig} from "../../../../models/config/form.model.config";
import {GetBudgetDto} from "../../../../models/dto/budget.model.dto";
import {ResponseModel} from "../../../../models/response.model";
import {format, subtract} from "../../../../util/number.util";
import {GetPlannedPaymentDto} from "../../../../models/dto/planned-payment.model.dto";
import BigNumber from "bignumber.js";

@Component({
  selector: 'app-copy-payment-modal',
  templateUrl: './copy-payment-modal.component.html',
  styleUrl: './copy-payment-modal.component.css'
})
export class CopyPaymentModalComponent implements OnInit, OnDestroy {
  @ViewChild('copyPaymentModal') copyModal: any;
  protected readonly formatString = formatString;
  protected readonly format = format;
  protected readonly BigNumber = BigNumber;
  protected readonly subtract = subtract;
  protected readonly DateUtils = DateUtil;
  protected readonly ModalUtils = ModalUtils;
  protected readonly maxMonths: number = 7;
  protected selectedBudgetIds: string[] = [];
  protected budgets: GetBudgetDto[] | null;
  protected budgetsResponseModel: ResponseModel;
  protected currentStep: number;
  protected fromDatePicker: DatePicker;
  protected toDatePicker: DatePicker;
  protected appConfig: AppConfig;
  protected formConfig: FormConfig;
  protected selectedBudgetId: string;
  private budgetPlannedPaymentsToCopy: Map<string, GetPlannedPaymentDto> = new Map();
  private plannedPaymentToCopy: GetPlannedPaymentDto;
  private pageWidth: number;


  constructor(
    private modalService: NgbModal,
    private httpService: HttpService,
    private configService: ConfigService) {
  }


  ngOnDestroy(): void {
  }

  @HostListener('window:resize', ['$event'])
  onResize(): void {
    this.pageWidth = window.innerWidth;
  }

  ngOnInit(): void {
    const appCfg = this.configService.getAppConfig();
    if (appCfg) {
      this.appConfig = appCfg;
      this.formConfig = appCfg.form;
    } else {
      throw Error("Config not provided");
    }

    this.pageWidth = window.innerWidth;

    this.setDefaultDates();
    this.searchBudgets();
    this.budgets = [{
      id: "aaaa",
      name: "Janurary",
      dateStart: new Date(),
      dateEnd: new Date()
    } as GetBudgetDto, {id: "bbbbbb", name: "Feb", dateStart: new Date(), dateEnd: new Date()} as GetBudgetDto,
      {
        id: "g",
        name: "Janurary",
        dateStart: new Date(),
        dateEnd: new Date()
      } as GetBudgetDto, {id: "c", name: "Feb", dateStart: new Date(), dateEnd: new Date()} as GetBudgetDto, {
        id: "d",
        name: "Janurary",
        dateStart: new Date(),
        dateEnd: new Date()
      } as GetBudgetDto, {id: "e", name: "Feb", dateStart: new Date(), dateEnd: new Date()} as GetBudgetDto]
  }

  onCheckBudget(id: string): void {
    let selectedBudgetIndex = this.selectedBudgetIds.indexOf(id);
    if (selectedBudgetIndex > -1) {
      this.selectedBudgetIds = this.selectedBudgetIds.filter((_, i) => i !== selectedBudgetIndex);
    } else {
      this.selectedBudgetIds.push(id);
    }
  }

  protected displayMobileView(): boolean {
    return this.pageWidth <= this.appConfig.pageMobileWidth;
  }

  protected setDefaultDates(): void {
    const fromDate = DateUtil.setMonthsToDate(DateUtil.firstDayOfCurrentMonth(), 1);
    const toDate = DateUtil.setMonthsToDate(DateUtil.lastDayOfCurrentMonth(), this.maxMonths);

    this.fromDatePicker = DatePickerUtil.convertToDatePicker(fromDate);
    this.toDatePicker = DatePickerUtil.convertToDatePicker(toDate);
  }

  protected searchBudgets(): void {
    let fromDate: Date = DatePickerUtil.convertToDate(this.fromDatePicker);
    let toDate: Date = DatePickerUtil.convertToDate(this.toDatePicker);

    //TO DO...
  }

  open(plannedPaymentToCopy: GetPlannedPaymentDto): void {
    this.plannedPaymentToCopy = plannedPaymentToCopy;
    this.currentStep = 1;
    this.selectedBudgetId = "";
    this.selectedBudgetIds = [];
    this.setDefaultDates();
    this.modalService.open(this.copyModal, ModalOptions.default(ModalSize.BIG));
  }

  protected initializePlannedPayments(): void {
    for (let budgetId of this.selectedBudgetIds!) {
      this.budgetPlannedPaymentsToCopy.set(budgetId, this.plannedPaymentToCopy);
    }
  }

  protected getBudgetData(budgetId: string): GetBudgetDto {
    return this.budgets?.find(b => b.id == budgetId)!;
  }

  protected getPlannedPaymentData(budgetId: string): GetPlannedPaymentDto {
    return this.budgetPlannedPaymentsToCopy.get(budgetId)!;
  }

  protected goNext(): void {
    this.initializePlannedPayments();
    this.currentStep = this.currentStep + 1;
  }

  protected goBack(): void {
    this.selectedBudgetId = "";
    this.currentStep = this.currentStep - 1;
  }

  protected save(): void {

  }
}
