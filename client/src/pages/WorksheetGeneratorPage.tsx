import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Wand2, Copy, CheckCircle2, Loader2, Save, Download } from "lucide-react";

const TYPES = [
  { id: "worksheet", label: "Worksheet", desc: "Guided exercises with reflection prompts" },
  { id: "checklist", label: "Checklist", desc: "Action items and completion checklist" },
  { id: "workbook", label: "Workbook Page", desc: "In-depth workbook page with exercises" },
  { id: "assessment", label: "Assessment", desc: "Knowledge check with questions" },
];

export default function WorksheetGeneratorPage() {
  const qc = useQueryClient();
  const [topic, setTopic] = useState("");
  const [type, setType] = useState("worksheet");
  const [content, setContent] = useState("");
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  const generateMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/ai/generate-worksheet", {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, type }),
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: (data) => {
      setContent(data.content);
      setSaved(false);
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/content-drafts", {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "worksheet",
          title: `${type}: ${topic.slice(0, 50)}`,
          content,
          status: "draft",
          metadata: JSON.stringify({ worksheetType: type }),
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
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${type}-${topic.slice(0, 30).replace(/\s+/g, "-")}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      <div>
        <h1 className="font-display text-3xl font-bold text-white">Worksheet Generator</h1>
        <p className="text-indigo-300 mt-1">Generate learning materials with Claude AI</p>
      </div>

      <div className="card-glass p-6 rounded-2xl space-y-4">
        <div>
          <label className="text-xs text-indigo-400 uppercase tracking-wider mb-1.5 block">Topic</label>
          <input
            value={topic}
            onChange={e => setTopic(e.target.value)}
            placeholder="e.g., Setting SMART Goals for Success"
            className="input w-full rounded-xl px-4 py-2.5 text-sm"
          />
        </div>

        <div>
          <label className="text-xs text-indigo-400 uppercase tracking-wider mb-2 block">Type</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {TYPES.map(t => (
              <button
                key={t.id}
                onClick={() => setType(t.id)}
                className={`p-3 rounded-xl text-left transition-all border ${
                  type === t.id
                    ? "bg-indigo-700/40 border-indigo-500 text-white"
                    : "bg-white/5 border-indigo-700/20 text-indigo-400 hover:bg-white/10"
                }`}
              >
                <p className="text-xs font-semibold">{t.label}</p>
                <p className="text-xs mt-0.5 opacity-70">{t.desc}</p>
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={() => generateMutation.mutate()}
          disabled={!topic || generateMutation.isPending}
          className="btn-gold rounded-xl px-6 py-2.5 text-sm font-semibold flex items-center gap-2 disabled:opacity-60"
        >
          {generateMutation.isPending ? (
            <><Wand2 className="h-4 w-4 animate-pulse" /> Generating {type}...</>
          ) : (
            <><Wand2 className="h-4 w-4" /> Generate {TYPES.find(t => t.id === type)?.label}</>
          )}
        </button>
      </div>

      {content && (
        <div className="card-glass rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 border-b border-indigo-700/20">
            <span className="text-sm font-semibold text-indigo-200 capitalize">{type}</span>
            <div className="flex items-center gap-2">
              {saved && <span className="text-emerald-400 text-xs font-semibold flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5" /> Saved</span>}
              <button onClick={() => saveMutation.mutate()} disabled={saved}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-700/40 text-indigo-200 text-xs font-semibold hover:bg-indigo-700/60 transition-colors disabled:opacity-50">
                <Save className="h-3.5 w-3.5" /> Save Draft
              </button>
              <button onClick={handleDownload}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 text-indigo-300 text-xs font-semibold hover:bg-white/10 transition-colors">
                <Download className="h-3.5 w-3.5" /> .txt
              </button>
              <button onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-gold/10 text-brand-gold text-xs font-semibold hover:bg-brand-gold/20 transition-colors">
                {copied ? <><CheckCircle2 className="h-3.5 w-3.5" /> Copied!</> : <><Copy className="h-3.5 w-3.5" /> Copy</>}
              </button>
            </div>
          </div>
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            className="w-full bg-transparent text-indigo-100 text-sm leading-relaxed p-5 resize-none focus:outline-none"
            rows={28}
          />
        </div>
      )}
    </div>
  );
}
