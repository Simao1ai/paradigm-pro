import Stripe from "stripe";
import { db } from "./db.js";
import { profiles } from "@shared/schema";
import { eq } from "drizzle-orm";

export const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2024-06-20" as any })
  : null;

export const PLANS = {
  self_guided_monthly: {
    priceId: process.env.STRIPE_PRICE_SELF_MONTHLY || "",
    name: "Self-Guided",
    interval: "month" as const,
    amount: 6700,
    planType: "self_guided",
    billingInterval: "month",
    features: [
      "All 12 TIR lesson modules",
      "Audio discussions for each lesson",
      "All PDF materials & worksheets",
      "9-Day Achievement Roadmap",
      "Progress tracking & streaks",
      "20+ achievement badges",
      "Lesson journaling & notes",
      "Weekly goal setting",
      "Members-only community forum",
      "Daily affirmations",
    ],
  },
  self_guided_yearly: {
    priceId: process.env.STRIPE_PRICE_SELF_YEARLY || "",
    name: "Self-Guided (Annual)",
    interval: "year" as const,
    amount: 44700,
    planType: "self_guided",
    billingInterval: "year",
    features: [
      "Everything in Self-Guided Monthly",
      "Save $357 per year (44% off)",
    ],
  },
  consultant_monthly: {
    priceId: process.env.STRIPE_PRICE_CONSULTANT_MONTHLY || "",
    name: "Consultant-Guided",
    interval: "month" as const,
    amount: 24700,
    planType: "consultant_guided",
    billingInterval: "month",
    features: [
      "Everything in Self-Guided",
      "Weekly 60-min 1-on-1 Zoom session",
      "Personalized action plan from consultant",
      "Direct messaging with your consultant",
      "Session notes & follow-up accountability",
      "Custom transformation strategy",
      "Priority support response",
    ],
  },
  consultant_yearly: {
    priceId: process.env.STRIPE_PRICE_CONSULTANT_YEARLY || "",
    name: "Consultant-Guided (Annual)",
    interval: "year" as const,
    amount: 179700,
    planType: "consultant_guided",
    billingInterval: "year",
    features: [
      "Everything in Consultant-Guided Monthly",
      "Save $1,167 per year (39% off)",
      "52 coaching sessions included",
    ],
  },
} as const;

export type PlanKey = keyof typeof PLANS;

export async function getOrCreateStripeCustomer(userId: string, email: string): Promise<string> {
  if (!stripe) throw new Error("Stripe not configured");

  const [profile] = await db.select().from(profiles).where(eq(profiles.id, userId));

  if (profile?.stripeCustomerId) {
    return profile.stripeCustomerId;
  }

  const customer = await stripe.customers.create({
    email,
    metadata: { userId },
  });

  await db.update(profiles)
    .set({ stripeCustomerId: customer.id })
    .where(eq(profiles.id, userId));

  return customer.id;
}

export async function createCheckoutSession(
  customerId: string,
  priceId: string,
  planKey: PlanKey,
  userId: string,
  couponId?: string,
  successUrl?: string,
  cancelUrl?: string,
) {
  if (!stripe) throw new Error("Stripe not configured");

  const plan = PLANS[planKey];
  const mode = plan.interval === "month" || plan.interval === "year" ? "subscription" : "payment";

  const params: Stripe.Checkout.SessionCreateParams = {
    customer: customerId,
    payment_method_types: ["card"],
    line_items: [{ price: priceId, quantity: 1 }],
    mode: "subscription",
    subscription_data: {
      trial_period_days: 7,
      metadata: { userId, planKey },
    },
    success_url: successUrl || `${process.env.APP_URL || ""}/billing?success=true`,
    cancel_url: cancelUrl || `${process.env.APP_URL || ""}/billing?canceled=true`,
    metadata: { userId, planKey },
  };

  if (couponId) {
    params.discounts = [{ coupon: couponId }];
  }

  return stripe.checkout.sessions.create(params);
}

export async function createPortalSession(customerId: string, returnUrl?: string) {
  if (!stripe) throw new Error("Stripe not configured");
  return stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl || `${process.env.APP_URL || ""}/billing`,
  });
}
