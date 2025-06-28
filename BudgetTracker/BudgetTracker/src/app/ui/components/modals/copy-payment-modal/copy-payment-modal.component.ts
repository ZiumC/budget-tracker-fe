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
import {catchError, forkJoin, Observable, of, Subscription} from "rxjs";
import {HttpResponse} from "@angular/common/http";
import {generateErrorModel} from "../../../../util/http.util";
import {RequestParams} from "../../../../models/requestParams";
import {TimerUtils} from "../../../../util/timer.utils";
import {SpinnerSize} from "../../shared/spinner/spinner.component";
import {PlannedPaymentStatus} from "../../../../models/modal/copy-payment.model.modal";
import {toPlannedPaymentDto} from "../../../../util/mapper.utils";

@Component({
  selector: 'app-copy-payment-modal',
  templateUrl: './copy-payment-modal.component.html',
  styleUrl: './copy-payment-modal.component.css'
})
export class CopyPaymentModalComponent implements OnInit, OnDestroy {
  @ViewChild('copyPaymentModal') copyModal: any;
  @ViewChild('errorModal') errorModal: any;
  @ViewChild('infoModal') infoModal: any;
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
  protected clickedBudgetId: string;
  protected currentStep: number;
  protected fromDatePicker: DatePicker;
  protected toDatePicker: DatePicker;
  protected appConfig: AppConfig;
  protected formConfig: FormConfig;
  protected displayTimer: boolean;
  private plannedPaymentsToCopy: Map<string, PlannedPaymentStatus> = new Map();
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
    this.clickedBudgetId = "";
    this.selectedBudgetIds = [];
    this.setDefaultDates();
    this.searchBudgets();
    this.displayTimer = false;
    this.modalService.open(this.copyModal, ModalOptions.default(ModalSize.BIG));
  }

  protected initializePlannedPayments(): void {
    for (let budgetId of this.selectedBudgetIds) {
      let clonedPlannedPayment = structuredClone(this.plannedPaymentToCopy);
      clonedPlannedPayment.id = '';
      clonedPlannedPayment.isPaid = false;

      const plannedPaymentStatus: PlannedPaymentStatus = {
        getPlannedPaymentDto: clonedPlannedPayment,
        status: new Status()
      };

      this.plannedPaymentsToCopy.set(budgetId, plannedPaymentStatus);
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
    return this.plannedPaymentsToCopy.get(budgetId)!.getPlannedPaymentDto;
  }

  protected getPlannedPaymentStatus(budgetId: string): Status {
    return this.plannedPaymentsToCopy.get(budgetId)!.status;
  }

  protected setPlannedPaymentError(
    inputName: NgModel, inputEstimated: NgModel,
    inputReal: NgModel, textareaComment: NgModel,
    budgetId: string): boolean {
    const isFormInvalid = this.isFormInvalid(
      inputName,
      inputEstimated,
      inputReal,
      textareaComment);

    const plannedPaymentStatus = this.plannedPaymentsToCopy.get(budgetId)!.status;
    return isFormInvalid || (!ModalUtils.isUndefinedStatus(plannedPaymentStatus) &&
      !plannedPaymentStatus.isSuccess);
  }

  protected goNext(): void {
    this.initializePlannedPayments();
    this.currentStep = this.currentStep + 1;
  }

  protected onConfirmCancel(canceled: boolean) {
    if (canceled) {
      this.clickedBudgetId = "";
      this.currentStep = this.currentStep - 1;
    }
  }

  protected save(): void {
    const plannedPaymentRequests: Observable<HttpResponse<{}> | HttpResponse<any>>[] = [];
    this.plannedPaymentsToCopy.forEach((value, key): void => {
      if (!value.status.isSuccess ||
        ModalUtils.isUndefinedStatus(value.status)) {
        const plannedPaymentToCreate = toPlannedPaymentDto(value.getPlannedPaymentDto);
        plannedPaymentRequests.push(this.httpService
          .createBudgetPlannedPayment(key, plannedPaymentToCreate).pipe(
            catchError((err): Observable<HttpResponse<any>> => {
              return of(err);
            })
          ));
      }
    });

    this.subscriptions.push(
      forkJoin(plannedPaymentRequests).subscribe({
        next: (responses): void => {
          for (let response of responses) {
            const budgetId = response.url!.split("/")[5];
            let plannedPayment = this.plannedPaymentsToCopy.get(budgetId)!;
            if (response.status >= 200 && response.status <= 299) {
              this.onRequestSuccess(plannedPayment);
            } else {
              this.onRequestFailed(plannedPayment, response);
            }
          }
        },
        complete: (): void => {
          if (this.allSuccessResponses()) {
            this.displayTimer = true;
          }
        }
      })
    )
  }

  private onRequestSuccess(plannedPaymentStatus: PlannedPaymentStatus): void {
    plannedPaymentStatus.status = new Status();
    plannedPaymentStatus.status.isSuccess = true;
    plannedPaymentStatus.status.title = "Ok";
  }

  private onRequestFailed(plannedPaymentStatus: PlannedPaymentStatus, err: any): void {
    plannedPaymentStatus.status = new Status();
    plannedPaymentStatus.status.isSuccess = false;
    plannedPaymentStatus.status.title = err.error["Title"];
    plannedPaymentStatus.status.message = err.error["Message"];
  }

  protected onTimerFinishedEvent(modal: any): void {
    modal.close();
  }

  protected disableForm(budgetId: string): boolean {
    const createdPlannedPaymentStatus = this.plannedPaymentsToCopy.get(budgetId)?.status;
    let isSuccess: boolean = false;
    if (createdPlannedPaymentStatus) {
      isSuccess = createdPlannedPaymentStatus.isSuccess;
    }
    return this.displayTimer || isSuccess;
  }

  protected atLeastSuccessResponse(): boolean {
    let successResponses: boolean[] = [];
    this.plannedPaymentsToCopy.forEach((value): void => {
      let responsePlannedStatus = value.status;
      if (responsePlannedStatus) {
        successResponses.push(responsePlannedStatus.isSuccess);
      }
    });
    return successResponses.some(s => s);
  }

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

  private allSuccessResponses(): boolean {
    let successResponses: boolean[] = [];
    this.plannedPaymentsToCopy.forEach((value): void => {
      let responsePlannedStatus = value.status;
      if (responsePlannedStatus) {
        successResponses.push(responsePlannedStatus.isSuccess);
      }
    });

    if (successResponses.length > 0) {
      return successResponses.every(s => s);
    } else {
      return false;
    }
  }
}
