import fs from 'fs';
import path from 'path';
import type { BlockRequestRecord, RequestStatus } from '../types/request';
export type { RequestStatus };
import { supabaseClient, isSupabaseConfigured } from './supabase';

// Path to persistent fallback database storage inside project database/data/
const DB_DIR = path.resolve(process.cwd(), '..', 'database', 'data');
const DB_FILE = path.join(DB_DIR, 'block_requests.json');

// In-memory cache to make reads super fast
let cachedRequests: BlockRequestRecord[] | null = null;
let lastCacheTime = 0;
let inFlightGetRequests: Promise<BlockRequestRecord[]> | null = null;
const CACHE_TTL_MS = 5000; // 5 seconds cache for server-side responses

// Ensure fallback database directory exists
function ensureDbStorage(): void {
  try {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify([], null, 2), 'utf-8');
    }
  } catch (err) {
    console.error('Error initializing database storage:', err);
  }
}

// Read records from local persistent JSON store
function readLocalRecords(): BlockRequestRecord[] {
  ensureDbStorage();
  try {
    const data = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(data || '[]');
  } catch {
    return [];
  }
}

// Write records to local persistent JSON store
function writeLocalRecords(records: BlockRequestRecord[]): void {
  ensureDbStorage();
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(records, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing to local database file:', err);
  }
}

