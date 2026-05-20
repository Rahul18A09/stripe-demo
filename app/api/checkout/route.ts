import { NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";

// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
//   apiVersion: "2025-04-30.basil",

// });

export async function POST() {

  try {

    const session = await stripe.checkout.sessions.create({

      mode: "payment",

      line_items: [
        {
          quantity: 1,

          price_data: {
            currency: "inr",

            unit_amount: 50000,

            product_data: {
              name: "Stripe Demo Product",
            },
          },
        },
      ],

      success_url: "http://localhost:3000/success",

      cancel_url: "http://localhost:3000/cancel",
    });

    // IMPORTANT
    return NextResponse.json({
      url: session.url,
    });

  } catch (error: any) {

    console.log(error);

    return NextResponse.json(
      {
        error: error.message,
      },
      {
        status: 500,
      }
    );
  }
}