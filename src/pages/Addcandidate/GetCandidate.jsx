import React, { useEffect, useState } from "react";
import { getCandidates } from "@/api/candidate";

// shadcn components
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";

import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const GetCandidate = () => {
  const [candidates, setCandidates] = useState([]);
  const [search, setSearch] = useState("");
  const [filtered, setFiltered] = useState([]);

  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);


  const extractData = (text) => {
  return {
    experience: text.match(/experience:(.*)/i)?.[1] || "N/A",
    education: text.match(/education:(.*)/i)?.[1] || "N/A",
    skills: text.match(/skills:(.*)/i)?.[1] || "N/A",
    address: text.match(/address:(.*)/i)?.[1] || "N/A",
  };
};
  const parsed = selectedCandidate
  ? extractData(selectedCandidate.resumeText || "")
  : {};

  // 🔥 FETCH DATA
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getCandidates();
        setCandidates(data);
        setFiltered(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  // 🔍 SEARCH
  useEffect(() => {
    const words = search.toLowerCase().trim().split(" ");

    const result = candidates.filter((c) => {
      const text = `
        ${c.name}
        ${c.email}
        ${c.resumeText}
      `.toLowerCase();

      return words.every((word) => text.includes(word));
    });

    setFiltered(result);
  }, [search, candidates]);

  // 🔥 HANDLE CLICK
  const handlePreviewClick = (candidate) => {
    setSelectedCandidate(candidate);
    setOpenDialog(true);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">

      <h1 className="text-3xl font-bold mb-6">Candidate Dashboard</h1>

      {/* SEARCH */}
      <Input
        placeholder="Search by name, email, skills..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-6"
      />

      {/* TABLE */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Resume Preview</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filtered.length > 0 ? (
                filtered.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell>{c.name}</TableCell>
                    <TableCell>{c.email}</TableCell>

                    {/* 🔥 CLICKABLE PREVIEW */}
                    <TableCell
                      className="max-w-xs truncate cursor-pointer text-blue-600 hover:underline"
                      onClick={() => handlePreviewClick(c)}
                    >
                      {c.resumeText?.slice(0, 80)}...
                    </TableCell>

                    <TableCell>
                      <a
                        href={c.resumeUrl}
                        target="_blank"
                        className="text-blue-600 hover:underline"
                      >
                        View Resume
                      </a>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-6 text-gray-500">
                    No candidates found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* 🔥 DIALOG */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
  <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
    <DialogHeader>
      <DialogTitle>Candidate Profile</DialogTitle>
    </DialogHeader>

    {selectedCandidate && (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* BASIC INFO */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold border-b pb-1">
            Basic Info
          </h2>

          <p><strong>Name:</strong> {selectedCandidate.name}</p>
          <p><strong>Email:</strong> {selectedCandidate.email}</p>
        </div>

        {/* SKILLS */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold border-b pb-1">
            Skills
          </h2>
          <p>{parsed.skills}</p>
        </div>

        {/* EXPERIENCE */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold border-b pb-1">
            Experience
          </h2>
          <p>{parsed.experience}</p>
        </div>

        {/* EDUCATION */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold border-b pb-1">
            Education
          </h2>
          <p>{parsed.education}</p>
        </div>

        {/* ADDRESS */}
        <div className="space-y-3 md:col-span-2">
          <h2 className="text-lg font-semibold border-b pb-1">
            Address
          </h2>
          <p>{parsed.address}</p>
        </div>

        {/* FULL RESUME */}
        <div className="space-y-3 md:col-span-2">
          <h2 className="text-lg font-semibold border-b pb-1">
            Full Resume
          </h2>
          <p className="whitespace-pre-wrap text-sm text-gray-600">
            {selectedCandidate.resumeText}
          </p>
        </div>

        {/* ACTION */}
        <div className="md:col-span-2">
          <a
            href={selectedCandidate.resumeUrl}
            target="_blank"
            className="text-blue-600 underline"
          >
            Open Resume File
          </a>
        </div>

      </div>
    )}
  </DialogContent>
</Dialog>

    </div>
  );
};

export default GetCandidate;