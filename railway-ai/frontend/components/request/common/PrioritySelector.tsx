import React from 'react';
import { PriorityLevel } from '../../../types/request';
import { PRIORITIES } from '../../../constants/request.constants';
import { AlertCircle, AlertTriangle, Clock } from 'lucide-react';

interface PrioritySelectorProps {
  value: PriorityLevel;
  onChange: (priority: PriorityLevel) => void;
  error?: string;
}

export default function PrioritySelector({
  value,
  onChange,
  error
}: PrioritySelectorProps) {
  const getIcon = (level: PriorityLevel) => {
    switch (level) {
      case 'EMERGENCY':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      case 'URGENT':
        return <AlertTriangle className="w-4 h-4 text-amber-600" />;
      case 'NORMAL':
      default:
        return <Clock className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {PRIORITIES.map((p) => {
          const selected = value === p.value;
          let borderClass = 'border-slate-200 hover:border-slate-300 bg-white';
          if (selected) {
            if (p.value === 'EMERGENCY') {
              borderClass = 'border-red-500 bg-red-50/30 ring-1 ring-red-500';
            } else if (p.value === 'URGENT') {
              borderClass = 'border-amber-500 bg-amber-50/30 ring-1 ring-amber-500';
            } else {
              borderClass = 'border-blue-600 bg-blue-50/30 ring-1 ring-blue-600';
            }
          }

          return (
            <button
              key={p.value}
              type="button"
              onClick={() => onChange(p.value)}
              className={`text-left p-3 rounded border transition-all text-xs flex flex-col justify-between ${borderClass}`}
            >
              <div className="flex items-center justify-between mb-1.5 w-full">
                <div className="flex items-center space-x-2">
                  {getIcon(p.value)}
                  <span className={`font-semibold ${selected ? 'text-slate-900' : 'text-slate-700'}`}>
                    {p.label}
                  </span>
                </div>
                <div
                  className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                    selected ? 'border-blue-600 bg-blue-600' : 'border-slate-300 bg-white'
                  }`}
                >
                  {selected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>
              </div>
              <p className="text-[11px] text-slate-500 leading-tight">
                {p.description}
              </p>
            </button>
          );
        })}
      </div>
      {error && (
        <p className="text-[11px] text-red-600 font-medium mt-1 flex items-center">
          <span className="w-1.5 h-1.5 rounded-full bg-red-600 inline-block mr-1.5"></span>
          {error}
        </p>
      )}
    </div>
  );
}
