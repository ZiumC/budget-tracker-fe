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
import {ResponseModel, Status} from "../../../../models/response.model";
import {format, subtract} from "../../../../util/number.util";
import {GetPlannedPaymentDto} from "../../../../models/dto/planned-payment.model.dto";
import BigNumber from "bignumber.js";
import {NgModel} from "@angular/forms";
import {Subscription} from "rxjs";
import {HttpResponse} from "@angular/common/http";
import {generateErrorModel} from "../../../../util/http.util";
import {RequestParams} from "../../../../models/requestParams";
import {TimerUtils} from "../../../../util/timer.utils";
import {SpinnerSize} from "../../shared/spinner/spinner.component";
import {PlannedPaymentStatus} from "../../../../models/modal/copy-payment.model.modal";

@Component({
  selector: 'app-copy-payment-modal',
  templateUrl: './copy-payment-modal.component.html',
  styleUrl: './copy-payment-modal.component.css'
})
export class CopyPaymentModalComponent implements OnInit, OnDestroy {
  @ViewChild('copyPaymentModal') copyModal: any;
  @ViewChild('errorModal') errorModal: any;
  protected readonly formatString = formatString;
  protected readonly format = format;
  protected readonly BigNumber = BigNumber;
  protected readonly subtract = subtract;
  protected readonly SpinnerSize = SpinnerSize;
  protected readonly DateUtils = DateUtil;
  protected readonly ModalUtils = ModalUtils;
  protected readonly maxMonths: number = 7;
  protected subscriptions: Subscription[] = [];
  protected selectedBudgetIds: string[] = [];
  protected budgets: GetBudgetDto[] | null;
  protected budgetRequestParams: RequestParams;
  protected budgetsResponseModel: ResponseModel;
  protected budgetLoader: boolean;
  protected requiredBudgetStatusCode: number;
  protected selectedBudgetId: string;
  protected currentStep: number;
  protected fromDatePicker: DatePicker;
  protected toDatePicker: DatePicker;
  protected appConfig: AppConfig;
  protected formConfig: FormConfig;
  private budgetPlannedPaymentsToCopy: Map<string, PlannedPaymentStatus> = new Map();
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

    this.requiredBudgetStatusCode = appCfg.response.required.budgetStatus;
    this.budgetRequestParams = new RequestParams();
    this.budgetsResponseModel = new ResponseModel();
    this.pageWidth = window.innerWidth;

    this.setDefaultDates();
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
    this.markBudgetsAsLoaded(false);

    this.budgets = [];
    let fromDate: Date = DatePickerUtil.convertToDate(this.fromDatePicker);
    let toDate: Date = DatePickerUtil.convertToDate(this.toDatePicker);

    this.budgetRequestParams.fromDate = DateUtil.format(fromDate);
    this.budgetRequestParams.toDate = DateUtil.format(toDate);

    this.subscriptions.push(
      this.httpService.getBudgets(this.budgetRequestParams).subscribe({
        next: (response: HttpResponse<GetBudgetDto[]>): void => {
          this.budgets = response.body;
          this.budgetsResponseModel.statusCode = response.status;
        },
        error: (err): void => {
          this.budgetsResponseModel = generateErrorModel(err);
          this.errorModal.open(this.budgetsResponseModel);
          this.markBudgetsAsLoaded(true);
        },
        complete: (): void => {
          this.markBudgetsAsLoaded(true);
        }
      })
    );
  }

  open(plannedPaymentToCopy: GetPlannedPaymentDto): void {
    this.plannedPaymentToCopy = plannedPaymentToCopy;
    this.currentStep = 1;
    this.selectedBudgetId = "";
    this.selectedBudgetIds = [];
    this.setDefaultDates();
    this.searchBudgets();
    this.modalService.open(this.copyModal, ModalOptions.default(ModalSize.BIG));
  }

  protected initializePlannedPayments(): void {
    let clonedPlannedPayment = structuredClone(this.plannedPaymentToCopy);
    clonedPlannedPayment.isPaid = false;
    clonedPlannedPayment.id = "";
    for (let budgetId of this.selectedBudgetIds!) {
      this.budgetPlannedPaymentsToCopy.set(budgetId, {
        plannedPaymentDto: clonedPlannedPayment
      } as PlannedPaymentStatus);
    }
  }

  protected markBudgetsAsLoaded(value: boolean): void {
    if (value) {
      new TimerUtils(this.appConfig.timer.duration.default).start()
        .subscribe(finished => {
          if (finished) {
            this.budgetLoader = value;
          }
        });
    } else {
      this.budgetLoader = value;
    }
  }

  protected getBudgetData(budgetId: string): GetBudgetDto {
    return this.budgets?.find(b => b.id == budgetId)!;
  }

  protected getPlannedPaymentData(budgetId: string): GetPlannedPaymentDto {
    return this.budgetPlannedPaymentsToCopy.get(budgetId)?.plannedPaymentDto!;
  }

  protected getPlannedPaymentStatus(budgetId: string): Status {
    let status = this.budgetPlannedPaymentsToCopy.get(budgetId)?.status;
    if (!status) {
      status = new Status();
    }
    return status;
  }

  protected displayErrorBorder(
    inputName: NgModel, inputEstimated: NgModel,
    inputReal: NgModel, textareaComment: NgModel,
    budgetId: string): boolean {
    const isFormInvalid = this.isFormInvalid(
      inputName,
      inputEstimated,
      inputReal,
      textareaComment);

    const plannedPaymentStatus = this.budgetPlannedPaymentsToCopy.get(budgetId)?.status;
    let responseStatus: boolean = false;
    if (plannedPaymentStatus) {
      responseStatus = !plannedPaymentStatus.isSuccess;
    }

    return isFormInvalid || responseStatus;
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
    //this is for tests
    this.budgetPlannedPaymentsToCopy.forEach((value, key) => {
      if (key === "d224c9fa-66ce-4185-075a-08ddb182f669") {
        this.budgetPlannedPaymentsToCopy.set(key, {
          plannedPaymentDto: value.plannedPaymentDto,
          status: {isSuccess: true, message: 'some true'} as Status
        } as PlannedPaymentStatus);
      }
    });

  }
  //TO DO...
  //when all success - display timer
  //when is success for one planned payment - disable all fields
  private isFormInvalid(
    inputName: NgModel, inputEstimated: NgModel,
    inputReal: NgModel, textareaComment: NgModel): boolean {
    const formErrors = [
      inputName.control.errors,
      inputEstimated.control.errors,
      inputReal.control.errors,
      textareaComment.control.errors
    ];

    return formErrors.find(e => e != null) != null;
  }
}
