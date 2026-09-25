'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { BlockRequestRecord, RequestFilterState } from '../types/request';
import { RequestService } from '../services/request.service';

export function useRequests() {
  const [requests, setRequests] = useState<BlockRequestRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  const [filters, setFilters] = useState<RequestFilterState>({
    search: '',
    department: 'ALL',
    status: 'ALL',
    priority: 'ALL',
    corridor: '',
    date: ''
  });

  const refreshRequests = useCallback(async (forceFresh: boolean = false) => {
    // 1. Instant local cache load
    const cached = RequestService.getAll();
    if (cached.length > 0) {
      setRequests(cached);
    }

    // 2. Fetch fresh from database API
    try {
      const serverData = await RequestService.fetchAll(forceFresh);
      if (serverData && serverData.length >= 0) {
        setRequests(serverData);
      }
    } catch {
      // Local cache already in place
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setIsMounted(true);
    refreshRequests(false);
  }, [refreshRequests]);

  const filteredRequests = useMemo(() => {
    return requests.filter(req => {
      // Search filter (ID, asset ID, requested by, maintenance type)
      if (filters.search) {
        const query = filters.search.toLowerCase();
        const matchesId = req.id.toLowerCase().includes(query);
        const matchesAsset = req.assetId?.toLowerCase().includes(query) || req.assetType?.toLowerCase().includes(query);
        const matchesBy = req.requestedBy?.toLowerCase().includes(query);
        const matchesType = req.maintenanceType?.toLowerCase().includes(query);
        const matchesSection = req.blockSection?.toLowerCase().includes(query);
        if (!matchesId && !matchesAsset && !matchesBy && !matchesType && !matchesSection) {
          return false;
        }
      }

      // Department filter
      if (filters.department !== 'ALL' && req.department !== filters.department) {
        return false;
      }

      // Status filter
      if (filters.status !== 'ALL' && req.status !== filters.status) {
        return false;
      }

      // Priority filter
      if (filters.priority !== 'ALL' && req.priority !== filters.priority) {
        return false;
      }

      // Corridor filter
      if (filters.corridor && req.corridor !== filters.corridor) {
        return false;
      }

      // Date filter
      if (filters.date && req.preferredDate !== filters.date) {
        return false;
      }

      return true;
    });
  }, [requests, filters]);

  const counts = useMemo(() => {
    return {
      all: requests.length,
      engineering: requests.filter(r => r.department === 'ENGINEERING').length,
      trd: requests.filter(r => r.department === 'TRD').length,
      snt: requests.filter(r => r.department === 'SNT').length,
      underPlanning: requests.filter(r => r.status === 'UNDER_PLANNING').length,
      submitted: requests.filter(r => r.status === 'SUBMITTED').length,
      approved: requests.filter(r => r.status === 'APPROVED').length,
    };
  }, [requests]);

  return {
    requests: filteredRequests,
    allRequests: requests,
    loading,
    isMounted,
    filters,
    setFilters,
    counts,
    refreshRequests
  };
}

export function useSingleRequest(id: string) {
  const [request, setRequest] = useState<BlockRequestRecord | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isMounted, setIsMounted] = useState<boolean>(false);

  useEffect(() => {
    setIsMounted(true);
    if (!id) {
      setLoading(false);
      return;
    }
    const cached = RequestService.getById(id);
    if (cached) {
      setRequest(cached);
      setLoading(false);
    } else {
      setLoading(true);
    }
    
    // Fetch from database API
    RequestService.fetchById(id)
      .then(item => {
        if (item) setRequest(item);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  return { request, loading, isMounted };
}
