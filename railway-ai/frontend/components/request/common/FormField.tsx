import React from 'react';

interface FormFieldProps {
  label: string;
  id?: string;
  required?: boolean;
  hint?: string;
  error?: string;
  children?: React.ReactNode;
  className?: string;
}

export default function FormField({
  label,
  id,
  required = false,
  hint,
  error,
  children,
  className = ''
}: FormFieldProps) {
  return (
    <div className={`space-y-1 ${className}`}>
      <div className="flex items-center justify-between">
        <label
          htmlFor={id}
          className="block text-xs font-semibold text-slate-800 tracking-tight"
        >
          {label}
          {required && <span className="text-red-600 ml-1 font-bold">*</span>}
        </label>
        {hint && !error && (
          <span className="text-[11px] text-slate-400">{hint}</span>
        )}
      </div>

      {children}

      {error && (
        <p className="text-[11px] text-red-600 font-medium mt-1 flex items-center">
          <span className="w-1.5 h-1.5 rounded-full bg-red-600 inline-block mr-1.5"></span>
          {error}
        </p>
      )}
    </div>
  );
}
