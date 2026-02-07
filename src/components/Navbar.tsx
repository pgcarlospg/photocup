'use client';

import React from 'react';
import Link from 'next/link';
import { Camera, Menu, User } from 'lucide-react';
import { cn } from '@/lib/utils';

export const Navbar = () => {
    return (
        <nav className="fixed top-0 w-full z-50 glass border-b border-white/10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center gap-2">
                        <div className="grad-premium p-1.5 rounded-lg">
                            <Camera className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-xl font-bold tracking-tight text-gradient bg-gradient-to-r from-white to-gray-400">
                            Mensa Photo
                        </span>
                    </div>

                    <div className="hidden lg:block">
                        <div className="flex items-center space-x-6 text-[13px] font-bold uppercase tracking-wider">
                            <Link href="/" className="text-gray-400 hover:text-white transition-all">Home</Link>
                            <Link href="/results" className="text-gray-400 hover:text-white transition-all">Results</Link>
                            <Link href="/rules" className="text-gray-400 hover:text-white transition-all">Rules</Link>
                            <Link href="/contact" className="text-gray-400 hover:text-white transition-all">Contact</Link>

                            <div className="w-px h-4 bg-white/10 mx-2" />

                            <Link href="/dashboard" className="text-purple-400 hover:text-purple-300 transition-all">Entry Hub</Link>
                            <Link href="/judge" className="text-gray-500 hover:text-white transition-all">Judge</Link>
                            <Link href="/nm-dashboard" className="text-gray-500 hover:text-white transition-all">Coord.</Link>
                            <Link href="/admin" className="text-gray-500 hover:text-white transition-all">Sys</Link>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <Link href="/login" className="hidden sm:flex p-2 rounded-full text-gray-400 hover:text-white transition-colors">
                            <User className="w-5 h-5" />
                        </Link>
                        <button className="lg:hidden p-2 rounded-md text-gray-400 hover:text-white transition-colors">
                            <Menu className="w-6 h-6" />
                        </button>
                        <Link
                            href="/submit"
                            className="hidden md:block px-6 py-2 rounded-full grad-premium text-white font-black text-xs uppercase tracking-tighter hover:shadow-[0_0_20px_rgba(168,85,247,0.3)] transition-all"
                        >
                            Enter 2026
                        </Link>
                    </div>
                </div>
            </div>
        </nav>
    );
};
