import { NextResponse } from "next/server";
import { getProductById } from "@/data/products";
import {
  getSubscriptionPlanById,
  subscriptionPlans,
} from "@/data/subscription-plans";
import { createSupabaseServerClient } from "@/lib/supabase";
import { stripe } from "@/lib/stripe";

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

    const body = (await request.json().catch(() => ({}))) as SubscribeRequest;
    const plan =
      (body.planId ? getSubscriptionPlanById(body.planId) : undefined) ??
      subscriptionPlans[1];
    const product = body.productId ? getProductById(body.productId) : undefined;

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "inr",
            unit_amount: plan.unitAmount,
            recurring: {
              interval: plan.interval,
            },
            product_data: {
              name: plan.name,
              description: plan.tagline,
            },
          },
        },
      ],
      metadata: {
        planId: plan.id,
        ...(product ? { productId: product.id } : {}),
      },
      success_url: `${origin}/success`,
      cancel_url: `${origin}/cancel`,
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

    console.log(error);

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
