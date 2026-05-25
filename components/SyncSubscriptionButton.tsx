"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SyncSubscriptionButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSync = async () => {
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch("/api/subscription/sync", { method: "POST" });
      const data: {
        success?: boolean;
        active?: boolean;
        planName?: string | null;
        error?: string;
      } = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Sync failed");
      }

      if (data.active && data.planName) {
        setMessage(`Synced: ${data.planName} is now active.`);
      } else {
        setMessage(
          "Sync finished. If you paid already, run stripe listen for webhooks or try subscribing again from Plans."
        );
      }

      router.refresh();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Sync failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
      <p className="font-semibold">Subscription not activated yet</p>
      <p className="mt-1">
        Your plan may be stuck on &quot;subscription started&quot; if webhooks did
        not reach localhost. Sync from Stripe now:
      </p>
      <button
        type="button"
        onClick={handleSync}
        disabled={loading}
        className="mt-3 rounded-lg bg-[#2f6f68] px-4 py-2 font-semibold text-white hover:bg-[#285f59] disabled:opacity-60"
      >
        {loading ? "Syncing..." : "Sync subscription from Stripe"}
      </button>
      {message && <p className="mt-2 text-sm">{message}</p>}
    </div>
  );
}
