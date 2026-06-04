'use client';

import React from 'react';
import { Patient, Prescription } from '@/types';
import Badge from '@/components/ui/Badge';
import Card from '@/components/ui/Card';
import { User, CalendarDays, Pill, ClipboardList, HeartPulse } from 'lucide-react';

interface PatientSearchResultProps {
    patient: Patient;
    prescriptions: Prescription[];
}

function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric',
    });
}

export default function PatientSearchResult({ patient, prescriptions }: PatientSearchResultProps) {
    return (
        <div className="space-y-5">
            {/* Patient Profile */}
            <Card>
                <div className="flex items-start gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-medical-blue text-white flex items-center justify-center text-2xl font-bold flex-shrink-0 shadow-sm">
                        {patient.name.charAt(0)}
                    </div>
                    <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 gap-4">
                        <div>
                            <p className="text-xs text-gray-500 flex items-center gap-1 mb-0.5"><User size={11} /> Name</p>
                            <p className="text-sm font-semibold text-gray-900">{patient.name}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 mb-0.5">Patient ID</p>
                            <p className="text-sm font-mono text-medical-blue font-semibold bg-blue-50 px-2 py-0.5 rounded inline-block">
                                {patient.uniqueId}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 flex items-center gap-1 mb-0.5">
                                <CalendarDays size={11} /> Prescriptions
                            </p>
                            <p className="text-sm font-semibold text-gray-900">{prescriptions.length} total</p>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Prescription History */}
            <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <ClipboardList size={15} className="text-medical-blue" />
                    Prescription History ({prescriptions.length})
                </h3>
                <div className="space-y-3">
                    {prescriptions.map((rx) => (
                        <Card key={rx._id} className="hover:shadow-md transition-shadow">
                            <div>
                                {/* Header row */}
                                <div className="flex items-center justify-between gap-4 mb-3">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <Badge status={rx.status} />
                                        {rx.disease && (
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-rose-50 border border-rose-200 text-rose-700 rounded text-xs font-medium">
                                                <HeartPulse size={10} /> {rx.disease}
                                            </span>
                                        )}
                                        <span className="text-xs font-mono text-gray-400">{rx.prescriptionId}</span>
                                    </div>
                                    <span className="text-xs text-gray-400 whitespace-nowrap">{formatDate(rx.createdAt)}</span>
                                </div>
                                {/* Doctor */}
                                <p className="text-xs text-gray-500 mb-2">by {rx.doctorName}</p>
                                {/* Medicines */}
                                <div className="flex flex-wrap gap-2">
                                    {(rx.items || []).map((item, i) => (
                                        <div
                                            key={i}
                                            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg"
                                        >
                                            <Pill size={12} className="text-slate-500" />
                                            <div>
                                                <p className="text-xs font-medium text-slate-700">{item.medicineName}</p>
                                                <p className="text-xs text-slate-400">{item.dosage} · {item.frequency}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                {rx.notes && (
                                    <p className="text-xs text-gray-500 mt-2 italic">&ldquo;{rx.notes}&rdquo;</p>
                                )}
                            </div>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}
