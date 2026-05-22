import { NextResponse } from "next/server";
import { getProductById, products } from "@/data/products";
import { createSupabaseServerClient } from "@/lib/supabase";
import { stripe } from "@/lib/stripe";

type CheckoutRequest = {
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
        { error: "Please login before checkout." },
        { status: 401 }
      );
    }

    const body = (await request.json().catch(() => ({}))) as CheckoutRequest;
    const product =
      (body.productId ? getProductById(body.productId) : undefined) ??
      products[0];

    const session = await stripe.checkout.sessions.create({

      mode: "payment",

      line_items: [
        {
          quantity: 1,

          price_data: {
            currency: "inr",

            unit_amount: product.unitAmount,

            product_data: {
              name: product.name,
              description: product.tagline,
            },
          },
        },
      ],

      success_url: `${origin}/success`,

      cancel_url: `${origin}/cancel`,
    });

    const { error } = await supabase.from("orders").insert({
      user_id: user.id,
      user_email: user.email,
      product_id: product.id,
      product_name: product.name,
      product_image: product.image,
      amount: product.price,
      currency: product.currency,
      status: "checkout_started",
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
      error instanceof Error ? error.message : "Unable to create checkout";

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
