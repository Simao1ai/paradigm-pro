import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  CreditCard, Loader2, CheckCircle2, AlertCircle, Zap,
  ExternalLink, Calendar, ArrowRight, Shield, RefreshCw, Tag,
} from "lucide-react";

interface SubscriptionData {
  id: string;
  status: string;
  planType: string;
  billingInterval: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  trialEnd: string | null;
}

const PLAN_DISPLAY: Record<string, { name: string; price: string; yearlyPrice: string }> = {
  self_guided: { name: "Self-Guided", price: "$67", yearlyPrice: "$447" },
  consultant_guided: { name: "Consultant-Guided", price: "$247", yearlyPrice: "$1,797" },
};

type PlanKey = "self_guided_monthly" | "self_guided_yearly" | "consultant_monthly" | "consultant_yearly";

interface PricingCardProps {
  planKey: PlanKey;
  name: string;
  price: string;
  yearlyPrice: string;
  features: string[];
  isPopular?: boolean;
  couponCode: string;
}

function PricingCard({ planKey, name, price, yearlyPrice, features, isPopular, couponCode }: PricingCardProps) {
  const [billingInterval, setBillingInterval] = useState<"month" | "year">("month");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const selectedPlanKey = billingInterval === "month"
    ? (planKey === "self_guided_monthly" ? "self_guided_monthly" : "consultant_monthly")
    : (planKey === "self_guided_monthly" ? "self_guided_yearly" : "consultant_yearly");

  async function handleCheckout() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ planKey: selectedPlanKey, couponCode: couponCode || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to start checkout");
      if (data.url) window.location.href = data.url;
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={`relative rounded-2xl p-8 ${isPopular
      ? "bg-gradient-to-br from-[#312e7a] to-[#1e1b4b] border-2 border-brand-gold/50 shadow-orange-glow"
      : "card-glass"}`}
    >
      {isPopular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <span className="rounded-full bg-gradient-to-r from-brand-gold to-brand-pink px-5 py-1.5 text-sm font-bold text-white shadow-orange-glow">
            ⚡ MOST POPULAR
          </span>
        </div>
      )}

      <h3 className="font-display text-xl font-bold text-white mb-1 mt-2">{name}</h3>

      {/* Billing toggle */}
      <div className="flex items-center gap-2 my-4">
        <button
          onClick={() => setBillingInterval("month")}
          className={`text-xs px-3 py-1.5 rounded-full font-semibold transition-all ${billingInterval === "month"
            ? "bg-brand-gold text-white"
            : "bg-white/10 text-indigo-300 hover:bg-white/20"}`}
        >
          Monthly
        </button>
        <button
          onClick={() => setBillingInterval("year")}
          className={`text-xs px-3 py-1.5 rounded-full font-semibold transition-all ${billingInterval === "year"
            ? "bg-brand-gold text-white"
            : "bg-white/10 text-indigo-300 hover:bg-white/20"}`}
        >
          Annual <span className="text-brand-pink">Save 44%</span>
        </button>
      </div>

      <div className="mb-6">
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-bold text-white font-display">
            {billingInterval === "month" ? price : yearlyPrice}
          </span>
          <span className="text-indigo-300">/{billingInterval === "month" ? "mo" : "yr"}</span>
        </div>
        {billingInterval === "year" && (
          <p className="text-xs text-brand-gold mt-1 font-semibold">Billed annually — best value</p>
        )}
      </div>

      <ul className="space-y-2 mb-6">
        {features.map(f => (
          <li key={f} className="flex items-start gap-2 text-sm text-indigo-200">
            <CheckCircle2 className="h-4 w-4 text-brand-emerald flex-shrink-0 mt-0.5" />
            {f}
          </li>
        ))}
      </ul>

      {error && <p className="text-red-400 text-xs mb-3">{error}</p>}

      <button
        onClick={handleCheckout}
        disabled={loading}
        className={`w-full flex items-center justify-center gap-2 py-3 rounded-full font-bold transition-all ${isPopular
          ? "btn-gold"
          : "btn-secondary"} disabled:opacity-60`}
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        {loading ? "Redirecting..." : "Start 7-Day Free Trial"}
        {!loading && <ArrowRight className="h-4 w-4" />}
      </button>
      <p className="text-xs text-center text-indigo-400 mt-2">No credit card required</p>
    </div>
  );
}

