'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  CheckCircle2, 
  Clock, 
  Search, 
  ArrowRight, 
  ShieldCheck, 
  AlertTriangle, 
  Check, 
  RefreshCw, 
  FileCheck, 
  Calendar, 
  MapPin, 
  User, 
  Phone, 
  Activity, 
  Database, 
  X,
  Layers,
  Sparkles,
  Zap,
  Radio,
  SlidersHorizontal,
  ChevronRight,
  TrendingUp,
  FileText
} from 'lucide-react';
import RequestHeader from '../../components/request/common/RequestHeader';
import DepartmentBadge from '../../components/request/common/DepartmentBadge';
import StatusBadge from '../../components/request/common/StatusBadge';
import { RequestService } from '../../services/request.service';
import type { BlockRequestRecord, DepartmentCode, RequestStatus } from '../../types/request';
import { useLanguage } from '../../context/LanguageContext';

export default function ApprovedBlocksPage() {
  const router = useRouter();
  const [movedNotification, setMovedNotification] = useState<{
    blockId: string;
    blockSection?: string;
    officer?: string;
  } | null>(null);
  const { t } = useLanguage();

  const [blocks, setBlocks] = useState<BlockRequestRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDept, setSelectedDept] = useState<'ALL' | DepartmentCode>('ALL');
  const [activeTab, setActiveTab] = useState<'APPROVED' | 'COMPLETED' | 'ALL'>('APPROVED');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [isMounted, setIsMounted] = useState<boolean>(false);

  // Supabase connection status
  const [supabaseStatus, setSupabaseStatus] = useState<{
    connected: boolean;
    url: string;
    message: string;
    lastSynced?: string;
  }>({
    connected: true,
    url: 'https://nbtwgbmqjjhvlryvatdn.supabase.co',
    message: 'Connecting to Supabase...'
  });

  // Modal state for marking as completed
  const [selectedBlockForCompletion, setSelectedBlockForCompletion] = useState<BlockRequestRecord | null>(null);
  const [completionForm, setCompletionForm] = useState({
    officer: '',
    completionTime: '',
    completionDate: '',
    remarks: '',
    speedRestrictionCleared: true,
    speedRestrictionNote: 'Track fit certified for normal line speed without TSR.',
    checklist: {
      staffClear: true,
      equipmentRemoved: true,
      flagsRemoved: true,
      smNotified: true,
    }
  });
  const [isSubmittingCompletion, setIsSubmittingCompletion] = useState<boolean>(false);

  // Success toast state
  const [toast, setToast] = useState<{
    visible: boolean;
    title: string;
    message: string;
    supabaseId?: string;
  } | null>(null);

  // Fetch approved blocks from API
  const fetchBlocks = async (isManualRefresh: boolean = false) => {
    if (isManualRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await fetch('/api/approved-blocks', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        const combined = [...(data.approved || []), ...(data.completed || [])];
        setBlocks(combined);
        if (data.supabase) {
          setSupabaseStatus({
            connected: data.supabase.connected,
            url: data.supabase.url,
            message: data.supabase.message,
            lastSynced: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
          });
        }
      } else {
        // Fallback to RequestService
        const all = await RequestService.fetchAll(true);
        const filtered = all.filter(r => r.status === 'APPROVED' || r.status === 'COMPLETED');
        setBlocks(filtered);
      }
    } catch (err) {
      console.error('Failed to load approved blocks:', err);
      const all = RequestService.getAll();
      const filtered = all.filter(r => r.status === 'APPROVED' || r.status === 'COMPLETED');
      setBlocks(filtered);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    setIsMounted(true);
    fetchBlocks();
  }, []);

  // Filtered blocks based on tab, department, and search
  const filteredBlocks = useMemo(() => {
    return blocks.filter(b => {
      // Tab filter
      if (activeTab === 'APPROVED' && b.status !== 'APPROVED') return false;
      if (activeTab === 'COMPLETED' && b.status !== 'COMPLETED') return false;

      // Department filter
      if (selectedDept !== 'ALL' && b.department !== selectedDept) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchId = b.id?.toLowerCase().includes(q);
        const matchSection = b.blockSection?.toLowerCase().includes(q);
        const matchCorridor = b.corridor?.toLowerCase().includes(q);
        const matchAsset = b.assetId?.toLowerCase().includes(q) || b.assetType?.toLowerCase().includes(q);
        const matchWork = b.maintenanceType?.toLowerCase().includes(q) || b.description?.toLowerCase().includes(q);
        const matchOfficer = b.requestedBy?.toLowerCase().includes(q) || b.designation?.toLowerCase().includes(q);
        return matchId || matchSection || matchCorridor || matchAsset || matchWork || matchOfficer;
      }

      return true;
    });
  }, [blocks, activeTab, selectedDept, searchQuery]);

  // Statistics counts
  const stats = useMemo(() => {
    const approvedCount = blocks.filter(b => b.status === 'APPROVED').length;
    const completedCount = blocks.filter(b => b.status === 'COMPLETED').length;
    const engCount = blocks.filter(b => b.department === 'ENGINEERING' && b.status === 'APPROVED').length;
    const trdCount = blocks.filter(b => b.department === 'TRD' && b.status === 'APPROVED').length;
    const sntCount = blocks.filter(b => b.department === 'SNT' && b.status === 'APPROVED').length;

    // Total hours calculated from approved blocks
    const totalMinutes = blocks
      .filter(b => b.status === 'APPROVED')
      .reduce((sum, b) => sum + (b.durationMinutesTotal || 0), 0);
    const totalHours = (totalMinutes / 60).toFixed(1);

    return {
      approvedCount,
      completedCount,
      engCount,
      trdCount,
      sntCount,
      totalHours
    };
  }, [blocks]);

  // Open completion modal
  const handleOpenCompletionModal = (block: BlockRequestRecord) => {
    const now = new Date();
    const currentTimeStr = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    const currentDateStr = now.toISOString().split('T')[0];

    setSelectedBlockForCompletion(block);
    setCompletionForm({
      officer: block.requestedBy ? `${block.requestedBy} (${block.designation || 'In-Charge'})` : 'Section Supervisor / In-Charge',
      completionTime: currentTimeStr,
      completionDate: currentDateStr,
      remarks: `Block executed on ${block.blockSection}. Track safe and clear of all staff and machinery. Fit certificate issued.`,
      speedRestrictionCleared: true,
      speedRestrictionNote: 'Track fit certified for normal sectional speed without TSR.',
      checklist: {
        staffClear: true,
        equipmentRemoved: true,
        flagsRemoved: true,
        smNotified: true,
      }
    });
  };

  // Submit completion and persist directly to Supabase
  const handleConfirmCompletion = async () => {
    if (!selectedBlockForCompletion) return;
    setIsSubmittingCompletion(true);

    const blockId = selectedBlockForCompletion.id;
    const completionNote = `${completionForm.remarks} | Cleared at ${completionForm.completionTime} by ${completionForm.officer}. ${completionForm.speedRestrictionNote}`;

    try {
      // 1. Call API to update status in Supabase and local cache
      const res = await fetch('/api/approved-blocks', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: blockId,
          status: 'COMPLETED',
          officer: completionForm.officer,
          remarks: completionNote,
          note: 'Block completed at site. Staff, machines & equipment clear of track. Track certified fit for traffic.',
          completedAt: `${completionForm.completionDate} ${completionForm.completionTime} IST`
        })
      });

      if (!res.ok) {
        throw new Error(`Server returned error: ${res.status}`);
      }

      const resData = await res.json();
      const updatedRecord: BlockRequestRecord = resData.record;

      // 2. Remove completed block from active approved list (move it out!)
      setBlocks(prev => prev.filter(b => b.id !== blockId));

      // Close completion modal
      setSelectedBlockForCompletion(null);

      // 3. Trigger move transition modal & automatically redirect to completed page
      setMovedNotification({
        blockId,
        blockSection: selectedBlockForCompletion.blockSection,
        officer: completionForm.officer
      });

      // Auto redirect to completed-blocks with highlight after 2.2 seconds
      setTimeout(() => {
        router.push(`/completed-blocks?highlight=${blockId}`);
      }, 2200);
    } catch (err: any) {
      console.error('Failed to complete block in Supabase:', err);
      alert(`Error updating block status: ${err?.message || 'Could not communicate with Supabase'}`);
    } finally {
      setIsSubmittingCompletion(false);
    }
  };

  // Quick 1-click status change back to APPROVED if user wants to revert
  const handleRevertToApproved = async (block: BlockRequestRecord) => {
    if (!confirm(`Re-open block ${block.id} and revert status back to APPROVED in Supabase?`)) {
      return;
    }

    try {
      const res = await fetch('/api/approved-blocks', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: block.id,
          status: 'APPROVED',
          officer: 'Sr. DOM / Section Controller',
          remarks: 'Status reverted to APPROVED for continued execution'
        })
      });

      if (res.ok) {
        const data = await res.json();
        setBlocks(prev => prev.map(b => b.id === block.id ? data.record : b));
        setToast({
          visible: true,
          title: 'Status Reverted to APPROVED',
          message: `Block ${block.id} has been reverted to APPROVED in Supabase.`,
          supabaseId: block.id
        });
      }
    } catch (err) {
      console.error('Failed to revert status:', err);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Notification */}
      {isMounted && toast && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md w-full bg-slate-900 border border-slate-700 rounded-xl p-4 shadow-2xl backdrop-blur-md animate-in slide-in-from-bottom-5">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0">
                <Check className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">
                  {toast.title}
                </h4>
                <p className="text-xs text-slate-300 mt-0.5">{toast.message}</p>
              </div>
            </div>
            <button
              onClick={() => setToast(null)}
              className="text-slate-400 hover:text-white p-1 rounded-md"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Page Header */}
      <RequestHeader
        title="COA Approved Maintenance Blocks"
        subtitle="Operational execution portal for maintenance blocks sanctioned by Control Office Application (COA) / Operating Control. Field supervisors can verify track clearance and update block status to Completed."
        breadcrumbs={[
          { label: 'Control Portal', href: '/request' },
          { label: 'Block Registry', href: '/requests' },
          { label: 'COA Approved Blocks' }
        ]}
        action={
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => fetchBlocks(true)}
              disabled={refreshing}
              className="inline-flex items-center px-3 py-2 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg shadow-2xs transition-colors disabled:opacity-50"
              title="Refresh blocks"
            >
              <RefreshCw className={`w-3.5 h-3.5 mr-1.5 text-blue-600 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
            <Link
              href="/requests"
              className="inline-flex items-center px-3 py-2 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg shadow-2xs transition-colors"
            >
              <Layers className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
              All Requests Registry
            </Link>
          </div>
        }
      />

      {/* KPI Stats Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Approved Active */}
        <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
              Approved Blocks
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
              Active
            </span>
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-slate-900">{stats.approvedCount}</span>
            <span className="text-xs text-slate-500 font-medium">pending execution</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Sanctioned by Operating Control
          </p>
        </div>

        {/* Completed Blocks */}
        <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
              Completed
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
              Fit Issued
            </span>
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-slate-900">{stats.completedCount}</span>
            <span className="text-xs text-slate-500 font-medium">blocks cleared</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Track safe & traffic restored
          </p>
        </div>

        {/* Total Window Planned */}
        <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-600" />
              Sanctioned Duration
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
              Planned
            </span>
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-slate-900">{stats.totalHours}</span>
            <span className="text-xs text-slate-500 font-medium">hours total</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Cumulative window duration
          </p>
        </div>

        {/* Department Breakdown */}
        <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-2xs">
          <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-slate-500" />
            Departments
          </span>
          <div className="mt-2 grid grid-cols-3 gap-1.5 text-center">
            <div className="bg-slate-50 rounded p-1.5 border border-slate-200">
              <span className="text-xs font-bold text-slate-900 block">{stats.engCount}</span>
              <span className="text-[10px] text-slate-600 font-medium">Eng</span>
            </div>
            <div className="bg-slate-50 rounded p-1.5 border border-slate-200">
              <span className="text-xs font-bold text-slate-900 block">{stats.trdCount}</span>
              <span className="text-[10px] text-slate-600 font-medium">TRD</span>
            </div>
            <div className="bg-slate-50 rounded p-1.5 border border-slate-200">
              <span className="text-xs font-bold text-slate-900 block">{stats.sntCount}</span>
              <span className="text-[10px] text-slate-600 font-medium">S&T</span>
            </div>
          </div>
          <p className="text-[10px] text-slate-400 mt-1 text-center">
            Active maintenance teams
          </p>
        </div>
      </div>

      {/* Tab Navigation and Search Toolbar */}
      <div className="bg-white rounded-xl border border-slate-300 p-4 shadow-xs space-y-4">
        {/* Top Filter Row: Status Tabs + Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Status Tabs */}
          <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
            <button
              type="button"
              onClick={() => setActiveTab('APPROVED')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs rounded-md transition-all ${
                activeTab === 'APPROVED'
                  ? 'bg-blue-700 text-white shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 font-medium'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>COA Approved Blocks</span>
              <span className={`ml-1 text-[11px] px-1.5 py-0.2 rounded-full font-mono ${
                activeTab === 'APPROVED' ? 'bg-blue-800 text-white' : 'bg-slate-200 text-slate-700'
              }`}>
                {blocks.filter(b => b.status === 'APPROVED').length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('COMPLETED')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs rounded-md transition-all ${
                activeTab === 'COMPLETED'
                  ? 'bg-blue-700 text-white shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 font-medium'
              }`}
            >
              <FileCheck className="w-3.5 h-3.5" />
              <span>Completed Blocks</span>
              <span className={`ml-1 text-[11px] px-1.5 py-0.2 rounded-full font-mono ${
                activeTab === 'COMPLETED' ? 'bg-blue-800 text-white' : 'bg-slate-200 text-slate-700'
              }`}>
                {blocks.filter(b => b.status === 'COMPLETED').length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('ALL')}
              className={`px-3 py-1.5 text-xs rounded-md transition-all ${
                activeTab === 'ALL'
                  ? 'bg-blue-700 text-white shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 font-medium'
              }`}
            >
              All Records ({blocks.length})
            </button>
          </div>

          {/* Search Box and View Switcher */}
          <div className="flex items-center space-x-2">
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search block ID, section, asset..."
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* View Mode Buttons */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 shrink-0">
              <button
                type="button"
                onClick={() => setViewMode('cards')}
                className={`px-2.5 py-1 text-xs font-medium rounded ${
                  viewMode === 'cards' ? 'bg-white shadow-2xs text-slate-900 font-semibold' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Cards
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`px-2.5 py-1 text-xs font-medium rounded ${
                  viewMode === 'table' ? 'bg-white shadow-2xs text-slate-900 font-semibold' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Table
              </button>
            </div>
          </div>
        </div>

        {/* Department Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-200">
          <span className="text-xs text-slate-400 font-medium mr-1 flex items-center">
            <SlidersHorizontal className="w-3 h-3 mr-1" />
            Department:
          </span>
          <button
            type="button"
            onClick={() => setSelectedDept('ALL')}
            className={`px-2.5 py-1 text-xs font-medium rounded-full transition-colors ${
              selectedDept === 'ALL'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Departments
          </button>
          <button
            type="button"
            onClick={() => setSelectedDept('ENGINEERING')}
            className={`px-2.5 py-1 text-xs font-medium rounded-full transition-colors ${
              selectedDept === 'ENGINEERING'
                ? 'bg-amber-600 text-white'
                : 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
            }`}
          >
            Civil Engineering (TMS)
          </button>
          <button
            type="button"
            onClick={() => setSelectedDept('TRD')}
            className={`px-2.5 py-1 text-xs font-medium rounded-full transition-colors ${
              selectedDept === 'TRD'
                ? 'bg-sky-600 text-white'
                : 'bg-sky-50 text-sky-800 border border-sky-200 hover:bg-sky-100'
            }`}
          >
            Traction Distribution (TDMS)
          </button>
          <button
            type="button"
            onClick={() => setSelectedDept('SNT')}
            className={`px-2.5 py-1 text-xs font-medium rounded-full transition-colors ${
              selectedDept === 'SNT'
                ? 'bg-purple-600 text-white'
                : 'bg-purple-50 text-purple-800 border border-purple-200 hover:bg-purple-100'
            }`}
          >
            Signal & Telecom (SMMS)
          </button>

          <span className="ml-auto text-xs text-slate-500 font-medium">
            Showing {filteredBlocks.length} records
          </span>
        </div>
      </div>

      {/* Empty State */}
      {isMounted && !loading && filteredBlocks.length === 0 && (
        <div className="bg-white rounded-xl border border-slate-300 p-12 text-center shadow-xs">
          <div className="w-14 h-14 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <h3 className="text-sm font-semibold text-slate-800">No Block Requests Found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            {activeTab === 'APPROVED'
              ? 'No blocks currently hold APPROVED status. Once blocks are sanctioned by COA/Sr.DOM, they will appear here.'
              : 'No records match the current filter or search criteria.'}
          </p>
          <div className="mt-4 flex items-center justify-center space-x-3">
            <button
              onClick={() => fetchBlocks(true)}
              className="inline-flex items-center px-3.5 py-2 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors border border-blue-200"
            >
              <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
              Refresh Records
            </button>
            <Link
              href="/requests"
              className="inline-flex items-center px-3.5 py-2 text-xs font-medium text-slate-700 bg-white hover:bg-slate-100 rounded-lg transition-colors border border-slate-300"
            >
              View All Requests
            </Link>
          </div>
        </div>
      )}

      {/* Loading Skeleton */}
      {(!isMounted || loading) && (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs animate-pulse">
              <div className="h-4 bg-slate-200 rounded w-1/3 mb-4"></div>
              <div className="h-3 bg-slate-100 rounded w-2/3 mb-2"></div>
              <div className="h-3 bg-slate-100 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      )}

      {/* CARD VIEW */}
      {isMounted && !loading && viewMode === 'cards' && filteredBlocks.length > 0 && (
        <div className="grid grid-cols-1 gap-5">
          {filteredBlocks.map((block) => {
            const isApproved = block.status === 'APPROVED';
            const isCompleted = block.status === 'COMPLETED';

            return (
              <div
                key={block.id}
                className="bg-white rounded-xl border border-slate-200 shadow-2xs hover:shadow-xs transition-shadow overflow-hidden"
              >
                {/* Top Sanction Header Ribbon */}
                <div className="px-5 py-3 border-b border-slate-200 bg-slate-50/80 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center space-x-3">
                    <span className="font-mono text-xs font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200 shadow-2xs">
                      {block.id}
                    </span>
                    <DepartmentBadge department={block.department} size="sm" />
                    <StatusBadge status={block.status} size="sm" />

                    {isApproved && (
                      <span className="inline-flex items-center text-[10px] font-semibold text-blue-800 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                        <ShieldCheck className="w-3 h-3 mr-1 text-blue-600" />
                        COA Sanctioned
                      </span>
                    )}

                    {block.displayStatus && (
                      <span className={`inline-flex items-center text-[10px] font-medium px-2 py-0.5 rounded border ${
                        block.displayStatus.toLowerCase() === 'inactive'
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : (block.displayStatus.toLowerCase() === 'completed'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : 'bg-slate-100 text-slate-700 border-slate-200')
                      }`}>
                        Status: {block.displayStatus}
                      </span>
                    )}

                    {isCompleted && (
                      <span className="inline-flex items-center text-[10px] font-medium text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        <Check className="w-3 h-3 mr-1 text-emerald-600" />
                        Completed & Line Fit
                      </span>
                    )}
                  </div>

                  {/* Top Right Action Button */}
                  <div className="flex items-center space-x-2">
                    {isApproved ? (
                      <button
                        type="button"
                        onClick={() => handleOpenCompletionModal(block)}
                        className="inline-flex items-center px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 active:bg-blue-900 rounded-lg shadow-2xs transition-colors"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                        Complete Block
                      </button>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-emerald-800 font-semibold bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-md flex items-center">
                          <Check className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                          Track Clear & Fit
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRevertToApproved(block)}
                          className="text-[11px] text-slate-500 hover:text-slate-800 underline px-1"
                          title="Revert back to Approved"
                        >
                          Revert
                        </button>
                      </div>
                    )}

                    <Link
                      href={`/requests/${encodeURIComponent(block.id)}`}
                      className="text-xs text-slate-600 hover:text-slate-900 bg-white border border-slate-200 hover:border-slate-300 px-2.5 py-1.5 rounded-lg transition-colors flex items-center"
                    >
                      Details
                      <ArrowRight className="w-3 h-3 ml-1" />
                    </Link>
                  </div>
                </div>

                {/* Card Main Body */}
                <div className="p-5 grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left Column: Corridor & Railway Section */}
                  <div className="space-y-3">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                        Corridor & Block Section
                      </span>
                      <p className="text-xs font-semibold text-slate-800 line-clamp-1">
                        {block.corridor}
                      </p>
                    </div>

                    {/* Section Diagram Box */}
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                          {block.fromLocation}
                        </span>
                        <div className="flex-1 mx-2 flex items-center justify-center relative">
                          <div className="h-0.5 bg-slate-300 w-full absolute"></div>
                          <div className="relative bg-slate-100 px-1.5 py-0.5 text-[10px] font-mono font-medium text-slate-600 rounded border border-slate-200">
                            {block.line} Line
                          </div>
                        </div>
                        <span className="font-semibold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                          {block.toLocation}
                        </span>
                      </div>

                      {block.chainage && (
                        <div className="text-[11px] text-slate-500 font-mono mt-2 text-center">
                          Chainage: <span className="font-medium text-slate-700">{block.chainage}</span>
                        </div>
                      )}
                    </div>

                    {/* Officer in Charge */}
                    <div className="flex items-center space-x-2 text-xs text-slate-600 pt-1">
                      <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="font-medium text-slate-800">{block.requestedBy}</span>
                      <span className="text-slate-400">&bull;</span>
                      <span className="text-slate-500">{block.designation}</span>
                      {block.contactNumber && (
                        <>
                          <span className="text-slate-400">&bull;</span>
                          <span className="font-mono text-slate-600 flex items-center">
                            <Phone className="w-3 h-3 mr-0.5 text-slate-400" />
                            {block.contactNumber}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Middle Column: Sanctioned Timing & Operational Window */}
                  <div className="space-y-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      COA Sanctioned Slot & Window
                    </span>

                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-500 flex items-center">
                          <Calendar className="w-3.5 h-3.5 mr-1 text-slate-400" />
                          Sanctioned Date:
                        </span>
                        <span className="text-xs font-semibold text-slate-800">
                          {block.preferredDate || block.requestedDate}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-500 flex items-center">
                          <Clock className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                          Sanctioned Timing:
                        </span>
                        <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          {block.preferredStartTime} &rarr; {block.preferredEndTime}
                        </span>
                      </div>

                      <div className="flex items-center justify-between border-t border-slate-200 pt-1.5">
                        <span className="text-xs text-slate-500">Sanctioned Duration:</span>
                        <span className="text-xs font-semibold text-slate-700">
                          {block.durationFormatted} ({block.durationMinutesTotal} mins)
                        </span>
                      </div>
                    </div>

                    {/* Operational Requirements Badges */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {block.department === 'TRD' && (
                        <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-sky-50 text-sky-800 border border-sky-200 flex items-center">
                          <Zap className="w-3 h-3 mr-1 text-sky-600" />
                          25kV OHE Power Shutdown
                        </span>
                      )}
                      {block.department === 'SNT' && (
                        <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-purple-50 text-purple-800 border border-purple-200 flex items-center">
                          <Radio className="w-3 h-3 mr-1 text-purple-600" />
                          S&T Disconnection Form T/351
                        </span>
                      )}
                      {block.status === 'COMPLETED' ? (
                        <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-purple-50 text-purple-800 border border-purple-200 flex items-center">
                          <Check className="w-3 h-3 mr-1 text-purple-600" />
                          Track Clear & Fit Issued
                        </span>
                      ) : (
                        <span className={`text-[11px] font-medium px-2 py-0.5 rounded border ${
                          (block.displayStatus || '').toLowerCase() === 'inactive'
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        }`}>
                          {(block.displayStatus || '').toLowerCase() === 'inactive' ? 'Traffic Block Inactive (Sanctioned)' : 'Traffic Block Active'}
                        </span>
                      )}
                      {block.teamSize > 1 && (
                        <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                          Team Size: {block.teamSize}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Maintenance Activity & Asset */}
                  <div className="space-y-3 bg-slate-50/70 rounded-lg p-3.5 border border-slate-200 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                        Maintenance Work & Asset
                      </span>
                      <h4 className="text-xs font-bold text-slate-900 leading-snug">
                        {block.maintenanceType}
                      </h4>
                      <p className="text-[11px] text-slate-600 mt-1 line-clamp-2">
                        {block.description || block.defectReason}
                      </p>

                      <div className="mt-2.5 text-[11px] text-slate-600 font-mono">
                        Asset: <span className="font-semibold text-slate-800">{block.assetType} ({block.assetId})</span>
                      </div>
                    </div>

                    {/* Status Footer Note */}
                    <div className="pt-2 border-t border-slate-200 text-[11px]">
                      {isApproved ? (
                        <div className="flex items-center justify-between text-slate-500">
                          <span>Execution Status:</span>
                          <span className="font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                            Sanctioned
                          </span>
                        </div>
                      ) : (
                        <div className="text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200 font-medium flex items-center gap-1.5">
                          <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>Track clear & fit certificate issued</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bottom Remarks / COA Sanction Order Strip */}
                {block.remarks && (
                  <div className="px-5 py-2 bg-slate-50 border-t border-slate-100 text-[11px] text-slate-600 font-mono flex items-center justify-between">
                    <span className="truncate mr-4">
                      {block.remarks}
                    </span>
                    <span className="text-[10px] text-slate-400 shrink-0">
                      Updated: {new Date(block.updatedAt).toLocaleString('en-GB')}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* DENSE TABLE VIEW */}
      {isMounted && !loading && viewMode === 'table' && filteredBlocks.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-300 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-900 text-slate-200 border-b border-slate-700 font-semibold text-[11px] uppercase tracking-wider">
                  <th className="py-3 px-3">Block ID</th>
                  <th className="py-3 px-3">Dept</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Section & Corridor</th>
                  <th className="py-3 px-3">Maintenance Work</th>
                  <th className="py-3 px-3">Date & Slot</th>
                  <th className="py-3 px-3">In-Charge</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-medium text-slate-700">
                {filteredBlocks.map((block) => {
                  const isApproved = block.status === 'APPROVED';
                  return (
                    <tr
                      key={block.id}
                      className={`hover:bg-slate-50 transition-colors ${
                        isApproved ? 'bg-emerald-50/20' : ''
                      }`}
                    >
                      <td className="py-3 px-3 font-mono font-bold text-slate-900">
                        {block.id}
                      </td>
                      <td className="py-3 px-3">
                        <DepartmentBadge department={block.department} size="sm" />
                      </td>
                      <td className="py-3 px-3">
                        <StatusBadge status={block.status} size="sm" />
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-semibold text-slate-900">{block.blockSection}</div>
                        <div className="text-[11px] text-slate-500 font-mono">{block.line} Line &bull; {block.chainage || 'Section'}</div>
                      </td>
                      <td className="py-3 px-3 max-w-xs">
                        <div className="font-semibold text-slate-800 truncate">{block.maintenanceType}</div>
                        <div className="text-[11px] text-slate-500 truncate">{block.assetType} ({block.assetId})</div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-medium text-slate-800">{block.preferredDate}</div>
                        <div className="font-mono text-[11px] font-bold text-emerald-800">
                          {block.preferredStartTime} - {block.preferredEndTime}
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="text-slate-800 font-medium">{block.requestedBy}</div>
                        <div className="text-[11px] text-slate-500">{block.designation}</div>
                      </td>
                      <td className="py-3 px-3 text-right">
                        {isApproved ? (
                          <button
                            type="button"
                            onClick={() => handleOpenCompletionModal(block)}
                            className="inline-flex items-center px-3 py-1.5 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-md shadow-2xs transition-colors"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                            Complete
                          </button>
                        ) : (
                          <span className="text-[11px] text-emerald-800 font-medium px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200">
                            Completed
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* COMPLETION MODAL - EDIT STATUS INTO COMPLETED */}
      {isMounted && selectedBlockForCompletion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-xl w-full border border-slate-300 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-slate-900 text-white p-5 border-b border-slate-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">
                      Complete Maintenance Block
                    </h3>
                    <p className="text-xs text-slate-300 mt-0.5">
                      Issue Track Fit Certificate and Mark Status as COMPLETED
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedBlockForCompletion(null)}
                  disabled={isSubmittingCompletion}
                  className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Block Context Banner */}
              <div className="mt-3 bg-slate-800/80 rounded-lg p-2.5 border border-slate-700 flex items-center justify-between text-xs">
                <div>
                  <span className="font-mono text-blue-400 font-bold">{selectedBlockForCompletion.id}</span>
                  <span className="text-slate-400 mx-2">&bull;</span>
                  <span className="text-slate-200 font-medium">{selectedBlockForCompletion.blockSection}</span>
                </div>
                <span className="text-slate-400 font-mono text-[11px]">
                  {selectedBlockForCompletion.preferredStartTime} - {selectedBlockForCompletion.preferredEndTime}
                </span>
              </div>
            </div>

            {/* Modal Form Content */}
            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
              {/* Target Status Indicator */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 block">
                    Status Transition
                  </span>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-xs font-semibold text-slate-600">APPROVED</span>
                    <span className="text-slate-400">&rarr;</span>
                    <span className="text-xs font-extrabold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-300">
                      COMPLETED
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-500 block">Validation</span>
                  <span className="font-semibold text-xs text-slate-700">
                    Track Fit &amp; Line Clear
                  </span>
                </div>
              </div>

              {/* Clearance Timings */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Actual Clearance Date
                  </label>
                  <input
                    type="date"
                    value={completionForm.completionDate}
                    onChange={(e) => setCompletionForm({ ...completionForm, completionDate: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Actual Clearance Time (IST)
                  </label>
                  <input
                    type="time"
                    value={completionForm.completionTime}
                    onChange={(e) => setCompletionForm({ ...completionForm, completionTime: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 font-mono font-semibold focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              {/* Clearing Officer Name */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Site Supervisor / Clearing In-Charge
                </label>
                <input
                  type="text"
                  value={completionForm.officer}
                  onChange={(e) => setCompletionForm({ ...completionForm, officer: e.target.value })}
                  placeholder="Officer Name & Designation (e.g. K. Ramanathan, SSE/P-Way)"
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              {/* Quick Preset Templates for Fit Certificate */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1.5">
                  Track Fit & Safety Certificate Template
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setCompletionForm({
                      ...completionForm,
                      remarks: `Work completed on ${selectedBlockForCompletion.blockSection}. Track packed, aligned & fit for traffic at normal sectional speed. Staff and machines clear.`,
                      speedRestrictionCleared: true,
                      speedRestrictionNote: 'Track fit certified for normal sectional speed without TSR.'
                    })}
                    className="text-left p-2.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-slate-300 transition-colors text-[11px]"
                  >
                    <span className="font-semibold text-slate-900 block">Normal Sectional Speed</span>
                    <span className="text-slate-500 text-[10px]">Track certified safe without speed restriction</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCompletionForm({
                      ...completionForm,
                      remarks: `Work executed on ${selectedBlockForCompletion.blockSection}. Track fit certified with temporary speed restriction (TSR) 30 kmph until next consolidation.`,
                      speedRestrictionCleared: false,
                      speedRestrictionNote: 'Caution order TSR 30 kmph imposed.'
                    })}
                    className="text-left p-2.5 rounded-lg border border-amber-200 bg-amber-50/50 hover:bg-amber-100/60 transition-colors text-[11px]"
                  >
                    <span className="font-semibold text-amber-900 block">TSR Caution Imposed</span>
                    <span className="text-amber-700 text-[10px]">Caution order (e.g. 30 kmph) retained</span>
                  </button>
                </div>
              </div>

              {/* Remarks Textarea */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Completion Remarks / Clearance Memo Note
                </label>
                <textarea
                  rows={3}
                  value={completionForm.remarks}
                  onChange={(e) => setCompletionForm({ ...completionForm, remarks: e.target.value })}
                  placeholder="Enter details of track clearance, memo number, fit certificate details..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              {/* Mandatory Railway Safety Checklist */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 block">
                  Mandatory Railway Safety Checklist
                </span>

                <label className="flex items-center space-x-2 text-[11px] text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={completionForm.checklist.staffClear}
                    onChange={(e) => setCompletionForm({
                      ...completionForm,
                      checklist: { ...completionForm.checklist, staffClear: e.target.checked }
                    })}
                    className="rounded text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
                  />
                  <span>All trackmen, gang staff & contract workers clear of track structure</span>
                </label>

                <label className="flex items-center space-x-2 text-[11px] text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={completionForm.checklist.equipmentRemoved}
                    onChange={(e) => setCompletionForm({
                      ...completionForm,
                      checklist: { ...completionForm.checklist, equipmentRemoved: e.target.checked }
                    })}
                    className="rounded text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
                  />
                  <span>All machines (CSM/BCM/DETC), trolleys and tools removed from running line</span>
                </label>

                <label className="flex items-center space-x-2 text-[11px] text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={completionForm.checklist.flagsRemoved}
                    onChange={(e) => setCompletionForm({
                      ...completionForm,
                      checklist: { ...completionForm.checklist, flagsRemoved: e.target.checked }
                    })}
                    className="rounded text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
                  />
                  <span>Protection banner flags, detonators & discharge rods removed</span>
                </label>

                <label className="flex items-center space-x-2 text-[11px] text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={completionForm.checklist.smNotified}
                    onChange={(e) => setCompletionForm({
                      ...completionForm,
                      checklist: { ...completionForm.checklist, smNotified: e.target.checked }
                    })}
                    className="rounded text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
                  />
                  <span>Station Master advised via control telephone & track fit memo signed</span>
                </label>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setSelectedBlockForCompletion(null)}
                disabled={isSubmittingCompletion}
                className="px-4 py-2 text-xs font-medium text-slate-700 hover:text-slate-900 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleConfirmCompletion}
                disabled={isSubmittingCompletion}
                className="px-5 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 active:bg-blue-900 rounded-lg shadow-2xs transition-colors flex items-center space-x-2 disabled:opacity-50"
              >
                {isSubmittingCompletion ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Updating Status...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Confirm Completion</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    
      {/* Moved to Completed Page Notification Modal */}
      {isMounted && movedNotification && (
        <div className="fixed inset-0 bg-slate-900/70 z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-xl border border-slate-300 shadow-2xl max-w-md w-full p-6 text-center space-y-4 animate-in zoom-in-95 duration-200">
            <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                Track Fit Certified
              </span>
              <h3 className="text-base font-bold text-slate-900 mt-2">
                Block {movedNotification.blockId} Completed
              </h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Work on section <strong>{movedNotification.blockSection}</strong> is certified safe by {movedNotification.officer}. This block has been moved from the Approved queue to the Completed Blocks registry.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-slate-700 flex items-center justify-center space-x-2 font-medium">
              <RefreshCw className="w-4 h-4 text-blue-600 animate-spin" />
              <span>Redirecting to Completed Blocks...</span>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setMovedNotification(null)}
                className="px-4 py-2 text-xs font-medium text-slate-700 hover:text-slate-900 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
              >
                Stay on Approved Blocks
              </button>
              <Link
                href={`/completed-blocks?highlight=${movedNotification.blockId}`}
                className="px-5 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-2xs transition-colors flex items-center space-x-1.5"
              >
                <span>Go to Completed Blocks</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
