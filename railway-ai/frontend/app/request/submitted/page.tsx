'use client';

import React, { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
  CheckCircle2, 
  Copy, 
  Check, 
  Eye, 
  PlusCircle, 
  List, 
  ShieldCheck 
} from 'lucide-react';
import DepartmentBadge from '../../../components/request/common/DepartmentBadge';
import StatusBadge from '../../../components/request/common/StatusBadge';
import { RequestService } from '../../../services/request.service';
import { BlockRequestRecord, DepartmentCode } from '../../../types/request';
import { useLanguage } from '../../../context/LanguageContext';

function RequestSubmittedContent() {
  const searchParams = useSearchParams();
  const requestId = searchParams.get('id') || 'IND-2026-SR-9999';
  const deptParam = (searchParams.get('dept') as DepartmentCode) || 'ENGINEERING';
  const [copied, setCopied] = useState(false);
  const [record, setRecord] = useState<BlockRequestRecord | null>(null);
  const { t } = useLanguage();

  useEffect(() => {
    async function loadRecord() {
      if (requestId) {
        const found = await RequestService.getById(requestId);
        if (found) {
          setRecord(found);
        }
      }
    }
    loadRecord();
  }, [requestId]);

  const handleCopy = () => {
    navigator.clipboard.writeText(requestId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formattedTimestamp = record?.createdAt
    ? new Date(record.createdAt).toLocaleDateString('en-GB', {
        weekday: 'short',
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }) + ' ' + new Date(record.createdAt).toLocaleTimeString('en-GB', { hour12: false }) + ' IST'
    : new Date().toLocaleDateString('en-GB', {
        weekday: 'short',
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }) + ' ' + new Date().toLocaleTimeString('en-GB', { hour12: false }) + ' IST';

  return (
    <div className="max-w-3xl mx-auto space-y-6 py-4">
      {/* Official Acknowledgment Card */}
      <div className="bg-white border border-slate-300 rounded shadow-sm overflow-hidden">
        {/* Status Header */}
        <div className="bg-slate-900 text-white p-5 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded bg-emerald-700/80 text-white flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-mono tracking-wider text-emerald-400 uppercase font-semibold">
                {t('submitted.successTitle', {}, 'Official Indent Acknowledgment')}
              </span>
              <h1 className="text-lg font-bold text-white tracking-tight">
                {t('submitted.successSubtitle', {}, 'Maintenance Block Request Submitted Successfully')}
              </h1>
            </div>
          </div>
        </div>

        {/* Reference & Core Parameters */}
        <div className="p-6 space-y-5">
          {/* Reference ID Banner */}
          <div className="bg-slate-50 border border-slate-200 rounded p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <span className="text-xs text-slate-500 font-medium block">
                {t('submitted.indentRef', {}, 'Official System Reference ID')}
              </span>
              <span className="text-base font-mono font-bold text-slate-900 tracking-wider">
                {requestId}
              </span>
            </div>
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center self-start sm:self-center px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-100 transition-colors shadow-xs"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
                  Copied to Clipboard
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
                  Copy Reference ID
                </>
              )}
            </button>
          </div>

          {/* Key Parameters Table */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="space-y-3 p-4 bg-slate-50/70 rounded border border-slate-200">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">{t('table.colDept', {}, 'Maintenance Department')}</span>
                <DepartmentBadge department={record?.department || deptParam} size="md" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Submission Timestamp</span>
                <span className="font-mono text-slate-800">{formattedTimestamp}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Current Workflow State</span>
                <StatusBadge status="UNDER_PLANNING" size="md" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">{t('table.colPriority', {}, 'Priority Level')}</span>
                <span className="font-semibold text-slate-800">
                  {record?.priority ? t('priority.' + record.priority, {}, record.priority) : t('priority.URGENT', {}, 'URGENT')}
                </span>
              </div>
            </div>

            <div className="space-y-3 p-4 bg-slate-50/70 rounded border border-slate-200">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">{t('actions.corridor', {}, 'Target Corridor')}</span>
                <span className="font-semibold text-slate-900 text-right truncate max-w-[180px]">
                  {record?.corridor || 'Southern Railway Corridor'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">{t('actions.blockSection', {}, 'Block Section')}</span>
                <span className="font-medium text-slate-800 text-right truncate max-w-[180px]">
                  {record?.blockSection || 'Section MS - TBM'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">{t('table.colDate', {}, 'Requested Window')}</span>
                <span className="font-mono text-slate-800">
                  {record?.preferredDate || '2026-09-23'} ({record?.preferredStartTime || '10:30'} - {record?.preferredEndTime || '13:30'})
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">{t('table.colDuration', {}, 'Planned Duration')}</span>
                <span className="font-bold text-blue-800 font-mono">
                  {record?.durationFormatted || '3 hrs 00 mins'}
                </span>
              </div>
            </div>
          </div>

          {/* Operational Next Steps Notice */}
          <div className="bg-blue-50/60 border border-blue-200 rounded p-4 text-xs text-blue-950 space-y-1.5">
            <div className="flex items-center space-x-2 font-bold text-blue-900">
              <ShieldCheck className="w-4 h-4 text-blue-700" />
              <span>{t('submitted.nextSteps', {}, 'Next Steps in Division Approval Workflow:')}</span>
            </div>
            <p className="text-blue-900/90 leading-relaxed text-[11px]">
              {t('submitted.step1', {}, '1. Automatic Corridor Conflict Checking & Slot Matching by AI Engine')}<br />
              {t('submitted.step2', {}, '2. Joint Department Feasibility Review (Engineering / TRD / S&T)')}<br />
              {t('submitted.step3', {}, '3. Division Operating Sanction from Sr.DOM / Chief Controller (SCOR)')}
            </p>
          </div>

          {/* Action Links */}
          <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            <Link
              href={`/requests/${requestId}`}
              prefetch={true}
              className="w-full sm:w-auto px-4 py-2 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded transition-colors inline-flex items-center justify-center shadow-xs"
            >
              <Eye className="w-3.5 h-3.5 mr-1.5" />
              {t('table.view', {}, 'View Request Specification & Timeline')}
            </Link>

            <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
              <Link
                href="/request"
                prefetch={true}
                className="w-full sm:w-auto px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-50 transition-colors inline-flex items-center justify-center shadow-xs"
              >
                <PlusCircle className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
                {t('submitted.newRequest', {}, 'Submit Another Request')}
              </Link>

              <Link
                href="/requests"
                prefetch={true}
                className="w-full sm:w-auto px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-50 transition-colors inline-flex items-center justify-center shadow-xs"
              >
                <List className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
                {t('submitted.viewInTable', {}, 'Back to All Requests')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RequestSubmittedPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-3xl mx-auto py-12 text-center text-slate-500 text-sm font-medium">
          Loading submission details...
        </div>
      }
    >
      <RequestSubmittedContent />
    </Suspense>
  );
}
