'use client';

import React from 'react';
import { Navbar } from '@/components/Navbar';
import {
    Users, Image as ImageIcon, CheckCircle2, AlertCircle,
    BarChart3, Download, Globe, Filter, Search, MoreHorizontal,
    ArrowUpRight, Mail
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export default function NMDashboard() {
    return (
        <main className="min-h-screen bg-[#050505] text-white">
            <Navbar />

            <div className="pt-24 px-8 pb-12">
                {/* Header section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20">
                                <Globe className="w-4 h-4 text-blue-400" />
                            </div>
                            <span className="text-gray-500 font-bold uppercase tracking-widest text-xs">National Member Panel</span>
                        </div>
                        <h1 className="text-5xl font-black italic">Spain Dashboard</h1>
                    </div>

                    <div className="flex gap-4">
                        <button className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2 hover:bg-white/10 transition-all font-bold text-sm">
                            <Download className="w-4 h-4" /> Marketing Kit
                        </button>
                        <button className="px-6 py-3 rounded-xl grad-premium text-white font-bold text-sm shadow-xl shadow-purple-500/20 flex items-center gap-2">
                            Download Batch <ArrowUpRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    <StatCard icon={<ImageIcon />} label="Total Submissions" value="142" subValue="+12 today" color="text-blue-400" />
                    <StatCard icon={<CheckCircle2 />} label="Approved" value="128" subValue="90.1%" color="text-green-400" />
                    <StatCard icon={<AlertCircle />} label="Pending Review" value="14" subValue="Action required" color="text-yellow-400" />
                    <StatCard icon={<Users />} label="Participants" value="86" subValue="Active members" color="text-purple-400" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Submissions Table */}
                    <div className="lg:col-span-2 glass rounded-[2.5rem] overflow-hidden border border-white/5">
                        <div className="p-8 border-b border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4">
                            <h3 className="text-xl font-bold italic">Recent Submissions</h3>
                            <div className="flex items-center gap-4 w-full sm:w-auto">
                                <div className="relative flex-1 sm:w-64">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                    <input
                                        type="text"
                                        placeholder="Search author..."
                                        className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-purple-500/50"
                                    />
                                </div>
                                <button className="p-2.5 bg-white/5 rounded-xl border border-white/10 text-gray-500 hover:text-white transition-all">
                                    <Filter className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="text-left text-gray-600 text-[10px] font-black uppercase tracking-[0.2em] border-b border-white/5 bg-white/[0.01]">
                                        <th className="px-8 py-5">Photo</th>
                                        <th className="px-8 py-5">Details</th>
                                        <th className="px-8 py-5">Author</th>
                                        <th className="px-8 py-5">Status</th>
                                        <th className="px-8 py-5 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {[1, 2, 3, 4, 5].map((i) => (
                                        <tr key={i} className="hover:bg-white/[0.02] transition-colors group">
                                            <td className="px-8 py-5">
                                                <div className="w-20 h-14 rounded-xl bg-white/5 overflow-hidden border border-white/10 relative">
                                                    <img src={`https://picsum.photos/seed/${i + 100}/200/150`} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                                    <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-all" />
                                                </div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <p className="font-bold text-gray-200">The Silent Enigma #{i}</p>
                                                <p className="text-[10px] text-gray-600 font-mono uppercase tracking-widest mt-0.5">PhotoCup • Individual</p>
                                            </td>
                                            <td className="px-8 py-5">
                                                <p className="text-sm font-bold">Carlos Ruiz</p>
                                                <p className="text-[10px] text-gray-600 font-bold uppercase">Member ES-{800 + i}</p>
                                            </td>
                                            <td className="px-8 py-5">
                                                <span className={cn(
                                                    "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest",
                                                    i === 3 ? "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20" : "bg-green-500/10 text-green-500 border border-green-500/20"
                                                )}>
                                                    {i === 3 ? "Pending" : "Approved"}
                                                </span>
                                            </td>
                                            <td className="px-8 py-5 text-right">
                                                <button className="p-2 text-gray-600 hover:text-white transition-colors">
                                                    <MoreHorizontal className="w-5 h-5" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="p-6 border-t border-white/5 text-center bg-white/[0.01]">
                            <button className="text-xs font-bold text-gray-500 hover:text-purple-400 uppercase tracking-widest transition-colors">
                                View All 142 Submissions
                            </button>
                        </div>
                    </div>

                    {/* Sidebar: Notifications / Coordinator Task */}
                    <div className="space-y-8">
                        <div className="glass rounded-[2.5rem] border border-white/5 p-8">
                            <h3 className="text-xl font-bold italic mb-6">Regional Tasks</h3>
                            <div className="space-y-4">
                                <TaskItem label="Verify member ES-992" priority="High" time="1h left" />
                                <TaskItem label="Review flagged photo #421" priority="Medium" time="4h left" />
                                <TaskItem label="Export final shortlist" priority="Low" time="2 days" />
                            </div>
                        </div>

                        <div className="glass rounded-[2.5rem] border border-white/5 p-8 relative overflow-hidden">
                            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl" />
                            <h3 className="text-xl font-bold italic mb-6 flex items-center justify-between">
                                Support <Mail className="w-4 h-4 text-gray-500" />
                            </h3>
                            <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                                Need help with country-specific rules or bulk uploads? Contact the Global Coordinator team.
                            </p>
                            <button className="w-full py-3 rounded-xl bg-white/5 border border-white/10 text-xs font-bold uppercase tracking-widest hover:bg-white/10 transition-all">
                                Open Ticket
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}

const StatCard = ({ icon, label, value, subValue, color }: any) => (
    <div className="glass p-8 rounded-[2.5rem] border border-white/5 hover:border-white/10 transition-all group">
        <div className={cn("p-4 rounded-2xl bg-white/5 w-fit mb-6 group-hover:scale-110 transition-transform", color)}>
            {React.cloneElement(icon, { className: "w-6 h-6" })}
        </div>
        <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-1">{label}</p>
        <div className="flex items-baseline gap-3">
            <h4 className="text-4xl font-extrabold italic">{value}</h4>
            <span className="text-[10px] text-gray-600 font-black uppercase tracking-tighter">{subValue}</span>
        </div>
    </div>
);

const TaskItem = ({ label, priority, time }: any) => (
    <div className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all cursor-pointer">
        <div>
            <p className="text-sm font-bold text-gray-200">{label}</p>
            <p className="text-[10px] text-gray-600 font-bold uppercase mt-0.5">{time}</p>
        </div>
        <span className={cn(
            "text-[9px] font-black uppercase px-2 py-0.5 rounded",
            priority === 'High' ? "text-red-400 bg-red-400/10" :
                priority === 'Medium' ? "text-yellow-400 bg-yellow-400/10" : "text-blue-400 bg-blue-400/10"
        )}>{priority}</span>
    </div>
);
