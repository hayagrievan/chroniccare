'use client';

import React, { useEffect, useState } from 'react';
import PharmacyLayout from '@/components/layout/PharmacyLayout';
import StatCard from '@/components/pharmacy/StatCard';
import { pharmacyService } from '@/services/pharmacyService';
import { DashboardStats } from '@/types';
import { ClipboardList, CheckCircle2, Users, Activity } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function PharmacyDashboardPage() {
    const { user } = useAuth();
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        pharmacyService
            .getDashboardStats()
            .then(setStats)
            .catch(() => setError('Failed to load dashboard stats.'))
            .finally(() => setIsLoading(false));
    }, []);

    const currentHour = new Date().getHours();
    const greeting =
        currentHour < 12 ? 'Good morning' : currentHour < 17 ? 'Good afternoon' : 'Good evening';

    return (
        <PharmacyLayout
            title="Dashboard"
            subtitle={`${greeting}, ${user?.name?.split(' ')[0] ?? 'Pharmacist'}! Here's today's overview.`}
        >
            {/* Stat Cards */}
            {error && (
                <div className="p-4 mb-6 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
                <StatCard
                    title="Total Pending Prescriptions"
                    value={stats?.totalPending ?? 0}
                    icon={ClipboardList}
                    color="amber"
                    trend="Requires immediate attention"
                    isLoading={isLoading}
                />
                <StatCard
                    title="Total Dispensed Today"
                    value={stats?.totalDispensedToday ?? 0}
                    icon={CheckCircle2}
                    color="green"
                    trend="Dispensed in last 24 hrs"
                    isLoading={isLoading}
                />
                <StatCard
                    title="Total Patients Served"
                    value={stats?.totalPatientsServed ?? 0}
                    icon={Users}
                    color="blue"
                    trend="Unique patients this month"
                    isLoading={isLoading}
                />
            </div>

            {/* Quick actions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-9 h-9 bg-amber-50 rounded-lg flex items-center justify-center">
                            <ClipboardList size={18} className="text-amber-600" />
                        </div>
                        <h2 className="text-base font-semibold text-gray-900">Pending Queue</h2>
                    </div>
                    {isLoading ? (
                        <div className="space-y-2">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="h-10 bg-gray-100 rounded-lg animate-pulse" />
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col gap-2">
                            {stats?.totalPending === 0 ? (
                                <p className="text-sm text-gray-500">No pending prescriptions 🎉</p>
                            ) : (
                                <p className="text-sm text-gray-700">
                                    There are{' '}
                                    <span className="font-bold text-amber-600">{stats?.totalPending}</span>{' '}
                                    prescription{stats?.totalPending !== 1 ? 's' : ''} waiting to be dispensed.
                                </p>
                            )}
                            <a
                                href="/pharmacy/prescriptions"
                                className="inline-flex items-center gap-2 mt-2 text-sm font-medium text-medical-blue hover:underline"
                            >
                                View all pending →
                            </a>
                        </div>
                    )}
                </div>

                <div className="bg-gradient-to-br from-medical-blue to-blue-700 rounded-xl p-6 text-white">
                    <div className="flex items-center gap-3 mb-4">
                        <Activity size={20} className="text-blue-200" />
                        <h2 className="text-base font-semibold">System Status</h2>
                    </div>
                    <div className="space-y-3">
                        {[
                            { label: 'Prescription Service', status: 'Operational' },
                            { label: 'Patient Database', status: 'Operational' },
                            { label: 'Inventory System', status: 'Operational' },
                        ].map(({ label, status }) => (
                            <div key={label} className="flex items-center justify-between">
                                <span className="text-sm text-blue-100">{label}</span>
                                <span className="flex items-center gap-1.5 text-xs font-medium text-green-300">
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block animate-pulse" />
                                    {status}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </PharmacyLayout>
    );
}
