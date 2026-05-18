import React, { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Mail,
  Send,
  Users,
  UserCheck,
  AlertCircle,
} from "lucide-react";

/** High-contrast checkboxes for JD match selection (default shadcn boxes are too faint on tables). */
export const MATCH_SELECT_CHECKBOX_CLASS = cn(
  "size-[18px] rounded-[5px] border-2 border-slate-500 bg-white shadow-sm",
  "ring-1 ring-slate-300/90",
  "hover:border-slate-700 hover:bg-slate-50",
  "data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-white",
  "data-[state=checked]:ring-primary/30",
  "[&_[data-slot=checkbox-indicator]_svg]:size-4 [&_[data-slot=checkbox-indicator]_svg]:stroke-[3]",
  "focus-visible:border-primary focus-visible:ring-primary/40",
);

export function getMatchRowId(row, idx) {
  return row?.candidate?.id || `match-row-${idx}`;
}

export function buildRecipientList(results, selectedIds, scope) {
  const rows = Array.isArray(results) ? results : [];
  const selectedSet = new Set(selectedIds || []);

  const pool =
    scope === "selected"
      ? rows.filter((row, idx) => selectedSet.has(getMatchRowId(row, idx)))
      : rows;

  const withEmail = [];
  const withoutEmail = [];

  pool.forEach((row, idx) => {
    const c = row.candidate || {};
    const id = getMatchRowId(row, idx);
    const entry = {
      id,
      name: c.name || "Unnamed",
      email: c.email?.trim() || "",
    };
    if (entry.email) withEmail.push(entry);
    else withoutEmail.push(entry);
  });

  return { withEmail, withoutEmail };
}

export function JdMatchEmailToolbar({
  results,
  selectedIds,
  onSelectedIdsChange,
  onCompose,
  className,
}) {
  const rows = Array.isArray(results) ? results : [];
  const allIds = rows.map((row, idx) => getMatchRowId(row, idx));
  const selectedSet = new Set(selectedIds);
  const allSelected =
    allIds.length > 0 && allIds.every((id) => selectedSet.has(id));
  const someSelected = selectedIds.length > 0;

  const { withEmail: allWithEmail } = buildRecipientList(results, [], "all");
  const { withEmail: selectedWithEmail } = buildRecipientList(
    results,
    selectedIds,
    "selected",
  );

  const toggleAll = (checked) => {
    onSelectedIdsChange(checked ? allIds : []);
  };

  if (!rows.length) return null;

  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-xl border border-sky-200/80 bg-gradient-to-r from-sky-50/90 to-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
    >
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <Checkbox
            id="match-select-all"
            className={MATCH_SELECT_CHECKBOX_CLASS}
            checked={allSelected}
            onCheckedChange={(v) => toggleAll(v === true)}
            aria-label="Select all matched candidates"
          />
          <Label
            htmlFor="match-select-all"
            className="cursor-pointer text-sm font-semibold text-slate-800"
          >
            Select all ({rows.length})
          </Label>
        </div>
        {someSelected ? (
          <Badge variant="secondary" className="font-normal">
            {selectedIds.length} selected
          </Badge>
        ) : null}
        <span className="text-xs text-slate-500">
          {allWithEmail.length} with email on file
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-2"
          disabled={!allWithEmail.length}
          onClick={() => onCompose("all")}
        >
          <Users className="size-4" aria-hidden />
          Email all ({allWithEmail.length})
        </Button>
        <Button
          type="button"
          size="sm"
          className="gap-2 font-semibold"
          disabled={!selectedWithEmail.length}
          onClick={() => onCompose("selected")}
        >
          <Mail className="size-4" aria-hidden />
          Email selected ({selectedWithEmail.length})
        </Button>
      </div>
    </div>
  );
}

export function JdMatchEmailComposeDialog({
  open,
  onOpenChange,
  results,
  selectedIds,
  scope,
  jobTitle,
}) {
  const [body, setBody] = useState("");

  const { withEmail, withoutEmail } = useMemo(
    () => buildRecipientList(results, selectedIds, scope),
    [results, selectedIds, scope],
  );

  const handleOpenChange = (next) => {
    if (!next) {
      setBody("");
    }
    onOpenChange(next);
  };

  const handleSend = () => {
    if (!withEmail.length) {
      toast.error("No recipients with an email address");
      return;
    }
    if (!body.trim()) {
      toast.error("Add a message");
      return;
    }
    toast.success(
      `Email queued for ${withEmail.length} recipient${withEmail.length === 1 ? "" : "s"} (sending coming soon)`,
    );
    handleOpenChange(false);
  };

  const scopeLabel =
    scope === "selected" ? "Selected matched candidates" : "All matched candidates";

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90dvh] gap-0 overflow-hidden p-0 sm:max-w-lg">
        <DialogHeader className="border-b bg-muted/30 px-5 py-4 text-left">
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Send className="size-5 text-primary" aria-hidden />
            Compose outreach email
          </DialogTitle>
          <DialogDescription>
            {scopeLabel}
            {jobTitle ? ` · ${jobTitle}` : ""}. Write the message body only — each recipient&apos;s
            name and other details will be added automatically from their profile.
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[min(60dvh,520px)] space-y-4 overflow-y-auto px-5 py-4">
          <div className="rounded-xl border border-slate-200/80 bg-slate-50/80 px-3 py-2.5">
            <p className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <UserCheck className="size-4 text-emerald-600" aria-hidden />
              {withEmail.length} recipient{withEmail.length === 1 ? "" : "s"}
            </p>
            {withEmail.length > 0 ? (
              <ul className="mt-2 max-h-28 space-y-1 overflow-y-auto text-xs text-slate-600">
                {withEmail.map((r) => (
                  <li key={r.id} className="truncate font-medium text-slate-700">
                    {r.email}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-1 text-xs text-slate-500">No valid email addresses in this group.</p>
            )}
            {withoutEmail.length > 0 ? (
              <p className="mt-2 flex items-start gap-1.5 text-xs text-amber-700">
                <AlertCircle className="mt-0.5 size-3.5 shrink-0" aria-hidden />
                {withoutEmail.length} candidate{withoutEmail.length === 1 ? "" : "s"} skipped
                (no email on file).
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="outreach-body">Email body</Label>
            <Textarea
              id="outreach-body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="We reviewed your profile against an open role and would like to connect to discuss next steps…"
              className="min-h-[180px] resize-y text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Greeting, candidate name, and signature will be added automatically when the email
              is sent.
            </p>
          </div>
        </div>

        <DialogFooter className="border-t bg-muted/20 px-5 py-4 sm:justify-between">
          <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          <Button
            type="button"
            className="gap-2 font-semibold"
            disabled={!withEmail.length}
            onClick={handleSend}
          >
            <Send className="size-4" aria-hidden />
            Send email
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/** Checkbox cell + helpers for match results tables/cards */
export function MatchRowCheckbox({ rowId, selectedIds, onToggle }) {
  const checked = selectedIds.includes(rowId);
  return (
    <Checkbox
      className={MATCH_SELECT_CHECKBOX_CLASS}
      checked={checked}
      onCheckedChange={(v) => onToggle(rowId, v === true)}
      aria-label="Select candidate for email"
      onClick={(e) => e.stopPropagation()}
    />
  );
}
