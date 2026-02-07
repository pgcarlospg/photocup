'use client';

import React from 'react';
import { Navbar } from '@/components/Navbar';
import {
    Globe, Shield, TrendingUp, Users,
    Calendar, Award, Settings, Search,
    Filter, MoreHorizontal, ExternalLink
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export default function AdminDashboard() {
    return (
        <main className="min-h-screen bg-[#050505] text-white">
            <Navbar />

            <div className="pt-24 px-8 pb-12">
                {/* Header */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-12">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="px-2 py-1 rounded bg-purple-500/20 border border-purple-500/30 text-[10px] font-bold text-purple-400 uppercase tracking-widest">
                                Global Administrator
                            </div>
                        </div>
                        <h1 className="text-4xl font-bold italic tracking-tight">System Overview</h1>
                        <p className="text-gray-500 mt-1 text-sm">Monitoring 52 participating national Mensas</p>
                    </div>

                    <div className="flex gap-4">
                        <button className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2 hover:bg-white/10 transition-all font-bold text-sm">
                            <Calendar className="w-4 h-4" /> Schedule
                        </button>
                        <button className="px-6 py-3 rounded-xl grad-premium text-white font-bold text-sm shadow-xl shadow-purple-500/20">
                            Configure Next Phase
                        </button>
                    </div>
                </div>

                {/* Global Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    <AdminStatCard label="Global Submissions" value="4,821" growth="+312 since yesterday" icon={<Globe />} color="text-purple-400" />
                    <AdminStatCard label="Active Judges" value="156" growth="12 online now" icon={<Shield />} color="text-blue-400" />
                    <AdminStatCard label="Verified Members" value="3,902" growth="94% verification rate" icon={<Users />} color="text-green-400" />
                    <AdminStatCard label="Projected Growth" value="+22%" growth="Vs last year's Cup" icon={<TrendingUp />} color="text-orange-400" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Country Leaderboard */}
                    <div className="lg:col-span-2 glass rounded-[2rem] border border-white/5 overflow-hidden">
                        <div className="p-8 border-b border-white/5 flex justify-between items-center">
                            <div>
                                <h3 className="text-xl font-bold">Country Participation</h3>
                                <p className="text-sm text-gray-500">Live submission tracking per region</p>
                            </div>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                <input
                                    type="text"
                                    placeholder="Find country..."
                                    className="bg-black/40 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-purple-500/50"
                                />
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-white/[0.02]">
                                    <tr className="text-left text-gray-500 text-xs font-bold uppercase tracking-widest">
                                        <th className="px-8 py-4">Country</th>
                                        <th className="px-8 py-4">Submissions</th>
                                        <th className="px-8 py-4">Status</th>
                                        <th className="px-8 py-4">Coord.</th>
                                        <th className="px-8 py-4 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    <CountryRow country="Spain" count="142" status="Active" coord="Carlos R." />
                                    <CountryRow country="Germany" count="312" status="Completed" coord="Hans M." />
                                    <CountryRow country="United Kingdom" count="285" status="Active" coord="Sarah J." />
                                    <CountryRow country="United States" count="642" status="Active" coord="Michael B." />
                                    <CountryRow country="France" count="198" status="Action Required" coord="Luc P." />
                                    <CountryRow country="Italy" count="156" status="Active" coord="Giulia F." />
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Quick Actions & Timeline */}
                    <div className="space-y-8">
                        <div className="glass rounded-[2rem] border border-white/5 p-8">
                            <h3 className="text-xl font-bold mb-6">System Status</h3>
                            <div className="space-y-4">
                                <StatusItem label="API Infrastructure" status="Operational" lastPulse="2ms" />
                                <StatusItem label="Image Processing" status="Operational" lastPulse="840ms" />
                                <StatusItem label="Authentication SSO" status="Operational" lastPulse="42ms" />
                                <StatusItem label="Database Cluster" status="Heavy Load" lastPulse="1.2s" color="text-yellow-400" />
                            </div>
                        </div>

                        <div className="glass rounded-[2rem] border border-white/5 p-8">
                            <h3 className="text-xl font-bold mb-6">Recent Alerts</h3>
                            <div className="space-y-4">
                                <AlertItem title="Large batch upload" desc="Mensa Germany uploaded 45 high-res files" time="12m ago" />
                                <AlertItem title="Coord. login fail" desc="3 failed attempts from IP: 192.168.1.42" time="45m ago" />
                                <AlertItem title="Judging Milestone" desc="First 500 photos fully evaluated" time="2h ago" type="success" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}

const AdminStatCard = ({ label, value, growth, icon, color }: any) => (
    <div className="glass p-8 rounded-[2rem] border border-white/5 hover:border-white/10 transition-all">
        <div className={cn("p-4 rounded-2xl bg-white/5 w-fit mb-6", color)}>
            {React.cloneElement(icon, { className: "w-6 h-6" })}
        </div>
        <p className="text-gray-500 font-medium text-sm mb-1">{label}</p>
        <h4 className="text-4xl font-bold mb-2">{value}</h4>
        <p className="text-xs font-bold text-gray-600 uppercase tracking-tighter">{growth}</p>
    </div>
);

const CountryRow = ({ country, count, status, coord }: any) => (
    <tr className="hover:bg-white/[0.02] transition-colors group">
        <td className="px-8 py-5">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-bold">
                    {country.substring(0, 2).toUpperCase()}
                </div>
                <span className="font-bold text-gray-200">{country}</span>
            </div>
        </td>
        <td className="px-8 py-5 font-mono text-sm text-purple-400">{count}</td>
        <td className="px-8 py-5">
            <span className={cn(
                "px-3 py-1 rounded-full text-[10px] font-bold uppercase",
                status === 'Active' ? "bg-green-500/10 text-green-500" :
                    status === 'Completed' ? "bg-blue-500/10 text-blue-500" : "bg-red-500/10 text-red-500"
            )}>
                {status}
            </span>
        </td>
        <td className="px-8 py-5 text-sm text-gray-400">{coord}</td>
        <td className="px-8 py-5 text-right">
            <button className="p-2 text-gray-500 hover:text-white transition-colors">
                <ExternalLink className="w-4 h-4" />
            </button>
        </td>
    </tr>
);

const StatusItem = ({ label, status, lastPulse, color = "text-green-400" }: any) => (
    <div className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/5">
        <div>
            <p className="text-xs font-bold text-gray-400 mb-1">{label}</p>
            <div className="flex items-center gap-2">
                <div className={cn("w-2 h-2 rounded-full animate-pulse", color.replace('text', 'bg'))} />
                <span className={cn("text-xs font-bold uppercase", color)}>{status}</span>
            </div>
        </div>
        <span className="text-[10px] font-mono text-gray-600">PULSE: {lastPulse}</span>
    </div>
);

const AlertItem = ({ title, desc, time, type = "normal" }: any) => (
    <div className="flex gap-4 p-4 border-b border-white/5 last:border-0">
        <div className={cn(
            "w-1 h-auto rounded-full",
            type === 'success' ? "bg-green-500" : "bg-purple-500"
        )} />
        <div>
            <p className="text-sm font-bold text-gray-200">{title}</p>
            <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
            <span className="text-[10px] text-gray-600 mt-2 block uppercase font-bold">{time}</span>
        </div>
    </div>
);
