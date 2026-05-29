// /components/home/Hero.tsx
"use client";

import React, { useEffect, useRef } from "react";
import { motion } from "motion/react";
import { gsap } from "@/lib/gsap";
import { EqliMascot } from "@/components/mascot/EqliMascot";
import { useAuth } from "@/components/providers/auth-provider";
import { useLanguage } from "@/components/providers/language-provider";

export const Hero = () => {
  const { signInWithGoogle, user } = useAuth();
  const { t, language } = useLanguage();
  const heroRef = useRef<HTMLDivElement>(null);
  const titleGroupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!heroRef.current || !titleGroupRef.current) return;

    const ctx = gsap.context(() => {
      // Split text animation effect (simulated via children stagger)
      gsap.from(".reveal-text", {
        y: 150,
        opacity: 0,
        filter: "blur(20px)",
        duration: 2,
        stagger: 0.1,
        ease: "expo.out",
        delay: 3.5, // Sync with loader
      });

      // Floating mascot animation
      gsap.to(".hero-mascot", {
        y: -8,
        duration: 6,
        repeat: -1,
        yoyo: true,
        ease: "power1.inOut",
      });
    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={heroRef}
      className="relative min-h-screen flex flex-col justify-center px-[6%] py-16 xl:py-24 overflow-hidden bg-white"
    >
      {/* Background Zen Gradient - very subtle */}
      <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_90%_10%,rgba(45,106,79,0.02)_0%,rgba(255,255,255,1)_60%)] -z-10" />

      <div
        className="max-w-[1240px] w-full mx-auto relative font-sans"
        ref={titleGroupRef}
      >
        {/* Top Status Indicators */}
        <div className="flex justify-between items-center mb-5 lg:mb-8 reveal-text">
          <div className="text-[10px] tracking-[0.25em] font-mono text-equil-onyx/40 uppercase flex items-center gap-2">
            <span>H. M. Q ESTABLISHED // PRISTINE STATE</span>
            <div className="w-8 h-[0.5px] bg-equil-onyx/10" />
          </div>

          <div className="hidden sm:flex items-center gap-4">
            <div className="w-1.5 h-1.5 rounded-full bg-equil-mint animate-pulse" />
            <span className="text-[9px] font-mono tracking-[0.3em] font-black text-equil-mint uppercase">
              SYSTEM_LIVE v5.0
            </span>
          </div>
        </div>

        {/* Full-width Hero Layout */}
        <div className="w-full">
          <div className="flex flex-col items-start w-full">
            {/* Row 1: TEMUKAN */}
            <div className="w-full">
              <h1 className="reveal-text text-6xl sm:text-8xl md:text-[6rem] lg:text-[7rem] xl:text-[8.5rem] 2xl:text-[9.5rem] font-display font-black leading-[0.9] uppercase text-equil-onyx tracking-tighter">
                {language === "id" ? "Temukan" : "Find"}
              </h1>
            </div>

            {/* Row 2: TEDUH + Mascot */}
            <div className="flex items-end justify-between w-full lg:mt-6 xl:mt-4 relative">
              <div className="shrink-0 pb-1">
                <h1 className="reveal-text text-6xl sm:text-8xl md:text-[6rem] lg:text-[7rem] xl:text-[8.5rem] 2xl:text-[9.5rem] font-display font-black leading-[0.9] uppercase text-equil-mint italic tracking-tightest-extra">
                  {language === "id" ? "TEDUH" : "CALM"}
                </h1>
              </div>

              {/* Mascot — absolute supaya tidak affect tinggi row */}
              <div className="reveal-text hidden lg:block hero-mascot absolute right-0 bottom-0">
                <div className="relative w-[180px] xl:w-[220px] h-[210px] xl:h-[250px] rounded-[40px] bg-[#F4F4F6] border border-equil-onyx/5 flex items-center justify-center group shadow-sm hover:shadow-lg transition-all duration-1000">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent pointer-events-none" />
                  <div className="group-hover:scale-100 transition-transform duration-1000">
                    <EqliMascot size={200} />
                  </div>
                  <div className="absolute top-3 left-3 w-1.5 h-1.5 rounded-full bg-equil-mint/60 animate-pulse" />
                  <div className="absolute bottom-3 right-3">
                    <span className="text-[7px] font-mono tracking-widest text-equil-onyx/20 font-bold">
                      EQLI
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Row 3: TITIKMU */}
            <div className="w-full mt-1">
              <h1 className="reveal-text text-6xl sm:text-8xl md:text-[6rem] lg:text-[7rem] xl:text-[8.5rem] 2xl:text-[9.5rem] font-display font-black leading-[0.9] uppercase text-equil-onyx tracking-tighter">
                {language === "id" ? "Titikmu" : "Your Point"}
              </h1>
            </div>

            {/* Subheadline — mobile & tablet only, below Titikmu */}
            <div className="reveal-text lg:hidden mt-6">
              <div className="border-l border-equil-onyx/15 pl-5 max-w-[260px]">
                <p className="text-xs font-sans font-medium text-equil-onyx/50 leading-relaxed tracking-normal">
                  {t("hero.subheadline")}
                </p>
              </div>
            </div>

            {/* Premium Call to Actions */}
            <div className="flex flex-wrap items-center gap-4 mt-12 md:mt-7 xl:mt-10 ml-3 reveal-text">
              <button
                onClick={user ? undefined : signInWithGoogle}
                className="px-10 py-4 rounded-full bg-equil-onyx text-white hover:bg-equil-mint hover:scale-[1.02] active:scale-[0.98] transition-all duration-500 font-display font-black text-[11px] tracking-widest uppercase shadow-xl hover:shadow-[0_10px_35px_rgba(45,106,79,0.25)] cursor-pointer"
              >
                {t("hero.cta")}
              </button>

              <button className="px-10 py-4 rounded-full border border-equil-onyx/15 font-display font-black text-[11px] tracking-widest uppercase hover:bg-equil-onyx hover:text-white hover:scale-[1.02] active:scale-[0.98] transition-all duration-500 cursor-pointer bg-white/40">
                {language === "id" ? "LIHAT MANIFES" : "VIEW MANIFES"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
