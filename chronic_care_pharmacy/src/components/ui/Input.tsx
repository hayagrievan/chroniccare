'use client';

import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    helperText?: string;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    fullWidth?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, helperText, leftIcon, rightIcon, fullWidth = false, className = '', id, ...props }, ref) => {
        const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

        return (
            <div className={`flex flex-col gap-1.5 ${fullWidth ? 'w-full' : ''}`}>
                {label && (
                    <label htmlFor={inputId} className="text-sm font-medium text-gray-700">
                        {label}
                    </label>
                )}
                <div className="relative">
                    {leftIcon && (
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">{leftIcon}</span>
                    )}
                    <input
                        ref={ref}
                        id={inputId}
                        className={`
              w-full rounded-lg border px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
              transition-colors duration-150
              ${error ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-white hover:border-gray-400'}
              ${leftIcon ? 'pl-10' : ''}
              ${rightIcon ? 'pr-10' : ''}
              ${className}
            `}
                        {...props}
                    />
                    {rightIcon && (
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">{rightIcon}</span>
                    )}
                </div>
                {error && <p className="text-xs text-red-600">{error}</p>}
                {helperText && !error && <p className="text-xs text-gray-500">{helperText}</p>}
            </div>
        );
    }
);

Input.displayName = 'Input';
export default Input;
