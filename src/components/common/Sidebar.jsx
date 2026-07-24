import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Briefcase,
  Home,
  LogOut,
  Menu,
  PanelLeft,
  PanelLeftClose,
  Sparkles,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { logout, selectUser } from "../../store/auth/authSlice";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { appConfig } from "@/config/appConfig";
import { cn } from "@/lib/utils";

const basePath = import.meta.env.VITE_FRONTEND_BASE_PATH || "/";

const NAV_ACCENT = {
  sky: {
    active: "bg-sky-500/15 text-white ring-1 ring-sky-400/35",
    bar: "bg-sky-400",
    icon: "bg-sky-500 text-white shadow-lg shadow-sky-500/35",
    idle: "bg-white/5 text-slate-400 group-hover:bg-sky-500/20 group-hover:text-sky-200",
  },
  violet: {
    active: "bg-violet-500/15 text-white ring-1 ring-violet-400/35",
    bar: "bg-violet-400",
    icon: "bg-violet-500 text-white shadow-lg shadow-violet-500/35",
    idle: "bg-white/5 text-slate-400 group-hover:bg-violet-500/20 group-hover:text-violet-200",
  },
  emerald: {
    active: "bg-emerald-500/15 text-white ring-1 ring-emerald-400/35",
    bar: "bg-emerald-400",
    icon: "bg-emerald-500 text-white shadow-lg shadow-emerald-500/35",
    idle: "bg-white/5 text-slate-400 group-hover:bg-emerald-500/20 group-hover:text-emerald-200",
  },
  amber: {
    active: "bg-amber-500/15 text-white ring-1 ring-amber-400/35",
    bar: "bg-amber-400",
    icon: "bg-amber-500 text-white shadow-lg shadow-amber-500/35",
    idle: "bg-white/5 text-slate-400 group-hover:bg-amber-500/20 group-hover:text-amber-200",
  },
};

