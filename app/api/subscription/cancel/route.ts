import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { getSubscriptionPeriod } from "@/lib/stripe-subscription";
import {
  createSubscriptionNotification,
  getActiveSubscriptionForUser,
  syncSubscriptionFromStripe,
} from "@/lib/subscription-sync";
import { createSupabaseServerClient } from "@/lib/supabase";

export async function POST() {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const record = await getActiveSubscriptionForUser(user.id);

    if (!record?.stripe_subscription_id) {
      return NextResponse.json(
        { error: "No active subscription found." },
        { status: 404 }
      );
    }

    const updated = await stripe.subscriptions.update(
      record.stripe_subscription_id,
      {
        cancel_at_period_end: true,
      }
    );

    await syncSubscriptionFromStripe(updated, {
      userId: user.id,
      userEmail: user.email ?? undefined,
    });

    const period = getSubscriptionPeriod(updated);
    const endDate = new Date(period.current_period_end * 1000).toLocaleDateString(
      "en-IN",
      { day: "2-digit", month: "short", year: "numeric" }
    );

    await createSubscriptionNotification({
      userId: user.id,
      subscriptionId: record.id,
      type: "cancel_scheduled",
      title: "Subscription ending soon",
      message: `Your care plan will end on ${endDate}. Reactivate anytime before then to keep your benefits.`,
    });

    return NextResponse.json({
      message: `Your plan will cancel on ${endDate}.`,
      cancelAtPeriodEnd: true,
      currentPeriodEnd: period.current_period_end,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Unable to cancel subscription";

    console.error(error);

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
