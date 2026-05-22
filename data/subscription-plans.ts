export type SubscriptionPlan = {
  id: string;
  name: string;
  price: number;
  unitAmount: number;
  interval: "month";
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

export function getSubscriptionPlanById(id: string) {
  return subscriptionPlans.find((plan) => plan.id === id);
}
