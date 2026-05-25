import type { User } from "@supabase/supabase-js";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { stripe } from "@/lib/stripe";

export async function getOrCreateStripeCustomer(user: User) {
  const supabase = createSupabaseAdminClient();

  const { data: profile } = await supabase
    .from("users")
    .select("stripe_customer_id")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  if (profile?.stripe_customer_id) {
    const existing = await stripe.customers.retrieve(profile.stripe_customer_id);
    if (!existing.deleted) {
      return existing;
    }
  }

  const customer = await stripe.customers.create({
    email: user.email ?? undefined,
    metadata: {
      supabaseUserId: user.id,
    },
  });

  await supabase.from("users").upsert(
    {
      auth_user_id: user.id,
      email: user.email ?? "",
      stripe_customer_id: customer.id,
      last_login_at: new Date().toISOString(),
    },
    { onConflict: "auth_user_id" }
  );

  return customer;
}
