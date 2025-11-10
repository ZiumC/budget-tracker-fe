import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {AuthService} from "../../../services/auth/auth.service";
import {HttpService} from "../../../services/http/http.service";
import {LoginDto} from "../../../models/dto/user.model.dto";
import {Subscription} from "rxjs";
import {SubscriptionUtils} from "../../../util/subscription.utils";
import {LoginFormTypes, Loaders} from "../../../models/components/login.component";
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
  protected showPassword: boolean;
  protected appConfig: AppConfig;
  protected formConfig: FormConfig;
  protected loaders: Loaders;
  returnUrl = "/dashboard";

  constructor(
    private route: ActivatedRoute,
    private httpService: HttpService,
    private authService: AuthService,
    private router: Router,
    private configService: ConfigService,
    private toastr: ToastrService) {
    const urlSnapshot = this.route.snapshot.queryParamMap.get('returnUrl');
    if (urlSnapshot) {
      this.returnUrl = urlSnapshot;
    }
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
      login: false,
    }

    this.subscriptions = [];
    this.formType = LoginFormTypes.LOGIN;
    this.loginForm = new LoginDto();
    this.showPassword = false;
  }

  ngOnDestroy(): void {
    SubscriptionUtils.unsubscribeAll(this.subscriptions);
  }

  protected login(): void {
    this.markLoginAsLoading(true);
    if (this.loginForm) {
      this.subscriptions.push(
        this.httpService.login(this.loginForm).subscribe({
          next: (response): void => {
            this.markLoginAsLoading(false);
            if (response.status == 204) {
              this.otpModal.open(this.loginForm.emailOrLogin);
            } else {
              this.authService.setLoggedIn();
              this.router.navigateByUrl(this.returnUrl);
            }
          },
          error: (err): void => {
            this.loginForm.password = "";
            this.authService.setLoggedOut();
            this.markLoginAsLoading(false);
            ToastUtil.handleErrorResponse(this.toastr, err);
          }
        })
      )
    }
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
}
