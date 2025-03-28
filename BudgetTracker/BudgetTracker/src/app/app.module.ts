import {APP_INITIALIZER, NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import '@angular/common/locales/global/pl';
import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {HeaderComponent} from './ui/components/shared/header/header.component';
import {NgbDateParserFormatter, NgbModal, NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {HttpClientModule} from '@angular/common/http';
import {CommonModule} from '@angular/common';
import {IndexComponent} from './ui/pages/index/index.component';
import {FooterComponent} from './ui/components/shared/footer/footer.component';
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
import { IncomeComponent } from './ui/components/page/budget/income/income.component';

export function loadConfig(configService: ConfigService): () => Promise<Config> {
  return (): Promise<Config> => firstValueFrom(configService.loadConfig());
}

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
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    NgbModule,
    HttpClientModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  providers: [
    {provide: NgbDateParserFormatter, useClass: DatepickerFormatter},
    {provide: APP_INITIALIZER, useFactory: loadConfig, deps: [ConfigService], multi: true}
  ],
  bootstrap: [AppComponent],
})

export class AppModule {
}


