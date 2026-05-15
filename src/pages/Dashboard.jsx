import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { FileSpreadsheet, FileUp, Mail, Sparkles, UserRound } from "lucide-react";
import { getCandidates } from "../api/candidate";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Spinner } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";

export default function Dashboard() {
  const user = useSelector((state) => state.auth.user) || {};
  const navigate = useNavigate();

  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCandidates = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getCandidates();
      setCandidates(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Unable to fetch candidates.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-card/50 p-12 text-muted-foreground">
        <Spinner className="size-8 text-primary" />
        <p className="text-sm font-medium">Loading your pipeline…</p>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive/40 bg-destructive/5">
        <CardHeader>
          <CardTitle className="text-destructive">Something went wrong</CardTitle>
          <CardDescription>{error}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button type="button" variant="outline" onClick={fetchCandidates}>
            Try again
          </Button>
        </CardContent>
      </Card>
    );
  }

  const withEmail = candidates.filter((c) => c.email).length;
  const withResume = candidates.filter((c) => c.resumeText).length;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/50 px-3 py-1 text-xs font-medium text-muted-foreground">
            <Sparkles className="size-3.5 text-primary" aria-hidden />
            Recruiting overview
          </div>
          <h2 className="text-3xl font-semibold tracking-tight text-foreground">
            Welcome back
            {user?.email ? (
              <span className="block text-lg font-normal text-muted-foreground">
                {user.email}
              </span>
            ) : null}
          </h2>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            className="gap-2 shadow-sm"
            onClick={() => navigate("/candidate/upload-pdf")}
          >
            <FileUp className="size-4" />
            Upload resumes
          </Button>
          <Button
            type="button"
            variant="outline"
            className="gap-2 bg-background"
            onClick={() => navigate("/candidate/upload-csv")}
          >
            <FileSpreadsheet className="size-4" />
            Upload CSV
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Total candidates"
          value={candidates.length}
          hint="In your workspace"
          icon={UserRound}
        />
        <StatCard
          title="With email"
          value={withEmail}
          hint="Reachable contacts"
          icon={Mail}
        />
        <StatCard
          title="Parsed resumes"
          value={withResume}
          hint="Text extracted for matching"
          icon={FileUp}
        />
      </div>

      <Card className="overflow-hidden shadow-sm">
        <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-4 border-b bg-muted/30 pb-6">
          <div className="space-y-1">
            <CardTitle>Recent candidates</CardTitle>
            <CardDescription>
              Latest profiles synced from uploads and imports.
            </CardDescription>
          </div>
          <Button
            type="button"
            variant="ghost"
            className="shrink-0 text-primary hover:text-primary"
            onClick={() => navigate("/dashboard/candidates")}
          >
            View all
          </Button>
        </CardHeader>
        <CardContent className="pt-6">
          {candidates.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border bg-muted/20 px-6 py-12 text-center">
              <p className="font-medium text-foreground">No candidates yet</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Upload resumes or a CSV to populate your talent pool.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-2">
                <Button type="button" onClick={() => navigate("/candidate/upload-pdf")}>
                  Upload resumes
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/candidate/upload-csv")}
                >
                  Upload CSV
                </Button>
              </div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead className="hidden sm:table-cell">Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {candidates.slice(0, 5).map((candidate) => (
                  <TableRow key={candidate.id}>
                    <TableCell className="font-medium">
                      {candidate.name || "Unnamed"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {candidate.email ? (
                        candidate.email
                      ) : (
                        <Badge variant="outline" className="font-normal">
                          Missing
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="hidden text-muted-foreground sm:table-cell">
                      {candidate.createdAt
                        ? format(new Date(candidate.createdAt), "MMM d, yyyy · HH:mm")
                        : "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({ title, value, hint, icon: Icon }) {
  return (
    <Card className="relative overflow-hidden border-border/80 shadow-sm transition-shadow hover:shadow-md">
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
        {hint ? (
          <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
        ) : null}
      </CardContent>
    </Card>
  );
}
