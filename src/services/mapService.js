/**
 * Map Service — Coordinates & Markers Generation from Shared CITY_LOCATIONS
 */

import { CITY_LOCATIONS, getLocationById, getLocationByAddress } from "../config/locations";

export const mapService = {
  /**
   * Generate individual point markers from real incidents using deterministic shared coordinates
   */
  getIndividualMarkers(incidents = []) {
    return incidents.map((inc) => {
      const loc = inc.locationId
        ? getLocationById(inc.locationId)
        : getLocationByAddress(inc.location || inc.address || inc.locationAddress);

      return {
        id: inc.id || inc.ticketId,
        type: inc.type || inc.category || "Pothole",
        category: inc.category || inc.finalCategory || "Pothole",
        status: inc.status || "New",
        reportCount: inc.reportCount || 1,
        priorityScore: typeof inc.priorityScore === "number" ? inc.priorityScore : ((inc.reportCount || 1) >= 5 ? 100 : (inc.reportCount || 1) === 4 ? 90 : (inc.reportCount || 1) === 3 ? 80 : (inc.reportCount || 1) === 2 ? 60 : 40),
        priorityLevel: inc.priorityLevel || (inc.priorityScore >= 80 ? "Critical" : inc.priorityScore >= 60 ? "High" : "Medium"),
        department: inc.recommendedDepartment || inc.department || "Road Maintenance Department",
        location: loc.address,
        area: loc.area,
        sector: loc.sector,
        latitude: loc.latitude,
        longitude: loc.longitude,
        x: loc.mapX,
        y: loc.mapY,
        landmark: loc.landmark
      };
    });
  },

  /**
   * Get all 15 City Sectors for map layout rendering
   */
  getSectors() {
    return CITY_LOCATIONS;
  }
};
