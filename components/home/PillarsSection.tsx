"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useLanguage } from "@/components/providers/language-provider";
import { cn } from "@/lib/utils";

// Dummy Polygons to represent Radical Data Design
const HexagonLine = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={cn("absolute pointer-events-none opacity-30", className)}
  >
    <path
      d="M50 5L90 27.5V72.5L50 95L10 72.5V27.5L50 5Z"
      stroke="currentColor"
      strokeWidth="1"
      className="text-equil-mint"
      vectorEffect="non-scaling-stroke"
    />
    <path
      d="M50 20L75 35V65L50 80L25 65V35L50 20Z"
      stroke="currentColor"
      strokeWidth="0.5"
      className="text-equil-mint/50"
      vectorEffect="non-scaling-stroke"
    />
    <circle cx="50" cy="50" r="2" fill="currentColor" className="text-equil-mint" />
    <line x1="50" y1="5" x2="50" y2="95" stroke="currentColor" strokeWidth="0.5" className="text-equil-mint/30" />
    <line x1="10" y1="27.5" x2="90" y2="72.5" stroke="currentColor" strokeWidth="0.5" className="text-equil-mint/30" />
    <line x1="10" y1="72.5" x2="90" y2="27.5" stroke="currentColor" strokeWidth="0.5" className="text-equil-mint/30" />
  </svg>
);

export const PillarsSection = () => {
  const { t } = useLanguage();
  const [activeItem, setActiveItem] = useState<number>(0);

  const pillars = [
    {
      id: "sanctuary",
      title: t("pillars.sanctuary.title"),
      desc: t("pillars.sanctuary.desc"),
      icon: "01",
    },
    {
      id: "index",
      title: t("pillars.index.title"),
      desc: t("pillars.index.desc"),
      icon: "02",
    },
    {
      id: "career",
      title: t("pillars.career.title"),
      desc: t("pillars.career.desc"),
      icon: "03",
    },
    {
      id: "shield",
      title: t("pillars.shield.title"),
      desc: t("pillars.shield.desc"),
      icon: "04",
    },
    {
      id: "mental",
      title: t("pillars.mental.title"),
      desc: t("pillars.mental.desc"),
      icon: "05",
    },
    {
      id: "community",
      title: t("pillars.community.title"),
      desc: t("pillars.community.desc"),
      icon: "06",
    },
  ];

  return (
    <section className="py-24 lg:py-32 px-[6%] bg-equil-paper text-equil-onyx relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-equil-mint/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-[1240px] mx-auto flex flex-col gap-16 relative z-10">
        {/* Header */}
        <div className="flex flex-col gap-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-[1px] bg-equil-mint" />
            <span className="text-xs font-mono font-bold tracking-widest text-equil-mint uppercase">
              {t("pillars.label")}
            </span>
          </div>
          <h2 className="text-5xl md:text-7xl font-display font-black uppercase leading-[0.85] tracking-tighter text-equil-onyx/90">
            {t("pillars.headline.part1")}
            <br />
            <span className="text-equil-mint italic">
              {t("pillars.headline.part2")}
            </span>
          </h2>
        </div>

        {/* Accordion Container */}
        <div className="flex flex-col lg:flex-row h-[800px] lg:h-[600px] gap-4 w-full">
          {pillars.map((pillar, index) => {
            const isActive = activeItem === index;

            return (
              <motion.div
                key={pillar.id}
                layout
                onClick={() => setActiveItem(index)}
                initial={false}
                animate={{
                  flex: isActive ? 5 : 1,
                }}
                transition={{
                  type: "spring",
                  bounce: 0,
                  duration: 0.9
                }}
                className={cn(
                  "relative cursor-pointer rounded-3xl overflow-hidden border transition-colors duration-500 flex-shrink-0 lg:flex-shrink",
                  isActive
                    ? "border-equil-mint/30 bg-white/50 shadow-sm"
                    : "border-equil-onyx/10 bg-equil-onyx/5 hover:bg-equil-onyx/10"
                )}
              >
                {/* Internal layout depending on active state */}
                <div className="w-full h-full flex flex-col lg:flex-row p-6 lg:p-8 relative">
                  {/* Vertical / Inactive Label */}
                  <motion.div
                    className={cn(
                      "flex lg:flex-col items-center justify-between lg:justify-start gap-4 lg:w-12 h-full z-20 transition-opacity duration-300",
                      isActive ? "opacity-100 lg:opacity-50" : "opacity-100"
                    )}
                  >
                    <span className="text-sm font-mono text-equil-mint/80 font-bold">
                      {pillar.icon}
                    </span>
                    {!isActive && (
                      <span className="lg:-rotate-90 lg:whitespace-nowrap font-display font-bold text-lg lg:text-xl uppercase tracking-widest text-equil-onyx/50 lg:mt-32">
                        {pillar.title}
                      </span>
                    )}
                  </motion.div>

                  {/* Active Content */}
                  <AnimatePresence>
                    {isActive && (
                      <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20, transition: { duration: 0.2 } }}
                        transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                        className="flex-1 flex flex-col justify-end lg:justify-center ml-0 lg:ml-12 mt-8 lg:mt-0 relative z-20"
                      >
                        <div className="max-w-md">
                          <h3 className="text-3xl lg:text-5xl font-display font-black uppercase leading-[0.9] tracking-tighter mb-6 text-equil-onyx">
                            {pillar.title}
                          </h3>
                          <p className="text-equil-onyx/60 font-sans text-sm lg:text-lg leading-relaxed font-medium">
                            {pillar.desc}
                          </p>
                        </div>
                        
                        <div className="mt-12 flex items-center gap-4 group cursor-pointer w-max">
                          <span className="text-[10px] font-display font-black tracking-[0.4em] text-equil-mint uppercase">
                            EXPLORE_MODULE
                          </span>
                          <div className="w-8 h-[1px] bg-equil-mint/50 group-hover:w-16 transition-all duration-500" />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Radical Data Design Graphic (Only visible when active) */}
                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8, rotate: -15 }}
                      animate={{ opacity: 1, scale: 1, rotate: 0 }}
                      exit={{ opacity: 0, scale: 0.8, rotate: 10, transition: { duration: 0.3 } }}
                      transition={{ duration: 1, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                      className="absolute -bottom-20 -right-20 lg:-right-32 lg:top-1/2 lg:-translate-y-1/2 w-[300px] lg:w-[600px] h-[300px] lg:h-[600px] z-10"
                    >
                      <HexagonLine className="w-full h-full" />
                    </motion.div>
                  )}
                </AnimatePresence>
                
                {/* Active gradient background */}
                {isActive && (
                  <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-equil-paper/90 via-equil-paper/50 to-transparent z-0 pointer-events-none" />
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
