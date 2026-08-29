/**
 * CivicPulse MVP Backend API Server
 * 
 * Simple, reliable backend connecting:
 * 1. Citizen App
 * 2. Authority Portal
 * 3. Heatmap
 */

import http from "http";
import { db } from "./db.js";
import { analyzeIncidentImage } from "./aiVisionEngine.js";
import {
  normalizeCategory,
  getRecommendedDepartment,
  checkMismatch,
  RESOLUTION_TIME_MAP
} from "./categoryMapping.js";
import { getLocationById, getLocationByAddress, CITY_LOCATIONS } from "./locations.js";

const PORT = process.env.PORT || 3001;

// Helper: send JSON response (compatible with Node http, Vite middleware, and Vercel serverless)
function sendJson(res, statusCode, data) {
  if (typeof res.status === "function" && typeof res.json === "function") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    return res.status(statusCode).json(data);
  }

  res.writeHead(statusCode, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization"
  });
  res.end(JSON.stringify(data));
}

// Helper: parse request body (compatible with Node stream and pre-parsed Vercel body)
function parseBody(req) {
  if (req.body !== undefined && req.body !== null) {
    if (typeof req.body === "object") return Promise.resolve(req.body);
    try {
      return Promise.resolve(JSON.parse(req.body));
    } catch {
      return Promise.resolve({});
    }
  }

  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", chunk => (body += chunk.toString()));
    req.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        reject(new Error("Invalid JSON body"));
      }
    });
    req.on("error", reject);
  });
}

