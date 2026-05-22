import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import ProductGrid from "@/components/ProductGrid";
import { products } from "@/data/products";
import { subscriptionPlans } from "@/data/subscription-plans";

export default function ProductsPage() {
  return (
    <main className="min-h-screen bg-[#f5f5f7]">
      <Navbar />
      <section className="max-w-7xl mx-auto px-6 pt-10">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#2f6f68]">
          Featured product
        </p>
        <h1 className="mt-3 text-4xl sm:text-5xl font-bold text-gray-950">
          Built for daily listening
        </h1>
        <p className="mt-4 max-w-2xl text-gray-600">
          Choose from a small collection of premium wireless headphones with
          long battery life, clear calls, and secure checkout powered by Stripe.
        </p>
      </section>
      <ProductGrid products={products} plans={subscriptionPlans} />
      <Footer />
    </main>
  );
}
