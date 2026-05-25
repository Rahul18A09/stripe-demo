import { NextResponse } from "next/server";
import {
  getStripeConfigStatus,
  isPricingTableOnSecretAccount,
} from "@/lib/stripe-config";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";

export async function GET() {
  const stripeConfig = getStripeConfigStatus();
  const checks: Record<string, string> = {
    STRIPE_SECRET_KEY: stripeConfig.hasSecretKey ? "ok" : "missing",
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET ? "ok" : "missing",
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY
      ? "ok"
      : "missing",
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: stripeConfig.hasPublishableKey
      ? "ok"
      : "missing",
    stripe_keys_same_account: stripeConfig.keysMatch ? "ok" : "mismatch",
    NEXT_PUBLIC_STRIPE_PRICING_TABLE_ID: stripeConfig.hasPricingTableId
      ? "ok"
      : "missing",
  };

  if (stripeConfig.hasPricingTableId && stripeConfig.hasSecretKey) {
    const valid = await isPricingTableOnSecretAccount(stripeConfig.pricingTableId);
    checks.pricing_table_on_secret_account = valid ? "ok" : "wrong_account_or_missing";
  }

  const { stripePriceExists } = await import("@/lib/stripe-config");
  for (const key of [
    "STRIPE_PRICE_CARE_BASIC",
    "STRIPE_PRICE_CARE_PLUS",
    "STRIPE_PRICE_CARE_PREMIUM",
  ] as const) {
    const priceId = process.env[key];
    if (priceId) {
      const valid = await stripePriceExists(priceId);
      checks[key] = valid ? "ok" : "wrong_account_or_missing";
    } else {
      checks[key] = "missing";
    }
  }

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
        ? "Local dev: run npm run stripe:listen in a second terminal, copy whsec_ into STRIPE_WEBHOOK_SECRET, restart npm run dev, then complete a test checkout."
        : "Fix missing env vars or run supabase/subscription-lifecycle.sql in Supabase SQL editor",
      why_tables_empty:
        "webhook_events and subscription_notifications only get rows when Stripe POSTs to /api/webhooks. On localhost you must run: npm run stripe:listen",
    },
    { status: healthy ? 200 : 503 }
  );
}
