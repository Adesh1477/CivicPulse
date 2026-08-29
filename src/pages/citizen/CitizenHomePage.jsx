import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Plus,
  ChevronRight,
  Clock,
  Trash2,
  FileWarning,
  Check,
  ClipboardList
} from "lucide-react";
import { useIncidents } from "../../context/IncidentContext";
import StatusBadge from "../../components/common/StatusBadge";
import CivicImage from "../../components/common/CivicImage";
import citizenBanner from "../../assets/citizen-banner.png";

export default function CitizenHomePage() {
  const { incidents, deleteIncident } = useIncidents();
  const [reportToDelete, setReportToDelete] = useState(null);

  // Dynamic statistics calculated directly from real database incidents
  const newCount = incidents.filter(
    (i) => (i.status || "").toLowerCase() === "new" || i.statusCode === "NEW"
  ).length;

  const inProgressCount = incidents.filter(
    (i) => (i.status || "").toLowerCase().includes("progress") || i.statusCode === "IN_PROGRESS"
  ).length;

  const resolvedCount = incidents.filter(
    (i) => (i.status || "").toLowerCase().includes("resolve") || i.statusCode === "RESOLVED"
  ).length;

  const recentReports = incidents.slice(0, 5);

  const confirmDelete = () => {
    if (reportToDelete) {
      deleteIncident(reportToDelete.id || reportToDelete.ticketId);
      setReportToDelete(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* 1. Greeting Section */}
      <div className="pt-1 px-1 flex items-start justify-between">
        <div>
          <h1 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-1.5">
            <span>Hello, Citizen!</span>
            <span>👋</span>
          </h1>
          <p className="text-[11px] font-medium text-slate-500 mt-0.5">
            Let's make our city cleaner and safer together.
          </p>
        </div>

        {/* Subtle decorative birds in sky */}
        <div className="text-slate-300 text-xs select-none pr-1 pt-1 opacity-70">
          <svg className="w-6 h-3 text-slate-400" viewBox="0 0 24 12" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M2 7 C5 2, 8 2, 11 7 C14 2, 17 2, 20 7" strokeLinecap="round" />
          </svg>
        </div>
      </div>

      {/* 2. City Illustration Banner */}
      <div className="relative w-full rounded-2xl overflow-hidden bg-gradient-to-b from-blue-50/50 to-white select-none shadow-2xs">
        <img
          src={citizenBanner}
          alt="CivicPulse Connected Smart City"
          className="w-full h-auto object-cover max-h-36 block"
          loading="eager"
        />
      </div>

      {/* 3. Primary Action Button ("Report an Issue") */}
      <div className="-mt-7 relative z-10 px-1">
        <Link
          to="/citizen/report"
          className="w-full py-3.5 px-5 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 active:scale-[0.98] text-white rounded-2xl font-extrabold text-xs sm:text-sm flex items-center justify-between shadow-lg shadow-blue-600/30 transition-all group cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-full bg-white/25 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Plus className="w-4 h-4 stroke-[3]" />
            </div>
            <span>Report an Issue</span>
          </div>
          <ChevronRight className="w-4 h-4 text-white/80 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* 4. CITYWIDE ISSUE STATUS (Calculated from Real Database) */}
      <div className="bg-white rounded-3xl p-4 border border-slate-100 shadow-sm space-y-3">
        <h3 className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 px-0.5">
          Citywide Issue Status
        </h3>

        <div className="grid grid-cols-3 gap-2 text-center">
          {/* New Issues */}
          <div className="p-2.5 rounded-2xl bg-rose-50/90 border border-rose-100/80 flex flex-col items-center justify-center transition-transform hover:scale-[1.02]">
            <div className="w-7 h-7 rounded-xl bg-rose-500 text-white flex items-center justify-center mb-1.5 shadow-2xs">
              <FileWarning className="w-4 h-4" />
            </div>
            <div className="text-lg font-black text-rose-600 leading-tight">{newCount}</div>
            <div className="text-[10px] font-bold text-rose-700 mt-0.5">New Issues</div>
          </div>

          {/* In Progress */}
          <div className="p-2.5 rounded-2xl bg-amber-50/90 border border-amber-100/80 flex flex-col items-center justify-center transition-transform hover:scale-[1.02]">
            <div className="w-7 h-7 rounded-xl bg-amber-500 text-white flex items-center justify-center mb-1.5 shadow-2xs">
              <Clock className="w-4 h-4" />
            </div>
            <div className="text-lg font-black text-amber-600 leading-tight">{inProgressCount}</div>
            <div className="text-[10px] font-bold text-amber-700 mt-0.5">In Progress</div>
          </div>

          {/* Resolved */}
          <div className="p-2.5 rounded-2xl bg-emerald-50/90 border border-emerald-100/80 flex flex-col items-center justify-center transition-transform hover:scale-[1.02]">
            <div className="w-7 h-7 rounded-xl bg-emerald-500 text-white flex items-center justify-center mb-1.5 shadow-2xs">
              <Check className="w-4 h-4 stroke-[3]" />
            </div>
            <div className="text-lg font-black text-emerald-600 leading-tight">{resolvedCount}</div>
            <div className="text-[10px] font-bold text-emerald-700 mt-0.5">Resolved</div>
          </div>
        </div>
      </div>

      {/* 5. My Recent Reports Section */}
      <div className="space-y-2.5 pt-1">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xs sm:text-sm font-extrabold text-slate-900 tracking-tight">
            My Recent Reports
          </h2>
          <Link
            to="/citizen/track"
            className="text-[11px] font-bold text-blue-600 hover:text-blue-700 flex items-center gap-0.5 transition-colors cursor-pointer"
          >
            <span>View All</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentReports.length === 0 ? (
          /* High-Fidelity Empty State Card matching the reference */
          <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm text-center flex flex-col items-center justify-center space-y-2">
            <div className="relative w-16 h-16 rounded-full bg-blue-50/90 text-blue-600 flex items-center justify-center mx-auto ring-8 ring-blue-50/40">
              <ClipboardList className="w-8 h-8 text-blue-600" />
            </div>
            <div className="space-y-0.5 pt-1">
              <p className="text-xs font-extrabold text-slate-800">No reports yet.</p>
              <p className="text-[11px] text-slate-400 font-medium">
                Report a civic issue to get started.
              </p>
            </div>
          </div>
        ) : (
          /* List of Real Active Reports */
          <div className="space-y-2">
            {recentReports.map((report) => {
              const tid = report.id || report.ticketId;
              return (
                <div
                  key={tid}
                  className="flex items-center justify-between p-3 bg-white rounded-2xl border border-slate-100 shadow-2xs hover:shadow-xs hover:border-blue-200 transition-all group"
                >
                  <Link
                    to={`/citizen/track/${tid}`}
                    className="flex items-center gap-3 flex-1 min-w-0"
                  >
                    {/* Photo Thumbnail */}
                    <div className="w-11 h-11 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                      <CivicImage
                        src={report.image || report.imageUrl}
                        alt={report.type || report.category}
                        type={report.type || report.category}
                        className="group-hover:scale-105 transition-transform"
                      />
                    </div>

                    {/* Details */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                          {report.type || report.category}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono shrink-0">
                          ({tid})
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                        {report.location || report.address}
                      </p>
                    </div>
                  </Link>

                  {/* Status & Delete Action */}
                  <div className="flex items-center gap-2 shrink-0 pl-2">
                    <div className="text-right">
                      <StatusBadge status={report.status} size="sm" />
                    </div>
                    <button
                      type="button"
                      onClick={() => setReportToDelete(report)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="Delete Report"
                      aria-label="Delete Report"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {reportToDelete && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-5 max-w-xs w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-sm font-extrabold text-slate-900">Delete this report?</h3>
              <p className="text-xs text-slate-500">
                This report (<span className="font-mono font-bold text-slate-700">{reportToDelete.id || reportToDelete.ticketId}</span>) will be permanently removed.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => setReportToDelete(null)}
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
