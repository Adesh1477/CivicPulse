/**
 * CivicPulse Priority Engine
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

  // Maximum cap of 100
  priorityScore = Math.min(100, priorityScore);

  return {
    reportCount: count,
    priorityScore,
    priorityLevel
  };
}
