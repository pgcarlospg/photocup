'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Star, ChevronRight, ChevronLeft, Maximize2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';


const MOCK_PHOTOS = [
    { id: '1', url: 'https://images.unsplash.com/photo-1518005020251-095c1f00c653', title: 'Geometric Chaos' },
    { id: '2', url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b', title: 'Mountain Enigma' },
    { id: '3', url: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab', title: 'Abstract Light' },
];

export default function JudgePage() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [scores, setScores] = useState({ creativity: 0, technique: 0, theme: 0, impact: 0 });

    const [isFinished, setIsFinished] = useState(false);

    const currentPhoto = MOCK_PHOTOS[currentIndex];

    const handleScore = (key: keyof typeof scores, val: number) => {
        setScores(prev => ({ ...prev, [key]: val }));
    };

    const next = () => {
        if (currentIndex < MOCK_PHOTOS.length - 1) {
            setCurrentIndex(currentIndex + 1);
            setScores({ creativity: 0, technique: 0, theme: 0, impact: 0 });
        } else {
            setIsFinished(true);
        }
    };

    if (isFinished) {
        return (
            <main className="h-screen bg-[#050505] text-white flex flex-col">
                <Navbar />
                <div className="flex-1 flex items-center justify-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center p-12 glass rounded-[3rem] border border-white/10 max-w-lg"
                    >
                        <div className="w-20 h-20 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center mx-auto mb-8">
                            <Star className="w-10 h-10" fill="currentColor" />
                        </div>
                        <h2 className="text-4xl font-black italic mb-4">Session Complete</h2>
                        <p className="text-gray-400 mb-10">You have evaluated all currently assigned photos. Your scores have been safely transmitted to the global repository.</p>
                        <button
                            onClick={() => window.location.href = '/'}
                            className="px-10 py-4 rounded-xl grad-premium text-white font-bold uppercase tracking-widest hover:shadow-[0_0_30px_rgba(168,85,247,0.4)] transition-all"
                        >
                            Return to Portal
                        </button>
                    </motion.div>
                </div>
            </main>
        );
    }

    return (
        <main className="h-screen bg-[#050505] text-white flex flex-col">
            <Navbar />

            <div className="flex-1 pt-16 flex overflow-hidden">
                {/* Main Photo Area */}
                <div className="flex-1 relative bg-black flex items-center justify-center p-8 group">
                    <AnimatePresence mode="wait">
                        <motion.img
                            key={currentPhoto.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.05 }}
                            transition={{ duration: 0.4 }}
                            src={currentPhoto.url}
                            alt="Judging Preview"
                            className="max-w-full max-h-full object-contain shadow-2xl"
                        />
                    </AnimatePresence>

                    <button className="absolute top-12 right-12 p-3 bg-white/5 hover:bg-white/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                        <Maximize2 className="w-6 h-6" />
                    </button>

                    <div className="absolute bottom-12 left-1/2 -translate-x-1/2 glass px-6 py-2 rounded-full border border-white/10 text-xs font-mono tracking-widest text-gray-400">
                        {currentIndex + 1} / {MOCK_PHOTOS.length} PHOTOS EVALUATED
                    </div>
                </div>

                {/* Judging Panel */}
                <div className="w-96 border-l border-white/10 glass p-8 flex flex-col gap-8">
                    <div>
                        <span className="text-purple-400 text-xs font-bold uppercase tracking-tighter mb-2 block">Blind Judging Session</span>
                        <h2 className="text-2xl font-bold mb-1 italic">ENIGMA in CHAOS</h2>
                        <p className="text-gray-500 text-sm">Participant ID: {currentPhoto.id.repeat(4)}-XXXX</p>
                    </div>

                    <div className="space-y-6">
                        <ScoreSlider label="Creativity" value={scores.creativity} onChange={(v) => handleScore('creativity', v)} />
                        <ScoreSlider label="Technique" value={scores.technique} onChange={(v) => handleScore('technique', v)} />
                        <ScoreSlider label="Theme Fit" value={scores.theme} onChange={(v) => handleScore('theme', v)} />
                        <ScoreSlider label="Emotional Impact" value={scores.impact} onChange={(v) => handleScore('impact', v)} />
                    </div>

                    <div className="mt-auto space-y-4">
                        <button
                            onClick={next}
                            className="w-full py-4 rounded-xl grad-premium text-white font-bold flex items-center justify-center gap-2 hover:shadow-[0_0_25px_rgba(168,85,247,0.4)] transition-all"
                        >
                            {currentIndex === MOCK_PHOTOS.length - 1 ? 'Complete Session' : 'Submit & Next'}
                            <ChevronRight className="w-5 h-5" />
                        </button>

                        <div className="flex gap-2">
                            <button
                                onClick={() => currentIndex > 0 && setCurrentIndex(currentIndex - 1)}
                                className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-sm text-gray-400 transition-all flex items-center justify-center gap-1"
                            >
                                <ChevronLeft className="w-4 h-4" /> Previous
                            </button>
                            <button className="flex-1 py-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-sm text-red-400 transition-all font-medium">
                                Report Issue
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}

const ScoreSlider = ({ label, value, onChange }: { label: string, value: number, onChange: (v: number) => void }) => (
    <div className="space-y-3">
        <div className="flex justify-between items-center text-sm">
            <span className="text-gray-400 font-medium">{label}</span>
            <span className="text-purple-400 font-bold">{value} / 10</span>
        </div>
        <div className="flex gap-1.5">
            {[...Array(10)].map((_, i) => (
                <button
                    key={i}
                    onClick={() => onChange(i + 1)}
                    className={cn(
                        "h-8 flex-1 rounded-sm transition-all",
                        i + 1 <= value ? "bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]" : "bg-white/5 hover:bg-white/10"
                    )}
                />
            ))}
        </div>
    </div>
);
