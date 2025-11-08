import {APP_INITIALIZER, importProvidersFrom, NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import '@angular/common/locales/global/pl';
import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {HeaderComponent} from './ui/components/shared/header/header.component';
import {NgbDateParserFormatter, NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {HTTP_INTERCEPTORS, HttpClientModule} from '@angular/common/http';
import {CommonModule} from '@angular/common';
import {DashboardComponent} from './ui/pages/dashboard/dashboard.component';
import {SpinnerComponent} from './ui/components/shared/spinner/spinner.component';
import {ErrorComponent} from './ui/components/shared/error/error.component';
import {BudgetComponent} from './ui/pages/budget/budget.component';
import {IncomeModalComponent} from './ui/components/modals/income-modal/income-modal.component';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {PaymentModalComponent} from './ui/components/modals/payment-modal/payment-modal.component';
import {ErrorViewComponent} from './ui/components/shared/error-view/error-view.component';
import {BudgetModalComponent} from "./ui/components/modals/budget-modal/budget-modal.component";
import {DeleteModalComponent} from './ui/components/modals/delete-modal/delete-modal.component';
import {SpinnerGrowComponent} from './ui/components/shared/spinner-grow/spinner-grow.component';
import {PaginationComponent} from './ui/components/shared/pagination/pagination.component';
import {BudgetsModalComponent} from './ui/components/modals/budgets-modal/budgets-modal.component';
import {ErrorModalComponent} from "./ui/components/modals/error-modal/error-modal.component";
import {OrderComponent} from './ui/components/shared/order/order.component';
import {TimerComponent} from './ui/components/shared/timer/timer.component';
import {ConfigService} from "./services/config/config.service";
import {firstValueFrom} from "rxjs";
import {Config} from "./models/config/config";
import {DatepickerFormatter} from "./util/date.util";
import {IncomeComponent} from './ui/components/page/budget/income/income.component';
import {PaymentComponent} from './ui/components/page/budget/payment/payment.component';
import {PlannedPaymentComponent} from './ui/components/page/budget/planned-payment/planned-payment.component';
import {
  PlannedPaymentModalComponent
} from './ui/components/modals/planned-payment-modal/planned-payment-modal.component';
import {CategoryPageComponent} from './ui/pages/category-page/category-page.component';
import {CategoryComponent} from './ui/components/page/category/category/category.component';
import {CategoryModalComponent} from './ui/components/modals/category-modal/category-modal.component';
import {CopyPaymentModalComponent} from './ui/components/modals/copy-payment-modal/copy-payment-modal.component';
import {InfoModalComponent} from './ui/components/modals/info-modal/info-modal.component';
import {TypeheadComponent} from './ui/components/shared/typehead/typehead.component';
import {BarChartModule, NgxChartsModule, PieChartModule} from "@swimlane/ngx-charts";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {LoginComponent} from './ui/pages/login/login.component';
import {JwtInterceptor} from "./services/http/http.interceptor.service";
import {ToastrModule} from "ngx-toastr";
import { OtpModalComponent } from './ui/components/modals/otp-modal/otp-modal.component';
import { RegisterComponent } from './ui/pages/register/register.component';

export function loadConfig(configService: ConfigService): () => Promise<Config> {
  return (): Promise<Config> => firstValueFrom(configService.loadConfig());
}

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    DashboardComponent,
    SpinnerComponent,
    ErrorComponent,
    BudgetComponent,
    IncomeModalComponent,
    PaymentModalComponent,
    ErrorViewComponent,
    BudgetModalComponent,
    DeleteModalComponent,
    SpinnerGrowComponent,
    PaginationComponent,
    BudgetsModalComponent,
    ErrorModalComponent,
    OrderComponent,
    TimerComponent,
    IncomeComponent,
    PaymentComponent,
    PlannedPaymentComponent,
    PlannedPaymentModalComponent,
    CategoryPageComponent,
    CategoryComponent,
    CategoryModalComponent,
    CopyPaymentModalComponent,
    InfoModalComponent,
    TypeheadComponent,
    LoginComponent,
    OtpModalComponent,
    RegisterComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    ToastrModule.forRoot({
      timeOut: 10000,
      positionClass: 'toast-top-left',
      progressAnimation: 'decreasing',
      progressBar: true,
      closeButton: false
    }),
    AppRoutingModule,
    NgbModule,
    HttpClientModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    BarChartModule,
    PieChartModule,
    NgxChartsModule,
  ],
  providers: [
    {provide: NgbDateParserFormatter, useClass: DatepickerFormatter},
    {provide: APP_INITIALIZER, useFactory: loadConfig, deps: [ConfigService], multi: true},
    {provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true},
    importProvidersFrom([BrowserModule, BrowserAnimationsModule]),
  ],
  bootstrap: [AppComponent],
})

export class AppModule {
}


