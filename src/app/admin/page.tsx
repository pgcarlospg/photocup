'use client';

import React, { useEffect, useState } from 'react';
import { Navbar } from '@/components/Navbar';
import {
    Users, Plus, Pencil, Trash2, X, Check,
    Search, Globe, Shield, TrendingUp, Image as ImageIcon, Star,
    BarChart3, AlertTriangle, Target, Award, RefreshCw, CloudDownload
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouteGuard } from '@/components/RouteGuard';
import {
    apiGetUsers, apiCreateUser, apiUpdateUser, apiDeleteUser, apiGetStats,
    apiGetPhotos, apiDeletePhoto, photoUrl, apiGetGovernanceMetrics,
    apiDriveSyncTrigger, apiDriveSyncStatus, apiGenerateThumbs,
    ApiUser, ApiPhoto, UserCreatePayload, UserUpdatePayload, PhotoStats, GovernanceMetrics, DriveSyncStatus
} from '@/lib/api';

const ROLES_LIST = ['ADMIN', 'PARTICIPANT', 'JUDGE', 'NATIONAL_COORDINATOR'] as const;
const font = { fontFamily: 'var(--font-barlow)' };
const fontD = { fontFamily: 'var(--font-oswald)' };

type Tab = 'overview' | 'users' | 'photos' | 'judges' | 'governance';
const TABS: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: 'overview', label: 'Overview', icon: <TrendingUp className="w-4 h-4" /> },
    { key: 'users', label: 'Users', icon: <Users className="w-4 h-4" /> },
    { key: 'photos', label: 'Photos', icon: <ImageIcon className="w-4 h-4" /> },
    { key: 'judges', label: 'Judges', icon: <Star className="w-4 h-4" /> },
    { key: 'governance', label: 'Governance', icon: <BarChart3 className="w-4 h-4" /> },
];

const ROLE_COLOR: Record<string, string> = {
    ADMIN: 'text-red-400 bg-red-400/10',
    JUDGE: 'text-[#F5A623] bg-[#F5A623]/10',
    PARTICIPANT: 'text-emerald-400 bg-emerald-400/10',
    NATIONAL_COORDINATOR: 'text-sky-400 bg-sky-400/10',
};

const emptyForm: UserCreatePayload = { email: '', password: '', full_name: '', role: 'PARTICIPANT', country: '', mensa_number: '' };

