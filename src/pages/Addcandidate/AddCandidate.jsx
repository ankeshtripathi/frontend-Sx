import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  BrainCircuit,
  CheckCircle2,
  FileSpreadsheet,
  FileText,
  FileUp,
  Layers3,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { getCandidates } from "@/api/candidate";
import PageHero, {
  HeroGhostButton,
  HeroPrimaryButton,
} from "@/components/workspace/PageHero";
import WorkspacePage from "@/components/workspace/WorkspacePage";
import CandidateWorkspaceTabs from "@/components/workspace/CandidateWorkspaceTabs";
import MetricStatCard from "@/components/workspace/MetricStatCard";
import ContentPanel from "@/components/workspace/ContentPanel";
import ResumeUploadPanel from "@/components/candidates/ResumeUploadPanel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const STEPS = [
  {
    title: "Drop resumes",
    detail: "PDF, DOC, DOCX, or TXT — up to 20 files per batch.",
    icon: FileUp,
  },
  {
    title: "AI parses profiles",
    detail: "We extract skills, location, experience, and contact fields.",
    icon: BrainCircuit,
  },
  {
    title: "Land in your pool",
    detail: "Duplicates are flagged; new talent is searchable instantly.",
    icon: Users,
  },
];

const FORMAT_TIPS = [
  { label: "PDF", hint: "Best for scanned + digital resumes" },
  { label: "DOCX", hint: "Clean text extraction" },
  { label: "DOC", hint: "Legacy Word supported" },
  { label: "TXT", hint: "Plain text fallback" },
];

function StepCard({ index, title, detail, icon: Icon }) {
  return (
    <div className="relative flex gap-4 rounded-2xl border border-sky-100 bg-gradient-to-br from-sky-50/80 to-white p-4 shadow-sm">
      <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-sky-600 text-white shadow-md shadow-sky-600/25">
        <Icon className="size-5" aria-hidden />
      </span>
      <div className="min-w-0">
        <p className="text-[11px] font-bold uppercase tracking-wide text-sky-700/70">
          Step {index}
        </p>
        <p className="mt-0.5 text-sm font-bold text-slate-900">{title}</p>
        <p className="mt-1 text-xs font-medium leading-relaxed text-slate-600">
          {detail}
        </p>
      </div>
    </div>
  );
}

function AlternatePathCard({
  title,
  description,
  icon: Icon,
  tone,
  actionLabel,
  onClick,
}) {
  const tones = {
    emerald:
      "border-emerald-200/90 from-emerald-50 to-white text-emerald-700 ring-emerald-100",
    violet:
      "border-violet-200/90 from-violet-50 to-white text-violet-700 ring-violet-100",
    amber:
      "border-amber-200/90 from-amber-50 to-white text-amber-700 ring-amber-100",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group flex w-full flex-col rounded-2xl border bg-gradient-to-br p-5 text-left shadow-sm ring-1 transition-all hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400",
        tones[tone]
      )}
    >
      <span className="flex size-10 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-black/5">
        <Icon className="size-5" aria-hidden />
      </span>
      <span className="mt-4 text-sm font-bold text-slate-900">{title}</span>
      <span className="mt-1 text-xs font-medium leading-relaxed text-slate-600">
        {description}
      </span>
      <span className="mt-4 text-xs font-bold uppercase tracking-wide opacity-90 transition-transform group-hover:translate-x-0.5">
        {actionLabel} →
      </span>
    </button>
  );
}

