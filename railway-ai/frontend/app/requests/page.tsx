'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Search, 
  Plus, 
  Eye, 
  Edit3, 
  RotateCcw, 
  Layers,
  Trash2,
  CheckCircle2
} from 'lucide-react';
import RequestHeader from '../../components/request/common/RequestHeader';
import DepartmentBadge from '../../components/request/common/DepartmentBadge';
import StatusBadge from '../../components/request/common/StatusBadge';
import { useRequests } from '../../hooks/useRequest';
import { RequestService } from '../../services/request.service';
import { DepartmentCode, RequestStatus, PriorityLevel, BlockRequestRecord } from '../../types/request';
import { useLanguage } from '../../context/LanguageContext';

export default function RequestsListPage() {
  const { requests, allRequests, loading, isMounted, filters, setFilters, counts, refreshRequests } = useRequests();
  const { t } = useLanguage();

  const handleResetFilters = () => {
    setFilters({
      search: '',
      department: 'ALL',
      status: 'ALL',
      priority: 'ALL',
      corridor: '',
      date: ''
    });
  };

  const handleClearRegistry = async () => {
    if (confirm(t('table.confirmClear', {}, 'Clear all stored block requests from registry and database?'))) {
      await RequestService.clearAll();
      refreshRequests();
    }
  };

  const getEditRoute = (dept: DepartmentCode) => {
    switch (dept) {
      case 'ENGINEERING':
        return '/request/engineering';
      case 'TRD':
        return '/request/trd';
      case 'SNT':
        return '/request/snt';
    }
  };

  return (
    <div className="space-y-6">
      <RequestHeader
        title={t('table.title', {}, 'Block Requests Registry')}
        subtitle={t('table.subtitle', {}, 'Operational registry of maintenance block indents submitted by Engineering (TMS), Traction Distribution (TDMS), and Signal & Telecommunication (SMMS).')}
        breadcrumbs={[
          { label: t('portal.controlPortal', {}, 'Control Portal'), href: '/request' },
          { label: t('table.title', {}, 'Block Requests Registry') }
        ]}
        action={
          <div className="flex items-center space-x-2">
            {isMounted && allRequests.length > 0 && (
              <button
                type="button"
                onClick={handleClearRegistry}
                className="inline-flex items-center px-2.5 py-2 text-xs font-medium text-slate-600 hover:text-red-700 bg-white hover:bg-red-50 border border-slate-300 hover:border-red-200 rounded transition-colors shadow-2xs"
                title="Clear all local cached requests"
              >
                <Trash2 className="w-3.5 h-3.5 mr-1" />
                {t('table.clearStored', {}, 'Clear Stored')}
              </button>
            )}
            <Link
              href="/approved-blocks"
              prefetch={true}
              className="inline-flex items-center px-3 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded transition-colors shadow-2xs"
            >
              <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
              COA Approved Blocks
            </Link>
            <Link
              href="/request"
              prefetch={true}
              className="inline-flex items-center px-3.5 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded transition-colors shadow-xs"
            >
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              {t('table.newIndent', {}, 'New Block Request')}
            </Link>
          </div>
        }
      />

      {/* Department Tabs & Counts */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-300 pb-2">
        <div className="flex items-center space-x-1">
          <button
            type="button"
            onClick={() => setFilters({ ...filters, department: 'ALL' })}
            className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
              filters.department === 'ALL'
                ? 'bg-slate-900 text-white font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
            }`}
          >
            {t('table.allDepartments', {}, 'All Departments')} ({counts.all})
          </button>
          <button
            type="button"
            onClick={() => setFilters({ ...filters, department: 'ENGINEERING' })}
            className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
              filters.department === 'ENGINEERING'
                ? 'bg-amber-700 text-white font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
            }`}
          >
            {t('departments.engineering.name', {}, 'Engineering')} ({counts.engineering})
          </button>
          <button
            type="button"
            onClick={() => setFilters({ ...filters, department: 'TRD' })}
            className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
              filters.department === 'TRD'
                ? 'bg-sky-700 text-white font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
            }`}
          >
            {t('departments.trd.name', {}, 'TRD')} ({counts.trd})
          </button>
          <button
            type="button"
            onClick={() => setFilters({ ...filters, department: 'SNT' })}
            className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
              filters.department === 'SNT'
                ? 'bg-purple-700 text-white font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
            }`}
          >
            {t('departments.snt.name', {}, 'S&T')} ({counts.snt})
          </button>
        </div>

        <div className="text-xs text-slate-500 font-medium">
          {t('table.recordsCount', { count: requests.length }, `Showing ${requests.length} block request records`)}
        </div>
      </div>

      {/* Filter Control Bar */}
      <div className="bg-white border border-slate-300 rounded p-4 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search Box */}
          <div className="relative lg:col-span-2">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={filters.search}
              placeholder={t('table.searchPlaceholder', {}, 'Search by ID, Asset, Work Type, Section...')}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFilters({ ...filters, search: e.target.value })}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-600"
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={filters.status}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFilters({ ...filters, status: e.target.value as RequestStatus | 'ALL' })}
              className="w-full px-2.5 py-1.5 text-xs rounded border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
            >
              <option value="ALL">{t('table.allStatuses', {}, 'All Statuses')}</option>
              <option value="DRAFT">{t('status.DRAFT', {}, 'Draft')}</option>
              <option value="SUBMITTED">{t('status.PENDING', {}, 'Submitted')}</option>
              <option value="APPROVED">{t('status.APPROVED', {}, 'Approved')}</option>
              <option value="REJECTED">{t('status.REJECTED', {}, 'Rejected')}</option>
              <option value="COMPLETED">{t('status.COMPLETED', {}, 'Completed')}</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div>
            <select
              value={filters.priority}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFilters({ ...filters, priority: e.target.value as PriorityLevel | 'ALL' })}
              className="w-full px-2.5 py-1.5 text-xs rounded border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
            >
              <option value="ALL">{t('table.allPriorities', {}, 'All Priorities')}</option>
              <option value="NORMAL">{t('priority.NORMAL', {}, 'Normal Priority')}</option>
              <option value="URGENT">{t('priority.URGENT', {}, 'Urgent Priority')}</option>
              <option value="EMERGENCY">{t('priority.EMERGENCY', {}, 'Emergency Priority')}</option>
            </select>
          </div>

          {/* Date Filter */}
          <div className="flex items-center space-x-2">
            <input
              type="date"
              value={filters.date}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFilters({ ...filters, date: e.target.value })}
              className="w-full px-2 py-1.5 text-xs rounded border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
            />
            {(filters.search || filters.department !== 'ALL' || filters.status !== 'ALL' || filters.priority !== 'ALL' || filters.date || filters.corridor) && (
              <button
                type="button"
                onClick={handleResetFilters}
                title="Reset all filters"
                className="p-1.5 text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded border border-slate-300"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Enterprise Data Table */}
      <div className="bg-white border border-slate-300 rounded shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-300 text-slate-700 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">{t('table.colId', {}, 'Request ID')}</th>
                <th className="py-3 px-3">{t('table.colDept', {}, 'Department')}</th>
                <th className="py-3 px-3">{t('table.colCorridor', {}, 'Corridor & Section')}</th>
                <th className="py-3 px-3">{t('table.colAsset', {}, 'Asset')}</th>
                <th className="py-3 px-3">{t('table.colMaintenanceType', {}, 'Maintenance Type')}</th>
                <th className="py-3 px-3">{t('table.colDate', {}, 'Requested Date')}</th>
                <th className="py-3 px-3">{t('table.colDuration', {}, 'Duration')}</th>
                <th className="py-3 px-3">{t('table.colPriority', {}, 'Priority')}</th>
                <th className="py-3 px-3">{t('table.colStatus', {}, 'Status')}</th>
                <th className="py-3 px-4 text-right">{t('table.colActions', {}, 'Actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {!isMounted || loading ? (
                <tr>
                  <td colSpan={10} className="py-10 text-center text-slate-500">
                    {t('table.loading', {}, 'Loading block records...')}
                  </td>
                </tr>
              ) : requests.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-16 text-center text-slate-500">
                    {allRequests.length === 0 ? (
                      <div className="max-w-md mx-auto space-y-3">
                        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                          <Layers className="w-6 h-6" />
                        </div>
                        <h3 className="text-sm font-bold text-slate-800">{t('table.noRecords', {}, 'No Block Requests in Registry')}</h3>
                        <p className="text-xs text-slate-500 leading-relaxed">
                          {t('table.noRecordsDesc', {}, 'All static placeholder data has been cleared. Submit a new maintenance block request to start corridor slot planning.')}
                        </p>
                        <div className="pt-2">
                          <Link
                            href="/request"
                            className="inline-flex items-center px-4 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded transition-colors shadow-xs"
                          >
                            <Plus className="w-3.5 h-3.5 mr-1.5" />
                            {t('table.submitFirst', {}, 'Submit First Block Request')}
                          </Link>
                        </div>
                      </div>
                    ) : (
                      <>
                        <Layers className="w-8 h-8 text-slate-400 mx-auto mb-2 opacity-50" />
                        <p className="font-semibold text-slate-700">{t('table.noMatches', {}, 'No matching block requests found')}</p>
                        <p className="text-xs text-slate-400 mt-1">
                          {t('table.noMatchesDesc', {}, 'Try adjusting the search criteria, department, or date filter.')}
                        </p>
                        <button
                          type="button"
                          onClick={handleResetFilters}
                          className="mt-3 inline-flex items-center px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded border border-slate-300"
                        >
                          {t('table.clearFilters', {}, 'Clear Filters')}
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ) : (
                requests.map((req: BlockRequestRecord) => (
                  <tr
                    key={req.id}
                    className="hover:bg-slate-50/80 transition-colors group"
                  >
                    {/* Request ID */}
                    <td className="py-3 px-4 font-mono font-bold text-blue-900 whitespace-nowrap">
                      <Link href={`/requests/${req.id}`} className="hover:underline">
                        {req.id}
                      </Link>
                    </td>

                    {/* Department */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <DepartmentBadge department={req.department} size="sm" showSystem={true} />
                    </td>

                    {/* Corridor & Section */}
                    <td className="py-3 px-3 max-w-[200px]">
                      <div className="font-semibold text-slate-800 truncate" title={req.corridor}>
                        {req.corridor}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate" title={req.blockSection}>
                        {req.blockSection} &bull; {req.line} Line
                      </div>
                    </td>

                    {/* Asset */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <div className="font-medium text-slate-800">{req.assetType}</div>
                      <div className="text-[11px] font-mono text-slate-500">{req.assetId}</div>
                    </td>

                    {/* Maintenance Type */}
                    <td className="py-3 px-3 max-w-[180px]">
                      <div className="text-slate-800 truncate font-medium" title={req.maintenanceType}>
                        {req.maintenanceType}
                      </div>
                    </td>

                    {/* Requested Date */}
                    <td className="py-3 px-3 whitespace-nowrap font-mono text-slate-700">
                      <div>{req.preferredDate}</div>
                      <div className="text-[10px] text-slate-400">
                        {req.preferredStartTime} - {req.preferredEndTime}
                      </div>
                    </td>

                    {/* Duration */}
                    <td className="py-3 px-3 whitespace-nowrap font-mono text-slate-800 font-medium">
                      {req.durationFormatted}
                    </td>

                    {/* Priority */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded border ${
                          req.priority === 'EMERGENCY'
                            ? 'bg-red-50 text-red-800 border-red-200'
                            : req.priority === 'URGENT'
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : 'bg-slate-50 text-slate-700 border-slate-200'
                        }`}
                      >
                        {t('priority.' + req.priority, {}, req.priority)}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <StatusBadge status={req.status} size="sm" />
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 whitespace-nowrap text-right space-x-1.5">
                      <Link
                        href={`/requests/${req.id}`}
                        prefetch={true}
                        className="inline-flex items-center px-2 py-1 text-[11px] font-medium text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-100 transition-colors shadow-2xs"
                        title="View Full Request Details"
                      >
                        <Eye className="w-3 h-3 mr-1 text-slate-500" />
                        {t('table.view', {}, 'View')}
                      </Link>

                      {req.status === 'DRAFT' && (
                        <Link
                          href={getEditRoute(req.department)}
                          prefetch={true}
                          className="inline-flex items-center px-2 py-1 text-[11px] font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded hover:bg-blue-100 transition-colors shadow-2xs"
                          title="Edit Draft Request"
                        >
                          <Edit3 className="w-3 h-3 mr-1 text-blue-600" />
                          {t('table.edit', {}, 'Edit')}
                        </Link>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer Summary */}
        <div className="bg-slate-50 border-t border-slate-200 px-4 py-2.5 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center space-x-4">
            <span>{t('table.enterpriseMode', {}, 'Enterprise Mode: Read-only live synchronized store')}</span>
          </div>
          <div className="font-mono text-[11px]">
            {t('table.systemFooter', {}, 'System: ABPS Division Cell v2.4')}
          </div>
        </div>
      </div>
    </div>
  );
}
