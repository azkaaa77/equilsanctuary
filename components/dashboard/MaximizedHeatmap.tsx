// components/dashboard/MaximizedHeatmap.tsx
// 2-column layout: Left = heatmap grid, Right = giant stats + sparkline.
// Maximizes whitespace on the right with colossal Onyx numbers.

'use client';

import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '@/components/providers/language-provider';
import { useAntigravity } from '@/hooks/use-antigravity';

// ── TYPES ───────────────────────────────────────────────────
interface HeatmapCell {
  week: number;
  day: number;
  value: number;   // 0–4 intensity
  date: string;    // Display label
  count: number;   // Activity count
}

// ── INTENSITY PALETTE (Sage → Mint) ─────────────────────────
const INTENSITY_CLASSES = [
  'bg-equil-sage/20',
  'bg-equil-sage/50',
  'bg-equil-mint/25',
  'bg-equil-mint/50',
  'bg-equil-mint',
];

const INTENSITY_LABELS_ID = ['Istirahat', 'Ringan', 'Sedang', 'Aktif', 'Puncak'];
const INTENSITY_LABELS_EN = ['Rest', 'Light', 'Moderate', 'Active', 'Peak'];

// ── SPARKLINE DATA (12 weeks of weekly totals) ──────────────
const SPARKLINE_DATA = [12, 18, 14, 22, 25, 19, 28, 32, 26, 30, 35, 31];

// ── GENERATE MOCK DATA (12 weeks × 7 days) ──────────────────
function generateHeatmapData(): { cells: HeatmapCell[]; totalCount: number; activeDays: number } {
  const cells: HeatmapCell[] = [];
  let totalCount = 0;
  let activeDays = 0;
  const now = new Date();

  for (let week = 0; week < 12; week++) {
    for (let day = 0; day < 7; day++) {
      const daysAgo = (11 - week) * 7 + (6 - day);
      const date = new Date(now);
      date.setDate(date.getDate() - daysAgo);

      const seed = (date.getDate() * 31 + date.getMonth() * 13 + week * 7 + day) % 100;
      let value: number;
      if (seed < 18) value = 0;
      else if (seed < 40) value = 1;
      else if (seed < 60) value = 2;
      else if (seed < 82) value = 3;
      else value = 4;

      const counts = [0, 1, 3, 5, 8];
      totalCount += counts[value];
      if (value > 0) activeDays++;

      cells.push({
        week,
        day,
        value,
        date: date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
        count: counts[value],
      });
    }
  }
  return { cells, totalCount, activeDays };
}

// ── SPARKLINE SVG ───────────────────────────────────────────
function Sparkline({ data, className = '' }: { data: number[]; className?: string }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const w = 200;
  const h = 48;
  const pad = 4;

  const points = data.map((v, i) => {
    const x = pad + (i / (data.length - 1)) * (w - pad * 2);
    const y = h - pad - ((v - min) / range) * (h - pad * 2);
    return `${x},${y}`;
  }).join(' ');

  // Area fill path
  const firstX = pad;
  const lastX = pad + ((data.length - 1) / (data.length - 1)) * (w - pad * 2);
  const areaPath = `M${firstX},${h} L${points.split(' ').map(p => p).join(' L')} L${lastX},${h} Z`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className={`${className}`} preserveAspectRatio="none">
      {/* Fill area */}
      <path
        d={`M${firstX},${h} ${points.split(' ').map(p => `L${p}`).join(' ')} L${lastX},${h} Z`}
        fill="url(#sparkGradient)"
      />
      {/* Line */}
      <polyline
        points={points}
        fill="none"
        stroke="var(--color-equil-mint)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* End dot */}
      {(() => {
        const lastPoint = points.split(' ').pop()!.split(',');
        return (
          <circle
            cx={lastPoint[0]}
            cy={lastPoint[1]}
            r="3"
            fill="var(--color-equil-mint)"
          />
        );
      })()}
      <defs>
        <linearGradient id="sparkGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--color-equil-mint)" stopOpacity="0.15" />
          <stop offset="100%" stopColor="var(--color-equil-mint)" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  );
}

