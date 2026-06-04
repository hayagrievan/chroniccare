'use client';

import React from 'react';
import { PrescriptionStatus } from '@/types';

interface BadgeProps {
    status: PrescriptionStatus;
    className?: string;
}

const statusConfig: Record<PrescriptionStatus, { label: string; classes: string; dot: string }> = {
    Pending: {
        label: 'Pending',
        classes: 'bg-amber-50 text-amber-700 border border-amber-200',
        dot: 'bg-amber-500',
    },
    Dispensed: {
        label: 'Dispensed',
        classes: 'bg-green-50 text-green-700 border border-green-200',
        dot: 'bg-green-500',
    },
    Cancelled: {
        label: 'Cancelled',
        classes: 'bg-red-50 text-red-700 border border-red-200',
        dot: 'bg-red-500',
    },
};

export default function Badge({ status, className = '' }: BadgeProps) {
    const config = statusConfig[status] ?? statusConfig['Pending'];
    return (
        <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.classes} ${className}`}
        >
            <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
            {config.label}
        </span>
    );
}
