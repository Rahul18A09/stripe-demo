import { cookies } from "next/headers";
import Image from "next/image";
import { redirect } from "next/navigation";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import PopupMessage from "@/components/PopupMessage";
import { logout } from "@/app/actions/auth";
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

type SubscriptionRecord = {
  id: string;
  product_name: string | null;
  product_image: string | null;
  plan_name: string;
  amount: number;
  currency: string;
  interval: string;
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

async function getAccountData(userId: string) {
  try {
    const supabase = await createSupabaseServerClient();
    const [ordersResult, subscriptionsResult] = await Promise.all([
      supabase
        .from("orders")
        .select(
          "id, product_name, product_image, amount, currency, status, created_at"
        )
        .eq("user_id", userId)
        .order("created_at", { ascending: false }),
      supabase
        .from("product_subscriptions")
        .select(
          "id, product_name, product_image, plan_name, amount, currency, interval, status, created_at"
        )
        .eq("user_id", userId)
        .order("created_at", { ascending: false }),
    ]);

    return {
      orders: (ordersResult.data ?? []) as OrderRecord[],
      subscriptions: (subscriptionsResult.data ?? []) as SubscriptionRecord[],
      error: ordersResult.error?.message ?? subscriptionsResult.error?.message,
    };
  } catch (error) {
    return {
      orders: [] as OrderRecord[],
      subscriptions: [] as SubscriptionRecord[],
      error: error instanceof Error ? error.message : "Unable to load account data",
    };
  }
}

export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: "login" | "signup" }>;
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
  const { orders, subscriptions, error } = await getAccountData(user.id);

  return (
    <main className="min-h-screen bg-[#f7f8fb]">
      <Navbar />
      <PopupMessage type={params.message} />
      <section className="max-w-4xl mx-auto px-6 py-14">
        <div className="bg-white border border-gray-200 rounded-lg p-7 sm:p-10 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#2f6f68]">
            Private route
          </p>
          <h1 className="mt-4 text-4xl font-bold text-gray-950">
            Welcome back
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            You are signed in as <span className="font-semibold">{email}</span>.
            This page is protected by the project root <code>proxy.ts</code>.
          </p>

          <div className="mt-8 grid sm:grid-cols-3 gap-4">
            {[
              ["Orders", `${orders.length} saved`],
              ["Subscriptions", `${subscriptions.length} active selection`],
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

          {error && (
            <p className="mt-8 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
              Account data could not load from Supabase: {error}
            </p>
          )}

          <div className="mt-10 grid gap-8 lg:grid-cols-2">
            <section>
              <h2 className="text-2xl font-bold text-gray-950">
                Ordered Products
              </h2>
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
              <h2 className="text-2xl font-bold text-gray-950">
                Care Subscriptions
              </h2>
              <div className="mt-5 space-y-4">
                {subscriptions.length === 0 ? (
                  <div className="rounded-lg border border-gray-200 bg-[#fbfbfc] p-5 text-gray-600">
                    No care plan selected yet.
                  </div>
                ) : (
                  subscriptions.map((subscription) => (
                    <div
                      key={subscription.id}
                      className="rounded-lg border border-gray-200 bg-[#fbfbfc] p-4"
                    >
                      <div className="flex gap-4">
                        {subscription.product_image && (
                          <div className="relative h-20 w-20 shrink-0 rounded-lg bg-white">
                            <Image
                              src={subscription.product_image}
                              alt={subscription.product_name ?? "Headphone"}
                              fill
                              sizes="80px"
                              className="object-contain p-2"
                            />
                          </div>
                        )}
                        <div>
                          <h3 className="font-semibold text-gray-950">
                            {subscription.plan_name}
                          </h3>
                          <p className="mt-1 text-sm text-gray-600">
                            {subscription.product_name ??
                              "General headphone care"}
                          </p>
                          <p className="mt-1 text-sm text-gray-600">
                            {formatPrice(
                              subscription.amount,
                              subscription.currency
                            )}
                            /{subscription.interval}
                          </p>
                          <p className="mt-2 text-xs uppercase tracking-[0.12em] text-[#2f6f68]">
                            {subscription.status.replaceAll("_", " ")}
                          </p>
                          <p className="mt-1 text-xs text-gray-500">
                            {formatDate(subscription.created_at)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
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
