import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
  Briefcase,
  Home,
  LogOut,
  Menu,
  PanelLeftClose,
  PanelLeft,
  UserPlus,
  Users,
} from "lucide-react";
import { logout } from "../../store/auth/authSlice";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { appConfig } from "@/config/appConfig";
import { cn } from "@/lib/utils";

const basePath = import.meta.env.VITE_FRONTEND_BASE_PATH || "/";

export default function Sidebar() {
  const dispatch = useDispatch();
  const location = useLocation();
  const [expandedMenus, setExpandedMenus] = useState({});
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

  const hasAny = () => true;

  const menu = [
    {
      key: "home",
      label: "Overview",
      to: "/dashboard",
      icon: Home,
      perms: [],
      accent: "sky",
    },
    {
      key: "candidates",
      label: "Add candidate",
      to: "/dashboard/candidates",
      icon: UserPlus,
      perms: ["candidate.read"],
      accent: "violet",
    },
    {
      key: "get-candidates",
      label: "Candidates",
      to: "/dashboard/get-candidates",
      icon: Users,
      perms: [],
      accent: "emerald",
    },
    {
      key: "jobs-match",
      label: "Jobs & match",
      to: "/dashboard/jobs",
      icon: Briefcase,
      perms: [],
      accent: "amber",
    },
  ];

  const navAccent = {
    sky: {
      active: "border-sky-400/60 bg-sky-500/15",
      icon: "bg-sky-500 text-white shadow-sky-500/40 shadow-sm",
      idle: "bg-slate-800 text-slate-400 group-hover:bg-sky-500/20 group-hover:text-sky-300",
    },
    violet: {
      active: "border-violet-400/60 bg-violet-500/15",
      icon: "bg-violet-500 text-white shadow-violet-500/40 shadow-sm",
      idle: "bg-slate-800 text-slate-400 group-hover:bg-violet-500/20 group-hover:text-violet-300",
    },
    emerald: {
      active: "border-emerald-400/60 bg-emerald-500/15",
      icon: "bg-emerald-500 text-white shadow-emerald-500/40 shadow-sm",
      idle: "bg-slate-800 text-slate-400 group-hover:bg-emerald-500/20 group-hover:text-emerald-300",
    },
    amber: {
      active: "border-amber-400/60 bg-amber-500/15",
      icon: "bg-amber-500 text-white shadow-amber-500/40 shadow-sm",
      idle: "bg-slate-800 text-slate-400 group-hover:bg-amber-500/20 group-hover:text-amber-300",
    },
  };

  const isActive = (to) => {
    if (!to || to === "#") return false;
    if (to === "/dashboard" || to === "/")
      return location.pathname === to || location.pathname === "/dashboard";
    return location.pathname === to || location.pathname.startsWith(`${to}/`);
  };

  const logoSrc = `${basePath}${appConfig.logo}`.replace(/\/{2,}/g, "/");
  const mobileLogoSrc = `${basePath}impower_logo.jpg`.replace(/\/{2,}/g, "/");

  const NavItem = ({ item }) => {
    if (!hasAny(item.perms)) return null;
    const Icon = item.icon;
    const active = isActive(item.to);
    const topHasSub = Array.isArray(item.subItems) && item.subItems.length > 0;

    const accent = navAccent[item.accent] || navAccent.sky;

    const inner = (
      <div
        className={cn(
          "group flex items-center gap-3 rounded-xl border border-transparent px-2 py-2 transition-all",
          active
            ? cn("border-l-[3px] pl-[5px] text-white shadow-sm", accent.active)
            : "text-slate-400 hover:border-slate-700 hover:bg-slate-800/80 hover:text-slate-200"
        )}
      >
        <span
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-lg",
            active ? accent.icon : accent.idle
          )}
        >
          <Icon className="size-4" aria-hidden />
        </span>
        {!collapsed ? (
          <span className={cn("truncate text-sm", active ? "font-bold" : "font-medium")}>
            {item.label}
          </span>
        ) : null}
      </div>
    );

    if (topHasSub) {
      return (
        <li key={item.key}>
          <button
            type="button"
            onClick={() =>
              setExpandedMenus((s) => ({ ...s, [item.key]: !s[item.key] }))
            }
            className="w-full text-left"
          >
            {inner}
          </button>
        </li>
      );
    }

    const linkBody = (
      <Link to={item.to} className="block w-full">
        {inner}
      </Link>
    );

    if (collapsed) {
      return (
        <li key={item.key}>
          <Tooltip>
            <TooltipTrigger asChild>{linkBody}</TooltipTrigger>
            <TooltipContent side="right" className="font-medium">
              {item.label}
            </TooltipContent>
          </Tooltip>
        </li>
      );
    }

    return <li key={item.key}>{linkBody}</li>;
  };

  return (
    <div className="flex h-14 shrink-0 flex-col md:h-dvh md:max-h-dvh md:shrink-0">
      <div className="z-50 flex h-14 w-full shrink-0 items-center justify-between border-b border-border bg-background/95 px-3 backdrop-blur-md md:hidden">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="shrink-0"
          onClick={() => setMobileMenuOpen((o) => !o)}
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
        >
          <Menu className="size-5" />
        </Button>
        <img src={mobileLogoSrc} alt="" className="h-9 object-contain" />
        <span className="w-9" aria-hidden />
      </div>

      <div
        className={cn(
          "fixed inset-0 z-40 bg-background/80 backdrop-blur-sm transition-opacity md:hidden",
          mobileMenuOpen ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        aria-hidden={!mobileMenuOpen}
        onClick={() => setMobileMenuOpen(false)}
      />

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[min(100%,18rem)] max-h-dvh flex-col border-r border-sidebar-border bg-gradient-to-b from-slate-900 via-slate-900 to-indigo-950 text-sidebar-foreground shadow-xl shadow-slate-900/40 transition-transform duration-300 ease-out md:relative md:z-auto md:h-full md:max-h-dvh md:translate-x-0",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
          collapsed ? "md:w-[4.5rem]" : "md:w-64"
        )}
        aria-label="Main navigation"
      >
        <div className="flex items-center gap-2 border-b border-sidebar-border px-3 py-3">
          {!collapsed ? (
            <>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="shrink-0 border-sidebar-border bg-sidebar-accent/30"
                onClick={() => setCollapsed(true)}
                aria-label="Collapse sidebar"
              >
                <PanelLeftClose className="size-4" />
              </Button>
              <img src={logoSrc} alt={appConfig.appName} className="h-10 object-contain" />
            </>
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="mx-auto border-sidebar-border bg-sidebar-accent/30"
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

        <ScrollArea className="flex-1 min-h-0">
          <nav className="px-2 py-4">
            <p className="mb-2 px-2 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">
              {!collapsed ? "Navigate" : ""}
            </p>
            <ul className="space-y-1">
              {menu.map((m) => (
                <NavItem key={m.key} item={m} />
              ))}
            </ul>
          </nav>
        </ScrollArea>

        <div className="border-t border-sidebar-border p-3">
          {collapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="w-full text-destructive hover:bg-destructive/10 hover:text-destructive"
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
              variant="outline"
              className="h-auto w-full justify-start gap-3 border-sidebar-border py-3 text-left text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={() => dispatch(logout())}
            >
              <span className="flex size-9 items-center justify-center rounded-md bg-muted">
                <LogOut className="size-4" />
              </span>
              <span className="flex flex-col gap-0.5">
                <span className="text-sm font-medium">Sign out</span>
                <span className="text-xs font-normal text-muted-foreground">
                  End session
                </span>
              </span>
            </Button>
          )}
        </div>
      </aside>
    </div>
  );
}
