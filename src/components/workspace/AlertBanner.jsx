import React from "react";
import { cn } from "@/lib/utils";

export default function AlertBanner({ children, variant = "error", className }) {
  return (
    <div
      role={variant === "error" ? "alert" : "status"}
      className={cn(
        "rounded-xl border px-4 py-3 text-sm",
        variant === "error"
          ? "border-destructive/30 bg-destructive/10 text-destructive"
          : "border-border bg-muted/50 text-muted-foreground",
        className
      )}
    >
      {children}
    </div>
  );
}
