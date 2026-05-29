// /components/home/Preloader.tsx
"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { EqliMascot } from "@/components/mascot/EqliMascot";

export const Preloader = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const duration = 2000; // 2 seconds
    const intervalTime = 20;
    const increment = 100 / (duration / intervalTime);

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + increment;
      });
    }, intervalTime);

    const timer = setTimeout(() => setIsVisible(false), 2500);
    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{
            opacity: 0,
            transition: { duration: 1, ease: [0.76, 0, 0.24, 1] },
          }}
          className="fixed inset-0 z-[1000] bg-white flex flex-col items-center justify-center p-8 overflow-hidden"
        >
          <div className="flex flex-col items-center gap-6 w-full max-w-md">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, ease: [0.19, 1, 0.22, 1] }}
              className="flex flex-col items-center gap-4"
            >
              <div className="flex items-baseline gap-4">
                <span className="text-3xl font-display font-black tracking-[1.5em] text-equil-onyx uppercase pl-[1.5em]">
                  EQUIL
                </span>
              </div>
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-[10px] font-mono font-black text-equil-mint uppercase tracking-[0.6em]"
              >
                Pristine Version 5.0
              </motion.span>
            </motion.div>

            {/* Progress Bar - Sage Green 2px */}
            <div className="w-64 flex flex-col gap-6">
              <div className="w-full h-[2px] bg-equil-onyx/5 relative overflow-hidden rounded-full">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  className="absolute inset-0 bg-equil-mint"
                />
              </div>
              <div className="flex justify-between items-center px-1">
                <span className="text-[8px] font-mono font-black text-equil-onyx/20 tracking-[0.4em] uppercase">
                  Initializing Sanctuary
                </span>
                <span className="font-mono text-[10px] font-black text-equil-onyx/40">
                  {Math.round(progress)}%
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
