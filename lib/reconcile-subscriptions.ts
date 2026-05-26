import { getSubscriptionPlanById } from "@/data/subscription-plans";
import {
  linkStripeCustomerToUser,
  resolveUserIdFromCheckout,
} from "@/lib/link-subscription-user";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { stripe } from "@/lib/stripe";
import {
  resolvePlanFromSubscription,
  syncSubscriptionFromStripe,
} from "@/lib/subscription-sync";

type SubscriptionRow = {
  id: string;
  user_id: string;
  status: string;
  stripe_checkout_session_id: string | null;
  stripe_subscription_id: string | null;
};

export async function reconcileUserSubscriptions(userId: string, userEmail?: string | null) {
  const supabase = createSupabaseAdminClient();

  const { data: rows, error } = await supabase
    .from("product_subscriptions")
    .select("id, user_id, status, stripe_checkout_session_id, stripe_subscription_id")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[reconcile] load subscriptions failed:", error.message);
    return;
  }

  for (const row of (rows ?? []) as SubscriptionRow[]) {
    if (!row.stripe_checkout_session_id) {
      continue;
    }

    if (
      row.status !== "subscription_started" &&
      row.stripe_subscription_id
    ) {
      continue;
    }

    try {
      const session = await stripe.checkout.sessions.retrieve(
        row.stripe_checkout_session_id,
        { expand: ["subscription"] }
      );

      if (session.status === "complete" && session.mode === "subscription") {
        const subscriptionId =
          typeof session.subscription === "string"
            ? session.subscription
            : session.subscription?.id;

        if (!subscriptionId) {
          continue;
        }

        const subscription =
          typeof session.subscription === "object" && session.subscription
            ? session.subscription
            : await stripe.subscriptions.retrieve(subscriptionId);

        const resolvedUserId =
          (await resolveUserIdFromCheckout(session)) ?? userId;
        const plan =
          (session.metadata?.planId
            ? getSubscriptionPlanById(session.metadata.planId)
            : null) ?? resolvePlanFromSubscription(subscription);

        await syncSubscriptionFromStripe(subscription, {
          checkoutSessionId: session.id,
          userId: resolvedUserId,
          userEmail: session.customer_details?.email ?? undefined,
          plan: plan ?? undefined,
        });

        console.log(
          `[reconcile] activated subscription ${subscription.id} from session ${session.id}`
        );
      } else if (session.status === "expired") {
        await supabase
          .from("product_subscriptions")
          .update({ status: "checkout_expired", updated_at: new Date().toISOString() })
          .eq("id", row.id);
      }
    } catch (err) {
      console.error(
        `[reconcile] session ${row.stripe_checkout_session_id} failed:`,
        err
      );
    }
  }

  let { data: profile } = await supabase
    .from("users")
    .select("stripe_customer_id, email")
    .eq("auth_user_id", userId)
    .maybeSingle();

  if (!profile?.stripe_customer_id && userEmail) {
    const stripeCustomers = await stripe.customers.list({
      email: userEmail,
      limit: 10,
    });

    for (const customer of stripeCustomers.data) {
      const subscriptions = await stripe.subscriptions.list({
        customer: customer.id,
        status: "all",
        limit: 10,
      });

      const liveSubscription = subscriptions.data.find(
        (subscription) =>
          subscription.status === "active" ||
          subscription.status === "trialing" ||
          subscription.status === "past_due"
      );

      if (!liveSubscription) {
        continue;
      }

      await linkStripeCustomerToUser(customer.id, userId, userEmail);
      await syncSubscriptionFromStripe(liveSubscription, {
        userId,
        userEmail,
        plan: resolvePlanFromSubscription(liveSubscription) ?? undefined,
      });

      profile = {
        stripe_customer_id: customer.id,
        email: userEmail,
      };
      break;
    }
  }

  if (!profile?.stripe_customer_id) {
    return;
  }

  const stripeSubscriptions = await stripe.subscriptions.list({
    customer: profile.stripe_customer_id,
    status: "all",
    limit: 10,
  });

  let foundLiveSubscription = false;

  for (const subscription of stripeSubscriptions.data) {
    if (
      subscription.status === "active" ||
      subscription.status === "trialing" ||
      subscription.status === "past_due"
    ) {
      foundLiveSubscription = true;
      await syncSubscriptionFromStripe(subscription, {
        userId,
        plan: resolvePlanFromSubscription(subscription) ?? undefined,
      });
    }
  }

  if (foundLiveSubscription) {
    await supabase
      .from("product_subscriptions")
      .update({
        status: "superseded",
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId)
      .eq("status", "subscription_started");
  }
}
