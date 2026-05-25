import { NextResponse } from "next/server";
import { headers } from "next/headers";
import type Stripe from "stripe";
import { getSubscriptionPlanById } from "@/data/subscription-plans";
import { stripe } from "@/lib/stripe";
import {
  getInvoiceSubscriptionId,
  getSubscriptionPeriod,
} from "@/lib/stripe-subscription";
import {
  ensureSubscriptionMetadata,
  linkStripeCustomerToUser,
  replacePriorActiveSubscriptions,
  resolveUserIdFromCheckout,
} from "@/lib/link-subscription-user";
import {
  createSubscriptionNotification,
  markSubscriptionCanceled,
  resolvePlanFromSubscription,
  resolveUserIdFromStripeCustomer,
  syncSubscriptionFromStripe,
} from "@/lib/subscription-sync";
import {
  isWebhookProcessed,
  markWebhookProcessed,
} from "@/lib/webhook-store";

export async function POST(request: Request) {
  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature") ?? "";
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error("STRIPE_WEBHOOK_SECRET environment variable is missing.");
    return NextResponse.json(
      { error: "Stripe webhook secret is not configured." },
      { status: 500 }
    );
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Invalid signature";
    console.error(`Webhook signature verification failed: ${message}`);
    return NextResponse.json({ error: `Webhook Error: ${message}` }, { status: 400 });
  }

  try {
    if (await isWebhookProcessed(event.id)) {
      return NextResponse.json({ received: true, duplicate: true });
    }

    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      case "customer.subscription.created":
      case "customer.subscription.updated":
        await handleSubscriptionUpdated(
          event.data.object as Stripe.Subscription
        );
        break;
      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(
          event.data.object as Stripe.Subscription
        );
        break;
      case "invoice.upcoming":
        await handleInvoiceUpcoming(event.data.object as Stripe.Invoice);
        break;
      case "invoice.payment_failed":
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
        break;
      case "invoice.paid":
        await handleInvoicePaid(event.data.object as Stripe.Invoice);
        break;
      default:
        break;
    }

    await markWebhookProcessed(event);
    return NextResponse.json({ received: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown webhook error";
    console.error(
      `[webhook] ${event.type} (${event.id}) failed:`,
      message,
      err
    );
    return NextResponse.json(
      { error: "Error processing webhook event", detail: message },
      { status: 500 }
    );
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  if (session.mode !== "subscription" || !session.subscription) {
    if (session.mode === "payment") {
      const { createSupabaseAdminClient } = await import("@/lib/supabase-admin");
      const supabase = createSupabaseAdminClient();
      const { error } = await supabase
        .from("orders")
        .update({ status: "completed" })
        .eq("stripe_checkout_session_id", session.id);

      if (error) throw error;
    }
    return;
  }

  let subscription = await stripe.subscriptions.retrieve(
    session.subscription as string
  );

  const userId = await resolveUserIdFromCheckout(session);
  const userEmail =
    session.customer_details?.email ??
    session.metadata?.userEmail ??
    session.customer_email ??
    null;

  const customerId =
    typeof session.customer === "string"
      ? session.customer
      : session.customer?.id;

  if (userId && customerId) {
    await linkStripeCustomerToUser(customerId, userId, userEmail ?? "");
    await replacePriorActiveSubscriptions(userId, subscription.id);
    subscription = await ensureSubscriptionMetadata(subscription, {
      userId,
      userEmail,
      planId: session.metadata?.planId ?? null,
    });
  }

  const plan =
    (session.metadata?.planId
      ? getSubscriptionPlanById(session.metadata.planId)
      : null) ?? resolvePlanFromSubscription(subscription);

  await syncSubscriptionFromStripe(subscription, {
    checkoutSessionId: session.id,
    userId: userId ?? undefined,
    userEmail: userEmail ?? undefined,
    plan: plan ?? undefined,
  });
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const subscriptionId = await syncSubscriptionFromStripe(subscription);
  const userId =
    subscription.metadata?.supabaseUserId ??
    (await resolveUserIdFromStripeCustomer(subscription));

  if (!userId) return;

  if (subscription.cancel_at_period_end) {
    const period = getSubscriptionPeriod(subscription);
    const endDate = new Date(period.current_period_end * 1000).toLocaleDateString(
      "en-IN",
      { day: "2-digit", month: "short", year: "numeric" }
    );

    await createSubscriptionNotification({
      userId,
      subscriptionId,
      type: "expiring_soon",
      title: "Your plan is ending soon",
      message: `Your care plan will end on ${endDate}. Reactivate from your account to keep your benefits.`,
    });
  }

  if (subscription.metadata?.pendingPlanId) {
    const pendingPlan = getSubscriptionPlanById(subscription.metadata.pendingPlanId);
    if (pendingPlan) {
      await createSubscriptionNotification({
        userId,
        subscriptionId,
        type: "downgrade_scheduled",
        title: "Plan change scheduled",
        message: `Your plan will change to ${pendingPlan.name} on your next billing date.`,
      });
    }
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  await markSubscriptionCanceled(subscription);

  const userId =
    subscription.metadata?.supabaseUserId ??
    (await resolveUserIdFromStripeCustomer(subscription));
  if (!userId) return;

  await createSubscriptionNotification({
    userId,
    type: "canceled",
    title: "Subscription ended",
    message:
      "Your care plan has expired and was canceled. Subscribe again anytime from the plans page.",
  });
}

async function handleInvoiceUpcoming(invoice: Stripe.Invoice) {
  const subscriptionId = getInvoiceSubscriptionId(invoice);

  if (!subscriptionId) return;

  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const userId =
    subscription.metadata?.supabaseUserId ??
    (await resolveUserIdFromStripeCustomer(subscription));
  if (!userId) return;

  const dbSubscriptionId = await syncSubscriptionFromStripe(subscription);
  const period = getSubscriptionPeriod(subscription);
  const renewalDate = new Date(period.current_period_end * 1000).toLocaleDateString(
    "en-IN",
    {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  if (subscription.cancel_at_period_end) {
    await createSubscriptionNotification({
      userId,
      subscriptionId: dbSubscriptionId,
      type: "expiring_soon",
      title: "Renewal reminder",
      message: `Your care plan ends on ${renewalDate}. Reactivate before then to avoid losing access.`,
    });
    return;
  }

  await createSubscriptionNotification({
    userId,
    subscriptionId: dbSubscriptionId,
    type: "renewal_upcoming",
    title: "Upcoming renewal",
    message: `Your care plan will renew on ${renewalDate}.`,
  });
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  const subscriptionId = getInvoiceSubscriptionId(invoice);

  if (!subscriptionId) return;

  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const userId =
    subscription.metadata?.supabaseUserId ??
    (await resolveUserIdFromStripeCustomer(subscription));
  if (!userId) return;

  const dbSubscriptionId = await syncSubscriptionFromStripe(subscription);

  await createSubscriptionNotification({
    userId,
    subscriptionId: dbSubscriptionId,
    type: "payment_failed",
    title: "Payment failed",
    message:
      "We could not process your subscription payment. Update your billing details to avoid cancellation.",
  });
}

async function handleInvoicePaid(invoice: Stripe.Invoice) {
  const subscriptionId = getInvoiceSubscriptionId(invoice);

  if (!subscriptionId) return;

  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  await syncSubscriptionFromStripe(subscription);
}
