import type Stripe from "stripe";

export function getSubscriptionPeriod(subscription: Stripe.Subscription) {
  return {
    current_period_start: subscription.current_period_start ?? subscription.billing_cycle_anchor,
    current_period_end: subscription.current_period_end ?? subscription.billing_cycle_anchor,
  };
}

export function getInvoiceSubscriptionId(invoice: Stripe.Invoice) {
  const parentSubscription = invoice.parent?.subscription_details?.subscription;

  if (typeof parentSubscription === "string") {
    return parentSubscription;
  }

  if (parentSubscription && typeof parentSubscription === "object") {
    return parentSubscription.id;
  }

  const legacySubscription = (
    invoice as Stripe.Invoice & { subscription?: string | Stripe.Subscription | null }
  ).subscription;

  if (typeof legacySubscription === "string") {
    return legacySubscription;
  }

  if (legacySubscription && typeof legacySubscription === "object") {
    return legacySubscription.id;
  }

  return null;
}
