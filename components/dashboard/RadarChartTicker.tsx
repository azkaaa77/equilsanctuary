// components/dashboard/RadarChartTicker.tsx
// Morphing SVG Radar Chart + Giant Rolling Number Ticker.
// The card floats via Antigravity and the radar web breathes organically.

'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { useEquilibriumScore } from '@/hooks/use-equilibrium';
import { useAntigravity } from '@/hooks/use-antigravity';

// ── RADAR GEOMETRY ──────────────────────────────────────────
// 5-axis radar: Mood, Healing, Spending, Purpose, Balance
const AXIS_COUNT = 5;
const CENTER = 100;
const MAX_R = 75;
const LABEL_R = 88;

const AXIS_LABELS = ['MOOD', 'HEAL', 'SPEND', 'PURPOSE', 'BALANCE'];

/** Convert axis index + value (0–1) to SVG x,y */
function polarToXY(index: number, value: number): [number, number] {
  const angle = (Math.PI * 2 * index) / AXIS_COUNT - Math.PI / 2;
  const r = value * MAX_R;
  return [CENTER + r * Math.cos(angle), CENTER + r * Math.sin(angle)];
}

/** Generate SVG polygon points string from values array */
function toPoints(values: number[]): string {
  return values
    .map((v, i) => polarToXY(i, v).join(','))
    .join(' ');
}

// Grid rings at 33%, 66%, 100%
const GRID_RINGS = [0.33, 0.66, 1.0];

// ── ROLLING NUMBER ──────────────────────────────────────────
interface RollingDigitProps {
  digit: number;
  delay: number;
}

function RollingDigit({ digit, delay }: RollingDigitProps) {
  return (
    <span className="relative inline-block overflow-hidden h-[1em]" style={{ width: '0.62em' }}>
      <motion.span
        className="absolute left-0 top-0 flex flex-col"
        initial={{ y: 0 }}
        animate={{ y: `${-digit * 1}em` }}
        transition={{
          duration: 1.2,
          ease: [0.16, 1, 0.3, 1],
          delay,
        }}
      >
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
          <span key={n} className="block h-[1em] leading-[1em]">
            {n}
          </span>
        ))}
      </motion.span>
    </span>
  );
}

