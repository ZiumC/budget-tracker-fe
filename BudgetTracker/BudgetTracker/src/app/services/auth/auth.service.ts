import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable, of} from 'rxjs';
import {HttpService} from "../http/http.service";
import {tap} from "rxjs/operators";

@Injectable({providedIn: 'root'})
export class AuthService {
    private isLoggedIn$ = new BehaviorSubject<boolean>(false);

    constructor(private httpService: HttpService) {
    }

    initAuthCheck(): Observable<boolean> {
        return this.httpService.user().pipe(tap({
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
