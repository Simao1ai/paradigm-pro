import { useQuery } from "@tanstack/react-query";
import { Lock, Loader2, AlertCircle } from "lucide-react";

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  badgeType: string;
  earned: boolean;
  earnedAt?: string;
}

interface AchievementsData {
  badges: Badge[];
  earnedCount: number;
  totalCount: number;
  currentStreak: number;
  longestStreak: number;
}

export default function AchievementsPage() {
  const { data, isLoading, error } = useQuery<AchievementsData>({
    queryKey: ["/api/badges"],
    queryFn: async () => {
      const res = await fetch("/api/badges", { credentials: "include" });
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
          <p className="text-muted-foreground">Failed to load achievements</p>
        </div>
      </div>
    );
  }

  const achievements = data!;
  const typeLabels: Record<string, string> = {
    lesson: "Lesson Badges",
    streak: "Streak Badges",
    roadmap: "Roadmap Badges",
    program: "Program Badges",
    engagement: "Engagement Badges",
  };

  const grouped: Record<string, Badge[]> = {};
  for (const badge of achievements.badges || []) {
    if (!grouped[badge.badgeType]) grouped[badge.badgeType] = [];
    grouped[badge.badgeType].push(badge);
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="font-display text-3xl font-bold text-white">Achievements</h1>
        <p className="text-muted-foreground mt-1">
          {achievements.earnedCount} of {achievements.totalCount} badges earned
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Badges Earned", value: achievements.earnedCount, icon: "🏆" },
          { label: "Total Badges", value: achievements.totalCount, icon: "🎯" },
          { label: "Current Streak", value: `${achievements.currentStreak} days`, icon: "🔥" },
          { label: "Longest Streak", value: `${achievements.longestStreak} days`, icon: "💎" },
        ].map((s) => (
          <div key={s.label} className="card-glass p-4 text-center">
            <div className="text-2xl mb-1">{s.icon}</div>
            <div className="text-2xl font-bold text-white font-display">{s.value}</div>
            <div className="text-xs text-muted-foreground">{s.label}</div>
          </div>
        ))}
      </div>

      {Object.entries(grouped).map(([type, badges]) => (
        <div key={type}>
          <h2 className="font-display text-xl font-semibold text-white mb-4">
            {typeLabels[type] || type}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {badges.map((badge) => (
              <div
                key={badge.id}
                className={`card-glass p-4 text-center transition-all
                  ${badge.earned ? "border-brand-gold/30 bg-brand-gold/5" : "opacity-50"}
                `}
              >
                <div className={`text-4xl mb-3 ${!badge.earned ? "grayscale" : ""}`}>
                  {badge.icon}
                </div>
                <h3 className={`text-sm font-semibold mb-1 ${badge.earned ? "text-white" : "text-muted-foreground"}`}>
                  {badge.name}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {badge.description}
                </p>
                {!badge.earned && (
                  <div className="mt-2 flex items-center justify-center gap-1 text-xs text-muted-foreground/60">
                    <Lock className="h-3 w-3" />
                    Locked
                  </div>
                )}
                {badge.earned && badge.earnedAt && (
                  <p className="text-xs text-brand-gold mt-2">
                    {new Date(badge.earnedAt).toLocaleDateString()}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
