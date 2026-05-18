import React from "react";
import { cn } from "@/lib/utils";

export default function CandidateAvatar({ name, className, size = "md" }) {
  const initials = String(name || "C")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/15 to-primary/5 font-semibold text-primary ring-1 ring-primary/15",
        size === "lg" ? "size-12 text-sm" : "size-10 text-sm",
        className
      )}
    >
      {initials || "C"}
    </span>
  );
}
