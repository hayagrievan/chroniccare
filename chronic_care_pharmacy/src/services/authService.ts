import { LoginResponse } from '@/types';
import api from './api';
import { setToken, removeToken } from '@/utils/auth';

export const authService = {
    async login(email: string, password: string): Promise<LoginResponse> {
        // ── MOCK: remove when real backend is ready ──────────────────────
        if (email === 'pharmacy@ccms.com' && password === 'pharmacy123') {
            const mockResponse: LoginResponse = {
                token:
                    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' +
                    btoa(
                        JSON.stringify({
                            id: 'pharm-001',
                            name: 'Pharmacy Staff',
                            email: 'pharmacy@ccms.com',
                            role: 'PHARMACY',
                            iat: Math.floor(Date.now() / 1000),
                            exp: Math.floor(Date.now() / 1000) + 86400,
                        })
                    ) +
                    '.mock-signature',
                user: {
                    id: 'pharm-001',
                    name: 'Pharmacy Staff',
                    email: 'pharmacy@ccms.com',
                    role: 'PHARMACY',
                },
            };
            setToken(mockResponse.token);
            return mockResponse;
        }
        if (email === 'doctor@ccms.com' && password === 'doctor123') {
            const mockResponse: LoginResponse = {
                token:
                    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' +
                    btoa(
                        JSON.stringify({
                            id: 'doc-001',
                            name: 'Dr. Sharma',
                            email: 'doctor@ccms.com',
                            role: 'DOCTOR',
                            iat: Math.floor(Date.now() / 1000),
                            exp: Math.floor(Date.now() / 1000) + 86400,
                        })
                    ) +
                    '.mock-signature',
                user: {
                    id: 'doc-001',
                    name: 'Dr. Sharma',
                    email: 'doctor@ccms.com',
                    role: 'DOCTOR',
                },
            };
            setToken(mockResponse.token);
            return mockResponse;
        }
        throw new Error('Invalid email or password');
        // ── END MOCK ─────────────────────────────────────────────────────

        // Real API call (uncomment when backend is ready):
        // const response = await api.post<LoginResponse>('/auth/login', { email, password });
        // setToken(response.data.token);
        // return response.data;
    },

    logout(): void {
        removeToken();
    },
};
