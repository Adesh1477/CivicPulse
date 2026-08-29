import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  AlertTriangle,
  Sparkles,
  CheckCircle2,
  Send,
  Loader2,
  Check,
  Building2,
  Clock,
  CheckCheck
} from "lucide-react";
import { useIncidents } from "../../context/IncidentContext";

const RESOLUTION_TIME_MAP = {
  Pothole: "2–3 Days",
  Garbage: "1–2 Days",
  Streetlight: "2–4 Days",
  "Open Drain": "2–3 Days",
  "Water Logging": "1–2 Days",
  Other: "3–5 Days"
};

const DEPARTMENT_MAP = {
  Pothole: "Road Maintenance Department",
  Garbage: "Sanitation Department",
  Streetlight: "Electrical Department",
  "Open Drain": "Drainage & Sewerage Department",
  "Water Logging": "Drainage & Sewerage Department",
  Other: "General Civic Operations"
};

const RECOMMENDATION_MAP = {
  Pothole: "Road inspection and repair recommended.",
  Garbage: "Sanitation pickup recommended.",
  Streetlight: "Electrical inspection and repair recommended.",
  "Open Drain": "Drainage inspection and cleaning recommended.",
  "Water Logging": "Drainage clearance recommended.",
  Other: "General municipal inspection recommended."
};

