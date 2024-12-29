import {HttpClient, HttpResponse} from "@angular/common/http";
import {Budget} from "../../models/Budget";
import {Observable} from "rxjs";
import {UrlApi} from "./http";
import {Injectable} from "@angular/core";
import {RequestModel} from "../../models/RequestModel";

@Injectable({
  providedIn: 'root',
})
export class HttpService {
  constructor(private httpClient: HttpClient) {
  }

  public getBudgets(requestModel: RequestModel): Observable<HttpResponse<Budget[]>> {
    return this.httpClient.get<Budget[]>(
      UrlApi.getBudgets(requestModel),
      {observe: 'response'}
    );
  }
}
