import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getCandidates } from "@/api/candidate";
import InfoItem from "@/components/InfoItem";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Checkbox } from "@/components/ui/checkbox";
import { Info } from "lucide-react";

const AddCandidate = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [selected, setSelected] = useState([]);
  const [preview, setPreview] = useState(null);
  // 🔥 ADD THESE STATES
const [page, setPage] = useState(1);
const [limit, setLimit] = useState(10);
const [total, setTotal] = useState(0);

  const [search, setSearch] = useState("");

  const tabs = [
    { name: "Resume Upload", path: "/candidate/upload-pdf" },
    { name: "CSV Upload", path: "/candidate/upload-csv" },
  ];

  // 🔥 LOAD DATA
 const loadCandidates = async () => {
  setLoading(true);
  setError("");

  try {
    const data = await getCandidates({
      page,
      limit,
      search,
    });

    setCandidates(data?.items || []);
    setTotal(data?.pagination?.total || 0); // ✅ FIXED
  } catch (err) {
    setError("Failed to fetch candidates.");
  } finally {
    setLoading(false);
  }
};

useEffect(() => {
  loadCandidates();
}, [search, page]);

  // 🔥 SELECT LOGIC
  const toggleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id)
        ? prev.filter((i) => i !== id)
        : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selected.length === candidates.length) {
      setSelected([]);
    } else {
      setSelected(candidates.map((c) => c.id));
    }
  };


  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Add Candidate</h2>

      {/* TABS */}
      <div className="flex gap-4 border-b mb-6">
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.path;

          return (
            <button
              key={tab.name}
              onClick={() => navigate(tab.path)}
              className={`pb-2 px-4 text-sm font-medium border-b-2 ${
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
        {/* HEADER */}
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="font-semibold">Candidates</h3>
            <p className="text-sm text-gray-500">
              Review uploaded candidates
            </p>
          </div>

          <Button onClick={() => navigate("/candidate/upload-pdf")}>
            Upload Resumes
          </Button>
        </div>

        {/* SEARCH */}
        <div className="mb-4">
          <Input
            placeholder="Search name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* STATES */}
        {loading && <p>Loading...</p>}
        {error && <p className="text-red-500">{error}</p>}

        {/* TABLE */}
        {!loading && !error && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">
                  <Checkbox
                    checked={
                      selected.length === candidates.length &&
                      candidates.length > 0
                    }
                    onCheckedChange={toggleSelectAll}
                  />
                </TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="w-20">Info</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {candidates.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5}>
                    No candidates found.
                  </TableCell>
                </TableRow>
              ) : (
                candidates.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell>
                      <Checkbox
                        checked={selected.includes(c.id)}
                        onCheckedChange={() => toggleSelect(c.id)}
                      />
                    </TableCell>

                    <TableCell>{c.name || "Unnamed"}</TableCell>
                    <TableCell>{c.email || "-"}</TableCell>
                    <TableCell>
                      {c.createdAt
                        ? new Date(c.createdAt).toLocaleString()
                        : "-"}
                    </TableCell>

                    <TableCell>
                      <button
                        onClick={() => setPreview(c)}
                        className="text-blue-500"
                      >
                        <Info size={18} />
                      </button>
                    </TableCell>
                  </TableRow> 
                ))
              )}
            </TableBody>
          </Table>
        )}
 <div className="sticky bottom-0 z-20 p-4 bg-white flex items-center justify-between">
  
  <div className="text-sm text-gray-500">
    Page {page} of {Math.ceil(total / limit) || 1} — {total} total
  </div>

  <div className="flex items-center gap-3">

    {/* LIMIT */}
    <div className="flex items-center gap-2">
      <label className="text-sm">Per page:</label>
      <select
        value={limit}
        onChange={(e) => {
          setLimit(Number(e.target.value));
          setPage(1);
        }}
        className="border rounded px-2 py-1"
      >
        {[10, 20, 50, 100].map((n) => (
          <option key={n} value={n}>{n}</option>
        ))}
      </select>
    </div>

    {/* PREV */}
    <Button
      variant="outline"
      disabled={page === 1}
      onClick={() => setPage((p) => p - 1)}   
    >
      Prev
    </Button>

    <span>{page}</span>

    {/* NEXT */}
    <Button
      variant="outline"
      disabled={page >= Math.ceil(total / limit)}
      onClick={() => setPage((p) => p + 1)}
    >
      Next
    </Button>

  </div>
</div>
        {/* PREVIEW DIALOG */}
       <Dialog open={!!preview} onOpenChange={() => setPreview(null)}>
  <DialogContent className="max-w-4xl p-0 overflow-hidden rounded-2xl">

    {preview && (
      <div className="flex flex-col h-[80vh]">

        {/* 🔥 HEADER */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
          <h2 className="text-xl font-semibold">
            {preview.name || "Unnamed Candidate"}
          </h2>
          <p className="text-sm opacity-90">
            {preview.currentDesignation || "—"} •{" "}
            {preview.currentCompany || "—"}
          </p>
        </div>

        {/* 🔥 BODY */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50">

          {/* BASIC INFO */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-4 rounded-xl shadow-sm">
            <InfoItem label="Email" value={preview.email} />
            <InfoItem label="Phone" value={preview.phone} />
            <InfoItem
              label="Experience"
              value={
                preview.totalExperienceYears
                  ? `${preview.totalExperienceYears} yrs`
                  : "—"
              }
            />
            <InfoItem label="Department" value={preview.department} />
          </div>

          {/* PROFESSIONAL */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-4 rounded-xl shadow-sm">
            <InfoItem label="Industry" value={preview.industry} />
            <InfoItem label="Qualification" value={preview.qualification} />
            <InfoItem label="Current Salary" value={preview.currentSalary} />
            <InfoItem label="Expected Salary" value={preview.expectedSalary} />
          </div>

          {/* LOCATION */}
          <div className="bg-white p-4 rounded-xl shadow-sm">
            <h3 className="font-semibold mb-2 text-gray-700">Location</h3>
            <p className="text-sm text-gray-600">
              <strong>Current:</strong> {preview.currentLocation || "—"} <br />
              <strong>Preferred:</strong> {preview.preferredLocation || "—"} <br />
              <strong>Hometown:</strong> {preview.hometown || "—"} •{" "}
              {preview.pincode || "—"}
            </p>
          </div>

          {/* SKILLS */}
          <div className="bg-white p-4 rounded-xl shadow-sm">
            <h3 className="font-semibold mb-2 text-gray-700">Skills</h3>
            <div className="flex flex-wrap gap-2">
              {(Array.isArray(preview.skills)
                ? preview.skills
                : String(preview.skills || "")
                    .split(",")
                    .map((s) => s.trim())
              ).map((skill, i) => (
                <span
                  key={i}
                  className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-full"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* RESUME */}
          <div className="bg-white p-4 rounded-xl shadow-sm flex justify-between items-center">
            <span className="text-sm text-gray-600">Resume</span>
            {preview.resumeUrl ? (
              <a
                href={preview.resumeUrl}
                target="_blank"
                rel="noreferrer"
                className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                View Resume
              </a>
            ) : (
              <span className="text-gray-400 text-sm">Not available</span>
            )}
          </div>

        </div>
      </div>
    )}
  </DialogContent>
</Dialog>
      </div>
    </div>
  );
};

export default AddCandidate;