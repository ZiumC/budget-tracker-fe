import {HttpClient, HttpResponse} from "@angular/common/http";
import {Observable} from "rxjs";
import {Injectable} from "@angular/core";
import {RequestModel} from "../../models/request.model";
import {GetIncomeDto, IncomeDto} from "../../models/dto/income.model.dto";
import {PaymentDto, PaymentStatusDto} from "../../models/dto/payment.model.dto";
import {
  BudgetDto,
  GetBudgetGeneralCategoryDto,
  GetBudgetDto,
  GetBudgetStatisticsSummaryDto,
  GetBudgetSummaryDto
} from "../../models/dto/budget.model.dto";
import {PageDto} from "../../models/dto/page.model.dto";
import {
  PaymentCategoryDto,
  CategoryType,
  GetPaymentCategoryDto, IncomeCategoryDto,
} from "../../models/dto/category.model.dto";
import {
  AuthUrls,
  BudgetUrls,
  CategoryUrls,
  IncomeUrls,
  PaginationUrls,
  PaymentUrls,
  StatisticUrls,
  UserUrls
} from "./http";
import {PlannedPaymentDto} from "../../models/dto/planned-payment.model.dto";
import {GetIncomeAssignmentDto, GetPaymentAssignmentDto} from "../../models/dto/assignment.model.dto";
import {
  GetIncomeStatsDto,
  GetPlannedPaymentStatsDto,
  GetRegularPaymentStatsDto
} from "../../models/statistics.model";
import {JwtDto} from "../../models/dto/jwt.model.dto";
import {LoginRequestDto} from "../../models/dto/user.model.dto";

@Injectable({
  providedIn: 'root',
})
export class HttpService {

  constructor(private httpClient: HttpClient) {
  }

  public getBudgets(requestModel: RequestModel):
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

  public getBudgetIncomes(idBudget: string, requestParams: RequestModel):
    Observable<HttpResponse<GetIncomeDto[]>> {
    return this.httpClient.get<GetIncomeDto[]>(
      BudgetUrls.budgetIncomes(requestParams, idBudget),
      {observe: 'response'}
    );
  }

