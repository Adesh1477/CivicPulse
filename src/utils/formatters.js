// Formatting and style helper utilities for CivicPulse

export function getStatusBadgeColor(status) {
  const s = (status || "").toLowerCase();
  if (s.includes("resolved") || s.includes("closed")) {
    return {
      bg: "bg-emerald-50 text-emerald-800 border-emerald-200/80",
      text: "text-emerald-800",
      border: "border-emerald-200",
      dot: "bg-emerald-500",
      label: "Resolved"
    };
  }
  if (s.includes("reopen") || s.includes("attention")) {
    return {
      bg: "bg-rose-50 text-rose-800 border-rose-200/80",
      text: "text-rose-800",
      border: "border-rose-200",
      dot: "bg-rose-500 animate-pulse",
      label: "Reopened"
    };
  }
  if (s.includes("progress")) {
    return {
      bg: "bg-amber-50 text-amber-800 border-amber-200/80",
      text: "text-amber-800",
      border: "border-amber-200",
      dot: "bg-amber-500 animate-pulse",
      label: "In Progress"
    };
  }
  return {
    bg: "bg-blue-50 text-blue-800 border-blue-200/80",
    text: "text-blue-800",
    border: "border-blue-200",
    dot: "bg-blue-600",
    label: "New"
  };
}

export function formatDate(dateString) {
  if (!dateString) return "Recently";
  return dateString;
}