export default function CitizenAIAnalysisPage() {
  const navigate = useNavigate();
  const { citizenReport, submitCitizenReport, resolveCategoryMismatch } = useIncidents();
  const [analyzing, setAnalyzing] = useState(true);
  const [checklistStep, setChecklistStep] = useState(0);

  // Progressive verification checklist animation
  useEffect(() => {
    const t1 = setTimeout(() => setChecklistStep(1), 250);
    const t2 = setTimeout(() => setChecklistStep(2), 550);
    const t3 = setTimeout(() => setChecklistStep(3), 850);
    const t4 = setTimeout(() => setChecklistStep(4), 1150);
    const t5 = setTimeout(() => setAnalyzing(false), 1350);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
    };
  }, []);

  const analysis = citizenReport.aiAnalysis || {
    predictedType: citizenReport.type || "Pothole",
    selectedType: citizenReport.selectedType || citizenReport.type || "Pothole",
    categoryMismatch: false
  };

  const selectedCategory = citizenReport.type || analysis.selectedType || "Pothole";
  const predictedCategory = analysis.predictedType || selectedCategory;
  const isMismatch = (analysis.categoryMismatch || (analysis.selectedType && analysis.predictedType && analysis.selectedType.toLowerCase() !== analysis.predictedType.toLowerCase())) && !analysis.mismatchResolved;

  const currentCategory = citizenReport.type || selectedCategory;
  const estimatedTime = RESOLUTION_TIME_MAP[currentCategory] || "2–3 Days";
  const recommendedDept = DEPARTMENT_MAP[currentCategory] || analysis.recommendedDepartment || "Road Maintenance Department";
  const aiRecommendation = RECOMMENDATION_MAP[currentCategory] || "Standard civic inspection and resolution recommended.";

  const handleUseAiResult = () => {
    resolveCategoryMismatch(predictedCategory);
  };

  const handleKeepSelection = () => {
    resolveCategoryMismatch(selectedCategory);
  };

  const handleSubmit = async () => {
    await submitCitizenReport(citizenReport);
    navigate("/citizen/submitted");
  };

  return (
    <div className="space-y-5">
      {/* Header Row */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <Link
          to="/citizen/report"
          className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          aria-label="Back"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-base font-extrabold text-slate-900">AI Vision Verification</h1>
        <div className="w-5" />
      </div>

      {analyzing ? (
        <div className="py-12 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col items-center justify-center text-center space-y-5">
          <div className="w-16 h-16 rounded-3xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center">
            <Sparkles className="w-8 h-8 animate-spin" />
          </div>

          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-blue-600 block mb-1">
              Analyzing Photographic Evidence...
            </span>
            <h3 className="text-base font-extrabold text-slate-900">Visual Verification Pipeline</h3>
          </div>

          {/* Animated 4-Point Checklist */}
          <div className="w-full max-w-xs space-y-2.5 text-left text-xs bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <div className={`flex items-center gap-2.5 transition-all ${checklistStep >= 1 ? "text-emerald-700 font-bold" : "text-slate-400"}`}>
              {checklistStep >= 1 ? <Check className="w-4 h-4 text-emerald-600" /> : <Loader2 className="w-4 h-4 animate-spin text-slate-400" />}
              <span>Extracting visual features from photo...</span>
            </div>
            <div className={`flex items-center gap-2.5 transition-all ${checklistStep >= 2 ? "text-emerald-700 font-bold" : "text-slate-400"}`}>
              {checklistStep >= 2 ? <Check className="w-4 h-4 text-emerald-600" /> : <div className="w-4 h-4 rounded-full border border-slate-300" />}
              <span>Running civic defect classification model...</span>
            </div>
            <div className={`flex items-center gap-2.5 transition-all ${checklistStep >= 3 ? "text-emerald-700 font-bold" : "text-slate-400"}`}>
              {checklistStep >= 3 ? <Check className="w-4 h-4 text-emerald-600" /> : <div className="w-4 h-4 rounded-full border border-slate-300" />}
              <span>Verifying category alignment...</span>
            </div>
            <div className={`flex items-center gap-2.5 transition-all ${checklistStep >= 4 ? "text-emerald-700 font-bold" : "text-slate-400"}`}>
              {checklistStep >= 4 ? <Check className="w-4 h-4 text-emerald-600" /> : <div className="w-4 h-4 rounded-full border border-slate-300" />}
              <span>Determining municipal department routing...</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* Category Verification / Mismatch Banner */}
          {isMismatch ? (
            <div className="p-4 bg-amber-50 rounded-2xl border-2 border-amber-300 text-xs shadow-xs space-y-3">
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-extrabold text-amber-950 text-sm">
                    Category Mismatch Detected
                  </h4>
                  <p className="text-amber-900 mt-1 leading-snug">
                    You selected <strong className="font-extrabold text-amber-950 underline">{selectedCategory}</strong>, but AI detected <strong className="font-extrabold text-blue-900 underline">{predictedCategory}</strong>.
                  </p>
                </div>
              </div>

              {/* Action Buttons: Use AI Result vs Keep Selection */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleUseAiResult}
                  className="py-2.5 px-3 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-extrabold rounded-xl text-xs transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <CheckCheck className="w-4 h-4" />
                  <span>Use AI ({predictedCategory})</span>
                </button>

                <button
                  type="button"
                  onClick={handleKeepSelection}
                  className="py-2.5 px-3 bg-white hover:bg-slate-100 active:scale-95 text-slate-800 font-bold rounded-xl text-xs border border-slate-300 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Keep {selectedCategory}</span>
                </button>
              </div>
            </div>
          ) : (
            /* Category Match Verified Callout */
            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center justify-between text-xs text-emerald-900 shadow-2xs">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <span className="font-bold block text-emerald-950 text-sm">
                    Category Verified
                  </span>
                  <span className="text-emerald-800 text-xs">
                    Issue matches AI classification (<strong>{citizenReport.type}</strong>).
                  </span>
                </div>
              </div>
              <span className="font-bold text-xs bg-white text-emerald-700 px-2.5 py-1 rounded-lg border border-emerald-200 shrink-0 shadow-2xs">
                ✓ Matched
              </span>
            </div>
          )}

          {/* Section 1: Estimated Resolution Time */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Estimated Resolution Time
            </span>
            <div className="flex items-center gap-2 pt-0.5">
              <Clock className="w-4 h-4 text-blue-600" />
              <span className="text-base font-extrabold text-slate-900">{estimatedTime}</span>
            </div>
            <p className="text-[11px] text-slate-500 pt-0.5">
              Typical municipal response time for this type of issue.
            </p>
          </div>

          {/* Section 2: Recommended Department */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Recommended Department
            </span>
            <div className="flex items-center gap-2 pt-0.5">
              <Building2 className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-extrabold text-slate-900">{recommendedDept}</span>
            </div>
          </div>

          {/* Section 3: AI Recommendation */}
          <div className="p-4 bg-blue-50/80 border border-blue-200 rounded-2xl space-y-1 text-xs text-blue-900 shadow-2xs">
            <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[10px] text-blue-950">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>AI Recommendation</span>
            </div>
            <p className="text-xs font-medium text-blue-900 leading-snug pt-0.5">
              {aiRecommendation}
            </p>
          </div>

          {/* Primary Action Button */}
          <button
            type="button"
            onClick={handleSubmit}
            className="w-full py-4 px-5 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white rounded-2xl font-extrabold text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer mt-2"
          >
            <Send className="w-4 h-4" />
            <span>Submit Report</span>
          </button>
        </div>
      )}
    </div>
  );
}
