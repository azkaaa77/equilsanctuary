// hooks/use-antigravity.ts
// Generates per-element floating animation configs with randomized delays,
// creating the illusion of weightless UI elements drifting in calm space.

"use client";

import { useMemo } from "react";

interface AntigravityConfig {
  /** CSS animation-delay value (e.g. "0.8s") */
  delay: string;
  /** CSS animation-duration value (e.g. "4.2s") */
  duration: string;
  /** Framer Motion animate props for the floating loop */
  motionAnimate: {
    y: string[];
  };
  /** Framer Motion transition props */
  motionTransition: {
    duration: number;
    ease: string;
    repeat: typeof Infinity;
    repeatType: "mirror";
    delay: number;
  };
  /** Inline style object for CSS-only antigravity (no Framer Motion needed) */
  style: {
    animationDelay: string;
    animationDuration: string;
  };
}

/**
 * useAntigravity
 *
 * Generates a stable array of floating animation configs.
 * Each element gets a unique delay + duration so nothing moves in sync —
 * feels like objects gently bobbing in zero gravity.
 *
 * @param count - Number of floating elements to configure
 * @param intensity - 'gentle' (±3px) | 'medium' (±5px) | 'strong' (±8px)
 */
export function useAntigravity(
  count: number = 4,
  intensity: "gentle" | "medium" | "strong" = "gentle",
): AntigravityConfig[] {
  const amplitude = intensity === "gentle" ? 3 : intensity === "medium" ? 5 : 8;

  const configs = useMemo(() => {
    // Seeded pseudo-random to keep SSR/hydration stable
    const seed = (i: number) => ((i * 2654435761) % 1000) / 1000;

    return Array.from({ length: count }, (_, i) => {
      const delayVal = +(seed(i) * 2).toFixed(2); // 0–2s delay
      const durationVal = +(3.5 + seed(i + 100) * 2).toFixed(2); // 3.5–5.5s duration

      return {
        delay: `${delayVal}s`,
        duration: `${durationVal}s`,
        motionAnimate: {
          y: [`-${amplitude}px`, `${amplitude}px`, `-${amplitude}px`],
        },
        motionTransition: {
          duration: durationVal,
          ease: "easeInOut",
          repeat: Infinity,
          repeatType: "mirror" as const,
          delay: delayVal,
        },
        style: {
          animationDelay: `${delayVal}s`,
          animationDuration: `${durationVal}s`,
        },
      };
    });
  }, [count, amplitude]);

  return configs;
}
