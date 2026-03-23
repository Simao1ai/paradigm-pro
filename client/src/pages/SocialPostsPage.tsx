import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Share2, Copy, CheckCircle2, Loader2, Save } from "lucide-react";

const PLATFORMS = [
  { id: "linkedin", label: "LinkedIn", color: "bg-blue-600/20 text-blue-400 border-blue-600/30" },
  { id: "twitter", label: "Twitter / X", color: "bg-sky-500/20 text-sky-400 border-sky-500/30" },
  { id: "instagram", label: "Instagram", color: "bg-pink-500/20 text-pink-400 border-pink-500/30" },
  { id: "facebook", label: "Facebook", color: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30" },
];

export default function SocialPostsPage() {
  const qc = useQueryClient();
  const [topic, setTopic] = useState("");
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(["linkedin", "twitter"]);
  const [posts, setPosts] = useState<Record<string, string>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);

  const generateMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/ai/generate-social", {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, platforms: selectedPlatforms }),
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: (data) => setPosts(data.posts || {}),
  });

  const saveMutation = useMutation({
    mutationFn: async (platformId: string) => {
      const res = await fetch("/api/content-drafts", {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "social_post",
          title: `${platformId} post: ${topic.slice(0, 50)}`,
          content: posts[platformId],
          status: "draft",
          metadata: JSON.stringify({ platform: platformId }),
        }),
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: (_data, platformId) => {
      setSavedId(platformId);
      setTimeout(() => setSavedId(null), 2000);
      qc.invalidateQueries({ queryKey: ["/api/content-drafts"] });
    },
  });

  const handleCopy = async (id: string, text: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const togglePlatform = (id: string) => {
    setSelectedPlatforms(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      <div>
        <h1 className="font-display text-3xl font-bold text-white">Social Media Generator</h1>
        <p className="text-indigo-300 mt-1">Generate platform-optimized posts with Claude AI</p>
      </div>

      <div className="card-glass p-6 rounded-2xl space-y-4">
        <div>
          <label className="text-xs text-indigo-400 uppercase tracking-wider mb-1.5 block">Topic or Lesson Content</label>
          <textarea
            value={topic}
            onChange={e => setTopic(e.target.value)}
            rows={3}
            placeholder="Paste a lesson topic, key insight, or content snippet..."
            className="input w-full rounded-xl px-4 py-2.5 text-sm resize-none"
          />
        </div>

        <div>
          <label className="text-xs text-indigo-400 uppercase tracking-wider mb-2 block">Platforms</label>
          <div className="flex flex-wrap gap-2">
            {PLATFORMS.map(p => (
              <button
                key={p.id}
                onClick={() => togglePlatform(p.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                  selectedPlatforms.includes(p.id)
                    ? p.color
                    : "bg-white/5 text-indigo-500 border-indigo-700/30"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={() => generateMutation.mutate()}
          disabled={!topic || selectedPlatforms.length === 0 || generateMutation.isPending}
          className="btn-gold rounded-xl px-6 py-2.5 text-sm font-semibold flex items-center gap-2 disabled:opacity-60"
        >
          {generateMutation.isPending ? (
            <><Share2 className="h-4 w-4 animate-pulse" /> Generating posts...</>
          ) : (
            <><Share2 className="h-4 w-4" /> Generate Posts</>
          )}
        </button>
      </div>

      {/* Generated posts */}
      {Object.keys(posts).length > 0 && (
        <div className="space-y-4">
          {PLATFORMS.filter(p => posts[p.id]).map(platform => (
            <div key={platform.id} className="card-glass rounded-2xl overflow-hidden">
              <div className={`px-5 py-3 flex items-center justify-between border-b border-indigo-700/20`}>
                <span className={`text-sm font-semibold px-3 py-1 rounded-lg border ${platform.color}`}>
                  {platform.label}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => saveMutation.mutate(platform.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-700/40 text-indigo-200 text-xs font-semibold hover:bg-indigo-700/60 transition-colors"
                  >
                    {savedId === platform.id
                      ? <><CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> Saved!</>
                      : <><Save className="h-3.5 w-3.5" /> Save</>
                    }
                  </button>
                  <button
                    onClick={() => handleCopy(platform.id, posts[platform.id])}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-gold/10 text-brand-gold text-xs font-semibold hover:bg-brand-gold/20 transition-colors"
                  >
                    {copiedId === platform.id
                      ? <><CheckCircle2 className="h-3.5 w-3.5" /> Copied!</>
                      : <><Copy className="h-3.5 w-3.5" /> Copy</>
                    }
                  </button>
                </div>
              </div>
              <textarea
                value={posts[platform.id]}
                onChange={e => setPosts(prev => ({ ...prev, [platform.id]: e.target.value }))}
                rows={8}
                className="w-full bg-transparent text-indigo-100 text-sm leading-relaxed p-5 resize-none focus:outline-none"
              />
              <div className="px-5 py-2 border-t border-indigo-700/10 text-xs text-indigo-600">
                {posts[platform.id]?.length} characters
                {platform.id === "twitter" && ` (${Math.ceil(posts[platform.id]?.length / 280)} tweet${Math.ceil(posts[platform.id]?.length / 280) !== 1 ? "s" : ""})`}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
