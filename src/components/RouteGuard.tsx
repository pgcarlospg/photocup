'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth, ROUTE_PERMISSIONS, Role } from '@/lib/auth';

const FALLBACKS: Record<NonNullable<Role>, string> = {
    participant:  '/dashboard',
    judge:        '/judge',
    coordinator:  '/nm-dashboard',
    admin:        '/admin',
};

/**
 * Call at the top of any protected page component.
 * Returns true when the user is authorised to view the page.
 * Returns false while redirecting (render nothing in that case).
 */
export function useRouteGuard(): boolean {
    const { role, isReady } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!isReady) return;
        const required = ROUTE_PERMISSIONS[pathname];
        if (!required) return;

        if (!role) {
            router.replace('/login');
            return;
        }
        if (!required.includes(role as NonNullable<Role>)) {
            router.replace(FALLBACKS[role as NonNullable<Role>] ?? '/login');
        }
    }, [isReady, role, pathname, router]);

    if (!isReady) return false;
    const required = ROUTE_PERMISSIONS[pathname];
    if (!required) return true;
    if (!role || !required.includes(role as NonNullable<Role>)) return false;
    return true;
}

/** JSX wrapper — kept for backwards compatibility */
export function RouteGuard({ children }: { children: React.ReactNode }) {
    const ok = useRouteGuard();
    return ok ? <>{children}</> : null;
}
