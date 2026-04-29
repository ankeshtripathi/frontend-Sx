import React, { useState } from "react";

const UploadCSV = () => {
  const [file, setFile] = useState(null);

  const handleUpload = () => {
    if (!file) {
      alert("Please select a CSV file");
      return;
    }

    console.log("Uploading CSV:", file);
    // API call here
  };

  return (
    <div className="p-6">
      <h2 className="text-lg font-semibold mb-4">Upload Candidates (CSV)</h2>

      <input
        type="file"
        accept=".csv"
        onChange={(e) => setFile(e.target.files[0])}
        className="mb-4"
      />

      <button
        onClick={handleUpload}
        className="bg-green-500 text-white px-4 py-2 rounded"
      >
        Upload CSV
      </button>
    </div>
  );
};

export default UploadCSV;