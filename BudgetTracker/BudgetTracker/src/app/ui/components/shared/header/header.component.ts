import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { SubscriptionUtils } from '../../../../util/subscription.utils';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription[] = [];
  protected isMenuCollapsed: boolean = true;
  protected loggedIn: boolean = false;

  constructor(private router: Router) { }

  ngOnInit(): void {
    //throw new Error('Method not implemented.');
  }

  ngOnDestroy(): void {
    SubscriptionUtils.unsubscribeAll(this.subscriptions);
  }

  navigateToHome(): void {
    this.router.navigate(['/']);
  }
}
