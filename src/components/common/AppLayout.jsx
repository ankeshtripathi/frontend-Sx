import React, { useMemo } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import Sidebar from "./Sidebar";
import { Badge } from "@/components/ui/badge";

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

  const display =
    user?.email ||
    user?.name ||
    (user?.id != null ? `User #${user.id}` : null);

  return (
    <div className="min-h-screen flex flex-col md:flex-row w-full bg-muted/40">
      <Sidebar />

      <div className="flex min-h-0 flex-1 min-w-0 flex-col">
        <header className="sticky top-0 z-30 hidden border-b border-border/80 bg-background/80 px-4 py-3 backdrop-blur-md md:flex md:items-center md:justify-between md:gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Workspace
            </p>
            <h1 className="text-lg font-semibold tracking-tight text-foreground">
              {title}
            </h1>
          </div>
          {display ? (
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="font-normal">
                {display}
              </Badge>
            </div>
          ) : null}
        </header>

        <main className="flex min-h-0 flex-1 min-w-0 flex-col">
          <div className="mx-auto w-full max-w-[1600px] flex-1 px-4 py-6 md:px-8 md:py-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
