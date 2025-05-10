import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  protected isMenuCollapsed: boolean = true;
  protected loggedIn: boolean = true;

  constructor(private router: Router) { }

  navigateToHome(): void {
    this.router.navigate(['']);
  }

  navigateToLogin(): void {
    this.router.navigate(['/login']);
  }

  navigateToCategories(): void{
    this.router.navigate(['/categories'])
  }
}
