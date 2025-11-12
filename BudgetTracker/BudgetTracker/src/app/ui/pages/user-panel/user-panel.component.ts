import {Component, HostListener, OnDestroy, OnInit} from '@angular/core';
import {Loaders, UserDto} from "../../../models/components/user-panel.component";
import {Subscription} from "rxjs";
import {SubscriptionUtils} from "../../../util/subscription.utils";
import {HttpService} from "../../../services/http/http.service";
import {TimerUtils} from "../../../util/timer.utils";
import {ConfigService} from "../../../services/config/config.service";
import {AppConfig} from "../../../models/config/config";
import {SpinnerSize} from "../../components/shared/spinner/spinner.component";
import {ToastUtil} from "../../../util/tostr.util";
import {ToastrService} from "ngx-toastr";
import {ChangePasswordDto, EnrollOtpDto} from "../../../models/dto/user.model.dto";
import {format} from "../../../util/number.util";
import {formatString} from "../../../util/string.utils";
import {FormConfig} from "../../../models/config/form.model.config";
import {ModalUtils} from "../../../util/modal.utils";
import {PasswordUtil} from "../../../util/password.util";

@Component({
  selector: 'app-user-panel',
  templateUrl: './user-panel.component.html',
  styleUrl: './user-panel.component.css'
})
export class UserPanelComponent implements OnInit, OnDestroy {
  protected readonly format = format;
  protected readonly formatString = formatString;
  protected readonly SpinnerSize = SpinnerSize;
  protected readonly ModalUtils = ModalUtils;
  protected subscriptions: Subscription[];
  protected appConfig: AppConfig;
  protected formConfig: FormConfig;
  protected enrollOtpDto: EnrollOtpDto | null;
  protected changePassword: ChangePasswordDto;
  protected userDto: UserDto;
  protected loaders: Loaders;
  protected otpCode: string;
  protected repeatPassword: string;
  protected showPassword: boolean;
  protected showCurrentPass: boolean;
  protected passwordUtil: PasswordUtil;
  protected disableChangePassForm: boolean = true;
  public innerWidth: any;

  constructor(private httpService: HttpService,
              private configService: ConfigService,
              private toastr: ToastrService) {
  }

  ngOnInit(): void {
    const appCfg = this.configService.getAppConfig();
    if (appCfg) {
      this.appConfig = appCfg;
      this.formConfig = appCfg.form;
    } else {
      throw Error("Config not provided")
    }

    this.userDto = {
      email: "example@mail.com",
      login: "example",
      is2FaEnabled: true,
      isEmailConfirmed: true
    }

    this.passwordUtil = new PasswordUtil(this.formConfig);
    this.subscriptions = [];
    this.loaders = {
      page: false,
      changePass: false,
      enroll2Fa: false,
      enable2Fa: false,
      disable2Fa: false
    };
    this.otpCode = "";
    this.repeatPassword = "";
    this.changePassword = new ChangePasswordDto();
    this.showPassword = false;
  }

  ngOnDestroy(): void {
    SubscriptionUtils.unsubscribeAll(this.subscriptions);
  }

  @HostListener('window:resize', ['$event'])
  onResize(): void {
    this.innerWidth = window.innerWidth;
  }

  protected isMobileView(): boolean {
    return innerWidth <= this.appConfig.pageMobileWidth;
  }

  protected onPasswordDisplay(isCurrentPass: boolean): void {
    if (this.loaders.changePass || this.disableChangePassForm) {
      return;
    }
    if (isCurrentPass) {
      this.showCurrentPass = !this.showCurrentPass;
    } else {
      this.showPassword = !this.showPassword;
    }
  }

  protected onPasswordChangeForm(): void {
    this.disableChangePassForm = !this.disableChangePassForm;
    if (this.disableChangePassForm) {
      this.repeatPassword = "";
      this.changePassword = new ChangePasswordDto();
    }
  }

  protected enrollOtp(): void {
    this.enrollOtpDto = new EnrollOtpDto();
    this.markEnrollOtpAsLoading(true);
    this.subscriptions.push(
      this.httpService.enrollOtp().subscribe({
        next: (response): void => {
          this.enrollOtpDto = response.body;
          this.markEnrollOtpAsLoading(false);
        },
        error: (err): void => {
          ToastUtil.handleErrorResponse(this.toastr, err);
          this.markEnrollOtpAsLoading(false);
        },
        complete: (): void => {
          this.markEnrollOtpAsLoading(false);
        }
      })
    )
  }

  protected enableOtp(): void {
    this.markEnableOtpAsLoading(true);
    this.subscriptions.push(
      this.httpService.enableOtp(this.otpCode).subscribe({
        next: (): void => {
          ToastUtil.successfullyEnabled2FA(this.toastr, this.userDto.email);
          this.userDto.is2FaEnabled = true;
          this.otpCode = "";
          this.markEnableOtpAsLoading(false);
        },
        error: (err): void => {
          this.otpCode = "";
          ToastUtil.handleErrorResponse(this.toastr, err);
          this.markEnableOtpAsLoading(false);
        },
        complete: (): void => {
          this.otpCode = "";
          this.markEnableOtpAsLoading(false);
        }
      })
    )
  }

  protected disableOtp(): void {
    this.markDisableOtpAsLoading(true);
    this.subscriptions.push(
      this.httpService.disableOtp(this.otpCode).subscribe({
        next: (): void => {
          ToastUtil.successfullyDisabled2FA(this.toastr, this.userDto.email);
          this.userDto.is2FaEnabled = false;
          this.otpCode = "";
          this.markDisableOtpAsLoading(false);
        },
        error: (err): void => {
          this.otpCode = "";
          ToastUtil.handleErrorResponse(this.toastr, err);
          this.markDisableOtpAsLoading(false);
        },
        complete: (): void => {
          this.otpCode = "";
          this.markDisableOtpAsLoading(false);
        }
      })
    )
  }

  private markEnrollOtpAsLoading(value: boolean): void {
    if (value) {
      new TimerUtils(this.appConfig.timer.duration.default).start()
        .subscribe(finished => {
          if (finished) {
            this.loaders.enroll2Fa = value;
          }
        });
    } else {
      this.loaders.enroll2Fa = value;
    }
  }

  private markEnableOtpAsLoading(value: boolean): void {
    if (value) {
      new TimerUtils(this.appConfig.timer.duration.default).start()
        .subscribe(finished => {
          if (finished) {
            this.loaders.enable2Fa = value;
          }
        });
    } else {
      this.loaders.enable2Fa = value;
    }
  }

  private markDisableOtpAsLoading(value: boolean): void {
    if (value) {
      new TimerUtils(this.appConfig.timer.duration.default).start()
        .subscribe(finished => {
          if (finished) {
            this.loaders.disable2Fa = value;
          }
        });
    } else {
      this.loaders.disable2Fa = value;
    }
  }

  protected readonly ChangePasswordDto = ChangePasswordDto;
}
