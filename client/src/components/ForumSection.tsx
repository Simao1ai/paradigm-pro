import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { MessageSquare, Heart, Pin, ChevronLeft, Plus, Send, Loader2, Sparkles, Shield } from "lucide-react";

interface Discussion {
  id: string;
  title: string;
  content: string;
  pinned: boolean;
  likeCount: number;
  replyCount: number;
  createdAt: string;
  userId: string;
  authorName: string;
  authorAvatar: string | null;
  authorRole: string;
  likedByMe: boolean;
}

interface Reply {
  id: string;
  content: string;
  isAiGenerated: boolean;
  likeCount: number;
  createdAt: string;
  userId: string;
  authorName: string;
  authorAvatar: string | null;
  authorRole: string;
  likedByMe: boolean;
}

interface DiscussionWithReplies extends Discussion {
  replies: Reply[];
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

function Avatar({ name, src, size = "sm" }: { name: string; src?: string | null; size?: "sm" | "md" }) {
  const cls = size === "sm" ? "h-7 w-7 text-xs" : "h-9 w-9 text-sm";
  if (src) return <img src={src} alt={name} className={`${cls} rounded-full object-cover flex-shrink-0`} />;
  return (
    <div className={`${cls} rounded-full bg-indigo-700 flex items-center justify-center text-white font-bold flex-shrink-0`}>
      {name?.[0]?.toUpperCase() || "?"}
    </div>
  );
}

function RoleBadge({ role, isAi }: { role: string; isAi?: boolean }) {
  if (isAi) return (
    <span className="flex items-center gap-1 text-[10px] bg-brand-gold/20 text-brand-gold px-1.5 py-0.5 rounded-full font-semibold">
      <Sparkles className="h-2.5 w-2.5" /> AI Coach
    </span>
  );
  if (role === "admin" || role === "consultant") return (
    <span className="flex items-center gap-1 text-[10px] bg-indigo-700/50 text-indigo-300 px-1.5 py-0.5 rounded-full font-semibold">
      <Shield className="h-2.5 w-2.5" /> Instructor
    </span>
  );
  return null;
}

export default function ForumSection({ lessonId }: { lessonId: string }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedDiscId, setSelectedDiscId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [replyContent, setReplyContent] = useState("");

  const qKey = ["/api/discussions", lessonId];

  const { data: discussions, isLoading } = useQuery<Discussion[]>({
    queryKey: qKey,
    queryFn: async () => {
      const r = await fetch(`/api/discussions?lessonId=${lessonId}`, { credentials: "include" });
      return r.json();
    },
  });

  const { data: thread } = useQuery<DiscussionWithReplies>({
    queryKey: ["/api/discussions/thread", selectedDiscId],
    queryFn: async () => {
      const r = await fetch(`/api/discussions/${selectedDiscId}`, { credentials: "include" });
      return r.json();
    },
    enabled: !!selectedDiscId,
  });

  const createDiscMutation = useMutation({
    mutationFn: async () => {
      const r = await fetch("/api/discussions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ lessonId, title: newTitle, content: newContent }),
      });
      return r.json();
    },
    onSuccess: () => {
      setShowCreate(false); setNewTitle(""); setNewContent("");
      queryClient.invalidateQueries({ queryKey: qKey });
    },
  });

