import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {AuthService} from "../../../services/auth/auth.service";
import {HttpService} from "../../../services/http/http.service";
import {LoginRequestDto} from "../../../models/dto/user.model.dto";
import {Subscription} from "rxjs";
import {SubscriptionUtils} from "../../../util/subscription.utils";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit, OnDestroy {
  returnUrl = "/";
  protected subscriptions: Subscription[];

  constructor(
    private route: ActivatedRoute,
    private httpService: HttpService,
    private authService: AuthService,
    private router: Router) {
    const urlSnapshot = this.route.snapshot.queryParamMap.get('returnUrl');
    if (urlSnapshot) {
      this.returnUrl = urlSnapshot;
    }
  }

  ngOnInit(): void {
    this.subscriptions = [];
  }

  ngOnDestroy(): void {
    SubscriptionUtils.unsubscribeAll(this.subscriptions);
  }


  protected login(): void {
    let loginRequest = {
      emailOrLogin: "Test9",
      password: "test"
    } as LoginRequestDto;

    this.subscriptions.push(
      this.httpService.login(loginRequest).subscribe({
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

  protected logout(): void {
    this.subscriptions.push(
      this.httpService.logout().subscribe({
        next: (): void => {
          this.authService.setLoggedOut();
        },
        error: (): void => {
          this.authService.setLoggedIn();
        }
      })
    );
  }
}
