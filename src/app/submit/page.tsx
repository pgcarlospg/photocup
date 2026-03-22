'use client';

import React, { useState, useRef } from 'react';
import { Navbar } from '@/components/Navbar';
import { Upload, ImageIcon, CheckCircle2, AlertCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiUploadPhoto } from '@/lib/api';
import { useRouteGuard } from '@/components/RouteGuard';

const CATEGORIES = ['Nature', 'Portrait', 'Street', 'Architecture', 'Abstract', 'Wildlife', 'Travel', 'Other'];
const font = { fontFamily: 'var(--font-barlow)' };
const fontD = { fontFamily: 'var(--font-oswald)' };

export default function SubmitPage() {
    const authorized = useRouteGuard();

    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('Nature');
    const [uploading, setUploading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const [dragOver, setDragOver] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    if (!authorized) return null;

    const handleFile = (f: File) => {
        if (!f.type.startsWith('image/')) { setError('Only image files are accepted.'); return; }
        if (f.size > 10 * 1024 * 1024) { setError('File exceeds 10 MB limit.'); return; }
        setError('');
        setFile(f);
        const reader = new FileReader();
        reader.onload = e => setPreview(e.target?.result as string);
        reader.readAsDataURL(f);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault(); setDragOver(false);
        const f = e.dataTransfer.files[0];
        if (f) handleFile(f);
    };

    const clearFile = () => { setFile(null); setPreview(null); setError(''); };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file || !title) return;
        setUploading(true); setError('');
        try {
            await apiUploadPhoto(file, title, description, category);
            setSuccess(true);
            setFile(null); setPreview(null); setTitle(''); setDescription(''); setCategory('Nature');
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Upload failed. Make sure the backend is running.');
        } finally {
            setUploading(false);
        }
    };

    return (
        <main className="min-h-screen bg-[#080300]" style={{ color: '#F5E0C0' }}>
            <Navbar />
            <div className="pt-28 pb-20 max-w-3xl mx-auto px-4">

                {/* Header */}
                <div className="text-center mb-12">
                    <span className="text-[#F5A623] text-xs font-bold uppercase tracking-[0.3em] mb-3 block" style={font}>
                        PhotoCup 2026 · Spark of Evolution
                    </span>
                    <h1 className="text-5xl font-bold mb-3" style={fontD}>Submit Your Entry</h1>
                    <p className="text-[#7A6040] text-sm" style={font}>JPG/PNG · Max 10 MB · Up to 3 photos per participant</p>
                </div>

                {/* Success toast */}
                <AnimatePresence>
                    {success && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                            className="flex items-center gap-3 bg-emerald-900/20 border border-emerald-600/30 px-5 py-4 mb-8"
                        >
                            <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                            <div>
                                <p className="font-bold text-emerald-300 text-sm" style={font}>Photo submitted successfully!</p>
                                <p className="text-emerald-600 text-xs" style={font}>It will be reviewed before entering the judging pool.</p>
                            </div>
                            <button onClick={() => setSuccess(false)} className="ml-auto text-emerald-700 hover:text-emerald-400"><X className="w-4 h-4" /></button>
                        </motion.div>
                    )}
                </AnimatePresence>

                <form onSubmit={handleSubmit} className="space-y-6">

                    {/* Drop zone */}
                    <div
                        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                        onDragLeave={() => setDragOver(false)}
                        onDrop={handleDrop}
                        onClick={() => !file && inputRef.current?.click()}
                        className="relative border-2 border-dashed transition-all cursor-pointer"
                        style={{
                            borderColor: dragOver ? '#F5A623' : file ? '#C8860A' : 'rgba(200,134,10,0.25)',
                            background: dragOver ? 'rgba(245,166,35,0.04)' : 'rgba(200,134,10,0.02)',
                            minHeight: 240,
                        }}
                    >
                        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />

                        {preview ? (
                            <div className="relative">
                                <img src={preview} alt="Preview" className="w-full max-h-80 object-contain" />
                                <button
                                    type="button"
                                    onClick={e => { e.stopPropagation(); clearFile(); }}
                                    className="absolute top-3 right-3 p-2 bg-black/60 hover:bg-black/80 text-white transition-all"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                                <div className="absolute bottom-3 left-3 bg-black/60 px-3 py-1 text-xs text-[#F5E0C0]" style={font}>
                                    {file?.name} · {((file?.size ?? 0) / 1024 / 1024).toFixed(2)} MB
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center gap-4 p-16 text-[#5A4020]">
                                <div className="p-5 border border-[#C8860A]/20" style={{ background: 'rgba(200,134,10,0.04)' }}>
                                    <ImageIcon className="w-10 h-10 text-[#C8860A]/40" />
                                </div>
                                <div className="text-center">
                                    <p className="font-bold text-[#9A7850] text-sm" style={font}>Drop your photo here or click to browse</p>
                                    <p className="text-xs text-[#3A2A10] mt-1" style={font}>JPG, PNG — up to 10 MB</p>
                                </div>
                                <div className="flex items-center gap-2 text-[#C8860A]/60">
                                    <Upload className="w-4 h-4" />
                                    <span className="text-xs font-bold uppercase tracking-widest" style={font}>Choose File</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Fields */}
                    <div>
                        <label className="text-xs font-bold text-[#C8A070] uppercase tracking-[0.15em] mb-1 block" style={font}>Photo Title <span className="text-red-500">*</span></label>
                        <input
                            type="text" required value={title} onChange={e => setTitle(e.target.value)}
                            placeholder="Enter a title for your photo"
                            className="w-full bg-[#120700] border border-[#C8860A]/20 px-4 py-3 text-[#F5E0C0] placeholder-[#3A2A10] focus:outline-none focus:border-[#F5A623]/50 transition-all"
                            style={font}
                        />
                    </div>

                    <div>
                        <label className="text-xs font-bold text-[#C8A070] uppercase tracking-[0.15em] mb-1 block" style={font}>Category</label>
                        <select
                            value={category} onChange={e => setCategory(e.target.value)}
                            className="w-full bg-[#120700] border border-[#C8860A]/20 px-4 py-3 text-[#F5E0C0] focus:outline-none focus:border-[#F5A623]/50 transition-all"
                            style={font}
                        >
                            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>

                    <div>
                        <label className="text-xs font-bold text-[#C8A070] uppercase tracking-[0.15em] mb-1 block" style={font}>Description (optional)</label>
                        <textarea
                            value={description} onChange={e => setDescription(e.target.value)}
                            rows={3} placeholder="Briefly describe your photo, technique, or story behind it…"
                            className="w-full bg-[#120700] border border-[#C8860A]/20 px-4 py-3 text-[#F5E0C0] placeholder-[#3A2A10] focus:outline-none focus:border-[#F5A623]/50 resize-none transition-all"
                            style={font}
                        />
                    </div>

                    {error && (
                        <div className="flex items-center gap-3 text-red-400 border border-red-800/30 bg-red-900/10 px-4 py-3">
                            <AlertCircle className="w-4 h-4 flex-shrink-0" />
                            <p className="text-xs" style={font}>{error}</p>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={!file || !title || uploading}
                        className="w-full py-4 grad-premium text-[#080300] font-bold uppercase tracking-widest text-sm glow-gold hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        style={{ ...font, clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 100%, 10px 100%)' }}
                    >
                        <Upload className="w-4 h-4" />
                        {uploading ? 'Uploading…' : 'Submit Entry'}
                    </button>
                </form>

                {/* Fine print */}
                <div className="mt-14 grid grid-cols-1 md:grid-cols-2 gap-8 text-sm border-t border-[#C8860A]/10 pt-10">
                    <div>
                        <h4 className="font-bold text-[#C8A070] mb-2" style={font}>Copyright & Usage</h4>
                        <p className="text-[#5A4020] leading-relaxed" style={{ fontFamily: 'var(--font-garamond)' }}>By submitting, you confirm the work is your own and grant Mensa a non-exclusive license for event promotion. You retain full copyright.</p>
                    </div>
                    <div>
                        <h4 className="font-bold text-[#C8A070] mb-2" style={font}>Technical Requirements</h4>
                        <p className="text-[#5A4020] leading-relaxed" style={{ fontFamily: 'var(--font-garamond)' }}>EXIF data must be present and unmodified. AI-generated images are strictly prohibited and result in permanent disqualification.</p>
                    </div>
                </div>
            </div>
        </main>
    );
}
