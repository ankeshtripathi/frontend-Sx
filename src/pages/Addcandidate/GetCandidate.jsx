import React, { useMemo, useState } from "react";
import toast from "react-hot-toast";
import useCandidatesQuery from "@/hooks/useCandidatesQuery";
import { formatSkills, getSkills } from "@/lib/candidate-format";
import CandidateAvatar from "@/components/workspace/CandidateAvatar";
import CandidateProfileDialog from "@/components/workspace/CandidateProfileDialog";
import PageHero, { HeroGhostButton } from "@/components/workspace/PageHero";
import MetricStatCard from "@/components/workspace/MetricStatCard";
import WorkspacePage from "@/components/workspace/WorkspacePage";
import PaginationBar from "@/components/workspace/PaginationBar";
import EmptyState from "@/components/workspace/EmptyState";
import AlertBanner from "@/components/workspace/AlertBanner";
import {
  WORKSPACE_TABLE_CLASS,
  WORKSPACE_TABLE_MIN_WIDTH_CLASS,
  WORKSPACE_TABLE_SCROLL_CLASS,
} from "@/components/workspace/workspace-table";
import { cn } from "@/lib/utils";

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
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import {
  BriefcaseBusiness,
  Building2,
  Copy,
  ExternalLink,
  Eye,
  FileText,
  Filter,
  GraduationCap,
  LayoutGrid,
  List,
  ListFilter,
  Loader2,
  Mail,
  MapPin,
  Phone,
  RotateCw,
  Search,
  SearchCheck,
  SlidersHorizontal,
  Users,
  X,
} from "lucide-react";

/* -------------------------------------------------------------------------- */
/*  Filter metadata — keep in sync with useCandidatesQuery + GET /candidates  */
/* -------------------------------------------------------------------------- */

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

function isFilterActive(value) {
  return value !== undefined && value !== null && String(value).trim() !== "";
}

function countAdvancedActive(filters) {
  return ADVANCED_KEYS.reduce(
    (n, key) => n + (isFilterActive(filters[key]) ? 1 : 0),
    0
  );
}

function countAllActive(filters) {
  return Object.keys(filters).reduce(
    (n, key) => n + (isFilterActive(filters[key]) ? 1 : 0),
    0
  );
}

function formatExperience(years) {
  if (years == null || years === "") return "—";
  const n = Number(years);
  if (!Number.isFinite(n)) return "—";
  return `${n} yr${n === 1 ? "" : "s"}`;
}

async function copyToClipboard(text, label = "Value") {
  if (!text) return;
  try {
    await navigator.clipboard.writeText(text);
    toast.success(`${label} copied`);
  } catch {
    toast.error("Could not copy");
  }
}

/* -------------------------------------------------------------------------- */
/*  Active filter chips                                                       */
/* -------------------------------------------------------------------------- */

