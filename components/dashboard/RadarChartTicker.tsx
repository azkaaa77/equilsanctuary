"use client";

import React, { useEffect, useState, useMemo } from "react";
import { motion } from "motion/react";
import { useEquilibriumScore } from "@/hooks/use-equilibrium";

// ── RADAR GEOMETRY ──────────────────────────────────────────
const AXIS_COUNT = 5;
const CENTER = 100;
const MAX_R = 75;
const GRID_RINGS = [0.33, 0.66, 1.0];
const AXIS_LABELS = ["MOOD", "HEAL", "SPEND", "PURPOSE", "BALANCE"];

function polarToXY(index: number, value: number): [number, number] {
  const angle = (Math.PI * 2 * index) / AXIS_COUNT - Math.PI / 2;
  const r = value * MAX_R;
  return [CENTER + r * Math.cos(angle), CENTER + r * Math.sin(angle)];
}

function toPoints(values: number[]): string {
  return values.map((v, i) => polarToXY(i, v).join(",")).join(" ");
}

// ── ROLLING NUMBER ──────────────────────────────────────────
interface RollingDigitProps {
  digit: number;
  delay: number;
}

function RollingDigit({ digit, delay }: RollingDigitProps) {
  return (
    <span
      className="relative inline-block overflow-hidden h-[1em]"
      style={{ width: "0.65em" }}
    >
      <motion.span
        className="absolute left-0 top-0 flex flex-col"
        initial={{ y: 0 }}
        animate={{ y: `${-digit * 1}em` }}
        transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1], delay }}
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
export default function RadarChartTicker({ compact = false }: { compact?: boolean }) {
  const { score, mood, healingFactor, spendingRatio, purposeScore } =
    useEquilibriumScore();

  const radarValues = useMemo(
    () => [
      mood / 10,
      healingFactor,
      1 - spendingRatio / 100,
      purposeScore / 10,
      Math.min(score / 100, 1),
    ],
    [mood, healingFactor, spendingRatio, purposeScore, score],
  );

  const [floats] = useState(() => [
    { delay: 0, duration: 4.2 },
    { delay: 0.6, duration: 4.8 },
  ]);

  const radarValuesMorphed = useMemo(
    () => radarValues.map((v) => Math.min(1, v + 0.06)),
    [radarValues],
  );
  const digits = String(Math.min(score, 99))
    .padStart(2, "0")
    .split("")
    .map(Number);

  return (
    <section
      className={`w-full flex flex-col md:flex-row items-center ${
        compact ? "gap-4 md:gap-8 py-1" : "gap-8 md:gap-16 py-3"
      }`}
      aria-label="Equilibrium score"
    >
      {/* ── LEFT: Giant Emerald Metric ── */}
      <div className={`w-full flex flex-col justify-center ${compact ? "md:w-[48%]" : "md:w-[45%]"}`}>
        <div className={`font-display font-black tracking-tighter leading-none text-[#2D6A4F] flex items-center ${
          compact ? "text-[5.5rem] md:text-[6.5rem] lg:text-[7.5rem]" : "text-[9rem] md:text-[13rem]"
        }`}>
          {digits.map((d, i) => (
            <RollingDigit key={`digit-${i}`} digit={d} delay={i * 0.2} />
          ))}
        </div>

        <span className={`font-mono tracking-[0.4em] text-[#2D6A4F]/40 uppercase ${compact ? "text-[8px] mt-2" : "text-[10px] mt-4"}`}>
          EQUILIBRIUM INTEGRITY INDEX
        </span>

        <div className={`flex gap-6 ${compact ? "gap-6 mt-4" : "gap-10 mt-8"}`}>
          {[
            { label: "MOOD", value: mood, max: 10 },
            { label: "HEAL", value: Math.round(healingFactor * 100), max: 100 },
            { label: "PURPOSE", value: purposeScore, max: 10 },
          ].map((item) => (
            <div key={item.label} className="flex flex-col gap-0.5">
              <span className={`font-display font-semibold text-equil-onyx/60 tracking-tight ${compact ? "text-lg" : "text-2xl"}`}>
                {item.value}
                <span className="text-[10px] text-equil-onyx/20 font-mono ml-0.5">
                  /{item.max}
                </span>
              </span>

              <span className="text-[8px] font-sans font-light text-equil-forest/50 uppercase tracking-widest">
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── RIGHT: Morphing SVG Radar ── */}
      <motion.div
        className={`w-full flex justify-center shrink-0 ${
          compact ? "md:w-[48%] md:justify-end" : "md:w-[60%] md:justify-end"
        } antigravity-card`}
        style={{
          animationDelay: `${floats[1].delay}s`,
          animationDuration: `${floats[1].duration}s`,
        }}
      >
        <div className={compact ? "relative w-48 h-48 md:w-52 md:h-52 lg:w-56 lg:h-56" : "relative w-64 h-64 md:w-80 md:h-80"}>
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
                  x1={CENTER}
                  y1={CENTER}
                  x2={x}
                  y2={y}
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
                ease: "easeInOut",
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
                    ease: "easeInOut",
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
                  style={{ fontSize: "6px", letterSpacing: "0.15em" }}
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
