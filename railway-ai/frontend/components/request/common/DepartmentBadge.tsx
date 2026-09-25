import React from 'react';
import { DepartmentCode } from '../../../types/request';
import { DEPARTMENTS } from '../../../constants/request.constants';

interface DepartmentBadgeProps {
  department: DepartmentCode;
  size?: 'sm' | 'md' | 'lg';
  showSystem?: boolean;
}

export default function DepartmentBadge({
  department,
  size = 'sm',
  showSystem = true
}: DepartmentBadgeProps) {
  const info = DEPARTMENTS[department] || {
    name: department,
    shortName: department,
    systemCode: 'SYS',
  };

  const getStyle = () => {
    switch (department) {
      case 'ENGINEERING':
        return 'bg-amber-50 text-amber-900 border-amber-300';
      case 'TRD':
        return 'bg-sky-50 text-sky-900 border-sky-300';
      case 'SNT':
        return 'bg-purple-50 text-purple-900 border-purple-300';
      default:
        return 'bg-slate-50 text-slate-800 border-slate-300';
    }
  };

  const getSize = () => {
    switch (size) {
      case 'lg':
        return 'text-xs px-2.5 py-1';
      case 'md':
        return 'text-xs px-2 py-0.5';
      default:
        return 'text-[11px] px-1.5 py-0.5';
    }
  };

  return (
    <span
      className={`inline-flex items-center font-medium rounded border ${getStyle()} ${getSize()} tracking-wide`}
    >
      <span className="font-semibold mr-1">{info.name}</span>
      {showSystem && (
        <span className="opacity-75 font-mono text-[10px]">
          ({info.systemCode})
        </span>
      )}
    </span>
  );
}
