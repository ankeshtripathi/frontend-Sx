import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { format, formatDistanceToNow, isAfter, subDays } from "date-fns";
import {
  ArrowRight,
  BriefcaseBusiness,
  FileSpreadsheet,
  FileText,
  FileUp,
  Mail,
  RefreshCw,
  SearchCheck,
  Sparkles,
  TrendingUp,
  UserRound,
  Users,
} from "lucide-react";
import { getCandidates } from "@/api/candidate";
import { getJobs, omitJobEmbedding } from "@/api/jobs";
import { getSkills } from "@/lib/candidate-format";
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
import PageHero, {
  HeroGhostButton,
  HeroPrimaryButton,
} from "@/components/workspace/PageHero";
import MetricStatCard from "@/components/workspace/MetricStatCard";
import ContentPanel from "@/components/workspace/ContentPanel";
import WorkspacePage from "@/components/workspace/WorkspacePage";
import EmptyState from "@/components/workspace/EmptyState";
import AlertBanner from "@/components/workspace/AlertBanner";
import CandidateAvatar from "@/components/workspace/CandidateAvatar";
import {
  WORKSPACE_TABLE_CLASS,
  WORKSPACE_TABLE_SCROLL_CLASS,
} from "@/components/workspace/workspace-table";
import { cn } from "@/lib/utils";

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                   */
/* -------------------------------------------------------------------------- */

function greetingForNow(date = new Date()) {
  const hour = date.getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function safeDate(value) {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** 0–100 score: contact + resume + skills + location + role signal. */
function profileCompleteness(c) {
  let score = 0;
  if (c?.name) score += 15;
  if (c?.email) score += 25;
  if (c?.phone) score += 10;
  if (c?.resumeUrl || c?.resumeText) score += 20;
  if (getSkills(c?.skills).length) score += 15;
  if (c?.currentLocation || c?.preferredLocation || c?.hometown) score += 10;
  if (c?.currentDesignation || c?.currentCompany) score += 5;
  return score;
}

function completenessTone(score) {
  if (score >= 80) return "bg-emerald-500";
  if (score >= 50) return "bg-amber-500";
  return "bg-rose-400";
}

/* -------------------------------------------------------------------------- */
/*  Small UI pieces                                                           */
/* -------------------------------------------------------------------------- */

function QuickAction({
  title,
  description,
  icon: Icon,
  onClick,
  tone = "sky",
}) {
  const tones = {
    sky: "from-sky-500 to-sky-600 shadow-sky-500/25 ring-sky-200/80 hover:shadow-sky-500/35",
    emerald:
      "from-emerald-500 to-emerald-600 shadow-emerald-500/25 ring-emerald-200/80 hover:shadow-emerald-500/35",
    violet:
      "from-violet-500 to-violet-600 shadow-violet-500/25 ring-violet-200/80 hover:shadow-violet-500/35",
    amber:
      "from-amber-500 to-amber-600 shadow-amber-500/25 ring-amber-200/80 hover:shadow-amber-500/35",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group relative flex w-full flex-col overflow-hidden rounded-2xl border border-white/20 bg-gradient-to-br p-5 text-left text-white shadow-lg ring-1 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2",
        tones[tone]
      )}
    >
      <span
        className="pointer-events-none absolute -right-6 -top-6 size-24 rounded-full bg-white/15 blur-2xl transition-transform duration-500 group-hover:scale-125"
        aria-hidden
      />
      <span className="relative flex size-11 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
        <Icon className="size-5" aria-hidden />
      </span>
      <span className="relative mt-4 text-base font-bold tracking-tight">
        {title}
      </span>
      <span className="relative mt-1 text-sm font-medium text-white/80">
        {description}
      </span>
      <span className="relative mt-4 inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wide text-white/90">
        Open
        <ArrowRight className="size-3.5 transition-transform duration-300 group-hover:translate-x-1" />
      </span>
    </button>
  );
}

