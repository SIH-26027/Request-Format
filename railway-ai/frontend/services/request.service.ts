import type { BlockRequestRecord, DepartmentCode, RequestStatus } from '../types/request';

const STORAGE_KEY = 'railway_block_requests_store';
const DRAFT_PREFIX = 'railway_block_draft_';

const STATIC_MOCK_IDS = new Set([
  'REQ-ENG-20260914-0012',
  'REQ-TRD-20260914-0038',
  'REQ-SNT-20260913-0089',
  'REQ-ENG-20260911-0005',
  'REQ-TRD-20260910-0021',
  'REQ-SNT-20260908-0014',
  'REQ-ENG-20260915-0042',
  'REQ-TRD-20260915-0061'
]);

// In-flight promise deduplication and short-lived memory cache
let inFlightFetchAll: Promise<BlockRequestRecord[]> | null = null;
const inFlightFetchById = new Map<string, Promise<BlockRequestRecord | undefined>>();
let memoryCacheData: BlockRequestRecord[] | null = null;
let memoryCacheTime = 0;
const CLIENT_CACHE_TTL_MS = 5000; // 5 second cache for instant client route transitions

/**
 * Enterprise database & local-sync service for block requests
 */
export const RequestService = {
  /**
   * Fast synchronous read from local cache (for instant rendering)
   */
  getAll(): BlockRequestRecord[] {
    if (memoryCacheData && Date.now() - memoryCacheTime < CLIENT_CACHE_TTL_MS) {
      return memoryCacheData;
    }
    if (typeof window === 'undefined') {
      return [];
    }
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        return [];
      }
      const parsed: BlockRequestRecord[] = JSON.parse(stored);
      const cleanRecords = parsed.filter(r => !STATIC_MOCK_IDS.has(r.id));
      if (cleanRecords.length !== parsed.length) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(cleanRecords));
      }
      memoryCacheData = cleanRecords;
      memoryCacheTime = Date.now();
      return cleanRecords;
    } catch {
      return [];
    }
  },

  /**
   * Fetch all records directly from the database API (/api/requests)
   * Deduplicates concurrent in-flight requests and synchronizes the local cache.
   */
  async fetchAll(forceFresh: boolean = false): Promise<BlockRequestRecord[]> {
    const now = Date.now();
    // Return memory cached data if still fresh and not explicitly forced
    if (!forceFresh && memoryCacheData && now - memoryCacheTime < CLIENT_CACHE_TTL_MS) {
      return memoryCacheData;
    }

    // Deduplicate in-flight promise to avoid duplicate /api/requests network calls
    if (inFlightFetchAll) {
      return inFlightFetchAll;
    }

    inFlightFetchAll = (async () => {
      try {
        const res = await fetch('/api/requests', { cache: 'no-store' });
        if (res.ok) {
          const data: BlockRequestRecord[] = await res.json();
          const cleanData = data.filter(r => !STATIC_MOCK_IDS.has(r.id));
          memoryCacheData = cleanData;
          memoryCacheTime = Date.now();
          if (typeof window !== 'undefined') {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(cleanData));
          }
          return cleanData;
        }
      } catch (err) {
        console.warn('Network error fetching from database API, falling back to local cache:', err);
      } finally {
        inFlightFetchAll = null;
      }
      return this.getAll();
    })();

    return inFlightFetchAll;
  },

  getById(id: string): BlockRequestRecord | undefined {
    const list = this.getAll();
    return list.find(r => r.id.toLowerCase() === id.toLowerCase());
  },

  async fetchById(id: string): Promise<BlockRequestRecord | undefined> {
    const key = id.toLowerCase();
    if (inFlightFetchById.has(key)) {
      return inFlightFetchById.get(key)!;
    }

    const promise = (async () => {
      try {
        const res = await fetch(`/api/requests/${encodeURIComponent(id)}`, { cache: 'no-store' });
        if (res.ok) {
          const record: BlockRequestRecord = await res.json();
          return record;
        }
      } catch {
        // ignore
      } finally {
        inFlightFetchById.delete(key);
      }
      return this.getById(id);
    })();

    inFlightFetchById.set(key, promise);
    return promise;
  },

  /**
   * Save request into persistent database and local cache
   */
  async save(newRecord: BlockRequestRecord): Promise<BlockRequestRecord> {
    // Invalidate in-flight and cache
    memoryCacheData = null;
    memoryCacheTime = 0;

    // 1. Immediately update local storage for zero-latency UI update
    if (typeof window !== 'undefined') {
      const current = this.getAll();
      const existingIndex = current.findIndex(r => r.id === newRecord.id);
      let updated: BlockRequestRecord[];
      if (existingIndex >= 0) {
        updated = [...current];
        updated[existingIndex] = newRecord;
      } else {
        updated = [newRecord, ...current];
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      memoryCacheData = updated;
      memoryCacheTime = Date.now();
    }

    // 2. Persist to server database via API
    try {
      const res = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRecord)
      });
      if (res.ok) {
        const saved = await res.json();
        return saved;
      } else {
        console.error('Database API returned error status:', res.status);
      }
    } catch (err) {
      console.error('Failed to post request to /api/requests database API:', err);
    }

    return newRecord;
  },

  /**
   * Update request status (e.g. APPROVED -> COMPLETED) directly in Supabase and local cache
   */
  async updateStatus(
    id: string,
    status: RequestStatus,
    options?: {
      officer?: string;
      remarks?: string;
      note?: string;
      completedAt?: string;
    }
  ): Promise<{ success: boolean; record: BlockRequestRecord | null; error?: string }> {
    // Invalidate in-flight and cache
    memoryCacheData = null;
    memoryCacheTime = 0;

    // 1. Optimistically update local storage
    if (typeof window !== 'undefined') {
      const current = this.getAll();
      const existing = current.find(r => r.id === id);
      if (existing) {
        const updated = current.map(r => {
          if (r.id === id) {
            return {
              ...r,
              status,
              updatedAt: new Date().toISOString(),
              remarks: options?.remarks ? (r.remarks ? `${r.remarks}\n${options.remarks}` : options.remarks) : r.remarks
            };
          }
          return r;
        });
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        memoryCacheData = updated;
        memoryCacheTime = Date.now();
      }
    }

    // 2. Persist to server & Supabase via API
    try {
      const res = await fetch(`/api/requests/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          ...options
        })
      });

      if (res.ok) {
        const json = await res.json();
        const updatedRecord: BlockRequestRecord = json.record;
        // Update local storage with full canonical record returned by server/Supabase
        if (typeof window !== 'undefined' && updatedRecord) {
          const current = this.getAll();
          const nextList = current.map(r => (r.id === id ? updatedRecord : r));
          localStorage.setItem(STORAGE_KEY, JSON.stringify(nextList));
          memoryCacheData = nextList;
          memoryCacheTime = Date.now();
        }
        return { success: true, record: updatedRecord };
      } else {
        const errText = await res.text();
        return { success: false, record: null, error: errText };
      }
    } catch (err: any) {
      console.error('RequestService.updateStatus error:', err);
      return { success: false, record: null, error: err?.message || 'Network error' };
    }
  },

  async clearAll(): Promise<void> {
    memoryCacheData = [];
    memoryCacheTime = Date.now();
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
    try {
      await fetch('/api/requests', { method: 'DELETE' });
    } catch {
      // ignore
    }
  },

  saveDraft(dept: DepartmentCode, data: unknown): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(`${DRAFT_PREFIX}${dept}`, JSON.stringify(data));
  },

  getDraft<T>(dept: DepartmentCode): T | null {
    if (typeof window === 'undefined') return null;
    try {
      const item = localStorage.getItem(`${DRAFT_PREFIX}${dept}`);
      return item ? JSON.parse(item) : null;
    } catch {
      return null;
    }
  },

  clearDraft(dept: DepartmentCode): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(`${DRAFT_PREFIX}${dept}`);
  }
};
