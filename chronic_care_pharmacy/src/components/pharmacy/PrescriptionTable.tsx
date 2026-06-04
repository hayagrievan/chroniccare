'use client';

import React, { useState } from 'react';
import { Prescription } from '@/types';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import DispenseModal from './DispenseModal';
import { Clock, User, Stethoscope, Pill, HeartPulse } from 'lucide-react';

interface PrescriptionTableProps {
    prescriptions: Prescription[];
    onDispensed: (id: string) => void;
}

function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

export default function PrescriptionTable({ prescriptions, onDispensed }: PrescriptionTableProps) {
    const [selectedRx, setSelectedRx] = useState<Prescription | null>(null);

    if (prescriptions.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-4">
                    <Pill size={28} className="text-green-500" />
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-1">All clear!</h3>
                <p className="text-sm text-gray-500">No pending prescriptions at this time.</p>
            </div>
        );
    }

    return (
        <>
            <div className="overflow-x-auto">
                <table className="min-w-full">
                    <thead>
                        <tr className="border-b border-gray-100">
                            <th className="pb-3 px-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Rx ID</th>
                            <th className="pb-3 px-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Patient</th>
                            <th className="pb-3 px-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Disease</th>
                            <th className="pb-3 px-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Medicines</th>
                            <th className="pb-3 px-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Doctor</th>
                            <th className="pb-3 px-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                            <th className="pb-3 px-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="pb-3 px-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {prescriptions.map((rx) => (
                            <tr key={rx._id} className="hover:bg-gray-50/50 transition-colors">
                                <td className="py-4 px-4">
                                    <span className="font-mono text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                                        {rx.prescriptionId || rx._id.slice(-8)}
                                    </span>
                                </td>
                                <td className="py-4 px-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                                            <User size={13} className="text-gray-500" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900 leading-tight">{rx.patientName}</p>
                                            <p className="text-xs font-mono text-medical-blue">{rx.patientId}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="py-4 px-4">
                                    {rx.disease ? (
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-rose-50 border border-rose-200 text-rose-700 rounded text-xs font-medium">
                                            <HeartPulse size={10} />
                                            {rx.disease}
                                        </span>
                                    ) : (
                                        <span className="text-xs text-gray-400">—</span>
                                    )}
                                </td>
                                <td className="py-4 px-4">
                                    <div className="flex flex-wrap gap-1">
                                        {(rx.items || []).map((item, i) => (
                                            <span
                                                key={i}
                                                title={`${item.dosage} – ${item.frequency} × ${item.duration}`}
                                                className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-50 border border-slate-200 text-slate-600 rounded text-xs"
                                            >
                                                <Pill size={10} />
                                                {item.medicineName}
                                            </span>
                                        ))}
                                    </div>
                                </td>
                                <td className="py-4 px-4">
                                    <div className="flex items-center gap-1.5 text-sm text-gray-700">
                                        <Stethoscope size={13} className="text-gray-400" />
                                        {rx.doctorName}
                                    </div>
                                </td>
                                <td className="py-4 px-4">
                                    <div className="flex items-center gap-1.5 text-sm text-gray-600">
                                        <Clock size={13} className="text-gray-400" />
                                        {formatDate(rx.createdAt)}
                                    </div>
                                </td>
                                <td className="py-4 px-4">
                                    <Badge status={rx.status} />
                                </td>
                                <td className="py-4 px-4 text-right">
                                    {rx.status === 'Pending' && (
                                        <Button size="sm" variant="primary" onClick={() => setSelectedRx(rx)}>
                                            Dispense
                                        </Button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <DispenseModal
                prescription={selectedRx}
                onClose={() => setSelectedRx(null)}
                onDispensed={(id) => { setSelectedRx(null); onDispensed(id); }}
            />
        </>
    );
}
