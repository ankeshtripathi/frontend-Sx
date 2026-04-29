// src/pages/Dashboard.jsx
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { toast } from "react-hot-toast";

const BASE_URL = "http://localhost:5000"; // 🔥 IMPORTANT (no /api)

export default function Dashboard() {
  const user = useSelector((state) => state.auth.user) || {};
  const navigate = useNavigate();

  const [empData, setEmpData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [profilePhoto, setProfilePhoto] = useState(null);
  const [uploading, setUploading] = useState(false);

  // ✅ Fetch Candidate Data
  const fetchUserData = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await api.get("/candidates/single"); // ✅ FIXED
      setEmpData(res.data);
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Unable to fetch profile data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  // ✅ Upload Photo
  const handleUpload = async () => {
    if (!profilePhoto) {
      toast.error("Select a file first");
      return;
    }

    if (profilePhoto.size > 1024 * 1024) {
      toast.error("Image must be less than 1MB");
      return;
    }

    setUploading(true);

    try {
      const form = new FormData();
      form.append("photo", profilePhoto);

      // 🔥 Adjust if backend route differs
      await api.post("/candidates/photo", form);

      toast.success("Photo uploaded");
      setProfilePhoto(null);
      fetchUserData();
    } catch (err) {
      console.error("Upload error:", err);
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  // ---------- UI ----------
  if (loading) {
    return <div className="p-6 text-center">Loading...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-600 text-center">{error}</div>;
  }

  if (!empData) {
    return <div className="p-6 text-center">No data found</div>;
  }

  return (
    <div className="p-6 space-y-6">

      {/* Header */}
      <div className="flex justify-between items-center bg-white p-4 rounded shadow">
        <h2 className="text-xl font-semibold">
          Welcome <span className="text-blue-500">{user?.name}</span>
        </h2>

        <button
          onClick={() => navigate("/my-details")}
          className="px-4 py-2 border rounded"
        >
          My Details
        </button>
      </div>

      {/* Profile */}
      <div className="bg-white p-6 rounded shadow flex flex-col md:flex-row gap-6">

        {/* Profile Image */}
        <div className="w-full md:w-1/3 text-center">
          <img
            src={`${BASE_URL}/uploads/${empData?.profile_picture}`}
            alt="profile"
            className="w-40 h-40 mx-auto object-cover rounded"
          />

          <div className="mt-4">
            <input
              type="file"
              onChange={(e) => setProfilePhoto(e.target.files[0])}
            />
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="block mt-2 px-4 py-2 bg-blue-500 text-white rounded"
            >
              {uploading ? "Uploading..." : "Upload"}
            </button>
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
          <Info title="Name" value={empData.associates_name} />
          <Info title="Employee ID" value={empData.payroll_code} />
          <Info title="Email" value={empData.email} />
          <Info title="Phone" value={empData.contact_primary} />
          <Info title="Department" value={empData?.department?.name} />
          <Info title="Designation" value={empData.designation} />
          <Info title="Location" value={empData.work_location} />
        </div>
      </div>
    </div>
  );
}

// 🔹 Small reusable component
function Info({ title, value }) {
  return (
    <div className="p-3 border rounded">
      <div className="text-gray-500 text-sm">{title}</div>
      <div className="font-medium">{value || "—"}</div>
    </div>
  );
}