"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { SubscriptionNotification } from "@/lib/account-subscriptions";

export default function SubscriptionBanner({
  notifications,
}: {
  notifications: SubscriptionNotification[];
}) {
  const router = useRouter();
  const [items, setItems] = useState(notifications);
  const [dismissing, setDismissing] = useState(false);

  if (items.length === 0) {
    return null;
  }

  const dismiss = async (ids: string[]) => {
    setDismissing(true);
    try {
      await fetch("/api/notifications/read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });
      setItems((current) => current.filter((item) => !ids.includes(item.id)));
      router.refresh();
    } finally {
      setDismissing(false);
    }
  };

  return (
    <div className="space-y-3">
      {items.map((notification) => (
        <div
          key={notification.id}
          className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950"
        >
          <p className="font-semibold">{notification.title}</p>
          <p className="mt-1">{notification.message}</p>
          <button
            type="button"
            disabled={dismissing}
            onClick={() => dismiss([notification.id])}
            className="mt-3 font-semibold text-[#2f6f68] hover:underline"
          >
            Dismiss
          </button>
        </div>
      ))}
    </div>
  );
}
