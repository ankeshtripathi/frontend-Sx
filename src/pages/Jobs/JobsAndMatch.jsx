import React, { useCallback, useEffect, useMemo, useState } from "react";
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import {
  WORKSPACE_TABLE_CLASS,
  WORKSPACE_TABLE_MIN_WIDTH_CLASS,
  WORKSPACE_TABLE_SCROLL_CLASS,
} from "@/components/workspace/workspace-table";
import PageHero, {
  HeroGhostButton,
  HeroPrimaryButton,
} from "@/components/workspace/PageHero";
import WorkspacePage from "@/components/workspace/WorkspacePage";
import {
  ArrowRight,
  Loader2,
  Mail,
  RefreshCw,
  SearchCheck,
  Sparkles,
} from "lucide-react";

function formatScorePercent(score) {
  if (typeof score !== "number" || Number.isNaN(score)) return "—";
  const pct = Math.max(0, Math.min(100, score * 100));
  return `${pct.toFixed(1)}%`;
}

function formatSkills(skills) {
  if (skills == null) return "";
  if (Array.isArray(skills)) return skills.join(", ");
  if (typeof skills === "string") return skills;
  return "";
}

function ScoreCell({ score }) {
  const pct =
    typeof score === "number" && !Number.isNaN(score)
      ? Math.max(0, Math.min(100, score * 100))
      : null;
  return (
    <div className="flex min-w-[6rem] flex-col gap-1.5">
      <span className="text-sm font-semibold tabular-nums text-emerald-700">
        {formatScorePercent(score)}
      </span>
      {pct != null ? (
        <div className="h-2 w-full max-w-[92px] overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-teal-500 to-primary"
            style={{ width: `${pct}%` }}
          />
        </div>
      ) : null}
    </div>
  );
}

function ScoreBadge({ score }) {
  const pct =
    typeof score === "number" && !Number.isNaN(score)
      ? Math.max(0, Math.min(100, score * 100))
      : null;
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
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold tabular-nums",
        tone,
      )}
    >
      {formatScorePercent(score)}
    </span>
  );
}

function MatchSummary({ payload, title, mode }) {
  if (!payload) return null;
  const job = payload.job;
  return (
    <div className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm">
      <div className="border-b bg-muted/30 px-4 py-3">
        <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <Sparkles className="size-4 shrink-0 text-primary" aria-hidden />
          {title}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          {mode === "quick"
            ? "One-off JD match. The job was not saved."
            : "Saved-job match using the latest settings."}
        </p>
      </div>
      <div className="space-y-3 px-4 py-4 text-sm">
        {job ? (
          <div>
            <p className="font-medium text-foreground">
              {job.title || "Untitled role"}
            </p>
            <p className="mt-1 leading-relaxed text-muted-foreground">
              {job.company ? `${job.company} · ` : ""}
              {formatSkills(job.skills) ? (
                <>
                  <span className="text-foreground/80">Skills:</span>{" "}
                  {formatSkills(job.skills)}
                </>
              ) : (
                "Role details were parsed from the JD."
              )}
              {(job.minExperience != null || job.maxExperience != null) && (
                <span>
                  {" "}
                  · Exp {job.minExperience ?? "—"}–{job.maxExperience ?? "—"}{" "}
                  yrs
                </span>
              )}
            </p>
          </div>
        ) : null}
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary" className="font-normal">
            Scored: {payload.totalCandidatesScored ?? "—"}
          </Badge>
          <Badge variant="outline" className="font-normal">
            Shown: {payload.returned ?? payload.results?.length ?? 0}
          </Badge>
        </div>
      </div>
    </div>
  );
}

function EmptyResults({ mode }) {
  return (
    <div className="flex min-h-[360px] flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted/20 px-6 py-12 text-center">
      <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <SearchCheck className="size-7" aria-hidden />
      </div>
      <h3 className="mt-5 text-lg font-semibold text-foreground">
        Your ranked shortlist will appear here
      </h3>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
        {mode === "quick"
          ? "Upload a JD file, adjust the settings if needed, then run Quick JD match to rank candidates without saving the role."
          : "Select a saved job or upload a JD to create one, then run Match saved job to see the best-fit candidates."}
      </p>
    </div>
  );
}

