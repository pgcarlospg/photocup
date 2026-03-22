'use client';

import React, { useEffect, useState } from 'react';
import { Navbar } from '@/components/Navbar';
import {
    Users, Image as ImageIcon, Globe, Search, Trash2,
    AlertCircle, Upload, X, CheckCircle2, Plus
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouteGuard } from '@/components/RouteGuard';
import { useAuth } from '@/lib/auth';
import {
    apiGetCoordinatorPhotos, apiGetCoordinatorStats, apiGetCoordinatorParticipants,
    apiCoordinatorUpload, apiCoordinatorDeletePhoto,
    CoordinatorPhoto, CoordinatorStats, CoordinatorParticipant
} from '@/lib/api';

const font = { fontFamily: 'var(--font-barlow)' };
const fontD = { fontFamily: 'var(--font-oswald)' };
const CATEGORIES = ['Nature', 'Portrait', 'Street', 'Architecture', 'Abstract', 'Wildlife', 'Travel', 'Other'];

export default function NMDashboard() {
    const authorized = useRouteGuard();
    const { user } = useAuth();

    const [photos, setPhotos] = useState<CoordinatorPhoto[]>([]);
    const [stats, setStats] = useState<CoordinatorStats | null>(null);
    const [participants, setParticipants] = useState<CoordinatorParticipant[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [deleting, setDeleting] = useState<number | null>(null);

    // Upload on behalf modal
    const [showUpload, setShowUpload] = useState(false);
    const [upFile, setUpFile] = useState<File | null>(null);
    const [upTitle, setUpTitle] = useState('');
    const [upDesc, setUpDesc] = useState('');
    const [upCat, setUpCat] = useState('Nature');
    const [upEmail, setUpEmail] = useState('');
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState('');
    const [uploadOk, setUploadOk] = useState(false);

    useEffect(() => {
        if (!authorized) return;
        Promise.all([
            apiGetCoordinatorPhotos(),
            apiGetCoordinatorStats(),
            apiGetCoordinatorParticipants(),
        ])
            .then(([p, s, part]) => {
                setPhotos(p.photos);
                setStats(s);
                setParticipants(part.participants);
            })
            .catch(e => setError(e.message))
            .finally(() => setLoading(false));
    }, [authorized]);

    if (!authorized) return null;

    const filtered = photos.filter(p =>
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.author.toLowerCase().includes(search.toLowerCase())
    );

    const handleDelete = async (id: number) => {
        if (!confirm('Delete this photo from your country?')) return;
        setDeleting(id);
        try {
            await apiCoordinatorDeletePhoto(id);
            setPhotos(prev => prev.filter(p => p.id !== id));
            if (stats) setStats({ ...stats, total_photos: stats.total_photos - 1 });
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Delete failed');
        } finally { setDeleting(null); }
    };

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!upFile || !upTitle || !upEmail) return;
        setUploading(true); setUploadError('');
        try {
            await apiCoordinatorUpload(upFile, upTitle, upDesc, upCat, upEmail);
            setUploadOk(true);
            setUpFile(null); setUpTitle(''); setUpDesc(''); setUpCat('Nature'); setUpEmail('');
            // Refresh photos
            const refresh = await apiGetCoordinatorPhotos();
            setPhotos(refresh.photos);
            setTimeout(() => { setUploadOk(false); setShowUpload(false); }, 2000);
        } catch (err: unknown) {
            setUploadError(err instanceof Error ? err.message : 'Upload failed');
        } finally { setUploading(false); }
    };

    return (
        <>
            <main className="min-h-screen bg-[#080300]" style={{ color: '#F5E0C0' }}>
                <Navbar />
                <div className="pt-24 px-4 md:px-8 pb-16">

                    {/* Header */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <Globe className="w-4 h-4 text-[#F5A623]" />
                                <span className="text-[#7A6040] font-bold uppercase tracking-[0.2em] text-xs" style={font}>National Coordinator Panel</span>
                            </div>
                            <h1 className="text-4xl font-bold" style={fontD}>{stats?.country ?? user?.country ?? '—'} Dashboard</h1>
                            <p className="text-[#7A6040] text-sm mt-1" style={font}>{user?.email}</p>
                        </div>
                        <button
                            onClick={() => setShowUpload(true)}
                            className="flex items-center gap-2 px-6 py-3 grad-premium text-[#080300] font-bold text-sm glow-gold"
                            style={{ ...font, clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 100%, 8px 100%)' }}
                        >
                            <Plus className="w-4 h-4" /> Upload for Participant
                        </button>
                    </div>

                    {error && (
                        <div className="flex items-center gap-3 text-red-400 border border-red-800/30 bg-red-900/10 px-4 py-3 mb-8">
                            <AlertCircle className="w-4 h-4 flex-shrink-0" />
                            <p className="text-xs" style={font}>{error}</p>
                        </div>
                    )}

                    {/* Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                        {[
                            { label: 'Photos', value: stats?.total_photos ?? '—', icon: <ImageIcon className="w-5 h-5" />, color: 'text-[#F5A623]' },
                            { label: 'Participants', value: stats?.total_participants ?? '—', icon: <Users className="w-5 h-5" />, color: 'text-emerald-400' },
                            { label: 'Categories', value: stats?.category_data.length ?? '—', icon: <Globe className="w-5 h-5" />, color: 'text-sky-400' },
                            { label: 'Top Score', value: stats?.leaderboard[0]?.score.toFixed(1) ?? '—', icon: <CheckCircle2 className="w-5 h-5" />, color: 'text-amber-400' },
                        ].map(s => (
                            <div key={s.label} className="glass border border-[#C8860A]/12 p-5">
                                <div className={cn('mb-3', s.color)}>{s.icon}</div>
                                <div className="text-3xl font-bold" style={fontD}>{s.value}</div>
                                <div className="text-[10px] text-[#7A6040] uppercase tracking-wider mt-0.5" style={font}>{s.label}</div>
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Photos Table */}
                        <div className="lg:col-span-2 glass border border-[#C8860A]/12 overflow-hidden">
                            <div className="p-6 border-b border-[#C8860A]/10 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                                <h2 className="text-xl font-bold" style={fontD}>Country Photos ({photos.length})</h2>
                                <div className="relative w-full sm:w-64">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5A4020]" />
                                    <input
                                        type="text" placeholder="Search photo or author…"
                                        value={search} onChange={e => setSearch(e.target.value)}
                                        className="w-full bg-[#120700] border border-[#C8860A]/20 pl-10 pr-4 py-2 text-sm text-[#F5E0C0] placeholder-[#3A2A10] focus:outline-none focus:border-[#F5A623]/50 transition-all"
                                        style={font}
                                    />
                                </div>
                            </div>
                            {loading ? (
                                <div className="p-12 text-center text-[#5A4020]" style={font}>Loading country data…</div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="text-left text-[#5A4020] text-[10px] font-black uppercase tracking-[0.2em] border-b border-[#C8860A]/10" style={font}>
                                                <th className="px-5 py-3">Title</th>
                                                <th className="px-5 py-3">Author</th>
                                                <th className="px-5 py-3">Category</th>
                                                <th className="px-5 py-3">Score</th>
                                                <th className="px-5 py-3 text-right">Del</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filtered.map(p => (
                                                <tr key={p.id} className="border-b border-[#C8860A]/06 hover:bg-[#C8860A]/03 transition-colors last:border-0">
                                                    <td className="px-5 py-4">
                                                        <p className="font-bold text-[#F5E0C0] text-sm" style={font}>{p.title}</p>
                                                        <p className="text-[10px] text-[#5A4020]">ID #{p.id}</p>
                                                    </td>
                                                    <td className="px-5 py-4 text-sm text-[#9A7850]" style={font}>{p.author}</td>
                                                    <td className="px-5 py-4 text-xs text-[#7A6040] uppercase tracking-wide" style={font}>{p.category}</td>
                                                    <td className="px-5 py-4 font-mono text-[#F5A623] text-sm">{p.avg_score > 0 ? p.avg_score.toFixed(1) : '—'}</td>
                                                    <td className="px-5 py-4 text-right">
                                                        <button onClick={() => handleDelete(p.id)} disabled={deleting === p.id} className="p-2 text-[#5A4020] hover:text-red-400 transition-colors disabled:opacity-30">
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                            {filtered.length === 0 && (
                                                <tr><td colSpan={5} className="px-5 py-12 text-center text-[#5A4020] text-sm" style={font}>No photos found.</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                        {/* Participants sidebar */}
                        <div className="space-y-6">
                            <div className="glass border border-[#C8860A]/12 overflow-hidden">
                                <div className="p-6 border-b border-[#C8860A]/10">
                                    <h2 className="text-xl font-bold" style={fontD}>Participants ({participants.length})</h2>
                                </div>
                                <div className="divide-y divide-[#C8860A]/08">
                                    {participants.length === 0 && !loading && (
                                        <p className="px-6 py-8 text-center text-[#5A4020] text-sm" style={font}>No participants yet.</p>
                                    )}
                                    {participants.slice(0, 8).map(p => (
                                        <div key={p.id} className="px-6 py-4 flex justify-between items-center">
                                            <div>
                                                <p className="font-bold text-[#F5E0C0] text-sm" style={font}>{p.full_name}</p>
                                                <p className="text-[10px] text-[#5A4020] mt-0.5">{p.email}</p>
                                            </div>
                                            <span className="text-xs font-bold text-[#F5A623] bg-[#F5A623]/10 px-2 py-0.5" style={font}>
                                                {p.photo_count} photos
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Top 5 leaderboard for this country */}
                            {stats && stats.leaderboard.length > 0 && (
                                <div className="glass border border-[#C8860A]/12 p-6">
                                    <h2 className="text-xl font-bold mb-4" style={fontD}>Country Top 5</h2>
                                    <div className="space-y-3">
                                        {stats.leaderboard.map((item, i) => (
                                            <div key={item.id} className="flex items-center gap-3">
                                                <span className="text-[#F5A623] font-bold font-mono w-4" style={fontD}>{i + 1}</span>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-bold text-[#F5E0C0] truncate" style={font}>{item.title}</p>
                                                    <p className="text-[10px] text-[#5A4020]">{item.author}</p>
                                                </div>
                                                <span className="font-mono text-sm text-[#F5A623]">{item.score.toFixed(1)}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            {/* Upload on behalf modal */}
            <AnimatePresence>
                {showUpload && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70"
                        onClick={() => setShowUpload(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                            className="glass border border-[#C8860A]/20 w-full max-w-lg p-8 relative overflow-y-auto max-h-[90vh]"
                            style={{ clipPath: 'polygon(0 0, 100% 0, 100% 97%, 97% 100%, 0 100%)' }}
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="absolute top-0 left-0 w-full h-0.5 grad-premium" />
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold" style={fontD}>Upload for Participant</h2>
                                <button onClick={() => setShowUpload(false)} className="text-[#5A4020] hover:text-[#F5A623] transition-colors"><X className="w-5 h-5" /></button>
                            </div>

                            {uploadOk ? (
                                <div className="flex flex-col items-center gap-4 py-8 text-emerald-400">
                                    <CheckCircle2 className="w-12 h-12" />
                                    <p className="font-bold" style={font}>Uploaded successfully!</p>
                                </div>
                            ) : (
                                <form onSubmit={handleUpload} className="space-y-4">
                                    {[
                                        { key: 'upEmail', label: 'Participant Email *', type: 'email', value: upEmail, set: setUpEmail, required: true },
                                        { key: 'upTitle', label: 'Photo Title *', type: 'text', value: upTitle, set: setUpTitle, required: true },
                                        { key: 'upDesc', label: 'Description', type: 'text', value: upDesc, set: setUpDesc, required: false },
                                    ].map(f => (
                                        <div key={f.key}>
                                            <label className="text-xs font-bold text-[#C8A070] uppercase tracking-[0.15em] mb-1 block" style={font}>{f.label}</label>
                                            <input
                                                type={f.type} required={f.required} value={f.value}
                                                onChange={e => f.set(e.target.value)}
                                                className="w-full bg-[#120700] border border-[#C8860A]/20 px-4 py-3 text-[#F5E0C0] placeholder-[#3A2A10] focus:outline-none focus:border-[#F5A623]/50 transition-all text-sm"
                                                style={font}
                                            />
                                        </div>
                                    ))}

                                    <div>
                                        <label className="text-xs font-bold text-[#C8A070] uppercase tracking-[0.15em] mb-1 block" style={font}>Category</label>
                                        <select value={upCat} onChange={e => setUpCat(e.target.value)}
                                            className="w-full bg-[#120700] border border-[#C8860A]/20 px-4 py-3 text-[#F5E0C0] focus:outline-none focus:border-[#F5A623]/50 transition-all text-sm"
                                            style={font}>
                                            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="text-xs font-bold text-[#C8A070] uppercase tracking-[0.15em] mb-1 block" style={font}>Photo File *</label>
                                        <input
                                            type="file" accept="image/*" required
                                            onChange={e => setUpFile(e.target.files?.[0] ?? null)}
                                            className="w-full bg-[#120700] border border-[#C8860A]/20 px-4 py-3 text-[#F5E0C0] text-sm file:mr-4 file:py-1 file:px-3 file:border-0 file:bg-[#C8860A]/20 file:text-[#F5A623] file:text-xs"
                                            style={font}
                                        />
                                    </div>

                                    {uploadError && <p className="text-red-400 text-xs border border-red-800/30 bg-red-900/10 px-3 py-2" style={font}>{uploadError}</p>}

                                    <div className="flex gap-3 pt-2">
                                        <button type="button" onClick={() => setShowUpload(false)}
                                            className="flex-1 py-3 border border-[#C8860A]/20 text-[#C8A070] hover:text-[#F5A623] transition-all text-sm font-bold" style={font}>
                                            Cancel
                                        </button>
                                        <button type="submit" disabled={uploading}
                                            className="flex-1 py-3 grad-premium text-[#080300] font-bold text-sm disabled:opacity-60 flex items-center justify-center gap-2" style={font}>
                                            <Upload className="w-4 h-4" />
                                            {uploading ? 'Uploading…' : 'Upload'}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
