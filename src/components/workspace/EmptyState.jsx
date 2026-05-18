import React from "react";
import { cn } from "@/lib/utils";

export default function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}) {
  return (
    <div className={cn("mx-auto flex max-w-sm flex-col items-center py-16 text-center", className)}>
      <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/10">
        <Icon className="size-7" aria-hidden />
      </div>
      <p className="mt-4 font-medium text-foreground">{title}</p>
      {description ? (
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      ) : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
