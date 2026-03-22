import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import confetti from "canvas-confetti";
import {
  Plus, CheckCircle2, Circle, Target, Loader2, AlertCircle, Sparkles,
  Trash2, Calendar, ChevronDown, ChevronUp, Archive, X, Brain,
} from "lucide-react";

// ── Weekly goals (existing) ───────────────────────────────────────────────
const CATEGORIES = [
  { value: "mindset", label: "Mindset", color: "text-purple-400" },
  { value: "action", label: "Action", color: "text-blue-400" },
  { value: "relationship", label: "Relationship", color: "text-pink-400" },
  { value: "financial", label: "Financial", color: "text-brand-gold" },
  { value: "health", label: "Health", color: "text-green-400" },
  { value: "other", label: "Other", color: "text-indigo-400" },
];

function getMondayOfWeek(date: Date): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  return d.toISOString().split("T")[0];
}

interface WeeklyGoal {
  id: string;
  goalText: string;
  category: string;
  isCompleted: boolean;
  weekStart: string;
}

// ── Long-term goals (new) ──────────────────────────────────────────────────
interface LongTermGoal {
  id: string;
  title: string;
  description: string | null;
  targetDate: string | null;
  status: string;
  aiRefined: boolean;
  createdAt: string;
}

function GoalProgressRing({ percent }: { percent: number }) {
  const r = 20;
  const circ = 2 * Math.PI * r;
  const dash = (percent / 100) * circ;
  return (
    <svg width="52" height="52" className="flex-shrink-0">
      <circle cx="26" cy="26" r={r} fill="none" stroke="#1e1b4b" strokeWidth="5" />
      <circle
        cx="26" cy="26" r={r} fill="none"
        stroke="url(#goal-ring)"
        strokeWidth="5"
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
        transform="rotate(-90 26 26)"
      />
      <defs>
        <linearGradient id="goal-ring" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#f97316" />
        </linearGradient>
      </defs>
      <text x="26" y="30" textAnchor="middle" fontSize="10" fill="white" fontWeight="bold">
        {Math.round(percent)}%
      </text>
    </svg>
  );
}

