import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import {
  BookOpen, Flame, Target, Award, ArrowRight, Calendar, Star,
  Loader2, AlertCircle, Brain, CheckCircle2, Sparkles,
} from "lucide-react";
import { LESSONS } from "@/lib/constants";
import ActionItemsWidget from "@/components/ActionItemsWidget";

interface LongTermGoal {
  id: string;
  title: string;
  status: string;
  targetDate: string | null;
}

interface ActionItem {
  id: string;
  title: string;
  completed: boolean;
}

interface DashboardData {
  affirmation?: { content: string; author: string } | null;
  lessonsCompleted: number;
  currentStreak: number;
  badgeCount: number;
  progressPercent: number;
  completedLessonNumbers: number[];
  nextLesson?: { number: number; title: string; slug: string; subtitle: string; estimatedMinutes: number } | null;
  upcomingSession?: { scheduledAt: string; zoomMeetingUrl?: string } | null;
  checkInToday: boolean;
  checkInStreak: number;
  coachInsight?: string | null;
  activeGoals: LongTermGoal[];
  pendingActionItems: ActionItem[];
}

export default function DashboardPage() {
  const { data, isLoading, error } = useQuery<DashboardData>({
    queryKey: ["/api/dashboard"],
    queryFn: async () => {
      const res = await fetch("/api/dashboard", { credentials: "include" });
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
          <p className="text-muted-foreground">Failed to load dashboard</p>
        </div>
      </div>
    );
  }

  const dashboard = data!;
  const completedNumbers = new Set(dashboard.completedLessonNumbers || []);

  return (
    <div className="space-y-6 animate-fade-in">
      {dashboard.affirmation && (
        <div className="rounded-xl border border-brand-gold/20 bg-brand-gold/5 p-5">
          <div className="flex items-start gap-3">
            <Star className="h-5 w-5 text-brand-gold flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs text-brand-gold font-semibold uppercase tracking-wide mb-1">
                Today&apos;s Affirmation
              </p>
              <p className="text-white italic leading-relaxed">&ldquo;{dashboard.affirmation.content}&rdquo;</p>
              <p className="text-xs text-muted-foreground mt-1">— {dashboard.affirmation.author}</p>
            </div>
          </div>
        </div>
      )}

      {/* ── Today's Check-In Prompt ───────────────────────────────────── */}
      {!dashboard.checkInToday && (
        <Link href="/check-in">
          <a className="block rounded-xl border border-orange-500/40 bg-gradient-to-r from-orange-500/10 to-brand-gold/10 p-4 hover:border-orange-500/60 transition-all group">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-orange-500/20 flex items-center justify-center flex-shrink-0">
                <span className="text-xl">🔥</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold text-sm">Daily Check-In</p>
                <p className="text-orange-300 text-xs mt-0.5">Take 2 minutes to reflect and get your AI insight</p>
              </div>
              <ArrowRight className="h-4 w-4 text-orange-400 flex-shrink-0 group-hover:translate-x-1 transition-transform" />
            </div>
          </a>
        </Link>
      )}

      {/* ── AI Coach Insight ───────────────────────────────────────────── */}
      {dashboard.coachInsight && (
        <div className="rounded-xl border border-brand-gold/20 bg-brand-gold/5 p-4">
          <div className="flex items-start gap-3">
            <Brain className="h-5 w-5 text-brand-gold flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs text-brand-gold font-semibold uppercase tracking-wide mb-1">Your AI Coach Says</p>
              <p className="text-white text-sm leading-relaxed italic">{dashboard.coachInsight}</p>
            </div>
          </div>
        </div>
      )}

      {/* ── Streak + Check-In Done Banner ─────────────────────────────── */}
      {dashboard.checkInToday && dashboard.checkInStreak > 0 && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 px-4 py-2.5">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <span className="text-emerald-300 text-sm font-medium">Checked in today!</span>
          <span className="ml-auto flex items-center gap-1 text-orange-300 font-bold text-sm">
            <Flame className="h-4 w-4" /> {dashboard.checkInStreak}-day streak
          </span>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Lessons Complete", value: `${dashboard.lessonsCompleted}/12`, icon: BookOpen, color: "text-blue-400", bg: "bg-blue-500/10" },
          { label: "Day Streak", value: dashboard.currentStreak, icon: Flame, color: "text-orange-400", bg: "bg-orange-500/10" },
          { label: "Badges Earned", value: dashboard.badgeCount, icon: Award, color: "text-brand-gold", bg: "bg-brand-gold/10" },
          { label: "Program Progress", value: `${dashboard.progressPercent}%`, icon: Target, color: "text-green-400", bg: "bg-green-500/10" },
        ].map((stat) => (
          <div key={stat.label} className="card-glass p-4">
            <div className={`h-9 w-9 rounded-lg ${stat.bg} flex items-center justify-center mb-3`}>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </div>
            <div className="text-2xl font-bold text-white font-display">{stat.value}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="card-glass p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-white">Program Progress</h3>
          <span className="text-sm text-brand-gold">{dashboard.lessonsCompleted} of 12 lessons</span>
        </div>
        <div className="h-2 rounded-full bg-brand-navy overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-brand-gold to-brand-gold-light transition-all duration-500"
            style={{ width: `${dashboard.progressPercent}%` }}
          />
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          {dashboard.lessonsCompleted === 12
            ? "Congratulations! You've completed the full program!"
            : `${12 - dashboard.lessonsCompleted} lessons remaining`}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card-glass p-5">
          <h3 className="font-semibold text-white mb-4">Continue Learning</h3>
          {dashboard.nextLesson ? (
            <Link
              href={`/lessons/${dashboard.nextLesson.slug}`}
              className="group flex items-start gap-4 rounded-xl border border-border hover:border-brand-gold/30 bg-secondary/30 p-4 transition-all"
            >
              <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-lg bg-brand-gold/15 border border-brand-gold/30 text-brand-gold font-bold font-display">
                {dashboard.nextLesson.number}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-white group-hover:text-brand-gold-light transition-colors truncate">
                  {dashboard.nextLesson.title}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">{dashboard.nextLesson.subtitle}</p>
                <p className="text-xs text-brand-gold/70 mt-1">{dashboard.nextLesson.estimatedMinutes} min</p>
              </div>
              <ArrowRight className="h-4 w-4 text-brand-gold flex-shrink-0 mt-1 group-hover:translate-x-1 transition-transform" />
            </Link>
          ) : (
            <p className="text-muted-foreground text-sm">All lessons complete! 🎉</p>
          )}

          <Link
            href="/lessons"
            className="flex items-center gap-2 mt-4 text-sm text-brand-gold hover:text-brand-gold-light transition-colors"
          >
            View all lessons <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="card-glass p-5">
          <h3 className="font-semibold text-white mb-4">Upcoming Session</h3>
          {dashboard.upcomingSession ? (
            <div className="rounded-xl border border-border bg-secondary/30 p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-9 w-9 rounded-lg bg-brand-gold/15 border border-brand-gold/30 flex items-center justify-center">
                  <Calendar className="h-4 w-4 text-brand-gold" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Consultant Session</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(dashboard.upcomingSession.scheduledAt).toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
              {dashboard.upcomingSession.zoomMeetingUrl && (
                <a
                  href={dashboard.upcomingSession.zoomMeetingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-gold w-full text-center rounded-lg py-2 text-sm block"
                >
                  Join Zoom Session
                </a>
              )}
            </div>
          ) : (
            <div className="text-center py-6">
              <Calendar className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No upcoming sessions</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Phase 4 Widgets ───────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Active Goals Mini-widget */}
        {dashboard.activeGoals.length > 0 && (
          <div className="card-glass p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-brand-gold" />
                <h3 className="font-semibold text-white text-sm">Active Goals</h3>
              </div>
              <Link href="/goals">
                <a className="text-xs text-brand-gold hover:underline">View all</a>
              </Link>
            </div>
            <div className="space-y-2">
              {dashboard.activeGoals.map((goal) => {
                const daysLeft = goal.targetDate
                  ? Math.max(0, Math.ceil((new Date(goal.targetDate).getTime() - Date.now()) / 86400000))
                  : null;
                return (
                  <div key={goal.id} className="flex items-center gap-2 rounded-lg bg-white/5 border border-indigo-800/30 px-3 py-2">
                    <Sparkles className="h-3.5 w-3.5 text-indigo-400 flex-shrink-0" />
                    <p className="text-sm text-white flex-1 truncate">{goal.title}</p>
                    {daysLeft !== null && (
                      <span className={`text-[10px] font-medium flex-shrink-0 ${daysLeft <= 7 ? "text-orange-400" : "text-indigo-400"}`}>
                        {daysLeft}d
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
            <Link href="/goals">
              <a className="block mt-3 text-xs text-center text-indigo-400 hover:text-white transition-colors">+ Add new goal</a>
            </Link>
          </div>
        )}

        {/* Action Items Widget */}
        <ActionItemsWidget limit={3} />
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-white">All Lessons</h3>
          <Link href="/lessons" className="text-sm text-brand-gold hover:text-brand-gold-light transition-colors">
            View all
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {LESSONS.slice(0, 6).map((lesson) => {
            const isCompleted = completedNumbers.has(lesson.number);
            return (
              <Link
                key={lesson.slug}
                href={`/lessons/${lesson.slug}`}
                className="group card-glass p-4 hover:border-brand-gold/30 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className={`flex-shrink-0 h-9 w-9 flex items-center justify-center rounded-lg text-sm font-bold font-display transition-colors
                    ${isCompleted
                      ? "bg-brand-gold/20 border border-brand-gold/40 text-brand-gold"
                      : "bg-secondary border border-border text-muted-foreground group-hover:border-brand-gold/30"
                    }`}
                  >
                    {isCompleted ? "✓" : lesson.number}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white truncate group-hover:text-brand-gold-light transition-colors">
                      {lesson.title}
                    </p>
                    <p className="text-xs text-muted-foreground">{lesson.estimatedMinutes} min</p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
