// components/dashboard/ActivityHeatmap.tsx
// GitHub-style activity heatmap with Sage→Mint intensity gradient,
// per-cell antigravity floating delays, and elegant hover tooltips.

'use client';

import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAntigravity } from '@/hooks/use-antigravity';
import { useLanguage } from '@/components/providers/language-provider';

// ── TYPES ───────────────────────────────────────────────────
interface HeatmapCell {
  week: number;
  day: number;
  value: number;   // 0–4 intensity level
  date: string;    // Display label
  count: number;   // Activity count
}

// ── INTENSITY PALETTE (Sage → Mint) ─────────────────────────
const INTENSITY_CLASSES = [
  'bg-equil-sage/20',          // 0 — empty / rest day
  'bg-equil-sage/60',          // 1 — low
  'bg-equil-mint/30',          // 2 — moderate
  'bg-equil-mint/60',          // 3 — active
  'bg-equil-mint',             // 4 — peak
];

const INTENSITY_LABELS = ['Istirahat', 'Ringan', 'Sedang', 'Aktif', 'Puncak'];
const INTENSITY_LABELS_EN = ['Rest', 'Light', 'Moderate', 'Active', 'Peak'];

// ── GENERATE MOCK DATA (12 weeks × 7 days) ──────────────────
function generateHeatmapData(): HeatmapCell[] {
  const cells: HeatmapCell[] = [];
  const now = new Date();

  for (let week = 0; week < 12; week++) {
    for (let day = 0; day < 7; day++) {
      const daysAgo = (11 - week) * 7 + (6 - day);
      const date = new Date(now);
      date.setDate(date.getDate() - daysAgo);

      // Seeded deterministic pseudo-random based on date
      const seed = (date.getDate() * 31 + date.getMonth() * 13 + week * 7 + day) % 100;
      let value: number;
      if (seed < 20) value = 0;
      else if (seed < 45) value = 1;
      else if (seed < 65) value = 2;
      else if (seed < 85) value = 3;
      else value = 4;

      const counts = [0, 1, 3, 5, 8];

      cells.push({
        week,
        day,
        value,
        date: date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
        count: counts[value],
      });
    }
  }
  return cells;
}

// ── SINGLE HEATMAP CELL ─────────────────────────────────────
interface CellComponentProps {
  cell: HeatmapCell;
  floatDelay: number;
  floatDuration: number;
  intensityLabel: string;
}

