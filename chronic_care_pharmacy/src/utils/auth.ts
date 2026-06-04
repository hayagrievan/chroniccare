import { AuthTokenPayload } from '@/types';

const TOKEN_KEY = 'ccms_token';

export function getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(TOKEN_KEY, token);
}

export function removeToken(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(TOKEN_KEY);
}

export function decodeToken(token: string): AuthTokenPayload | null {
    try {
        const parts = token.split('.');
        if (parts.length !== 3) return null;
        const payload = JSON.parse(atob(parts[1]));
        return payload as AuthTokenPayload;
    } catch {
        return null;
    }
}

export function isTokenExpired(token: string): boolean {
    const payload = decodeToken(token);
    if (!payload) return true;
    return payload.exp * 1000 < Date.now();
}

export function getUserFromToken(): AuthTokenPayload | null {
    const token = getToken();
    if (!token) return null;
    if (isTokenExpired(token)) {
        removeToken();
        return null;
    }
    return decodeToken(token);
}
