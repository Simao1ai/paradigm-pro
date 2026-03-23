import {
  CheckCircle2,
  Star,
  Brain,
  Zap,
  Users,
  Award,
  MessageSquare,
  BarChart3,
  ChevronDown,
  PlayCircle,
  BookOpen,
  Target,
  Calendar,
  ArrowRight,
  Flame,
  Shield,
} from "lucide-react";
import { LESSONS } from "@/lib/constants";

const TESTIMONIALS = [
  {
    name: "Sarah M.",
    role: "Entrepreneur",
    text: "I've tried countless self-help programs. Paradigm Pro is different. Within 60 days I launched a business I'd been procrastinating on for 3 years. The paradigm shift is real.",
    rating: 5,
    avatar: "SM",
  },
  {
    name: "David K.",
    role: "Sales Executive",
    text: "The consultant sessions were a game-changer. Having someone hold me accountable while I worked through the lessons accelerated my results 10x.",
    rating: 5,
    avatar: "DK",
  },
  {
    name: "Michelle R.",
    role: "Life Coach",
    text: "The Secret Genie lesson alone was worth the entire investment. I finally understood WHY I kept self-sabotaging. That understanding changed everything.",
    rating: 5,
    avatar: "MR",
  },
];

const FAQS = [
  {
    q: "What is Thinking Into Results (TIR)?",
    a: "Thinking Into Results is a transformational program developed by Bob Proctor and Sandy Gallagher of the Proctor Gallagher Institute. It is a 12-lesson curriculum designed to help you understand how your mind works, reprogram your subconscious paradigms, and consistently achieve the results you desire.",
  },
  {
    q: "How is Paradigm Pro different from just buying the TIR program?",
    a: "Paradigm Pro delivers the full TIR curriculum through a modern, interactive platform — with audio lessons, progress tracking, journaling, goal setting, a community, and (on our Consultant-Guided plan) weekly 1-on-1 Zoom sessions with a certified consultant who helps you apply the material to your specific life and goals.",
  },
  {
    q: "How long does the program take?",
    a: "Each of the 12 lessons takes approximately 45-60 minutes to complete. Most students pace themselves at one lesson per week, completing the full program in about 3 months. However, you have unlimited access for the duration of your subscription.",
  },
  {
    q: "What's included in the weekly Zoom sessions?",
    a: "On the Consultant-Guided plan, you get a weekly 60-minute session with your personal consultant. They review your progress, identify what's blocking you, create personalized strategies for applying the TIR methodology to your specific situation, and hold you accountable to your goals.",
  },
  {
    q: "Can I upgrade from Self-Guided to Consultant-Guided later?",
    a: "Absolutely. You can upgrade at any time and only pay the prorated difference. Many students start Self-Guided and upgrade once they see the value of the program.",
  },
  {
    q: "Is there a free trial?",
    a: "Yes! We offer a 7-day free trial on the Self-Guided monthly plan. No credit card required to start. Experience the first two lessons and the community before committing.",
  },
  {
    q: "What if I'm not satisfied?",
    a: "We stand behind the Thinking Into Results methodology. If you put in the work and aren't seeing results in your first 30 days, contact us and we'll work with you to get on track — or provide a full refund.",
  },
];

