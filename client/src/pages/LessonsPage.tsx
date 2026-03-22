import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { CheckCircle2, PlayCircle, Clock, BookOpen, Loader2, AlertCircle } from "lucide-react";
import { LESSONS } from "@/lib/constants";

interface ProgressItem {
  lessonSlug: string;
  status: string;
}

export default function LessonsPage() {
  const { data: progress, isLoading, error } = useQuery<ProgressItem[]>({
    queryKey: ["/api/progress"],
    queryFn: async () => {
      const res = await fetch("/api/progress", { credentials: "include" });
      if (!res.ok) throw new Error(`${res.status}: ${res.statusText}`);
      return res.json();
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
          <p className="text-muted-foreground">Failed to load lessons</p>
        </div>
      </div>
    );
  }

  const progressMap = new Map<string, string>();
  for (const p of progress || []) {
    progressMap.set(p.lessonSlug, p.status);
  }

  const completedCount = [...progressMap.values()].filter((s) => s === "completed").length;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-3xl font-bold text-white">My Lessons</h1>
        <p className="text-muted-foreground mt-1">
          {completedCount} of 12 lessons completed
        </p>
      </div>

      <div className="card-glass p-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-white font-medium">Overall Progress</span>
          <span className="text-sm text-brand-gold">{Math.round((completedCount / 12) * 100)}%</span>
        </div>
        <div className="h-2 rounded-full bg-brand-navy overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-brand-gold to-brand-gold-light transition-all duration-500"
            style={{ width: `${(completedCount / 12) * 100}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {LESSONS.map((lesson) => {
          const status = progressMap.get(lesson.slug) || "not_started";
          const isCompleted = status === "completed";
          const isInProgress = status === "in_progress";

          return (
            <Link
              key={lesson.slug}
              href={`/lessons/${lesson.slug}`}
              className={`group card-glass p-5 transition-all duration-300 hover:border-brand-gold/30
                ${isCompleted ? "border-brand-gold/20 bg-brand-gold/5" : ""}
                ${isInProgress ? "border-blue-500/20 bg-blue-500/5" : ""}
              `}
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`h-10 w-10 flex items-center justify-center rounded-lg font-bold font-display text-sm flex-shrink-0
                  ${isCompleted
                    ? "bg-brand-gold/20 border border-brand-gold/40 text-brand-gold"
                    : isInProgress
                    ? "bg-blue-500/20 border border-blue-500/40 text-blue-400"
                    : "bg-secondary border border-border text-muted-foreground"
                  }`}
                >
                  {isCompleted ? <CheckCircle2 className="h-5 w-5" /> : lesson.number}
                </div>
                <div className="flex items-center gap-1.5">
                  {isCompleted && <span className="text-xs text-brand-gold font-medium">Complete</span>}
                  {isInProgress && <span className="text-xs text-blue-400 font-medium">In Progress</span>}
                  {!isCompleted && !isInProgress && (
                    <span className="text-xs text-muted-foreground">Not started</span>
                  )}
                </div>
              </div>

              <h3 className="font-semibold text-white group-hover:text-brand-gold-light transition-colors leading-snug mb-1">
                {lesson.title}
              </h3>
              <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                {lesson.subtitle}
              </p>

              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {lesson.estimatedMinutes} min
                </span>
                {lesson.hasAudio && (
                  <span className="flex items-center gap-1 text-brand-gold/60">
                    <PlayCircle className="h-3 w-3" />
                    Audio
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <BookOpen className="h-3 w-3" />
                  PDF
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
