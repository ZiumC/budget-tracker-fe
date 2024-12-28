import { HttpClient, HttpResponse } from "@angular/common/http";
import { Budget } from "../../models/Budget";
import { Observable } from "rxjs";
import { UrlApi } from "./http";
import { Injectable } from "@angular/core";

@Injectable({
  providedIn: 'root',
})
export class HttpService {
  constructor(private httpClient: HttpClient) { }

  public getBudgets(
    page: number,
    pageSize: number,
    fromDate?: Date,
    toDate?: Date,
    orderBy?: string
  ): Observable<HttpResponse<Budget[]>> {
    return this.httpClient.get<Budget[]>(
      UrlApi.getBudgets(
        page,
        pageSize,
        fromDate,
        toDate,
        orderBy),
      { observe: 'response' }
    );
  }
}
