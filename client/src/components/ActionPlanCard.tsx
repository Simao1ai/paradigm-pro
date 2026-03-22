import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Sparkles, CheckSquare, Square, Clock, Loader2, RefreshCw, ChevronDown, ChevronUp,
} from "lucide-react";

interface Step {
  title: string;
  description: string;
  deadline_suggestion: string;
}

interface ActionPlanCardProps {
  lessonId: string;
  lessonTitle: string;
  lessonContent: string;
}

export default function ActionPlanCard({ lessonId, lessonTitle, lessonContent }: ActionPlanCardProps) {
  const [checked, setChecked] = useState<Record<number, boolean>>({});
  const [expanded, setExpanded] = useState(true);

  const { data: existing, refetch } = useQuery<{ plan: { steps: Step[] } | null }>({
    queryKey: ["/api/ai/action-plan", lessonId],
    queryFn: async () => {
      const res = await fetch(`/api/ai/action-plan/${lessonId}`, { credentials: "include" });
      if (!res.ok) return { plan: null };
      return res.json();
    },
  });

  const generateMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/ai/action-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ lessonId, lessonTitle, lessonContent }),
      });
      if (!res.ok) throw new Error("Failed to generate action plan");
      return res.json();
    },
    onSuccess: () => {
      refetch();
      setChecked({});
      setExpanded(true);
    },
  });

  const steps: Step[] = existing?.plan?.steps as Step[] || [];
  const hasSteps = steps.length > 0;
  const completedCount = Object.values(checked).filter(Boolean).length;
  const allDone = hasSteps && completedCount === steps.length;

  return (
    <div className="card-glass overflow-hidden border-l-4 border-l-orange-500">
      {/* Header */}
      <div className="flex items-center justify-between p-5 pb-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-orange-500 to-pink-600 flex items-center justify-center flex-shrink-0">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-white text-sm">My Action Plan</h3>
            {hasSteps && (
              <p className="text-[11px] text-muted-foreground">
                {completedCount}/{steps.length} completed
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {hasSteps && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="p-1.5 text-muted-foreground hover:text-white transition-colors"
            >
              {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
          )}
          <button
            onClick={() => generateMutation.mutate()}
            disabled={generateMutation.isPending}
            className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-semibold transition-all ${
              hasSteps
                ? "text-muted-foreground hover:text-white border border-border hover:border-white/30"
                : "btn-gold"
            } disabled:opacity-60`}
          >
            {generateMutation.isPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : hasSteps ? (
              <RefreshCw className="h-3.5 w-3.5" />
            ) : (
              <Sparkles className="h-3.5 w-3.5" />
            )}
            {hasSteps ? "Regenerate" : "Generate My Action Plan"}
          </button>
        </div>
      </div>

      {/* Error */}
      {generateMutation.isError && (
        <p className="px-5 pb-3 text-xs text-red-400">Failed to generate — please try again.</p>
      )}

      {/* Steps */}
      {hasSteps && expanded && (
        <div className="px-5 pb-5 space-y-3">
          {/* Progress bar */}
          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden mb-4">
            <div
              className="h-full bg-gradient-to-r from-orange-500 to-pink-500 rounded-full transition-all duration-500"
              style={{ width: `${(completedCount / steps.length) * 100}%` }}
            />
          </div>

          {steps.map((step, i) => {
            const done = checked[i] ?? false;
            return (
              <div
                key={i}
                onClick={() => setChecked((prev) => ({ ...prev, [i]: !prev[i] }))}
                className={`flex gap-3 p-4 rounded-xl border cursor-pointer transition-all select-none ${
                  done
                    ? "bg-emerald-500/10 border-emerald-500/30"
                    : "bg-white/5 border-white/10 hover:border-orange-500/30 hover:bg-white/8"
                }`}
              >
                <div className="flex-shrink-0 mt-0.5">
                  {done
                    ? <CheckSquare className="h-5 w-5 text-emerald-400" />
                    : <Square className="h-5 w-5 text-muted-foreground" />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold leading-tight mb-1 ${done ? "line-through text-muted-foreground" : "text-white"}`}>
                    {step.title}
                  </p>
                  <p className={`text-xs leading-relaxed ${done ? "text-muted-foreground line-through" : "text-muted-foreground"}`}>
                    {step.description}
                  </p>
                  <div className="flex items-center gap-1 mt-2">
                    <Clock className="h-3 w-3 text-orange-400 flex-shrink-0" />
                    <span className="text-[11px] text-orange-400 font-medium">{step.deadline_suggestion}</span>
                  </div>
                </div>
              </div>
            );
          })}

          {allDone && (
            <div className="text-center py-3">
              <p className="text-emerald-400 font-bold text-sm">All steps complete! Great work. 🎉</p>
            </div>
          )}
        </div>
      )}

      {/* Empty state */}
      {!hasSteps && !generateMutation.isPending && (
        <p className="px-5 pb-5 text-xs text-muted-foreground leading-relaxed">
          Let your AI coach analyze this lesson and generate a personalized action plan tailored to your transformation journey.
        </p>
      )}

      {generateMutation.isPending && (
        <div className="flex items-center gap-2 px-5 pb-5 text-xs text-muted-foreground">
          <Loader2 className="h-3.5 w-3.5 animate-spin text-orange-400" />
          Generating your personalized action plan...
        </div>
      )}
    </div>
  );
}
