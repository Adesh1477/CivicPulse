/**
 * Frontend API Client for CivicPulse MVP Backend
 * Connects Citizen App, Authority Portal, and Heatmap to shared backend.
 */

export const apiClient = {
  /**
   * Health check
   */
  async getHealth() {
    const res = await fetch("/api/health");
    return res.json();
  },

  /**
   * AI Analysis
   */
  async analyzeImage({ image, selectedCategory, location, description }) {
    const res = await fetch("/api/analyze-image", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        image,
        selectedCategory,
        location,
        description
      })
    });
    if (!res.ok) {
      throw new Error(`AI Analysis failed with status ${res.status}`);
    }
    return res.json();
  },

  /**
   * Create Incident (Citizen Report Submission)
   */
  async createIncident(incidentData) {
    const res = await fetch("/api/incidents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(incidentData)
    });
    if (!res.ok) {
      throw new Error(`Failed to create incident: ${res.statusText}`);
    }
    return res.json();
  },

  /**
   * Get all incidents (Authority Portal)
   */
  async getIncidents(filters = {}) {
    const params = new URLSearchParams();
    if (filters.category && filters.category !== "All") params.set("category", filters.category);
    if (filters.status && filters.status !== "All") params.set("status", filters.status);

    const query = params.toString() ? `?${params.toString()}` : "";
    const res = await fetch(`/api/incidents${query}`);
    if (!res.ok) {
      throw new Error(`Failed to fetch incidents: ${res.status}`);
    }
    return res.json();
  },

  /**
   * Get single incident
   */
  async getIncident(ticketId) {
    const res = await fetch(`/api/incidents/${ticketId}`);
    if (!res.ok) {
      throw new Error(`Failed to fetch incident ${ticketId}`);
    }
    return res.json();
  },

  /**
   * Update Status (New -> In Progress -> Resolved)
   */
  async updateStatus(ticketId, status, resolutionNote = null) {
    const res = await fetch(`/api/incidents/${ticketId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, resolutionNote })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || err.message || `Failed to update status: ${res.status}`);
    }
    return res.json();
  },

  /**
   * Update Resolution (Note + Image)
   */
  async updateResolution(ticketId, { resolutionNote, resolutionImageUrl, markResolved = false }) {
    const res = await fetch(`/api/incidents/${ticketId}/resolution`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resolutionNote, resolutionImageUrl, markResolved })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || err.message || `Failed to update resolution: ${res.status}`);
    }
    return res.json();
  },

  /**
   * Submit Citizen Feedback Rating (1-5 stars)
   */
  async submitFeedback(ticketId, rating) {
    const res = await fetch(`/api/incidents/${ticketId}/feedback`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rating })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || err.message || `Failed to submit feedback: ${res.status}`);
    }
    return res.json();
  },

  /**
   * Reopen Incident (low satisfaction)
   */
  async reopenIncident(ticketId, reason = "Citizen requested reopening due to low satisfaction.") {
    const res = await fetch(`/api/incidents/${ticketId}/reopen`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || err.message || `Failed to reopen incident: ${res.status}`);
    }
    return res.json();
  },

  /**
   * Get Citizen Reports
   */
  async getCitizenReports() {
    const res = await fetch("/api/citizen/reports");
    if (!res.ok) {
      throw new Error(`Failed to fetch citizen reports: ${res.status}`);
    }
    return res.json();
  },

  /**
   * Get Heatmap Data
   */
  async getHeatmap() {
    const res = await fetch("/api/heatmap");
    if (!res.ok) {
      throw new Error(`Failed to fetch heatmap data: ${res.status}`);
    }
    return res.json();
  },

  /**
   * Delete Incident (Permanent Removal from Database)
   */
  async deleteIncident(ticketId) {
    const res = await fetch(`/api/incidents/${ticketId}`, {
      method: "DELETE"
    });
    if (!res.ok) {
      throw new Error(`Failed to delete incident: ${res.status}`);
    }
    return res.json();
  },

  /**
   * Reset Demo Database
   */
  async resetDemo() {
    const res = await fetch("/api/demo/reset", {
      method: "POST"
    });
    if (!res.ok) {
      throw new Error(`Failed to reset demo: ${res.status}`);
    }
    return res.json();
  }
};