// ── SINGLE HEATMAP CELL ─────────────────────────────────────
function HeatmapCellComponent({
  cell,
  floatDelay,
  floatDuration,
  label,
}: {
  cell: HeatmapCell;
  floatDelay: number;
  floatDuration: number;
  label: string;
}) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="relative">
      <motion.div
        className={`w-[10px] h-[10px] md:w-[11px] md:h-[11px] rounded-[2px] cursor-pointer
          ${INTENSITY_CLASSES[cell.value]}
          border border-equil-forest/[0.03]
          hover:ring-1 hover:ring-equil-mint/30 hover:ring-offset-1 hover:ring-offset-equil-paper
          transition-colors duration-200
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
        aria-label={`${cell.date}: ${cell.count} aktivitas (${label})`}
      />

      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.95 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 pointer-events-none"
          >
            <div className="crystal-glass rounded-lg px-3 py-2 shadow-lg min-w-max bg-white/95">
              <p className="text-[9px] font-mono font-bold tracking-[0.15em] text-equil-onyx/80 uppercase">
                {cell.date}
              </p>
              <p className="text-[8px] font-mono tracking-[0.1em] text-equil-mint mt-0.5">
                {cell.count} aktivitas · {label}
              </p>
            </div>
            <div className="w-2 h-2 bg-white border-r border-b border-equil-forest/10 rotate-45 mx-auto -mt-1" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── MAIN COMPONENT ──────────────────────────────────────────
export default function MaximizedHeatmap() {
  const { language } = useLanguage();
  const { cells, totalCount, activeDays } = useMemo(() => generateHeatmapData(), []);
  const floatConfigs = useAntigravity(84, 'gentle');

  const labels = language === 'en' ? INTENSITY_LABELS_EN : INTENSITY_LABELS_ID;

  const weeks = useMemo(() => {
    const grouped: HeatmapCell[][] = Array.from({ length: 12 }, () => []);
    cells.forEach((cell) => grouped[cell.week].push(cell));
    return grouped;
  }, [cells]);

  const dayLabels = language === 'en'
    ? ['M', '', 'W', '', 'F', '', 'S']
    : ['S', '', 'R', '', 'J', '', 'M'];

  // Trend percentage (comparing last 4 weeks vs prior 4 weeks)
  const trendPct = useMemo(() => {
    const recent = SPARKLINE_DATA.slice(-4).reduce((a, b) => a + b, 0);
    const prior = SPARKLINE_DATA.slice(-8, -4).reduce((a, b) => a + b, 0);
    if (prior === 0) return 0;
    return Math.round(((recent - prior) / prior) * 100);
  }, []);

  return (
    <section className="w-full relative" aria-label="Activity heatmap">
      {/* Header */}
      <div className="mb-4">
        <span className="text-[9px] font-mono tracking-[0.3em] text-equil-onyx/25 uppercase block mb-1">
          03 // {language === 'id' ? 'AKTIVITAS 12 MINGGU' : '12-WEEK ACTIVITY'}
        </span>
        <h3 className="text-xl md:text-2xl font-display font-black tracking-tightest text-equil-onyx leading-none">
          {language === 'id' ? 'Konsistensi ' : 'Consistency '}
          <span className="italic font-normal text-equil-mint/70">
            {language === 'id' ? 'perjalanan.' : 'of journey.'}
          </span>
        </h3>
      </div>

      {/* ── 1-COLUMN STACKED LAYOUT ── */}
      <div className="flex flex-col gap-5 w-full">

        {/* STATS GRID */}
        <div className="grid grid-cols-2 gap-4 w-full">
          {/* Total Activities */}
          <div className="flex flex-col justify-center">
            <span className="text-[8px] font-mono tracking-[0.2em] text-equil-onyx/30 uppercase block mb-0.5">
              {language === 'id' ? 'TOTAL AKTIVITAS' : 'TOTAL ACTIVITIES'}
            </span>
            <span className="text-3xl font-display font-black text-equil-onyx leading-none tracking-tightest">
              {totalCount}
            </span>
            <div className="flex items-center gap-1.5 mt-1">
              <span className={`text-[10px] font-display font-black tracking-tight ${trendPct >= 0 ? 'text-equil-mint' : 'text-equil-coral'}`}>
                {trendPct >= 0 ? '↑' : '↓'} {Math.abs(trendPct)}%
              </span>
              <span className="text-[8px] font-mono tracking-[0.1em] text-equil-onyx/20 uppercase">
                vs 4w
              </span>
            </div>
          </div>

          {/* Active Days */}
          <div className="flex flex-col justify-center">
            <span className="text-[8px] font-mono tracking-[0.2em] text-equil-onyx/30 uppercase block mb-0.5">
              {language === 'id' ? 'HARI AKTIF' : 'ACTIVE DAYS'}
            </span>
            <span className="text-3xl font-display font-black text-equil-mint leading-none tracking-tightest">
              {activeDays}
            </span>
            <div className="mt-1 flex items-center gap-1.5">
              <div className="w-12 h-1 bg-equil-sage/60 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-equil-mint rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.round((activeDays / 84) * 100)}%` }}
                  transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1], delay: 0.5 }}
                />
              </div>
              <span className="text-[9px] font-mono font-bold text-equil-onyx/40">
                {Math.round((activeDays / 84) * 100)}%
              </span>
            </div>
          </div>
        </div>

        {/* Heatmap Grid */}
        <div className="w-full flex flex-col items-center justify-center">
          <div className="flex gap-[2px] w-full justify-center">
            {/* Day labels */}
            <div className="flex flex-col gap-[2px] mr-1 pt-[1px]">
              {dayLabels.map((label, i) => (
                <div key={i} className="h-[10px] md:h-[11px] flex items-center">
                  <span className="text-[6px] font-mono tracking-[0.1em] text-equil-onyx/25 uppercase w-3 text-right">
                    {label}
                  </span>
                </div>
              ))}
            </div>

            {/* Week columns */}
            {weeks.map((weekCells, weekIndex) => (
              <div key={weekIndex} className="flex flex-col gap-[2px]">
                {weekCells.map((cell) => {
                  const idx = cell.week * 7 + cell.day;
                  const cfg = floatConfigs[idx];
                  return (
                    <HeatmapCellComponent
                      key={`${cell.week}-${cell.day}`}
                      cell={cell}
                      floatDelay={cfg ? parseFloat(cfg.delay) : 0}
                      floatDuration={cfg ? parseFloat(cfg.duration) : 4}
                      label={labels[cell.value]}
                    />
                  );
                })}
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-1.5 mt-3 justify-center">
            <span className="text-[6px] font-mono tracking-[0.1em] text-equil-onyx/15 uppercase">
              {language === 'id' ? 'Kurang' : 'Less'}
            </span>
            {INTENSITY_CLASSES.map((cls, i) => (
              <div key={i} className={`w-[9px] h-[9px] rounded-[1.5px] ${cls} border border-equil-forest/[0.03]`} />
            ))}
            <span className="text-[6px] font-mono tracking-[0.1em] text-equil-onyx/15 uppercase">
              {language === 'id' ? 'Lebih' : 'More'}
            </span>
          </div>
        </div>

        {/* Sparkline underneath */}
        <div className="w-full h-8 mt-1">
          <Sparkline data={SPARKLINE_DATA} className="w-full h-full" />
        </div>

      </div>
    </section>
  );
}
