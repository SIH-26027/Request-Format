import React from 'react';

export interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id?: string;
  value?: string | number | readonly string[];
  placeholder?: string;
  type?: string;
  min?: number | string;
  max?: number | string;
  step?: number | string;
  readOnly?: boolean;
  disabled?: boolean;
  className?: string;
  error?: boolean;
  leftIcon?: React.ReactNode;
  rightElement?: React.ReactNode;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function TextInput({
  error,
  leftIcon,
  rightElement,
  className = '',
  disabled,
  readOnly,
  ...props
}: TextInputProps) {
  const baseClasses =
    'w-full text-xs rounded border transition-colors focus:outline-none focus:ring-1';
  
  const stateClasses = error
    ? 'border-red-400 bg-red-50/20 text-slate-900 focus:border-red-500 focus:ring-red-500'
    : 'border-slate-300 bg-white text-slate-900 focus:border-blue-600 focus:ring-blue-600';
    
  const readonlyClasses = (disabled || readOnly)
    ? 'bg-slate-100 text-slate-600 cursor-not-allowed border-slate-200'
    : '';

  return (
    <div className="relative flex items-center">
      {leftIcon && (
        <div className="absolute left-2.5 text-slate-400 pointer-events-none flex items-center">
          {leftIcon}
        </div>
      )}
      <input
        disabled={disabled}
        readOnly={readOnly}
        className={`${baseClasses} ${stateClasses} ${readonlyClasses} ${
          leftIcon ? 'pl-8' : 'px-3'
        } ${rightElement ? 'pr-12' : 'pr-3'} py-2 font-sans ${className}`}
        {...props}
      />
      {rightElement && (
        <div className="absolute right-2.5 text-slate-400 flex items-center text-xs">
          {rightElement}
        </div>
      )}
    </div>
  );
}
