"use client";

import { Check, Headphones, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  comparePlans,
  subscriptionPlans,
  type SubscriptionPlan,
} from "@/data/subscription-plans";
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
  activeSubscription,
}: {
  plans: SubscriptionPlan[];
  activeSubscription?: SubscriptionRecord | null;
}) {
  const router = useRouter();
  const [loadingPlanId, setLoadingPlanId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handlePlanAction = async (planId: string) => {
    setLoadingPlanId(planId);
    setMessage(null);
    setError(null);

    try {
      if (activeSubscription) {
        const change = comparePlans(activeSubscription.plan_id, planId);
        if (change === "same") {
          setMessage("You are already on this plan.");
          return;
        }

        const response = await fetch("/api/subscription/change-plan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ planId }),
        });
        const data: { message?: string; error?: string } = await response.json();

        if (!response.ok) {
          throw new Error(data.error ?? "Unable to change plan");
        }

        setMessage(data.message ?? "Plan updated");
        router.refresh();
        return;
      }

      const response = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId }),
      });
      const data: { url?: string; error?: string; code?: string } =
        await response.json();

      if (response.status === 401) {
        window.location.href = "/login";
        return;
      }

      if (response.status === 409 && data.code === "ACTIVE_SUBSCRIPTION_EXISTS") {
        setError(data.error ?? "You already have an active subscription.");
        return;
      }

      if (!response.ok) {
        throw new Error(data.error ?? "Unable to subscribe");
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoadingPlanId(null);
    }
  };

  const getButtonLabel = (planId: string) => {
    if (!activeSubscription) return "Subscribe Now";
    const change = comparePlans(activeSubscription.plan_id, planId);
    if (change === "same") return "Current plan";
    if (change === "upgrade") return "Upgrade";
    return "Downgrade";
  };

  const isCurrentPlan = (planId: string) =>
    activeSubscription?.plan_id === planId;

  return (
    <section className="max-w-7xl mx-auto px-6 pb-16">
      {activeSubscription && (
        <div className="mb-6 rounded-lg border border-[#2f6f68]/20 bg-[#f3f8f7] px-4 py-3 text-sm text-gray-700">
          You are on <strong>{activeSubscription.plan_name}</strong>
          {activeSubscription.pending_plan_id && (
            <>
              {" "}
              (changing to{" "}
              {subscriptionPlans.find(
                (plan) => plan.id === activeSubscription.pending_plan_id
              )?.name}{" "}
              next cycle)
            </>
          )}
          . Choose another plan below to upgrade or schedule a downgrade.
        </div>
      )}

      {message && (
        <p className="mb-4 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-800">
          {message}
        </p>
      )}
      {error && (
        <p className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

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

            <h2 className="mt-6 text-2xl font-bold text-gray-950">{plan.name}</h2>
            <p className="mt-2 text-sm font-semibold text-[#2f6f68]">{plan.tagline}</p>
            <p className="mt-4 text-sm leading-6 text-gray-600">{plan.description}</p>

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
              onClick={() => handlePlanAction(plan.id)}
              disabled={isCurrentPlan(plan.id) || loadingPlanId === plan.id}
              className={`mt-8 rounded-lg px-5 py-3 font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
                plan.highlight
                  ? "bg-[#2f6f68] text-white hover:bg-[#285f59]"
                  : "bg-black text-white hover:bg-gray-900"
              }`}
            >
              {loadingPlanId === plan.id ? "Processing..." : getButtonLabel(plan.id)}
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}
