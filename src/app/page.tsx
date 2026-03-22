'use client';

import React from 'react';
import { Navbar } from '@/components/Navbar';
import { Hero } from '@/components/Hero';
import { motion } from 'framer-motion';
import {
  Clock, ArrowUpRight, Instagram,
  Twitter, Facebook
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const font = { fontFamily: 'var(--font-barlow)' };
const fontDisplay = { fontFamily: 'var(--font-oswald)' };
const fontBody = { fontFamily: 'var(--font-garamond)' };

export default function Home() {
  return (
    <main className="min-h-screen bg-[#080300] overflow-hidden" style={{ color: '#F5E0C0' }}>
      <Navbar />

      <Hero />

      {/* Featured Categories */}
      <section className="py-24 px-6 lg:px-12 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="h-px w-8 bg-[#F5A623]" />
              <span className="text-[#F5A623] font-bold uppercase tracking-[0.25em] text-xs" style={font}>
                Spark of Evolution · 2026
              </span>
            </div>
            <h2 className="text-5xl font-bold leading-tight" style={fontDisplay}>Competition Categories</h2>
          </div>
          <p className="text-[#7A6040] max-w-sm text-sm leading-relaxed" style={fontBody}>
            Every photograph carries the Spark of Evolution — the moment transformation reveals itself through the lens.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <CategoryCard
            title="Best Story Award"
            img="https://images.unsplash.com/photo-1455541504462-57ebb2a9cec1"
            desc="A short story behind your favourite image — context, emotion, evolution."
          />
          <CategoryCard
            title="Best Artistic Composition"
            img="https://images.unsplash.com/photo-1502657877623-f66bf489d236"
            desc="Visual mastery: light, geometry, and form in perfect harmony."
          />
          <CategoryCard
            title="Social Impact Award"
            img="https://images.unsplash.com/photo-1469571486292-0ba58a3f068b"
            desc="Photography that sparks change and speaks to the human condition."
          />
          <CategoryCard
            title="Best B&W Image"
            img="https://images.unsplash.com/photo-1517423568366-8b83523034fd"
            desc="The timeless power of light and shadow stripped of colour."
          />
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-24 border-y border-[#C8860A]/10 relative overflow-hidden"
               style={{ background: 'linear-gradient(135deg, #0D0500 0%, #100600 100%)' }}>
        {/* Atmospheric glow */}
        <div className="absolute right-0 top-0 w-96 h-96 bg-[#F5A623]/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="mb-16">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-px w-8 bg-[#F5A623]" />
              <span className="text-[#F5A623] font-bold uppercase tracking-[0.25em] text-xs" style={font}>Key Dates</span>
            </div>
            <h2 className="text-5xl font-bold" style={fontDisplay}>Event Timeline</h2>
          </div>

          <div className="relative">
            <div className="hidden lg:block absolute top-5 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#C8860A]/30 to-transparent" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
              <TimelineItem date="JAN 2026" title="Open" desc="Submission window opens. Photos must be taken from 1 Jan 2026." />
              <TimelineItem date="NOW" title="Submit" desc="Enter via your NM coordinator or directly as DIP. Up to 3 photos." active />
              <TimelineItem date="AUG 31" title="MI Deadline" desc="All NM entries must reach Mensa International by 12:00 UK time." />
              <TimelineItem date="OCT 2026" title="Düsseldorf" desc="Winners announced at IBD+ Meeting. PhotOlympics champions crowned." />
            </div>
          </div>
        </div>
      </section>

      {/* PhotOlympics Banner */}
      <section className="py-20 px-6 lg:px-12 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative border border-[#C8860A]/25 flex flex-col md:flex-row items-center gap-10 p-10 lg:p-14"
          style={{ background: 'linear-gradient(135deg, #0D0500 0%, #120700 50%, #160900 100%)' }}
        >
          {/* top accent line */}
          <div className="absolute top-0 left-0 w-full h-px" style={{ background: 'linear-gradient(90deg, #C8860A, #F5A623, #C8860A)' }} />
          {/* right ambient glow */}
          <div className="absolute right-0 top-0 w-64 h-full pointer-events-none" style={{ background: 'radial-gradient(ellipse at right center, rgba(245,166,35,0.08) 0%, transparent 70%)' }} />

          {/* Logo */}
          <div className="flex-shrink-0 flex items-center justify-center">
            <img src="/photolympics26-W.png" alt="Mensa PhotOlympics 2026" className="h-24 w-auto" style={{ filter: 'drop-shadow(0 0 12px rgba(245,166,35,0.3))' }} />
          </div>

          {/* Text */}
          <div className="relative z-10 flex-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-px w-8 bg-[#F5A623]" />
              <span className="text-[#F5A623] font-bold uppercase tracking-[0.25em] text-xs" style={font}>New in 2026</span>
            </div>
            <h2 className="text-4xl font-bold mb-4 leading-tight text-white" style={fontDisplay}>
              Mensa{' '}
              <span style={{
                background: 'linear-gradient(135deg, #C8860A 0%, #F5A623 60%, #FFD166 100%)',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                color: 'transparent',
              }}>PhotOlympics</span>
              {' '}2026
            </h2>
            <p className="text-[#C8A070] leading-relaxed max-w-xl text-base" style={fontBody}>
              Each national Mensa&apos;s top 3 photographers (winner + 2 runners-up) enter as a national team.
              The NM team with the highest aggregate score wins Gold — plus a trophy, framed certificate,
              and prizes presented at the Düsseldorf IBD+ Meeting in October.
            </p>
          </div>
        </motion.div>
      </section>

      {/* Global Impact — asymmetric layout */}
      <section className="py-32 px-6 lg:px-12 max-w-7xl mx-auto">
        <div className="relative glass border border-[#C8860A]/12"
             style={{ clipPath: 'polygon(0 0, 100% 0, 100% 92%, 96% 100%, 0 100%)' }}>
          {/* Amber glow right */}
          <div className="absolute top-0 right-0 w-2/3 h-full pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-l from-[#F5A623]/08 to-transparent" />
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-80 h-80 bg-[#E8760A]/10 rounded-full blur-[80px]" />
          </div>

          <div className="relative z-10 p-12 lg:p-20 max-w-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-px w-8 bg-[#F5A623]" />
              <span className="text-[#F5A623] font-bold uppercase tracking-[0.25em] text-xs" style={font}>Global Reach</span>
            </div>
            <h2 className="text-5xl font-bold mb-8 leading-tight text-white" style={fontDisplay}>
              A Global{' '}
              <span style={{
                background: 'linear-gradient(135deg, #C8860A 0%, #F5A623 60%, #FFD166 100%)',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                color: 'transparent',
              }}>Collaborative</span>
              {' '}Effort
            </h2>
            <p className="text-[#C8A070] mb-10 leading-relaxed text-lg" style={fontBody}>
              Mensa PhotoPlatform connects 140,000+ members across 52 national Mensas.
              Our platform ensures fair, blind judging and professional-grade file management.
            </p>

            <div className="grid grid-cols-2 gap-8 mb-12">
              <div>
                <h4 className="text-4xl font-bold text-[#F5A623] mb-1" style={fontDisplay}>52</h4>
                <p className="text-[#5A4020] text-xs uppercase font-bold tracking-[0.2em]" style={font}>Countries</p>
              </div>
              <div>
                <h4 className="text-4xl font-bold text-[#F5A623] mb-1" style={fontDisplay}>4.2k</h4>
                <p className="text-[#5A4020] text-xs uppercase font-bold tracking-[0.2em]" style={font}>Last Year Entries</p>
              </div>
            </div>

            <Link href="/rules"
                  className="inline-flex items-center gap-2 px-8 py-4 grad-premium text-[#080300] font-bold uppercase tracking-widest text-sm glow-gold hover:opacity-90 transition-all group"
                  style={{ ...font, clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 100%, 10px 100%)' }}>
              Read the Rules
              <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* Newsletter/CTA */}
      <section className="py-20 px-6 lg:px-12 max-w-4xl mx-auto">
        <div className="border border-[#C8860A]/20 p-10 lg:p-14 relative overflow-hidden"
             style={{ background: 'linear-gradient(135deg, #100500 0%, #080300 100%)', clipPath: 'polygon(0 0, 100% 0, 100% 90%, 94% 100%, 0 100%)' }}>
          <div className="absolute top-0 left-0 w-full h-1 grad-premium" />
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px w-8 bg-[#F5A623]" />
            <span className="text-[#F5A623] font-bold uppercase tracking-[0.25em] text-xs" style={font}>Stay Connected</span>
          </div>
          <h2 className="text-4xl font-bold mb-3" style={fontDisplay}>Stay Informed</h2>
          <p className="text-[#7A6040] mb-8 leading-relaxed" style={fontBody}>
            Get judging results and phase updates directly in your inbox.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              placeholder="your@email.com"
              className="flex-1 bg-[#180800] border border-[#C8860A]/20 px-6 py-4 text-[#F5E0C0] placeholder-[#5A4020] focus:outline-none focus:border-[#F5A623]/50 transition-all"
              style={font}
            />
            <button className="px-10 py-4 grad-premium text-[#080300] font-bold uppercase tracking-widest text-sm hover:opacity-90 transition-all" style={font}>
              Subscribe
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#C8860A]/10 py-20 px-6 lg:px-12"
              style={{ background: '#050200' }}>
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-3 mb-5">
              <img src="/photocup26-logo-W.png" alt="PhotoCup 2026" className="h-10 w-auto opacity-80" />
            </div>
            <p className="text-[#5A4020] max-w-sm mb-8 leading-relaxed text-sm" style={fontBody}>
              Official photography platform of Mensa International. Spark of Evolution — empowering visionary artists worldwide.
            </p>
            <div className="flex gap-3">
              <SocialIcon icon={<Instagram />} />
              <SocialIcon icon={<Twitter />} />
              <SocialIcon icon={<Facebook />} />
            </div>
          </div>

          <div>
            <h4 className="font-bold mb-6 text-[#C8A070] text-xs uppercase tracking-[0.2em]" style={font}>Explore</h4>
            <ul className="space-y-4 text-[#5A4020] text-sm" style={fontBody}>
              <li><Link href="/results" className="hover:text-[#F5A623] transition-colors">Results 2026</Link></li>
              <li><Link href="/submit" className="hover:text-[#F5A623] transition-colors">Enter Contest</Link></li>
              <li><Link href="/rules" className="hover:text-[#F5A623] transition-colors">Terms of Service</Link></li>
              <li><Link href="/gallery" className="hover:text-[#F5A623] transition-colors">Gallery Archive</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-6 text-[#C8A070] text-xs uppercase tracking-[0.2em]" style={font}>Support</h4>
            <ul className="space-y-4 text-[#5A4020] text-sm" style={fontBody}>
              <li><a href="#" className="hover:text-[#F5A623] transition-colors">FAQ</a></li>
              <li><a href="#" className="hover:text-[#F5A623] transition-colors">Coordinator Help</a></li>
              <li><a href="#" className="hover:text-[#F5A623] transition-colors">Contact Us</a></li>
              <li><a href="#" className="hover:text-[#F5A623] transition-colors">Privacy Policy</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto pt-8 border-t border-[#C8860A]/10 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-[#3A2A10]" style={font}>
          <p>&copy; 2026 Mensa PhotoPlatform. Hosted by Mensa International IT Team.</p>
          <p className="text-[#F5A623]/40">photocup@mensa.org · mensa.org/international-competitions</p>
        </div>
      </footer>
    </main>
  );
}

const CategoryCard = ({ title, img, desc }: any) => (
  <motion.div
    whileHover={{ y: -4 }}
    className="group relative h-[420px] overflow-hidden border border-[#C8860A]/10 cursor-pointer"
    style={{ clipPath: 'polygon(0 0, 100% 0, 100% 94%, 94% 100%, 0 100%)' }}
  >
    <img src={img} className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-108 transition-all duration-700" alt={title} style={{ '--tw-scale-x': '1.08', '--tw-scale-y': '1.08' } as React.CSSProperties} />
    <div className="absolute inset-0 bg-gradient-to-t from-[#080300]/95 via-[#080300]/30 to-transparent p-8 flex flex-col justify-end">
      <div className="h-px w-8 bg-[#F5A623] mb-3 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
      <h3 className="text-2xl font-bold mb-2 text-white transform group-hover:-translate-y-1 transition-transform"
          style={{ fontFamily: 'var(--font-oswald)' }}>{title}</h3>
      <p className="text-[#9A7850] text-sm opacity-0 group-hover:opacity-100 transition-all duration-500 delay-100"
         style={{ fontFamily: 'var(--font-garamond)' }}>{desc}</p>
    </div>
  </motion.div>
);

const TimelineItem = ({ date, title, desc, active = false }: any) => (
  <div className="relative group text-left">
    <div className={cn(
      "w-10 h-10 border-2 mb-6 flex items-center justify-center relative z-10 transition-all",
      active
        ? "border-[#F5A623] bg-[#F5A623]/15 shadow-[0_0_20px_rgba(245,166,35,0.4)]"
        : "border-[#C8860A]/20 bg-transparent group-hover:border-[#C8860A]/40"
    )}>
      {active && <div className="w-2 h-2 rounded-full bg-[#F5A623] animate-ping" />}
    </div>
    <span className={cn(
      "text-xs font-bold tracking-[0.2em] mb-2 block",
      active ? "text-[#F5A623]" : "text-[#5A4020]"
    )} style={{ fontFamily: 'var(--font-barlow)' }}>{date}</span>
    <h4 className="text-xl font-bold mb-2 text-white" style={{ fontFamily: 'var(--font-oswald)' }}>{title}</h4>
    <p className="text-sm text-[#7A6040]" style={{ fontFamily: 'var(--font-garamond)' }}>{desc}</p>
  </div>
);

const SocialIcon = ({ icon }: any) => (
  <a href="#" className="w-9 h-9 border border-[#C8860A]/20 flex items-center justify-center text-[#5A4020] hover:text-[#F5A623] hover:border-[#F5A623]/30 transition-all">
    {React.cloneElement(icon, { size: 16 })}
  </a>
);
