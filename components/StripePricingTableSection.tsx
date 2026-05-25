import StripePricingTable from "@/components/StripePricingTable";
import {
  getStripeConfigStatus,
  isPricingTableOnSecretAccount,
  stripeKeysMatchAccount,
} from "@/lib/stripe-config";

export default async function StripePricingTableSection({
  customerEmail,
  clientReferenceId,
}: {
  customerEmail?: string | null;
  clientReferenceId?: string | null;
}) {
  const config = getStripeConfigStatus();

  if (!config.hasPublishableKey || !config.hasPricingTableId) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
        <p className="font-semibold">Stripe Pricing Table not configured</p>
        <p className="mt-2">
          Add <code className="font-mono">NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY</code>{" "}
          and <code className="font-mono">NEXT_PUBLIC_STRIPE_PRICING_TABLE_ID</code>{" "}
          to <code className="font-mono">.env.local</code>, then restart{" "}
          <code className="font-mono">npm run dev</code>.
        </p>
      </div>
    );
  }

  if (!config.hasSecretKey) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
        <p className="font-semibold">STRIPE_SECRET_KEY is missing</p>
        <p className="mt-2">Add it to `.env.local` so webhooks and checkout stay in sync.</p>
      </div>
    );
  }

  if (!stripeKeysMatchAccount(config.publishableKey, config.secretKey)) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
        <p className="font-semibold">Stripe keys are from different accounts</p>
        <p className="mt-2">
          Your <code className="font-mono">NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY</code> and{" "}
          <code className="font-mono">STRIPE_SECRET_KEY</code> must come from the same
          Stripe Dashboard account (Developers → API keys).
        </p>
        <p className="mt-2">
          Your prices (<code className="font-mono">STRIPE_PRICE_CARE_*</code>) use the
          secret key account. Copy the <strong>publishable key</strong> from that same
          account into <code className="font-mono">NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY</code>.
        </p>
      </div>
    );
  }

  const pricingTableValid = await isPricingTableOnSecretAccount(
    config.pricingTableId
  );

  if (!pricingTableValid) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
        <p className="font-semibold">Pricing table ID does not match your Stripe account</p>
        <p className="mt-2">
          <code className="font-mono">{config.pricingTableId}</code> was not found on the
          account used by <code className="font-mono">STRIPE_SECRET_KEY</code>. Create a
          new pricing table in that account:
        </p>
        <ol className="mt-3 list-decimal space-y-1 pl-5">
          <li>
            Open Stripe Dashboard → <strong>Product catalog → Pricing tables</strong> (test
            mode).
          </li>
          <li>
            Create a table with your Care Basic / Plus / Premium monthly prices (
            <code className="font-mono">STRIPE_PRICE_CARE_*</code>).
          </li>
          <li>
            Copy the new <code className="font-mono">prctbl_...</code> id into{" "}
            <code className="font-mono">NEXT_PUBLIC_STRIPE_PRICING_TABLE_ID</code>.
          </li>
          <li>
            Use the embed publishable key from the same page for{" "}
            <code className="font-mono">NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY</code>.
          </li>
          <li>Restart <code className="font-mono">npm run dev</code>.</li>
        </ol>
        <p className="mt-3">
          Until then, use the <strong>“Or choose a plan here”</strong> cards below — they
          work with your current API keys.
        </p>
      </div>
    );
  }

  return (
    <StripePricingTable
      pricingTableId={config.pricingTableId}
      publishableKey={config.publishableKey}
      customerEmail={customerEmail}
      clientReferenceId={clientReferenceId}
    />
  );
}
