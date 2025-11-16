import {Component, HostListener, OnDestroy, OnInit} from '@angular/core';
import {
  ChangeEmailDto,
  ChangeEmailForm,
  ChangePasswordDto,
  ChangePasswordForm,
  EnrollOtpDto,
  Loaders,
  GetUserDto
} from "../../../models/components/user-panel.component";
import {Subscription} from "rxjs";
import {SubscriptionUtils} from "../../../util/subscription.utils";
import {HttpService} from "../../../services/http/http.service";
import {TimerUtils} from "../../../util/timer.utils";
import {ConfigService} from "../../../services/config/config.service";
import {AppConfig} from "../../../models/config/config";
import {SpinnerSize} from "../../components/shared/spinner/spinner.component";
import {ToastUtil} from "../../../util/tostr.util";
import {ToastrService} from "ngx-toastr";
import {format} from "../../../util/number.util";
import {formatString} from "../../../util/string.utils";
import {FormConfig} from "../../../models/config/form.model.config";
import {ModalUtils} from "../../../util/modal.utils";
import {PasswordUtil} from "../../../util/password.util";
import {AuthService} from "../../../services/auth/auth.service";

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
  protected passwordForm: ChangePasswordForm;
  protected emailForm: ChangeEmailForm;
  protected userDto: GetUserDto;
  protected loaders: Loaders;
  protected otpCode: string;
  protected passwordUtil: PasswordUtil;
  public innerWidth: any;

  constructor(private httpService: HttpService,
              private configService: ConfigService,
              private authService: AuthService,
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

    this.passwordUtil = new PasswordUtil(this.formConfig);
    this.subscriptions = [];
    this.loaders = {
      userProfile: false,
      changePass: false,
      changeEmail: false,
      enroll2Fa: false,
      enable2Fa: false,
      disable2Fa: false
    };

    this.otpCode = "";

    this.userDto = new GetUserDto();
    this.getUserProfile();

    this.emailForm = {
      isDisabledForm: true,
      showCurrentPassword: false,
      code: "",
      emailDto: new ChangeEmailDto()
    };

    this.passwordForm = {
      isDisabledForm: true,
      showCurrentPassword: false,
      showNewPassword: false,
      repeatPassword: "",
      passwordDto: new ChangePasswordDto()
    }
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

  protected passChangeFormPasswordDisplay(isCurrentPass: boolean): void {
    if (this.loaders.changePass || this.passwordForm.isDisabledForm) {
      return;
    }
    if (isCurrentPass) {
      this.passwordForm.showCurrentPassword = !this.passwordForm.showCurrentPassword;
    } else {
      this.passwordForm.showNewPassword = !this.passwordForm.showNewPassword;
    }
  }

  protected emailChangeFormPasswordDisplay() {
    if (this.loaders.changeEmail || this.emailForm.isDisabledForm) {
      return;
    }
    this.emailForm.showCurrentPassword = !this.emailForm.showCurrentPassword;
  }

  protected onPasswordChangeForm(): void {
    this.passwordForm.isDisabledForm = !this.passwordForm.isDisabledForm;
    if (this.passwordForm.isDisabledForm) {
      this.passwordForm.repeatPassword = "";
      this.passwordForm.passwordDto = new ChangePasswordDto();
    }
  }

  protected onEmailChangeForm(): void {
    this.emailForm.isDisabledForm = !this.emailForm.isDisabledForm;
    if (this.emailForm.isDisabledForm) {
      this.emailForm.emailDto = new ChangeEmailDto();
    }
  }

  protected initEmailChange(): void {
    this.markChangeEmailAsLoading(true);
    this.subscriptions.push(
      this.httpService.initializeEmailChange(this.emailForm.emailDto)
        .subscribe({
          next: (): void => {
            ToastUtil.successfullyInitEmailChange(this.toastr, this.emailForm.emailDto.email);
            this.markChangeEmailAsLoading(false);
            this.getUserProfile();
          },
          error: (err): void => {
            ToastUtil.handleErrorResponse(this.toastr, err);
            this.markChangeEmailAsLoading(false);
          },
          complete: (): void => {
            this.markChangeEmailAsLoading(false);
          }
        })
    )
  }

  protected completeEmailChange(): void {
    this.markChangeEmailAsLoading(true);
    this.subscriptions.push(
      this.httpService.completeEmailChange(this.emailForm.code).subscribe({
        next: (): void => {
          this.userDto.hasEmailToConfirm = false;
          this.emailForm.emailDto = new ChangeEmailDto();
          this.emailForm.isDisabledForm = true;
          ToastUtil.successfullyCompleteEmailChange(this.toastr);
          this.markChangeEmailAsLoading(false);
        },
        error: (err): void => {
          ToastUtil.handleErrorResponse(this.toastr, err);
          this.markChangeEmailAsLoading(false);
        },
        complete: (): void => {
          this.markChangeEmailAsLoading(false);
          this.authService.logout();
        }
      })
    )
  }

  protected getUserProfile(): void {
    this.markUserProfileAsLoaded(false);
    this.subscriptions.push(
      this.httpService.userProfile().subscribe({
        next: (response): void => {
          this.userDto = response.body!;
          this.markUserProfileAsLoaded(true);
        },
        error: (err): void => {
          ToastUtil.handleErrorResponse(this.toastr, err);
          this.markUserProfileAsLoaded(true);
        },
        complete: (): void => {
          this.markUserProfileAsLoaded(true);
        }
      })
    )
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

  private markUserProfileAsLoaded(value: boolean): void {
    if (value) {
      new TimerUtils(this.appConfig.timer.duration.default).start()
        .subscribe(finished => {
          if (finished) {
            this.loaders.userProfile = value;
          }
        });
    } else {
      this.loaders.userProfile = value;
    }
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

  private markChangeEmailAsLoading(value: boolean): void {
    if (value) {
      new TimerUtils(this.appConfig.timer.duration.default).start()
        .subscribe(finished => {
          if (finished) {
            this.loaders.changeEmail = value;
          }
        });
    } else {
      this.loaders.changeEmail = value;
    }
  }
}
