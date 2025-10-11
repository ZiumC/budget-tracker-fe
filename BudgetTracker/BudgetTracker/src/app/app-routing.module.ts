import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {DashboardComponent} from './ui/pages/dashboard/dashboard.component';
import {BudgetComponent} from "./ui/pages/budget/budget.component";
import {CategoryPageComponent} from "./ui/pages/category-page/category-page.component";

const routes: Routes = [
  {path: '', component: DashboardComponent},
  {path: 'budget', component: BudgetComponent},
  {path: 'categories', component: CategoryPageComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
