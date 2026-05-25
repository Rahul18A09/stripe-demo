import { NextResponse } from "next/server";
import {
  comparePlans,
  getSubscriptionPlanById,
} from "@/data/subscription-plans";
import {
  scheduleDowngrade,
  upgradeSubscription,
} from "@/lib/subscription-actions";
import { stripe } from "@/lib/stripe";
import {
  getActiveSubscriptionForUser,
  syncSubscriptionFromStripe,
} from "@/lib/subscription-sync";
import { createSupabaseServerClient } from "@/lib/supabase";

type ChangePlanRequest = {
  planId: string;
};

export async function POST(request: Request) {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const body = (await request.json()) as ChangePlanRequest;
    const targetPlan = getSubscriptionPlanById(body.planId);

    if (!targetPlan) {
      return NextResponse.json({ error: "Invalid plan." }, { status: 400 });
    }

    const record = await getActiveSubscriptionForUser(user.id);

    if (!record?.stripe_subscription_id) {
      return NextResponse.json(
        { error: "No active subscription found." },
        { status: 404 }
      );
    }

    const subscription = await stripe.subscriptions.retrieve(
      record.stripe_subscription_id
    );

    const change = comparePlans(record.plan_id, targetPlan.id);

    if (change === "same") {
      return NextResponse.json({
        message: "You are already on this plan.",
      });
    }

    const updated =
      change === "upgrade"
        ? await upgradeSubscription(subscription, targetPlan.id)
        : await scheduleDowngrade(subscription, targetPlan.id);

    await syncSubscriptionFromStripe(updated, {
      userId: user.id,
      userEmail: user.email ?? undefined,
      plan: change === "upgrade" ? targetPlan : undefined,
    });

    return NextResponse.json({
      message:
        change === "upgrade"
          ? `Upgraded to ${targetPlan.name}. Changes apply immediately.`
          : `Downgrade to ${targetPlan.name} scheduled for your next billing date.`,
      change,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Unable to change subscription plan";

    console.error(error);

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
