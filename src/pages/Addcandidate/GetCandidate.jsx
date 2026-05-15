import React, { useMemo, useState } from "react";
import useCandidatesQuery from "@/hooks/useCandidatesQuery";
import InfoItem from "@/components/InfoItem";

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
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BriefcaseBusiness,
  CheckCircle2,
  Filter,
  ListFilter,
  Loader2,
  Mail,
  MapPin,
  RotateCw,
  Search,
  SearchCheck,
  SlidersHorizontal,
  Users,
  X,
} from "lucide-react";

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

function getSkills(skills) {
  if (Array.isArray(skills)) return skills.filter(Boolean);
  return String(skills || "")
    .split(",")
    .map((skill) => skill.trim())
    .filter(Boolean);
}

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

const ADVANCED_KEYS = [
  "hometown",
  "pincode",
  "minExperience",
  "maxExperience",
  "industry",
  "company",
  "designation",
  "department",
  "qualification",
];

function countAdvancedActive(filters) {
  return ADVANCED_KEYS.reduce((n, k) => {
    const v = filters[k];
    return n + (v !== undefined && v !== null && String(v).trim() !== "" ? 1 : 0);
  }, 0);
}

function countAllActive(filters) {
  return Object.keys(filters).reduce((n, k) => {
    const v = filters[k];
    return n + (v !== undefined && v !== null && String(v).trim() !== "" ? 1 : 0);
  }, 0);
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

const FILTER_LABELS = {
  search: "Search",
  location: "Location",
  hometown: "Hometown",
  pincode: "Pincode",
  minExperience: "Min exp",
  maxExperience: "Max exp",
  skills: "Skills",
  industry: "Industry",
  company: "Company",
  designation: "Designation",
  department: "Department",
  qualification: "Qualification",
};

function ActiveFilterChips({ filters, setFilters, resetFilters }) {
  const active = Object.entries(filters).filter(([, value]) => {
    return value !== undefined && value !== null && String(value).trim() !== "";
  });

  if (!active.length) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {active.map(([key, value]) => (
        <Badge key={key} variant="secondary" className="gap-1.5 rounded-full py-1">
          <span className="text-muted-foreground">{FILTER_LABELS[key] || key}:</span>
          <span className="max-w-[12rem] truncate">{String(value)}</span>
          <button
            type="button"
            onClick={() => setFilters({ [key]: "" })}
            className="ml-0.5 rounded-full text-muted-foreground hover:text-foreground"
            aria-label={`Remove ${FILTER_LABELS[key] || key} filter`}
          >
            <X className="size-3" aria-hidden />
          </button>
        </Badge>
      ))}
      <Button type="button" variant="ghost" size="sm" className="h-7 px-2" onClick={resetFilters}>
        Clear all
      </Button>
    </div>
  );
}

