// app/dashboard/page.tsx
// EQUIL Dashboard v7.0 — The Equilibrium Control Room
// Assembles: AmbientGreeting, RadarChartTicker, InteractiveCalendar,
// MaximizedHeatmap, and System Module Links in a premium Bento Grid.

"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/components/providers/auth-provider";
import { useLanguage } from "@/components/providers/language-provider";
import AmbientGreeting from "@/components/dashboard/AmbientGreeting";
import RadarChartTicker from "@/components/dashboard/RadarChartTicker";
import InteractiveCalendar from "@/components/dashboard/InteractiveCalendar";
import MaximizedHeatmap from "@/components/dashboard/MaximizedHeatmap";
import { motion } from "motion/react";
import { Brain, Target, Shield, Sparkles, Users } from "lucide-react";

// ── MODULE NAV DATA ─────────────────────────────────────────
const modulesDict = {
  id: {
    modules: [
      {
        title: "MENTAL SANCTUARY",
        path: "/dashboard/mental-sanctuary",
        active: true,
      },
      {
        title: "FUTURE ARCHITECTURE",
        path: "/dashboard/future-architecture",
        active: true,
      },
      {
        title: "IMPULSE SHIELD",
        path: "/dashboard/impulse-shield",
        active: true,
      },
      { title: "SANCTUARY AI", path: "/dashboard/sanctuary-ai", active: true },
      {
        title: "SOUL COMMUNITY",
        path: "/dashboard/soul-community",
        active: true,
      },
    ],
    statusActive: "STATUS: ACTIVE // PRISTINE",
    sectionLabel: "04 // MODUL SISTEM",
    sectionTitle: "Akses",
    sectionSub: "modul.",
  },
  en: {
    modules: [
      {
        title: "MENTAL SANCTUARY",
        path: "/dashboard/mental-sanctuary",
        active: true,
      },
      {
        title: "FUTURE ARCHITECTURE",
        path: "/dashboard/future-architecture",
        active: true,
      },
      {
        title: "IMPULSE SHIELD",
        path: "/dashboard/impulse-shield",
        active: true,
      },
      { title: "SANCTUARY AI", path: "/dashboard/sanctuary-ai", active: true },
      {
        title: "SOUL COMMUNITY",
        path: "/dashboard/soul-community",
        active: true,
      },
    ],
    statusActive: "STATUS: ACTIVE // PRISTINE",
    sectionLabel: "04 // SYSTEM MODULES",
    sectionTitle: "Access",
    sectionSub: "modules.",
  },
};

const moduleIcons = [Brain, Target, Shield, Sparkles, Users];

