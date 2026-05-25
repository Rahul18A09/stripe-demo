"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";

type StripePricingTableProps = {
  pricingTableId: string;
  publishableKey: string;
  customerEmail?: string | null;
  clientReferenceId?: string | null;
};

export default function StripePricingTable({
  pricingTableId,
  publishableKey,
  customerEmail,
  clientReferenceId,
}: StripePricingTableProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scriptReady, setScriptReady] = useState(false);
  const [mountError, setMountError] = useState<string | null>(null);

  useEffect(() => {
    if (!scriptReady || !containerRef.current) {
      return;
    }

    const container = containerRef.current;
    container.innerHTML = "";

    const element = document.createElement("stripe-pricing-table");
    element.setAttribute("pricing-table-id", pricingTableId);
    element.setAttribute("publishable-key", publishableKey);

    if (customerEmail) {
      element.setAttribute("customer-email", customerEmail);
    }

    if (clientReferenceId) {
      element.setAttribute("client-reference-id", clientReferenceId);
    }

    container.appendChild(element);

    const timer = window.setTimeout(() => {
      const table = container.querySelector("stripe-pricing-table");
      const iframe = table?.querySelector("iframe");
      if (!iframe) {
        setMountError(
          "The pricing table did not load. Use a publishable key and pricing table ID from the same Stripe account (Dashboard → Developers → API keys and Pricing tables)."
        );
      }
    }, 5000);

    return () => window.clearTimeout(timer);
  }, [
    scriptReady,
    pricingTableId,
    publishableKey,
    customerEmail,
    clientReferenceId,
  ]);

  return (
    <div className="w-full min-h-[320px]">
      <Script
        src="https://js.stripe.com/v3/pricing-table.js"
        strategy="afterInteractive"
        onReady={() => setScriptReady(true)}
        onError={() =>
          setMountError("Failed to load Stripe pricing table script.")
        }
      />
      <div ref={containerRef} className="w-full" />
      {mountError && (
        <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {mountError}
        </p>
      )}
    </div>
  );
}
