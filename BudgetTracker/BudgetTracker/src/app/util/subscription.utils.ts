import { Subscription } from 'rxjs';

export class SubscriptionUtils {
  static unsubscribeAll(subscriptions: Subscription[]): void {
    subscriptions.forEach((subscription: Subscription): void =>
      subscription.unsubscribe()
    );
  }
}
