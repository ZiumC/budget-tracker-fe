import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {ModalOptions, ModalSize, ModalUtils} from "../../../../util/modal.utils";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {HttpService} from "../../../../services/http/http.service";
import {ConfigService} from "../../../../services/config/config.service";
import {formatString} from "../../../../util/string.utils";
import {FormBuilder, FormGroup, NgModel, Validators} from "@angular/forms";
import {DatePicker} from "../../../../models/datepicker.model";
import {DatePickerUtil, DateUtil, isInvalidDate} from "../../../../util/date.util";
import {AppConfig} from "../../../../models/config/config";
import {FormConfig} from "../../../../models/config/form.model.config";

@Component({
  selector: 'app-copy-payment-modal',
  templateUrl: './copy-payment-modal.component.html',
  styleUrl: './copy-payment-modal.component.css'
})
export class CopyPaymentModalComponent implements OnInit, OnDestroy {
  @ViewChild('copyPaymentModal') copyModal: any;
  protected readonly formatString = formatString;
  protected readonly ModalUtils = ModalUtils;
  protected currentStep: number = 1;
  protected fromDatePicker: DatePicker = new DatePicker();
  protected toDatePicker: DatePicker = new DatePicker();
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
      throw Error("Config not provided")
    }
  }

  protected searchBudgets(): void {
    let fromDate = DatePickerUtil.convertToDate(this.fromDatePicker);
    let toDate = DatePickerUtil.convertToDate(this.toDatePicker);
  }

  protected onDatesChanged(fromDateInput: NgModel, toDateInput: NgModel): void {
    const isInvalidFromDate = isInvalidDate(this.fromDatePicker);
    const isInvalidToDate = isInvalidDate(this.toDatePicker);

    if (isInvalidFromDate) {
      fromDateInput.control.setErrors({ngbDate: true});
    } else if (isInvalidToDate) {
      toDateInput.control.setErrors({ngbDate: true});
    } else {
      const fromDate = DatePickerUtil.convertToDate(this.fromDatePicker);
      const toDate = DatePickerUtil.convertToDate(this.toDatePicker);

      if (toDate <= fromDate) {
        fromDateInput.control.setErrors({invalidRange: true});
        toDateInput.control.setErrors({invalidRange: true});
      } else {
        fromDateInput.control.setErrors(null);
        toDateInput.control.setErrors(null);
      }
    }
  }

  open(): void {
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
