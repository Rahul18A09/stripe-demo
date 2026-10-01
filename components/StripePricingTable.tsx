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
  const [scriptError, setScriptError] = useState(false);

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
  }, [
    scriptReady,
    pricingTableId,
    publishableKey,
    customerEmail,
    clientReferenceId,
  ]);

  return (
    <div className="w-full min-h-[280px]">
      <Script
        src="https://js.stripe.com/v3/pricing-table.js"
        strategy="afterInteractive"
        onReady={() => setScriptReady(true)}
        onError={() => setScriptError(true)}
      />
      <div ref={containerRef} className="w-full" />
      {scriptError && (
        <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          Failed to load the Stripe pricing table script. Check your network or ad
          blocker.
        </p>
      )}
    </div>
  );
}
