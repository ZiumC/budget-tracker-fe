import {Injectable} from '@angular/core';
import {
  CanActivate,
  Router,
  UrlTree
} from '@angular/router';
import {AuthService} from "./auth.service";
import {catchError, map, Observable, of} from "rxjs";

@Injectable({providedIn: 'root'})
export class AuthGuard implements CanActivate {
  constructor(
    private auth: AuthService,
    private router: Router) {
  }

  canActivate(): Observable<boolean | UrlTree> {
    if (this.auth.isLoggedIn()) return of(true);

    return this.auth.initAuthCheck().pipe(
      map((): true => {
        this.auth.setLoggedIn();
        return true;
      }),
      catchError(() => of(this.router.createUrlTree(['/login'])))
    );
  }
}
