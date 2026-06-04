'use client';

import React from 'react';
import { Pill, CheckCircle, AlertCircle, Clock } from 'lucide-react';

interface RefillRecord {
    prescriptionId: string;
    medicineName: string;
    prescriptionDate: string;
    expectedRefillDate: string;
    actualRefillDate: string | null;
    status: 'on-time' | 'late' | 'missed';
    score: number;
}

interface AdherenceTrackerProps {
    records: RefillRecord[];
}

export default function AdherenceTracker({ records }: AdherenceTrackerProps) {
    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'on-time':
                return { bg: 'bg-green-50 border-green-200', text: 'text-green-700', label: 'On-Time Refill' };
            case 'late':
                return { bg: 'bg-amber-50 border-amber-200', text: 'text-amber-700', label: 'Late Refill' };
            case 'missed':
            default:
                return { bg: 'bg-red-50 border-red-200', text: 'text-red-700', label: 'Missed Refill' };
        }
    };

    if (records.length === 0) {
        return (
            <div className="text-center py-10">
                <p className="text-sm text-gray-500">No refill compliance data available for this patient.</p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
                <thead>
                    <tr className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        <th className="pb-3 px-4">Rx ID</th>
                        <th className="pb-3 px-4">Medicine</th>
                        <th className="pb-3 px-4">Prescribed Date</th>
                        <th className="pb-3 px-4">Expected Refill</th>
                        <th className="pb-3 px-4">Actual Refill</th>
                        <th className="pb-3 px-4">Compliance Status</th>
                        <th className="pb-3 px-4 text-right">Score</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-sm">
                    {records.map((r, i) => {
                        const style = getStatusStyle(r.status);
                        return (
                            <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                                <td className="py-3.5 px-4 font-mono text-xs text-gray-500">
                                    {r.prescriptionId}
                                </td>
                                <td className="py-3.5 px-4 font-semibold text-gray-900 flex items-center gap-1.5">
                                    <Pill size={13} className="text-medical-blue" />
                                    {r.medicineName}
                                </td>
                                <td className="py-3.5 px-4 text-gray-600">
                                    {new Date(r.prescriptionDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                </td>
                                <td className="py-3.5 px-4 text-gray-600">
                                    {new Date(r.expectedRefillDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                </td>
                                <td className="py-3.5 px-4 text-gray-600">
                                    {r.actualRefillDate
                                        ? new Date(r.actualRefillDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                                        : <span className="text-gray-400 italic">Pending Refill</span>
                                    }
                                </td>
                                <td className="py-3.5 px-4">
                                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-xs font-semibold ${style.bg} ${style.text}`}>
                                        {r.status === 'on-time' ? <CheckCircle size={11} /> : r.status === 'late' ? <Clock size={11} /> : <AlertCircle size={11} />}
                                        {style.label}
                                    </span>
                                </td>
                                <td className="py-3.5 px-4 text-right font-black" style={{ color: r.score >= 80 ? '#22c55e' : r.score >= 50 ? '#f59e0b' : '#ef4444' }}>
                                    {r.score}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
