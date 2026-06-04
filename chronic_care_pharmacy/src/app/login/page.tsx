'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { Mail, Lock, Eye, EyeOff, Pill, AlertCircle } from 'lucide-react';

export default function LoginPage() {
    const { login } = useAuth();
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password) {
            setError('Please enter both email and password.');
            return;
        }
        setError('');
        setIsLoading(true);
        try {
            await login(email, password);
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Login failed. Please try again.';
            setError(msg);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center p-4">
            {/* Decorative circles */}
            <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none" />

            <div className="relative w-full max-w-md">
                {/* Card */}
                <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-white/20">
                    {/* Logo */}
                    <div className="flex flex-col items-center mb-8">
                        <div className="w-14 h-14 bg-medical-blue rounded-2xl flex items-center justify-center shadow-lg mb-4">
                            <Pill size={28} className="text-white" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900">CCMS Portal</h1>
                        <p className="text-sm text-gray-500 mt-1">Chronic Care Management System</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                        <Input
                            label="Email Address"
                            type="email"
                            id="email"
                            placeholder="you@ccms.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            leftIcon={<Mail size={16} />}
                            fullWidth
                            autoComplete="email"
                        />

                        <Input
                            label="Password"
                            type={showPassword ? 'text' : 'password'}
                            id="password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            leftIcon={<Lock size={16} />}
                            rightIcon={
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            }
                            fullWidth
                            autoComplete="current-password"
                        />

                        {error && (
                            <div className="flex items-center gap-2.5 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                                <AlertCircle size={16} className="flex-shrink-0 text-signal-red" />
                                {error}
                            </div>
                        )}

                        <Button
                            type="submit"
                            variant="primary"
                            size="lg"
                            isLoading={isLoading}
                            className="w-full mt-2"
                        >
                            {isLoading ? 'Signing In…' : 'Sign In'}
                        </Button>
                    </form>

                    {/* Demo credentials */}
                    <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
                        <p className="text-xs font-semibold text-blue-700 mb-2">Demo Credentials</p>
                        <div className="space-y-1 text-xs text-blue-600">
                            <p>
                                <span className="font-medium">Pharmacy:</span>{' '}
                                <button
                                    type="button"
                                    className="underline hover:text-blue-800"
                                    onClick={() => { setEmail('pharmacy@ccms.com'); setPassword('pharmacy123'); }}
                                >
                                    pharmacy@ccms.com / pharmacy123
                                </button>
                            </p>
                            <p>
                                <span className="font-medium">Doctor:</span>{' '}
                                <button
                                    type="button"
                                    className="underline hover:text-blue-800"
                                    onClick={() => { setEmail('doctor@ccms.com'); setPassword('doctor123'); }}
                                >
                                    doctor@ccms.com / doctor123
                                </button>
                            </p>
                        </div>
                    </div>
                </div>

                <p className="text-center text-xs text-white/40 mt-6">
                    © 2026 CCMS · Chronic Care Management System
                </p>
            </div>
        </div>
    );
}