function HealthBar({ label, value, total, tone = "emerald" }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  const bar = {
    emerald: "bg-emerald-500",
    sky: "bg-sky-500",
    violet: "bg-violet-500",
    amber: "bg-amber-500",
  }[tone];

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2 text-sm">
        <span className="font-semibold text-slate-700">{label}</span>
        <span className="tabular-nums font-bold text-slate-900">
          {value}
          <span className="font-medium text-slate-400"> / {total}</span>
          <span className="ml-1.5 text-xs font-semibold text-slate-500">
            {pct}%
          </span>
        </span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-700 ease-out",
            bar
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function SkeletonBlock({ className }) {
  return (
    <div
      className={cn("animate-pulse rounded-2xl bg-slate-200/70", className)}
      aria-hidden
    />
  );
}

/* -------------------------------------------------------------------------- */
/*  Page                                                                      */
/* -------------------------------------------------------------------------- */

export default function Dashboard() {
  const user = useSelector((state) => state.auth.user) || {};
  const navigate = useNavigate();

  const [candidates, setCandidates] = useState([]);
  const [candidateTotal, setCandidateTotal] = useState(0);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const loadDashboard = useCallback(async ({ soft = false } = {}) => {
    if (soft) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const [candidateRes, jobsRes] = await Promise.all([
        getCandidates({ page: 1, limit: 12 }),
        getJobs().catch(() => null),
      ]);

      const items = Array.isArray(candidateRes)
        ? candidateRes
        : candidateRes?.items || [];
      const total =
        candidateRes?.pagination?.total ??
        (Array.isArray(candidateRes) ? candidateRes.length : items.length);

      setCandidates(items);
      setCandidateTotal(total);

      const jobList = Array.isArray(jobsRes)
        ? jobsRes
        : jobsRes?.items || jobsRes?.jobs || [];
      setJobs(jobList.map(omitJobEmbedding).filter(Boolean));
    } catch (err) {
      console.error("Dashboard fetch error:", err);
      setError("Unable to load your recruiting overview.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const metrics = useMemo(() => {
    const withEmail = candidates.filter((c) => c.email).length;
    const withResume = candidates.filter(
      (c) => c.resumeUrl || c.resumeText
    ).length;
    const withSkills = candidates.filter((c) => getSkills(c.skills).length > 0)
      .length;
    const withLocation = candidates.filter(
      (c) => c.currentLocation || c.preferredLocation || c.hometown
    ).length;
    const weekAgo = subDays(new Date(), 7);
    const addedThisWeek = candidates.filter((c) => {
      const d = safeDate(c.createdAt);
      return d && isAfter(d, weekAgo);
    }).length;
    const avgCompleteness = candidates.length
      ? Math.round(
          candidates.reduce((sum, c) => sum + profileCompleteness(c), 0) /
            candidates.length
        )
      : 0;

    return {
      withEmail,
      withResume,
      withSkills,
      withLocation,
      addedThisWeek,
      avgCompleteness,
      sampleSize: candidates.length,
    };
  }, [candidates]);

  const recentCandidates = useMemo(() => {
    return [...candidates]
      .sort((a, b) => {
        const da = safeDate(a.createdAt)?.getTime() || 0;
        const db = safeDate(b.createdAt)?.getTime() || 0;
        return db - da;
      })
      .slice(0, 8);
  }, [candidates]);

  const recentJobs = useMemo(() => {
    return [...jobs]
      .sort((a, b) => {
        const da = safeDate(a.createdAt || a.updatedAt)?.getTime() || 0;
        const db = safeDate(b.createdAt || b.updatedAt)?.getTime() || 0;
        return db - da;
      })
      .slice(0, 4);
  }, [jobs]);

  const displayName =
    user?.name || user?.email?.split("@")[0] || "recruiter";
  const todayLabel = format(new Date(), "EEEE, MMM d");

  /* ---- Loading skeleton (non-blocking shell) ---- */
  if (loading) {
    return (
      <WorkspacePage>
        <SkeletonBlock className="h-48 w-full rounded-3xl" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonBlock key={i} className="h-28" />
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonBlock key={i} className="h-36" />
          ))}
        </div>
        <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
          <SkeletonBlock className="h-80" />
          <SkeletonBlock className="h-80" />
        </div>
      </WorkspacePage>
    );
  }

  if (error && candidates.length === 0) {
    return (
      <WorkspacePage>
        <AlertBanner>{error}</AlertBanner>
        <Button type="button" variant="outline" onClick={() => loadDashboard()}>
          Try again
        </Button>
      </WorkspacePage>
    );
  }

  return (
    <WorkspacePage>
      <PageHero
        eyebrow={`${todayLabel} · Recruiting command`}
        title={`${greetingForNow()}, ${displayName}`}
        description="Your talent pipeline at a glance — upload, search, and AI-match candidates from one premium workspace."
        actions={
          <>
            <HeroPrimaryButton
              onClick={() => navigate("/dashboard/candidates")}
            >
              <FileUp className="size-4" aria-hidden />
              Upload resumes
            </HeroPrimaryButton>
            <HeroGhostButton onClick={() => navigate("/dashboard/jobs")}>
              <Sparkles className="size-4" aria-hidden />
              AI matching
            </HeroGhostButton>
            <HeroGhostButton
              onClick={() => loadDashboard({ soft: true })}
              disabled={refreshing}
            >
              <RefreshCw
                className={cn("size-4", refreshing && "animate-spin")}
                aria-hidden
              />
              Refresh
            </HeroGhostButton>
          </>
        }
        stats={[
          {
            label: "Candidates",
            value: candidateTotal,
            tone: "emerald",
          },
          {
            label: "Open jobs",
            value: jobs.length,
            tone: "sky",
          },
          {
            label: "Pool health",
            value: `${metrics.avgCompleteness}%`,
            tone: "violet",
          },
        ]}
      />

      {error ? <AlertBanner>{error}</AlertBanner> : null}

      {/* KPI strip */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricStatCard
          title="Talent pool"
          value={candidateTotal}
          hint="Total candidates"
          icon={Users}
          tone="sky"
        />
        <MetricStatCard
          title="Reachable"
          value={metrics.withEmail}
          hint={`Of ${metrics.sampleSize || "—"} recent shown`}
          icon={Mail}
          tone="violet"
        />
        <MetricStatCard
          title="Resume-ready"
          value={metrics.withResume}
          hint="Ready for AI match"
          icon={FileText}
          tone="emerald"
        />
        <MetricStatCard
          title="Added this week"
          value={metrics.addedThisWeek}
          hint="In latest page"
          icon={TrendingUp}
          tone="amber"
        />
      </div>

      {/* Quick actions — primary workflows */}
      <section aria-label="Quick actions">
        <div className="mb-3 flex items-end justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500">
              Quick actions
            </h2>
            <p className="mt-0.5 text-sm font-medium text-slate-600">
              Jump into the workflows you use every day.
            </p>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <QuickAction
            title="Upload resumes"
            description="PDF / DOC batch ingest with live progress"
            icon={FileUp}
            tone="sky"
            onClick={() => navigate("/dashboard/candidates")}
          />
          <QuickAction
            title="Import CSV"
            description="Bulk profiles with skills & location"
            icon={FileSpreadsheet}
            tone="emerald"
            onClick={() => navigate("/candidate/upload-csv")}
          />
          <QuickAction
            title="Search pool"
            description="Smart filters across the talent database"
            icon={SearchCheck}
            tone="violet"
            onClick={() => navigate("/dashboard/get-candidates")}
          />
          <QuickAction
            title="AI job match"
            description="Rank candidates against a JD instantly"
            icon={Sparkles}
            tone="amber"
            onClick={() => navigate("/dashboard/jobs")}
          />
        </div>
      </section>

      {/* Pipeline health + recent jobs */}
      <div className="grid gap-6 xl:grid-cols-2">
        <ContentPanel
          accent="emerald"
          title="Pipeline health"
          description="Completeness of recently loaded profiles — stronger data means better matches."
          icon={TrendingUp}
        >
          <div className="space-y-5">
            <div className="flex items-center justify-between rounded-2xl border border-emerald-100 bg-gradient-to-r from-emerald-50 to-white px-4 py-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-emerald-700/80">
                  Avg. profile score
                </p>
                <p className="mt-1 text-3xl font-bold tabular-nums text-emerald-950">
                  {metrics.avgCompleteness}
                  <span className="text-lg text-emerald-600/70">%</span>
                </p>
              </div>
              <div className="flex size-14 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-600/25">
                <TrendingUp className="size-6" aria-hidden />
              </div>
            </div>

            <HealthBar
              label="With email"
              value={metrics.withEmail}
              total={metrics.sampleSize}
              tone="violet"
            />
            <HealthBar
              label="With resume / text"
              value={metrics.withResume}
              total={metrics.sampleSize}
              tone="emerald"
            />
            <HealthBar
              label="With skills"
              value={metrics.withSkills}
              total={metrics.sampleSize}
              tone="sky"
            />
            <HealthBar
              label="With location"
              value={metrics.withLocation}
              total={metrics.sampleSize}
              tone="amber"
            />

            {metrics.sampleSize === 0 ? (
              <p className="text-sm text-muted-foreground">
                Upload candidates to start measuring pool quality.
              </p>
            ) : (
              <p className="text-xs font-medium text-slate-500">
                Based on the {metrics.sampleSize} most recent profiles loaded for
                this overview.
              </p>
            )}
          </div>
        </ContentPanel>

        <ContentPanel
          accent="violet"
          title="Open jobs"
          description="Latest roles ready for AI matching."
          icon={BriefcaseBusiness}
          actions={
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => navigate("/dashboard/jobs")}
            >
              Manage jobs
              <ArrowRight className="size-4" aria-hidden />
            </Button>
          }
          noPadding={recentJobs.length > 0}
        >
          {recentJobs.length === 0 ? (
            <EmptyState
              icon={BriefcaseBusiness}
              title="No jobs yet"
              description="Create or upload a job description to start matching."
              action={
                <Button
                  type="button"
                  onClick={() => navigate("/dashboard/jobs")}
                >
                  Go to jobs
                </Button>
              }
            />
          ) : (
            <ul className="divide-y divide-slate-100">
              {recentJobs.map((job) => {
                const skillCount = Array.isArray(job.skills)
                  ? job.skills.length
                  : getSkills(job.skills).length;
                const when = safeDate(job.createdAt || job.updatedAt);
                return (
                  <li key={job.id}>
                    <button
                      type="button"
                      className="flex w-full items-start gap-3 px-4 py-3.5 text-left transition-colors hover:bg-violet-50/50 sm:px-6"
                      onClick={() => navigate("/dashboard/jobs")}
                    >
                      <span className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-700">
                        <BriefcaseBusiness className="size-4" aria-hidden />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-bold text-slate-900">
                          {job.title || "Untitled role"}
                        </span>
                        <span className="mt-0.5 block truncate text-sm text-slate-500">
                          {job.company || "No company"}
                          {skillCount
                            ? ` · ${skillCount} skill${skillCount === 1 ? "" : "s"}`
                            : ""}
                        </span>
                      </span>
                      {when ? (
                        <span className="shrink-0 text-xs font-medium text-slate-400">
                          {formatDistanceToNow(when, { addSuffix: true })}
                        </span>
                      ) : null}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </ContentPanel>
      </div>

      {/* Recent candidates table */}
      <ContentPanel
        accent="sky"
        title="Recent candidates"
        description="Latest profiles from resume uploads and CSV imports."
        icon={UserRound}
        actions={
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => navigate("/dashboard/get-candidates")}
          >
            View all
            <ArrowRight className="size-4" aria-hidden />
          </Button>
        }
        noPadding={recentCandidates.length > 0}
      >
        {recentCandidates.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No candidates yet"
            description="Upload resumes or a CSV to start building your talent pool."
            action={
              <div className="flex flex-wrap justify-center gap-2">
                <Button
                  type="button"
                  onClick={() => navigate("/dashboard/candidates")}
                >
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
          <div
            className={cn(
              WORKSPACE_TABLE_SCROLL_CLASS,
              "max-h-[min(480px,55vh)]"
            )}
          >
            <Table className={cn(WORKSPACE_TABLE_CLASS, "min-w-[720px]")}>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="min-w-[200px]">Candidate</TableHead>
                  <TableHead className="min-w-[160px]">Role</TableHead>
                  <TableHead className="hidden min-w-[160px] md:table-cell">
                    Skills
                  </TableHead>
                  <TableHead className="w-[110px]">Profile</TableHead>
                  <TableHead className="hidden w-[120px] sm:table-cell">
                    Added
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentCandidates.map((candidate) => {
                  const skills = getSkills(candidate.skills);
                  const score = profileCompleteness(candidate);
                  const when = safeDate(candidate.createdAt);
                  return (
                    <TableRow
                      key={candidate.id}
                      className="cursor-pointer transition-colors hover:bg-sky-50/50"
                      onClick={() => navigate("/dashboard/get-candidates")}
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <CandidateAvatar name={candidate.name} />
                          <div className="min-w-0">
                            <p className="truncate font-bold text-slate-900">
                              {candidate.name || "Unnamed"}
                            </p>
                            <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-slate-500">
                              {candidate.email ? (
                                <>
                                  <Mail className="size-3 shrink-0" />
                                  {candidate.email}
                                </>
                              ) : (
                                <Badge
                                  variant="outline"
                                  className="font-normal"
                                >
                                  No email
                                </Badge>
                              )}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="truncate text-sm font-medium text-slate-800">
                          {candidate.currentDesignation || "—"}
                        </p>
                        <p className="mt-0.5 truncate text-xs text-slate-500">
                          {candidate.currentCompany ||
                            [candidate.currentLocation, candidate.hometown]
                              .filter(Boolean)
                              .join(" · ") ||
                            "No company / location"}
                        </p>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="flex max-w-[200px] flex-wrap gap-1">
                          {skills.length ? (
                            <>
                              {skills.slice(0, 2).map((s) => (
                                <Badge
                                  key={s}
                                  variant="secondary"
                                  className="border-sky-100 bg-sky-50 font-medium text-sky-900"
                                >
                                  {s}
                                </Badge>
                              ))}
                              {skills.length > 2 ? (
                                <Badge variant="outline">
                                  +{skills.length - 2}
                                </Badge>
                              ) : null}
                            </>
                          ) : (
                            <span className="text-sm text-slate-400">—</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between text-xs font-semibold tabular-nums text-slate-600">
                            <span>{score}%</span>
                          </div>
                          <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                            <div
                              className={cn(
                                "h-full rounded-full",
                                completenessTone(score)
                              )}
                              style={{ width: `${score}%` }}
                            />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden text-sm text-slate-500 sm:table-cell">
                        {when
                          ? formatDistanceToNow(when, { addSuffix: true })
                          : "—"}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </ContentPanel>
    </WorkspacePage>
  );
}
