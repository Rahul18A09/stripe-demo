import Stripe from "stripe";
import dotenv from "dotenv";
dotenv.config({path: ".env.local"});



const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const plans = [
  {
    envKey: "STRIPE_PRICE_CARE_BASIC",
    name: "Care Basic",
    unitAmount: 9900,
    description: "Simple protection for everyday listeners",
  },
  {
    envKey: "STRIPE_PRICE_CARE_PLUS",
    name: "Care Plus",
    unitAmount: 19900,
    description: "Better service for regular headphone users",
  },
  {
    envKey: "STRIPE_PRICE_CARE_PREMIUM",
    name: "Care Premium",
    unitAmount: 29900,
    description: "Priority care for your best audio gear",
  },
];

if (!process.env.STRIPE_SECRET_KEY) {
  console.error("Missing STRIPE_SECRET_KEY in environment.");
  process.exit(1);
}

console.log("Creating Stripe products and monthly INR prices...\n");

for (const plan of plans) {
  const product = await stripe.products.create({
    name: plan.name,
    description: plan.description,
  });

  const price = await stripe.prices.create({
    currency: "inr",
    unit_amount: plan.unitAmount,
    recurring: { interval: "month" },
    product: product.id,
  });

  console.log(`${plan.envKey}=${price.id}`);
}

console.log("\nAdd the lines above to your .env.local file.");
console.log(
  "Then enable these webhook events in Stripe: checkout.session.completed, customer.subscription.created, customer.subscription.updated, customer.subscription.deleted, invoice.upcoming, invoice.paid, invoice.payment_failed"
);
