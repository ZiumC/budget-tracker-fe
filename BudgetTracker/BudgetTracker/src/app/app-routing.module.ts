import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {IndexComponent} from './ui/pages/index/index.component';
import {BudgetComponent} from "./ui/pages/budget/budget.component";
import {CategoryPageComponent} from "./ui/pages/category-page/category-page.component";

const routes: Routes = [
  {path: '', component: IndexComponent},
  {path: 'budget', component: BudgetComponent},
  {path: 'categories', component: CategoryPageComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
