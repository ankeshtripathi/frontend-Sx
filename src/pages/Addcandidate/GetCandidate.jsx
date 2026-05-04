import React, { useState } from "react";
import useCandidatesQuery from "@/hooks/useCandidatesQuery";

import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

function formatSkills(skills) {
  if (skills == null || skills === "") return "—";
  if (Array.isArray(skills)) return skills.length ? skills.join(", ") : "—";
  if (typeof skills === "string") return skills || "—";
  try {
    return JSON.stringify(skills);
  } catch {
    return "—";
  }
}

const GetCandidate = () => {
  const {
    items,
    pagination,
    loading,
    error,
    page,
    setPage,
    limit,
    setLimit,
    filters,
    setFilters,
    resetFilters,
  } = useCandidatesQuery({ initialPage: 1, initialLimit: 20 });

  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);

  const handlePreviewClick = (candidate) => {
    setSelectedCandidate(candidate);
    setOpenDialog(true);
  };

  const totalPages = pagination.totalPages || 0;
  const canPrev = page > 1;
  const canNext = totalPages > 0 && page < totalPages;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">Candidate Dashboard</h1>

      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}

      <Card>
        <CardContent className="pt-6 space-y-4">
          <p className="text-sm text-gray-600">
            Search and filters are applied on the server (debounced ~400ms). Public
            list responses do not include resume text or embeddings.
          </p>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            <Input
              placeholder="Search (name, email, phone)"
              value={filters.search}
              onChange={(e) => setFilters({ search: e.target.value })}
            />
            <Input
              placeholder="Location / preferred / hometown / pincode"
              value={filters.location}
              onChange={(e) => setFilters({ location: e.target.value })}
            />
            <Input
              placeholder="Hometown"
              value={filters.hometown}
              onChange={(e) => setFilters({ hometown: e.target.value })}
            />
            <Input
              placeholder="Pincode"
              value={filters.pincode}
              onChange={(e) => setFilters({ pincode: e.target.value })}
            />
            <Input
              placeholder="Min experience (years)"
              type="number"
              min={0}
              value={filters.minExperience}
              onChange={(e) => setFilters({ minExperience: e.target.value })}
            />
            <Input
              placeholder="Max experience (years)"
              type="number"
              min={0}
              value={filters.maxExperience}
              onChange={(e) => setFilters({ maxExperience: e.target.value })}
            />
            <Input
              placeholder="Skills (comma-separated, matches resume text & profile)"
              value={filters.skills}
              onChange={(e) => setFilters({ skills: e.target.value })}
            />
            <Input
              placeholder="Industry"
              value={filters.industry}
              onChange={(e) => setFilters({ industry: e.target.value })}
            />
            <Input
              placeholder="Company"
              value={filters.company}
              onChange={(e) => setFilters({ company: e.target.value })}
            />
            <Input
              placeholder="Designation"
              value={filters.designation}
              onChange={(e) => setFilters({ designation: e.target.value })}
            />
            <Input
              placeholder="Department"
              value={filters.department}
              onChange={(e) => setFilters({ department: e.target.value })}
            />
            <Input
              placeholder="Qualification"
              value={filters.qualification}
              onChange={(e) => setFilters({ qualification: e.target.value })}
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button type="button" variant="outline" onClick={resetFilters}>
              Clear filters
            </Button>
            <span className="text-sm text-gray-500">
              Total: {pagination.total ?? 0}
              {loading ? " · Loading…" : ""}
            </span>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center gap-3">
        <label className="text-sm text-gray-600 flex items-center gap-2">
          Page size
          <select
            className="border rounded px-2 py-1 text-sm"
            value={limit}
            onChange={(e) => {
              setLimit(Number(e.target.value));
              setPage(1);
            }}
          >
            {[10, 20, 50, 100].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={!canPrev || loading}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Previous
          </Button>
          <span className="text-sm text-gray-600">
            Page {page}
            {totalPages ? ` of ${totalPages}` : ""}
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={!canNext || loading}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Designation</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Exp (yrs)</TableHead>
                <TableHead>Skills</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Profile</TableHead>
                <TableHead>Resume</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {items.length > 0 ? (
                items.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell>{c.name || "—"}</TableCell>
                    <TableCell>{c.email || "—"}</TableCell>
                    <TableCell>{c.phone || "—"}</TableCell>
                    <TableCell className="max-w-[140px] truncate">
                      {c.currentDesignation || "—"}
                    </TableCell>
                    <TableCell className="max-w-[140px] truncate">
                      {c.currentCompany || "—"}
                    </TableCell>
                    <TableCell>
                      {c.totalExperienceYears != null
                        ? String(c.totalExperienceYears)
                        : "—"}
                    </TableCell>
                    <TableCell
                      className="max-w-[200px] truncate text-xs"
                      title={formatSkills(c.skills)}
                    >
                      {formatSkills(c.skills)}
                    </TableCell>
                    <TableCell className="max-w-[160px] truncate text-xs">
                      {[c.currentLocation, c.preferredLocation]
                        .filter(Boolean)
                        .join(" · ") || "—"}
                    </TableCell>
                    <TableCell>
                      <button
                        type="button"
                        className="text-blue-600 hover:underline text-sm"
                        onClick={() => handlePreviewClick(c)}
                      >
                        View
                      </button>
                    </TableCell>
                    <TableCell>
                      {c.resumeUrl ? (
                        <a
                          href={c.resumeUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-600 hover:underline text-sm"
                        >
                          File
                        </a>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={10}
                    className="text-center py-8 text-gray-500"
                  >
                    {loading ? "Loading…" : "No candidates found"}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Candidate profile</DialogTitle>
          </DialogHeader>

          {selectedCandidate && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-semibold text-gray-700">Name</p>
                <p>{selectedCandidate.name || "—"}</p>
              </div>
              <div>
                <p className="font-semibold text-gray-700">Email</p>
                <p>{selectedCandidate.email || "—"}</p>
              </div>
              <div>
                <p className="font-semibold text-gray-700">Phone</p>
                <p>{selectedCandidate.phone || "—"}</p>
              </div>
              <div>
                <p className="font-semibold text-gray-700">Total experience</p>
                <p>
                  {selectedCandidate.totalExperienceYears != null
                    ? `${selectedCandidate.totalExperienceYears} yrs`
                    : "—"}
                </p>
              </div>
              <div>
                <p className="font-semibold text-gray-700">Current role</p>
                <p>{selectedCandidate.currentDesignation || "—"}</p>
              </div>
              <div>
                <p className="font-semibold text-gray-700">Company</p>
                <p>{selectedCandidate.currentCompany || "—"}</p>
              </div>
              <div>
                <p className="font-semibold text-gray-700">Industry</p>
                <p>{selectedCandidate.industry || "—"}</p>
              </div>
              <div>
                <p className="font-semibold text-gray-700">Department</p>
                <p>{selectedCandidate.department || "—"}</p>
              </div>
              <div>
                <p className="font-semibold text-gray-700">Qualification</p>
                <p>{selectedCandidate.qualification || "—"}</p>
              </div>
              <div>
                <p className="font-semibold text-gray-700">Locations</p>
                <p>
                  Current: {selectedCandidate.currentLocation || "—"}
                  <br />
                  Preferred: {selectedCandidate.preferredLocation || "—"}
                  <br />
                  Hometown: {selectedCandidate.hometown || "—"} · Pincode:{" "}
                  {selectedCandidate.pincode || "—"}
                </p>
              </div>
              <div>
                <p className="font-semibold text-gray-700">Salary / notice</p>
                <p>
                  Current: {selectedCandidate.currentSalary || "—"}
                  <br />
                  Expected: {selectedCandidate.expectedSalary || "—"}
                  <br />
                  Notice:{" "}
                  {selectedCandidate.noticePeriodDays != null
                    ? `${selectedCandidate.noticePeriodDays} days`
                    : "—"}
                </p>
              </div>
              <div className="md:col-span-2">
                <p className="font-semibold text-gray-700">Skills</p>
                <p className="whitespace-pre-wrap">{formatSkills(selectedCandidate.skills)}</p>
              </div>
              <div className="md:col-span-2">
                {selectedCandidate.resumeUrl ? (
                  <a
                    href={selectedCandidate.resumeUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 underline"
                  >
                    Open resume file
                  </a>
                ) : (
                  <span className="text-gray-500">No resume file URL</span>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GetCandidate;
