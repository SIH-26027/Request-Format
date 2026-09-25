import type { BlockRequestRecord, RequestStatus, DepartmentCode } from '../types/request';
export type { RequestStatus, DepartmentCode };

/**
 * Supabase configuration and credentials
 */
export function getSupabaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.SUPABASE_URL ||
    'https://nbtwgbmqjjhvlryvatdn.supabase.co'
  ).replace(/\/+$/, '');
}

export function getSupabaseKey(): string {
  // If running in browser, NEVER expose or use service role key
  if (typeof window !== 'undefined') {
    return (
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5idHdnYm1xampodmxyeXZhdGRuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk2NTcwMDEsImV4cCI6MjEwNTIzMzAwMX0._JMfAY5ntzI4CO9ACTyW0Gl4Cugfx1uCs648AVPayEM'
    ).trim();
  }

  // Server-side: prefer service role key if available, else anon key
  return (
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_KEY ||
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5idHdnYm1xampodmxyeXZhdGRuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk2NTcwMDEsImV4cCI6MjEwNTIzMzAwMX0._JMfAY5ntzI4CO9ACTyW0Gl4Cugfx1uCs648AVPayEM'
  ).trim();
}

/**
 * Columns needed for request lists/table views.
 * Excludes heavy JSONB fields (operational_requirements, equipment_required, safety_requirements, timeline)
 */
export const REQUEST_SUMMARY_COLUMNS = [
  'id',
  'department',
  'department_name',
  'system_name',
  'status',
  'priority',
  'urgency',
  'corridor',
  'block_section',
  'from_location',
  'to_location',
  'line',
  'chainage',
  'asset_type',
  'asset_id',
  'asset_condition',
  'defect_reason',
  'maintenance_type',
  'description',
  'requested_date',
  'preferred_date',
  'preferred_start_time',
  'preferred_end_time',
  'duration_formatted',
  'duration_minutes_total',
  'requested_by',
  'designation',
  'contact_number',
  'created_at',
  'updated_at'
].join(',');

/**
 * Checks if Supabase credentials are provided and valid (not empty or dummy)
 */
export function isSupabaseConfigured(): boolean {
  const url = getSupabaseUrl();
  const key = getSupabaseKey();
  if (!url) return false;
  if (!key) return false;
  if (key.includes('your-supabase') || key.length < 20) return false;
  return true;
}

/**
 * Standard Supabase REST API request headers
 */
function getHeaders(extraHeaders: Record<string, string> = {}): Record<string, string> {
  const key = getSupabaseKey();
  return {
    apikey: key,
    Authorization: `Bearer ${key}`,
    'Content-Type': 'application/json',
    ...extraHeaders,
  };
}

/**
 * Helper to safely perform fetch with an abort timeout so requests never hang
 */
async function fetchWithTimeout(url: string, options: RequestInit = {}, timeoutMs: number = 4000): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Normalize dates to YYYY-MM-DD for PostgreSQL DATE columns
 */
function safeDate(val: any, fallback?: string): string {
  if (val && typeof val === 'string' && val.trim().length >= 10) {
    return val.trim().substring(0, 10);
  }
  return fallback || new Date().toISOString().substring(0, 10);
}

/**
 * Normalize times to HH:MM:SS for PostgreSQL TIME columns
 */
function safeTime(val: any, fallback: string = '01:00:00'): string {
  if (!val || typeof val !== 'string' || !val.trim()) return fallback;
  const clean = val.trim();
  if (clean.length === 5) return `${clean}:00`;
  if (clean.length === 8) return clean;
  return fallback;
}

/**
 * Convert frontend BlockRequestRecord (camelCase) to Supabase table row (snake_case)
 */
