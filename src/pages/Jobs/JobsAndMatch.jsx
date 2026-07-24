import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { getApiErrorMessage } from "@/api/axios";
import {
  getJobs,
  uploadJobDocument,
  matchJobCandidates,
  omitJobEmbedding,
} from "@/api/jobs";
import { matchJD } from "@/api/candidate";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import JdMatchSetupPanel from "@/components/jobs/JdMatchSetupPanel";
import {
  JdMatchEmailToolbar,
  JdMatchEmailComposeDialog,
  MatchRowCheckbox,
  MATCH_SELECT_CHECKBOX_CLASS,
  getMatchRowId,
} from "@/components/jobs/JdMatchOutreach";
import CandidateProfileDialog from "@/components/workspace/CandidateProfileDialog";
import CandidateAvatar from "@/components/workspace/CandidateAvatar";
import MetricStatCard from "@/components/workspace/MetricStatCard";
import PageHero, {
  HeroGhostButton,
  HeroPrimaryButton,
} from "@/components/workspace/PageHero";
import WorkspacePage from "@/components/workspace/WorkspacePage";
import {
  WORKSPACE_TABLE_CLASS,
  WORKSPACE_TABLE_MIN_WIDTH_CLASS,
  WORKSPACE_TABLE_SCROLL_CLASS,
} from "@/components/workspace/workspace-table";
import {
  ArrowRight,
  BriefcaseBusiness,
  Filter,
  Loader2,
  Mail,
  RefreshCw,
  Search,
  SearchCheck,
  Sparkles,
  Target,
  Trophy,
  Users,
} from "lucide-react";

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                   */
/* -------------------------------------------------------------------------- */

function formatScorePercent(score) {
  if (typeof score !== "number" || Number.isNaN(score)) return "—";
  const pct = Math.max(0, Math.min(100, score * 100));
  return `${pct.toFixed(1)}%`;
}

function scorePct(score) {
  if (typeof score !== "number" || Number.isNaN(score)) return null;
  return Math.max(0, Math.min(100, score * 100));
}

function formatSkills(skills) {
  if (skills == null) return "";
  if (Array.isArray(skills)) return skills.filter(Boolean).join(", ");
  if (typeof skills === "string") return skills;
  return "";
}

function skillsList(skills) {
  if (Array.isArray(skills)) return skills.filter(Boolean);
  if (typeof skills === "string") {
    return skills
      .split(/[,;|]/)
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [];
}

function fitBand(pct) {
  if (pct == null) return "unknown";
  if (pct >= 75) return "strong";
  if (pct >= 50) return "good";
  return "weak";
}

/* -------------------------------------------------------------------------- */
/*  Small UI                                                                  */
/* -------------------------------------------------------------------------- */

function ScoreCell({ score }) {
  const pct = scorePct(score);
  return (
    <div className="flex min-w-[6rem] flex-col gap-1.5">
      <span className="text-sm font-bold tabular-nums text-emerald-700">
        {formatScorePercent(score)}
      </span>
      {pct != null ? (
        <div className="h-2 w-full max-w-[92px] overflow-hidden rounded-full bg-slate-100">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-500",
              pct >= 75
                ? "bg-gradient-to-r from-emerald-500 to-teal-500"
                : pct >= 50
                  ? "bg-gradient-to-r from-amber-400 to-amber-500"
                  : "bg-gradient-to-r from-slate-400 to-slate-500"
            )}
            style={{ width: `${pct}%` }}
          />
        </div>
      ) : null}
    </div>
  );
}

function ScoreBadge({ score }) {
  const pct = scorePct(score);
  const tone =
    pct == null
      ? "border-border bg-muted text-muted-foreground"
      : pct >= 75
        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
        : pct >= 50
          ? "border-amber-200 bg-amber-50 text-amber-700"
          : "border-slate-200 bg-slate-50 text-slate-700";

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-bold tabular-nums",
        tone
      )}
    >
      {formatScorePercent(score)}
    </span>
  );
}

