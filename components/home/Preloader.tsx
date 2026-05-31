"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { usePathname } from "next/navigation";

export const Preloader = () => {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // 1. Ambil jejak URL sebelumnya dari memori Browser
    const prevPath = sessionStorage.getItem("equil_prev_path");
    let shouldShow = false;

    if (!prevPath) {
      // LOGIKA A: User BARU PERTAMA KALI buka tab browser ini
      if (pathname === "/" || pathname === "/dashboard") {
        shouldShow = true;
      }
    } else {
      // LOGIKA B: User lagi jalan-jalan di dalam website
      const isFromHomeToDashboard =
        prevPath === "/" && pathname === "/dashboard";
      const isFromDashboardToHome =
        prevPath.startsWith("/dashboard") && pathname === "/";

      // PRELOADER CUMA NYALA kalau dari Home -> Dashboard, atau sebaliknya
      if (isFromHomeToDashboard || isFromDashboardToHome) {
        shouldShow = true;
      }
    }

    // 2. Simpan URL yang sekarang ke memori Browser biar diinget buat navigasi selanjutnya
    sessionStorage.setItem("equil_prev_path", pathname);

    // 3. Eksekusi Animasi Preloader
    if (shouldShow) {
      setIsVisible(true);
      setProgress(0);
      document.body.style.overflow = "hidden"; // Kunci scroll biar nggak bocor

      const duration = 2000;
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

      const timer = setTimeout(() => {
        setIsVisible(false);
        document.body.style.overflow = "auto"; // Buka scroll
      }, 2500);

      return () => {
        clearInterval(interval);
        clearTimeout(timer);
        document.body.style.overflow = "auto";
      };
    } else {
      // MATIKAN TOTAL jika user cuma muter-muter di dalam modul Dashboard
      setIsVisible(false);
      document.body.style.overflow = "auto";
    }
  }, [pathname]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="global-preloader"
          initial={{ opacity: 1 }}
          exit={{
            opacity: 0,
            transition: { duration: 1, ease: [0.76, 0, 0.24, 1] },
          }}
          className="fixed inset-0 z-[99999] bg-[#F9F9F9] flex flex-col items-center justify-center p-8 overflow-hidden w-screen h-[100dvh]"
        >
          <div className="flex flex-col items-center gap-6 w-full max-w-md">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, ease: [0.19, 1, 0.22, 1] }}
              className="flex flex-col items-center gap-4"
            >
              <div className="flex items-baseline gap-4">
                <span className="text-3xl font-black tracking-[1.5em] text-[#141313] uppercase pl-[1.5em]">
                  EQUIL
                </span>
              </div>
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-[10px] font-mono font-bold text-[#2D6A4F] uppercase tracking-[0.6em]"
              >
                Pristine Version 5.0
              </motion.span>
            </motion.div>

            <div className="w-64 flex flex-col gap-6">
              <div className="w-full h-[2px] bg-[#141313]/5 relative overflow-hidden rounded-full">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  className="absolute inset-0 bg-[#2D6A4F]"
                />
              </div>
              <div className="flex justify-between items-center px-1">
                <span className="text-[8px] font-mono font-bold text-[#141313]/20 tracking-[0.4em] uppercase">
                  Initializing System
                </span>
                <span className="font-mono text-[10px] font-bold text-[#141313]/40">
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
