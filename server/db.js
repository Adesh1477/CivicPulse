/**
 * CivicPulse MVP Database Layer
 * SQLite-backed persistent database with automatic fallback.
 * Compatible with local dev, standalone Node, and Vercel Serverless.
 */

import fs from "fs";
import path from "path";
import os from "os";
import { fileURLToPath } from "url";
import { calculatePriority } from "./priorityEngine.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// On Vercel Serverless, use writable os.tmpdir(), otherwise local ./data
let DATA_DIR = process.env.VERCEL ? path.join(os.tmpdir(), "civicpulse_data") : path.join(__dirname, "data");

try {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
} catch (err) {
  // Fallback to OS temp directory if local directory is read-only
  DATA_DIR = path.join(os.tmpdir(), "civicpulse_data");
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

const DB_FILE = path.join(DATA_DIR, "civicpulse.db");
const JSON_BACKUP_FILE = path.join(DATA_DIR, "incidents.json");

// Clean initial state (zero hardcoded / mock incidents)
export const SEED_INCIDENTS = [];

// Persistent SQLite / JSON Repository Implementation
class IncidentDatabase {
  constructor() {
    this.useSqlite = false;
    this.sqliteDb = null;
    this.memoryIncidents = [];
    this.init();
  }

  init() {
    try {
      // Try built-in Node 22+ SQLite
      const { DatabaseSync } = awaitImportNodeSqlite();
      if (DatabaseSync) {
        this.sqliteDb = new DatabaseSync(DB_FILE);
        this.useSqlite = true;
        this.initSqliteSchema();
        console.log("[DB] SQLite database initialized at", DB_FILE);
        return;
      }
    } catch (e) {
      // Fallback to JSON file storage
    }

    this.initJsonStore();
    console.log("[DB] File-backed JSON repository initialized at", JSON_BACKUP_FILE);
  }

  initSqliteSchema() {
    this.sqliteDb.exec(`
      CREATE TABLE IF NOT EXISTS incidents (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ticketId TEXT UNIQUE NOT NULL,
        imageUrl TEXT,
        selectedCategory TEXT NOT NULL,
        aiCategory TEXT,
        finalCategory TEXT NOT NULL,
        aiConfidence REAL DEFAULT 0.0,
        aiObservation TEXT,
        locationId TEXT,
        locationAddress TEXT,
        latitude REAL,
        longitude REAL,
        recommendedDepartment TEXT,
        assignedDepartment TEXT,
        reportCount INTEGER DEFAULT 1,
        priorityScore INTEGER DEFAULT 40,
        priorityLevel TEXT DEFAULT 'Medium',
        status TEXT DEFAULT 'NEW',
        resolutionNote TEXT,
        resolutionImageUrl TEXT,
        resolvedAt TEXT,
        createdAt TEXT,
        updatedAt TEXT
      );
    `);

    try {
      this.sqliteDb.exec("ALTER TABLE incidents ADD COLUMN locationId TEXT");
    } catch {}

    try {
      this.sqliteDb.exec("ALTER TABLE incidents ADD COLUMN resolvedAt TEXT");
    } catch {}

    try {
      this.sqliteDb.exec("ALTER TABLE incidents ADD COLUMN reportCount INTEGER DEFAULT 1");
    } catch {}

    try {
      this.sqliteDb.exec("ALTER TABLE incidents ADD COLUMN priorityScore INTEGER DEFAULT 40");
    } catch {}

    try {
      this.sqliteDb.exec("ALTER TABLE incidents ADD COLUMN priorityLevel TEXT DEFAULT 'Medium'");
    } catch {}

    try {
      this.sqliteDb.exec("ALTER TABLE incidents ADD COLUMN citizenRating INTEGER DEFAULT NULL");
    } catch {}

    try {
      this.sqliteDb.exec("ALTER TABLE incidents ADD COLUMN isReopened INTEGER DEFAULT 0");
    } catch {}
  }

  initJsonStore() {
    if (fs.existsSync(JSON_BACKUP_FILE)) {
      try {
        const raw = fs.readFileSync(JSON_BACKUP_FILE, "utf-8");
        this.memoryIncidents = JSON.parse(raw);
      } catch {
        this.memoryIncidents = [];
        this.persistJson();
      }
    } else {
      this.memoryIncidents = [];
      this.persistJson();
    }
  }

  persistJson() {
    try {
      fs.writeFileSync(JSON_BACKUP_FILE, JSON.stringify(this.memoryIncidents, null, 2), "utf-8");
    } catch (err) {
      console.warn("[DB] Warning saving JSON backup:", err.message);
    }
  }

  // --- CRUD API METHODS ---

  getAll(filters = {}) {
    if (this.useSqlite) {
      let query = "SELECT * FROM incidents WHERE 1=1";
      const params = [];

      if (filters.category && filters.category !== "All") {
        query += " AND (UPPER(finalCategory) = UPPER(?) OR UPPER(selectedCategory) = UPPER(?))";
        params.push(filters.category, filters.category);
      }
      if (filters.status && filters.status !== "All") {
        query += " AND UPPER(status) = UPPER(?)";
        params.push(filters.status.replace(/\s+/g, "_"));
      }

      query += " ORDER BY priorityScore DESC, id DESC";
      const stmt = this.sqliteDb.prepare(query);
      return stmt.all(...params);
    }

    // JSON fallback
    let list = [...this.memoryIncidents];
    if (filters.category && filters.category !== "All") {
      const cat = filters.category.toUpperCase();
      list = list.filter(i => i.finalCategory?.toUpperCase() === cat || i.selectedCategory?.toUpperCase() === cat);
    }
    if (filters.status && filters.status !== "All") {
      const st = filters.status.toUpperCase().replace(/\s+/g, "_");
      list = list.filter(i => i.status?.toUpperCase() === st);
    }
    return list.sort((a, b) => {
      const scoreDiff = (b.priorityScore || 40) - (a.priorityScore || 40);
      if (scoreDiff !== 0) return scoreDiff;
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    });
  }

  getByTicketId(ticketId) {
    if (this.useSqlite) {
      const stmt = this.sqliteDb.prepare("SELECT * FROM incidents WHERE ticketId = ?");
      return stmt.get(ticketId) || null;
    }
    return this.memoryIncidents.find(i => i.ticketId === ticketId) || null;
  }

  getNextTicketId() {
    const all = this.getAll();
    let max = 1280;
    for (const inc of all) {
      const match = inc.ticketId?.match(/CP-(\d+)/);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > max) max = num;
      }
    }
    return `CP-${max + 1}`;
  }

  create(incidentData) {
    const finalCategory = incidentData.finalCategory || incidentData.selectedCategory || "Pothole";
    const locationId = incidentData.locationId || "mg-road-sector-4";
    const locationAddress = incidentData.locationAddress || incidentData.location?.address || incidentData.location || "MG Road, Sector 4";
    const now = new Date().toISOString();

    // 1. Check for existing active/non-resolved incident with exact SAME issue category AND exact SAME location
    if (this.useSqlite) {
      const findStmt = this.sqliteDb.prepare(`
        SELECT * FROM incidents
        WHERE UPPER(finalCategory) = UPPER(?)
          AND (UPPER(locationAddress) = UPPER(?) OR locationId = ?)
          AND UPPER(status) != 'RESOLVED'
        ORDER BY id DESC LIMIT 1
      `);
      const existing = findStmt.get(finalCategory, locationAddress, locationId);

      if (existing) {
        const nextReportCount = (existing.reportCount || 1) + 1;
        const { priorityScore, priorityLevel } = calculatePriority(nextReportCount);
        const updateStmt = this.sqliteDb.prepare(`
          UPDATE incidents
          SET reportCount = ?, priorityScore = ?, priorityLevel = ?, updatedAt = ?
          WHERE ticketId = ?
        `);
        updateStmt.run(nextReportCount, priorityScore, priorityLevel, now, existing.ticketId);
        return this.getByTicketId(existing.ticketId);
      }
    } else {
      const normCat = finalCategory.trim().toUpperCase();
      const normLoc = locationAddress.trim().toUpperCase();
      const existingIndex = this.memoryIncidents.findIndex(i =>
        (i.finalCategory?.trim().toUpperCase() === normCat || i.selectedCategory?.trim().toUpperCase() === normCat) &&
        (i.locationAddress?.trim().toUpperCase() === normLoc || (i.locationId && i.locationId === locationId)) &&
        (i.status || "").toUpperCase() !== "RESOLVED"
      );

      if (existingIndex !== -1) {
        const existing = this.memoryIncidents[existingIndex];
        const nextReportCount = (existing.reportCount || 1) + 1;
        const { priorityScore, priorityLevel } = calculatePriority(nextReportCount);
        this.memoryIncidents[existingIndex] = {
          ...existing,
          reportCount: nextReportCount,
          priorityScore,
          priorityLevel,
          updatedAt: now
        };
        this.persistJson();
        return this.memoryIncidents[existingIndex];
      }
    }

    // 2. If no matching incident exists, create new problem record with reportCount = 1 and initial priority
    const ticketId = incidentData.ticketId || this.getNextTicketId();
    const { priorityScore, priorityLevel } = calculatePriority(1);

    const record = {
      ticketId,
      imageUrl: incidentData.imageUrl || incidentData.image || "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80",
      selectedCategory: incidentData.selectedCategory || "Pothole",
      aiCategory: incidentData.aiCategory || incidentData.selectedCategory || "Pothole",
      finalCategory,
      aiConfidence: typeof incidentData.aiConfidence === "number" ? incidentData.aiConfidence : 0.91,
      aiObservation: incidentData.aiObservation || incidentData.observation || "Visual defect identified in submitted evidence.",
      locationId,
      locationAddress,
      latitude: typeof incidentData.latitude === "number" ? incidentData.latitude : (incidentData.location?.latitude || 28.6139),
      longitude: typeof incidentData.longitude === "number" ? incidentData.longitude : (incidentData.location?.longitude || 77.2090),
      recommendedDepartment: incidentData.recommendedDepartment || "Road Maintenance Department",
      assignedDepartment: incidentData.assignedDepartment || incidentData.recommendedDepartment || "Road Maintenance Department",
      reportCount: 1,
      priorityScore,
      priorityLevel,
      status: "NEW",
      resolutionNote: null,
      resolutionImageUrl: null,
      resolvedAt: null,
      createdAt: now,
      updatedAt: now
    };

    if (this.useSqlite) {
      const stmt = this.sqliteDb.prepare(`
        INSERT INTO incidents (
          ticketId, imageUrl, selectedCategory, aiCategory, finalCategory,
          aiConfidence, aiObservation,
          locationId, locationAddress, latitude, longitude, recommendedDepartment, assignedDepartment,
          reportCount, priorityScore, priorityLevel,
          status, resolutionNote, resolutionImageUrl, resolvedAt, createdAt, updatedAt
        ) VALUES (
          ?, ?, ?, ?, ?,
          ?, ?,
          ?, ?, ?, ?, ?, ?,
          ?, ?, ?,
          ?, ?, ?, ?, ?, ?
        )
      `);
      stmt.run(
        record.ticketId, record.imageUrl, record.selectedCategory, record.aiCategory, record.finalCategory,
        record.aiConfidence, record.aiObservation,
        record.locationId, record.locationAddress, record.latitude, record.longitude, record.recommendedDepartment, record.assignedDepartment,
        record.reportCount, record.priorityScore, record.priorityLevel,
        record.status, record.resolutionNote, record.resolutionImageUrl, record.resolvedAt, record.createdAt, record.updatedAt
      );
      return this.getByTicketId(ticketId);
    }

    this.memoryIncidents.unshift(record);
    this.persistJson();
    return record;
  }

  updateStatus(ticketId, newStatus, resolutionNote = null) {
    const validStatuses = ["NEW", "IN_PROGRESS", "RESOLVED", "REOPENED"];
    const normalized = newStatus?.toUpperCase().replace(/\s+/g, "_");
    if (!validStatuses.includes(normalized)) {
      throw new Error(`Invalid status: ${newStatus}. Allowed values: NEW, IN_PROGRESS, RESOLVED, REOPENED`);
    }

    const current = this.getByTicketId(ticketId);
    if (!current) return null;

    const isResolved = normalized === "RESOLVED";
    if (isResolved && !current.resolutionImageUrl) {
      throw new Error("Resolution photo required. Upload an after-resolution photo before marking this incident as resolved.");
    }

    const now = new Date().toISOString();

    if (this.useSqlite) {
      const stmt = this.sqliteDb.prepare(`
        UPDATE incidents
        SET status = ?, resolutionNote = COALESCE(?, resolutionNote), resolvedAt = CASE WHEN ? = 1 THEN ? ELSE resolvedAt END, updatedAt = ?
        WHERE ticketId = ?
      `);
      stmt.run(normalized, resolutionNote, isResolved ? 1 : 0, now, now, ticketId);
      return this.getByTicketId(ticketId);
    }

    const idx = this.memoryIncidents.findIndex(i => i.ticketId === ticketId);
    if (idx === -1) return null;

    this.memoryIncidents[idx] = {
      ...this.memoryIncidents[idx],
      status: normalized,
      resolutionNote: resolutionNote || this.memoryIncidents[idx].resolutionNote,
      resolvedAt: isResolved ? (this.memoryIncidents[idx].resolvedAt || now) : this.memoryIncidents[idx].resolvedAt,
      updatedAt: now
    };
    this.persistJson();
    return this.memoryIncidents[idx];
  }

  updateResolution(ticketId, resolutionNote, resolutionImageUrl, markResolved = true) {
    const now = new Date().toISOString();
    const newStatus = markResolved ? "RESOLVED" : "IN_PROGRESS";

    if (this.useSqlite) {
      const stmt = this.sqliteDb.prepare(`
        UPDATE incidents
        SET status = ?, resolutionNote = ?, resolutionImageUrl = ?, resolvedAt = CASE WHEN ? = 1 THEN COALESCE(resolvedAt, ?) ELSE resolvedAt END, updatedAt = ?
        WHERE ticketId = ?
      `);
      stmt.run(newStatus, resolutionNote || "Issue resolved.", resolutionImageUrl, markResolved ? 1 : 0, now, now, ticketId);
      return this.getByTicketId(ticketId);
    }

    const idx = this.memoryIncidents.findIndex(i => i.ticketId === ticketId);
    if (idx === -1) return null;

    this.memoryIncidents[idx] = {
      ...this.memoryIncidents[idx],
      status: newStatus,
      resolutionNote: resolutionNote || "Issue resolved.",
      resolutionImageUrl: resolutionImageUrl || this.memoryIncidents[idx].resolutionImageUrl,
      resolvedAt: markResolved ? (this.memoryIncidents[idx].resolvedAt || now) : this.memoryIncidents[idx].resolvedAt,
      updatedAt: now
    };
    this.persistJson();
    return this.memoryIncidents[idx];
  }

  updateFeedback(ticketId, rating) {
    const now = new Date().toISOString();
    const numericRating = Math.min(5, Math.max(1, parseInt(rating, 10) || 5));

    if (this.useSqlite) {
      const stmt = this.sqliteDb.prepare(`
        UPDATE incidents
        SET citizenRating = ?, updatedAt = ?
        WHERE ticketId = ?
      `);
      stmt.run(numericRating, now, ticketId);
      return this.getByTicketId(ticketId);
    }

    const idx = this.memoryIncidents.findIndex(i => i.ticketId === ticketId);
    if (idx === -1) return null;

    this.memoryIncidents[idx] = {
      ...this.memoryIncidents[idx],
      citizenRating: numericRating,
      updatedAt: now
    };
    this.persistJson();
    return this.memoryIncidents[idx];
  }

  reopenIncident(ticketId, reason = "Citizen requested reopening due to low satisfaction.") {
    const now = new Date().toISOString();

    if (this.useSqlite) {
      const stmt = this.sqliteDb.prepare(`
        UPDATE incidents
        SET status = 'REOPENED',
            isReopened = 1,
            resolutionImageUrl = NULL,
            resolvedAt = NULL,
            citizenRating = NULL,
            resolutionNote = ?,
            updatedAt = ?
        WHERE ticketId = ?
      `);
      stmt.run(reason, now, ticketId);
      return this.getByTicketId(ticketId);
    }

    const idx = this.memoryIncidents.findIndex(i => i.ticketId === ticketId);
    if (idx === -1) return null;

    this.memoryIncidents[idx] = {
      ...this.memoryIncidents[idx],
      status: "REOPENED",
      isReopened: 1,
      resolutionImageUrl: null,
      resolvedAt: null,
      citizenRating: null,
      resolutionNote: reason,
      updatedAt: now
    };
    this.persistJson();
    return this.memoryIncidents[idx];
  }

  delete(ticketId) {
    const existing = this.getByTicketId(ticketId);
    if (!existing) return false;

    if (this.useSqlite) {
      const stmt = this.sqliteDb.prepare("DELETE FROM incidents WHERE ticketId = ?");
      stmt.run(ticketId);
      return true;
    }

    const idx = this.memoryIncidents.findIndex(i => i.ticketId === ticketId);
    if (idx === -1) return false;
    this.memoryIncidents.splice(idx, 1);
    this.persistJson();
    return true;
  }

  getHeatmap() {
    const all = this.getAll();
    return all.map(i => ({
      id: i.ticketId,
      ticketId: i.ticketId,
      locationId: i.locationId,
      latitude: i.latitude,
      longitude: i.longitude,
      category: i.finalCategory,
      type: i.finalCategory,
      status: i.status,
      reportCount: i.reportCount || 1,
      priorityScore: i.priorityScore || 40,
      priorityLevel: i.priorityLevel || "Medium",
      locationAddress: i.locationAddress,
      location: i.locationAddress
    }));
  }

  reset() {
    if (this.useSqlite) {
      this.sqliteDb.exec("DELETE FROM incidents");
      return [];
    }
    this.memoryIncidents = [];
    this.persistJson();
    return [];
  }
}

function awaitImportNodeSqlite() {
  try {
    const nodeSqlite = Buffer.from("bm9kZTpzcWxpdGU=", "base64").toString("utf-8"); // 'node:sqlite'
    return { DatabaseSync: globalThis.process?.getBuiltinModule ? globalThis.process.getBuiltinModule(nodeSqlite)?.DatabaseSync : null };
  } catch {
    return { DatabaseSync: null };
  }
}

export const db = new IncidentDatabase();
