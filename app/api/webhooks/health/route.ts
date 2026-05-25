import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";

export async function GET() {
  const checks: Record<string, string> = {
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY ? "ok" : "missing",
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET ? "ok" : "missing",
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY
      ? "ok"
      : "missing",
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env
      .NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
      ? "ok"
      : "missing",
    NEXT_PUBLIC_STRIPE_PRICING_TABLE_ID: process.env
      .NEXT_PUBLIC_STRIPE_PRICING_TABLE_ID
      ? "ok"
      : "missing",
  };

  try {
    const supabase = createSupabaseAdminClient();
    const { error: webhookTableError } = await supabase
      .from("webhook_events")
      .select("stripe_event_id")
      .limit(1);

    checks.webhook_events_table = webhookTableError
      ? `error: ${webhookTableError.message}`
      : "ok";

    const { error: notificationsTableError } = await supabase
      .from("subscription_notifications")
      .select("id")
      .limit(1);

    checks.subscription_notifications_table = notificationsTableError
      ? `error: ${notificationsTableError.message}`
      : "ok";
  } catch (error) {
    checks.supabase_admin = error instanceof Error ? error.message : "failed";
  }

  const healthy = Object.values(checks).every((value) => value === "ok");

  return NextResponse.json(
    {
      healthy,
      checks,
      hint: healthy
        ? "Run: stripe listen --forward-to localhost:3000/api/webhooks"
        : "Fix missing env vars or run supabase/subscription-lifecycle.sql in Supabase SQL editor",
    },
    { status: healthy ? 200 : 503 }
  );
}
