import {HttpClient, HttpResponse} from "@angular/common/http";
import {Observable} from "rxjs";
import {Injectable} from "@angular/core";
import {RequestParams} from "../../models/requestParams";
import {GetIncomeDto, IncomeDto} from "../../models/dto/income.model.dto";
import {PaymentDto, PaymentStatusDto} from "../../models/dto/payment.model.dto";
import {BudgetDto, GetBudgetDto} from "../../models/dto/budget.model.dto";
import {PageDto} from "../../models/dto/page.model.dto";
import {CategoryDto, CategoryType, GetCategoryDto} from "../../models/dto/category.model.dto";
import {BudgetUrls, CategoryUrls, IncomeUrls, PaginationUrls, PaymentUrls} from "./http";
import {PlannedPaymentDto} from "../../models/dto/planned-payment.model.dto";
import {GetAssignmentDto} from "../../models/dto/assignment.model.dto";

@Injectable({
  providedIn: 'root',
})
export class HttpService {

  constructor(private httpClient: HttpClient) {
  }

  public getBudgets(requestModel: RequestParams):
    Observable<HttpResponse<GetBudgetDto[]>> {
    return this.httpClient.get<GetBudgetDto[]>(
      BudgetUrls.budgets(requestModel),
      {observe: 'response'}
    );
  }

  public getBudget(idBudget: string):
    Observable<HttpResponse<GetBudgetDto>> {
    return this.httpClient.get<GetBudgetDto>(
      BudgetUrls.budgetId(idBudget),
      {observe: 'response'}
    );
  }

  public updateBudget(idBudget: string, budgetDto: BudgetDto):
    Observable<HttpResponse<{}>> {
    return this.httpClient.put(
      BudgetUrls.budgetId(idBudget),
      budgetDto,
      {observe: 'response'}
    )
  }

  public createBudget(budgetDate: string):
    Observable<HttpResponse<{}>> {
    return this.httpClient.post(
      BudgetUrls.budgetDate(budgetDate),
      null,
      {observe: 'response'}
    )
  }

  public deleteBudget(idBudget: string):
    Observable<HttpResponse<{}>> {
    return this.httpClient.delete(
      BudgetUrls.budgetId(idBudget),
      {observe: 'response'}
    )
  }

  public getBudgetIncomes(idBudget: string, requestParams: RequestParams):
    Observable<HttpResponse<GetIncomeDto[]>> {
    return this.httpClient.get<GetIncomeDto[]>(
      BudgetUrls.budgetIncomes(requestParams, idBudget),
      {observe: 'response'}
    );
  }

  public getBudgetPayments<T>(
    idBudget: string,
    requestParams: RequestParams,
    isPlanned: boolean): Observable<HttpResponse<T>> {
    return this.httpClient.get<T>(
      BudgetUrls.budgetPayments(idBudget, requestParams, isPlanned),
      {observe: 'response'}
    )
  }

  public createBudgetIncome(idBudget: string, incomeDto: IncomeDto):
    Observable<HttpResponse<{}>> {
    return this.httpClient.post(
      BudgetUrls.budgetIncome(idBudget),
      incomeDto,
      {observe: 'response'}
    )
  }

  public createBudgetPayment(
    idBudget: string,
    paymentDto: PaymentDto): Observable<HttpResponse<{}>> {
    return this.httpClient.post(
      BudgetUrls.budgetPayment(idBudget),
      paymentDto,
      {observe: 'response'}
    )
  }

  public createBudgetPlannedPayment(
    idBudget: string,
    paymentDto: PlannedPaymentDto): Observable<HttpResponse<{}>> {
    return this.httpClient.post(
      BudgetUrls.budgetPayments(idBudget, null, true),
      paymentDto,
      {observe: 'response'}
    )
  }

  public updateIncome(idIncome: string, incomeDto: IncomeDto):
    Observable<HttpResponse<{}>> {
    return this.httpClient.put(
      IncomeUrls.incomeId(idIncome),
      incomeDto,
      {observe: 'response'}
    )
  }

  public deleteIncome(idIncome: string):
    Observable<HttpResponse<{}>> {
    return this.httpClient.delete(
      IncomeUrls.incomeId(idIncome),
      {observe: 'response'}
    )
  }

  public getIncomePages(idBudget: string, requestParams: RequestParams):
    Observable<HttpResponse<PageDto>> {
    return this.httpClient.get<PageDto>(
      PaginationUrls.incomesPagination(idBudget, requestParams),
      {observe: 'response'}
    )
  }

  public updatePayment(
    idPayment: string,
    paymentDto: PaymentDto | PlannedPaymentDto,
    isPlanned: boolean): Observable<HttpResponse<{}>> {
    return this.httpClient.put(
      PaymentUrls.paymentId(idPayment, isPlanned),
      paymentDto,
      {observe: 'response'}
    )
  }

  public patchPaymentStatus(
    idPayment: string,
    paymentStatusForm: PaymentStatusDto,
    isPlanned: boolean): Observable<HttpResponse<{}>> {
    return this.httpClient.patch(
      PaymentUrls.paymentStatus(idPayment, isPlanned),
      paymentStatusForm,
      {observe: 'response'}
    )
  }

  public deletePayment(idPayment: string, isPlanned: boolean):
    Observable<HttpResponse<{}>> {
    return this.httpClient.delete(
      PaymentUrls.paymentId(idPayment, isPlanned),
      {observe: 'response'}
    )
  }

  public getPaymentPages(
    idBudget: string,
    requestParams: RequestParams): Observable<HttpResponse<PageDto>> {
    return this.httpClient.get<PageDto>(
      PaginationUrls.regularPaymentsPagination(idBudget, requestParams),
      {observe: 'response'}
    )
  }

  public getPlannedPaymentPages(
    idBudget: string,
    requestParams: RequestParams): Observable<HttpResponse<PageDto>> {
    return this.httpClient.get<PageDto>(
      PaginationUrls.plannedPaymentsPagination(idBudget, requestParams),
      {observe: 'response'}
    )
  }

  public getCategories(
    type: CategoryType,
    requestParams: RequestParams): Observable<HttpResponse<GetCategoryDto[]>> {
    return this.httpClient.get<GetCategoryDto[]>(
      CategoryUrls.paymentCategory(type, requestParams),
      {observe: 'response'}
    )
  }

  public getCategoryPages(
    type: CategoryType,
    requestParams: RequestParams): Observable<HttpResponse<PageDto>> {
    return this.httpClient.get<PageDto>(
      PaginationUrls.paymentCategories(type, requestParams),
      {observe: 'response'}
    )
  }

  public createCategory(categoryDto: CategoryDto):
    Observable<HttpResponse<{}>> {
    return this.httpClient.post(
      CategoryUrls.paymentCategory(null, null),
      categoryDto,
      {observe: 'response'}
    )
  }

  public updateCategory(idCategory: string, categoryDto: CategoryDto):
    Observable<HttpResponse<{}>> {
    return this.httpClient.put(
      CategoryUrls.paymentId(idCategory),
      categoryDto,
      {observe: 'response'}
    )
  }

  public deleteCategory(idCategory: string):
    Observable<HttpResponse<{}>> {
    return this.httpClient.delete(
      CategoryUrls.paymentId(idCategory),
      {observe: 'response'}
    )
  }

  public getPaymentAssignment(idPayment: string, isPlanned: boolean):
    Observable<HttpResponse<GetAssignmentDto>> {
    return this.httpClient.get<GetAssignmentDto>(
      PaymentUrls.paymentAssignment(idPayment, isPlanned),
      {observe: 'response'}
    )
  }
}
