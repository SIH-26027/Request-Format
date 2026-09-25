import React from 'react';
import Link from 'next/link';
import { ChevronRight, ArrowLeft } from 'lucide-react';
import DepartmentBadge from './DepartmentBadge';
import { DepartmentCode } from '../../../types/request';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface RequestHeaderProps {
  title: string;
  subtitle: string;
  department?: DepartmentCode;
  systemName?: string;
  breadcrumbs?: BreadcrumbItem[];
  backLink?: string;
  backText?: string;
  action?: React.ReactNode;
}

export default function RequestHeader({
  title,
  subtitle,
  department,
  systemName,
  breadcrumbs = [],
  backLink,
  backText = 'Back',
  action
}: RequestHeaderProps) {
  return (
    <div className="bg-white border-b border-slate-200 py-4 px-4 sm:px-6 lg:px-8 mb-6 shadow-xs">
      {/* Breadcrumbs */}
      {breadcrumbs.length > 0 && (
        <nav className="flex items-center space-x-1.5 text-xs text-slate-500 mb-2">
          {breadcrumbs.map((item, idx) => (
            <React.Fragment key={idx}>
              {idx > 0 && <ChevronRight className="w-3 h-3 text-slate-400" />}
              {item.href ? (
                <Link href={item.href} prefetch={true} className="hover:text-slate-800 transition-colors">
                  {item.label}
                </Link>
              ) : (
                <span className="text-slate-700 font-medium">{item.label}</span>
              )}
            </React.Fragment>
          ))}
        </nav>
      )}

      {/* Back Link if specified */}
      {backLink && (
        <div className="mb-2">
          <Link
            href={backLink}
            prefetch={true}
            className="inline-flex items-center text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1" />
            {backText}
          </Link>
        </div>
      )}

      {/* Main Title Row */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">{title}</h1>
            {department && <DepartmentBadge department={department} size="md" />}
            {systemName && (
              <span className="text-xs bg-slate-100 text-slate-700 font-mono px-2 py-0.5 rounded border border-slate-300">
                {systemName}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-600 mt-1 max-w-3xl leading-relaxed">{subtitle}</p>
        </div>

        {action && <div className="flex items-center space-x-2 shrink-0">{action}</div>}
      </div>
    </div>
  );
}
