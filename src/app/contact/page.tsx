'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Mail, MessageSquare, Globe, ArrowRight, Instagram, Twitter, Check, AlertCircle, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const font = { fontFamily: 'var(--font-barlow)' };
const fontDisplay = { fontFamily: 'var(--font-oswald)' };
const fontBody = { fontFamily: 'var(--font-garamond)' };

const SUBJECTS = [
    'General Inquiry',
    'Technical Support',
    'Press & Media',
    'Sponsorship',
    'Other',
];

export default function ContactPage() {
    const [form, setForm] = useState({ name: '', mensaId: '', email: '', subject: '', message: '' });
    const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
    const [errorMsg, setErrorMsg] = useState('');

    const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
        setForm(prev => ({ ...prev, [k]: e.target.value }));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
            setErrorMsg('Please fill in your name, email and message.');
            setStatus('error');
            return;
        }
        setStatus('sending');
        setErrorMsg('');
        try {
            const res = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.error ?? 'Failed to send message.');
            }
            setStatus('sent');
            setForm({ name: '', mensaId: '', email: '', subject: '', message: '' });
        } catch (err: unknown) {
            setErrorMsg(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
            setStatus('error');
        }
    };

    const inputCls = "w-full bg-[#120700] border border-[#C8860A]/20 px-5 py-3.5 text-[#F5E0C0] placeholder-[#3A2A10] focus:outline-none focus:border-[#F5A623]/50 transition-all";

    return (
        <main className="min-h-screen bg-[#080300]" style={{ color: '#F5E0C0' }}>
            <Navbar />

            <div className="pt-32 px-8 pb-24 max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
                    {/* Left — Info */}
                    <div>
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                        >
                            <div className="flex items-center gap-3 mb-6">
                                <div className="h-px w-8 bg-[#F5A623]" />
                                <span className="text-[#F5A623] text-xs font-bold uppercase tracking-[0.3em]" style={font}>Get in Touch</span>
                            </div>
                            <h1 className="text-6xl font-bold mb-8 leading-none" style={fontDisplay}>
                                Contact the <span className="text-[#F5A623]">PhotoCup</span> Team.
                            </h1>
                            <p className="text-[#9A7850] text-lg leading-relaxed mb-12" style={fontBody}>
                                Have questions about the competition, technical issues with the platform, or interest in sponsorship?
                                Our global team is here to help you.
                            </p>

                            <div className="space-y-6">
                                <ContactInfo icon={<Mail />} label="General Inquiry" value="photocup@mensa.org" />
                                <ContactInfo icon={<MessageSquare />} label="Technical Support" value="rupesh.baitha@mensa.org" />
                                <ContactInfo icon={<Globe />} label="Press & Media" value="marketing@mensa.org" />
                            </div>

                            <div className="mt-16 pt-10 border-t border-[#C8860A]/15">
                                <p className="text-xs font-bold text-[#5A4020] uppercase tracking-[0.3em] mb-6" style={font}>Social Channels</p>
                                <div className="flex gap-4">
                                    <button className="flex items-center gap-2 px-5 py-2.5 border border-[#C8860A]/20 text-[#C8A070] hover:text-[#F5A623] hover:border-[#F5A623]/40 transition-all text-sm font-bold"
                                            style={{ ...font, clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 100%, 6px 100%)' }}>
                                        <Instagram className="w-4 h-4" /> Instagram
                                    </button>
                                    <button className="flex items-center gap-2 px-5 py-2.5 border border-[#C8860A]/20 text-[#C8A070] hover:text-[#F5A623] hover:border-[#F5A623]/40 transition-all text-sm font-bold"
                                            style={{ ...font, clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 100%, 6px 100%)' }}>
                                        <Twitter className="w-4 h-4" /> Twitter
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Right — Form */}
                    <div>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="glass border border-[#C8860A]/15 p-10 relative overflow-hidden"
                            style={{ clipPath: 'polygon(0 0, 100% 0, 100% 96%, 96% 100%, 0 100%)' }}
                        >
                            <div className="absolute -top-32 -right-32 w-64 h-64 bg-[#F5A623]/05 rounded-full blur-3xl pointer-events-none" />

                            <h3 className="text-2xl font-bold mb-8 text-white" style={fontDisplay}>Direct Message</h3>

                            {status === 'sent' ? (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="flex flex-col items-center justify-center py-16 gap-6 text-center"
                                >
                                    <div className="p-5 border border-green-700/40 bg-green-900/15 rounded-full">
                                        <Check className="w-10 h-10 text-green-400" />
                                    </div>
                                    <div>
                                        <p className="text-xl font-bold text-white mb-2" style={fontDisplay}>Message Sent!</p>
                                        <p className="text-[#9A7850] text-sm" style={fontBody}>
                                            We&apos;ll get back to you at your email address as soon as possible.
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => setStatus('idle')}
                                        className="text-xs text-[#7A6040] hover:text-[#C8A070] uppercase tracking-widest transition-all"
                                        style={font}
                                    >
                                        Send another message
                                    </button>
                                </motion.div>
                            ) : (
                                <form className="space-y-6" onSubmit={handleSubmit}>
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-[#7A6040] uppercase tracking-[0.15em]" style={font}>Full Name *</label>
                                            <input
                                                type="text"
                                                placeholder="John Doe"
                                                value={form.name}
                                                onChange={set('name')}
                                                required
                                                className={inputCls}
                                                style={font}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-[#7A6040] uppercase tracking-[0.15em]" style={font}>Mensa ID</label>
                                            <input
                                                type="text"
                                                placeholder="ES-1234"
                                                value={form.mensaId}
                                                onChange={set('mensaId')}
                                                className={inputCls}
                                                style={font}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-[#7A6040] uppercase tracking-[0.15em]" style={font}>Email Address *</label>
                                        <input
                                            type="email"
                                            placeholder="john@example.com"
                                            value={form.email}
                                            onChange={set('email')}
                                            required
                                            className={inputCls}
                                            style={font}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-[#7A6040] uppercase tracking-[0.15em]" style={font}>Subject</label>
                                        <select
                                            value={form.subject}
                                            onChange={set('subject')}
                                            className={inputCls + " appearance-none"}
                                            style={font}
                                        >
                                            <option value="">Select a subject…</option>
                                            {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-[#7A6040] uppercase tracking-[0.15em]" style={font}>Message *</label>
                                        <textarea
                                            rows={5}
                                            placeholder="How can we help?"
                                            value={form.message}
                                            onChange={set('message')}
                                            required
                                            className={inputCls + " resize-none"}
                                            style={font}
                                        />
                                    </div>

                                    {status === 'error' && (
                                        <div className="flex items-center gap-2 text-red-400 text-xs border border-red-800/30 bg-red-900/10 px-4 py-3" style={font}>
                                            <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                            {errorMsg}
                                        </div>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={status === 'sending'}
                                        className="w-full py-4 grad-premium text-[#080300] font-bold flex items-center justify-center gap-2 glow-gold hover:opacity-90 transition-all group disabled:opacity-60"
                                        style={{ ...font, fontSize: '13px', letterSpacing: '0.15em', clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 100%, 10px 100%)' }}
                                    >
                                        {status === 'sending' ? (
                                            <><Loader2 className="w-5 h-5 animate-spin" /> SENDING…</>
                                        ) : (
                                            <>SEND MESSAGE <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></>
                                        )}
                                    </button>
                                </form>
                            )}
                        </motion.div>
                    </div>
                </div>
            </div>
        </main>
    );
}

const ContactInfo = ({ icon, label, value }: { icon: React.ReactElement; label: string; value: string }) => (
    <div className="flex items-center gap-4">
        <div className="p-3 border border-[#C8860A]/20 text-[#F5A623]"
             style={{ background: 'rgba(200,134,10,0.06)' }}>
            {React.cloneElement(icon, { size: 18 } as React.HTMLAttributes<SVGElement>)}
        </div>
        <div>
            <p className="text-xs font-bold text-[#5A4020] uppercase tracking-[0.2em]" style={{ fontFamily: 'var(--font-barlow)' }}>{label}</p>
            <a
                href={`mailto:${value}`}
                className="font-bold text-[#F5E0C0] hover:text-[#F5A623] transition-colors mt-0.5 block"
                style={{ fontFamily: 'var(--font-barlow)' }}
            >
                {value}
            </a>
        </div>
    </div>
);
