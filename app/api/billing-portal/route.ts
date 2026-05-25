import { NextResponse } from "next/server";
import { getOrCreateStripeCustomer } from "@/lib/stripe-customer";
import { stripe } from "@/lib/stripe";
import { createSupabaseServerClient } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const origin = new URL(request.url).origin;
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const customer = await getOrCreateStripeCustomer(user);

    const session = await stripe.billingPortal.sessions.create({
      customer: customer.id,
      return_url: `${origin}/account`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to open billing portal";

    console.error(error);

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
