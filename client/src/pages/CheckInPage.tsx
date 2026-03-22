import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import confetti from "canvas-confetti";
import { ArrowLeft, ArrowRight, Flame, CheckCircle2, Loader2, Calendar, ChevronLeft, ChevronRight } from "lucide-react";

const MOOD_EMOJIS = [
  { value: 1, emoji: "😞", label: "Struggling" },
  { value: 2, emoji: "😕", label: "Not great" },
  { value: 3, emoji: "😐", label: "Okay" },
  { value: 4, emoji: "🙂", label: "Good" },
  { value: 5, emoji: "🔥", label: "Amazing!" },
];

interface CheckInHistory {
  checkInDate: string;
  mood: number;
  wins: string;
  struggles: string;
  tomorrowPlan: string;
  aiInsight: string | null;
}

interface TodayCheckIn extends CheckInHistory {
  id: string;
  streak: number;
}

interface DayStatus {
  date: string;
  done: boolean;
}

function getCalendarDays(): DayStatus[] {
  const days: DayStatus[] = [];
  const today = new Date();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    days.push({ date: d.toISOString().split("T")[0], done: false });
  }
  return days;
}

export default function CheckInPage() {
  const queryClient = useQueryClient();
  const [step, setStep] = useState(0); // 0=mood,1=win,2=struggle,3=tomorrow,4=done
  const [mood, setMood] = useState<number>(0);
  const [wins, setWins] = useState("");
  const [struggles, setStruggles] = useState("");
  const [tomorrowPlan, setTomorrowPlan] = useState("");
  const [aiInsight, setAiInsight] = useState("");
  const [streak, setStreak] = useState(0);
  const didConfetti = useRef(false);

  const { data: todayCheckIn, isLoading } = useQuery<TodayCheckIn | null>({
    queryKey: ["/api/check-in/today"],
    queryFn: async () => {
      const r = await fetch("/api/check-in/today", { credentials: "include" });
      if (!r.ok) return null;
      return r.json();
    },
  });

  const { data: history } = useQuery<CheckInHistory[]>({
    queryKey: ["/api/check-in/history"],
    queryFn: async () => {
      const r = await fetch("/api/check-in/history", { credentials: "include" });
      return r.json();
    },
  });

  useEffect(() => {
    if (todayCheckIn && step === 0 && !didConfetti.current) {
      setStep(4);
      setAiInsight(todayCheckIn.aiInsight || "");
      setStreak(todayCheckIn.streak);
    }
  }, [todayCheckIn]);

  const submitMutation = useMutation({
    mutationFn: async () => {
      const r = await fetch("/api/check-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ mood, wins, struggles, tomorrowPlan }),
      });
      if (!r.ok) throw new Error("Failed to submit");
      return r.json();
    },
    onSuccess: (data) => {
      setAiInsight(data.aiInsight || "");
      setStreak(data.streak || 0);
      setStep(4);
      queryClient.invalidateQueries({ queryKey: ["/api/check-in/today"] });
      queryClient.invalidateQueries({ queryKey: ["/api/check-in/history"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });

      if (!didConfetti.current) {
        didConfetti.current = true;
        confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 }, colors: ["#f97316", "#c9a84c", "#ec4899"] });
      }
    },
  });

  // Build calendar grid
  const calendarDays = getCalendarDays();
  const doneDates = new Set((history || []).map((h) => h.checkInDate?.split("T")[0]));
  if (todayCheckIn) doneDates.add(new Date().toISOString().split("T")[0]);

  // ── Step: Already done today ─────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 text-brand-gold animate-spin" />
      </div>
    );
  }

  const steps = [
    { label: "Mood", pct: 0 },
    { label: "Win", pct: 25 },
    { label: "Challenge", pct: 50 },
    { label: "Tomorrow", pct: 75 },
  ];

  return (
    <div className="max-w-xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center gap-3 mb-2">
        <Link href="/dashboard">
          <a className="flex items-center gap-1.5 text-indigo-400 hover:text-white text-sm transition-colors">
            <ArrowLeft className="h-4 w-4" /> Dashboard
          </a>
        </Link>
        <span className="text-indigo-700">·</span>
        <span className="text-white font-semibold">Daily Check-In</span>
      </div>

      {/* Streak Banner */}
      {(streak > 0 || (todayCheckIn && step === 4)) && (
        <div className="flex items-center gap-2 bg-orange-500/10 border border-orange-500/30 rounded-xl px-4 py-3">
          <Flame className="h-5 w-5 text-orange-400" />
          <span className="text-orange-300 font-bold">{streak || todayCheckIn?.streak || 1}-day check-in streak!</span>
        </div>
      )}

      {/* ── Step 4: Done ──────────────────────────────────────────────────── */}
      {step === 4 ? (
        <div className="card-glass p-8 text-center space-y-5">
          <CheckCircle2 className="h-14 w-14 text-emerald-400 mx-auto" />
          <div>
            <h2 className="text-2xl font-bold text-white font-display mb-1">Check-In Complete!</h2>
            <p className="text-indigo-300 text-sm">You showed up for yourself today.</p>
          </div>

          {aiInsight && (
            <div className="rounded-xl border-l-4 border-brand-gold bg-brand-gold/5 p-4 text-left">
              <p className="text-xs text-brand-gold font-semibold uppercase tracking-wide mb-1.5">Your AI Coach Says</p>
              <p className="text-indigo-100 text-sm leading-relaxed italic">{aiInsight}</p>
            </div>
          )}

          <div className="flex gap-3 justify-center flex-wrap">
            <Link href="/dashboard">
              <a className="btn-gold rounded-xl px-6 py-2.5 text-sm font-semibold">Go to Dashboard</a>
            </Link>
            <Link href="/goals">
              <a className="px-6 py-2.5 text-sm font-semibold rounded-xl border border-indigo-600 text-indigo-300 hover:text-white hover:border-indigo-400 transition-colors">
                View Goals
              </a>
            </Link>
          </div>
        </div>
      ) : (
        /* ── Wizard Steps ─────────────────────────────────────────────────── */
        <div className="card-glass p-6 space-y-6">
          {/* Progress bar */}
          <div>
            <div className="flex justify-between text-xs text-indigo-400 mb-2">
              {steps.map((s, i) => (
                <span key={s.label} className={i <= step ? "text-brand-gold font-semibold" : ""}>{s.label}</span>
              ))}
            </div>
            <div className="h-1.5 bg-indigo-900 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-brand-gold to-orange-500 rounded-full transition-all duration-500"
                style={{ width: `${steps[step]?.pct || 0}%` }}
              />
            </div>
          </div>

          {/* Step 0: Mood */}
          {step === 0 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-white text-center">How are you feeling today?</h2>
              <div className="flex justify-between gap-2">
                {MOOD_EMOJIS.map((m) => (
                  <button
                    key={m.value}
                    onClick={() => setMood(m.value)}
                    className={`flex-1 flex flex-col items-center gap-1.5 rounded-xl py-3 border transition-all duration-200 ${
                      mood === m.value
                        ? "border-orange-500 bg-orange-500/20 scale-105"
                        : "border-indigo-700/40 bg-white/5 hover:border-indigo-500 hover:scale-102"
                    }`}
                  >
                    <span className={`text-3xl transition-transform ${mood === m.value ? "scale-110" : ""}`}>{m.emoji}</span>
                    <span className="text-[10px] text-indigo-300 font-medium">{m.label}</span>
                  </button>
                ))}
              </div>
              <button
                onClick={() => setStep(1)}
                disabled={!mood}
                className="w-full btn-gold rounded-xl py-3 font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
              >
                Next <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Step 1: Win */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="text-center">
                <span className="text-4xl">🏆</span>
                <h2 className="text-xl font-bold text-white mt-2">What's one win from today?</h2>
                <p className="text-indigo-400 text-sm mt-1">Big or small — all wins count.</p>
              </div>
              <textarea
                className="input w-full h-28 resize-none"
                placeholder="e.g. I completed lesson 3, had a great conversation, woke up early…"
                value={wins}
                onChange={(e) => setWins(e.target.value)}
                autoFocus
              />
              <div className="flex gap-3">
                <button onClick={() => setStep(0)} className="flex-1 px-4 py-2.5 rounded-xl border border-indigo-700 text-indigo-400 hover:text-white text-sm font-semibold transition-colors">
                  Back
                </button>
                <button
                  onClick={() => setStep(2)}
                  disabled={!wins.trim()}
                  className="flex-1 btn-gold rounded-xl py-2.5 text-sm font-semibold flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  Next <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Struggle */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="text-center">
                <span className="text-4xl">💪</span>
                <h2 className="text-xl font-bold text-white mt-2">What's one challenge you're facing?</h2>
                <p className="text-indigo-400 text-sm mt-1">Acknowledging it is the first step.</p>
              </div>
              <textarea
                className="input w-full h-28 resize-none"
                placeholder="e.g. Hard to stay focused, procrastinating on my goals, feeling uncertain…"
                value={struggles}
                onChange={(e) => setStruggles(e.target.value)}
                autoFocus
              />
              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="flex-1 px-4 py-2.5 rounded-xl border border-indigo-700 text-indigo-400 hover:text-white text-sm font-semibold transition-colors">
                  Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  disabled={!struggles.trim()}
                  className="flex-1 btn-gold rounded-xl py-2.5 text-sm font-semibold flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  Next <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Tomorrow */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="text-center">
                <span className="text-4xl">🎯</span>
                <h2 className="text-xl font-bold text-white mt-2">What's your #1 priority for tomorrow?</h2>
                <p className="text-indigo-400 text-sm mt-1">One focused intention = massive momentum.</p>
              </div>
              <textarea
                className="input w-full h-28 resize-none"
                placeholder="e.g. Complete lesson 4, make one sales call, journal for 10 minutes…"
                value={tomorrowPlan}
                onChange={(e) => setTomorrowPlan(e.target.value)}
                autoFocus
              />
              <div className="flex gap-3">
                <button onClick={() => setStep(2)} className="flex-1 px-4 py-2.5 rounded-xl border border-indigo-700 text-indigo-400 hover:text-white text-sm font-semibold transition-colors">
                  Back
                </button>
                <button
                  onClick={() => submitMutation.mutate()}
                  disabled={!tomorrowPlan.trim() || submitMutation.isPending}
                  className="flex-1 btn-gold rounded-xl py-2.5 text-sm font-semibold flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  {submitMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Submit <CheckCircle2 className="h-4 w-4" /></>}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Calendar View */}
      <div className="card-glass p-5">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="h-4 w-4 text-brand-gold" />
          <h3 className="font-semibold text-white text-sm">30-Day Check-In History</h3>
        </div>
        <div className="grid grid-cols-10 gap-1.5">
          {calendarDays.map((day) => {
            const done = doneDates.has(day.date);
            const isToday = day.date === new Date().toISOString().split("T")[0];
            return (
              <div
                key={day.date}
                title={day.date}
                className={`h-5 w-full rounded-sm transition-colors ${
                  done ? "bg-emerald-500" : isToday ? "bg-indigo-600 ring-1 ring-indigo-400" : "bg-indigo-900/60"
                }`}
              />
            );
          })}
        </div>
        <div className="flex items-center gap-3 mt-3 text-xs text-indigo-400">
          <span className="flex items-center gap-1"><span className="h-3 w-3 rounded-sm bg-emerald-500 inline-block" /> Done</span>
          <span className="flex items-center gap-1"><span className="h-3 w-3 rounded-sm bg-indigo-900/60 inline-block" /> Missed</span>
        </div>
      </div>
    </div>
  );
}
