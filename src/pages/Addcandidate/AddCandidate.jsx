import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getCandidates } from "@/api/candidate";

const AddCandidate = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const tabs = [
    {
      name: "Resume Upload",
      path: "/candidate/upload-pdf",
    },
    {
      name: "CSV Upload",
      path: "/candidate/upload-csv",
    },
  ];

  useEffect(() => {
    const loadCandidates = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await getCandidates();
        setCandidates(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to fetch candidates", err);
        setError("Failed to fetch candidates.");
      } finally {
        setLoading(false);
      }
    };

    loadCandidates();
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Add Candidate</h2>

      <div className="flex gap-4 border-b mb-6">
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.path;

          return (
            <button
              key={tab.name}
              onClick={() => navigate(tab.path)}
              className={`pb-2 px-4 text-sm font-medium border-b-2 transition ${
                isActive
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-blue-500"
              }`}
            >
              {tab.name}
            </button>
          );
        })}
      </div>

      <div className="bg-white p-4 rounded shadow">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="font-semibold">Candidates</h3>
            <p className="text-sm text-gray-500">
              Upload resumes or CSV files, then review candidates created by the backend.
            </p>
          </div>
          <button
            onClick={() => navigate("/candidate/upload-pdf")}
            className="rounded bg-blue-600 px-4 py-2 text-white"
          >
            Upload Resumes
          </button>
        </div>

        {loading && <p className="mt-6 text-gray-500">Loading candidates...</p>}
        {error && <p className="mt-6 text-red-600">{error}</p>}

        {!loading && !error && (
          <div className="mt-6 overflow-x-auto">
            {candidates.length === 0 ? (
              <p className="text-gray-500">No candidates found.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-gray-500">
                    <th className="py-2 pr-4">Name</th>
                    <th className="py-2 pr-4">Email</th>
                    <th className="py-2 pr-4">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {candidates.map((candidate) => (
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
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AddCandidate;