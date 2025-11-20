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
  StatisticUrls, UserUrls,
} from "./http";
import {PlannedPaymentDto} from "../../models/dto/planned-payment.model.dto";
import {GetIncomeAssignmentDto, GetPaymentAssignmentDto} from "../../models/dto/assignment.model.dto";
import {
  GetIncomeStatsDto,
  GetPlannedPaymentStatsDto,
  GetRegularPaymentStatsDto
} from "../../models/statistics.model";
import {CompletePassResetDto, InitPassResetDto, LoginDto, OtpDto} from "../../models/components/login.component";
import {CompleteRegisterDto, InitRegisterDto} from "../../models/components/register.component";
import {
  ChangeEmailDto,
  ChangePasswordDto,
  EnrollOtpDto,
  GetUserDto
} from "../../models/components/user-panel.component";

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
      {observe: 'response', withCredentials: true}
    );
  }

  public getBudget(idBudget: string):
    Observable<HttpResponse<GetBudgetDto>> {
    return this.httpClient.get<GetBudgetDto>(
      BudgetUrls.budgetId(idBudget),
      {observe: 'response', withCredentials: true}
    );
  }

  public updateBudget(idBudget: string, budgetDto: BudgetDto):
    Observable<HttpResponse<{}>> {
    return this.httpClient.put(
      BudgetUrls.budgetId(idBudget),
      budgetDto,
      {observe: 'response', withCredentials: true}
    )
  }

  public createBudget(budgetDate: string):
    Observable<HttpResponse<{}>> {
    return this.httpClient.post(
      BudgetUrls.budgetDate(budgetDate),
      null,
      {observe: 'response', withCredentials: true}
    )
  }

  public deleteBudget(idBudget: string):
    Observable<HttpResponse<{}>> {
    return this.httpClient.delete(
      BudgetUrls.budgetId(idBudget),
      {observe: 'response', withCredentials: true}
    )
  }

  public getBudgetIncomes(idBudget: string, requestParams: RequestModel):
    Observable<HttpResponse<GetIncomeDto[]>> {
    return this.httpClient.get<GetIncomeDto[]>(
      BudgetUrls.budgetIncomes(requestParams, idBudget),
      {observe: 'response', withCredentials: true}
    );
  }

  public getBudgetPayments<T>(
    idBudget: string,
    requestParams: RequestModel,
    isPlanned: boolean): Observable<HttpResponse<T>> {
    return this.httpClient.get<T>(
      BudgetUrls.budgetPayments(idBudget, requestParams, isPlanned),
      {observe: 'response', withCredentials: true}
    )
  }

  public createBudgetIncome(idBudget: string, incomeDto: IncomeDto):
    Observable<HttpResponse<{}>> {
    return this.httpClient.post(
      BudgetUrls.budgetIncome(idBudget),
      incomeDto,
      {observe: 'response', withCredentials: true}
    )
  }

  public createBudgetPayment(
    idBudget: string,
    paymentDto: PaymentDto): Observable<HttpResponse<{}>> {
    return this.httpClient.post(
      BudgetUrls.budgetPayment(idBudget),
      paymentDto,
      {observe: 'response', withCredentials: true}
    )
  }

  public createBudgetPlannedPayment(
    idBudget: string,
    paymentDto: PlannedPaymentDto): Observable<HttpResponse<{}>> {
    return this.httpClient.post(
      BudgetUrls.budgetPayments(idBudget, null, true),
      paymentDto,
      {observe: 'response', withCredentials: true}
    )
  }

  public updateIncome(idIncome: string, incomeDto: IncomeDto):
    Observable<HttpResponse<{}>> {
    return this.httpClient.put(
      IncomeUrls.incomeId(idIncome),
      incomeDto,
      {observe: 'response', withCredentials: true}
    )
  }

  public deleteIncome(idIncome: string):
    Observable<HttpResponse<{}>> {
    return this.httpClient.delete(
      IncomeUrls.incomeId(idIncome),
      {observe: 'response', withCredentials: true}
    )
  }

  public getIncomePages(idBudget: string, requestParams: RequestModel):
    Observable<HttpResponse<PageDto>> {
    return this.httpClient.get<PageDto>(
      PaginationUrls.incomesPagination(idBudget, requestParams),
      {observe: 'response', withCredentials: true}
    )
  }

  public getIncomeCategories(
    requestParams: RequestModel): Observable<HttpResponse<GetPaymentCategoryDto[]>> {
    return this.httpClient.get<GetPaymentCategoryDto[]>(
      CategoryUrls.incomeCategory(requestParams),
      {observe: 'response', withCredentials: true}
    )
  }

  public getIncomeAssignment(idIncome: string):
    Observable<HttpResponse<GetIncomeAssignmentDto>> {
    return this.httpClient.get<GetIncomeAssignmentDto>(
      IncomeUrls.incomeAssignment(idIncome),
      {observe: 'response', withCredentials: true}
    )
  }

  public updatePayment(
    idPayment: string,
    paymentDto: PaymentDto | PlannedPaymentDto,
    isPlanned: boolean): Observable<HttpResponse<{}>> {
    return this.httpClient.put(
      PaymentUrls.paymentId(idPayment, isPlanned),
      paymentDto,
      {observe: 'response', withCredentials: true}
    )
  }

  public patchPaymentStatus(
    idPayment: string,
    paymentStatusForm: PaymentStatusDto,
    isPlanned: boolean): Observable<HttpResponse<{}>> {
    return this.httpClient.patch(
      PaymentUrls.paymentStatus(idPayment, isPlanned),
      paymentStatusForm,
      {observe: 'response', withCredentials: true}
    )
  }

  public deletePayment(idPayment: string, isPlanned: boolean):
    Observable<HttpResponse<{}>> {
    return this.httpClient.delete(
      PaymentUrls.paymentId(idPayment, isPlanned),
      {observe: 'response', withCredentials: true}
    )
  }

  public getPaymentPages(
    idBudget: string,
    requestParams: RequestModel): Observable<HttpResponse<PageDto>> {
    return this.httpClient.get<PageDto>(
      PaginationUrls.regularPaymentsPagination(idBudget, requestParams),
      {observe: 'response', withCredentials: true}
    )
  }

  public getPlannedPaymentPages(
    idBudget: string,
    requestParams: RequestModel): Observable<HttpResponse<PageDto>> {
    return this.httpClient.get<PageDto>(
      PaginationUrls.plannedPaymentsPagination(idBudget, requestParams),
      {observe: 'response', withCredentials: true}
    )
  }

  public getPaymentCategories(
    type: CategoryType,
    requestParams: RequestModel): Observable<HttpResponse<GetPaymentCategoryDto[]>> {
    return this.httpClient.get<GetPaymentCategoryDto[]>(
      CategoryUrls.paymentCategory(type, requestParams),
      {observe: 'response', withCredentials: true}
    )
  }

  public getPaymentCategoryPages(
    type: CategoryType,
    requestParams: RequestModel): Observable<HttpResponse<PageDto>> {
    return this.httpClient.get<PageDto>(
      PaginationUrls.paymentCategories(type, requestParams),
      {observe: 'response', withCredentials: true}
    )
  }

  public getIncomeCategoryPages(
    requestParams: RequestModel): Observable<HttpResponse<PageDto>> {
    return this.httpClient.get<PageDto>(
      PaginationUrls.incomeCategories(requestParams),
      {observe: 'response', withCredentials: true}
    )
  }

  public createPaymentCategory(categoryDto: PaymentCategoryDto):
    Observable<HttpResponse<{}>> {
    return this.httpClient.post(
      CategoryUrls.paymentCategory(null, null),
      categoryDto,
      {observe: 'response', withCredentials: true}
    )
  }

  public updatePaymentCategory(idCategory: string, categoryDto: PaymentCategoryDto):
    Observable<HttpResponse<{}>> {
    return this.httpClient.put(
      CategoryUrls.paymentCategoryId(idCategory),
      categoryDto,
      {observe: 'response', withCredentials: true}
    )
  }

  public updateIncomeCategory(idCategory: string, categoryDto: IncomeCategoryDto):
    Observable<HttpResponse<{}>> {
    return this.httpClient.put(
      CategoryUrls.incomeCategoryId(idCategory),
      categoryDto,
      {observe: 'response', withCredentials: true}
    )
  }

  public createIncomeCategory(categoryDto: IncomeCategoryDto):
    Observable<HttpResponse<{}>> {
    return this.httpClient.post(
      CategoryUrls.incomeCategory(null),
      categoryDto,
      {observe: 'response', withCredentials: true}
    )
  }

  public deleteIncomeCategory(idCategory: string):
    Observable<HttpResponse<{}>> {
    return this.httpClient.delete(
      CategoryUrls.incomeCategoryId(idCategory),
      {observe: 'response', withCredentials: true}
    )
  }

  public deletePaymentCategory(idCategory: string):
    Observable<HttpResponse<{}>> {
    return this.httpClient.delete(
      CategoryUrls.paymentCategoryId(idCategory),
      {observe: 'response', withCredentials: true}
    )
  }

  public getPaymentAssignment(idPayment: string, isPlanned: boolean):
    Observable<HttpResponse<GetPaymentAssignmentDto>> {
    return this.httpClient.get<GetPaymentAssignmentDto>(
      PaymentUrls.paymentAssignment(idPayment, isPlanned),
      {observe: 'response', withCredentials: true}
    )
  }

  public getBudgetSummary(idBudget: string):
    Observable<HttpResponse<GetBudgetStatisticsSummaryDto>> {
    return this.httpClient.get<GetBudgetStatisticsSummaryDto>(
      StatisticUrls.budgetStats(idBudget),
      {observe: 'response', withCredentials: true}
    )
  }

  public getBudgetSummaryInRange(requestParams: RequestModel):
    Observable<HttpResponse<GetBudgetSummaryDto[]>> {
    return this.httpClient.get<GetBudgetSummaryDto[]>(
      StatisticUrls.budgetStatsInRange(requestParams),
      {observe: 'response', withCredentials: true}
    )
  }

  public getIncomeCategoriesStats(idBudget: string):
    Observable<HttpResponse<GetIncomeStatsDto>> {
    return this.httpClient.get<GetIncomeStatsDto>(
      StatisticUrls.budgetIncomeStats(idBudget),
      {observe: 'response', withCredentials: true}
    );
  }

  public getRegularPaymentCategoriesStats(idBudget: string):
    Observable<HttpResponse<GetRegularPaymentStatsDto>> {
    return this.httpClient.get<GetRegularPaymentStatsDto>(
      StatisticUrls.budgetRegularPaymentStats(idBudget),
      {observe: 'response', withCredentials: true}
    );
  }

  public getPlannedPaymentCategoriesStats(idBudget: string):
    Observable<HttpResponse<GetPlannedPaymentStatsDto>> {
    return this.httpClient.get<GetPlannedPaymentStatsDto>(
      StatisticUrls.budgetPlannedPaymentStats(idBudget),
      {observe: 'response', withCredentials: true}
    );
  }

  public getBudgetGeneralCategories(idBudget: string):
    Observable<HttpResponse<GetBudgetGeneralCategoryDto>> {
    return this.httpClient.get<GetBudgetGeneralCategoryDto>(
      StatisticUrls.budgetGeneralCategories(idBudget),
      {observe: 'response', withCredentials: true}
    );
  }

  public getBudgetGeneralCategoriesInRange(requestParams: RequestModel):
    Observable<HttpResponse<GetBudgetGeneralCategoryDto>> {
    return this.httpClient.get<GetBudgetGeneralCategoryDto>(
      StatisticUrls.budgetGeneralCategoriesInRange(requestParams),
      {observe: 'response', withCredentials: true}
    );
  }

  public verifyLogin(verifyRequest: OtpDto):
    Observable<HttpResponse<any>> {
    return this.httpClient.post(
      AuthUrls.verifyLogin(),
      verifyRequest,
      {observe: 'response', withCredentials: true}
    )
  }

  public login(loginRequest: LoginDto):
    Observable<HttpResponse<any>> {
    return this.httpClient.post(
      AuthUrls.login(),
      loginRequest,
      {observe: 'response', withCredentials: true}
    )
  }

  public logout(): Observable<any> {
    return this.httpClient.post(
      AuthUrls.logout(),
      {observe: 'response', withCredentials: true}
    )
  }

  public loginStatus(): Observable<any> {
    return this.httpClient.get(
      AuthUrls.loginStatus(),
      {observe: 'response', withCredentials: true}
    )
  }

  public userProfile(): Observable<HttpResponse<GetUserDto>> {
    return this.httpClient.get<GetUserDto>(
      UserUrls.userProfile(),
      {observe: 'response', withCredentials: true}
    )
  }

  public initializePasswordReset(initPasswordResetDto: InitPassResetDto): Observable<any> {
    return this.httpClient.post(
      UserUrls.resetPassInitialize(),
      initPasswordResetDto,
      {observe: 'response', withCredentials: true}
    )
  }

  public completePasswordReset(completePassResetDto: CompletePassResetDto): Observable<any> {
    return this.httpClient.post(
      UserUrls.resetPassComplete(completePassResetDto),
      {observe: 'response', withCredentials: true}
    )
  }

  public initializeRegister(register: InitRegisterDto): Observable<any> {
    return this.httpClient.post(
      UserUrls.initRegister(),
      register,
      {observe: 'response'}
    )
  }

  public completeRegister(confirm: CompleteRegisterDto): Observable<any> {
    return this.httpClient.post(
      UserUrls.completeRegister(),
      confirm,
      {observe: 'response'}
    )
  }

  public initializeEmailChange(emailDto: ChangeEmailDto): Observable<any> {
    return this.httpClient.post(
      UserUrls.initEmailChange(),
      emailDto,
      {observe: 'response', withCredentials: true}
    )
  }

  public completeEmailChange(code: string): Observable<any> {
    return this.httpClient.post(
      UserUrls.completeEmailChange(code),
      null,
      {observe: 'response', withCredentials: true}
    )
  }

  public changePassword(changePassword: ChangePasswordDto): Observable<any> {
    return this.httpClient.post(
      UserUrls.changePassword(),
      changePassword,
      {observe: 'response', withCredentials: true}
    )
  }

  public enrollOtp():
    Observable<HttpResponse<EnrollOtpDto>> {
    return this.httpClient.post<EnrollOtpDto>(
      AuthUrls.enroll2Fa(),
      null,
      {observe: 'response', withCredentials: true}
    )
  }

  public enableOtp(code: string):
    Observable<any> {
    return this.httpClient.post<EnrollOtpDto>(
      AuthUrls.enable2Fa(code),
      null,
      {observe: 'response', withCredentials: true}
    )
  }

  public disableOtp(code: string):
    Observable<any> {
    return this.httpClient.post<EnrollOtpDto>(
      AuthUrls.disable2Fa(code),
      null,
      {observe: 'response', withCredentials: true}
    )
  }

  public refreshToken(): Observable<HttpResponse<any>> {
    return this.httpClient.post(
      AuthUrls.refreshToken(),
      null,
      {observe: 'response', withCredentials: true}
    )
  }
}
