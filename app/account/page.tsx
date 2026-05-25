import { cookies } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import PopupMessage from "@/components/PopupMessage";
import SubscriptionBanner from "@/components/SubscriptionBanner";
import SubscriptionManager from "@/components/SubscriptionManager";
import { logout } from "@/app/actions/auth";
import { ACTIVE_SUBSCRIPTION_STATUSES } from "@/data/subscription-plans";
import {
  getUserSubscriptionData,
  type SubscriptionRecord,
} from "@/lib/account-subscriptions";
import { createSupabaseServerClient } from "@/lib/supabase";

type OrderRecord = {
  id: string;
  product_name: string;
  product_image: string | null;
  amount: number;
  currency: string;
  status: string;
  created_at: string;
};

function formatPrice(amount: number, currency = "inr") {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: currency.toUpperCase(),
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

function isActiveSubscription(subscription: SubscriptionRecord) {
  return ACTIVE_SUBSCRIPTION_STATUSES.includes(
    subscription.status as (typeof ACTIVE_SUBSCRIPTION_STATUSES)[number]
  );
}

async function getOrders(userId: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("orders")
    .select(
      "id, product_name, product_image, amount, currency, status, created_at"
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  return {
    orders: (data ?? []) as OrderRecord[],
    error: error?.message ?? null,
  };
}

export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: "login" | "signup"; subscribed?: string }>;
}) {
  const params = await searchParams;
  await cookies();
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const email = user.email ?? "customer@example.com";
  const [{ orders, error: ordersError }, subscriptionData] = await Promise.all([
    getOrders(user.id),
    getUserSubscriptionData(user.id),
  ]);

  const { subscriptions, activeSubscription, notifications, error } =
    subscriptionData;
  const inactiveSubscriptions = subscriptions.filter(
    (subscription) => !isActiveSubscription(subscription)
  );

  return (
    <main className="min-h-screen bg-[#f7f8fb]">
      <Navbar />
      <PopupMessage type={params.message} />
      <section className="max-w-4xl mx-auto px-6 py-14">
        <div className="bg-white border border-gray-200 rounded-lg p-7 sm:p-10 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#2f6f68]">
            Private route
          </p>
          <h1 className="mt-4 text-4xl font-bold text-gray-950">Welcome back</h1>
          <p className="mt-4 text-lg text-gray-600">
            You are signed in as <span className="font-semibold">{email}</span>.
          </p>

          {params.subscribed === "1" && (
            <p className="mt-6 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-800">
              Subscription checkout completed. Your plan will appear here once Stripe confirms payment.
            </p>
          )}

          <div className="mt-8">
            <SubscriptionBanner notifications={notifications} />
          </div>

          <div className="mt-8 grid sm:grid-cols-3 gap-4">
            {[
              ["Orders", `${orders.length} saved`],
              [
                "Subscriptions",
                activeSubscription ? activeSubscription.plan_name : "None active",
              ],
              ["Support", "Priority response"],
            ].map(([label, value]) => (
              <div
                key={label}
                className="rounded-lg border border-gray-200 bg-[#fbfbfc] p-5"
              >
                <p className="text-sm text-gray-500">{label}</p>
                <p className="mt-2 font-semibold text-gray-950">{value}</p>
              </div>
            ))}
          </div>

          {(error || ordersError) && (
            <p className="mt-8 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
              Account data could not load from Supabase: {error ?? ordersError}
            </p>
          )}

          {activeSubscription && (
            <div className="mt-10">
              <SubscriptionManager subscription={activeSubscription} />
            </div>
          )}

          <div className="mt-10 grid gap-8 lg:grid-cols-2">
            <section>
              <h2 className="text-2xl font-bold text-gray-950">Ordered Products</h2>
              <div className="mt-5 space-y-4">
                {orders.length === 0 ? (
                  <div className="rounded-lg border border-gray-200 bg-[#fbfbfc] p-5 text-gray-600">
                    No ordered products yet.
                  </div>
                ) : (
                  orders.map((order) => (
                    <div
                      key={order.id}
                      className="flex gap-4 rounded-lg border border-gray-200 bg-[#fbfbfc] p-4"
                    >
                      {order.product_image && (
                        <div className="relative h-20 w-20 shrink-0 rounded-lg bg-white">
                          <Image
                            src={order.product_image}
                            alt={order.product_name}
                            fill
                            sizes="80px"
                            className="object-contain p-2"
                          />
                        </div>
                      )}
                      <div>
                        <h3 className="font-semibold text-gray-950">
                          {order.product_name}
                        </h3>
                        <p className="mt-1 text-sm text-gray-600">
                          {formatPrice(order.amount, order.currency)}
                        </p>
                        <p className="mt-2 text-xs uppercase tracking-[0.12em] text-[#2f6f68]">
                          {order.status.replaceAll("_", " ")}
                        </p>
                        <p className="mt-1 text-xs text-gray-500">
                          {formatDate(order.created_at)}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>

            <section>
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-2xl font-bold text-gray-950">Care Subscriptions</h2>
                <Link
                  href="/plans"
                  className="text-sm font-semibold text-[#2f6f68] hover:underline"
                >
                  View plans
                </Link>
              </div>

              <div className="mt-5 space-y-4">
                {!activeSubscription && subscriptions.length === 0 ? (
                  <div className="rounded-lg border border-gray-200 bg-[#fbfbfc] p-5 text-gray-600">
                    No care plan selected yet.{" "}
                    <Link href="/plans" className="font-semibold text-[#2f6f68]">
                      Choose a plan
                    </Link>
                    .
                  </div>
                ) : (
                  <>
                    {inactiveSubscriptions.map((subscription) => (
                      <div
                        key={subscription.id}
                        className="rounded-lg border border-gray-200 bg-[#fbfbfc] p-4"
                      >
                        <h3 className="font-semibold text-gray-950">
                          {subscription.plan_name}
                        </h3>
                        <p className="mt-1 text-sm text-gray-600">
                          {formatPrice(subscription.amount, subscription.currency)}/
                          {subscription.interval}
                        </p>
                        <p className="mt-2 text-xs uppercase tracking-[0.12em] text-gray-500">
                          {subscription.status.replaceAll("_", " ")}
                        </p>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </section>
          </div>

          <form action={logout} className="mt-8">
            <button className="rounded-lg bg-black px-6 py-3 font-semibold text-white hover:bg-gray-900">
              Logout
            </button>
          </form>
        </div>
      </section>
      <Footer />
    </main>
  );
}
