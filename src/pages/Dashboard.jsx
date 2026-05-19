import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import {
  ArrowRight,
  FileSpreadsheet,
  FileUp,
  Mail,
  Sparkles,
  UserRound,
  Users,
} from "lucide-react";
import { getCandidates } from "../api/candidate";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Spinner } from "@/components/ui/spinner";
import PageHero, { HeroGhostButton, HeroPrimaryButton } from "@/components/workspace/PageHero";
import MetricStatCard from "@/components/workspace/MetricStatCard";
import ContentPanel from "@/components/workspace/ContentPanel";
import WorkspacePage from "@/components/workspace/WorkspacePage";
import EmptyState from "@/components/workspace/EmptyState";
import AlertBanner from "@/components/workspace/AlertBanner";
import { WORKSPACE_TABLE_CLASS } from "@/components/workspace/workspace-table";
import { cn } from "@/lib/utils";

export default function Dashboard() {
  const user = useSelector((state) => state.auth.user) || {};
  const navigate = useNavigate();

  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCandidates = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getCandidates();
      setCandidates(Array.isArray(data) ? data : data?.items || []);
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Unable to fetch candidates.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border/80 bg-card/60 text-muted-foreground">
        <Spinner className="size-8 text-primary" />
        <p className="text-sm font-medium">Loading your pipeline…</p>
      </div>
    );
  }

  if (error) {
    return (
      <WorkspacePage>
        <AlertBanner>{error}</AlertBanner>
        <Button type="button" variant="outline" onClick={fetchCandidates}>
          Try again
        </Button>
      </WorkspacePage>
    );
  }

  const withEmail = candidates.filter((c) => c.email).length;
  const withResume = candidates.filter((c) => c.resumeUrl || c.resumeText).length;
  const displayName = user?.name || user?.email?.split("@")[0];

  return (
    <WorkspacePage>
      <PageHero
        eyebrow="Recruiting overview"
        title={displayName ? `Welcome back, ${displayName}` : "Welcome back"}
        description="Your talent pipeline at a glance — upload profiles, search candidates, and run AI job matching from one workspace."
        actions={
          <>
            <HeroPrimaryButton onClick={() => navigate("/dashboard/candidates")}>
              <FileUp className="size-4" aria-hidden />
              Upload resumes
            </HeroPrimaryButton>
            <HeroGhostButton onClick={() => navigate("/candidate/upload-csv")}>
              <FileSpreadsheet className="size-4" aria-hidden />
              Upload CSV
            </HeroGhostButton>
            <HeroGhostButton onClick={() => navigate("/dashboard/jobs")}>
              <Sparkles className="size-4" aria-hidden />
              AI matching
            </HeroGhostButton>
          </>
        }
        stats={[
          { label: "Total candidates", value: candidates.length },
          { label: "With email", value: withEmail },
          { label: "With resume", value: withResume },
        ]}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <MetricStatCard
          title="Total candidates"
          value={candidates.length}
          hint="In your workspace"
          icon={Users}
          tone="sky"
        />
        <MetricStatCard
          title="Reachable"
          value={withEmail}
          hint="Profiles with email"
          icon={Mail}
          tone="violet"
        />
        <MetricStatCard
          title="Resumes"
          value={withResume}
          hint="Ready for matching"
          icon={FileUp}
          tone="emerald"
        />
      </div>

      <ContentPanel
        accent="sky"
        title="Recent candidates"
        description="Latest profiles from uploads and imports."
        icon={UserRound}
        actions={
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-2 rounded-full"
            onClick={() => navigate("/dashboard/get-candidates")}
          >
            View all
            <ArrowRight className="size-4" aria-hidden />
          </Button>
        }
        noPadding={candidates.length > 0}
      >
        {candidates.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No candidates yet"
            description="Upload resumes or a CSV to start building your talent pool."
            action={
              <div className="flex flex-wrap justify-center gap-2">
                <Button type="button" onClick={() => navigate("/dashboard/candidates")}>
                  Upload resumes
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/candidate/upload-csv")}
                >
                  Upload CSV
                </Button>
              </div>
            }
          />
        ) : (
          <Table className={cn(WORKSPACE_TABLE_CLASS)}>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="hidden sm:table-cell">Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {candidates.slice(0, 8).map((candidate) => (
                <TableRow key={candidate.id}>
                    <TableCell className="font-bold text-slate-900">
                      {candidate.name || "Unnamed"}
                    </TableCell>
                  <TableCell className="text-muted-foreground">
                    {candidate.email ? (
                      candidate.email
                    ) : (
                      <Badge variant="outline" className="font-normal">
                        Missing
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="hidden text-muted-foreground sm:table-cell">
                    {candidate.createdAt
                      ? format(new Date(candidate.createdAt), "MMM d, yyyy")
                      : "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </ContentPanel>
    </WorkspacePage>
  );
}
