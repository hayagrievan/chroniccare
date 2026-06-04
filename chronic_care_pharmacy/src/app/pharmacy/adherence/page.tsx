'use client';

import React, { useEffect, useState } from 'react';
import PharmacyLayout from '@/components/layout/PharmacyLayout';
import AdherenceTracker from '@/components/pharmacy/AdherenceTracker';
import AdherenceScoreCard from '@/components/pharmacy/AdherenceScoreCard';
import api from '@/services/api';
import { Prescription } from '@/types';
import { Loader2, AlertCircle, HeartPulse, ChevronDown, ChevronUp, CheckCircle, Clock } from 'lucide-react';

interface PatientCompliance {
    patientId: string;
    patientName: string;
    disease: string;
    score: number;
    totalRx: number;
    refills: any[];
}

export default function AdherencePage() {
    const [complianceData, setComplianceData] = useState<PatientCompliance[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [expandedPatientId, setExpandedPatientId] = useState<string | null>(null);

    useEffect(() => {
        const fetchAdherenceData = async () => {
            setIsLoading(true);
            setError('');
            try {
                const res = await api.get<Prescription[]>('/api/prescriptions/all');
                const allRx = res.data;

                // Group prescriptions by patientId
                const patientGroups: Record<string, Prescription[]> = {};
                allRx.forEach(rx => {
                    if (!patientGroups[rx.patientId]) {
                        patientGroups[rx.patientId] = [];
                    }
                    patientGroups[rx.patientId].push(rx);
                });

                const complianceList: PatientCompliance[] = [];

                Object.entries(patientGroups).forEach(([patientId, rxList]) => {
                    // Sort patient's prescriptions by date ascending
                    const sortedRx = [...rxList].sort(
                        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
                    );

                    const refills: any[] = [];
                    let totalScore = 0;
                    let count = 0;

                    for (let i = 0; i < sortedRx.length; i++) {
                        const rx = sortedRx[i];
                        const nextRx = sortedRx[i + 1];

                        // Get duration from first item or default 30 days
                        const durationStr = rx.items?.[0]?.duration || '30 days';
                        const durationDays = parseInt(durationStr.replace(/[^0-9]/g, '')) || 30;

                        const expected = new Date(rx.createdAt);
                        expected.setDate(expected.getDate() + durationDays);

                        const actualDate = nextRx ? new Date(nextRx.createdAt) : null;
                        
                        let status: 'on-time' | 'late' | 'missed' = 'missed';
                        let score = 0;

                        if (actualDate) {
                            const daysDiff = Math.round((actualDate.getTime() - expected.getTime()) / (1000 * 60 * 60 * 24));
                            if (daysDiff <= 2) {
                                status = 'on-time';
                                score = 100;
                            } else if (daysDiff <= 7) {
                                status = 'late';
                                score = 75;
                            } else {
                                status = 'late';
                                score = 40;
                            }
                        } else {
                            // Check if current date is past expected date
                            const now = new Date();
                            if (now.getTime() > expected.getTime() + 7 * 24 * 60 * 60 * 1000) {
                                status = 'missed';
                                score = 0;
                            } else {
                                // Not late yet
                                continue;
                            }
                        }

                        // Add to refills list
                        refills.push({
                            prescriptionId: rx.prescriptionId || rx._id.slice(-8),
                            medicineName: rx.items?.[0]?.medicineName || 'Medication',
                            prescriptionDate: rx.createdAt,
                            expectedRefillDate: expected.toISOString(),
                            actualRefillDate: actualDate ? actualDate.toISOString() : null,
                            status,
                            score,
                        });

                        totalScore += score;
                        count++;
                    }

                    // Fallback compliance score if no historical refill records
                    const finalScore = count > 0 ? Math.round(totalScore / count) : 85;

                    complianceList.push({
                        patientId,
                        patientName: sortedRx[0].patientName,
                        disease: sortedRx[0].disease || 'General',
                        score: finalScore,
                        totalRx: rxList.length,
                        refills,
                    });
                });

                // Sort by compliance score ascending to show risk first
                complianceList.sort((a, b) => a.score - b.score);
                setComplianceData(complianceList);
            } catch (err: any) {
                setError('Failed to compute population adherence data.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchAdherenceData();
    }, []);

    const toggleExpand = (patientId: string) => {
        setExpandedPatientId(expandedPatientId === patientId ? null : patientId);
    };

    return (
        <PharmacyLayout
            title="Adherence Intelligence"
            subtitle="Monitor patient medication refill compliance and identify non-adherence risks"
        >
            {/* Header statistics info */}
            <div className="grid grid-cols-3 gap-6 mb-6">
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                    <p className="text-xs font-bold uppercase text-gray-400">Average Refill Adherence</p>
                    <p className="text-3xl font-black text-medical-blue mt-1">
                        {complianceData.length > 0
                            ? Math.round(complianceData.reduce((sum, p) => sum + p.score, 0) / complianceData.length)
                            : 0}
                        <span className="text-sm font-normal text-gray-500">/100</span>
                    </p>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                    <p className="text-xs font-bold uppercase text-gray-400">High Risk Patients</p>
                    <p className="text-3xl font-black text-red-500 mt-1">
                        {complianceData.filter(p => p.score < 60).length}
                    </p>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                    <p className="text-xs font-bold uppercase text-gray-400">Monitored Cohort</p>
                    <p className="text-3xl font-black text-gray-800 mt-1">
                        {complianceData.length} <span className="text-sm font-normal text-gray-500">patients</span>
                    </p>
                </div>
            </div>

            {/* Error */}
            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 flex items-center gap-2">
                    <AlertCircle size={16} /> {error}
                </div>
            )}

            {/* Main Content */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                    <h2 className="text-sm font-semibold text-gray-900">Compliance Surveillance</h2>
                </div>

                {isLoading ? (
                    <div className="p-12 flex flex-col items-center justify-center gap-3">
                        <Loader2 size={32} className="spin text-medical-blue" />
                        <p className="text-sm text-gray-500">Computing refill compliance metrics...</p>
                    </div>
                ) : complianceData.length === 0 ? (
                    <div className="p-12 text-center text-gray-500">No prescriptions found.</div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {complianceData.map(patient => {
                            const isExpanded = expandedPatientId === patient.patientId;
                            return (
                                <div key={patient.patientId} className="transition-all">
                                    {/* Main Row */}
                                    <div
                                        onClick={() => toggleExpand(patient.patientId)}
                                        className="px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-gray-50/50"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-xl bg-blue-50 text-medical-blue flex items-center justify-center font-bold text-sm">
                                                {patient.patientName.split(" ").map(n => n[0]).join("").slice(0, 2)}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-gray-900">{patient.patientName}</p>
                                                <p className="text-xs text-gray-500">
                                                    ID: {patient.patientId} · {patient.totalRx} Prescription{patient.totalRx > 1 ? 's' : ''}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-6">
                                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-rose-50 border border-rose-200 text-rose-700 rounded text-xs font-semibold">
                                                <HeartPulse size={10} />
                                                {patient.disease}
                                            </span>

                                            <div className="text-right">
                                                <span className="text-xs text-gray-500 font-medium">Compliance</span>
                                                <p className="text-lg font-black" style={{ color: patient.score >= 80 ? '#22c55e' : patient.score >= 50 ? '#f59e0b' : '#ef4444' }}>
                                                    {patient.score}%
                                                </p>
                                            </div>

                                            {isExpanded ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                                        </div>
                                    </div>

                                    {/* Detail Panel */}
                                    {isExpanded && (
                                        <div className="px-6 pb-6 bg-gray-50/30 space-y-4 border-t border-gray-50 pt-4">
                                            <AdherenceScoreCard complianceScore={patient.score} patientName={patient.patientName} />
                                            <div className="bg-white rounded-xl border border-gray-100 p-4">
                                                <p className="text-xs font-bold uppercase text-gray-400 mb-3">Refill Timeline</p>
                                                <AdherenceTracker records={patient.refills} />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </PharmacyLayout>
    );
}