export default function AdminDashboard() {
    const authorized = useRouteGuard();

    const [tab, setTab] = useState<Tab>('overview');
    const [users, setUsers] = useState<ApiUser[]>([]);
    const [stats, setStats] = useState<PhotoStats | null>(null);
    const [allPhotos, setAllPhotos] = useState<ApiPhoto[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [photoSearch, setPhotoSearch] = useState('');
    const [deletingPhoto, setDeletingPhoto] = useState<number | null>(null);
    const [gov, setGov] = useState<GovernanceMetrics | null>(null);
    const [govLoading, setGovLoading] = useState(false);
    const [govSection, setGovSection] = useState<'participation' | 'operational' | 'judging' | 'results'>('participation');
    const [govCountry, setGovCountry] = useState<string>('');
    const [govCountries, setGovCountries] = useState<string[]>([]);

    // Drive sync state
    const [syncStatus, setSyncStatus] = useState<DriveSyncStatus | null>(null);
    const [syncing, setSyncing] = useState(false);
    const [syncMsg, setSyncMsg] = useState('');

    // Lightbox state
    const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);

    // Thumbnail generation state
    const [thumbGenerating, setThumbGenerating] = useState(false);
    const [thumbMsg, setThumbMsg] = useState('');

    const handleGenerateThumbs = async () => {
        setThumbGenerating(true); setThumbMsg('');
        try {
            const r = await apiGenerateThumbs();
            setThumbMsg(`Done — ${r.generated} generated, ${r.errors} errors`);
        } catch (e: unknown) {
            setThumbMsg(e instanceof Error ? e.message : 'Error');
        } finally { setThumbGenerating(false); }
    };

    // Modal state
    const [showCreate, setShowCreate] = useState(false);
    const [editUser, setEditUser] = useState<ApiUser | null>(null);
    const [deleteUser, setDeleteUser] = useState<ApiUser | null>(null);
    const [formData, setFormData] = useState<UserCreatePayload>(emptyForm);
    const [saving, setSaving] = useState(false);
    const [formError, setFormError] = useState('');

    useEffect(() => {
        if (!authorized) return;
        Promise.all([apiGetUsers(), apiGetStats(), apiGetPhotos()])
            .then(([u, s, p]) => { setUsers(u); setStats(s); setAllPhotos(p); })
            .catch(e => setError(e.message))
            .finally(() => setLoading(false));
    }, [authorized]);

    const fetchGov = (country?: string) => {
        setGovLoading(true);
        apiGetGovernanceMetrics(country || undefined)
            .then(d => {
                setGov(d);
                if (d.available_countries && d.available_countries.length > 0) setGovCountries(d.available_countries);
            })
            .catch(e => setError(e.message))
            .finally(() => setGovLoading(false));
    };

    useEffect(() => {
        if (tab !== 'governance' || gov || govLoading) return;
        fetchGov();
    }, [tab, gov, govLoading]);

    if (!authorized) return null;

    const filtered = users.filter(u =>
        u.full_name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase()) ||
        u.role.toLowerCase().includes(search.toLowerCase()) ||
        (u.country ?? '').toLowerCase().includes(search.toLowerCase())
    );

    const openCreate = () => { setFormData(emptyForm); setFormError(''); setShowCreate(true); };
    const openEdit = (u: ApiUser) => {
        setFormData({ email: u.email, password: '', full_name: u.full_name, role: u.role, country: u.country ?? '', mensa_number: u.mensa_number ?? '' });
        setFormError('');
        setEditUser(u);
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true); setFormError('');
        try {
            const created = await apiCreateUser(formData);
            setUsers(prev => [created, ...prev]);
            setShowCreate(false);
        } catch (err: unknown) {
            setFormError(err instanceof Error ? err.message : 'Failed to create user');
        } finally { setSaving(false); }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editUser) return;
        setSaving(true); setFormError('');
        const payload: UserUpdatePayload = { ...formData };
        if (!payload.password) delete payload.password;
        try {
            const updated = await apiUpdateUser(editUser.id, payload);
            setUsers(prev => prev.map(u => u.id === updated.id ? updated : u));
            setEditUser(null);
        } catch (err: unknown) {
            setFormError(err instanceof Error ? err.message : 'Failed to update user');
        } finally { setSaving(false); }
    };

    const handleDelete = async () => {
        if (!deleteUser) return;
        setSaving(true);
        try {
            await apiDeleteUser(deleteUser.id);
            setUsers(prev => prev.filter(u => u.id !== deleteUser.id));
            setDeleteUser(null);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Failed to delete user');
        } finally { setSaving(false); }
    };

    const handleDeletePhoto = async (id: number) => {
        if (!confirm('Delete this photo permanently?')) return;
        setDeletingPhoto(id);
        try {
            await apiDeletePhoto(id);
            setAllPhotos(prev => prev.filter(p => p.id !== id));
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Failed to delete photo');
        } finally { setDeletingPhoto(null); }
    };

    const filteredPhotos = allPhotos.filter(p =>
        (p.title ?? '').toLowerCase().includes(photoSearch.toLowerCase()) ||
        (p.category ?? '').toLowerCase().includes(photoSearch.toLowerCase()) ||
        (p.country ?? '').toLowerCase().includes(photoSearch.toLowerCase()) ||
        (p.owner?.full_name ?? '').toLowerCase().includes(photoSearch.toLowerCase())
    );

    const statCards = [
        { label: 'Total Users', value: users.length, icon: <Users className="w-5 h-5" />, color: 'text-[#F5A623]' },
        { label: 'Participants', value: users.filter(u => u.role === 'PARTICIPANT').length, icon: <Globe className="w-5 h-5" />, color: 'text-emerald-400' },
        { label: 'Judges', value: users.filter(u => u.role === 'JUDGE').length, icon: <Shield className="w-5 h-5" />, color: 'text-[#E8760A]' },
        { label: 'Photos Submitted', value: stats?.total_photos ?? '—', icon: <ImageIcon className="w-5 h-5" />, color: 'text-sky-400' },
        { label: 'Scores Cast', value: stats?.total_scores ?? '—', icon: <Star className="w-5 h-5" />, color: 'text-amber-400' },
        { label: 'Coordinators', value: users.filter(u => u.role === 'NATIONAL_COORDINATOR').length, icon: <TrendingUp className="w-5 h-5" />, color: 'text-purple-400' },
    ];

    return (
        <>
        {/* Lightbox */}
        <AnimatePresence>
            {lightboxSrc && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center cursor-zoom-out"
                    onClick={() => setLightboxSrc(null)}
                >
                    <motion.img
                        initial={{ scale: 0.92, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.92, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        src={lightboxSrc}
                        alt="Full size"
                        className="max-w-[95vw] max-h-[95vh] object-contain shadow-2xl"
                        onClick={e => e.stopPropagation()}
                    />
                    <button
                        onClick={() => setLightboxSrc(null)}
                        className="absolute top-5 right-5 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
                    >
                        <X className="w-6 h-6 text-white" />
                    </button>
                </motion.div>
            )}
        </AnimatePresence>
        <main className="min-h-screen bg-[#080300]" style={{ color: '#F5E0C0' }}>
            <Navbar />
            <div className="pt-24 px-4 md:px-8 pb-16">

                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
                    <div>
                        <div className="px-2 py-0.5 border border-[#C8860A]/25 text-[10px] font-bold text-[#F5A623] uppercase tracking-widest mb-2 inline-block" style={{ ...font, background: 'rgba(200,134,10,0.08)' }}>
                            Global Administrator
                        </div>
                        <h1 className="text-4xl font-bold" style={fontD}>System Overview</h1>
                        <p className="text-[#7A6040] text-sm mt-1" style={font}>User management · {users.length} registered accounts</p>
                    </div>
                    {tab === 'users' && (
                        <button
                            onClick={openCreate}
                            className="flex items-center gap-2 px-6 py-3 grad-premium text-[#080300] font-bold text-sm glow-gold"
                            style={{ ...font, clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 100%, 8px 100%)' }}
                        >
                            <Plus className="w-4 h-4" /> New User
                        </button>
                    )}
                </div>

                {/* Tab navigation */}
                <div className="flex gap-1 mb-8 border-b border-[#C8860A]/10">
                    {TABS.map(t => (
                        <button
                            key={t.key}
                            onClick={() => setTab(t.key)}
                            className={cn(
                                'flex items-center gap-2 px-5 py-3 text-sm font-bold uppercase tracking-wider transition-all border-b-2 -mb-px',
                                tab === t.key
                                    ? 'text-[#F5A623] border-[#F5A623]'
                                    : 'text-[#5A4020] border-transparent hover:text-[#C8A070]'
                            )}
                            style={font}
                        >
                            {t.icon} {t.label}
                        </button>
                    ))}
                </div>

                {error && <p className="text-red-400 text-sm mb-6 border border-red-800/30 bg-red-900/10 px-4 py-3" style={font}>{error}</p>}

                {/* ═══ OVERVIEW TAB ═══ */}
                {tab === 'overview' && (
                    <>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-10">
                            {statCards.map(s => (
                                <div key={s.label} className="glass border border-[#C8860A]/12 p-5">
                                    <div className={cn('mb-3', s.color)}>{s.icon}</div>
                                    <div className="text-2xl font-bold" style={fontD}>{s.value}</div>
                                    <div className="text-[10px] text-[#7A6040] uppercase tracking-wider mt-0.5" style={font}>{s.label}</div>
                                </div>
                            ))}
                        </div>

                        {/* Drive Sync Panel */}
                        <div className="glass border border-[#C8860A]/12 p-6 mb-8">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                                <div className="flex items-center gap-3">
                                    <CloudDownload className="w-5 h-5 text-[#F5A623]" />
                                    <h2 className="text-lg font-bold" style={fontD}>Drive Sync — PhotoCup-in-a-box 2026</h2>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={async () => {
                                            setSyncing(true); setSyncMsg('');
                                            try {
                                                const r = await apiDriveSyncTrigger();
                                                setSyncMsg(r.message);
                                                const s = await apiDriveSyncStatus();
                                                setSyncStatus(s);
                                            } catch (e: any) { setSyncMsg(`Error: ${e.message}`); }
                                            finally { setSyncing(false); }
                                        }}
                                        disabled={syncing}
                                        className="flex items-center gap-2 px-5 py-2 grad-premium text-[#080300] font-bold text-xs uppercase tracking-widest hover:opacity-90 transition-all disabled:opacity-50"
                                        style={font}
                                    >
                                        <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
                                        {syncing ? 'Syncing…' : 'Sync Now'}
                                    </button>
                                    <button
                                        onClick={async () => { const s = await apiDriveSyncStatus(); setSyncStatus(s); }}
                                        className="px-4 py-2 border border-[#C8860A]/20 text-[#C8A070] text-xs font-bold uppercase tracking-widest hover:border-[#F5A623]/40 hover:text-[#F5A623] transition-all"
                                        style={font}
                                    >Status</button>
                                </div>
                            </div>
                            {syncMsg && <p className="text-[#F5A623] text-xs mb-3" style={font}>{syncMsg}</p>}
                            {syncStatus && (
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                                    {Object.entries(syncStatus).map(([file, info]) => (
                                        <div key={file} className={`flex items-center gap-2 px-3 py-2 border text-xs ${info.exists ? 'border-emerald-800/30 bg-emerald-900/10 text-emerald-400' : 'border-red-800/30 bg-red-900/10 text-red-400'}`} style={font}>
                                            <Check className="w-3 h-3 flex-shrink-0" />
                                            <span className="truncate">{file}</span>
                                            <span className="ml-auto text-[10px] opacity-60">{info.size_kb}KB</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {!syncStatus && <p className="text-[#5A4020] text-xs" style={font}>Click Status to view asset state, or Sync Now to pull the latest from Google Drive.</p>}
                        </div>

                        {stats && stats.leaderboard.length > 0 && (
                            <div className="glass border border-[#C8860A]/12 overflow-hidden">
                                <div className="p-6 border-b border-[#C8860A]/10">
                                    <h2 className="text-xl font-bold" style={fontD}>Photo Leaderboard — Top {stats.leaderboard.length}</h2>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="text-left text-[#5A4020] text-[10px] font-black uppercase tracking-[0.2em] border-b border-[#C8860A]/10" style={font}>
                                                <th className="px-6 py-3">#</th>
                                                <th className="px-6 py-3">Title</th>
                                                <th className="px-6 py-3">Author</th>
                                                <th className="px-6 py-3">Category</th>
                                                <th className="px-6 py-3 text-right">Score</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {stats.leaderboard.map((p, i) => (
                                                <tr key={p.id} className="border-b border-[#C8860A]/06 hover:bg-[#C8860A]/03 transition-colors last:border-0">
                                                    <td className="px-6 py-3 text-[#F5A623] font-bold font-mono" style={fontD}>{i + 1}</td>
                                                    <td className="px-6 py-3 font-bold text-[#F5E0C0] text-sm" style={font}>{p.title}</td>
                                                    <td className="px-6 py-3 text-sm text-[#9A7850]" style={font}>{p.author}</td>
                                                    <td className="px-6 py-3 text-xs text-[#7A6040] uppercase tracking-wide" style={font}>{p.category}</td>
                                                    <td className="px-6 py-3 text-right font-bold font-mono text-[#F5A623]">{p.score.toFixed(1)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </>
                )}

                {/* ═══ USERS TAB ═══ */}
                {tab === 'users' && (
                    <div className="glass border border-[#C8860A]/12 overflow-hidden">
                        <div className="p-6 border-b border-[#C8860A]/10 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                            <h2 className="text-xl font-bold" style={fontD}>User Registry · {users.length} accounts</h2>
                            <div className="relative w-full sm:w-72">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5A4020]" />
                                <input
                                    type="text"
                                    placeholder="Search name, email, role, country…"
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    className="w-full bg-[#120700] border border-[#C8860A]/20 pl-10 pr-4 py-2 text-sm text-[#F5E0C0] placeholder-[#3A2A10] focus:outline-none focus:border-[#F5A623]/50 transition-all"
                                    style={font}
                                />
                            </div>
                        </div>

                        {loading ? (
                            <div className="p-16 text-center text-[#5A4020]" style={font}>Loading users…</div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="text-left text-[#5A4020] text-[10px] font-black uppercase tracking-[0.2em] border-b border-[#C8860A]/10" style={font}>
                                            <th className="px-6 py-4">User</th>
                                            <th className="px-6 py-4">Role</th>
                                            <th className="px-6 py-4">Country</th>
                                            <th className="px-6 py-4">Mensa #</th>
                                            <th className="px-6 py-4">Status</th>
                                            <th className="px-6 py-4 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filtered.map(u => (
                                            <tr key={u.id} className="border-b border-[#C8860A]/06 hover:bg-[#C8860A]/03 transition-colors last:border-0">
                                                <td className="px-6 py-4">
                                                    <p className="font-bold text-[#F5E0C0] text-sm" style={font}>{u.full_name}</p>
                                                    <p className="text-[11px] text-[#5A4020] mt-0.5">{u.email}</p>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={cn('text-[10px] font-black uppercase px-2 py-0.5', ROLE_COLOR[u.role] ?? 'text-[#9A7850] bg-[#9A7850]/10')} style={font}>
                                                        {u.role.replace('_', ' ')}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-[#9A7850]" style={font}>{u.country ?? '—'}</td>
                                                <td className="px-6 py-4 text-sm font-mono text-[#7A6040]">{u.mensa_number || '—'}</td>
                                                <td className="px-6 py-4">
                                                    <span className={cn('text-[10px] font-black uppercase px-2 py-0.5', u.is_active ? 'text-emerald-400 bg-emerald-400/10' : 'text-red-400 bg-red-400/10')} style={font}>
                                                        {u.is_active ? 'Active' : 'Inactive'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <button onClick={() => openEdit(u)} className="p-2 text-[#5A4020] hover:text-[#F5A623] transition-colors" title="Edit">
                                                            <Pencil className="w-4 h-4" />
                                                        </button>
                                                        <button onClick={() => setDeleteUser(u)} className="p-2 text-[#5A4020] hover:text-red-400 transition-colors" title="Delete">
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        {filtered.length === 0 && (
                                            <tr><td colSpan={6} className="px-6 py-12 text-center text-[#5A4020] text-sm" style={font}>No users match your search.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {/* ═══ PHOTOS TAB ═══ */}
                {tab === 'photos' && (
                    <div className="space-y-6">
                        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                            <h2 className="text-xl font-bold" style={fontD}>All Photos · {allPhotos.length} entries</h2>
                            <div className="flex items-center gap-3 flex-wrap">
                                <div className="relative w-full sm:w-72">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5A4020]" />
                                    <input
                                        type="text"
                                        placeholder="Search title, author, category, country…"
                                        value={photoSearch}
                                        onChange={e => setPhotoSearch(e.target.value)}
                                        className="w-full bg-[#120700] border border-[#C8860A]/20 pl-10 pr-4 py-2 text-sm text-[#F5E0C0] placeholder-[#3A2A10] focus:outline-none focus:border-[#F5A623]/50 transition-all"
                                        style={font}
                                    />
                                </div>
                                <button
                                    onClick={handleGenerateThumbs}
                                    disabled={thumbGenerating}
                                    className="flex items-center gap-2 px-4 py-2 border border-[#C8860A]/25 text-[#C8A070] hover:text-[#F5A623] hover:border-[#F5A623]/40 transition-all text-xs font-bold uppercase tracking-widest disabled:opacity-50"
                                    style={font}
                                    title="Generate compressed thumbnails for all photos"
                                >
                                    <RefreshCw className={`w-3.5 h-3.5 ${thumbGenerating ? 'animate-spin' : ''}`} />
                                    {thumbGenerating ? 'Generating…' : 'Gen. Thumbs'}
                                </button>
                                {thumbMsg && <span className="text-xs text-[#7A6040]" style={font}>{thumbMsg}</span>}
                            </div>
                        </div>

                        {filteredPhotos.length === 0 ? (
                            <div className="glass border border-[#C8860A]/12 p-16 text-center text-[#5A4020]" style={font}>No photos found.</div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {filteredPhotos.map(photo => {
                                    const imgSrc = photoUrl(photo.thumbnail_path ?? photo.file_path);
                                    const fullSrc = photoUrl(photo.file_path);
                                    return (
                                        <div key={photo.id} className="glass border border-[#C8860A]/12 overflow-hidden group"
                                             style={{ clipPath: 'polygon(0 0, 100% 0, 100% 94%, 94% 100%, 0 100%)' }}>
                                            <div className="relative h-40 bg-[#120700] cursor-zoom-in" onDoubleClick={() => fullSrc && setLightboxSrc(fullSrc)}>
                                                {imgSrc ? (
                                                    <img src={imgSrc} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt={photo.title ?? ''} loading="lazy" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-[#3A2A10]">
                                                        <ImageIcon className="w-10 h-10" />
                                                    </div>
                                                )}
                                                <div className="absolute inset-0 bg-gradient-to-t from-[#080300]/60 to-transparent" />
                                                <div className="absolute top-2 right-2">
                                                    <span className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-[#F5A623]/80 text-[#080300]" style={font}>
                                                        {photo.category ?? 'General'}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="p-4 flex justify-between items-start">
                                                <div className="min-w-0 flex-1">
                                                    <h4 className="font-bold text-white text-sm truncate" style={fontD}>{photo.title ?? 'Untitled'}</h4>
                                                    <p className="text-[10px] text-[#9A7850] mt-0.5" style={font}>{photo.owner?.full_name ?? 'Unknown'}</p>
                                                    <p className="text-[10px] text-[#5A4020] mt-0.5" style={font}>{photo.country ?? 'Global'} · ID #{photo.id}</p>
                                                </div>
                                                <button
                                                    onClick={() => handleDeletePhoto(photo.id)}
                                                    disabled={deletingPhoto === photo.id}
                                                    className="p-2 text-red-500/40 hover:text-red-400 transition-all disabled:opacity-30 flex-shrink-0"
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
                    </div>
                )}

                {/* ═══ JUDGES TAB ═══ */}
                {tab === 'judges' && (
                    <div className="space-y-6">
                        <h2 className="text-xl font-bold" style={fontD}>Judge Performance</h2>
                        {stats?.judge_performance && stats.judge_performance.length > 0 ? (
                            <div className="glass border border-[#C8860A]/12 overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="text-left text-[#5A4020] text-[10px] font-black uppercase tracking-[0.2em] border-b border-[#C8860A]/10" style={font}>
                                                <th className="px-6 py-4">Judge</th>
                                                <th className="px-6 py-4">Reviews</th>
                                                <th className="px-6 py-4">Avg Score</th>
                                                <th className="px-6 py-4">Progress</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {stats.judge_performance.map((j, i) => {
                                                const pct = allPhotos.length > 0 ? Math.round((j.reviews / allPhotos.length) * 100) : 0;
                                                return (
                                                    <tr key={i} className="border-b border-[#C8860A]/06 hover:bg-[#C8860A]/03 transition-colors last:border-0">
                                                        <td className="px-6 py-4">
                                                            <p className="font-bold text-[#F5E0C0] text-sm" style={font}>{j.name}</p>
                                                        </td>
                                                        <td className="px-6 py-4 font-mono text-[#F5A623] font-bold">{j.reviews}</td>
                                                        <td className="px-6 py-4 font-mono text-[#C8A070]">{j.avgScore.toFixed(1)}</td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className="flex-1 h-2 bg-[#C8860A]/10 overflow-hidden">
                                                                    <div className="h-full grad-premium transition-all" style={{ width: `${Math.min(pct, 100)}%` }} />
                                                                </div>
                                                                <span className="text-xs text-[#7A6040] font-mono w-10 text-right" style={font}>{pct}%</span>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        ) : (
                            <div className="glass border border-[#C8860A]/12 p-16 text-center text-[#5A4020]" style={font}>No judge evaluation data yet.</div>
                        )}

                        {stats?.detailed_ranking && stats.detailed_ranking.length > 0 && (
                            <div className="glass border border-[#C8860A]/12 overflow-hidden">
                                <div className="p-6 border-b border-[#C8860A]/10">
                                    <h2 className="text-xl font-bold" style={fontD}>Detailed Scoring — All Photos</h2>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="text-left text-[#5A4020] text-[10px] font-black uppercase tracking-[0.2em] border-b border-[#C8860A]/10" style={font}>
                                                <th className="px-6 py-3">#</th>
                                                <th className="px-6 py-3">Title</th>
                                                <th className="px-6 py-3">Author</th>
                                                <th className="px-6 py-3">Votes</th>
                                                <th className="px-6 py-3 text-right">Avg Score</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {stats.detailed_ranking.map((p, i) => (
                                                <tr key={p.id} className="border-b border-[#C8860A]/06 hover:bg-[#C8860A]/03 transition-colors last:border-0">
                                                    <td className="px-6 py-3 text-[#F5A623] font-bold font-mono" style={fontD}>{i + 1}</td>
                                                    <td className="px-6 py-3 font-bold text-[#F5E0C0] text-sm" style={font}>{p.title}</td>
                                                    <td className="px-6 py-3 text-sm text-[#9A7850]" style={font}>{p.author}</td>
                                                    <td className="px-6 py-3 font-mono text-[#7A6040]">{p.vote_count}</td>
                                                    <td className="px-6 py-3 text-right font-bold font-mono text-[#F5A623]">{p.avg_score.toFixed(1)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* ═══ GOVERNANCE TAB ═══ */}
                {tab === 'governance' && (
                    <div className="space-y-6">
                        {govLoading && <div className="glass border border-[#C8860A]/12 p-16 text-center text-[#5A4020]" style={font}>Loading governance metrics…</div>}
                        {!govLoading && !gov && <div className="glass border border-[#C8860A]/12 p-16 text-center text-[#5A4020]" style={font}>No data available.</div>}
                        {gov && (<>
                            {/* Section nav + country filter */}
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <div className="flex flex-wrap gap-2">
                                    {([
                                        { key: 'participation' as const, label: 'Participation', icon: <Globe className="w-3.5 h-3.5" /> },
                                        { key: 'operational' as const, label: 'Operational', icon: <Target className="w-3.5 h-3.5" /> },
                                        { key: 'judging' as const, label: 'Judging Analytics', icon: <Shield className="w-3.5 h-3.5" /> },
                                        { key: 'results' as const, label: 'Results & Equity', icon: <Award className="w-3.5 h-3.5" /> },
                                    ]).map(s => (
                                        <button key={s.key} onClick={() => setGovSection(s.key)}
                                            className={cn('flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-widest transition-all border',
                                                govSection === s.key ? 'border-[#F5A623]/40 text-[#F5A623] bg-[#F5A623]/08' : 'border-[#C8860A]/15 text-[#5A4020] hover:text-[#C8A070]'
                                            )} style={font}>{s.icon} {s.label}</button>
                                    ))}
                                </div>
                                {/* Country filter */}
                                <div className="flex items-center gap-2">
                                    <Globe className="w-3.5 h-3.5 text-[#5A4020]" />
                                    <select
                                        value={govCountry}
                                        onChange={e => { const v = e.target.value; setGovCountry(v); setGov(null); fetchGov(v || undefined); }}
                                        className="bg-[#080300] border border-[#C8860A]/20 text-[#F5E0C0] text-xs px-3 py-1.5 focus:outline-none focus:border-[#F5A623]/50 transition-colors min-w-[160px]"
                                        style={font}
                                    >
                                        <option value="">All countries</option>
                                        {govCountries.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                    {govCountry && (
                                        <button onClick={() => { setGovCountry(''); setGov(null); fetchGov(); }}
                                            className="text-[#F5A623] hover:text-[#F5E0C0] transition-colors p-1" title="Clear filter">
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                    )}
                                </div>
                            </div>
                            {/* Active filter banner */}
                            {govCountry && (
                                <div className="flex items-center gap-2 px-4 py-2 border border-[#F5A623]/20 bg-[#F5A623]/05">
                                    <Globe className="w-3.5 h-3.5 text-[#F5A623]" />
                                    <span className="text-xs text-[#F5A623] font-bold uppercase tracking-wider" style={font}>
                                        Filtered: {govCountry}
                                    </span>
                                    <span className="text-xs text-[#7A6040]" style={font}>— showing metrics only for this country</span>
                                </div>
                            )}

                            {/* ── PARTICIPATION ── */}
                            {govSection === 'participation' && (<>
                                {/* KPI cards */}
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                                    {[
                                        { label: 'Participants', value: gov.participation.total_participants, color: 'text-emerald-400' },
                                        { label: 'Photos', value: gov.participation.total_photos, color: 'text-[#F5A623]' },
                                        { label: 'Avg/Participant', value: gov.participation.avg_photos_per_participant, color: 'text-sky-400' },
                                        { label: 'Countries', value: gov.participation.total_countries, color: 'text-purple-400' },
                                        { label: 'Categories', value: gov.participation.total_categories, color: 'text-amber-400' },
                                        { label: 'Judges', value: gov.participation.total_judges, color: 'text-[#E8760A]' },
                                    ].map(c => (
                                        <div key={c.label} className="glass border border-[#C8860A]/12 p-4">
                                            <div className={cn('text-2xl font-bold', c.color)} style={fontD}>{c.value}</div>
                                            <div className="text-[10px] text-[#7A6040] uppercase tracking-wider mt-0.5" style={font}>{c.label}</div>
                                        </div>
                                    ))}
                                </div>

                                {/* ── Visual Summary Row ── */}
                                <div className="glass border border-[#C8860A]/12 p-6">
                                    <h3 className="text-sm font-bold text-[#9A7850] uppercase tracking-widest mb-5" style={font}>Visual Overview</h3>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 items-start justify-items-center">
                                        <div className="flex flex-col items-center">
                                            <Donut
                                                segments={[
                                                    { value: gov.participation.funnel.submitted_at_least_one, color: '#10b981', label: 'Submitted' },
                                                    { value: gov.participation.funnel.not_submitted, color: '#f87171', label: 'Not submitted' },
                                                ]}
                                                label={`${gov.participation.funnel.submission_rate_pct}%`}
                                                sublabel="submission rate"
                                            />
                                            <span className="text-[10px] text-[#5A4020] uppercase tracking-wider mt-2" style={font}>Conversion Funnel</span>
                                        </div>
                                        <div className="flex flex-col items-center">
                                            <VerticalBars
                                                bars={gov.participation.country_distribution.slice(0, 8).map((c, i) => ({
                                                    label: c.country, value: c.photos, color: CHART_COLORS[i % CHART_COLORS.length]
                                                }))}
                                                height={90}
                                            />
                                            <span className="text-[10px] text-[#5A4020] uppercase tracking-wider mt-1" style={font}>Photos by Country (Top 8)</span>
                                        </div>
                                        <div className="flex flex-col items-center">
                                            <VerticalBars
                                                bars={gov.participation.category_distribution.map((c, i) => ({
                                                    label: c.category, value: c.photos, color: CHART_COLORS[(i + 3) % CHART_COLORS.length]
                                                }))}
                                                height={90}
                                            />
                                            <span className="text-[10px] text-[#5A4020] uppercase tracking-wider mt-1" style={font}>Photos by Category</span>
                                        </div>
                                        <div className="flex flex-col items-center">
                                            <Donut
                                                segments={[
                                                    { value: gov.participation.total_participants, color: '#10b981', label: 'Participants' },
                                                    { value: gov.participation.total_judges, color: '#F5A623', label: 'Judges' },
                                                    { value: gov.participation.total_coordinators, color: '#38bdf8', label: 'Coordinators' },
                                                ]}
                                                label={String(gov.participation.total_participants + gov.participation.total_judges + gov.participation.total_coordinators)}
                                                sublabel="total users"
                                            />
                                            <span className="text-[10px] text-[#5A4020] uppercase tracking-wider mt-2" style={font}>User Composition</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Funnel */}
                                <div className="glass border border-[#C8860A]/12 p-6">
                                    <h3 className="text-lg font-bold mb-4" style={fontD}>Conversion Funnel</h3>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <div className="text-center p-4 border border-[#C8860A]/10">
                                            <div className="text-2xl font-bold text-emerald-400" style={fontD}>{gov.participation.funnel.registered_users}</div>
                                            <div className="text-[10px] text-[#7A6040] uppercase tracking-wider mt-1" style={font}>Registered</div>
                                        </div>
                                        <div className="text-center p-4 border border-[#C8860A]/10">
                                            <div className="text-2xl font-bold text-[#F5A623]" style={fontD}>{gov.participation.funnel.submitted_at_least_one}</div>
                                            <div className="text-[10px] text-[#7A6040] uppercase tracking-wider mt-1" style={font}>Submitted 1+ Photo</div>
                                        </div>
                                        <div className="text-center p-4 border border-[#C8860A]/10">
                                            <div className="text-2xl font-bold text-sky-400" style={fontD}>{gov.participation.funnel.submission_rate_pct}%</div>
                                            <div className="text-[10px] text-[#7A6040] uppercase tracking-wider mt-1" style={font}>Submission Rate</div>
                                        </div>
                                        <div className="text-center p-4 border border-red-800/20">
                                            <div className="text-2xl font-bold text-red-400" style={fontD}>{gov.participation.funnel.abandonment_rate_pct}%</div>
                                            <div className="text-[10px] text-[#7A6040] uppercase tracking-wider mt-1" style={font}>Abandonment</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Country distribution */}
                                <div className="glass border border-[#C8860A]/12 overflow-hidden">
                                    <div className="p-6 border-b border-[#C8860A]/10 flex justify-between items-center">
                                        <h3 className="text-lg font-bold" style={fontD}>Distribution by Country</h3>
                                        {gov.participation.countries_without_photos.length > 0 && (
                                            <span className="text-[10px] text-red-400 border border-red-800/20 bg-red-900/10 px-2 py-0.5 font-bold uppercase tracking-wider" style={font}>
                                                {gov.participation.countries_without_photos.length} countries with 0 photos
                                            </span>
                                        )}
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="text-left text-[#5A4020] text-[10px] font-black uppercase tracking-[0.2em] border-b border-[#C8860A]/10" style={font}>
                                                    <th className="px-6 py-3">Country</th>
                                                    <th className="px-6 py-3 text-right">Participants</th>
                                                    <th className="px-6 py-3 text-right">Photos</th>
                                                    <th className="px-6 py-3 text-right">Avg/Person</th>
                                                    <th className="px-6 py-3">Distribution</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {gov.participation.country_distribution.map(c => {
                                                    const maxPhotos = gov.participation.country_distribution[0]?.photos || 1;
                                                    const pct = Math.round((c.photos / maxPhotos) * 100);
                                                    return (
                                                        <tr key={c.country} className="border-b border-[#C8860A]/06 hover:bg-[#C8860A]/03 transition-colors last:border-0">
                                                            <td className="px-6 py-2.5 font-bold text-[#F5E0C0] text-sm" style={font}>{c.country}</td>
                                                            <td className="px-6 py-2.5 text-right font-mono text-[#9A7850]">{c.participants}</td>
                                                            <td className="px-6 py-2.5 text-right font-mono text-[#F5A623] font-bold">{c.photos}</td>
                                                            <td className="px-6 py-2.5 text-right font-mono text-[#7A6040]">{c.avg_photos_per_participant}</td>
                                                            <td className="px-6 py-2.5">
                                                                <div className="w-full h-2 bg-[#C8860A]/10 overflow-hidden">
                                                                    <div className="h-full grad-premium" style={{ width: `${pct}%` }} />
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* Category distribution */}
                                <div className="glass border border-[#C8860A]/12 overflow-hidden">
                                    <div className="p-6 border-b border-[#C8860A]/10 flex flex-wrap justify-between items-center gap-2">
                                        <h3 className="text-lg font-bold" style={fontD}>Distribution by Category</h3>
                                        <div className="flex gap-2">
                                            {gov.participation.saturated_categories.length > 0 && (
                                                <span className="text-[10px] text-amber-400 border border-amber-800/20 bg-amber-900/10 px-2 py-0.5 font-bold uppercase tracking-wider" style={font}>
                                                    {gov.participation.saturated_categories.join(', ')} saturated
                                                </span>
                                            )}
                                            {gov.participation.underrepresented_categories.length > 0 && (
                                                <span className="text-[10px] text-red-400 border border-red-800/20 bg-red-900/10 px-2 py-0.5 font-bold uppercase tracking-wider" style={font}>
                                                    {gov.participation.underrepresented_categories.join(', ')} underrepresented
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="text-left text-[#5A4020] text-[10px] font-black uppercase tracking-[0.2em] border-b border-[#C8860A]/10" style={font}>
                                                    <th className="px-6 py-3">Category</th>
                                                    <th className="px-6 py-3 text-right">Photos</th>
                                                    <th className="px-6 py-3 text-right">Participants</th>
                                                    <th className="px-6 py-3 text-right">Avg/Person</th>
                                                    <th className="px-6 py-3">Distribution</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {gov.participation.category_distribution.map(c => {
                                                    const maxPhotos = gov.participation.category_distribution[0]?.photos || 1;
                                                    const pct = Math.round((c.photos / maxPhotos) * 100);
                                                    const isSaturated = gov.participation.saturated_categories.includes(c.category);
                                                    const isUnder = gov.participation.underrepresented_categories.includes(c.category);
                                                    return (
                                                        <tr key={c.category} className={cn('border-b border-[#C8860A]/06 hover:bg-[#C8860A]/03 transition-colors last:border-0',
                                                            isSaturated && 'bg-amber-900/05', isUnder && 'bg-red-900/05')}>
                                                            <td className="px-6 py-2.5 font-bold text-[#F5E0C0] text-sm flex items-center gap-2" style={font}>
                                                                {c.category}
                                                                {isSaturated && <span className="text-[8px] text-amber-400 border border-amber-800/30 px-1 py-px uppercase">High</span>}
                                                                {isUnder && <span className="text-[8px] text-red-400 border border-red-800/30 px-1 py-px uppercase">Low</span>}
                                                            </td>
                                                            <td className="px-6 py-2.5 text-right font-mono text-[#F5A623] font-bold">{c.photos}</td>
                                                            <td className="px-6 py-2.5 text-right font-mono text-[#9A7850]">{c.participants}</td>
                                                            <td className="px-6 py-2.5 text-right font-mono text-[#7A6040]">{c.avg_photos}</td>
                                                            <td className="px-6 py-2.5">
                                                                <div className="w-full h-2 bg-[#C8860A]/10 overflow-hidden">
                                                                    <div className={cn('h-full', isSaturated ? 'bg-amber-500' : isUnder ? 'bg-red-500' : 'grad-premium')} style={{ width: `${pct}%` }} />
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </>)}

                            {/* ── OPERATIONAL ── */}
                            {govSection === 'operational' && (<>
                                {/* ── Visual Summary Row ── */}
                                <div className="glass border border-[#C8860A]/12 p-6">
                                    <h3 className="text-sm font-bold text-[#9A7850] uppercase tracking-widest mb-5" style={font}>Visual Overview</h3>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 items-start justify-items-center">
                                        <div className="flex flex-col items-center">
                                            <Donut
                                                segments={[
                                                    { value: gov.operational.photos_with_scores, color: '#10b981', label: 'Scored' },
                                                    { value: gov.operational.photos_pending_review, color: '#f87171', label: 'Pending' },
                                                ]}
                                                label={String(gov.operational.photos_with_scores)}
                                                sublabel="scored"
                                            />
                                            <span className="text-[10px] text-[#5A4020] uppercase tracking-wider mt-2" style={font}>Review Status</span>
                                        </div>
                                        <div className="flex flex-col items-center">
                                            <Donut
                                                segments={[
                                                    { value: gov.operational.active_users, color: '#10b981', label: 'Active' },
                                                    { value: gov.operational.inactive_users, color: '#f87171', label: 'Inactive' },
                                                ]}
                                                label={String(gov.operational.active_users)}
                                                sublabel="active"
                                            />
                                            <span className="text-[10px] text-[#5A4020] uppercase tracking-wider mt-2" style={font}>Account Status</span>
                                        </div>
                                        <div className="flex flex-col items-center">
                                            <Donut
                                                segments={Object.entries(gov.operational.users_by_role).map(([role, count], i) => ({
                                                    value: count,
                                                    color: role === 'ADMIN' ? '#f87171' : role === 'JUDGE' ? '#F5A623' : role === 'PARTICIPANT' ? '#10b981' : '#38bdf8',
                                                    label: role.replace('NATIONAL_', 'N.'),
                                                }))}
                                                label={String(Object.values(gov.operational.users_by_role).reduce((a, b) => a + b, 0))}
                                                sublabel="total users"
                                            />
                                            <span className="text-[10px] text-[#5A4020] uppercase tracking-wider mt-2" style={font}>Users by Role</span>
                                        </div>
                                        <div className="flex flex-col items-center">
                                            <ArcGauge
                                                value={gov.operational.photos_with_scores}
                                                max={gov.operational.photos_with_scores + gov.operational.photos_pending_review}
                                                label="scoring progress"
                                                color={gov.operational.photos_pending_review === 0 ? '#10b981' : '#F5A623'}
                                            />
                                            <span className="text-[10px] text-[#5A4020] uppercase tracking-wider mt-2" style={font}>
                                                {Math.round(gov.operational.photos_with_scores / Math.max(1, gov.operational.photos_with_scores + gov.operational.photos_pending_review) * 100)}% Complete
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {[
                                        { label: 'Photos Scored', value: gov.operational.photos_with_scores, color: 'text-emerald-400' },
                                        { label: 'Pending Review', value: gov.operational.photos_pending_review, color: gov.operational.photos_pending_review > 0 ? 'text-red-400' : 'text-emerald-400' },
                                        { label: 'No EXIF Data', value: gov.operational.photos_no_exif_metadata, color: gov.operational.photos_no_exif_metadata > 0 ? 'text-amber-400' : 'text-emerald-400' },
                                        { label: 'Avg File Size', value: `${gov.operational.avg_file_size_mb} MB`, color: 'text-sky-400' },
                                    ].map(c => (
                                        <div key={c.label} className="glass border border-[#C8860A]/12 p-5">
                                            <div className={cn('text-2xl font-bold', c.color)} style={fontD}>{c.value}</div>
                                            <div className="text-[10px] text-[#7A6040] uppercase tracking-wider mt-0.5" style={font}>{c.label}</div>
                                        </div>
                                    ))}
                                </div>

                                {/* Users by role */}
                                <div className="glass border border-[#C8860A]/12 p-6">
                                    <h3 className="text-lg font-bold mb-4" style={fontD}>Users by Role</h3>
                                    <div className="space-y-3">
                                        {Object.entries(gov.operational.users_by_role).map(([role, count]) => {
                                            const total = Object.values(gov.operational.users_by_role).reduce((a, b) => a + b, 0);
                                            const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                                            return (
                                                <div key={role} className="flex items-center gap-4">
                                                    <span className={cn('text-[10px] font-black uppercase px-2 py-0.5 w-40', ROLE_COLOR[role] ?? 'text-[#9A7850] bg-[#9A7850]/10')} style={font}>
                                                        {role.replace('_', ' ')}
                                                    </span>
                                                    <div className="flex-1 h-3 bg-[#C8860A]/10 overflow-hidden">
                                                        <div className="h-full grad-premium transition-all" style={{ width: `${pct}%` }} />
                                                    </div>
                                                    <span className="text-sm font-mono text-[#F5A623] font-bold w-12 text-right">{count}</span>
                                                    <span className="text-xs font-mono text-[#5A4020] w-12 text-right">{pct}%</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* System health cards */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="glass border border-[#C8860A]/12 p-6">
                                        <h3 className="text-lg font-bold mb-3" style={fontD}>Account Status</h3>
                                        <div className="flex gap-6">
                                            <div>
                                                <div className="text-2xl font-bold text-emerald-400" style={fontD}>{gov.operational.active_users}</div>
                                                <div className="text-[10px] text-[#7A6040] uppercase tracking-wider" style={font}>Active</div>
                                            </div>
                                            <div>
                                                <div className="text-2xl font-bold text-red-400" style={fontD}>{gov.operational.inactive_users}</div>
                                                <div className="text-[10px] text-[#7A6040] uppercase tracking-wider" style={font}>Inactive</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="glass border border-[#C8860A]/12 p-6">
                                        <h3 className="text-lg font-bold mb-3" style={fontD}>File Storage</h3>
                                        <div className="flex gap-6">
                                            <div>
                                                <div className="text-2xl font-bold text-sky-400" style={fontD}>{gov.operational.avg_file_size_mb} MB</div>
                                                <div className="text-[10px] text-[#7A6040] uppercase tracking-wider" style={font}>Avg Size</div>
                                            </div>
                                            <div>
                                                <div className="text-2xl font-bold text-amber-400" style={fontD}>{gov.operational.max_file_size_mb} MB</div>
                                                <div className="text-[10px] text-[#7A6040] uppercase tracking-wider" style={font}>Max Size</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Data not available notice */}
                                <div className="glass border border-[#C8860A]/12 p-6 border-l-2 border-l-[#5A4020]">
                                    <div className="flex items-start gap-3">
                                        <AlertTriangle className="w-5 h-5 text-[#5A4020] flex-shrink-0 mt-0.5" />
                                        <div>
                                            <h4 className="text-sm font-bold text-[#9A7850] mb-1" style={font}>Metrics not yet available</h4>
                                            <p className="text-xs text-[#5A4020] leading-relaxed" style={font}>
                                                The following metrics require additional tracking infrastructure: incident management (open/resolved/resolution time),
                                                deadline compliance tracking, session duration, error rates by device/browser, upload retry counts.
                                                These can be enabled by adding an events/incidents table to the backend.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </>)}

                            {/* ── JUDGING ANALYTICS ── */}
                            {govSection === 'judging' && (<>
                                {/* ── Visual Summary Row ── */}
                                <div className="glass border border-[#C8860A]/12 p-6">
                                    <h3 className="text-sm font-bold text-[#9A7850] uppercase tracking-widest mb-5" style={font}>Visual Overview</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                                        {/* Judge averages dot strip */}
                                        <div className="flex flex-col items-center col-span-1 md:col-span-2">
                                            <span className="text-[10px] text-[#5A4020] uppercase tracking-wider mb-2" style={font}>Judge Score Averages (dots) vs Global Mean (dashed)</span>
                                            <DotStrip
                                                points={gov.judging.judge_metrics.filter(j => j.photos_reviewed > 0).map((j, i) => ({
                                                    value: j.avg_score,
                                                    label: j.judge_name,
                                                    color: gov.judging.outlier_judges.some(o => o.judge_name === j.judge_name)
                                                        ? '#f87171' : CHART_COLORS[i % CHART_COLORS.length],
                                                }))}
                                                mean={gov.judging.global_judge_mean}
                                                width={420}
                                                height={52}
                                            />
                                        </div>
                                        {/* Coverage gauge */}
                                        <div className="flex flex-col items-center gap-2">
                                            <ArcGauge
                                                value={gov.judging.pct_min_2_coverage}
                                                max={100}
                                                size={120}
                                                label="≥2 judges coverage"
                                                color={gov.judging.pct_min_2_coverage >= 80 ? '#10b981' : gov.judging.pct_min_2_coverage >= 50 ? '#F5A623' : '#f87171'}
                                            />
                                        </div>
                                    </div>
                                    {/* Overall score distribution + Category scoring */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 items-start justify-items-center">
                                        <div className="flex flex-col items-center w-full">
                                            <span className="text-[10px] text-[#5A4020] uppercase tracking-wider mb-2" style={font}>Overall Score Distribution (All Judges)</span>
                                            <StackedHBar
                                                segments={[
                                                    { value: gov.judging.judge_metrics.reduce((s, j) => s + j.distribution.low, 0), color: '#f87171', label: 'Low (0-3)' },
                                                    { value: gov.judging.judge_metrics.reduce((s, j) => s + j.distribution.mid, 0), color: '#facc15', label: 'Mid (4-6)' },
                                                    { value: gov.judging.judge_metrics.reduce((s, j) => s + j.distribution.high, 0), color: '#10b981', label: 'High (7-10)' },
                                                ]}
                                                width={300}
                                                height={28}
                                            />
                                        </div>
                                        {gov.judging.category_scores.length > 0 && (
                                            <div className="flex flex-col items-center">
                                                <span className="text-[10px] text-[#5A4020] uppercase tracking-wider mb-2" style={font}>Avg Score by Category</span>
                                                <VerticalBars
                                                    bars={gov.judging.category_scores.map((c, i) => ({
                                                        label: c.category, value: parseFloat(c.avg_score.toFixed(1)), color: CHART_COLORS[i % CHART_COLORS.length]
                                                    }))}
                                                    height={80}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Global KPIs */}
                                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                    {[
                                        { label: 'Global Mean', value: gov.judging.global_judge_mean.toFixed(1), color: 'text-[#F5A623]' },
                                        { label: 'Global StdDev', value: gov.judging.global_judge_stddev.toFixed(2), color: 'text-sky-400' },
                                        { label: 'Avg Disagreement', value: gov.judging.avg_inter_judge_disagreement.toFixed(2), color: 'text-amber-400' },
                                        { label: '≥2 Judges Coverage', value: `${gov.judging.pct_min_2_coverage}%`, color: gov.judging.pct_min_2_coverage >= 80 ? 'text-emerald-400' : 'text-red-400' },
                                        { label: 'Outlier Judges', value: gov.judging.outlier_judges.length, color: gov.judging.outlier_judges.length > 0 ? 'text-red-400' : 'text-emerald-400' },
                                    ].map(c => (
                                        <div key={c.label} className="glass border border-[#C8860A]/12 p-4">
                                            <div className={cn('text-2xl font-bold', c.color)} style={fontD}>{c.value}</div>
                                            <div className="text-[10px] text-[#7A6040] uppercase tracking-wider mt-0.5" style={font}>{c.label}</div>
                                        </div>
                                    ))}
                                </div>

                                {/* Per-judge table */}
                                <div className="glass border border-[#C8860A]/12 overflow-hidden">
                                    <div className="p-6 border-b border-[#C8860A]/10">
                                        <h3 className="text-lg font-bold" style={fontD}>Judge Performance Matrix</h3>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="text-left text-[#5A4020] text-[10px] font-black uppercase tracking-[0.15em] border-b border-[#C8860A]/10" style={font}>
                                                    <th className="px-4 py-3">Judge</th>
                                                    <th className="px-4 py-3 text-right">Reviewed</th>
                                                    <th className="px-4 py-3 text-right">Complete</th>
                                                    <th className="px-4 py-3 text-right">Avg</th>
                                                    <th className="px-4 py-3 text-right">StdDev</th>
                                                    <th className="px-4 py-3 text-right">Range</th>
                                                    <th className="px-4 py-3">Score Distribution</th>
                                                    <th className="px-4 py-3">Criteria Avg</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {gov.judging.judge_metrics.map(j => {
                                                    const isOutlier = gov.judging.outlier_judges.some(o => o.judge_name === j.judge_name);
                                                    const totalDist = j.distribution.low + j.distribution.mid + j.distribution.high;
                                                    return (
                                                        <tr key={j.judge_id} className={cn('border-b border-[#C8860A]/06 hover:bg-[#C8860A]/03 transition-colors last:border-0', isOutlier && 'bg-red-900/05')}>
                                                            <td className="px-4 py-3">
                                                                <p className="font-bold text-[#F5E0C0] text-sm flex items-center gap-2" style={font}>
                                                                    {j.judge_name}
                                                                    {isOutlier && <AlertTriangle className="w-3 h-3 text-red-400" />}
                                                                </p>
                                                                {j.country && <p className="text-[10px] text-[#5A4020]">{j.country}</p>}
                                                            </td>
                                                            <td className="px-4 py-3 text-right font-mono text-[#F5A623] font-bold">{j.photos_reviewed}</td>
                                                            <td className="px-4 py-3 text-right">
                                                                <div className="flex items-center justify-end gap-2">
                                                                    <div className="w-16 h-1.5 bg-[#C8860A]/10 overflow-hidden">
                                                                        <div className={cn('h-full', j.pct_complete >= 80 ? 'bg-emerald-500' : j.pct_complete >= 40 ? 'bg-amber-500' : 'bg-red-500')} style={{ width: `${Math.min(j.pct_complete, 100)}%` }} />
                                                                    </div>
                                                                    <span className="text-xs font-mono text-[#7A6040] w-10 text-right">{j.pct_complete}%</span>
                                                                </div>
                                                            </td>
                                                            <td className="px-4 py-3 text-right font-mono text-[#C8A070] font-bold">{j.avg_score.toFixed(1)}</td>
                                                            <td className="px-4 py-3 text-right font-mono text-[#7A6040]">{j.stddev.toFixed(2)}</td>
                                                            <td className="px-4 py-3 text-right font-mono text-[#5A4020] text-xs">{j.min_score}–{j.max_score}</td>
                                                            <td className="px-4 py-3">
                                                                {totalDist > 0 && (
                                                                    <div className="flex h-4 w-24 overflow-hidden">
                                                                        <div className="bg-red-500/60 h-full" style={{ width: `${(j.distribution.low / totalDist) * 100}%` }} title={`Low: ${j.distribution.low}`} />
                                                                        <div className="bg-amber-500/60 h-full" style={{ width: `${(j.distribution.mid / totalDist) * 100}%` }} title={`Mid: ${j.distribution.mid}`} />
                                                                        <div className="bg-emerald-500/60 h-full" style={{ width: `${(j.distribution.high / totalDist) * 100}%` }} title={`High: ${j.distribution.high}`} />
                                                                    </div>
                                                                )}
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                <div className="flex gap-2 text-[10px] font-mono text-[#5A4020]">
                                                                    <span title="Impact">I:{j.criteria_avgs.impact}</span>
                                                                    <span title="Technique">T:{j.criteria_avgs.technique}</span>
                                                                    <span title="Composition">C:{j.criteria_avgs.composition}</span>
                                                                    <span title="Story">S:{j.criteria_avgs.story}</span>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* Alerts row */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Outlier judges */}
                                    <div className="glass border border-[#C8860A]/12 p-6">
                                        <h3 className="text-lg font-bold mb-3 flex items-center gap-2" style={fontD}>
                                            <AlertTriangle className="w-4 h-4 text-red-400" /> Outlier Judges
                                        </h3>
                                        {gov.judging.outlier_judges.length === 0 ? (
                                            <p className="text-[#5A4020] text-sm" style={font}>No outliers detected (all judges within 1.5σ of mean).</p>
                                        ) : (
                                            <div className="space-y-2">
                                                {gov.judging.outlier_judges.map((o, i) => (
                                                    <div key={i} className="flex justify-between items-center p-3 border border-red-800/15 bg-red-900/05">
                                                        <div>
                                                            <p className="text-[#F5E0C0] text-sm font-bold" style={font}>{o.judge_name}</p>
                                                            <p className="text-[10px] text-[#5A4020]" style={font}>Avg: {o.avg_score.toFixed(1)} · z-score: {o.z_score}</p>
                                                        </div>
                                                        <span className={cn('text-[10px] font-black uppercase px-2 py-0.5',
                                                            o.label === 'Generous' ? 'text-emerald-400 bg-emerald-400/10' : 'text-red-400 bg-red-400/10'
                                                        )} style={font}>{o.label}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Repetitive patterns */}
                                    <div className="glass border border-[#C8860A]/12 p-6">
                                        <h3 className="text-lg font-bold mb-3 flex items-center gap-2" style={fontD}>
                                            <AlertTriangle className="w-4 h-4 text-amber-400" /> Suspicious Patterns
                                        </h3>
                                        {gov.judging.repetitive_judges.length === 0 ? (
                                            <p className="text-[#5A4020] text-sm" style={font}>No repetitive scoring patterns detected.</p>
                                        ) : (
                                            <div className="space-y-2">
                                                {gov.judging.repetitive_judges.map((r, i) => (
                                                    <div key={i} className="p-3 border border-amber-800/15 bg-amber-900/05">
                                                        <p className="text-[#F5E0C0] text-sm font-bold" style={font}>{r.judge_name}</p>
                                                        <p className="text-[10px] text-[#5A4020]" style={font}>Only {r.unique_scores} unique scores across {r.total_reviews} reviews</p>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Extreme disagreement photos */}
                                {gov.judging.extreme_disagreement_photos.length > 0 && (
                                    <div className="glass border border-[#C8860A]/12 overflow-hidden">
                                        <div className="p-6 border-b border-[#C8860A]/10">
                                            <h3 className="text-lg font-bold" style={fontD}>Photos with Highest Judge Disagreement</h3>
                                        </div>
                                        <div className="overflow-x-auto">
                                            <table className="w-full">
                                                <thead>
                                                    <tr className="text-left text-[#5A4020] text-[10px] font-black uppercase tracking-[0.2em] border-b border-[#C8860A]/10" style={font}>
                                                        <th className="px-6 py-3">Photo</th>
                                                        <th className="px-6 py-3">Category</th>
                                                        <th className="px-6 py-3">Country</th>
                                                        <th className="px-6 py-3 text-right">Judges</th>
                                                        <th className="px-6 py-3 text-right">Avg</th>
                                                        <th className="px-6 py-3 text-right">StdDev</th>
                                                        <th className="px-6 py-3 text-right">Spread</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {gov.judging.extreme_disagreement_photos.map(p => (
                                                        <tr key={p.photo_id} className="border-b border-[#C8860A]/06 hover:bg-[#C8860A]/03 transition-colors last:border-0">
                                                            <td className="px-6 py-2.5 font-bold text-[#F5E0C0] text-sm" style={font}>{p.photo_title}</td>
                                                            <td className="px-6 py-2.5 text-xs text-[#7A6040] uppercase" style={font}>{p.category}</td>
                                                            <td className="px-6 py-2.5 text-sm text-[#9A7850]" style={font}>{p.country}</td>
                                                            <td className="px-6 py-2.5 text-right font-mono text-[#7A6040]">{p.num_judges}</td>
                                                            <td className="px-6 py-2.5 text-right font-mono text-[#C8A070]">{p.avg_score.toFixed(1)}</td>
                                                            <td className="px-6 py-2.5 text-right font-mono text-red-400 font-bold">{p.stddev.toFixed(2)}</td>
                                                            <td className="px-6 py-2.5 text-right font-mono text-[#F5A623]">{p.spread}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}

                                {/* Category scoring difficulty */}
                                {gov.judging.category_scores.length > 0 && (
                                    <div className="glass border border-[#C8860A]/12 overflow-hidden">
                                        <div className="p-6 border-b border-[#C8860A]/10">
                                            <h3 className="text-lg font-bold" style={fontD}>Category Scoring Difficulty</h3>
                                        </div>
                                        <div className="overflow-x-auto">
                                            <table className="w-full">
                                                <thead>
                                                    <tr className="text-left text-[#5A4020] text-[10px] font-black uppercase tracking-[0.2em] border-b border-[#C8860A]/10" style={font}>
                                                        <th className="px-6 py-3">Category</th>
                                                        <th className="px-6 py-3 text-right">Photos Scored</th>
                                                        <th className="px-6 py-3 text-right">Avg Score</th>
                                                        <th className="px-6 py-3 text-right">StdDev</th>
                                                        <th className="px-6 py-3">Consensus</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {gov.judging.category_scores.map(c => (
                                                        <tr key={c.category} className="border-b border-[#C8860A]/06 hover:bg-[#C8860A]/03 transition-colors last:border-0">
                                                            <td className="px-6 py-2.5 font-bold text-[#F5E0C0] text-sm" style={font}>{c.category}</td>
                                                            <td className="px-6 py-2.5 text-right font-mono text-[#7A6040]">{c.num_photos_scored}</td>
                                                            <td className="px-6 py-2.5 text-right font-mono text-[#F5A623] font-bold">{c.avg_score.toFixed(1)}</td>
                                                            <td className="px-6 py-2.5 text-right font-mono text-[#C8A070]">{c.stddev.toFixed(2)}</td>
                                                            <td className="px-6 py-2.5">
                                                                <span className={cn('text-[10px] font-bold uppercase px-2 py-0.5',
                                                                    c.stddev < 1 ? 'text-emerald-400 bg-emerald-400/10' : c.stddev < 2 ? 'text-amber-400 bg-amber-400/10' : 'text-red-400 bg-red-400/10'
                                                                )} style={font}>
                                                                    {c.stddev < 1 ? 'High Agreement' : c.stddev < 2 ? 'Moderate' : 'High Disagreement'}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}
                            </>)}

                            {/* ── RESULTS & EQUITY ── */}
                            {govSection === 'results' && (<>
                                {/* ── Visual Summary Row ── */}
                                <div className="glass border border-[#C8860A]/12 p-6">
                                    <h3 className="text-sm font-bold text-[#9A7850] uppercase tracking-widest mb-5" style={font}>Visual Overview</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start justify-items-center">
                                        {/* Country concentration donut */}
                                        <div className="flex flex-col items-center">
                                            <Donut
                                                segments={gov.results.top_country_distribution.map((c, i) => ({
                                                    value: c.count,
                                                    color: CHART_COLORS[i % CHART_COLORS.length],
                                                    label: c.country,
                                                }))}
                                                size={130}
                                                label={String(gov.results.countries_in_top_10)}
                                                sublabel="countries"
                                            />
                                            <span className="text-[10px] text-[#5A4020] uppercase tracking-wider mt-2" style={font}>Top 10 Country Mix</span>
                                        </div>
                                        {/* Top 10 score bars */}
                                        <div className="flex flex-col items-center">
                                            <VerticalBars
                                                bars={gov.results.top_10.slice(0, 10).map((p, i) => ({
                                                    label: `#${i + 1}`,
                                                    value: parseFloat(p.avg_score.toFixed(1)),
                                                    color: CHART_COLORS[i % CHART_COLORS.length],
                                                }))}
                                                height={90}
                                            />
                                            <span className="text-[10px] text-[#5A4020] uppercase tracking-wider mt-1" style={font}>Top 10 Avg Scores</span>
                                        </div>
                                        {/* HHI Gauge */}
                                        <div className="flex flex-col items-center">
                                            <ArcGauge
                                                value={gov.results.hhi_concentration}
                                                max={10000}
                                                size={130}
                                                label="HHI concentration"
                                                color={gov.results.hhi_concentration <= 2500 ? '#10b981' : gov.results.hhi_concentration <= 5000 ? '#F5A623' : '#f87171'}
                                            />
                                            <span className="text-[10px] text-[#5A4020] mt-1" style={font}>
                                                {gov.results.hhi_concentration <= 2500 ? 'Well distributed' : gov.results.hhi_concentration <= 5000 ? 'Moderate concentration' : 'High concentration'}
                                            </span>
                                        </div>
                                    </div>
                                    {/* Equity comparison: participation vs prize share */}
                                    {gov.results.country_equity.filter(c => c.top10_count > 0).length > 0 && (
                                        <div className="mt-6 pt-5 border-t border-[#C8860A]/10">
                                            <span className="text-[10px] text-[#5A4020] uppercase tracking-wider block mb-3 text-center" style={font}>Participation % vs Prize % (countries with top-10 entries)</span>
                                            <div className="flex flex-wrap justify-center gap-4">
                                                {gov.results.country_equity.filter(c => c.top10_count > 0).map(c => (
                                                    <div key={c.country} className="flex flex-col items-center gap-1 px-3">
                                                        <div className="flex items-end gap-1" style={{ height: 60 }}>
                                                            <div className="w-3 bg-[#38bdf8]/70 rounded-t-sm" style={{ height: `${Math.max(4, (c.participation_share_pct / Math.max(...gov.results.country_equity.map(e => Math.max(e.participation_share_pct, e.prize_share_pct)), 1)) * 56)}px` }} title={`Participation: ${c.participation_share_pct}%`} />
                                                            <div className="w-3 bg-[#F5A623]/80 rounded-t-sm" style={{ height: `${Math.max(4, (c.prize_share_pct / Math.max(...gov.results.country_equity.map(e => Math.max(e.participation_share_pct, e.prize_share_pct)), 1)) * 56)}px` }} title={`Prize: ${c.prize_share_pct}%`} />
                                                        </div>
                                                        <span className="text-[8px] text-[#7A6040]" style={font}>{c.country.length > 6 ? c.country.slice(0, 5) + '…' : c.country}</span>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="flex justify-center gap-4 mt-2">
                                                <span className="flex items-center gap-1 text-[10px] text-[#7A6040]" style={font}><span className="w-2 h-2 bg-[#38bdf8]/70 inline-block" /> Participation %</span>
                                                <span className="flex items-center gap-1 text-[10px] text-[#7A6040]" style={font}><span className="w-2 h-2 bg-[#F5A623]/80 inline-block" /> Prize %</span>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Top 10 photos */}
                                <div className="glass border border-[#C8860A]/12 overflow-hidden">
                                    <div className="p-6 border-b border-[#C8860A]/10 flex justify-between items-center">
                                        <h3 className="text-lg font-bold" style={fontD}>Top 10 Photos (Current Ranking)</h3>
                                        <div className="flex gap-4 text-xs" style={font}>
                                            <span className="text-[#F5A623]">HHI Concentration: <strong>{gov.results.hhi_concentration}</strong></span>
                                            <span className="text-[#7A6040]">{gov.results.countries_in_top_10} countries in top 10</span>
                                        </div>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="text-left text-[#5A4020] text-[10px] font-black uppercase tracking-[0.2em] border-b border-[#C8860A]/10" style={font}>
                                                    <th className="px-6 py-3">#</th>
                                                    <th className="px-6 py-3">Photo</th>
                                                    <th className="px-6 py-3">Category</th>
                                                    <th className="px-6 py-3">Country</th>
                                                    <th className="px-6 py-3 text-right">Judges</th>
                                                    <th className="px-6 py-3 text-right">Avg Score</th>
                                                    <th className="px-6 py-3 text-right">Spread</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {gov.results.top_10.map((p, i) => (
                                                    <tr key={p.photo_id} className="border-b border-[#C8860A]/06 hover:bg-[#C8860A]/03 transition-colors last:border-0">
                                                        <td className="px-6 py-2.5 text-[#F5A623] font-bold font-mono" style={fontD}>{i + 1}</td>
                                                        <td className="px-6 py-2.5 font-bold text-[#F5E0C0] text-sm" style={font}>{p.photo_title}</td>
                                                        <td className="px-6 py-2.5 text-xs text-[#7A6040] uppercase" style={font}>{p.category}</td>
                                                        <td className="px-6 py-2.5 text-sm text-[#9A7850]" style={font}>{p.country}</td>
                                                        <td className="px-6 py-2.5 text-right font-mono text-[#7A6040]">{p.num_judges}</td>
                                                        <td className="px-6 py-2.5 text-right font-mono text-[#F5A623] font-bold">{p.avg_score.toFixed(1)}</td>
                                                        <td className="px-6 py-2.5 text-right font-mono text-[#5A4020]">{p.spread}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* Winners by category */}
                                {gov.results.winners_by_category.length > 0 && (
                                    <div className="glass border border-[#C8860A]/12 overflow-hidden">
                                        <div className="p-6 border-b border-[#C8860A]/10">
                                            <h3 className="text-lg font-bold" style={fontD}>Leading Photo per Category</h3>
                                        </div>
                                        <div className="overflow-x-auto">
                                            <table className="w-full">
                                                <thead>
                                                    <tr className="text-left text-[#5A4020] text-[10px] font-black uppercase tracking-[0.2em] border-b border-[#C8860A]/10" style={font}>
                                                        <th className="px-6 py-3">Category</th>
                                                        <th className="px-6 py-3">Photo</th>
                                                        <th className="px-6 py-3">Country</th>
                                                        <th className="px-6 py-3 text-right">Avg Score</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {gov.results.winners_by_category.map(w => (
                                                        <tr key={w.category} className="border-b border-[#C8860A]/06 hover:bg-[#C8860A]/03 transition-colors last:border-0">
                                                            <td className="px-6 py-2.5 text-xs text-[#F5A623] uppercase font-bold tracking-wide" style={font}>{w.category}</td>
                                                            <td className="px-6 py-2.5 font-bold text-[#F5E0C0] text-sm" style={font}>{w.photo_title}</td>
                                                            <td className="px-6 py-2.5 text-sm text-[#9A7850]" style={font}>{w.country}</td>
                                                            <td className="px-6 py-2.5 text-right font-mono text-[#F5A623] font-bold">{w.avg_score.toFixed(1)}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}

                                {/* Country equity */}
                                <div className="glass border border-[#C8860A]/12 overflow-hidden">
                                    <div className="p-6 border-b border-[#C8860A]/10">
                                        <h3 className="text-lg font-bold" style={fontD}>Participation vs. Prize Distribution by Country</h3>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="text-left text-[#5A4020] text-[10px] font-black uppercase tracking-[0.2em] border-b border-[#C8860A]/10" style={font}>
                                                    <th className="px-6 py-3">Country</th>
                                                    <th className="px-6 py-3 text-right">Participants</th>
                                                    <th className="px-6 py-3 text-right">Photos</th>
                                                    <th className="px-6 py-3 text-right">Top 10</th>
                                                    <th className="px-6 py-3 text-right">Participation %</th>
                                                    <th className="px-6 py-3 text-right">Prize %</th>
                                                    <th className="px-6 py-3">Balance</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {gov.results.country_equity.map(c => {
                                                    const diff = c.prize_share_pct - c.participation_share_pct;
                                                    return (
                                                        <tr key={c.country} className="border-b border-[#C8860A]/06 hover:bg-[#C8860A]/03 transition-colors last:border-0">
                                                            <td className="px-6 py-2.5 font-bold text-[#F5E0C0] text-sm" style={font}>{c.country}</td>
                                                            <td className="px-6 py-2.5 text-right font-mono text-[#9A7850]">{c.participants}</td>
                                                            <td className="px-6 py-2.5 text-right font-mono text-[#7A6040]">{c.photos}</td>
                                                            <td className="px-6 py-2.5 text-right font-mono text-[#F5A623] font-bold">{c.top10_count}</td>
                                                            <td className="px-6 py-2.5 text-right font-mono text-[#7A6040]">{c.participation_share_pct}%</td>
                                                            <td className="px-6 py-2.5 text-right font-mono text-[#C8A070]">{c.prize_share_pct}%</td>
                                                            <td className="px-6 py-2.5">
                                                                {c.top10_count > 0 && (
                                                                    <span className={cn('text-[10px] font-bold px-2 py-0.5',
                                                                        diff > 10 ? 'text-emerald-400 bg-emerald-400/10' : diff < -10 ? 'text-red-400 bg-red-400/10' : 'text-[#7A6040] bg-[#7A6040]/10'
                                                                    )} style={font}>
                                                                        {diff > 0 ? '+' : ''}{diff.toFixed(1)}pp
                                                                    </span>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* Top country concentration */}
                                <div className="glass border border-[#C8860A]/12 p-6">
                                    <h3 className="text-lg font-bold mb-4" style={fontD}>Geographic Diversity in Top 10</h3>
                                    <div className="flex flex-wrap gap-3">
                                        {gov.results.top_country_distribution.map(c => (
                                            <div key={c.country} className="flex items-center gap-2 px-4 py-2 border border-[#C8860A]/15 bg-[#C8860A]/05">
                                                <span className="text-[#F5E0C0] text-sm font-bold" style={font}>{c.country}</span>
                                                <span className="text-[#F5A623] text-lg font-bold" style={fontD}>{c.count}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mt-4 pt-4 border-t border-[#C8860A]/10">
                                        <p className="text-xs text-[#5A4020]" style={font}>
                                            <strong className="text-[#9A7850]">HHI (Herfindahl-Hirschman Index): {gov.results.hhi_concentration}</strong> —
                                            {gov.results.hhi_concentration <= 2500 ? ' Well distributed (competitive)' : gov.results.hhi_concentration <= 5000 ? ' Moderately concentrated' : ' Highly concentrated (few countries dominate)'}
                                        </p>
                                    </div>
                                </div>

                                {/* Not available metrics notice */}
                                <div className="glass border border-[#C8860A]/12 p-6 border-l-2 border-l-[#5A4020]">
                                    <div className="flex items-start gap-3">
                                        <AlertTriangle className="w-5 h-5 text-[#5A4020] flex-shrink-0 mt-0.5" />
                                        <div>
                                            <h4 className="text-sm font-bold text-[#9A7850] mb-1" style={font}>Additional metrics pending</h4>
                                            <p className="text-xs text-[#5A4020] leading-relaxed" style={font}>
                                                Historical comparison (year-over-year trends), participant/judge satisfaction surveys, NPS scores,
                                                and post-result complaints tracking require additional data collection infrastructure.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </>)}
                        </>)}
                    </div>
                )}
            </div>

            {/* ── CREATE / EDIT MODAL ── */}
            <AnimatePresence>
                {(showCreate || editUser) && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70"
                        onClick={() => { setShowCreate(false); setEditUser(null); }}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                            className="glass border border-[#C8860A]/20 w-full max-w-lg p-8 relative"
                            style={{ clipPath: 'polygon(0 0, 100% 0, 100% 97%, 97% 100%, 0 100%)' }}
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="absolute top-0 left-0 w-full h-0.5 grad-premium" />
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold" style={fontD}>{editUser ? 'Edit User' : 'New User'}</h2>
                                <button onClick={() => { setShowCreate(false); setEditUser(null); }} className="text-[#5A4020] hover:text-[#F5A623] transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={editUser ? handleUpdate : handleCreate} className="space-y-4">
                                {[
                                    { key: 'full_name', label: 'Full Name', type: 'text', required: true },
                                    { key: 'email', label: 'Email', type: 'email', required: true },
                                    { key: 'password', label: editUser ? 'New Password (leave blank to keep)' : 'Password', type: 'password', required: !editUser },
                                    { key: 'country', label: 'Country', type: 'text', required: false },
                                    { key: 'mensa_number', label: 'Mensa Number', type: 'text', required: false },
                                ].map(f => (
                                    <div key={f.key}>
                                        <label className="text-xs font-bold text-[#C8A070] uppercase tracking-[0.15em] mb-1 block" style={font}>{f.label}</label>
                                        <input
                                            type={f.type}
                                            required={f.required}
                                            value={(formData as unknown as Record<string, string>)[f.key] ?? ''}
                                            onChange={e => setFormData(p => ({ ...p, [f.key]: e.target.value }))}
                                            className="w-full bg-[#120700] border border-[#C8860A]/20 px-4 py-3 text-[#F5E0C0] placeholder-[#3A2A10] focus:outline-none focus:border-[#F5A623]/50 transition-all text-sm"
                                            style={font}
                                        />
                                    </div>
                                ))}

                                <div>
                                    <label className="text-xs font-bold text-[#C8A070] uppercase tracking-[0.15em] mb-1 block" style={font}>Role</label>
                                    <select
                                        value={formData.role}
                                        onChange={e => setFormData(p => ({ ...p, role: e.target.value }))}
                                        className="w-full bg-[#120700] border border-[#C8860A]/20 px-4 py-3 text-[#F5E0C0] focus:outline-none focus:border-[#F5A623]/50 transition-all text-sm"
                                        style={font}
                                    >
                                        {ROLES_LIST.map(r => <option key={r} value={r}>{r.replace('_', ' ')}</option>)}
                                    </select>
                                </div>

                                {editUser && (
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="checkbox"
                                            id="is_active"
                                            checked={(formData as UserUpdatePayload).is_active !== false}
                                            onChange={e => setFormData(p => ({ ...p, is_active: e.target.checked } as unknown as UserCreatePayload))}
                                            className="w-4 h-4"
                                        />
                                        <label htmlFor="is_active" className="text-sm text-[#C8A070]" style={font}>Active account</label>
                                    </div>
                                )}

                                {formError && <p className="text-red-400 text-xs border border-red-800/30 bg-red-900/10 px-3 py-2" style={font}>{formError}</p>}

                                <div className="flex gap-3 pt-2">
                                    <button type="button" onClick={() => { setShowCreate(false); setEditUser(null); }}
                                        className="flex-1 py-3 border border-[#C8860A]/20 text-[#C8A070] hover:border-[#F5A623]/40 hover:text-[#F5A623] transition-all text-sm font-bold" style={font}>
                                        Cancel
                                    </button>
                                    <button type="submit" disabled={saving}
                                        className="flex-1 py-3 grad-premium text-[#080300] font-bold text-sm disabled:opacity-60 flex items-center justify-center gap-2" style={font}>
                                        <Check className="w-4 h-4" />
                                        {saving ? 'Saving…' : editUser ? 'Save Changes' : 'Create User'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── DELETE CONFIRM MODAL ── */}
            <AnimatePresence>
                {deleteUser && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70"
                        onClick={() => setDeleteUser(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                            className="glass border border-red-800/30 w-full max-w-sm p-8"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <Trash2 className="w-6 h-6 text-red-400" />
                                <h2 className="text-xl font-bold" style={fontD}>Delete User</h2>
                            </div>
                            <p className="text-[#9A7850] text-sm mb-1" style={font}>This action is <strong className="text-red-400">irreversible</strong>. Delete:</p>
                            <p className="text-[#F5E0C0] font-bold mb-6" style={font}>{deleteUser.full_name} <span className="text-[#5A4020] font-normal">({deleteUser.email})</span></p>
                            <div className="flex gap-3">
                                <button onClick={() => setDeleteUser(null)} className="flex-1 py-3 border border-[#C8860A]/20 text-[#C8A070] hover:text-[#F5A623] transition-all text-sm font-bold" style={font}>
                                    Cancel
                                </button>
                                <button onClick={handleDelete} disabled={saving} className="flex-1 py-3 bg-red-900/50 border border-red-800/40 text-red-300 hover:bg-red-900/70 transition-all text-sm font-bold disabled:opacity-60" style={font}>
                                    {saving ? 'Deleting…' : 'Yes, Delete'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </main>
        </>
    );
}

/* ═══════════════════════════════════════════════════════════════════════════
   CHART COMPONENTS — pure SVG, zero dependencies, design-system colors
   ═══════════════════════════════════════════════════════════════════════════ */

const CHART_COLORS = ['#F5A623', '#E8760A', '#C8860A', '#10b981', '#38bdf8', '#a78bfa', '#f87171', '#facc15', '#34d399', '#818cf8'];

function Donut({ segments, size = 120, stroke = 14, label, sublabel }: {
    segments: { value: number; color: string; label?: string }[];
    size?: number; stroke?: number; label?: string; sublabel?: string;
}) {
    const r = (size - stroke) / 2;
    const circ = 2 * Math.PI * r;
    const total = segments.reduce((s, seg) => s + seg.value, 0);
    let offset = 0;
    return (
        <div className="flex flex-col items-center gap-1">
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(200,134,10,0.08)" strokeWidth={stroke} />
                {total > 0 && segments.map((seg, i) => {
                    const pct = seg.value / total;
                    const dashLen = pct * circ;
                    const el = (
                        <circle key={i} cx={size / 2} cy={size / 2} r={r} fill="none"
                            stroke={seg.color} strokeWidth={stroke} strokeLinecap="butt"
                            strokeDasharray={`${dashLen} ${circ - dashLen}`}
                            strokeDashoffset={-offset}
                            transform={`rotate(-90 ${size / 2} ${size / 2})`}
                            style={{ transition: 'stroke-dasharray 0.6s ease' }}
                        />
                    );
                    offset += dashLen;
                    return el;
                })}
                {label && (
                    <>
                        <text x={size / 2} y={size / 2 - (sublabel ? 4 : 0)} textAnchor="middle" dominantBaseline="central"
                            fill="#F5E0C0" fontSize={size * 0.2} fontWeight="bold" fontFamily="var(--font-oswald)">{label}</text>
                        {sublabel && <text x={size / 2} y={size / 2 + size * 0.14} textAnchor="middle" dominantBaseline="central"
                            fill="#7A6040" fontSize={size * 0.1} fontFamily="var(--font-barlow)">{sublabel}</text>}
                    </>
                )}
            </svg>
            {segments.length > 1 && total > 0 && (
                <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 mt-1">
                    {segments.filter(s => s.value > 0).map((seg, i) => (
                        <span key={i} className="flex items-center gap-1 text-[10px] text-[#7A6040]" style={{ fontFamily: 'var(--font-barlow)' }}>
                            <span className="w-2 h-2 inline-block flex-shrink-0" style={{ background: seg.color }} />
                            {seg.label ?? ''} {seg.value}
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
}

function VerticalBars({ bars, height = 100 }: {
    bars: { label: string; value: number; color?: string }[];
    height?: number;
}) {
    const max = Math.max(...bars.map(b => b.value), 1);
    const barW = Math.max(16, Math.min(32, 280 / bars.length));
    const gap = Math.max(4, Math.min(8, 120 / bars.length));
    const totalW = bars.length * (barW + gap) - gap;
    return (
        <div className="flex flex-col items-center">
            <svg width={totalW + 20} height={height + 28} viewBox={`0 0 ${totalW + 20} ${height + 28}`}>
                {bars.map((b, i) => {
                    const bh = max > 0 ? (b.value / max) * height : 0;
                    const x = 10 + i * (barW + gap);
                    return (
                        <g key={i}>
                            <rect x={x} y={height - bh} width={barW} height={bh} fill={b.color ?? CHART_COLORS[i % CHART_COLORS.length]}
                                rx={2} style={{ transition: 'height 0.5s ease, y 0.5s ease' }} />
                            <text x={x + barW / 2} y={height + 12} textAnchor="middle" fill="#5A4020"
                                fontSize="8" fontFamily="var(--font-barlow)">{b.label.length > 6 ? b.label.slice(0, 5) + '…' : b.label}</text>
                            <text x={x + barW / 2} y={height - bh - 4} textAnchor="middle" fill="#9A7850"
                                fontSize="9" fontWeight="bold" fontFamily="var(--font-oswald)">{b.value}</text>
                        </g>
                    );
                })}
            </svg>
        </div>
    );
}

function DotStrip({ points, mean, min = 0, max = 10, height = 48, width = 320 }: {
    points: { value: number; label: string; color?: string }[];
    mean: number; min?: number; max?: number; height?: number; width?: number;
}) {
    const pad = 20;
    const usable = width - pad * 2;
    const scale = (v: number) => pad + ((v - min) / (max - min)) * usable;
    return (
        <svg width={width} height={height + 20} viewBox={`0 0 ${width} ${height + 20}`}>
            {/* axis */}
            <line x1={pad} y1={height / 2} x2={width - pad} y2={height / 2} stroke="rgba(200,134,10,0.15)" strokeWidth={1} />
            {[0, 2.5, 5, 7.5, 10].map(v => (
                <g key={v}>
                    <line x1={scale(v)} y1={height / 2 - 4} x2={scale(v)} y2={height / 2 + 4} stroke="rgba(200,134,10,0.2)" strokeWidth={1} />
                    <text x={scale(v)} y={height + 12} textAnchor="middle" fill="#5A4020" fontSize="8" fontFamily="var(--font-barlow)">{v}</text>
                </g>
            ))}
            {/* mean line */}
            <line x1={scale(mean)} y1={4} x2={scale(mean)} y2={height - 4} stroke="#F5A623" strokeWidth={2} strokeDasharray="4 3" />
            <text x={scale(mean)} y={2} textAnchor="middle" fill="#F5A623" fontSize="8" fontWeight="bold" fontFamily="var(--font-barlow)">avg {mean.toFixed(1)}</text>
            {/* dots */}
            {points.map((p, i) => {
                const cx = scale(Math.max(min, Math.min(max, p.value)));
                const cy = height / 2 + (i % 2 === 0 ? -10 : 10) + (i % 3) * 3 - 4;
                return (
                    <g key={i}>
                        <circle cx={cx} cy={cy} r={5} fill={p.color ?? '#C8860A'} fillOpacity={0.8} stroke="#080300" strokeWidth={1}>
                            <title>{p.label}: {p.value.toFixed(1)}</title>
                        </circle>
                    </g>
                );
            })}
        </svg>
    );
}

function ArcGauge({ value, max = 100, size = 110, label, color = '#F5A623' }: {
    value: number; max?: number; size?: number; label?: string; color?: string;
}) {
    const r = (size - 16) / 2;
    const halfCirc = Math.PI * r;
    const pct = Math.min(value / max, 1);
    const dashLen = pct * halfCirc;
    return (
        <div className="flex flex-col items-center gap-1">
            <svg width={size} height={size * 0.6} viewBox={`0 0 ${size} ${size * 0.6}`}>
                <path d={`M 8 ${size * 0.55} A ${r} ${r} 0 0 1 ${size - 8} ${size * 0.55}`}
                    fill="none" stroke="rgba(200,134,10,0.1)" strokeWidth={10} strokeLinecap="round" />
                <path d={`M 8 ${size * 0.55} A ${r} ${r} 0 0 1 ${size - 8} ${size * 0.55}`}
                    fill="none" stroke={color} strokeWidth={10} strokeLinecap="round"
                    strokeDasharray={`${dashLen} ${halfCirc}`}
                    style={{ transition: 'stroke-dasharray 0.6s ease' }} />
                <text x={size / 2} y={size * 0.5} textAnchor="middle" dominantBaseline="central"
                    fill="#F5E0C0" fontSize={size * 0.22} fontWeight="bold" fontFamily="var(--font-oswald)">
                    {typeof value === 'number' ? (Number.isInteger(value) ? value : value.toFixed(1)) : value}
                </text>
            </svg>
            {label && <span className="text-[10px] text-[#7A6040] uppercase tracking-wider" style={{ fontFamily: 'var(--font-barlow)' }}>{label}</span>}
        </div>
    );
}

function StackedHBar({ segments, width = 260, height = 24 }: {
    segments: { value: number; color: string; label?: string }[];
    width?: number; height?: number;
}) {
    const total = segments.reduce((s, seg) => s + seg.value, 0);
    let x = 0;
    return (
        <div className="flex flex-col items-center gap-1.5">
            <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
                <rect x={0} y={0} width={width} height={height} fill="rgba(200,134,10,0.06)" rx={3} />
                {total > 0 && segments.map((seg, i) => {
                    const w = (seg.value / total) * width;
                    const el = <rect key={i} x={x} y={0} width={w} height={height} fill={seg.color} rx={i === 0 ? 3 : 0}
                        style={{ transition: 'width 0.5s ease' }}><title>{seg.label}: {seg.value}</title></rect>;
                    x += w;
                    return el;
                })}
            </svg>
            <div className="flex flex-wrap justify-center gap-x-3 gap-y-1">
                {segments.filter(s => s.value > 0).map((seg, i) => (
                    <span key={i} className="flex items-center gap-1 text-[10px] text-[#7A6040]" style={{ fontFamily: 'var(--font-barlow)' }}>
                        <span className="w-2 h-2 inline-block flex-shrink-0" style={{ background: seg.color }} /> {seg.label} ({seg.value})
                    </span>
                ))}
            </div>
        </div>
    );
}
