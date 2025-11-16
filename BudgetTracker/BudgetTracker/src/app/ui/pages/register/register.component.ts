import {Component, OnDestroy, OnInit} from '@angular/core';
import {Subscription} from "rxjs";
import {SubscriptionUtils} from "../../../util/subscription.utils";
import {
  CompleteRegisterDto,
  InitRegisterDto,
  Loaders,
  RegisterFormTypes
} from "../../../models/components/register.component";
import {ModalUtils} from "../../../util/modal.utils";
import {AppConfig} from "../../../models/config/config";
import {FormConfig} from "../../../models/config/form.model.config";
import {ConfigService} from "../../../services/config/config.service";
import {formatString} from "../../../util/string.utils";
import {ActivatedRoute, Params, Router} from "@angular/router";
import {TimerUtils} from "../../../util/timer.utils";
import {HttpService} from "../../../services/http/http.service";
import {ToastUtil} from "../../../util/tostr.util";
import {ToastrService} from "ngx-toastr";
import {SpinnerSize} from "../../components/shared/spinner/spinner.component";
import {PasswordUtil} from "../../../util/password.util";

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent implements OnInit, OnDestroy {
  protected readonly formatString = formatString;
  protected readonly SpinnerSize = SpinnerSize;
  protected readonly FormType = RegisterFormTypes;
  protected readonly ModalUtils = ModalUtils;
  protected subscriptions: Subscription[];
  protected passwordUtil: PasswordUtil;
  protected formType: RegisterFormTypes;
  protected registerForm: InitRegisterDto;
  protected repeatPassword: string;
  protected confirmationCode: string;
  protected showPassword: boolean;
  protected appConfig: AppConfig;
  protected formConfig: FormConfig;
  protected loaders: Loaders;
  private confirmParam: boolean;
  private returnUrl = "/login"

  constructor(
    private configService: ConfigService,
    private httpService: HttpService,
    private router: Router,
    private toastr: ToastrService,
    private activatedRoute: ActivatedRoute) {
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
      register: false,
      confirm: false
    }


    this.activatedRoute.queryParams.subscribe((params: Params): void => {
      if (params['confirm']) {
        this.confirmParam = true;
        this.formType = RegisterFormTypes.CONFIRM_EMAIL;
      } else {
        this.confirmParam = false;
        this.formType = RegisterFormTypes.REGISTER;
      }
    });

    this.subscriptions = [];
    this.registerForm = new InitRegisterDto();
    this.passwordUtil = new PasswordUtil(this.formConfig);
    this.showPassword = false;
    this.repeatPassword = "";
    this.confirmationCode = "";
  }

  ngOnDestroy(): void {
    SubscriptionUtils.unsubscribeAll(this.subscriptions);
  }

  protected displayEmailInput(): boolean {
    return this.formType == RegisterFormTypes.CONFIRM_EMAIL && this.confirmParam;
  }

  protected onPasswordDisplay(): void {
    if (this.loaders.register) {
      return;
    }
    this.showPassword = !this.showPassword;
  }

  protected register(): void {
    this.markRegisterAsLoading(true);
    this.subscriptions.push(
      this.httpService.initializeRegister(this.registerForm).subscribe({
        next: (): void => {
          this.formType = RegisterFormTypes.CONFIRM_EMAIL;
          ToastUtil.successfullyInitRegister(this.toastr, this.registerForm.email);
          this.markRegisterAsLoading(false);
        },
        error: (err): void => {
          ToastUtil.handleErrorResponse(this.toastr, err);
          this.markRegisterAsLoading(false);
        },
        complete: (): void => {
          this.markRegisterAsLoading(false);
        }
      })
    );
  }

  protected confirm(): void {
    this.markConfirmAsLoading(true);

    const confirmEmail: CompleteRegisterDto = {
      email: this.registerForm.email,
      code: this.confirmationCode
    }

    this.subscriptions.push(
      this.httpService.completeRegister(confirmEmail).subscribe({
        next: (): void => {
          ToastUtil.successfullyCompletedRegister(this.toastr);
          this.markConfirmAsLoading(false);
          this.router.navigateByUrl(this.returnUrl);
        },
        error: (err): void => {
          this.confirmationCode = "";
          ToastUtil.handleErrorResponse(this.toastr, err);
          this.markConfirmAsLoading(false);
        },
        complete: (): void => {
          this.markConfirmAsLoading(false);
        }
      })
    )
  }

  private markRegisterAsLoading(value: boolean): void {
    if (value) {
      new TimerUtils(this.appConfig.timer.duration.default).start()
        .subscribe(finished => {
          if (finished) {
            this.loaders.register = value;
          }
        });
    } else {
      this.loaders.register = value;
    }
  }

  private markConfirmAsLoading(value: boolean): void {
    if (value) {
      new TimerUtils(this.appConfig.timer.duration.default).start()
        .subscribe(finished => {
          if (finished) {
            this.loaders.confirm = value;
          }
        });
    } else {
      this.loaders.confirm = value;
    }
  }
}