// Realistic seed data for COA Approved blocks in Indian Railways
export const INITIAL_COA_APPROVED_BLOCKS: BlockRequestRecord[] = [
  {
    id: 'BLK-COA-SR-2026-081',
    department: 'ENGINEERING',
    departmentName: 'Civil Engineering',
    systemName: 'TMS',
    status: 'APPROVED',
    priority: 'NORMAL',
    urgency: 'ROUTINE',
    corridor: 'Erode Jn - Chennai Central (ED-MAS) Main Line via Salem, Jolarpettai & Katpadi',
    blockSection: 'Erode Jn (ED) - Cauvery (CV)',
    fromLocation: 'Erode Jn (ED)',
    toLocation: 'Cauvery (CV)',
    line: 'UP',
    chainage: 'Km 394/12 to 397/00',
    assetType: 'Track',
    assetId: 'TRK-ED-UP-088',
    assetCondition: 'FAIR',
    defectReason: 'Track packing & deep tamping post-monsoon ballast stabilization',
    maintenanceType: 'Plain Track Tamping (CSM / Duomatic)',
    description: 'Continuous mechanized track tamping, leveling and lining by CSM-09 Machine between ED and CV.',
    requestedDate: '2026-09-22',
    preferredDate: '2026-09-23',
    preferredStartTime: '01:30',
    preferredEndTime: '05:00',
    durationFormatted: '3 hrs 30 mins',
    durationMinutesTotal: 210,
    requestedBy: 'K. Ramanathan',
    designation: 'Sr. Section Engineer (P-Way / Erode)',
    contactNumber: '09444023145',
    operationalRequirements: [
      { label: 'Traffic Block Required', value: true },
      { label: 'S&T Disconnection Required', value: false },
      { label: 'Post-Block Speed Restriction (TSR)', value: '45 kmph caution order' },
      { label: 'Machinery Deployed', value: ['Continuous Tamping Machine (CSM)'] }
    ],
    equipmentRequired: ['Continuous Tamping Machine (CSM)', 'Dynamic Track Stabilizer (DGS)'],
    teamSize: 14,
    safetyRequirements: [
      'Banner flags and detonators placed at 600m & 1200m as per IR P-Way manual',
      'Caution order to Loco Pilots of adjoining line',
      'Walkie-talkie communication between Site Supervisor and Station Master ED'
    ],
    remarks: 'COA Sanction Ref: COA/SR/MAS-DIV/2026/09/BLK-4821. Approved by Sr.DOM / Operating Control Room.',
    timeline: [
      {
        status: 'SUBMITTED',
        label: 'Block Indent Submitted to Division Cell',
        timestamp: '2026-09-22 14:00',
        officer: 'K. Ramanathan (SSE/P-Way)',
        isCompleted: true,
        isCurrent: false
      },
      {
        status: 'UNDER_PLANNING',
        label: 'Section Controller Slot Simulation & Train Path Check',
        timestamp: '2026-09-22 16:30',
        officer: 'Chief Controller / Section Controller (Erode Section)',
        isCompleted: true,
        isCurrent: false
      },
      {
        status: 'APPROVED',
        label: 'Block Sanctioned by Sr.DOM in COA',
        timestamp: '2026-09-22 18:45',
        officer: 'Sr.DOM (Operating) / COA System',
        note: 'COA Sanction Order #4821 generated. Traffic block sanctioned between 01:30 and 05:00 IST.',
        isCompleted: true,
        isCurrent: true
      },
      {
        status: 'COMPLETED',
        label: 'Block Completion & Track Fit Certificate',
        isCompleted: false,
        isCurrent: false
      }
    ],
    createdAt: '2026-09-22T13:15:00.000Z',
    updatedAt: '2026-09-22T18:45:00.000Z'
  },
  {
    id: 'BLK-COA-SR-2026-094',
    department: 'TRD',
    departmentName: 'Traction Distribution (TRD)',
    systemName: 'TDMS',
    status: 'APPROVED',
    priority: 'NORMAL',
    urgency: 'ROUTINE',
    corridor: 'Erode Jn - Chennai Central (ED-MAS) Main Line via Salem, Jolarpettai & Katpadi',
    blockSection: 'Salem Jn (SA) - Magudanchavadi (MVG)',
    fromLocation: 'Salem Jn (SA)',
    toLocation: 'Magudanchavadi (MVG)',
    line: 'DOWN',
    chainage: 'Km 332/04 to 336/20',
    assetType: 'OHE',
    assetId: 'OHE-SA-DWN-14',
    assetCondition: 'FAIR',
    defectReason: 'Annual maintenance of OHE, contact wire wear check and insulator cleaning',
    maintenanceType: 'Annual Maintenance of OHE (AOH)',
    description: 'Overhaul of section insulators, dropper replacement, contact wire stagger check by Tower Wagon.',
    requestedDate: '2026-09-22',
    preferredDate: '2026-09-23',
    preferredStartTime: '02:00',
    preferredEndTime: '05:00',
    durationFormatted: '3 hrs 00 mins',
    durationMinutesTotal: 180,
    requestedBy: 'S. Vigneswaran',
    designation: 'SSE / TRD (OHE / Salem)',
    contactNumber: '09444187652',
    operationalRequirements: [
      { label: 'Power Shutdown Required (25 kV OHE)', value: true },
      { label: 'Traction Discharge Rod Earthing', value: true },
      { label: '8-Wheeler Tower Wagon DETC permitted', value: true }
    ],
    equipmentRequired: ['8-Wheeler Tower Wagon (DETC)', 'Traction Discharge Rods', 'Contact Wire Tension Gauge'],
    teamSize: 10,
    safetyRequirements: [
      'Power isolation confirmed by TPC (Traction Power Controller)',
      'Discharge rods clamped to rail before staff climb tower ladder',
      'Adjacent live wire warning boards displayed'
    ],
    remarks: 'COA Sanction Ref: COA/SR/TPJ-SA/2026/09/BLK-5190. Power shutdown approved by TPC & Sr.DEE/TRD.',
    timeline: [
      {
        status: 'SUBMITTED',
        label: 'TRD Indent Logged in TDMS',
        timestamp: '2026-09-22 11:20',
        officer: 'S. Vigneswaran (SSE/TRD)',
        isCompleted: true,
        isCurrent: false
      },
      {
        status: 'UNDER_PLANNING',
        label: 'Power Shutdown Coordination with TPC & Operating',
        timestamp: '2026-09-22 15:10',
        officer: 'Traction Power Controller (TPC / Salem)',
        isCompleted: true,
        isCurrent: false
      },
      {
        status: 'APPROVED',
        label: 'Block & Power Shutdown Sanctioned in COA',
        timestamp: '2026-09-22 19:10',
        officer: 'Chief Controller / COA Integration',
        note: 'COA Permit #5190 issued for 25kV OHE isolation & DETC movement.',
        isCompleted: true,
        isCurrent: true
      },
      {
        status: 'COMPLETED',
        label: 'OHE Charged & Fit Certificate Issued',
        isCompleted: false,
        isCurrent: false
      }
    ],
    createdAt: '2026-09-22T11:20:00.000Z',
    updatedAt: '2026-09-22T19:10:00.000Z'
  },
  {
    id: 'BLK-COA-SR-2026-107',
    department: 'SNT',
    departmentName: 'Signal & Telecommunication (S&T)',
    systemName: 'SMMS',
    status: 'APPROVED',
    priority: 'URGENT',
    urgency: 'PLANNED_WEEKLY',
    corridor: 'Erode Jn - Chennai Egmore (ED-MS) via Salem, Attur & Vriddhachalam',
    blockSection: 'Attur (ATU) - Chinna Salem (CHSM)',
    fromLocation: 'Attur (ATU)',
    toLocation: 'Chinna Salem (CHSM)',
    line: 'SINGLE',
    chainage: 'Km 88/10 to 90/40',
    assetType: 'Point Machine',
    assetId: 'PM-ATU-102B',
    assetCondition: 'FAIR',
    defectReason: 'Overhaul of Point Machine motor, track circuit insulation joint and gear lubrication',
    maintenanceType: 'Point Machine & Interlocking Overhaul',
    description: 'Thorough inspection and overhaul of turnout motor gears, friction clutch, and track circuit insulation testing.',
    requestedDate: '2026-09-22',
    preferredDate: '2026-09-23',
    preferredStartTime: '10:30',
    preferredEndTime: '12:30',
    durationFormatted: '2 hrs 00 mins',
    durationMinutesTotal: 120,
    requestedBy: 'M. Balasubramanian',
    designation: 'SSE / Signals (Attur)',
    contactNumber: '09444365129',
    operationalRequirements: [
      { label: 'S&T Disconnection Memo (Form S&T T/351)', value: true },
      { label: 'Signalling Isolation Required', value: true },
      { label: 'Crank Handle Padlocked', value: true }
    ],
    equipmentRequired: ['Multi-meter & Insulation Tester', 'Point Machine Gauge & Crank Handle', 'Lubrication Set'],
    teamSize: 6,
    safetyRequirements: [
      'Disconnection memo acknowledged and signed by Station Master Attur',
      'Points clamped and padlocked in normal position when testing',
      'Signals kept at ON position during work'
    ],
    remarks: 'COA Sanction Ref: COA/SR/SA-DIV/2026/09/BLK-6204. Disconnection block approved by Sr.DSTE & Operating Control.',
    timeline: [
      {
        status: 'SUBMITTED',
        label: 'S&T Disconnection Notice Logged in SMMS',
        timestamp: '2026-09-22 09:30',
        officer: 'M. Balasubramanian (SSE/Sig)',
        isCompleted: true,
        isCurrent: false
      },
      {
        status: 'UNDER_PLANNING',
        label: 'Traffic Interval Validation in Section Control',
        timestamp: '2026-09-22 13:40',
        officer: 'Section Controller (Salem-Attur Section)',
        isCompleted: true,
        isCurrent: false
      },
      {
        status: 'APPROVED',
        label: 'S&T Disconnection Block Sanctioned in COA',
        timestamp: '2026-09-22 17:15',
        officer: 'Sr.DOM / Operating Control via COA',
        note: 'COA Sanction #6204 granted with S&T T/351 authorization.',
        isCompleted: true,
        isCurrent: true
      },
      {
        status: 'COMPLETED',
        label: 'Reconnection Memo Signed & Signalling Fit',
        isCompleted: false,
        isCurrent: false
      }
    ],
    createdAt: '2026-09-22T09:30:00.000Z',
    updatedAt: '2026-09-22T17:15:00.000Z'
  }
];

