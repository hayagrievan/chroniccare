'use client';

import React from 'react';
import { LucideIcon, TrendingUp } from 'lucide-react';

interface StatCardProps {
    title: string;
    value: number | string;
    icon: LucideIcon;
    color: 'blue' | 'green' | 'purple' | 'amber';
    trend?: string;
    isLoading?: boolean;
}

const colorMap = {
    blue: {
        bg: 'bg-blue-50',
        icon: 'text-medical-blue',
        iconBg: 'bg-blue-100',
        value: 'text-medical-blue',
    },
    green: {
        bg: 'bg-green-50',
        icon: 'text-green-600',
        iconBg: 'bg-green-100',
        value: 'text-green-700',
    },
    purple: {
        bg: 'bg-purple-50',
        icon: 'text-purple-600',
        iconBg: 'bg-purple-100',
        value: 'text-purple-700',
    },
    amber: {
        bg: 'bg-amber-50',
        icon: 'text-amber-600',
        iconBg: 'bg-amber-100',
        value: 'text-amber-700',
    },
};

export default function StatCard({ title, value, icon: Icon, color, trend, isLoading }: StatCardProps) {
    const colors = colorMap[color];

    if (isLoading) {
        return (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 animate-pulse">
                <div className="flex items-center justify-between mb-4">
                    <div className="h-4 bg-gray-200 rounded w-32" />
                    <div className="w-11 h-11 bg-gray-200 rounded-xl" />
                </div>
                <div className="h-8 bg-gray-200 rounded w-16 mb-2" />
                <div className="h-3 bg-gray-100 rounded w-24" />
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
                <p className="text-sm font-medium text-gray-600">{title}</p>
                <div className={`w-11 h-11 ${colors.iconBg} rounded-xl flex items-center justify-center`}>
                    <Icon size={20} className={colors.icon} />
                </div>
            </div>
            <p className={`text-3xl font-bold ${colors.value} mb-1`}>{value}</p>
            {trend && (
                <div className="flex items-center gap-1 text-xs text-gray-500">
                    <TrendingUp size={12} className="text-green-500" />
                    <span>{trend}</span>
                </div>
            )}
        </div>
    );
}
