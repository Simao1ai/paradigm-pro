import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { ArrowLeft, Trophy, Medal, Star, Crown, Loader2, Users } from "lucide-react";

type Period = "alltime" | "month" | "week";

interface LeaderEntry {
  id: string;
  fullName: string;
  avatarUrl: string | null;
  points: number;
  level: number;
  badgeCount?: number;
}

const MEDALS: Record<number, { icon: typeof Trophy; color: string; bg: string }> = {
  1: { icon: Crown, color: "text-yellow-400", bg: "bg-yellow-500/10 border border-yellow-500/30" },
  2: { icon: Medal, color: "text-slate-300", bg: "bg-slate-400/10 border border-slate-400/30" },
  3: { icon: Medal, color: "text-amber-600", bg: "bg-amber-600/10 border border-amber-600/30" },
};

function Avatar({ name, src, size = "md" }: { name: string; src?: string | null; size?: "sm" | "md" | "lg" }) {
  const cls = size === "lg" ? "h-14 w-14 text-xl" : size === "md" ? "h-9 w-9 text-sm" : "h-7 w-7 text-xs";
  if (src) return <img src={src} alt={name} className={`${cls} rounded-full object-cover flex-shrink-0 ring-2 ring-indigo-700`} />;
  return (
    <div className={`${cls} rounded-full bg-indigo-700 flex items-center justify-center text-white font-bold flex-shrink-0`}>
      {name?.[0]?.toUpperCase() || "?"}
    </div>
  );
}