function SkillChips({ items, tone = "emerald", limit = 4 }) {
  const list = Array.isArray(items) ? items.filter(Boolean) : [];
  if (!list.length) {
    return <span className="text-sm text-slate-400">—</span>;
  }
  const toneClass =
    tone === "emerald"
      ? "border-emerald-100 bg-emerald-50 text-emerald-900"
      : "border-amber-100 bg-amber-50 text-amber-900";

  return (
    <div className="flex max-w-[240px] flex-wrap gap-1" title={list.join(", ")}>
      {list.slice(0, limit).map((s) => (
        <Badge
          key={s}
          variant="secondary"
          className={cn("font-medium", toneClass)}
        >
          {s}
        </Badge>
      ))}
      {list.length > limit ? (
        <Badge variant="outline" className="font-medium">
          +{list.length - limit}
        </Badge>
      ) : null}
    </div>
  );
}

function QualityMeter({ results }) {
  const bands = useMemo(() => {
    let strong = 0;
    let good = 0;
    let weak = 0;
    for (const row of results || []) {
      const band = fitBand(scorePct(row.score));
      if (band === "strong") strong += 1;
      else if (band === "good") good += 1;
      else weak += 1;
    }
    const total = strong + good + weak || 1;
    return { strong, good, weak, total };
  }, [results]);

  if (!results?.length) return null;

  return (
    <div className="rounded-2xl border border-amber-100 bg-gradient-to-r from-amber-50/80 to-white p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <p className="text-xs font-bold uppercase tracking-wide text-amber-800/80">
          Match quality mix
        </p>
        <span className="text-xs font-semibold text-slate-500">
          {results.length} shown
        </span>
      </div>
      <div className="flex h-2.5 overflow-hidden rounded-full bg-slate-100">
        <div
          className="bg-emerald-500 transition-all"
          style={{ width: `${(bands.strong / bands.total) * 100}%` }}
        />
        <div
          className="bg-amber-400 transition-all"
          style={{ width: `${(bands.good / bands.total) * 100}%` }}
        />
        <div
          className="bg-slate-400 transition-all"
          style={{ width: `${(bands.weak / bands.total) * 100}%` }}
        />
      </div>
      <div className="mt-3 flex flex-wrap gap-3 text-xs font-semibold">
        <span className="text-emerald-700">Strong ≥75%: {bands.strong}</span>
        <span className="text-amber-700">Good 50–74%: {bands.good}</span>
        <span className="text-slate-600">Lower &lt;50%: {bands.weak}</span>
      </div>
    </div>
  );
}

function MatchSummary({ payload, title, mode }) {
  if (!payload) return null;
  const job = payload.job;
  const skills = skillsList(job?.skills);

  return (
    <div className="overflow-hidden rounded-2xl border border-amber-200/80 bg-white shadow-sm">
      <div className="border-b border-amber-100 bg-gradient-to-r from-amber-50 to-white px-4 py-3">
        <p className="flex items-center gap-2 text-sm font-bold text-slate-900">
          <Sparkles className="size-4 shrink-0 text-amber-600" aria-hidden />
          {title}
        </p>
        <p className="mt-1 text-xs font-medium text-slate-500">
          {mode === "quick"
            ? "One-off JD match — the job was not saved."
            : "Saved-job match using your latest settings."}
        </p>
      </div>
      <div className="space-y-3 px-4 py-4 text-sm">
        {job ? (
          <div>
            <p className="font-bold text-slate-900">
              {job.title || "Untitled role"}
            </p>
            <p className="mt-1 text-slate-600">
              {job.company || "No company"}
              {(job.minExperience != null || job.maxExperience != null) && (
                <span>
                  {" "}
                  · Exp {job.minExperience ?? "—"}–{job.maxExperience ?? "—"} yrs
                </span>
              )}
            </p>
            {skills.length ? (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {skills.slice(0, 8).map((s) => (
                  <Badge
                    key={s}
                    variant="secondary"
                    className="border-amber-100 bg-amber-50 font-medium text-amber-950"
                  >
                    {s}
                  </Badge>
                ))}
                {skills.length > 8 ? (
                  <Badge variant="outline">+{skills.length - 8}</Badge>
                ) : null}
              </div>
            ) : null}
          </div>
        ) : null}
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary" className="font-semibold">
            Scored: {payload.totalCandidatesScored ?? "—"}
          </Badge>
          <Badge variant="outline" className="font-semibold">
            Shown: {payload.returned ?? payload.results?.length ?? 0}
          </Badge>
        </div>
      </div>
    </div>
  );
}

