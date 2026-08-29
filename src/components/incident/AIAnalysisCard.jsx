import React from "react";
import { Sparkles, Bot, CheckCircle2, AlertTriangle, Building2 } from "lucide-react";

export default function AIAnalysisCard({ incident }) {
  if (!incident) return null;

  const isMismatch = incident.categoryMismatch || (
    incident.selectedCategory &&
    incident.aiCategory &&
    incident.selectedCategory.toLowerCase() !== incident.aiCategory.toLowerCase()
  );

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4 text-xs">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
            AI
          </div>
          <h3 className="text-sm font-bold text-slate-900">AI Vision Verification</h3>
        </div>
      </div>

      {/* Verification Status Banner */}
      {isMismatch ? (
        <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-950 space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-amber-900">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>Category Mismatch Flagged</span>
          </div>
          <p className="text-[11px] text-amber-800">
            Citizen selected <strong>"{incident.selectedCategory}"</strong>, AI model classified <strong>"{incident.aiCategory || incident.type}"</strong>.
          </p>
        </div>
      ) : (
        <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center justify-between text-emerald-900">
          <div className="flex items-center gap-1.5 font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Category Verified: Matches visual evidence ({incident.type})</span>
          </div>
          <span className="font-bold text-[10px] bg-white text-emerald-700 px-2 py-0.5 rounded border border-emerald-200">
            ✓ Verified
          </span>
        </div>
      )}

      {/* Visual Description from Vision Model */}
      {(incident.observation || incident.aiObservation || incident.description) && (
        <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
            Vision Model Visual Observation
          </div>
          <p className="text-slate-800 font-medium leading-relaxed italic">
            "{incident.observation || incident.aiObservation || incident.description}"
          </p>
        </div>
      )}

      {/* Target Department Box */}
      <div className="bg-blue-50/70 border border-blue-200/80 rounded-xl p-3.5 flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
          <Bot className="w-4 h-4" />
        </div>
        <div className="space-y-1">
          <div className="font-bold uppercase tracking-wider text-blue-900 flex items-center gap-1.5 text-[11px]">
            <span>Recommended Department</span>
            <Sparkles className="w-3 h-3 text-blue-600" />
          </div>
          <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-blue-600" />
            <span>{incident.department || incident.recommendedDepartment || "General Civic Operations"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
