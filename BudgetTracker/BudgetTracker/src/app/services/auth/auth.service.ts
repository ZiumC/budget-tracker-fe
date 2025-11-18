import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable, of} from 'rxjs';
import {HttpService} from "../http/http.service";
import {tap} from "rxjs/operators";
import {Router} from "@angular/router";
import {HttpResponse} from "@angular/common/http";
import {deleteCookie} from "../../util/cookie.utils";
import {ConfigService} from "../config/config.service";

@Injectable({providedIn: 'root'})
export class AuthService {
  private isLoggedIn$ = new BehaviorSubject<boolean>(false);

  constructor(
    private httpService: HttpService,
    private router: Router,
    protected configService: ConfigService) {
  }

  logout(): void {
    this.httpService.logout().subscribe({
      next: (): void => {
        deleteCookie(this.configService.getAppConfig()?.request.cookies.names.jwtExpires!);
        this.isLoggedIn$.next(false);
      },
      error: (): void => this.isLoggedIn$.next(true)
    });
    this.router.navigateByUrl("/login");
  }

  initAuthCheck(): Observable<boolean> {
    return this.httpService.loginStatus().pipe(tap({
      next: (): Observable<boolean> => {
        this.isLoggedIn$.next(true);
        return of(true);
      },
      error: (): Observable<boolean> => {
        this.isLoggedIn$.next(false);
        return of(false);
      }
    }));
  }

  refresh(): Observable<HttpResponse<any>> {
    return this.httpService.refreshToken();
  }

  setLoggedIn(): void {
    this.isLoggedIn$.next(true);
  }

  setLoggedOut(): void {
    this.isLoggedIn$.next(false);
  }

  isLoggedIn(): boolean {
    return this.isLoggedIn$.getValue();
  }
}
