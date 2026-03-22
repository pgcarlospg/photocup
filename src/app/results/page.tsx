'use client';

import React from 'react';
import { Navbar } from '@/components/Navbar';
import { Award, Eye, Share2, Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const font = { fontFamily: 'var(--font-barlow)' };
const fontDisplay = { fontFamily: 'var(--font-oswald)' };
const fontBody = { fontFamily: 'var(--font-garamond)' };

const WINNERS = [
    {
        rank: 1,
        title: "Which door should I enter?",
        author: "Rónási Márton (Hungary)",
        url: "/winners2025/1.webp",
        category: "Architecture",
        score: "9.8"
    },
    {
        rank: 2,
        title: "What Lies Beneath",
        author: "Zuzana Korinková (Czech Republic)",
        url: "/winners2025/2.webp",
        category: "Abstract",
        score: "9.6"
    },
    {
        rank: 3,
        title: "Enigma Fading into Chaos",
        author: "Verbó Katalin Virág (Hungary)",
        url: "/winners2025/3.webp",
        category: "Landscape",
        score: "9.5"
    }
];

const HONORABLE_MENTIONS = [
    { id: 1, url: "/winners2025/4.webp", author: "Sarah L." },
    { id: 2, url: "/winners2025/5.webp", author: "David K." },
    { id: 3, url: "/winners2025/6.webp", author: "Anna M." },
    { id: 4, url: "/winners2025/7.webp", author: "Robert T." },
    { id: 5, url: "/winners2025/8.webp", author: "Lisa V." },
    { id: 6, url: "/winners2025/9.webp", author: "Chris P." },
];

export default function ResultsPage() {
    return (
        <main className="min-h-screen bg-[#080300]" style={{ color: '#F5E0C0' }}>
            <Navbar />

            <div className="pt-32 px-6 lg:px-12 pb-24 max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-20">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                        className="flex items-center gap-3 mb-5"
                    >
                        <div className="h-px w-8 bg-[#F5A623]" />
                        <span className="inline-block px-3 py-1 border border-[#C8860A]/30 text-[#F5A623] text-xs font-bold uppercase tracking-[0.25em]"
                              style={{ ...font, background: 'rgba(200,134,10,0.06)' }}>
                            Official Proclamation
                        </span>
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="text-6xl font-bold text-white mb-5"
                        style={fontDisplay}
                    >
                        Winners 2025
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="text-[#9A7850] max-w-xl text-lg leading-relaxed"
                        style={fontBody}
                    >
                        Last year&rsquo;s winners. Celebrating the exceptional entries that defined our previous edition.
                        The jury reviewed hundreds of submissions from +40 countries.
                    </motion.p>
                </div>

                {/* Podium — offset heights for asymmetry */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-28 items-end">
                    <WinnerCard winner={WINNERS[1]} height="h-[440px]" delay={0.2} />
                    <WinnerCard winner={WINNERS[0]} height="h-[560px]" delay={0} featured />
                    <WinnerCard winner={WINNERS[2]} height="h-[390px]" delay={0.35} />
                </div>

                {/* Honorable Mentions */}
                <div>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-10 gap-4">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="h-px w-8 bg-[#F5A623]" />
                                <span className="text-[#F5A623] font-bold uppercase tracking-[0.25em] text-xs" style={font}>
                                    Recognition
                                </span>
                            </div>
                            <h2 className="text-3xl font-bold text-white" style={fontDisplay}>Honorable Mentions</h2>
                            <p className="text-[#7A6040] mt-1 text-sm" style={fontBody}>Exceptional works that resonated with our judges</p>
                        </div>
                        <button className="text-[#F5A623] font-bold flex items-center gap-2 hover:text-white transition-colors text-sm uppercase tracking-widest" style={font}>
                            View All Finalists <Share2 className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                        {HONORABLE_MENTIONS.map((item, idx) => (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, y: 16 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.08 }}
                                className="group relative aspect-square overflow-hidden glass border border-[#C8860A]/10"
                            >
                                <img src={item.url}
                                     className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                                     alt={item.author} />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#080300]/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-3 flex flex-col justify-end">
                                    <p className="text-[9px] font-bold text-[#F5A623] mb-0.5 uppercase tracking-wider" style={font}>by</p>
                                    <p className="text-xs font-bold text-white truncate" style={fontDisplay}>{item.author}</p>
                                </div>
                                {/* Gold corner accent on hover */}
                                <div className="absolute top-0 left-0 w-0 h-0.5 bg-[#F5A623] group-hover:w-full transition-all duration-500" />
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
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ delay, duration: 0.7 }}
        className="flex flex-col"
    >
        {/* Rank badge row */}
        <div className="flex items-center gap-3 mb-4 px-1">
            <div className={cn(
                "w-9 h-9 flex items-center justify-center font-bold text-sm",
                winner.rank === 1
                    ? "bg-[#F5A623] text-[#080300]"
                    : winner.rank === 2
                        ? "bg-[#C0C0C0] text-[#080300]"
                        : "bg-[#8B5520] text-white"
            )} style={{ ...fontDisplay, clipPath: 'polygon(0 0, 85% 0, 100% 15%, 100% 100%, 15% 100%, 0 85%)' }}>
                {winner.rank}
            </div>
            <div>
                <p className="text-[9px] font-bold text-[#5A4020] uppercase tracking-[0.2em]" style={font}>
                    {winner.rank === 1 ? 'Grand Winner' : 'Finalist'}
                </p>
                <div className="flex items-center gap-1.5">
                    <Award className={cn("w-3.5 h-3.5", winner.rank === 1 ? "text-[#F5A623]" : "text-[#7A6040]")} />
                    <span className="text-sm font-bold text-white" style={fontDisplay}>{winner.score} Jury Score</span>
                </div>
            </div>
        </div>

        {/* Image card */}
        <div className={cn(
            "relative group overflow-hidden border transition-all duration-700",
            featured
                ? "border-[#C8860A]/40 shadow-[0_0_60px_rgba(200,134,10,0.18)]"
                : "border-[#C8860A]/12 hover:border-[#C8860A]/30",
            height
        )} style={{ clipPath: featured ? 'polygon(0 0, 100% 0, 100% 96%, 96% 100%, 0 100%)' : undefined }}>
            <img src={winner.url}
                 className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                 alt={winner.title} />
            <div className="absolute inset-0 bg-gradient-to-t from-[#080300]/95 via-[#080300]/15 to-transparent p-7 flex flex-col justify-end">
                <span className="text-[10px] font-bold text-[#F5A623] mb-2 uppercase tracking-[0.2em]" style={font}>
                    {winner.category}
                </span>
                <h3 className="text-2xl font-bold text-white mb-1" style={fontDisplay}>{winner.title}</h3>
                <p className="text-[#9A7850] text-sm mb-5" style={fontBody}>by {winner.author}</p>

                <div className="flex gap-2">
                    <button className="flex-1 py-2.5 border border-[#C8860A]/30 text-[#C8A070] hover:text-white hover:border-[#F5A623]/50 transition-all flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest"
                            style={font}>
                        <Eye className="w-3.5 h-3.5" /> View Details
                    </button>
                    <button className="p-2.5 border border-[#C8860A]/20 text-[#5A4020] hover:text-[#F5A623] hover:border-[#F5A623]/30 transition-all">
                        <Heart className="w-4 h-4" />
                    </button>
                </div>
            </div>
            {/* Gold top accent for winner */}
            {featured && <div className="absolute top-0 left-0 w-full h-0.5 grad-premium" />}
        </div>
    </motion.div>
);
