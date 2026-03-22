'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

export const Hero = () => {
    return (
        <div className="relative min-h-screen overflow-hidden">
            {/* Poster Background — priority preloads in <head> */}
            <div className="absolute inset-0">
                <Image
                    src="/poster2026.jpg"
                    alt="PhotoCup 2026 — Spark of Evolution"
                    fill
                    priority
                    style={{ objectFit: 'cover', objectPosition: 'center', filter: 'brightness(0.45) saturate(1.1)' }}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[#080300]/95 via-[#080300]/50 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#080300] via-transparent to-[#080300]/40" />
                <div className="absolute top-1/3 right-0 w-96 h-96 bg-[#F5A623]/10 rounded-full blur-[120px] pointer-events-none animate-ember" />
                <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-[#E8760A]/08 rounded-full blur-[80px] pointer-events-none" />
            </div>

            {/* Content */}
            <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 pt-36 pb-24 lg:pt-44 lg:pb-32">
                <div className="max-w-3xl">

                    {/* Pre-title badge */}
                    <div className="flex items-center gap-3 mb-8 animate-fade-left">
                        <div className="h-px w-12 bg-[#F5A623]" />
                        <span className="text-[#F5A623] text-xs font-bold uppercase tracking-[0.3em]"
                              style={{ fontFamily: 'var(--font-barlow)' }}>
                            Mensa International · 80th Anniversary
                        </span>
                    </div>

                    {/* Theme label */}
                    <p className="text-[#C8A070] text-sm font-semibold uppercase tracking-[0.25em] mb-3 animate-fade-up delay-100"
                       style={{ fontFamily: 'var(--font-barlow)' }}>
                        Theme 2026
                    </p>

                    {/* Main Title */}
                    <h1 className="text-white leading-[0.92] mb-6 animate-fade-up delay-150"
                        style={{ fontFamily: 'var(--font-oswald)', fontWeight: 700 }}>
                        <span className="block text-5xl md:text-7xl lg:text-8xl">spark </span>
                        <span
                            className="block text-5xl md:text-7xl lg:text-8xl"
                            style={{
                                background: 'linear-gradient(135deg, #C8860A 0%, #F5A623 60%, #FFD166 100%)',
                                WebkitBackgroundClip: 'text',
                                backgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                color: 'transparent',
                            }}
                        >of evolution</span>
                    </h1>

                    {/* Quote */}
                    <p className="text-[#B89060] text-sm md:text-base mb-10 max-w-lg leading-relaxed italic animate-fade-up delay-300"
                       style={{ fontFamily: 'var(--font-garamond)' }}>
                        &ldquo;The essential impulse that drives beings, systems, or ideas to adapt, improve, or transform over time.&rdquo;
                    </p>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 mb-16 animate-fade-up delay-400">
                        <Link
                            href="/submit"
                            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-none grad-premium text-[#080300] font-bold uppercase tracking-widest text-sm glow-gold hover:opacity-95 transition-all"
                            style={{ fontFamily: 'var(--font-barlow)', clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 100%, 12px 100%)' }}
                        >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
                                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                                <circle cx="12" cy="13" r="4"/>
                            </svg>
                            Submit Your Photo
                        </Link>
                        <Link
                            href="/results"
                            className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-[#C8860A]/40 text-[#F5A623] font-bold uppercase tracking-widest text-sm hover:bg-[#C8860A]/10 transition-all"
                            style={{ fontFamily: 'var(--font-barlow)', clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 100%, 12px 100%)' }}
                        >
                            View Results 2025
                        </Link>
                    </div>

                    {/* Key info strip */}
                    <div className="flex flex-wrap gap-8 border-t border-[#C8860A]/20 pt-8 animate-fade-in delay-550">
                        <div>
                            <p className="text-[#F5A623] text-2xl font-bold" style={{ fontFamily: 'var(--font-oswald)' }}>31 Aug 2026</p>
                            <p className="text-[#7A6040] text-xs uppercase tracking-widest mt-0.5" style={{ fontFamily: 'var(--font-barlow)' }}>Submission Deadline</p>
                        </div>
                        <div className="w-px bg-[#C8860A]/20" />
                        <div>
                            <p className="text-[#F5A623] text-2xl font-bold" style={{ fontFamily: 'var(--font-oswald)' }}>52 Nations</p>
                            <p className="text-[#7A6040] text-xs uppercase tracking-widest mt-0.5" style={{ fontFamily: 'var(--font-barlow)' }}>Worldwide Participation</p>
                        </div>
                        <div className="w-px bg-[#C8860A]/20" />
                        <div>
                            <p className="text-[#F5A623] text-2xl font-bold" style={{ fontFamily: 'var(--font-oswald)' }}>photocup@mensa.org</p>
                            <p className="text-[#7A6040] text-xs uppercase tracking-widest mt-0.5" style={{ fontFamily: 'var(--font-barlow)' }}>Official Contact</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-[#080300] to-transparent pointer-events-none" />

            {/* Competition tags */}
            <div className="hidden xl:flex absolute right-8 top-1/2 -translate-y-1/2 flex-col gap-4 z-20 animate-fade-left delay-600">
                {[
                    { label: 'PhotoCup', sub: 'Individual', icon: '◉' },
                    { label: 'PhotoOlimpic', sub: 'National Teams', icon: '◈' },
                    { label: 'Best Story', sub: 'New Category', icon: '◆' },
                ].map((item, i) => (
                    <div key={i} className="glass border border-[#C8860A]/15 px-5 py-3 text-right"
                         style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 8px 100%)' }}>
                        <p className="text-white font-bold text-sm" style={{ fontFamily: 'var(--font-oswald)' }}>
                            <span className="text-[#F5A623] mr-2">{item.icon}</span>{item.label}
                        </p>
                        <p className="text-[#7A6040] text-[10px] uppercase tracking-widest" style={{ fontFamily: 'var(--font-barlow)' }}>{item.sub}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};
