import React, { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { getApiErrorMessage } from "@/api/axios";
import { getJobStatus, uploadResumes } from "@/api/candidate";

const UploadPDF = () => {
  const pollRef = useRef(null);

  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [job, setJob] = useState(null); // FULL RESPONSE
  const [error, setError] = useState("");

  const finishedStatuses = new Set(["completed", "failed"]);

  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  // ✅ FETCH STATUS
  const fetchStatus = async (jobId) => {
    const res = await getJobStatus(jobId);

    setJob(res); // keep full response

    const status = res?.data?.status;

    if (finishedStatuses.has(status) && pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  };

  // ✅ POLLING
  const startPolling = (jobId) => {
    if (pollRef.current) clearInterval(pollRef.current);

    pollRef.current = setInterval(() => {
      fetchStatus(jobId).catch((err) => {
        console.error("Polling failed", err);
      });
    }, 3000);
  };

  // ✅ UPLOAD
  const handleUpload = async () => {
    if (!files.length) {
      toast.error("Please select files");
      return;
    }

    setUploading(true);
    setError("");

    try {
      const res = await uploadResumes(files);

      setJob(res);
      toast.success("Upload started");

      const jobId = res?.data?.id || res?.jobId;

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

  // ✅ SAFE DATA ACCESS
  const data = job?.data;

  const progress = data?.total
    ? Math.round(((data.processed || 0) / data.total) * 100)
    : 0;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold">Resume Upload Dashboard</h2>

      {/* FILE INPUT */}
      <input
        type="file"
        multiple
        onChange={(e) => setFiles(Array.from(e.target.files || []))}
      />

      {files.length > 0 && (
        <p className="text-sm text-gray-500">
          {files.length} files selected
        </p>
      )}

      {/* ERROR */}
      {error && <p className="text-red-500">{error}</p>}

      {/* BUTTON */}
      <button
        onClick={handleUpload}
        disabled={uploading}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        {uploading ? "Uploading..." : "Upload"}
      </button>

      {/* JOB DASHBOARD */}
      {data && (
        <div className="bg-white p-5 rounded-xl shadow space-y-5">

          {/* HEADER */}
          <div className="flex justify-between">
            <div>
              <p className="text-sm text-gray-500">Job ID</p>
              <p className="font-mono">{data.id}</p>
            </div>

            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full">
              {data.status}
            </span>
          </div>

          {/* PROGRESS */}
          <div>
            <div className="flex justify-between text-sm">
              <span>{data.processed} / {data.total}</span>
              <span>{progress}%</span>
            </div>

            <div className="h-3 bg-gray-200 rounded">
              <div
                className="h-3 bg-blue-600 rounded"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* STATS */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <Stat label="Total" value={data.total} />
            <Stat label="Processed" value={data.processed} />
            <Stat label="Created" value={data.created} />
            <Stat label="Duplicate" value={data.duplicate} />
            <Stat label="Skipped" value={data.skipped} />
            <Stat label="Error" value={data.error} />
          </div>

          {/* RESULTS TABLE */}
          {data.results?.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm border">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-2 border">Row</th>
                    <th className="p-2 border">File</th>
                    <th className="p-2 border">Status</th>
                    <th className="p-2 border">Resume</th>
                    <th className="p-2 border">Candidate</th>
                  </tr>
                </thead>

                <tbody>
                  {data.results.map((r, i) => (
                    <tr key={i} className="text-center">
                      <td className="p-2 border">{r.row}</td>
                      <td className="p-2 border">{r.fileName}</td>
                      <td className="p-2 border">{r.status}</td>

                      <td className="p-2 border">
                        <a
                          href={r.resumeUrl}
                          target="_blank"
                          className="text-blue-600 underline"
                        >
                          View
                        </a>
                      </td>

                      <td className="p-2 border">
                        {r.candidateId}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* TIMELINE */}
          <div className="text-sm text-gray-500">
            <p>Created: {new Date(data.createdAt).toLocaleString()}</p>
            <p>Updated: {new Date(data.updatedAt).toLocaleString()}</p>
          </div>
        </div>
      )}
    </div>
  );
};

// STAT COMPONENT
const Stat = ({ label, value }) => (
  <div className="bg-gray-50 p-3 rounded text-center">
    <p className="text-gray-500 text-sm">{label}</p>
    <p className="text-lg font-semibold">{value}</p>
  </div>
);

export default UploadPDF;