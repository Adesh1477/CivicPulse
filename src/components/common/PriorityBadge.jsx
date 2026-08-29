import React from "react";
import { Flame, Zap, AlertCircle } from "lucide-react";
import { getPriorityBadgeColor } from "../../utils/priority";

export default function PriorityBadge({
  level = "Medium",
  score = 40,
  reportCount = 1,
  showCount = false,
  size = "md"
}) {
  const badge = getPriorityBadgeColor(level, score);

  const sizeClasses = {
    sm: "px-2 py-0.5 text-[10px]",
    md: "px-2.5 py-1 text-xs",
    lg: "px-3 py-1.5 text-xs font-bold"
  }[size] || "px-2.5 py-1 text-xs";

  const renderIcon = () => {
    if (score >= 80 || (level || "").toLowerCase().includes("critical")) {
      return <Flame className="w-3 h-3 text-rose-500 fill-rose-500 shrink-0" />;
    }
    if (score >= 60 || (level || "").toLowerCase().includes("high")) {
      return <Zap className="w-3 h-3 text-amber-500 fill-amber-500 shrink-0" />;
    }
    return <AlertCircle className="w-3 h-3 text-blue-500 shrink-0" />;
  };

  return (
    <div className="inline-flex flex-col items-start gap-0.5">
      <span
        className={`inline-flex items-center gap-1.5 rounded-xl border font-extrabold tracking-tight ${badge.bg} ${badge.text} ${badge.border} ${sizeClasses} shadow-2xs`}
      >
        {renderIcon()}
        <span>{badge.label}</span>
        <span className="opacity-40">•</span>
        <span className="font-mono">{score}</span>
      </span>

      {showCount && (
        <span className="text-[10px] font-semibold text-slate-500 pl-0.5">
          {reportCount} {reportCount === 1 ? "report" : "citizen reports"}
        </span>
      )}
    </div>
  );
}
