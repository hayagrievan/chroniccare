'use client';

import React from 'react';
import { AuthProvider } from '@/context/AuthContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import PharmacyLayout from '@/components/layout/PharmacyLayout';

export default function PharmacyRootLayout({ children }: { children: React.ReactNode }) {
    return (
        <AuthProvider>
            <ProtectedRoute requiredRole="PHARMACY">
                {children}
            </ProtectedRoute>
        </AuthProvider>
    );
}
