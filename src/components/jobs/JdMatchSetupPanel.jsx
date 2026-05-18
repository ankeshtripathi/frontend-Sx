import React from "react";
import { cn } from "@/lib/utils";
import { formatSkills } from "@/lib/candidate-format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  Briefcase,
  ChevronDown,
  FileText,
  Loader2,
  SearchCheck,
  Sparkles,
  Upload,
  X,
} from "lucide-react";

const JD_ACCEPT = ".pdf,.doc,.docx,.txt";

function FlowToggle({ mode, onModeChange }) {
  const items = [
    { id: "saved", label: "Saved job", icon: Briefcase },
    { id: "quick", label: "Quick match", icon: FileText },
  ];

  return (
    <div className="flex rounded-xl bg-slate-100/90 p-1 ring-1 ring-slate-200/80">
      {items.map(({ id, label, icon: Icon }) => {
        const active = mode === id;
        return (
          <button
            key={id}
            type="button"
            onClick={() => onModeChange(id)}
            className={cn(
              "flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition-all",
              active
                ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200/80"
                : "text-slate-600 hover:text-slate-900",
            )}
          >
            <Icon className="size-4 shrink-0" aria-hidden />
            {label}
          </button>
        );
      })}
    </div>
  );
}

function CompactJdPicker({ id, file, onFile }) {
  if (file) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-sky-200 bg-sky-50/80 px-3 py-2.5">
        <FileText className="size-4 shrink-0 text-sky-600" aria-hidden />
        <span className="min-w-0 flex-1 truncate text-sm font-medium text-slate-900">
          {file.name}
        </span>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-8 shrink-0 text-slate-500 hover:text-slate-900"
          onClick={() => onFile(null)}
          aria-label="Remove file"
        >
          <X className="size-4" aria-hidden />
        </Button>
        <input
          id={id}
          type="file"
          accept={JD_ACCEPT}
          className="sr-only"
          onChange={(e) => onFile(e.target.files?.[0] || null)}
        />
      </div>
    );
  }

  return (
    <label
      htmlFor={id}
      className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-slate-300 bg-slate-50/80 px-3 py-3 transition-colors hover:border-sky-400 hover:bg-sky-50/50"
    >
      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-white text-sky-600 shadow-sm ring-1 ring-slate-200/80">
        <Upload className="size-4" aria-hidden />
      </span>
      <span className="min-w-0 text-left">
        <span className="block text-sm font-semibold text-slate-900">Choose JD file</span>
        <span className="block text-xs text-slate-500">PDF, DOC, DOCX, or TXT</span>
      </span>
      <input
        id={id}
        type="file"
        accept={JD_ACCEPT}
        className="sr-only"
        onChange={(e) => onFile(e.target.files?.[0] || null)}
      />
    </label>
  );
}

