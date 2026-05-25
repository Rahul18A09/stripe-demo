import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import {
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
        cancel_at_period_end: false,
      }
    );

    await syncSubscriptionFromStripe(updated, {
      userId: user.id,
      userEmail: user.email ?? undefined,
    });

    return NextResponse.json({
      message: "Your subscription will continue renewing automatically.",
      cancelAtPeriodEnd: false,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to reactivate subscription";

    console.error(error);

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
