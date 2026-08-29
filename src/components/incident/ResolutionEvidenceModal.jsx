import React, { useState, useRef } from "react";
import { Camera, Upload, CheckCircle2 } from "lucide-react";
import Modal from "../common/Modal";

export default function ResolutionEvidenceModal({ isOpen, onClose, incident, onSubmit }) {
  const [afterImage, setAfterImage] = useState(
    incident?.resolutionImageUrl || incident?.resolutionPhoto || null
  );
  const [resolutionNote, setResolutionNote] = useState(
    incident?.resolutionNote || "Field repair completed and verified by municipal crew."
  );
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  if (!isOpen || !incident) return null;

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setAfterImage(event.target.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveOnly = (e) => {
    e.preventDefault();
    if (!afterImage) return;
    setSubmitting(true);
    setTimeout(() => {
      onSubmit({
        beforeImage: incident.image || incident.imageUrl,
        afterImage,
        note: resolutionNote,
        markResolved: false
      });
      setSubmitting(false);
      onClose();
    }, 300);
  };

  const handleSaveAndResolve = (e) => {
    e.preventDefault();
    if (!afterImage) return;
    setSubmitting(true);
    setTimeout(() => {
      onSubmit({
        beforeImage: incident.image || incident.imageUrl,
        afterImage,
        note: resolutionNote,
        markResolved: true
      });
      setSubmitting(false);
      onClose();
    }, 300);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Upload Resolution Proof — ${incident.id}`} size="lg">
      <div className="space-y-4">
        <p className="text-xs text-slate-600 font-medium">
          Upload a photo showing the civic issue after the work has been completed.
        </p>

        {/* Before vs After Comparison Preview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Before Photo */}
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              1. Before (Citizen Evidence)
            </span>
            <div className="aspect-16/9 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shadow-inner">
              <img src={incident.image || incident.imageUrl} alt="Before repair" className="w-full h-full object-cover" />
            </div>
          </div>

          {/* After Photo Preview / Upload Placeholder */}
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
              2. After-Resolution Photo <span className="text-rose-500">*</span>
            </span>

            {afterImage ? (
              <div className="aspect-16/9 rounded-xl overflow-hidden bg-slate-100 border-2 border-emerald-400 relative shadow-inner group">
                <img src={afterImage} alt="After repair" className="w-full h-full object-cover" />
                <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-emerald-600 text-white text-[10px] font-extrabold shadow-xs flex items-center gap-1">
                  <span>✓ Ready</span>
                </div>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                >
                  <span className="px-3 py-1.5 bg-white rounded-lg text-xs font-bold text-slate-900 shadow-md flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5 text-blue-600" />
                    <span>Change Photo</span>
                  </span>
                </div>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="aspect-16/9 rounded-xl bg-slate-50/80 hover:bg-blue-50/40 border-2 border-dashed border-blue-300 hover:border-blue-500 transition-all flex flex-col items-center justify-center p-4 text-center group cursor-pointer shadow-2xs hover:shadow-xs select-none"
                title="Click to choose a resolution photo from your device"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-100/80 flex items-center justify-center mb-1.5 group-hover:scale-110 group-hover:bg-blue-100 transition-all shadow-2xs">
                  <Camera className="w-5 h-5" />
                </div>
                <p className="text-xs font-extrabold text-blue-700 group-hover:text-blue-800 transition-colors mb-0.5">
                  Upload Resolved Image
                </p>
                <p className="text-[10px] text-slate-500 font-medium leading-tight max-w-[210px]">
                  Upload a photo showing the issue after the work has been completed.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Upload Custom Trigger */}
        <div className="flex items-center justify-between pt-0.5">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/*"
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors cursor-pointer border border-blue-200"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>{afterImage ? "Change Custom Photo" : "Upload Custom Photo"}</span>
          </button>

          {afterImage && (
            <span className="text-xs font-bold text-emerald-700">
              ✓ Photo Attached
            </span>
          )}
        </div>

        {/* Resolution Note */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Resolution Note *
          </label>
          <textarea
            rows="2"
            required
            value={resolutionNote}
            onChange={(e) => setResolutionNote(e.target.value)}
            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none font-medium"
            placeholder="Describe completed work..."
          />
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={!afterImage || submitting}
              onClick={handleSaveOnly}
              className="px-4 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed border border-slate-200 rounded-xl shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Camera className="w-3.5 h-3.5 text-blue-600" />
              <span>Save Photo Proof</span>
            </button>

            <button
              type="button"
              disabled={!afterImage || submitting}
              onClick={handleSaveAndResolve}
              className="px-4 py-2 text-xs font-extrabold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Save & Mark Resolved</span>
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
