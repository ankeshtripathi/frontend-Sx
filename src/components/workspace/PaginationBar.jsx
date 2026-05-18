import React from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";

export default function PaginationBar({
  page,
  totalPages,
  total,
  limit,
  loading,
  onPageChange,
  onLimitChange,
  summary,
}) {
  const safeTotalPages = Math.max(1, totalPages || 1);

  return (
    <div className="flex flex-col gap-3 border-t border-border/60 bg-muted/25 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="text-sm text-muted-foreground">
        {summary ?? (
          <>
            Page <span className="font-medium text-foreground">{page}</span> of{" "}
            <span className="font-medium text-foreground">{safeTotalPages}</span>
            {total != null ? (
              <>
                {" "}
                · <span className="font-medium text-foreground">{total}</span> total
              </>
            ) : null}
          </>
        )}
        {loading ? (
          <Loader2 className="ml-2 inline size-3.5 animate-spin align-middle" aria-hidden />
        ) : null}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Rows</span>
          <Select value={String(limit)} onValueChange={(v) => onLimitChange(Number(v))}>
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
          className="h-9"
          disabled={page <= 1 || loading}
          onClick={() => onPageChange(Math.max(1, page - 1))}
        >
          Prev
        </Button>
        <Button
          type="button"
          variant="outline"
          className="h-9"
          disabled={page >= safeTotalPages || loading}
          onClick={() => onPageChange(Math.min(safeTotalPages, page + 1))}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
