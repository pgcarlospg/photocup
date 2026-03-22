'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiLogin } from '@/lib/api';

export type Role = 'participant' | 'judge' | 'coordinator' | 'admin' | null;

export interface AuthUser {
    email: string;
    full_name: string;
    country: string | null;
}

interface AuthCtx {
    role: Role;
    user: AuthUser | null;
    token: string | null;
    login: (email: string, password: string) => Promise<NonNullable<Role>>;
    logout: () => void;
    isReady: boolean;
}

const AuthContext = createContext<AuthCtx>({
    role: null,
    user: null,
    token: null,
    login: async () => 'participant' as NonNullable<Role>,
    logout: () => {},
    isReady: false,
});

/** Map backend role strings to our lowercase Role type */
function mapRole(backendRole: string): NonNullable<Role> {
    const map: Record<string, NonNullable<Role>> = {
        ADMIN: 'admin',
        PARTICIPANT: 'participant',
        JUDGE: 'judge',
        NATIONAL_COORDINATOR: 'coordinator',
    };
    return map[backendRole.toUpperCase()] ?? 'participant';
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [role, setRole] = useState<Role>(null);
    const [user, setUser] = useState<AuthUser | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        try {
            const savedToken = localStorage.getItem('pc_token');
            const savedRole = localStorage.getItem('pc_role') as Role;
            const savedUser = localStorage.getItem('pc_user');
            if (savedToken && savedRole) {
                setToken(savedToken);
                setRole(savedRole);
                if (savedUser) {
                    try { setUser(JSON.parse(savedUser)); } catch { /* corrupted data, ignore */ }
                }
            }
        } catch {
            // localStorage blocked by browser policy — continue without saved session
        } finally {
            setIsReady(true);
        }
    }, []);

    const login = async (email: string, password: string): Promise<NonNullable<Role>> => {
        const res = await apiLogin(email, password);
        const r = mapRole(res.user.role);
        const u: AuthUser = {
            email: res.user.email,
            full_name: res.user.full_name,
            country: res.user.country,
        };
        setRole(r);
        setUser(u);
        setToken(res.access_token);
        try {
            localStorage.setItem('pc_token', res.access_token);
            localStorage.setItem('pc_role', r);
            localStorage.setItem('pc_user', JSON.stringify(u));
        } catch { /* localStorage blocked — session won't persist on reload but login works */ }
        return r;
    };

    const logout = () => {
        setRole(null);
        setUser(null);
        setToken(null);
        try {
            localStorage.removeItem('pc_token');
            localStorage.removeItem('pc_role');
            localStorage.removeItem('pc_user');
        } catch { /* ignore */ }
    };

    return (
        <AuthContext.Provider value={{ role, user, token, login, logout, isReady }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);

/** Map of route → allowed roles (empty array = public) */
export const ROUTE_PERMISSIONS: Record<string, NonNullable<Role>[]> = {
    '/dashboard':    ['participant', 'admin'],
    '/submit':       ['participant', 'admin'],
    '/judge':        ['judge'],
    '/nm-dashboard': ['coordinator'],
    '/admin':        ['admin'],
};

/** Nav links visible per role */
export const NAV_LINKS: Record<NonNullable<Role>, { href: string; label: string; highlight?: boolean }[]> = {
    participant: [
        { href: '/',          label: 'Home' },
        { href: '/rules',     label: 'Rules' },
        { href: '/results',   label: 'Results' },
        { href: '/dashboard', label: 'My Photos', highlight: true },
    ],
    judge: [
        { href: '/rules',     label: 'Rules' },
        { href: '/results',   label: 'Results' },
        { href: '/judge',     label: 'Judge Panel', highlight: true },
    ],
    coordinator: [
        { href: '/rules',        label: 'Rules' },
        { href: '/results',      label: 'Results' },
        { href: '/nm-dashboard', label: 'NM Dashboard', highlight: true },
    ],
    admin: [
        { href: '/',        label: 'Home' },
        { href: '/rules',   label: 'Rules' },
        { href: '/admin',   label: 'Admin Panel', highlight: true },
    ],
};

export interface NavLink {
    href: string;
    label: string;
    highlight?: boolean;
}

export const PUBLIC_NAV: NavLink[] = [
    { href: '/',        label: 'Home' },
    { href: '/results', label: 'Results' },
    { href: '/rules',   label: 'Rules' },
    { href: '/contact', label: 'Contact' },
];
