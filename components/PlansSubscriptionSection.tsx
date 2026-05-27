import Link from "next/link";
import StripePricingTableSection from "@/components/StripePricingTableSection";
import SubscriptionManager from "@/components/SubscriptionManager";
import SubscriptionPlans from "@/components/SubscriptionPlans";
import type { SubscriptionRecord } from "@/lib/account-subscriptions";
import type { SubscriptionPlan } from "@/data/subscription-plans";

export default function PlansSubscriptionSection({
  isLoggedIn,
  activeSubscription,
  plans,
  userEmail,
  userId,
}: {
  isLoggedIn: boolean;
  activeSubscription: SubscriptionRecord | null;
  plans: SubscriptionPlan[];
  userEmail?: string | null;
  userId?: string | null;
}) {
  if (!isLoggedIn) {
    return (
      <div className="max-w-7xl mx-auto px-6 pb-16 space-y-10">
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-950">Sign in to manage your plan</h2>
          <p className="mt-2 text-sm text-gray-600">
            You can preview plans below. After login, checkout links your subscription
            for upgrades, downgrades, and cancellation.
          </p>
          <Link
            href="/login?next=/plans"
            className="mt-4 inline-block rounded-lg bg-black px-5 py-3 text-sm font-semibold text-white hover:bg-gray-900"
          >
            Log in
          </Link>
        </div>

        <section>
          <h2 className="text-2xl font-bold text-gray-950">Choose with Stripe</h2>
          <p className="mt-2 text-sm text-gray-600">
            Subscribe using Stripe&apos;s pricing table. Your account is linked after
            checkout via webhooks.
          </p>
          <div className="mt-6">
            <StripePricingTableSection />
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-950">Or choose a plan here</h2>
          <p className="mt-2 text-sm text-gray-600">
            Same plans with in-app checkout.
          </p>
          <div className="mt-6">
            <SubscriptionPlans plans={plans} activeSubscription={null} />
          </div>
        </section>
      </div>
    );
  }

  if (activeSubscription) {
    return (
      <div className="max-w-7xl mx-auto px-6 pb-16 space-y-8">
        <div className="rounded-lg border border-[#2f6f68]/20 bg-[#f3f8f7] px-5 py-4 text-sm text-gray-700">
          You have an active care plan. Use the controls below to{" "}
          <strong>upgrade</strong>, <strong>downgrade</strong>, or{" "}
          <strong>cancel</strong>.
        </div>

        <SubscriptionManager subscription={activeSubscription} />

        <div>
          <h2 className="text-2xl font-bold text-gray-950">Change plan</h2>
          <p className="mt-2 text-sm text-gray-600">
            Upgrades apply immediately. Downgrades take effect on your next billing
            date.
          </p>
          <div className="mt-6">
            <SubscriptionPlans
              plans={plans}
              activeSubscription={activeSubscription}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 pb-16 space-y-10">
      <section>
        <h2 className="text-2xl font-bold text-gray-950">Choose with Stripe</h2>
        <p className="mt-2 text-sm text-gray-600">
          Subscribe using Stripe&apos;s pricing table. Your account is linked after
          checkout via webhooks.
        </p>
        <div className="mt-6">
          <StripePricingTableSection
            customerEmail={userEmail}
            clientReferenceId={userId}
          />
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-gray-950">Or choose a plan here</h2>
        <p className="mt-2 text-sm text-gray-600">
          Same plans with in-app checkout.
        </p>
        <div className="mt-6">
          <SubscriptionPlans plans={plans} activeSubscription={null} />
        </div>
      </section>
    </div>
  );
}
