import React from 'react';

interface RequestSectionProps {
  sectionLetter: string; // 'A', 'B', 'C', 'D', 'E', 'F'
  title: string;
  description?: string;
  children?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export default function RequestSection({
  sectionLetter,
  title,
  description,
  children,
  action,
  className = ''
}: RequestSectionProps) {
  return (
    <div className={`bg-white rounded border border-slate-300 shadow-xs mb-6 overflow-hidden ${className}`}>
      {/* Section Header */}
      <div className="bg-slate-50/90 border-b border-slate-200 px-5 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <span className="w-6 h-6 rounded bg-slate-800 text-white font-mono text-xs font-bold flex items-center justify-center shrink-0">
            {sectionLetter}
          </span>
          <div>
            <h2 className="text-sm font-bold text-slate-900 tracking-tight">{title}</h2>
            {description && <p className="text-xs text-slate-500 mt-0.5">{description}</p>}
          </div>
        </div>
        {action && <div>{action}</div>}
      </div>

      {/* Section Content */}
      <div className="p-5">{children}</div>
    </div>
  );
}
