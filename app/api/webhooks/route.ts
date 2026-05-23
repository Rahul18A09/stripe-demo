import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { stripe } from "@/lib/stripe";
import { createClient } from "@supabase/supabase-js";

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

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    );
  }

  // Use service_role key to bypass RLS policies for server-side updates.
  // Fall back to anon key if service role key is not configured.
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as any;

      if (session.mode === "payment") {
        const { error } = await supabase
          .from("orders")
          .update({ status: "completed" })
          .eq("stripe_checkout_session_id", session.id);

        if (error) {
          console.error("Error updating order status in Supabase:", error.message);
          throw error;
        }
        console.log(`Order status updated to completed for session ${session.id}`);
      } else if (session.mode === "subscription") {
        const { error } = await supabase
          .from("product_subscriptions")
          .update({ status: "active" })
          .eq("stripe_checkout_session_id", session.id);

        if (error) {
          console.error("Error updating subscription status in Supabase:", error.message);
          throw error;
        }
        console.log(`Subscription status updated to active for session ${session.id}`);
      }
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error("Webhook event processing failed:", err.message);
    return NextResponse.json(
      { error: "Error processing webhook event" },
      { status: 500 }
    );
  }
}
