/**
 * Priority Scoring & Display Utility for CivicPulse
 * 
 * Deterministic Priority Scoring based ONLY on:
 * 1. Number of citizen reports for the SAME issue category
 * 2. At the SAME location
 * 
 * Scoring rules:
 * - 1 report  = 40 points  = Medium
 * - 2 reports = 60 points  = High
 * - 3 reports = 80 points  = Critical
 * - 4 reports = 90 points  = Critical
 * - 5+ reports = 100 points = Critical (Capped at 100)
 */

export function calculatePriority(reportCount = 1) {
  const count = Math.max(1, parseInt(reportCount, 10) || 1);
  let priorityScore = 40;
  let priorityLevel = "Medium";

  if (count === 1) {
    priorityScore = 40;
    priorityLevel = "Medium";
  } else if (count === 2) {
    priorityScore = 60;
    priorityLevel = "High";
  } else if (count === 3) {
    priorityScore = 80;
    priorityLevel = "Critical";
  } else if (count === 4) {
    priorityScore = 90;
    priorityLevel = "Critical";
  } else if (count >= 5) {
    priorityScore = 100;
    priorityLevel = "Critical";
  }

  // Capped at 100
  priorityScore = Math.min(100, priorityScore);

  return {
    reportCount: count,
    priorityScore,
    priorityLevel
  };
}

/**
 * Returns Tailwind color tokens for Priority Badges
 */
export function getPriorityBadgeColor(level = "Medium", score = 40) {
  const normLevel = (level || "").toLowerCase();

  if (normLevel.includes("critical") || score >= 80) {
    return {
      bg: "bg-rose-50/90",
      text: "text-rose-700",
      border: "border-rose-200",
      dot: "bg-rose-500",
      ring: "ring-rose-100",
      iconColor: "text-rose-600",
      icon: "🔥",
      label: "Critical"
    };
  }

  if (normLevel.includes("high") || score >= 60) {
    return {
      bg: "bg-amber-50/90",
      text: "text-amber-800",
      border: "border-amber-200",
      dot: "bg-amber-500",
      ring: "ring-amber-100",
      iconColor: "text-amber-600",
      icon: "⚡",
      label: "High"
    };
  }

  return {
    bg: "bg-blue-50/90",
    text: "text-blue-800",
    border: "border-blue-200",
    dot: "bg-blue-500",
    ring: "ring-blue-100",
    iconColor: "text-blue-600",
    icon: "🔷",
    label: "Medium"
  };
}
