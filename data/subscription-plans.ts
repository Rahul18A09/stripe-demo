export type SubscriptionPlan = {
  id: string;
  name: string;
  price: number;
  unitAmount: number;
  interval: "month";
  tier: number;
  tagline: string;
  description: string;
  features: string[];
  highlight?: boolean;
};

export const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: "care-basic",
    name: "Care Basic",
    price: 99,
    unitAmount: 9900,
    interval: "month",
    tier: 1,
    tagline: "Simple protection for everyday listeners",
    description:
      "A lightweight support plan for customers who want quick help and repair guidance.",
    features: [
      "Extended support coverage",
      "Repair and care guidance",
      "Member help desk access",
      "Product setup assistance",
    ],
  },
  {
    id: "care-plus",
    name: "Care Plus",
    price: 199,
    unitAmount: 19900,
    interval: "month",
    tier: 2,
    tagline: "Better service for regular headphone users",
    description:
      "Adds service shipping support and accessory savings for customers who use headphones daily.",
    features: [
      "Everything in Care Basic",
      "Free service-request shipping",
      "10% accessory discount",
      "Faster support response",
    ],
    highlight: true,
  },
  {
    id: "care-premium",
    name: "Care Premium",
    price: 299,
    unitAmount: 29900,
    interval: "month",
    tier: 3,
    tagline: "Priority care for your best audio gear",
    description:
      "The strongest plan with priority support, extra warranty confidence, and early product access.",
    features: [
      "Everything in Care Plus",
      "Priority support queue",
      "Extended warranty benefits",
      "Early access to launches",
    ],
  },
];

const stripePriceEnvKeys: Record<string, string> = {
  "care-basic": "STRIPE_PRICE_CARE_BASIC",
  "care-plus": "STRIPE_PRICE_CARE_PLUS",
  "care-premium": "STRIPE_PRICE_CARE_PREMIUM",
};

export function getSubscriptionPlanById(id: string) {
  return subscriptionPlans.find((plan) => plan.id === id);
}

export function getStripePriceId(planId: string): string | null {
  const envKey = stripePriceEnvKeys[planId];
  if (!envKey) return null;
  return process.env[envKey] ?? null;
}

export function getPlanByStripePriceId(priceId: string) {
  return subscriptionPlans.find(
    (plan) => getStripePriceId(plan.id) === priceId
  );
}

export function resolvePlanFromStripePriceId(priceId: string | null) {
  if (!priceId) return null;
  return getPlanByStripePriceId(priceId);
}

export function comparePlans(currentPlanId: string, targetPlanId: string) {
  const current = getSubscriptionPlanById(currentPlanId);
  const target = getSubscriptionPlanById(targetPlanId);

  if (!current || !target) {
    return null;
  }

  if (target.tier > current.tier) return "upgrade" as const;
  if (target.tier < current.tier) return "downgrade" as const;
  return "same" as const;
}

export const ACTIVE_SUBSCRIPTION_STATUSES = [
  "active",
  "trialing",
  "past_due",
] as const;
