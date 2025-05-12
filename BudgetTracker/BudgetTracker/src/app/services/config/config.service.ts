import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {BehaviorSubject, Observable} from 'rxjs';
import {tap} from 'rxjs/operators';
import {AppConfig, Config} from "../../models/config/config";

@Injectable({
  providedIn: 'root',
})
export class ConfigService {
  private configSubject = new BehaviorSubject<Config | null>(null);
  config = this.configSubject.asObservable();

  constructor(private http: HttpClient) {
  }

  loadConfig(): Observable<Config> {
    return this.http.get<Config>('/assets/config.json').pipe(
      tap(config => this.configSubject.next(config))
    );
  }

  getAppConfig(): AppConfig | null {
    let result = null;
    this.config.subscribe(config => {
      if (config) {
        result = config ? config["app"] : null;
      }
    });
    return result;
  }
}
