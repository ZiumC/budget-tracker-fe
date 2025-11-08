import {Component, EventEmitter, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
import {Subscription} from "rxjs";
import {SubscriptionUtils} from "../../../../util/subscription.utils";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {HttpService} from "../../../../services/http/http.service";
import {ConfigService} from "../../../../services/config/config.service";
import {ModalOptions, ModalSize, ModalUtils} from "../../../../util/modal.utils";
import {formatString} from "../../../../util/string.utils";
import {FormConfig} from "../../../../models/config/form.model.config";
import {OtpLoaders} from "../../../../models/components/login.component";

@Component({
  selector: 'app-otp-modal',
  templateUrl: './otp-modal.component.html',
  styleUrl: './otp-modal.component.css'
})
export class OtpModalComponent implements OnInit, OnDestroy {
  @ViewChild('otpModal') otpModal: any;
  @Output() closedModalEvent = new EventEmitter<boolean>();
  protected readonly formatString = formatString;
  protected readonly ModalUtils = ModalUtils;
  protected subscriptions: Subscription[] = [];
  protected formConfig: FormConfig;
  protected loaders: OtpLoaders;
  protected otpCode: string;

  constructor(
    private modalService: NgbModal,
    private httpService: HttpService,
    private configService: ConfigService) {
  }

  ngOnDestroy(): void {
    SubscriptionUtils.unsubscribeAll(this.subscriptions);
  }

  ngOnInit(): void {
    const appCfg = this.configService.getAppConfig();
    if (appCfg) {
      this.formConfig = appCfg.form;
    } else {
      throw Error("Config not provided")
    }

    this.loaders = {
      otp: false
    }
  }

  open(userName: string): void {
    this.modalService.open(this.otpModal, ModalOptions.default(ModalSize.MEDIUM))
  }

  protected close(): void {
    this.closedModalEvent.emit(true);
    this.modalService.dismissAll();
  }

  protected verify(): void {
  }
}
