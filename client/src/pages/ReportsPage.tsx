import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { ArrowLeft, TrendingUp, BarChart3, Brain, Calendar, Loader2, AlertCircle } from "lucide-react";

interface WeeklyReport {
  id: string;
  weekStart: string;
  lessonsCompleted: number;
  checkInStreak: number;
  avgMood: string | null;
  moodTrend: string | null;
  aiSummary: string;
  aiRecommendation: string;
  createdAt: string;
}

const MOOD_LABELS: Record<string, string> = {
  "improving": "📈 Improving",
  "declining": "📉 Declining",
  "stable": "➡️ Stable",
};

export default function ReportsPage() {
  const { data: reports, isLoading, error } = useQuery<WeeklyReport[]>({
    queryKey: ["/api/reports"],
    queryFn: async () => {
      const r = await fetch("/api/reports", { credentials: "include" });
      if (!r.ok) throw new Error(`${r.status}`);
      return r.json();
    },
  });

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center gap-3 mb-2">
        <Link href="/dashboard">
          <a className="flex items-center gap-1.5 text-indigo-400 hover:text-white text-sm transition-colors">
            <ArrowLeft className="h-4 w-4" /> Dashboard
          </a>
        </Link>
        <span className="text-indigo-700">·</span>
        <span className="text-white font-semibold">Weekly Progress Reports</span>
      </div>

      {isLoading && (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 text-brand-gold animate-spin" />
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 text-red-400 py-8">
          <AlertCircle className="h-5 w-5" /> Failed to load reports.
        </div>
      )}

      {reports && reports.length === 0 && (
        <div className="card-glass p-10 text-center space-y-3">
          <BarChart3 className="h-12 w-12 text-indigo-600 mx-auto" />
          <h3 className="text-white font-semibold">No reports yet</h3>
          <p className="text-indigo-400 text-sm">Weekly AI reports are generated every Sunday. Keep checking in daily!</p>
          <Link href="/check-in">
            <a className="btn-gold rounded-xl px-6 py-2.5 text-sm font-semibold inline-block mt-2">Do Today's Check-In →</a>
          </Link>
        </div>
      )}

      {reports && reports.map((report) => {
        const weekDate = new Date(report.weekStart);
        const weekEnd = new Date(weekDate);
        weekEnd.setDate(weekEnd.getDate() + 6);
        const avgMoodNum = report.avgMood ? parseFloat(report.avgMood) : null;

        return (
          <div key={report.id} className="card-glass p-6 space-y-5">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Calendar className="h-4 w-4 text-brand-gold" />
                  <span className="text-sm text-brand-gold font-semibold">
                    Week of {weekDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    {" – "}
                    {weekEnd.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </span>
                </div>
              </div>
              {report.moodTrend && (
                <span className="text-xs bg-indigo-900/60 text-indigo-300 px-2.5 py-1 rounded-full">
                  {MOOD_LABELS[report.moodTrend] || report.moodTrend}
                </span>
              )}
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-indigo-900/40 rounded-xl p-3 text-center">
                <div className="text-2xl font-bold text-white">{report.lessonsCompleted}</div>
                <div className="text-[11px] text-indigo-400 mt-0.5">Lessons Done</div>
              </div>
              <div className="bg-indigo-900/40 rounded-xl p-3 text-center">
                <div className="text-2xl font-bold text-orange-400">{report.checkInStreak}</div>
                <div className="text-[11px] text-indigo-400 mt-0.5">Check-in Streak</div>
              </div>
              <div className="bg-indigo-900/40 rounded-xl p-3 text-center">
                <div className="text-2xl font-bold text-white">
                  {avgMoodNum ? avgMoodNum.toFixed(1) : "—"}<span className="text-sm text-indigo-400">/5</span>
                </div>
                <div className="text-[11px] text-indigo-400 mt-0.5">Avg Mood</div>
              </div>
            </div>

            {/* AI Summary */}
            {report.aiSummary && (
              <div className="border-l-4 border-brand-gold bg-brand-gold/5 rounded-r-xl p-4">
                <div className="flex items-center gap-1.5 mb-2">
                  <Brain className="h-4 w-4 text-brand-gold" />
                  <span className="text-xs text-brand-gold font-semibold uppercase tracking-wide">AI Summary</span>
                </div>
                <p className="text-indigo-100 text-sm leading-relaxed">{report.aiSummary}</p>
              </div>
            )}

            {/* AI Recommendation */}
            {report.aiRecommendation && (
              <div className="border-l-4 border-orange-500 bg-orange-500/5 rounded-r-xl p-4">
                <div className="flex items-center gap-1.5 mb-2">
                  <TrendingUp className="h-4 w-4 text-orange-400" />
                  <span className="text-xs text-orange-400 font-semibold uppercase tracking-wide">Recommendation for Next Week</span>
                </div>
                <p className="text-indigo-100 text-sm leading-relaxed">{report.aiRecommendation}</p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
