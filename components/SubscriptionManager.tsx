"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  comparePlans,
  subscriptionPlans,
  type SubscriptionPlan,
} from "@/data/subscription-plans";
import type { SubscriptionRecord } from "@/lib/account-subscriptions";

function formatDate(date: string | null) {
  if (!date) return "—";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

function formatPrice(amount: number, currency = "inr") {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: currency.toUpperCase(),
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function SubscriptionManager({
  subscription,
}: {
  subscription: SubscriptionRecord;
}) {
  const router = useRouter();
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const pendingPlan = subscription.pending_plan_id
    ? subscriptionPlans.find((plan) => plan.id === subscription.pending_plan_id)
    : null;

  const runAction = async (action: string, url: string, body?: object) => {
    setLoadingAction(action);
    setMessage(null);
    setError(null);

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: body ? { "Content-Type": "application/json" } : undefined,
        body: body ? JSON.stringify(body) : undefined,
      });
      const data: { message?: string; error?: string; url?: string } =
        await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Request failed");
      }

      if (data.url) {
        window.location.href = data.url;
        return;
      }

      setMessage(data.message ?? "Done");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoadingAction(null);
    }
  };

  const otherPlans = subscriptionPlans.filter(
    (plan) => plan.id !== subscription.plan_id
  );

  return (
    <div className="space-y-4 rounded-lg border border-[#2f6f68]/20 bg-[#f3f8f7] p-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#2f6f68]">
          Active care plan
        </p>
        <h3 className="mt-1 text-xl font-bold text-gray-950">
          {subscription.plan_name}
        </h3>
        <p className="mt-1 text-sm text-gray-600">
          {formatPrice(subscription.amount, subscription.currency)}/
          {subscription.interval}
        </p>
        <p className="mt-2 text-sm text-gray-600">
          Current period ends: {formatDate(subscription.current_period_end)}
        </p>
        {subscription.cancel_at_period_end && (
          <p className="mt-2 text-sm font-medium text-amber-800">
            Cancels at period end. Renew before {formatDate(subscription.current_period_end)}.
          </p>
        )}
        {pendingPlan && (
          <p className="mt-2 text-sm font-medium text-[#2f6f68]">
            Changing to {pendingPlan.name} on next billing date.
          </p>
        )}
      </div>

      {message && (
        <p className="rounded-lg bg-white px-3 py-2 text-sm text-gray-700">{message}</p>
      )}
      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}

      <div className="flex flex-wrap gap-2">
        {otherPlans.map((plan) => (
          <PlanChangeButton
            key={plan.id}
            plan={plan}
            currentPlanId={subscription.plan_id}
            loading={loadingAction === `change-${plan.id}`}
            onChange={() =>
              runAction(`change-${plan.id}`, "/api/subscription/change-plan", {
                planId: plan.id,
              })
            }
          />
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {subscription.cancel_at_period_end ? (
          <button
            type="button"
            disabled={!!loadingAction}
            onClick={() => runAction("reactivate", "/api/subscription/reactivate")}
            className="rounded-lg bg-[#2f6f68] px-4 py-2 text-sm font-semibold text-white hover:bg-[#285f59]"
          >
            {loadingAction === "reactivate" ? "Saving..." : "Reactivate plan"}
          </button>
        ) : (
          <button
            type="button"
            disabled={!!loadingAction}
            onClick={() => runAction("cancel", "/api/subscription/cancel")}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-800 hover:border-gray-400"
          >
            {loadingAction === "cancel" ? "Saving..." : "Cancel at period end"}
          </button>
        )}
        <button
          type="button"
          disabled={!!loadingAction}
          onClick={() => runAction("portal", "/api/billing-portal")}
          className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-800 hover:border-gray-400"
        >
          {loadingAction === "portal" ? "Opening..." : "Manage billing"}
        </button>
      </div>
    </div>
  );
}

function PlanChangeButton({
  plan,
  currentPlanId,
  loading,
  onChange,
}: {
  plan: SubscriptionPlan;
  currentPlanId: string;
  loading: boolean;
  onChange: () => void;
}) {
  const change = comparePlans(currentPlanId, plan.id);
  if (change === "same") return null;

  return (
    <button
      type="button"
      disabled={loading}
      onClick={onChange}
      className="rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-gray-900"
    >
      {loading
        ? "Updating..."
        : change === "upgrade"
          ? `Upgrade to ${plan.name}`
          : `Downgrade to ${plan.name}`}
    </button>
  );
}
