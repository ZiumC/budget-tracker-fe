import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {AuthService} from "../../../services/auth/auth.service";
import {HttpService} from "../../../services/http/http.service";
import {LoginDto, RegisterDto} from "../../../models/dto/user.model.dto";
import {Subscription} from "rxjs";
import {SubscriptionUtils} from "../../../util/subscription.utils";
import {FormType, Loaders} from "../../../models/components/login.component";
import {formatString} from "../../../util/string.utils";
import {DateUtil} from "../../../util/date.util";
import {ConfigService} from "../../../services/config/config.service";
import {FormConfig} from "../../../models/config/form.model.config";
import {ModalUtils} from "../../../util/modal.utils";
import {TimerUtils} from "../../../util/timer.utils";
import {AppConfig} from "../../../models/config/config";
import {SpinnerSize} from "../../components/shared/spinner/spinner.component";
import {NgModel} from "@angular/forms";
import {ToastrService} from "ngx-toastr";
import {ToastUtil} from "../../../util/tostr.util";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit, OnDestroy {
  @ViewChild('otpModal') otpModal: any;
  protected readonly FormType = FormType;
  protected readonly formatString = formatString;
  protected readonly DateUtils = DateUtil;
  protected readonly ModalUtils = ModalUtils;
  protected readonly SpinnerSize = SpinnerSize;
  protected formType: FormType;
  protected subscriptions: Subscription[];
  protected loginForm: LoginDto;
  protected registerForm: RegisterDto;
  protected repeatPassword: string;
  protected appConfig: AppConfig;
  protected formConfig: FormConfig;
  protected loaders: Loaders;
  returnUrl = "/";

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
      login: true,
      register: true
    }

    this.subscriptions = [];
    this.formType = FormType.LOGIN;
    this.loginForm = new LoginDto();
    this.registerForm = new RegisterDto();
  }

  ngOnDestroy(): void {
    SubscriptionUtils.unsubscribeAll(this.subscriptions);
  }

  protected testPasswords(pass1: NgModel, pass2: NgModel): void {
    const passInput1: string = this.registerForm.password;
    const passInput2: string = this.repeatPassword;

    const minLength: number = Number(this.formConfig.registerForm.password.minLength);
    const maxLength: number = Number(this.formConfig.registerForm.password.maxLength);

    const regexPass = new RegExp(this.formConfig.regex.password);

    if (passInput1 != passInput2) {
      pass1.control.setErrors({passNotMatch: true});
      pass2.control.setErrors({passNotMatch: true});
      return;
    }

    if (passInput1.length < minLength || passInput2.length < minLength) {
      pass1.control.setErrors({minlength: true});
      pass2.control.setErrors({minlength: true});
      return;
    }

    if (passInput1.length > maxLength || passInput2.length > maxLength) {
      pass1.control.setErrors({maxlength: true});
      pass2.control.setErrors({maxlength: true});
      return;
    }

    if (!regexPass.test(this.registerForm.password) || !regexPass.test(this.repeatPassword)) {
      pass1.control.setErrors({pattern: true});
      pass2.control.setErrors({pattern: true});
      return;
    }

    pass1.control.setErrors(null);
    pass2.control.setErrors(null);
  }

  protected login(): void {
    this.markLoginAsLoaded(false);
    if (this.loginForm) {
      this.subscriptions.push(
        this.httpService.login(this.loginForm).subscribe({
          next: (response): void => {
            if (response.status == 204) {
              this.otpModal.open();
            } else {
              this.authService.setLoggedIn();
              this.markLoginAsLoaded(true);
              this.router.navigateByUrl(this.returnUrl);
            }
          },
          error: (err): void => {
            this.loginForm.password = "";
            this.authService.setLoggedOut();
            ToastUtil.handleErrorResponse(this.toastr, err);
            this.markLoginAsLoaded(true);
          }
        })
      )
    }
  }

  private markLoginAsLoaded(value: boolean): void {
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
