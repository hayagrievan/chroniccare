'use client';

import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    size?: ButtonSize;
    isLoading?: boolean;
    children: React.ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
    primary: 'bg-medical-blue hover:bg-blue-700 text-white shadow-sm',
    secondary: 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 shadow-sm',
    danger: 'bg-signal-red hover:bg-red-600 text-white shadow-sm',
    ghost: 'bg-transparent hover:bg-gray-100 text-gray-600',
};

const sizeClasses: Record<ButtonSize, string> = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
};

export default function Button({
    variant = 'primary',
    size = 'md',
    isLoading = false,
    disabled,
    children,
    className = '',
    ...props
}: ButtonProps) {
    return (
        <button
            disabled={disabled || isLoading}
            className={`
        inline-flex items-center justify-center gap-2 rounded-lg font-medium
        transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variantClasses[variant]} ${sizeClasses[size]} ${className}
      `}
            {...props}
        >
            {isLoading && (
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
            )}
            {children}
        </button>
    );
}
