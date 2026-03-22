import { useState, type ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/cn";
import {
  Brain,
  LayoutDashboard,
  BookOpen,
  Map,
  Target,
  Award,
  BookMarked,
  Bell,
  CreditCard,
  LogOut,
  Menu,
  X,
  Loader2,
  User,
  ShieldCheck,
  Users,
  Zap,
  Flame,
  BarChart3,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/lessons", label: "My Lessons", icon: BookOpen },
  { href: "/check-in", label: "Daily Check-In", icon: Flame },
  { href: "/community", label: "Community", icon: Users },
  { href: "/roadmap", label: "9-Day Roadmap", icon: Map },
  { href: "/goals", label: "My Goals", icon: Target },
  { href: "/reports", label: "Progress Reports", icon: BarChart3 },
  { href: "/achievements", label: "Achievements", icon: Award },
  { href: "/journal", label: "Journal", icon: BookMarked },
  { href: "/notifications", label: "Notifications", icon: Bell },
];

const bottomNavItems = [
  { href: "/billing", label: "Billing", icon: CreditCard },
  { href: "/profile", label: "Profile", icon: User },
];

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, isLoading, isAuthenticated, logout, isLoggingOut } = useAuth();
  const [location] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { data: profile } = useQuery<{ role: string }>({
    queryKey: ["/api/profile"],
    queryFn: async () => {
      const res = await fetch("/api/profile", { credentials: "include" });
      if (!res.ok) return { role: "student" };
      return res.json();
    },
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 5,
  });

  const roleNavItems = [
    ...(profile?.role === "admin" ? [{ href: "/admin", label: "Admin", icon: ShieldCheck }] : []),
    ...(profile?.role === "consultant" ? [{ href: "/consultant", label: "My Students", icon: Users }] : []),
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-brand-navy">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-brand-gold to-brand-pink flex items-center justify-center shadow-orange-glow">
            <Brain className="h-6 w-6 text-white" />
          </div>
          <Loader2 className="h-6 w-6 text-brand-gold animate-spin" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    window.location.href = "/api/login";
    return null;
  }

  const userName = user?.firstName || user?.username || "User";
  const initials = userName.slice(0, 2).toUpperCase();

  const isActive = (href: string) => {
    if (href === "/dashboard") return location === "/dashboard" || location === "/";
    return location.startsWith(href);
  };

  const renderNavLink = (item: typeof navItems[0]) => (
    <Link
      key={item.href}
      href={item.href}
      onClick={() => setSidebarOpen(false)}
      className={cn(
        "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
        isActive(item.href)
          ? "bg-gradient-to-r from-brand-gold/20 to-brand-pink/10 text-brand-gold border border-brand-gold/30 shadow-sm"
          : "text-indigo-300 hover:text-white hover:bg-white/8"
      )}
    >
      <item.icon className={cn(
        "h-4 w-4 flex-shrink-0 transition-colors",
        isActive(item.href) ? "text-brand-gold" : "text-indigo-400"
      )} />
      <span className="truncate">{item.label}</span>
      {isActive(item.href) && (
        <span className="ml-auto h-1.5 w-1.5 rounded-full bg-brand-gold" />
      )}
    </Link>
  );

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 px-5 border-b border-indigo-700/40">
        <div className="h-9 w-9 flex items-center justify-center rounded-xl bg-gradient-to-br from-brand-gold to-brand-pink shadow-orange-glow">
          <Brain className="h-5 w-5 text-white" />
        </div>
        <div>
          <span className="font-display text-lg font-bold text-white leading-none">
            Paradigm <span className="text-brand-gold">Pro</span>
          </span>
          <div className="flex items-center gap-1 mt-0.5">
            <Zap className="h-2.5 w-2.5 text-brand-pink" />
            <span className="text-xs text-indigo-400 font-medium">Thinking Into Results</span>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-5 px-3 space-y-1">
        <p className="px-3 mb-2 text-xs font-bold text-indigo-500 uppercase tracking-widest">
          My Program
        </p>
        {navItems.map(renderNavLink)}
      </nav>

      {/* Bottom nav */}
      <div className="border-t border-indigo-700/40 px-3 py-4 space-y-1">
        {roleNavItems.length > 0 && (
          <>
            <p className="px-3 mb-2 text-xs font-bold text-indigo-500 uppercase tracking-widest">
              Management
            </p>
            {roleNavItems.map(renderNavLink)}
          </>
        )}
        {bottomNavItems.map(renderNavLink)}

        {/* User card */}
        <div className="mt-3 mx-1 rounded-xl bg-gradient-to-r from-brand-gold/10 to-brand-pink/10 border border-brand-gold/20 p-3 flex items-center gap-3">
          <div className="h-8 w-8 rounded-full flex items-center justify-center bg-gradient-to-br from-brand-gold to-brand-pink text-white text-xs font-bold flex-shrink-0 overflow-hidden">
            {user?.profileImageUrl ? (
              <img src={user.profileImageUrl} alt={userName} className="h-full w-full object-cover" />
            ) : (
              initials
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-white truncate">{userName}</p>
            <p className="text-xs text-indigo-400 truncate">Active member</p>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <div className="flex h-screen bg-brand-navy">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-64 flex-col border-r border-indigo-800/50 bg-brand-navy-mid flex-shrink-0 shadow-[4px_0_24px_rgba(0,0,0,0.3)]">
        {sidebarContent}
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="fixed left-0 top-0 bottom-0 w-72 flex flex-col bg-brand-navy-mid z-50 shadow-2xl animate-slide-in">
            <button
              onClick={() => setSidebarOpen(false)}
              className="absolute top-4 right-4 h-8 w-8 flex items-center justify-center rounded-lg bg-white/10 text-indigo-300 hover:text-white hover:bg-white/20 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
            {sidebarContent}
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top header */}
        <header className="flex h-16 items-center justify-between border-b border-indigo-800/50 bg-brand-navy-mid/90 backdrop-blur-md px-5 flex-shrink-0 shadow-sm">
          <div className="flex items-center gap-4">
            {/* Hamburger */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden h-9 w-9 flex items-center justify-center rounded-xl bg-white/8 text-indigo-300 hover:text-white hover:bg-white/15 transition-colors"
            >
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="text-white font-semibold hidden sm:block text-sm">
              Welcome back,{" "}
              <span className="text-brand-gold font-bold">{userName}</span> 👋
            </h1>
          </div>

          <div className="flex items-center gap-2">
            {/* Notifications */}
            <Link
              href="/notifications"
              className="relative h-9 w-9 flex items-center justify-center rounded-xl hover:bg-white/10 text-indigo-300 hover:text-white transition-colors"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-brand-gold shadow-orange-glow" />
            </Link>

            {/* Avatar */}
            <div className="h-9 w-9 rounded-full overflow-hidden flex items-center justify-center bg-gradient-to-br from-brand-gold to-brand-pink text-white text-xs font-bold border-2 border-brand-gold/40">
              {user?.profileImageUrl ? (
                <img src={user.profileImageUrl} alt={userName} className="h-full w-full object-cover" />
              ) : (
                initials
              )}
            </div>

            <span className="text-sm text-indigo-300 font-medium hidden sm:block">{userName}</span>

            {/* Logout */}
            <button
              onClick={() => logout()}
              disabled={isLoggingOut}
              className="flex items-center gap-1.5 text-sm text-indigo-400 hover:text-red-400 transition-colors disabled:opacity-60 ml-1"
            >
              {isLoggingOut ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
