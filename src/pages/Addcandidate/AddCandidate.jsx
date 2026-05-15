import React, { useCallback, useEffect, useMemo, useState } from "react";
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
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowRight,
  BriefcaseBusiness,
  CheckCircle2,
  FileSpreadsheet,
  FileUp,
  Loader2,
  Mail,
  MapPin,
  Search,
  UserRound,
  Users,
} from "lucide-react";

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getSkills(skills) {
  if (Array.isArray(skills)) return skills.filter(Boolean);
  return String(skills || "")
    .split(",")
    .map((skill) => skill.trim())
    .filter(Boolean);
}

function CandidateAvatar({ name }) {
  const initials = String(name || "C")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return (
    <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
      {initials || "C"}
    </span>
  );
}

function StatCard({ title, value, hint, icon: Icon }) {
  return (
    <Card className="relative overflow-hidden border-border/80 shadow-sm">
      <div className="pointer-events-none absolute -right-8 -top-8 size-28 rounded-full bg-primary/10" />
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <span className="flex size-9 items-center justify-center rounded-md bg-primary/10 text-primary">
          <Icon className="size-4" aria-hidden />
        </span>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-semibold tracking-tight tabular-nums">
          {value ?? "—"}
        </div>
        <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
      </CardContent>
    </Card>
  );
}

