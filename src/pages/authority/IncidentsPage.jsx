import React, { useState, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  Search,
  Eye,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Sparkles,
  Trash2,
  CheckCircle2,
  Wrench,
  Camera,
  Layers,
  Activity,
  Building2,
  Inbox,
  MapPin,
  ClipboardList,
  ChevronDown,
  BarChart3
} from "lucide-react";
import { useIncidents } from "../../context/IncidentContext";
import StatusBadge from "../../components/common/StatusBadge";
import PriorityBadge from "../../components/common/PriorityBadge";
import AssignDepartmentModal from "../../components/incident/AssignDepartmentModal";
import ResolutionEvidenceModal from "../../components/incident/ResolutionEvidenceModal";
import CivicImage from "../../components/common/CivicImage";
import authoritySkyline from "../../assets/authority-skyline.png";

export default function IncidentsPage() {
  const { incidents, deleteIncident, updateIncidentStatus, submitResolutionEvidence } = useIncidents();
  const [searchParams, setSearchParams] = useSearchParams();

  const urlSearch = searchParams.get("search") || "";
  const [search, setSearch] = useState(urlSearch);
  const [typeFilter, setTypeFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("Active");
  const [deptFilter, setDeptFilter] = useState("All");
  const [sortBy, setSortBy] = useState("priority");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIncidentForAssign, setSelectedIncidentForAssign] = useState(null);
  const [selectedIncidentForEvidence, setSelectedIncidentForEvidence] = useState(null);
  const [incidentToDelete, setIncidentToDelete] = useState(null);
  const [incidentToResolve, setIncidentToResolve] = useState(null);

  const itemsPerPage = 8;

  // Calculate dynamic counts for the 4 core categories: Pothole, Garbage, Streetlight, Other
  // Counts every individual ACTIVE / UNRESOLVED citizen report (status !== "Resolved")
  const categoryCounts = useMemo(() => {
    const counts = {
      Pothole: 0,
      Garbage: 0,
      Streetlight: 0,
      Other: 0
    };

    incidents.forEach((inc) => {
      // Exclude resolved incidents from active chart count
      const isResolved =
        (inc.status || "").toLowerCase().includes("resolve") ||
        (inc.statusCode || "").toUpperCase() === "RESOLVED";

      if (isResolved) return;

      const count = typeof inc.reportCount === "number" && inc.reportCount > 0 ? inc.reportCount : 1;
      const cat = (inc.category || inc.type || inc.finalCategory || inc.selectedCategory || "").toLowerCase();
      if (cat.includes("pothole") || cat.includes("road") || cat.includes("crater")) {
        counts.Pothole += count;
      } else if (cat.includes("garbage") || cat.includes("waste") || cat.includes("trash")) {
        counts.Garbage += count;
      } else if (cat.includes("streetlight") || cat.includes("light") || cat.includes("lamp")) {
        counts.Streetlight += count;
      } else {
        counts.Other += count;
      }
    });

    return counts;
  }, [incidents]);

  const totalReportsCount = useMemo(() => {
    return categoryCounts.Pothole + categoryCounts.Garbage + categoryCounts.Streetlight + categoryCounts.Other;
  }, [categoryCounts]);

  // Filter & Sort Incidents directly on real backend data
  const filteredIncidents = useMemo(() => {
    return incidents
      .filter((inc) => {
        // Search query
        if (search) {
          const q = search.toLowerCase();
          const match =
            (inc.id || inc.ticketId || "").toLowerCase().includes(q) ||
            (inc.type || inc.category || "").toLowerCase().includes(q) ||
            (inc.location || inc.locationAddress || "").toLowerCase().includes(q) ||
            (inc.department || inc.recommendedDepartment || "").toLowerCase().includes(q) ||
            (inc.zone && inc.zone.toLowerCase().includes(q));
          if (!match) return false;
        }

        // Issue Type filter
        if (typeFilter !== "All") {
          const incType = (inc.type || inc.category || "").toLowerCase();
          if (incType !== typeFilter.toLowerCase()) return false;
        }

        // Workflow Status filter
        if (statusFilter === "Active") {
          const isResolved =
            (inc.status || "").toLowerCase().includes("resolve") || inc.statusCode === "RESOLVED";
          if (isResolved) return false;
        } else if (statusFilter !== "All") {
          if (statusFilter === "New" && inc.status !== "New") return false;
          if (statusFilter === "In Progress" && !inc.status.toLowerCase().includes("progress"))
            return false;
          if (statusFilter === "Resolved" && !inc.status.toLowerCase().includes("resolve"))
            return false;
        }

        // Department filter
        if (deptFilter !== "All") {
          const incDept = (inc.department || inc.recommendedDepartment || "").toLowerCase();
          if (!incDept.includes(deptFilter.toLowerCase())) return false;
        }

        return true;
      })
      .sort((a, b) => {
        const scoreA = typeof a.priorityScore === "number" ? a.priorityScore : ((a.reportCount || 1) >= 5 ? 100 : (a.reportCount || 1) === 4 ? 90 : (a.reportCount || 1) === 3 ? 80 : (a.reportCount || 1) === 2 ? 60 : 40);
        const scoreB = typeof b.priorityScore === "number" ? b.priorityScore : ((b.reportCount || 1) >= 5 ? 100 : (b.reportCount || 1) === 4 ? 90 : (b.reportCount || 1) === 3 ? 80 : (b.reportCount || 1) === 2 ? 60 : 40);

        if (sortBy === "oldest") {
          const diff = scoreB - scoreA;
          if (diff !== 0) return diff;
          return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
        }

        // Default & "priority" & "newest": Highest priority score at TOP, then newest first
        const diff = scoreB - scoreA;
        if (diff !== 0) return diff;
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      });
  }, [incidents, search, typeFilter, statusFilter, deptFilter, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredIncidents.length / itemsPerPage));
  const paginatedIncidents = filteredIncidents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleResetFilters = () => {
    setSearch("");
    setTypeFilter("All");
    setStatusFilter("Active");
    setDeptFilter("All");
    setSortBy("priority");
    setCurrentPage(1);
    setSearchParams({});
  };

  const isFiltered =
    search || typeFilter !== "All" || statusFilter !== "Active" || deptFilter !== "All";

  return (
    <div className="space-y-6">
      {/* 1. Page Header with Seamlessly Blended 3D Civic Skyline */}
      <div className="relative rounded-3xl bg-white p-5 sm:p-7 border border-slate-200/80 shadow-sm overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left: Icon + Title + Subtitle */}
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-blue-50/80 border border-blue-100 shadow-2xs flex items-center justify-center text-blue-600 shrink-0">
            <ClipboardList className="w-7 h-7 text-blue-600 stroke-[2.2]" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Incident Management
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5 max-w-xl">
              Monitor, manage, and resolve civic complaints across municipal sectors
            </p>
          </div>
        </div>

        {/* Center/Right 3D Skyline Illustration — Seamlessly Blended */}
        <div className="hidden lg:flex items-center justify-center absolute right-52 xl:right-64 top-0 bottom-0 h-full pointer-events-none select-none">
          <img
            src={authoritySkyline}
            alt="Civic 3D Skyline"
            className="h-full w-auto max-h-[95%] object-contain opacity-90 mix-blend-multiply"
          />
        </div>

        {/* Right: + Log New Incident Button */}
        <div className="flex items-center gap-2 shrink-0 relative z-10">
          <Link
            to="/citizen/report"
            className="inline-flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-extrabold text-white bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 active:scale-95 rounded-full shadow-lg shadow-blue-500/25 transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4 stroke-[2.5]" />
            <span>Log New Incident</span>
          </Link>
        </div>
      </div>

      {/* 2. Premium Search + 3-Column Filter Panel */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-sm space-y-4">
        {/* Top Row: Search Input & Sort Dropdown */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by ID, keyword, sector, or street..."
              className="w-full pl-10 pr-4 py-3 bg-slate-50/70 hover:bg-slate-100/70 focus:bg-white border border-slate-200 rounded-2xl text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
            <div className="relative flex-1 sm:flex-initial">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                aria-label="Sort Incidents"
                className="w-full appearance-none pl-4 pr-9 py-3 bg-slate-50/70 border border-slate-200 rounded-2xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer shadow-2xs"
              >
                <option value="priority">Sort: Highest Priority</option>
                <option value="newest">Sort: Newest First</option>
                <option value="oldest">Sort: Oldest First</option>
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {isFiltered && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="p-3 text-slate-500 hover:text-slate-800 hover:bg-slate-100 border border-slate-200 rounded-2xl transition-colors shrink-0 cursor-pointer shadow-2xs"
                title="Reset all filters"
                aria-label="Reset all filters"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Second Row: 3 Categorical Filters with Icons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-1 text-xs">
          {/* Issue Type */}
          <div>
            <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1.5 px-0.5">
              Issue Type
            </label>
            <div className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-purple-600 pointer-events-none">
                <Layers className="w-4 h-4" />
              </div>
              <select
                value={typeFilter}
                onChange={(e) => {
                  setTypeFilter(e.target.value);
                  setCurrentPage(1);
                }}
                aria-label="Filter by Issue Type"
                className="w-full appearance-none pl-10 pr-9 py-2.5 bg-slate-50/80 hover:bg-slate-100/80 focus:bg-white border border-slate-200 rounded-2xl font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer shadow-2xs transition-colors"
              >
                <option value="All">All Types</option>
                <option value="Pothole">Pothole</option>
                <option value="Garbage">Garbage</option>
                <option value="Streetlight">Streetlight</option>
                <option value="Other">Other</option>
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Workflow Status */}
          <div>
            <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1.5 px-0.5">
              Workflow Status
            </label>
            <div className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-blue-600 pointer-events-none">
                <Activity className="w-4 h-4" />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                aria-label="Filter by Workflow Status"
                className="w-full appearance-none pl-10 pr-9 py-2.5 bg-slate-50/80 hover:bg-slate-100/80 focus:bg-white border border-slate-200 rounded-2xl font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer shadow-2xs transition-colors"
              >
                <option value="Active">Active Incidents</option>
                <option value="All">All Incidents</option>
                <option value="New">New</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Department */}
          <div>
            <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1.5 px-0.5">
              Department
            </label>
            <div className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-blue-600 pointer-events-none">
                <Building2 className="w-4 h-4" />
              </div>
              <select
                value={deptFilter}
                onChange={(e) => {
                  setDeptFilter(e.target.value);
                  setCurrentPage(1);
                }}
                aria-label="Filter by Department"
                className="w-full appearance-none pl-10 pr-9 py-2.5 bg-slate-50/80 hover:bg-slate-100/80 focus:bg-white border border-slate-200 rounded-2xl font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer shadow-2xs transition-colors"
              >
                <option value="All">All Departments</option>
                <option value="Road">Road Maintenance</option>
                <option value="Sanitation">Sanitation Dept</option>
                <option value="Electrical">Electrical Dept</option>
                <option value="Drainage">Drainage & Sewerage</option>
                <option value="General">General Civic Operations</option>
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* 2.5 Compact Issue Category Overview Bar Chart */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <BarChart3 className="w-3.5 h-3.5" />
            </div>
            <h2 className="text-xs font-extrabold text-slate-900 tracking-tight">
              Issue Category Overview
            </h2>
          </div>
          <span className="text-[11px] font-bold text-slate-500 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200/60">
            {totalReportsCount} Active Report{totalReportsCount === 1 ? "" : "s"}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {[
            {
              name: "Pothole",
              count: categoryCounts.Pothole,
              color: "bg-blue-600",
              bgColor: "bg-blue-50/50",
              textColor: "text-blue-700"
            },
            {
              name: "Garbage",
              count: categoryCounts.Garbage,
              color: "bg-emerald-600",
              bgColor: "bg-emerald-50/50",
              textColor: "text-emerald-700"
            },
            {
              name: "Streetlight",
              count: categoryCounts.Streetlight,
              color: "bg-amber-500",
              bgColor: "bg-amber-50/50",
              textColor: "text-amber-700"
            },
            {
              name: "Other",
              count: categoryCounts.Other,
              color: "bg-slate-500",
              bgColor: "bg-slate-50/50",
              textColor: "text-slate-700"
            }
          ].map((cat) => {
            const pct = totalReportsCount > 0 ? Math.round((cat.count / totalReportsCount) * 100) : 0;
            return (
              <div
                key={cat.name}
                className={`p-3 rounded-xl ${cat.bgColor} border border-slate-200/60 flex flex-col justify-between space-y-2`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">{cat.name}</span>
                  <span className="text-xs font-extrabold text-slate-900">{cat.count}</span>
                </div>
                <div className="space-y-1">
                  <div className="w-full h-1.5 bg-slate-200/70 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${cat.color} rounded-full transition-all duration-300`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-semibold text-slate-400">
                    <span>{cat.count} report{cat.count === 1 ? "" : "s"}</span>
                    <span>{pct}%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Incidents Table / Polish Empty State Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        {paginatedIncidents.length === 0 ? (
          /* High-Fidelity Empty State matching the reference */
          <div className="relative p-12 sm:p-16 text-center flex flex-col items-center justify-center overflow-hidden">
            {/* Subtle decorative dashed flight trail */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none opacity-40"
              viewBox="0 0 800 240"
              fill="none"
            >
              <path
                d="M 120 180 Q 280 60, 400 110 T 680 80"
                stroke="#93C5FD"
                strokeWidth="1.5"
                strokeDasharray="4 6"
              />
              <circle cx="200" cy="140" r="3" fill="#60A5FA" opacity="0.6" />
              <circle cx="620" cy="90" r="3" fill="#60A5FA" opacity="0.6" />
              <path d="M 680 75 L 700 80 L 685 92 L 687 83 Z" fill="#60A5FA" opacity="0.8" />
            </svg>

            {/* Central Inbox Icon with Soft Ring */}
            <div className="relative w-18 h-18 rounded-full bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center mx-auto mb-4 ring-8 ring-blue-50/50 shadow-xs z-10">
              <Inbox className="w-8 h-8 stroke-[2]" />
            </div>

            <div className="space-y-1 max-w-sm mx-auto z-10">
              <h3 className="text-base font-extrabold text-slate-900">
                No matching incidents found
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                No incidents match the active filters or search query. Try clearing your filters.
              </p>
            </div>

            {/* Reset Filters CTA Button */}
            <div className="pt-5 z-10">
              <button
                type="button"
                onClick={handleResetFilters}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-95 rounded-xl shadow-md shadow-blue-500/20 transition-all cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Filters</span>
              </button>
            </div>
          </div>
        ) : (
          /* Real Data Table */
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/90 border-b border-slate-200/80 text-slate-400 uppercase text-[10px] font-extrabold tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Ticket</th>
                  <th className="py-3.5 px-4">Photo</th>
                  <th className="py-3.5 px-4">Issue Type</th>
                  <th className="py-3.5 px-4">Priority</th>
                  <th className="py-3.5 px-4">Location</th>
                  <th className="py-3.5 px-4">Department</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedIncidents.map((incident) => (
                  <tr
                    key={incident.id || incident.ticketId}
                    className="hover:bg-blue-50/40 transition-colors group"
                  >
                    {/* Ticket ID */}
                    <td className="py-3 px-4 font-mono font-bold text-blue-600">
                      <Link
                        to={`/incidents/${incident.id || incident.ticketId}`}
                        className="hover:underline flex items-center gap-1"
                      >
                        <span>{incident.id || incident.ticketId}</span>
                      </Link>
                    </td>

                    {/* Photo Thumbnail */}
                    <td className="py-3 px-4">
                      <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                        <CivicImage
                          src={incident.image || incident.imageUrl}
                          alt={incident.type || incident.category}
                          type={incident.type || incident.category}
                        />
                      </div>
                    </td>

                    {/* Issue Type */}
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {incident.type || incident.category}
                    </td>

                    {/* Priority & Reports */}
                    <td className="py-3 px-4">
                      <PriorityBadge
                        level={incident.priorityLevel || (incident.priorityScore >= 80 ? "Critical" : incident.priorityScore >= 60 ? "High" : "Medium")}
                        score={typeof incident.priorityScore === "number" ? incident.priorityScore : ((incident.reportCount || 1) >= 5 ? 100 : (incident.reportCount || 1) === 4 ? 90 : (incident.reportCount || 1) === 3 ? 80 : (incident.reportCount || 1) === 2 ? 60 : 40)}
                        reportCount={incident.reportCount || 1}
                        showCount={true}
                        size="sm"
                      />
                    </td>

                    {/* Location */}
                    <td className="py-3 px-4 text-slate-600 max-w-[200px] truncate">
                      <div className="flex items-center gap-1 truncate">
                        <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span className="truncate">
                          {incident.location || incident.locationAddress}
                        </span>
                      </div>
                    </td>

                    {/* Department */}
                    <td className="py-3 px-4 text-slate-600">
                      <button
                        type="button"
                        onClick={() => setSelectedIncidentForAssign(incident)}
                        className="hover:text-blue-600 font-medium hover:underline text-left cursor-pointer"
                        title="Click to change department"
                      >
                        {incident.department ||
                          incident.recommendedDepartment ||
                          "Road Maintenance"}
                      </button>
                    </td>

                    {/* Status Badge & Rating */}
                    <td className="py-3 px-4">
                      <div className="flex flex-col gap-1 items-start">
                        <StatusBadge status={incident.status} size="sm" />
                        {Boolean(incident.citizenRating || incident.rating) && (
                          <span className="inline-flex items-center gap-0.5 text-[10px] font-extrabold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-md">
                            ★ {incident.citizenRating || incident.rating}/5
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Strict Workflow Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* View Details Action */}
                        <Link
                          to={`/incidents/${incident.id || incident.ticketId}`}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          title="View Incident Details"
                          aria-label="View Incident Details"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>

                        {/* If status is "New" or "Reopened": Show Start / In Progress button */}
                        {(incident.status === "New" ||
                          incident.statusCode === "NEW" ||
                          incident.status === "Reopened" ||
                          incident.statusCode === "REOPENED") && (
                          <button
                            type="button"
                            onClick={() =>
                              updateIncidentStatus(
                                incident.id || incident.ticketId,
                                "In Progress"
                              )
                            }
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition-colors cursor-pointer"
                            title="Start working on incident"
                          >
                            <Wrench className="w-3 h-3" />
                            <span>Start</span>
                          </button>
                        )}

                        {/* If status is "In Progress": Require resolution photo before showing Resolve */}
                        {(incident.status === "In Progress" ||
                          incident.status === "IN_PROGRESS" ||
                          incident.statusCode === "IN_PROGRESS") && (
                          incident.resolutionImageUrl || incident.resolutionPhoto || incident.resolutionEvidence?.afterImage ? (
                            <button
                              type="button"
                              onClick={() => setIncidentToResolve(incident)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors cursor-pointer shadow-2xs"
                              title="Mark incident as resolved"
                            >
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Resolve</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setSelectedIncidentForEvidence(incident)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors cursor-pointer shadow-2xs"
                              title="Upload after-resolution photo proof before resolving"
                            >
                              <Camera className="w-3 h-3 text-blue-600" />
                              <span>Upload Proof</span>
                            </button>
                          )
                        )}

                        {/* Delete action */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setIncidentToDelete(incident);
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Delete Incident"
                          aria-label="Delete Incident"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 4. Table Footer & Pagination */}
        <div className="px-5 py-3.5 bg-slate-50/70 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="text-slate-500 font-medium">
            Showing <strong className="text-slate-800">{paginatedIncidents.length}</strong> of{" "}
            <strong className="text-slate-800">{filteredIncidents.length}</strong> incidents
          </div>

          {/* Pagination buttons */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="p-1.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
              aria-label="Previous Page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {Array.from({ length: totalPages }).map((_, idx) => {
              const page = idx + 1;
              return (
                <button
                  key={page}
                  type="button"
                  onClick={() => setCurrentPage(page)}
                  className={`w-7 h-7 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    currentPage === page
                      ? "bg-blue-600 text-white shadow-2xs"
                      : "text-slate-600 hover:bg-slate-100 border border-slate-200"
                  }`}
                >
                  {page}
                </button>
              );
            })}

            <button
              type="button"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="p-1.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
              aria-label="Next Page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Reassign Department Modal */}
      {selectedIncidentForAssign && (
        <AssignDepartmentModal
          isOpen={!!selectedIncidentForAssign}
          onClose={() => setSelectedIncidentForAssign(null)}
          incident={selectedIncidentForAssign}
        />
      )}

      {/* Resolution Evidence Modal */}
      {selectedIncidentForEvidence && (
        <ResolutionEvidenceModal
          isOpen={!!selectedIncidentForEvidence}
          onClose={() => setSelectedIncidentForEvidence(null)}
          incident={selectedIncidentForEvidence}
          onSubmit={(evidence) => {
            submitResolutionEvidence(
              selectedIncidentForEvidence.id || selectedIncidentForEvidence.ticketId,
              evidence
            );
            setSelectedIncidentForEvidence(null);
          }}
        />
      )}

      {/* Resolve Confirmation Modal */}
      {incidentToResolve && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-extrabold text-slate-900">Mark Incident as Resolved?</h3>
              <p className="text-xs text-slate-500">
                This will mark the civic issue (
                <span className="font-mono font-bold text-slate-700">
                  {incidentToResolve.id || incidentToResolve.ticketId}
                </span>
                ) as resolved and update its status for the citizen.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => setIncidentToResolve(null)}
                className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  updateIncidentStatus(
                    incidentToResolve.id || incidentToResolve.ticketId,
                    "Resolved"
                  );
                  setIncidentToResolve(null);
                }}
                className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-colors shadow-xs cursor-pointer"
              >
                Mark as Resolved
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {incidentToDelete && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-extrabold text-slate-900">Delete Incident?</h3>
              <p className="text-xs text-slate-500">
                This incident (
                <span className="font-mono font-bold text-slate-700">
                  {incidentToDelete.id || incidentToDelete.ticketId}
                </span>
                ) will be permanently removed from CivicPulse.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => setIncidentToDelete(null)}
                className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteIncident(incidentToDelete.id || incidentToDelete.ticketId);
                  setIncidentToDelete(null);
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
