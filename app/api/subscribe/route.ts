import { NextResponse } from "next/server";
import { getProductById } from "@/data/products";
import {
  getStripePriceId,
  getSubscriptionPlanById,
  subscriptionPlans,
} from "@/data/subscription-plans";
import { getOrCreateStripeCustomer } from "@/lib/stripe-customer";
import { stripe } from "@/lib/stripe";
import { getActiveSubscriptionForUser } from "@/lib/subscription-sync";
import { createSupabaseServerClient } from "@/lib/supabase";

type SubscribeRequest = {
  planId?: string;
  productId?: string;
};

export async function POST(request: Request) {
  try {
    const origin = new URL(request.url).origin;
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Please login before subscribing." },
        { status: 401 }
      );
    }

    const activeSubscription = await getActiveSubscriptionForUser(user.id);
    if (activeSubscription) {
      return NextResponse.json(
        {
          error:
            "You already have an active care plan. Use change plan from your account or plans page.",
          code: "ACTIVE_SUBSCRIPTION_EXISTS",
        },
        { status: 409 }
      );
    }

    const body = (await request.json().catch(() => ({}))) as SubscribeRequest;
    const plan =
      (body.planId ? getSubscriptionPlanById(body.planId) : undefined) ??
      subscriptionPlans[1];
    const product = body.productId ? getProductById(body.productId) : undefined;
    const stripePriceId = getStripePriceId(plan.id);

    if (!stripePriceId) {
      return NextResponse.json(
        {
          error:
            "Stripe price is not configured for this plan. Run npm run stripe:setup and add price IDs to .env.local.",
        },
        { status: 500 }
      );
    }

    const customer = await getOrCreateStripeCustomer(user);

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customer.id,
      client_reference_id: user.id,
      line_items: [
        {
          quantity: 1,
          price: stripePriceId,
        },
      ],
      subscription_data: {
        metadata: {
          planId: plan.id,
          supabaseUserId: user.id,
          userEmail: user.email ?? "",
          ...(product
            ? {
                productId: product.id,
                productName: product.name,
              }
            : {}),
        },
      },
      metadata: {
        planId: plan.id,
        supabaseUserId: user.id,
        ...(product ? { productId: product.id } : {}),
      },
      success_url: `${origin}/account?subscribed=1`,
      cancel_url: `${origin}/plans`,
    });

    const { error } = await supabase.from("product_subscriptions").insert({
      user_id: user.id,
      user_email: user.email,
      product_id: product?.id ?? null,
      product_name: product?.name ?? "General headphone care",
      product_image: product?.image ?? null,
      plan_id: plan.id,
      plan_name: plan.name,
      amount: plan.price,
      currency: "inr",
      interval: plan.interval,
      status: "subscription_started",
      stripe_customer_id: customer.id,
      stripe_checkout_session_id: session.id,
    });

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json({
      url: session.url,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Unable to create subscription";

    console.error(error);

    return NextResponse.json(
      {
        error: message,
      },
      {
        status: 500,
      }
    );
  }
}
