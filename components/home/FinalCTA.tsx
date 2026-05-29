// /components/home/FinalCTA.tsx
"use client";

import React from "react";
import { motion } from "motion/react";
import { useAuth } from "@/components/providers/auth-provider";
import { useLanguage } from "@/components/providers/language-provider";

export const FinalCTA = () => {
  const { signInWithGoogle, user } = useAuth();
  const { t } = useLanguage();

  return (
    <section
      id="final-cta"
      className="py-32 lg:py-40 px-[6%] bg-white relative overflow-hidden border-t border-equil-onyx/5"
    >
      {/* Massive Background Text */}
      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-center opacity-[0.02] pointer-events-none">
        <span className="text-[40vw] font-display font-black leading-none tracking-tightest">
          ALIGN
        </span>
      </div>

      <div className="max-w-[1240px] mx-auto relative z-10 font-sans">
        <div className="flex flex-col items-center text-center gap-10">
          <div className="flex items-center gap-8 reveal-text">
            <div className="w-12 h-[1px] bg-equil-mint" />
            <span className="status-label !opacity-100 !text-equil-mint">
              {t("cta.final.desc")}
            </span>
            <div className="w-12 h-[1px] bg-equil-mint" />
          </div>

          <h2 className="text-4xl sm:text-5xl md:text-7xl font-display font-black leading-[0.85] tracking-tighter uppercase text-equil-onyx">
            {t("cta.final.title")
              .split(" ")
              .map((word, i) => (
                <React.Fragment key={i}>
                  <span className={i === 1 ? "text-equil-mint italic" : ""}>
                    {word}{" "}
                  </span>
                  {i === 1 && <br />}
                </React.Fragment>
              ))}
          </h2>

          <div className="flex flex-col sm:flex-row gap-4 mt-8">
            <button
              onClick={user ? undefined : signInWithGoogle}
              className="btn-equil-primary text-[11px] px-10 py-4 shadow-2xl shadow-equil-mint/10 hover:shadow-equil-mint/40"
            >
              {t("cta.final.button")}
            </button>

            <button className="px-10 py-4 rounded-full border border-equil-onyx/15 font-display font-black text-[11px] tracking-widest uppercase hover:bg-equil-onyx hover:text-white hover:scale-[1.02] active:scale-[0.98] transition-all duration-500 bg-white/40">
              {t("header.manifes")} V5.0
            </button>
          </div>
        </div>
      </div>

      {/* Decorative Numbers */}
      <div className="absolute top-20 right-20 text-8xl font-display font-black text-equil-onyx/5">
        03
      </div>
    </section>
  );
};