const AddCandidate = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [selected, setSelected] = useState([]);
  const [preview, setPreview] = useState(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);

  const [search, setSearch] = useState("");

  const tabs = [
    { name: "Candidates", path: "/dashboard/candidates", icon: Users },
    { name: "Resume Upload", path: "/candidate/upload-pdf", icon: FileUp },
    { name: "CSV Upload", path: "/candidate/upload-csv", icon: FileSpreadsheet },
  ];

  const loadCandidates = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await getCandidates({
        page,
        limit,
        search,
      });

      setCandidates(data?.items || []);
      setTotal(data?.pagination?.total || 0);
    } catch (err) {
      console.error("Failed to fetch candidates", err);
      setError("Failed to fetch candidates.");
    } finally {
      setLoading(false);
    }
  }, [limit, page, search]);

  useEffect(() => {
    loadCandidates();
  }, [loadCandidates]);

  useEffect(() => {
    setSelected([]);
  }, [candidates]);

  const totalPages = Math.max(1, Math.ceil(total / limit) || 1);
  const withEmail = useMemo(
    () => candidates.filter((candidate) => candidate.email).length,
    [candidates]
  );
  const withResume = useMemo(
    () => candidates.filter((candidate) => candidate.resumeUrl).length,
    [candidates]
  );

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
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-[2rem] bg-slate-950 px-5 py-6 text-white shadow-xl sm:px-8 lg:px-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.35),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(99,102,241,0.28),transparent_32%)]" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl space-y-4">
            <Badge className="border-white/20 bg-white/10 text-white hover:bg-white/10">
              Candidate workspace
            </Badge>
            <div>
              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                Manage your talent pool with a clean, searchable candidate hub.
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/70 sm:text-base">
                Search uploaded profiles, select candidates, review resume data,
                and jump into bulk uploads from one polished workspace.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              className="bg-white text-slate-950 hover:bg-white/90"
              onClick={() => navigate("/candidate/upload-pdf")}
            >
              Upload resumes
              <ArrowRight className="size-4" aria-hidden />
            </Button>
            <Button
              type="button"
              variant="outline"
              className="border-white/20 bg-white/10 text-white hover:bg-white/20 hover:text-white"
              onClick={() => navigate("/candidate/upload-csv")}
            >
              Import CSV
            </Button>
          </div>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total candidates" value={total} hint="Across all pages" icon={Users} />
        <StatCard title="Visible now" value={candidates.length} hint="Current page results" icon={UserRound} />
        <StatCard title="With email" value={withEmail} hint="Reachable on this page" icon={Mail} />
        <StatCard title="With resume" value={withResume} hint="Linked resumes on page" icon={FileUp} />
      </div>

      <Card className="overflow-hidden border-border/80 shadow-sm">
        <CardHeader className="border-b bg-muted/30">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Users className="size-5 text-primary" aria-hidden />
                Candidates
              </CardTitle>
              <CardDescription>
                Search, select, and inspect parsed candidate profiles.
              </CardDescription>
            </div>

            <div className="flex flex-wrap gap-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = location.pathname === tab.path;
                return (
                  <Button
                    key={tab.name}
                    type="button"
                    variant={isActive ? "default" : "outline"}
                    className="gap-2"
                    onClick={() => navigate(tab.path)}
                  >
                    <Icon className="size-4" aria-hidden />
                    {tab.name}
                  </Button>
                );
              })}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 p-4 sm:p-6">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full lg:max-w-md">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="h-11 pl-9"
                placeholder="Search name or email..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {selected.length > 0 ? (
                <Badge variant="secondary" className="h-9 px-3">
                  {selected.length} selected
                </Badge>
              ) : null}
              <Button type="button" variant="outline" onClick={loadCandidates}>
                {loading ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
                Refresh
              </Button>
            </div>
          </div>

          {error ? (
            <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          ) : null}

          <div className="overflow-hidden rounded-2xl border bg-card">
            <ScrollArea className="h-[min(620px,calc(100dvh-20rem))] w-full">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50 hover:bg-muted/50">
                    <TableHead className="w-12">
                      <Checkbox
                        checked={
                          selected.length === candidates.length &&
                          candidates.length > 0
                        }
                        onCheckedChange={toggleSelectAll}
                        aria-label="Select all candidates"
                      />
                    </TableHead>
                    <TableHead className="min-w-[220px]">Candidate</TableHead>
                    <TableHead className="min-w-[220px]">Contact</TableHead>
                    <TableHead className="min-w-[160px]">Role</TableHead>
                    <TableHead className="min-w-[150px]">Location</TableHead>
                    <TableHead className="min-w-[180px]">Skills</TableHead>
                    <TableHead className="w-[120px]">Created</TableHead>
                    <TableHead className="w-[100px] text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={8} className="py-16 text-center text-sm text-muted-foreground">
                        <span className="inline-flex items-center gap-2">
                          <Loader2 className="size-4 animate-spin" aria-hidden />
                          Loading candidates...
                        </span>
                      </TableCell>
                    </TableRow>
                  ) : candidates.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="py-16 text-center">
                        <div className="mx-auto flex max-w-sm flex-col items-center">
                          <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                            <Users className="size-7" aria-hidden />
                          </div>
                          <p className="mt-4 font-medium text-foreground">No candidates found</p>
                          <p className="mt-1 text-sm text-muted-foreground">
                            Upload resumes or adjust the search term to populate this list.
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    candidates.map((c) => {
                      const skills = getSkills(c.skills);
                      return (
                        <TableRow key={c.id} className="align-top">
                          <TableCell>
                            <Checkbox
                              checked={selected.includes(c.id)}
                              onCheckedChange={() => toggleSelect(c.id)}
                              aria-label={`Select ${c.name || "candidate"}`}
                            />
                          </TableCell>
                          <TableCell>
                            <button
                              type="button"
                              onClick={() => setPreview(c)}
                              className="flex max-w-[260px] items-center gap-3 text-left"
                            >
                              <CandidateAvatar name={c.name} />
                              <span className="min-w-0">
                                <span className="block truncate font-semibold text-foreground hover:text-primary">
                                  {c.name || "Unnamed candidate"}
                                </span>
                                <span className="mt-1 block truncate text-xs text-muted-foreground">
                                  ID: {c.id}
                                </span>
                              </span>
                            </button>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1 text-sm">
                              <p className="truncate text-foreground">{c.email || "—"}</p>
                              <p className="truncate text-xs text-muted-foreground">{c.phone || "No phone"}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1 text-sm">
                              <p className="truncate text-foreground">{c.currentDesignation || "—"}</p>
                              <p className="truncate text-xs text-muted-foreground">{c.currentCompany || "No company"}</p>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            <span className="line-clamp-2">
                              {[c.currentLocation, c.preferredLocation].filter(Boolean).join(" · ") || "—"}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex max-w-[220px] flex-wrap gap-1.5">
                              {skills.length ? (
                                <>
                                  {skills.slice(0, 3).map((skill) => (
                                    <Badge key={skill} variant="secondary" className="font-normal">
                                      {skill}
                                    </Badge>
                                  ))}
                                  {skills.length > 3 ? (
                                    <Badge variant="outline" className="font-normal">
                                      +{skills.length - 3}
                                    </Badge>
                                  ) : null}
                                </>
                              ) : (
                                <span className="text-sm text-muted-foreground">—</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {formatDate(c.createdAt)}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="text-primary"
                              onClick={() => setPreview(c)}
                            >
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </ScrollArea>

            <div className="flex flex-col gap-3 border-t bg-muted/20 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm text-muted-foreground">
                Page <span className="font-medium text-foreground">{page}</span> of{" "}
                <span className="font-medium text-foreground">{totalPages}</span> ·{" "}
                <span className="font-medium text-foreground">{total}</span> total
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>Rows</span>
                  <Select
                    value={String(limit)}
                    onValueChange={(value) => {
                      setLimit(Number(value));
                      setPage(1);
                    }}
                  >
                    <SelectTrigger size="sm" className="h-9 w-20 bg-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[10, 20, 50, 100].map((n) => (
                        <SelectItem key={n} value={String(n)}>
                          {n}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  disabled={page === 1 || loading}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Prev
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  disabled={page >= totalPages || loading}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!preview} onOpenChange={() => setPreview(null)}>
        <DialogContent className="max-w-5xl overflow-hidden rounded-2xl p-0 gap-0">
          <DialogHeader className="sr-only">
            <DialogTitle>Candidate profile</DialogTitle>
          </DialogHeader>

          {preview && (
            <div className="flex max-h-[85vh] flex-col">
              <div className="relative overflow-hidden bg-slate-950 p-6 text-white">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.35),transparent_36%)]" />
                <div className="relative flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                  <div className="flex items-center gap-4">
                    <CandidateAvatar name={preview.name} />
                    <div>
                      <h2 className="text-2xl font-semibold tracking-tight">
                        {preview.name || "Unnamed Candidate"}
                      </h2>
                      <p className="mt-1 text-sm text-white/75">
                        {preview.currentDesignation || "Designation not added"} ·{" "}
                        {preview.currentCompany || "Company not added"}
                      </p>
                    </div>
                  </div>
                  {preview.resumeUrl ? (
                    <Button className="bg-white text-slate-950 hover:bg-white/90" asChild>
                      <a href={preview.resumeUrl} target="_blank" rel="noreferrer">
                        View resume
                      </a>
                    </Button>
                  ) : null}
                </div>
              </div>

              <ScrollArea className="min-h-0 flex-1 bg-muted/30">
                <div className="space-y-5 p-5 sm:p-6">
                  <div className="grid gap-4 md:grid-cols-3">
                    <Card className="shadow-sm">
                      <CardContent className="flex items-center gap-3 p-4">
                        <Mail className="size-5 text-primary" aria-hidden />
                        <InfoItem label="Email" value={preview.email} />
                      </CardContent>
                    </Card>
                    <Card className="shadow-sm">
                      <CardContent className="flex items-center gap-3 p-4">
                        <BriefcaseBusiness className="size-5 text-primary" aria-hidden />
                        <InfoItem
                          label="Experience"
                          value={
                            preview.totalExperienceYears
                              ? `${preview.totalExperienceYears} yrs`
                              : "—"
                          }
                        />
                      </CardContent>
                    </Card>
                    <Card className="shadow-sm">
                      <CardContent className="flex items-center gap-3 p-4">
                        <MapPin className="size-5 text-primary" aria-hidden />
                        <InfoItem label="Location" value={preview.currentLocation} />
                      </CardContent>
                    </Card>
                  </div>

                  <div className="grid gap-4 lg:grid-cols-2">
                    <Card className="shadow-sm">
                      <CardHeader>
                        <CardTitle className="text-base">Basic details</CardTitle>
                      </CardHeader>
                      <CardContent className="grid gap-4 sm:grid-cols-2">
                        <InfoItem label="Phone" value={preview.phone} />
                        <InfoItem label="Department" value={preview.department} />
                        <InfoItem label="Industry" value={preview.industry} />
                        <InfoItem label="Qualification" value={preview.qualification} />
                      </CardContent>
                    </Card>

                    <Card className="shadow-sm">
                      <CardHeader>
                        <CardTitle className="text-base">Compensation</CardTitle>
                      </CardHeader>
                      <CardContent className="grid gap-4 sm:grid-cols-2">
                        <InfoItem label="Current Salary" value={preview.currentSalary} />
                        <InfoItem label="Expected Salary" value={preview.expectedSalary} />
                        <InfoItem label="Created" value={formatDate(preview.createdAt)} />
                        <InfoItem label="Candidate ID" value={preview.id} />
                      </CardContent>
                    </Card>
                  </div>

                  <Card className="shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-base">Location preferences</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-4 md:grid-cols-3">
                      <InfoItem label="Current" value={preview.currentLocation} />
                      <InfoItem label="Preferred" value={preview.preferredLocation} />
                      <InfoItem
                        label="Hometown"
                        value={[preview.hometown, preview.pincode].filter(Boolean).join(" · ")}
                      />
                    </CardContent>
                  </Card>

                  <Card className="shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-base">Skills</CardTitle>
                      <CardDescription>Parsed skills from candidate data.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {getSkills(preview.skills).length ? (
                          getSkills(preview.skills).map((skill) => (
                            <Badge key={skill} variant="secondary" className="font-normal">
                              <CheckCircle2 className="size-3" aria-hidden />
                              {skill}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-sm text-muted-foreground">No skills parsed.</span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </ScrollArea>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AddCandidate;