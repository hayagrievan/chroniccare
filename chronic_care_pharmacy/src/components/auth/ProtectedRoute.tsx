'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface ProtectedRouteProps {
    children: React.ReactNode;
    requiredRole?: 'PHARMACY' | 'DOCTOR' | 'ADMIN';
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
    const { user, isLoading, isAuthenticated } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading) {
            if (!isAuthenticated) {
                router.replace('/login');
            } else if (requiredRole && user?.role !== requiredRole) {
                // Redirect to correct dashboard
                if (user?.role === 'PHARMACY') router.replace('/pharmacy/dashboard');
                else if (user?.role === 'DOCTOR') router.replace('/doctor/dashboard');
                else router.replace('/login');
            }
        }
    }, [isLoading, isAuthenticated, user, requiredRole, router]);

    if (isLoading) return <LoadingSpinner fullScreen />;
    if (!isAuthenticated) return null;
    if (requiredRole && user?.role !== requiredRole) return null;

    return <>{children}</>;
}
