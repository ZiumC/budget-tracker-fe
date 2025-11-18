import {Injectable} from '@angular/core';
import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpErrorResponse
} from '@angular/common/http';
import {Observable, throwError, catchError} from 'rxjs';

import {AuthService} from "../auth/auth.service";
import {Router} from '@angular/router';
import {getCookie} from "../../util/cookie.utils";
import {ConfigService} from "../config/config.service";

@Injectable()
export class JwtInterceptor implements HttpInterceptor {

  constructor(
    private auth: AuthService,
    private router: Router,
    protected configService: ConfigService) {
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const authReq = req.clone({
      withCredentials: true
    });

    return next.handle(authReq).pipe(
      catchError((err: HttpErrorResponse) => {
        if (err.status === 401) {
          const jwtExpirationCookie = getCookie(this.configService.getAppConfig()?.request.cookies.names.jwtExpires!);
          if (!jwtExpirationCookie) {
            this.auth.setLoggedOut();
            this.router.navigateByUrl("/login");
          }
        }
        return throwError((): HttpErrorResponse => err);
      })
    );
  }
}
