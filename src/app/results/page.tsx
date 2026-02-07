'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Award, Eye, Download, Share2, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';


const WINNERS = [
    {
        rank: 1,
        title: "The Silent Geometry",
        author: "Marco Rossi (Italy)",
        url: "https://images.unsplash.com/photo-1502657877623-f66bf489d236",
        category: "Architecture",
        score: "9.8"
    },
    {
        rank: 2,
        title: "Chaotic Harmony",
        author: "Elena Petrova (Russia)",
        url: "https://images.unsplash.com/photo-1541701494587-cb58502866ab",
        category: "Abstract",
        score: "9.6"
    },
    {
        rank: 3,
        title: "Nature's Enigma",
        author: "James Wilson (Canada)",
        url: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b",
        category: "Landscape",
        score: "9.5"
    }
];

const HONORABLE_MENTIONS = [
    { id: 1, url: "https://images.unsplash.com/photo-1518005020251-095c1f00c653", author: "Sarah L." },
    { id: 2, url: "https://images.unsplash.com/photo-1493246507139-91e8bef99c02", author: "David K." },
    { id: 3, url: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05", author: "Anna M." },
    { id: 4, url: "https://images.unsplash.com/photo-1501785888041-af3ef285b470", author: "Robert T." },
    { id: 5, url: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e", author: "Lisa V." },
    { id: 6, url: "https://images.unsplash.com/photo-1472214103451-9374bd1c798e", author: "Chris P." },
];

export default function ResultsPage() {
    return (
        <main className="min-h-screen bg-[#050505] text-white">
            <Navbar />

            <div className="pt-32 px-8 pb-24 max-w-7xl mx-auto">
                <div className="text-center mb-20">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-block px-4 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 text-xs font-bold uppercase tracking-widest mb-6"
                    >
                        Official Proclamation
                    </motion.div>
                    <h1 className="text-6xl font-black italic mb-6">Winners 2026</h1>
                    <p className="text-gray-400 max-w-2xl mx-auto">
                        Celebrating the most exceptional entries that captured the essence of "Enigma in Chaos".
                        The jury reviewed over 4,000 submissions from 52 countries.
                    </p>
                </div>

                {/* Podium */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-32 items-end">
                    {/* 2nd Place */}
                    <WinnerCard winner={WINNERS[1]} height="h-[450px]" delay={0.2} />

                    {/* 1st Place */}
                    <WinnerCard winner={WINNERS[0]} height="h-[550px]" delay={0} featured />

                    {/* 3rd Place */}
                    <WinnerCard winner={WINNERS[2]} height="h-[400px]" delay={0.4} />
                </div>

                {/* Honorable Mentions */}
                <div>
                    <div className="flex justify-between items-end mb-12">
                        <div>
                            <h2 className="text-3xl font-bold italic">Honorable Mentions</h2>
                            <p className="text-gray-500 mt-2">Exceptional works that resonated with our judges</p>
                        </div>
                        <button className="text-purple-400 font-bold flex items-center gap-2 hover:underline">
                            View All Finalists <Share2 className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        {HONORABLE_MENTIONS.map((item, idx) => (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="group relative aspect-square rounded-2xl overflow-hidden glass border border-white/5"
                            >
                                <img src={item.url} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" alt="" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-end">
                                    <p className="text-[10px] font-bold text-white/50 mb-1">BY</p>
                                    <p className="text-sm font-bold truncate">{item.author}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </main>
    );
}

const WinnerCard = ({ winner, height, delay, featured = false }: any) => (
    <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ delay, duration: 0.8 }}
        className="flex flex-col"
    >
        <div className="flex items-center gap-3 mb-4 px-2">
            <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center font-black italic",
                winner.rank === 1 ? "bg-yellow-500 text-black text-xl" :
                    winner.rank === 2 ? "bg-gray-400 text-black" : "bg-orange-700 text-white"
            )}>
                {winner.rank}
            </div>
            <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">{winner.rank === 1 ? 'Winner' : 'Finalist'}</p>
                <div className="flex items-center gap-2">
                    <Award className={cn("w-4 h-4", winner.rank === 1 ? "text-yellow-500" : "text-gray-400")} />
                    <span className="text-sm font-bold text-white">{winner.score} Jury Score</span>
                </div>
            </div>
        </div>

        <div className={cn(
            "relative group rounded-[2.5rem] overflow-hidden border transition-all duration-700",
            featured ? "border-yellow-500/30 shadow-[0_0_50px_rgba(234,179,8,0.2)]" : "border-white/10 hover:border-white/20",
            height
        )}>
            <img src={winner.url} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" alt={winner.title} />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-90 group-hover:opacity-100 transition-opacity p-8 flex flex-col justify-end">
                <span className="text-xs font-bold text-yellow-500 mb-2">{winner.category}</span>
                <h3 className="text-3xl font-black italic mb-1">{winner.title}</h3>
                <p className="text-gray-400 font-medium mb-6">by {winner.author}</p>

                <div className="flex gap-3">
                    <button className="flex-1 py-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 hover:bg-white/20 transition-all flex items-center justify-center gap-2 text-sm font-bold">
                        <Eye className="w-4 h-4" /> View Details
                    </button>
                    <button className="p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all">
                        <Heart className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    </motion.div>
);
