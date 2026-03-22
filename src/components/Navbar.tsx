'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, X, User, LogOut } from 'lucide-react';
import { useAuth, NAV_LINKS, PUBLIC_NAV } from '@/lib/auth';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';

const ROLE_LABELS: Record<string, string> = {
    participant:  'Participant',
    judge:        'Judge',
    coordinator:  'Coordinator',
    admin:        'Admin',
};

export const Navbar = () => {
    const { role, logout, isReady } = useAuth();
    const pathname = usePathname();
    const router = useRouter();
    const [mobileOpen, setMobileOpen] = useState(false);

    const links = role ? NAV_LINKS[role] : PUBLIC_NAV;

    const handleLogout = () => {
        logout();
        router.push('/login');
    };

    return (
        <>
        <nav className="fixed top-0 w-full z-50 border-b border-[#C8860A]/15"
             style={{ background: 'rgba(8,3,0,0.92)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' }}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">

                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-3 group" onClick={() => setMobileOpen(false)}>
                        <img
                            src="/photocup26-logo-W.png"
                            alt="PhotoCup 2026"
                            className="h-9 w-auto opacity-90 group-hover:opacity-100 transition-opacity"
                        />
                    </Link>

                    {/* Desktop Nav Links */}
                    <div className="hidden lg:flex items-center space-x-5"
                         style={{ fontFamily: 'var(--font-barlow)', fontSize: '13px', fontWeight: 600, letterSpacing: '0.1em' }}>
                        {isReady && links.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={cn(
                                    'uppercase transition-colors',
                                    link.highlight
                                        ? 'text-[#F5A623] hover:text-white'
                                        : 'text-[#C8A070] hover:text-[#F5A623]',
                                    pathname === link.href && 'text-white'
                                )}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>

                    {/* Desktop Actions */}
                    <div className="hidden lg:flex items-center gap-3">
                        {isReady && role ? (
                            <>
                                <div className="flex items-center gap-2 px-3 py-1.5 border border-[#C8860A]/20"
                                     style={{ fontFamily: 'var(--font-barlow)', background: 'rgba(200,134,10,0.06)' }}>
                                    <User className="w-3 h-3 text-[#F5A623]" />
                                    <span className="text-[#C8A070] text-[11px] font-bold uppercase tracking-widest">
                                        {ROLE_LABELS[role]}
                                    </span>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center gap-1.5 px-3 py-1.5 border border-[#C8860A]/15 text-[#7A6040] hover:text-[#F5A623] hover:border-[#F5A623]/30 transition-all text-[11px] font-bold uppercase tracking-widest"
                                    style={{ fontFamily: 'var(--font-barlow)' }}
                                >
                                    <LogOut className="w-3.5 h-3.5" /> Sign Out
                                </button>
                            </>
                        ) : (
                            <>
                                <Link href="/login"
                                      className="p-2 border border-[#C8860A]/20 text-[#C8A070] hover:text-[#F5A623] hover:border-[#F5A623]/40 transition-all">
                                    <User className="w-4 h-4" />
                                </Link>
                                <Link
                                    href="/login"
                                    className="px-5 py-2 grad-premium text-[#080300] font-bold text-xs uppercase tracking-widest hover:opacity-90 glow-gold transition-all"
                                    style={{ fontFamily: 'var(--font-barlow)', clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 100%, 8px 100%)' }}
                                >
                                    Enter 2026
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile right: sign-out + hamburger */}
                    <div className="flex lg:hidden items-center gap-2">
                        {isReady && role && (
                            <button
                                onClick={handleLogout}
                                className="p-2 border border-[#C8860A]/15 text-[#7A6040] hover:text-[#F5A623] transition-all"
                                title="Sign out"
                            >
                                <LogOut className="w-4 h-4" />
                            </button>
                        )}
                        <button
                            onClick={() => setMobileOpen(o => !o)}
                            className="p-2 text-[#C8A070] hover:text-white transition-colors"
                            aria-label="Toggle menu"
                        >
                            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </button>
                    </div>
                </div>
            </div>
        </nav>

        {/* Mobile drawer */}
        <AnimatePresence>
            {mobileOpen && (
                <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.18 }}
                    className="fixed top-16 left-0 right-0 z-40 border-b border-[#C8860A]/20 lg:hidden"
                    style={{ background: 'rgba(8,3,0,0.97)', backdropFilter: 'blur(20px)' }}
                >
                    <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col gap-1"
                         style={{ fontFamily: 'var(--font-barlow)', fontSize: '14px', fontWeight: 600, letterSpacing: '0.08em' }}>
                        {isReady && links.map(link => (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={() => setMobileOpen(false)}
                                className={cn(
                                    'uppercase px-4 py-3 border-b border-[#C8860A]/08 transition-colors',
                                    link.highlight
                                        ? 'text-[#F5A623]'
                                        : 'text-[#C8A070] hover:text-[#F5A623]',
                                    pathname === link.href && 'text-white'
                                )}
                            >
                                {link.label}
                            </Link>
                        ))}
                        {isReady && !role && (
                            <Link
                                href="/login"
                                onClick={() => setMobileOpen(false)}
                                className="mt-3 mx-4 py-3 grad-premium text-[#080300] font-bold text-xs uppercase tracking-widest text-center glow-gold"
                                style={{ clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 100%, 8px 100%)' }}
                            >
                                Enter 2026
                            </Link>
                        )}
                        {isReady && role && (
                            <div className="px-4 py-3 flex items-center gap-2 text-[#5A4020] text-xs uppercase tracking-widest">
                                <User className="w-3.5 h-3.5 text-[#F5A623]" />
                                {ROLE_LABELS[role]}
                            </div>
                        )}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
        </>
    );
};
