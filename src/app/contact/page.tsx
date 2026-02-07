'use client';

import React from 'react';
import { Navbar } from '@/components/Navbar';
import { Mail, MessageSquare, Globe, ArrowRight, Instagram, Twitter } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ContactPage() {
    return (
        <main className="min-h-screen bg-[#050505] text-white">
            <Navbar />

            <div className="pt-32 px-8 pb-24 max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
                    <div>
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                        >
                            <span className="text-purple-400 font-bold uppercase tracking-widest text-sm mb-4 block">Get in Touch</span>
                            <h1 className="text-6xl font-black italic mb-8">Contact the <span className="text-purple-400">Cup</span> Team.</h1>
                            <p className="text-gray-400 text-lg leading-relaxed mb-12">
                                Have questions about the competition, technical issues with the platform, or interest in sponsorship?
                                Our global team is here to help you.
                            </p>

                            <div className="space-y-8">
                                <ContactInfo icon={<Mail />} label="General Inquiry" value="cup2026@mensa.org" />
                                <ContactInfo icon={<MessageSquare />} label="Technical Support" value="it-dev@mensa.org" />
                                <ContactInfo icon={<Globe />} label="Press & Media" value="media@mensa.org" />
                            </div>

                            <div className="mt-16 pt-12 border-t border-white/5">
                                <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-6">Social Channels</p>
                                <div className="flex gap-4">
                                    <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-sm font-bold">
                                        <Instagram className="w-4 h-4" /> Instagram
                                    </button>
                                    <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-sm font-bold">
                                        <Twitter className="w-4 h-4" /> Twitter
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    <div>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="glass p-10 rounded-[3rem] border border-white/5 relative overflow-hidden"
                        >
                            <div className="absolute -top-32 -right-32 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl" />

                            <h3 className="text-2xl font-bold mb-8">Direct Message</h3>
                            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-500 uppercase ml-1">Full Name</label>
                                        <input type="text" placeholder="John Doe" className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3.5 focus:outline-none focus:border-purple-500/50" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-500 uppercase ml-1">Mensa ID (Optional)</label>
                                        <input type="text" placeholder="ES-1234" className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3.5 focus:outline-none focus:border-purple-500/50" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase ml-1">Email Address</label>
                                    <input type="email" placeholder="john@example.com" className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3.5 focus:outline-none focus:border-purple-500/50" />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase ml-1">Message</label>
                                    <textarea rows={5} placeholder="How can we help?" className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3.5 focus:outline-none focus:border-purple-500/50 resize-none" />
                                </div>

                                <button className="w-full py-4 rounded-xl grad-premium text-white font-bold flex items-center justify-center gap-2 hover:shadow-[0_0_30px_rgba(168,85,247,0.3)] transition-all group">
                                    Send Message <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </button>
                            </form>
                        </motion.div>
                    </div>
                </div>
            </div>
        </main>
    );
}

const ContactInfo = ({ icon, label, value }: any) => (
    <div className="flex items-center gap-4">
        <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-purple-400">
            {React.cloneElement(icon, { size: 20 })}
        </div>
        <div>
            <p className="text-xs font-bold text-gray-600 uppercase tracking-tighter">{label}</p>
            <p className="font-bold text-gray-200">{value}</p>
        </div>
    </div>
);
