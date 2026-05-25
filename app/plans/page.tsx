import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import PlansSubscriptionSection from "@/components/PlansSubscriptionSection";
import { subscriptionPlans } from "@/data/subscription-plans";
import { getUserSubscriptionData } from "@/lib/account-subscriptions";
import { reconcileUserSubscriptions } from "@/lib/reconcile-subscriptions";
import { createSupabaseServerClient } from "@/lib/supabase";

export default async function PlansPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    await reconcileUserSubscriptions(user.id);
  }

  const { activeSubscription } = user
    ? await getUserSubscriptionData(user.id)
    : { activeSubscription: null };

  return (
    <main className="min-h-screen bg-[#f7f8fb]">
      <Navbar />
      <section className="max-w-7xl mx-auto px-6 py-12 lg:py-16">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#2f6f68]">
          Subscription care
        </p>
        <h1 className="mt-3 max-w-3xl text-4xl font-bold text-gray-950 sm:text-5xl">
          Keep your headphones protected after checkout.
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-gray-600">
          Subscribe once, then manage your plan anytime — upgrade to a higher
          tier, schedule a downgrade, or cancel at the end of your billing period.
        </p>
      </section>

      <PlansSubscriptionSection
        isLoggedIn={Boolean(user)}
        activeSubscription={activeSubscription}
        plans={subscriptionPlans}
        userEmail={user?.email}
        userId={user?.id}
      />

      <Footer />
    </main>
  );
}
