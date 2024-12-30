import {HttpClient, HttpResponse} from "@angular/common/http";
import {Budget} from "../../models/RequestModels";
import {Observable} from "rxjs";
import {UrlApi} from "./http";
import {Injectable} from "@angular/core";
import {RequestParamModel} from "../../models/RequestParamModel";

@Injectable({
  providedIn: 'root',
})
export class HttpService {
  constructor(private httpClient: HttpClient) {
  }

  public getBudgets(requestModel: RequestParamModel): Observable<HttpResponse<Budget[]>> {
    return this.httpClient.get<Budget[]>(
      UrlApi.getBudgets(requestModel),
      {observe: 'response'}
    );
  }
}
