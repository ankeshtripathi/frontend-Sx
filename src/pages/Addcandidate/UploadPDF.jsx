import React, { useState } from "react";

const UploadPDF = () => {
  const [file, setFile] = useState(null);

  const handleUpload = () => {
    if (!file) {
      alert("Please select a PDF file");
      return;
    }

    console.log("Uploading PDF:", file);
    // API call here
  };

  return (
    <div className="p-6">
      <h2 className="text-lg font-semibold mb-4">Upload Resume (PDF)</h2>

      <input
        type="file"
        accept=".pdf"
        onChange={(e) => setFile(e.target.files[0])}
        className="mb-4"
      />

      <button
        onClick={handleUpload}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Upload PDF
      </button>
    </div>
  );
};

export default UploadPDF;