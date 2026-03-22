import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Users, BookOpen, CreditCard, Loader2, AlertCircle, ShieldAlert,
  DollarSign, TrendingUp, Tag, Plus, Trash2, ToggleLeft, ToggleRight,
  BarChart3, CheckCircle2, Mail, Send, Activity, ListChecks, RefreshCw,
} from "lucide-react";

interface OverviewData {
  totalStudents: number;
  totalLessons: number;
  activeSubscriptions: number;
  totalRevenue: number;
}

interface StudentData {
  id: string;
  fullName: string;
  avatarUrl: string | null;
  role: string;
  createdAt: string;
}

interface RevenueData {
  totalRevenue: number;
  activeSubscriptions: number;
  trialSubscriptions: number;
  canceledLast30Days: number;
  recentPayments: {
    id: string;
    amount: number;
    currency: string;
    status: string;
    planType: string | null;
    billingInterval: string | null;
    createdAt: string;
    userFullName: string | null;
  }[];
  monthlyRevenue: { month: string; total: string | null }[];
}

interface CouponData {
  id: string;
  code: string;
  discountPercent: number;
  maxUses: number | null;
  currentUses: number;
  expiresAt: string | null;
  active: boolean;
  createdAt: string;
}

function formatCents(cents: number) {
  return `$${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function RevenueTab() {
  const { data: revenue, isLoading } = useQuery<RevenueData>({
    queryKey: ["/api/admin/revenue"],
    queryFn: async () => {
      const res = await fetch("/api/admin/revenue", { credentials: "include" });
      if (!res.ok) throw new Error(`${res.status}`);
      return res.json();
    },
  });

  if (isLoading) return <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 text-brand-gold animate-spin" /></div>;

  const maxMonthly = Math.max(...(revenue?.monthlyRevenue.map(m => Number(m.total || 0)) || [1]));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Revenue", value: formatCents(revenue?.totalRevenue || 0), icon: DollarSign, color: "from-brand-gold to-orange-600" },
          { label: "Active Subscribers", value: revenue?.activeSubscriptions || 0, icon: Users, color: "from-brand-emerald to-green-600" },
          { label: "Free Trials", value: revenue?.trialSubscriptions || 0, icon: TrendingUp, color: "from-blue-500 to-indigo-600" },
          { label: "Churned (30d)", value: revenue?.canceledLast30Days || 0, icon: AlertCircle, color: "from-red-500 to-rose-600" },
        ].map(stat => (
          <div key={stat.label} className="card-glass p-4">
            <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3`}>
              <stat.icon className="h-5 w-5 text-white" />
            </div>
            <div className="text-2xl font-bold text-white font-display">{stat.value}</div>
            <div className="text-xs text-indigo-300 mt-0.5">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Monthly revenue chart */}
      {revenue?.monthlyRevenue && revenue.monthlyRevenue.length > 0 && (
        <div className="card-glass p-5">
          <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-brand-gold" />
            Monthly Revenue (Last 12 Months)
          </h3>
          <div className="flex items-end gap-2 h-32">
            {revenue.monthlyRevenue.map((m) => {
              const val = Number(m.total || 0);
              const height = maxMonthly > 0 ? Math.max((val / maxMonthly) * 100, 4) : 4;
              return (
                <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full rounded-t-md bg-gradient-to-t from-brand-gold to-brand-pink transition-all"
                    style={{ height: `${height}%` }}
                    title={`${m.month}: ${formatCents(val)}`}
                  />
                  <span className="text-[10px] text-indigo-400 rotate-45 origin-left truncate">{m.month.slice(5)}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recent payments */}
      <div className="card-glass p-5">
        <h3 className="font-semibold text-white mb-4">Recent Payments</h3>
        {!revenue?.recentPayments?.length ? (
          <p className="text-sm text-indigo-300">No payments yet.</p>
        ) : (
          <div className="space-y-2">
            {revenue.recentPayments.map(p => (
              <div key={p.id} className="flex items-center justify-between rounded-xl bg-white/5 border border-indigo-700/30 px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-white">{p.userFullName || "Unknown"}</p>
                  <p className="text-xs text-indigo-400">
                    {p.planType?.replace("_", " ") || "—"} · {p.billingInterval || "—"} ·{" "}
                    {new Date(p.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-brand-emerald">{formatCents(p.amount)}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${p.status === "succeeded" ? "bg-brand-emerald/20 text-brand-emerald" : "bg-red-500/20 text-red-400"}`}>
                    {p.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function CouponsTab() {
  const queryClient = useQueryClient();
  const [code, setCode] = useState("");
  const [discountPercent, setDiscountPercent] = useState("20");
  const [maxUses, setMaxUses] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [createError, setCreateError] = useState("");
  const [createSuccess, setCreateSuccess] = useState("");

  const { data: coupons, isLoading } = useQuery<CouponData[]>({
    queryKey: ["/api/admin/coupons"],
    queryFn: async () => {
      const res = await fetch("/api/admin/coupons", { credentials: "include" });
      if (!res.ok) throw new Error(`${res.status}`);
      return res.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: object) => {
      const res = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/coupons"] });
      setCode(""); setDiscountPercent("20"); setMaxUses(""); setExpiresAt("");
      setCreateSuccess("Coupon created!"); setCreateError("");
      setTimeout(() => setCreateSuccess(""), 3000);
    },
    onError: (err: Error) => { setCreateError(err.message); setCreateSuccess(""); },
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      const res = await fetch(`/api/admin/coupons/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ active }),
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/admin/coupons"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/coupons/${id}`, { method: "DELETE", credentials: "include" });
      if (!res.ok) throw new Error("Failed");
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/admin/coupons"] }),
  });

  return (
    <div className="space-y-6">
      {/* Create coupon */}
      <div className="card-glass p-6">
        <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
          <Plus className="h-4 w-4 text-brand-gold" /> Create Coupon
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="text-xs text-indigo-300 mb-1 block">Code *</label>
            <input
              value={code}
              onChange={e => setCode(e.target.value.toUpperCase())}
              placeholder="SAVE20"
              className="input text-sm"
            />
          </div>
          <div>
            <label className="text-xs text-indigo-300 mb-1 block">Discount % *</label>
            <input
              type="number"
              value={discountPercent}
              onChange={e => setDiscountPercent(e.target.value)}
              min="1" max="100"
              className="input text-sm"
            />
          </div>
          <div>
            <label className="text-xs text-indigo-300 mb-1 block">Max Uses</label>
            <input
              type="number"
              value={maxUses}
              onChange={e => setMaxUses(e.target.value)}
              placeholder="Unlimited"
              className="input text-sm"
            />
          </div>
          <div>
            <label className="text-xs text-indigo-300 mb-1 block">Expires</label>
            <input
              type="date"
              value={expiresAt}
              onChange={e => setExpiresAt(e.target.value)}
              className="input text-sm"
            />
          </div>
        </div>
        {createError && <p className="text-red-400 text-xs mb-2">{createError}</p>}
        {createSuccess && <p className="text-brand-emerald text-xs mb-2 flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> {createSuccess}</p>}
        <button
          onClick={() => createMutation.mutate({ code, discountPercent, maxUses: maxUses || undefined, expiresAt: expiresAt || undefined })}
          disabled={createMutation.isPending || !code}
          className="btn-gold text-sm py-2 px-5 rounded-full"
        >
          {createMutation.isPending ? "Creating..." : "Create Coupon"}
        </button>
      </div>

      {/* Coupons list */}
      <div className="card-glass p-5">
        <h3 className="font-semibold text-white mb-4">All Coupons</h3>
        {isLoading ? (
          <div className="flex justify-center py-6"><Loader2 className="h-5 w-5 text-brand-gold animate-spin" /></div>
        ) : !coupons?.length ? (
          <p className="text-sm text-indigo-300">No coupons created yet.</p>
        ) : (
          <div className="space-y-2">
            {coupons.map(coupon => (
              <div key={coupon.id} className="flex items-center justify-between rounded-xl bg-white/5 border border-indigo-700/30 px-4 py-3 flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-brand-gold font-bold text-sm">{coupon.code}</span>
                  <span className="text-xs text-indigo-300">{coupon.discountPercent}% off</span>
                  <span className="text-xs text-indigo-400">
                    {coupon.currentUses}{coupon.maxUses ? `/${coupon.maxUses}` : ""} uses
                  </span>
                  {coupon.expiresAt && (
                    <span className="text-xs text-indigo-400">
                      Exp: {new Date(coupon.expiresAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${coupon.active ? "bg-brand-emerald/20 text-brand-emerald" : "bg-red-500/20 text-red-400"}`}>
                    {coupon.active ? "Active" : "Inactive"}
                  </span>
                  <button
                    onClick={() => toggleMutation.mutate({ id: coupon.id, active: !coupon.active })}
                    className="text-indigo-400 hover:text-white transition-colors"
                    title={coupon.active ? "Deactivate" : "Activate"}
                  >
                    {coupon.active ? <ToggleRight className="h-5 w-5 text-brand-emerald" /> : <ToggleLeft className="h-5 w-5" />}
                  </button>
                  <button
                    onClick={() => deleteMutation.mutate(coupon.id)}
                    className="text-red-400/60 hover:text-red-400 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

interface EmailStats {
  totalSent: number;
  openRate: number;
  clickRate: number;
  activeSequences: number;
}

interface EmailStep {
  id: string;
  templateName: string;
  subject: string;
  delayDays: number;
  order: number;
}

interface EmailSequence {
  id: string;
  name: string;
  triggerEvent: string;
  active: boolean;
  createdAt: string;
  steps: EmailStep[];
}

interface EmailLog {
  id: string;
  recipientEmail: string;
  templateName: string;
  subject: string;
  sentAt: string;
  opened: boolean;
  clicked: boolean;
}

const TRIGGER_LABELS: Record<string, string> = {
  signup: "New Signup",
  enrollment: "Subscription Purchase",
  inactivity: "Inactivity (3+ days)",
  completion: "Course Completion",
  churn: "Subscription Canceled",
  upsell: "Upsell Opportunity",
  accountability: "Accountability Check",
};

function EmailsTab() {
  const queryClient = useQueryClient();
  const [logsSearch, setLogsSearch] = useState("");

  const { data: stats } = useQuery<EmailStats>({
    queryKey: ["/api/admin/email/stats"],
    queryFn: async () => {
      const r = await fetch("/api/admin/email/stats", { credentials: "include" });
      return r.json();
    },
  });

  const { data: sequences, isLoading: seqLoading } = useQuery<EmailSequence[]>({
    queryKey: ["/api/admin/email/sequences"],
    queryFn: async () => {
      const r = await fetch("/api/admin/email/sequences", { credentials: "include" });
      return r.json();
    },
  });

  const { data: logs, isLoading: logsLoading, refetch: refetchLogs } = useQuery<EmailLog[]>({
    queryKey: ["/api/admin/email/logs", logsSearch],
    queryFn: async () => {
      const params = logsSearch ? `?search=${encodeURIComponent(logsSearch)}` : "";
      const r = await fetch(`/api/admin/email/logs${params}`, { credentials: "include" });
      return r.json();
    },
  });

  const toggleSequenceMutation = useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      const r = await fetch(`/api/admin/email/sequences/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ active }),
      });
      return r.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/admin/email/sequences"] }),
  });

  const processQueueMutation = useMutation({
    mutationFn: async () => {
      const r = await fetch("/api/admin/email/process", {
        method: "POST",
        credentials: "include",
      });
      return r.json();
    },
    onSuccess: () => refetchLogs(),
  });

  const statsCards = [
    { label: "Total Sent", value: stats?.totalSent ?? "—", icon: Send, color: "from-indigo-500 to-indigo-700" },
    { label: "Open Rate", value: stats?.openRate != null ? `${stats.openRate}%` : "—", icon: Mail, color: "from-orange-500 to-orange-700" },
    { label: "Click Rate", value: stats?.clickRate != null ? `${stats.clickRate}%` : "—", icon: Activity, color: "from-emerald-500 to-emerald-700" },
    { label: "Active Sequences", value: stats?.activeSequences ?? "—", icon: ListChecks, color: "from-pink-500 to-pink-700" },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {statsCards.map((s) => (
          <div key={s.label} className="card-glass p-4 flex flex-col items-start">
            <div className={`h-9 w-9 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center mb-2`}>
              <s.icon className="h-4 w-4 text-white" />
            </div>
            <div className="text-xl font-bold text-white font-display">{String(s.value)}</div>
            <div className="text-xs text-indigo-300 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Sequences */}
      <div className="card-glass p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-white flex items-center gap-2">
            <ListChecks className="h-4 w-4 text-brand-gold" />
            Email Sequences
          </h3>
          <button
            onClick={() => processQueueMutation.mutate()}
            disabled={processQueueMutation.isPending}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-indigo-600 text-indigo-300 hover:text-white hover:border-indigo-400 transition-colors"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${processQueueMutation.isPending ? "animate-spin" : ""}`} />
            Process Queue Now
          </button>
        </div>

        {seqLoading ? (
          <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 text-brand-gold animate-spin" /></div>
        ) : sequences && sequences.length > 0 ? (
          <div className="space-y-3">
            {sequences.map((seq) => (
              <div key={seq.id} className="rounded-xl border border-indigo-700/40 bg-white/5 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-semibold text-white">{seq.name}</p>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${seq.active ? "bg-emerald-500/20 text-emerald-300" : "bg-red-500/20 text-red-300"}`}>
                        {seq.active ? "Active" : "Paused"}
                      </span>
                    </div>
                    <p className="text-xs text-indigo-400 mb-2">
                      Trigger: <span className="text-indigo-300">{TRIGGER_LABELS[seq.triggerEvent] || seq.triggerEvent}</span>
                      {" · "}{seq.steps.length} step{seq.steps.length !== 1 ? "s" : ""}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {seq.steps.map((step) => (
                        <span key={step.id} className="text-[10px] bg-indigo-900/60 text-indigo-300 px-2 py-0.5 rounded-full">
                          Day {step.delayDays}: {step.templateName}
                        </span>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={() => toggleSequenceMutation.mutate({ id: seq.id, active: !seq.active })}
                    className="flex-shrink-0 mt-0.5"
                    title={seq.active ? "Pause sequence" : "Activate sequence"}
                  >
                    {seq.active
                      ? <ToggleRight className="h-6 w-6 text-emerald-400" />
                      : <ToggleLeft className="h-6 w-6 text-indigo-500" />
                    }
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Mail className="h-8 w-8 text-indigo-600 mx-auto mb-2" />
            <p className="text-sm text-indigo-300">No sequences yet. They seed automatically on startup.</p>
          </div>
        )}
      </div>

      {/* Email Logs */}
      <div className="card-glass p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-white flex items-center gap-2">
            <Mail className="h-4 w-4 text-brand-gold" />
            Email Logs
          </h3>
          <input
            type="text"
            placeholder="Search by email or subject…"
            value={logsSearch}
            onChange={(e) => setLogsSearch(e.target.value)}
            className="input text-xs py-1.5 px-3 w-48"
          />
        </div>

        {logsLoading ? (
          <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 text-brand-gold animate-spin" /></div>
        ) : logs && logs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-left text-indigo-400 border-b border-indigo-700/40">
                  <th className="pb-2 pr-4">Recipient</th>
                  <th className="pb-2 pr-4">Template</th>
                  <th className="pb-2 pr-4">Subject</th>
                  <th className="pb-2 pr-4">Sent</th>
                  <th className="pb-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-indigo-800/40">
                {logs.map((log) => (
                  <tr key={log.id} className="text-indigo-200">
                    <td className="py-2 pr-4 font-medium text-white truncate max-w-[140px]">{log.recipientEmail}</td>
                    <td className="py-2 pr-4">
                      <span className="bg-indigo-900/60 text-indigo-300 px-1.5 py-0.5 rounded text-[10px]">{log.templateName}</span>
                    </td>
                    <td className="py-2 pr-4 text-indigo-300 max-w-[200px] truncate">{log.subject}</td>
                    <td className="py-2 pr-4 text-indigo-400 whitespace-nowrap">
                      {new Date(log.sentAt).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </td>
                    <td className="py-2">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${log.opened ? "bg-emerald-500/20 text-emerald-300" : "bg-indigo-900/60 text-indigo-400"}`}>
                        {log.opened ? "Opened" : "Sent"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-indigo-400 text-center py-6">No emails sent yet.</p>
        )}
      </div>
    </div>
  );
}

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<"overview" | "revenue" | "coupons" | "emails">("overview");

  const { data: overview, isLoading: overviewLoading, error: overviewError } = useQuery<OverviewData>({
    queryKey: ["/api/admin/overview"],
    queryFn: async () => {
      const res = await fetch("/api/admin/overview", { credentials: "include" });
      if (res.status === 403) throw new Error("403");
      if (!res.ok) throw new Error(`${res.status}`);
      return res.json();
    },
  });

  const { data: students, isLoading: studentsLoading } = useQuery<StudentData[]>({
    queryKey: ["/api/admin/students"],
    queryFn: async () => {
      const res = await fetch("/api/admin/students", { credentials: "include" });
      if (!res.ok) throw new Error(`${res.status}`);
      return res.json();
    },
    enabled: !overviewError,
  });

  if (overviewError?.message === "403") {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <ShieldAlert className="h-10 w-10 text-red-400 mx-auto mb-3" />
          <h2 className="text-lg font-semibold text-white mb-1">Access Denied</h2>
          <p className="text-indigo-300 text-sm">You do not have permission to view this page.</p>
        </div>
      </div>
    );
  }

  if (overviewLoading) {
    return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 text-brand-gold animate-spin" /></div>;
  }

  const tabs = [
    { id: "overview", label: "Overview", icon: Users },
    { id: "revenue", label: "Revenue", icon: DollarSign },
    { id: "coupons", label: "Coupons", icon: Tag },
    { id: "emails", label: "Emails", icon: Mail },
  ] as const;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-3xl font-bold text-white">Admin Dashboard</h1>
        <p className="text-indigo-300 mt-1">Platform management and analytics</p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Students", value: overview?.totalStudents ?? 0, icon: Users, color: "from-blue-500 to-indigo-600" },
          { label: "Total Lessons", value: overview?.totalLessons ?? 0, icon: BookOpen, color: "from-brand-gold to-orange-600" },
          { label: "Active Subscriptions", value: overview?.activeSubscriptions ?? 0, icon: CreditCard, color: "from-brand-emerald to-green-600" },
          { label: "Total Revenue", value: formatCents(overview?.totalRevenue ?? 0), icon: DollarSign, color: "from-brand-pink to-rose-600" },
        ].map(stat => (
          <div key={stat.label} className="card-glass p-4">
            <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3`}>
              <stat.icon className="h-5 w-5 text-white" />
            </div>
            <div className="text-2xl font-bold text-white font-display">{stat.value}</div>
            <div className="text-xs text-indigo-300 mt-0.5">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-indigo-700/40 pb-0">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-all -mb-px ${
              activeTab === tab.id
                ? "border-brand-gold text-brand-gold"
                : "border-transparent text-indigo-400 hover:text-white"
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === "overview" && (
        <div className="card-glass p-5">
          <h3 className="font-semibold text-white mb-4">Students</h3>
          {studentsLoading ? (
            <div className="flex justify-center py-6"><Loader2 className="h-5 w-5 text-brand-gold animate-spin" /></div>
          ) : students && students.length > 0 ? (
            <div className="space-y-2">
              {students.map(student => (
                <div key={student.id} className="flex items-center gap-3 rounded-xl border border-indigo-700/30 bg-white/5 p-3">
                  <div className="h-10 w-10 rounded-full flex items-center justify-center bg-gradient-to-br from-brand-gold to-brand-pink text-white text-xs font-bold overflow-hidden flex-shrink-0">
                    {student.avatarUrl ? (
                      <img src={student.avatarUrl} alt={student.fullName} className="h-full w-full rounded-full object-cover" />
                    ) : (
                      (student.fullName || "U").slice(0, 2).toUpperCase()
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-white truncate">{student.fullName || "Unnamed"}</p>
                    <p className="text-xs text-indigo-400">
                      Joined {new Date(student.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-indigo-300">No students found.</p>
          )}
        </div>
      )}
      {activeTab === "revenue" && <RevenueTab />}
      {activeTab === "coupons" && <CouponsTab />}
      {activeTab === "emails" && <EmailsTab />}
    </div>
  );
}
