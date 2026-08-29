const STORAGE_KEY = "civicpulse_incidents";

export const storageService = {
  loadIncidents(defaultValue = []) {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return defaultValue;
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : defaultValue;
    } catch {
      return defaultValue;
    }
  },

  saveIncidents(incidents = []) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(incidents));
    } catch {
      // Ignore storage quota issues in private/offline contexts.
    }
  },

  clearIncidents() {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore.
    }
  }
};
