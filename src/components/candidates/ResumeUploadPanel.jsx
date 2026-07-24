import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  AlertCircle,
  CheckCircle2,
  Copy,
  FileText,
  FileUp,
  Loader2,
  RotateCw,
  Trash2,
  Users,
  X,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import ContentPanel from "@/components/workspace/ContentPanel";
import {
  clearResumeUpload,
  fetchResumeUploadJob,
  setResumeUploadPolling,
  startResumeUpload,
} from "@/store/resumeUpload/resumeUploadSlice";

const STATUS_LABELS = {
  queued: "Queued",
  processing: "Processing",
  completed: "Completed",
  failed: "Failed",
  created: "Added",
  duplicate: "Duplicate",
  error: "Error",
};

const ACCEPTED_EXT = new Set([".pdf", ".doc", ".docx", ".txt"]);
const MAX_FILES = 20;

function statusBadgeClass(status) {
  if (status === "completed" || status === "created") {
    return "bg-emerald-100 text-emerald-800 border-emerald-200";
  }
  if (status === "duplicate") return "bg-amber-100 text-amber-800 border-amber-200";
  if (status === "failed" || status === "error") {
    return "bg-red-100 text-red-800 border-red-200";
  }
  if (status === "processing") return "bg-sky-100 text-sky-800 border-sky-200";
  return "bg-slate-100 text-slate-700 border-slate-200";
}

