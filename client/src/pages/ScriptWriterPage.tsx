import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { FileText, Loader2, Copy, CheckCircle2, Save, Clock } from "lucide-react";

export default function ScriptWriterPage() {
  const qc = useQueryClient();
  const [selectedLesson, setSelectedLesson] = useState("");
  const [customTopic, setCustomTopic] = useState("");
  const [script, setScript] = useState("");
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  const { data: lessons } = useQuery<any[]>({
    queryKey: ["/api/lessons"],
    queryFn: async () => {
      const res = await fetch("/api/lessons", { credentials: "include" });
      if (!res.ok) return [];
      return res.json();
    },
  });

  const generateMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/ai/generate-script", {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonId: selectedLesson || null, customTopic }),
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: (data) => {
      setScript(data.script);
      setSaved(false);
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const lessonTitle = lessons?.find(l => l.id === selectedLesson)?.title || customTopic;
      const res = await fetch("/api/content-drafts", {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "script",
          title: `Script: ${lessonTitle}`,
          content: script,
          status: "draft",
        }),
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => {
      setSaved(true);
      qc.invalidateQueries({ queryKey: ["/api/content-drafts"] });
    },
  });

  const handleCopy = async () => {
    await navigator.clipboard.writeText(script);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const wordCount = script.split(/\s+/).filter(Boolean).length;
  const minutes = Math.round(wordCount / 130);

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      <div>
        <h1 className="font-display text-3xl font-bold text-white">Script Writer</h1>
        <p className="text-indigo-300 mt-1">Generate complete video scripts with Claude AI</p>
      </div>

      <div className="card-glass p-6 rounded-2xl space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-indigo-400 uppercase tracking-wider mb-1.5 block">Select Lesson (optional)</label>
            <select
              value={selectedLesson}
              onChange={e => setSelectedLesson(e.target.value)}
              className="input w-full rounded-xl px-4 py-2.5 text-sm"
            >
              <option value="">— Choose a lesson —</option>
              {lessons?.map(l => (
                <option key={l.id} value={l.id}>{l.title}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-indigo-400 uppercase tracking-wider mb-1.5 block">Or Enter Custom Topic</label>
            <input
              value={customTopic}
              onChange={e => setCustomTopic(e.target.value)}
              placeholder="e.g., The Power of Paradigm Shifts"
              className="input w-full rounded-xl px-4 py-2.5 text-sm"
              disabled={!!selectedLesson}
            />
          </div>
        </div>

        <button
          onClick={() => generateMutation.mutate()}
          disabled={(!selectedLesson && !customTopic) || generateMutation.isPending}
          className="btn-gold rounded-xl px-6 py-2.5 text-sm font-semibold flex items-center gap-2 disabled:opacity-60"
        >
          {generateMutation.isPending ? (
            <><FileText className="h-4 w-4 animate-pulse" /> AI is writing your script...</>
          ) : (
            <><FileText className="h-4 w-4" /> Generate Script</>
          )}
        </button>
      </div>

      {script && (
        <div className="card-glass rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 border-b border-indigo-700/20">
            <div className="flex items-center gap-4 text-xs text-indigo-400">
              <span>{wordCount.toLocaleString()} words</span>
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                ~{minutes} min read
              </span>
            </div>
            <div className="flex items-center gap-2">
              {saved && <span className="text-emerald-400 text-xs font-semibold flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5" /> Saved</span>}
              <button
                onClick={() => saveMutation.mutate()}
                disabled={saveMutation.isPending || saved}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-700/40 text-indigo-200 text-xs font-semibold hover:bg-indigo-700/60 transition-colors disabled:opacity-50"
              >
                <Save className="h-3.5 w-3.5" />
                Save Draft
              </button>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-gold/10 text-brand-gold text-xs font-semibold hover:bg-brand-gold/20 transition-colors"
              >
                {copied ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
          </div>
          <textarea
            value={script}
            onChange={e => setScript(e.target.value)}
            className="w-full bg-transparent text-indigo-100 text-sm leading-relaxed p-5 resize-none focus:outline-none"
            rows={30}
            style={{ fontFamily: "'Courier New', monospace" }}
          />
        </div>
      )}
    </div>
  );
}
