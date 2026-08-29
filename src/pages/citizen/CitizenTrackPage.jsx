import React, { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Search,
  CheckCircle2,
  Clock,
  Star,
  FileCheck,
  Plus,
  Trash2,
  RotateCcw
} from "lucide-react";
import { useIncidents } from "../../context/IncidentContext";
import StatusBadge from "../../components/common/StatusBadge";
import CivicImage from "../../components/common/CivicImage";

export default function CitizenTrackPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { incidents, getIncidentById, deleteIncident, submitFeedback, reopenIncident } = useIncidents();

  const [searchTicket, setSearchTicket] = useState(id || "");
  const [activeTicketId, setActiveTicketId] = useState(id || incidents[0]?.id || incidents[0]?.ticketId || "");
  const [selectedRating, setSelectedRating] = useState(0);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const currentIncident = getIncidentById(activeTicketId || id) || incidents[0] || null;

  const confirmDelete = () => {
    if (currentIncident) {
      const tid = currentIncident.id || currentIncident.ticketId;
      deleteIncident(tid);
      setShowDeleteModal(false);
      navigate("/citizen");
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <Link
          to="/citizen"
          className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          aria-label="Back"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-base font-extrabold text-slate-900">Track Issue Status</h1>
        <div className="w-5" />
      </div>

      {incidents.length === 0 ? (
        <div className="p-8 text-center bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
            <Clock className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-800">No reports submitted yet</h3>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            When you report a pothole, garbage, or streetlight defect, you can track real-time repairs here.
          </p>
          <div className="pt-2">
            <Link
              to="/citizen/report"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Report an Issue</span>
            </Link>
          </div>
        </div>
      ) : (
        <>
          {/* Ticket Search Bar */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchTicket}
              onChange={(e) => {
                setSearchTicket(e.target.value);
                const found = incidents.find((inc) =>
                  (inc.id || inc.ticketId || "").toLowerCase().includes(e.target.value.toLowerCase().trim())
                );
                if (found) {
                  setActiveTicketId(found.id || found.ticketId);
                  setSelectedRating(0);
                  setFeedbackSubmitted(false);
                }
              }}
              placeholder="Enter Report ID (e.g. CP-1281)..."
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-2xs"
            />
          </div>

          {/* Ticket List Quick Selector */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {incidents.map((inc) => {
              const tid = inc.id || inc.ticketId;
              const isSelected = (currentIncident?.id === tid || currentIncident?.ticketId === tid);
              return (
                <button
                  key={tid}
                  type="button"
                  onClick={() => {
                    setActiveTicketId(tid);
                    setSelectedRating(0);
                    setFeedbackSubmitted(false);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors border cursor-pointer ${
                    isSelected
                      ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                      : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  {tid} ({inc.type || inc.category})
                </button>
              );
            })}
          </div>

          {/* Active Ticket Card */}
          {currentIncident ? (
            <div className="space-y-4">
              <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
                {/* Header: Photo + ID + Status + Delete */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                      <CivicImage
                        src={currentIncident.image || currentIncident.imageUrl}
                        alt={currentIncident.type || currentIncident.category}
                        type={currentIncident.type || currentIncident.category}
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-extrabold text-blue-600 text-sm">
                          {currentIncident.id || currentIncident.ticketId}
                        </span>
                        <StatusBadge status={currentIncident.status} size="sm" />
                      </div>
                      <h3 className="text-sm font-bold text-slate-900 mt-0.5">
                        {currentIncident.type || currentIncident.category}
                      </h3>
                      <p className="text-[11px] text-slate-500 line-clamp-1">
                        {currentIncident.location || currentIncident.address}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowDeleteModal(true)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                    title="Delete Report"
                    aria-label="Delete Report"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Resolution Time & Department Box */}
                <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-100 flex items-center justify-between text-xs text-blue-900">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <span>
                      Est. Resolution: <strong>{currentIncident.estimatedResolutionTime || "2–3 Days"}</strong>
                    </span>
                  </div>
                  <span className="text-[11px] font-bold text-blue-700 bg-white px-2 py-0.5 rounded border border-blue-200">
                    {currentIncident.recommendedDepartment || currentIncident.department || "Municipal Operations"}
                  </span>
                </div>

                {/* Resolution Evidence Preview for Citizen */}
                {currentIncident.resolutionEvidence && (
                  <div className="p-3.5 bg-emerald-50/70 rounded-2xl border border-emerald-200 text-xs space-y-2.5">
                    <div className="flex items-center gap-1.5 font-bold text-emerald-950">
                      <FileCheck className="w-4 h-4 text-emerald-700" />
                      <span>Resolution Evidence Certified</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Before</span>
                        <div className="aspect-16/9 rounded-lg overflow-hidden bg-slate-100 border border-slate-200">
                          <img
                            src={currentIncident.resolutionEvidence.beforeImage || currentIncident.image || currentIncident.imageUrl}
                            alt="Before"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-emerald-700 block mb-1">After Repair</span>
                        <div className="aspect-16/9 rounded-lg overflow-hidden bg-slate-100 border-2 border-emerald-400">
                          <img
                            src={currentIncident.resolutionEvidence.afterImage}
                            alt="After"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-700 italic bg-white p-2 rounded-lg border border-emerald-100">
                      "{currentIncident.resolutionEvidence.note || currentIncident.resolutionNote || "Field repair completed."}"
                    </p>
                  </div>
                )}

                {/* Citizen Satisfaction Feedback & Reopen (ONLY shown after issue is Resolved) */}
                {(currentIncident.status === "Resolved" || currentIncident.statusCode === "RESOLVED") && (
                  <div className="p-4 bg-slate-50/90 rounded-2xl border border-slate-200 text-center space-y-3 shadow-2xs">
                    <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-emerald-800">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Issue Resolved ✓</span>
                    </div>

                    {currentIncident.citizenRating || feedbackSubmitted ? (
                      <div className="p-3 bg-white rounded-xl border border-emerald-200 text-center space-y-1.5">
                        <p className="text-xs font-bold text-emerald-900 flex items-center justify-center gap-1">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>Thank you for your feedback!</span>
                        </p>
                        <div className="flex items-center justify-center gap-1 text-amber-500">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-4 h-4 ${
                                (currentIncident.citizenRating || selectedRating) >= star
                                  ? "fill-amber-400 text-amber-400"
                                  : "text-slate-200 fill-slate-200"
                              }`}
                            />
                          ))}
                          <span className="text-xs font-bold text-slate-700 ml-1">
                            ({currentIncident.citizenRating || selectedRating}/5)
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div>
                          <h4 className="text-xs font-bold text-slate-800">
                            How satisfied are you with the resolution?
                          </h4>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            Rate the quality of work completed by the municipal crew.
                          </p>
                        </div>

                        {/* 5-Star Interactive Rating */}
                        <div className="flex items-center justify-center gap-1.5 py-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setSelectedRating(star)}
                              className="p-1 rounded-lg transition-transform hover:scale-125 cursor-pointer focus:outline-none"
                              title={`Rate ${star} star${star > 1 ? "s" : ""}`}
                              aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
                            >
                              <Star
                                className={`w-6 h-6 transition-colors ${
                                  selectedRating >= star
                                    ? "fill-amber-400 text-amber-400"
                                    : "text-slate-300 hover:text-amber-300"
                                }`}
                              />
                            </button>
                          ))}
                        </div>

                        {/* Low Rating (1-2 Stars): Reopen Option */}
                        {selectedRating > 0 && selectedRating <= 2 ? (
                          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-center space-y-2">
                            <p className="text-xs font-bold text-amber-950">
                              Not satisfied with the resolution?
                            </p>
                            <div className="flex items-center justify-center gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  reopenIncident(currentIncident.id || currentIncident.ticketId);
                                }}
                                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
                              >
                                <RotateCcw className="w-3.5 h-3.5" />
                                <span>Reopen Issue</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  submitFeedback(currentIncident.id || currentIncident.ticketId, selectedRating);
                                  setFeedbackSubmitted(true);
                                }}
                                className="px-3 py-2 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl border border-slate-300 transition-colors cursor-pointer"
                              >
                                Submit Rating Only
                              </button>
                            </div>
                          </div>
                        ) : (
                          /* Normal Rating (3-5 Stars): Submit Rating Button */
                          <div>
                            <button
                              type="button"
                              disabled={selectedRating === 0}
                              onClick={() => {
                                submitFeedback(currentIncident.id || currentIncident.ticketId, selectedRating);
                                setFeedbackSubmitted(true);
                              }}
                              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-extrabold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
                            >
                              Submit Rating
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
              <p className="text-xs text-slate-500">Ticket not found. Select an active report above.</p>
            </div>
          )}
        </>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && currentIncident && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-5 max-w-sm w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-extrabold text-slate-900">Delete this report?</h3>
              <p className="text-xs text-slate-500">
                This report (<span className="font-mono font-bold text-slate-700">{currentIncident.id || currentIncident.ticketId}</span>) will be permanently removed.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="py-2.5 px-3 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs transition-colors shadow-xs cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
