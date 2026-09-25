import React from 'react';

export interface DateInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id?: string;
  value?: string | number | readonly string[];
  error?: boolean;
  disabled?: boolean;
  className?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function DateInput({
  error,
  className = '',
  disabled,
  ...props
}: DateInputProps) {
  const baseClasses =
    'w-full text-xs rounded border transition-colors focus:outline-none focus:ring-1 px-3 py-2 bg-white font-sans';
  
  const stateClasses = error
    ? 'border-red-400 bg-red-50/20 text-slate-900 focus:border-red-500 focus:ring-red-500'
    : 'border-slate-300 text-slate-900 focus:border-blue-600 focus:ring-blue-600';

  const disabledClasses = disabled
    ? 'bg-slate-100 text-slate-500 cursor-not-allowed border-slate-200'
    : '';

  return (
    <input
      type="date"
      disabled={disabled}
      className={`${baseClasses} ${stateClasses} ${disabledClasses} ${className}`}
      {...props}
    />
  );
}
