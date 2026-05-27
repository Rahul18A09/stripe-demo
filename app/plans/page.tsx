// import Footer from "@/components/Footer";
// import Navbar from "@/components/Navbar";
// import SubscriptionPlans from "@/components/SubscriptionPlans";
// import { subscriptionPlans } from "@/data/subscription-plans";
// import { getUserSubscriptionData } from "@/lib/account-subscriptions";
// import { createSupabaseServerClient } from "@/lib/supabase";
// import Script from "next/script";

// export default async function PlansPage() {
//   const supabase = await createSupabaseServerClient();
//   const {
//     data: { user },
//   } = await supabase.auth.getUser();

//   const { activeSubscription } = user
//     ? await getUserSubscriptionData(user.id)
//     : { activeSubscription: null };

//   return (
//     <main className="min-h-screen bg-[#f7f8fb]">
//       <Navbar />
//       <section className="max-w-7xl mx-auto px-6 py-12 lg:py-16">
//         <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#2f6f68]">
//           Subscription care
//         </p>
//         <h1 className="mt-3 max-w-3xl text-4xl font-bold text-gray-950 sm:text-5xl">
//           Keep your headphones protected after checkout.
//         </h1>
//         <p className="mt-5 max-w-2xl text-lg leading-8 text-gray-600">
//           Pick a monthly care plan for support, service help, accessory savings,
//           and priority benefits for your audio gear.
//         </p>
//       </section>
//       {/* <SubscriptionPlans
//         plans={subscriptionPlans}
//         activeSubscription={activeSubscription}
//       /> */}


// </div>

// <div className="mt-16">
//   <Script
//     async
//     src="https://js.stripe.com/v3/pricing-table.js"
//   />

//   <stripe-pricing-table
//     pricing-table-id="prctbl_1TaqyOLTDhHXmbOdQS45tUce"
//     publishable-key={
//       process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
//     }
//   />
// </div>

//       <Footer />
//     </main>
//   );
// }


import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { getUserSubscriptionData } from "@/lib/account-subscriptions";
import { createSupabaseServerClient } from "@/lib/supabase";
import PlansSubscriptionSection from "@/components/PlansSubscriptionSection";
import { subscriptionPlans } from "@/data/subscription-plans";

export default async function PlansPage() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { activeSubscription } = user
    ? await getUserSubscriptionData(user.id)
    : { activeSubscription: null };

  return (
    <main className="min-h-screen bg-[#f7f8fb]">
      <Navbar />

      <section className="mx-auto max-w-7xl px-6 py-12 lg:py-16">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#2f6f68]">
          Subscription care
        </p>

        <h1 className="mt-3 max-w-3xl text-4xl font-bold text-gray-950 sm:text-5xl">
          Keep your headphones protected after checkout.
        </h1>

        <p className="mt-5 max-w-2xl text-lg leading-8 text-gray-600">
          Pick a monthly care plan for support, service help,
          accessory savings, and priority benefits for your
          audio gear.
        </p>
      </section>

      <PlansSubscriptionSection
        isLoggedIn={!!user}
        activeSubscription={activeSubscription}
        plans={subscriptionPlans}
        userEmail={user?.email}
        userId={user?.id}
      />

      <Footer />
    </main>
  );
}
