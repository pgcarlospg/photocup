'use client';

import React from 'react';
import { Navbar } from '@/components/Navbar';
import { Hero } from '@/components/Hero';
import { motion } from 'framer-motion';
import {
  Clock, Award, Globe, Shield,
  ChevronRight, ArrowUpRight, Instagram,
  Twitter, Facebook, Mail
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';


export default function Home() {
  return (
    <main className="min-h-screen bg-[#050505] text-white overflow-hidden">
      <Navbar />

      <Hero />

      {/* Featured Categories */}
      <section className="py-24 px-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div>
            <span className="text-purple-400 font-bold uppercase tracking-widest text-sm mb-2 block">Themes 2026</span>
            <h2 className="text-5xl font-black italic">Competition Categories</h2>
          </div>
          <p className="text-gray-500 max-w-sm">Every photo tells a story of chaos and the underlying order within it.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <CategoryCard
            title="Architecture"
            img="https://images.unsplash.com/photo-1502657877623-f66bf489d236"
            desc="Geometric precision in urban entropy."
          />
          <CategoryCard
            title="Landscape"
            img="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b"
            desc="Nature's raw power and serenity."
          />
          <CategoryCard
            title="Portrait"
            img="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d"
            desc="The human soul in chaotic times."
          />
          <CategoryCard
            title="Macro"
            img="https://images.unsplash.com/photo-1517423568366-8b83523034fd"
            desc="The enigma of the micro world."
          />
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-24 bg-white/[0.02] border-y border-white/5">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-black italic mb-4">Event Timeline</h2>
            <p className="text-gray-500">Key dates for the 2026 global edition</p>
          </div>

          <div className="relative">
            {/* Desktop Line */}
            <div className="hidden lg:block absolute top-[22px] left-0 w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
              <TimelineItem date="FEB 15" title="Opening" desc="Submission window opens globally." active />
              <TimelineItem date="MAY 30" title="Deadline" desc="Final call for individual and team entries." />
              <TimelineItem date="JUL 10" title="Shortlist" desc="Announcement of top 100 finalists." />
              <TimelineItem date="SEP 22" title="Gala Event" desc="Winners announced in Madrid, Spain." />
            </div>
          </div>
        </div>
      </section>

      {/* National Impact */}
      <section className="py-32 px-8 max-w-7xl mx-auto">
        <div className="glass rounded-[3rem] p-12 lg:p-20 border border-white/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-1/2 h-full opacity-20 pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-l from-purple-500/20 to-transparent" />
            {/* Map or Global Graphic could go here */}
          </div>

          <div className="relative z-10 max-w-2xl">
            <h2 className="text-5xl font-black italic mb-8 leading-tight">
              A Global <span className="text-purple-400">Collaborative</span> Effort
            </h2>
            <p className="text-xl text-gray-400 mb-10 leading-relaxed">
              Mensa PhotoPlatform connects 140,000+ members across 52 national Mensas.
              Our platform ensures fair, blind judging and professional-grade file management.
            </p>

            <div className="grid grid-cols-2 gap-8 mb-12">
              <div>
                <h4 className="text-3xl font-bold mb-1">52</h4>
                <p className="text-gray-500 text-sm uppercase font-bold tracking-widest">Countries</p>
              </div>
              <div>
                <h4 className="text-3xl font-bold mb-1">4.2k</h4>
                <p className="text-gray-500 text-sm uppercase font-bold tracking-widest">Last year entries</p>
              </div>
            </div>

            <Link href="/rules" className="inline-flex items-center gap-2 px-8 py-4 rounded-xl grad-premium text-white font-bold hover:scale-105 transition-transform group">
              Read the Rules <ArrowUpRight className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* Newsletter/CTA */}
      <section className="py-24 px-8 max-w-4xl mx-auto text-center">
        <h2 className="text-4xl font-bold mb-6">Stay Informed</h2>
        <p className="text-gray-400 mb-10">Get the latest updates on judging results and upcoming phases directly in your inbox.</p>
        <div className="flex flex-col sm:flex-row gap-4">
          <input
            type="email"
            placeholder="your@email.com"
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-6 py-4 focus:outline-none focus:border-purple-500/50"
          />
          <button className="px-10 py-4 rounded-xl bg-white text-black font-bold hover:bg-gray-200 transition-colors">
            Subscribe
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-black py-20 px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <div className="grad-premium p-1.5 rounded-lg">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight">Mensa Photo</span>
            </div>
            <p className="text-gray-500 max-w-sm mb-8 leading-relaxed">
              Official photography platform of Mensa International. Empowering visionary artists since 2012.
            </p>
            <div className="flex gap-4">
              <SocialIcon icon={<Instagram />} />
              <SocialIcon icon={<Twitter />} />
              <SocialIcon icon={<Facebook />} />
            </div>
          </div>

          <div>
            <h4 className="font-bold mb-6">Explore</h4>
            <ul className="space-y-4 text-gray-500">
              <li><Link href="/results" className="hover:text-purple-400 transition-colors">Results 2026</Link></li>
              <li><Link href="/submit" className="hover:text-purple-400 transition-colors">Enter Contest</Link></li>
              <li><Link href="/rules" className="hover:text-purple-400 transition-colors">Terms of Service</Link></li>
              <li><Link href="/gallery" className="hover:text-purple-400 transition-colors">Gallery Archieve</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-6">Support</h4>
            <ul className="space-y-4 text-gray-500">
              <li><a href="#" className="hover:text-purple-400 transition-colors">FAQ</a></li>
              <li><a href="#" className="hover:text-purple-400 transition-colors">Coordinator Help</a></li>
              <li><a href="#" className="hover:text-purple-400 transition-colors">Contact Us</a></li>
              <li><a href="#" className="hover:text-purple-400 transition-colors">Privacy Policy</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto pt-8 border-t border-white/5 text-center text-sm text-gray-600">
          <p>&copy; 2026 Mensa PhotoPlatform. Hosted by Mensa International IT Team.</p>
        </div>
      </footer>
    </main>
  );
}

const CategoryCard = ({ title, img, desc }: any) => (
  <div className="group relative h-[400px] rounded-[2rem] overflow-hidden border border-white/5">
    <img src={img} className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700" alt={title} />
    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent p-8 flex flex-col justify-end">
      <h3 className="text-2xl font-black italic mb-2 transform group-hover:-translate-y-1 transition-transform">{title}</h3>
      <p className="text-gray-400 text-sm opacity-0 group-hover:opacity-100 transition-all duration-500 delay-100">{desc}</p>
    </div>
  </div>
);

const TimelineItem = ({ date, title, desc, active = false }: any) => (
  <div className="relative group text-center lg:text-left">
    <div className={cn(
      "w-12 h-12 rounded-full border-4 border-[#050505] mx-auto lg:mx-0 mb-6 flex items-center justify-center relative z-10 transition-colors",
      active ? "bg-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.5)]" : "bg-white/10 group-hover:bg-white/20"
    )}>
      {active && <div className="w-2 h-2 bg-white rounded-full animate-ping" />}
    </div>
    <span className={cn(
      "text-xs font-bold tracking-[0.2em] mb-2 block",
      active ? "text-purple-400" : "text-gray-600"
    )}>{date}</span>
    <h4 className="text-xl font-bold mb-2 italic">{title}</h4>
    <p className="text-sm text-gray-500">{desc}</p>
  </div>
);

const SocialIcon = ({ icon }: any) => (
  <a href="#" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:border-white/20 transition-all">
    {React.cloneElement(icon, { size: 18 })}
  </a>
);
