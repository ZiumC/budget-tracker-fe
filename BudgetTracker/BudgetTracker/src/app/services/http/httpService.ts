import {HttpClient, HttpResponse} from "@angular/common/http";
import {BudgetModel, IncomeModel, PaymentModel} from "../../models/RequestModels";
import {Observable} from "rxjs";
import {UrlApi} from "./http";
import {Injectable} from "@angular/core";
import {RequestParamModel} from "../../models/RequestParamModel";
import {BudgetForm, IncomeForm, PaymentForm} from "../../models/FormModels";

@Injectable({
  providedIn: 'root',
})
export class HttpService {

  constructor(private httpClient: HttpClient) {
  }

  public getBudgets(requestModel: RequestParamModel):
    Observable<HttpResponse<BudgetModel[]>> {
    return this.httpClient.get<BudgetModel[]>(
      UrlApi.budgets(requestModel),
      {observe: 'response'}
    );
  }

  public getBudget(idBudget: string):
    Observable<HttpResponse<BudgetModel>> {
    return this.httpClient.get<BudgetModel>(
      UrlApi.budgetId(idBudget),
      {observe: 'response'}
    );
  }

  public updateBudget(budgetForm: BudgetForm, idBudget: string):
    Observable<HttpResponse<{}>> {
    return this.httpClient.put(
      UrlApi.budgetId(idBudget),
      budgetForm,
      {observe: 'response'}
    )
  }

  public createBudget(budgetDate: string):
    Observable<HttpResponse<{}>> {
    return this.httpClient.post(
      UrlApi.budgetDate(budgetDate),
      null,
      {observe: 'response'}
    )
  }

  public deleteBudget(idBudget: string):
    Observable<HttpResponse<{}>> {
    return this.httpClient.delete(
      UrlApi.budgetId(idBudget),
      {observe: 'response'}
    )
  }

  public getBudgetIncomes(requestModel: RequestParamModel, idBudget: string):
    Observable<HttpResponse<IncomeModel[]>> {
    return this.httpClient.get<IncomeModel[]>(
      UrlApi.budgetIncomes(requestModel, idBudget),
      {observe: 'response'}
    );
  }

  public getBudgetPayments(requestModel: RequestParamModel, idBudget: string):
    Observable<HttpResponse<PaymentModel[]>> {
    return this.httpClient.get<PaymentModel[]>(
      UrlApi.budgetPayments(requestModel, idBudget),
      {observe: 'response'}
    )
  }

  public createBudgetIncome(incomeForm: IncomeForm, idBudget: string):
    Observable<HttpResponse<{}>> {
    return this.httpClient.post(
      UrlApi.budgetIncome(idBudget),
      incomeForm,
      {observe: 'response'}
    )
  }

  public createBudgetPayment(paymentForm: PaymentForm, idBudget: string):
    Observable<HttpResponse<{}>> {
    return this.httpClient.post(
      UrlApi.budgetPayment(idBudget),
      paymentForm,
      {observe: 'response'}
    )
  }

  public updateIncome(incomeForm: IncomeForm, idIncome: string):
    Observable<HttpResponse<{}>> {
    return this.httpClient.put(
      UrlApi.incomeId(idIncome),
      incomeForm,
      {observe: 'response'}
    )
  }

  public deleteIncome(idIncome: string):
    Observable<HttpResponse<{}>> {
    return this.httpClient.delete(
      UrlApi.incomeId(idIncome),
      {observe: 'response'}
    )
  }

  public updatePayment(paymentForm: PaymentForm, idIncome: string):
    Observable<HttpResponse<{}>> {
    return this.httpClient.put(
      UrlApi.paymentId(idIncome),
      paymentForm,
      {observe: 'response'}
    )
  }
}
