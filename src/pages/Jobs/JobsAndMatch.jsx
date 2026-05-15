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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  ArrowRight,
  Briefcase,
  CheckCircle2,
  CircleHelp,
  Database,
  FileText,
  Loader2,
  Mail,
  MousePointerClick,
  RefreshCw,
  SearchCheck,
  Sparkles,
  Upload,
  UserRound,
  Zap,
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
        tone
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
            <p className="font-medium text-foreground">{job.title || "Untitled role"}</p>
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
                  · Exp {job.minExperience ?? "—"}–{job.maxExperience ?? "—"} yrs
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
            Shown: {payload.returned ?? (payload.results?.length ?? 0)}
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

function CandidateCards({ results }) {
  return (
    <div className="grid gap-3 md:hidden">
      {results.map((row, idx) => {
        const c = row.candidate || {};
        return (
          <Card key={c.id || idx} className="gap-4 py-4 shadow-sm">
            <CardContent className="space-y-4 px-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-semibold text-foreground">
                    {c.name || "Unnamed candidate"}
                  </p>
                  <p className="mt-1 flex items-center gap-1.5 truncate text-xs text-muted-foreground">
                    <Mail className="size-3.5" aria-hidden />
                    {c.email || "No email available"}
                  </p>
                </div>
                <ScoreBadge score={row.score} />
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
          tone === "success" ? "text-emerald-700" : "text-amber-700"
        )}
        title={value}
      >
        {value || "—"}
      </p>
    </div>
  );
}

function MatchResultsTable({ results, mode }) {
  if (!Array.isArray(results) || !results.length) {
    return <EmptyResults mode={mode} />;
  }

  return (
    <div className="space-y-4">
      <CandidateCards results={results} />
      <div className="hidden overflow-hidden rounded-2xl border bg-card md:block">
        <ScrollArea className="h-[min(560px,calc(100dvh-18rem))] w-full">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                <TableHead className="w-[120px]">Match</TableHead>
                <TableHead>Candidate</TableHead>
                <TableHead className="min-w-[180px]">Email</TableHead>
                <TableHead className="min-w-[180px]">Matched skills</TableHead>
                <TableHead className="min-w-[180px]">Gaps</TableHead>
                <TableHead className="w-[110px]">Resume</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {results.map((row, idx) => {
                const c = row.candidate || {};
                return (
                  <TableRow key={c.id || idx} className="align-top">
                    <TableCell>
                      <ScoreCell score={row.score} />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                          <UserRound className="size-4" aria-hidden />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-foreground">
                            {c.name || "Unnamed"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Rank #{idx + 1}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[220px] truncate text-sm text-muted-foreground">
                      {c.email || "—"}
                    </TableCell>
                    <TableCell className="max-w-[240px] text-xs text-emerald-700">
                      <span
                        className="line-clamp-2"
                        title={(row.matchedSkills || []).join(", ")}
                      >
                        {(row.matchedSkills || []).join(", ") || "—"}
                      </span>
                    </TableCell>
                    <TableCell className="max-w-[240px] text-xs text-amber-700">
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
                          <a href={c.resumeUrl} target="_blank" rel="noreferrer">
                            Open
                          </a>
                        </Button>
                      ) : (
                        <span className="text-sm text-muted-foreground">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </ScrollArea>
      </div>
    </div>
  );
}

function FileDropRow({ id, label, file, onFile, accept, helper }) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-sm font-medium">
        {label}
      </Label>
      <label
        htmlFor={id}
        className={cn(
          "group flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed px-5 py-7 text-center transition-all",
          file
            ? "border-primary/50 bg-primary/5"
            : "border-border bg-muted/30 hover:border-primary/60 hover:bg-primary/5"
        )}
      >
        <span className="flex size-12 items-center justify-center rounded-2xl bg-background text-primary shadow-sm ring-1 ring-border transition-transform group-hover:scale-105">
          {file ? (
            <CheckCircle2 className="size-6" aria-hidden />
          ) : (
            <Upload className="size-6" aria-hidden />
          )}
        </span>
        <span className="mt-3 max-w-full truncate text-sm font-semibold text-foreground">
          {file ? file.name : "Drop a JD here or click to browse"}
        </span>
        <span className="mt-1 text-xs text-muted-foreground">
          {helper || "PDF, DOC, DOCX, or TXT supported"}
        </span>
        <input
          id={id}
          type="file"
          accept={accept}
          className="sr-only"
          onChange={(e) => onFile(e.target.files?.[0] || null)}
        />
      </label>
    </div>
  );
}

function WorkflowCard({ active, icon: Icon, title, description, onClick, badge }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group relative overflow-hidden rounded-2xl border p-4 text-left transition-all",
        active
          ? "border-primary bg-primary/5 shadow-sm ring-2 ring-primary/15"
          : "border-border bg-card hover:border-primary/40 hover:bg-muted/30"
      )}
    >
      <div className="flex items-start gap-3">
        <span
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-xl transition-colors",
            active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
          )}
        >
          <Icon className="size-5" aria-hidden />
        </span>
        <span className="min-w-0">
          <span className="flex items-center gap-2">
            <span className="font-semibold text-foreground">{title}</span>
            {badge ? (
              <Badge variant={active ? "default" : "secondary"} className="text-[10px]">
                {badge}
              </Badge>
            ) : null}
          </span>
          <span className="mt-1 block text-sm leading-relaxed text-muted-foreground">
            {description}
          </span>
        </span>
      </div>
      {active ? (
        <CheckCircle2
          className="absolute right-4 top-4 size-4 text-primary"
          aria-hidden
        />
      ) : null}
    </button>
  );
}