  const replyMutation = useMutation({
    mutationFn: async () => {
      const r = await fetch(`/api/discussions/${selectedDiscId}/replies`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ content: replyContent }),
      });
      return r.json();
    },
    onSuccess: () => {
      setReplyContent("");
      queryClient.invalidateQueries({ queryKey: ["/api/discussions/thread", selectedDiscId] });
      queryClient.invalidateQueries({ queryKey: qKey });
    },
  });

  const likeMutation = useMutation({
    mutationFn: async ({ type, id }: { type: "discussion" | "reply"; id: string }) => {
      const url = type === "discussion" ? `/api/discussions/${id}/like` : `/api/discussions/${selectedDiscId}/replies/${id}/like`;
      const r = await fetch(url, { method: "POST", credentials: "include" });
      return r.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/discussions/thread", selectedDiscId] });
      queryClient.invalidateQueries({ queryKey: qKey });
    },
  });

  // Thread view
  if (selectedDiscId && thread) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => setSelectedDiscId(null)}
          className="flex items-center gap-1.5 text-sm text-indigo-400 hover:text-white transition-colors"
        >
          <ChevronLeft className="h-4 w-4" /> Back to discussions
        </button>

        <div className="card-glass p-5 space-y-3">
          {thread.pinned && (
            <span className="flex items-center gap-1 text-xs text-brand-gold font-semibold">
              <Pin className="h-3 w-3" /> Pinned
            </span>
          )}
          <h3 className="text-lg font-bold text-white">{thread.title}</h3>
          <div className="flex items-center gap-2">
            <Avatar name={thread.authorName} src={thread.authorAvatar} size="sm" />
            <span className="text-sm text-indigo-300">{thread.authorName}</span>
            <RoleBadge role={thread.authorRole} />
            <span className="text-xs text-indigo-500">{timeAgo(thread.createdAt)}</span>
          </div>
          <p className="text-sm text-indigo-100 leading-relaxed whitespace-pre-wrap">{thread.content}</p>
          <button
            onClick={() => likeMutation.mutate({ type: "discussion", id: thread.id })}
            className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${thread.likedByMe ? "text-pink-400" : "text-indigo-500 hover:text-pink-400"}`}
          >
            <Heart className={`h-4 w-4 ${thread.likedByMe ? "fill-pink-400" : ""}`} />
            {thread.likeCount}
          </button>
        </div>

        {/* Replies */}
        <div className="space-y-3">
          {thread.replies?.map((reply) => (
            <div key={reply.id} className={`flex gap-3 ${reply.isAiGenerated ? "pl-2 border-l-2 border-brand-gold/40" : "pl-2 border-l-2 border-indigo-700/30"}`}>
              <Avatar name={reply.authorName} src={reply.authorAvatar} size="sm" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium text-white">{reply.authorName}</span>
                  <RoleBadge role={reply.authorRole} isAi={reply.isAiGenerated} />
                  <span className="text-xs text-indigo-500">{timeAgo(reply.createdAt)}</span>
                </div>
                <p className="text-sm text-indigo-100 mt-1.5 leading-relaxed whitespace-pre-wrap">{reply.content}</p>
                <button
                  onClick={() => likeMutation.mutate({ type: "reply", id: reply.id })}
                  className={`mt-1.5 flex items-center gap-1 text-xs font-medium transition-colors ${reply.likedByMe ? "text-pink-400" : "text-indigo-500 hover:text-pink-400"}`}
                >
                  <Heart className={`h-3 w-3 ${reply.likedByMe ? "fill-pink-400" : ""}`} />
                  {reply.likeCount}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Reply box */}
        <div className="flex gap-3 pt-2">
          <Avatar name={user?.firstName || "You"} src={user?.profileImageUrl} size="sm" />
          <div className="flex-1 flex gap-2">
            <textarea
              className="input flex-1 min-h-[64px] resize-none text-sm"
              placeholder="Share your thoughts or answer…"
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
            />
            <button
              onClick={() => replyMutation.mutate()}
              disabled={!replyContent.trim() || replyMutation.isPending}
              className="btn-gold rounded-xl px-3 self-end disabled:opacity-50"
            >
              {replyMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Discussion list view
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-brand-gold" />
          <h3 className="font-bold text-white">Discussion Forum</h3>
          {discussions && discussions.length > 0 && (
            <span className="text-xs text-indigo-400">({discussions.length})</span>
          )}
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="flex items-center gap-1.5 btn-gold rounded-xl px-3 py-1.5 text-sm font-semibold"
        >
          <Plus className="h-3.5 w-3.5" /> Ask a Question
        </button>
      </div>

      {showCreate && (
        <div className="card-glass p-4 space-y-3 border border-brand-gold/30">
          <input
            className="input w-full text-sm"
            placeholder="Your question title…"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
          />
          <textarea
            className="input w-full min-h-[80px] resize-none text-sm"
            placeholder="Describe your question or share your insight…"
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
          />
          <div className="flex justify-end gap-2">
            <button onClick={() => setShowCreate(false)} className="text-sm text-indigo-400 hover:text-white px-3 py-1.5 transition-colors">Cancel</button>
            <button
              onClick={() => createDiscMutation.mutate()}
              disabled={!newTitle.trim() || !newContent.trim() || createDiscMutation.isPending}
              className="btn-gold rounded-xl px-4 py-1.5 text-sm font-semibold disabled:opacity-50 flex items-center gap-1.5"
            >
              {createDiscMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Post"}
            </button>
          </div>
        </div>
      )}

      {isLoading && (
        <div className="flex justify-center py-6"><Loader2 className="h-5 w-5 text-brand-gold animate-spin" /></div>
      )}

      {!isLoading && discussions?.length === 0 && (
        <div className="text-center py-8 text-indigo-400 text-sm">
          <MessageSquare className="h-8 w-8 mx-auto mb-2 text-indigo-700" />
          No discussions yet. Be the first to ask a question!
        </div>
      )}

      <div className="space-y-2">
        {(discussions || []).map((disc) => (
          <button
            key={disc.id}
            onClick={() => setSelectedDiscId(disc.id)}
            className="w-full text-left card-glass p-4 hover:border-indigo-600/50 transition-all group"
          >
            <div className="flex items-start gap-3">
              <Avatar name={disc.authorName} src={disc.authorAvatar} size="sm" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-0.5">
                  {disc.pinned && <Pin className="h-3 w-3 text-brand-gold flex-shrink-0" />}
                  <span className="text-sm font-semibold text-white group-hover:text-brand-gold-light transition-colors truncate">
                    {disc.title}
                  </span>
                </div>
                <p className="text-xs text-indigo-400 line-clamp-1">{disc.content}</p>
                <div className="flex items-center gap-3 mt-2 text-xs text-indigo-500">
                  <span>{disc.authorName}</span>
                  <span>·</span>
                  <span>{timeAgo(disc.createdAt)}</span>
                  <span className="flex items-center gap-1">
                    <Heart className={`h-3 w-3 ${disc.likedByMe ? "fill-pink-400 text-pink-400" : ""}`} />
                    {disc.likeCount}
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageSquare className="h-3 w-3" />
                    {disc.replyCount}
                  </span>
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