function CandidateCards({ results, onCandidateClick, selectedIds, onToggleRowSelect }) {
  return (
    <div className="grid gap-3 md:hidden">
      {results.map((row, idx) => {
        const c = row.candidate || {};
        const rowId = getMatchRowId(row, idx);
        return (
          <Card key={rowId} className="gap-4 py-4 shadow-sm">
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
                  <p className="truncate font-semibold text-foreground hover:text-primary">
                    {c.name || "Unnamed candidate"}
                  </p>
                  <p className="mt-1 flex items-center gap-1.5 truncate text-xs text-muted-foreground">
                    <Mail className="size-3.5" aria-hidden />
                    {c.email || "No email available"}
                  </p>
                </button>
                <ScoreBadge score={row.score} />
              </div>
              </div>

              <div className="grid gap-3 text-xs">
                <SkillLine
                  label="Matched skills"
                  value={(row.matchedSkills || []).join(", ")}
                  tone="success"
                />
                <SkillLine
                  label="Gaps"
                  value={(row.missingSkills || []).join(", ")}
                  tone="warning"
                />
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

function SkillLine({ label, value, tone }) {
  return (
    <div className="rounded-lg bg-muted/40 p-3">
      <p className="font-medium text-muted-foreground">{label}</p>
      <p
        className={cn(
          "mt-1 line-clamp-2 leading-relaxed",
          tone === "success" ? "text-emerald-700" : "text-amber-700",
        )}
        title={value}
      >
        {value || "—"}
      </p>
    </div>
  );
}

function MatchResultsTable({
  results,
  mode,
  onCandidateClick,
  selectedIds,
  onToggleRowSelect,
  onSelectedIdsChange,
  onComposeEmail,
}) {
  if (!Array.isArray(results) || !results.length) {
    return <EmptyResults mode={mode} />;
  }

  const allIds = results.map((row, idx) => getMatchRowId(row, idx));
  const allSelected =
    allIds.length > 0 && allIds.every((id) => selectedIds.includes(id));

  return (
    <div className="space-y-4">
      <JdMatchEmailToolbar
        results={results}
        selectedIds={selectedIds}
        onSelectedIdsChange={onSelectedIdsChange}
        onCompose={onComposeEmail}
      />
      <CandidateCards
        results={results}
        onCandidateClick={onCandidateClick}
        selectedIds={selectedIds}
        onToggleRowSelect={onToggleRowSelect}
      />
      <div className="hidden min-w-0 overflow-hidden rounded-2xl border bg-card md:block">
        <div
          className={cn(
            WORKSPACE_TABLE_SCROLL_CLASS,
            "h-[min(560px,calc(100dvh-18rem))]",
          )}
        >
          <Table
            className={cn(
              WORKSPACE_TABLE_CLASS,
              WORKSPACE_TABLE_MIN_WIDTH_CLASS,
              "min-w-[1360px]",
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
                <TableHead className="min-w-[200px]">Matched skills</TableHead>
                <TableHead className="min-w-[200px]">Gaps</TableHead>
                <TableHead className="min-w-[100px]">Resume</TableHead>
                <TableHead className="w-[88px] text-right">Profile</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {results.map((row, idx) => {
                const c = row.candidate || {};
                const rowId = getMatchRowId(row, idx);
                return (
                  <TableRow key={rowId} className="align-top">
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
                          <span className="block truncate font-bold text-slate-900 hover:text-primary">
                            {c.name || "Unnamed"}
                          </span>
                          <span className="mt-0.5 block text-xs text-muted-foreground">
                            Rank #{idx + 1}
                          </span>
                        </span>
                      </button>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {c.email || "—"}
                    </TableCell>
                    <TableCell className="text-xs text-emerald-700">
                      <span
                        className="line-clamp-2"
                        title={(row.matchedSkills || []).join(", ")}
                      >
                        {(row.matchedSkills || []).join(", ") || "—"}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs text-amber-700">
                      <span
                        className="line-clamp-2"
                        title={(row.missingSkills || []).join(", ")}
                      >
                        {(row.missingSkills || []).join(", ") || "—"}
                      </span>
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
                        <span className="text-sm text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-primary"
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
    </div>
  );
}

export default function JobsAndMatch() {
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
    [jobs, selectedJobId],
  );

  const activeMatch = mode === "quick" ? jdFileMatch : persistedMatch;
  const activeResults = activeMatch?.results;

  useEffect(() => {
    setSelectedMatchIds([]);
  }, [activeMatch]);

  const handleToggleMatchRowSelect = (rowId, checked) => {
    setSelectedMatchIds((prev) =>
      checked ? [...new Set([...prev, rowId])] : prev.filter((id) => id !== rowId),
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
        eyebrow="AI matching"
        title="Match jobs to the right candidates"
        description="Pick a saved job or run a quick JD match. Configure options on the left; ranked results appear on the right."
        actions={
          <>
            <HeroPrimaryButton
              onClick={() =>
                document
                  .getElementById("saved-workflow")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
            >
              Start matching
              <ArrowRight className="size-4" aria-hidden />
            </HeroPrimaryButton>
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
          { label: "Saved jobs", value: jobs.length },
          { label: "Top results", value: topK || 10 },
          { label: "Flow", value: mode === "quick" ? "Quick" : "Saved" },
        ]}
      />

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

        <Card className="min-w-0 overflow-hidden border-slate-200/90 bg-white shadow-md">
          <CardHeader className="border-b border-slate-200/80 border-l-4 border-l-amber-500 bg-gradient-to-r from-amber-50 to-white">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-xl font-bold text-slate-900">
                  <span className="flex size-9 items-center justify-center rounded-lg bg-white text-amber-600 shadow-sm ring-1 ring-slate-200/80">
                    <SearchCheck className="size-5" aria-hidden />
                  </span>
                  Ranked candidate shortlist
                </CardTitle>
                <CardDescription className="mt-1">
                  Click a name for full profile. Scroll horizontally to see all
                  columns.
                </CardDescription>
              </div>
              <Badge variant="secondary" className="w-fit">
                {mode === "quick" ? "Quick JD results" : "Saved job results"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-5 p-4 sm:p-6">
            <MatchSummary
              payload={activeMatch}
              title={
                mode === "quick"
                  ? "Latest quick match"
                  : "Latest saved-job match"
              }
              mode={mode}
            />
            <MatchResultsTable
              results={activeResults}
              mode={mode}
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
