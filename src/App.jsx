import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import WelcomePage from "./pages/welcome/WelcomePage";
import CitizenHomePage from "./pages/citizen/CitizenHomePage";
import CitizenReportPage from "./pages/citizen/CitizenReportPage";
import CitizenAIAnalysisPage from "./pages/citizen/CitizenAIAnalysisPage";
import CitizenSubmittedPage from "./pages/citizen/CitizenSubmittedPage";
import CitizenTrackPage from "./pages/citizen/CitizenTrackPage";
import IncidentsPage from "./pages/authority/IncidentsPage";
import IncidentDetailsPage from "./pages/authority/IncidentDetailsPage";
import { useIncidents } from "./context/IncidentContext";

export default function App() {
  const { toasts, removeToast } = useIncidents();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <Routes>
        <Route path="/" element={<WelcomePage />} />
        <Route path="/citizen" element={<CitizenHomePage />} />
        <Route path="/citizen/report" element={<CitizenReportPage />} />
        <Route path="/citizen/ai-analysis" element={<CitizenAIAnalysisPage />} />
        <Route path="/citizen/submitted" element={<CitizenSubmittedPage />} />
        <Route path="/citizen/track" element={<CitizenTrackPage />} />
        <Route path="/citizen/track/:id" element={<CitizenTrackPage />} />
        <Route path="/authority" element={<IncidentsPage />} />
        <Route path="/authority/incidents" element={<IncidentsPage />} />
        <Route path="/authority/incidents/:id" element={<IncidentDetailsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {toasts.length > 0 && (
        <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className="min-w-[240px] max-w-[320px] rounded-xl border border-slate-200 bg-white p-3 shadow-lg"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-bold text-slate-900">{toast.title}</div>
                  {toast.message && (
                    <div className="mt-1 text-xs text-slate-600">{toast.message}</div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => removeToast(toast.id)}
                  className="text-slate-400 hover:text-slate-700"
                  aria-label="Dismiss notification"
                >
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
