import React, { useState } from "react";
import toast from "react-hot-toast";
import InfoItem from "@/components/InfoItem";
import CandidateAvatar from "@/components/workspace/CandidateAvatar";
import { formatDate, getSkills } from "@/lib/candidate-format";
import { deleteCandidate } from "@/api/candidate";
import { getApiErrorMessage } from "@/api/axios";
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
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  BriefcaseBusiness,
  CheckCircle2,
  Loader2,
  Mail,
  MapPin,
  Trash2,
} from "lucide-react";

export default function CandidateProfileDialog({
  candidate,
  open,
  onOpenChange,
  onDeleted,
  showDelete = true,
}) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!candidate?.id || deleting) return;
    setDeleting(true);
    try {
      await deleteCandidate(candidate.id);
      toast.success("Candidate deleted");
      setConfirmOpen(false);
      onOpenChange(false);
      onDeleted?.(candidate.id);
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Failed to delete candidate"));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-5xl gap-0 overflow-hidden rounded-2xl p-0">
          <DialogHeader className="sr-only">
            <DialogTitle>Candidate profile</DialogTitle>
          </DialogHeader>

          {candidate ? (
            <div className="flex max-h-[85vh] flex-col">
              <div className="relative overflow-hidden bg-slate-950 p-6 text-white">
                <div
                  className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.35),transparent_36%)]"
                  aria-hidden
                />
                <div className="relative flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                  <div className="flex items-center gap-4">
                    <CandidateAvatar name={candidate.name} size="lg" />
                    <div>
                      <h2 className="text-2xl font-semibold tracking-tight">
                        {candidate.name || "Unnamed candidate"}
                      </h2>
                      <p className="mt-1 text-sm text-white/75">
                        {candidate.currentDesignation || "Designation not added"} ·{" "}
                        {candidate.currentCompany || "Company not added"}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {candidate.resumeUrl ? (
                      <Button className="bg-white text-slate-950 hover:bg-white/90" asChild>
                        <a href={candidate.resumeUrl} target="_blank" rel="noreferrer">
                          View resume
                        </a>
                      </Button>
                    ) : null}
                    {showDelete ? (
                      <Button
                        type="button"
                        variant="outline"
                        className="border-red-300/60 bg-red-500/10 text-red-100 hover:bg-red-500/20 hover:text-white"
                        onClick={() => setConfirmOpen(true)}
                      >
                        <Trash2 className="size-4" aria-hidden />
                        Delete
                      </Button>
                    ) : null}
                  </div>
                </div>
              </div>

              <ScrollArea className="min-h-0 flex-1 bg-muted/30">
                <div className="space-y-5 p-5 sm:p-6">
                  <div className="grid gap-4 md:grid-cols-3">
                    <ProfileHighlight icon={Mail} label="Email" value={candidate.email} />
                    <ProfileHighlight
                      icon={BriefcaseBusiness}
                      label="Experience"
                      value={
                        candidate.totalExperienceYears
                          ? `${candidate.totalExperienceYears} yrs`
                          : "—"
                      }
                    />
                    <ProfileHighlight
                      icon={MapPin}
                      label="Location"
                      value={candidate.currentLocation}
                    />
                  </div>

                  <div className="grid gap-4 lg:grid-cols-2">
                    <DetailCard title="Basic details">
                      <InfoItem label="Phone" value={candidate.phone} />
                      <InfoItem label="Department" value={candidate.department} />
                      <InfoItem label="Industry" value={candidate.industry} />
                      <InfoItem label="Qualification" value={candidate.qualification} />
                    </DetailCard>
                    <DetailCard title="Compensation">
                      <InfoItem label="Current salary" value={candidate.currentSalary} />
                      <InfoItem label="Expected salary" value={candidate.expectedSalary} />
                      <InfoItem label="Created" value={formatDate(candidate.createdAt)} />
                      <InfoItem label="Candidate ID" value={candidate.id} />
                    </DetailCard>
                  </div>

                  <DetailCard title="Location preferences" cols={3}>
                    <InfoItem label="Current" value={candidate.currentLocation} />
                    <InfoItem label="Preferred" value={candidate.preferredLocation} />
                    <InfoItem
                      label="Hometown"
                      value={[candidate.hometown, candidate.pincode].filter(Boolean).join(" · ")}
                    />
                  </DetailCard>

                  <Card className="border-border/70 shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-base">Skills</CardTitle>
                      <CardDescription>Parsed from resume and profile data.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {getSkills(candidate.skills).length ? (
                          getSkills(candidate.skills).map((skill) => (
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
          ) : null}
        </DialogContent>
      </Dialog>

      {showDelete ? (
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete candidate?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes{" "}
              <span className="font-semibold text-foreground">
                {candidate?.name || "this candidate"}
              </span>{" "}
              from your talent pool. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleting}
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
            >
              {deleting ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                  Deleting…
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      ) : null}
    </>
  );
}

function ProfileHighlight({ icon: Icon, label, value }) {
  return (
    <Card className="border-border/70 shadow-sm">
      <CardContent className="flex items-center gap-3 p-4">
        <Icon className="size-5 shrink-0 text-primary" aria-hidden />
        <InfoItem label={label} value={value} />
      </CardContent>
    </Card>
  );
}

function DetailCard({ title, children, cols = 2 }) {
  return (
    <Card className="border-border/70 shadow-sm">
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent
        className={
          cols === 3 ? "grid gap-4 md:grid-cols-3" : "grid gap-4 sm:grid-cols-2"
        }
      >
        {children}
      </CardContent>
    </Card>
  );
}
