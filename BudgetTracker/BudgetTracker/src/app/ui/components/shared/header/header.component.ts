import {Component, OnDestroy, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {AuthService} from "../../../../services/auth/auth.service";

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  protected isMenuCollapsed: boolean = true;
  protected loggedIn: boolean = true;

  constructor(
    private router: Router,
    protected authService: AuthService) {
  }

  navigateToHome(): void {
    this.router.navigate(['']);
  }

  navigateToLogin(): void {
    this.router.navigate(['/login']);
  }

  navigateToCategories(): void {
    this.router.navigate(['/categories'])
  }
}
