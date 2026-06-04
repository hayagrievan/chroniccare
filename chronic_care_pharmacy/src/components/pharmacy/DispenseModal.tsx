'use client';

import React, { useState } from 'react';
import { Prescription } from '@/types';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { pharmacyService } from '@/services/pharmacyService';
import { CheckCircle, AlertCircle, Pill, User, Clock, HeartPulse } from 'lucide-react';
import toast from 'react-hot-toast';

interface DispenseModalProps {
    prescription: Prescription | null;
    onClose: () => void;
    onDispensed: (id: string) => void;
}

export default function DispenseModal({ prescription, onClose, onDispensed }: DispenseModalProps) {
    const [isLoading, setIsLoading] = useState(false);

    const handleDispense = async () => {
        if (!prescription) return;
        setIsLoading(true);
        try {
            // Use prescriptionId if available, else _id
            const idToUse = prescription._id;
            await pharmacyService.dispensePrescription(idToUse);
            toast.success(`Prescription for ${prescription.patientName} dispensed successfully!`, {
                icon: '✅',
                style: { borderLeft: '4px solid #22c55e', fontWeight: 500 },
            });
            onDispensed(prescription._id);
        } catch {
            toast.error('Failed to dispense prescription. Please try again.', {
                icon: '❌',
                style: { borderLeft: '4px solid #ef4444' },
            });
        } finally {
            setIsLoading(false);
        }
    };

    if (!prescription) return null;

    const items = prescription.items || [];

    return (
        <Modal
            isOpen={!!prescription}
            onClose={onClose}
            title="Confirm Dispense"
            size="md"
            footer={
                <>
                    <Button variant="secondary" onClick={onClose} disabled={isLoading}>Cancel</Button>
                    <Button variant="primary" onClick={handleDispense} isLoading={isLoading}>
                        {isLoading ? 'Dispensing…' : 'Confirm Dispense'}
                    </Button>
                </>
            }
        >
            <div className="space-y-4">
                {/* Warning */}
                <div className="flex gap-3 p-3.5 bg-amber-50 border border-amber-200 rounded-lg">
                    <AlertCircle size={18} className="text-amber-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-amber-700 font-medium">
                        Please verify the patient&apos;s identity before dispensing.
                    </p>
                </div>

                {/* Patient + Rx Info */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-500 mb-1 flex items-center gap-1"><User size={11} /> Patient</p>
                        <p className="text-sm font-semibold text-gray-900">{prescription.patientName}</p>
                        <p className="text-xs font-mono text-medical-blue mt-0.5">{prescription.patientId}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-500 mb-1 flex items-center gap-1"><Clock size={11} /> Date</p>
                        <p className="text-sm font-semibold text-gray-900">
                            {new Date(prescription.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </p>
                        <div className="mt-0.5"><Badge status={prescription.status} /></div>
                    </div>
                </div>

                {/* Disease + Doctor */}
                <div className="grid grid-cols-2 gap-3">
                    {prescription.disease && (
                        <div className="bg-rose-50 rounded-lg p-3 border border-rose-100">
                            <p className="text-xs text-gray-500 mb-1 flex items-center gap-1"><HeartPulse size={11} /> Disease</p>
                            <p className="text-sm font-semibold text-rose-700">{prescription.disease}</p>
                        </div>
                    )}
                    <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-500 mb-1">Prescribed by</p>
                        <p className="text-sm font-semibold text-gray-900">{prescription.doctorName}</p>
                        <p className="text-xs text-gray-400 font-mono mt-0.5">{prescription.prescriptionId}</p>
                    </div>
                </div>

                {/* Medicines from items[] */}
                <div>
                    <p className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
                        <Pill size={14} className="text-medical-blue" /> Medicines ({items.length})
                    </p>
                    {items.length === 0 ? (
                        <p className="text-sm text-gray-400 italic">No medicines listed.</p>
                    ) : (
                        <div className="space-y-2">
                            {items.map((item, i) => (
                                <div key={i} className="flex items-start gap-3 p-3 bg-blue-50/50 border border-blue-100 rounded-lg">
                                    <CheckCircle size={14} className="text-medical-blue mt-0.5 flex-shrink-0" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">{item.medicineName}</p>
                                        <p className="text-xs text-gray-500">
                                            {item.dosage} · {item.frequency} · {item.duration}
                                            {item.quantity > 1 && ` · Qty: ${item.quantity}`}
                                        </p>
                                        {item.instructions && (
                                            <p className="text-xs text-amber-600 mt-0.5 italic">{item.instructions}</p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Notes */}
                {prescription.notes && (
                    <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-500 mb-1">Doctor&apos;s Notes</p>
                        <p className="text-sm text-gray-700">{prescription.notes}</p>
                    </div>
                )}
                {prescription.diagnosis && (
                    <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-500 mb-1">Diagnosis</p>
                        <p className="text-sm text-gray-700">{prescription.diagnosis}</p>
                    </div>
                )}
            </div>
        </Modal>
    );
}
