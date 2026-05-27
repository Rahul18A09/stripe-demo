"use client";

import { Check, Headphones, ShieldCheck } from "lucide-react";
import { useState } from "react";
import type { SubscriptionPlan } from "@/data/subscription-plans";
import type { SubscriptionRecord } from "@/lib/account-subscriptions";

function formatPrice(price: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);
}

export default function SubscriptionPlans({
  plans,
}: {
  plans: SubscriptionPlan[];
  activeSubscription?: SubscriptionRecord | null;
}) {
  const [loadingPlanId, setLoadingPlanId] = useState<string | null>(null);

  const handleSubscribe = async (planId: string) => {
    setLoadingPlanId(planId);

    try {
      const response = await fetch("/api/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ planId }),
      });
      const data: { url?: string; error?: string } = await response.json();

      if (response.status === 401) {
        window.location.href = "/login";
        return;
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } finally {
      setLoadingPlanId(null);
    }
  };

  return (
    <section className="max-w-7xl mx-auto px-6 pb-16">
      <div className="grid gap-6 lg:grid-cols-3">
        {plans.map((plan) => (
          <article
            key={plan.id}
            className={`relative flex h-full flex-col rounded-lg border bg-white p-6 shadow-sm ${
              plan.highlight
                ? "border-[#2f6f68] shadow-[0_18px_50px_rgba(47,111,104,0.16)]"
                : "border-gray-200"
            }`}
          >
            {plan.highlight && (
              <div className="absolute right-5 top-5 rounded-full bg-[#2f6f68] px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-white">
                Popular
              </div>
            )}

            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#eef4f3] text-[#2f6f68]">
              {plan.highlight ? <ShieldCheck /> : <Headphones />}
            </div>

            <h2 className="mt-6 text-2xl font-bold text-gray-950">
              {plan.name}
            </h2>
            <p className="mt-2 text-sm font-semibold text-[#2f6f68]">
              {plan.tagline}
            </p>
            <p className="mt-4 text-sm leading-6 text-gray-600">
              {plan.description}
            </p>

            <div className="mt-7 flex items-end gap-2">
              <span className="text-4xl font-black text-gray-950">
                {formatPrice(plan.price)}
              </span>
              <span className="pb-1 text-sm text-gray-500">/ month</span>
            </div>

            <ul className="mt-7 flex-1 space-y-4 text-sm text-gray-700">
              {plan.features.map((feature) => (
                <li key={feature} className="flex gap-3">
                  <Check size={18} className="mt-0.5 shrink-0 text-[#2f6f68]" />
                  {feature}
                </li>
              ))}
            </ul>

            <button
              type="button"
              onClick={() => handleSubscribe(plan.id)}
              className={`mt-8 rounded-lg px-5 py-3 font-semibold transition ${
                plan.highlight
                  ? "bg-[#2f6f68] text-white hover:bg-[#285f59]"
                  : "bg-black text-white hover:bg-gray-900"
              }`}
            >
              {loadingPlanId === plan.id ? "Opening..." : "Subscribe Now"}
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}
