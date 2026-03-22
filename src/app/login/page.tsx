'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { Lock, User, ArrowRight } from 'lucide-react';
import { useAuth } from '@/lib/auth';

const font = { fontFamily: 'var(--font-barlow)' };
const fontDisplay = { fontFamily: 'var(--font-oswald)' };
const fontBody = { fontFamily: 'var(--font-garamond)' };

type FrontendRole = 'participant' | 'judge' | 'coordinator' | 'admin';

const DESTINATIONS: Record<FrontendRole, string> = {
    participant: '/dashboard',
    judge: '/judge',
    coordinator: '/nm-dashboard',
    admin: '/admin',
};

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login, role, isReady } = useAuth();
    const router = useRouter();

    // Navigate once the AuthProvider has committed the new role to React state.
    // Using a useEffect guarantees that all setState calls inside login() have
    // been applied before we navigate — eliminating the race condition where
    // RouteGuard would see role=null and bounce the user back to /login.
    useEffect(() => {
        if (!isReady || !role) return;
        const dest = DESTINATIONS[role as FrontendRole];
        if (dest) router.push(dest);
    }, [isReady, role, router]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password) return;
        setError('');
        setLoading(true);
        try {
            await login(email, password);
            // Navigation is handled by the useEffect above, which fires after
            // React has flushed the role state update from login().
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Login failed. Check credentials.');
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-[#080300] flex flex-col relative overflow-hidden" style={{ color: '#F5E0C0' }}>
            {/* Atmospheric background */}
            <div className="absolute inset-0 pointer-events-none">
                <Image src="/poster2026.jpg" alt="" fill priority
                     style={{ objectFit: 'cover', opacity: 0.1, filter: 'blur(6px) saturate(0.5)' }} />
                <div className="absolute inset-0 bg-gradient-to-br from-[#080300]/95 via-[#080300]/80 to-[#0D0500]/90" />
                <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-[#F5A623]/5 rounded-full blur-[100px]" />
                <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-[#E8760A]/04 rounded-full blur-[80px]" />
            </div>

            <Navbar />

            <div className="flex-1 flex items-center justify-center px-4 pt-20 pb-12 relative z-10">
                <div className="w-full max-w-md">
                    {/* Header badge */}
                    <div className="flex items-center gap-3 justify-center mb-8 animate-fade-up">
                        <div className="h-px w-8 bg-[#F5A623]" />
                        <span className="text-[#F5A623] text-xs font-bold uppercase tracking-[0.3em]" style={font}>
                            Mensa International · PhotoCup 2026
                        </span>
                        <div className="h-px w-8 bg-[#F5A623]" />
                    </div>

                    <div className="animate-fade-up delay-100">
                        <div className="text-center mb-8">
                            <h1 className="text-4xl md:text-5xl font-bold text-white mb-3" style={fontDisplay}>
                                Sign In
                            </h1>
                            <p className="text-[#7A6040] text-sm" style={fontBody}>
                                Enter your credentials to access the platform.
                            </p>
                        </div>

                        <div className="glass border border-[#C8860A]/15 p-8 relative overflow-hidden"
                             style={{ clipPath: 'polygon(0 0, 100% 0, 100% 96%, 96% 100%, 0 100%)' }}>
                            <div className="absolute top-0 left-0 w-full h-0.5 grad-premium" />
                            <div className="absolute -top-12 -right-12 w-36 h-36 rounded-full blur-3xl pointer-events-none"
                                 style={{ background: '#F5A6230C' }} />

                            <div className="relative z-10">
                                <form className="space-y-5" onSubmit={handleLogin}>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-[#C8A070] uppercase tracking-[0.15em]" style={font}>Email</label>
                                        <div className="relative">
                                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5A4020]" />
                                            <input
                                                type="email"
                                                required
                                                placeholder="your@email.com"
                                                value={email}
                                                onChange={e => setEmail(e.target.value)}
                                                className="w-full bg-[#120700] border border-[#C8860A]/20 py-4 pl-11 pr-4 text-[#F5E0C0] placeholder-[#3A2A10] focus:outline-none focus:border-[#F5A623]/50 transition-all"
                                                style={font}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-[#C8A070] uppercase tracking-[0.15em]" style={font}>Password</label>
                                        <div className="relative">
                                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5A4020]" />
                                            <input
                                                type="password"
                                                required
                                                placeholder="••••••••"
                                                value={password}
                                                onChange={e => setPassword(e.target.value)}
                                                className="w-full bg-[#120700] border border-[#C8860A]/20 py-4 pl-11 pr-4 text-[#F5E0C0] placeholder-[#3A2A10] focus:outline-none focus:border-[#F5A623]/50 transition-all"
                                                style={font}
                                            />
                                        </div>
                                    </div>

                                    {error && (
                                        <p className="text-red-400 text-xs border border-red-800/30 bg-red-900/10 px-4 py-2" style={font}>
                                            {error}
                                        </p>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full py-4 grad-premium text-[#080300] font-bold uppercase tracking-widest text-sm hover:opacity-90 transition-all flex items-center justify-center gap-2 group mt-2 disabled:opacity-60 glow-gold"
                                        style={font}
                                    >
                                        {loading ? 'Authenticating…' : 'Sign In'}
                                        {!loading && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
                                    </button>
                                </form>

                                <p className="mt-6 text-center text-[#3A2A10] text-xs leading-relaxed" style={fontBody}>
                                    Secure Authentication · Mensa International IT Services
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