function TopPickCard({ row, onCandidateClick }) {
  if (!row) return null;
  const c = row.candidate || {};
  return (
    <button
      type="button"
      onClick={() => onCandidateClick?.(c)}
      className="group flex w-full items-start gap-4 rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-white p-4 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
    >
      <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-md shadow-emerald-600/25">
        <Trophy className="size-5" aria-hidden />
      </span>
      <span className="min-w-0 flex-1">
        <span className="text-[11px] font-bold uppercase tracking-wide text-emerald-700/80">
          Top pick
        </span>
        <span className="mt-0.5 block truncate text-base font-bold text-slate-900 group-hover:text-emerald-800">
          {c.name || "Unnamed candidate"}
        </span>
        <span className="mt-1 block truncate text-sm text-slate-600">
          {c.email || "No email"}
          {c.currentDesignation ? ` · ${c.currentDesignation}` : ""}
        </span>
        <div className="mt-2">
          <SkillChips items={row.matchedSkills} limit={5} />
        </div>
      </span>
      <ScoreBadge score={row.score} />
    </button>
  );
}

function EmptyResults({ mode }) {
  return (
    <div className="flex min-h-[360px] flex-col items-center justify-center rounded-2xl border border-dashed border-amber-200/80 bg-amber-50/30 px-6 py-12 text-center">
      <div className="flex size-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
        <SearchCheck className="size-7" aria-hidden />
      </div>
      <h3 className="mt-5 text-lg font-bold text-slate-900">
        Your ranked shortlist will appear here
      </h3>
      <p className="mt-2 max-w-md text-sm font-medium leading-relaxed text-slate-600">
        {mode === "quick"
          ? "Upload a JD, tune Top K / skills if needed, then run Quick match."
          : "Select or save a job, then run Match saved job to rank your pool."}
      </p>
    </div>
  );
}

function MatchingSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Matching candidates">
      <div className="h-24 animate-pulse rounded-2xl bg-slate-200/70" />
      <div className="grid gap-3 md:hidden">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-36 animate-pulse rounded-2xl bg-slate-200/70" />
        ))}
      </div>
      <div className="hidden h-72 animate-pulse rounded-2xl bg-slate-200/70 md:block" />
      <p className="flex items-center justify-center gap-2 text-sm font-medium text-slate-500">
        <Loader2 className="size-4 animate-spin text-amber-600" />
        Ranking candidates against the JD…
      </p>
    </div>
  );
}