function LevelBadge({ level }: { level: number }) {
  const pct = ((level - 1) % 1) * 100 || Math.min(100, (level / 10) * 100);
  return (
    <div className="flex items-center gap-1.5">
      <div className="relative h-7 w-7 flex-shrink-0">
        <svg viewBox="0 0 32 32" className="h-7 w-7">
          <defs>
            <linearGradient id={`level-grad-${level}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#f97316" />
            </linearGradient>
          </defs>
          <polygon points="16,2 30,10 30,22 16,30 2,22 2,10" fill={`url(#level-grad-${level})`} opacity="0.9" />
          <text x="16" y="20" textAnchor="middle" fontSize="11" fill="white" fontWeight="bold">{level}</text>
        </svg>
      </div>
      <span className="text-xs text-indigo-400">Lv.{level}</span>
    </div>
  );
}

export default function LeaderboardPage() {
  const { user } = useAuth();
  const [period, setPeriod] = useState<Period>("alltime");

  const { data: entries, isLoading } = useQuery<LeaderEntry[]>({
    queryKey: ["/api/community/leaderboard", period],
    queryFn: async () => {
      const r = await fetch(`/api/community/leaderboard?period=${period}&limit=50`, { credentials: "include" });
      return r.json();
    },
    refetchInterval: 60000,
  });

  const { data: myStats } = useQuery<{ points: number; level: number; rank: number }>({
    queryKey: ["/api/community/my-stats"],
    queryFn: async () => {
      const r = await fetch("/api/community/my-stats", { credentials: "include" });
      return r.json();
    },
  });

  const topThree = (entries || []).slice(0, 3);
  const rest = (entries || []).slice(3);
  const myEntry = (entries || []).find((e) => e.id === user?.id);
  const myRank = myEntry ? (entries || []).findIndex((e) => e.id === user?.id) + 1 : null;

  const tabs: { label: string; value: Period }[] = [
    { label: "All Time", value: "alltime" },
    { label: "This Month", value: "month" },
    { label: "This Week", value: "week" },
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <Link href="/community">
          <a className="flex items-center gap-1.5 text-indigo-400 hover:text-white text-sm transition-colors">
            <ArrowLeft className="h-4 w-4" /> Community
          </a>
        </Link>
        <span className="text-indigo-700">·</span>
        <span className="text-white font-semibold">Leaderboard</span>
      </div>

      {/* My rank strip */}
      {myStats && (
        <div className="flex items-center gap-3 card-glass px-4 py-3">
          <Trophy className="h-4 w-4 text-brand-gold" />
          <span className="text-sm text-indigo-300">Your rank:</span>
          <span className="font-bold text-white">#{myRank || "—"}</span>
          <span className="text-indigo-500">·</span>
          <span className="text-sm text-brand-gold font-bold">{myStats.points.toLocaleString()} pts</span>
          <span className="text-indigo-500">·</span>
          <LevelBadge level={myStats.level} />
        </div>
      )}

      {/* Period tabs */}
      <div className="flex gap-1 p-1 bg-indigo-900/60 rounded-xl">
        {tabs.map((t) => (
          <button
            key={t.value}
            onClick={() => setPeriod(t.value)}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors ${
              period === t.value ? "bg-indigo-700 text-white" : "text-indigo-400 hover:text-white"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {isLoading && <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 text-brand-gold animate-spin" /></div>}

      {entries && entries.length === 0 && (
        <div className="card-glass p-10 text-center space-y-2">
          <Users className="h-10 w-10 text-indigo-600 mx-auto" />
          <p className="text-white font-semibold">No data yet</p>
          <p className="text-indigo-400 text-sm">Be the first to earn points!</p>
        </div>
      )}

      {/* Top 3 podium */}
      {topThree.length >= 1 && (
        <div className="grid grid-cols-3 gap-3">
          {[topThree[1], topThree[0], topThree[2]].map((entry, i) => {
            if (!entry) return <div key={i} />;
            const rank = i === 1 ? 1 : i === 0 ? 2 : 3;
            const medal = MEDALS[rank];
            const isMe = entry.id === user?.id;
            const heights = ["h-24", "h-32", "h-20"];
            return (
              <div key={entry.id} className={`flex flex-col items-center gap-2 ${isMe ? "ring-2 ring-brand-gold rounded-2xl p-2" : ""}`}>
                <Avatar name={entry.fullName} src={entry.avatarUrl} size={rank === 1 ? "lg" : "md"} />
                <div className={`rounded-xl px-2 py-1 flex items-center gap-1 ${medal.bg}`}>
                  <medal.icon className={`h-3.5 w-3.5 ${medal.color}`} />
                  <span className={`text-xs font-bold ${medal.color}`}>#{rank}</span>
                </div>
                <div className="text-center">
                  <p className="text-xs font-semibold text-white truncate max-w-[80px]">{entry.fullName.split(" ")[0]}</p>
                  <p className="text-[11px] text-brand-gold font-bold">{entry.points.toLocaleString()} pts</p>
                </div>
                <div className={`w-full ${medal.bg} rounded-lg ${heights[i]} flex items-end justify-center pb-2`}>
                  <LevelBadge level={entry.level} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Ranks 4+ */}
      <div className="space-y-1.5">
        {rest.map((entry, i) => {
          const rank = i + 4;
          const isMe = entry.id === user?.id;
          const maxPts = entries?.[0]?.points || 1;
          return (
            <div key={entry.id} className={`flex items-center gap-3 rounded-xl px-4 py-3 transition-colors ${isMe ? "bg-brand-gold/10 border border-brand-gold/30" : "bg-white/5 border border-transparent hover:border-indigo-700/40"}`}>
              <span className={`w-7 text-center text-sm font-bold flex-shrink-0 ${rank <= 10 ? "text-indigo-300" : "text-indigo-600"}`}>
                #{rank}
              </span>
              <Avatar name={entry.fullName} src={entry.avatarUrl} size="sm" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className={`text-sm font-semibold truncate ${isMe ? "text-brand-gold" : "text-white"}`}>
                    {entry.fullName}{isMe ? " (you)" : ""}
                  </p>
                  <LevelBadge level={entry.level} />
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex-1 h-1 bg-indigo-900 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-orange-500 rounded-full"
                      style={{ width: `${Math.max(2, (entry.points / maxPts) * 100)}%` }}
                    />
                  </div>
                  <span className="text-xs text-brand-gold font-semibold whitespace-nowrap">{entry.points.toLocaleString()} pts</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Non-top-50 current user */}
      {myStats && !myEntry && (
        <div className="card-glass border border-brand-gold/20 px-4 py-3 flex items-center gap-3">
          <span className="text-indigo-400 text-sm">Your position:</span>
          <span className="text-white font-bold">#{myStats.points > 0 ? "50+" : "—"}</span>
          <span className="text-brand-gold font-semibold">{myStats.points.toLocaleString()} pts</span>
        </div>
      )}
    </div>
  );
}