function FilterSection({ title, children }) {
  return (
    <div className="rounded-2xl border border-border/80 bg-background p-4 shadow-sm">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </p>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

/** Full filter form — used in desktop sidebar and mobile dialog (standard split-view + drawer pattern). */
function CandidateFiltersForm({ filters, setFilters }) {
  const field = (label, key, props = {}) => (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground">{label}</label>
      <Input
        className="h-10 bg-background"
        value={filters[key]}
        onChange={(e) => setFilters({ [key]: e.target.value })}
        {...props}
      />
    </div>
  );

  return (
    <div className="space-y-4">
      <FilterSection title="Quick search">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="h-11 bg-background pl-9"
            value={filters.search}
            onChange={(e) => setFilters({ search: e.target.value })}
            placeholder="Name, email, phone"
          />
        </div>
        {field("Skills", "skills", { placeholder: "React, Node, SQL" })}
      </FilterSection>

      <FilterSection title="Location">
        {field("Any location", "location", {
          placeholder: "Current / preferred / hometown / pincode",
        })}
        <div className="grid grid-cols-2 gap-2">
          {field("Hometown", "hometown")}
          {field("Pincode", "pincode")}
        </div>
      </FilterSection>

      <FilterSection title="Experience & profile">
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Min exp</label>
            <Input
              className="h-10 bg-background"
              type="number"
              min={0}
              placeholder="Min"
              value={filters.minExperience}
              onChange={(e) => setFilters({ minExperience: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Max exp</label>
            <Input
              className="h-10 bg-background"
              type="number"
              min={0}
              placeholder="Max"
              value={filters.maxExperience}
              onChange={(e) => setFilters({ maxExperience: e.target.value })}
            />
          </div>
        </div>
        {field("Industry", "industry")}
        {field("Company", "company")}
        {field("Designation", "designation")}
        {field("Department", "department")}
        {field("Qualification", "qualification")}
      </FilterSection>
    </div>
  );
}

function StatCard({ title, value, hint, icon: Icon }) {
  return (
    <Card className="overflow-hidden border-border/80 shadow-sm">
      <CardContent className="flex items-center gap-3 p-4">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon className="size-5" aria-hidden />
        </span>
        <div className="min-w-0">
          <p className="text-2xl font-semibold tracking-tight tabular-nums">{value}</p>
          <p className="truncate text-xs text-muted-foreground">{title}</p>
          {hint ? <p className="truncate text-[11px] text-muted-foreground/80">{hint}</p> : null}
        </div>
      </CardContent>
    </Card>
  );
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
    reload,
  } = useCandidatesQuery({ initialPage: 1, initialLimit: 20 });

  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const advancedActive = useMemo(() => countAdvancedActive(filters), [filters]);
  const filtersActiveCount = useMemo(() => countAllActive(filters), [filters]);

  const handlePreviewClick = (candidate) => {
    setSelectedCandidate(candidate);
    setOpenDialog(true);
  };

  const totalPages = pagination.totalPages || 0;
  const canPrev = page > 1;
  const canNext = totalPages > 0 && page < totalPages;
  const withEmail = useMemo(() => items.filter((c) => c.email).length, [items]);
  const withResume = useMemo(() => items.filter((c) => c.resumeUrl).length, [items]);

  const paginationBar = (
    <div className="flex flex-col gap-3 border-t border-border/60 bg-muted/20 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
        {loading ? <Loader2 className="size-3.5 animate-spin shrink-0" aria-hidden /> : null}
        <span>
          <span className="font-medium text-foreground tabular-nums">{pagination.total ?? 0}</span>{" "}
          results
        </span>
      </span>
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="whitespace-nowrap">Rows</span>
          <Select
            value={String(limit)}
            onValueChange={(v) => {
              setLimit(Number(v));
              setPage(1);
            }}
          >
            <SelectTrigger size="sm" className="h-9 w-[4.5rem] bg-background">
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
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="outline"
            className="h-9"
            disabled={!canPrev || loading}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Prev
          </Button>
          <span className="text-xs text-muted-foreground px-1 tabular-nums min-w-[5.5rem] text-center">
            {page}
            {totalPages ? ` / ${totalPages}` : ""}
          </span>
          <Button
            type="button"
            variant="outline"
            className="h-9"
            disabled={!canNext || loading}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );

  const filterSidebarInner = (
    <>
      <div className="shrink-0 border-b bg-muted/30 px-4 py-4">
        <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <SlidersHorizontal className="size-4" aria-hidden />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">Smart filters</p>
            <p className="text-xs text-muted-foreground">Server-backed search</p>
          </div>
          {filtersActiveCount > 0 ? (
            <Badge variant="secondary" className="shrink-0">
              {filtersActiveCount}
            </Badge>
          ) : null}
        </div>
        <Button type="button" variant="ghost" size="sm" className="h-8 shrink-0" onClick={resetFilters}>
          Clear
        </Button>
      </div>
      </div>
      <ScrollArea className="flex-1 min-h-0">
        <div className="p-4">
          <CandidateFiltersForm filters={filters} setFilters={setFilters} />
        </div>
      </ScrollArea>
      <div className="shrink-0 border-t bg-muted/20 px-4 py-3">
        <p className="text-xs leading-relaxed text-muted-foreground">
          Search applies automatically after typing. Resume text is intentionally
          not shown in the list for faster scanning.
        </p>
      </div>
    </>
  );

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-[2rem] bg-slate-950 px-5 py-6 text-white shadow-xl sm:px-8 lg:px-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.35),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(99,102,241,0.28),transparent_32%)]" />
        <div className="relative flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl space-y-4">
            <Badge className="border-white/20 bg-white/10 text-white hover:bg-white/10">
              Candidate search console
            </Badge>
            <div>
              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                Find the right candidate faster with structured filters.
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/70 sm:text-base">
                Search by name, contact, skills, location, experience, company,
                designation, department, and qualification using one guided workspace.
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 xl:min-w-[34rem]">
            <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
              <p className="text-2xl font-semibold tabular-nums">{pagination.total ?? 0}</p>
              <p className="text-xs text-white/70">Matching candidates</p>
            </div>
            <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
              <p className="text-2xl font-semibold tabular-nums">{filtersActiveCount}</p>
              <p className="text-xs text-white/70">Active filters</p>
            </div>
            <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
              <p className="text-2xl font-semibold tabular-nums">{items.length}</p>
              <p className="text-xs text-white/70">Visible rows</p>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total matches" value={pagination.total ?? 0} hint="Server result count" icon={SearchCheck} />
        <StatCard title="Visible now" value={items.length} hint="Current page" icon={Users} />
        <StatCard title="With email" value={withEmail} hint="Current page" icon={Mail} />
        <StatCard title="With resume" value={withResume} hint="Current page" icon={BriefcaseBusiness} />
      </div>

      <div className="flex flex-col gap-3 lg:hidden">
        <div className="flex items-center gap-2">
          <Input
            className="h-11 flex-1 min-w-0"
            placeholder="Search name, email, phone…"
            value={filters.search}
            onChange={(e) => setFilters({ search: e.target.value })}
          />
          <Button
            type="button"
            variant="outline"
            className="h-11 shrink-0 gap-1.5"
            onClick={() => setMobileFiltersOpen(true)}
          >
            <ListFilter className="size-4" aria-hidden />
            Filters
            {filtersActiveCount > 0 ? (
              <Badge variant="secondary" className="ml-0.5 h-5 min-w-5 px-1 text-[10px]">
                {filtersActiveCount}
              </Badge>
            ) : null}
          </Button>
        </div>
        <ActiveFilterChips filters={filters} setFilters={setFilters} resetFilters={resetFilters} />
      </div>

      {error && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive" role="alert">
          {error}
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[380px_1fr]">
        <aside className="hidden min-h-[720px] overflow-hidden rounded-2xl border bg-card shadow-sm xl:flex xl:flex-col">
          {filterSidebarInner}
        </aside>

        <Card className="min-w-0 overflow-hidden border-border/80 shadow-sm py-0 gap-0">
          <CardHeader className="border-b bg-muted/30 px-4 py-4 sm:px-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <SearchCheck className="size-5 text-primary" aria-hidden />
                  Filtered candidates
                </CardTitle>
                <CardDescription className="mt-1">
                  Click a candidate to view the complete profile and resume details.
                </CardDescription>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button type="button" variant="outline" className="gap-2" onClick={reload} disabled={loading}>
                  {loading ? (
                    <Loader2 className="size-4 animate-spin" aria-hidden />
                  ) : (
                    <RotateCw className="size-4" aria-hidden />
                  )}
                  Refresh
                </Button>
                {advancedActive > 0 ? (
                  <Badge variant="outline" className="h-10 px-3">
                    {advancedActive} structured filter{advancedActive === 1 ? "" : "s"}
                  </Badge>
                ) : null}
              </div>
            </div>
            <div className="mt-4 hidden xl:block">
              <ActiveFilterChips filters={filters} setFilters={setFilters} resetFilters={resetFilters} />
            </div>
          </CardHeader>
          <CardContent className="flex min-h-0 flex-col p-0">
            <ScrollArea className="h-[min(660px,calc(100dvh-18rem))] w-full">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50 hover:bg-muted/50">
                    <TableHead className="min-w-[240px]">Candidate</TableHead>
                    <TableHead className="min-w-[220px]">Contact</TableHead>
                    <TableHead className="min-w-[190px]">Current role</TableHead>
                    <TableHead className="w-[90px] text-center">Exp</TableHead>
                    <TableHead className="min-w-[220px]">Skills</TableHead>
                    <TableHead className="min-w-[180px]">Location</TableHead>
                    <TableHead className="w-[120px]">Resume</TableHead>
                    <TableHead className="w-[100px] text-right">Profile</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {items.length > 0 ? (
                    items.map((c) => {
                      const skills = getSkills(c.skills);
                      return (
                        <TableRow key={c.id} className="align-top">
                          <TableCell>
                            <button
                              type="button"
                              className="flex max-w-[280px] items-center gap-3 text-left"
                              onClick={() => handlePreviewClick(c)}
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
                              <p className="truncate text-xs text-muted-foreground">
                                {c.phone || "No phone"}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1 text-sm">
                              <p className="truncate text-foreground">{c.currentDesignation || "—"}</p>
                              <p className="truncate text-xs text-muted-foreground">
                                {c.currentCompany || "No company"}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell className="text-center text-sm tabular-nums">
                            {c.totalExperienceYears != null ? String(c.totalExperienceYears) : "—"}
                          </TableCell>
                          <TableCell>
                            <div className="flex max-w-[240px] flex-wrap gap-1.5" title={formatSkills(c.skills)}>
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
                            <span className="line-clamp-2">
                              {[c.currentLocation, c.preferredLocation].filter(Boolean).join(" · ") ||
                                "—"}
                            </span>
                          </TableCell>
                          <TableCell>
                            {c.resumeUrl ? (
                              <Button variant="outline" size="sm" asChild>
                                <a href={c.resumeUrl} target="_blank" rel="noreferrer">
                                  Open
                                </a>
                              </Button>
                            ) : (
                              <span className="text-muted-foreground text-sm">—</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="text-primary"
                              onClick={() => handlePreviewClick(c)}
                            >
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={8}
                        className="text-center py-16 text-muted-foreground text-sm"
                      >
                        {loading ? (
                          <span className="inline-flex items-center gap-2 justify-center">
                            <Loader2 className="size-4 animate-spin" aria-hidden />
                            Loading…
                          </span>
                        ) : (
                          <div className="mx-auto flex max-w-sm flex-col items-center">
                            <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                              <Filter className="size-7" aria-hidden />
                            </div>
                            <p className="mt-4 font-medium text-foreground">No candidates match these filters</p>
                            <p className="mt-1 text-sm text-muted-foreground">
                              Remove some filters or search for a broader keyword.
                            </p>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </ScrollArea>
            {paginationBar}
          </CardContent>
        </Card>
      </div>

      <Dialog open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
        <DialogContent className="!grid grid-rows-[auto_minmax(0,1fr)_auto] gap-0 p-0 max-h-[88dvh] w-[min(100%,26rem)] sm:max-w-md rounded-2xl overflow-hidden">
          <DialogHeader className="px-4 py-4 pr-12 border-b shrink-0 text-left space-y-1 bg-muted/30">
            <DialogTitle className="text-base font-semibold">Candidate filters</DialogTitle>
            <p className="text-xs text-muted-foreground">
              Narrow results using structured fields.
            </p>
          </DialogHeader>
          <ScrollArea className="min-h-0">
            <div className="p-4">
              <CandidateFiltersForm filters={filters} setFilters={setFilters} />
            </div>
          </ScrollArea>
          <DialogFooter className="flex-row justify-between gap-2 border-t p-3 sm:px-4 shrink-0">
            <Button type="button" variant="outline" size="sm" onClick={resetFilters}>
              Clear all
            </Button>
            <Button type="button" size="sm" onClick={() => setMobileFiltersOpen(false)}>
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="max-w-5xl p-0 overflow-hidden rounded-2xl gap-0">
          <DialogHeader className="sr-only">
            <DialogTitle>Candidate profile</DialogTitle>
          </DialogHeader>
          {selectedCandidate && (
            <div className="flex flex-col max-h-[85vh]">
              <div className="relative overflow-hidden bg-slate-950 p-6 text-white">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.35),transparent_36%)]" />
                <div className="relative flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                  <div className="flex items-center gap-4">
                    <CandidateAvatar name={selectedCandidate.name} />
                    <div>
                      <h2 className="text-2xl font-semibold tracking-tight">
                        {selectedCandidate.name || "Unnamed Candidate"}
                      </h2>
                      <p className="mt-1 text-sm text-white/75">
                        {selectedCandidate.currentDesignation || "Designation not added"} ·{" "}
                        {selectedCandidate.currentCompany || "Company not added"}
                      </p>
                    </div>
                  </div>
                  {selectedCandidate.resumeUrl ? (
                    <Button className="bg-white text-slate-950 hover:bg-white/90" asChild>
                      <a href={selectedCandidate.resumeUrl} target="_blank" rel="noreferrer">
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
                        <InfoItem label="Email" value={selectedCandidate.email} />
                      </CardContent>
                    </Card>
                    <Card className="shadow-sm">
                      <CardContent className="flex items-center gap-3 p-4">
                        <BriefcaseBusiness className="size-5 text-primary" aria-hidden />
                        <InfoItem
                          label="Experience"
                          value={
                            selectedCandidate.totalExperienceYears
                              ? `${selectedCandidate.totalExperienceYears} yrs`
                              : "—"
                          }
                        />
                      </CardContent>
                    </Card>
                    <Card className="shadow-sm">
                      <CardContent className="flex items-center gap-3 p-4">
                        <MapPin className="size-5 text-primary" aria-hidden />
                        <InfoItem label="Location" value={selectedCandidate.currentLocation} />
                      </CardContent>
                    </Card>
                  </div>

                  <div className="grid gap-4 lg:grid-cols-2">
                    <Card className="shadow-sm">
                      <CardHeader>
                        <CardTitle className="text-base">Basic details</CardTitle>
                      </CardHeader>
                      <CardContent className="grid gap-4 sm:grid-cols-2">
                        <InfoItem label="Phone" value={selectedCandidate.phone} />
                        <InfoItem label="Department" value={selectedCandidate.department} />
                        <InfoItem label="Industry" value={selectedCandidate.industry} />
                        <InfoItem label="Qualification" value={selectedCandidate.qualification} />
                      </CardContent>
                    </Card>

                    <Card className="shadow-sm">
                      <CardHeader>
                        <CardTitle className="text-base">Compensation</CardTitle>
                      </CardHeader>
                      <CardContent className="grid gap-4 sm:grid-cols-2">
                        <InfoItem label="Current Salary" value={selectedCandidate.currentSalary} />
                        <InfoItem label="Expected Salary" value={selectedCandidate.expectedSalary} />
                        <InfoItem label="Created" value={formatDate(selectedCandidate.createdAt)} />
                        <InfoItem label="Candidate ID" value={selectedCandidate.id} />
                      </CardContent>
                    </Card>
                  </div>

                  <Card className="shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-base">Location preferences</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-4 md:grid-cols-3">
                      <InfoItem label="Current" value={selectedCandidate.currentLocation} />
                      <InfoItem label="Preferred" value={selectedCandidate.preferredLocation} />
                      <InfoItem
                        label="Hometown"
                        value={[selectedCandidate.hometown, selectedCandidate.pincode]
                          .filter(Boolean)
                          .join(" · ")}
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
                        {getSkills(selectedCandidate.skills).length ? (
                          getSkills(selectedCandidate.skills).map((skill) => (
                            <Badge key={skill} variant="secondary" className="gap-1.5 font-normal">
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

export default GetCandidate;