export default function LandingPage() {
  return (
    <div className="overflow-x-hidden">
      {/* ── HERO ── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#1e1b4b] via-[#4f46e5] to-[#f97316]" />

        {/* Overlay blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-32 -left-32 w-[600px] h-[600px] bg-brand-pink/20 rounded-full blur-[100px]" />
          <div className="absolute -bottom-32 -right-32 w-[600px] h-[600px] bg-brand-gold/20 rounded-full blur-[100px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-indigo-600/20 rounded-full blur-[80px]" />
        </div>

        {/* Dark overlay for text legibility */}
        <div className="absolute inset-0 bg-black/30" />

        <div className="relative container mx-auto px-4 text-center max-w-5xl py-24">
          {/* Badge pill */}
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 backdrop-blur-sm px-5 py-2 text-sm text-white font-medium mb-8 shadow-lg">
            <Flame className="h-4 w-4 text-brand-gold" />
            Bob Proctor&apos;s Thinking Into Results — Now Interactive
            <span className="ml-1 rounded-full bg-brand-gold/80 px-2 py-0.5 text-xs font-bold text-white">NEW</span>
          </div>

          {/* Headline */}
          <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-bold text-white leading-[1.05] mb-6 tracking-tight drop-shadow-xl">
            Break the Pattern.
            <br />
            <span className="gold-shimmer">Own the Results.</span>
          </h1>

          {/* Sub-headline */}
          <p className="text-xl md:text-2xl text-white/80 max-w-3xl mx-auto mb-10 leading-relaxed font-light">
            The proven 12-lesson methodology that reprograms your subconscious mind —
            so you stop <em>knowing</em> what to do and start <strong className="text-white font-bold">actually doing it.</strong>
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a
              href="/api/login"
              className="btn-gold text-lg px-10 py-4 rounded-full shadow-orange-glow w-full sm:w-auto"
            >
              Start Your 7-Day Free Trial
              <ArrowRight className="ml-2 h-5 w-5 inline" />
            </a>
            <a
              href="#program"
              className="flex items-center justify-center gap-2 rounded-full border-2 border-white/30 bg-white/10 backdrop-blur-sm px-8 py-4 text-lg font-semibold text-white hover:bg-white/20 transition-all w-full sm:w-auto"
            >
              <PlayCircle className="h-5 w-5" />
              See the Program
            </a>
          </div>

          <p className="mt-4 text-sm text-white/60">
            No credit card required. Cancel anytime.
          </p>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-3 gap-6 max-w-2xl mx-auto">
            {[
              { value: "12", label: "Transformational Lessons" },
              { value: "9", label: "Day Achievement Roadmap" },
              { value: "100%", label: "Satisfaction Guarantee" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-white font-display drop-shadow-lg">{stat.value}</div>
                <div className="text-sm text-white/70 mt-1 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll arrow */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <ChevronDown className="h-7 w-7 text-white/50" />
        </div>
      </section>

      {/* ── WHY SECTION ── */}
      <section className="py-24 bg-brand-navy">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <div className="badge-gradient inline-block mb-6">The Problem</div>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
            Why do smart people stay stuck?
          </h2>
          <p className="text-xl text-indigo-200 mb-12 leading-relaxed">
            You know what you need to do. You&apos;ve read the books. You&apos;ve watched the videos.
            Yet nothing changes. That&apos;s not a knowledge problem — it&apos;s a{" "}
            <span className="text-brand-gold font-bold">paradigm problem.</span>
          </p>

          <div className="card-glass p-8 text-left border-brand-gold/20">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 flex-shrink-0 rounded-2xl bg-gradient-to-br from-brand-gold to-brand-pink flex items-center justify-center shadow-orange-glow">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-lg text-indigo-200 leading-relaxed">
                  Your paradigm — the collection of beliefs, habits, and conditioning in your subconscious mind —
                  controls <strong className="text-white">95% of your behavior.</strong> Until you change it at the root level, you&apos;ll keep
                  getting the same results no matter how hard you try.
                </p>
                <p className="text-lg text-brand-gold font-bold mt-4">
                  Paradigm Pro is the system that changes your paradigm — permanently.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 12 LESSONS ── */}
      <section id="program" className="py-24 bg-brand-navy-mid">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="badge-gradient inline-block mb-6">The Curriculum</div>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">
              The <span className="text-brand-gold">12-Lesson</span> System
            </h2>
            <p className="text-xl text-indigo-200 max-w-2xl mx-auto">
              Each lesson builds on the last, creating a complete system for permanent
              subconscious transformation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {LESSONS.map((lesson) => (
              <div
                key={lesson.number}
                className="card-feature p-5 group cursor-default"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-brand-gold to-brand-pink text-white font-bold font-display text-sm shadow-orange-glow">
                    {lesson.number}
                  </div>
                  <div>
                    <h3 className="font-semibold text-white group-hover:text-brand-gold transition-colors leading-snug">
                      {lesson.title}
                    </h3>
                    <p className="text-sm text-indigo-300 mt-1">{lesson.subtitle}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-xs text-indigo-400">{lesson.estimatedMinutes} min</span>
                      {lesson.hasAudio && (
                        <span className="text-xs text-brand-gold flex items-center gap-1">
                          <PlayCircle className="h-3 w-3" /> Audio
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 card-glass p-8 border-brand-gold/20">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="flex-shrink-0 h-16 w-16 flex items-center justify-center rounded-2xl bg-gradient-to-br from-brand-gold to-brand-pink shadow-orange-glow">
                <Target className="h-8 w-8 text-white" />
              </div>
              <div>
                <h3 className="font-display text-2xl font-bold text-white mb-2">
                  Plus: The 9-Day Achievement Roadmap
                </h3>
                <p className="text-indigo-200">
                  Alongside the 12 lessons, you&apos;ll work through a structured 9-day roadmap
                  that immediately applies what you&apos;re learning — building momentum from day one.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="py-24 bg-brand-navy">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="badge-gradient inline-block mb-6">What's Included</div>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">
              Everything you need to transform
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: BookOpen, title: "In-Browser PDF & Audio", desc: "Access every lesson PDF, audio discussion, and supplementary material without downloading anything.", color: "from-blue-500 to-indigo-600" },
              { icon: BarChart3, title: "Progress Tracking", desc: "Visual progress across all 12 lessons, streaks, and a completion dashboard that keeps you motivated.", color: "from-brand-gold to-orange-600" },
              { icon: Award, title: "Achievement Badges", desc: "Earn 20+ badges as you progress — from lesson completions to streak milestones to program graduation.", color: "from-brand-pink to-rose-600" },
              { icon: Target, title: "Weekly Goal Setting", desc: "Set and track weekly goals tied to your lesson learnings. Turn insights into committed action.", color: "from-emerald-500 to-green-600" },
              { icon: MessageSquare, title: "Journaling & Notes", desc: "A rich journaling system lets you capture insights, reflections, and breakthroughs per lesson.", color: "from-purple-500 to-violet-600" },
              { icon: Users, title: "Members Community", desc: "Connect with fellow Paradigm Pro students — share wins, find accountability partners, ask questions.", color: "from-cyan-500 to-blue-600" },
              { icon: Zap, title: "Daily Affirmations", desc: "Start each day with a Bob Proctor affirmation aligned to your current lesson and goals.", color: "from-yellow-500 to-orange-500" },
              { icon: Calendar, title: "Consultant Sessions", desc: "Consultant-Guided members get weekly 1-on-1 Zoom sessions. Book directly in the platform.", color: "from-brand-gold to-brand-pink" },
              { icon: Brain, title: "Paradigm Shift Mind Map", desc: "Watch your mind map grow with each completed lesson — a visual representation of your transformation.", color: "from-indigo-500 to-purple-600" },
            ].map((feature) => (
              <div key={feature.title} className="card-feature p-6">
                <div className={`h-12 w-12 flex items-center justify-center rounded-2xl bg-gradient-to-br ${feature.color} mb-4 shadow-lg`}>
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-bold text-white mb-2 text-lg">{feature.title}</h3>
                <p className="text-sm text-indigo-200 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="py-24 bg-brand-navy-mid">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="badge-gradient inline-block mb-6">Success Stories</div>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">
              Real shifts. Real results.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="card-glass p-6 hover:border-brand-gold/30 transition-all group">
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-brand-gold text-brand-gold" />
                  ))}
                </div>
                <p className="text-indigo-200 mb-6 leading-relaxed italic text-sm">
                  &ldquo;{t.text}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-brand-gold to-brand-pink flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {t.avatar}
                  </div>
                  <div>
                    <div className="font-bold text-white">{t.name}</div>
                    <div className="text-sm text-brand-gold">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" className="py-24 bg-brand-navy">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="badge-gradient inline-block mb-6">Pricing</div>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">
              Choose your path
            </h2>
            <p className="text-xl text-indigo-200">
              Both plans include a 7-day free trial. No credit card required.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Self-guided */}
            <div className="card-glass p-8">
              <div className="mb-6">
                <h3 className="font-display text-2xl font-bold text-white mb-1">Self-Guided</h3>
                <p className="text-indigo-300">Complete the program at your own pace</p>
              </div>
              <div className="mb-6">
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold text-white font-display">$67</span>
                  <span className="text-indigo-300">/month</span>
                </div>
                <div className="text-sm text-brand-gold mt-1 font-semibold">or $447/year — save 44%</div>
              </div>
              <ul className="space-y-3 mb-8">
                {[
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
                  "Paradigm Shift Mind Map",
                  "Mobile-friendly (PWA)",
                ].map((f) => (
                  <li key={f} className="flex items-start gap-3 text-sm text-indigo-200">
                    <CheckCircle2 className="h-4 w-4 text-brand-emerald flex-shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>
              <a
                href="/api/login"
                className="btn-secondary block text-center"
              >
                Start 7-Day Free Trial
              </a>
            </div>

            {/* Consultant-guided */}
            <div className="relative p-8 rounded-2xl bg-gradient-to-br from-[#312e7a] to-[#1e1b4b] border-2 border-brand-gold/50 shadow-orange-glow overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-brand-gold/5 to-brand-pink/5" />
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                <span className="rounded-full bg-gradient-to-r from-brand-gold to-brand-pink px-5 py-1.5 text-sm font-bold text-white shadow-orange-glow">
                  ⚡ MOST POPULAR
                </span>
              </div>

              <div className="relative mb-6 mt-2">
                <h3 className="font-display text-2xl font-bold text-white mb-1">Consultant-Guided</h3>
                <p className="text-indigo-300">Accelerated transformation with expert support</p>
              </div>
              <div className="relative mb-6">
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold text-white font-display">$247</span>
                  <span className="text-indigo-300">/month</span>
                </div>
                <div className="text-sm text-brand-gold mt-1 font-semibold">or $1,797/year — save 39%</div>
                <div className="text-xs text-indigo-400 mt-1">
                  = $61.75/session vs. life coaches charging $150–400/hr
                </div>
              </div>
              <ul className="relative space-y-3 mb-8">
                {[
                  "Everything in Self-Guided",
                  "Weekly 60-min 1-on-1 Zoom session",
                  "Personalized action plan from consultant",
                  "Direct messaging with your consultant",
                  "Session notes & follow-up accountability",
                  "Custom transformation strategy",
                  "Priority support response",
                ].map((f) => (
                  <li key={f} className="flex items-start gap-3 text-sm text-indigo-200">
                    <CheckCircle2 className="h-4 w-4 text-brand-emerald flex-shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>
              <a
                href="/api/login"
                className="relative btn-gold block text-center"
              >
                Start with Consultant-Guided
                <ArrowRight className="ml-2 h-4 w-4 inline" />
              </a>
            </div>
          </div>

          <div className="mt-12 text-center">
            <div className="inline-flex items-center gap-3 card-glass px-6 py-4 border-brand-emerald/30">
              <Shield className="h-5 w-5 text-brand-emerald" />
              <span className="text-indigo-200">
                <span className="text-white font-bold">30-Day Satisfaction Guarantee.</span>{" "}
                Put in the work. See results. Or get a full refund.
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="py-24 bg-brand-navy-mid">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="text-center mb-16">
            <div className="badge-gradient inline-block mb-6">FAQ</div>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">
              Questions answered
            </h2>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq) => (
              <details
                key={faq.q}
                className="card-glass group open:border-brand-gold/30"
              >
                <summary className="flex cursor-pointer items-center justify-between p-6 text-white font-semibold list-none gap-4">
                  <span>{faq.q}</span>
                  <ChevronDown className="h-5 w-5 text-brand-gold flex-shrink-0 transition-transform duration-300 group-open:rotate-180" />
                </summary>
                <div className="px-6 pb-6 text-indigo-200 leading-relaxed border-t border-indigo-700/30 pt-4">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1e1b4b] via-[#4f46e5] to-[#f97316]" />
        <div className="absolute inset-0 bg-black/30" />
        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-brand-pink/20 rounded-full blur-[100px]" />
        <div className="absolute -bottom-32 -right-32 w-[500px] h-[500px] bg-brand-gold/20 rounded-full blur-[100px]" />

        <div className="relative container mx-auto px-4 text-center max-w-3xl">
          <div className="badge-gradient inline-block mb-8">Ready to Begin?</div>
          <h2 className="font-display text-4xl md:text-6xl font-bold text-white mb-6 leading-tight drop-shadow-xl">
            Your paradigm is ready to shift.
            <br />
            <span className="gold-shimmer">Are you?</span>
          </h2>
          <p className="text-xl text-white/80 mb-10 leading-relaxed">
            Join Paradigm Pro today and start the 12-lesson journey that changes
            how you think — and therefore how you live.
          </p>
          <a
            href="/api/login"
            className="btn-gold inline-flex items-center gap-3 text-xl px-12 py-5 rounded-full"
          >
            Begin Your Transformation — Free for 7 Days
            <ArrowRight className="h-6 w-6" />
          </a>
          <p className="mt-5 text-sm text-white/60">No credit card required. Cancel anytime.</p>
        </div>
      </section>
    </div>
  );
}
