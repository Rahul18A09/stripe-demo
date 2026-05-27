import type Stripe from "stripe";
import {
  ACTIVE_SUBSCRIPTION_STATUSES,
  getPlanByStripePriceId,
  getSubscriptionPlanById,
  type SubscriptionPlan,
} from "@/data/subscription-plans";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { getSubscriptionPeriod } from "@/lib/stripe-subscription";

type DbSubscription = {
  id: string;
  user_id: string;
  stripe_subscription_id: string | null;
};

export function getSubscriptionPriceId(subscription: Stripe.Subscription) {
  return subscription.items.data[0]?.price?.id ?? null;
}

export function mapStripeSubscriptionStatus(status: Stripe.Subscription.Status) {
  return status;
}

export function resolvePlanFromSubscription(subscription: Stripe.Subscription) {
  const priceId = getSubscriptionPriceId(subscription);
  const planFromPrice = priceId ? getPlanByStripePriceId(priceId) : undefined;
  const planIdFromMetadata = subscription.metadata?.planId;
  const planFromMetadata = planIdFromMetadata
    ? getSubscriptionPlanById(planIdFromMetadata)
    : undefined;

  return planFromPrice ?? planFromMetadata ?? null;
}

export async function resolveUserIdFromStripeCustomer(
  subscription: Stripe.Subscription
) {
  const customerId =
    typeof subscription.customer === "string"
      ? subscription.customer
      : subscription.customer?.id;

  if (!customerId) {
    return null;
  }

  const supabase = createSupabaseAdminClient();
  const { data: profile } = await supabase
    .from("users")
    .select("auth_user_id")
    .eq("stripe_customer_id", customerId)
    .maybeSingle();

  if (profile?.auth_user_id) {
    return profile.auth_user_id;
  }

  const { stripe } = await import("@/lib/stripe");
  const customer = await stripe.customers.retrieve(customerId);

  if (customer.deleted) {
    return null;
  }

  return customer.metadata?.supabaseUserId ?? null;
}

export async function getActiveSubscriptionForUser(userId: string) {
  const supabase = createSupabaseAdminClient();
  const { data } = await supabase
    .from("product_subscriptions")
    .select("*")
    .eq("user_id", userId)
    .in("status", ACTIVE_SUBSCRIPTION_STATUSES)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return data;
}

export async function syncSubscriptionFromStripe(
  subscription: Stripe.Subscription,
  options?: {
    checkoutSessionId?: string;
    userId?: string;
    userEmail?: string;
    plan?: SubscriptionPlan | null;
    product?: {
      id: string;
      name: string;
      image: string;
    } | null;
  }
) {
  const supabase = createSupabaseAdminClient();
  const priceId = getSubscriptionPriceId(subscription);
  const plan =
      options?.plan ??
      resolvePlanFromSubscription(subscription) ??
      (priceId ? getPlanByStripePriceId(priceId) : undefined);

  if (!plan) {
    console.error(
        "[subscription-sync] Unknown Stripe price:",
        priceId,
        "— map it in STRIPE_PRICE_CARE_* env vars"
    );
    throw new Error(
        `Unable to resolve plan for Stripe price ${priceId ?? "unknown"}. Check STRIPE_PRICE_* env vars match your Stripe prices.`
    );
  }

  const userId =
      options?.userId ??
      subscription.metadata?.supabaseUserId ??
      (await resolveUserIdFromStripeCustomer(subscription)) ??
      null;


  console.log("[SYNC] userId:", userId);
  console.log("[SYNC] subscriptionId:", subscription.id);
  console.log("[SYNC] priceId:", priceId);
  console.log("[SYNC] plan:", plan.id);


  const customerId =
      typeof subscription.customer === "string"
          ? subscription.customer
          : subscription.customer.id;

  const period = getSubscriptionPeriod(subscription);

  const payload = {
    user_id: userId,
    user_email:
        options?.userEmail ?? subscription.metadata?.userEmail ?? "unknown@example.com",
    stripe_customer_id: customerId,
    stripe_subscription_id: subscription.id,
    stripe_price_id: priceId,
    stripe_checkout_session_id: options?.checkoutSessionId ?? null,
    plan_id: plan.id,
    plan_name: plan.name,
    amount: plan.price,
    currency: subscription.currency ?? "inr",
    interval: plan.interval,
    status: mapStripeSubscriptionStatus(subscription.status),
    current_period_start: new Date(period.current_period_start * 1000).toISOString(),
    current_period_end: new Date(period.current_period_end * 1000).toISOString(),
    cancel_at_period_end: subscription.cancel_at_period_end,
    canceled_at: subscription.canceled_at
        ? new Date(subscription.canceled_at * 1000).toISOString()
        : null,
    pending_plan_id: subscription.metadata?.pendingPlanId ?? null,
    product_id: options?.product?.id ?? subscription.metadata?.productId ?? null,
    product_name:
        options?.product?.name ??
        subscription.metadata?.productName ??
        "General headphone care",
    product_image: options?.product?.image ?? null,
    updated_at: new Date().toISOString(),
  };

  console.log("[SYNC PAYLOAD]", payload);


//   const {data, error} = await supabase
//       .from("product_subscriptions")
//       .upsert(
//           {
//             ...payload,
//             status: subscription.status,
//           },
//           {
//             onConflict: "stripe_subscription_id",
//           }
//       )
//       .select("id")
//       .single();
//
//   if (error) throw error;
//
//   return data.id;
// }


  const {data, error} = await supabase
      .from("product_subscriptions")
      .upsert(
          {
            ...payload,
            status: subscription.status,
          },
          {
            onConflict: "stripe_subscription_id",
          }
      )
      .select();

  console.log("[SUPABASE DATA]", data);
  console.log("[SUPABASE ERROR]", error);

  if (error) {
    console.error("[UPSERT FAILED]", error);
    throw error;
  }

  return data?.[0]?.id;
}


export async function markSubscriptionCanceled(subscription: Stripe.Subscription) {
  const supabase = createSupabaseAdminClient();

  const { error } = await supabase
    .from("product_subscriptions")
    .update({
      status: "canceled",
      cancel_at_period_end: false,
      canceled_at: new Date().toISOString(),
      pending_plan_id: null,
      updated_at: new Date().toISOString(),
    })
    .eq("stripe_subscription_id", subscription.id);

  if (error) throw error;
}

export async function createSubscriptionNotification(input: {
  userId: string;
  subscriptionId?: string;
  type: string;
  title: string;
  message: string;
}) {
  const supabase = createSupabaseAdminClient();

  const { error } = await supabase.from("subscription_notifications").insert({
    user_id: input.userId,
    subscription_id: input.subscriptionId ?? null,
    type: input.type,
    title: input.title,
    message: input.message,
  });

  if (error) {
    console.error("Failed to create subscription notification:", error.message);
  }
}

