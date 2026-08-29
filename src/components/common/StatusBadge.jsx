import React from "react";
import { getStatusBadgeColor } from "../../utils/formatters";

export default function StatusBadge({ status, size = "md" }) {
  const palette = getStatusBadgeColor(status);
  const sizeClass = {
    sm: "px-2 py-0.5 text-[10px]",
    md: "px-2.5 py-1 text-[11px]",
    lg: "px-3 py-1.5 text-xs"
  }[size] || "px-2.5 py-1 text-[11px]";

  return (
    <span className={`inline-flex items-center gap-1 rounded-full border ${palette.bg} ${sizeClass}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${palette.dot}`} />
      <span className="font-bold uppercase tracking-[0.08em]">{palette.label}</span>
    </span>
  );
}