const AddCandidate = () => {
  const navigate = useNavigate();
  const job = useSelector((state) => state.resumeUpload?.job);
  const isPolling = useSelector((state) => state.resumeUpload?.isPolling);

  const [poolTotal, setPoolTotal] = useState(null);
  const [poolLoading, setPoolLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setPoolLoading(true);
      try {
        const res = await getCandidates({ page: 1, limit: 1 });
        if (cancelled) return;
        const total =
          res?.pagination?.total ??
          (Array.isArray(res) ? res.length : res?.items?.length ?? 0);
        setPoolTotal(total);
      } catch {
        if (!cancelled) setPoolTotal(null);
      } finally {
        if (!cancelled) setPoolLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [job?.isTerminal]);

  const uploadStatus = useMemo(() => {
    if (!job) return { label: "Idle", tone: "slate" };
    if (!job.isTerminal) return { label: "Processing", tone: "sky" };
    if (job.status === "completed") return { label: "Complete", tone: "emerald" };
    if (job.status === "failed") return { label: "Failed", tone: "rose" };
    return { label: job.status || "Unknown", tone: "slate" };
  }, [job]);

  const batchProgress = job
    ? `${job.processed ?? 0}/${job.total ?? 0}`
    : "—";

  return (
    <WorkspacePage>
      <PageHero
        eyebrow="Talent intake"
        title="Upload resumes to your talent pool"
        description="Batch-ingest PDF and Word resumes. AI extracts structured profiles while you keep working — progress survives navigation."
        actions={
          <>
            <HeroPrimaryButton
              onClick={() => {
                document
                  .getElementById("resume-upload-panel")
                  ?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
            >
              <FileUp className="size-4" aria-hidden />
              Start upload
            </HeroPrimaryButton>
            <HeroGhostButton onClick={() => navigate("/dashboard/get-candidates")}>
              <Users className="size-4" aria-hidden />
              Browse pool
            </HeroGhostButton>
            <HeroGhostButton onClick={() => navigate("/candidate/upload-csv")}>
              <FileSpreadsheet className="size-4" aria-hidden />
              CSV import
            </HeroGhostButton>
          </>
        }
        stats={[
          {
            label: "Pool size",
            value: poolLoading ? "…" : (poolTotal ?? "—"),
            tone: "emerald",
          },
          {
            label: "This batch",
            value: batchProgress,
            tone: "sky",
          },
          {
            label: "Upload status",
            value: uploadStatus.label,
            tone: "violet",
          },
        ]}
      />

      <CandidateWorkspaceTabs />

      {/* Live intake metrics */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricStatCard
          variant="compact"
          title="Talent pool"
          value={poolLoading ? "…" : (poolTotal ?? "—")}
          hint="Candidates in workspace"
          icon={Users}
          tone="sky"
        />
        <MetricStatCard
          variant="compact"
          title="Batch size"
          value={job?.total ?? 0}
          hint="Files in current / last job"
          icon={Layers3}
          tone="violet"
        />
        <MetricStatCard
          variant="compact"
          title="Added"
          value={job?.created ?? job?.summary?.created ?? 0}
          hint="New profiles from batch"
          icon={CheckCircle2}
          tone="emerald"
        />
        <MetricStatCard
          variant="compact"
          title="Live sync"
          value={isPolling ? "On" : "Off"}
          hint={isPolling ? "Polling job progress" : "Idle / finished"}
          icon={Sparkles}
          tone="amber"
        />
      </div>

      {/* How it works */}
      <section aria-label="How resume upload works">
        <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500">
              How it works
            </h2>
            <p className="mt-0.5 text-sm font-medium text-slate-600">
              Three steps from file drop to searchable candidate.
            </p>
          </div>
          {job && !job.isTerminal ? (
            <Badge className="border-sky-200 bg-sky-100 font-semibold text-sky-900 hover:bg-sky-100">
              Batch running in background
            </Badge>
          ) : null}
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          {STEPS.map((step, i) => (
            <StepCard key={step.title} index={i + 1} {...step} />
          ))}
        </div>
      </section>

      {/* Upload + guidance */}
      <div
        id="resume-upload-panel"
        className="grid scroll-mt-6 gap-6 xl:grid-cols-[minmax(0,1fr)_320px]"
      >
        <ResumeUploadPanel />

        <aside className="space-y-4 xl:sticky xl:top-4 xl:self-start">
          <ContentPanel
            accent="sky"
            title="Supported formats"
            description="Clearer files parse more accurately."
            icon={FileText}
          >
            <ul className="space-y-2.5">
              {FORMAT_TIPS.map((item) => (
                <li
                  key={item.label}
                  className="flex items-start justify-between gap-3 rounded-xl border border-slate-200/80 bg-white px-3 py-2.5"
                >
                  <div>
                    <p className="text-sm font-bold text-slate-900">{item.label}</p>
                    <p className="text-xs font-medium text-slate-500">{item.hint}</p>
                  </div>
                  <ShieldCheck className="mt-0.5 size-4 shrink-0 text-sky-600" aria-hidden />
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs leading-relaxed text-slate-500">
              Tip: Prefer text-based PDFs over heavy scans. Max 20 files per batch.
              Keep the resume worker running for background processing.
            </p>
          </ContentPanel>

          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
              Other intake paths
            </p>
            <AlternatePathCard
              title="CSV bulk import"
              description="Spreadsheet rows with skills, location, company, and more."
              icon={FileSpreadsheet}
              tone="emerald"
              actionLabel="Open CSV upload"
              onClick={() => navigate("/candidate/upload-csv")}
            />
            <AlternatePathCard
              title="Search & filter"
              description="Review newly added profiles with smart filters."
              icon={Users}
              tone="violet"
              actionLabel="Browse candidates"
              onClick={() => navigate("/dashboard/get-candidates")}
            />
            <AlternatePathCard
              title="AI job matching"
              description="Rank this pool against a job description."
              icon={Sparkles}
              tone="amber"
              actionLabel="Open matching"
              onClick={() => navigate("/dashboard/jobs")}
            />
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
            <p className="text-sm font-bold text-slate-900">Need a bigger import?</p>
            <p className="mt-1 text-xs font-medium leading-relaxed text-slate-600">
              Use CSV for hundreds of structured rows. Use resumes when you need
              AI extraction from documents.
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-3 w-full gap-2 font-semibold"
              onClick={() => navigate("/candidate/upload-csv")}
            >
              <FileSpreadsheet className="size-4" aria-hidden />
              Switch to CSV
            </Button>
          </div>
        </aside>
      </div>
    </WorkspacePage>
  );
};

export default AddCandidate;
