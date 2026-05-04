import React, { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { getApiErrorMessage } from "@/api/axios";
import { getJobStatus, uploadResumes } from "@/api/candidate";

const UploadPDF = () => {
  const pollRef = useRef(null);

  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  /** @type {import('react').Dispatch<import('react').SetStateAction<object | null>>} */
  const [uploadJob, setUploadJob] = useState(null);
  const [error, setError] = useState("");

  const finishedStatuses = new Set(["completed", "failed"]);

  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  const fetchStatus = async (jobId) => {
    const job = await getJobStatus(jobId);
    setUploadJob(job);

    const status = job?.status;
    if (finishedStatuses.has(status) && pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
    return job;
  };

  const startPolling = (jobId) => {
    if (pollRef.current) clearInterval(pollRef.current);

    pollRef.current = setInterval(() => {
      fetchStatus(jobId).catch((err) => {
        console.error("Polling failed", err);
      });
    }, 3000);
  };

  const handleUpload = async () => {
    if (!files.length) {
      toast.error("Please select files");
      return;
    }

    setUploading(true);
    setError("");

    try {
      const res = await uploadResumes(files);
      /** Backend 202: { jobId, status, total } after unwrap */
      const jobId = res?.jobId ?? res?.id;
      if (!jobId) {
        throw new Error("Missing upload job id from server");
      }

      setUploadJob({
        id: jobId,
        status: res?.status ?? "queued",
        total: res?.total ?? files.length,
        processed: 0,
        created: 0,
        duplicate: 0,
        skipped: 0,
        error: 0,
        results: [],
      });
      toast.success("Resume upload queued");

      startPolling(jobId);
      await fetchStatus(jobId);
    } catch (err) {
      const message = getApiErrorMessage(err, "Upload failed");
      setError(message);
      toast.error(message);
    } finally {
      setUploading(false);
    }
  };

  const data = uploadJob;

  const progress = data?.total
    ? Math.round(((data.processed || 0) / data.total) * 100)
    : 0;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold">Resume Upload</h2>
      <p className="text-sm text-gray-600">
        Files are queued for async processing. Poll status uses{" "}
        <code className="text-xs bg-gray-100 px-1 rounded">GET /candidates/upload/jobs/:jobId</code>.
      </p>

      <input
        type="file"
        multiple
        accept=".pdf,.doc,.docx,.txt"
        onChange={(e) => setFiles(Array.from(e.target.files || []))}
      />

      {files.length > 0 && (
        <p className="text-sm text-gray-500">{files.length} files selected</p>
      )}

      {error && <p className="text-red-500">{error}</p>}

      <button
        type="button"
        onClick={handleUpload}
        disabled={uploading}
        className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-60"
      >
        {uploading ? "Uploading…" : "Upload"}
      </button>

      {data && (
        <div className="bg-white p-5 rounded-xl shadow space-y-5">
          <div className="flex justify-between flex-wrap gap-2">
            <div>
              <p className="text-sm text-gray-500">Job ID</p>
              <p className="font-mono text-sm break-all">{data.id}</p>
            </div>

            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full h-fit">
              {data.status}
            </span>
          </div>

          {data.currentFile && (
            <p className="text-sm text-gray-600">
              Current file: <span className="font-medium">{data.currentFile}</span>
            </p>
          )}

          <div>
            <div className="flex justify-between text-sm">
              <span>
                {data.processed ?? 0} / {data.total ?? 0}
              </span>
              <span>{progress}%</span>
            </div>

            <div className="h-3 bg-gray-200 rounded">
              <div
                className="h-3 bg-blue-600 rounded transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <Stat label="Total" value={data.total ?? 0} />
            <Stat label="Processed" value={data.processed ?? 0} />
            <Stat label="Created" value={data.created ?? 0} />
            <Stat label="Duplicate" value={data.duplicate ?? 0} />
            <Stat label="Skipped" value={data.skipped ?? 0} />
            <Stat label="Error" value={data.error ?? 0} />
          </div>

          {Array.isArray(data.results) && data.results.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm border">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-2 border text-left">#</th>
                    <th className="p-2 border text-left">File</th>
                    <th className="p-2 border text-left">Status</th>
                    <th className="p-2 border text-left">Resume</th>
                    <th className="p-2 border text-left">Candidate</th>
                    <th className="p-2 border text-left">Detail</th>
                  </tr>
                </thead>

                <tbody>
                  {data.results.map((r, i) => (
                    <tr key={`${r.row}-${i}`}>
                      <td className="p-2 border">{r.row}</td>
                      <td className="p-2 border">{r.fileName}</td>
                      <td className="p-2 border">{r.status}</td>
                      <td className="p-2 border">
                        {r.resumeUrl ? (
                          <a
                            href={r.resumeUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-600 underline"
                          >
                            View
                          </a>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="p-2 border font-mono text-xs">
                        {r.candidateId || "—"}
                      </td>
                      <td className="p-2 border text-xs max-w-xs">
                        {r.error || r.reason || "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="text-sm text-gray-500">
            {data.createdAt && (
              <p>Created: {new Date(data.createdAt).toLocaleString()}</p>
            )}
            {data.updatedAt && (
              <p>Updated: {new Date(data.updatedAt).toLocaleString()}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const Stat = ({ label, value }) => (
  <div className="bg-gray-50 p-3 rounded text-center">
    <p className="text-gray-500 text-sm">{label}</p>
    <p className="text-lg font-semibold">{value}</p>
  </div>
);

export default UploadPDF;