export function recordToSupabaseRow(r: BlockRequestRecord): Record<string, any> {
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(r.id);
  const supabaseStatus = r.status === 'COMPLETED' ? 'Completed' : (r.status === 'APPROVED' ? 'Approved' : 'Pending Planning');

  const row: Record<string, any> = {
    request_id: r.id,
    status: supabaseStatus,
    asset_type: r.assetType || 'Track & P-Way',
    asset_name: r.assetId || r.maintenanceType || 'Track Section',
    maintenance_type: r.maintenanceType || 'Maintenance',
    defect_reason: r.defectReason || '',
    description: r.description || `${r.maintenanceType} on ${r.blockSection}`,
    priority: r.priority === 'EMERGENCY' ? 'Emergency' : (r.priority === 'URGENT' ? 'Urgent' : 'Normal'),
    urgency: r.urgency === 'CRITICAL_SAFETY' ? 'Critical' : 'Normal',
    requested_date: safeDate(r.requestedDate),
    preferred_start_time: safeTime(r.preferredStartTime, '01:30:00'),
    duration_minutes: Number(r.durationMinutesTotal || 120),
    block_required: true,
    disconnection_required: r.department === 'SNT',
    safety_requirements: Array.isArray(r.safetyRequirements) ? r.safetyRequirements.join('; ') : (r.safetyRequirements || ''),
    resources_required: Array.isArray(r.equipmentRequired) ? r.equipmentRequired.join('; ') : (r.equipmentRequired || ''),
    requested_by: r.requestedBy ? `${r.requestedBy} (${r.designation || 'Staff'})` : 'Railway Official',
    remarks: r.remarks || `Section: ${r.blockSection}`,
    created_at: r.createdAt || new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  if (isUuid) {
    row.id = r.id;
  }

  return row;
}

/**
 * Convert Supabase table row (snake_case) to frontend BlockRequestRecord (camelCase)
 */
export function supabaseRowToRecord(row: any): BlockRequestRecord {
  const id = row.request_id || row.id;
  const statusStr = String(row.status || '').toUpperCase().replace(/\s+/g, '_');
  let status: RequestStatus = 'SUBMITTED';
  if (statusStr === 'APPROVED') status = 'APPROVED';
  else if (statusStr === 'COMPLETED') status = 'COMPLETED';
  else if (statusStr === 'PLANNED' || statusStr === 'PENDING_PLANNING' || statusStr === 'UNDER_PLANNING') status = 'UNDER_PLANNING';
  else if (statusStr === 'REJECTED') status = 'REJECTED';
  else if (statusStr === 'DRAFT') status = 'DRAFT';

  // Determine department
  let dept: DepartmentCode = 'ENGINEERING';
  let deptName = 'Civil Engineering';
  let sysName = 'TMS';
  const asset = (row.asset_type || '').toLowerCase();
  const mtype = (row.maintenance_type || '').toLowerCase();

  if (asset.includes('ohe') || asset.includes('traction') || asset.includes('trd') || mtype.includes('ohe')) {
    dept = 'TRD';
    deptName = 'Traction Distribution (TRD)';
    sysName = 'TDMS';
  } else if (asset.includes('signal') || asset.includes('point') || asset.includes('s&t') || asset.includes('interlocking')) {
    dept = 'SNT';
    deptName = 'Signal & Telecommunication (S&T)';
    sysName = 'SMMS';
  }

  const durationMin = Number(row.duration_minutes || row.duration_minutes_total || 120);
  const durHours = Math.floor(durationMin / 60);
  const durRemMin = durationMin % 60;
  const durationFormatted = durHours > 0 ? (durRemMin > 0 ? `${durHours} hrs ${durRemMin} mins` : `${durHours} hrs`) : `${durRemMin} mins`;

  const formatDate = (val: any) => {
    if (!val) return '';
    const str = String(val);
    return str.length >= 10 ? str.substring(0, 10) : str;
  };

  const formatTime = (val: any) => {
    if (!val) return '';
    const str = String(val);
    return str.length >= 5 ? str.substring(0, 5) : str;
  };

  return {
    id: id,
    department: row.department || dept,
    departmentName: row.department_name || deptName,
    systemName: row.system_name || sysName,
    status: status,
    priority: (row.priority?.toUpperCase() as any) || 'NORMAL',
    urgency: (row.urgency?.toUpperCase() as any) || 'ROUTINE',
    corridor: row.corridor || 'Erode Jn - Chennai Central (ED-MAS) Main Line via Salem, Jolarpettai & Katpadi',
    blockSection: row.block_section || (row.remarks?.includes('section:') ? row.remarks.split('section:')[1].trim() : 'Erode Jn (ED) - Cauvery (CV)'),
    fromLocation: row.from_location || 'Erode Jn (ED)',
    toLocation: row.to_location || 'Cauvery (CV)',
    line: row.line || 'UP',
    chainage: row.chainage || (row.chainage_from ? `Km ${row.chainage_from} to ${row.chainage_to}` : ''),
    assetType: row.asset_type || 'Track',
    assetId: row.asset_name || row.asset_id || '',
    assetCondition: row.asset_condition || 'FAIR',
    defectReason: row.defect_reason || '',
    maintenanceType: row.maintenance_type || 'Maintenance',
    description: row.description || '',
    requestedDate: formatDate(row.requested_date || row.requestedDate) || '2026-09-23',
    preferredDate: formatDate(row.preferred_date || row.preferredDate || row.requested_date) || '2026-09-23',
    preferredStartTime: formatTime(row.preferred_start_time || row.preferredStartTime) || '01:30',
    preferredEndTime: formatTime(row.preferred_end_time || row.preferredEndTime) || '04:30',
    durationFormatted: durationFormatted,
    durationMinutesTotal: durationMin,
    requestedBy: row.requested_by || 'Railway Official',
    designation: row.designation || 'In-Charge Supervisor',
    contactNumber: row.contact_number || '09444023145',
    operationalRequirements: Array.isArray(row.operational_requirements) ? row.operational_requirements : [
      { label: 'Traffic Block Required', value: Boolean(row.block_required ?? true) },
      { label: 'Disconnection Required', value: Boolean(row.disconnection_required ?? false) }
    ],
    equipmentRequired: Array.isArray(row.equipment_required) ? row.equipment_required : (row.resources_required ? [row.resources_required] : []),
    teamSize: Number(row.team_size || 8),
    safetyRequirements: Array.isArray(row.safety_requirements) ? row.safety_requirements : (row.safety_requirements ? [row.safety_requirements] : []),
    remarks: row.remarks || '',
    timeline: Array.isArray(row.timeline) && row.timeline.length > 0 ? row.timeline : [
      { status: 'SUBMITTED', label: 'Block Indent Logged', timestamp: '2026-09-22 10:00', isCompleted: true, isCurrent: false },
      { status: 'UNDER_PLANNING', label: 'Section Slot Validation', timestamp: '2026-09-22 14:00', isCompleted: true, isCurrent: false },
      { status: status, label: status === 'COMPLETED' ? 'Block Completed & Fit Certificate' : 'Sanctioned in COA', isCompleted: true, isCurrent: true }
    ],
    createdAt: row.created_at || new Date().toISOString(),
    updatedAt: row.updated_at || new Date().toISOString(),
  };
}

/**
 * Supabase REST client methods for block_requests
 */
export const supabaseClient = {
  /**
   * Fetch all block requests from Supabase REST API
   */
  async getRequests(): Promise<BlockRequestRecord[] | null> {
    if (!isSupabaseConfigured()) return null;

    try {
      const url = `${getSupabaseUrl()}/rest/v1/block_requests?select=*&order=created_at.desc`;
      const res = await fetchWithTimeout(url, {
        method: 'GET',
        headers: getHeaders(),
        cache: 'no-store',
      }, 4000);

      if (!res.ok) {
        const errorText = await res.text();
        console.warn(`[Supabase] GET block_requests failed (${res.status}): ${errorText}`);
        return null;
      }

      const rows = await res.json();
      if (!Array.isArray(rows)) return [];
      return rows.map(supabaseRowToRecord);
    } catch (err: any) {
      console.warn('[Supabase] Failed to fetch requests from Supabase REST API:', err?.message || err);
      return null;
    }
  },

  /**
   * Fetch single block request by ID or request_id
   */
  async getRequestById(id: string): Promise<BlockRequestRecord | null> {
    if (!isSupabaseConfigured() || !id) return null;

    try {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
      const filter = isUuid ? `id=eq.${id}` : `request_id=eq.${encodeURIComponent(id)}`;
      const url = `${getSupabaseUrl()}/rest/v1/block_requests?${filter}&select=*`;

      const res = await fetchWithTimeout(url, {
        method: 'GET',
        headers: getHeaders(),
        cache: 'no-store',
      }, 4000);

      if (!res.ok) {
        return null;
      }

      const rows = await res.json();
      if (Array.isArray(rows) && rows.length > 0) {
        return supabaseRowToRecord(rows[0]);
      }
      return null;
    } catch (err: any) {
      console.warn(`[Supabase] Failed to fetch request ${id}:`, err?.message || err);
      return null;
    }
  },

  /**
   * Save (upsert) request to Supabase
   */
  async saveRequest(record: BlockRequestRecord): Promise<BlockRequestRecord | null> {
    if (!isSupabaseConfigured()) return null;

    try {
      const row = recordToSupabaseRow(record);
      const url = `${getSupabaseUrl()}/rest/v1/block_requests`;

      const res = await fetchWithTimeout(url, {
        method: 'POST',
        headers: getHeaders({
          Prefer: 'resolution=merge-duplicates,return=representation',
        }),
        body: JSON.stringify(row),
      }, 4500);

      if (!res.ok) {
        const errorText = await res.text();
        console.error(`[Supabase] Upsert error (${res.status}): ${errorText}`);
        return null;
      }

      const returned = await res.json();
      if (Array.isArray(returned) && returned.length > 0) {
        return supabaseRowToRecord(returned[0]);
      }
      return record;
    } catch (err: any) {
      console.error('[Supabase] Failed to save request to Supabase:', err?.message || err);
      return null;
    }
  },

  /**
   * Fetch approved block requests from Supabase REST API
   */
  async getApprovedRequests(): Promise<BlockRequestRecord[] | null> {
    if (!isSupabaseConfigured()) return null;

    try {
      const url = `${getSupabaseUrl()}/rest/v1/block_requests?status=in.(Approved,APPROVED)&order=requested_date.asc&select=*`;
      const res = await fetchWithTimeout(url, {
        method: 'GET',
        headers: getHeaders(),
        cache: 'no-store',
      }, 4000);

      if (!res.ok) {
        const errorText = await res.text();
        console.warn(`[Supabase] GET approved block_requests failed (${res.status}): ${errorText}`);
        return null;
      }

      const rows = await res.json();
      if (!Array.isArray(rows)) return [];
      return rows.map(supabaseRowToRecord);
    } catch (err: any) {
      console.warn('[Supabase] Failed to fetch approved requests from Supabase REST API:', err?.message || err);
      return null;
    }
  },

  /**
   * Update request status and associated metadata in Supabase (PATCH)
   */
  async updateStatus(
    id: string,
    status: RequestStatus,
    patchData?: {
      remarks?: string;
      timeline?: any[];
      updatedAt?: string;
    }
  ): Promise<BlockRequestRecord | null> {
    if (!isSupabaseConfigured() || !id) return null;

    try {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
      const filter = isUuid ? `id=eq.${id}` : `request_id=eq.${encodeURIComponent(id)}`;
      const url = `${getSupabaseUrl()}/rest/v1/block_requests?${filter}`;

      // Map to Supabase check constraint value (Title Case)
      const supabaseStatus = status === 'COMPLETED' ? 'Completed' : (status === 'APPROVED' ? 'Approved' : 'Pending Planning');

      const payload: Record<string, any> = {
        status: supabaseStatus,
        updated_at: patchData?.updatedAt || new Date().toISOString(),
      };
      if (patchData?.remarks !== undefined) {
        payload.remarks = patchData.remarks;
      }

      const res = await fetchWithTimeout(url, {
        method: 'PATCH',
        headers: getHeaders({
          Prefer: 'return=representation',
        }),
        body: JSON.stringify(payload),
      }, 4500);

      if (!res.ok) {
        const errorText = await res.text();
        console.error(`[Supabase] PATCH block_requests status failed (${res.status}): ${errorText}`);
        return null;
      }

      const returned = await res.json();
      if (Array.isArray(returned) && returned.length > 0) {
        return supabaseRowToRecord(returned[0]);
      }
      return null;
    } catch (err: any) {
      console.error('[Supabase] Failed to update request status in Supabase:', err?.message || err);
      return null;
    }
  },

  /**
   * Clear all block requests from Supabase
   */
  async clearAll(): Promise<boolean> {
    if (!isSupabaseConfigured()) return false;

    try {
      const url = `${getSupabaseUrl()}/rest/v1/block_requests?id=neq.`;
      const res = await fetchWithTimeout(url, {
        method: 'DELETE',
        headers: getHeaders({
          Prefer: 'return=minimal',
        }),
      }, 4000);

      return res.ok;
    } catch (err) {
      console.warn('[Supabase] Failed to clear block requests:', err);
      return false;
    }
  },

  /**
   * Test connection and health of Supabase project
   */
  async checkHealth(): Promise<{
    configured: boolean;
    connected: boolean;
    url: string;
    message: string;
  }> {
    if (!isSupabaseConfigured()) {
      return {
        configured: false,
        connected: false,
        url: getSupabaseUrl(),
        message: 'Supabase credentials are not configured.',
      };
    }

    try {
      const res = await fetchWithTimeout(`${getSupabaseUrl()}/rest/v1/block_requests?select=id&limit=1`, {
        method: 'GET',
        headers: getHeaders(),
        cache: 'no-store',
      }, 3000);

      if (res.ok) {
        return {
          configured: true,
          connected: true,
          url: getSupabaseUrl(),
          message: 'Connected successfully to Supabase (table block_requests is ready).',
        };
      }

      const errText = await res.text();
      return {
        configured: true,
        connected: false,
        url: getSupabaseUrl(),
        message: `Supabase responded with status ${res.status}: ${errText}`,
      };
    } catch (err: any) {
      return {
        configured: true,
        connected: false,
        url: getSupabaseUrl(),
        message: `Network connection to Supabase failed: ${err?.message || err}`,
      };
    }
  },

  /**
   * Fetch all records from the existing_blocks table joined with corridors and departments
   */
  async getExistingBlocks(): Promise<{
    all: BlockRequestRecord[];
    inactive: BlockRequestRecord[];
    completed: BlockRequestRecord[];
  }> {
    if (!isSupabaseConfigured()) return { all: [], inactive: [], completed: [] };

    try {
      const url = getSupabaseUrl();

      const [ebRes, corridorsRes, deptsRes] = await Promise.all([
        fetchWithTimeout(`${url}/rest/v1/existing_blocks?select=*&order=created_at.desc`, {
          headers: getHeaders(),
          cache: 'no-store',
        }, 4000),
        fetchWithTimeout(`${url}/rest/v1/corridors?select=*`, {
          headers: getHeaders(),
          cache: 'no-store',
        }, 3000),
        fetchWithTimeout(`${url}/rest/v1/departments?select=*`, {
          headers: getHeaders(),
          cache: 'no-store',
        }, 3000),
      ]);

      if (!ebRes.ok) {
        console.error('[Supabase] Failed to fetch existing_blocks:', ebRes.status);
        return { all: [], inactive: [], completed: [] };
      }

      const ebRows = await ebRes.json();
      const corridors = corridorsRes.ok ? await corridorsRes.json() : [];
      const depts = deptsRes.ok ? await deptsRes.json() : [];

      const corridorsMap = new Map<string, any>((corridors || []).map((c: any) => [c.id, c]));
      const deptsMap = new Map<string, any>((depts || []).map((d: any) => [d.id, d]));

      const all = (ebRows || []).map((row: any) => existingBlockRowToRecord(row, corridorsMap, deptsMap));
      
      // Inactive / active blocks are those not yet completed
      const inactive = all.filter(b => b.status !== 'COMPLETED');
      const completed = all.filter(b => b.status === 'COMPLETED');

      return { all, inactive, completed };
    } catch (err) {
      console.error('[Supabase] Failed to get existing_blocks:', err);
      return { all: [], inactive: [], completed: [] };
    }
  },

  /**
   * Update availability_status directly in the corridors table
   */
  async updateCorridorAvailability(
    corridorIdOrName: string,
    status: 'Available' | 'Blocked' | 'Restricted Speed',
    blockSection?: string,
    line?: string
  ): Promise<boolean> {
    if (!isSupabaseConfigured() || !corridorIdOrName) return false;

    try {
      const url = getSupabaseUrl();
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(corridorIdOrName);
      
      let filter = '';
      if (isUuid) {
        filter = `id=eq.${corridorIdOrName}`;
      } else {
        const cleanName = encodeURIComponent(corridorIdOrName.trim());
        filter = `corridor_name=ilike.*${cleanName}*`;
        if (blockSection) {
          filter += `&block_section=ilike.*${encodeURIComponent(blockSection.trim())}*`;
        }
        if (line) {
          filter += `&line=eq.${encodeURIComponent(line.trim())}`;
        }
      }

      const res = await fetchWithTimeout(`${url}/rest/v1/corridors?${filter}`, {
        method: 'PATCH',
        headers: getHeaders({
          Prefer: 'return=representation',
        }),
        body: JSON.stringify({ availability_status: status }),
      }, 4500);

      if (res.ok) {
        console.log(`[Supabase] Successfully updated corridor (${corridorIdOrName}) availability to ${status}`);
        return true;
      } else {
        const errText = await res.text();
        console.error(`[Supabase] Error updating corridor availability (${res.status}): ${errText}`);
        return false;
      }
    } catch (err: any) {
      console.error('[Supabase] Exception updating corridor availability:', err?.message || err);
      return false;
    }
  },

  /**
   * Update status and remarks directly in the existing_blocks table,
   * and automatically sync the corridor availability status.
   */
  async updateExistingBlockStatus(
    idOrBlockId: string,
    status: 'Completed' | 'Active' | 'Cancelled' | 'Scheduled',
    remarks?: string
  ): Promise<boolean> {
    if (!isSupabaseConfigured() || !idOrBlockId) return false;

    try {
      const url = getSupabaseUrl();
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrBlockId);
      const filter = isUuid ? `id=eq.${idOrBlockId}` : `block_id=eq.${encodeURIComponent(idOrBlockId)}`;

      // 1. Fetch current block record to obtain corridor_id
      let corridorId: string | null = null;
      let blockDbId: string | null = null;
      try {
        const fetchBlockRes = await fetchWithTimeout(`${url}/rest/v1/existing_blocks?${filter}&select=id,block_id,corridor_id,line`, {
          headers: getHeaders(),
        }, 3000);
        if (fetchBlockRes.ok) {
          const rows = await fetchBlockRes.json();
          if (rows && rows.length > 0) {
            corridorId = rows[0].corridor_id;
            blockDbId = rows[0].id;
          }
        }
      } catch (e) {
        console.warn('[Supabase] Could not fetch corridor_id before block update:', e);
      }

      // 2. Update existing_blocks table
      const payload: Record<string, any> = {
        status: status,
      };
      if (remarks !== undefined) {
        payload.remarks = remarks;
      }

      const res = await fetchWithTimeout(`${url}/rest/v1/existing_blocks?${filter}`, {
        method: 'PATCH',
        headers: getHeaders({
          Prefer: 'return=representation',
        }),
        body: JSON.stringify(payload),
      }, 4500);

      if (!res.ok) {
        const errText = await res.text();
        console.error(`[Supabase] Error updating existing_blocks (${res.status}): ${errText}`);
        return false;
      }

      console.log(`[Supabase] Successfully updated existing_blocks (${idOrBlockId}) to status ${status}`);

      // 3. Automatically synchronize corridor availability status
      if (corridorId) {
        if (status === 'Completed' || status === 'Cancelled') {
          // Check if any other block is still Active on this corridor
          const otherFilter = blockDbId
            ? `corridor_id=eq.${corridorId}&status=eq.Active&id=neq.${blockDbId}&select=id`
            : `corridor_id=eq.${corridorId}&status=eq.Active&select=id`;
          
          let anyActiveRemaining = false;
          try {
            const checkRes = await fetchWithTimeout(`${url}/rest/v1/existing_blocks?${otherFilter}`, {
              headers: getHeaders(),
            }, 3000);
            if (checkRes.ok) {
              const activeRows = await checkRes.json();
              if (activeRows && activeRows.length > 0) {
                anyActiveRemaining = true;
              }
            }
          } catch (e) {
            console.warn('[Supabase] Could not check active blocks on corridor:', e);
          }

          if (!anyActiveRemaining) {
            const isRestricted = remarks && /speed\s*restriction|TSR|caution\s*order|45\s*km\/h|30\s*km\/h/i.test(remarks);
            const targetCorridorStatus = isRestricted ? 'Restricted Speed' : 'Available';
            await this.updateCorridorAvailability(corridorId, targetCorridorStatus);
          }
        } else if (status === 'Active') {
          await this.updateCorridorAvailability(corridorId, 'Blocked');
        }
      }

      return true;
    } catch (err: any) {
      console.error('[Supabase] Exception updating existing_blocks:', err?.message || err);
      return false;
    }
  },
};