function HowItWorksStep({ number, title, body, active }) {
  return (
    <div
      className={cn(
        "flex gap-3 rounded-2xl border p-4 transition-colors",
        active ? "border-primary/30 bg-primary/5" : "border-border bg-card/70"
      )}
    >
      <span
        className={cn(
          "flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold",
          active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
        )}
      >
        {number}
      </span>
      <div>
        <p className="font-medium text-foreground">{title}</p>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{body}</p>
      </div>
    </div>
  );
}

function SelectedJobPreview({ job }) {
  if (!job) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-muted/20 p-4 text-sm text-muted-foreground">
        Select a saved job to preview what will be matched.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border bg-card p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Briefcase className="size-5" aria-hidden />
        </span>
        <div className="min-w-0">
          <p className="truncate font-semibold text-foreground">
            {job.title || "Untitled role"}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {job.company || "Company not specified"}
          </p>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {formatSkills(job.skills) ? (
          <Badge variant="secondary" className="font-normal">
            {formatSkills(job.skills)}
          </Badge>
        ) : null}
        {(job.minExperience != null || job.maxExperience != null) && (
          <Badge variant="outline" className="font-normal">
            Exp {job.minExperience ?? "—"}–{job.maxExperience ?? "—"} yrs
          </Badge>
        )}
      </div>
    </div>
  );
}