export default function BillingPage() {
  const [couponCode, setCouponCode] = useState("");
  const [portalLoading, setPortalLoading] = useState(false);
  const [portalError, setPortalError] = useState("");

  const searchParams = new URLSearchParams(window.location.search);
  const showSuccess = searchParams.get("success") === "true";
  const showCanceled = searchParams.get("canceled") === "true";

  const { data: subscription, isLoading, error } = useQuery<SubscriptionData | null>({
    queryKey: ["/api/billing"],
    queryFn: async () => {
      const res = await fetch("/api/billing", { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error(`${res.status}`);
      return res.json();
    },
  });

  async function openPortal() {
    setPortalLoading(true);
    setPortalError("");
    try {
      const res = await fetch("/api/stripe/portal", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed");
      if (data.url) window.open(data.url, "_blank");
    } catch (err: any) {
      setPortalError(err.message || "Could not open billing portal");
    } finally {
      setPortalLoading(false);
    }
  }

  const isActive = subscription && (subscription.status === "active" || subscription.status === "trialing");
  const plan = subscription ? PLAN_DISPLAY[subscription.planType] : null;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 text-brand-gold animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl animate-fade-in">
      <div>
        <h1 className="font-display text-3xl font-bold text-white">Billing</h1>
        <p className="text-muted-foreground mt-1">Manage your subscription and payment details</p>
      </div>

      {/* Success / canceled toasts */}
      {showSuccess && (
        <div className="flex items-center gap-3 rounded-xl bg-brand-emerald/15 border border-brand-emerald/30 p-4">
          <CheckCircle2 className="h-5 w-5 text-brand-emerald flex-shrink-0" />
          <p className="text-brand-emerald font-semibold">Welcome! Your subscription is now active. 🎉</p>
        </div>
      )}
      {showCanceled && (
        <div className="flex items-center gap-3 rounded-xl bg-red-500/10 border border-red-500/20 p-4">
          <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
          <p className="text-red-400">Checkout was canceled. No charge was made.</p>
        </div>
      )}

      {isActive ? (
        /* ── Active subscription ── */
        <div className="space-y-4">
          <div className="card-glass p-6 border-brand-gold/20">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-brand-gold to-brand-pink flex items-center justify-center flex-shrink-0 shadow-orange-glow">
                  <CreditCard className="h-6 w-6 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className="font-bold text-white text-lg">
                      {plan?.name || subscription!.planType} Plan
                    </h3>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${
                      subscription!.status === "trialing"
                        ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                        : subscription!.status === "past_due"
                        ? "bg-red-500/20 text-red-300 border border-red-500/30"
                        : "bg-brand-emerald/20 text-brand-emerald border border-brand-emerald/30"
                    }`}>
                      {subscription!.status === "trialing" ? "Free Trial" :
                       subscription!.status === "past_due" ? "Payment Due" : "Active"}
                    </span>
                  </div>
                  <p className="text-sm text-indigo-300 flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    {subscription!.billingInterval === "month" ? "Monthly" : "Annual"} billing ·{" "}
                    {subscription!.cancelAtPeriodEnd
                      ? `Cancels ${new Date(subscription!.currentPeriodEnd).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`
                      : `Renews ${new Date(subscription!.currentPeriodEnd).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`}
                  </p>
                  {subscription!.status === "trialing" && subscription!.trialEnd && (
                    <p className="text-xs text-blue-300 mt-1">
                      Trial ends {new Date(subscription!.trialEnd).toLocaleDateString("en-US", { month: "long", day: "numeric" })}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-2 min-w-[160px]">
                <button
                  onClick={openPortal}
                  disabled={portalLoading}
                  className="btn-secondary text-sm py-2 px-4 rounded-full flex items-center gap-2"
                >
                  {portalLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ExternalLink className="h-4 w-4" />}
                  Manage Billing
                </button>
                {portalError && <p className="text-red-400 text-xs">{portalError}</p>}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { icon: Shield, title: "30-Day Guarantee", desc: "Full refund if not satisfied", color: "from-brand-emerald to-green-600" },
              { icon: RefreshCw, title: "Cancel Anytime", desc: "No questions asked", color: "from-blue-500 to-indigo-600" },
              { icon: Zap, title: "Instant Access", desc: "All 12 lessons unlocked", color: "from-brand-gold to-brand-pink" },
            ].map(item => (
              <div key={item.title} className="card-glass p-4 flex items-center gap-3">
                <div className={`h-9 w-9 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center flex-shrink-0`}>
                  <item.icon className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{item.title}</p>
                  <p className="text-xs text-indigo-300">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* ── No subscription — show pricing ── */
        <div className="space-y-6">
          <p className="text-indigo-200">
            Choose a plan below to get started. Both plans include a 7-day free trial.
          </p>

          {/* Coupon code input */}
          <div className="flex items-center gap-3 max-w-sm">
            <div className="relative flex-1">
              <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-indigo-400" />
              <input
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                placeholder="Coupon code (optional)"
                className="input pl-9 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <PricingCard
              planKey="self_guided_monthly"
              name="Self-Guided"
              price="$67"
              yearlyPrice="$447"
              couponCode={couponCode}
              features={[
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
              ]}
            />
            <PricingCard
              planKey="consultant_monthly"
              name="Consultant-Guided"
              price="$247"
              yearlyPrice="$1,797"
              couponCode={couponCode}
              isPopular
              features={[
                "Everything in Self-Guided",
                "Weekly 60-min 1-on-1 Zoom session",
                "Personalized action plan",
                "Direct messaging with consultant",
                "Session notes & accountability",
                "Custom transformation strategy",
                "Priority support response",
              ]}
            />
          </div>

          <div className="flex items-center justify-center gap-3 text-sm text-indigo-300">
            <Shield className="h-4 w-4 text-brand-emerald" />
            30-Day Satisfaction Guarantee · No credit card required for trial
          </div>
        </div>
      )}
    </div>
  );
}