function SelectedJobPreview({ job }) {
  if (!job) {
    return (
      <p className="rounded-lg border border-dashed border-slate-200 bg-slate-50/80 px-3 py-2 text-xs text-slate-500">
        Pick a saved job from the list above.
      </p>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200/80 bg-white px-3 py-2.5">
      <div className="flex items-center gap-2.5">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
          <Briefcase className="size-4" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-slate-900">
            {job.title || "Untitled role"}
          </p>
          <p className="truncate text-xs text-slate-500">
            {job.company || "No company"}
            {(job.minExperience != null || job.maxExperience != null) &&
              ` · ${job.minExperience ?? "—"}–${job.maxExperience ?? "—"} yrs`}
          </p>
        </div>
      </div>
      {formatSkills(job.skills) ? (
        <p className="mt-1.5 line-clamp-1 text-xs text-slate-600" title={formatSkills(job.skills)}>
          {formatSkills(job.skills)}
        </p>
      ) : null}
    </div>
  );
}

export default function JdMatchSetupPanel({
  mode,
  onModeChange,
  jobs,
  loadingJobs,
  selectedJobId,
  onSelectedJobIdChange,
  selectedJob,
  jdFile,
  onJdFileChange,
  uploadingJob,
  onUploadJob,
  quickJdFile,
  onQuickJdFileChange,
  topK,
  onTopKChange,
  extraSkills,
  onExtraSkillsChange,
  matchBusy,
  savedCanRun,
  quickCanRun,
  onMatchSavedJob,
  onMatchQuickJd,
}) {
  return (
    <aside id="saved-workflow" className="xl:sticky xl:top-4 xl:self-start">
      <Card className="overflow-hidden border-slate-200/90 bg-white py-0 shadow-md">
        <CardHeader className="space-y-3 border-b border-l-4 border-l-amber-500 bg-gradient-to-r from-amber-50/90 to-white px-4 py-4">
          <div>
            <CardTitle className="text-lg font-bold text-slate-900">Match setup</CardTitle>
            <CardDescription className="mt-1 text-sm">
              {mode === "saved"
                ? "Select a saved role or add one from a JD."
                : "One-off match — the JD is not saved."}
            </CardDescription>
          </div>
          <FlowToggle mode={mode} onModeChange={onModeChange} />
        </CardHeader>

        <CardContent className="space-y-4 px-4 py-4">
          {mode === "saved" ? (
            <>
              <div className="space-y-2">
                <Label
                  htmlFor="job-select"
                  className="text-xs font-semibold uppercase tracking-wide text-slate-500"
                >
                  Saved job
                </Label>
                <Select value={selectedJobId || undefined} onValueChange={onSelectedJobIdChange}>
                  <SelectTrigger id="job-select" className="h-10 w-full bg-background">
                    <SelectValue
                      placeholder={loadingJobs ? "Loading jobs…" : "Select a job"}
                    />
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
                <SelectedJobPreview job={selectedJob} />
              </div>

              <details className="group rounded-xl border border-slate-200/80 bg-slate-50/50 open:bg-white">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-3 py-2.5 text-sm font-semibold text-slate-800 [&::-webkit-details-marker]:hidden">
                  <span className="flex items-center gap-2">
                    <Upload className="size-4 text-sky-600" aria-hidden />
                    Add job from JD
                  </span>
                  <ChevronDown
                    className="size-4 text-slate-400 transition-transform group-open:rotate-180"
                    aria-hidden
                  />
                </summary>
                <div className="space-y-2 border-t border-slate-200/80 px-3 pb-3 pt-2">
                  <CompactJdPicker id="jd-upload" file={jdFile} onFile={onJdFileChange} />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full gap-2"
                    onClick={onUploadJob}
                    disabled={uploadingJob || !jdFile}
                  >
                    {uploadingJob ? (
                      <Loader2 className="size-4 animate-spin" aria-hidden />
                    ) : (
                      <Upload className="size-4" aria-hidden />
                    )}
                    Parse & save
                  </Button>
                </div>
              </details>
            </>
          ) : (
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Job description
              </Label>
              <CompactJdPicker id="jd-quick" file={quickJdFile} onFile={onQuickJdFileChange} />
            </div>
          )}

          <div className="space-y-3 rounded-xl border border-slate-200/80 bg-slate-50/60 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Options
            </p>
            <div className="grid grid-cols-[5.5rem_1fr] items-center gap-2">
              <Label htmlFor="topk" className="text-sm text-slate-700">
                Show top
              </Label>
              <Input
                id="topk"
                type="number"
                min={1}
                max={50}
                value={topK}
                onChange={(e) => onTopKChange(e.target.value)}
                className="h-9"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="skills" className="text-sm text-slate-700">
                Extra skills{" "}
                <span className="font-normal text-slate-400">(optional)</span>
              </Label>
              <Textarea
                id="skills"
                value={extraSkills}
                onChange={(e) => onExtraSkillsChange(e.target.value)}
                placeholder="React, Node.js, AWS…"
                className="min-h-[4.5rem] resize-none text-sm"
              />
            </div>
          </div>

          {mode === "saved" ? (
            <Button
              type="button"
              onClick={onMatchSavedJob}
              disabled={!savedCanRun}
              className="h-11 w-full gap-2 font-semibold"
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
              onClick={onMatchQuickJd}
              disabled={!quickCanRun}
              className="h-11 w-full gap-2 font-semibold"
            >
              {matchBusy ? (
                <Loader2 className="size-4 animate-spin" aria-hidden />
              ) : (
                <Sparkles className="size-4" aria-hidden />
              )}
              Run quick match
            </Button>
          )}
        </CardContent>
      </Card>
    </aside>
  );
}
