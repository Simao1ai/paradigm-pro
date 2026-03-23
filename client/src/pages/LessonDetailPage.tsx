import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useRoute } from "wouter";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Loader2,
  AlertCircle,
  BookOpen,
  Save,
  Lightbulb,
  Brain,
  Trophy,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { LESSONS } from "@/lib/constants";
import CoachingChat from "@/components/CoachingChat";
import ActionPlanCard from "@/components/ActionPlanCard";
import QuizModal from "@/components/QuizModal";
import ForumSection from "@/components/ForumSection";

interface LessonData {
  id: string;
  lessonNumber: number;
  title: string;
  slug: string;
  subtitle: string;
  description: string;
  keyPrinciple: string;
  estimatedMinutes: number;
  hasAudio: boolean;
}

interface NoteData {
  id?: string;
  content: string;
}

interface ProgressData {
  status: string;
}

export default function LessonDetailPage() {
  const [, params] = useRoute("/lessons/:slug");
  const slug = params?.slug || "";
  const queryClient = useQueryClient();

  const [noteContent, setNoteContent] = useState("");
  const [noteLoaded, setNoteLoaded] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [showQuizHistory, setShowQuizHistory] = useState(false);

  const currentIndex = LESSONS.findIndex((l) => l.slug === slug);
  const prevLesson = currentIndex > 0 ? LESSONS[currentIndex - 1] : null;
  const nextLesson = currentIndex < LESSONS.length - 1 ? LESSONS[currentIndex + 1] : null;
  const lessonMeta = LESSONS.find((l) => l.slug === slug);

  const { data: lesson, isLoading, error } = useQuery<LessonData>({
    queryKey: ["/api/lessons", slug],
    queryFn: async () => {
      const res = await fetch(`/api/lessons/${slug}`, { credentials: "include" });
      if (!res.ok) throw new Error(`${res.status}: ${res.statusText}`);
      return res.json();
    },
    enabled: !!slug,
  });

  const { data: note } = useQuery<NoteData | null>({
    queryKey: ["/api/notes", slug],
    queryFn: async () => {
      const res = await fetch(`/api/notes?lessonSlug=${slug}`, { credentials: "include" });
      if (!res.ok) return null;
      const data = await res.json();
      return data;
    },
    enabled: !!slug,
  });

  const { data: progress } = useQuery<ProgressData | null>({
    queryKey: ["/api/progress", slug],
    queryFn: async () => {
      const res = await fetch(`/api/progress/${slug}`, { credentials: "include" });
      if (!res.ok) return null;
      return res.json();
    },
    enabled: !!slug,
  });

  const { data: latestQuizData, refetch: refetchQuiz } = useQuery<{ result: any | null }>({
    queryKey: ["/api/ai/quiz-result", lesson?.id],
    queryFn: async () => {
      if (!lesson?.id) return { result: null };
      const res = await fetch(`/api/ai/quiz-result/${lesson.id}`, { credentials: "include" });
      if (!res.ok) return { result: null };
      return res.json();
    },
    enabled: !!lesson?.id,
  });

  if (note && !noteLoaded) {
    setNoteContent(note.content || "");
    setNoteLoaded(true);
  }

  const saveNoteMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ lessonSlug: slug, content: noteContent }),
      });
      if (!res.ok) throw new Error("Failed to save note");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notes", slug] });
    },
  });

  const markCompleteMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ lessonSlug: slug, status: "completed" }),
      });
      if (!res.ok) throw new Error("Failed to mark complete");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/progress"] });
      queryClient.invalidateQueries({ queryKey: ["/api/progress", slug] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
    },
  });

  const isCompleted = progress?.status === "completed";

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 text-brand-gold animate-spin" />
      </div>
    );
  }

  // Only show "not found" if the slug isn't recognized at all
  if (!lessonMeta) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 text-red-400 mx-auto mb-3" />
          <p className="text-muted-foreground mb-4">Lesson not found</p>
          <Link href="/lessons" className="text-brand-gold hover:text-brand-gold-light text-sm">
            Back to lessons
          </Link>
        </div>
      </div>
    );
  }

  const displayLesson = lesson || {
    title: lessonMeta.title,
    subtitle: lessonMeta.subtitle,
    description: lessonMeta.description,
    keyPrinciple: lessonMeta.keyPrinciple,
    estimatedMinutes: lessonMeta.estimatedMinutes,
    lessonNumber: lessonMeta.number,
    hasAudio: lessonMeta.hasAudio,
  };

  const lessonContentStr = [
    `Lesson ${displayLesson.lessonNumber}: ${displayLesson.title}`,
    displayLesson.subtitle ? `Subtitle: ${displayLesson.subtitle}` : "",
    displayLesson.description ? `\nDescription:\n${displayLesson.description}` : "",
    displayLesson.keyPrinciple ? `\nKey Principle:\n"${displayLesson.keyPrinciple}"` : "",
  ].filter(Boolean).join("\n");

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      <div className="flex items-center gap-3">
        <Link href="/lessons" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-brand-gold transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Back to Lessons
        </Link>
      </div>

      <div className="card-glass p-6">
        <div className="flex items-start gap-4 mb-4">
          <div className={`flex-shrink-0 h-12 w-12 flex items-center justify-center rounded-xl font-bold font-display text-lg
            ${isCompleted
              ? "bg-brand-gold/20 border border-brand-gold/40 text-brand-gold"
              : "bg-brand-gold/15 border border-brand-gold/30 text-brand-gold"
            }`}
          >
            {isCompleted ? <CheckCircle2 className="h-6 w-6" /> : displayLesson.lessonNumber}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold text-brand-gold uppercase tracking-wide">
                Lesson {displayLesson.lessonNumber}
              </span>
              {isCompleted && (
                <span className="text-xs bg-brand-gold/20 text-brand-gold border border-brand-gold/30 px-2 py-0.5 rounded-full">
                  Completed
                </span>
              )}
            </div>
            <h1 className="font-display text-2xl md:text-3xl font-bold text-white">{displayLesson.title}</h1>
            <p className="text-muted-foreground mt-1">{displayLesson.subtitle}</p>
          </div>
        </div>

        <p className="text-muted-foreground leading-relaxed">{displayLesson.description}</p>

        <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <BookOpen className="h-4 w-4" />
            {displayLesson.estimatedMinutes} min
          </span>
        </div>
      </div>

      <div className="card-glass p-6 border-brand-gold/20">
        <div className="flex items-start gap-3">
          <Lightbulb className="h-5 w-5 text-brand-gold flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs text-brand-gold font-semibold uppercase tracking-wide mb-1">Key Principle</p>
            <p className="text-white italic leading-relaxed">&ldquo;{displayLesson.keyPrinciple}&rdquo;</p>
          </div>
        </div>
      </div>

      {!isCompleted && (
        <button
          onClick={() => markCompleteMutation.mutate()}
          disabled={markCompleteMutation.isPending}
          className="btn-gold rounded-xl px-6 py-3 text-sm font-semibold flex items-center gap-2 disabled:opacity-60"
        >
          {markCompleteMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <CheckCircle2 className="h-4 w-4" />
          )}
          Mark Lesson Complete
        </button>
      )}

      <div className="card-glass p-6">
        <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-brand-gold" />
          My Notes
        </h3>
        <textarea
          value={noteContent}
          onChange={(e) => setNoteContent(e.target.value)}
          placeholder="Write your notes, insights, and reflections for this lesson..."
          rows={6}
          className="w-full rounded-xl bg-brand-navy/50 border border-border px-4 py-3 text-white placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand-gold/50 text-sm resize-none"
        />
        <div className="flex items-center justify-between mt-3">
          <p className="text-xs text-muted-foreground">
            {saveNoteMutation.isSuccess ? "Saved!" : ""}
          </p>
          <button
            onClick={() => saveNoteMutation.mutate()}
            disabled={saveNoteMutation.isPending}
            className="flex items-center gap-2 btn-gold rounded-xl px-5 py-2 text-sm font-semibold disabled:opacity-60"
          >
            {saveNoteMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Notes
          </button>
        </div>
      </div>

      {/* Action Plan */}
      {lesson?.id && (
        <ActionPlanCard
          lessonId={lesson.id}
          lessonTitle={displayLesson.title}
          lessonContent={lessonContentStr}
        />
      )}

      {/* Quiz */}
      {lesson?.id && (() => {
        const lastResult = latestQuizData?.result;
        const lastPct = lastResult
          ? Math.round((lastResult.score / lastResult.total_questions) * 100)
          : null;
        return (
          <div className="card-glass overflow-hidden border-l-4 border-l-indigo-500">
            <div className="p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center flex-shrink-0">
                  <Brain className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">Test Your Knowledge</p>
                  {lastResult ? (
                    <div className="flex items-center gap-2 mt-0.5">
                      <Trophy className="h-3.5 w-3.5 text-yellow-400" />
                      <span className={`text-xs font-semibold ${
                        lastPct! >= 80 ? "text-emerald-400" : lastPct! >= 60 ? "text-yellow-400" : "text-red-400"
                      }`}>
                        Last score: {lastResult.score}/{lastResult.total_questions} ({lastPct}%)
                      </span>
                      <button
                        onClick={() => setShowQuizHistory(!showQuizHistory)}
                        className="text-xs text-muted-foreground hover:text-white flex items-center gap-0.5 transition-colors"
                      >
                        {showQuizHistory ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                      </button>
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">5 AI-generated questions — no score yet</p>
                  )}
                </div>
              </div>
              <button
                onClick={() => setShowQuiz(true)}
                className="text-sm font-semibold px-4 py-2 rounded-xl border border-indigo-500/50 text-indigo-300 hover:bg-indigo-500/10 hover:text-white hover:border-indigo-400 transition-all flex-shrink-0"
              >
                {lastResult ? "Retake Quiz" : "Start Quiz"}
              </button>
            </div>

            {showQuizHistory && lastResult && (
              <div className="px-5 pb-5 border-t border-white/10 pt-4 space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Last Quiz Result</p>
                <div className="flex items-center gap-4 p-3 rounded-xl bg-white/5 border border-white/10">
                  <div className={`text-2xl font-bold ${
                    lastPct! >= 80 ? "text-emerald-400" : lastPct! >= 60 ? "text-yellow-400" : "text-red-400"
                  }`}>
                    {lastPct}%
                  </div>
                  <div>
                    <p className="text-white text-sm font-semibold">
                      {lastResult.score} / {lastResult.total_questions} correct
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {lastResult.lesson_title} · {new Date(lastResult.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="ml-auto">
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                      lastPct! >= 80
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        : lastPct! >= 60
                        ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                        : "bg-red-500/20 text-red-400 border border-red-500/30"
                    }`}>
                      {lastPct! >= 80 ? "Excellent" : lastPct! >= 60 ? "Good" : "Keep Practicing"}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })()}

      {showQuiz && lesson?.id && (
        <QuizModal
          lessonId={lesson.id}
          lessonTitle={displayLesson.title}
          lessonContent={lessonContentStr}
          onClose={() => {
            setShowQuiz(false);
            refetchQuiz();
          }}
        />
      )}

      <div className="flex items-center justify-between pt-4">
        {prevLesson ? (
          <Link
            href={`/lessons/${prevLesson.slug}`}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-brand-gold transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            {prevLesson.title}
          </Link>
        ) : (
          <div />
        )}
        {nextLesson ? (
          <Link
            href={`/lessons/${nextLesson.slug}`}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-brand-gold transition-colors"
          >
            {nextLesson.title}
            <ArrowRight className="h-4 w-4" />
          </Link>
        ) : (
          <div />
        )}
      </div>

      {/* Discussion Forum */}
      {lesson?.id && (
        <div className="mt-8 card-glass p-5">
          <ForumSection lessonId={lesson.id} />
        </div>
      )}

      {lesson?.id && (
        <CoachingChat
          lessonId={lesson.id}
          lessonTitle={displayLesson.title}
          lessonContent={lessonContentStr}
        />
      )}
    </div>
  );
}
