import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FileSpreadsheet, FileUp, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const TABS = [
  { name: "Resume upload", path: "/dashboard/candidates", icon: FileUp, tone: "sky" },
  { name: "Browse candidates", path: "/dashboard/get-candidates", icon: Users, tone: "violet" },
  { name: "CSV upload", path: "/candidate/upload-csv", icon: FileSpreadsheet, tone: "emerald" },
];

const tabTone = {
  violet: "data-[active=true]:bg-violet-600 data-[active=true]:shadow-violet-500/30",
  sky: "data-[active=true]:bg-sky-600 data-[active=true]:shadow-sky-500/30",
  emerald: "data-[active=true]:bg-emerald-600 data-[active=true]:shadow-emerald-500/30",
};

function isTabActive(pathname, tabPath) {
  if (pathname === tabPath) return true;
  if (tabPath === "/dashboard/candidates" && pathname === "/candidate/upload-pdf") {
    return true;
  }
  return false;
}

export default function CandidateWorkspaceTabs({ className }) {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className={cn("flex flex-wrap gap-2 rounded-xl bg-slate-100/80 p-1.5 ring-1 ring-slate-200/80", className)}>
      {TABS.map((tab) => {
        const Icon = tab.icon;
        const isActive = isTabActive(location.pathname, tab.path);
        return (
          <Button
            key={tab.path}
            type="button"
            variant={isActive ? "default" : "ghost"}
            size="sm"
            data-active={isActive}
            className={cn(
              "gap-2 rounded-lg font-semibold shadow-none",
              !isActive && "text-slate-600 hover:bg-white hover:text-slate-900",
              isActive && cn("text-white shadow-md", tabTone[tab.tone])
            )}
            onClick={() => navigate(tab.path)}
          >
            <Icon className="size-4" aria-hidden />
            {tab.name}
          </Button>
        );
      })}
    </div>
  );
}
