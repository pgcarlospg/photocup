'use client';

import React, { useEffect, useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { User, Image as ImageIcon, Clock, Plus, Trash2, AlertCircle, Camera } from 'lucide-react';
import { useRouteGuard } from '@/components/RouteGuard';
import { useAuth } from '@/lib/auth';
import { apiGetMyPhotos, apiDeleteMyPhoto, photoUrl, MyPhoto } from '@/lib/api';
import Link from 'next/link';

const font = { fontFamily: 'var(--font-barlow)' };
const fontDisplay = { fontFamily: 'var(--font-oswald)' };
const fontBody = { fontFamily: 'var(--font-garamond)' };

const MAX_PHOTOS = 3;

export default function UserDashboard() {
    const authorized = useRouteGuard();
    const { user } = useAuth();

    const [photos, setPhotos] = useState<MyPhoto[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [deleting, setDeleting] = useState<number | null>(null);

    useEffect(() => {
        if (!authorized) return;
        apiGetMyPhotos()
            .then(setPhotos)
            .catch(e => setError(e.message))
            .finally(() => setLoading(false));
    }, [authorized]);

    if (!authorized) return null;

    const handleDelete = async (id: number) => {
        if (!confirm('Delete this photo permanently?')) return;
        setDeleting(id);
        try {
            await apiDeleteMyPhoto(id);
            setPhotos(prev => prev.filter(p => p.id !== id));
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Delete failed');
        } finally {
            setDeleting(null);
        }
    };

    const canSubmitMore = photos.length < MAX_PHOTOS;

    return (
        <main className="min-h-screen bg-[#080300]" style={{ color: '#F5E0C0' }}>
            <Navbar />
            <div className="pt-24 px-6 lg:px-12 pb-16 max-w-7xl mx-auto">

                <div className="flex items-center gap-3 mb-10 pt-4">
                    <div className="h-px w-8 bg-[#F5A623]" />
                    <span className="text-[#F5A623] text-xs font-bold uppercase tracking-[0.3em]" style={font}>My Entry Hub · PhotoCup 2026</span>
                </div>

                <div className="flex flex-col md:flex-row gap-6 mb-10">
                    {/* Profile sidebar */}
                    <div className="w-full md:w-64 flex-shrink-0 space-y-4">
                        <div className="glass border border-[#C8860A]/15 p-7 text-center relative overflow-hidden"
                             style={{ clipPath: 'polygon(0 0, 100% 0, 100% 94%, 94% 100%, 0 100%)' }}>
                            <div className="absolute top-0 left-0 w-full h-0.5 grad-premium" />
                            <div className="w-20 h-20 mx-auto mb-5 border-2 border-[#C8860A]/30 flex items-center justify-center"
                                 style={{ background: 'linear-gradient(135deg, #C8860A22, #F5A62310)' }}>
                                <User className="w-10 h-10 text-[#F5A623]" />
                            </div>
                            <h2 className="text-xl font-bold text-white" style={fontDisplay}>{user?.full_name ?? '—'}</h2>
                            <p className="text-[#5A4020] text-sm mt-1" style={fontBody}>{user?.email}</p>
                            {user?.country && (
                                <p className="text-[#7A6040] text-xs mt-1 uppercase tracking-wider" style={font}>{user.country}</p>
                            )}
                            <div className="mt-5 pt-5 border-t border-[#C8860A]/10 flex gap-4 justify-center">
                                <div>
                                    <div className="text-2xl font-bold text-[#F5A623]" style={fontDisplay}>{photos.length}</div>
                                    <div className="text-[10px] text-[#5A4020] uppercase tracking-widest" style={font}>submitted</div>
                                </div>
                                <div className="w-px bg-[#C8860A]/15" />
                                <div>
                                    <div className="text-2xl font-bold text-[#C8A070]" style={fontDisplay}>{MAX_PHOTOS - photos.length}</div>
                                    <div className="text-[10px] text-[#5A4020] uppercase tracking-widest" style={font}>remaining</div>
                                </div>
                            </div>
                        </div>

                        {canSubmitMore ? (
                            <Link href="/submit">
                                <div className="glass border border-dashed border-[#C8860A]/20 p-5 text-center hover:border-[#F5A623]/40 transition-all cursor-pointer group">
                                    <Plus className="w-6 h-6 text-[#5A4020] group-hover:text-[#F5A623] mx-auto mb-2 transition-colors" />
                                    <p className="text-xs font-bold uppercase tracking-widest text-[#5A4020] group-hover:text-[#C8A070] transition-colors" style={font}>Submit New Photo</p>
                                </div>
                            </Link>
                        ) : (
                            <div className="glass border border-[#C8860A]/10 p-5 text-center opacity-60">
                                <Camera className="w-6 h-6 text-[#3A2A10] mx-auto mb-2" />
                                <p className="text-xs font-bold uppercase tracking-widest text-[#3A2A10]" style={font}>Max {MAX_PHOTOS} photos reached</p>
                            </div>
                        )}

                        <Link href="/rules">
                            <div className="glass border border-[#C8860A]/10 p-4 text-center hover:border-[#C8860A]/25 transition-all cursor-pointer group">
                                <p className="text-xs font-bold uppercase tracking-widest text-[#5A4020] group-hover:text-[#C8A070] transition-colors" style={font}>View Rules &amp; T&amp;C</p>
                            </div>
                        </Link>
                    </div>

                    {/* Main content */}
                    <div className="flex-1 space-y-6">
                        <div>
                            <h1 className="text-4xl font-bold text-white" style={fontDisplay}>My Submissions</h1>
                            <p className="text-[#7A6040] text-sm mt-1" style={fontBody}>Your photos entered in PhotoCup 2026. Maximum {MAX_PHOTOS} entries per participant.</p>
                        </div>

                        {error && (
                            <div className="flex items-center gap-3 text-red-400 border border-red-800/30 bg-red-900/10 px-4 py-3">
                                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                <p className="text-xs" style={font}>{error}</p>
                            </div>
                        )}

                        {loading ? (
                            <p className="text-[#5A4020] text-sm" style={font}>Loading your photos…</p>
                        ) : photos.length === 0 ? (
                            <div className="border border-dashed border-[#C8860A]/15 flex flex-col items-center justify-center p-20 text-center"
                                 style={{ clipPath: 'polygon(0 0, 100% 0, 100% 94%, 94% 100%, 0 100%)' }}>
                                <ImageIcon className="w-10 h-10 text-[#3A2A10] mb-4" />
                                <h4 className="font-bold text-[#5A4020] mb-2" style={fontDisplay}>No photos yet</h4>
                                <p className="text-xs text-[#3A2A10] mb-6" style={font}>Submit your first entry to participate in PhotoCup 2026</p>
                                <Link href="/submit">
                                    <span className="px-6 py-2.5 grad-premium text-[#080300] text-xs font-bold uppercase tracking-widest glow-gold hover:opacity-90 transition-all cursor-pointer" style={font}>
                                        Submit Now
                                    </span>
                                </Link>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                                {photos.map(photo => {
                                    const imgSrc = photoUrl(photo.file_path);
                                    return (
                                        <div key={photo.id} className="glass border border-[#C8860A]/12 overflow-hidden group"
                                             style={{ clipPath: 'polygon(0 0, 100% 0, 100% 94%, 94% 100%, 0 100%)' }}>
                                            <div className="relative h-44 bg-[#120700]">
                                                {imgSrc ? (
                                                    <img src={imgSrc} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt={photo.title ?? ''} />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-[#3A2A10]">
                                                        <ImageIcon className="w-12 h-12" />
                                                    </div>
                                                )}
                                                <div className="absolute inset-0 bg-gradient-to-t from-[#080300]/60 to-transparent" />
                                                <div className="absolute top-3 right-3">
                                                    <span className="px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider bg-[#F5A623]/80 text-[#080300]" style={font}>
                                                        {photo.category ?? 'General'}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="p-5 flex justify-between items-center">
                                                <div>
                                                    <h4 className="font-bold text-white" style={fontDisplay}>{photo.title ?? 'Untitled'}</h4>
                                                    <p className="text-[10px] text-[#5A4020] uppercase tracking-[0.15em] mt-1" style={font}>
                                                        {photo.category ?? 'General'} · {photo.created_at ? new Date(photo.created_at).toLocaleDateString() : '—'}
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={() => handleDelete(photo.id)}
                                                    disabled={deleting === photo.id}
                                                    className="p-2.5 border border-red-800/20 text-red-500/40 hover:text-red-400 hover:border-red-800/40 transition-all disabled:opacity-30"
                                                    title="Delete photo"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* Info block */}
                        <div className="glass border border-[#C8860A]/12 p-7 relative overflow-hidden"
                             style={{ clipPath: 'polygon(0 0, 100% 0, 100% 96%, 97% 100%, 0 100%)' }}>
                            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2" style={fontDisplay}>
                                <Clock className="w-4 h-4 text-[#F5A623]" /> Competition Timeline
                            </h3>
                            <p className="text-sm text-[#7A6040] leading-relaxed" style={fontBody}>
                                Submission deadline: <strong className="text-[#F5A623]">31 August 2026</strong>. Judging begins September 2026. Results published at the Mensa International Annual Gathering 2027.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
