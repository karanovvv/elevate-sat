import { Link, useNavigate, useLocation } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  GraduationCap,
  LayoutDashboard,
  BookOpen,
  Compass,
  Bookmark,
  BarChart3,
  User,
  LogOut,
  Sparkles,
  Flame,
  Bell,
  Menu,
  X,
} from "lucide-react";
import type { ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/Footer";
import { AiHelperSheet } from "@/components/AiHelperSheet";

const NAV = [
  { to: "/dashboard", label: "Главная", icon: LayoutDashboard },
  { to: "/practice", label: "Практика", icon: BookOpen },
  { to: "/test-prep", label: "Test Prep", icon: Compass },
  { to: "/free-resources", label: "Материалы", icon: Bookmark },
  { to: "/analytics", label: "Прогресс", icon: BarChart3 },
  { to: "/profile", label: "Профиль", icon: User },
] as const;

export function AppShell({
  children,
  title,
  subtitle,
}: {
  children: ReactNode;
  title?: string;
  subtitle?: string;
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="min-h-screen bg-[#080b14] text-[#e0e2ef] font-sans ambient-glow flex flex-col">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex fixed left-0 top-0 h-full w-72 bg-[#0b0e17]/80 backdrop-blur-2xl z-50 flex-col pt-8 border-r border-white/5 shadow-2xl">
        <div className="px-8 mb-10 flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-2xl bg-gradient-to-br from-[#8083ff] to-[#6001d1] text-white shadow-[0_0_20px_rgba(128,131,255,0.4)]">
            <GraduationCap className="size-6" />
          </span>
          <div className="flex flex-col">
            <span className="font-headline font-extrabold text-xl tracking-tight text-white">Elevate-SAT</span>
            <span className="text-[10px] uppercase tracking-widest text-[#8083ff] font-bold">MK Education</span>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          {NAV.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.to || (item.to !== "/dashboard" && location.pathname.startsWith(item.to));
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-4 px-5 py-3.5 rounded-xl transition-all font-medium text-sm ${
                  isActive
                    ? "bg-[#8083ff]/20 text-[#c0c1ff] font-bold border border-[#8083ff]/30 shadow-[0_0_15px_rgba(128,131,255,0.15)]"
                    : "text-[#c7c4d7] hover:bg-[#272a34]/50 hover:text-white"
                }`}
              >
                <Icon className={`size-5 ${isActive ? "text-[#c0c1ff]" : "text-[#908fa0]"}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 m-4 rounded-2xl bg-gradient-to-br from-[#1c1f29] to-[#181b25] border border-white/5 flex flex-col gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#d2bbff]">
            <Sparkles className="size-4 text-[#d2bbff] animate-pulse" />
            <span>AI Tutor Active</span>
          </div>
          <p className="text-xs text-[#c7c4d7]/70 leading-relaxed">
            Спрашивай наводящие подсказки у своего ИИ-репетитора во время практики.
          </p>
          <Button
            size="sm"
            variant="ghost"
            className="w-full justify-start gap-2 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 mt-1"
            onClick={signOut}
          >
            <LogOut className="size-3.5" />
            <span>Выйти из аккаунта</span>
          </Button>
        </div>
      </aside>

      {/* Header */}
      <header className="fixed top-0 left-0 md:left-72 right-0 h-20 bg-[#080b14]/70 backdrop-blur-md z-40 flex items-center justify-between md:justify-end px-6 border-b border-white/5">
        <div className="flex items-center gap-3 md:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl bg-[#1c1f29] border border-white/10 text-white"
          >
            {mobileMenuOpen ? <X className="size-6" /> : <Menu className="size-6" />}
          </button>
          <Link to="/dashboard" className="flex items-center gap-2 font-bold text-white">
            <span className="grid size-8 place-items-center rounded-xl bg-gradient-to-br from-[#8083ff] to-[#6001d1]">
              <GraduationCap className="size-4 text-white" />
            </span>
            <span className="font-headline font-bold">Elevate-SAT</span>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-[#1c1f29]/80 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 shadow-lg">
            <Flame className="size-4 text-[#d2bbff] animate-bounce" />
            <span className="text-xs font-semibold text-white">14 Day Streak</span>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="rounded-full size-10 text-[#c7c4d7] hover:bg-[#272a34] hover:text-white"
            onClick={signOut}
            title="Выйти"
          >
            <LogOut className="size-4" />
          </Button>
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 top-20 z-50 bg-[#080b14]/95 backdrop-blur-xl p-6 flex flex-col gap-3 md:hidden">
          <nav className="flex flex-col gap-2">
            {NAV.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-4 px-5 py-4 rounded-xl text-base font-semibold text-[#e0e2ef] bg-[#1c1f29] border border-white/5 active:bg-[#8083ff]/20"
                >
                  <Icon className="size-5 text-[#8083ff]" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
          <Button
            variant="outline"
            className="mt-auto w-full gap-2 border-rose-500/30 text-rose-400 bg-rose-500/10 py-6"
            onClick={signOut}
          >
            <LogOut className="size-4" />
            <span>Выйти из профиля</span>
          </Button>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 md:pl-72 pt-20 flex flex-col min-h-screen">
        <main className="flex-1 px-4 sm:px-8 py-8 max-w-7xl mx-auto w-full">
          {title ? (
            <div className="mb-8">
              <h1 className="text-3xl sm:text-4xl font-headline font-extrabold tracking-tight text-white">{title}</h1>
              {subtitle ? <p className="mt-2 text-sm text-[#c7c4d7] max-w-2xl">{subtitle}</p> : null}
            </div>
          ) : null}
          {children}
        </main>

        <Footer />
      </div>

      <AiHelperSheet floating />

      {/* Mobile Navigation Bar */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-[#0b0e17]/95 backdrop-blur-xl md:hidden">
        <div className="mx-auto flex max-w-md">
          {NAV.slice(0, 5).map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex flex-1 flex-col items-center gap-1 py-3 text-[11px] font-semibold transition-colors ${
                  isActive ? "text-[#c0c1ff]" : "text-[#908fa0]"
                }`}
              >
                <Icon className="size-5" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
