/**
 * Incident Service — Incident Lifecycle Helpers
 */

import { aiService, DEPARTMENT_MAP, RESOLUTION_TIME_MAP } from "./aiService.js";
import { calculatePriority } from "../utils/priority.js";

export const incidentService = {
  /**
   * Find an incident by ID
   */
  getIncidentById(incidents = [], id) {
    if (!id) return incidents[0] || null;
    return incidents.find((inc) => inc.id === id || inc.ticketId === id) || incidents[0] || null;
  },

  /**
   * Create or update incident from citizen report (local fallback)
   */
  createIncident(reportData, existingIncidents = []) {
    const category = reportData.type || reportData.selectedType || "Pothole";
    const location = reportData.location || reportData.locationAddress || "MG Road, Sector 4";
    const normCat = category.trim().toUpperCase();
    const normLoc = location.trim().toUpperCase();

    // Check if an active matching incident already exists for same category & location
    const existing = existingIncidents.find(
      (inc) =>
        (inc.type?.trim().toUpperCase() === normCat || inc.category?.trim().toUpperCase() === normCat) &&
        (inc.location?.trim().toUpperCase() === normLoc || inc.locationAddress?.trim().toUpperCase() === normLoc) &&
        (inc.status || "").toUpperCase() !== "RESOLVED"
    );

    if (existing) {
      const nextCount = (existing.reportCount || 1) + 1;
      const { priorityScore, priorityLevel } = calculatePriority(nextCount);
      return {
        ...existing,
        reportCount: nextCount,
        priorityScore,
        priorityLevel,
        priority: {
          score: priorityScore,
          level: priorityLevel,
          count: nextCount
        },
        updatedAt: new Date().toISOString()
      };
    }

    const currentMax = existingIncidents.reduce((max, inc) => {
      const match = inc.id?.match(/CP-(\d+)/);
      if (match) {
        const num = parseInt(match[1], 10);
        return num > max ? num : max;
      }
      return max;
    }, 1280);

    const newId = `CP-${currentMax + 1}`;
    const department = DEPARTMENT_MAP[category] || "Road Maintenance Department";
    const now = new Date();
    const { priorityScore, priorityLevel } = calculatePriority(1);

    return {
      id: newId,
      ticketId: newId,
      type: category,
      category,
      selectedCategory: reportData.selectedType || category,
      finalCategory: category,
      image: reportData.image,
      imageUrl: reportData.image,
      location,
      locationAddress: location,
      department,
      recommendedDepartment: department,
      assignedDepartment: department,
      reportCount: 1,
      priorityScore,
      priorityLevel,
      priority: {
        score: priorityScore,
        level: priorityLevel,
        count: 1
      },
      status: "New",
      statusCode: "NEW",
      createdAt: now.toISOString(),
      reportedDate: now.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      estimatedResolutionTime: RESOLUTION_TIME_MAP[category] || "2–3 Days",
      timeline: [
        { step: "Reported", time: "Logged", desc: "Citizen reported the issue", done: true, current: false },
        { step: "AI Verified", time: "Verified", desc: `AI classified ${category}`, done: true, current: true },
        { step: "Assigned", time: "Pending", desc: `Assigned to ${department}`, done: false, current: false },
        { step: "In Progress", time: "Pending", desc: "Field crew active on-site", done: false, current: false },
        { step: "Resolved", time: "Pending", desc: "Repair certified & closed by municipal authority", done: false, current: false }
      ]
    };
  },

  /**
   * Assign Incident Department
   */
  assignIncident(incidents, incidentId, { department, officer, note }) {
    return incidents.map((inc) => {
      if (inc.id !== incidentId && inc.ticketId !== incidentId) return inc;
      return {
        ...inc,
        department: department || inc.department,
        assignedDepartment: department || inc.assignedDepartment,
        status: "In Progress",
        statusCode: "IN_PROGRESS"
      };
    });
  }
};
