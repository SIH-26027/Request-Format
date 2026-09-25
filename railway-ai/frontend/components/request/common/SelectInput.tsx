import React from 'react';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectInputProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  id?: string;
  value?: string | number | readonly string[];
  options: SelectOption[];
  placeholder?: string;
  error?: boolean;
  disabled?: boolean;
  className?: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

export default function SelectInput({
  options,
  placeholder,
  error,
  className = '',
  disabled,
  ...props
}: SelectInputProps) {
  const baseClasses =
    'w-full text-xs rounded border transition-colors focus:outline-none focus:ring-1 px-3 py-2 bg-white';
  
  const stateClasses = error
    ? 'border-red-400 text-slate-900 focus:border-red-500 focus:ring-red-500'
    : 'border-slate-300 text-slate-900 focus:border-blue-600 focus:ring-blue-600';

  const disabledClasses = disabled
    ? 'bg-slate-100 text-slate-500 cursor-not-allowed border-slate-200'
    : '';

  return (
    <div className="relative">
      <select
        disabled={disabled}
        className={`${baseClasses} ${stateClasses} ${disabledClasses} appearance-none pr-8 cursor-pointer font-sans ${className}`}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} disabled={opt.disabled}>
            {opt.label}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
        <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
          <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
        </svg>
      </div>
    </div>
  );
}