// ── MAIN COMPONENT ──────────────────────────────────────────
export default function RadarChartTicker() {
  const { score, mood, healingFactor, spendingRatio, purposeScore } = useEquilibriumScore();
  const [floats] = useState(() => {
    // We need 2 floating configs: one for score block, one for radar
    return [
      { delay: 0, duration: 4.2 },
      { delay: 0.6, duration: 4.8 },
    ];
  });

  // Normalize all values to 0–1 range for radar
  const radarValues = useMemo(() => [
    mood / 10,                          // Mood: 0–10 → 0–1
    healingFactor,                      // HealingFactor: already 0–1
    1 - (spendingRatio / 100),          // Spending: inverted (less = better)
    purposeScore / 10,                  // Purpose: 0–10 → 0–1
    Math.min(score / 100, 1),           // Balance: overall score
  ], [mood, healingFactor, spendingRatio, purposeScore, score]);

  // Slightly morphed version for breathing animation
  const radarValuesMorphed = useMemo(() => 
    radarValues.map(v => Math.min(1, v + 0.06)),
  [radarValues]);

  // Score digits for rolling number
  const digits = String(Math.min(score, 99)).padStart(2, '0').split('').map(Number);

  return (
    <section
      className="w-full flex flex-col md:flex-row gap-12 md:gap-16 items-center py-6"
      aria-label="Equilibrium score and radar chart"
    >
      {/* ── LEFT: Giant Rolling Number ── */}
      <motion.div
        className="w-full md:w-[40%] flex flex-col antigravity-card"
        style={{ animationDelay: `${floats[0].delay}s`, animationDuration: `${floats[0].duration}s` }}
      >
        {/* Score number */}
        <div
          className="text-[8rem] md:text-[11rem] font-display font-black tracking-tightest leading-none text-equil-onyx metric-number flex"
          aria-label={`Equilibrium score: ${score}`}
        >
          {digits.map((d, i) => (
            <RollingDigit key={`digit-${i}`} digit={d} delay={i * 0.15} />
          ))}
        </div>

        {/* Label */}
        <span className="text-[9px] font-mono tracking-[0.35em] text-equil-onyx/30 uppercase mt-5">
          INTEGRITY METRIC // EQUILIBRIUM INDEX
        </span>

        {/* Mini breakdown */}
        <div className="flex gap-6 mt-6">
          {[
            { label: 'MOOD', value: mood, max: 10 },
            { label: 'HEAL', value: Math.round(healingFactor * 100), max: 100 },
            { label: 'PURPOSE', value: purposeScore, max: 10 },
          ].map((item) => (
            <div key={item.label} className="flex flex-col">
              <span className="text-lg font-display font-black text-equil-onyx/70 tracking-tightest">
                {item.value}
                <span className="text-xs text-equil-onyx/20 font-mono">/{item.max}</span>
              </span>
              <span className="text-[8px] font-mono tracking-[0.3em] text-equil-onyx/20 uppercase">
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* ── RIGHT: Morphing SVG Radar ── */}
      <motion.div
        className="w-full md:w-[60%] flex justify-center md:justify-end antigravity-card"
        style={{ animationDelay: `${floats[1].delay}s`, animationDuration: `${floats[1].duration}s` }}
      >
        <div className="relative w-64 h-64 md:w-80 md:h-80">
          <svg
            viewBox="0 0 200 200"
            className="w-full h-full"
            aria-hidden="true"
          >
            {/* Grid rings — Forest at low opacity */}
            {GRID_RINGS.map((ring, i) => (
              <polygon
                key={`ring-${i}`}
                points={toPoints(Array(AXIS_COUNT).fill(ring))}
                fill="none"
                stroke="var(--color-equil-forest)"
                strokeWidth="0.5"
                strokeOpacity={0.08 + i * 0.04}
              />
            ))}

            {/* Axis lines */}
            {Array.from({ length: AXIS_COUNT }, (_, i) => {
              const [x, y] = polarToXY(i, 1);
              return (
                <line
                  key={`axis-${i}`}
                  x1={CENTER} y1={CENTER}
                  x2={x} y2={y}
                  stroke="var(--color-equil-forest)"
                  strokeWidth="0.5"
                  strokeOpacity="0.06"
                />
              );
            })}

            {/* Data shape — Mint fill, breathing morph */}
            <motion.polygon
              fill="rgba(45,106,79,0.08)"
              stroke="var(--color-equil-mint)"
              strokeWidth="1.5"
              strokeLinejoin="round"
              animate={{
                points: [
                  toPoints(radarValues),
                  toPoints(radarValuesMorphed),
                  toPoints(radarValues),
                ],
              }}
              transition={{
                duration: 6,
                ease: 'easeInOut',
                repeat: Infinity,
              }}
              points={toPoints(radarValues)}
            />

            {/* Data points — Mint dots */}
            {radarValues.map((v, i) => {
              const [x, y] = polarToXY(i, v);
              return (
                <motion.circle
                  key={`dot-${i}`}
                  cx={x}
                  cy={y}
                  r="3"
                  fill="var(--color-equil-mint)"
                  animate={{
                    r: [3, 4, 3],
                    opacity: [0.8, 1, 0.8],
                  }}
                  transition={{
                    duration: 3,
                    ease: 'easeInOut',
                    repeat: Infinity,
                    delay: i * 0.3,
                  }}
                />
              );
            })}

            {/* Center dot */}
            <circle
              cx={CENTER}
              cy={CENTER}
              r="2"
              fill="var(--color-equil-mint)"
              opacity="0.4"
            />

            {/* Axis labels */}
            {AXIS_LABELS.map((label, i) => {
              const [x, y] = polarToXY(i, 1.18);
              return (
                <text
                  key={`label-${i}`}
                  x={x}
                  y={y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  className="fill-equil-forest/25 text-[6px] font-mono tracking-widest uppercase"
                  style={{ fontSize: '6px', letterSpacing: '0.15em' }}
                >
                  {label}
                </text>
              );
            })}
          </svg>
        </div>
      </motion.div>
    </section>
  );
}
