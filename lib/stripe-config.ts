/** Stripe account id segment shared by pk_test_51XXX and sk_test_51XXX from the same account. */
export function getStripeAccountSegment(key: string) {
  const match = key.match(/^(?:pk|sk)_(?:test|live)_51([A-Za-z0-9]+)/);
  return match?.[1]?.slice(0, 14) ?? null;
}

export function stripeKeysMatchAccount(publishableKey: string, secretKey: string) {
  const pkSegment = getStripeAccountSegment(publishableKey);
  const skSegment = getStripeAccountSegment(secretKey);
  return Boolean(pkSegment && skSegment && pkSegment === skSegment);
}

export async function isPricingTableOnSecretAccount(pricingTableId: string) {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey || !pricingTableId) {
    return false;
  }

  const response = await fetch(
    `https://api.stripe.com/v1/pricing_tables/${pricingTableId}`,
    {
      headers: {
        Authorization: `Bearer ${secretKey}`,
      },
      cache: "no-store",
    }
  );

  const data = (await response.json()) as { error?: { code?: string } };
  return !data.error;
}

export async function stripePriceExists(priceId: string) {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) return false;

  const response = await fetch(`https://api.stripe.com/v1/prices/${priceId}`, {
    headers: { Authorization: `Bearer ${secretKey}` },
    cache: "no-store",
  });

  const data = (await response.json()) as { error?: { code?: string } };
  return !data.error;
}

export function getStripeConfigStatus() {
  const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "";
  const secretKey = process.env.STRIPE_SECRET_KEY ?? "";
  const pricingTableId = process.env.NEXT_PUBLIC_STRIPE_PRICING_TABLE_ID ?? "";

  const keysMatch = stripeKeysMatchAccount(publishableKey, secretKey);

  return {
    publishableKey,
    secretKey,
    pricingTableId,
    keysMatch,
    hasPublishableKey: Boolean(publishableKey),
    hasSecretKey: Boolean(secretKey),
    hasPricingTableId: Boolean(pricingTableId),
  };
}
