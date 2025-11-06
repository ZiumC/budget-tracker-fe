import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {DashboardComponent} from './ui/pages/dashboard/dashboard.component';
import {BudgetComponent} from "./ui/pages/budget/budget.component";
import {CategoryPageComponent} from "./ui/pages/category-page/category-page.component";
import {LoginComponent} from "./ui/pages/login/login.component";
import {AuthGuard} from "./services/auth/auth.guard.service";

const routes: Routes = [
  {path: 'login', component: LoginComponent},
  {
    path: '',
    component: DashboardComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'budget',
    component: BudgetComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'categories',
    component: CategoryPageComponent,
    canActivate: [AuthGuard]
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
