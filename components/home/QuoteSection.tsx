// /components/home/QuoteSection.tsx
"use client";

import React, { useEffect, useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { gsap } from "@/lib/gsap";
import { EqliMascot } from "@/components/mascot/EqliMascot";
import { useLanguage } from "@/components/providers/language-provider";

export const QuoteSection = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const { t, language } = useLanguage();

  useEffect(() => {
    if (!textRef.current) return;

    const chars = textRef.current.querySelectorAll(".char");

    gsap.fromTo(
      chars,
      {
        opacity: 0.1,
        y: 20,
        rotateX: -90,
      },
      {
        opacity: 1,
        y: 0,
        rotateX: 0,
        stagger: 0.02,
        duration: 1,
        ease: "expo.out",
        scrollTrigger: {
          trigger: textRef.current,
          start: "top 80%",
          end: "bottom 20%",
          scrub: 1,
        },
      },
    );
  }, [language]); // Re-run when language changes as split text will be new

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const xMove = useTransform(scrollYProgress, [0, 1], [100, -100]);

  return (
    <section
      ref={containerRef}
      className="relative py-12 lg:py-18 px-[6%] bg-white overflow-hidden"
    >
      {/* Decorative Background Text - Massive & Intentional */}
      <motion.div
        style={{ x: xMove }}
        className="absolute top-1/2 left-0 -translate-y-1/2 text-[45vw] font-display font-black text-equil-onyx/[0.02] uppercase whitespace-nowrap pointer-events-none select-none tracking-tightest"
      >
        PRISTINE
      </motion.div>

      <div className="max-w-[1240px] mx-auto relative z-10 font-sans">
        <div className="flex flex-col gap-6 mb-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-[0.5px] bg-equil-onyx/20" />
            <span className="status-label !opacity-100 !text-equil-onyx font-black">
              {t("manifesto.label")}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-20 items-center">
          {/* Primary Typography Cluster */}
          <div className="lg:col-span-9" ref={textRef}>
            <div className="flex flex-col gap-3">
              <div className="overflow-hidden">
                <h2 className="text-5xl sm:text-6xl md:text-[6.5vw] lg:text-[5.4rem] font-display font-black leading-[0.85] uppercase tracking-tightest-extra">
                  {splitText(language === "id" ? "Tenang itu" : "Peace is")}
                </h2>
              </div>
              <div className="overflow-hidden">
                <h2 className="text-5xl sm:text-6xl md:text-[6.5vw] lg:text-[5.4rem] font-display font-black leading-[0.85] uppercase tracking-tightest-extra text-equil-mint italic pl-[8%]">
                  {splitText(language === "id" ? "Strategi." : "Strategy.")}
                </h2>
              </div>
            </div>

            <div className="mt-3 flex flex-col md:flex-row items-baseline gap-12 pl-[16%]">
              <div className="overflow-hidden">
                <h2 className="text-5xl sm:text-6xl md:text-[6.5vw] lg:text-[5.4rem] font-display font-black leading-[0.85] uppercase tracking-tightest-extra">
                  {splitText(language === "id" ? "Fokus." : "Focused.")}
                </h2>
              </div>
              <div className="mb-8 hidden xl:block border-l border-equil-onyx/10 pl-10 max-w-[240px]">
                <p className="text-equil-onyx/30 font-sans font-bold text-[10px] uppercase tracking-[0.2em] leading-relaxed">
                  {language === "id"
                    ? "KENDALIKAN IMPULS, BANGUN REALITA DENGAN PRESTISI."
                    : "CONTROL IMPULSE, BUILD REALITY WITH PRECISION."}
                </p>
              </div>
            </div>
          </div>

          {/* Dedicated Companion Space (The Happy Face) */}
          <div className="lg:col-span-3 flex justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative p-8 md:p-10 bg-equil-paper/20 backdrop-blur-3xl rounded-[60px] border border-equil-onyx/5 group hover:border-equil-mint/30 transition-all duration-1000"
            >
              <div className="absolute top-4 left-4">
                <div className="w-1.5 h-1.5 rounded-full bg-equil-mint" />
              </div>
              <div className="hero-mascot transform rotate-[-5deg] group-hover:rotate-[5deg] transition-transform duration-1000 grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-100">
                <EqliMascot size={240} />
              </div>
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap">
                <span className="text-[9px] font-mono font-black uppercase tracking-[0.4em] text-equil-onyx/30">
                  Equil Companion
                </span>
              </div>
            </motion.div>
          </div>
        </div>

        <div className="mt-8 md:mt-19 flex flex-col md:flex-row justify-between items-start md:items-end gap-12 border-t border-equil-onyx/5 pt-16">
          <div className="flex items-center gap-10">
            <span className="text-5xl sm:text-6xl font-display font-black text-equil-onyx/5 leading-none">
              02
            </span>
            <p className="text-[10px] font-black uppercase text-equil-mint tracking-widest leading-loose">
              SYSTEM CORE <br />
              <span className="text-equil-onyx/40 font-mono">
                STABILIZATION_PHASE
              </span>
            </p>
          </div>

          <div className="max-w-md text-right">
            <p className="text-equil-onyx/60 font-sans font-medium text-lg md:text-xl leading-relaxed italic pr-12 relative">
              <span className="absolute right-0 top-0 text-6xl text-equil-mint/10 italic font-display">
                &quot;
              </span>
              {language === "id"
                ? "Kedisiplinan adalah bentuk tertinggi dari rasa sayang pada diri sendiri."
                : "Discipline is the highest form of self-love."}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

function splitText(text: string) {
  return text.split("").map((char, i) => (
    <span key={i} className="char inline-block whitespace-pre">
      {char}
    </span>
  ));
}
