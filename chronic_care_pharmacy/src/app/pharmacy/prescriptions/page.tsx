'use client';

import React, { useEffect, useState, useCallback } from 'react';
import PharmacyLayout from '@/components/layout/PharmacyLayout';
import PrescriptionTable from '@/components/pharmacy/PrescriptionTable';
import { pharmacyService } from '@/services/pharmacyService';
import { Prescription } from '@/types';
import { RefreshCw, ClipboardList, CheckCircle, AlertCircle } from 'lucide-react';
import Button from '@/components/ui/Button';

export default function PrescriptionsPage() {
    const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [phrnInput, setPhrnInput] = useState('');
    const [isValidating, setIsValidating] = useState(false);
    const [verificationStatus, setVerificationStatus] = useState<{ isValid: boolean; name?: string; patientId?: string } | null>(null);

    const validatePHRN = async () => {
        if (!phrnInput.trim()) return;
        setIsValidating(true);
        setVerificationStatus(null);
        try {
            const data = await pharmacyService.searchPatient(phrnInput.trim());
            if (data.patient) {
                setVerificationStatus({
                    isValid: true,
                    name: data.patient.name,
                    patientId: data.patient.uniqueId,
                });
                setPrescriptions(data.prescriptions);
            } else {
                setVerificationStatus({ isValid: false });
            }
        } catch {
            setVerificationStatus({ isValid: false });
        } finally {
            setIsValidating(false);
        }
    };

    const fetchPrescriptions = useCallback(async () => {
        setIsLoading(true);
        setError('');
        try {
            const data = await pharmacyService.getPendingPrescriptions();
            setPrescriptions(data);
        } catch {
            setError('Failed to load prescriptions. Please try again.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => { fetchPrescriptions(); }, [fetchPrescriptions]);

    const handleDispensed = (id: string) => {
        setPrescriptions((prev) => prev.filter((rx) => rx._id !== id));
    };

    return (
        <PharmacyLayout
            title="Pending Prescriptions"
            subtitle="Review and dispense prescriptions awaiting fulfilment"
        >
            {/* PHRN Validation Section */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-2">PHRN Validation & Verification</h3>
                <div className="flex items-center gap-3">
                    <input
                        type="text"
                        placeholder="Enter Patient PHRN (e.g. PHRN-IND-2026-000001)"
                        value={phrnInput}
                        onChange={(e) => {
                            setPhrnInput(e.target.value);
                            setVerificationStatus(null);
                        }}
                        className="flex-grow px-3.5 py-2 text-sm border rounded-xl outline-none"
                    />
                    <Button onClick={validatePHRN} variant="primary" size="md" isLoading={isValidating}>
                        Verify PHRN
                    </Button>
                </div>
                {verificationStatus && (
                    <div className="mt-4 flex items-center gap-2">
                        {verificationStatus.isValid ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 border border-green-200 text-green-700 rounded-xl text-xs font-semibold">
                                <CheckCircle size={14} />
                                PHRN Verified: {verificationStatus.name} ({verificationStatus.patientId})
                            </span>
                        ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-semibold">
                                <AlertCircle size={14} />
                                PHRN Verification Failed: Invalid PHRN
                            </span>
                        )}
                    </div>
                )}
            </div>

            <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
                {/* Table header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center">
                            <ClipboardList size={16} className="text-amber-600" />
                        </div>
                        <div>
                            <h2 className="text-sm font-semibold text-gray-900">Prescription Queue</h2>
                            {!isLoading && (
                                <p className="text-xs text-gray-500">
                                    {prescriptions.length} pending prescription{prescriptions.length !== 1 ? 's' : ''}
                                </p>
                            )}
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={fetchPrescriptions}
                        isLoading={isLoading}
                        className="gap-1.5"
                    >
                        <RefreshCw size={14} />
                        Refresh
                    </Button>
                </div>

                {/* Error */}
                {error && (
                    <div className="m-6 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                        {error}
                    </div>
                )}

                {/* Loading skeleton */}
                {isLoading ? (
                    <div className="p-6 space-y-3">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="h-14 bg-gray-100 rounded-lg animate-pulse" />
                        ))}
                    </div>
                ) : (
                    <div className="p-6">
                        <PrescriptionTable
                            prescriptions={prescriptions}
                            onDispensed={handleDispensed}
                        />
                    </div>
                )}
            </div>
        </PharmacyLayout>
    );
}
