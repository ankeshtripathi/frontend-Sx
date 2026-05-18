import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { PANEL_ACCENTS } from "@/lib/stat-tones";

export default function ContentPanel({
  title,
  description,
  icon: Icon,
  actions,
  children,
  className,
  contentClassName,
  noPadding,
  accent = "primary",
}) {
  const palette = PANEL_ACCENTS[accent] || PANEL_ACCENTS.primary;

  return (
    <Card
      className={cn(
        "overflow-hidden border-slate-200/90 bg-white py-0 shadow-md shadow-slate-200/50",
        className
      )}
    >
      {(title || description || actions) && (
        <CardHeader
          className={cn(
            "border-b border-slate-200/80 px-4 py-4 sm:px-6",
            "border-l-4",
            palette.bar,
            palette.header
          )}
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              {title ? (
                <CardTitle
                  className={cn(
                    "flex items-center gap-2.5 text-lg font-bold sm:text-xl",
                    palette.title
                  )}
                >
                  {Icon ? (
                    <span
                      className={cn(
                        "flex size-9 items-center justify-center rounded-lg bg-white shadow-sm ring-1 ring-slate-200/80",
                        palette.icon
                      )}
                    >
                      <Icon className="size-5" aria-hidden />
                    </span>
                  ) : null}
                  {title}
                </CardTitle>
              ) : null}
              {description ? (
                <CardDescription className="mt-1.5 text-sm font-medium text-slate-600">
                  {description}
                </CardDescription>
              ) : null}
            </div>
            {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
          </div>
        </CardHeader>
      )}
      <CardContent
        className={cn(
          noPadding ? "p-0" : "space-y-4 bg-slate-50/40 p-4 sm:p-6",
          contentClassName
        )}
      >
        {children}
      </CardContent>
    </Card>
  );
}
