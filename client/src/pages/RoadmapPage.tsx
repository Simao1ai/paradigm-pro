import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Circle, Loader2, AlertCircle } from "lucide-react";
import { ROADMAP_DAYS } from "@/lib/constants";

interface RoadmapDay {
  day: number;
  title: string;
  description: string;
  completed: boolean;
  reflection?: string | null;
}

export default function RoadmapPage() {
  const queryClient = useQueryClient();
  const [activeDay, setActiveDay] = useState<number | null>(null);
  const [reflection, setReflection] = useState("");

  const { data: roadmapData, isLoading, error } = useQuery<RoadmapDay[]>({
    queryKey: ["/api/roadmap"],
    queryFn: async () => {
      const res = await fetch("/api/roadmap", { credentials: "include" });
      if (!res.ok) throw new Error(`${res.status}: ${res.statusText}`);
      return res.json();
    },
  });

  const completeMutation = useMutation({
    mutationFn: async (dayNumber: number) => {
      const res = await fetch(`/api/roadmap/${dayNumber}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ completed: true, reflection }),
      });
      if (!res.ok) throw new Error("Failed to complete day");
      return res.json();
    },
    onSuccess: () => {
      setActiveDay(null);
      setReflection("");
      queryClient.invalidateQueries({ queryKey: ["/api/roadmap"] });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 text-brand-gold animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 text-red-400 mx-auto mb-3" />
          <p className="text-muted-foreground">Failed to load roadmap</p>
        </div>
      </div>
    );
  }

  const days = roadmapData || ROADMAP_DAYS.map((d) => ({ ...d, completed: false, reflection: null }));
  const completedCount = days.filter((d) => d.completed).length;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-3xl font-bold text-white">9-Day Achievement Roadmap</h1>
        <p className="text-muted-foreground mt-1">
          {completedCount} of 9 days completed — your daily action plan for transformation
        </p>
      </div>

      <div className="card-glass p-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-white">Roadmap Progress</span>
          <span className="text-sm text-brand-gold">{Math.round((completedCount / 9) * 100)}%</span>
        </div>
        <div className="h-2 rounded-full bg-brand-navy overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-brand-gold to-brand-gold-light transition-all duration-500"
            style={{ width: `${(completedCount / 9) * 100}%` }}
          />
        </div>
        {completedCount === 9 && (
          <p className="text-brand-gold text-sm font-semibold mt-2">
            Roadmap Champion! You completed the full 9-day roadmap.
          </p>
        )}
      </div>

      <div className="space-y-3">
        {days.map((day, index) => {
          const isCompleted = day.completed;
          const isActive = activeDay === day.day;
          const prevCompleted = index === 0 || days[index - 1]?.completed;
          const isUnlocked = isCompleted || prevCompleted;

          return (
            <div
              key={day.day}
              className={`card-glass transition-all
                ${isCompleted ? "border-brand-gold/20 bg-brand-gold/5" : ""}
                ${!isUnlocked ? "opacity-50" : ""}
              `}
            >
              <div className="p-5">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-0.5">
                    {isCompleted ? (
                      <CheckCircle2 className="h-6 w-6 text-brand-gold" />
                    ) : (
                      <Circle className="h-6 w-6 text-muted-foreground" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold text-brand-gold uppercase tracking-wide">
                        Day {day.day}
                      </span>
                      {isCompleted && (
                        <span className="text-xs text-muted-foreground">Complete</span>
                      )}
                    </div>
                    <h3 className="font-semibold text-white">{day.title}</h3>
                    {day.description && (
                      <p className="text-sm text-muted-foreground mt-0.5">{day.description}</p>
                    )}

                    {isCompleted && day.reflection && (
                      <div className="mt-3 text-sm text-muted-foreground bg-brand-navy/50 rounded-lg p-3 border-l-2 border-brand-gold/30">
                        <p className="italic">&ldquo;{day.reflection}&rdquo;</p>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {!isCompleted && isUnlocked && (
                      <button
                        onClick={() => setActiveDay(isActive ? null : day.day)}
                        className="text-xs btn-gold rounded-lg px-3 py-1.5"
                      >
                        {isActive ? "Cancel" : "Complete Day"}
                      </button>
                    )}
                  </div>
                </div>

                {isActive && (
                  <div className="mt-4 pt-4 border-t border-border space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Reflection (optional)
                      </label>
                      <textarea
                        value={reflection}
                        onChange={(e) => setReflection(e.target.value)}
                        placeholder="What did you learn or experience today?"
                        rows={3}
                        className="w-full rounded-xl bg-brand-navy/50 border border-border px-4 py-3 text-white placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand-gold/50 text-sm resize-none"
                      />
                    </div>
                    <button
                      onClick={() => completeMutation.mutate(day.day)}
                      disabled={completeMutation.isPending}
                      className="flex items-center gap-2 btn-gold rounded-xl px-5 py-2.5 text-sm font-semibold disabled:opacity-60"
                    >
                      {completeMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                      {completeMutation.isPending ? "Saving..." : "Mark Day Complete"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
