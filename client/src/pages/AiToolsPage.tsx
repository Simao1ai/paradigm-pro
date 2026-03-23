import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import {
  BookOpen, FileText, Share2, Mail, Wand2, Zap, ChevronRight,
  Clock, CheckCircle2, Loader2,
} from "lucide-react";

const TOOLS = [
  {
    id: "curriculum",
    label: "Curriculum Generator",
    description: "Generate a complete course outline with weeks, lessons, and learning objectives.",
    icon: BookOpen,
    gradient: "from-indigo-600 to-indigo-800",
    href: "/admin/ai-tools/curriculum",
  },
  {
    id: "scripts",
    label: "Script Writer",
    description: "Generate full video scripts for any lesson — hook, content, stories, and CTA.",
    icon: FileText,
    gradient: "from-orange-500 to-rose-600",
    href: "/admin/ai-tools/scripts",
  },
  {
    id: "worksheets",
    label: "Worksheet Generator",
    description: "Create worksheets, checklists, and workbook pages for any lesson topic.",
    icon: Wand2,
    gradient: "from-emerald-500 to-teal-700",
    href: "/admin/ai-tools/worksheets",
  },
  {
    id: "social",
    label: "Social Media Posts",
    description: "Generate platform-optimized posts for LinkedIn, Twitter, Instagram, and Facebook.",
    icon: Share2,
    gradient: "from-pink-500 to-purple-700",
    href: "/admin/ai-tools/social",
  },
  {
    id: "course-builder",
    label: "One-Click Course Builder",
    description: "The flagship feature: go from idea → complete course with AI in one wizard.",
    icon: Zap,
    gradient: "from-amber-500 to-orange-600",
    href: "/admin/ai-tools/course-builder",
    featured: true,
  },
];

export default function AiToolsPage() {
  const { data: drafts, isLoading } = useQuery<any[]>({
    queryKey: ["/api/content-drafts"],
    queryFn: async () => {
      const res = await fetch("/api/content-drafts", { credentials: "include" });
      if (!res.ok) return [];
      return res.json();
    },
  });

  const draftsByType = drafts?.reduce((acc: Record<string, number>, d: any) => {
    acc[d.type] = (acc[d.type] || 0) + 1;
    return acc;
  }, {}) ?? {};

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="font-display text-3xl font-bold text-white">AI Tools</h1>
        <p className="text-indigo-300 mt-1">Create content faster with AI-powered generators</p>
      </div>

      {/* Featured: Course Builder */}
      <Link href="/admin/ai-tools/course-builder">
        <div className="group relative rounded-2xl bg-gradient-to-r from-amber-600 via-orange-600 to-rose-600 p-px cursor-pointer">
          <div className="rounded-2xl bg-[#0B1628] p-6 flex items-center gap-5 group-hover:bg-indigo-950/80 transition-colors">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shrink-0">
              <Zap className="h-7 w-7 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="font-display text-xl font-bold text-white">One-Click Course Builder</h2>
                <span className="text-xs bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full font-semibold">FLAGSHIP</span>
              </div>
              <p className="text-indigo-300 text-sm">
                From idea to complete course in 30 minutes — AI generates curriculum, scripts, and worksheets.
              </p>
            </div>
            <ChevronRight className="h-5 w-5 text-indigo-400 group-hover:text-white transition-colors shrink-0" />
          </div>
        </div>
      </Link>

      {/* Tool grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {TOOLS.filter(t => !t.featured).map(tool => (
          <Link key={tool.id} href={tool.href}>
            <div className="group card-glass rounded-2xl p-5 flex items-center gap-4 cursor-pointer hover:bg-white/[0.06] transition-all hover:-translate-y-0.5">
              <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${tool.gradient} flex items-center justify-center shrink-0`}>
                <tool.icon className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-white">{tool.label}</h3>
                  {draftsByType[tool.id] > 0 && (
                    <span className="text-xs bg-indigo-700/50 text-indigo-300 px-1.5 py-0.5 rounded-full">
                      {draftsByType[tool.id]} draft{draftsByType[tool.id] !== 1 ? "s" : ""}
                    </span>
                  )}
                </div>
                <p className="text-indigo-400 text-xs mt-0.5 line-clamp-2">{tool.description}</p>
              </div>
              <ChevronRight className="h-4 w-4 text-indigo-500 group-hover:text-indigo-300 transition-colors shrink-0" />
            </div>
          </Link>
        ))}
      </div>

      {/* Recent drafts */}
      <div>
        <h2 className="font-semibold text-white mb-4">Recent Drafts</h2>
        {isLoading ? (
          <div className="flex justify-center py-6"><Loader2 className="h-5 w-5 text-brand-gold animate-spin" /></div>
        ) : drafts && drafts.length > 0 ? (
          <div className="space-y-2">
            {drafts.slice(0, 8).map(draft => (
              <div key={draft.id} className="card-glass rounded-xl p-4 flex items-center gap-3">
                <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${
                  draft.status === "published" ? "bg-emerald-500/20" : "bg-indigo-700/30"
                }`}>
                  {draft.status === "published"
                    ? <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    : <Clock className="h-4 w-4 text-indigo-400" />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white font-medium truncate">{draft.title}</p>
                  <p className="text-xs text-indigo-400">
                    {draft.type} · {new Date(draft.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                  draft.status === "published"
                    ? "bg-emerald-500/20 text-emerald-400"
                    : draft.status === "approved"
                      ? "bg-blue-500/20 text-blue-400"
                      : "bg-indigo-700/30 text-indigo-400"
                }`}>
                  {draft.status}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="card-glass rounded-2xl p-8 text-center">
            <Wand2 className="h-8 w-8 text-indigo-600 mx-auto mb-2" />
            <p className="text-indigo-400 text-sm">No drafts yet — use a tool above to start generating content.</p>
          </div>
        )}
      </div>
    </div>
  );
}
