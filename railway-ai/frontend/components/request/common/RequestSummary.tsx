import React from 'react';
import { DepartmentCode, PriorityLevel, TrackLineType } from '../../../types/request';
import DepartmentBadge from './DepartmentBadge';
import { formatDuration } from '../../../utils/request.utils';
import { Calendar, Clock, MapPin, Wrench, Shield, AlertCircle } from 'lucide-react';

interface RequestSummaryProps {
  requestId: string;
  department: DepartmentCode;
  priority: PriorityLevel;
  corridor?: string;
  blockSection?: string;
  line?: TrackLineType;
  chainage?: string;
  assetType?: string;
  assetId?: string;
  maintenanceType?: string;
  preferredDate?: string;
  preferredStartTime?: string;
  preferredEndTime?: string;
  durationHours?: number;
  durationMinutes?: number;
  teamSize?: number;
  safetyCount?: number;
}

export default function RequestSummary({
  requestId,
  department,
  priority,
  corridor,
  blockSection,
  line,
  chainage,
  assetType,
  assetId,
  maintenanceType,
  preferredDate,
  preferredStartTime,
  preferredEndTime,
  durationHours = 0,
  durationMinutes = 0,
  teamSize = 0,
  safetyCount = 0
}: RequestSummaryProps) {
  return (
    <div className="bg-white border border-slate-300 rounded shadow-xs overflow-hidden sticky top-20">
      {/* Header */}
      <div className="bg-slate-900 text-white px-4 py-2.5 flex items-center justify-between">
        <div>
          <span className="text-[10px] text-slate-400 font-mono block">REQUEST SPECIFICATION</span>
          <span className="text-xs font-mono font-bold text-blue-300">{requestId}</span>
        </div>
        <DepartmentBadge department={department} size="sm" />
      </div>

      <div className="p-4 space-y-3.5 text-xs text-slate-700">
        {/* Priority & Urgency */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <span className="text-slate-500 flex items-center">
            <AlertCircle className="w-3.5 h-3.5 mr-1 text-slate-400" />
            Priority Level
          </span>
          <span
            className={`font-semibold px-2 py-0.5 rounded text-[11px] ${
              priority === 'EMERGENCY'
                ? 'bg-red-100 text-red-800'
                : priority === 'URGENT'
                ? 'bg-amber-100 text-amber-800'
                : 'bg-slate-100 text-slate-700'
            }`}
          >
            {priority}
          </span>
        </div>

        {/* Location Snapshot */}
        <div className="space-y-1 pb-2 border-b border-slate-100">
          <span className="text-[11px] font-semibold text-slate-500 uppercase flex items-center">
            <MapPin className="w-3.5 h-3.5 mr-1 text-slate-400" />
            Location
          </span>
          <div className="pl-4 space-y-0.5">
            <div className="font-medium text-slate-900 truncate">{corridor || 'No corridor selected'}</div>
            <div className="text-[11px] text-slate-600 truncate">{blockSection || 'Section pending'}</div>
            {line && (
              <div className="text-[11px] font-mono text-slate-500">
                Track: {line} {chainage ? `(${chainage})` : ''}
              </div>
            )}
          </div>
        </div>

        {/* Maintenance / Asset */}
        <div className="space-y-1 pb-2 border-b border-slate-100">
          <span className="text-[11px] font-semibold text-slate-500 uppercase flex items-center">
            <Wrench className="w-3.5 h-3.5 mr-1 text-slate-400" />
            Maintenance Target
          </span>
          <div className="pl-4 space-y-0.5">
            <div className="font-medium text-slate-900 truncate">
              {maintenanceType || 'No maintenance specified'}
            </div>
            {assetType && (
              <div className="text-[11px] text-slate-600">
                Asset: {assetType} {assetId ? `[${assetId}]` : ''}
              </div>
            )}
          </div>
        </div>

        {/* Time Window & Duration */}
        <div className="space-y-1 pb-2 border-b border-slate-100">
          <span className="text-[11px] font-semibold text-slate-500 uppercase flex items-center">
            <Clock className="w-3.5 h-3.5 mr-1 text-slate-400" />
            Requested Time Window
          </span>
          <div className="pl-4 space-y-0.5">
            <div className="text-slate-900 font-medium">
              {preferredDate ? preferredDate : 'Date pending'}
            </div>
            <div className="font-mono text-[11px] text-slate-600">
              {preferredStartTime || '--:--'} to {preferredEndTime || '--:--'}
            </div>
            <div className="text-[11px] text-blue-700 font-semibold mt-0.5">
              Duration: {formatDuration(durationHours, durationMinutes)}
            </div>
          </div>
        </div>

        {/* Operational Stats */}
        <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-50 p-2 rounded border border-slate-200">
          <div>
            <span className="text-slate-500 block">Mobilized Team</span>
            <span className="font-bold text-slate-800">{teamSize || 0} personnel</span>
          </div>
          <div>
            <span className="text-slate-500 block">Safety Protocols</span>
            <span className="font-bold text-emerald-800 flex items-center">
              <Shield className="w-3 h-3 mr-0.5 text-emerald-600" />
              {safetyCount} selected
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
