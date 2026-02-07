'use client';

import React from 'react';
import { Navbar } from '@/components/Navbar';
import {
    ScrollText, Info, CheckCircle2, AlertTriangle,
    Calendar, Camera, FileCheck, ShieldCheck
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function RulesPage() {
    return (
        <main className="min-h-screen bg-[#050505] text-white">
            <Navbar />

            <div className="pt-32 px-8 pb-24 max-w-4xl mx-auto">
                <div className="mb-16">
                    <div className="flex items-center gap-4 mb-4">
                        <ScrollText className="w-8 h-8 text-purple-400" />
                        <span className="text-purple-400 font-bold uppercase tracking-widest text-sm">Official Guidelines</span>
                    </div>
                    <h1 className="text-6xl font-black italic mb-6">Terms & Conditions</h1>
                    <p className="text-gray-400 text-lg leading-relaxed">
                        Please read these rules carefully before submitting your entries.
                        The Mensa PhotoCup is governed by the principles of artistic integrity and intellectual honesty.
                    </p>
                </div>

                <div className="space-y-12">
                    <RuleSection
                        icon={<CheckCircle2 />}
                        title="Eligibility"
                        content="Participation is open to all current members of any national Mensa. You must provide your Member ID during submission. International collaborators must all be Mensa members."
                    />

                    <RuleSection
                        icon={<Camera />}
                        title="Image Specifications"
                        content="Images must be in JPG or PNG format. Minimum resolution of 3000px on the longest side. No watermarks, signatures, or frames are permitted on the image surface."
                    />

                    <RuleSection
                        icon={<AlertTriangle />}
                        title="Originality & AI"
                        content="Generative AI images are strictly prohibited. Minor retouching is allowed, but composite images or significant digital manipulation that alters the reality of the scene is not permitted."
                    />

                    <RuleSection
                        icon={<ShieldCheck />}
                        title="Copyright"
                        content="Contestants retain full copyright of their work. By entering, you grant Mensa International a non-exclusive, worldwide license to use the images for promotion of the event."
                    />

                    <div className="glass p-8 rounded-[2rem] border border-white/5 mt-16">
                        <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                            <Info className="text-blue-400" /> Frequent Questions
                        </h3>
                        <div className="space-y-8">
                            <FaqItem
                                question="How many entries can I submit?"
                                answer="Each member can submit up to 3 individual entries and participate in 1 collective entry."
                            />
                            <FaqItem
                                question="Is there a capture date limit?"
                                answer="Yes, photos must have been taken between January 1st, 2025 and the submission deadline."
                            />
                            <FaqItem
                                question="Who are the judges?"
                                answer="The jury is composed of professional photographers and cognitive scientists from within and outside Mensa."
                            />
                        </div>
                    </div>
                </div>

                <div className="mt-20 p-10 rounded-[2rem] grad-premium flex flex-col items-center text-center">
                    <h2 className="text-3xl font-black italic mb-4 text-white">Ready to Contribute?</h2>
                    <p className="text-white/80 mb-8 max-w-md">Ensure your files meet all requirements before proceeding to the upload panel.</p>
                    <button className="px-10 py-4 rounded-xl bg-white text-black font-black uppercase tracking-tighter hover:scale-105 transition-transform">
                        Go to Submission
                    </button>
                </div>
            </div>
        </main>
    );
}

const RuleSection = ({ icon, title, content }: any) => (
    <div className="flex gap-6">
        <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-purple-400">
            {React.cloneElement(icon, { className: "w-6 h-6" })}
        </div>
        <div>
            <h3 className="text-xl font-bold mb-2">{title}</h3>
            <p className="text-gray-500 leading-relaxed italic">{content}</p>
        </div>
    </div>
);

const FaqItem = ({ question, answer }: any) => (
    <div>
        <p className="text-white font-bold mb-2">{question}</p>
        <p className="text-gray-500 text-sm">{answer}</p>
    </div>
);
