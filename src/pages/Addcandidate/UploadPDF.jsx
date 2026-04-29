import React, { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { getApiErrorMessage } from "@/api/axios";
import { getJobStatus, uploadResumes } from "@/api/candidate";

const UploadPDF = () => {
  const pollRef = useRef(null);
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [job, setJob] = useState(null);
  const [error, setError] = useState("");

  const finishedStatuses = new Set(["completed", "failed"]);

  useEffect(() => () => {
    if (pollRef.current) clearInterval(pollRef.current);
  }, []);

  const fetchStatus = async (jobId) => {
    const data = await getJobStatus(jobId);
    setJob(data);

    if (finishedStatuses.has(data?.status) && pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  };

  const startPolling = (jobId) => {
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = setInterval(() => {
      fetchStatus(jobId).catch((err) => {
        console.error("Status polling failed", err);
      });
    }, 3000);
  };

  const handleUpload = async () => {
    if (!files.length) {
      toast.error("Please select resume files");
      return;
    }

    setUploading(true);
    setError("");

    try {
      const data = await uploadResumes(files);
      setJob(data);
      toast.success("Resume upload queued");
      startPolling(data.jobId);
      await fetchStatus(data.jobId);
    } catch (err) {
      const message = getApiErrorMessage(err, "Resume upload failed");
      setError(message);
      toast.error(message);
    } finally {
      setUploading(false);
    }
  };

  const progress = job?.total ? Math.round(((job.processed || 0) / job.total) * 100) : 0;

  return (
    <div className="p-6 max-w-4xl">
      <h2 className="text-xl font-semibold mb-2">Bulk Resume Upload</h2>
      <p className="text-sm text-gray-500 mb-6">
        Upload up to 20 PDF, DOC, DOCX, or TXT resumes. The backend returns a job id and processes them in the worker.
      </p>

      <input
        type="file"
        accept=".pdf,.doc,.docx,.txt"
        multiple
        onChange={(e) => setFiles(Array.from(e.target.files || []))}
        className="mb-4"
      />

      {files.length > 0 && (
        <div className="mb-4 text-sm text-gray-600">
          Selected {files.length} file{files.length === 1 ? "" : "s"}.
        </div>
      )}

      {error && (
        <div className="mb-4 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <button
        onClick={handleUpload}
        disabled={uploading || !files.length}
        className="bg-blue-600 text-white px-4 py-2 rounded disabled:cursor-not-allowed disabled:opacity-60"
      >
        {uploading ? "Queueing..." : "Upload Resumes"}
      </button>

      {job && (
        <div className="mt-6 rounded border bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="text-sm text-gray-500">Job ID</div>
              <div className="font-mono text-sm">{job.jobId || job.id}</div>
            </div>
            <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">
              {job.status}
            </span>
          </div>

          <div className="mt-4">
            <div className="mb-1 flex justify-between text-sm text-gray-600">
              <span>{job.processed || 0} / {job.total || 0} processed</span>
              <span>{progress}%</span>
            </div>
            <div className="h-2 rounded bg-gray-100">
              <div className="h-2 rounded bg-blue-600" style={{ width: `${progress}%` }} />
            </div>
          </div>

          <div className="mt-4 grid gap-3 text-sm md:grid-cols-3">
            <Stat label="Created" value={job.created || 0} />
            <Stat label="Duplicate" value={job.duplicate || 0} />
            <Stat label="Errors" value={job.error || 0} />
          </div>

          {Array.isArray(job.results) && job.results.length > 0 && (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-gray-500">
                    <th className="py-2 pr-4">File</th>
                    <th className="py-2 pr-4">Status</th>
                    <th className="py-2 pr-4">Message</th>
                  </tr>
                </thead>
                <tbody>
                  {job.results.map((result, index) => (
                    <tr key={`${result.fileName || "file"}-${index}`} className="border-b last:border-0">
                      <td className="py-2 pr-4">{result.fileName}</td>
                      <td className="py-2 pr-4">{result.status}</td>
                      <td className="py-2 pr-4">{result.reason || result.error || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

function Stat({ label, value }) {
  return (
    <div className="rounded bg-gray-50 p-3">
      <div className="text-gray-500">{label}</div>
      <div className="text-lg font-semibold">{value}</div>
    </div>
  );
}

export default UploadPDF;