"use client";

import Script from "next/script";

export default function PricingPage() {
  return (
    <div className="max-w-7xl mx-auto py-10">
<h1>We offer plans that help any business!</h1>
      <Script
        async
        src="https://js.stripe.com/v3/pricing-table.js"
      />

      <stripe-pricing-table
        pricing-table-id="prctbl_1TaqyOLTDhHXmbOdQS45tUce"
        publishable-key={
          process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
        }
      />
    </div>
  );
}