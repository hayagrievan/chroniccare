'use client';

import React from 'react';
import PharmacySidebar from './PharmacySidebar';
import { Bell, HelpCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface PharmacyLayoutProps {
    children: React.ReactNode;
    title?: string;
    subtitle?: string;
}

export default function PharmacyLayout({ children, title, subtitle }: PharmacyLayoutProps) {
    const { user } = useAuth();

    return (
        <div className="min-h-screen bg-gray-50 flex">
            <PharmacySidebar />

            {/* Main content */}
            <div className="flex-1 ml-64 transition-all duration-300">
                {/* Top bar */}
                <header className="sticky top-0 z-30 bg-white border-b border-gray-100 px-8 py-4 flex items-center justify-between shadow-xs">
                    <div>
                        {title && (
                            <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
                        )}
                        {subtitle && (
                            <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>
                        )}
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors relative">
                            <Bell size={18} />
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-signal-red rounded-full border border-white" />
                        </button>
                        <button className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
                            <HelpCircle size={18} />
                        </button>
                        <div className="w-px h-6 bg-gray-200" />
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-medical-blue text-white flex items-center justify-center text-sm font-semibold">
                                {user?.name?.charAt(0) ?? 'P'}
                            </div>
                            <div className="hidden sm:block">
                                <p className="text-sm font-medium text-gray-900 leading-tight">{user?.name}</p>
                                <p className="text-xs text-gray-500">Pharmacist</p>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page content */}
                <main className="p-8">{children}</main>
            </div>
        </div>
    );
}
