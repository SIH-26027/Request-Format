'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Printer, 
  Copy, 
  Check, 
  Calendar, 
  Clock, 
  MapPin, 
  Wrench, 
  Shield, 
  CheckSquare,
  AlertCircle,
  FileText,
  User,
  Phone,
  Layers,
  Zap,
  Radio,
  FileCheck
} from 'lucide-react';
import RequestHeader from '../../../components/request/common/RequestHeader';
import DepartmentBadge from '../../../components/request/common/DepartmentBadge';
import StatusBadge from '../../../components/request/common/StatusBadge';
import RequestTimeline from '../../../components/request/common/RequestTimeline';
import { useSingleRequest } from '../../../hooks/useRequest';

export default function RequestDetailsPage() {
  const params = useParams();
  const id = (params.id as string) || '';
  const { request, loading, isMounted } = useSingleRequest(id);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!request) return;
    navigator.clipboard.writeText(request.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  if (!isMounted || loading) {
    return (
      <div className="py-20 text-center text-slate-500 text-xs">
        Loading block request specification...
      </div>
    );
  }

  if (!request) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center space-y-4">
        <AlertCircle className="w-10 h-10 text-amber-500 mx-auto" />
        <h2 className="text-base font-bold text-slate-800">Block Request Not Found</h2>
        <p className="text-xs text-slate-500">
          No block request found with reference ID <span className="font-mono">{id}</span>.
        </p>
        <Link
          href="/requests"
          prefetch={true}
          className="inline-flex items-center px-4 py-2 text-xs font-semibold text-white bg-blue-700 rounded hover:bg-blue-800"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
          Back to Block Requests Registry
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <RequestHeader
        title={`Block Request: ${request.id}`}
        subtitle={`Submitted under ${request.departmentName} (${request.systemName}) for corridor slot scheduling and division sanction.`}
        department={request.department}
        systemName={request.systemName}
        backLink="/requests"
        backText="Back to Requests Table"
        breadcrumbs={[
          { label: 'Control Portal', href: '/request' },
          { label: 'Requests Registry', href: '/requests' },
          { label: request.id }
        ]}
        action={
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-50 transition-colors shadow-2xs"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 mr-1 text-slate-500" />
                  Copy ID
                </>
              )}
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-50 transition-colors shadow-2xs"
            >
              <Printer className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
              Print Indent
            </button>
          </div>
        }
      />

      {/* Main Grid: Details + Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Specification Sections */}
        <div className="lg:col-span-8 space-y-5">
          {/* Status & Quick Bar */}
          <div className="bg-white border border-slate-300 rounded p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              <span className="text-xs text-slate-500 font-medium">Current Status:</span>
              <StatusBadge status={request.status} size="md" />
            </div>

            <div className="flex items-center space-x-4 text-xs">
              <div>
                <span className="text-slate-400 mr-1">Priority:</span>
                <span
                  className={`font-semibold px-2 py-0.5 rounded text-[11px] ${
                    request.priority === 'EMERGENCY'
                      ? 'bg-red-100 text-red-800'
                      : request.priority === 'URGENT'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {request.priority}
                </span>
              </div>

              <div>
                <span className="text-slate-400 mr-1">Urgency:</span>
                <span className="font-medium text-slate-800">{request.urgency}</span>
              </div>
            </div>
          </div>

          {/* 1. Request Information */}
          <div className="bg-white border border-slate-300 rounded shadow-xs overflow-hidden">
            <div className="bg-slate-50 border-b border-slate-200 px-4 py-2.5 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="w-5 h-5 rounded bg-slate-800 text-white font-mono text-[11px] flex items-center justify-center font-bold">
                  A
                </span>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Request Information & Submitting Authority
                </h3>
              </div>
            </div>
            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">Requested By</span>
                <span className="font-semibold text-slate-900 flex items-center mt-0.5">
                  <User className="w-3.5 h-3.5 mr-1 text-slate-400" />
                  {request.requestedBy}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Designation / Depot</span>
                <span className="font-medium text-slate-800 mt-0.5 block">{request.designation}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Contact CUG / Mobile</span>
                <span className="font-mono text-slate-800 flex items-center mt-0.5">
                  <Phone className="w-3.5 h-3.5 mr-1 text-slate-400" />
                  {request.contactNumber}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Date of Submission</span>
                <span className="font-mono text-slate-800 mt-0.5 block">{request.requestedDate}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">System Code</span>
                <span className="font-mono font-semibold text-blue-900 mt-0.5 block">{request.systemName}</span>
              </div>
            </div>
          </div>

          {/* 2. Location & Corridor */}
          <div className="bg-white border border-slate-300 rounded shadow-xs overflow-hidden">
            <div className="bg-slate-50 border-b border-slate-200 px-4 py-2.5 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="w-5 h-5 rounded bg-slate-800 text-white font-mono text-[11px] flex items-center justify-center font-bold">
                  B
                </span>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Location & Corridor Boundaries
                </h3>
              </div>
            </div>
            <div className="p-4 space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <span className="text-slate-400 block text-[11px]">Railway Corridor</span>
                  <span className="font-semibold text-slate-900 flex items-center mt-0.5">
                    <MapPin className="w-3.5 h-3.5 mr-1 text-slate-400" />
                    {request.corridor}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Designated Block Section</span>
                  <span className="font-semibold text-slate-800 mt-0.5 block">{request.blockSection}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Track Line</span>
                  <span className="font-mono font-semibold text-blue-900 mt-0.5 block">
                    {request.line} Line
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-100">
                <div>
                  <span className="text-slate-400 block text-[11px]">From Station / Post</span>
                  <span className="font-medium text-slate-800 mt-0.5 block">{request.fromLocation}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">To Station / Post</span>
                  <span className="font-medium text-slate-800 mt-0.5 block">{request.toLocation}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Kilometer Chainage</span>
                  <span className="font-mono text-slate-800 mt-0.5 block">{request.chainage}</span>
                </div>
              </div>
            </div>
          </div>

          {/* 3. Asset Information */}
          <div className="bg-white border border-slate-300 rounded shadow-xs overflow-hidden">
            <div className="bg-slate-50 border-b border-slate-200 px-4 py-2.5 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="w-5 h-5 rounded bg-slate-800 text-white font-mono text-[11px] flex items-center justify-center font-bold">
                  C
                </span>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Department Asset Identification & Defect
                </h3>
              </div>
            </div>
            <div className="p-4 space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <span className="text-slate-400 block text-[11px]">Asset Category</span>
                  <span className="font-semibold text-slate-900 mt-0.5 block">{request.assetType}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Asset ID / Equipment Code</span>
                  <span className="font-mono font-bold text-slate-900 mt-0.5 block">{request.assetId}</span>
                </div>
                {request.assetCondition && (
                  <div>
                    <span className="text-slate-400 block text-[11px]">Asset Condition Assessment</span>
                    <span className="font-semibold text-amber-900 mt-0.5 block">
                      {request.assetCondition}
                    </span>
                  </div>
                )}
              </div>

              <div className="bg-slate-50 border border-slate-200 p-3 rounded">
                <span className="text-[11px] font-semibold text-slate-600 block uppercase">
                  Defect Description & Justification
                </span>
                <p className="text-slate-800 mt-1 leading-relaxed">
                  {request.defectReason}
                </p>
              </div>
            </div>
          </div>

          {/* 4. Maintenance Details */}
          <div className="bg-white border border-slate-300 rounded shadow-xs overflow-hidden">
            <div className="bg-slate-50 border-b border-slate-200 px-4 py-2.5 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="w-5 h-5 rounded bg-slate-800 text-white font-mono text-[11px] flex items-center justify-center font-bold">
                  D
                </span>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Maintenance Details & Operating Slot
                </h3>
              </div>
            </div>
            <div className="p-4 space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div className="sm:col-span-2">
                  <span className="text-slate-400 block text-[11px]">Maintenance Activity Type</span>
                  <span className="font-semibold text-slate-900 mt-0.5 block">{request.maintenanceType}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Preferred Block Date</span>
                  <span className="font-mono font-medium text-slate-800 flex items-center mt-0.5">
                    <Calendar className="w-3.5 h-3.5 mr-1 text-slate-400" />
                    {request.preferredDate}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Requested Window & Duration</span>
                  <span className="font-mono font-bold text-blue-900 flex items-center mt-0.5">
                    <Clock className="w-3.5 h-3.5 mr-1 text-slate-400" />
                    {request.preferredStartTime} - {request.preferredEndTime} ({request.durationFormatted})
                  </span>
                </div>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px]">Scope of Engineering Operation</span>
                <p className="text-slate-800 mt-1 leading-relaxed bg-slate-50 p-2.5 rounded border border-slate-200">
                  {request.description}
                </p>
              </div>
            </div>
          </div>

          {/* 5. Operational Requirements */}
          <div className="bg-white border border-slate-300 rounded shadow-xs overflow-hidden">
            <div className="bg-slate-50 border-b border-slate-200 px-4 py-2.5 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="w-5 h-5 rounded bg-slate-800 text-white font-mono text-[11px] flex items-center justify-center font-bold">
                  E
                </span>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Operational & Equipment Clearances
                </h3>
              </div>
            </div>
            <div className="p-4 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {request.operationalRequirements.map((op: { label: string; value: unknown }, idx: number) => (
                  <div key={idx} className="flex items-center justify-between p-2 rounded bg-slate-50 border border-slate-200">
                    <span className="text-slate-700">{op.label}</span>
                    <span className="font-semibold text-slate-900">
                      {typeof op.value === 'boolean'
                        ? op.value ? (
                            <span className="text-emerald-700 font-bold">YES</span>
                          ) : (
                            <span className="text-slate-400">NO</span>
                          )
                        : String(op.value)}
                    </span>
                  </div>
                ))}
              </div>

              {request.equipmentRequired && request.equipmentRequired.length > 0 && (
                <div>
                  <span className="text-slate-500 block text-[11px] font-semibold mb-1">
                    Deployed Machinery / Specialized Equipment:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {request.equipmentRequired.map((eq: string, i: number) => (
                      <span
                        key={i}
                        className="bg-slate-100 text-slate-800 text-[11px] font-mono px-2 py-0.5 rounded border border-slate-300"
                      >
                        {eq}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="text-slate-700 font-medium">
                Mobilized Field Workforce: <span className="font-bold text-slate-900">{request.teamSize} personnel</span>
              </div>
            </div>
          </div>

          {/* 6. Safety Requirements & 7. Additional Information */}
          <div className="bg-white border border-slate-300 rounded shadow-xs overflow-hidden">
            <div className="bg-slate-50 border-b border-slate-200 px-4 py-2.5 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="w-5 h-5 rounded bg-slate-800 text-white font-mono text-[11px] flex items-center justify-center font-bold">
                  F
                </span>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Safety Protocols & Site Remarks
                </h3>
              </div>
            </div>
            <div className="p-4 space-y-4 text-xs">
              <div>
                <span className="text-slate-500 block text-[11px] font-semibold mb-1.5">
                  Mandatory Railway Safety Protocols:
                </span>
                <ul className="space-y-1">
                  {request.safetyRequirements.map((safety: string, idx: number) => (
                    <li key={idx} className="flex items-center text-slate-700">
                      <CheckSquare className="w-3.5 h-3.5 text-emerald-600 mr-2 shrink-0" />
                      <span>{safety}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {request.remarks && (
                <div className="pt-3 border-t border-slate-100">
                  <span className="text-slate-400 block text-[11px]">Site Remarks & Coordination Notes</span>
                  <p className="text-slate-800 mt-1 leading-relaxed bg-slate-50 p-2.5 rounded border border-slate-200">
                    {request.remarks}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Lifecycle Timeline & Summary Sidebar */}
        <div className="lg:col-span-4 space-y-5">
          {/* Status Timeline */}
          <RequestTimeline
            currentStatus={request.status}
            timeline={request.timeline}
          />

          {/* System Metadata Card */}
          <div className="bg-white border border-slate-300 rounded p-4 shadow-xs text-xs space-y-2.5">
            <h4 className="font-bold text-slate-800 uppercase text-[11px] tracking-wider border-b border-slate-200 pb-1.5">
              Electronic Indent Metadata
            </h4>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-400">Created Timestamp</span>
              <span className="font-mono text-slate-700">{request.createdAt ? new Date(request.createdAt).toLocaleString('en-GB') : 'N/A'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-400">Last System Update</span>
              <span className="font-mono text-slate-700">{request.updatedAt ? new Date(request.updatedAt).toLocaleString('en-GB') : 'N/A'}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400">System Gateway</span>
              <span className="font-mono text-blue-900 font-semibold">{request.systemName} &bull; ABPS v2.4</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
