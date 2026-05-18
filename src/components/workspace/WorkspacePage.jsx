import React from "react";
import { cn } from "@/lib/utils";

export default function WorkspacePage({ children, className }) {
  return <div className={cn("space-y-6", className)}>{children}</div>;
}
