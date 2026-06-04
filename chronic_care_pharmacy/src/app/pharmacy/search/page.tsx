'use client';

import React, { useState } from 'react';
import PharmacyLayout from '@/components/layout/PharmacyLayout';
import PatientSearchResult from '@/components/pharmacy/PatientSearchResult';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { pharmacyService } from '@/services/pharmacyService';
import { Patient, Prescription } from '@/types';
import { Search, UserSearch, AlertCircle } from 'lucide-react';

export default function SearchPatientPage() {
    const [query, setQuery] = useState('');
    const [result, setResult] = useState<{ patient: Patient | null; prescriptions: Prescription[] } | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [searched, setSearched] = useState(false);

    const handleSearch = async (e?: React.FormEvent) => {
        e?.preventDefault();
        const uid = query.trim();
        if (!uid) { setError('Please enter a Patient ID.'); return; }
        setError('');
        setIsLoading(true);
        setSearched(false);
        try {
            const data = await pharmacyService.searchPatient(uid);
            setResult(data);
        } catch {
            setError('Failed to search. Please try again.');
        } finally {
            setIsLoading(false);
            setSearched(true);
        }
    };

    return (
        <PharmacyLayout title="Search Patient" subtitle="Lookup a patient's prescription history by their unique ID or PHRN">
            {/* Search box */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-6">
                <form onSubmit={handleSearch} className="flex items-end gap-3">
                    <div className="flex-1">
                        <Input
                            label="Patient Unique ID / PHRN"
                            id="patient-uid"
                            placeholder="e.g. PAT-1001 or PHRN-IND-2026-000001"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            leftIcon={<Search size={16} />}
                            error={error}
                            fullWidth
                        />
                    </div>
                    <Button
                        type="submit"
                        variant="primary"
                        size="md"
                        isLoading={isLoading}
                        className="flex-shrink-0 h-[42px]"
                    >
                        Search
                    </Button>
                </form>

                {/* Hints */}
                <div className="mt-3 flex gap-2">
                    {['PAT-001', 'PHRN-IND-2026-000001', 'PHRN-IND-2026-000006'].map((uid) => (
                        <button
                            key={uid}
                            type="button"
                            onClick={() => { setQuery(uid); setError(''); }}
                            className="text-xs px-2.5 py-1 rounded-full border border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors font-mono"
                        >
                            {uid}
                        </button>
                    ))}
                    <span className="text-xs text-gray-400 self-center ml-1">Demo IDs / PHRNs</span>
                </div>
            </div>

            {/* Loading */}
            {isLoading && (
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-10 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-8 h-8 border-2 border-medical-blue border-t-transparent rounded-full animate-spin" />
                        <p className="text-sm text-gray-500">Searching patient records…</p>
                    </div>
                </div>
            )}

            {/* No results */}
            {!isLoading && searched && result?.patient === null && (
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 flex flex-col items-center text-center">
                    <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <UserSearch size={26} className="text-gray-400" />
                    </div>
                    <h3 className="text-base font-semibold text-gray-900 mb-1">Patient Not Found</h3>
                    <p className="text-sm text-gray-500 max-w-xs">
                        No patient found with ID <span className="font-mono font-semibold text-gray-700">{query}</span>.
                        Please verify the ID and try again.
                    </p>
                </div>
            )}

            {/* Results */}
            {!isLoading && result?.patient && (
                <PatientSearchResult patient={result.patient} prescriptions={result.prescriptions} />
            )}

            {/* API error */}
            {!isLoading && error && !result && (
                <div className="flex items-center gap-2.5 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                    <AlertCircle size={16} className="flex-shrink-0" /> {error}
                </div>
            )}
        </PharmacyLayout>
    );
}
