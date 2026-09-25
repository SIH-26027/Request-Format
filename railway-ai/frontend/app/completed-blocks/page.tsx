'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { 
  CheckCircle2, 
  Clock, 
  Search, 
  ArrowLeft, 
  ShieldCheck, 
  AlertTriangle, 
  Check, 
  RefreshCw, 
  FileCheck, 
  Calendar, 
  MapPin, 
  User, 
  Database, 
  X,
  Layers,
  Sparkles,
  Zap,
  Radio,
  SlidersHorizontal,
  ChevronRight,
  TrendingUp,
  FileText,
  Printer,
  Download,
  RotateCcw,
  CheckCheck,
  BadgeCheck,
  Building2,
  Phone
} from 'lucide-react';
import RequestHeader from '../../components/request/common/RequestHeader';
import DepartmentBadge from '../../components/request/common/DepartmentBadge';
import StatusBadge from '../../components/request/common/StatusBadge';
import { RequestService } from '../../services/request.service';
import type { BlockRequestRecord, DepartmentCode } from '../../types/request';
import { useLanguage } from '../../context/LanguageContext';

function CompletedBlocksContent() {
  const { t } = useLanguage();
  const searchParams = useSearchParams();
  const highlightId = searchParams.get('highlight');

  const [blocks, setBlocks] = useState<BlockRequestRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDept, setSelectedDept] = useState<'ALL' | DepartmentCode>('ALL');
  const [speedFilter, setSpeedFilter] = useState<'ALL' | 'NORMAL' | 'TSR'>('ALL');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [isMounted, setIsMounted] = useState<boolean>(false);

  // Memo modal state
  const [selectedMemoBlock, setSelectedMemoBlock] = useState<BlockRequestRecord | null>(null);

  // Re-open confirmation state
  const [reopenBlock, setReopenBlock] = useState<BlockRequestRecord | null>(null);
  const [isReopening, setIsReopening] = useState<boolean>(false);

  // Toast state
  const [toast, setToast] = useState<{ visible: boolean; title: string; message: string } | null>(null);

  // Supabase connection status
  const [supabaseStatus, setSupabaseStatus] = useState<{
    connected: boolean;
    url: string;
    message: string;
    lastSynced?: string;
  }>({
    connected: true,
    url: 'https://nbtwgbmqjjhvlryvatdn.supabase.co',
    message: 'Connected'
  });

  // Fetch completed blocks from API
  const fetchCompletedBlocks = async (isManualRefresh: boolean = false) => {
    if (isManualRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await fetch('/api/approved-blocks', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        // Take completed blocks from API
        const completedList: BlockRequestRecord[] = data.completed || [];
        setBlocks(completedList);
        if (data.supabase) {
          setSupabaseStatus({
            connected: data.supabase.connected,
            url: data.supabase.url,
            message: data.supabase.message,
            lastSynced: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
          });
        }
      } else {
        const all = await RequestService.fetchAll(true);
        const filtered = all.filter(r => r.status === 'COMPLETED');
        setBlocks(filtered);
      }
    } catch (err) {
      console.error('Failed to load completed blocks:', err);
      const all = RequestService.getAll();
      const filtered = all.filter(r => r.status === 'COMPLETED');
      setBlocks(filtered);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    setIsMounted(true);
    fetchCompletedBlocks();
  }, []);

  // Filtered blocks based on search, department, and speed restriction
  const filteredBlocks = useMemo(() => {
    return blocks.filter(b => {
      // Department filter
      if (selectedDept !== 'ALL' && b.department !== selectedDept) return false;

      // Speed restriction filter
      if (speedFilter === 'NORMAL') {
        const isTsr = (b.remarks || '').toLowerCase().includes('tsr') || (b.remarks || '').toLowerCase().includes('caution');
        if (isTsr) return false;
      }
      if (speedFilter === 'TSR') {
        const isTsr = (b.remarks || '').toLowerCase().includes('tsr') || (b.remarks || '').toLowerCase().includes('caution');
        if (!isTsr) return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchId = b.id?.toLowerCase().includes(q);
        const matchSection = b.blockSection?.toLowerCase().includes(q);
        const matchCorridor = b.corridor?.toLowerCase().includes(q);
        const matchAsset = b.assetId?.toLowerCase().includes(q) || b.assetType?.toLowerCase().includes(q);
        const matchWork = b.maintenanceType?.toLowerCase().includes(q) || b.description?.toLowerCase().includes(q);
        const matchOfficer = b.requestedBy?.toLowerCase().includes(q) || b.designation?.toLowerCase().includes(q);
        const matchRemarks = b.remarks?.toLowerCase().includes(q);
        return matchId || matchSection || matchCorridor || matchAsset || matchWork || matchOfficer || matchRemarks;
      }

      return true;
    });
  }, [blocks, selectedDept, speedFilter, searchQuery]);

  // Statistics
  const stats = useMemo(() => {
    const totalCompleted = blocks.length;
    const engCount = blocks.filter(b => b.department === 'ENGINEERING').length;
    const trdCount = blocks.filter(b => b.department === 'TRD').length;
    const sntCount = blocks.filter(b => b.department === 'SNT').length;

    // Total hours calculated from completed blocks
    const totalMinutes = blocks.reduce((sum, b) => sum + (b.durationMinutesTotal || 0), 0);
    const totalHours = (totalMinutes / 60).toFixed(1);

    // Speed status counts
    const tsrCount = blocks.filter(b => (b.remarks || '').toLowerCase().includes('tsr') || (b.remarks || '').toLowerCase().includes('caution')).length;
    const normalSpeedCount = totalCompleted - tsrCount;

    return {
      totalCompleted,
      engCount,
      trdCount,
      sntCount,
      totalHours,
      normalSpeedCount,
      tsrCount
    };
  }, [blocks]);

  // Handle re-open / revert to APPROVED
  const handleConfirmReopen = async () => {
    if (!reopenBlock) return;
    setIsReopening(true);

    try {
      const res = await fetch('/api/approved-blocks', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: reopenBlock.id,
          status: 'APPROVED',
          officer: 'Sr. DOM / Section Controller',
          remarks: 'Status reverted to APPROVED for continued site execution or re-audit'
        })
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      // Remove from completed list
      setBlocks(prev => prev.filter(b => b.id !== reopenBlock.id));
      setToast({
        visible: true,
        title: 'Block Re-opened',
        message: `Block ${reopenBlock.id} reverted to APPROVED and moved back to Approved Blocks page.`
      });
      setReopenBlock(null);
      setTimeout(() => setToast(null), 5000);
    } catch (err: any) {
      alert(`Could not re-open block: ${err?.message}`);
    } finally {
      setIsReopening(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Notification */}
      {isMounted && toast && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 border border-emerald-500/50 text-white px-5 py-3.5 rounded-xl shadow-2xl flex items-center space-x-3 animate-in slide-in-from-bottom-5">
          <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg shrink-0">
            <Check className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-emerald-300">{toast.title}</h4>
            <p className="text-xs text-slate-300 mt-0.5">{toast.message}</p>
          </div>
        </div>
      )}

      {/* Page Header */}
      <RequestHeader
        title={t('completedBlocks.title', {}, 'Completed Maintenance Blocks Registry')}
        subtitle={t('completedBlocks.subtitle', {}, 'Official repository of executed railway corridor maintenance blocks with verified Track Fit Certificates, clearance timestamps, and safety checklist validation.')}
        breadcrumbs={[
          { label: t('portal.controlPortal', {}, 'Control Portal'), href: '/request' },
          { label: t('nav.approvedBlocks', {}, 'COA Approved Blocks'), href: '/approved-blocks' },
          { label: t('nav.completedBlocks', {}, 'Completed Blocks') }
        ]}
        action={
          <div className="flex flex-wrap items-center gap-2">
            {/* Back to Approved Blocks button */}
            <Link
              href="/approved-blocks"
              prefetch={true}
              className="inline-flex items-center px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg shadow-2xs transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5 mr-1.5 text-blue-600" />
              {t('completedBlocks.backToApproved', {}, '← Back to Approved Blocks')}
            </Link>

            {/* Refresh Button */}
            <button
              type="button"
              onClick={() => fetchCompletedBlocks(true)}
              disabled={refreshing}
              className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 shadow-2xs transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 mr-1.5 text-slate-500 ${refreshing ? 'animate-spin text-blue-600' : ''}`} />
              {refreshing ? 'Syncing...' : 'Refresh Archive'}
            </button>
          </div>
        }
      />

      {/* Newly Moved Banner if Highlight Param Exists */}
      {highlightId && (
        <div className="bg-gradient-to-r from-emerald-900/90 to-teal-900/90 border border-emerald-500/50 rounded-xl p-4 text-white shadow-lg flex items-center justify-between animate-in fade-in slide-in-from-top-3">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-300 font-bold">
                Block Successfully Transferred to Completed Registry
              </span>
              <h3 className="text-sm font-bold text-white">
                Block {highlightId} has been marked COMPLETED and moved here from Approved Blocks.
              </h3>
            </div>
          </div>
          <span className="text-xs bg-emerald-600 text-white font-semibold px-2.5 py-1 rounded-full shadow-xs">
            Verified &amp; Archived
          </span>
        </div>
      )}

      {/* Statistics Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Completed */}
        <div className="bg-white border border-slate-300 rounded-xl p-4 shadow-2xs hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              {t('completedBlocks.statsCompleted', {}, 'Completed Blocks')}
            </span>
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl font-extrabold text-slate-900 font-mono">
              {stats.totalCompleted}
            </span>
            <span className="text-xs text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded">
              100% Certified
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Track fit certified &amp; archived
          </p>
        </div>

        {/* Maintenance Hours */}
        <div className="bg-white border border-slate-300 rounded-xl p-4 shadow-2xs hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              {t('completedBlocks.statsHours', {}, 'Hours Delivered')}
            </span>
            <div className="p-1.5 rounded-lg bg-blue-50 text-blue-700">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-1.5">
            <span className="text-2xl font-extrabold text-slate-900 font-mono">
              {stats.totalHours}
            </span>
            <span className="text-xs text-slate-500 font-medium">hrs total</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Corridor slots utilized
          </p>
        </div>

        {/* Normal Speed Restored */}
        <div className="bg-white border border-slate-300 rounded-xl p-4 shadow-2xs hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              {t('completedBlocks.statsSpeedRestored', {}, 'Normal Speed Restored')}
            </span>
            <div className="p-1.5 rounded-lg bg-teal-50 text-teal-700">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl font-extrabold text-teal-900 font-mono">
              {stats.normalSpeedCount}
            </span>
            <span className="text-xs text-teal-700 font-medium">tracks fit</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Sectional line speed restored
          </p>
        </div>

        {/* TSR Cautions */}
        <div className="bg-white border border-slate-300 rounded-xl p-4 shadow-2xs hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              {t('completedBlocks.statsTsr', {}, 'TSR Cautions Imposed')}
            </span>
            <div className="p-1.5 rounded-lg bg-amber-50 text-amber-700">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl font-extrabold text-amber-900 font-mono">
              {stats.tsrCount}
            </span>
            <span className="text-xs text-amber-700 font-medium">caution orders</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Speed restrictions under observation
          </p>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="bg-white border border-slate-300 rounded-xl p-4 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Department Tabs */}
          <div className="flex items-center space-x-1 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            <button
              type="button"
              onClick={() => setSelectedDept('ALL')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                selectedDept === 'ALL'
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              All Departments ({stats.totalCompleted})
            </button>
            <button
              type="button"
              onClick={() => setSelectedDept('ENGINEERING')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                selectedDept === 'ENGINEERING'
                  ? 'bg-amber-700 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Engineering ({stats.engCount})
            </button>
            <button
              type="button"
              onClick={() => setSelectedDept('TRD')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                selectedDept === 'TRD'
                  ? 'bg-sky-700 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              TRD ({stats.trdCount})
            </button>
            <button
              type="button"
              onClick={() => setSelectedDept('SNT')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                selectedDept === 'SNT'
                  ? 'bg-purple-700 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              S&T ({stats.sntCount})
            </button>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center space-x-2 self-end md:self-auto">
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
              <button
                type="button"
                onClick={() => setViewMode('cards')}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                  viewMode === 'cards'
                    ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Cards View
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                  viewMode === 'table'
                    ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Table View
              </button>
            </div>
          </div>
        </div>

        {/* Search Bar & Speed Status Dropdown */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 border-t border-slate-100">
          <div className="relative sm:col-span-2">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('completedBlocks.searchPlaceholder', {}, 'Search completed blocks by ID, section, corridor, asset, officer...')}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 bg-white"
            />
          </div>

          <div>
            <select
              value={speedFilter}
              onChange={(e) => setSpeedFilter(e.target.value as any)}
              className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
            >
              <option value="ALL">All Track Fit Types</option>
              <option value="NORMAL">Normal Sectional Speed Restored</option>
              <option value="TSR">TSR Caution Order Imposed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Blocks Presentation */}
      {!isMounted || loading ? (
        <div className="bg-white border border-slate-300 rounded-xl p-12 text-center shadow-2xs space-y-3">
          <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin mx-auto" />
          <h3 className="text-sm font-bold text-slate-800">Loading Completed Blocks Archive...</h3>
          <p className="text-xs text-slate-500">Retrieving certified block records from Supabase database</p>
        </div>
      ) : filteredBlocks.length === 0 ? (
        <div className="bg-white border border-slate-300 rounded-xl p-12 text-center shadow-2xs space-y-4">
          <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto shadow-inner">
            <FileCheck className="w-7 h-7" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-base font-bold text-slate-900">
              {t('completedBlocks.noCompleted', {}, 'No Completed Blocks in Registry')}
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              {t('completedBlocks.noCompletedDesc', {}, 'When approved maintenance blocks are executed at site and certified by the supervising engineer, they will move here automatically.')}
            </p>
          </div>
          <div className="pt-2">
            <Link
              href="/approved-blocks"
              prefetch={true}
              className="inline-flex items-center px-4 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-sm transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
              {t('completedBlocks.goToApproved', {}, 'Go to Approved Blocks to Execute')}
            </Link>
          </div>
        </div>
      ) : viewMode === 'cards' ? (
        /* Cards View */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredBlocks.map((block) => {
            const isHighlighted = block.id === highlightId;
            const isTsr = (block.remarks || '').toLowerCase().includes('tsr') || (block.remarks || '').toLowerCase().includes('caution');

            return (
              <div
                key={block.id}
                className={`bg-white rounded-xl border transition-all duration-200 shadow-2xs hover:shadow-md flex flex-col justify-between overflow-hidden ${
                  isHighlighted
                    ? 'border-2 border-emerald-500 ring-4 ring-emerald-100'
                    : 'border-slate-300 hover:border-slate-400'
                }`}
              >
                {/* Card Header */}
                <div className="p-4 sm:p-5 space-y-3.5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center space-x-2">
                        <Link
                          href={`/requests/${block.id}`}
                          className="font-mono text-sm font-bold text-blue-900 hover:underline"
                        >
                          {block.id}
                        </Link>
                        <DepartmentBadge department={block.department} size="sm" showSystem={true} />
                      </div>
                      <h4 className="text-xs font-bold text-slate-900 mt-1 line-clamp-1">
                        {block.maintenanceType}
                      </h4>
                    </div>

                    <div className="flex flex-col items-end shrink-0 space-y-1">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                        <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-600" />
                        COMPLETED
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        {block.durationFormatted}
                      </span>
                    </div>
                  </div>

                  {/* Corridor & Section */}
                  <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-2.5 text-xs space-y-1">
                    <div className="flex items-center space-x-1.5 text-slate-800 font-semibold truncate">
                      <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span className="truncate">{block.corridor}</span>
                    </div>
                    <div className="text-[11px] text-slate-600 pl-5 flex items-center justify-between">
                      <span>{block.blockSection} &bull; {block.line || 'Main'} Line</span>
                      <span className="font-mono font-medium text-slate-700 bg-white px-1.5 py-0.2 rounded border border-slate-200">
                        {block.assetType} #{block.assetId}
                      </span>
                    </div>
                  </div>

                  {/* Certified Track Fit Certificate Banner */}
                  <div className={`rounded-xl p-3 border text-xs space-y-2 ${
                    isTsr 
                      ? 'bg-amber-50/70 border-amber-200 text-amber-950'
                      : 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1.5 font-bold">
                        <BadgeCheck className={`w-4 h-4 ${isTsr ? 'text-amber-600' : 'text-emerald-600'}`} />
                        <span>
                          {isTsr 
                            ? t('completedBlocks.tsrCaution', {}, 'Temporary Speed Restriction (TSR) Imposed')
                            : t('completedBlocks.normalSpeedRestored', {}, 'Normal Sectional Speed Restored')
                          }
                        </span>
                      </div>
                      <span className="text-[10px] font-mono uppercase font-bold text-slate-500">
                        Memo Form T/409
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-700 italic bg-white/70 p-2 rounded border border-slate-200/60 leading-relaxed">
                      &ldquo;{block.remarks || 'Work completed on track. Staff and machinery clear of running lines. Track certified fit for traffic.'}&rdquo;
                    </p>

                    <div className="flex items-center justify-between text-[11px] text-slate-600 pt-0.5">
                      <div className="flex items-center space-x-1">
                        <User className="w-3 h-3 text-slate-400" />
                        <span className="font-semibold text-slate-800">
                          {block.requestedBy || 'SSE / Section In-Charge'}
                        </span>
                        {block.designation && (
                          <span className="text-slate-500">({block.designation})</span>
                        )}
                      </div>
                      <span className="font-mono text-[10px] text-slate-500">
                        {block.preferredDate} {block.preferredEndTime || ''}
                      </span>
                    </div>
                  </div>

                  {/* Safety Protocols Verification Badges */}
                  <div className="bg-slate-50/70 border border-slate-200 rounded-lg p-2 text-[10px] text-slate-600 grid grid-cols-2 gap-1.5">
                    <span className="flex items-center space-x-1 text-emerald-800 font-medium">
                      <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                      <span className="truncate">Staff & Gang Clear</span>
                    </span>
                    <span className="flex items-center space-x-1 text-emerald-800 font-medium">
                      <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                      <span className="truncate">Machines Off Track</span>
                    </span>
                    <span className="flex items-center space-x-1 text-emerald-800 font-medium">
                      <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                      <span className="truncate">Banner Flags Removed</span>
                    </span>
                    <span className="flex items-center space-x-1 text-emerald-800 font-medium">
                      <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                      <span className="truncate">SM Notified & Signed</span>
                    </span>
                  </div>
                </div>

                {/* Card Footer / Action Buttons */}
                <div className="bg-slate-50 border-t border-slate-200 px-4 py-3 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedMemoBlock(block)}
                    className="inline-flex items-center px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 shadow-2xs transition-colors"
                  >
                    <Printer className="w-3.5 h-3.5 mr-1 text-slate-500" />
                    {t('completedBlocks.printCertificate', {}, 'Print Fit Memo')}
                  </button>

                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => setReopenBlock(block)}
                      className="inline-flex items-center px-2 py-1.5 text-[11px] font-medium text-slate-600 hover:text-red-700 bg-white hover:bg-red-50 border border-slate-300 hover:border-red-200 rounded-lg transition-colors shadow-2xs"
                      title="Revert status back to APPROVED in Supabase"
                    >
                      <RotateCcw className="w-3 h-3 mr-1 text-slate-400" />
                      {t('completedBlocks.reopenBlock', {}, 'Re-open')}
                    </button>

                    <Link
                      href={`/requests/${block.id}`}
                      prefetch={true}
                      className="inline-flex items-center px-3 py-1.5 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-2xs transition-colors"
                    >
                      <FileText className="w-3 h-3 mr-1" />
                      Details
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="bg-white border border-slate-300 rounded-xl shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-300 text-slate-700 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Block ID</th>
                  <th className="py-3 px-3">Department</th>
                  <th className="py-3 px-3">Corridor & Section</th>
                  <th className="py-3 px-3">Asset</th>
                  <th className="py-3 px-3">Maintenance Executed</th>
                  <th className="py-3 px-3">Track Fit Status</th>
                  <th className="py-3 px-3">Certified By</th>
                  <th className="py-3 px-3">Duration</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredBlocks.map((b) => {
                  const isTsr = (b.remarks || '').toLowerCase().includes('tsr') || (b.remarks || '').toLowerCase().includes('caution');
                  return (
                    <tr key={b.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-blue-900 whitespace-nowrap">
                        <Link href={`/requests/${b.id}`} className="hover:underline">
                          {b.id}
                        </Link>
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <DepartmentBadge department={b.department} size="sm" showSystem={true} />
                      </td>
                      <td className="py-3 px-3 max-w-[200px]">
                        <div className="font-semibold text-slate-800 truncate">{b.corridor}</div>
                        <div className="text-[11px] text-slate-500 truncate">{b.blockSection}</div>
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap font-mono text-slate-700">
                        {b.assetType} #{b.assetId}
                      </td>
                      <td className="py-3 px-3 max-w-[180px] font-medium text-slate-800 truncate" title={b.maintenanceType}>
                        {b.maintenanceType}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold border ${
                          isTsr
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        }`}>
                          <BadgeCheck className="w-3 h-3 mr-1" />
                          {isTsr ? 'TSR Caution' : 'Normal Speed'}
                        </span>
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap text-slate-700 font-medium">
                        {b.requestedBy || 'SSE In-Charge'}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap font-mono text-slate-800">
                        {b.durationFormatted}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap text-right space-x-1.5">
                        <button
                          type="button"
                          onClick={() => setSelectedMemoBlock(b)}
                          className="px-2 py-1 text-[11px] font-medium text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-100 shadow-2xs"
                        >
                          Fit Memo
                        </button>
                        <Link
                          href={`/requests/${b.id}`}
                          className="px-2 py-1 text-[11px] font-semibold text-white bg-blue-700 rounded hover:bg-blue-800 shadow-2xs"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CERTIFIED TRACK FIT MEMO MODAL */}
      {isMounted && selectedMemoBlock && (
        <div className="fixed inset-0 bg-slate-900/70 z-50 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl border border-slate-300 shadow-2xl max-w-2xl w-full p-6 space-y-5 animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-200 pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold">
                  IR
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                    Southern Railway &bull; Divisional Operating Department
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Form T/409: Official Track Fit Certificate & Line Clearance Memo
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedMemoBlock(null)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Memo Sheet Body */}
            <div className="border border-slate-300 rounded-xl p-5 bg-slate-50/50 space-y-4 text-xs">
              <div className="flex justify-between items-center pb-2 border-b border-slate-200 text-slate-500">
                <span>Reference Memo No: <strong className="text-slate-900 font-mono">T409-{selectedMemoBlock.id}</strong></span>
                <span>Date: <strong className="text-slate-900">{selectedMemoBlock.preferredDate}</strong></span>
              </div>

              <div className="grid grid-cols-2 gap-3 pb-3 border-b border-slate-200">
                <div>
                  <span className="text-slate-500 block text-[11px]">Corridor / Section:</span>
                  <span className="font-bold text-slate-900">{selectedMemoBlock.corridor}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Block Section & Line:</span>
                  <span className="font-bold text-slate-900">{selectedMemoBlock.blockSection} ({selectedMemoBlock.line || 'Main Line'})</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Department & System:</span>
                  <span className="font-semibold text-slate-800">{selectedMemoBlock.department} ({selectedMemoBlock.systemName})</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Asset Involved:</span>
                  <span className="font-mono font-semibold text-slate-800">{selectedMemoBlock.assetType} #{selectedMemoBlock.assetId}</span>
                </div>
              </div>

              {/* Certificate Text */}
              <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-xl text-emerald-950 space-y-2">
                <span className="font-bold block uppercase text-[11px] text-emerald-800">
                  Track Safety & Fitness Certification:
                </span>
                <p className="text-xs leading-relaxed italic font-serif">
                  &ldquo;This is to officially certify that the scheduled maintenance block on Section {selectedMemoBlock.blockSection} has been satisfactorily executed. All railway staff, tools, plant and track machines have been safely withdrawn beyond fouling mark. The track structure, overhead traction line and signalling gears are certified safe and fit for traffic.&rdquo;
                </p>
                <div className="pt-2 text-xs font-semibold text-emerald-900">
                  Speed Condition: {(selectedMemoBlock.remarks || '').toLowerCase().includes('tsr') ? 'TSR Caution 30 kmph imposed until next packing.' : 'Fit for Normal Sectional Speed.'}
                </div>
              </div>

              {/* Signatures */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200 text-center">
                <div className="border border-dashed border-slate-300 p-3 rounded-lg">
                  <div className="h-8"></div>
                  <span className="font-bold text-slate-900 block">{selectedMemoBlock.requestedBy || 'K. Ramanathan'}</span>
                  <span className="text-[10px] text-slate-500">{selectedMemoBlock.designation || 'Senior Section Engineer (In-Charge)'}</span>
                </div>
                <div className="border border-dashed border-slate-300 p-3 rounded-lg">
                  <div className="h-8"></div>
                  <span className="font-bold text-slate-900 block">Station Master / SCOR</span>
                  <span className="text-[10px] text-slate-500">Operating Control Acknowledgement</span>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setSelectedMemoBlock(null)}
                className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handlePrint}
                className="px-4 py-2 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-sm flex items-center space-x-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Official Certificate</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RE-OPEN CONFIRMATION MODAL */}
      {isMounted && reopenBlock && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl border border-slate-300 shadow-2xl max-w-md w-full p-5 space-y-4">
            <div className="flex items-start space-x-3">
              <div className="p-2.5 rounded-xl bg-amber-100 text-amber-800 shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  {t('completedBlocks.reopenBlock', {}, 'Re-open Completed Block?')}
                </h3>
                <p className="text-xs text-slate-600 mt-1">
                  {t('completedBlocks.reopenConfirm', {}, 'Are you sure you want to revert this completed block back to APPROVED status in Supabase? It will move back to the Approved Blocks page.')}
                </p>
                <div className="mt-2 text-xs font-mono font-bold text-blue-900 bg-slate-100 p-2 rounded border border-slate-200">
                  {reopenBlock.id} &bull; {reopenBlock.blockSection}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setReopenBlock(null)}
                disabled={isReopening}
                className="px-3.5 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReopen}
                disabled={isReopening}
                className="px-4 py-1.5 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-sm flex items-center space-x-1.5 disabled:opacity-50"
              >
                {isReopening ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Updating Supabase...</span>
                  </>
                ) : (
                  <>
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Confirm Re-open</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CompletedBlocksPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto py-12 text-center text-slate-500 text-sm font-medium">
          Loading completed blocks...
        </div>
      }
    >
      <CompletedBlocksContent />
    </Suspense>
  );
}
