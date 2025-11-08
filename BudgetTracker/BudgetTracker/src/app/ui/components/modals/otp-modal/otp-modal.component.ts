import {Component, EventEmitter, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
import {Subscription} from "rxjs";
import {SubscriptionUtils} from "../../../../util/subscription.utils";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {HttpService} from "../../../../services/http/http.service";
import {ConfigService} from "../../../../services/config/config.service";
import {ModalOptions, ModalSize, ModalUtils} from "../../../../util/modal.utils";
import {formatString} from "../../../../util/string.utils";
import {FormConfig} from "../../../../models/config/form.model.config";
import {OtpDto} from "../../../../models/dto/user.model.dto";
import {ToastrService} from "ngx-toastr";
import {ToastUtil} from "../../../../util/tostr.util";
import {AuthService} from "../../../../services/auth/auth.service";
import {Router} from "@angular/router";
import {TimerUtils} from "../../../../util/timer.utils";
import {AppConfig} from "../../../../models/config/config";
import {OtpLoaders} from "../../../../models/components/otp-modal.component";

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
  protected appConfig: AppConfig;
  protected formConfig: FormConfig;
  protected loaders: OtpLoaders;
  protected otpCode: string;
  protected email: string;
  returnUrl = "/";

  constructor(
    private modalService: NgbModal,
    private httpService: HttpService,
    private configService: ConfigService,
    private authService: AuthService,
    private router: Router,
    private toastrService: ToastrService) {
  }

  ngOnDestroy(): void {
    SubscriptionUtils.unsubscribeAll(this.subscriptions);
  }

  ngOnInit(): void {
    const appCfg = this.configService.getAppConfig();
    if (appCfg) {
      this.appConfig = appCfg;
      this.formConfig = appCfg.form;
    } else {
      throw Error("Config not provided")
    }

    this.loaders = {
      otp: false
    }
  }

  open(email: string): void {
    this.email = email;
    this.modalService.open(this.otpModal, ModalOptions.default(ModalSize.MEDIUM))
  }

  protected close(): void {
    this.closedModalEvent.emit(true);
    this.modalService.dismissAll();
  }

  protected verify(): void {
    this.markLoginAsLoaded(false);
    const otpDto: OtpDto = {
      emailOrLogin: this.email,
      code: this.otpCode
    };

    this.subscriptions.push(
      this.httpService.verifyLogin(otpDto).subscribe({
        next: (): void => {
          this.modalService.dismissAll();
          this.authService.setLoggedIn();
          this.markLoginAsLoaded(true);
          this.router.navigateByUrl(this.returnUrl);
        },
        error: (err): void => {
          this.otpCode = "";
          ToastUtil.handleErrorResponse(this.toastrService, err);
          this.authService.setLoggedOut();
          this.markLoginAsLoaded(false);
          if (err.status != 400) {
            this.closedModalEvent.emit(true);
            this.modalService.dismissAll();
          }
        }
      })
    )
  }

  private markLoginAsLoaded(value: boolean): void {
    if (value) {
      new TimerUtils(this.appConfig.timer.duration.default).start()
        .subscribe(finished => {
          if (finished) {
            this.loaders.otp = value;
          }
        });
    } else {
      this.loaders.otp = value;
    }
  }
}
