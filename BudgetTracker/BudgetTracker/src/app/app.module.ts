import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import '@angular/common/locales/global/pl';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderComponent } from './ui/components/shared/header/header.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { IndexComponent } from './ui/pages/index/index.component';
import { FooterComponent } from './ui/components/shared/footer/footer.component';
import { SpinnerComponent } from './ui/components/shared/spinner/spinner.component';
import { ErrorComponent } from './ui/components/shared/error/error.component';
import { BudgetComponent } from './ui/pages/budget/budget.component';
import { IncomeComponent } from './ui/components/modals/income/income.component';
import {FormsModule} from "@angular/forms";
import { PaymentComponent } from './ui/components/modals/payment/payment.component';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    IndexComponent,
    FooterComponent,
    SpinnerComponent,
    ErrorComponent,
    BudgetComponent,
    IncomeComponent,
    PaymentComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    NgbModule,
    HttpClientModule,
    CommonModule,
    FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule { }
