'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from '@/components/Navbar';
import { Star, ChevronRight, ChevronLeft, Maximize2, AlertCircle, ClipboardList, Camera, Pencil, Check, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useRouteGuard } from '@/components/RouteGuard';
import { apiGetPhotos, apiScorePhoto, apiGetMyEvaluations, photoUrl, ApiPhoto, MyEvaluation } from '@/lib/api';

// Use thumbnail when available, fall back to full image
const thumbOrFull = (photo: ApiPhoto) =>
    photoUrl((photo as ApiPhoto & { thumbnail_path?: string | null }).thumbnail_path ?? photo.file_path);

const font = { fontFamily: 'var(--font-barlow)' };
const fontDisplay = { fontFamily: 'var(--font-oswald)' };
const fontBody = { fontFamily: 'var(--font-garamond)' };

const emptyScores = () => ({ impact: 1, story: 1, creativity: 1, composition: 1, technique: 1 });

type Tab = 'evaluate' | 'summary';

export default function JudgePage() {
    const authorized = useRouteGuard();

    const [photos, setPhotos] = useState<ApiPhoto[]>([]);
    const [evaluations, setEvaluations] = useState<Map<number, MyEvaluation>>(new Map());
    const [loading, setLoading] = useState(true);
    const [fetchError, setFetchError] = useState('');
    const [currentIndex, setCurrentIndex] = useState(0);
    const [scores, setScores] = useState(emptyScores());
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState('');
    const [lightbox, setLightbox] = useState(false);
    const [tab, setTab] = useState<Tab>('evaluate');
    const [editing, setEditing] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);

    useEffect(() => {
        if (!authorized) return;
        Promise.all([apiGetPhotos(), apiGetMyEvaluations()])
            .then(([p, evals]) => {
                setPhotos(p);
                const evalMap = new Map<number, MyEvaluation>();
                evals.forEach(ev => evalMap.set(ev.photo_id, ev));
                setEvaluations(evalMap);
                // Auto-advance to first unevaluated photo
                const firstPending = p.findIndex(ph => !evalMap.has(ph.id));
                if (firstPending >= 0) setCurrentIndex(firstPending);
            })
            .catch(e => setFetchError(e.message))
            .finally(() => setLoading(false));
    }, [authorized]);

    const currentPhoto: ApiPhoto | undefined = photos[currentIndex];
    const imgSrc = currentPhoto ? photoUrl(currentPhoto.file_path) : null;
    const currentEval = currentPhoto ? evaluations.get(currentPhoto.id) : undefined;
    const isEvaluated = !!currentEval;
    const evaluatedCount = evaluations.size;
    const pendingCount = photos.length - evaluatedCount;

    // When navigating to a photo, load its existing scores or reset
    const navigateTo = useCallback((index: number) => {
        setCurrentIndex(index);
        setEditing(false);
        setSaveSuccess(false);
        setSubmitError('');
        const photo = photos[index];
        if (!photo) return;
        const ev = evaluations.get(photo.id);
        if (ev) {
            setScores({ impact: ev.impact, story: ev.story, creativity: ev.creativity, composition: ev.composition, technique: ev.technique });
            setComment(ev.comment ?? '');
        } else {
            setScores(emptyScores());
            setComment('');
        }
    }, [photos, evaluations]);

    const handleScore = (key: keyof ReturnType<typeof emptyScores>, val: number) =>
        setScores(prev => ({ ...prev, [key]: val }));

    const submitScore = async () => {
        if (!currentPhoto) return;
        setSubmitting(true); setSubmitError(''); setSaveSuccess(false);
        try {
            await apiScorePhoto(currentPhoto.id, { ...scores, comment });
            // Update local evaluations map
            const newEval: MyEvaluation = {
                score_id: currentEval?.score_id ?? 0,
                photo_id: currentPhoto.id,
                photo_title: currentPhoto.title,
                photo_category: currentPhoto.category,
                photo_file_path: currentPhoto.file_path,
                impact: scores.impact,
                story: scores.story,
                creativity: scores.creativity,
                composition: scores.composition,
                technique: scores.technique,
                total_score: (scores.impact + scores.story + scores.creativity + scores.composition + scores.technique) / 5,
                comment,
                created_at: new Date().toISOString(),
            };
            setEvaluations(prev => new Map(prev).set(currentPhoto.id, newEval));

            if (editing) {
                // Was editing existing → show success, stay on photo
                setEditing(false);
                setSaveSuccess(true);
                setTimeout(() => setSaveSuccess(false), 2500);
            } else {
                // New evaluation → advance to next unevaluated
                const nextPending = photos.findIndex((ph, i) => i > currentIndex && !evaluations.has(ph.id) && ph.id !== currentPhoto.id);
                if (nextPending >= 0) {
                    navigateTo(nextPending);
                } else {
                    setSaveSuccess(true);
                    setTimeout(() => setSaveSuccess(false), 2500);
                }
            }
        } catch (err: unknown) {
            setSubmitError(err instanceof Error ? err.message : 'Failed to submit score');
        } finally {
            setSubmitting(false);
        }
    };

    const startEditing = () => {
        if (!currentEval) return;
        setScores({ impact: currentEval.impact, story: currentEval.story, creativity: currentEval.creativity, composition: currentEval.composition, technique: currentEval.technique });
        setComment(currentEval.comment ?? '');
        setEditing(true);
        setSaveSuccess(false);
    };

    // Navigate to a photo from summary tab
    const goToPhotoFromSummary = (photoId: number) => {
        const idx = photos.findIndex(p => p.id === photoId);
        if (idx >= 0) {
            navigateTo(idx);
            setEditing(true);
            setTab('evaluate');
        }
    };

    if (!authorized) return null;

    if (loading) {
        return (
            <main className="h-screen bg-[#080300] flex flex-col items-center justify-center" style={{ color: '#F5E0C0' }}>
                <Navbar />
                <p className="text-[#5A4020] mt-32" style={font}>Loading photos from database…</p>
            </main>
        );
    }

    if (fetchError) {
        return (
            <main className="h-screen bg-[#080300] flex flex-col items-center justify-center" style={{ color: '#F5E0C0' }}>
                <Navbar />
                <div className="mt-32 flex items-center gap-3 text-red-400">
                    <AlertCircle className="w-5 h-5" />
                    <span style={font}>{fetchError}</span>
                </div>
                <p className="mt-3 text-[#5A4020] text-sm" style={font}>Make sure the backend is running on port 5001.</p>
            </main>
        );
    }

    if (photos.length === 0) {
        return (
            <main className="h-screen bg-[#080300] flex flex-col items-center justify-center" style={{ color: '#F5E0C0' }}>
                <Navbar />
                <p className="mt-32 text-[#5A4020]" style={font}>No photos in the database yet.</p>
            </main>
        );
    }

    // Determine if sliders should be interactive
    const slidersDisabled = isEvaluated && !editing;

    return (
        <>
            {/* Lightbox */}
            {lightbox && imgSrc && (
                <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center cursor-zoom-out" onClick={() => setLightbox(false)}>
                    <img src={imgSrc} alt="Full size" className="max-w-full max-h-full object-contain" />
                </div>
            )}

            <main className="h-screen bg-[#080300] flex flex-col" style={{ color: '#F5E0C0' }}>
                <Navbar />
                <div className="flex-1 pt-16 flex flex-col overflow-hidden">

                    {/* Tab bar */}
                    <div className="flex border-b border-[#C8860A]/10 px-6">
                        {([
                            { key: 'evaluate' as Tab, label: 'Evaluate', icon: <Camera className="w-4 h-4" />, count: pendingCount > 0 ? `${pendingCount} pending` : undefined },
                            { key: 'summary' as Tab, label: 'My Evaluations', icon: <ClipboardList className="w-4 h-4" />, count: evaluatedCount > 0 ? `${evaluatedCount}` : undefined },
                        ]).map(t => (
                            <button
                                key={t.key}
                                onClick={() => setTab(t.key)}
                                className={cn(
                                    'flex items-center gap-2 px-5 py-3 text-sm font-bold uppercase tracking-widest transition-all border-b-2 -mb-px',
                                    tab === t.key
                                        ? 'border-[#F5A623] text-[#F5A623]'
                                        : 'border-transparent text-[#5A4020] hover:text-[#9A7850]'
                                )}
                                style={font}
                            >
                                {t.icon} {t.label}
                                {t.count && (
                                    <span className={cn(
                                        'ml-1 px-2 py-0.5 text-[10px] font-bold',
                                        tab === t.key ? 'bg-[#F5A623]/15 text-[#F5A623]' : 'bg-[#C8860A]/10 text-[#7A6040]'
                                    )}>{t.count}</span>
                                )}
                            </button>
                        ))}
                    </div>

                    {/* ═══ EVALUATE TAB ═══ */}
                    {tab === 'evaluate' && (
                        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
                            {/* Photo area */}
                            <div className="relative bg-black flex items-center justify-center p-4 md:p-8 group"
                                 style={{ minHeight: '40vh', flex: '1 1 auto' }}>
                                <AnimatePresence mode="wait">
                                    {imgSrc ? (
                                        <motion.img
                                            key={currentPhoto.id}
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 1.05 }}
                                            transition={{ duration: 0.4 }}
                                            src={imgSrc}
                                            alt="Judging Preview"
                                            className="max-w-full max-h-full object-contain shadow-2xl cursor-zoom-in"
                                            onClick={() => setLightbox(true)}
                                        />
                                    ) : (
                                        <motion.div
                                            key={currentPhoto?.id}
                                            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                            className="flex flex-col items-center gap-4 text-[#3A2A10]"
                                        >
                                            <Star className="w-16 h-16" />
                                            <p className="text-sm" style={font}>Photo file not available — evaluating blind</p>
                                            <p className="text-xs text-[#2A1A08]" style={font}>Title: {currentPhoto?.title ?? 'Untitled'}</p>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {imgSrc && (
                                    <button onClick={() => setLightbox(true)} className="absolute top-12 right-12 p-3 bg-white/5 hover:bg-white/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Maximize2 className="w-6 h-6" />
                                    </button>
                                )}

                                {/* Status badge */}
                                {isEvaluated && !editing && (
                                    <div className="absolute top-12 left-12 flex items-center gap-2 glass px-4 py-2 border border-green-700/30">
                                        <Check className="w-4 h-4 text-green-500" />
                                        <span className="text-green-400 text-xs font-bold uppercase tracking-widest" style={font}>Evaluated</span>
                                    </div>
                                )}
                                {editing && (
                                    <div className="absolute top-12 left-12 flex items-center gap-2 glass px-4 py-2 border border-[#F5A623]/30">
                                        <Pencil className="w-4 h-4 text-[#F5A623]" />
                                        <span className="text-[#F5A623] text-xs font-bold uppercase tracking-widest" style={font}>Editing</span>
                                    </div>
                                )}

                                <div className="absolute bottom-12 left-1/2 -translate-x-1/2 glass px-6 py-2 border border-[#C8860A]/20 text-xs font-mono tracking-widest text-[#7A6040]">
                                    {currentIndex + 1} / {photos.length}
                                </div>
                            </div>

                            {/* Judging Panel */}
                            <div className="w-full md:w-96 border-t md:border-t-0 md:border-l border-[#C8860A]/15 glass flex flex-col overflow-y-auto">
                                <div className="p-8 pb-4">
                                    <span className="text-[#F5A623] text-xs font-bold uppercase tracking-[0.2em] mb-2 block" style={font}>Blind Judging Session</span>
                                    <h2 className="text-2xl font-bold mb-1" style={fontDisplay}>SPARK OF EVOLUTION</h2>
                                    <p className="text-[#7A6040] text-sm" style={font}>
                                        {currentPhoto?.category ?? 'General'}
                                    </p>
                                    <div className="flex gap-4 mt-3 text-xs" style={font}>
                                        <span className="text-[#F5A623] font-bold">{evaluatedCount} evaluated</span>
                                        <span className="text-[#5A4020]">{pendingCount} pending</span>
                                    </div>
                                </div>

                                {/* Already evaluated read-only state */}
                                {isEvaluated && !editing ? (
                                    <div className="px-8 flex-1 flex flex-col">
                                        <div className="space-y-4 flex-1">
                                            <div className="border border-green-800/20 bg-green-900/10 p-4">
                                                <div className="flex items-center gap-2 mb-3">
                                                    <Lock className="w-4 h-4 text-green-500" />
                                                    <span className="text-green-400 text-xs font-bold uppercase tracking-widest" style={font}>Already Scored</span>
                                                </div>
                                                <div className="grid grid-cols-5 gap-2">
                                                    {([
                                                        { key: 'impact',      label: 'Theme'    },
                                                        { key: 'story',       label: 'Emotion'  },
                                                        { key: 'creativity',  label: 'Creative' },
                                                        { key: 'composition', label: 'Comp.'    },
                                                        { key: 'technique',   label: 'Tech.'    },
                                                    ] as const).map(({ key, label }) => (
                                                        <div key={key} className="text-center">
                                                            <p className="text-[#5A4020] text-[9px] uppercase tracking-wider mb-1" style={font}>{label}</p>
                                                            <p className="text-[#F5A623] text-lg font-bold" style={fontDisplay}>{currentEval[key]}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                                <div className="mt-3 pt-3 border-t border-green-800/20 text-center">
                                                    <span className="text-[#F5A623] text-2xl font-bold" style={fontDisplay}>
                                                        {currentEval.total_score.toFixed(1)}
                                                    </span>
                                                    <span className="text-[#5A4020] text-sm ml-1" style={font}>/ 10 avg</span>
                                                </div>
                                                {currentEval.comment && (
                                                    <p className="mt-3 text-[#7A6040] text-xs italic border-t border-green-800/20 pt-3" style={fontBody}>
                                                        &ldquo;{currentEval.comment}&rdquo;
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="py-6">
                                            <button
                                                onClick={startEditing}
                                                className="w-full py-3 border border-[#C8860A]/30 text-[#C8A070] hover:text-[#F5A623] hover:border-[#F5A623]/50 transition-all font-bold uppercase tracking-widest text-sm flex items-center justify-center gap-2"
                                                style={font}
                                            >
                                                <Pencil className="w-4 h-4" /> Edit Scores
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    /* Scoring form (new or editing) */
                                    <>
                                        <div className="px-8 space-y-5 flex-1">
                                            <ScoreSlider label="Relevance to Theme" description="How well the image captures the spirit of &ldquo;Spark of Evolution&rdquo;" value={scores.impact} onChange={v => handleScore('impact', v)} disabled={slidersDisabled} />
                                            <ScoreSlider label="Emotional Impact" description="Power of the image to evoke emotions or a strong reaction" value={scores.story} onChange={v => handleScore('story', v)} disabled={slidersDisabled} />
                                            <ScoreSlider label="Creativity & Original Vision" description="Originality and creative interpretation of the theme" value={scores.creativity} onChange={v => handleScore('creativity', v)} disabled={slidersDisabled} />
                                            <ScoreSlider label="Composition & Visual Balance" description="Use of framing, light, space and visual harmony" value={scores.composition} onChange={v => handleScore('composition', v)} disabled={slidersDisabled} />
                                            <ScoreSlider label="Technical Execution" description="Sharpness, exposure, colour accuracy and technical quality" value={scores.technique} onChange={v => handleScore('technique', v)} disabled={slidersDisabled} />

                                            <div>
                                                <label className="text-xs font-bold text-[#7A6040] uppercase tracking-[0.15em] mb-2 block" style={font}>Comment (optional)</label>
                                                <textarea
                                                    value={comment}
                                                    onChange={e => setComment(e.target.value)}
                                                    rows={3}
                                                    placeholder="Notes for this photo…"
                                                    className="w-full bg-[#120700] border border-[#C8860A]/15 px-3 py-2 text-sm text-[#F5E0C0] placeholder-[#2A1A08] focus:outline-none focus:border-[#C8860A]/40 resize-none transition-all"
                                                    style={font}
                                                />
                                            </div>

                                            <div className="text-center py-1">
                                                <span className="text-[#F5A623] text-2xl font-bold" style={fontDisplay}>
                                                    {((scores.impact + scores.story + scores.creativity + scores.composition + scores.technique) / 5).toFixed(1)}
                                                </span>
                                                <span className="text-[#5A4020] text-sm ml-1" style={font}>/ 10 avg</span>
                                            </div>

                                            {submitError && (
                                                <p className="text-red-400 text-xs border border-red-800/30 bg-red-900/10 px-3 py-2" style={font}>{submitError}</p>
                                            )}

                                            {saveSuccess && (
                                                <div className="flex items-center gap-2 text-green-400 text-xs border border-green-800/30 bg-green-900/10 px-3 py-2" style={font}>
                                                    <Check className="w-3.5 h-3.5" /> Scores saved successfully
                                                </div>
                                            )}
                                        </div>

                                        <div className="p-8 pt-4 space-y-3">
                                            <button
                                                onClick={submitScore}
                                                disabled={submitting}
                                                className="w-full py-4 grad-premium text-[#080300] font-bold flex items-center justify-center gap-2 glow-gold hover:opacity-90 transition-all disabled:opacity-60"
                                                style={{ ...font, clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 100%, 8px 100%)' }}
                                            >
                                                {submitting ? 'Saving…' : editing ? 'Update Scores' : 'Submit & Next'}
                                                {!submitting && <ChevronRight className="w-5 h-5" />}
                                            </button>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => { if (currentIndex > 0) navigateTo(currentIndex - 1); }}
                                                    disabled={currentIndex === 0}
                                                    className="flex-1 py-3 border border-[#C8860A]/15 text-sm text-[#7A6040] hover:text-[#C8A070] transition-all flex items-center justify-center gap-1 disabled:opacity-30"
                                                    style={font}
                                                >
                                                    <ChevronLeft className="w-4 h-4" /> Previous
                                                </button>
                                                <button
                                                    onClick={() => { if (currentIndex < photos.length - 1) navigateTo(currentIndex + 1); }}
                                                    disabled={currentIndex === photos.length - 1}
                                                    className="flex-1 py-3 border border-[#C8860A]/15 text-sm text-[#7A6040] hover:text-[#C8A070] transition-all flex items-center justify-center gap-1 disabled:opacity-30"
                                                    style={font}
                                                >
                                                    Next <ChevronRight className="w-4 h-4" />
                                                </button>
                                            </div>
                                            {editing && (
                                                <button
                                                    onClick={() => { setEditing(false); }}
                                                    className="w-full py-2 text-[#5A4020] hover:text-[#9A7850] text-xs uppercase tracking-widest transition-all"
                                                    style={font}
                                                >
                                                    Cancel Editing
                                                </button>
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    )}

                    {/* ═══ MY EVALUATIONS TAB ═══ */}
                    {tab === 'summary' && (
                        <div className="flex-1 overflow-y-auto p-4 lg:p-10">
                            <div className="max-w-5xl mx-auto overflow-x-auto">
                                <div className="mb-8">
                                    <h2 className="text-3xl font-bold text-white mb-2" style={fontDisplay}>My Evaluations</h2>
                                    <p className="text-[#7A6040] text-sm" style={fontBody}>
                                        {evaluatedCount} of {photos.length} photos evaluated. Click any row to edit scores.
                                    </p>
                                </div>

                                {evaluatedCount === 0 ? (
                                    <div className="text-center py-20">
                                        <ClipboardList className="w-12 h-12 text-[#3A2A10] mx-auto mb-4" />
                                        <p className="text-[#5A4020]" style={font}>No evaluations yet. Start evaluating in the Evaluate tab.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {/* Header */}
                                        <div className="grid grid-cols-[40px_1fr_56px_56px_60px_56px_56px_64px_60px] gap-2 px-4 py-2 text-[10px] font-bold text-[#5A4020] uppercase tracking-widest" style={font}>
                                            <span></span>
                                            <span>Photo</span>
                                            <span className="text-center">Theme</span>
                                            <span className="text-center">Emo.</span>
                                            <span className="text-center">Creative</span>
                                            <span className="text-center">Comp.</span>
                                            <span className="text-center">Tech.</span>
                                            <span className="text-center">Avg</span>
                                            <span className="text-center">Action</span>
                                        </div>

                                        {Array.from(evaluations.entries()).map(([photoId, ev]) => {
                                            const photoObj = photos.find(p => p.id === photoId);
                                            const thumbSrc = photoUrl(photoObj?.thumbnail_path ?? ev.photo_file_path);
                                            return (
                                                <motion.div
                                                    key={photoId}
                                                    initial={{ opacity: 0, y: 8 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    className="grid grid-cols-[40px_1fr_56px_56px_60px_56px_56px_64px_60px] gap-2 items-center px-4 py-3 glass border border-[#C8860A]/10 hover:border-[#C8860A]/30 transition-all group"
                                                >
                                                    {/* Thumbnail */}
                                                    <div className="w-12 h-12 bg-[#120700] overflow-hidden flex-shrink-0">
                                                        {thumbSrc ? (
                                                            <img src={thumbSrc} alt="" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-[#3A2A10]"><Camera className="w-4 h-4" /></div>
                                                        )}
                                                    </div>

                                                    {/* Info */}
                                                    <div className="min-w-0">
                                                        <p className="text-white text-sm font-bold truncate" style={fontDisplay}>
                                                            {ev.photo_title ?? 'Untitled'}
                                                        </p>
                                                        <p className="text-[#5A4020] text-xs" style={font}>{ev.photo_category ?? 'General'}</p>
                                                    </div>

                                                    {/* Scores */}
                                                    {(['impact', 'story', 'creativity', 'composition', 'technique'] as const).map(key => (
                                                        <div key={key} className="text-center">
                                                            <span className="text-[#F5E0C0] text-sm font-bold" style={fontDisplay}>{ev[key]}</span>
                                                        </div>
                                                    ))}

                                                    {/* Average */}
                                                    <div className="text-center">
                                                        <span className="text-[#F5A623] text-sm font-bold" style={fontDisplay}>{ev.total_score.toFixed(1)}</span>
                                                    </div>

                                                    {/* Edit button */}
                                                    <div className="text-center">
                                                        <button
                                                            onClick={() => goToPhotoFromSummary(photoId)}
                                                            className="p-2 border border-[#C8860A]/20 text-[#7A6040] hover:text-[#F5A623] hover:border-[#F5A623]/40 transition-all"
                                                            title="Edit scores"
                                                        >
                                                            <Pencil className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                </motion.div>
                                            );
                                        })}

                                        {/* Stats footer */}
                                        <div className="mt-6 pt-6 border-t border-[#C8860A]/10 flex gap-8 justify-center text-sm" style={font}>
                                            <div className="text-center">
                                                <p className="text-[#5A4020] text-xs uppercase tracking-wider mb-1">Average Score Given</p>
                                                <p className="text-[#F5A623] text-2xl font-bold" style={fontDisplay}>
                                                    {(Array.from(evaluations.values()).reduce((sum, ev) => sum + ev.total_score, 0) / evaluations.size).toFixed(1)}
                                                </p>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-[#5A4020] text-xs uppercase tracking-wider mb-1">Total Evaluated</p>
                                                <p className="text-white text-2xl font-bold" style={fontDisplay}>{evaluatedCount}</p>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-[#5A4020] text-xs uppercase tracking-wider mb-1">Remaining</p>
                                                <p className="text-white text-2xl font-bold" style={fontDisplay}>{pendingCount}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </>
    );
}

const ScoreSlider = ({ label, description, value, onChange, disabled = false }: { label: string; description?: string; value: number; onChange: (v: number) => void; disabled?: boolean }) => (
    <div className="space-y-2">
        <div className="flex justify-between items-start text-sm">
            <div className="flex-1 mr-2">
                <span className="text-[#9A7850] font-medium" style={{ fontFamily: 'var(--font-barlow)' }}>{label}</span>
                {description && <p className="text-[#4A3418] text-[10px] mt-0.5 leading-snug" style={{ fontFamily: 'var(--font-barlow)' }} dangerouslySetInnerHTML={{ __html: description }} />}
            </div>
            <span className="text-[#F5A623] font-bold flex-shrink-0" style={{ fontFamily: 'var(--font-barlow)' }}>{value} / 10</span>
        </div>
        <div className="flex gap-1">
            {[...Array(10)].map((_, i) => (
                <button
                    key={i}
                    onClick={() => !disabled && onChange(i + 1)}
                    disabled={disabled}
                    className={cn(
                        'h-7 flex-1 transition-all',
                        i + 1 <= value ? 'bg-[#C8860A] shadow-[0_0_6px_rgba(200,134,10,0.4)]' : 'bg-[#C8860A]/10 hover:bg-[#C8860A]/20',
                        disabled && 'cursor-not-allowed opacity-60'
                    )}
                />
            ))}
        </div>
    </div>
);
