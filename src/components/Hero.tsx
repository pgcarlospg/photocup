'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Camera, Trophy, Users } from 'lucide-react';

export const Hero = () => {
    return (
        <div className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-500/30 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
            <div className="absolute top-0 -right-4 w-72 h-72 bg-blue-500/30 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <span className="inline-block py-1 px-3 rounded-full bg-white/5 border border-white/10 text-sm font-medium text-purple-400 mb-6">
                            Annual Photography Global Events
                        </span>
                        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8">
                            <span className="block">Capture the</span>
                            <span className="block grad-premium text-gradient italic">Enigma in Chaos</span>
                        </h1>
                        <p className="max-w-2xl mx-auto text-lg text-gray-400 mb-10">
                            Join the world's most prestigious photography competition. Whether you're an individual artist (PhotoCup) or part of a national team (PhotoOlimpic), show your vision to the world.
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="flex flex-col sm:flex-row items-center justify-center gap-4"
                    >
                        <button className="w-full sm:w-auto px-8 py-4 rounded-full grad-premium text-white font-bold text-lg hover:shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-all">
                            Submit Your Photo
                        </button>
                        <button className="w-full sm:w-auto px-8 py-4 rounded-full bg-white/5 border border-white/10 text-white font-bold text-lg hover:bg-white/10 transition-all">
                            View Gallery
                        </button>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1, delay: 0.5 }}
                        className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8"
                    >
                        <div className="glass p-6 rounded-2xl">
                            <Camera className="w-8 h-8 text-purple-400 mb-4 mx-auto" />
                            <h3 className="text-xl font-bold mb-2">PhotoCup</h3>
                            <p className="text-gray-400 text-sm">Individual competition for visionary artists.</p>
                        </div>
                        <div className="glass p-6 rounded-2xl border-purple-500/20">
                            <Users className="w-8 h-8 text-blue-400 mb-4 mx-auto" />
                            <h3 className="text-xl font-bold mb-2">PhotoOlimpic</h3>
                            <p className="text-gray-400 text-sm">Represent your country in the team challenge.</p>
                        </div>
                        <div className="glass p-6 rounded-2xl">
                            <Trophy className="w-8 h-8 text-yellow-400 mb-4 mx-auto" />
                            <h3 className="text-xl font-bold mb-2">Best Story</h3>
                            <p className="text-gray-400 text-sm">New award for the narrative behind the lens.</p>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};
