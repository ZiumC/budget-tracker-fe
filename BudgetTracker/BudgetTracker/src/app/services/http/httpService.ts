import {HttpClient, HttpResponse} from "@angular/common/http";
import {BudgetModel, IncomeModel} from "../../models/RequestModels";
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

  public getBudgets(requestModel: RequestParamModel):
    Observable<HttpResponse<BudgetModel[]>> {
    return this.httpClient.get<BudgetModel[]>(
      UrlApi.getBudgets(requestModel),
      {observe: 'response'}
    );
  }

  public getBudgetIncomes(requestModel: RequestParamModel, idBudget: string):
    Observable<HttpResponse<IncomeModel[]>> {
    return this.httpClient.get<IncomeModel[]>(
      UrlApi.getBudgetIncomes(requestModel, idBudget),
      {observe: 'response'}
    );
  }
}
