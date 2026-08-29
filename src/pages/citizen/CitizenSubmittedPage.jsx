import React, { useEffect } from "react";
import { CheckCircle2, Copy } from "lucide-react";
import confetti from "canvas-confetti";
import { useIncidents } from "../../context/IncidentContext";

export default function CitizenSubmittedPage() {
  const { citizenReport, addToast } = useIncidents();

  const reportId = citizenReport.submittedId || citizenReport.ticketId || "CP-1281";

  // Trigger celebration confetti on mount
  useEffect(() => {
    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 }
      });
    } catch (e) {
      console.log("Confetti trigger", e);
    }
  }, []);

  const handleCopyId = () => {
    navigator.clipboard?.writeText?.(reportId);
    addToast({
      type: "success",
      title: "Copied ID",
      message: `Report ID ${reportId} copied to clipboard.`
    });
  };

  return (
    <div className="py-6 animate-in fade-in zoom-in-95 duration-200">
      {/* Thank You Confirmation Card */}
      <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-xs flex flex-col items-center text-center">
        <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3.5 ring-8 ring-emerald-50/50">
          <CheckCircle2 className="w-9 h-9" />
        </div>

        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Thank You!</h1>
        <p className="text-xs text-slate-500 mt-1.5 max-w-xs leading-relaxed">
          Your report has been submitted and verified by AI successfully.
        </p>

        {/* Report ID Copy Badge */}
        <div className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-50 border border-slate-200">
          <span className="text-xs text-slate-500 font-medium">Report ID:</span>
          <span className="font-mono font-extrabold text-blue-600 text-sm">{reportId}</span>
          <button
            type="button"
            onClick={handleCopyId}
            className="p-1 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
            title="Copy Report ID"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
