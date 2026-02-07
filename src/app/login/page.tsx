'use client';

import React from 'react';
import { Navbar } from '@/components/Navbar';
import { Shield, Lock, User, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LoginPage() {
    return (
        <main className="min-h-screen bg-[#050505] text-white flex flex-col">
            <Navbar />
            
            <div className="flex-1 flex items-center justify-center p-4 pt-20">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full max-w-md"
                >
                    <div className="glass p-8 rounded-[2rem] border border-white/10 shadow-2xl relative overflow-hidden">
                        {/* Decorative background element */}
                        <div className="absolute -top-24 -right-24 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl"></div>
                        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl"></div>

                        <div className="relative z-10">
                            <div className="flex justify-center mb-8">
                                <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                                    <Shield className="w-10 h-10 text-purple-400" />
                                </div>
                            </div>

                            <div className="text-center mb-10">
                                <h1 className="text-3xl font-bold mb-2">Mensa Sign In</h1>
                                <p className="text-gray-400 text-sm">Access the PhotoCup 2026 platform using your official Mensa credentials.</p>
                            </div>

                            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-300 ml-1">Mensa ID / Email</label>
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                        <input 
                                            type="text" 
                                            placeholder="e.g. ES-12345"
                                            className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 focus:outline-none focus:border-purple-500/50 transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between items-center ml-1">
                                        <label className="text-sm font-medium text-gray-300">Password</label>
                                        <a href="#" className="text-xs text-purple-400 hover:text-purple-300">Forgot?</a>
                                    </div>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                        <input 
                                            type="password" 
                                            placeholder="••••••••"
                                            className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 focus:outline-none focus:border-purple-500/50 transition-all"
                                        />
                                    </div>
                                </div>

                                <button className="w-full py-4 rounded-xl grad-premium font-bold text-white flex items-center justify-center gap-2 hover:shadow-[0_0_30px_rgba(168,85,247,0.4)] transition-all group">
                                    Continue to Platform
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </button>
                            </form>

                            <div className="mt-8 text-center">
                                <p className="text-gray-500 text-xs">
                                    Secure Authentication by Mensa International IT Services.
                                    <br />
                                    By signing in you agree to our Security Policy.
                                </p>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </main>
    );
}
