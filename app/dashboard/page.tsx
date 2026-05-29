// app/dashboard/page.tsx
// EQUIL Dashboard v7.0 — The Equilibrium Control Room
// Assembles: AmbientGreeting, RadarChartTicker, InteractiveCalendar,
// MaximizedHeatmap, and System Module Links.

'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/providers/auth-provider';
import { useLanguage } from '@/components/providers/language-provider';
import AmbientGreeting from '@/components/dashboard/AmbientGreeting';
import RadarChartTicker from '@/components/dashboard/RadarChartTicker';
import InteractiveCalendar from '@/components/dashboard/InteractiveCalendar';
import MaximizedHeatmap from '@/components/dashboard/MaximizedHeatmap';

// ── MODULE NAV DATA ─────────────────────────────────────────
const modulesDict = {
  id: {
    modules: [
      { title: 'MENTAL SANCTUARY', path: '/dashboard/mental-sanctuary', active: true },
      { title: 'FUTURE ARCHITECTURE', path: '/dashboard/future-architecture', active: true },
      { title: 'IMPULSE SHIELD', path: '/dashboard/impulse-shield', active: true },
      { title: 'SANCTUARY AI', path: '/dashboard/sanctuary-ai', active: true },
      { title: 'SOUL COMMUNITY', path: '/dashboard/soul-community', active: true },
    ],
    statusActive: 'STATUS: ACTIVE // PRISTINE',
    sectionLabel: '04 // MODUL SISTEM',
    sectionTitle: 'Akses',
    sectionSub: 'modul.',
  },
  en: {
    modules: [
      { title: 'MENTAL SANCTUARY', path: '/dashboard/mental-sanctuary', active: true },
      { title: 'FUTURE ARCHITECTURE', path: '/dashboard/future-architecture', active: true },
      { title: 'IMPULSE SHIELD', path: '/dashboard/impulse-shield', active: true },
      { title: 'SANCTUARY AI', path: '/dashboard/sanctuary-ai', active: true },
      { title: 'SOUL COMMUNITY', path: '/dashboard/soul-community', active: true },
    ],
    statusActive: 'STATUS: ACTIVE // PRISTINE',
    sectionLabel: '04 // SYSTEM MODULES',
    sectionTitle: 'Access',
    sectionSub: 'modules.',
  },
};

export default function DashboardPage() {
  const { mounted } = useAuth();
  const { language } = useLanguage();

  if (!mounted) return null;

  const t = modulesDict[language as keyof typeof modulesDict] || modulesDict.id;

  return (
    <div className="space-y-8 w-full max-w-full overflow-x-hidden">

      {/* ── 1. DYNAMIC AMBIENT GREETING (Session-aware) ── */}
      <AmbientGreeting />

      {/* ── Divider ── */}
      <div className="w-full h-px bg-equil-onyx/[0.05]" />

      {/* ── 2. MORPHING RADAR CHART & ROLLING NUMBER TICKER ── */}
      <RadarChartTicker />

      {/* ── Divider ── */}
      <div className="w-full h-px bg-equil-onyx/[0.05]" />

      {/* ── 3. REAL-TIME GLASSMORPHISM CALENDAR (date-fns) ── */}
      <InteractiveCalendar />

      {/* ── Divider ── */}
      <div className="w-full h-px bg-equil-onyx/[0.05] mt-12" />

      {/* ── 4. MAXIMIZED HEATMAP (2-col + giant stats + sparkline) ── */}
      <MaximizedHeatmap />

      {/* ── Divider ── */}
      <div className="w-full h-px bg-equil-onyx/[0.05] mt-8" />

      {/* ── 5. SYSTEM MODULE HIGHLIGHTS ── */}
      <section className="w-full pt-6 pb-20" aria-label="System modules">
        <div className="mb-8">
          <span className="text-[9px] font-mono tracking-[0.3em] text-equil-onyx/25 uppercase block mb-2">
            {t.sectionLabel}
          </span>
          <h3 className="text-3xl font-display font-black tracking-tightest text-equil-onyx leading-[0.9]">
            {t.sectionTitle}<br />
            <span className="italic font-normal text-equil-mint/70">{t.sectionSub}</span>
          </h3>
        </div>

        <div className="flex flex-col">
          {t.modules.map((mod) => (
            <Link
              key={mod.path}
              href={mod.path}
              className={`w-full flex items-center justify-between py-5 border-b border-equil-onyx/[0.05] group px-4 -mx-4 rounded-lg transition-all duration-300 ${
                mod.active
                  ? 'hover:bg-equil-sage/30 cursor-pointer'
                  : 'opacity-40 cursor-not-allowed pointer-events-none'
              }`}
              aria-label={`Navigate to ${mod.title}`}
            >
              <div className="flex items-center gap-4">
                {mod.active && (
                  <span className="w-1.5 h-1.5 rounded-full bg-equil-mint dot-pulse" />
                )}
                <h4 className="text-[11px] font-mono font-bold tracking-[0.2em] uppercase text-equil-onyx/70 group-hover:text-equil-onyx transition-colors">
                  {mod.title}
                </h4>
              </div>
              <div className="flex items-center gap-6">
                <span className="text-[8px] font-mono tracking-[0.2em] uppercase text-equil-onyx/20 group-hover:text-equil-mint transition-colors hidden sm:block">
                  {mod.active ? t.statusActive : 'COMING SOON'}
                </span>
                <span className="text-base font-light text-equil-onyx/15 group-hover:text-equil-mint group-hover:translate-x-1.5 transition-all duration-300">
                  →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

    </div>
  );
}
