import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import SubscriptionPlans from "@/components/SubscriptionPlans";
import { subscriptionPlans } from "@/data/subscription-plans";

export default function PlansPage() {
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
          Pick a monthly care plan for support, service help, accessory savings,
          and priority benefits for your audio gear.
        </p>
      </section>
      <SubscriptionPlans plans={subscriptionPlans} />
      <Footer />
    </main>
  );
}
