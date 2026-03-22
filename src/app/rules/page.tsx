'use client';

import React from 'react';
import { Navbar } from '@/components/Navbar';
import {
    ScrollText, Info, CheckCircle2, AlertTriangle,
    Camera, ShieldCheck
} from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

const font = { fontFamily: 'var(--font-barlow)' };
const fontDisplay = { fontFamily: 'var(--font-oswald)' };
const fontBody = { fontFamily: 'var(--font-garamond)' };

export default function RulesPage() {
    return (
        <main className="min-h-screen bg-[#080300]" style={{ color: '#F5E0C0' }}>
            <Navbar />

            <div className="pt-32 px-6 lg:px-12 pb-24 max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-16">
                    <motion.div
                        initial={{ opacity: 0, x: -16 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5 }}
                        className="flex items-center gap-3 mb-5"
                    >
                        <div className="h-px w-8 bg-[#F5A623]" />
                        <ScrollText className="w-4 h-4 text-[#F5A623]" />
                        <span className="text-[#F5A623] font-bold uppercase tracking-[0.25em] text-xs" style={font}>
                            Official Guidelines
                        </span>
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="text-6xl font-bold text-white mb-6 leading-tight"
                        style={fontDisplay}
                    >
                        Terms &<br />Conditions
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="text-[#9A7850] text-lg leading-relaxed"
                        style={fontBody}
                    >
                        Please read these rules carefully before submitting your entries.
                        The Mensa PhotoCup is governed by the principles of artistic integrity and intellectual honesty.
                    </motion.p>
                </div>

                <div className="space-y-8">
                    <RuleSection
                        icon={<CheckCircle2 />}
                        title="Eligibility"
                        content="You must be a current Mensa member in good standing and remain so for the duration of the competition. When submitting, you must include your full name, membership number, e-mail address, and the title(s) of your photo(s)."
                        index={0}
                    />
                    <RuleSection
                        icon={<Camera />}
                        title="Image Specifications"
                        content="Submit up to 3 photos maximum. Each photo must be in JPG/JPEG format, have a resolution of 150 DPI or higher, and not exceed 10 MB. No watermarks, signatures, labels, or symbols are permitted on the image. EXIF data is required for each submission."
                        index={1}
                    />
                    <RuleSection
                        icon={<AlertTriangle />}
                        title="Originality, Editing & AI"
                        content="AI-generated images are strictly prohibited — any such entry will be disqualified and the member banned from future competitions. Only 'Global Editing' is allowed: cropping, reframing, colour correction, brightness, exposure, contrast, saturation, sharpness. Removing objects, masking, selective edits, or any AI-powered editing tool is not permitted. Photos must have been taken on or after 1 January 2026."
                        index={2}
                    />
                    <RuleSection
                        icon={<ShieldCheck />}
                        title="Copyright & Licence"
                        content="You retain full copyright of your work. By entering, you grant Mensa International Ltd. a perpetual, worldwide, royalty-free, non-exclusive licence to use, reproduce, publish, and distribute your images for competition promotion — on websites, social media, newsletters, exhibitions, and Mensa events. No financial compensation is provided."
                        index={3}
                    />
                    <RuleSection
                        icon={<ScrollText />}
                        title="Conduct & Promotion"
                        content="Any promotion of your entries — by yourself or others on your behalf — is not permitted. This is a photo contest, not a photo story competition: do not submit a series of images intended to be viewed in a specific order. Each image must independently reflect the theme 'Spark of Evolution'."
                        index={4}
                    />

                    {/* FAQ */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="glass border border-[#C8860A]/12 p-8 mt-16 relative overflow-hidden"
                        style={{ clipPath: 'polygon(0 0, 100% 0, 100% 96%, 97% 100%, 0 100%)' }}
                    >
                        <div className="absolute top-0 left-0 w-full h-0.5 grad-premium" />
                        <h3 className="text-2xl font-bold text-white mb-7 flex items-center gap-3" style={fontDisplay}>
                            <Info className="w-5 h-5 text-[#F5A623]" /> Frequent Questions
                        </h3>
                        <div className="space-y-7">
                            <FaqItem
                                question="How many entries can I submit?"
                                answer="Each member can submit up to 3 photos maximum."
                            />
                            <FaqItem
                                question="Is there a capture date limit?"
                                answer="Yes. Photos must have been taken on or after 1 January 2026. Pre-dated images will be disqualified. If you use a digital camera, ensure the date is set correctly before shooting."
                            />
                            <FaqItem
                                question="What is EXIF data and why is it required?"
                                answer="EXIF data is metadata embedded in your photo file recording camera settings (shutter speed, aperture, ISO, date/time, etc.). It is required to ensure fair and accurate judging. Refer to the EXIF Data Instructions document available in your NM entry pack."
                            />
                            <FaqItem
                                question="Who judges the international competition?"
                                answer="All entries are judged blind by the Mensa International PhotoCup jury — they do not know which NM juries have already selected as their top 3. This ensures equal opportunity for all participants worldwide."
                            />
                            <FaqItem
                                question="What is the Mensa PhotOlympics?"
                                answer="Each national Mensa's top 3 (winner + 2 runners-up) enter as a national team. The NM team with the highest aggregate score wins Gold, with Silver and Bronze for 2nd and 3rd place. Prizes and trophies are presented at the Düsseldorf IBD+ Meeting in October 2026."
                            />
                        </div>
                    </motion.div>
                </div>

                {/* CTA */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="mt-20 border border-[#C8860A]/20 p-10 flex flex-col items-center text-center relative overflow-hidden"
                    style={{ background: 'linear-gradient(135deg, #C8860A18 0%, #F5A62308 100%)', clipPath: 'polygon(0 0, 100% 0, 100% 92%, 94% 100%, 0 100%)' }}
                >
                    <div className="absolute top-0 left-0 w-full h-0.5 grad-premium" />
                    <div className="absolute bottom-0 right-0 w-48 h-48 bg-[#F5A623]/06 rounded-full blur-[60px] pointer-events-none" />
                    <h2 className="text-4xl font-bold text-white mb-4 relative z-10" style={fontDisplay}>Ready to Contribute?</h2>
                    <p className="text-[#9A7850] mb-8 max-w-md relative z-10" style={fontBody}>
                        Ensure your files meet all requirements before proceeding to the upload panel.
                    </p>
                    <Link
                        href="/submit"
                        className="px-10 py-4 grad-premium text-[#080300] font-bold uppercase tracking-widest text-sm glow-gold hover:opacity-90 transition-all relative z-10"
                        style={{ ...font, clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 100%, 10px 100%)' }}
                    >
                        Go to Submission
                    </Link>
                </motion.div>
            </div>
        </main>
    );
}

const RuleSection = ({ icon, title, content, index }: any) => (
    <motion.div
        initial={{ opacity: 0, x: -16 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: index * 0.08 }}
        className="flex gap-5 group"
    >
        <div className="flex-shrink-0 w-11 h-11 border border-[#C8860A]/25 flex items-center justify-center text-[#F5A623] group-hover:border-[#F5A623]/50 transition-colors"
             style={{ background: 'rgba(200,134,10,0.06)' }}>
            {React.cloneElement(icon, { className: "w-5 h-5" })}
        </div>
        <div className="border-b border-[#C8860A]/10 pb-7 flex-1">
            <h3 className="text-xl font-bold text-white mb-2" style={fontDisplay}>{title}</h3>
            <p className="text-[#7A6040] leading-relaxed" style={fontBody}>{content}</p>
        </div>
    </motion.div>
);

const FaqItem = ({ question, answer }: any) => (
    <div className="border-b border-[#C8860A]/10 pb-6 last:border-0 last:pb-0">
        <p className="text-white font-bold mb-2 text-sm" style={font}>{question}</p>
        <p className="text-[#7A6040] text-sm leading-relaxed" style={fontBody}>{answer}</p>
    </div>
);
