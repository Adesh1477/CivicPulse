import React, { createContext, useContext, useState, useEffect } from "react";
import { INITIAL_INCIDENTS } from "../data/mockIncidents";
import { storageService } from "../services/storageService";
import { incidentService } from "../services/incidentService";
import { aiService } from "../services/aiService";
import { apiClient } from "../services/apiClient";
import AppLoadingScreen from "../components/common/AppLoadingScreen";

const IncidentContext = createContext(null);

export function IncidentProvider({ children }) {
  // App Initial Loading Screen State
  const [isAppLoading, setIsAppLoading] = useState(true);

  // Central Incidents State
  const [incidents, setIncidents] = useState(() => {
    return storageService.loadIncidents(INITIAL_INCIDENTS);
  });

  // Active Toast notification queue
  const [toasts, setToasts] = useState([]);

  // Citizen Report in-progress wizard state
  const [citizenReport, setCitizenReport] = useState({
    type: "Pothole",
    selectedType: "Pothole",
    description: "",
    location: "MG Road, Sector 4",
    address: "MG Road, Sector 4",
    image: null,
    aiAnalysis: null,
    submittedId: null
  });

  // Fetch initial incidents from Backend API on mount
  useEffect(() => {
    async function loadBackendData() {
      try {
        const backendIncidents = await apiClient.getIncidents();
        if (Array.isArray(backendIncidents)) {
          setIncidents(backendIncidents);
          storageService.saveIncidents(backendIncidents);
        }
      } catch (err) {
        console.warn("[IncidentContext] Backend API unreachable on mount, using local store:", err.message);
      } finally {
        // Smooth transition out of loading screen
        setTimeout(() => {
          setIsAppLoading(false);
        }, 600);
      }
    }
    loadBackendData();
  }, []);

  // Sync to Storage Service on state changes
  useEffect(() => {
    storageService.saveIncidents(incidents);
  }, [incidents]);

  // Toast System
  const addToast = ({ type = "info", title = "", message = "" }) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 6);
    const newToast = { id, type, title, message };
    setToasts((prev) => [...prev, newToast]);

    setTimeout(() => {
      removeToast(id);
    }, 5000);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Get single incident by ID
  const getIncidentById = (id) => {
    return incidents.find(i => i.id === id || i.ticketId === id) || incidents[0] || null;
  };

  // Resolve Category Mismatch (Citizen choices: Use AI / Keep Selection)
  const resolveCategoryMismatch = (chosenType) => {
    const isOverride = chosenType !== citizenReport.aiAnalysis?.predictedType;
    const deptRec = aiService.recommendDepartment(chosenType);

    setCitizenReport((prev) => ({
      ...prev,
      type: chosenType,
      selectedCategory: prev.selectedType || prev.type,
      finalCategory: chosenType,
      userOverride: isOverride,
      aiAnalysis: prev.aiAnalysis
        ? {
            ...prev.aiAnalysis,
            resolvedType: chosenType,
            finalCategory: chosenType,
            recommendedDepartment: deptRec.department,
            aiRecommendation: deptRec.recommendation,
            mismatchResolved: true
          }
        : null
    }));

    addToast({
      type: isOverride ? "warning" : "info",
      title: isOverride ? "Manual Selection Kept" : "AI Category Applied",
      message: isOverride ? `Kept "${chosenType}".` : `Issue set to "${chosenType}".`
    });
  };

  // Submit Citizen Report (Connected to Backend POST /api/incidents)
  const submitCitizenReport = async (reportData) => {
    const payload = {
      selectedCategory: reportData.selectedType || reportData.type || "Pothole",
      finalCategory: reportData.type || reportData.selectedType || "Pothole",
      aiCategory: reportData.aiAnalysis?.predictedType || reportData.type || "Pothole",
      imageUrl: reportData.image,
      image: reportData.image,
      locationAddress: reportData.location || "MG Road, Sector 4",
      location: reportData.location || "MG Road, Sector 4",
      aiConfidence: reportData.aiAnalysis?.confidence || 0.91,
      aiObservation: reportData.aiAnalysis?.description || "Visible defect identified in photographic evidence."
    };

    let newIncident;
    try {
      newIncident = await apiClient.createIncident(payload);
    } catch (err) {
      console.warn("[IncidentContext] Backend submission error, using local fallback:", err.message);
      newIncident = incidentService.createIncident(reportData, incidents);
    }

    setIncidents((prev) => {
      const filtered = prev.filter(i => (i.id !== newIncident.id && i.ticketId !== newIncident.id && i.id !== newIncident.ticketId && i.ticketId !== newIncident.ticketId));
      const updated = [newIncident, ...filtered];
      return updated.sort((a, b) => {
        const scoreDiff = (b.priorityScore || 40) - (a.priorityScore || 40);
        if (scoreDiff !== 0) return scoreDiff;
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      });
    });

    setCitizenReport((prev) => ({
      ...prev,
      submittedId: newIncident.id || newIncident.ticketId,
      aiAnalysis: { ...newIncident }
    }));

    const count = newIncident.reportCount || 1;
    addToast({
      type: "success",
      title: count > 1 ? "Report Added to Active Issue" : "Report Submitted",
      message: count > 1
        ? `Report ${newIncident.id || newIncident.ticketId} updated with ${count} citizen reports (Priority: ${newIncident.priorityLevel || "High"}).`
        : `Report ${newIncident.id || newIncident.ticketId} logged successfully.`
    });

    return newIncident;
  };

  // Update Incident Status (Connected to Backend PATCH /api/incidents/:ticketId/status)
  const updateIncidentStatus = async (incidentId, newStatus, resolutionNote = null) => {
    const normStatus = newStatus === "NEW" ? "New" : newStatus === "IN_PROGRESS" ? "In Progress" : newStatus === "RESOLVED" ? "Resolved" : newStatus;

    // Strict Rule: Cannot mark as Resolved without after-resolution photo
    if (normStatus === "Resolved") {
      const targetInc = incidents.find(i => i.id === incidentId || i.ticketId === incidentId);
      if (targetInc && !targetInc.resolutionImageUrl && !targetInc.resolutionPhoto && !targetInc.resolutionEvidence?.afterImage) {
        addToast({
          type: "error",
          title: "Resolution Photo Required",
          message: "Upload an after-resolution photo before marking this incident as resolved."
        });
        return false;
      }
    }

    setIncidents((prev) =>
      prev.map((inc) => {
        if (inc.id !== incidentId && inc.ticketId !== incidentId) return inc;
        return {
          ...inc,
          status: normStatus,
          statusCode: normStatus.toUpperCase().replace(/\s+/g, "_"),
          resolutionNote: resolutionNote || inc.resolutionNote
        };
      })
    );

    try {
      const serverStatus = newStatus.toUpperCase().replace(/\s+/g, "_");
      await apiClient.updateStatus(incidentId, serverStatus, resolutionNote);
    } catch (err) {
      console.warn(`[IncidentContext] Backend status update error for ${incidentId}:`, err.message);
      addToast({
        type: "error",
        title: "Status Update Failed",
        message: err.message || "Failed to update status."
      });
      return false;
    }

    addToast({
      type: normStatus === "Resolved" ? "success" : "info",
      title: `Status: ${normStatus}`,
      message: `Report ${incidentId} marked as ${normStatus}.`
    });
    return true;
  };

  // Assign Incident Department
  const assignIncident = (incidentId, { department, officer, note }) => {
    setIncidents((prev) =>
      incidentService.assignIncident(prev, incidentId, { department, officer, note })
    );

    updateIncidentStatus(incidentId, "In Progress");

    addToast({
      type: "info",
      title: "Department Assigned",
      message: `Report ${incidentId} assigned to ${department}.`
    });
  };

  // Submit Resolution Evidence (Photo Proof)
  const submitResolutionEvidence = async (incidentId, { beforeImage, afterImage, note, markResolved = false }) => {
    const evidence = {
      beforeImage,
      afterImage: afterImage || null,
      note: note || "Field repairs executed to standard specifications."
    };

    const newStatus = markResolved ? "Resolved" : "In Progress";
    const newStatusCode = markResolved ? "RESOLVED" : "IN_PROGRESS";

    setIncidents((prev) =>
      prev.map((inc) => {
        if (inc.id !== incidentId && inc.ticketId !== incidentId) return inc;
        return {
          ...inc,
          status: newStatus,
          statusCode: newStatusCode,
          resolutionPhoto: evidence.afterImage,
          resolutionImageUrl: evidence.afterImage,
          resolutionNote: evidence.note,
          resolutionEvidence: evidence
        };
      })
    );

    try {
      await apiClient.updateResolution(incidentId, {
        resolutionNote: evidence.note,
        resolutionImageUrl: evidence.afterImage,
        markResolved
      });
    } catch (err) {
      console.warn(`[IncidentContext] Backend resolution update error for ${incidentId}:`, err.message);
    }

    addToast({
      type: "success",
      title: markResolved ? "Resolution Certified" : "Resolution Photo Uploaded",
      message: markResolved
        ? `Report ${incidentId} marked as Resolved.`
        : `Photo proof saved for ${incidentId}. Ready to be marked as Resolved.`
    });
  };

  // Approve Resolution
  const approveResolution = (incidentId, note = "Resolution certified by Municipal Authority") => {
    updateIncidentStatus(incidentId, "Resolved", note);
  };

  // Delete Incident (Permanent Removal from Database & State)
  const deleteIncident = async (incidentId) => {
    setIncidents((prev) => prev.filter((inc) => inc.id !== incidentId && inc.ticketId !== incidentId));

    try {
      await apiClient.deleteIncident(incidentId);
    } catch (err) {
      console.warn(`[IncidentContext] Backend delete error for ${incidentId}:`, err.message);
    }

    addToast({
      type: "info",
      title: "Report Deleted",
      message: "Report deleted successfully."
    });
  };

  // Submit Feedback Rating (1-5 stars)
  const submitFeedback = async (incidentId, rating) => {
    const numRating = parseInt(rating, 10) || 5;

    setIncidents((prev) =>
      prev.map((inc) => {
        if (inc.id !== incidentId && inc.ticketId !== incidentId) return inc;
        return {
          ...inc,
          citizenRating: numRating,
          rating: numRating,
          feedbackSubmitted: true
        };
      })
    );

    try {
      await apiClient.submitFeedback(incidentId, numRating);
    } catch (err) {
      console.warn(`[IncidentContext] Backend feedback error for ${incidentId}:`, err.message);
    }

    addToast({
      type: "success",
      title: "Feedback Recorded",
      message: `Thank you for your feedback!`
    });
  };

  // Reopen Incident
  const reopenIncident = async (incidentId, reason = "Citizen requested reopening due to low satisfaction.") => {
    setIncidents((prev) =>
      prev.map((inc) => {
        if (inc.id !== incidentId && inc.ticketId !== incidentId) return inc;
        return {
          ...inc,
          status: "Reopened",
          statusCode: "REOPENED",
          isReopened: true,
          resolutionPhoto: null,
          resolutionImageUrl: null,
          resolutionEvidence: null,
          resolvedAt: null,
          citizenRating: null,
          rating: null,
          feedbackSubmitted: false,
          resolutionNote: reason
        };
      })
    );

    try {
      await apiClient.reopenIncident(incidentId, reason);
    } catch (err) {
      console.warn(`[IncidentContext] Backend reopen error for ${incidentId}:`, err.message);
    }

    addToast({
      type: "info",
      title: "Issue Reopened",
      message: `Report ${incidentId} reopened and returned to Authority Portal.`
    });
  };

  // Internal reset
  const resetAllData = async () => {
    try {
      const res = await apiClient.resetDemo();
      if (res && res.incidents) {
        setIncidents(res.incidents);
        storageService.saveIncidents(res.incidents);
      } else {
        setIncidents([]);
        storageService.saveIncidents([]);
      }
    } catch (err) {
      setIncidents([]);
      storageService.saveIncidents([]);
    }
  };

  const value = {
    incidents,
    toasts,
    citizenReport,
    setCitizenReport,
    addToast,
    removeToast,
    getIncidentById,
    submitCitizenReport,
    resolveCategoryMismatch,
    assignIncident,
    updateIncidentStatus,
    submitResolutionEvidence,
    approveResolution,
    submitFeedback,
    reopenIncident,
    deleteIncident,
    resetAllData
  };

  return (
    <IncidentContext.Provider value={value}>
      <AppLoadingScreen isLoading={isAppLoading} />
      {children}
    </IncidentContext.Provider>
  );
}

export function useIncidents() {
  const context = useContext(IncidentContext);
  if (!context) {
    throw new Error("useIncidents must be used within an IncidentProvider");
  }
  return context;
}