function StatPill({ icon: Icon, label, value }) {
  return (
    <div className="rounded-2xl border border-white/15 bg-white/10 p-4 text-white backdrop-blur">
      <div className="flex items-center gap-3">
        <span className="flex size-9 items-center justify-center rounded-xl bg-white/15">
          <Icon className="size-4" aria-hidden />
        </span>
        <div>
          <p className="text-2xl font-semibold tracking-tight">{value}</p>
          <p className="text-xs text-white/70">{label}</p>
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
      setJobs((prev) => [safe, ...prev.filter((j) => String(j.id) !== String(safe.id))]);
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

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-[2rem] bg-slate-950 px-5 py-6 text-white shadow-xl sm:px-8 lg:px-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.35),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(99,102,241,0.3),transparent_32%)]" />
        <div className="relative grid gap-8 lg:grid-cols-[1.3fr_0.7fr] lg:items-end">
          <div className="space-y-5">
            <Badge className="border-white/20 bg-white/10 text-white hover:bg-white/10">
              AI matching workspace
            </Badge>
            <div className="space-y-3">
              <h1 className="max-w-3xl text-3xl font-semibold tracking-tight sm:text-4xl">
                Match every job to the right candidates with a clear, guided flow.
              </h1>
              <p className="max-w-2xl text-sm leading-relaxed text-white/70 sm:text-base">
                Save reusable jobs from JD files or run a quick one-off match. The
                screen now guides users through what to do, what will happen next,
                and where the ranked shortlist appears.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button
                type="button"
                className="bg-white text-slate-950 hover:bg-white/90"
                onClick={() => document.getElementById("saved-workflow")?.scrollIntoView({ behavior: "smooth" })}
              >
                Start matching
                <ArrowRight className="size-4" aria-hidden />
              </Button>
              <Button
                type="button"
                variant="outline"
                className="border-white/20 bg-white/10 text-white hover:bg-white/20 hover:text-white"
                onClick={loadJobs}
                disabled={loadingJobs}
              >
                {loadingJobs ? (
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                ) : (
                  <RefreshCw className="size-4" aria-hidden />
                )}
                Refresh jobs
              </Button>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            <StatPill icon={Briefcase} label="Saved jobs" value={jobs.length} />
            <StatPill icon={Sparkles} label="Top candidates" value={topK || 10} />
            <StatPill
              icon={Database}
              label="Current flow"
              value={mode === "quick" ? "Quick" : "Saved"}
            />
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <HowItWorksStep
          number="1"
          title="Choose matching flow"
          body="Use a saved job for repeatable hiring or quick JD when you only need an instant shortlist."
          active
        />
        <HowItWorksStep
          number="2"
          title="Add JD context"
          body="Upload a JD, select a saved role, and optionally add must-have skills to sharpen the ranking."
          active={Boolean(selectedJobId || quickJdFile || jdFile)}
        />
        <HowItWorksStep
          number="3"
          title="Review ranked candidates"
          body="Scores, matched skills, gaps, and resume links are displayed in one focused results panel."
          active={Boolean(activeResults?.length)}
        />
      </section>

      <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
        <div id="saved-workflow" className="space-y-6">
          <Card className="overflow-hidden shadow-sm">
            <CardHeader className="border-b bg-muted/30">
              <CardTitle className="flex items-center gap-2">
                <MousePointerClick className="size-5 text-primary" aria-hidden />
                Choose your workflow
              </CardTitle>
              <CardDescription>
                Pick the path that matches what the recruiter is trying to do.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 pt-6">
              <WorkflowCard
                active={mode === "saved"}
                icon={Briefcase}
                title="Saved job match"
                badge="Recommended"
                description="Create or select a reusable job, then rank your candidate pool against it."
                onClick={() => setMode("saved")}
              />
              <WorkflowCard
                active={mode === "quick"}
                icon={FileText}
                title="Quick JD match"
                description="Upload a JD file and get a shortlist without creating a saved job."
                onClick={() => setMode("quick")}
              />
            </CardContent>
          </Card>

          {mode === "saved" ? (
            <Card className="overflow-hidden shadow-sm">
              <CardHeader className="border-b bg-muted/30">
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="size-5 text-primary" aria-hidden />
                  Saved job setup
                </CardTitle>
                <CardDescription>
                  Upload a JD to create a job, or use an existing saved role.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5 pt-6">
                <FileDropRow
                  id="jd-upload"
                  label="Create saved job from JD"
                  file={jdFile}
                  onFile={setJdFile}
                  accept=".pdf,.doc,.docx,.txt"
                  helper="We parse and save this job for future matches."
                />
                <Button
                  type="button"
                  onClick={handleUploadJob}
                  disabled={uploadingJob || !jdFile}
                  className="w-full gap-2"
                >
                  {uploadingJob ? (
                    <>
                      <Loader2 className="size-4 animate-spin" aria-hidden />
                      Parsing JD…
                    </>
                  ) : (
                    <>
                      <Upload className="size-4" aria-hidden />
                      Parse & save job
                    </>
                  )}
                </Button>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Or select a saved job</Label>
                  <Select
                    value={selectedJobId || undefined}
                    onValueChange={setSelectedJobId}
                  >
                    <SelectTrigger className="h-11 w-full bg-background">
                      <SelectValue placeholder="Select job to match against" />
                    </SelectTrigger>
                    <SelectContent>
                      {jobs.length === 0 ? (
                        <SelectItem value="__none__" disabled className="opacity-100">
                          No saved jobs yet
                        </SelectItem>
                      ) : (
                        jobs.map((j) => (
                          <SelectItem key={j.id} value={String(j.id)}>
                            {(j.title || "Untitled") + (j.company ? ` · ${j.company}` : "")}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <SelectedJobPreview job={selectedJob} />
              </CardContent>
            </Card>
          ) : (
            <Card className="overflow-hidden shadow-sm">
              <CardHeader className="border-b bg-muted/30">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="size-5 text-primary" aria-hidden />
                  Quick JD setup
                </CardTitle>
                <CardDescription>
                  Best for quick screening without storing a role.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5 pt-6">
                <FileDropRow
                  id="jd-quick"
                  label="Upload JD file"
                  file={quickJdFile}
                  onFile={setQuickJdFile}
                  accept=".pdf,.doc,.docx,.txt"
                  helper="This JD is only used for this match run."
                />
                <div className="rounded-2xl border bg-muted/30 p-4 text-sm text-muted-foreground">
                  <div className="flex gap-3">
                    <CircleHelp className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                    <p>
                      Quick JD match is ideal when a recruiter has a JD file and
                      wants an immediate shortlist before deciding whether to save
                      the role.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="overflow-hidden shadow-sm">
            <CardHeader className="border-b bg-muted/30">
              <CardTitle className="flex items-center gap-2">
                <Zap className="size-5 text-primary" aria-hidden />
                Match settings
              </CardTitle>
              <CardDescription>
                Fine-tune how many candidates are shown and add must-have skills.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5 pt-6">
              <div className="space-y-2">
                <Label htmlFor="topk">Number of candidates to show</Label>
                <Input
                  id="topk"
                  type="number"
                  min={1}
                  max={50}
                  value={topK}
                  onChange={(e) => setTopK(e.target.value)}
                  className="h-11"
                />
                <p className="text-xs text-muted-foreground">
                  Recommended: 10 to 20 candidates for a focused first review.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="skills">Must-have or extra skills</Label>
                <Textarea
                  id="skills"
                  value={extraSkills}
                  onChange={(e) => setExtraSkills(e.target.value)}
                  placeholder="Example: React, Node.js, PostgreSQL, AWS"
                  className="min-h-24 resize-none"
                />
                <p className="text-xs text-muted-foreground">
                  Optional. Separate skills with commas to bias matching toward
                  critical requirements.
                </p>
              </div>

              {mode === "saved" ? (
                <Button
                  type="button"
                  onClick={handleMatchSavedJob}
                  disabled={!savedCanRun}
                  className="h-11 w-full gap-2"
                >
                  {matchBusy ? (
                    <Loader2 className="size-4 animate-spin" aria-hidden />
                  ) : (
                    <SearchCheck className="size-4" aria-hidden />
                  )}
                  Match saved job
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={handleMatchQuickJd}
                  disabled={!quickCanRun}
                  className="h-11 w-full gap-2"
                >
                  {matchBusy ? (
                    <Loader2 className="size-4 animate-spin" aria-hidden />
                  ) : (
                    <Sparkles className="size-4" aria-hidden />
                  )}
                  Run quick JD match
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="min-w-0 overflow-hidden shadow-sm">
          <CardHeader className="border-b bg-muted/30">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <SearchCheck className="size-5 text-primary" aria-hidden />
                  Ranked candidate shortlist
                </CardTitle>
                <CardDescription className="mt-1">
                  Review fit score, matched skills, missing skills, and resume links.
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
              title={mode === "quick" ? "Latest quick match" : "Latest saved-job match"}
              mode={mode}
            />
            <MatchResultsTable results={activeResults} mode={mode} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}