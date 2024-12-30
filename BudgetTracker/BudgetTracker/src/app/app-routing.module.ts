import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {IndexComponent} from './ui/pages/index/index.component';
import {BudgetComponent} from "./ui/pages/budget/budget.component";

const routes: Routes = [
  {path: '', component: IndexComponent},
  {path: 'budget', component: BudgetComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