export async function handleApiRequest(req, res) {
  // CORS Preflight
  if (req.method === "OPTIONS") {
    res.writeHead(200, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization"
    });
    res.end();
    return;
  }

  const parsed = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  const pathname = parsed.pathname;
  const searchParams = parsed.searchParams;
  const method = req.method;

  try {
    // ----------------------------------------------------
    // 1. GET /api/health
    // ----------------------------------------------------
    if (method === "GET" && pathname === "/api/health") {
      return sendJson(res, 200, {
        status: "ok",
        service: "CivicPulse API",
        version: "Final Clean MVP",
        database: "Active",
        hasRoboflowKey: Boolean(process.env.ROBOFLOW_API_KEY)
      });
    }

    // ----------------------------------------------------
    // 2. POST /api/analyze-image (AI Analysis)
    // ----------------------------------------------------
    if (method === "POST" && pathname === "/api/analyze-image") {
      const body = await parseBody(req);
      const image = body.image || body.imageUrl;
      const selectedCategory = body.selectedCategory || body.selectedType || "Pothole";

      if (!image) {
        return sendJson(res, 400, { error: "Image is required for AI analysis" });
      }

      const visionResult = await analyzeIncidentImage({
        image,
        selectedType: selectedCategory,
        location: body.location || "MG Road, Sector 4",
        description: body.description || ""
      });

      const aiCatNorm = normalizeCategory(visionResult.predictedType || "Pothole");
      const selectedCatNorm = normalizeCategory(selectedCategory);
      const isMismatch = checkMismatch(selectedCatNorm, aiCatNorm);

      return sendJson(res, 200, {
        aiCategory: aiCatNorm,
        predictedType: aiCatNorm,
        confidence: typeof visionResult.confidence === "number" ? visionResult.confidence : 0.91,
        confidencePercent: visionResult.confidencePercent || 91,
        observation: visionResult.description || "Visible civic defect identified in photographic evidence.",
        description: visionResult.description || "Visible civic defect identified in photographic evidence.",
        mismatch: isMismatch,
        categoryMismatch: isMismatch,
        recommendedDepartment: getRecommendedDepartment(aiCatNorm),
        estimatedResolutionTime: RESOLUTION_TIME_MAP[aiCatNorm] || "2–3 Days",
        source: visionResult.source || "local_classifier"
      });
    }

    // ----------------------------------------------------
    // 3. POST /api/incidents (Create Incident)
    // ----------------------------------------------------
    if (method === "POST" && pathname === "/api/incidents") {
      const body = await parseBody(req);
      const rawImage = body.imageUrl || body.image;
      const selectedCategory = normalizeCategory(body.category || body.selectedCategory || body.type || "Pothole");
      const finalCategory = normalizeCategory(body.finalCategory || body.category || body.selectedCategory || body.type || "Pothole");
      const aiCategory = normalizeCategory(body.aiCategory || body.aiPredictedType || selectedCategory);

      if (!rawImage) {
        return sendJson(res, 400, { error: "Image is required to create an incident" });
      }

      const recommendedDepartment = getRecommendedDepartment(finalCategory);

      // Resolve shared location object
      const locObj = body.locationId
        ? getLocationById(body.locationId)
        : getLocationByAddress(body.locationAddress || body.address || body.location);

      const locationAddress = body.locationAddress || body.address || locObj.address;
      const latitude = typeof body.latitude === "number" ? body.latitude : locObj.latitude;
      const longitude = typeof body.longitude === "number" ? body.longitude : locObj.longitude;

      const newIncident = db.create({
        imageUrl: rawImage,
        selectedCategory,
        aiCategory,
        finalCategory,
        aiConfidence: typeof body.aiConfidence === "number" ? Math.max(0, Math.min(1, body.aiConfidence)) : (body.confidence ? body.confidence / 100 : 0.91),
        aiObservation: body.aiObservation || body.observation || body.description || "Defect verified by AI Computer Vision.",
        locationId: locObj.id,
        locationAddress,
        latitude,
        longitude,
        recommendedDepartment,
        assignedDepartment: recommendedDepartment
      });

      return sendJson(res, 201, formatIncidentResponse(newIncident));
    }

    // ----------------------------------------------------
    // 4. GET /api/incidents (List Incidents)
    // ----------------------------------------------------
    if (method === "GET" && pathname === "/api/incidents") {
      const filters = {
        category: searchParams.get("category"),
        status: searchParams.get("status")
      };
      const list = db.getAll(filters);
      return sendJson(res, 200, list.map(formatIncidentResponse));
    }

    // ----------------------------------------------------
    // 5. GET /api/citizen/reports (Citizen Reports)
    // ----------------------------------------------------
    if (method === "GET" && pathname === "/api/citizen/reports") {
      const list = db.getAll();
      return sendJson(res, 200, list.map(formatIncidentResponse));
    }

    // ----------------------------------------------------
    // 6. GET /api/heatmap (Heatmap Data)
    // ----------------------------------------------------
    if (method === "GET" && pathname === "/api/heatmap") {
      const heatmap = db.getHeatmap();
      return sendJson(res, 200, heatmap);
    }

    // ----------------------------------------------------
    // 7. POST /api/demo/reset (Internal Development Reset)
    // ----------------------------------------------------
    if (method === "POST" && pathname === "/api/demo/reset") {
      const resetList = db.reset();
      return sendJson(res, 200, {
        success: true,
        message: "Database reset to clean state.",
        incidents: resetList.map(formatIncidentResponse)
      });
    }

    // ----------------------------------------------------
    // 8. GET /api/incidents/:ticketId (Single Incident)
    // ----------------------------------------------------
    const singleMatch = pathname.match(/^\/api\/incidents\/([A-Za-z0-9-]+)$/);
    if (method === "GET" && singleMatch) {
      const ticketId = singleMatch[1];
      const incident = db.getByTicketId(ticketId);
      if (!incident) {
        return sendJson(res, 404, { error: "Incident not found" });
      }
      return sendJson(res, 200, formatIncidentResponse(incident));
    }

    // ----------------------------------------------------
    // DELETE /api/incidents/:ticketId (Delete Report)
    // ----------------------------------------------------
    if (method === "DELETE" && singleMatch) {
      const ticketId = singleMatch[1];
      const success = db.delete(ticketId);
      if (!success) {
        return sendJson(res, 404, { success: false, message: "Incident not found" });
      }
      return sendJson(res, 200, { success: true, message: "Incident deleted successfully" });
    }

    // ----------------------------------------------------
    // 9. PATCH /api/incidents/:ticketId/status (Update Status)
    // ----------------------------------------------------
    const statusMatch = pathname.match(/^\/api\/incidents\/([A-Za-z0-9-]+)\/status$/);
    if (method === "PATCH" && statusMatch) {
      const ticketId = statusMatch[1];
      const body = await parseBody(req);
      const newStatus = body.status;

      if (!newStatus) {
        return sendJson(res, 400, { error: "Status field is required (NEW, IN_PROGRESS, RESOLVED)" });
      }

      const current = db.getByTicketId(ticketId);
      if (!current) {
        return sendJson(res, 404, { error: "Incident not found" });
      }

      const normalizedStatus = newStatus.toUpperCase().replace(/\s+/g, "_");
      if (normalizedStatus === "RESOLVED" && !current.resolutionImageUrl && !body.resolutionImageUrl && !body.afterImage && !body.resolutionPhoto) {
        return sendJson(res, 400, {
          error: "Resolution photo required. Upload an after-resolution photo before marking this incident as resolved.",
          message: "Resolution photo required. Upload an after-resolution photo before marking this incident as resolved."
        });
      }

      try {
        const updated = db.updateStatus(ticketId, newStatus, body.resolutionNote);
        return sendJson(res, 200, formatIncidentResponse(updated));
      } catch (err) {
        return sendJson(res, 400, { error: err.message, message: err.message });
      }
    }

    // ----------------------------------------------------
    // 10. PATCH /api/incidents/:ticketId/resolution (Update Resolution)
    // ----------------------------------------------------
    const resolutionMatch = pathname.match(/^\/api\/incidents\/([A-Za-z0-9-]+)\/resolution$/);
    if (method === "PATCH" && resolutionMatch) {
      const ticketId = resolutionMatch[1];
      const body = await parseBody(req);

      const afterImage = body.resolutionImageUrl || body.afterImage || body.resolutionPhoto || body.image;
      if (!afterImage) {
        return sendJson(res, 400, { error: "After-resolution photo is required." });
      }

      const markResolved = body.markResolved !== undefined ? Boolean(body.markResolved) : (body.status ? body.status.toUpperCase() === "RESOLVED" : true);

      const updated = db.updateResolution(
        ticketId,
        body.resolutionNote || "Issue repaired and certified.",
        afterImage,
        markResolved
      );

      if (!updated) {
        return sendJson(res, 404, { error: "Incident not found" });
      }

      return sendJson(res, 200, formatIncidentResponse(updated));
    }

    // ----------------------------------------------------
    // 11. PATCH /api/incidents/:ticketId/feedback (Submit Rating)
    // ----------------------------------------------------
    const feedbackMatch = pathname.match(/^\/api\/incidents\/([A-Za-z0-9-]+)\/feedback$/);
    if (method === "PATCH" && feedbackMatch) {
      const ticketId = feedbackMatch[1];
      const body = await parseBody(req);
      const rating = body.rating;

      if (!rating) {
        return sendJson(res, 400, { error: "Rating is required (1-5)" });
      }

      const updated = db.updateFeedback(ticketId, rating);
      if (!updated) {
        return sendJson(res, 404, { error: "Incident not found" });
      }

      return sendJson(res, 200, formatIncidentResponse(updated));
    }

    // ----------------------------------------------------
    // 12. PATCH /api/incidents/:ticketId/reopen (Reopen Incident)
    // ----------------------------------------------------
    const reopenMatch = pathname.match(/^\/api\/incidents\/([A-Za-z0-9-]+)\/reopen$/);
    if (method === "PATCH" && reopenMatch) {
      const ticketId = reopenMatch[1];
      const body = await parseBody(req);

      const updated = db.reopenIncident(ticketId, body.reason || "Citizen requested reopening due to low satisfaction.");
      if (!updated) {
        return sendJson(res, 404, { error: "Incident not found" });
      }

      return sendJson(res, 200, formatIncidentResponse(updated));
    }

    // 404 Catch-All
    return sendJson(res, 404, { error: "Endpoint not found" });
  } catch (error) {
    console.error("[Server Error]", error);
    return sendJson(res, 500, { error: "Internal server error" });
  }
}

