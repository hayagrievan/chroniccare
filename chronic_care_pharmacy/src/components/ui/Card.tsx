'use client';

import React from 'react';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    header?: React.ReactNode;
    noPadding?: boolean;
}

export default function Card({ children, className = '', header, noPadding = false }: CardProps) {
    return (
        <div className={`bg-white rounded-xl border border-gray-100 shadow-sm ${className}`}>
            {header && (
                <div className="px-6 py-4 border-b border-gray-100">{header}</div>
            )}
            <div className={noPadding ? '' : 'p-6'}>{children}</div>
        </div>
    );
}
