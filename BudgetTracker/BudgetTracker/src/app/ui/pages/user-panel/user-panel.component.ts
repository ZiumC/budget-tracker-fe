import {Component, OnDestroy, OnInit} from '@angular/core';
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
import {EnrollOtpDto} from "../../../models/dto/user.model.dto";

@Component({
  selector: 'app-user-panel',
  templateUrl: './user-panel.component.html',
  styleUrl: './user-panel.component.css'
})
export class UserPanelComponent implements OnInit, OnDestroy {
  protected readonly SpinnerSize = SpinnerSize;
  protected subscriptions: Subscription[];
  protected appConfig: AppConfig;
  protected enrollOtpDto: EnrollOtpDto | null;
  protected userDto: UserDto;
  protected loaders: Loaders;

  constructor(private httpService: HttpService,
              private configService: ConfigService,
              private toastr: ToastrService) {
  }

  ngOnDestroy(): void {
    SubscriptionUtils.unsubscribeAll(this.subscriptions);
  }

  ngOnInit(): void {
    const appCfg = this.configService.getAppConfig();
    if (appCfg) {
      this.appConfig = appCfg;
    } else {
      throw Error("Config not provided")
    }

    this.userDto = {
      email: "example@mail.com",
      login: "example",
      is2FaEnabled: false,
      isEmailConfirmed: true
    }

    this.subscriptions = [];
    this.loaders = {
      page: false,
      enroll2Fa: false
    };
    this.enrollOtpDto = new EnrollOtpDto();
  }

  protected enroll2Fa(): void {
    this.markEnrollmentAsLoading(true);
    this.subscriptions.push(
      this.httpService.enroll2Fa().subscribe({
        next: (response): void => {
          this.enrollOtpDto = response.body;
          this.markEnrollmentAsLoading(false);
        },
        error: (err): void => {
          ToastUtil.handleErrorResponse(this.toastr, err);
          this.markEnrollmentAsLoading(false);
        },
        complete: (): void => {
          this.markEnrollmentAsLoading(false);
        }
      })
    )
  }

  private markEnrollmentAsLoading(value: boolean): void {
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
}
