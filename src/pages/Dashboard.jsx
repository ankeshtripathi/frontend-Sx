import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getCandidates } from "../api/candidate";

export default function Dashboard() {
  const user = useSelector((state) => state.auth.user) || {};
  const navigate = useNavigate();

  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCandidates = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getCandidates();
      setCandidates(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Unable to fetch candidates.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, []);

  if (loading) {
    return <div className="p-6 text-center">Loading...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-600 text-center">{error}</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-4 bg-white p-5 rounded shadow md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm text-gray-500">Signed in as</p>
          <h2 className="text-xl font-semibold">
            {user?.email || user?.id || "ATS user"}
          </h2>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => navigate("/candidate/upload-pdf")}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            Upload Resumes
          </button>
          <button
            onClick={() => navigate("/candidate/upload-csv")}
            className="px-4 py-2 border rounded"
          >
            Upload CSV
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Info title="Total Candidates" value={candidates.length} />
        <Info title="With Email" value={candidates.filter((candidate) => candidate.email).length} />
        <Info title="With Resume Text" value={candidates.filter((candidate) => candidate.resumeText).length} />
      </div>

      <div className="bg-white p-5 rounded shadow">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Recent Candidates</h3>
          <button
            onClick={() => navigate("/dashboard/candidates")}
            className="text-sm text-blue-600 hover:underline"
          >
            View all
          </button>
        </div>

        {candidates.length === 0 ? (
          <p className="text-gray-500">No candidates uploaded yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-gray-500">
                  <th className="py-2 pr-4">Name</th>
                  <th className="py-2 pr-4">Email</th>
                  <th className="py-2 pr-4">Created</th>
                </tr>
              </thead>
              <tbody>
                {candidates.slice(0, 5).map((candidate) => (
                  <tr key={candidate.id} className="border-b last:border-0">
                    <td className="py-2 pr-4">{candidate.name || "Unnamed"}</td>
                    <td className="py-2 pr-4">{candidate.email || "-"}</td>
                    <td className="py-2 pr-4">
                      {candidate.createdAt ? new Date(candidate.createdAt).toLocaleString() : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function Info({ title, value }) {
  return (
    <div className="p-4 bg-white rounded shadow">
      <div className="text-gray-500 text-sm">{title}</div>
      <div className="text-2xl font-semibold">{value ?? "-"}</div>
    </div>
  );
}