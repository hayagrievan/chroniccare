'use client';

import React from 'react';

interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg';
    color?: string;
    fullScreen?: boolean;
}

const sizeMap = { sm: 'h-4 w-4', md: 'h-8 w-8', lg: 'h-12 w-12' };

export default function LoadingSpinner({ size = 'md', fullScreen = false }: LoadingSpinnerProps) {
    const spinner = (
        <div
            className={`inline-block ${sizeMap[size]} animate-spin rounded-full border-2 border-current border-t-transparent text-medical-blue`}
            role="status"
            aria-label="Loading"
        />
    );

    if (fullScreen) {
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-white/80 z-50">
                <div className="flex flex-col items-center gap-3">
                    {spinner}
                    <p className="text-sm text-gray-500">Loading...</p>
                </div>
            </div>
        );
    }

    return spinner;
}
