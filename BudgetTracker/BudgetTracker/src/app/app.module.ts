import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import '@angular/common/locales/global/pl';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderComponent } from './ui/components/shared/header/header.component';
import {NgbDateParserFormatter, NgbModule} from '@ng-bootstrap/ng-bootstrap';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { IndexComponent } from './ui/pages/index/index.component';
import { FooterComponent } from './ui/components/shared/footer/footer.component';
import { SpinnerComponent } from './ui/components/shared/spinner/spinner.component';
import { ErrorComponent } from './ui/components/shared/error/error.component';
import { BudgetComponent } from './ui/pages/budget/budget.component';
import { IncomeModalComponent } from './ui/components/modals/income-modal/income-modal.component';
import {FormsModule} from "@angular/forms";
import { PaymentModalComponent } from './ui/components/modals/payment-modal/payment-modal.component';
import { ModalErrorComponent } from './ui/components/shared/modal-error/modal-error.component';
import {DatepickerFormatter} from "./util/datepicker.utils";
import {BudgetModalComponent} from "./ui/components/modals/budget-modal/budget-modal.component";
import { DeleteModalComponent } from './ui/components/modals/delete-modal/delete-modal.component';
import { SpinnerGrowComponent } from './ui/components/shared/spinner-grow/spinner-grow.component';
import { PaginationComponent } from './ui/components/shared/pagination/pagination.component';


@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    IndexComponent,
    FooterComponent,
    SpinnerComponent,
    ErrorComponent,
    BudgetComponent,
    IncomeModalComponent,
    PaymentModalComponent,
    ModalErrorComponent,
    BudgetModalComponent,
    DeleteModalComponent,
    SpinnerGrowComponent,
    PaginationComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    NgbModule,
    HttpClientModule,
    CommonModule,
    FormsModule,
  ],
  providers: [ { provide: NgbDateParserFormatter, useClass: DatepickerFormatter },],
  bootstrap: [AppComponent],
})
export class AppModule { }