/**
 * Convert a Supabase existing_blocks row to a BlockRequestRecord with joined corridor and department data
 */
export function existingBlockRowToRecord(
  row: any,
  corridorsMap: Map<string, any> = new Map(),
  departmentsMap: Map<string, any> = new Map()
): BlockRequestRecord {
  const corridor = row.corridor_id ? corridorsMap.get(row.corridor_id) : null;
  const dept = row.department_id ? departmentsMap.get(row.department_id) : null;

  // Determine department code
  let deptCode: DepartmentCode = 'ENGINEERING';
  let deptName = 'Civil Engineering';
  let sysName = 'TMS';

  const dName = (dept?.name || '').toLowerCase();
  const dSys = (dept?.system_name || '').toLowerCase();
  const purpose = (row.purpose || '').toLowerCase();

  if (dName.includes('trd') || dName.includes('traction') || dSys.includes('tdms') || purpose.includes('ohe')) {
    deptCode = 'TRD';
    deptName = 'Traction Distribution (TRD)';
    sysName = 'TDMS';
  } else if (dName.includes('signal') || dName.includes('s&t') || dName.includes('telecom') || dSys.includes('smms') || purpose.includes('signal') || purpose.includes('point machine')) {
    deptCode = 'SNT';
    deptName = 'Signal & Telecommunication (S&T)';
    sysName = 'SMMS';
  }

  const durationMin = Number(row.duration_minutes || 180);
  const durHours = Math.floor(durationMin / 60);
  const durRemMin = durationMin % 60;
  const durFormatted = durHours > 0 ? `${durHours}h ${durRemMin > 0 ? durRemMin + 'm' : ''}`.trim() : `${durRemMin}m`;

  const rawStatus = String(row.status || '').trim();
  const isCompleted = rawStatus.toLowerCase() === 'completed';
  const requestStatus: RequestStatus = isCompleted ? 'COMPLETED' : 'APPROVED';

  // Format timings
  const startTime = (row.start_time || '01:30:00').substring(0, 5);
  const endTime = (row.end_time || '04:30:00').substring(0, 5);

  const blockSection = corridor?.block_section || 'Erode – Salem Section';
  const corridorName = corridor?.corridor_name || 'Erode – Salem Main Line';
  const trackLine = row.line || corridor?.line || 'UP Line';

  // Extract station names if blockSection is format "A – B" or "A - B"
  let fromStation = 'Erode Jn (ED)';
  let toStation = 'Salem Jn (SA)';
  const parts = blockSection.split(/[–\-]/);
  if (parts.length >= 2) {
    fromStation = parts[0].trim();
    toStation = parts[1].trim();
  }

  return {
    id: row.block_id || row.id,
    requestId: row.block_id || row.id,
    department: deptCode,
    departmentName: deptName,
    systemName: sysName,
    status: requestStatus,
    displayStatus: rawStatus,
    priority: 'HIGH' as any,
    urgency: 'URGENT' as any,
    corridor: corridorName,
    blockSection: blockSection,
    trackLine: trackLine as any,
    trackType: 'UP',
    sectionSpeed: 110,
    fromStation: fromStation,
    toStation: toStation,
    chainage: 'Km 394/12 to 397/00',
    chainageStart: 394.12,
    chainageEnd: 397.0,
    assetType: deptCode === 'TRD' ? 'OHE' : (deptCode === 'SNT' ? 'Point Machine' : 'Track'),
    assetId: `AST-${deptCode}-${row.block_id}`,
    assetName: row.purpose || 'Railway Track Infrastructure',
    assetCondition: 'URGENT_ATTENTION' as any,
    maintenanceType: row.purpose || 'Track Maintenance Work',
    description: row.purpose || 'Scheduled maintenance block approved by COA',
    defectReason: 'Scheduled inspection, rehabilitation and testing under COA sanction',
    requestedDate: row.block_date || new Date().toISOString().split('T')[0],
    preferredDate: row.block_date || new Date().toISOString().split('T')[0],
    preferredStartTime: startTime,
    preferredEndTime: endTime,
    durationFormatted: durFormatted,
    durationMinutesTotal: durationMin,
    requestedBy: 'Sr.DOM / Operating Control (COA)',
    designation: 'Chief Controller / COA Section Controller',
    contactNumber: '09444023145',
    operationalRequirements: [
      { label: 'Source', value: row.source || 'COA Schedule' },
      { label: 'Track', value: trackLine },
      { label: 'Sanctioned Window', value: `${startTime} - ${endTime}` }
    ],
    equipmentRequired: deptCode === 'TRD' ? ['Tower Wagon 4-Wheeler', 'Earthing Discharges'] : ['Duomatic / CSM Tamping Machine', 'Track Lifting Jacks'],
    teamSize: deptCode === 'TRD' ? 10 : 14,
    safetyRequirements: [
      rawStatus.toLowerCase() === 'active' ? 'Traffic Block Active' : 'Traffic Block Scheduled',
      deptCode === 'TRD' ? '25kV OHE Power Shutdown' : 'Track Circuit Isolation'
    ],
    remarks: row.remarks || `COA Sanction approved for ${row.block_id}.`,
    timeline: [
      {
        status: 'SUBMITTED',
        label: 'Indent Submitted',
        timestamp: '2026-09-20 18:00 IST',
        officer: 'COA / Operating Control',
        note: 'Submitted to Operating Control',
        isCompleted: true,
        isCurrent: false,
      },
      {
        status: 'UNDER_PLANNING',
        label: 'COA Window Optimized',
        timestamp: '2026-09-21 02:00 IST',
        officer: 'ABPS Optimizer Engine',
        note: 'Optimized train-free interval verified',
        isCompleted: true,
        isCurrent: false,
      },
      {
        status: 'APPROVED',
        label: 'COA Sanction Granted',
        timestamp: '2026-09-21 03:50 IST',
        officer: 'Sr.DOM / Operating Control',
        note: row.remarks || 'Sanctioned in COA',
        isCompleted: true,
        isCurrent: !isCompleted,
      },
      ...(isCompleted ? [{
        status: 'COMPLETED' as RequestStatus,
        label: 'Block Completed & Track Fit Certified',
        timestamp: '2026-09-22 01:45 IST',
        officer: 'SSE / Salem Division',
        note: row.remarks || 'Block executed and track certified fit for normal sectional speed.',
        isCompleted: true,
        isCurrent: true,
      }] : [])
    ],
    createdAt: row.created_at || new Date().toISOString(),
    updatedAt: row.created_at || new Date().toISOString(),
  };
}