// Helper to ensure approved blocks are available in the dataset
async function ensureApprovedBlocks(records: BlockRequestRecord[]): Promise<BlockRequestRecord[]> {
  const existingIds = new Set(records.map(r => r.id));
  const missing = INITIAL_COA_APPROVED_BLOCKS.filter(b => !existingIds.has(b.id));

  if (missing.length > 0) {
    const merged = [...missing, ...records];
    writeLocalRecords(merged);
    cachedRequests = merged;
    return merged;
  }

  return records;
}

export const db = {
  /**
   * Retrieve all block requests from Supabase or local persistent storage
   */
  async getRequests(forceFresh: boolean = false): Promise<BlockRequestRecord[]> {
    const now = Date.now();
    if (!forceFresh && cachedRequests && now - lastCacheTime < CACHE_TTL_MS) {
      return cachedRequests;
    }

    if (inFlightGetRequests) {
      return inFlightGetRequests;
    }

    inFlightGetRequests = (async () => {
      try {
        // 1. If Supabase is configured, fetch directly from Supabase
        if (isSupabaseConfigured()) {
          const supabaseData = await supabaseClient.getRequests();
          if (supabaseData !== null) {
            const finalData = await ensureApprovedBlocks(supabaseData);
            cachedRequests = finalData;
            lastCacheTime = Date.now();
            try {
              writeLocalRecords(finalData);
            } catch {}
            return finalData;
          }
        }

        // 2. Fallback to local persistent JSON storage
        const local = readLocalRecords();
        const finalLocal = await ensureApprovedBlocks(local);
        cachedRequests = finalLocal;
        lastCacheTime = Date.now();
        return finalLocal;
      } finally {
        inFlightGetRequests = null;
      }
    })();

    return inFlightGetRequests;
  },

  /**
   * Get single block request by ID
   */
  async getRequestById(id: string): Promise<BlockRequestRecord | undefined> {
    if (!id) return undefined;
    const lowerId = id.toLowerCase();

    // Check memory cache first for instant response
    if (cachedRequests) {
      const foundInCache = cachedRequests.find((r) => r.id.toLowerCase() === lowerId);
      if (foundInCache) return foundInCache;
    }

    // Check Supabase
    if (isSupabaseConfigured()) {
      const item = await supabaseClient.getRequestById(id);
      if (item) {
        return item;
      }
    }

    // Check local disk fallback
    const localList = readLocalRecords();
    return localList.find((r) => r.id.toLowerCase() === lowerId);
  },

  /**
   * Save (insert or update) block request into Supabase and local storage
   */
  async saveRequest(record: BlockRequestRecord): Promise<BlockRequestRecord> {
    const nowIso = new Date().toISOString();
    let updatedRecord: BlockRequestRecord = {
      ...record,
      createdAt: record.createdAt || nowIso,
      updatedAt: nowIso,
    };

    // 1. Save to local storage & memory cache immediately
    const localRecords = readLocalRecords();
    const existingIndex = localRecords.findIndex((r) => r.id === updatedRecord.id);

    if (existingIndex >= 0) {
      localRecords[existingIndex] = updatedRecord;
    } else {
      localRecords.unshift(updatedRecord);
    }
    writeLocalRecords(localRecords);

    // Invalidate/update cache
    cachedRequests = localRecords;
    lastCacheTime = Date.now();

    // 2. Persist to Supabase
    if (isSupabaseConfigured()) {
      try {
        const savedInSupabase = await supabaseClient.saveRequest(updatedRecord);
        if (savedInSupabase) {
          return savedInSupabase;
        }
      } catch (err) {
        console.error('Supabase save error:', err);
      }
    }

    return updatedRecord;
  },

  /**
   * Update request status (e.g. APPROVED -> COMPLETED) and persist directly to Supabase & local cache
   */
  async updateRequestStatus(
    id: string,
    newStatus: RequestStatus,
    options?: {
      officer?: string;
      remarks?: string;
      note?: string;
      completedAt?: string;
    }
  ): Promise<BlockRequestRecord | null> {
    const existing = await this.getRequestById(id);
    if (!existing) return null;

    const nowIso = new Date().toISOString();
    const timestampFormatted = options?.completedAt || (
      new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) +
      ' ' +
      new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) +
      ' IST'
    );

    // Update timeline
    const existingTimeline = Array.isArray(existing.timeline) ? [...existing.timeline] : [];
    const updatedTimeline = existingTimeline.map((item) => ({
      ...item,
      isCurrent: false,
      isCompleted: item.status === 'SUBMITTED' || item.status === 'UNDER_PLANNING' || item.status === 'APPROVED' ? true : item.isCompleted,
    }));

    const statusIndex = updatedTimeline.findIndex((t) => t.status === newStatus);
    const newTimelineEntry = {
      status: newStatus,
      label: newStatus === 'COMPLETED' ? 'Block Completion & Track Fit Certificate' : `Status: ${newStatus}`,
      timestamp: timestampFormatted,
      officer: options?.officer || existing.requestedBy || 'Railway Official',
      note: options?.note || options?.remarks || (newStatus === 'COMPLETED' ? 'Block completed at site. Staff, machines and equipment clear of track. Track certified safe for traffic.' : undefined),
      isCompleted: true,
      isCurrent: true,
    };

    if (statusIndex >= 0) {
      updatedTimeline[statusIndex] = { ...updatedTimeline[statusIndex], ...newTimelineEntry };
    } else {
      updatedTimeline.push(newTimelineEntry);
    }

    const updatedRemarks = options?.remarks
      ? existing.remarks
        ? `${existing.remarks}\n[${timestampFormatted} - ${newStatus}]: ${options.remarks}`
        : `[${timestampFormatted} - ${newStatus}]: ${options.remarks}`
      : existing.remarks;

    const updatedRecord: BlockRequestRecord = {
      ...existing,
      status: newStatus,
      remarks: updatedRemarks,
      timeline: updatedTimeline,
      updatedAt: nowIso,
    };

    // 1. Save locally and in memory
    const localRecords = readLocalRecords();
    const localIndex = localRecords.findIndex((r) => r.id === updatedRecord.id);
    if (localIndex >= 0) {
      localRecords[localIndex] = updatedRecord;
    } else {
      localRecords.unshift(updatedRecord);
    }
    writeLocalRecords(localRecords);

    cachedRequests = localRecords;
    lastCacheTime = Date.now();

    // 2. Persist to Supabase
    if (isSupabaseConfigured()) {
      try {
        const patchResult = await supabaseClient.updateStatus(id, newStatus, {
          remarks: updatedRecord.remarks,
          timeline: updatedRecord.timeline,
          updatedAt: nowIso,
        });
        if (patchResult) {
          return patchResult;
        }

        // Fallback to saveRequest
        const saved = await supabaseClient.saveRequest(updatedRecord);
        if (saved) return saved;
      } catch (err) {
        console.error('[Supabase] updateRequestStatus error:', err);
      }
    }

    return updatedRecord;
  },

  /**
   * Get all approved block requests
   */
  async getApprovedRequests(): Promise<BlockRequestRecord[]> {
    const all = await this.getRequests();
    return all.filter((r) => r.status === 'APPROVED');
  },

  /**
   * Clear all block requests
   */
  async clearAll(): Promise<void> {
    cachedRequests = [];
    lastCacheTime = Date.now();
    writeLocalRecords([]);

    if (isSupabaseConfigured()) {
      await supabaseClient.clearAll();
    }
  },
};
