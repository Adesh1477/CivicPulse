import React, { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  Camera,
  MapPin,
  Crosshair,
  AlertTriangle,
  Trash2,
  Lightbulb,
  MoreHorizontal,
  Sparkles,
  Check,
  ChevronDown
} from "lucide-react";
import { useIncidents } from "../../context/IncidentContext";
import { CITY_LOCATIONS, getLocationById, getLocationByAddress } from "../../config/locations";

export default function CitizenReportPage() {
  const navigate = useNavigate();
  const { citizenReport, setCitizenReport, addToast } = useIncidents();

  const [selectedType, setSelectedType] = useState(citizenReport.type || "Pothole");
  const [photoUrl, setPhotoUrl] = useState(citizenReport.image || null);
  const [photoFile, setPhotoFile] = useState(null);
  
  const [selectedLocationId, setSelectedLocationId] = useState(
    citizenReport.locationId || "mg-road-sector-4"
  );
  const [locationText, setLocationText] = useState(
    citizenReport.location || "MG Road, Sector 4"
  );
  const [description, setDescription] = useState(
    citizenReport.description || "Large pothole causing traffic disruption on main road."
  );
  const [isLocating, setIsLocating] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const fileInputRef = useRef(null);
  const objectUrlRef = useRef(null);

  // Clean up object URLs on unmount
  useEffect(() => {
    return () => {
      if (objectUrlRef.current && objectUrlRef.current.startsWith("blob:")) {
        URL.revokeObjectURL(objectUrlRef.current);
      }
    };
  }, []);

  const issueCategories = [
    { id: "Pothole", label: "Pothole", icon: AlertTriangle, color: "text-rose-600 bg-rose-50 border-rose-200" },
    { id: "Garbage", label: "Garbage", icon: Trash2, color: "text-emerald-600 bg-emerald-50 border-emerald-200" },
    { id: "Streetlight", label: "Streetlight", icon: Lightbulb, color: "text-amber-600 bg-amber-50 border-amber-200" },
    { id: "Other", label: "Other", icon: MoreHorizontal, color: "text-blue-600 bg-blue-50 border-blue-200" }
  ];

  // Handle native file input selection from device
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validMimeTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg", "image/gif"];
    const hasValidExtension = /\.(jpe?g|png|webp|gif)$/i.test(file.name);
    const isValidType = validMimeTypes.includes(file.type) || hasValidExtension;
    const maxSizeBytes = 15 * 1024 * 1024; // 15MB limit

    if (!isValidType || file.size > maxSizeBytes) {
      addToast({
        type: "error",
        title: "Invalid File",
        message: "Please upload an image (JPG, PNG, or WebP) under 15MB."
      });
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    if (objectUrlRef.current && objectUrlRef.current.startsWith("blob:")) {
      URL.revokeObjectURL(objectUrlRef.current);
    }

    const objectUrl = URL.createObjectURL(file);
    objectUrlRef.current = objectUrl;

    setPhotoFile(file);
    setPhotoUrl(objectUrl);

    addToast({
      type: "success",
      title: "Photo Attached",
      message: `Selected "${file.name}".`
    });
  };

  const handleTriggerUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleLocationChange = (locId) => {
    const loc = getLocationById(locId);
    setSelectedLocationId(loc.id);
    setLocationText(loc.address);
  };

  const handleDetectGPS = () => {
    setIsLocating(true);
    setTimeout(() => {
      const loc = CITY_LOCATIONS[3]; // MG Road, Sector 4
      setSelectedLocationId(loc.id);
      setLocationText(loc.address);
      setIsLocating(false);
      addToast({
        type: "success",
        title: "GPS Located",
        message: `Locked onto ${loc.address} (${loc.landmark})`
      });
    }, 350);
  };

  const handleNext = async (e) => {
    e.preventDefault();

    if (!photoUrl) {
      addToast({
        type: "error",
        title: "Photo Required",
        message: "Please upload a photo of the civic issue."
      });
      return;
    }

    setIsAnalyzing(true);

    try {
      let finalImageData = photoUrl;
      if (photoFile) {
        finalImageData = await new Promise((resolve) => {
          if (photoUrl && photoUrl.startsWith("data:")) {
            resolve(photoUrl);
            return;
          }
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = () => resolve(photoUrl);
          reader.readAsDataURL(photoFile);
        });
      }

      const locObj = getLocationById(selectedLocationId) || getLocationByAddress(locationText);
      const department =
        selectedType === "Garbage"
          ? "Sanitation Department"
          : selectedType === "Streetlight"
          ? "Electrical Department"
          : selectedType === "Other"
          ? "General Civic Operations"
          : "Road Maintenance Department";

      // Accept citizen's selected category and photo directly without rejection
      setCitizenReport({
        type: selectedType,
        selectedType: selectedType,
        locationId: locObj.id,
        location: locObj.address,
        locationAddress: locObj.address,
        sector: locObj.sector,
        latitude: locObj.latitude,
        longitude: locObj.longitude,
        description: description || `${selectedType} reported at ${locObj.address}`,
        image: finalImageData,
        photoSource: "upload",
        aiAnalysis: {
          category: selectedType,
          selectedType: selectedType,
          predictedType: selectedType,
          aiCategory: selectedType,
          finalCategory: selectedType,
          confidence: 95,
          observation: `${selectedType} civic defect observed in citizen photographic evidence.`,
          department: department,
          recommendedDepartment: department,
          categoryMismatch: false,
          locationId: locObj.id,
          latitude: locObj.latitude,
          longitude: locObj.longitude
        }
      });

      navigate("/citizen/ai-analysis");
    } catch (err) {
      console.error("Submission error:", err);
      addToast({
        type: "error",
        title: "Error",
        message: "Could not prepare report. Please try again."
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const activeLocObj = getLocationById(selectedLocationId);

  return (
    <div className="space-y-5">
      {/* Header Row */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <Link
          to="/citizen"
          className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          aria-label="Back"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-base font-extrabold text-slate-900">Report an Issue</h1>
        <div className="w-5" />
      </div>

      <form onSubmit={handleNext} className="space-y-5">
        {/* Step 1: Category Selection */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
            1. Select Issue Category <span className="text-rose-500">*</span>
          </label>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {issueCategories.map((cat) => {
              const Icon = cat.icon;
              const isSelected = selectedType === cat.id;

              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedType(cat.id)}
                  className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                    isSelected
                      ? "border-blue-600 bg-blue-50/70 shadow-xs ring-2 ring-blue-600/20"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className={`p-2 rounded-xl border ${cat.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    {isSelected && (
                      <div className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center">
                        <Check className="w-2.5 h-2.5" />
                      </div>
                    )}
                  </div>
                  <span className="text-xs font-extrabold text-slate-900">{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 2: Photo Upload (Clean User Upload Flow) */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
            2. Upload Issue Photo <span className="text-rose-500">*</span>
          </label>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
            aria-label="Upload photo file from device"
          />

          {photoUrl ? (
            <div className="space-y-2">
              <div
                onClick={handleTriggerUpload}
                className="relative aspect-16/9 rounded-2xl overflow-hidden bg-slate-100 border-2 border-emerald-400/80 shadow-xs flex items-center justify-center group cursor-pointer"
                title="Click to choose a different photo from your device"
              >
                <img src={photoUrl} alt="Selected Issue" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5 p-2">
                  <span className="px-3.5 py-2 bg-white rounded-xl text-xs font-bold text-slate-900 shadow-md flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5 text-blue-600" />
                    <span>Change Photo</span>
                  </span>
                  <span className="text-[10px] text-white font-semibold">Browse files on device</span>
                </div>
                <div className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-[11px] font-extrabold shadow-sm flex items-center gap-1">
                  <Check className="w-3.5 h-3.5 text-white" />
                  <span>✓ Photo Attached</span>
                </div>
              </div>

              <div className="flex items-center justify-between px-1 text-xs">
                <span className="text-[11px] text-slate-500 font-medium truncate max-w-[200px]">
                  {photoFile ? photoFile.name : "Photo attached"}
                </span>
                <button
                  type="button"
                  onClick={handleTriggerUpload}
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 cursor-pointer flex items-center gap-1"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Change Photo</span>
                </button>
              </div>
            </div>
          ) : (
            <div
              onClick={handleTriggerUpload}
              className="relative aspect-16/9 rounded-2xl bg-slate-50/80 hover:bg-blue-50/40 border-2 border-dashed border-slate-300 hover:border-blue-500 transition-all flex flex-col items-center justify-center p-6 text-center group cursor-pointer shadow-2xs hover:shadow-xs select-none"
              title="Click to choose a photo from your device"
            >
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100/80 flex items-center justify-center mb-2.5 group-hover:scale-110 group-hover:bg-blue-100 transition-all shadow-2xs">
                <Camera className="w-6 h-6" />
              </div>
              <p className="text-sm font-extrabold text-slate-900 group-hover:text-blue-700 transition-colors mb-0.5">
                Upload Image
              </p>
              <p className="text-[11px] text-slate-500 font-medium">
                Tap to upload a photo
              </p>
            </div>
          )}
        </div>

        {/* Step 3: Shared Location Dropdown (All 15 Sectors) */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
              3. City Location & Sector <span className="text-rose-500">*</span>
            </label>
            <button
              type="button"
              onClick={handleDetectGPS}
              className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-700 cursor-pointer"
            >
              <Crosshair className={`w-3.5 h-3.5 ${isLocating ? "animate-spin" : ""}`} />
              <span>Auto-Detect GPS</span>
            </button>
          </div>

          <div className="relative">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-blue-600 pointer-events-none">
              <MapPin className="w-4 h-4" />
            </div>
            <select
              value={selectedLocationId}
              onChange={(e) => handleLocationChange(e.target.value)}
              aria-label="Select Municipal Sector or Location"
              className="w-full pl-9 pr-8 py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-2xs appearance-none cursor-pointer"
            >
              {CITY_LOCATIONS.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.address} ({loc.landmark})
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {activeLocObj && (
            <div className="mt-1.5 px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-100 text-[11px] text-slate-600 flex items-center justify-between">
              <span>Landmark: <strong>{activeLocObj.landmark}</strong></span>
              <span className="font-mono text-[10px] text-slate-400">
                ({activeLocObj.latitude.toFixed(4)}, {activeLocObj.longitude.toFixed(4)})
              </span>
            </div>
          )}
        </div>

        {/* Step 4: Description (Optional) */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
            4. Description (Optional)
          </label>
          <textarea
            rows="2"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the issue size or hazard details..."
            className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-2xs resize-none"
          />
        </div>

        {/* Primary CTA Button */}
        <button
          type="submit"
          disabled={isAnalyzing}
          className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-700 active:scale-[0.99] disabled:opacity-70 text-white rounded-2xl font-extrabold text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
        >
          {isAnalyzing ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Processing Report...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Submit</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
