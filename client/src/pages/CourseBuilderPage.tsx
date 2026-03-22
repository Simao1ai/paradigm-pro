import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  Zap, Brain, FileText, Wand2, Settings, CheckCircle2, ChevronRight,
  Loader2, RefreshCw, ChevronDown,
} from "lucide-react";

const STEPS = [
  { n: 1, label: "Topic", icon: Brain },
  { n: 2, label: "Curriculum", icon: FileText },
  { n: 3, label: "Pricing", icon: Settings },
  { n: 4, label: "Create", icon: Zap },
];

interface Lesson { title: string; type: string; summary: string; }
interface Week { weekNumber: number; title: string; description: string; lessons: Lesson[]; }
interface Curriculum {
  title: string; description: string; outcomes: string[]; weeks: Week[];
}

export default function CourseBuilderPage() {
  const [step, setStep] = useState(1);
  const [topic, setTopic] = useState("");
  const [audience, setAudience] = useState("");
  const [numLessons, setNumLessons] = useState("12");
  const [curriculum, setCurriculum] = useState<Curriculum | null>(null);
  const [expandedWeeks, setExpandedWeeks] = useState<Set<number>>(new Set([1]));
  const [price, setPrice] = useState("6700");
  const [created, setCreated] = useState(false);
  const [createdTitle, setCreatedTitle] = useState("");

  const generateMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/ai/generate-curriculum", {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, audience, difficulty: "intermediate", weeks: numLessons }),
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: (data) => {
      setCurriculum(data.curriculum);
      setStep(2);
      setExpandedWeeks(new Set([1]));
    },
  });

  const buildMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/ai/build-course", {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ curriculum, price: parseInt(price) }),
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: (data) => {
      setCreated(true);
      setCreatedTitle(curriculum?.title || "");
      setStep(4);
    },
  });

  const toggleWeek = (w: number) => {
    setExpandedWeeks(prev => {
      const next = new Set(prev);
      next.has(w) ? next.delete(w) : next.add(w);
      return next;
    });
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      <div>
        <h1 className="font-display text-3xl font-bold text-white flex items-center gap-2">
          <Zap className="h-7 w-7 text-amber-400" />
          One-Click Course Builder
        </h1>
        <p className="text-indigo-300 mt-1">From idea to complete course in 30 minutes</p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-0">
        {STEPS.map((s, i) => (
          <div key={s.n} className="flex items-center flex-1">
            <div className={`flex items-center gap-2 ${step >= s.n ? "opacity-100" : "opacity-40"}`}>
              <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                step > s.n
                  ? "bg-emerald-500 text-white"
                  : step === s.n
                    ? "bg-orange-500 text-white"
                    : "bg-indigo-800 text-indigo-400"
              }`}>
                {step > s.n ? <CheckCircle2 className="h-4 w-4" /> : s.n}
              </div>
              <span className="text-xs font-semibold text-indigo-300 hidden sm:block">{s.label}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`flex-1 h-px mx-2 ${step > s.n ? "bg-emerald-500" : "bg-indigo-800"}`} />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Topic */}
      {step === 1 && (
        <div className="card-glass p-6 rounded-2xl space-y-4">
          <h2 className="font-display text-xl font-bold text-white">What's your course about?</h2>
          <p className="text-indigo-300 text-sm">Tell us your course idea and AI will build the complete curriculum.</p>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-indigo-400 uppercase tracking-wider mb-1.5 block">Course Topic *</label>
              <textarea
                value={topic}
                onChange={e => setTopic(e.target.value)}
                rows={3}
                placeholder="e.g., I want to teach entrepreneurs how to reprogram their limiting beliefs and develop a millionaire mindset using science-backed techniques..."
                className="input w-full rounded-xl px-4 py-2.5 text-sm resize-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-indigo-400 uppercase tracking-wider mb-1.5 block">Target Audience</label>
                <input value={audience} onChange={e => setAudience(e.target.value)}
                  placeholder="e.g., Entrepreneurs, 25-45" className="input w-full rounded-xl px-4 py-2.5 text-sm" />
              </div>
              <div>
                <label className="text-xs text-indigo-400 uppercase tracking-wider mb-1.5 block">Number of Lessons</label>
                <select value={numLessons} onChange={e => setNumLessons(e.target.value)} className="input w-full rounded-xl px-4 py-2.5 text-sm">
                  {["4","6","8","12","16"].map(n => <option key={n} value={n}>{n} lessons</option>)}
                </select>
              </div>
            </div>
          </div>
          <button
            onClick={() => generateMutation.mutate()}
            disabled={!topic || generateMutation.isPending}
            className="btn-gold rounded-xl px-6 py-3 text-sm font-semibold flex items-center gap-2 disabled:opacity-60 w-full justify-center"
          >
            {generateMutation.isPending ? (
              <><Brain className="h-5 w-5 animate-pulse" /> AI is building your curriculum...</>
            ) : (
              <><Brain className="h-5 w-5" /> Generate Curriculum <ChevronRight className="h-4 w-4" /></>
            )}
          </button>
        </div>
      )}

      {/* Step 2: Review Curriculum */}
      {step === 2 && curriculum && (
        <div className="space-y-4">
          <div className="card-glass p-5 rounded-2xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-display text-xl font-bold text-white">{curriculum.title}</h2>
                <p className="text-indigo-300 text-sm mt-1">{curriculum.description}</p>
              </div>
              <button onClick={() => { setStep(1); generateMutation.mutate(); }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 text-indigo-300 text-xs font-semibold hover:bg-white/10 transition-colors shrink-0">
                <RefreshCw className="h-3.5 w-3.5" /> Regenerate
              </button>
            </div>
            {curriculum.outcomes?.length > 0 && (
              <ul className="mt-4 space-y-1">
                {curriculum.outcomes.map((o, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-indigo-200">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                    {o}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="space-y-2">
            {curriculum.weeks?.map(week => (
              <div key={week.weekNumber} className="card-glass rounded-xl overflow-hidden">
                <button onClick={() => toggleWeek(week.weekNumber)}
                  className="w-full flex items-center gap-3 p-4 hover:bg-white/5 transition-colors">
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-600 to-orange-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                    {week.weekNumber}
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <p className="text-sm font-semibold text-white">{week.title}</p>
                  </div>
                  {expandedWeeks.has(week.weekNumber) ? <ChevronDown className="h-4 w-4 text-indigo-400" /> : <ChevronRight className="h-4 w-4 text-indigo-400" />}
                </button>
                {expandedWeeks.has(week.weekNumber) && (
                  <div className="border-t border-indigo-700/20 px-4 pb-3 pt-2 space-y-1.5">
                    {week.lessons?.map((lesson, li) => (
                      <div key={li} className="flex items-start gap-2 p-2 rounded-lg bg-white/5 text-sm">
                        <span className={`text-xs px-1.5 py-0.5 rounded shrink-0 mt-0.5 ${
                          lesson.type === "video" ? "bg-orange-500/20 text-orange-400"
                            : lesson.type === "reading" ? "bg-blue-500/20 text-blue-400"
                              : "bg-emerald-500/20 text-emerald-400"
                        }`}>{lesson.type}</span>
                        <div>
                          <p className="text-white font-medium text-xs">{lesson.title}</p>
                          <p className="text-indigo-400 text-xs">{lesson.summary}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          <button onClick={() => setStep(3)}
            className="btn-gold rounded-xl px-6 py-3 text-sm font-semibold flex items-center gap-2 w-full justify-center">
            Looks good — set pricing <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Step 3: Pricing */}
      {step === 3 && (
        <div className="card-glass p-6 rounded-2xl space-y-5">
          <h2 className="font-display text-xl font-bold text-white">Set Course Pricing</h2>
          <div className="space-y-4">
            <div>
              <label className="text-xs text-indigo-400 uppercase tracking-wider mb-1.5 block">Price (in cents)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-400 text-sm">$</span>
                <input
                  type="number"
                  value={(parseInt(price) / 100).toFixed(0)}
                  onChange={e => setPrice(String(Math.round(parseFloat(e.target.value || "0") * 100)))}
                  className="input w-full rounded-xl pl-8 pr-4 py-2.5 text-sm"
                  min="0"
                />
              </div>
              <p className="text-indigo-500 text-xs mt-1">Set to 0 for free course</p>
            </div>
            <div className="flex gap-2 flex-wrap">
              {[0, 4700, 6700, 9700, 19700, 29700].map(p => (
                <button key={p} onClick={() => setPrice(String(p))}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    price === String(p) ? "bg-orange-500 text-white" : "bg-white/5 text-indigo-400 hover:bg-white/10"
                  }`}>
                  {p === 0 ? "Free" : `$${p / 100}`}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setStep(2)} className="flex-1 px-6 py-3 rounded-xl bg-white/5 text-indigo-300 text-sm font-semibold hover:bg-white/10 transition-colors">
              Back
            </button>
            <button
              onClick={() => buildMutation.mutate()}
              disabled={buildMutation.isPending}
              className="flex-1 btn-gold rounded-xl px-6 py-3 text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {buildMutation.isPending ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Building your course...</>
              ) : (
                <><Zap className="h-4 w-4" /> Create Course</>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Done */}
      {step === 4 && created && (
        <div className="card-glass p-8 rounded-2xl flex flex-col items-center text-center">
          <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mb-5">
            <CheckCircle2 className="h-10 w-10 text-white" />
          </div>
          <h2 className="font-display text-2xl font-bold text-white mb-2">Course Created! 🎉</h2>
          <p className="text-indigo-300 text-sm mb-1">
            <span className="text-white font-semibold">{createdTitle}</span> has been built and added to your platform.
          </p>
          <p className="text-indigo-400 text-xs mb-6">All lessons are created as drafts — you can now add content, videos, and materials.</p>
          <div className="flex gap-3">
            <a href="/lessons" className="btn-gold rounded-xl px-5 py-2.5 text-sm font-semibold">View Lessons</a>
            <button onClick={() => { setStep(1); setTopic(""); setCurriculum(null); setCreated(false); }}
              className="px-5 py-2.5 rounded-xl bg-white/5 text-indigo-300 text-sm font-semibold hover:bg-white/10 transition-colors">
              Build Another
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
