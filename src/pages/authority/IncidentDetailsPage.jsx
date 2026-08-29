import React, { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  MapPin,
  CheckCircle2,
  Wrench,
  Building2,
  Trash2,
  Camera,
  Upload
} from "lucide-react";
import { useIncidents } from "../../context/IncidentContext";
import StatusBadge from "../../components/common/StatusBadge";
import PriorityBadge from "../../components/common/PriorityBadge";
import AIAnalysisCard from "../../components/incident/AIAnalysisCard";
import AssignDepartmentModal from "../../components/incident/AssignDepartmentModal";
import ResolutionEvidenceModal from "../../components/incident/ResolutionEvidenceModal";
import CivicImage from "../../components/common/CivicImage";

export default function IncidentDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    getIncidentById,
    updateIncidentStatus,
    submitResolutionEvidence,
    approveResolution,
    deleteIncident
  } = useIncidents();
  
  const incident = getIncidentById(id);

  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showResolutionModal, setShowResolutionModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  if (!incident) {
    return (
      <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
        <h2 className="text-xl font-bold text-slate-800">Report Not Found</h2>
        <Link to="/authority" className="mt-4 inline-block text-blue-600 font-bold text-xs">
          ← Back to Incidents List
        </Link>
      </div>
    );
  }

  const hasResolutionPhoto = Boolean(
    incident.resolutionImageUrl ||
    incident.resolutionPhoto ||
    incident.resolutionEvidence?.afterImage
  );

  const handleStatusChange = (newStatus) => {
    updateIncidentStatus(incident.id, newStatus);
  };

  const handleApproveResolution = () => {
    if (!hasResolutionPhoto) {
      setShowResolutionModal(true);
      return;
    }
    approveResolution(incident.id, incident.resolutionNote || "Resolution certified with photographic proof by Municipal Authority");
  };

  const reportCount = incident.reportCount || 1;
  const priorityScore = typeof incident.priorityScore === "number"
    ? incident.priorityScore
    : (reportCount >= 5 ? 100 : reportCount === 4 ? 90 : reportCount === 3 ? 80 : reportCount === 2 ? 60 : 40);
  const priorityLevel = incident.priorityLevel || (priorityScore >= 80 ? "Critical" : priorityScore >= 60 ? "High" : "Medium");

  const isResolved = incident.status === "Resolved" || incident.statusCode === "RESOLVED";
  const isInProgress = (incident.status || "").toLowerCase().includes("progress") || incident.statusCode === "IN_PROGRESS";
  const isNew = incident.status === "New" || incident.statusCode === "NEW";

  return (
    <div className="space-y-6">
      {/* Top Header Row with Direct Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
        <div className="flex items-start gap-3">
          <button
            type="button"
            onClick={() => navigate("/authority")}
            className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors shrink-0 mt-0.5 cursor-pointer"
            aria-label="Back"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <Link to="/authority" className="text-xs font-semibold text-slate-400 hover:text-slate-600">
                Incidents
              </Link>
              <span className="text-xs text-slate-300">/</span>
              <span className="text-xs font-bold text-slate-600">{incident.id}</span>
            </div>
            <div className="flex items-center gap-3 mt-1 flex-wrap">
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                {incident.type} — {incident.id}
              </h1>
              <StatusBadge status={incident.status} />
              {Boolean(incident.citizenRating || incident.rating) && (
                <span className="inline-flex items-center gap-1 text-xs font-extrabold text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full shadow-2xs">
                  ★ Citizen Rating: {incident.citizenRating || incident.rating}/5
                </span>
              )}
              <PriorityBadge
                level={priorityLevel}
                score={priorityScore}
                reportCount={reportCount}
                showCount={true}
                size="md"
              />
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Reported on {incident.reportedDate} • Location: {incident.location}
            </p>
          </div>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setShowAssignModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-2xs transition-colors cursor-pointer"
          >
            <Building2 className="w-3.5 h-3.5 text-blue-600" />
            <span>Assign Department</span>
          </button>

          {/* Status is New or Reopened -> Show "Mark In Progress" */}
          {(isNew || incident.status === "Reopened" || incident.statusCode === "REOPENED") && (
            <button
              type="button"
              onClick={() => handleStatusChange("In Progress")}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-extrabold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Wrench className="w-3.5 h-3.5" />
              <span>Mark "In Progress"</span>
            </button>
          )}

          {/* Status is In Progress -> Photo-Based Workflow Actions */}
          {isInProgress && (
            <>
              {hasResolutionPhoto ? (
                <>
                  <button
                    type="button"
                    onClick={() => setShowResolutionModal(true)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-2xs transition-colors cursor-pointer"
                  >
                    <Camera className="w-3.5 h-3.5 text-blue-600" />
                    <span>Update Photo</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleApproveResolution}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-extrabold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Mark Resolved</span>
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowResolutionModal(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-extrabold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Upload Resolution Photo</span>
                </button>
              )}
            </>
          )}

          <button
            type="button"
            onClick={() => setShowDeleteModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-colors cursor-pointer"
            title="Delete Incident"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete</span>
          </button>
        </div>
      </div>

      {/* 2-Column Clean Simplified Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Left Column: Uploaded Photographic Evidence (BEFORE) & Location */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                BEFORE: Uploaded Photographic Evidence
              </h3>
              <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                Citizen Photo
              </span>
            </div>
            
            <div className="relative aspect-4/3 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shadow-inner">
              <CivicImage
                src={incident.image || incident.imageUrl}
                alt={incident.type}
                type={incident.type}
                aspectRatio="aspect-4/3"
              />
              <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-slate-900/80 text-white text-[10px] font-extrabold uppercase tracking-wider backdrop-blur-xs">
                {incident.type}
              </div>
            </div>

            {/* Location & Address */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-slate-900">
                <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>{incident.location}</span>
              </div>
              <p className="text-slate-500 text-[11px] pl-5">{incident.address || incident.location}</p>
            </div>
          </div>
        </div>

        {/* Right Column: AI Vision Verification + AFTER Resolution Evidence */}
        <div className="space-y-6">
          {/* AI Vision Verification Card */}
          <AIAnalysisCard incident={incident} />

          {/* Resolution Evidence Card (AFTER) */}
          {isResolved ? (
            <div className="bg-emerald-50/70 rounded-2xl p-5 border-2 border-emerald-300 shadow-xs space-y-3.5">
              <div className="flex items-center justify-between pb-2 border-b border-emerald-200">
                <div className="flex items-center gap-1.5 font-extrabold text-emerald-950 text-xs uppercase tracking-wider">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>AFTER: Resolution Evidence</span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white text-emerald-800 border border-emerald-300">
                  ✓ Verified & Resolved
                </span>
              </div>

              <div className="aspect-16/9 rounded-xl overflow-hidden bg-slate-100 border border-emerald-400 relative shadow-inner">
                <img
                  src={incident.resolutionImageUrl || incident.resolutionPhoto || incident.resolutionEvidence?.afterImage}
                  alt="Resolution proof"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-emerald-600 text-white text-[10px] font-extrabold shadow-xs">
                  ✓ Certified Proof
                </div>
              </div>

              <div className="p-3 bg-white rounded-xl border border-emerald-200 text-xs">
                <span className="font-bold text-slate-500 uppercase text-[10px] block mb-0.5">
                  Resolution Summary:
                </span>
                <p className="text-slate-800 font-medium leading-relaxed">
                  "{incident.resolutionEvidence?.note || incident.resolutionNote || "Field repair completed and verified by municipal authority."}"
                </p>
              </div>
            </div>
          ) : isInProgress ? (
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-3.5">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  AFTER: Resolution Evidence
                </h3>
                {hasResolutionPhoto ? (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                    ✓ Photo Attached
                  </span>
                ) : (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                    Photo Required
                  </span>
                )}
              </div>

              {hasResolutionPhoto ? (
                <div className="space-y-3">
                  <div className="aspect-16/9 rounded-xl overflow-hidden bg-slate-100 border border-emerald-300 relative shadow-inner">
                    <img
                      src={incident.resolutionImageUrl || incident.resolutionPhoto || incident.resolutionEvidence?.afterImage}
                      alt="After resolution"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-emerald-600 text-white text-[10px] font-extrabold shadow-xs">
                      ✓ Ready
                    </div>
                  </div>
                  <p className="text-xs text-emerald-800 font-semibold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Photo uploaded successfully.</span>
                  </p>
                  <div className="flex items-center justify-between gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowResolutionModal(true)}
                      className="px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors cursor-pointer"
                    >
                      Change Photo
                    </button>
                    <button
                      type="button"
                      onClick={handleApproveResolution}
                      className="px-4 py-1.5 text-xs font-extrabold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Mark as Resolved</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-slate-50 border border-dashed border-slate-300 text-center space-y-2.5">
                  <Camera className="w-7 h-7 text-slate-400 mx-auto" />
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-slate-700">No after-resolution photo uploaded.</p>
                    <p className="text-[11px] text-slate-500">
                      Resolution photo is required before this incident can be resolved.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowResolutionModal(true)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-extrabold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Resolution Photo</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-2 text-xs">
              <h3 className="font-bold uppercase tracking-wider text-slate-400 text-[11px]">
                AFTER: Resolution Evidence
              </h3>
              <p className="text-slate-500 text-[11px]">
                Resolution photo proof will be required from field staff once work begins.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Assign Department Modal */}
      <AssignDepartmentModal
        isOpen={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        incident={incident}
      />

      {/* Resolution Evidence Modal */}
      <ResolutionEvidenceModal
        isOpen={showResolutionModal}
        onClose={() => setShowResolutionModal(false)}
        incident={incident}
        onSubmit={(evidence) => {
          submitResolutionEvidence(incident.id, evidence);
        }}
      />

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-extrabold text-slate-900">Delete Incident?</h3>
              <p className="text-xs text-slate-500">
                This incident (<span className="font-mono font-bold text-slate-700">{incident.id}</span>) will be permanently removed from CivicPulse.
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
                onClick={() => {
                  deleteIncident(incident.id);
                  setShowDeleteModal(false);
                  navigate("/authority");
                }}
                className="py-2.5 px-3 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs transition-colors shadow-xs cursor-pointer"
              >
                Delete Incident
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
