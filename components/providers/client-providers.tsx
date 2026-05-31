"use client";

import React, { useEffect, useRef } from "react";
import Lenis from "lenis";
import { motion, AnimatePresence } from "motion/react";
import { LanguageProvider } from "./language-provider";
import { CircadianProvider } from "./circadian-provider";
import { AuthProvider } from "./auth-provider";

import { useAtmosphericSound } from "@/hooks/use-atmospheric-sound";

export function ClientProviders({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = React.useState(false);
  const lenisRef = useRef<Lenis | null>(null);
  useAtmosphericSound();

  useEffect(() => {
    setTimeout(() => setMounted(true), 0);
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    lenisRef.current = lenis;

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  return (
    <AuthProvider>
      <LanguageProvider>
        <CircadianProvider>
          <div
            style={{
              opacity: mounted ? 1 : 0,
              transition: "opacity 0.5s ease",
            }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </div>
        </CircadianProvider>
      </LanguageProvider>
    </AuthProvider>
  );
}
