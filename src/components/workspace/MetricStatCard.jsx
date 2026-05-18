import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { STAT_TONES } from "@/lib/stat-tones";

export default function MetricStatCard({
  title,
  value,
  hint,
  icon: Icon,
  variant = "default",
  tone = "primary",
  className,
}) {
  const palette = STAT_TONES[tone] || STAT_TONES.primary;

  if (variant === "compact") {
    return (
      <Card
        className={cn(
          "overflow-hidden border shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md",
          palette.card,
          className
        )}
      >
        <CardContent className="flex items-center gap-3 p-4">
          <span
            className={cn(
              "flex size-11 shrink-0 items-center justify-center rounded-xl",
              palette.icon
            )}
          >
            <Icon className="size-5" aria-hidden />
          </span>
          <div className="min-w-0">
            <p className={cn("text-2xl font-bold tracking-tight tabular-nums", palette.value)}>
              {value ?? "—"}
            </p>
            <p className={cn("truncate text-xs font-semibold", palette.label)}>{title}</p>
            {hint ? (
              <p className={cn("truncate text-[11px] font-medium", palette.hint)}>{hint}</p>
            ) : null}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className={cn(
        "relative overflow-hidden border shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md",
        palette.card,
        className
      )}
    >
      <div
        className={cn(
          "pointer-events-none absolute -right-8 -top-8 size-28 rounded-full blur-2xl",
          palette.glow
        )}
        aria-hidden
      />
      <CardHeader className="relative flex flex-row items-start justify-between space-y-0 pb-2">
        <CardTitle className={cn("text-sm font-bold", palette.label)}>{title}</CardTitle>
        <span className={cn("flex size-10 items-center justify-center rounded-xl", palette.icon)}>
          <Icon className="size-4" aria-hidden />
        </span>
      </CardHeader>
      <CardContent className="relative">
        <p className={cn("text-3xl font-bold tracking-tight tabular-nums", palette.value)}>
          {value ?? "—"}
        </p>
        {hint ? <p className={cn("mt-1 text-xs font-medium", palette.hint)}>{hint}</p> : null}
      </CardContent>
    </Card>
  );
}
