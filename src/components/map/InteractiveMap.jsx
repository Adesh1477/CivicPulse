import React, { useState } from "react";
import { Plus, Minus, Navigation, MapPin, ArrowRight, X } from "lucide-react";
import { Link } from "react-router-dom";
import { useIncidents } from "../../context/IncidentContext";
import { mapService } from "../../services/mapService";
import { CITY_LOCATIONS } from "../../config/locations";
import StatusBadge from "../common/StatusBadge";
import PriorityBadge from "../common/PriorityBadge";

export default function InteractiveMap({
  selectedType = "All",
  activeFilter = "All",
  height = "h-[540px]"
}) {
  const { incidents } = useIncidents();
  const [zoomLevel, setZoomLevel] = useState(1);
  const [activeIncident, setActiveIncident] = useState(null);

  const effectiveType = selectedType !== "All" ? selectedType : activeFilter;

  const handleZoomIn = () => setZoomLevel((z) => Math.min(1.6, z + 0.15));
  const handleZoomOut = () => setZoomLevel((z) => Math.max(0.85, z - 0.15));
  const handleReset = () => setZoomLevel(1);

  // Filter individual incident markers (show ONLY active incidents on heatmap)
  const markers = mapService.getIndividualMarkers(incidents).filter((m) => {
    const isResolved =
      (m.status || "").toLowerCase().includes("resolve") || m.statusCode === "RESOLVED";
    if (isResolved) return false;
    if (effectiveType !== "All" && m.type !== effectiveType && m.category !== effectiveType)
      return false;
    return true;
  });

  const getMarkerStyles = (type) => {
    const t = (type || "").toLowerCase();
    if (t.includes("pothole"))
      return { fill: "#2563EB", stroke: "#1D4ED8", ring: "rgba(37, 99, 235, 0.35)", icon: "⚠" };
    if (t.includes("garbage"))
      return { fill: "#D97706", stroke: "#B45309", ring: "rgba(217, 119, 6, 0.35)", icon: "🗑" };
    if (t.includes("streetlight"))
      return { fill: "#7C3AED", stroke: "#6D28D9", ring: "rgba(124, 58, 237, 0.35)", icon: "💡" };
    return { fill: "#0D9488", stroke: "#0F766E", ring: "rgba(13, 148, 136, 0.35)", icon: "•" };
  };

  return (
    <div
      className={`relative w-full ${height} rounded-[24px] sm:rounded-[30px] overflow-hidden bg-[#0A101D] border border-slate-900 shadow-xl select-none`}
    >
      {/* Zoomable SVG Map Canvas */}
      <div
        className="w-full h-full transition-transform duration-300 ease-out origin-center"
        style={{ transform: `scale(${zoomLevel})` }}
      >
        <svg
          viewBox="0 0 1000 600"
          className="w-full h-full"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            {/* Dark Municipal Grid Pattern */}
            <pattern id="city-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path
                d="M 40 0 L 0 0 0 40"
                fill="none"
                stroke="#1E293B"
                strokeWidth="0.8"
                opacity="0.5"
              />
            </pattern>

            {/* Botanical Park Gradient */}
            <linearGradient id="park-fill" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#064E3B" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#065F46" stopOpacity="0.65" />
            </linearGradient>

            {/* Lake Water Gradient */}
            <linearGradient id="lake-fill" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0C4A6E" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#075985" stopOpacity="0.65" />
            </linearGradient>

            {/* River Gradient */}
            <linearGradient id="river-path" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0284C7" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#0369A1" stopOpacity="0.8" />
            </linearGradient>

            {/* Glow Filter for Arterial Highways */}
            <filter id="road-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Map Base Canvas */}
          <rect width="1000" height="600" fill="#080E1A" />
          <rect width="1000" height="600" fill="url(#city-grid)" />

          {/* District Outer Boundary */}
          <rect
            x="20"
            y="20"
            width="960"
            height="560"
            rx="24"
            fill="none"
            stroke="#1E3A8A"
            strokeWidth="1.5"
            strokeDasharray="8 6"
            opacity="0.4"
          />

          {/* Natural Feature: Green Park (Sector 7) */}
          <path
            d="M 220 310 C 310 280, 370 360, 320 420 C 250 450, 190 380, 220 310 Z"
            fill="url(#park-fill)"
            stroke="#059669"
            strokeWidth="1.5"
          />
          <text
            x="270"
            y="365"
            fontSize="10"
            fontWeight="bold"
            fill="#34D399"
            textAnchor="middle"
            letterSpacing="0.5"
          >
            🌲 Botanical Green Park (Sec 7)
          </text>

          {/* Natural Feature: Lake Reservoir (Sector 11) */}
          <path
            d="M 390 440 C 490 420, 530 510, 480 550 C 400 570, 360 490, 390 440 Z"
            fill="url(#lake-fill)"
            stroke="#0284C7"
            strokeWidth="1.5"
          />
          <text
            x="445"
            y="495"
            fontSize="10"
            fontWeight="bold"
            fill="#38BDF8"
            textAnchor="middle"
            letterSpacing="0.5"
          >
            🌊 City Water Reservoir (Sec 11)
          </text>

          {/* River Channel */}
          <path
            d="M 0 200 C 250 220, 350 150, 600 240 C 750 280, 880 220, 1000 250"
            fill="none"
            stroke="url(#river-path)"
            strokeWidth="20"
            strokeLinecap="round"
          />
          <path
            d="M 0 200 C 250 220, 350 150, 600 240 C 750 280, 880 220, 1000 250"
            fill="none"
            stroke="#38BDF8"
            strokeWidth="1.5"
            strokeDasharray="6 10"
            opacity="0.4"
          />

          {/* Secondary Connecting Streets */}
          <path d="M 180 0 L 180 600" stroke="#1E293B" strokeWidth="5" />
          <path d="M 680 0 L 680 600" stroke="#1E293B" strokeWidth="5" />
          <path d="M 0 130 L 1000 130" stroke="#1E293B" strokeWidth="5" />
          <path d="M 0 440 L 1000 440" stroke="#1E293B" strokeWidth="5" />

          {/* Diagonal Arterials */}
          <path d="M 100 50 L 900 550" stroke="#1E293B" strokeWidth="8" />
          <path d="M 880 50 L 120 550" stroke="#1E293B" strokeWidth="8" />

          {/* Main East-West Expressway */}
          <path d="M 0 280 L 1000 280" stroke="#1E293B" strokeWidth="16" />
          <path
            d="M 0 280 L 1000 280"
            stroke="#3B82F6"
            strokeWidth="3"
            opacity="0.6"
            filter="url(#road-glow)"
          />
          <path
            d="M 0 280 L 1000 280"
            stroke="#FFFFFF"
            strokeWidth="1"
            strokeDasharray="10 14"
            opacity="0.6"
          />

          {/* North-South Ring Road */}
          <path d="M 430 0 L 430 600" stroke="#1E293B" strokeWidth="14" />
          <path
            d="M 430 0 L 430 600"
            stroke="#60A5FA"
            strokeWidth="2.5"
            opacity="0.6"
            filter="url(#road-glow)"
          />

          {/* Railway Corridor (Sector 5) */}
          <path
            d="M 590 0 L 730 600"
            stroke="#475569"
            strokeWidth="2"
            strokeDasharray="5 5"
            opacity="0.7"
          />

          {/* All 15 Sector Hub Base Markers & Labels */}
          {CITY_LOCATIONS.map((loc) => (
            <g key={loc.id} className="transition-opacity">
              {/* Sector Area Circle */}
              <circle
                cx={loc.mapX}
                cy={loc.mapY}
                r="30"
                fill="#0F172A"
                stroke="#1E3A8A"
                strokeWidth="1"
                strokeDasharray="4 3"
                opacity="0.7"
              />

              {/* Sector Name Badge */}
              <rect
                x={loc.mapX - 32}
                y={loc.mapY - 11}
                width="64"
                height="22"
                rx="6"
                fill="#0F172A"
                stroke="#334155"
                strokeWidth="1"
                opacity="0.95"
              />
              <text
                x={loc.mapX}
                y={loc.mapY + 4}
                textAnchor="middle"
                fontSize="9"
                fontWeight="800"
                fill="#E2E8F0"
                fontFamily="Plus Jakarta Sans, sans-serif"
              >
                {loc.sector}
              </text>

              {/* Area Landmark Label */}
              <text
                x={loc.mapX}
                y={loc.mapY + 24}
                textAnchor="middle"
                fontSize="7.5"
                fontWeight="600"
                fill="#94A3B8"
                fontFamily="Plus Jakarta Sans, sans-serif"
              >
                {loc.area}
              </text>
            </g>
          ))}

          {/* Dynamic Incident Pins (Active incidents only from real database) */}
          {markers.map((marker) => {
            const styles = getMarkerStyles(marker.type || marker.category);

            return (
              <g
                key={marker.id}
                transform={`translate(${marker.x}, ${marker.y - 18})`}
                className="cursor-pointer group"
                onClick={() => setActiveIncident(marker)}
              >
                {/* Animated Pulsing Ring */}
                <circle cx="0" cy="0" r="20" fill={styles.ring} className="animate-pulse-ring" />

                {/* Ground Shadow */}
                <ellipse cx="0" cy="18" rx="9" ry="3.5" fill="#000000" opacity="0.6" />

                {/* Map Pin Vector */}
                <path
                  d="M 0 -18 C -11 -18, -16 -10, -16 0 C -16 9, 0 20, 0 20 C 0 20, 16 9, 16 0 C 16 -10, 11 -18, 0 -18 Z"
                  fill={styles.fill}
                  stroke="#FFFFFF"
                  strokeWidth="2.5"
                  className="transition-transform group-hover:scale-125"
                />

                {/* Center Category Dot */}
                <circle cx="0" cy="-2" r="5.5" fill="#FFFFFF" />
                <circle cx="0" cy="-2" r="3" fill={styles.fill} />

                {/* Ticket ID Tag */}
                <rect
                  x="-24"
                  y="-34"
                  width="48"
                  height="14"
                  rx="4"
                  fill="#0F172A"
                  stroke={styles.stroke}
                  strokeWidth="1"
                />
                <text
                  x="0"
                  y="-24"
                  textAnchor="middle"
                  fontSize="8"
                  fontWeight="bold"
                  fill="#FFFFFF"
                  fontFamily="JetBrains Mono, monospace"
                >
                  {marker.id}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Floating Map Zoom Controls (Top Right) */}
      <div className="absolute top-4 right-4 flex flex-col gap-1.5 bg-slate-900/90 backdrop-blur-md rounded-2xl p-1.5 shadow-xl border border-slate-700/80 z-10">
        <button
          type="button"
          onClick={handleZoomIn}
          className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
          title="Zoom In"
          aria-label="Zoom In"
        >
          <Plus className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={handleZoomOut}
          className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
          title="Zoom Out"
          aria-label="Zoom Out"
        >
          <Minus className="w-4 h-4" />
        </button>
        <div className="w-full h-px bg-slate-700/80 my-0.5" />
        <button
          type="button"
          onClick={handleReset}
          className="w-8 h-8 rounded-xl flex items-center justify-center text-blue-400 hover:bg-slate-800 transition-colors cursor-pointer"
          title="Recenter Map"
          aria-label="Recenter Map"
        >
          <Navigation className="w-4 h-4" />
        </button>
      </div>

      {/* Top Left Dynamic Status Notice (Real Active Pins) */}
      <div className="absolute top-4 left-4 bg-slate-900/90 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-slate-700/80 text-xs font-bold text-slate-200 shadow-lg flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span>
          {CITY_LOCATIONS.length} Municipal Sectors • {markers.length} Active Incident Pins
        </span>
      </div>

      {/* Bottom Left Floating Legend (Issue Types only) */}
      <div className="absolute bottom-4 left-4 bg-slate-900/90 backdrop-blur-md p-2.5 rounded-2xl border border-slate-700/80 text-[10px] text-slate-300 font-bold shadow-lg hidden sm:flex items-center gap-3.5">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-xs" />
          <span>Pothole</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-xs" />
          <span>Garbage</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-purple-500 shadow-xs" />
          <span>Streetlight</span>
        </div>
      </div>

      {/* Selected Incident Popup Card (When user clicks a pin) */}
      {activeIncident && (
        <div className="absolute bottom-4 right-4 left-4 sm:left-auto sm:max-w-sm bg-slate-900/98 backdrop-blur-md rounded-2xl p-4 shadow-2xl border border-slate-700 animate-in slide-in-from-bottom-3 z-20 space-y-3 text-slate-100">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono font-extrabold text-blue-400 text-xs">
                  {activeIncident.id}
                </span>
                <StatusBadge status={activeIncident.status} size="sm" />
                <PriorityBadge
                  level={activeIncident.priorityLevel}
                  score={activeIncident.priorityScore}
                  reportCount={activeIncident.reportCount || 1}
                  showCount={false}
                  size="sm"
                />
              </div>
              <h4 className="text-sm font-extrabold text-white mt-0.5">{activeIncident.type}</h4>
              <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span>{activeIncident.location}</span>
              </p>
            </div>
            <button
              onClick={() => setActiveIncident(null)}
              className="text-slate-400 hover:text-white text-sm font-bold p-1 rounded-md cursor-pointer"
              aria-label="Close details"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-2.5 bg-slate-800/80 rounded-xl border border-slate-700/80 text-xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-400 font-semibold uppercase">Community Reports</span>
              <span className="font-bold text-amber-400">
                {activeIncident.reportCount || 1} {activeIncident.reportCount === 1 ? "report" : "citizen reports"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-400 font-semibold uppercase">Sector</span>
              <span className="font-bold text-slate-200">
                {activeIncident.sector || "Municipal Sector"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-400 font-semibold uppercase">Department</span>
              <span className="font-medium text-slate-300">
                {activeIncident.department || "General Civic Operations"}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-slate-800">
            <span className="text-[11px] text-slate-400 font-mono">
              GPS: {activeIncident.latitude?.toFixed(4)}, {activeIncident.longitude?.toFixed(4)}
            </span>
            <Link
              to={`/incidents/${activeIncident.id}`}
              className="inline-flex items-center gap-1 text-xs font-extrabold text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <span>Inspect Incident</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