function HeatmapCellComponent({ cell, floatDelay, floatDuration, intensityLabel }: CellComponentProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="relative">
      <motion.div
        className={`w-[14px] h-[14px] md:w-[16px] md:h-[16px] rounded-[3px] cursor-pointer 
          ${INTENSITY_CLASSES[cell.value]}
          border border-equil-forest/[0.03]
          transition-colors duration-200
          hover:ring-1 hover:ring-equil-mint/30 hover:ring-offset-1 hover:ring-offset-equil-paper
        `}
        style={{
          animationName: 'antigravity-float',
          animationTimingFunction: 'ease-in-out',
          animationIterationCount: 'infinite',
          animationDelay: `${floatDelay}s`,
          animationDuration: `${floatDuration}s`,
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        aria-label={`${cell.date}: ${cell.count} aktivitas (${intensityLabel})`}
      />

      {/* Tooltip */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.95 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 pointer-events-none"
          >
            <div className="crystal-glass rounded-lg px-3 py-2 shadow-lg min-w-max">
              <p className="text-[9px] font-mono font-bold tracking-[0.15em] text-equil-onyx/80 uppercase">
                {cell.date}
              </p>
              <p className="text-[8px] font-mono tracking-[0.1em] text-equil-mint mt-0.5">
                {cell.count} {cell.count === 1 ? 'aktivitas' : 'aktivitas'} · {intensityLabel}
              </p>
            </div>
            {/* Tooltip arrow */}
            <div className="w-2 h-2 bg-white/10 backdrop-blur-xl rotate-45 mx-auto -mt-1 border-r border-b border-white/20" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── MAIN COMPONENT ──────────────────────────────────────────
export default function ActivityHeatmap() {
  const { language } = useLanguage();
  const heatmapData = useMemo(() => generateHeatmapData(), []);

  // Generate unique float configs for all cells
  const floatConfigs = useAntigravity(84, 'gentle'); // 12 weeks × 7 days

  // Group by week for column-based rendering
  const weeks = useMemo(() => {
    const grouped: HeatmapCell[][] = Array.from({ length: 12 }, () => []);
    heatmapData.forEach((cell) => grouped[cell.week].push(cell));
    return grouped;
  }, [heatmapData]);

  // Activity summary
  const totalActivities = useMemo(
    () => heatmapData.reduce((sum, cell) => sum + cell.count, 0),
    [heatmapData]
  );
  const activeDays = useMemo(
    () => heatmapData.filter((c) => c.value > 0).length,
    [heatmapData]
  );

  const dayLabels = language === 'en'
    ? ['Mon', '', 'Wed', '', 'Fri', '', 'Sun']
    : ['Sen', '', 'Rab', '', 'Jum', '', 'Min'];

  const labels = language === 'en' ? INTENSITY_LABELS_EN : INTENSITY_LABELS;

  return (
    <section
      className="w-full pt-12 pb-4"
      aria-label="Activity heatmap"
    >
      {/* Section header */}
      <div className="flex items-end justify-between mb-8">
        <div>
          <span className="text-[9px] font-mono tracking-[0.3em] text-equil-onyx/25 uppercase block mb-2">
            03 // {language === 'id' ? 'AKTIVITAS 12 MINGGU' : '12-WEEK ACTIVITY'}
          </span>
          <h3 className="text-3xl font-display font-black tracking-tightest text-equil-onyx leading-[0.9]">
            {language === 'id' ? 'Konsistensi' : 'Consistency'}<br />
            <span className="italic font-normal text-equil-mint/70">
              {language === 'id' ? 'perjalananmu.' : 'of your journey.'}
            </span>
          </h3>
        </div>

        {/* Stats */}
        <div className="hidden md:flex gap-8">
          <div className="flex flex-col items-end">
            <span className="text-2xl font-display font-black text-equil-onyx tracking-tightest">
              {totalActivities}
            </span>
            <span className="text-[8px] font-mono tracking-[0.25em] text-equil-onyx/20 uppercase">
              {language === 'id' ? 'TOTAL AKTIVITAS' : 'TOTAL ACTIVITIES'}
            </span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-2xl font-display font-black text-equil-mint tracking-tightest">
              {activeDays}
            </span>
            <span className="text-[8px] font-mono tracking-[0.25em] text-equil-onyx/20 uppercase">
              {language === 'id' ? 'HARI AKTIF' : 'ACTIVE DAYS'}
            </span>
          </div>
        </div>
      </div>

      {/* Heatmap Grid */}
      <div className="flex gap-1">
        {/* Day labels column */}
        <div className="flex flex-col gap-1 mr-2 pt-0.5">
          {dayLabels.map((label, i) => (
            <div
              key={i}
              className="h-[14px] md:h-[16px] flex items-center"
            >
              <span className="text-[7px] font-mono tracking-[0.2em] text-equil-onyx/20 uppercase w-6 text-right">
                {label}
              </span>
            </div>
          ))}
        </div>

        {/* Weeks */}
        {weeks.map((weekCells, weekIndex) => (
          <div key={weekIndex} className="flex flex-col gap-1">
            {weekCells.map((cell) => {
              const cellIndex = cell.week * 7 + cell.day;
              const config = floatConfigs[cellIndex];
              return (
                <HeatmapCellComponent
                  key={`${cell.week}-${cell.day}`}
                  cell={cell}
                  floatDelay={config ? parseFloat(config.delay) : 0}
                  floatDuration={config ? parseFloat(config.duration) : 4}
                  intensityLabel={labels[cell.value]}
                />
              );
            })}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-3 mt-6">
        <span className="text-[8px] font-mono tracking-[0.2em] text-equil-onyx/20 uppercase">
          {language === 'id' ? 'Kurang' : 'Less'}
        </span>
        {INTENSITY_CLASSES.map((cls, i) => (
          <div
            key={i}
            className={`w-3 h-3 rounded-[2px] ${cls} border border-equil-forest/[0.03]`}
            title={labels[i]}
          />
        ))}
        <span className="text-[8px] font-mono tracking-[0.2em] text-equil-onyx/20 uppercase">
          {language === 'id' ? 'Lebih' : 'More'}
        </span>
      </div>
    </section>
  );
}