function LongTermGoalsSection() {
  const queryClient = useQueryClient();
  const [showAdd, setShowAdd] = useState(false);
  const [showArchive, setShowArchive] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [refining, setRefining] = useState(false);
  const [refinedText, setRefinedText] = useState("");

  const { data: goals, isLoading } = useQuery<LongTermGoal[]>({
    queryKey: ["/api/long-term-goals"],
    queryFn: async () => {
      const r = await fetch("/api/long-term-goals", { credentials: "include" });
      return r.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const r = await fetch("/api/long-term-goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ title, description, targetDate: targetDate || undefined }),
      });
      if (!r.ok) throw new Error("Failed");
      return r.json();
    },
    onSuccess: () => {
      setTitle(""); setDescription(""); setTargetDate(""); setShowAdd(false); setRefinedText("");
      queryClient.invalidateQueries({ queryKey: ["/api/long-term-goals"] });
    },
  });

  const statusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const r = await fetch(`/api/long-term-goals/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status }),
      });
      return r.json();
    },
    onSuccess: (_, vars) => {
      if (vars.status === "completed") {
        confetti({ particleCount: 100, spread: 70, colors: ["#f97316", "#c9a84c", "#ec4899"] });
      }
      queryClient.invalidateQueries({ queryKey: ["/api/long-term-goals"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await fetch(`/api/long-term-goals/${id}`, { method: "DELETE", credentials: "include" });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/long-term-goals"] }),
  });

  const refineGoal = async () => {
    if (!title.trim()) return;
    setRefining(true);
    try {
      const r = await fetch("/api/ai/refine-goal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ goalText: title, description }),
      });
      const data = await r.json();
      if (data.refinedTitle) setTitle(data.refinedTitle);
      if (data.refinedDescription) { setDescription(data.refinedDescription); setRefinedText(data.refinedDescription); }
    } catch { }
    setRefining(false);
  };

  const active = (goals || []).filter((g) => g.status === "active");
  const archived = (goals || []).filter((g) => g.status !== "active");

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target className="h-5 w-5 text-brand-gold" />
          <h2 className="text-lg font-bold text-white font-display">Long-Term Goals</h2>
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="btn-gold rounded-xl px-4 py-2 text-sm font-semibold flex items-center gap-1.5"
        >
          <Plus className="h-4 w-4" /> New Goal
        </button>
      </div>

      {/* Add goal form */}
      {showAdd && (
        <div className="card-glass p-5 space-y-4 border border-brand-gold/30">
          <h3 className="text-sm font-semibold text-white">Create a New Goal</h3>
          <div>
            <input
              className="input w-full"
              placeholder="Goal title (e.g. Increase income by $5k/month)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div>
            <textarea
              className="input w-full h-20 resize-none"
              placeholder="What does success look like? (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs text-indigo-400 mb-1 block">Target date (optional)</label>
            <input type="date" className="input w-full" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} />
          </div>

          {refinedText && (
            <div className="rounded-xl border-l-4 border-brand-gold bg-brand-gold/5 p-3">
              <p className="text-xs text-brand-gold font-semibold mb-1">✨ AI Refined this into a SMART Goal</p>
              <p className="text-sm text-indigo-100">{refinedText}</p>
            </div>
          )}

          <div className="flex gap-2 flex-wrap">
            <button
              onClick={refineGoal}
              disabled={!title.trim() || refining}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-indigo-600 text-indigo-300 hover:text-white hover:border-indigo-400 text-sm font-medium transition-colors disabled:opacity-50"
            >
              {refining ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
              Help me define this goal
            </button>
            <div className="flex gap-2 ml-auto">
              <button onClick={() => { setShowAdd(false); setRefinedText(""); }} className="px-4 py-2 text-sm text-indigo-400 hover:text-white transition-colors">
                Cancel
              </button>
              <button
                onClick={() => createMutation.mutate()}
                disabled={!title.trim() || createMutation.isPending}
                className="btn-gold rounded-xl px-4 py-2 text-sm font-semibold disabled:opacity-50"
              >
                {createMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create Goal"}
              </button>
            </div>
          </div>
        </div>
      )}

      {isLoading && <div className="flex justify-center py-6"><Loader2 className="h-5 w-5 text-brand-gold animate-spin" /></div>}

      {active.length === 0 && !isLoading && !showAdd && (
        <div className="card-glass p-8 text-center space-y-2">
          <Target className="h-10 w-10 text-indigo-600 mx-auto" />
          <p className="text-white font-semibold">No active goals yet</p>
          <p className="text-indigo-400 text-sm">Set a bold goal and let your AI coach help you define it.</p>
        </div>
      )}

      <div className="space-y-3">
        {active.map((goal) => {
          const daysLeft = goal.targetDate
            ? Math.max(0, Math.ceil((new Date(goal.targetDate).getTime() - Date.now()) / 86400000))
            : null;

          return (
            <div key={goal.id} className="card-glass p-4">
              <div className="flex items-start gap-3">
                <GoalProgressRing percent={0} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-white font-semibold leading-snug">{goal.title}</p>
                      {goal.aiRefined && (
                        <span className="inline-flex items-center gap-1 text-[10px] text-brand-gold bg-brand-gold/10 px-1.5 py-0.5 rounded-full mt-0.5">
                          <Sparkles className="h-2.5 w-2.5" /> SMART Goal
                        </span>
                      )}
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      <button
                        onClick={() => statusMutation.mutate({ id: goal.id, status: "completed" })}
                        title="Mark completed"
                        className="p-1.5 rounded-lg text-indigo-500 hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => statusMutation.mutate({ id: goal.id, status: "abandoned" })}
                        title="Archive goal"
                        className="p-1.5 rounded-lg text-indigo-500 hover:text-indigo-300 hover:bg-indigo-800/40 transition-colors"
                      >
                        <Archive className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => deleteMutation.mutate(goal.id)}
                        title="Delete goal"
                        className="p-1.5 rounded-lg text-indigo-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {goal.description && (
                    <p className="text-sm text-indigo-300 mt-1.5 leading-relaxed line-clamp-2">{goal.description}</p>
                  )}

                  {daysLeft !== null && (
                    <div className="flex items-center gap-1 mt-2">
                      <Calendar className="h-3 w-3 text-indigo-400" />
                      <span className={`text-xs font-medium ${daysLeft <= 7 ? "text-orange-400" : "text-indigo-400"}`}>
                        {daysLeft === 0 ? "Due today!" : `${daysLeft} days left`}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Archived section */}
      {archived.length > 0 && (
        <div>
          <button
            onClick={() => setShowArchive(!showArchive)}
            className="flex items-center gap-2 text-indigo-400 hover:text-white text-sm font-medium transition-colors"
          >
            {showArchive ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            {showArchive ? "Hide" : "Show"} archive ({archived.length})
          </button>
          {showArchive && (
            <div className="mt-3 space-y-2 opacity-60">
              {archived.map((goal) => (
                <div key={goal.id} className="card-glass p-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm text-indigo-300 line-through">{goal.title}</p>
                    <span className={`text-xs px-1.5 py-0.5 rounded-full mt-0.5 inline-block ${
                      goal.status === "completed" ? "bg-emerald-500/20 text-emerald-400" : "bg-indigo-900/60 text-indigo-500"
                    }`}>{goal.status}</span>
                  </div>
                  <button onClick={() => deleteMutation.mutate(goal.id)} className="text-indigo-600 hover:text-red-400 transition-colors">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function WeeklyGoalsSection() {
  const queryClient = useQueryClient();
  const weekStart = getMondayOfWeek(new Date());
  const [newGoal, setNewGoal] = useState("");
  const [newCategory, setNewCategory] = useState("mindset");

  const { data: goals, isLoading, error } = useQuery<WeeklyGoal[]>({
    queryKey: ["/api/goals", weekStart],
    queryFn: async () => {
      const res = await fetch(`/api/goals?weekStart=${weekStart}`, { credentials: "include" });
      if (!res.ok) throw new Error(`${res.status}`);
      return res.json();
    },
  });

  const addMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ goalText: newGoal, category: newCategory, weekStart }),
      });
      if (!res.ok) throw new Error("Failed to add goal");
      return res.json();
    },
    onSuccess: () => {
      setNewGoal("");
      queryClient.invalidateQueries({ queryKey: ["/api/goals", weekStart] });
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, isCompleted }: { id: string; isCompleted: boolean }) => {
      const res = await fetch(`/api/goals/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ isCompleted }),
      });
      if (!res.ok) throw new Error("Failed to update");
      return res.json();
    },
    onSuccess: (_, vars) => {
      if (vars.isCompleted) {
        confetti({ particleCount: 60, spread: 60, colors: ["#c9a84c", "#f97316"] });
      }
      queryClient.invalidateQueries({ queryKey: ["/api/goals", weekStart] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await fetch(`/api/goals/${id}`, { method: "DELETE", credentials: "include" });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/goals", weekStart] }),
  });

  const weekDate = new Date(weekStart);
  const weekEnd = new Date(weekDate);
  weekEnd.setDate(weekEnd.getDate() + 6);

  const completedCount = (goals || []).filter((g) => g.isCompleted).length;
  const totalCount = (goals || []).length;

  return (
    <div className="card-glass p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-bold text-white">This Week's Goals</h2>
          <p className="text-xs text-indigo-400 mt-0.5">
            {weekDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })} –{" "}
            {weekEnd.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
          </p>
        </div>
        {totalCount > 0 && (
          <div className="text-right">
            <p className="text-sm font-bold text-brand-gold">{completedCount}/{totalCount}</p>
            <p className="text-xs text-indigo-400">completed</p>
          </div>
        )}
      </div>

      {totalCount > 0 && (
        <div className="h-1.5 bg-indigo-900 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-brand-gold to-orange-500 rounded-full transition-all"
            style={{ width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%` }}
          />
        </div>
      )}

      {isLoading && <div className="flex justify-center py-4"><Loader2 className="h-5 w-5 text-brand-gold animate-spin" /></div>}

      {error && <p className="text-sm text-red-400">Failed to load goals.</p>}

      <div className="space-y-2">
        {(goals || []).map((goal) => {
          const cat = CATEGORIES.find((c) => c.value === goal.category);
          return (
            <div key={goal.id} className="flex items-center gap-3 rounded-xl bg-white/5 border border-indigo-700/20 px-3 py-2.5">
              <button
                onClick={() => toggleMutation.mutate({ id: goal.id, isCompleted: !goal.isCompleted })}
                className="flex-shrink-0"
              >
                {goal.isCompleted
                  ? <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                  : <Circle className="h-5 w-5 text-indigo-500 hover:text-brand-gold transition-colors" />
                }
              </button>
              <span className={`flex-1 text-sm ${goal.isCompleted ? "line-through text-indigo-500" : "text-white"}`}>
                {goal.goalText}
              </span>
              <span className={`text-xs font-medium ${cat?.color || "text-indigo-400"}`}>{cat?.label || goal.category}</span>
              <button onClick={() => deleteMutation.mutate(goal.id)} className="text-indigo-600 hover:text-red-400 transition-colors p-0.5">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          );
        })}
      </div>

      <div className="flex gap-2">
        <select
          className="input py-2 px-3 text-sm w-36 flex-shrink-0"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
        >
          {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
        <input
          className="input flex-1 py-2 text-sm"
          placeholder="Add a goal for this week…"
          value={newGoal}
          onChange={(e) => setNewGoal(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && newGoal.trim() && addMutation.mutate()}
        />
        <button
          onClick={() => addMutation.mutate()}
          disabled={!newGoal.trim() || addMutation.isPending}
          className="btn-gold rounded-xl px-3 py-2 disabled:opacity-50"
        >
          {addMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}

export default function GoalsPage() {
  return (
    <div className="space-y-8 animate-fade-in">
      <LongTermGoalsSection />
      <WeeklyGoalsSection />
    </div>
  );
}
