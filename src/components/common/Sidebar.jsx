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
    },
    {
      key: "candidates",
      label: "Add candidate",
      to: "/dashboard/candidates",
      icon: UserPlus,
      perms: ["candidate.read"],
    },
    {
      key: "get-candidates",
      label: "Candidates",
      to: "/dashboard/get-candidates",
      icon: Users,
      perms: [],
    },
    {
      key: "jobs-match",
      label: "Jobs & match",
      to: "/dashboard/jobs",
      icon: Briefcase,
      perms: [],
    },
  ];

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

    const inner = (
      <div
        className={cn(
          "flex items-center gap-3 rounded-lg px-2 py-2 transition-colors",
          active
            ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
            : "text-sidebar-foreground/85 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
        )}
      >
        <span
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-md border border-transparent",
            active
              ? "bg-primary text-primary-foreground"
              : "bg-muted/80 text-muted-foreground"
          )}
        >
          <Icon className="size-4" aria-hidden />
        </span>
        {!collapsed ? (
          <span className="truncate text-sm font-medium">{item.label}</span>
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
    <div className="shrink-0 md:flex md:h-screen md:flex-col">
      <div className="sticky top-0 z-50 flex h-14 w-full shrink-0 items-center justify-between border-b border-border bg-background/95 px-3 backdrop-blur-md md:hidden">
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
          "fixed inset-y-0 left-0 z-50 flex w-[min(100%,18rem)] flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground shadow-lg transition-transform duration-300 ease-out md:static md:z-auto md:h-screen md:translate-x-0 md:shadow-none",
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
            <p className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
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
