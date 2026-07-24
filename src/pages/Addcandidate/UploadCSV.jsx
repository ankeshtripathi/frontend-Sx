import React, { useState } from "react";
import toast from "react-hot-toast";
import { getApiErrorMessage } from "@/api/axios";
import { uploadCsv } from "@/api/candidate";
import PageHero from "@/components/workspace/PageHero";
import WorkspacePage from "@/components/workspace/WorkspacePage";
import CandidateWorkspaceTabs from "@/components/workspace/CandidateWorkspaceTabs";
import ContentPanel from "@/components/workspace/ContentPanel";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileSpreadsheet } from "lucide-react";

/** Documented columns the backend maps (aliases like city→location also work). */
const SUPPORTED_COLUMNS = [
  "name",
  "email",
  "phone",
  "experience",
  "skills",
  "location / current_location",
  "preferred_location",
  "hometown",
  "pincode",
  "company",
  "designation",
  "department",
  "industry",
  "qualification",
  "current_salary",
  "expected_salary",
  "notice_period",
];

const UploadCSV = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleUpload = async () => {
    if (!file) {
      toast.error("Please select a CSV file");
      return;
    }

    setUploading(true);
    setError("");

    try {
      const data = await uploadCsv(file);
      setResult(data);
      toast.success(
        `CSV processed: ${data?.created ?? 0} created, ${data?.duplicate ?? 0} duplicate`
      );
    } catch (err) {
      const message = getApiErrorMessage(err, "CSV upload failed");
      setError(message);
      toast.error(message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <WorkspacePage>
      <PageHero
        eyebrow="Add candidates"
        title="Upload candidates via CSV"
        description="Import full profiles — name, contact, skills, location, company, designation, and more. Email is required on every row."
      />

      <CandidateWorkspaceTabs />

      <ContentPanel accent="emerald" title="CSV file" icon={FileSpreadsheet}>
        <div className="mb-5 rounded-xl border border-emerald-200/80 bg-emerald-50/60 p-4">
          <p className="text-sm font-semibold text-emerald-950">
            Supported columns
          </p>
          <p className="mt-1 text-xs font-medium text-emerald-800/80">
            Header names are flexible (e.g.{" "}
            <code className="rounded bg-white/70 px-1">city</code>,{" "}
            <code className="rounded bg-white/70 px-1">key_skills</code>,{" "}
            <code className="rounded bg-white/70 px-1">mobile</code>). Skills can be
            comma-separated.
          </p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {SUPPORTED_COLUMNS.map((col) => (
              <Badge
                key={col}
                variant="secondary"
                className="border-emerald-200 bg-white font-medium text-emerald-900"
              >
                {col}
              </Badge>
            ))}
          </div>
        </div>

        <input
          type="file"
          accept=".csv"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="mb-4 block w-full text-sm text-slate-600 file:mr-4 file:rounded-lg file:border-0 file:bg-emerald-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-emerald-700 hover:file:bg-emerald-100"
        />

        {error ? (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <Button
          type="button"
          onClick={handleUpload}
          disabled={uploading || !file}
          className="bg-emerald-600 hover:bg-emerald-700"
        >
          {uploading ? "Processing..." : "Upload CSV"}
        </Button>

        {result ? (
          <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50/50 p-4">
            <div className="grid gap-3 text-sm md:grid-cols-5">
              <Stat label="Total" value={result.total || 0} />
              <Stat label="Created" value={result.created || 0} />
              <Stat label="Duplicate" value={result.duplicate || 0} />
              <Stat label="Skipped" value={result.skipped || 0} />
              <Stat label="Errors" value={result.error || 0} />
            </div>

            {Array.isArray(result.results) && result.results.length > 0 ? (
              <div className="mt-4 overflow-x-auto rounded-lg border border-slate-200 bg-white">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-slate-50 text-left text-slate-500">
                      <th className="px-4 py-2">Row</th>
                      <th className="px-4 py-2">Status</th>
                      <th className="px-4 py-2">Email</th>
                      <th className="px-4 py-2">Location</th>
                      <th className="px-4 py-2">Skills</th>
                      <th className="px-4 py-2">Message</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.results.map((row) => (
                      <tr key={row.row} className="border-b last:border-0">
                        <td className="px-4 py-2">{row.row}</td>
                        <td className="px-4 py-2">{row.status}</td>
                        <td className="px-4 py-2">{row.email || "-"}</td>
                        <td className="px-4 py-2">{row.currentLocation || "-"}</td>
                        <td className="px-4 py-2 tabular-nums">
                          {row.skillsCount != null ? row.skillsCount : "-"}
                        </td>
                        <td className="px-4 py-2">{row.reason || row.error || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : null}
          </div>
        ) : null}
      </ContentPanel>
    </WorkspacePage>
  );
};

function Stat({ label, value }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3">
      <div className="text-slate-500">{label}</div>
      <div className="text-lg font-semibold text-slate-900">{value}</div>
    </div>
  );
}

export default UploadCSV;
