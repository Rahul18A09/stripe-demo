import type Stripe from "stripe";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";

function isMissingTableError(message: string) {
  return (
    message.includes("does not exist") ||
    message.includes("schema cache") ||
    message.includes("webhook_events")
  );
}

export async function isWebhookProcessed(eventId: string): Promise<boolean> {
  try {
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
      .from("webhook_events")
      .select("stripe_event_id")
      .eq("stripe_event_id", eventId)
      .maybeSingle();

    if (error) {
      if (isMissingTableError(error.message)) {
        console.warn(
          "[webhook] webhook_events table missing — run supabase/subscription-lifecycle.sql"
        );
        return false;
      }
      throw error;
    }

    return Boolean(data);
  } catch (error) {
    console.error("[webhook] isWebhookProcessed failed:", error);
    return false;
  }
}

export async function markWebhookProcessed(event: Stripe.Event): Promise<void> {
  try {
    const supabase = createSupabaseAdminClient();
    const { error } = await supabase.from("webhook_events").insert({
      stripe_event_id: event.id,
      event_type: event.type,
    });

    if (error) {
      if (error.code === "23505") {
        return;
      }
      if (isMissingTableError(error.message)) {
        console.warn(
          "[webhook] Could not record event — webhook_events table missing"
        );
        return;
      }
      throw error;
    }
  } catch (error) {
    console.error("[webhook] markWebhookProcessed failed:", error);
  }
}