function ActiveFilterChips({ filters, setFilters, resetFilters }) {
  const active = Object.entries(filters).filter(([, value]) => isFilterActive(value));
  if (!active.length) return null;

  return (
    <div className="flex flex-wrap items-center gap-2" role="list" aria-label="Active filters">
      {active.map(([key, value]) => (
        <Badge
          key={key}
          role="listitem"
          variant="secondary"
          className="gap-1.5 rounded-full border border-emerald-200/80 bg-emerald-50 py-1 text-emerald-950"
        >
          <span className="font-medium text-emerald-700/80">
            {FILTER_LABELS[key] || key}:
          </span>
          <span className="max-w-[12rem] truncate font-semibold">{String(value)}</span>
          <button
            type="button"
            onClick={() => setFilters({ [key]: "" })}
            className="ml-0.5 rounded-full text-emerald-700/70 transition-colors hover:bg-emerald-100 hover:text-emerald-950"
            aria-label={`Remove ${FILTER_LABELS[key] || key} filter`}
          >
            <X className="size-3" aria-hidden />
          </button>
        </Badge>
      ))}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-7 px-2 text-emerald-800 hover:bg-emerald-50 hover:text-emerald-950"
        onClick={resetFilters}
      >
        Clear all
      </Button>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Filter form sections (desktop sidebar + mobile dialog)                    */
/* -------------------------------------------------------------------------- */

function FilterSection({ title, icon: Icon, children }) {
  return (
    <section className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        {Icon ? (
          <span className="flex size-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
            <Icon className="size-3.5" aria-hidden />
          </span>
        ) : null}
        <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
          {title}
        </p>
      </div>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function FilterField({ label, hint, children }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between gap-2">
        <label className="text-sm font-semibold text-slate-800">{label}</label>
        {hint ? (
          <span className="text-[11px] font-medium text-slate-400">{hint}</span>
        ) : null}
      </div>
      {children}
    </div>
  );
}

/** Shared filter controls — server-debounced via useCandidatesQuery (400ms). */
function CandidateFiltersForm({ filters, setFilters }) {
  const textField = (label, key, props = {}, hint) => (
    <FilterField label={label} hint={hint}>
      <Input
        className="h-10 border-slate-200 bg-slate-50/50 transition-colors focus-visible:bg-white"
        value={filters[key]}
        onChange={(e) => setFilters({ [key]: e.target.value })}
        {...props}
      />
    </FilterField>
  );

  return (
    <div className="space-y-4">
      <FilterSection title="Quick search" icon={Search}>
        <FilterField label="Name or contact" hint="Live search">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <Input
              className="h-11 border-slate-200 bg-slate-50/50 pl-9 transition-colors focus-visible:bg-white"
              value={filters.search}
              onChange={(e) => setFilters({ search: e.target.value })}
              placeholder="Name, email, or phone"
              autoComplete="off"
            />
          </div>
        </FilterField>
        {textField("Skills", "skills", { placeholder: "React, Node, SQL" }, "Comma-separated")}
      </FilterSection>

      <FilterSection title="Location" icon={MapPin}>
        {textField("Any location", "location", {
          placeholder: "Current, preferred, hometown, or pincode",
        })}
        <div className="grid grid-cols-2 gap-2.5">
          {textField("Hometown", "hometown", { placeholder: "City" })}
          {textField("Pincode", "pincode", { placeholder: "e.g. 560001" })}
        </div>
      </FilterSection>

      <FilterSection title="Experience" icon={BriefcaseBusiness}>
        <div className="grid grid-cols-2 gap-2.5">
          <FilterField label="Min years">
            <Input
              className="h-10 border-slate-200 bg-slate-50/50 focus-visible:bg-white"
              type="number"
              min={0}
              step={0.5}
              inputMode="decimal"
              placeholder="0"
              value={filters.minExperience}
              onChange={(e) => setFilters({ minExperience: e.target.value })}
            />
          </FilterField>
          <FilterField label="Max years">
            <Input
              className="h-10 border-slate-200 bg-slate-50/50 focus-visible:bg-white"
              type="number"
              min={0}
              step={0.5}
              inputMode="decimal"
              placeholder="20"
              value={filters.maxExperience}
              onChange={(e) => setFilters({ maxExperience: e.target.value })}
            />
          </FilterField>
        </div>
      </FilterSection>

      <FilterSection title="Profile & career" icon={Building2}>
        {textField("Industry", "industry", { placeholder: "IT, Finance…" })}
        {textField("Company", "company", { placeholder: "Current or past" })}
        {textField("Designation", "designation", { placeholder: "Role title" })}
        {textField("Department", "department", { placeholder: "Engineering…" })}
        {textField("Qualification", "qualification", { placeholder: "B.Tech, MBA…" }, null)}
      </FilterSection>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Results: loading skeleton, table row, card row                            */
/* -------------------------------------------------------------------------- */

function TableSkeletonRows({ rows = 6 }) {
  return Array.from({ length: rows }).map((_, i) => (
    <TableRow key={`sk-${i}`} className="hover:bg-transparent">
      {Array.from({ length: 8 }).map((__, j) => (
        <TableCell key={j}>
          <div
            className="h-4 animate-pulse rounded-md bg-slate-200/80"
            style={{ width: j === 0 ? "70%" : j === 3 ? "40%" : "85%" }}
          />
        </TableCell>
      ))}
    </TableRow>
  ));
}

function CandidateTableRow({ candidate, onPreview }) {
  const skills = getSkills(candidate.skills);
  const locationLine =
    [candidate.currentLocation, candidate.preferredLocation].filter(Boolean).join(" · ") ||
    "—";

  return (
    <TableRow className="group align-top transition-colors hover:bg-emerald-50/40">
      <TableCell>
        <button
          type="button"
          className="flex max-w-[280px] items-center gap-3 text-left outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40 focus-visible:ring-offset-2 rounded-lg"
          onClick={() => onPreview(candidate)}
        >
          <CandidateAvatar name={candidate.name} />
          <span className="min-w-0">
            <span className="block truncate font-bold text-slate-900 transition-colors group-hover:text-emerald-700">
              {candidate.name || "Unnamed candidate"}
            </span>
            <span className="mt-0.5 block truncate font-mono text-[11px] text-slate-400">
              {String(candidate.id).slice(0, 8)}…
            </span>
          </span>
        </button>
      </TableCell>

      <TableCell>
        <div className="space-y-1 text-sm">
          <div className="flex items-center gap-1.5 min-w-0">
            <Mail className="size-3.5 shrink-0 text-slate-400" aria-hidden />
            <p className="truncate text-slate-800">{candidate.email || "—"}</p>
            {candidate.email ? (
              <button
                type="button"
                className="shrink-0 rounded p-0.5 text-slate-400 opacity-0 transition-opacity hover:text-emerald-700 group-hover:opacity-100"
                onClick={() => copyToClipboard(candidate.email, "Email")}
                aria-label="Copy email"
              >
                <Copy className="size-3" />
              </button>
            ) : null}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Phone className="size-3 shrink-0" aria-hidden />
            <span className="truncate">{candidate.phone || "No phone"}</span>
          </div>
        </div>
      </TableCell>

      <TableCell>
        <div className="space-y-1 text-sm">
          <p className="truncate font-medium text-slate-800">
            {candidate.currentDesignation || "—"}
          </p>
          <p className="truncate text-xs text-slate-500">
            {candidate.currentCompany || "No company"}
          </p>
        </div>
      </TableCell>

      <TableCell className="text-center">
        <Badge
          variant="outline"
          className="border-slate-200 bg-white font-semibold tabular-nums text-slate-700"
        >
          {formatExperience(candidate.totalExperienceYears)}
        </Badge>
      </TableCell>

      <TableCell>
        <div
          className="flex max-w-[240px] flex-wrap gap-1.5"
          title={formatSkills(candidate.skills)}
        >
          {skills.length ? (
            <>
              {skills.slice(0, 3).map((skill) => (
                <Badge
                  key={skill}
                  variant="secondary"
                  className="border-emerald-100 bg-emerald-50 font-medium text-emerald-900"
                >
                  {skill}
                </Badge>
              ))}
              {skills.length > 3 ? (
                <Badge variant="outline" className="font-medium text-slate-600">
                  +{skills.length - 3}
                </Badge>
              ) : null}
            </>
          ) : (
            <span className="text-sm text-slate-400">—</span>
          )}
        </div>
      </TableCell>

      <TableCell className="text-sm text-slate-600">
        <span className="line-clamp-2 inline-flex items-start gap-1.5">
          <MapPin className="mt-0.5 size-3.5 shrink-0 text-slate-400" aria-hidden />
          {locationLine}
        </span>
      </TableCell>

      <TableCell>
        {candidate.resumeUrl ? (
          <Button variant="outline" size="sm" className="gap-1.5" asChild>
            <a href={candidate.resumeUrl} target="_blank" rel="noreferrer">
              <FileText className="size-3.5" aria-hidden />
              Open
              <ExternalLink className="size-3 opacity-60" aria-hidden />
            </a>
          </Button>
        ) : (
          <span className="text-sm text-slate-400">—</span>
        )}
      </TableCell>

      <TableCell className="text-right">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="gap-1.5 font-semibold text-emerald-700 hover:bg-emerald-50 hover:text-emerald-900"
          onClick={() => onPreview(candidate)}
        >
          <Eye className="size-3.5" aria-hidden />
          View
        </Button>
      </TableCell>
    </TableRow>
  );
}

/** Compact card layout — better on tablets / when grid view is selected. */
function CandidateCard({ candidate, onPreview }) {
  const skills = getSkills(candidate.skills);

  return (
    <article className="flex flex-col gap-4 rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md">
      <div className="flex items-start gap-3">
        <CandidateAvatar name={candidate.name} size="lg" />
        <div className="min-w-0 flex-1">
          <button
            type="button"
            className="text-left font-bold text-slate-900 hover:text-emerald-700"
            onClick={() => onPreview(candidate)}
          >
            {candidate.name || "Unnamed candidate"}
          </button>
          <p className="mt-0.5 truncate text-sm text-slate-600">
            {candidate.currentDesignation || "No designation"}
            {candidate.currentCompany ? ` · ${candidate.currentCompany}` : ""}
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <Badge variant="outline" className="tabular-nums">
              {formatExperience(candidate.totalExperienceYears)}
            </Badge>
            {candidate.resumeUrl ? (
              <Badge className="border-sky-200 bg-sky-50 text-sky-800 hover:bg-sky-50">
                Resume
              </Badge>
            ) : null}
          </div>
        </div>
      </div>

      <div className="space-y-1.5 text-sm text-slate-600">
        <p className="flex items-center gap-2 truncate">
          <Mail className="size-3.5 shrink-0 text-slate-400" />
          {candidate.email || "No email"}
        </p>
        <p className="flex items-center gap-2 truncate">
          <MapPin className="size-3.5 shrink-0 text-slate-400" />
          {[candidate.currentLocation, candidate.preferredLocation]
            .filter(Boolean)
            .join(" · ") || "No location"}
        </p>
      </div>

      {skills.length ? (
        <div className="flex flex-wrap gap-1.5">
          {skills.slice(0, 4).map((skill) => (
            <Badge
              key={skill}
              variant="secondary"
              className="border-emerald-100 bg-emerald-50 font-medium text-emerald-900"
            >
              {skill}
            </Badge>
          ))}
          {skills.length > 4 ? (
            <Badge variant="outline">+{skills.length - 4}</Badge>
          ) : null}
        </div>
      ) : null}

      <div className="mt-auto flex gap-2 border-t border-slate-100 pt-3">
        <Button
          type="button"
          size="sm"
          className="flex-1 gap-1.5 bg-emerald-600 font-semibold hover:bg-emerald-700"
          onClick={() => onPreview(candidate)}
        >
          <Eye className="size-3.5" />
          Profile
        </Button>
        {candidate.resumeUrl ? (
          <Button type="button" variant="outline" size="sm" className="gap-1.5" asChild>
            <a href={candidate.resumeUrl} target="_blank" rel="noreferrer">
              <FileText className="size-3.5" />
              Resume
            </a>
          </Button>
        ) : null}
      </div>
    </article>
  );
}

/* -------------------------------------------------------------------------- */
/*  Page                                                                      */
/* -------------------------------------------------------------------------- */

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
  /** table | cards — cards help on medium screens and dense lists */
  const [viewMode, setViewMode] = useState("table");

  const advancedActive = useMemo(() => countAdvancedActive(filters), [filters]);
  const filtersActiveCount = useMemo(() => countAllActive(filters), [filters]);
  const withEmail = useMemo(() => items.filter((c) => c.email).length, [items]);
  const withResume = useMemo(() => items.filter((c) => c.resumeUrl).length, [items]);

  const handlePreviewClick = (candidate) => {
    setSelectedCandidate(candidate);
    setOpenDialog(true);
  };

  const showInitialLoading = loading && items.length === 0;
  const showEmpty = !loading && items.length === 0;

  /* ---- Sticky smart-filters panel (desktop xl+) ---- */
  const filterSidebarInner = (
    <>
      <header className="shrink-0 border-b border-emerald-100/80 bg-gradient-to-r from-emerald-50 to-white px-4 py-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-md shadow-emerald-600/25">
              <SlidersHorizontal className="size-4" aria-hidden />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-slate-900">Smart filters</p>
              <p className="text-xs font-medium text-slate-500">
                Auto-applies as you type
              </p>
            </div>
            {filtersActiveCount > 0 ? (
              <Badge className="shrink-0 border-emerald-200 bg-emerald-100 font-bold text-emerald-900 hover:bg-emerald-100">
                {filtersActiveCount}
              </Badge>
            ) : null}
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 shrink-0 font-semibold text-slate-600 hover:bg-emerald-50 hover:text-emerald-900"
            onClick={resetFilters}
            disabled={filtersActiveCount === 0}
          >
            Clear
          </Button>
        </div>
      </header>

      {/* Scrollable filter body — keeps header/footer pinned */}
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-3 sm:px-4">
        <CandidateFiltersForm filters={filters} setFilters={setFilters} />
      </div>

      <footer className="shrink-0 border-t border-emerald-100/80 bg-white/80 px-4 py-3 backdrop-blur-sm">
        <div className="flex items-start gap-2 text-xs leading-relaxed text-slate-500">
          <GraduationCap className="mt-0.5 size-3.5 shrink-0 text-emerald-600" aria-hidden />
          <p>
            Structured filters hit the server (debounced). Resume body text is hidden
            in the list for faster scanning — open a profile for full detail.
          </p>
        </div>
      </footer>
    </>
  );

  return (
    <TooltipProvider delayDuration={250}>
      <WorkspacePage>
        <PageHero
          eyebrow="Talent pool"
          title="Find the right candidate faster"
          description="Search and filter by contact, skills, location, experience, company, designation, department, and qualification — all server-backed."
          actions={
            <>
              <HeroGhostButton onClick={reload} disabled={loading}>
                {loading ? (
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                ) : (
                  <RotateCw className="size-4" aria-hidden />
                )}
                Refresh pool
              </HeroGhostButton>
              <HeroGhostButton
                className="xl:hidden"
                onClick={() => setMobileFiltersOpen(true)}
              >
                <ListFilter className="size-4" aria-hidden />
                Filters
                {filtersActiveCount > 0 ? (
                  <Badge className="ml-1 h-5 min-w-5 border-0 bg-sky-400 px-1 text-[10px] text-slate-950">
                    {filtersActiveCount}
                  </Badge>
                ) : null}
              </HeroGhostButton>
            </>
          }
          stats={[
            { label: "Matching", value: pagination.total ?? 0, tone: "emerald" },
            { label: "Active filters", value: filtersActiveCount, tone: "sky" },
            { label: "On this page", value: items.length, tone: "violet" },
          ]}
        />

        {/* KPI strip — page-level snapshot */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricStatCard
            variant="compact"
            title="Total matches"
            value={pagination.total ?? 0}
            hint="Server count"
            icon={SearchCheck}
            tone="emerald"
          />
          <MetricStatCard
            variant="compact"
            title="Visible now"
            value={items.length}
            hint="Current page"
            icon={Users}
            tone="sky"
          />
          <MetricStatCard
            variant="compact"
            title="With email"
            value={withEmail}
            hint="Current page"
            icon={Mail}
            tone="violet"
          />
          <MetricStatCard
            variant="compact"
            title="With resume"
            value={withResume}
            hint="Current page"
            icon={FileText}
            tone="amber"
          />
        </div>

        {/* Mobile quick search + filter entry (sidebar is xl-only) */}
        <div className="flex flex-col gap-3 xl:hidden">
          <div className="flex items-center gap-2">
            <div className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <Input
                className="h-11 border-slate-200 bg-white pl-9 shadow-sm"
                placeholder="Search name, email, phone…"
                value={filters.search}
                onChange={(e) => setFilters({ search: e.target.value })}
              />
            </div>
            <Button
              type="button"
              variant="outline"
              className="h-11 shrink-0 gap-1.5 border-emerald-200 bg-emerald-50 font-semibold text-emerald-900 hover:bg-emerald-100"
              onClick={() => setMobileFiltersOpen(true)}
            >
              <ListFilter className="size-4" aria-hidden />
              Filters
              {filtersActiveCount > 0 ? (
                <Badge className="ml-0.5 h-5 min-w-5 border-0 bg-emerald-600 px-1 text-[10px] text-white">
                  {filtersActiveCount}
                </Badge>
              ) : null}
            </Button>
          </div>
          <ActiveFilterChips
            filters={filters}
            setFilters={setFilters}
            resetFilters={resetFilters}
          />
        </div>

        {error ? <AlertBanner>{error}</AlertBanner> : null}

        {/* Split layout: sticky filters + results workspace */}
        <div className="grid gap-6 xl:grid-cols-[minmax(300px,360px)_1fr]">
          <aside
            className="hidden h-[calc(100dvh-7rem)] max-h-[calc(100dvh-7rem)] overflow-hidden rounded-2xl border border-emerald-200/80 bg-gradient-to-b from-emerald-50/95 via-white to-white shadow-lg shadow-emerald-900/5 xl:sticky xl:top-4 xl:flex xl:min-h-0 xl:flex-col xl:self-start"
            aria-label="Smart filters"
          >
            {filterSidebarInner}
          </aside>

          <Card className="min-w-0 gap-0 overflow-hidden border-slate-200/90 bg-white py-0 shadow-md shadow-slate-200/40">
            <CardHeader className="border-b border-slate-200/80 border-l-4 border-l-emerald-500 bg-gradient-to-r from-emerald-50 via-white to-white px-4 py-4 sm:px-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0">
                  <CardTitle className="flex items-center gap-2.5 text-xl font-bold text-slate-900">
                    <span className="flex size-9 items-center justify-center rounded-lg bg-white text-emerald-600 shadow-sm ring-1 ring-slate-200/80">
                      <SearchCheck className="size-5" aria-hidden />
                    </span>
                    Filtered candidates
                    {loading ? (
                      <Loader2
                        className="size-4 animate-spin text-emerald-600"
                        aria-label="Loading"
                      />
                    ) : null}
                  </CardTitle>
                  <CardDescription className="mt-1.5 font-medium text-slate-600">
                    Click a name or View to open the full profile. Scroll the table for all
                    columns.
                  </CardDescription>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {/* View mode toggle */}
                  <div
                    className="inline-flex rounded-xl border border-slate-200 bg-white p-1 shadow-sm"
                    role="group"
                    aria-label="Result layout"
                  >
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          type="button"
                          size="sm"
                          variant={viewMode === "table" ? "default" : "ghost"}
                          className={cn(
                            "h-8 gap-1.5 px-2.5",
                            viewMode === "table" &&
                              "bg-emerald-600 hover:bg-emerald-700"
                          )}
                          onClick={() => setViewMode("table")}
                          aria-pressed={viewMode === "table"}
                        >
                          <List className="size-3.5" />
                          <span className="hidden sm:inline">Table</span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Table view</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          type="button"
                          size="sm"
                          variant={viewMode === "cards" ? "default" : "ghost"}
                          className={cn(
                            "h-8 gap-1.5 px-2.5",
                            viewMode === "cards" &&
                              "bg-emerald-600 hover:bg-emerald-700"
                          )}
                          onClick={() => setViewMode("cards")}
                          aria-pressed={viewMode === "cards"}
                        >
                          <LayoutGrid className="size-3.5" />
                          <span className="hidden sm:inline">Cards</span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Card view</TooltipContent>
                    </Tooltip>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    className="h-9 gap-2 font-semibold"
                    onClick={reload}
                    disabled={loading}
                  >
                    {loading ? (
                      <Loader2 className="size-4 animate-spin" aria-hidden />
                    ) : (
                      <RotateCw className="size-4" aria-hidden />
                    )}
                    Refresh
                  </Button>

                  {advancedActive > 0 ? (
                    <Badge
                      variant="outline"
                      className="h-9 border-emerald-200 bg-emerald-50 px-3 font-semibold text-emerald-900"
                    >
                      {advancedActive} structured
                    </Badge>
                  ) : null}
                </div>
              </div>

              <div className="mt-4 hidden xl:block">
                <ActiveFilterChips
                  filters={filters}
                  setFilters={setFilters}
                  resetFilters={resetFilters}
                />
              </div>
            </CardHeader>

            <CardContent className="flex min-h-0 flex-col p-0">
              {viewMode === "table" ? (
                <div
                  className={cn(
                    WORKSPACE_TABLE_SCROLL_CLASS,
                    "h-[min(660px,calc(100dvh-18rem))]"
                  )}
                >
                  <Table
                    className={cn(
                      WORKSPACE_TABLE_CLASS,
                      WORKSPACE_TABLE_MIN_WIDTH_CLASS
                    )}
                  >
                    <TableHeader>
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="min-w-[240px]">Candidate</TableHead>
                        <TableHead className="min-w-[220px]">Contact</TableHead>
                        <TableHead className="min-w-[190px]">Current role</TableHead>
                        <TableHead className="w-[100px] text-center">Exp</TableHead>
                        <TableHead className="min-w-[220px]">Skills</TableHead>
                        <TableHead className="min-w-[180px]">Location</TableHead>
                        <TableHead className="w-[130px]">Resume</TableHead>
                        <TableHead className="w-[110px] text-right">Profile</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {showInitialLoading ? (
                        <TableSkeletonRows />
                      ) : showEmpty ? (
                        <TableRow className="hover:bg-transparent">
                          <TableCell colSpan={8} className="p-0">
                            <EmptyState
                              icon={Filter}
                              title="No candidates match these filters"
                              description="Clear a few filters or broaden your search keywords."
                              action={
                                filtersActiveCount > 0 ? (
                                  <Button
                                    type="button"
                                    variant="outline"
                                    onClick={resetFilters}
                                  >
                                    Clear all filters
                                  </Button>
                                ) : null
                              }
                            />
                          </TableCell>
                        </TableRow>
                      ) : (
                        items.map((c) => (
                          <CandidateTableRow
                            key={c.id}
                            candidate={c}
                            onPreview={handlePreviewClick}
                          />
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="max-h-[min(660px,calc(100dvh-18rem))] overflow-y-auto overscroll-contain bg-slate-50/50 p-4">
                  {showInitialLoading ? (
                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3">
                      {Array.from({ length: 6 }).map((_, i) => (
                        <div
                          key={i}
                          className="h-48 animate-pulse rounded-2xl border border-slate-200 bg-slate-100"
                        />
                      ))}
                    </div>
                  ) : showEmpty ? (
                    <EmptyState
                      icon={Filter}
                      title="No candidates match these filters"
                      description="Clear a few filters or broaden your search keywords."
                      action={
                        filtersActiveCount > 0 ? (
                          <Button type="button" variant="outline" onClick={resetFilters}>
                            Clear all filters
                          </Button>
                        ) : null
                      }
                    />
                  ) : (
                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3">
                      {items.map((c) => (
                        <CandidateCard
                          key={c.id}
                          candidate={c}
                          onPreview={handlePreviewClick}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}

              <PaginationBar
                page={page}
                totalPages={pagination.totalPages || 0}
                total={pagination.total ?? 0}
                limit={limit}
                loading={loading}
                onPageChange={setPage}
                onLimitChange={(n) => {
                  setLimit(n);
                  setPage(1);
                }}
              />
            </CardContent>
          </Card>
        </div>

        {/* Mobile / tablet filter drawer */}
        <Dialog open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
          <DialogContent className="!grid max-h-[88dvh] w-[min(100%,26rem)] grid-rows-[auto_minmax(0,1fr)_auto] gap-0 overflow-hidden rounded-2xl p-0 sm:max-w-md">
            <DialogHeader className="shrink-0 space-y-1 border-b bg-gradient-to-r from-emerald-50 to-white px-4 py-4 pr-12 text-left">
              <DialogTitle className="flex items-center gap-2 text-base font-bold">
                <SlidersHorizontal className="size-4 text-emerald-700" aria-hidden />
                Smart filters
                {filtersActiveCount > 0 ? (
                  <Badge className="border-emerald-200 bg-emerald-100 text-emerald-900 hover:bg-emerald-100">
                    {filtersActiveCount}
                  </Badge>
                ) : null}
              </DialogTitle>
              <DialogDescription className="text-xs font-medium text-slate-500">
                Narrow the pool with structured fields. Changes apply automatically.
              </DialogDescription>
            </DialogHeader>
            <div className="min-h-0 overflow-y-auto overscroll-contain px-4 py-4">
              <CandidateFiltersForm filters={filters} setFilters={setFilters} />
            </div>
            <DialogFooter className="shrink-0 flex-row justify-between gap-2 border-t bg-slate-50/80 p-3 sm:px-4">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={resetFilters}
                disabled={filtersActiveCount === 0}
              >
                Clear all
              </Button>
              <Button
                type="button"
                size="sm"
                className="bg-emerald-600 font-semibold hover:bg-emerald-700"
                onClick={() => setMobileFiltersOpen(false)}
              >
                Show {pagination.total ?? 0} results
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <CandidateProfileDialog
          candidate={selectedCandidate}
          open={openDialog}
          onOpenChange={setOpenDialog}
          onDeleted={() => {
            setSelectedCandidate(null);
            reload();
          }}
        />
      </WorkspacePage>
    </TooltipProvider>
  );
};

export default GetCandidate;
