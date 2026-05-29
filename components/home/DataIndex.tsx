// /components/home/DataIndex.tsx
"use client";

import React from "react";
import { motion } from "motion/react";
import { useLanguage } from "@/components/providers/language-provider";
import { useAuth } from "@/components/providers/auth-provider";

export const DataIndex = () => {
  const { language } = useLanguage();
  const { signInWithGoogle, user } = useAuth();

  const pillars = [
    {
      id: "01",
      title: language === "id" ? "Mental" : "Mental",
      sub: language === "id" ? "Sanctuary" : "Sanctuary",
      desc:
        language === "id"
          ? "Ruang aman untuk memproses emosi dan menjaga kejernihan pikiran setiap harinya."
          : "A safe space to process emotions and maintain mental clarity every day.",
    },
    {
      id: "02",
      title: language === "id" ? "Finansial" : "Financial",
      sub: language === "id" ? "Clarity" : "Clarity",
      desc:
        language === "id"
          ? "Hentikan doom spending. Bangun kebiasaan uang yang selaras dengan nilai hidupmu."
          : "Stop doom spending. Build money habits aligned with your life values.",
    },
    {
      id: "03",
      title: language === "id" ? "Karier" : "Career",
      sub: language === "id" ? "Architecture" : "Architecture",
      desc:
        language === "id"
          ? "Pathfinding berbasis Skill-Passion-Value. Temukan arahmu, bukan sekadar pekerjaan."
          : "Skill-Passion-Value pathfinding. Find your direction, not just a job.",
    },
  ];

  return (
    <section
      id="about"
      className="py-12 lg:py-18 px-[6%] bg-equil-paper relative overflow-hidden"
    >
      {/* Massive background word */}
      <div className="absolute bottom-0 left-0 text-[30vw] font-display font-black text-equil-onyx/[0.025] uppercase leading-none tracking-tightest pointer-events-none select-none whitespace-nowrap">
        SANCTUARY
      </div>

      <div className="max-w-[1240px] mx-auto relative z-10">
        {/* Section label */}
        <div className="flex items-center gap-4 mb-16">
          <div className="w-10 h-[1px] bg-equil-mint" />
          <span className="text-[10px] font-display font-black tracking-[0.35em] text-equil-mint uppercase">
            ABOUT US // THE SANCTUARY
          </span>
        </div>

        {/* Two-column layout: left = headline + CTA, right = body text */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-start mb-28">
          {/* Left: Big headline */}
          <div className="lg:col-span-6 xl:col-span-5">
            <h2 className="text-5xl md:text-6xl xl:text-7xl font-display font-black uppercase leading-[0.85] tracking-tighter">
              {language === "id" ? (
                <>
                  Bukan
                  <br />
                  <span className="text-equil-mint italic">Sekadar</span>
                  <br />
                  Platform.
                </>
              ) : (
                <>
                  Not
                  <br />
                  <span className="text-equil-mint italic">Just</span>
                  <br />a Platform.
                </>
              )}
            </h2>

            {/* CTA block */}
            <div className="mt-14 flex flex-col gap-5">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={
                  user
                    ? () => (window.location.href = "/dashboard")
                    : signInWithGoogle
                }
                className="w-fit px-9 py-4 rounded-full bg-equil-onyx text-white font-display font-black text-[11px] tracking-widest uppercase hover:bg-equil-mint transition-all duration-500 shadow-lg hover:shadow-equil-mint/25 cursor-pointer"
              >
                {language === "id"
                  ? "MASUK KE SANCTUARY"
                  : "ENTER THE SANCTUARY"}{" "}
                →
              </motion.button>
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-equil-mint animate-pulse" />
                <span className="text-[10px] font-mono tracking-[0.25em] text-equil-onyx/30 uppercase">
                  {language === "id"
                    ? "Platform aktif · Gen Z Indonesia"
                    : "Live platform · Gen Z Indonesia"}
                </span>
              </div>
            </div>
          </div>

          {/* Right: Mission statement */}
          <div className="lg:col-span-6 xl:col-span-7 flex flex-col gap-8 lg:pt-4">
            <p className="text-lg md:text-xl font-sans font-medium text-equil-onyx/70 leading-relaxed">
              {language === "id"
                ? "EQUIL lahir dari satu keyakinan sederhana: bahwa keseimbangan bukan kemewahan \u2014 ia adalah hak setiap orang."
                : "EQUIL was born from one simple belief: that balance is not a luxury \u2014 it is everyone's right."}
            </p>
            <p className="text-sm md:text-base font-sans font-medium text-equil-onyx/40 leading-relaxed">
              {language === "id"
                ? "Kami hadir bukan untuk menghakimi, tapi untuk menemanimu. Dari kecemasan finansial yang mencekik hingga burnout karier yang melelahkan \u2014 EQUIL adalah sistem yang memahami bahwa hidupmu adalah satu kesatuan yang utuh, bukan sekadar daftar target."
                : "We exist not to judge, but to accompany you. From financial anxiety to career burnout \u2014 EQUIL is a system that understands your life is one whole, not just a list of targets."}
            </p>

            {/* Divider with stat */}
            <div className="flex items-center gap-8 pt-4 border-t border-equil-onyx/5">
              <div className="flex flex-col">
                <span className="text-4xl font-display font-black text-equil-onyx tracking-tighter">
                  6
                </span>
                <span className="text-[10px] font-mono text-equil-onyx/30 tracking-widest uppercase">
                  {language === "id" ? "Pilar Kehidupan" : "Life Pillars"}
                </span>
              </div>
              <div className="w-[1px] h-10 bg-equil-onyx/10" />
              <div className="flex flex-col">
                <span className="text-4xl font-display font-black text-equil-mint tracking-tighter">
                  ∞
                </span>
                <span className="text-[10px] font-mono text-equil-onyx/30 tracking-widest uppercase">
                  {language === "id" ? "Sesi Refleksi" : "Reflection Sessions"}
                </span>
              </div>
              <div className="w-[1px] h-10 bg-equil-onyx/10" />
              <div className="flex flex-col">
                <span className="text-4xl font-display font-black text-equil-onyx tracking-tighter">
                  01
                </span>
                <span className="text-[10px] font-mono text-equil-onyx/30 tracking-widest uppercase">
                  {language === "id" ? "Misi: Kamu" : "Mission: You"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 3-pillar row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {pillars.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: i * 0.12, ease: "circOut" }}
              className="group relative p-8 rounded-[32px] border border-equil-onyx/5 bg-white hover:border-equil-mint/30 hover:shadow-xl transition-all duration-700 cursor-pointer overflow-hidden"
            >
              {/* Number watermark */}
              <span className="absolute -right-4 -bottom-4 text-[7rem] font-display font-black text-equil-onyx/[0.03] leading-none select-none group-hover:text-equil-mint/10 transition-colors duration-700">
                {p.id}
              </span>

              <div className="relative z-10 flex flex-col gap-5">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-equil-mint group-hover:scale-125 transition-transform duration-500" />
                  <span className="text-[9px] font-mono font-black tracking-[0.35em] text-equil-onyx/30 uppercase">
                    {p.id}
                  </span>
                </div>

                <div>
                  <p className="text-[10px] font-mono tracking-[0.25em] text-equil-mint uppercase mb-1">
                    {p.sub}
                  </p>
                  <h3 className="text-2xl font-display font-black uppercase tracking-tighter text-equil-onyx leading-none">
                    {p.title}
                  </h3>
                </div>

                <p className="text-[13px] font-sans font-medium text-equil-onyx/40 leading-relaxed">
                  {p.desc}
                </p>

                <div className="flex items-center gap-2 text-equil-mint group-hover:translate-x-2 transition-transform duration-500">
                  <span className="text-[10px] font-display font-black tracking-[0.3em] uppercase">
                    EXPLORE
                  </span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M5 12H19M19 12L12 5M19 12L12 19"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
