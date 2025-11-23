import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Params, Router} from "@angular/router";
import {AuthService} from "../../../services/auth/auth.service";
import {HttpService} from "../../../services/http/http.service";
import {Subscription} from "rxjs";
import {SubscriptionUtils} from "../../../util/subscription.utils";
import {
  CompletePassResetDto,
  InitPassResetDto,
  Loaders, LoginDto,
  LoginFormTypes
} from "../../../models/components/login.component";
import {formatString} from "../../../util/string.utils";
import {DateUtil} from "../../../util/date.util";
import {ConfigService} from "../../../services/config/config.service";
import {FormConfig} from "../../../models/config/form.model.config";
import {ModalUtils} from "../../../util/modal.utils";
import {TimerUtils} from "../../../util/timer.utils";
import {AppConfig} from "../../../models/config/config";
import {SpinnerSize} from "../../components/shared/spinner/spinner.component";
import {ToastrService} from "ngx-toastr";
import {ToastUtil} from "../../../util/tostr.util";
import {PasswordUtil} from "../../../util/password.util";
import {setCookie} from "../../../util/cookie.utils";
import {DatePipe} from "@angular/common";
import {Title} from "@angular/platform-browser";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit, OnDestroy {
  @ViewChild('otpModal') otpModal: any;
  protected readonly FormType = LoginFormTypes;
  protected readonly formatString = formatString;
  protected readonly DateUtils = DateUtil;
  protected readonly ModalUtils = ModalUtils;
  protected readonly SpinnerSize = SpinnerSize;
  protected formType: LoginFormTypes;
  protected subscriptions: Subscription[];
  protected loginForm: LoginDto;
  protected initPassResetForm: InitPassResetDto;
  protected completePassResetForm: CompletePassResetDto;
  protected showPassword: boolean;
  protected appConfig: AppConfig;
  protected formConfig: FormConfig;
  protected passwordUtil: PasswordUtil;
  protected loaders: Loaders;
  protected setPassParam: boolean;
  protected repeatPassword: string;
  returnUrl = "/dashboard";

  constructor(
    private route: ActivatedRoute,
    private httpService: HttpService,
    private authService: AuthService,
    private router: Router,
    private configService: ConfigService,
    private activatedRoute: ActivatedRoute,
    private toastr: ToastrService,
    private titleService: Title) {
    const urlSnapshot = this.route.snapshot.queryParamMap.get('returnUrl');
    if (urlSnapshot) {
      this.returnUrl = urlSnapshot;
    }
    this.titleService.setTitle("BudgetTracker - login");
  }

  ngOnInit(): void {
    const appCfg = this.configService.getAppConfig();
    if (appCfg) {
      this.appConfig = appCfg;
      this.formConfig = appCfg.form;
    } else {
      throw Error("Config not provided")
    }

    this.activatedRoute.queryParams.subscribe((params: Params): void => {
      if (params['set']) {
        this.setPassParam = true;
        this.formType = LoginFormTypes.CONFIRM_PASSWORD;
      } else {
        this.setPassParam = false;
        this.formType = LoginFormTypes.LOGIN;
      }
    });

    this.loaders = {
      login: false,
      reset: false,
      setPass: false
    }

    this.subscriptions = [];
    this.loginForm = new LoginDto();
    this.initPassResetForm = new InitPassResetDto();
    this.completePassResetForm = new CompletePassResetDto();
    this.passwordUtil = new PasswordUtil(this.formConfig);
    this.showPassword = false;
    this.repeatPassword = "";
  }

  ngOnDestroy(): void {
    SubscriptionUtils.unsubscribeAll(this.subscriptions);
  }

  protected login(): void {
    this.markLoginAsLoading(true);
    this.subscriptions.push(
      this.httpService.login(this.loginForm).subscribe({
        next: (response): void => {
          this.markLoginAsLoading(false);
          let expires: number;
          if (response.status == 204) {
            this.otpModal.open(this.loginForm.emailOrLogin);
            expires = response.body["expires"];
          } else {
            expires = response.body["expires"];
            this.authService.setLoggedIn();
            this.router.navigateByUrl(this.returnUrl);
          }
          const now = new Date();
          const expiresDate = new Date(now.getTime() + expires * 60000);
          setCookie(this.appConfig.request.cookies.names.jwtExpires, expiresDate.toUTCString(), expiresDate);
        },
        error: (err): void => {
          this.loginForm.password = "";
          this.authService.setLoggedOut();
          this.markLoginAsLoading(false);
          ToastUtil.handleErrorResponse(this.toastr, err);
        },
        complete: (): void => {
          this.markLoginAsLoading(false);
        }
      })
    )
  }

  protected initializePasswordReset(): void {
    this.markResetAsLoading(true);
    this.subscriptions.push(
      this.httpService.initializePasswordReset(this.initPassResetForm).subscribe({
        next: (): void => {
          ToastUtil.successfullyInitResetPass(this.toastr, this.initPassResetForm.email);
          this.formType = LoginFormTypes.CONFIRM_PASSWORD;
          this.completePassResetForm.challengePassword = "";
          this.markResetAsLoading(false);
        },
        error: (err): void => {
          this.initPassResetForm = new InitPassResetDto();
          this.repeatPassword = "";
          ToastUtil.handleErrorResponse(this.toastr, err);
          this.markResetAsLoading(false);
        },
        complete: (): void => {
          this.markResetAsLoading(false);
        }
      })
    )
  }

  protected completePasswordReset(): void {
    this.markSetPassAsLoading(true);
    if (!this.setPassParam) {
      this.completePassResetForm.email = this.initPassResetForm.email;
    }
    this.subscriptions.push(
      this.httpService.completePasswordReset(this.completePassResetForm).subscribe({
        next: (): void => {
          ToastUtil.successfullyCompleteResetPass(this.toastr);
          this.markSetPassAsLoading(false);
          this.formType = LoginFormTypes.LOGIN;
        },
        error: (err): void => {
          if (err.status != 410) {
            this.completePassResetForm = new CompletePassResetDto();
            this.repeatPassword = "";
          } else {
            this.formType = LoginFormTypes.RESET_PASSWORD;
          }

          ToastUtil.handleErrorResponse(this.toastr, err);
          this.markSetPassAsLoading(false);
        },
        complete: (): void => {
          this.markSetPassAsLoading(false);
        }
      })
    )
  }

  protected displayInput(): boolean {
    return this.formType == LoginFormTypes.CONFIRM_PASSWORD && this.setPassParam;
  }

  protected onPasswordDisplay(): void {
    if (this.loaders.login) {
      return;
    }
    this.showPassword = !this.showPassword;
  }

  private markLoginAsLoading(value: boolean): void {
    if (value) {
      new TimerUtils(this.appConfig.timer.duration.default).start()
        .subscribe(finished => {
          if (finished) {
            this.loaders.login = value;
          }
        });
    } else {
      this.loaders.login = value;
    }
  }

  private markResetAsLoading(value: boolean): void {
    if (value) {
      new TimerUtils(this.appConfig.timer.duration.default).start()
        .subscribe(finished => {
          if (finished) {
            this.loaders.reset = value;
          }
        });
    } else {
      this.loaders.reset = value;
    }
  }

  private markSetPassAsLoading(value: boolean): void {
    if (value) {
      new TimerUtils(this.appConfig.timer.duration.default).start()
        .subscribe(finished => {
          if (finished) {
            this.loaders.setPass = value;
          }
        });
    } else {
      this.loaders.setPass = value;
    }
  }
}
