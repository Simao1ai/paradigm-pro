import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Users, BookOpen, Award, TrendingUp, MessageSquare, Flame, Trophy, CheckCircle2, Loader2, BarChart3 } from "lucide-react";

interface FeedItem {
  id: string;
  activityType: string;
  description: string;
  metadata: Record<string, any>;
  createdAt: string;
  userName: string;
  avatarUrl: string | null;
  level: number;
}

interface LeaderEntry {
  id: string;
  fullName: string;
  avatarUrl: string | null;
  points: number;
  level: number;
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

const ACTIVITY_ICONS: Record<string, { icon: typeof BookOpen; color: string }> = {
  lesson: { icon: BookOpen, color: "text-blue-400" },
  badge: { icon: Award, color: "text-brand-gold" },
  level: { icon: TrendingUp, color: "text-orange-400" },
  discussion: { icon: MessageSquare, color: "text-indigo-400" },
  checkin: { icon: CheckCircle2, color: "text-emerald-400" },
  reply: { icon: MessageSquare, color: "text-purple-400" },
};

function Avatar({ name, src, level }: { name: string; src?: string | null; level?: number }) {
  return (
    <div className="relative flex-shrink-0">
      {src ? (
        <img src={src} alt={name} className="h-9 w-9 rounded-full object-cover" />
      ) : (
        <div className="h-9 w-9 rounded-full bg-indigo-700 flex items-center justify-center text-white font-bold text-sm">
          {name?.[0]?.toUpperCase() || "?"}
        </div>
      )}
      {level && level > 1 && (
        <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-orange-500 flex items-center justify-center text-[9px] text-white font-bold">
          {level}
        </div>
      )}
    </div>
  );
}

export default function CommunityPage() {
  const { data: feed, isLoading } = useQuery<FeedItem[]>({
    queryKey: ["/api/community/feed"],
    queryFn: async () => {
      const r = await fetch("/api/community/feed", { credentials: "include" });
      return r.json();
    },
    refetchInterval: 30000,
  });

  const { data: topUsers } = useQuery<LeaderEntry[]>({
    queryKey: ["/api/community/leaderboard", "week"],
    queryFn: async () => {
      const r = await fetch("/api/community/leaderboard?period=week&limit=5", { credentials: "include" });
      return r.json();
    },
    refetchInterval: 60000,
  });

  const topStudent = topUsers?.[0];

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-brand-gold" />
          <h1 className="text-xl font-bold text-white font-display">Community</h1>
        </div>
        <Link href="/community/leaderboard">
          <a className="flex items-center gap-1.5 text-sm text-brand-gold hover:underline font-semibold">
            <Trophy className="h-4 w-4" /> Leaderboard
          </a>
        </Link>
      </div>

      {/* Top Student Spotlight */}
      {topStudent && (
        <div className="card-glass p-5 border border-brand-gold/30 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-brand-gold/5 to-orange-500/5 pointer-events-none" />
          <div className="flex items-center gap-1.5 mb-3">
            <Crown className="h-4 w-4 text-brand-gold" />
            <span className="text-xs font-bold text-brand-gold uppercase tracking-wider">Top Student of the Week</span>
          </div>
          <div className="flex items-center gap-3">
            <Avatar name={topStudent.fullName} src={topStudent.avatarUrl} level={topStudent.level} />
            <div>
              <p className="font-bold text-white">{topStudent.fullName}</p>
              <p className="text-sm text-brand-gold">{topStudent.points.toLocaleString()} pts this week · Level {topStudent.level}</p>
            </div>
          </div>
        </div>
      )}

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3">
        <Link href="/community/leaderboard">
          <a className="card-glass p-4 flex items-center gap-3 hover:border-indigo-600/50 transition-all group">
            <div className="h-9 w-9 rounded-xl bg-yellow-500/10 flex items-center justify-center">
              <Trophy className="h-5 w-5 text-yellow-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white group-hover:text-brand-gold transition-colors">Leaderboard</p>
              <p className="text-xs text-indigo-400">Top 50 students</p>
            </div>
          </a>
        </Link>
        <Link href="/check-in">
          <a className="card-glass p-4 flex items-center gap-3 hover:border-indigo-600/50 transition-all group">
            <div className="h-9 w-9 rounded-xl bg-orange-500/10 flex items-center justify-center">
              <Flame className="h-5 w-5 text-orange-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white group-hover:text-brand-gold transition-colors">Daily Check-In</p>
              <p className="text-xs text-indigo-400">+5 points</p>
            </div>
          </a>
        </Link>
      </div>

      {/* Activity Feed */}
      <div>
        <h2 className="text-sm font-bold text-indigo-300 uppercase tracking-wide mb-3">Recent Activity</h2>

        {isLoading && <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 text-brand-gold animate-spin" /></div>}

        {feed && feed.length === 0 && (
          <div className="text-center py-10 text-indigo-500 text-sm">
            <Users className="h-8 w-8 mx-auto mb-2 text-indigo-700" />
            No community activity yet. Be the first!
          </div>
        )}

        <div className="space-y-1">
          {(feed || []).map((item) => {
            const cfg = ACTIVITY_ICONS[item.activityType] || ACTIVITY_ICONS.lesson;
            const Icon = cfg.icon;
            return (
              <div key={item.id} className="flex items-start gap-3 rounded-xl px-3 py-2.5 hover:bg-white/5 transition-colors">
                <div className="flex-shrink-0 flex flex-col items-center gap-1 pt-0.5">
                  <Avatar name={item.userName} src={item.avatarUrl} level={item.level} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <Icon className={`h-3.5 w-3.5 ${cfg.color} flex-shrink-0`} />
                    <p className="text-sm text-indigo-100 leading-snug">
                      <span className="font-semibold text-white">{item.userName}</span>{" "}
                      {item.description}
                    </p>
                  </div>
                  <p className="text-xs text-indigo-500 mt-0.5">{timeAgo(item.createdAt)}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Crown({ className }: { className: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2L15 9L22 9L17 14L19 21L12 17L5 21L7 14L2 9L9 9Z" />
    </svg>
  );
}
