import React from 'react';
import { RequestStatus } from '../../../types/request';
import { STATUS_CONFIG } from '../../../constants/request.constants';

interface StatusBadgeProps {
  status: RequestStatus;
  size?: 'sm' | 'md' | 'lg';
}

export default function StatusBadge({ status, size = 'sm' }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status] || {
    label: status,
    bg: 'bg-slate-100',
    text: 'text-slate-700',
    border: 'border-slate-300'
  };

  const getSize = () => {
    switch (size) {
      case 'lg':
        return 'text-xs px-2.5 py-1';
      case 'md':
        return 'text-xs px-2 py-0.5';
      default:
        return 'text-[11px] px-2 py-0.5';
    }
  };

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border ${config.bg} ${config.text} ${config.border} ${getSize()} font-sans tracking-tight`}
    >
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-70"></span>
      {config.label}
    </span>
  );
}
