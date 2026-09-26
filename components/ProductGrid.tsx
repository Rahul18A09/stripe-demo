"use client";

import Image from "next/image";
import {
  BatteryCharging,
  Bluetooth,
  Check,
  Eye,
  Lock,
  ShieldCheck,
  Waves,
  X,
} from "lucide-react";
import { useState } from "react";
import type { Product } from "@/data/products";
import type { SubscriptionPlan } from "@/data/subscription-plans";

function formatPrice(price: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);
}

export default function ProductGrid({
  products,
  plans,
}: {
  products: Product[];
  plans: SubscriptionPlan[];
}) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedPlanId, setSelectedPlanId] = useState(plans[1]?.id ?? "");
  const [loadingProductId, setLoadingProductId] = useState<string | null>(null);
  const [loadingSubscription, setLoadingSubscription] = useState(false);

  const handleCheckout = async (productId: string) => {
    setLoadingProductId(productId);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ productId }),
      });
      const data: { url?: string; error?: string } = await response.json();

      if (response.status === 401) {
        window.location.href = "/login";
        return;
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } finally {
      setLoadingProductId(null);
    }
  };

  const handleSubscribe = async (productId: string, planId: string) => {
    setLoadingSubscription(true);

    try {
      const response = await fetch("/api/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ productId, planId }),
      });
      const data: { url?: string; error?: string; code?: string } =
        await response.json();

      if (response.status === 401) {
        window.location.href = "/login";
        return;
      }

      if (response.status === 409 && data.code === "ACTIVE_SUBSCRIPTION_EXISTS") {
        window.location.href = "/account";
        return;
      }

      if (!response.ok) {
        throw new Error(data.error ?? "Unable to subscribe");
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } finally {
      setLoadingSubscription(false);
    }
  };

  return (
    <>
      <section className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <article
              key={product.id}
              className="flex h-full flex-col rounded-lg border border-gray-200 bg-white p-5 shadow-sm"
            >
              <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-[#eef0f2]">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-contain p-7"
                />
              </div>

              <div className="mt-5 flex flex-1 flex-col">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-gray-950">
                      {product.name}
                    </h2>
                    <p className="mt-1 text-sm text-gray-500">
                      {product.tagline}
                    </p>
                  </div>
                  <p className="whitespace-nowrap text-lg font-bold text-[#2f6f68]">
                    {formatPrice(product.price)}
                  </p>
                </div>

                <div className="mt-5 grid grid-cols-3 gap-2 text-xs text-gray-600">
                  <div className="rounded-lg bg-[#f7f8fb] p-3">
                    <BatteryCharging size={16} className="mb-2 text-[#2f6f68]" />
                    {product.battery}
                  </div>
                  <div className="rounded-lg bg-[#f7f8fb] p-3">
                    <Bluetooth size={16} className="mb-2 text-[#2f6f68]" />
                    {product.bluetooth}
                  </div>
                  <div className="rounded-lg bg-[#f7f8fb] p-3">
                    <Waves size={16} className="mb-2 text-[#2f6f68]" />
                    {product.audio}
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedProduct(product)}
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-900 hover:border-gray-900"
                  >
                    <Eye size={16} />
                    View Details
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCheckout(product.id)}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-black px-4 py-3 text-sm font-semibold text-white hover:bg-gray-900"
                  >
                    <Lock size={16} />
                    {loadingProductId === product.id ? "Opening..." : "Buy Now"}
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4 py-8 backdrop-blur-sm">
          <div className="relative w-full max-w-3xl rounded-lg bg-white p-5 shadow-2xl sm:p-6">
            <button
              type="button"
              onClick={() => setSelectedProduct(null)}
              aria-label="Close product details"
              className="absolute right-4 top-4 rounded-full border border-gray-200 bg-white p-2 text-gray-500 shadow-sm hover:border-gray-900 hover:text-gray-950"
            >
              <X size={18} />
            </button>

            <div className="grid gap-6 sm:grid-cols-[0.9fr_1.1fr]">
              <div className="relative aspect-square overflow-hidden rounded-lg bg-[#eef0f2]">
                <Image
                  src={selectedProduct.image}
                  alt={selectedProduct.name}
                  fill
                  sizes="280px"
                  className="object-contain p-6"
                />
              </div>
              <div className="flex min-h-full flex-col pr-10 sm:pr-6">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#2f6f68]">
                  {selectedProduct.color}
                </p>
                <h2 className="mt-2 text-3xl font-bold text-gray-950">
                  {selectedProduct.name}
                </h2>
                <p className="mt-3 text-gray-600">
                  {selectedProduct.description}
                </p>
                <p className="mt-5 text-2xl font-bold text-gray-950">
                  {formatPrice(selectedProduct.price)}
                </p>
                <div className="mt-6 flex flex-wrap gap-3 text-sm text-gray-600">
                  <span className="rounded-full bg-[#f7f8fb] px-4 py-2">
                    {selectedProduct.battery} battery
                  </span>
                  <span className="rounded-full bg-[#f7f8fb] px-4 py-2">
                    Bluetooth {selectedProduct.bluetooth}
                  </span>
                  <span className="rounded-full bg-[#f7f8fb] px-4 py-2">
                    {selectedProduct.audio}
                  </span>
                </div>

                <div className="mt-6 rounded-lg border border-gray-200 bg-[#fbfbfc] p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-gray-950">
                    <ShieldCheck size={18} className="text-[#2f6f68]" />
                    Add care plan for this headphone
                  </div>
                  <div className="mt-4 grid gap-2">
                    {plans.map((plan) => (
                      <button
                        key={plan.id}
                        type="button"
                        onClick={() => setSelectedPlanId(plan.id)}
                        className={`flex items-center justify-between rounded-lg border px-4 py-3 text-left text-sm transition ${
                          selectedPlanId === plan.id
                            ? "border-[#2f6f68] bg-white text-gray-950"
                            : "border-gray-200 bg-white text-gray-600 hover:border-gray-400"
                        }`}
                      >
                        <span>
                          <span className="block font-semibold">{plan.name}</span>
                          <span>{formatPrice(plan.price)} / month</span>
                        </span>
                        {selectedPlanId === plan.id && (
                          <Check size={18} className="text-[#2f6f68]" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-auto flex flex-col gap-3 pt-8 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => setSelectedProduct(null)}
                    className="inline-flex flex-1 items-center justify-center rounded-lg border border-gray-200 px-5 py-3 font-semibold text-gray-900 hover:border-gray-900"
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCheckout(selectedProduct.id)}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-black px-5 py-3 font-semibold text-white hover:bg-gray-900"
                  >
                    <Lock size={18} />
                    {loadingProductId === selectedProduct.id
                      ? "Opening..."
                      : "Buy Now"}
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      handleSubscribe(selectedProduct.id, selectedPlanId)
                    }
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#2f6f68] px-5 py-3 font-semibold text-white hover:bg-[#285f59]"
                  >
                    <ShieldCheck size={18} />
                    {loadingSubscription ? "Opening..." : "Subscribe Care"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
