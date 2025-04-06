import {HttpClient, HttpResponse} from "@angular/common/http";
import {Observable} from "rxjs";
import {TotalPages, UrlApi} from "./http";
import {Injectable} from "@angular/core";
import {RequestParams} from "../../models/requestParams";
import {GetIncomeDto, IncomeDto} from "../../models/dto/income.model.dto";
import {PaymentStatusDto, PaymentDto, GetPaymentDto} from "../../models/dto/payment.model.dto";
import {BudgetDto, GetBudgetDto} from "../../models/dto/budget.model.dto";
import {PageDto} from "../../models/dto/page.model.dto";
import {GetPlannedPaymentDto, PlannedPaymentDto} from "../../models/dto/planned-payment.model.dto";

@Injectable({
  providedIn: 'root',
})
export class HttpService {

  constructor(private httpClient: HttpClient) {
  }

  public getBudgets(requestModel: RequestParams):
    Observable<HttpResponse<GetBudgetDto[]>> {
    return this.httpClient.get<GetBudgetDto[]>(
      UrlApi.budgets(requestModel),
      {observe: 'response'}
    );
  }

  public getBudget(idBudget: string):
    Observable<HttpResponse<GetBudgetDto>> {
    return this.httpClient.get<GetBudgetDto>(
      UrlApi.budgetId(idBudget),
      {observe: 'response'}
    );
  }

  public getBudgetsTotalPage(pageSize: number):
    Observable<HttpResponse<PageDto>> {
    return this.httpClient.get<PageDto>(
      UrlApi.budgetsPages(pageSize),
      {observe: 'response'}
    )
  }

  public updateBudget(budgetDto: BudgetDto, idBudget: string):
    Observable<HttpResponse<{}>> {
    return this.httpClient.put(
      UrlApi.budgetId(idBudget),
      budgetDto,
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

  public getBudgetIncomes(requestParams: RequestParams, idBudget: string):
    Observable<HttpResponse<GetIncomeDto[]>> {
    return this.httpClient.get<GetIncomeDto[]>(
      UrlApi.budgetIncomes(requestParams, idBudget),
      {observe: 'response'}
    );
  }

  public getBudgetPayments(requestParams: RequestParams, idBudget: string):
    Observable<HttpResponse<GetPaymentDto[]>> {
    return this.httpClient.get<GetPaymentDto[]>(
      UrlApi.budgetPayments(requestParams, idBudget),
      {observe: 'response'}
    )
  }

  public createBudgetIncome(incomeDto: IncomeDto, idBudget: string):
    Observable<HttpResponse<{}>> {
    return this.httpClient.post(
      UrlApi.budgetIncome(idBudget),
      incomeDto,
      {observe: 'response'}
    )
  }

  public createBudgetPayment(paymentDto: PaymentDto, idBudget: string):
    Observable<HttpResponse<{}>> {
    return this.httpClient.post(
      UrlApi.budgetPayment(idBudget),
      paymentDto,
      {observe: 'response'}
    )
  }

  public updateIncome(incomeDto: IncomeDto, idIncome: string):
    Observable<HttpResponse<{}>> {
    return this.httpClient.put(
      UrlApi.incomeId(idIncome),
      incomeDto,
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

  public getIncomePages(requestParams: RequestParams, idBudget: string):
    Observable<HttpResponse<PageDto>> {
    return this.httpClient.get<PageDto>(
      UrlApi.budgetDataPages(requestParams, idBudget, TotalPages.INCOMES),
      {observe: 'response'}
    )
  }

  public updatePayment(paymentDto: PaymentDto, idPayment: string):
    Observable<HttpResponse<{}>> {
    return this.httpClient.put(
      UrlApi.paymentId(idPayment),
      paymentDto,
      {observe: 'response'}
    )
  }

  public patchPaymentStatus(paymentStatusForm: PaymentStatusDto, idPayment: string):
    Observable<HttpResponse<{}>> {
    return this.httpClient.patch(
      UrlApi.paymentStatus(idPayment),
      paymentStatusForm,
      {observe: 'response'}
    )
  }

  public deletePayment(idPayment: string):
    Observable<HttpResponse<{}>> {
    return this.httpClient.delete(
      UrlApi.paymentId(idPayment),
      {observe: 'response'}
    )
  }

  public getPaymentPages(requestParams: RequestParams, idBudget: string):
    Observable<HttpResponse<PageDto>> {
    return this.httpClient.get<PageDto>(
      UrlApi.budgetDataPages(requestParams, idBudget, TotalPages.PAYMENTS),
      {observe: 'response'}
    )
  }

  public getPlannedPayment(requestParams: RequestParams, idBudget: string):
    Observable<HttpResponse<GetPlannedPaymentDto[]>> {
    return this.httpClient.get<GetPlannedPaymentDto[]>(
      UrlApi.budgetPlannedPayments(requestParams, idBudget),
      {observe: 'response'}
    )
  }

  public getPlannedPaymentPages(requestParams: RequestParams, idBudget: string):
    Observable<HttpResponse<PageDto>> {
    return this.httpClient.get<PageDto>(
      UrlApi.budgetDataPages(requestParams, idBudget, TotalPages.PLANNED_PAYMENTS),
      {observe: 'response'}
    )
  }

  public updatePlannedPayment(plannedPaymentDto: PlannedPaymentDto, idPayment: string):
    Observable<HttpResponse<{}>> {
    return this.httpClient.put(
      UrlApi.plannedPaymentId(idPayment),
      plannedPaymentDto,
      {observe: 'response'}
    )
  }

  public createBudgetPlannedPayment(plannedPaymentDto: PlannedPaymentDto, idBudget: string):
    Observable<HttpResponse<{}>> {
    return this.httpClient.post(
      UrlApi.budgetPlannedPayment(idBudget),
      plannedPaymentDto,
      {observe: 'response'}
    )
  }
}
