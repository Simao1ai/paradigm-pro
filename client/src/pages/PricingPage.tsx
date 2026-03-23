import { useState } from "react";
import { CheckCircle2, Zap, Star, ArrowRight, Shield, RefreshCw, Users, BookOpen, Award } from "lucide-react";

const FEATURES_CORE = [
  "All 12 TIR lesson modules",
  "Audio discussions for each lesson",
  "All PDF materials & worksheets",
  "9-Day Achievement Roadmap",
  "Progress tracking & streaks",
  "20+ achievement badges",
  "Lesson journaling & notes",
  "Weekly goal setting",
  "Members-only community forum",
  "Daily Bob Proctor affirmations",
  "Mobile-friendly (PWA)",
];

const FEATURES_PREMIUM = [
  "Everything in Self-Guided",
  "Weekly 60-min 1-on-1 Zoom session",
  "Personalized action plan from consultant",
  "Direct messaging with your consultant",
  "Session notes & follow-up accountability",
  "Custom transformation strategy",
  "Priority support response",
];

type PlanKey = "self_guided_monthly" | "self_guided_yearly" | "consultant_monthly" | "consultant_yearly";

interface PricingTierProps {
  name: string;
  monthlyKey: PlanKey;
  yearlyKey: PlanKey;
  monthlyPrice: string;
  yearlyPrice: string;
  yearlyNote: string;
  features: string[];
  isPopular?: boolean;
  ctaText: string;
}

