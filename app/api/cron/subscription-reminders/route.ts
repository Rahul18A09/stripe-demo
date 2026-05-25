import { NextResponse } from "next/server";
import { ACTIVE_SUBSCRIPTION_STATUSES } from "@/data/subscription-plans";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { createSubscriptionNotification } from "@/lib/subscription-sync";

const REMINDER_WINDOW_DAYS = 7;

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createSupabaseAdminClient();
  const now = new Date();
  const windowEnd = new Date(now);
  windowEnd.setDate(windowEnd.getDate() + REMINDER_WINDOW_DAYS);

  const { data: subscriptions, error } = await supabase
    .from("product_subscriptions")
    .select("id, user_id, plan_name, current_period_end, cancel_at_period_end, status")
    .in("status", ACTIVE_SUBSCRIPTION_STATUSES)
    .not("current_period_end", "is", null)
    .lte("current_period_end", windowEnd.toISOString())
    .gte("current_period_end", now.toISOString());

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  let created = 0;

  for (const subscription of subscriptions ?? []) {
    const endDate = new Date(subscription.current_period_end).toLocaleDateString(
      "en-IN",
      { day: "2-digit", month: "short", year: "numeric" }
    );

    const { data: existing } = await supabase
      .from("subscription_notifications")
      .select("id")
      .eq("subscription_id", subscription.id)
      .eq("type", subscription.cancel_at_period_end ? "expiring_soon" : "renewal_upcoming")
      .gte("created_at", new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString())
      .limit(1);

    if (existing && existing.length > 0) {
      continue;
    }

    await createSubscriptionNotification({
      userId: subscription.user_id,
      subscriptionId: subscription.id,
      type: subscription.cancel_at_period_end ? "expiring_soon" : "renewal_upcoming",
      title: subscription.cancel_at_period_end
        ? "Your plan is ending soon"
        : "Renewal reminder",
      message: subscription.cancel_at_period_end
        ? `Your ${subscription.plan_name} plan ends on ${endDate}. Reactivate from your account to keep access.`
        : `Your ${subscription.plan_name} plan renews on ${endDate}.`,
    });

    created += 1;
  }

  return NextResponse.json({
    checked: subscriptions?.length ?? 0,
    notificationsCreated: created,
  });
}
