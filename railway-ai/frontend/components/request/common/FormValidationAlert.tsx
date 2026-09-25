'use client';

import React from 'react';
import { AlertTriangle, XCircle, CheckCircle2, AlertOctagon } from 'lucide-react';
import { FormValidationErrors } from '../../../types/request';

interface FormValidationAlertProps {
  errors: FormValidationErrors;
  submitError?: string | null;
  submitSuccess?: string | null;
  onClearErrors?: () => void;
}

export default function FormValidationAlert({
  errors,
  submitError,
  submitSuccess,
  onClearErrors
}: FormValidationAlertProps) {
  const errorEntries = Object.entries(errors);
  const errorCount = errorEntries.length;

  if (submitSuccess) {
    return (
      <div 
        id="form-success-banner"
        className="bg-emerald-50 border-2 border-emerald-500 text-emerald-900 rounded-md p-4 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300"
      >
        <div className="flex items-start space-x-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="space-y-1 flex-1">
            <h4 className="font-bold text-sm text-emerald-950">
              Request Submitted Successfully!
            </h4>
            <p className="text-xs text-emerald-800 leading-relaxed">
              Indent <span className="font-mono font-bold">{submitSuccess}</span> has been permanently stored in the division database. Redirecting to official acknowledgment...
            </p>
          </div>
          <div className="w-4 h-4 rounded-full border-2 border-emerald-600 border-t-transparent animate-spin"></div>
        </div>
      </div>
    );
  }

  if (submitError) {
    return (
      <div 
        id="form-error-banner"
        className="bg-red-50 border-2 border-red-500 text-red-900 rounded-md p-4 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300"
      >
        <div className="flex items-start space-x-3">
          <XCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="space-y-1 flex-1">
            <h4 className="font-bold text-sm text-red-950">
              Request Was Not Submitted
            </h4>
            <p className="text-xs text-red-800 leading-relaxed">
              {submitError}
            </p>
            <p className="text-[11px] text-red-700 mt-1">
              Your input has been preserved in the form. Please check your network or database connection and try submitting again.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (errorCount === 0) {
    return null;
  }

  return (
    <div 
      id="form-validation-warning"
      className="bg-amber-50 border-2 border-amber-500 text-amber-950 rounded-md p-4 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start space-x-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1.5">
            <h4 className="font-bold text-sm text-amber-950 flex items-center gap-1.5">
              <span>Required Information Missing</span>
              <span className="text-[11px] bg-amber-200 text-amber-900 px-1.5 py-0.2 rounded-full font-mono font-bold">
                {errorCount} {errorCount === 1 ? 'field' : 'fields'}
              </span>
            </h4>
            <p className="text-xs text-amber-800">
              Please complete all mandatory fields below before submitting the block indent for division sanction:
            </p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 pt-1 text-xs text-amber-900">
              {errorEntries.map(([field, msg]) => (
                <li key={field} className="flex items-start space-x-1.5">
                  <span className="text-amber-500 font-bold">&bull;</span>
                  <span className="leading-tight">{msg}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {onClearErrors && (
          <button
            type="button"
            onClick={onClearErrors}
            className="text-amber-700 hover:text-amber-900 p-1 rounded hover:bg-amber-100"
            title="Dismiss warning"
          >
            <XCircle className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
