import { Subscription } from 'rxjs';

export class SubscriptionUtils {
  static unsubscribeAll(subscriptions: Subscription[]) {
    subscriptions.forEach((subscription: Subscription) =>
      subscription.unsubscribe()
    );
  }
}
