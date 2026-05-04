import React, { useCallback, useEffect, useState } from "react";
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

function formatSkills(skills) {
  if (skills == null) return "";
  if (Array.isArray(skills)) return skills.join(", ");
  if (typeof skills === "string") return skills;
  return "";
}

function MatchSummary({ payload, title }) {
  if (!payload) return null;
  const job = payload.job;
  return (
    <div className="mt-4 rounded border bg-white p-4 text-sm space-y-2">
      <p className="font-semibold">{title}</p>
      {job && (
        <p className="text-gray-600">
          Job: {job.title || "Untitled"}
          {job.company ? ` · ${job.company}` : ""}
          {formatSkills(job.skills) ? ` · Skills: ${formatSkills(job.skills)}` : ""}
          {(job.minExperience != null || job.maxExperience != null) && (
            <span>
              {" "}
              · Exp: {job.minExperience ?? "—"}–{job.maxExperience ?? "—"} yrs
            </span>
          )}
        </p>
      )}
      <p className="text-gray-600">
        Scored pool (with embeddings): {payload.totalCandidatesScored ?? "—"} · Returned:{" "}
        {payload.returned ?? (payload.results?.length ?? 0)}
      </p>
    </div>
  );
}

function MatchResultsTable({ results }) {
  if (!Array.isArray(results) || !results.length) {
    return <p className="text-sm text-gray-500 mt-2">No matches returned.</p>;
  }

  return (
    <div className="mt-3 overflow-x-auto max-h-[420px] overflow-y-auto border rounded">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 sticky top-0">
          <tr>
            <th className="text-left p-2">Score</th>
            <th className="text-left p-2">Name</th>
            <th className="text-left p-2">Email</th>
            <th className="text-left p-2">Matched skills</th>
            <th className="text-left p-2">Missing skills</th>
            <th className="text-left p-2">Resume</th>
          </tr>
        </thead>
        <tbody>
          {results.map((row, idx) => {
            const c = row.candidate || {};
            return (
              <tr key={c.id || idx} className="border-t">
                <td className="p-2 font-mono">
                  {typeof row.score === "number" ? row.score.toFixed(4) : "—"}
                </td>
                <td className="p-2">{c.name || "—"}</td>
                <td className="p-2">{c.email || "—"}</td>
                <td className="p-2 text-xs max-w-[200px]">
                  {(row.matchedSkills || []).join(", ") || "—"}
                </td>
                <td className="p-2 text-xs max-w-[200px] text-amber-800">
                  {(row.missingSkills || []).join(", ") || "—"}
                </td>
                <td className="p-2">
                  {c.resumeUrl ? (
                    <a
                      href={c.resumeUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 underline"
                    >
                      File
                    </a>
                  ) : (
                    "—"
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
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

  const loadJobs = useCallback(async () => {
    setLoadingJobs(true);
    try {
      const list = await getJobs();
      const arr = Array.isArray(list) ? list : [];
      setJobs(arr.map(omitJobEmbedding));
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
      setJobs((prev) => [safe, ...prev.filter((j) => j.id !== safe.id)]);
      setSelectedJobId(safe.id);
      setJdFile(null);
    } catch (e) {
      toast.error(getApiErrorMessage(e, "Job upload failed"));
    } finally {
      setUploadingJob(false);
    }
  };

  const matchParams = () => ({
    topK: Number(topK) > 0 ? Number(topK) : 10,
    skills: extraSkills.trim() || undefined,
  });

  const handleMatchSavedJob = async () => {
    if (!selectedJobId) {
      toast.error("Select a job");
      return;
    }
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
    setMatching(true);
    setJdFileMatch(null);
    try {
      const res = await matchJD(quickJdFile, matchParams());
      setJdFileMatch(res);
      toast.success("JD match complete (no job saved)");
    } catch (e) {
      toast.error(getApiErrorMessage(e, "JD match failed"));
    } finally {
      setMatching(false);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-10">
      <div>
        <h1 className="text-2xl font-bold">Jobs & candidate match</h1>
        <p className="text-sm text-gray-600 mt-1">
          Upload a JD to <code className="text-xs bg-gray-100 px-1 rounded">POST /jobs/upload</code>
          , then run{" "}
          <code className="text-xs bg-gray-100 px-1 rounded">GET /jobs/:jobId/matches</code>.
          Optional: match a one-off JD via{" "}
          <code className="text-xs bg-gray-100 px-1 rounded">POST /candidates/match/jd</code>.
        </p>
      </div>

      <section className="rounded-lg border bg-white p-4 shadow-sm space-y-4">
        <h2 className="text-lg font-semibold">1. Create job from document</h2>
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label className="text-xs text-gray-500 block mb-1">JD file (PDF/DOCX/TXT)</label>
            <input
              type="file"
              accept=".pdf,.doc,.docx,.txt"
              onChange={(e) => setJdFile(e.target.files?.[0] || null)}
            />
          </div>
          <Button
            type="button"
            onClick={handleUploadJob}
            disabled={uploadingJob || !jdFile}
          >
            {uploadingJob ? "Uploading…" : "Upload & parse job"}
          </Button>
          <Button type="button" variant="outline" onClick={loadJobs} disabled={loadingJobs}>
            Refresh job list
          </Button>
        </div>

        <div>
          <label className="text-xs text-gray-500 block mb-1">Saved jobs</label>
          <select
            className="w-full max-w-xl border rounded px-2 py-2 text-sm"
            value={selectedJobId}
            onChange={(e) => setSelectedJobId(e.target.value)}
          >
            <option value="">— Select a job —</option>
            {jobs.map((j) => (
              <option key={j.id} value={j.id}>
                {(j.title || "Untitled") +
                  (j.company ? ` · ${j.company}` : "") +
                  ` · ${j.id.slice(0, 8)}…`}
              </option>
            ))}
          </select>
        </div>
      </section>

      <section className="rounded-lg border bg-white p-4 shadow-sm space-y-4">
        <h2 className="text-lg font-semibold">2. Match parameters</h2>
        <div className="grid gap-3 md:grid-cols-2 max-w-xl">
          <div>
            <label className="text-xs text-gray-500 block mb-1">topK (1–50)</label>
            <Input
              type="number"
              min={1}
              max={50}
              value={topK}
              onChange={(e) => setTopK(e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">
              Extra required skills (comma-separated, merged with job skills)
            </label>
            <Input
              value={extraSkills}
              onChange={(e) => setExtraSkills(e.target.value)}
              placeholder="e.g. typescript, postgres"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button
            type="button"
            onClick={handleMatchSavedJob}
            disabled={matching || !selectedJobId}
          >
            {matching ? "Matching…" : "Match against saved job"}
          </Button>
        </div>

        <MatchSummary payload={persistedMatch} title="Saved job match" />
        <MatchResultsTable results={persistedMatch?.results} />
      </section>

      <section className="rounded-lg border bg-white p-4 shadow-sm space-y-4">
        <h2 className="text-lg font-semibold">3. One-off JD match (no DB job)</h2>
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label className="text-xs text-gray-500 block mb-1">JD file</label>
            <input
              type="file"
              accept=".pdf,.doc,.docx,.txt"
              onChange={(e) => setQuickJdFile(e.target.files?.[0] || null)}
            />
          </div>
          <Button
            type="button"
            variant="secondary"
            onClick={handleMatchQuickJd}
            disabled={matching || !quickJdFile}
          >
            {matching ? "Matching…" : "Match JD file only"}
          </Button>
        </div>
        <MatchSummary payload={jdFileMatch} title="Ephemeral JD match" />
        <MatchResultsTable results={jdFileMatch?.results} />
      </section>
    </div>
  );
}
