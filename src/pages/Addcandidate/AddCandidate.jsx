import React from "react";
import { useNavigate, useLocation } from "react-router-dom";

const AddCandidate = () => {
  const navigate = useNavigate();
  const location = useLocation();

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

  return (
    <div className="p-6">
      {/* Title */}
      <h2 className="text-xl font-bold mb-4">Add Candidate</h2>

      {/* Tabs */}
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

      {/* Content */}
      <div className="bg-white p-4 rounded shadow">
        <p className="text-gray-600">
          Select a tab to upload candidates.
        </p>
      </div>
    </div>
  );
};

export default AddCandidate;