import React from 'react';

interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: React.ReactNode;
  description?: string;
  error?: boolean;
}

export default function Checkbox({
  label,
  description,
  error,
  className = '',
  disabled,
  id,
  ...props
}: CheckboxProps) {
  const generatedId = id || (typeof label === 'string' ? label.replace(/\s+/g, '-').toLowerCase() : undefined);

  return (
    <div className={`flex items-start space-x-2.5 ${className}`}>
      <div className="flex items-center h-5">
        <input
          id={generatedId}
          type="checkbox"
          disabled={disabled}
          className={`h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 focus:ring-offset-0 cursor-pointer ${
            error ? 'border-red-400 ring-red-400' : ''
          } ${disabled ? 'cursor-not-allowed opacity-60' : ''}`}
          {...props}
        />
      </div>
      <div className="text-xs">
        <label
          htmlFor={generatedId}
          className={`font-medium text-slate-800 cursor-pointer select-none ${
            disabled ? 'cursor-not-allowed opacity-60' : ''
          }`}
        >
          {label}
        </label>
        {description && (
          <p className="text-[11px] text-slate-500 mt-0.5 leading-normal">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}
