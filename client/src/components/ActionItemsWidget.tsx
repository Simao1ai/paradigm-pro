import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import confetti from "canvas-confetti";
import { CheckCircle2, Circle, ListChecks, Loader2, Plus } from "lucide-react";

interface ActionItem {
  id: string;
  title: string;
  description: string | null;
  lessonId: string | null;
  goalId: string | null;
  completed: boolean;
  createdAt: string;
}

export default function ActionItemsWidget({ limit = 5 }: { limit?: number }) {
  const queryClient = useQueryClient();

  const { data: items, isLoading } = useQuery<ActionItem[]>({
    queryKey: ["/api/action-items"],
    queryFn: async () => {
      const r = await fetch("/api/action-items", { credentials: "include" });
      if (!r.ok) return [];
      return r.json();
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, completed }: { id: string; completed: boolean }) => {
      const r = await fetch(`/api/action-items/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ completed }),
      });
      return r.json();
    },
    onSuccess: (_, vars) => {
      if (vars.completed) {
        confetti({ particleCount: 60, spread: 60, origin: { y: 0.7 }, colors: ["#f97316", "#c9a84c"] });
      }
      queryClient.invalidateQueries({ queryKey: ["/api/action-items"] });
    },
  });

  const pending = (items || []).filter((i) => !i.completed);
  const shown = pending.slice(0, limit);

  if (isLoading) {
    return (
      <div className="card-glass p-5">
        <div className="flex items-center gap-2 mb-3">
          <ListChecks className="h-4 w-4 text-brand-gold" />
          <h3 className="font-semibold text-white text-sm">Action Items</h3>
        </div>
        <div className="flex justify-center py-4"><Loader2 className="h-5 w-5 text-brand-gold animate-spin" /></div>
      </div>
    );
  }

  if (shown.length === 0) return null;

  return (
    <div className="card-glass p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <ListChecks className="h-4 w-4 text-brand-gold" />
          <h3 className="font-semibold text-white text-sm">Action Items</h3>
          {pending.length > 0 && (
            <span className="bg-orange-500/20 text-orange-300 text-[10px] font-bold px-2 py-0.5 rounded-full">{pending.length}</span>
          )}
        </div>
      </div>

      <div className="space-y-2">
        {shown.map((item) => (
          <div key={item.id} className="flex items-start gap-3">
            <button
              onClick={() => toggleMutation.mutate({ id: item.id, completed: !item.completed })}
              className="mt-0.5 flex-shrink-0"
              disabled={toggleMutation.isPending}
            >
              {item.completed
                ? <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                : <Circle className="h-5 w-5 text-indigo-500 hover:text-brand-gold transition-colors" />
              }
            </button>
            <div className="min-w-0 flex-1">
              <p className={`text-sm leading-snug ${item.completed ? "line-through text-indigo-500" : "text-white"}`}>
                {item.title}
              </p>
              {item.description && !item.completed && (
                <p className="text-xs text-indigo-400 mt-0.5 line-clamp-1">{item.description}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {pending.length > limit && (
        <p className="text-xs text-indigo-400 mt-3">+{pending.length - limit} more pending</p>
      )}
    </div>
  );
}
