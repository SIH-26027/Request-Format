import React from 'react';

export interface RadioOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

interface RadioGroupProps {
  name: string;
  options: RadioOption[];
  value: string;
  onChange: (value: string) => void;
  orientation?: 'horizontal' | 'vertical';
  error?: boolean;
}

export default function RadioGroup({
  name,
  options,
  value,
  onChange,
  orientation = 'horizontal',
  error
}: RadioGroupProps) {
  return (
    <div
      className={`flex ${
        orientation === 'horizontal' ? 'flex-wrap gap-4' : 'flex-col space-y-2'
      }`}
    >
      {options.map((option) => {
        const checked = value === option.value;
        return (
          <label
            key={option.value}
            className={`flex items-start space-x-2.5 cursor-pointer select-none text-xs ${
              option.disabled ? 'cursor-not-allowed opacity-50' : ''
            }`}
          >
            <div className="flex items-center h-4 mt-0.5">
              <input
                type="radio"
                name={name}
                value={option.value}
                checked={checked}
                disabled={option.disabled}
                onChange={() => onChange(option.value)}
                className={`h-3.5 w-3.5 text-blue-600 border-slate-300 focus:ring-blue-500 ${
                  error ? 'border-red-400' : ''
                }`}
              />
            </div>
            <div>
              <span className={`font-medium ${checked ? 'text-blue-900 font-semibold' : 'text-slate-800'}`}>
                {option.label}
              </span>
              {option.description && (
                <p className="text-[11px] text-slate-500 mt-0.5 leading-tight">
                  {option.description}
                </p>
              )}
            </div>
          </label>
        );
      })}
    </div>
  );
}
