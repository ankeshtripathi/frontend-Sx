import React, { useMemo } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import Sidebar from "./Sidebar";
import ResumeUploadPoller from "@/components/candidates/ResumeUploadPoller";
import { Badge } from "@/components/ui/badge";

function getHeaderUserLabel(user) {
  if (!user || typeof user !== "object") return null;
  const email = typeof user.email === "string" ? user.email.trim() : "";
  if (email && email.includes("@")) return email;
  const name = typeof user.name === "string" ? user.name.trim() : "";
  if (name) return name;
  return null;
}

const routeTitle = (pathname) => {
  if (pathname === "/" || pathname === "/dashboard") return "Overview";
  if (pathname.startsWith("/dashboard/candidates")) return "Add candidate";
  if (pathname.startsWith("/dashboard/get-candidates")) return "Candidates";
  if (pathname.startsWith("/dashboard/jobs")) return "Jobs & match";
  if (pathname.startsWith("/candidate/upload-pdf")) return "Upload resumes";
  if (pathname.startsWith("/candidate/upload-csv")) return "Upload CSV";
  return "Workspace";
};

export default function AppLayout() {
  const user = useSelector((state) => state.auth.user) || {};
  const location = useLocation();
  const title = useMemo(
    () => routeTitle(location.pathname),
    [location.pathname]
  );

  const userLabel = getHeaderUserLabel(user);

  return (
    <div className="workspace-shell flex h-dvh max-h-dvh w-full flex-col overflow-hidden md:flex-row">
      <ResumeUploadPoller />
      <Sidebar />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <header className="z-30 hidden shrink-0 border-b border-slate-200/80 bg-white/90 px-4 py-3.5 shadow-sm shadow-slate-200/40 backdrop-blur-xl md:flex md:items-center md:justify-between md:gap-4 md:px-8">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Workspace
            </p>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">{title}</h1>
          </div>
          {userLabel ? (
            <Badge
              variant="secondary"
              className="max-w-[260px] truncate font-normal text-slate-700"
              title={userLabel}
            >
              {userLabel}
            </Badge>
          ) : null}
        </header>

        <main className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-y-contain">
          <div className="mx-auto w-full max-w-[1600px] px-4 py-6 md:px-8 md:py-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
