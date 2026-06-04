'use client';

import React from 'react';
import { Target, Zap, AlertTriangle, ShieldCheck } from 'lucide-react';

interface AdherenceScoreCardProps {
    complianceScore: number;
    patientName: string;
}

export default function AdherenceScoreCard({ complianceScore, patientName }: AdherenceScoreCardProps) {
    const getStatusDetails = (score: number) => {
        if (score >= 80) {
            return {
                color: 'text-green-600',
                border: 'border-green-100',
                bg: 'bg-green-50/50',
                label: 'High Compliance',
                description: `${patientName} refills their medications on time. Keep up the excellent work!`,
                icon: <ShieldCheck className="text-green-500" size={24} />,
            };
        } else if (score >= 50) {
            return {
                color: 'text-amber-600',
                border: 'border-amber-100',
                bg: 'bg-amber-50/50',
                label: 'Moderate Compliance',
                description: `${patientName} has minor refill delays. Reviewing schedule compliance is recommended.`,
                icon: <Target className="text-amber-500" size={24} />,
            };
        } else {
            return {
                color: 'text-red-600',
                border: 'border-red-100',
                bg: 'bg-red-50/50',
                label: 'Critical Alert',
                description: `${patientName} has multiple late or missed refills. High risk of treatment failure. Counselling required.`,
                icon: <AlertTriangle className="text-red-500" size={24} />,
            };
        }
    };

    const details = getStatusDetails(complianceScore);

    return (
        <div className={`rounded-2xl border p-5 flex items-center gap-4 ${details.bg} ${details.border}`}>
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm flex-shrink-0">
                {details.icon}
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Refill Compliance Score</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-bold bg-white shadow-sm border ${details.border} ${details.color}`}>
                        {details.label}
                    </span>
                </div>
                <p className="text-sm font-semibold text-gray-800 mt-1 leading-relaxed">
                    {details.description}
                </p>
            </div>
            <div className="text-center flex-shrink-0">
                <p className="text-4xl font-black font-mono leading-none" style={{ color: complianceScore >= 80 ? '#22c55e' : complianceScore >= 50 ? '#f59e0b' : '#ef4444' }}>
                    {complianceScore}
                </p>
                <p className="text-xs text-gray-500 font-semibold mt-1">/ 100</p>
            </div>
        </div>
    );
}