// Format database record to clean JSON response
function formatIncidentResponse(record) {
  if (!record) return null;

  const displayType = normalizeCategory(record.finalCategory || record.selectedCategory);
  const statusDisplay = record.status === "NEW" ? "New" : record.status === "IN_PROGRESS" ? "In Progress" : record.status === "REOPENED" ? "Reopened" : "Resolved";

  const reportCount = record.reportCount || 1;
  const priorityScore = typeof record.priorityScore === "number" ? record.priorityScore : (reportCount >= 5 ? 100 : reportCount === 4 ? 90 : reportCount === 3 ? 80 : reportCount === 2 ? 60 : 40);
  const priorityLevel = record.priorityLevel || (priorityScore >= 80 ? "Critical" : priorityScore >= 60 ? "High" : "Medium");

  return {
    id: record.ticketId,
    ticketId: record.ticketId,
    type: displayType,
    category: record.finalCategory,
    selectedCategory: record.selectedCategory,
    aiCategory: record.aiCategory,
    finalCategory: record.finalCategory,
    reportCount,
    priorityScore,
    priorityLevel,
    citizenRating: record.citizenRating || null,
    rating: record.citizenRating || null,
    isReopened: Boolean(record.isReopened),
    priority: {
      score: priorityScore,
      level: priorityLevel,
      count: reportCount
    },
    image: record.imageUrl,
    imageUrl: record.imageUrl,
    aiConfidence: record.aiConfidence,
    confidence: Math.round((record.aiConfidence || 0.91) * 100),
    confidencePercent: Math.round((record.aiConfidence || 0.91) * 100),
    observation: record.aiObservation,
    aiObservation: record.aiObservation,
    description: record.aiObservation,
    location: record.locationAddress,
    locationId: record.locationId,
    locationAddress: record.locationAddress,
    address: record.locationAddress,
    latitude: record.latitude,
    longitude: record.longitude,
    department: record.recommendedDepartment,
    recommendedDepartment: record.recommendedDepartment,
    assignedDepartment: record.assignedDepartment || record.recommendedDepartment,
    estimatedResolutionTime: RESOLUTION_TIME_MAP[displayType] || "2–3 Days",
    status: statusDisplay,
    statusCode: record.status,
    resolutionNote: record.resolutionNote,
    resolutionImageUrl: record.resolutionImageUrl,
    resolvedAt: record.resolvedAt,
    resolutionEvidence: record.resolutionImageUrl || record.resolutionNote ? {
      beforeImage: record.imageUrl,
      afterImage: record.resolutionImageUrl || null,
      note: record.resolutionNote || "Repairs executed to standard specifications."
    } : null,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
    reportedDate: new Date(record.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    timeline: [
      { step: "Reported", time: "Logged", desc: "Citizen reported the issue", done: true, current: false },
      { step: "AI Verified", time: "Verified", desc: `AI classified ${displayType}`, done: true, current: record.status === "NEW" },
      { step: "Assigned", time: "Dispatched", desc: `Assigned to ${record.recommendedDepartment}`, done: record.status !== "NEW", current: false },
      { step: "In Progress", time: "Active", desc: "Field crew active on-site", done: record.status === "IN_PROGRESS" || record.status === "RESOLVED", current: record.status === "IN_PROGRESS" },
      { step: "Resolved", time: "Completed", desc: record.resolutionNote || "Repair certified & closed by municipal authority", done: record.status === "RESOLVED", current: record.status === "RESOLVED" }
    ]
  };
}

// Standalone runner
if (process.argv[1]?.endsWith("server.js")) {
  const server = http.createServer(handleApiRequest);
  server.listen(PORT, () => {
    console.log(`[CivicPulse Backend] Server running on http://localhost:${PORT}`);
  });
}
