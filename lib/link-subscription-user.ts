import type Stripe from "stripe";
import { getSubscriptionPlanById } from "@/data/subscription-plans";
import { resolvePlanFromSubscription } from "@/lib/subscription-sync";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { stripe } from "@/lib/stripe";
import { getActiveSubscriptionForUser } from "@/lib/subscription-sync";

export async function resolveUserIdFromCheckout(
  session: Stripe.Checkout.Session
) {
  const fromSession =
    session.metadata?.supabaseUserId ??
    session.client_reference_id ??
    null;

  if (fromSession) {
    return fromSession;
  }

  const customerId =
    typeof session.customer === "string"
      ? session.customer
      : session.customer?.id;

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

  const customer = await stripe.customers.retrieve(customerId);
  if (customer.deleted) {
    return null;
  }

  return customer.metadata?.supabaseUserId ?? null;
}

export async function linkStripeCustomerToUser(
  customerId: string,
  userId: string,
  email: string
) {
  const supabase = createSupabaseAdminClient();

  await stripe.customers.update(customerId, {
    metadata: { supabaseUserId: userId },
    email: email || undefined,
  });

  await supabase.from("users").upsert(
    {
      auth_user_id: userId,
      email,
      stripe_customer_id: customerId,
      last_login_at: new Date().toISOString(),
    },
    { onConflict: "auth_user_id" }
  );
}

export async function ensureSubscriptionMetadata(
  subscription: Stripe.Subscription,
  input: {
    userId: string;
    userEmail?: string | null;
    planId?: string | null;
  }
) {
  const plan =
    (input.planId ? getSubscriptionPlanById(input.planId) : null) ??
    resolvePlanFromSubscription(subscription);

  return stripe.subscriptions.update(subscription.id, {
    metadata: {
      ...subscription.metadata,
      supabaseUserId: input.userId,
      userEmail: input.userEmail ?? subscription.metadata?.userEmail ?? "",
      planId: plan?.id ?? subscription.metadata?.planId ?? "",
      pendingPlanId: subscription.metadata?.pendingPlanId ?? "",
    },
  });
}

export async function replacePriorActiveSubscriptions(
  userId: string,
  keepSubscriptionId: string
) {
  const existing = await getActiveSubscriptionForUser(userId);

  if (
    !existing?.stripe_subscription_id ||
    existing.stripe_subscription_id === keepSubscriptionId
  ) {
    return;
  }

  await stripe.subscriptions.cancel(existing.stripe_subscription_id);
}