function CandidateCards({
  items,
  onCandidateClick,
  selectedIds,
  onToggleRowSelect,
}) {
  return (
    <div className="grid gap-3 md:hidden">
      {items.map(({ row, idx }) => {
        const c = row.candidate || {};
        const rowId = getMatchRowId(row, idx);
        return (
          <Card key={rowId} className="gap-4 border-slate-200/90 py-4 shadow-sm">
            <CardContent className="space-y-4 px-4">
              <div className="flex items-start gap-3">
                <MatchRowCheckbox
                  rowId={rowId}
                  selectedIds={selectedIds}
                  onToggle={onToggleRowSelect}
                />
                <div className="flex min-w-0 flex-1 items-start justify-between gap-3">
                  <button
                    type="button"
                    className="min-w-0 flex-1 text-left"
                    onClick={() => onCandidateClick?.(c)}
                  >
                    <p className="truncate font-bold text-slate-900 hover:text-amber-700">
                      {c.name || "Unnamed candidate"}
                    </p>
                    <p className="mt-1 flex items-center gap-1.5 truncate text-xs text-slate-500">
                      <Mail className="size-3.5" aria-hidden />
                      {c.email || "No email available"}
                    </p>
                    <p className="mt-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                      Rank #{idx + 1}
                    </p>
                  </button>
                  <ScoreBadge score={row.score} />
                </div>
              </div>

              <div className="grid gap-3 text-xs">
                <div className="rounded-xl bg-emerald-50/80 p-3">
                  <p className="font-semibold text-emerald-800/80">Matched</p>
                  <div className="mt-1.5">
                    <SkillChips items={row.matchedSkills} tone="emerald" />
                  </div>
                </div>
                <div className="rounded-xl bg-amber-50/80 p-3">
                  <p className="font-semibold text-amber-800/80">Gaps</p>
                  <div className="mt-1.5">
                    <SkillChips items={row.missingSkills} tone="amber" />
                  </div>
                </div>
              </div>

              {c.resumeUrl ? (
                <Button variant="outline" size="sm" className="w-full" asChild>
                  <a href={c.resumeUrl} target="_blank" rel="noreferrer">
                    Open resume
                  </a>
                </Button>
              ) : null}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

function MatchResultsTable({
  results,
  mode,
  matching,
  onCandidateClick,
  selectedIds,
  onToggleRowSelect,
  onSelectedIdsChange,
  onComposeEmail,
}) {
  const [query, setQuery] = useState("");
  const [fitFilter, setFitFilter] = useState("all");
  const [sortBy, setSortBy] = useState("score");

  if (matching) return <MatchingSkeleton />;

  if (!Array.isArray(results) || !results.length) {
    return <EmptyResults mode={mode} />;
  }

  const filtered = results
    .map((row, idx) => ({ row, idx }))
    .filter(({ row }) => {
      const c = row.candidate || {};
      const pct = scorePct(row.score);
      const band = fitBand(pct);
      if (fitFilter !== "all" && band !== fitFilter) return false;
      const q = query.trim().toLowerCase();
      if (!q) return true;
      const hay = [
        c.name,
        c.email,
        c.currentDesignation,
        c.currentCompany,
        ...(row.matchedSkills || []),
        ...(row.missingSkills || []),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    })
    .sort((a, b) => {
      if (sortBy === "name") {
        return String(a.row.candidate?.name || "").localeCompare(
          String(b.row.candidate?.name || "")
        );
      }
      return (scorePct(b.row.score) ?? -1) - (scorePct(a.row.score) ?? -1);
    });

  const visibleRows = filtered.map(({ row }) => row);
  const allIds = filtered.map(({ row, idx }) => getMatchRowId(row, idx));
  const allSelected =
    allIds.length > 0 && allIds.every((id) => selectedIds.includes(id));

  return (
    <div className="space-y-4">
      <TopPickCard row={results[0]} onCandidateClick={onCandidateClick} />
      <QualityMeter results={results} />

      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-slate-50/60 p-3 sm:flex-row sm:items-center">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <Input
            className="h-10 border-slate-200 bg-white pl-9"
            placeholder="Filter shortlist by name, email, skills…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <Select value={fitFilter} onValueChange={setFitFilter}>
          <SelectTrigger className="h-10 w-full bg-white sm:w-[9.5rem]">
            <Filter className="mr-1.5 size-3.5 text-slate-400" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All fits</SelectItem>
            <SelectItem value="strong">Strong</SelectItem>
            <SelectItem value="good">Good</SelectItem>
            <SelectItem value="weak">Lower</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="h-10 w-full bg-white sm:w-[9rem]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="score">Sort: score</SelectItem>
            <SelectItem value="name">Sort: name</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <JdMatchEmailToolbar
        results={visibleRows}
        selectedIds={selectedIds}
        onSelectedIdsChange={onSelectedIdsChange}
        onCompose={onComposeEmail}
      />

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-10 text-center text-sm text-slate-500">
          No candidates match this filter. Clear search or broaden fit.
        </div>
      ) : (
        <>
          <CandidateCards
            items={filtered}
            onCandidateClick={onCandidateClick}
            selectedIds={selectedIds}
            onToggleRowSelect={onToggleRowSelect}
          />
          <div className="hidden min-w-0 overflow-hidden rounded-2xl border border-slate-200/90 bg-white md:block">
            <div
              className={cn(
                WORKSPACE_TABLE_SCROLL_CLASS,
                "h-[min(560px,calc(100dvh-18rem))]"
              )}
            >
              <Table
                className={cn(
                  WORKSPACE_TABLE_CLASS,
                  WORKSPACE_TABLE_MIN_WIDTH_CLASS,
                  "min-w-[1360px]"
                )}
              >
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-12 px-3">
                      <Checkbox
                        className={MATCH_SELECT_CHECKBOX_CLASS}
                        checked={allSelected}
                        onCheckedChange={(v) =>
                          onSelectedIdsChange(v === true ? allIds : [])
                        }
                        aria-label="Select all"
                      />
                    </TableHead>
                    <TableHead className="min-w-[100px]">Match</TableHead>
                    <TableHead className="min-w-[220px]">Candidate</TableHead>
                    <TableHead className="min-w-[200px]">Email</TableHead>
                    <TableHead className="min-w-[220px]">Matched skills</TableHead>
                    <TableHead className="min-w-[200px]">Gaps</TableHead>
                    <TableHead className="min-w-[100px]">Resume</TableHead>
                    <TableHead className="w-[88px] text-right">Profile</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map(({ row, idx }) => {
                    const c = row.candidate || {};
                    const rowId = getMatchRowId(row, idx);
                    return (
                      <TableRow
                        key={rowId}
                        className="align-top transition-colors hover:bg-amber-50/40"
                      >
                        <TableCell className="px-3">
                          <MatchRowCheckbox
                            rowId={rowId}
                            selectedIds={selectedIds}
                            onToggle={onToggleRowSelect}
                          />
                        </TableCell>
                        <TableCell>
                          <ScoreCell score={row.score} />
                        </TableCell>
                        <TableCell>
                          <button
                            type="button"
                            className="flex max-w-[280px] items-center gap-3 text-left"
                            onClick={() => onCandidateClick?.(c)}
                          >
                            <CandidateAvatar name={c.name} />
                            <span className="min-w-0">
                              <span className="block truncate font-bold text-slate-900 hover:text-amber-700">
                                {c.name || "Unnamed"}
                              </span>
                              <span className="mt-0.5 block text-xs text-slate-500">
                                Rank #{idx + 1}
                                {c.currentDesignation
                                  ? ` · ${c.currentDesignation}`
                                  : ""}
                              </span>
                            </span>
                          </button>
                        </TableCell>
                        <TableCell className="text-sm text-slate-600">
                          {c.email || "—"}
                        </TableCell>
                        <TableCell>
                          <SkillChips items={row.matchedSkills} tone="emerald" />
                        </TableCell>
                        <TableCell>
                          <SkillChips items={row.missingSkills} tone="amber" />
                        </TableCell>
                        <TableCell>
                          {c.resumeUrl ? (
                            <Button variant="outline" size="sm" asChild>
                              <a
                                href={c.resumeUrl}
                                target="_blank"
                                rel="noreferrer"
                              >
                                Open
                              </a>
                            </Button>
                          ) : (
                            <span className="text-sm text-slate-400">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="font-semibold text-amber-700 hover:bg-amber-50 hover:text-amber-900"
                            onClick={() => onCandidateClick?.(c)}
                          >
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Page                                                                      */
/* -------------------------------------------------------------------------- */

export default function JobsAndMatch() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState("");

  const [jdFile, setJdFile] = useState(null);
  const [uploadingJob, setUploadingJob] = useState(false);

  const [topK, setTopK] = useState(10);
  const [extraSkills, setExtraSkills] = useState("");

  const [persistedMatch, setPersistedMatch] = useState(null);
  const [jdFileMatch, setJdFileMatch] = useState(null);
  const [quickJdFile, setQuickJdFile] = useState(null);
  const [matching, setMatching] = useState(false);
  const [mode, setMode] = useState("saved");
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [selectedMatchIds, setSelectedMatchIds] = useState([]);
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [emailScope, setEmailScope] = useState("all");

  const loadJobs = useCallback(async () => {
    setLoadingJobs(true);
    try {
      const list = await getJobs();
      const arr = Array.isArray(list) ? list : [];
      const safeJobs = arr.map(omitJobEmbedding);
      setJobs(safeJobs);
      setSelectedJobId((current) => {
        if (current || safeJobs[0]?.id == null) return current;
        return String(safeJobs[0].id);
      });
    } catch (e) {
      toast.error(getApiErrorMessage(e, "Failed to load jobs"));
      setJobs([]);
    } finally {
      setLoadingJobs(false);
    }
  }, []);

  useEffect(() => {
    loadJobs();
  }, [loadJobs]);

  const selectedJob = useMemo(
    () => jobs.find((job) => String(job.id) === String(selectedJobId)),
    [jobs, selectedJobId]
  );

  const activeMatch = mode === "quick" ? jdFileMatch : persistedMatch;
  const activeResults = activeMatch?.results;

  useEffect(() => {
    setSelectedMatchIds([]);
  }, [activeMatch]);

  const matchStats = useMemo(() => {
    const results = Array.isArray(activeResults) ? activeResults : [];
    const withEmail = results.filter((r) => r.candidate?.email).length;
    const top = results[0] ? scorePct(results[0].score) : null;
    const strong = results.filter((r) => fitBand(scorePct(r.score)) === "strong")
      .length;
    return {
      shown: results.length,
      withEmail,
      topScore: top != null ? `${top.toFixed(0)}%` : "—",
      strong,
    };
  }, [activeResults]);

  const handleToggleMatchRowSelect = (rowId, checked) => {
    setSelectedMatchIds((prev) =>
      checked
        ? [...new Set([...prev, rowId])]
        : prev.filter((id) => id !== rowId)
    );
  };

  const handleComposeEmail = (scope) => {
    setEmailScope(scope);
    setEmailDialogOpen(true);
  };

  const handleUploadJob = async () => {
    if (!jdFile) {
      toast.error("Choose a job description file");
      return;
    }
    setUploadingJob(true);
    try {
      const job = await uploadJobDocument(jdFile);
      const safe = omitJobEmbedding(job);
      toast.success("Job saved from document");
      setJobs((prev) => [
        safe,
        ...prev.filter((j) => String(j.id) !== String(safe.id)),
      ]);
      setSelectedJobId(String(safe.id));
      setMode("saved");
      setJdFile(null);
    } catch (e) {
      toast.error(getApiErrorMessage(e, "Job upload failed"));
    } finally {
      setUploadingJob(false);
    }
  };

  const matchParams = () => ({
    topK: Number(topK) > 0 ? Math.min(Number(topK), 50) : 10,
    skills: extraSkills.trim() || undefined,
  });

  const handleMatchSavedJob = async () => {
    if (!selectedJobId) {
      toast.error("Select a job");
      return;
    }
    setMode("saved");
    setMatching(true);
    setPersistedMatch(null);
    try {
      const res = await matchJobCandidates(selectedJobId, matchParams());
      setPersistedMatch(res);
      toast.success("Match complete");
    } catch (e) {
      toast.error(getApiErrorMessage(e, "Match failed"));
    } finally {
      setMatching(false);
    }
  };

  const handleMatchQuickJd = async () => {
    if (!quickJdFile) {
      toast.error("Choose a JD file");
      return;
    }
    setMode("quick");
    setMatching(true);
    setJdFileMatch(null);
    try {
      const res = await matchJD(quickJdFile, matchParams());
      setJdFileMatch(res);
      toast.success("JD match complete");
    } catch (e) {
      toast.error(getApiErrorMessage(e, "JD match failed"));
    } finally {
      setMatching(false);
    }
  };

  const matchBusy = matching;
  const savedCanRun = Boolean(selectedJobId) && !matchBusy;
  const quickCanRun = Boolean(quickJdFile) && !matchBusy;

  const handlePreviewCandidate = (candidate) => {
    setSelectedCandidate(candidate);
    setProfileOpen(true);
  };

  return (
    <WorkspacePage>
      <PageHero
        eyebrow="AI matching studio"
        title="Match jobs to the right candidates"
        description="Rank your talent pool against a saved role or a one-off JD. Shortlist, inspect gaps, and email outreach from one screen."
        actions={
          <>
            <HeroPrimaryButton
              onClick={() =>
                document
                  .getElementById("saved-workflow")
                  ?.scrollIntoView({ behavior: "smooth", block: "start" })
              }
            >
              Start matching
              <ArrowRight className="size-4" aria-hidden />
            </HeroPrimaryButton>
            <HeroGhostButton
              onClick={() => navigate("/dashboard/get-candidates")}
            >
              <Users className="size-4" aria-hidden />
              Browse pool
            </HeroGhostButton>
            <HeroGhostButton onClick={loadJobs} disabled={loadingJobs}>
              {loadingJobs ? (
                <Loader2 className="size-4 animate-spin" aria-hidden />
              ) : (
                <RefreshCw className="size-4" aria-hidden />
              )}
              Refresh jobs
            </HeroGhostButton>
          </>
        }
        stats={[
          { label: "Saved jobs", value: jobs.length, tone: "amber" },
          { label: "Top K", value: topK || 10, tone: "sky" },
          {
            label: "Flow",
            value: mode === "quick" ? "Quick" : "Saved",
            tone: "violet",
          },
        ]}
      />

      {/* KPI strip */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricStatCard
          variant="compact"
          title="Saved jobs"
          value={loadingJobs ? "…" : jobs.length}
          hint="Roles ready to match"
          icon={BriefcaseBusiness}
          tone="amber"
        />
        <MetricStatCard
          variant="compact"
          title="Shortlist size"
          value={matchStats.shown}
          hint="Candidates in latest run"
          icon={Target}
          tone="sky"
        />
        <MetricStatCard
          variant="compact"
          title="Top score"
          value={matchStats.topScore}
          hint="Best fit in results"
          icon={Trophy}
          tone="emerald"
        />
        <MetricStatCard
          variant="compact"
          title="Reachable"
          value={matchStats.withEmail}
          hint="With email on shortlist"
          icon={Mail}
          tone="violet"
        />
      </div>

      {/* How it works */}
      <section
        aria-label="Matching workflow"
        className="grid gap-3 md:grid-cols-3"
      >
        {[
          {
            title: "1. Choose a JD",
            detail: "Use a saved job or upload a quick one-off description.",
            icon: BriefcaseBusiness,
          },
          {
            title: "2. Tune ranking",
            detail: "Set Top K and optional must-have skills before you run.",
            icon: Target,
          },
          {
            title: "3. Shortlist & outreach",
            detail: "Inspect gaps, open profiles, then email selected talent.",
            icon: Mail,
          },
        ].map(({ title, detail, icon: Icon }) => (
          <div
            key={title}
            className="flex gap-3 rounded-2xl border border-amber-100 bg-gradient-to-br from-amber-50/70 to-white p-4 shadow-sm"
          >
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-white shadow-md shadow-amber-500/25">
              <Icon className="size-4" aria-hidden />
            </span>
            <div>
              <p className="text-sm font-bold text-slate-900">{title}</p>
              <p className="mt-1 text-xs font-medium leading-relaxed text-slate-600">
                {detail}
              </p>
            </div>
          </div>
        ))}
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,340px)_1fr]">
        <JdMatchSetupPanel
          mode={mode}
          onModeChange={setMode}
          jobs={jobs}
          loadingJobs={loadingJobs}
          selectedJobId={selectedJobId}
          onSelectedJobIdChange={setSelectedJobId}
          selectedJob={selectedJob}
          jdFile={jdFile}
          onJdFileChange={setJdFile}
          uploadingJob={uploadingJob}
          onUploadJob={handleUploadJob}
          quickJdFile={quickJdFile}
          onQuickJdFileChange={setQuickJdFile}
          topK={topK}
          onTopKChange={setTopK}
          extraSkills={extraSkills}
          onExtraSkillsChange={setExtraSkills}
          matchBusy={matchBusy}
          savedCanRun={savedCanRun}
          quickCanRun={quickCanRun}
          onMatchSavedJob={handleMatchSavedJob}
          onMatchQuickJd={handleMatchQuickJd}
        />

        <Card className="min-w-0 gap-0 overflow-hidden border-slate-200/90 bg-white py-0 shadow-md shadow-slate-200/40">
          <CardHeader className="border-b border-slate-200/80 border-l-4 border-l-amber-500 bg-gradient-to-r from-amber-50 to-white px-4 py-4 sm:px-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <CardTitle className="flex items-center gap-2.5 text-xl font-bold text-slate-900">
                  <span className="flex size-9 items-center justify-center rounded-lg bg-white text-amber-600 shadow-sm ring-1 ring-slate-200/80">
                    <SearchCheck className="size-5" aria-hidden />
                  </span>
                  Ranked candidate shortlist
                  {matching ? (
                    <Loader2
                      className="size-4 animate-spin text-amber-600"
                      aria-label="Matching"
                    />
                  ) : null}
                </CardTitle>
                <CardDescription className="mt-1.5 font-medium text-slate-600">
                  Click a name for the full profile. Filter by fit, then email
                  selected candidates.
                </CardDescription>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge
                  className={cn(
                    "h-9 px-3 font-semibold",
                    mode === "quick"
                      ? "border-violet-200 bg-violet-50 text-violet-900 hover:bg-violet-50"
                      : "border-amber-200 bg-amber-50 text-amber-950 hover:bg-amber-50"
                  )}
                  variant="outline"
                >
                  {mode === "quick" ? "Quick JD results" : "Saved job results"}
                </Badge>
                {matchStats.strong > 0 ? (
                  <Badge
                    variant="outline"
                    className="h-9 border-emerald-200 bg-emerald-50 px-3 font-semibold text-emerald-900"
                  >
                    {matchStats.strong} strong fit
                    {matchStats.strong === 1 ? "" : "s"}
                  </Badge>
                ) : null}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-5 p-4 sm:p-6">
            {!matching ? (
              <MatchSummary
                payload={activeMatch}
                title={
                  mode === "quick"
                    ? "Latest quick match"
                    : "Latest saved-job match"
                }
                mode={mode}
              />
            ) : null}
            <MatchResultsTable
              results={activeResults}
              mode={mode}
              matching={matching}
              onCandidateClick={handlePreviewCandidate}
              selectedIds={selectedMatchIds}
              onToggleRowSelect={handleToggleMatchRowSelect}
              onSelectedIdsChange={setSelectedMatchIds}
              onComposeEmail={handleComposeEmail}
            />
          </CardContent>
        </Card>
      </div>

      <CandidateProfileDialog
        candidate={selectedCandidate}
        open={profileOpen}
        onOpenChange={setProfileOpen}
        showDelete={false}
      />

      <JdMatchEmailComposeDialog
        open={emailDialogOpen}
        onOpenChange={setEmailDialogOpen}
        results={activeResults}
        selectedIds={selectedMatchIds}
        scope={emailScope}
        jobTitle={activeMatch?.job?.title}
      />
    </WorkspacePage>
  );
}
