import { ACTIVE_SUBSCRIPTION_STATUSES } from "@/data/subscription-plans";
import { createSupabaseServerClient } from "@/lib/supabase";

export type SubscriptionRecord = {
  id: string;
  plan_id: string;
  plan_name: string;
  product_name: string | null;
  product_image: string | null;
  amount: number;
  currency: string;
  interval: string;
  status: string;
  created_at: string;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  pending_plan_id: string | null;
  stripe_subscription_id: string | null;
};

export type SubscriptionNotification = {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
};

export async function getUserSubscriptionData(userId: string) {
  const supabase = await createSupabaseServerClient();

  const [subscriptionsResult, notificationsResult] = await Promise.all([
    supabase
      .from("product_subscriptions")
      .select(
        "id, plan_id, plan_name, product_name, product_image, amount, currency, interval, status, created_at, current_period_end, cancel_at_period_end, pending_plan_id, stripe_subscription_id"
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false }),
    supabase
      .from("subscription_notifications")
      .select("id, type, title, message, read, created_at")
      .eq("user_id", userId)
      .eq("read", false)
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const subscriptions = (subscriptionsResult.data ?? []) as SubscriptionRecord[];
  const activeSubscription =
    subscriptions.find(
      (subscription) =>
        ACTIVE_SUBSCRIPTION_STATUSES.includes(
          subscription.status as (typeof ACTIVE_SUBSCRIPTION_STATUSES)[number]
        ) && subscription.stripe_subscription_id
    ) ??
    subscriptions.find((subscription) =>
      ACTIVE_SUBSCRIPTION_STATUSES.includes(
        subscription.status as (typeof ACTIVE_SUBSCRIPTION_STATUSES)[number]
      )
    ) ??
    null;

  return {
    subscriptions,
    activeSubscription,
    notifications: (notificationsResult.data ?? []) as SubscriptionNotification[],
    error:
      subscriptionsResult.error?.message ??
      notificationsResult.error?.message ??
      null,
  };
}