function userInitials(user) {
  const raw = String(user?.name || user?.email || "U").trim();
  const parts = raw.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0] || ""}${parts[1][0] || ""}`.toUpperCase();
  }
  return raw.slice(0, 2).toUpperCase() || "U";
}

export default function Sidebar() {
  const dispatch = useDispatch();
  const location = useLocation();
  const user = useSelector(selectUser) || {};
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!mobileMenuOpen) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileMenuOpen]);

  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem("lms_sidebarCollapsed") === "true";
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("lms_sidebarCollapsed", collapsed ? "true" : "false");
    } catch {
      /* ignore */
    }
  }, [collapsed]);

  const menu = useMemo(
    () => [
      {
        key: "home",
        label: "Overview",
        hint: "Pipeline command center",
        to: "/dashboard",
        icon: Home,
        accent: "sky",
      },
      {
        key: "candidates",
        label: "Add candidate",
        hint: "Resume intake",
        to: "/dashboard/candidates",
        icon: UserPlus,
        accent: "violet",
      },
      {
        key: "get-candidates",
        label: "Candidates",
        hint: "Search & filters",
        to: "/dashboard/get-candidates",
        icon: Users,
        accent: "emerald",
      },
      {
        key: "jobs-match",
        label: "Jobs & match",
        hint: "AI shortlisting",
        to: "/dashboard/jobs",
        icon: Briefcase,
        accent: "amber",
      },
    ],
    []
  );

  const isActive = (to) => {
    if (!to || to === "#") return false;
    if (to === "/dashboard" || to === "/") {
      return location.pathname === to || location.pathname === "/dashboard";
    }
    return location.pathname === to || location.pathname.startsWith(`${to}/`);
  };

  const logoSrc = `${basePath}${appConfig.logo}`.replace(/\/{2,}/g, "/");
  const mobileLogoSrc = `${basePath}impower_logo.jpg`.replace(/\/{2,}/g, "/");
  const displayName = user?.name || user?.email?.split("@")[0] || "Recruiter";
  const displayEmail = user?.email || "Signed in";

  const NavItem = ({ item }) => {
    const Icon = item.icon;
    const active = isActive(item.to);
    const accent = NAV_ACCENT[item.accent] || NAV_ACCENT.sky;

    const inner = (
      <div
        className={cn(
          "group relative flex items-center gap-3 overflow-hidden rounded-xl px-2 py-2 transition-all duration-200",
          active
            ? accent.active
            : "text-slate-400 hover:bg-white/[0.06] hover:text-slate-100"
        )}
      >
        {active ? (
          <span
            className={cn(
              "absolute inset-y-1.5 left-0 w-1 rounded-full",
              accent.bar
            )}
            aria-hidden
          />
        ) : null}
        <span
          className={cn(
            "relative flex size-9 shrink-0 items-center justify-center rounded-xl transition-all duration-200",
            active ? accent.icon : accent.idle
          )}
        >
          <Icon className="size-4" aria-hidden />
        </span>
        {!collapsed ? (
          <span className="min-w-0 flex-1">
            <span
              className={cn(
                "block truncate text-sm",
                active ? "font-bold text-white" : "font-semibold"
              )}
            >
              {item.label}
            </span>
            <span className="mt-0.5 block truncate text-[11px] font-medium text-slate-500 group-hover:text-slate-400">
              {item.hint}
            </span>
          </span>
        ) : null}
        {active && !collapsed ? (
          <span className="mr-1 size-1.5 shrink-0 rounded-full bg-white/80" aria-hidden />
        ) : null}
      </div>
    );

    const linkBody = (
      <Link
        to={item.to}
        className="block w-full outline-none focus-visible:ring-2 focus-visible:ring-sky-400/50 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 rounded-xl"
        aria-current={active ? "page" : undefined}
      >
        {inner}
      </Link>
    );

    if (collapsed) {
      return (
        <li key={item.key}>
          <Tooltip>
            <TooltipTrigger asChild>{linkBody}</TooltipTrigger>
            <TooltipContent side="right" className="font-semibold">
              {item.label}
            </TooltipContent>
          </Tooltip>
        </li>
      );
    }

    return <li key={item.key}>{linkBody}</li>;
  };

  return (
    <TooltipProvider delayDuration={200}>
      <div className="flex h-14 shrink-0 flex-col md:h-dvh md:max-h-dvh md:shrink-0">
        {/* Mobile top bar */}
        <div className="z-50 flex h-14 w-full shrink-0 items-center justify-between border-b border-slate-200/80 bg-white/90 px-3 shadow-sm backdrop-blur-md md:hidden">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="shrink-0 rounded-xl"
            onClick={() => setMobileMenuOpen((o) => !o)}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </Button>
          <img src={mobileLogoSrc} alt="" className="h-9 object-contain" />
          <span className="flex size-9 items-center justify-center rounded-full bg-slate-900 text-[11px] font-bold text-white">
            {userInitials(user)}
          </span>
        </div>

        {/* Mobile scrim */}
        <div
          className={cn(
            "fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm transition-opacity duration-300 md:hidden",
            mobileMenuOpen ? "opacity-100" : "pointer-events-none opacity-0"
          )}
          aria-hidden={!mobileMenuOpen}
          onClick={() => setMobileMenuOpen(false)}
        />

        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-50 flex w-[min(100%,18.5rem)] max-h-dvh flex-col overflow-hidden border-r border-white/10 bg-slate-950 text-slate-100 shadow-2xl shadow-slate-950/50 transition-[transform,width] duration-300 ease-out md:relative md:z-auto md:h-full md:max-h-dvh md:translate-x-0",
            "bg-[radial-gradient(ellipse_80%_50%_at_0%_-10%,rgba(56,189,248,0.22),transparent_55%),radial-gradient(ellipse_70%_45%_at_100%_110%,rgba(139,92,246,0.18),transparent_50%),linear-gradient(180deg,#020617_0%,#0f172a_55%,#1e1b4b_100%)]",
            mobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
            collapsed ? "md:w-[4.75rem]" : "md:w-64"
          )}
          aria-label="Main navigation"
        >
          {/* Ambient glow */}
          <div
            className="pointer-events-none absolute -left-16 top-24 size-40 rounded-full bg-sky-500/20 blur-3xl"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -right-10 bottom-32 size-36 rounded-full bg-violet-500/15 blur-3xl"
            aria-hidden
          />

          {/* Brand header */}
          <div className="relative flex items-center gap-2 border-b border-white/10 px-3 py-3.5">
            {!collapsed ? (
              <>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="shrink-0 rounded-xl border border-white/10 bg-white/5 text-slate-200 hover:bg-white/10 hover:text-white"
                  onClick={() => setCollapsed(true)}
                  aria-label="Collapse sidebar"
                >
                  <PanelLeftClose className="size-4" />
                </Button>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={logoSrc}
                      alt={appConfig.appName}
                      className="h-9 w-auto max-w-[7.5rem] object-contain"
                    />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold tracking-tight text-white">
                        Recruit ATS
                      </p>
                      <p className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-sky-300/80">
                        <Sparkles className="size-3" aria-hidden />
                        Workspace
                      </p>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="mx-auto rounded-xl border border-white/10 bg-white/5 text-slate-200 hover:bg-white/10 hover:text-white"
                    onClick={() => setCollapsed(false)}
                    aria-label="Expand sidebar"
                  >
                    <PanelLeft className="size-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">Expand sidebar</TooltipContent>
              </Tooltip>
            )}
          </div>

          {/* Nav */}
          <nav className="relative min-h-0 flex-1 overflow-y-auto overscroll-contain px-2.5 py-4">
            {!collapsed ? (
              <div className="mb-3 flex items-center justify-between px-2">
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
                  Navigate
                </p>
                <Badge className="h-5 border-0 bg-white/5 px-1.5 text-[10px] font-semibold text-slate-400 hover:bg-white/5">
                  {menu.length}
                </Badge>
              </div>
            ) : (
              <div className="mb-3 h-px bg-white/10" aria-hidden />
            )}
            <ul className="space-y-1.5">
              {menu.map((m) => (
                <NavItem key={m.key} item={m} />
              ))}
            </ul>
          </nav>

          {/* Footer: user + sign out */}
          <div className="relative space-y-2 border-t border-white/10 p-3">
            {!collapsed ? (
              <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2.5 backdrop-blur-sm">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-violet-600 text-xs font-bold text-white shadow-md shadow-sky-500/20">
                  {userInitials(user)}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-bold text-white">
                    {displayName}
                  </span>
                  <span className="block truncate text-[11px] font-medium text-slate-400">
                    {displayEmail}
                  </span>
                </span>
              </div>
            ) : (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="mx-auto flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-violet-600 text-[11px] font-bold text-white shadow-md">
                    {userInitials(user)}
                  </div>
                </TooltipTrigger>
                <TooltipContent side="right">{displayName}</TooltipContent>
              </Tooltip>
            )}

            {collapsed ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="w-full rounded-xl text-rose-300 hover:bg-rose-500/15 hover:text-rose-200"
                    onClick={() => dispatch(logout())}
                    aria-label="Sign out"
                  >
                    <LogOut className="size-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">Sign out</TooltipContent>
              </Tooltip>
            ) : (
              <Button
                type="button"
                variant="ghost"
                className="h-auto w-full justify-start gap-3 rounded-xl border border-white/10 bg-transparent px-3 py-2.5 text-left text-rose-200 hover:bg-rose-500/10 hover:text-rose-100"
                onClick={() => dispatch(logout())}
              >
                <span className="flex size-9 items-center justify-center rounded-lg bg-rose-500/15 text-rose-300">
                  <LogOut className="size-4" />
                </span>
                <span className="flex flex-col gap-0.5">
                  <span className="text-sm font-semibold">Sign out</span>
                  <span className="text-[11px] font-medium text-slate-500">
                    End this session
                  </span>
                </span>
              </Button>
            )}
          </div>
        </aside>
      </div>
    </TooltipProvider>
  );
}
