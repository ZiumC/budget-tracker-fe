import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {AuthService} from "../../../services/auth/auth.service";
import {HttpService} from "../../../services/http/http.service";
import {LoginRequestDto} from "../../../models/dto/user.model.dto";
import {Subscription} from "rxjs";
import {SubscriptionUtils} from "../../../util/subscription.utils";
import {FormType} from "../../../models/components/login.component";
import {formatString} from "../../../util/string.utils";
import {DateUtil} from "../../../util/date.util";
import {ConfigService} from "../../../services/config/config.service";
import {FormConfig} from "../../../models/config/form.model.config";
import {ModalUtils} from "../../../util/modal.utils";

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
  protected formConfig: FormConfig;
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
      this.formConfig = appCfg.form;
    } else {
      throw Error("Config not provided")
    }

    this.subscriptions = [];
    this.formType = FormType.LOGIN;
    this.loginRequest = new LoginRequestDto();
  }

  ngOnDestroy(): void {
    SubscriptionUtils.unsubscribeAll(this.subscriptions);
  }

  protected login(): void {
    this.subscriptions.push(
      this.httpService.login(this.loginRequest).subscribe({
        next: (): void => {
          this.authService.setLoggedIn();
          this.router.navigateByUrl(this.returnUrl);
        },
        error: (): void => {
          this.authService.setLoggedOut();
        }
      })
    )
  }
}
