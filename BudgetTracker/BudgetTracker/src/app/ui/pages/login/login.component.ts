import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {AuthService} from "../../../services/auth/auth.service";
import {HttpService} from "../../../services/http/http.service";
import {LoginRequestDto} from "../../../models/dto/user.model.dto";
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

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit, OnDestroy {
  protected readonly FormType = FormType;
  protected readonly formatString = formatString;
  protected readonly DateUtils = DateUtil;
  protected readonly ModalUtils = ModalUtils;
  protected formType: FormType;
  protected subscriptions: Subscription[];
  protected loginRequest: LoginRequestDto;
  protected appConfig: AppConfig;
  protected formConfig: FormConfig;
  protected loaders: Loaders;
  returnUrl = "/";

  constructor(
    private route: ActivatedRoute,
    private httpService: HttpService,
    private authService: AuthService,
    private router: Router,
    private configService: ConfigService) {
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
      login: true
    }

    this.subscriptions = [];
    this.formType = FormType.LOGIN;
    this.loginRequest = new LoginRequestDto();
  }

  ngOnDestroy(): void {
    SubscriptionUtils.unsubscribeAll(this.subscriptions);
  }

  protected login(): void {
    this.markLoginAsLoaded(false);
    this.subscriptions.push(
      this.httpService.login(this.loginRequest).subscribe({
        next: (): void => {
          this.authService.setLoggedIn();
          this.markLoginAsLoaded(true);
          this.router.navigateByUrl(this.returnUrl);
        },
        error: (): void => {
          this.authService.setLoggedOut();
          this.markLoginAsLoaded(true);
        }
      })
    )
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

  protected readonly SpinnerSize = SpinnerSize;
}
