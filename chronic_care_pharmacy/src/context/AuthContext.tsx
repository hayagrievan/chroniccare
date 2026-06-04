'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@/types';
import { authService } from '@/services/authService';
import { getUserFromToken, removeToken } from '@/utils/auth';

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const tokenUser = getUserFromToken();
        if (tokenUser) {
            setUser({
                id: tokenUser.id,
                name: tokenUser.name,
                email: tokenUser.email,
                role: tokenUser.role,
            });
        }
        setIsLoading(false);
    }, []);

    const login = async (email: string, password: string) => {
        const response = await authService.login(email, password);
        setUser(response.user);
        if (response.user.role === 'PHARMACY') {
            router.push('/pharmacy/dashboard');
        } else if (response.user.role === 'DOCTOR') {
            router.push('/doctor/dashboard');
        } else {
            router.push('/dashboard');
        }
    };

    const logout = () => {
        authService.logout();
        setUser(null);
        router.push('/login');
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isLoading,
                isAuthenticated: !!user,
                login,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
