import React, { useState } from "react";
import toast from "react-hot-toast";
import { getApiErrorMessage } from "@/api/axios";
import { uploadCsv } from "@/api/candidate";

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
      toast.success("CSV processed");
    } catch (err) {
      const message = getApiErrorMessage(err, "CSV upload failed");
      setError(message);
      toast.error(message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl">
      <h2 className="text-xl font-semibold mb-2">Upload Candidates CSV</h2>
      <p className="text-sm text-gray-500 mb-6">
        Upload a CSV with candidate details. The backend maps common headers like name, email, phone, and experience.
      </p>

      <input
        type="file"
        accept=".csv"
        onChange={(e) => setFile(e.target.files[0])}
        className="mb-4"
      />

      {error && (
        <div className="mb-4 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <button
        onClick={handleUpload}
        disabled={uploading || !file}
        className="bg-green-600 text-white px-4 py-2 rounded disabled:cursor-not-allowed disabled:opacity-60"
      >
        {uploading ? "Processing..." : "Upload CSV"}
      </button>

      {result && (
        <div className="mt-6 rounded border bg-white p-4 shadow-sm">
          <div className="grid gap-3 text-sm md:grid-cols-5">
            <Stat label="Total" value={result.total || 0} />
            <Stat label="Created" value={result.created || 0} />
            <Stat label="Duplicate" value={result.duplicate || 0} />
            <Stat label="Skipped" value={result.skipped || 0} />
            <Stat label="Errors" value={result.error || 0} />
          </div>

          {Array.isArray(result.results) && result.results.length > 0 && (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-gray-500">
                    <th className="py-2 pr-4">Row</th>
                    <th className="py-2 pr-4">Status</th>
                    <th className="py-2 pr-4">Email</th>
                    <th className="py-2 pr-4">Message</th>
                  </tr>
                </thead>
                <tbody>
                  {result.results.map((row) => (
                    <tr key={row.row} className="border-b last:border-0">
                      <td className="py-2 pr-4">{row.row}</td>
                      <td className="py-2 pr-4">{row.status}</td>
                      <td className="py-2 pr-4">{row.email || "-"}</td>
                      <td className="py-2 pr-4">{row.reason || row.error || "-"}</td>
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

export default UploadCSV;