  public getBudgetPayments<T>(
    idBudget: string,
    requestParams: RequestModel,
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

  public getIncomePages(idBudget: string, requestParams: RequestModel):
    Observable<HttpResponse<PageDto>> {
    return this.httpClient.get<PageDto>(
      PaginationUrls.incomesPagination(idBudget, requestParams),
      {observe: 'response'}
    )
  }

  public getIncomeCategories(
    requestParams: RequestModel): Observable<HttpResponse<GetPaymentCategoryDto[]>> {
    return this.httpClient.get<GetPaymentCategoryDto[]>(
      CategoryUrls.incomeCategory(requestParams),
      {observe: 'response'}
    )
  }

  public getIncomeAssignment(idIncome: string):
    Observable<HttpResponse<GetIncomeAssignmentDto>> {
    return this.httpClient.get<GetIncomeAssignmentDto>(
      IncomeUrls.incomeAssignment(idIncome),
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
    requestParams: RequestModel): Observable<HttpResponse<PageDto>> {
    return this.httpClient.get<PageDto>(
      PaginationUrls.regularPaymentsPagination(idBudget, requestParams),
      {observe: 'response'}
    )
  }

  public getPlannedPaymentPages(
    idBudget: string,
    requestParams: RequestModel): Observable<HttpResponse<PageDto>> {
    return this.httpClient.get<PageDto>(
      PaginationUrls.plannedPaymentsPagination(idBudget, requestParams),
      {observe: 'response'}
    )
  }

  public getPaymentCategories(
    type: CategoryType,
    requestParams: RequestModel): Observable<HttpResponse<GetPaymentCategoryDto[]>> {
    return this.httpClient.get<GetPaymentCategoryDto[]>(
      CategoryUrls.paymentCategory(type, requestParams),
      {observe: 'response'}
    )
  }

  public getPaymentCategoryPages(
    type: CategoryType,
    requestParams: RequestModel): Observable<HttpResponse<PageDto>> {
    return this.httpClient.get<PageDto>(
      PaginationUrls.paymentCategories(type, requestParams),
      {observe: 'response'}
    )
  }

  public getIncomeCategoryPages(
    requestParams: RequestModel): Observable<HttpResponse<PageDto>> {
    return this.httpClient.get<PageDto>(
      PaginationUrls.incomeCategories(requestParams),
      {observe: 'response'}
    )
  }

  public createPaymentCategory(categoryDto: PaymentCategoryDto):
    Observable<HttpResponse<{}>> {
    return this.httpClient.post(
      CategoryUrls.paymentCategory(null, null),
      categoryDto,
      {observe: 'response'}
    )
  }

  public updatePaymentCategory(idCategory: string, categoryDto: PaymentCategoryDto):
    Observable<HttpResponse<{}>> {
    return this.httpClient.put(
      CategoryUrls.paymentCategoryId(idCategory),
      categoryDto,
      {observe: 'response'}
    )
  }

  public updateIncomeCategory(idCategory: string, categoryDto: IncomeCategoryDto):
    Observable<HttpResponse<{}>> {
    return this.httpClient.put(
      CategoryUrls.incomeCategoryId(idCategory),
      categoryDto,
      {observe: 'response'}
    )
  }

  public createIncomeCategory(categoryDto: IncomeCategoryDto):
    Observable<HttpResponse<{}>> {
    return this.httpClient.post(
      CategoryUrls.incomeCategory(null),
      categoryDto,
      {observe: 'response'}
    )
  }

  public deleteIncomeCategory(idCategory: string):
    Observable<HttpResponse<{}>> {
    return this.httpClient.delete(
      CategoryUrls.incomeCategoryId(idCategory),
      {observe: 'response'}
    )
  }

  public deletePaymentCategory(idCategory: string):
    Observable<HttpResponse<{}>> {
    return this.httpClient.delete(
      CategoryUrls.paymentCategoryId(idCategory),
      {observe: 'response'}
    )
  }

  public getPaymentAssignment(idPayment: string, isPlanned: boolean):
    Observable<HttpResponse<GetPaymentAssignmentDto>> {
    return this.httpClient.get<GetPaymentAssignmentDto>(
      PaymentUrls.paymentAssignment(idPayment, isPlanned),
      {observe: 'response'}
    )
  }

  public getBudgetSummary(idBudget: string):
    Observable<HttpResponse<GetBudgetStatisticsSummaryDto>> {
    return this.httpClient.get<GetBudgetStatisticsSummaryDto>(
      StatisticUrls.budgetStats(idBudget),
      {observe: 'response'}
    )
  }

  public getBudgetSummaryInRange(requestParams: RequestModel):
    Observable<HttpResponse<GetBudgetSummaryDto[]>> {
    return this.httpClient.get<GetBudgetSummaryDto[]>(
      StatisticUrls.budgetStatsInRange(requestParams),
      {observe: 'response'}
    )
  }

  public getIncomeCategoriesStats(idBudget: string):
    Observable<HttpResponse<GetIncomeStatsDto>> {
    return this.httpClient.get<GetIncomeStatsDto>(
      StatisticUrls.budgetIncomeStats(idBudget),
      {observe: 'response'}
    );
  }

  public getRegularPaymentCategoriesStats(idBudget: string):
    Observable<HttpResponse<GetRegularPaymentStatsDto>> {
    return this.httpClient.get<GetRegularPaymentStatsDto>(
      StatisticUrls.budgetRegularPaymentStats(idBudget),
      {observe: 'response'}
    );
  }

  public getPlannedPaymentCategoriesStats(idBudget: string):
    Observable<HttpResponse<GetPlannedPaymentStatsDto>> {
    return this.httpClient.get<GetPlannedPaymentStatsDto>(
      StatisticUrls.budgetPlannedPaymentStats(idBudget),
      {observe: 'response'}
    );
  }

  public getBudgetGeneralCategories(idBudget: string):
    Observable<HttpResponse<GetBudgetGeneralCategoryDto>> {
    return this.httpClient.get<GetBudgetGeneralCategoryDto>(
      StatisticUrls.budgetGeneralCategories(idBudget),
      {observe: 'response'}
    );
  }

  public getBudgetGeneralCategoriesInRange(requestParams: RequestModel):
    Observable<HttpResponse<GetBudgetGeneralCategoryDto>> {
    return this.httpClient.get<GetBudgetGeneralCategoryDto>(
      StatisticUrls.budgetGeneralCategoriesInRange(requestParams),
      {observe: 'response'}
    );
  }

  public login(loginRequest: LoginRequestDto):
    Observable<HttpResponse<JwtDto>> {
    return this.httpClient.post<JwtDto>(
      AuthUrls.login(),
      loginRequest,
      {observe: 'response', withCredentials: true}
    )
  }

  public logout():Observable<any> {
    return this.httpClient.post(
      AuthUrls.logout(),
      {observe: 'response', withCredentials: true}
    )
  }

  public user():Observable<any> {
    return this.httpClient.get(
      UserUrls.details(),
      {observe: 'response', withCredentials: true}
    )
  }
}
