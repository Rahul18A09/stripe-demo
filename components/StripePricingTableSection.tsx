import StripePricingTable from "@/components/StripePricingTable";

export default function StripePricingTableSection({
  customerEmail,
  clientReferenceId,
}: {
  customerEmail?: string | null;
  clientReferenceId?: string | null;
}) {
  const pricingTableId = process.env.NEXT_PUBLIC_STRIPE_PRICING_TABLE_ID;
  const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

  if (!pricingTableId || !publishableKey) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
        <p className="font-semibold">Stripe Pricing Table not configured</p>
        <p className="mt-2">
          Add these to <code className="font-mono">.env.local</code> and restart{" "}
          <code className="font-mono">npm run dev</code>:
        </p>
        <ul className="mt-2 list-inside list-disc font-mono text-xs">
          <li>NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY</li>
          <li>NEXT_PUBLIC_STRIPE_PRICING_TABLE_ID</li>
        </ul>
      </div>
    );
  }

  return (
    <StripePricingTable
      pricingTableId={pricingTableId}
      publishableKey={publishableKey}
      customerEmail={customerEmail}
      clientReferenceId={clientReferenceId}
    />
  );
}
