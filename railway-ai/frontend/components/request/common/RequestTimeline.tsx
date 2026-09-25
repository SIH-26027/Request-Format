import React from 'react';
import { RequestStatus } from '../../../types/request';
import { CheckCircle2, Circle, Clock, XCircle, AlertCircle } from 'lucide-react';

interface TimelineStep {
  status: RequestStatus;
  label: string;
  timestamp?: string;
  officer?: string;
  note?: string;
  isCompleted: boolean;
  isCurrent: boolean;
}

interface RequestTimelineProps {
  currentStatus: RequestStatus;
  timeline?: TimelineStep[];
}

export default function RequestTimeline({
  currentStatus,
  timeline
}: RequestTimelineProps) {
  // Default steps if none provided
  const steps: TimelineStep[] = timeline || [
    {
      status: 'DRAFT',
      label: 'Draft Created',
      timestamp: 'Initial creation',
      isCompleted: true,
      isCurrent: currentStatus === 'DRAFT'
    },
    {
      status: 'SUBMITTED',
      label: 'Submitted to Division Cell',
      timestamp: currentStatus !== 'DRAFT' ? 'Logged' : undefined,
      isCompleted: currentStatus !== 'DRAFT',
      isCurrent: currentStatus === 'SUBMITTED'
    },
    {
      status: 'UNDER_PLANNING',
      label: 'Under Corridor Planning',
      timestamp: ['UNDER_PLANNING', 'APPROVED', 'REJECTED', 'COMPLETED'].includes(currentStatus) ? 'In Simulation' : undefined,
      isCompleted: ['APPROVED', 'REJECTED', 'COMPLETED'].includes(currentStatus),
      isCurrent: currentStatus === 'UNDER_PLANNING'
    },
    {
      status: currentStatus === 'REJECTED' ? 'REJECTED' : 'APPROVED',
      label: currentStatus === 'REJECTED' ? 'Block Request Rejected' : 'Sanctioned by Sr.DOM',
      isCompleted: ['APPROVED', 'REJECTED', 'COMPLETED'].includes(currentStatus),
      isCurrent: currentStatus === 'APPROVED' || currentStatus === 'REJECTED'
    },
    {
      status: 'COMPLETED',
      label: 'Block Completed & Clear',
      isCompleted: currentStatus === 'COMPLETED',
      isCurrent: currentStatus === 'COMPLETED'
    }
  ];

  const getIcon = (step: TimelineStep) => {
    if (step.status === 'REJECTED') {
      return <XCircle className="w-5 h-5 text-red-600 bg-white rounded-full" />;
    }
    if (step.isCompleted) {
      return <CheckCircle2 className="w-5 h-5 text-emerald-600 bg-white rounded-full" />;
    }
    if (step.isCurrent) {
      return <Clock className="w-5 h-5 text-blue-600 bg-white rounded-full animate-pulse" />;
    }
    return <Circle className="w-5 h-5 text-slate-300 bg-white rounded-full" />;
  };

  return (
    <div className="bg-white border border-slate-300 rounded p-4 shadow-xs">
      <div className="flex items-center justify-between mb-4 border-b border-slate-200 pb-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
          Block Sanction Lifecycle Audit
        </h3>
        <span className="text-[11px] text-slate-500 font-mono">
          STATUS: {currentStatus}
        </span>
      </div>

      <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
        {steps.map((step, idx) => {
          return (
            <div key={idx} className="relative flex items-start space-x-3">
              <div className="absolute -left-6 mt-0.5 z-10">
                {getIcon(step)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <span
                    className={`text-xs font-semibold ${
                      step.isCurrent
                        ? 'text-blue-900 font-bold'
                        : step.isCompleted
                        ? 'text-slate-800'
                        : 'text-slate-400'
                    }`}
                  >
                    {step.label}
                  </span>
                  {step.timestamp && (
                    <span className="text-[11px] font-mono text-slate-500">
                      {step.timestamp}
                    </span>
                  )}
                </div>

                {step.officer && (
                  <p className="text-[11px] text-slate-600 font-medium mt-0.5">
                    Authority: {step.officer}
                  </p>
                )}

                {step.note && (
                  <p className="text-[11px] text-slate-600 bg-slate-50 border border-slate-200 p-2 rounded mt-1.5 leading-relaxed">
                    {step.note}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