export default function DashboardPage() {
  const { mounted } = useAuth();
  const { language } = useLanguage();

  if (!mounted) return null;

  const t = modulesDict[language as keyof typeof modulesDict] || modulesDict.id;

  // Animation variants for stagger entrance
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { 
      opacity: 1, 
      y: 0,
      transition: {
        type: "spring" as const,
        stiffness: 100,
        damping: 15
      }
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-full overflow-x-hidden pb-20"
    >
      {/* ── HERO CARD (Span 2x2) ── */}
      <motion.div
        variants={cardVariants}
        whileHover={{ scale: 1.015 }}
        className="col-span-1 md:col-span-2 lg:col-span-2 lg:row-span-2 bg-white/60 backdrop-blur-xl border border-equil-forest/[0.06] shadow-sm hover:shadow-md transition-all duration-300 rounded-3xl p-6 md:p-8 flex flex-col gap-6"
      >
        <AmbientGreeting compact={true} />
        <div className="w-full h-px bg-equil-onyx/[0.05]" />
        <RadarChartTicker compact={true} />
      </motion.div>

      {/* ── CALENDAR CARD (Span 2x1) ── */}
      <motion.div
        variants={cardVariants}
        whileHover={{ scale: 1.015 }}
        className="col-span-1 md:col-span-2 lg:col-span-2 lg:row-span-1 bg-white/60 backdrop-blur-xl border border-equil-forest/[0.06] shadow-sm hover:shadow-md transition-all duration-300 rounded-3xl p-6 md:p-8 flex flex-col justify-between"
      >
        <InteractiveCalendar />
      </motion.div>

      {/* ── INSIGHTS/HEATMAP CARD (Span 1x1) ── */}
      <motion.div
        variants={cardVariants}
        whileHover={{ scale: 1.015 }}
        className="col-span-1 lg:col-span-1 lg:row-span-1 bg-white/60 backdrop-blur-xl border border-equil-forest/[0.06] shadow-sm hover:shadow-md transition-all duration-300 rounded-3xl p-6 flex flex-col justify-between"
      >
        <MaximizedHeatmap />
      </motion.div>

      {/* ── MODULE NAVIGATOR CARD (Span 1x1) ── */}
      <motion.div
        variants={cardVariants}
        whileHover={{ scale: 1.015 }}
        className="col-span-1 lg:col-span-1 lg:row-span-1 bg-white/60 backdrop-blur-xl border border-equil-forest/[0.06] shadow-sm hover:shadow-md transition-all duration-300 rounded-3xl p-6 flex flex-col justify-between"
      >
        <div className="flex flex-col h-full justify-between gap-4">
          <div>
            <span className="text-[9px] font-mono tracking-[0.3em] text-equil-onyx/25 uppercase block mb-1">
              {t.sectionLabel}
            </span>
            <h3 className="text-xl md:text-2xl font-display font-black tracking-tightest text-equil-onyx leading-none">
              {t.sectionTitle}{" "}
              <span className="italic font-normal text-equil-mint/70">
                {t.sectionSub}
              </span>
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-2 flex-1 mt-4">
            {t.modules.slice(0, 4).map((mod, index) => {
              const Icon = moduleIcons[index];
              return (
                <Link
                  key={mod.path}
                  href={mod.active ? mod.path : "#"}
                  className={`flex flex-col justify-between p-3 rounded-2xl border transition-all duration-300 ${
                    mod.active
                      ? "bg-white/40 border-equil-forest/[0.04] hover:bg-equil-sage/30 hover:border-equil-mint/20 cursor-pointer"
                      : "opacity-40 border-dashed border-equil-forest/10 cursor-not-allowed pointer-events-none"
                  }`}
                  aria-label={`Navigate to ${mod.title}`}
                >
                  <div className="flex items-center justify-between">
                    {Icon && <Icon className="w-5 h-5 text-equil-mint" />}
                    {mod.active && (
                      <span className="w-1.5 h-1.5 rounded-full bg-equil-mint dot-pulse" />
                    )}
                  </div>
                  <div className="mt-4">
                    <span className="text-[7.5px] font-mono font-bold tracking-wider text-equil-onyx/75 uppercase leading-none block">
                      {mod.title.split(" ")[0]}
                    </span>
                    <span className="text-[7.5px] font-mono font-bold tracking-wider text-equil-onyx/40 uppercase leading-none block mt-0.5">
                      {mod.title.split(" ").slice(1).join(" ") || "MODULE"}
                    </span>
                  </div>
                </Link>
              );
            })}
            
            {/* 5th module spans full width at the bottom */}
            {t.modules[4] && (() => {
              const mod = t.modules[4];
              const Icon = moduleIcons[4];
              return (
                <Link
                  href={mod.active ? mod.path : "#"}
                  className={`col-span-2 flex items-center justify-between p-3 rounded-2xl border transition-all duration-300 ${
                    mod.active
                      ? "bg-white/40 border-equil-forest/[0.04] hover:bg-equil-sage/30 hover:border-equil-mint/20 cursor-pointer"
                      : "opacity-40 border-dashed border-equil-forest/10 cursor-not-allowed pointer-events-none"
                  }`}
                  aria-label={`Navigate to ${mod.title}`}
                >
                  <div className="flex items-center gap-3">
                    {Icon && <Icon className="w-5 h-5 text-equil-mint" />}
                    <div className="text-left">
                      <span className="text-[7.5px] font-mono font-bold tracking-wider text-equil-onyx/75 uppercase leading-none block">
                        {mod.title}
                      </span>
                      <span className="text-[6.5px] font-mono tracking-wider text-[#2D6A4F]/60 uppercase leading-none block mt-0.5">
                        {t.statusActive}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-light text-equil-onyx/20">→</span>
                </Link>
              );
            })()}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