function formatBytes(size) {
  if (!size && size !== 0) return "";
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function fileKey(file) {
  return `${file.name}::${file.size}::${file.lastModified}`;
}

function isAcceptedFile(file) {
  const ext = `.${String(file.name || "")
    .split(".")
    .pop()
    .toLowerCase()}`;
  return ACCEPTED_EXT.has(ext);
}

function SummaryStat({ label, value, tone, icon: Icon }) {
  const tones = {
    sky: "border-sky-200 bg-gradient-to-br from-sky-50 to-white text-sky-950",
    emerald:
      "border-emerald-200 bg-gradient-to-br from-emerald-50 to-white text-emerald-950",
    amber: "border-amber-200 bg-gradient-to-br from-amber-50 to-white text-amber-950",
    rose: "border-rose-200 bg-gradient-to-br from-rose-50 to-white text-rose-950",
    slate: "border-slate-200 bg-gradient-to-br from-slate-50 to-white text-slate-950",
  };

  return (
    <div className={cn("rounded-2xl border p-4 shadow-sm", tones[tone] || tones.slate)}>
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-bold uppercase tracking-wide opacity-80">{label}</p>
        {Icon ? <Icon className="size-4 opacity-70" aria-hidden /> : null}
      </div>
      <p className="mt-2 text-3xl font-bold tabular-nums">{value ?? 0}</p>
    </div>
  );
}

function MiniStat({ label, value, tone }) {
  const toneClass =
    tone === "emerald"
      ? "text-emerald-700"
      : tone === "amber"
        ? "text-amber-700"
        : tone === "rose"
          ? "text-rose-700"
          : "text-slate-900";

  return (
    <div className="rounded-xl border border-slate-200/80 bg-white/80 px-3 py-2 text-center">
      <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className={cn("text-lg font-bold tabular-nums", toneClass)}>{value ?? 0}</p>
    </div>
  );
}

export default function ResumeUploadPanel() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const toastedRef = useRef(null);

  const [files, setFiles] = useState([]);
  const [dragOver, setDragOver] = useState(false);

  const job = useSelector((state) => state.resumeUpload.job);
  const isSubmitting = useSelector((state) => state.resumeUpload.isSubmitting);
  const isPolling = useSelector((state) => state.resumeUpload.isPolling);
  const error = useSelector((state) => state.resumeUpload.error);

  const isActive = Boolean(job && !job.isTerminal);
  const isComplete = job?.status === "completed";
  const showProgress = Boolean(job && (isActive || isSubmitting));
  const showSummary = Boolean(job?.isTerminal);
  const progress = job?.progressPercent ?? 0;
  const summary = job?.summary;

  const totalBytes = useMemo(
    () => files.reduce((sum, f) => sum + (f.size || 0), 0),
    [files]
  );

  useEffect(() => {
    if (!job?.isTerminal || !job.id) return;
    if (toastedRef.current === job.id) return;
    toastedRef.current = job.id;

    if (job.status === "completed") {
      const created = summary?.created ?? 0;
      const dup = summary?.duplicate ?? 0;
      const err = summary?.errors ?? 0;
      toast.success(
        `Upload finished: ${created} added, ${dup} duplicate${err ? `, ${err} errors` : ""}`
      );
    } else if (job.status === "failed") {
      toast.error("Resume upload failed");
    }
  }, [job?.id, job?.isTerminal, job?.status, summary]);

  const mergeFiles = useCallback((incoming) => {
    const list = Array.from(incoming || []).filter(Boolean);
    if (!list.length) return;

    const accepted = [];
    let rejected = 0;
    for (const file of list) {
      if (isAcceptedFile(file)) accepted.push(file);
      else rejected += 1;
    }

    if (rejected) {
      toast.error(`${rejected} file(s) skipped — use PDF, DOC, DOCX, or TXT`);
    }
    if (!accepted.length) return;

    setFiles((prev) => {
      const map = new Map(prev.map((f) => [fileKey(f), f]));
      for (const file of accepted) map.set(fileKey(file), file);
      const next = Array.from(map.values());
      if (next.length > MAX_FILES) {
        toast.error(`Max ${MAX_FILES} files per batch — extras were trimmed`);
        return next.slice(0, MAX_FILES);
      }
      return next;
    });
  }, []);

  const handleFiles = (fileList) => mergeFiles(fileList);

  const removeFile = (key) => {
    setFiles((prev) => prev.filter((f) => fileKey(f) !== key));
  };

  const clearSelected = () => setFiles([]);

  const handleUpload = async () => {
    if (!files.length) {
      toast.error("Select at least one resume file");
      return;
    }
    const result = await dispatch(startResumeUpload(files));
    if (startResumeUpload.fulfilled.match(result)) {
      dispatch(setResumeUploadPolling(true));
      dispatch(fetchResumeUploadJob(result.payload.jobId));
      setFiles([]);
      toast.success("Upload started — you can navigate away; progress is saved");
    }
  };

  const handleClear = () => {
    dispatch(clearResumeUpload());
    setFiles([]);
    toastedRef.current = null;
  };

  const handleRefresh = () => {
    if (job?.id) dispatch(fetchResumeUploadJob(job.id));
  };

  const onDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    if (isSubmitting || isActive || showSummary) return;
    handleFiles(e.dataTransfer?.files);
  };

  return (
    <ContentPanel
      accent="sky"
      title="Resume upload"
      description="Drag & drop or browse. Processing continues in the background if you leave this page."
      icon={FileUp}
      actions={
        job?.id ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={handleRefresh}
          >
            <RotateCw className="size-4" aria-hidden />
            Refresh
          </Button>
        ) : null
      }
    >
      <div className="space-y-6">
        {!showSummary ? (
          <div
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                inputRef.current?.click();
              }
            }}
            onDragEnter={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              setDragOver(false);
            }}
            onDrop={onDrop}
            onClick={() => {
              if (!isSubmitting && !isActive) inputRef.current?.click();
            }}
            className={cn(
              "flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-12 text-center transition-all duration-300",
              dragOver
                ? "scale-[1.01] border-sky-500 bg-sky-100/70 shadow-inner"
                : files.length
                  ? "border-sky-400 bg-sky-50/80"
                  : "border-slate-200 bg-slate-50/50 hover:border-sky-300 hover:bg-sky-50/40",
              (isSubmitting || isActive) && "pointer-events-none opacity-60"
            )}
          >
            <span className="flex size-14 items-center justify-center rounded-2xl bg-sky-500 text-white shadow-lg shadow-sky-500/25">
              <FileUp className="size-7" aria-hidden />
            </span>
            <span className="mt-4 text-base font-bold text-slate-900">
              {files.length
                ? `${files.length} file${files.length === 1 ? "" : "s"} ready`
                : dragOver
                  ? "Drop to add files"
                  : "Drop resumes here or click to browse"}
            </span>
            <span className="mt-1 text-sm font-medium text-slate-600">
              Up to {MAX_FILES} files · PDF, DOC, DOCX, TXT
              {files.length ? ` · ${formatBytes(totalBytes)}` : ""}
            </span>
            <input
              ref={inputRef}
              type="file"
              multiple
              accept=".pdf,.doc,.docx,.txt"
              className="sr-only"
              onChange={(e) => {
                handleFiles(e.target.files);
                e.target.value = "";
              }}
            />
          </div>
        ) : null}

        {/* Selected file list */}
        {!showSummary && files.length > 0 ? (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <div className="flex items-center justify-between gap-2 border-b bg-slate-50 px-4 py-3">
              <p className="text-sm font-bold text-slate-900">
                Selected files
                <span className="ml-2 font-semibold text-slate-500">
                  ({files.length}/{MAX_FILES})
                </span>
              </p>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 gap-1.5 text-slate-600"
                onClick={clearSelected}
              >
                <Trash2 className="size-3.5" aria-hidden />
                Clear
              </Button>
            </div>
            <ul className="max-h-52 divide-y divide-slate-100 overflow-y-auto">
              {files.map((file) => {
                const key = fileKey(file);
                return (
                  <li
                    key={key}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm"
                  >
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-sky-50 text-sky-700">
                      <FileText className="size-4" aria-hidden />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-semibold text-slate-900">
                        {file.name}
                      </span>
                      <span className="text-xs text-slate-500">
                        {formatBytes(file.size)}
                      </span>
                    </span>
                    <button
                      type="button"
                      className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile(key);
                      }}
                      aria-label={`Remove ${file.name}`}
                    >
                      <X className="size-4" />
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ) : null}

        {error ? (
          <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            <AlertCircle className="mt-0.5 size-5 shrink-0" aria-hidden />
            <p className="font-medium">{error}</p>
          </div>
        ) : null}

        {showProgress ? (
          <div className="space-y-4 rounded-2xl border border-sky-200 bg-gradient-to-br from-sky-50/90 to-white p-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-bold text-slate-900">Processing resumes</p>
                <p className="mt-0.5 text-xs font-medium text-slate-600">
                  {job.currentFile ? (
                    <>
                      Current: <span className="text-slate-800">{job.currentFile}</span>
                    </>
                  ) : (
                    "Preparing files…"
                  )}
                </p>
              </div>
              <Badge
                className={cn("font-semibold capitalize", statusBadgeClass(job.status))}
              >
                {isSubmitting ? "Uploading…" : STATUS_LABELS[job.status] || job.status}
                {(isPolling || isSubmitting) && !job.isTerminal ? (
                  <Loader2 className="ml-1.5 inline size-3 animate-spin" aria-hidden />
                ) : null}
              </Badge>
            </div>

            <div>
              <div className="mb-2 flex justify-between text-sm font-semibold text-slate-700">
                <span>
                  {job.processed ?? 0} / {job.total ?? 0} processed
                </span>
                <span className="tabular-nums">{progress}%</span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-sky-500 to-cyan-500 transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              <MiniStat label="Total" value={job.total} />
              <MiniStat label="Processed" value={job.processed} />
              <MiniStat label="Added" value={job.created} tone="emerald" />
              <MiniStat label="Duplicate" value={job.duplicate} tone="amber" />
              <MiniStat label="Skipped" value={job.skipped} />
              <MiniStat label="Errors" value={job.error} tone="rose" />
            </div>
          </div>
        ) : null}

        {showSummary ? (
          <div className="space-y-5">
            <div
              className={cn(
                "flex items-start gap-4 rounded-2xl border p-5",
                isComplete
                  ? "border-emerald-200 bg-gradient-to-br from-emerald-50 to-white"
                  : "border-red-200 bg-gradient-to-br from-red-50 to-white"
              )}
            >
              {isComplete ? (
                <CheckCircle2 className="size-10 shrink-0 text-emerald-600" aria-hidden />
              ) : (
                <XCircle className="size-10 shrink-0 text-red-600" aria-hidden />
              )}
              <div className="min-w-0 flex-1">
                <h3 className="text-lg font-bold text-slate-900">
                  {isComplete ? "Upload complete" : "Upload failed"}
                </h3>
                <p className="mt-1 text-sm font-medium text-slate-600">
                  {isComplete
                    ? `Processed ${summary?.processed ?? 0} of ${summary?.total ?? 0} files. ${summary?.addedToPool ?? 0} new candidates were added to your pool.`
                    : "Something went wrong while processing this batch. Check file details below or try again."}
                </p>
                {job.updatedAt ? (
                  <p className="mt-2 text-xs text-slate-500">
                    Finished {new Date(job.updatedAt).toLocaleString()}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              <SummaryStat label="Total files" value={summary?.total} tone="sky" />
              <SummaryStat
                label="Added"
                value={summary?.created}
                tone="emerald"
                icon={CheckCircle2}
              />
              <SummaryStat
                label="Duplicates"
                value={summary?.duplicate}
                tone="amber"
                icon={Copy}
              />
              <SummaryStat label="Skipped" value={summary?.skipped} tone="slate" />
              <SummaryStat
                label="Errors"
                value={summary?.errors}
                tone="rose"
                icon={AlertCircle}
              />
            </div>

            {Array.isArray(job.results) && job.results.length > 0 ? (
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                <div className="border-b bg-slate-50 px-4 py-3">
                  <p className="text-sm font-bold text-slate-900">File breakdown</p>
                </div>
                <div className="max-h-72 overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 bg-slate-100 text-left text-xs font-bold uppercase tracking-wide text-slate-600">
                      <tr>
                        <th className="px-4 py-2">#</th>
                        <th className="px-4 py-2">File</th>
                        <th className="px-4 py-2">Status</th>
                        <th className="px-4 py-2">Detail</th>
                      </tr>
                    </thead>
                    <tbody>
                      {job.results.map((row, i) => (
                        <tr key={`${row.row}-${i}`} className="border-t border-slate-100">
                          <td className="px-4 py-2 tabular-nums">{row.row}</td>
                          <td className="max-w-[200px] truncate px-4 py-2 font-medium text-slate-900">
                            {row.fileName}
                          </td>
                          <td className="px-4 py-2">
                            <Badge
                              variant="outline"
                              className={cn(
                                "font-normal capitalize",
                                statusBadgeClass(row.status)
                              )}
                            >
                              {row.status}
                            </Badge>
                          </td>
                          <td className="max-w-xs truncate px-4 py-2 text-xs text-slate-600">
                            {row.error || row.reason || row.candidateId || "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : null}

            <div className="flex flex-wrap gap-2">
              <Button type="button" onClick={handleClear}>
                Upload another batch
              </Button>
              <Button
                type="button"
                variant="outline"
                className="gap-2"
                onClick={() => navigate("/dashboard/get-candidates")}
              >
                <Users className="size-4" aria-hidden />
                Browse candidates
              </Button>
            </div>
          </div>
        ) : null}

        {!showSummary && (
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              className="gap-2 bg-sky-600 font-semibold hover:bg-sky-700"
              disabled={!files.length || isSubmitting || isActive}
              onClick={handleUpload}
            >
              {isSubmitting ? (
                <Loader2 className="size-4 animate-spin" aria-hidden />
              ) : (
                <FileUp className="size-4" aria-hidden />
              )}
              {isSubmitting
                ? "Starting upload…"
                : `Start upload${files.length ? ` (${files.length})` : ""}`}
            </Button>
            {files.length ? (
              <Button type="button" variant="outline" onClick={clearSelected}>
                Clear selection
              </Button>
            ) : null}
          </div>
        )}
      </div>
    </ContentPanel>
  );
}
