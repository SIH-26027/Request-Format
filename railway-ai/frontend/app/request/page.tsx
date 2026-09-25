'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Wrench, 
  Zap, 
  Radio, 
  ArrowRight, 
  ShieldCheck, 
  Clock, 
  FileText 
} from 'lucide-react';
import RequestHeader from '../../components/request/common/RequestHeader';
import { useLanguage } from '../../context/LanguageContext';

export default function RequestDepartmentSelectionPage() {
  const { t } = useLanguage();

  const departments = [
    {
      id: 'engineering',
      name: t('departments.engineering.name', {}, 'Engineering (Civil / P-Way)'),
      systemName: t('departments.engineering.systemName', {}, 'TMS'),
      systemFullName: t('departments.engineering.systemFullName', {}, 'Track Management System'),
      description: t('departments.engineering.description', {}, 'Track structure renewal, deep screening, ballast tamping, rail/sleeper replacements, and points & crossings maintenance.'),
      href: '/request/engineering',
      icon: Wrench,
      borderTop: 'border-t-amber-600',
      badgeClass: 'bg-amber-100 text-amber-900 border-amber-300',
      systemClass: 'bg-amber-50 text-amber-800 border-amber-200',
      buttonClass: 'bg-amber-700 hover:bg-amber-800 text-white',
      responsibilities: [
        t('departments.engineering.resp1', {}, 'Ballast tamping & machine alignment (CSM / BCM)'),
        t('departments.engineering.resp2', {}, 'Through Rail / Sleeper Renewal (TRR / TSR)'),
        t('departments.engineering.resp3', {}, 'Turnout renewal & Weld collar trimming (AT Welding)'),
        t('departments.engineering.resp4', {}, 'Track de-stressing & curve realignment'),
      ]
    },
    {
      id: 'trd',
      name: t('departments.trd.name', {}, 'Traction Distribution (TRD)'),
      systemName: t('departments.trd.systemName', {}, 'TDMS'),
      systemFullName: t('departments.trd.systemFullName', {}, 'Traction Distribution Management System'),
      description: t('departments.trd.description', {}, 'Overhead Equipment (OHE) periodic overhaul, contact wire maintenance, insulator replacement, and power block isolations.'),
      href: '/request/trd',
      icon: Zap,
      borderTop: 'border-t-sky-600',
      badgeClass: 'bg-sky-100 text-sky-900 border-sky-300',
      systemClass: 'bg-sky-50 text-sky-800 border-sky-200',
      buttonClass: 'bg-sky-700 hover:bg-sky-800 text-white',
      responsibilities: [
        t('departments.trd.resp1', {}, 'Annual & periodic OHE overhaul (AOH / POH)'),
        t('departments.trd.resp2', {}, 'Section insulator & isolator switch overhauling'),
        t('departments.trd.resp3', {}, 'Cantilever adjustment & contact wire stagger check'),
        t('departments.trd.resp4', {}, 'Emergency 25kV power shutdown & discharge earthing'),
      ]
    },
    {
      id: 'snt',
      name: t('departments.snt.name', {}, 'Signal & Telecommunication (S&T)'),
      systemName: t('departments.snt.systemName', {}, 'SMMS'),
      systemFullName: t('departments.snt.systemFullName', {}, 'Signalling Maintenance & Management System'),
      description: t('departments.snt.description', {}, 'Signalling and telecommunication maintenance, electronic interlocking, point machines, track circuits, and axle counters.'),
      href: '/request/snt',
      icon: Radio,
      borderTop: 'border-t-purple-600',
      badgeClass: 'bg-purple-100 text-purple-900 border-purple-300',
      systemClass: 'bg-purple-50 text-purple-800 border-purple-200',
      buttonClass: 'bg-purple-700 hover:bg-purple-800 text-white',
      responsibilities: [
        t('departments.snt.resp1', {}, 'Electronic Interlocking (EI) diagnostics & card testing'),
        t('departments.snt.resp2', {}, 'Point Machine overhaul & 3.8mm/5mm obstruction test'),
        t('departments.snt.resp3', {}, 'Track circuit bonding & Glued Insulated Joint renewal'),
        t('departments.snt.resp4', {}, 'Digital Axle Counter (MSDAC) tuning & calibration'),
      ]
    }
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <RequestHeader
        title={t('portal.title', {}, 'Maintenance Block Request Portal')}
        subtitle={t('portal.subtitle', {}, 'Select the authorized railway maintenance department to initiate a formal corridor traffic block or power disconnection request for division planning sanction.')}
        breadcrumbs={[
          { label: t('portal.controlPortal', {}, 'Control Portal'), href: '/request' },
          { label: t('portal.newBlockRequest', {}, 'New Block Request') }
        ]}
        action={
          <Link
            href="/requests"
            prefetch={true}
            className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-50 transition-colors shadow-xs"
          >
            <FileText className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
            {t('portal.viewActiveRequests', {}, 'View Active Block Requests Table')}
          </Link>
        }
      />

      {/* Control Notice Banner */}
      <div className="bg-slate-900 text-slate-100 rounded border border-slate-700 p-4">
        <div className="flex items-start space-x-3">
          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <h3 className="font-bold text-white text-sm">{t('portal.protocolNoticeTitle', {}, 'Corridor Block Planning Protocol Notice')}</h3>
            <p className="text-slate-300 leading-relaxed">
              {t('portal.protocolNoticeDesc', {}, 'All block requests submitted via this portal are routed directly into the Division Block Planning Cell and corridor slot optimization engine. Maintenance authorities must ensure coordination between P-Way, TRD, and S&T where shadow blocks or joint disconnections are required.')}
            </p>
          </div>
        </div>
      </div>

      {/* Three Department Selection Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {departments.map((dept) => {
          const Icon = dept.icon;
          return (
            <div
              key={dept.id}
              className={`bg-white rounded border border-slate-300 shadow-xs flex flex-col justify-between overflow-hidden border-t-4 ${dept.borderTop} hover:shadow-md transition-shadow`}
            >
              <div className="p-5 space-y-4">
                {/* Header with Icon and Systems */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2.5 rounded bg-slate-100 border border-slate-200 text-slate-800">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-slate-900 tracking-tight">
                        {dept.name}
                      </h2>
                      <span className={`inline-block text-[11px] font-mono px-2 py-0.5 rounded border mt-0.5 ${dept.systemClass}`}>
                        {dept.systemName} &bull; {dept.systemFullName}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-600 leading-relaxed min-h-[36px]">
                  {dept.description}
                </p>

                {/* Responsibilities list */}
                <div className="border-t border-slate-100 pt-3">
                  <span className="text-[11px] font-semibold text-slate-700 uppercase tracking-wider block mb-2">
                    {t('portal.scopeTitle', {}, 'Scope of Maintenance Activities:')}
                  </span>
                  <ul className="space-y-1.5 text-xs text-slate-600">
                    {dept.responsibilities.map((resp, i) => (
                      <li key={i} className="flex items-start">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-1.5 mr-2 shrink-0" />
                        <span>{resp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Card Footer / Action */}
              <div className="bg-slate-50 border-t border-slate-200 px-5 py-3.5 flex items-center justify-between">
                <span className="text-[11px] font-medium text-slate-500">
                  {t('portal.formLabel', {}, 'Form: Official Block Indent')}
                </span>
                <Link
                  href={dept.href}
                  prefetch={true}
                  className={`inline-flex items-center px-4 py-2 text-xs font-semibold rounded transition-colors shadow-xs ${dept.buttonClass}`}
                >
                  {t('portal.createRequest', {}, 'Create Request')}
                  <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* Operational Procedure Guidelines */}
      <div className="bg-white border border-slate-300 rounded p-5 shadow-xs">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide mb-3 flex items-center">
          <Clock className="w-4 h-4 mr-1.5 text-blue-600" />
          {t('portal.deadlinesTitle', {}, 'Submission Deadlines & Advance Planning Windows')}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-600">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded">
            <span className="font-semibold text-slate-900 block mb-1">
              {t('portal.routineTitle', {}, 'Routine / Weekly Maintenance')}
            </span>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              {t('portal.routineDesc', {}, 'Must be submitted at least 7 days prior to corridor block window to allow passenger and freight train path rescheduling.')}
            </p>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded">
            <span className="font-semibold text-slate-900 block mb-1">
              {t('portal.urgentTitle', {}, 'Urgent Maintenance (TSR Precaution)')}
            </span>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              {t('portal.urgentDesc', {}, 'Must be submitted 48 hours in advance with approval from Sr.DEN / Sr.DEE / Sr.DSTE to prevent speed relaxation delays.')}
            </p>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded">
            <span className="font-semibold text-slate-900 block mb-1">
              {t('portal.emergencyTitle', {}, 'Emergency Intervention')}
            </span>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              {t('portal.emergencyDesc', {}, 'Immediate coordination with Chief Controller (SCOR) and Sr.DOM. Post-hoc formal indent required within 24 hours.')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
