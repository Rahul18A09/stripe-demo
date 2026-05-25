import type Stripe from "stripe";
import {
  comparePlans,
  getPlanByStripePriceId,
  getStripePriceId,
  getSubscriptionPlanById,
} from "@/data/subscription-plans";
import { stripe } from "@/lib/stripe";
import { getSubscriptionPeriod } from "@/lib/stripe-subscription";
import { getSubscriptionPriceId } from "@/lib/subscription-sync";

export async function upgradeSubscription(
  subscription: Stripe.Subscription,
  targetPlanId: string
) {
  const targetPlan = getSubscriptionPlanById(targetPlanId);
  const targetPriceId = getStripePriceId(targetPlanId);
  const itemId = subscription.items.data[0]?.id;

  if (!targetPlan || !targetPriceId || !itemId) {
    throw new Error("Target plan or Stripe price is not configured.");
  }

  const change = comparePlans(
    subscription.metadata.planId ?? "",
    targetPlanId
  );

  const currentPriceId = getSubscriptionPriceId(subscription);
  const currentPlan =
    (subscription.metadata.planId
      ? getSubscriptionPlanById(subscription.metadata.planId)
      : null) ??
    (currentPriceId ? getPlanByStripePriceId(currentPriceId) : null);

  const actualChange = currentPlan
    ? comparePlans(currentPlan.id, targetPlanId)
    : change;

  if (actualChange !== "upgrade") {
    throw new Error("Only upgrades to a higher plan are allowed with this action.");
  }

  return stripe.subscriptions.update(subscription.id, {
    items: [{ id: itemId, price: targetPriceId }],
    proration_behavior: "create_prorations",
    metadata: {
      ...subscription.metadata,
      planId: targetPlan.id,
      pendingPlanId: "",
    },
  });
}

export async function scheduleDowngrade(
  subscription: Stripe.Subscription,
  targetPlanId: string
) {
  const targetPlan = getSubscriptionPlanById(targetPlanId);
  const targetPriceId = getStripePriceId(targetPlanId);
  const currentPriceId = getSubscriptionPriceId(subscription);

  if (!targetPlan || !targetPriceId || !currentPriceId) {
    throw new Error("Target plan or Stripe price is not configured.");
  }

  const existingScheduleId =
    typeof subscription.schedule === "string"
      ? subscription.schedule
      : subscription.schedule?.id;

  if (existingScheduleId) {
    await stripe.subscriptionSchedules.release(existingScheduleId);
  }

  const period = getSubscriptionPeriod(subscription);

  const schedule = await stripe.subscriptionSchedules.create({
    from_subscription: subscription.id,
  });

  await stripe.subscriptionSchedules.update(schedule.id, {
    end_behavior: "release",
    phases: [
      {
        items: [{ price: currentPriceId, quantity: 1 }],
        start_date: period.current_period_start,
        end_date: period.current_period_end,
      },
      {
        items: [{ price: targetPriceId, quantity: 1 }],
        start_date: period.current_period_end,
      },
    ],
  });

  return stripe.subscriptions.update(subscription.id, {
    metadata: {
      ...subscription.metadata,
      pendingPlanId: targetPlan.id,
    },
  });
}
