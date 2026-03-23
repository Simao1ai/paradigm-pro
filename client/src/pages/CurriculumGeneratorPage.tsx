import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Brain, Loader2, RefreshCw, CheckCircle2, ChevronDown, ChevronRight, Plus } from "lucide-react";

interface GeneratedLesson {
  title: string;
  type: "video" | "reading" | "assignment";
  summary: string;
}
interface GeneratedWeek {
  weekNumber: number;
  title: string;
  description: string;
  lessons: GeneratedLesson[];
}
interface GeneratedCurriculum {
  title: string;
  description: string;
  outcomes: string[];
  weeks: GeneratedWeek[];
}

const LESSON_TYPE_COLOR: Record<string, string> = {
  video: "bg-orange-500/20 text-orange-400",
  reading: "bg-blue-500/20 text-blue-400",
  assignment: "bg-emerald-500/20 text-emerald-400",
};

export default function CurriculumGeneratorPage() {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    topic: "", audience: "", difficulty: "intermediate", weeks: "12",
  });
  const [curriculum, setCurriculum] = useState<GeneratedCurriculum | null>(null);
  const [expandedWeeks, setExpandedWeeks] = useState<Set<number>>(new Set([1]));
  const [saved, setSaved] = useState(false);

  const generateMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/ai/generate-curriculum", {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: (data) => {
      setCurriculum(data.curriculum);
      setSaved(false);
      setExpandedWeeks(new Set([1]));
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/content-drafts", {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "curriculum",
          title: curriculum!.title,
          content: JSON.stringify(curriculum, null, 2),
          status: "draft",
        }),
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => {
      setSaved(true);
      qc.invalidateQueries({ queryKey: ["/api/content-drafts"] });
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
        <h1 className="font-display text-3xl font-bold text-white">Curriculum Generator</h1>
        <p className="text-indigo-300 mt-1">Generate a complete course outline with Claude AI</p>
      </div>

      {/* Form */}
      <div className="card-glass p-6 rounded-2xl space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-indigo-400 uppercase tracking-wider mb-1.5 block">Course Topic *</label>
            <input
              value={form.topic}
              onChange={e => setForm(f => ({ ...f, topic: e.target.value }))}
              placeholder="e.g., Mindset & Personal Transformation"
              className="input w-full rounded-xl px-4 py-2.5 text-sm"
            />
          </div>
          <div>
            <label className="text-xs text-indigo-400 uppercase tracking-wider mb-1.5 block">Target Audience</label>
            <input
              value={form.audience}
              onChange={e => setForm(f => ({ ...f, audience: e.target.value }))}
              placeholder="e.g., Entrepreneurs aged 25-45"
              className="input w-full rounded-xl px-4 py-2.5 text-sm"
            />
          </div>
          <div>
            <label className="text-xs text-indigo-400 uppercase tracking-wider mb-1.5 block">Difficulty Level</label>
            <select
              value={form.difficulty}
              onChange={e => setForm(f => ({ ...f, difficulty: e.target.value }))}
              className="input w-full rounded-xl px-4 py-2.5 text-sm"
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-indigo-400 uppercase tracking-wider mb-1.5 block">Number of Lessons</label>
            <select
              value={form.weeks}
              onChange={e => setForm(f => ({ ...f, weeks: e.target.value }))}
              className="input w-full rounded-xl px-4 py-2.5 text-sm"
            >
              {["4","6","8","10","12","16"].map(n => (
                <option key={n} value={n}>{n} lessons</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => generateMutation.mutate()}
            disabled={!form.topic || generateMutation.isPending}
            className="btn-gold rounded-xl px-6 py-2.5 text-sm font-semibold flex items-center gap-2 disabled:opacity-60"
          >
            {generateMutation.isPending ? (
              <>
                <Brain className="h-4 w-4 animate-pulse" />
                AI is creating your curriculum...
              </>
            ) : (
              <>
                <Brain className="h-4 w-4" />
                Generate Curriculum
              </>
            )}
          </button>
          {curriculum && (
            <button
              onClick={() => generateMutation.mutate()}
              disabled={generateMutation.isPending}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/5 text-indigo-300 text-sm font-semibold hover:bg-white/10 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              Regenerate
            </button>
          )}
        </div>
      </div>

      {/* Generated curriculum */}
      {curriculum && (
        <div className="space-y-4">
          {/* Header */}
          <div className="card-glass p-6 rounded-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-display text-2xl font-bold text-white">{curriculum.title}</h2>
                <p className="text-indigo-300 text-sm mt-1">{curriculum.description}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {saved ? (
                  <span className="flex items-center gap-1 text-emerald-400 text-sm font-semibold">
                    <CheckCircle2 className="h-4 w-4" /> Saved
                  </span>
                ) : (
                  <button
                    onClick={() => saveMutation.mutate()}
                    disabled={saveMutation.isPending}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-700/40 text-indigo-200 text-sm font-semibold hover:bg-indigo-700/60 transition-colors"
                  >
                    {saveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                    Save Draft
                  </button>
                )}
              </div>
            </div>

            {curriculum.outcomes?.length > 0 && (
              <div className="mt-4">
                <p className="text-xs text-indigo-400 uppercase tracking-wider mb-2">Learning Outcomes</p>
                <ul className="space-y-1">
                  {curriculum.outcomes.map((o, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-indigo-200">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                      {o}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Week tree */}
          <div className="space-y-3">
            {curriculum.weeks?.map(week => (
              <div key={week.weekNumber} className="card-glass rounded-2xl overflow-hidden">
                <button
                  onClick={() => toggleWeek(week.weekNumber)}
                  className="w-full flex items-center gap-4 p-5 hover:bg-white/5 transition-colors"
                >
                  <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-600 to-orange-500 flex items-center justify-center text-white text-sm font-bold shrink-0">
                    {week.weekNumber}
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <p className="font-semibold text-white">{week.title}</p>
                    <p className="text-indigo-400 text-xs truncate">{week.description}</p>
                  </div>
                  <span className="text-xs text-indigo-500 shrink-0">{week.lessons?.length ?? 0} lessons</span>
                  {expandedWeeks.has(week.weekNumber)
                    ? <ChevronDown className="h-4 w-4 text-indigo-400 shrink-0" />
                    : <ChevronRight className="h-4 w-4 text-indigo-400 shrink-0" />
                  }
                </button>
                {expandedWeeks.has(week.weekNumber) && week.lessons?.length > 0 && (
                  <div className="border-t border-indigo-700/20 px-5 pb-4 pt-3 space-y-2">
                    {week.lessons.map((lesson, li) => (
                      <div key={li} className="flex items-start gap-3 p-3 rounded-xl bg-white/5">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold shrink-0 mt-0.5 ${LESSON_TYPE_COLOR[lesson.type] || "bg-indigo-700/30 text-indigo-400"}`}>
                          {lesson.type}
                        </span>
                        <div>
                          <p className="text-sm text-white font-medium">{lesson.title}</p>
                          <p className="text-xs text-indigo-400 mt-0.5">{lesson.summary}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