function PricingTier({ name, monthlyKey, yearlyKey, monthlyPrice, yearlyPrice, yearlyNote, features, isPopular, ctaText }: PricingTierProps) {
  const [interval, setInterval] = useState<"month" | "year">("month");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleCheckout() {
    setLoading(true);
    setError("");
    try {
      const planKey = interval === "month" ? monthlyKey : yearlyKey;
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ planKey }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 401) {
          window.location.href = "/api/login";
          return;
        }
        throw new Error(data.message || "Failed");
      }
      if (data.url) window.location.href = data.url;
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={`relative flex flex-col rounded-2xl overflow-hidden transition-all duration-300 hover:scale-[1.02] ${isPopular
      ? "bg-gradient-to-br from-[#312e7a] to-[#1e1b4b] border-2 border-brand-gold/60 shadow-orange-glow"
      : "bg-gradient-to-br from-[#27255a] to-[#1e1b4b] border border-indigo-700/40"
    }`}>
      {isPopular && (
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-brand-gold to-brand-pink" />
      )}

      <div className="p-8 flex-1">
        {isPopular && (
          <div className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-brand-gold/20 to-brand-pink/20 border border-brand-gold/30 px-3 py-1 text-xs font-bold text-brand-gold mb-4">
            <Zap className="h-3 w-3" /> MOST POPULAR
          </div>
        )}

        <h3 className="font-display text-2xl font-bold text-white mb-2">{name}</h3>

        {/* Billing toggle */}
        <div className="inline-flex rounded-full bg-white/8 p-1 mb-6">
          <button
            onClick={() => setInterval("month")}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${interval === "month"
              ? "bg-brand-gold text-white shadow-sm"
              : "text-indigo-300 hover:text-white"}`}
          >
            Monthly
          </button>
          <button
            onClick={() => setInterval("year")}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${interval === "year"
              ? "bg-brand-gold text-white shadow-sm"
              : "text-indigo-300 hover:text-white"}`}
          >
            Annual
          </button>
        </div>

        <div className="mb-2">
          <div className="flex items-baseline gap-1">
            <span className="text-5xl font-bold text-white font-display">
              {interval === "month" ? monthlyPrice : yearlyPrice}
            </span>
            <span className="text-indigo-300 ml-1">/{interval === "month" ? "mo" : "yr"}</span>
          </div>
          {interval === "year" && (
            <p className="text-sm text-brand-gold font-semibold mt-1">{yearlyNote}</p>
          )}
          {interval === "month" && (
            <p className="text-xs text-indigo-400 mt-1">or save with annual billing</p>
          )}
        </div>

        <div className="h-px bg-indigo-700/40 my-6" />

        <ul className="space-y-3">
          {features.map(f => (
            <li key={f} className="flex items-start gap-3 text-sm">
              <CheckCircle2 className="h-4 w-4 text-brand-emerald flex-shrink-0 mt-0.5" />
              <span className="text-indigo-200">{f}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="p-8 pt-0">
        {error && <p className="text-red-400 text-xs mb-3 text-center">{error}</p>}
        <button
          onClick={handleCheckout}
          disabled={loading}
          className={`w-full flex items-center justify-center gap-2 py-4 rounded-full text-base font-bold transition-all disabled:opacity-60 ${isPopular ? "btn-gold" : "btn-secondary"}`}
        >
          {loading ? "Redirecting..." : ctaText}
          {!loading && <ArrowRight className="h-4 w-4" />}
        </button>
        <p className="text-xs text-center text-indigo-400 mt-2">7-day free trial · No credit card required</p>
      </div>
    </div>
  );
}

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-brand-navy overflow-x-hidden">
      {/* Nav */}
      <nav className="border-b border-indigo-800/50 bg-brand-navy-mid/80 backdrop-blur-md px-6 py-4 flex items-center justify-between">
        <a href="/" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-brand-gold to-brand-pink flex items-center justify-center shadow-orange-glow">
            <Zap className="h-4 w-4 text-white" />
          </div>
          <span className="font-display text-lg font-bold text-white">
            Paradigm <span className="text-brand-gold">Pro</span>
          </span>
        </a>
        <a href="/api/login" className="btn-gold text-sm py-2 px-5 rounded-full">
          Sign In
        </a>
      </nav>

      {/* Hero */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1e1b4b] via-[#4f46e5] to-[#f97316] opacity-20" />
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-brand-pink/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="relative container mx-auto px-4 text-center max-w-3xl">
          <div className="badge-gradient inline-block mb-6">Simple, Transparent Pricing</div>
          <h1 className="font-display text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Choose Your Path to
            <br />
            <span className="gold-shimmer">Transformation</span>
          </h1>
          <p className="text-xl text-indigo-200 mb-4">
            Both plans include a 7-day free trial. No credit card required.
          </p>
          <div className="flex items-center justify-center gap-4 text-sm text-indigo-300">
            <span className="flex items-center gap-1.5"><Shield className="h-4 w-4 text-brand-emerald" /> 30-Day Guarantee</span>
            <span>·</span>
            <span className="flex items-center gap-1.5"><RefreshCw className="h-4 w-4 text-blue-400" /> Cancel Anytime</span>
            <span>·</span>
            <span className="flex items-center gap-1.5"><Zap className="h-4 w-4 text-brand-gold" /> Instant Access</span>
          </div>
        </div>
      </section>

      {/* Pricing cards */}
      <section className="pb-20 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <PricingTier
              name="Self-Guided"
              monthlyKey="self_guided_monthly"
              yearlyKey="self_guided_yearly"
              monthlyPrice="$67"
              yearlyPrice="$447"
              yearlyNote="Save $357/year — 44% off"
              features={FEATURES_CORE}
              ctaText="Start Free Trial"
            />
            <PricingTier
              name="Consultant-Guided"
              monthlyKey="consultant_monthly"
              yearlyKey="consultant_yearly"
              monthlyPrice="$247"
              yearlyPrice="$1,797"
              yearlyNote="Save $1,167/year — 39% off"
              features={FEATURES_PREMIUM}
              isPopular
              ctaText="Start with a Consultant"
            />
          </div>

          {/* Value callout */}
          <div className="mt-8 card-glass p-6 flex items-center gap-4 border-brand-gold/20">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-brand-gold to-brand-pink flex items-center justify-center flex-shrink-0 shadow-orange-glow">
              <Star className="h-6 w-6 text-white fill-white" />
            </div>
            <div>
              <p className="font-bold text-white">Consultant-Guided = $61.75 per session</p>
              <p className="text-sm text-indigo-300">
                Compare to life coaches charging $150–$400/hr. You get a certified Thinking Into Results consultant
                every single week for less than a single session elsewhere.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature comparison */}
      <section className="py-16 bg-brand-navy-mid px-4">
        <div className="container mx-auto max-w-4xl">
          <h2 className="font-display text-3xl font-bold text-white text-center mb-12">
            What&apos;s included in every plan
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: BookOpen, title: "All 12 Lessons", desc: "Complete TIR curriculum with audio, PDF, and notes for every lesson.", color: "from-blue-500 to-indigo-600" },
              { icon: Award, title: "Progress & Badges", desc: "Track your journey with visual progress, streaks, and 20+ achievement badges.", color: "from-brand-gold to-orange-600" },
              { icon: Users, title: "Community Access", desc: "Members-only forum to connect, share wins, and find accountability partners.", color: "from-brand-pink to-rose-600" },
            ].map(item => (
              <div key={item.title} className="card-feature p-6 text-center">
                <div className={`h-12 w-12 mx-auto rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-4 shadow-lg`}>
                  <item.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-bold text-white mb-2">{item.title}</h3>
                <p className="text-sm text-indigo-200">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ teaser */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-bold text-white mb-4">Still have questions?</h2>
          <p className="text-indigo-200 mb-8">
            Check out our FAQ or reach out — we&apos;re happy to help you pick the right plan.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/#faq" className="btn-secondary py-3 px-8 rounded-full text-sm font-semibold">
              Read the FAQ
            </a>
            <a href="/api/login" className="btn-gold py-3 px-8 rounded-full text-sm font-bold">
              Start Free Trial
              <ArrowRight className="ml-2 h-4 w-4 inline" />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
