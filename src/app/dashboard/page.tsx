'use client';

import React from 'react';
import { Navbar } from '@/components/Navbar';
import {
    User, Settings, Image as ImageIcon,
    Award, Clock, ExternalLink, MessageSquare
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function UserDashboard() {
    return (
        <main className="min-h-screen bg-[#050505] text-white">
            <Navbar />

            <div className="pt-24 px-8 pb-12 max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row gap-8 mb-12">
                    {/* Sidebar / Profile Summary */}
                    <div className="w-full md:w-80 space-y-6">
                        <div className="glass p-8 rounded-[2rem] border border-white/5 text-center">
                            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 mx-auto mb-6 p-1">
                                <div className="w-full h-full rounded-full bg-black flex items-center justify-center p-2">
                                    <User className="w-12 h-12 text-white" />
                                </div>
                            </div>
                            <h2 className="text-2xl font-bold">Alex Rivera</h2>
                            <p className="text-gray-500 text-sm mb-6">Mensa Spain • ES-8821</p>
                            <button className="w-full py-3 rounded-xl bg-white/5 border border-white/10 text-sm font-bold hover:bg-white/10 transition-all">
                                Edit Profile
                            </button>
                        </div>

                        <div className="glass p-4 rounded-[1.5rem] border border-white/5 space-y-1">
                            <SidebarLink icon={<ImageIcon />} label="My Submissions" active />
                            <SidebarLink icon={<Award />} label="Achievements" />
                            <SidebarLink icon={<MessageSquare />} label="Feedback" count={2} />
                            <SidebarLink icon={<Settings />} label="Settings" />
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 space-y-8">
                        <div>
                            <h1 className="text-4xl font-bold italic mb-2">My Submissions</h1>
                            <p className="text-gray-500">Manage your entries for the 2026 PhotoCup.</p>
                        </div>

                        {/* Submissions Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <SubmissionCard
                                title="The Silent Enigma"
                                status="Approved"
                                date="Jan 12, 2026"
                                img="https://images.unsplash.com/photo-1518005020251-095c1f00c653"
                            />
                            <SubmissionCard
                                title="Urban Entropy"
                                status="In Review"
                                date="Jan 20, 2026"
                                img="https://images.unsplash.com/photo-1502657877623-f66bf489d236"
                            />

                            {/* Empty Slot */}
                            <div className="border-2 border-dashed border-white/5 rounded-[2rem] flex flex-col items-center justify-center p-12 group hover:border-purple-500/30 transition-colors">
                                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                    <ImageIcon className="text-gray-600 group-hover:text-purple-400" />
                                </div>
                                <h4 className="font-bold text-gray-500">Available Slot</h4>
                                <p className="text-xs text-gray-600 mb-6 font-mono uppercase tracking-widest">1 Entry Remaining</p>
                                <button className="px-6 py-2.5 rounded-full grad-premium text-white text-sm font-bold shadow-lg shadow-purple-500/10">
                                    Fill Slot
                                </button>
                            </div>
                        </div>

                        {/* Recent Activity */}
                        <div className="glass rounded-[2rem] border border-white/5 p-8">
                            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                                <Clock className="w-5 h-5 text-gray-400" /> Recent Activity
                            </h3>
                            <div className="space-y-6">
                                <ActivityItem
                                    title="Submission Approved"
                                    desc="Your photo 'The Silent Enigma' has passed initial technical validation."
                                    time="2 days ago"
                                />
                                <ActivityItem
                                    title="Waitlist Updated"
                                    desc="Mensa International updated the competition timeline."
                                    time="1 week ago"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}

const SidebarLink = ({ icon, label, active = false, count = 0 }: any) => (
    <button className={cn(
        "w-full flex items-center justify-between p-3 rounded-xl transition-all",
        active ? "bg-purple-500/10 text-purple-400 font-bold" : "text-gray-500 hover:text-white hover:bg-white/5"
    )}>
        <div className="flex items-center gap-3">
            {React.cloneElement(icon, { size: 18 })}
            <span className="text-sm">{label}</span>
        </div>
        {count > 0 && (
            <span className="bg-purple-500 text-white text-[10px] px-2 py-0.5 rounded-full">{count}</span>
        )}
    </button>
);

const SubmissionCard = ({ title, status, date, img }: any) => (
    <div className="glass rounded-[2rem] border border-white/5 overflow-hidden group">
        <div className="relative h-48">
            <img src={img} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt={title} />
            <div className="absolute top-4 right-4">
                <span className={cn(
                    "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                    status === 'Approved' ? "bg-green-500 text-white" : "bg-yellow-500 text-black"
                )}>
                    {status}
                </span>
            </div>
        </div>
        <div className="p-6 flex justify-between items-center">
            <div>
                <h4 className="font-bold text-lg">{title}</h4>
                <p className="text-xs text-gray-500 uppercase font-mono tracking-widest mt-1">Submitted: {date}</p>
            </div>
            <button className="p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                <ExternalLink className="w-4 h-4" />
            </button>
        </div>
    </div>
);

const ActivityItem = ({ title, desc, time }: any) => (
    <div className="flex gap-4">
        <div className="flex-shrink-0 w-1 rounded-full bg-purple-500/30" />
        <div>
            <h5 className="font-bold text-sm text-gray-200">{title}</h5>
            <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{desc}</p>
            <span className="text-[10px] text-gray-700 mt-2 block font-bold uppercase tracking-widest">{time}</span>
        </div>
    </div>
);
