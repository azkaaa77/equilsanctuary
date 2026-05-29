"use client";

import React from "react";
import { Instagram, Twitter, MessageSquare } from "lucide-react";
import { useLanguage } from "@/components/providers/language-provider";

export const FooterSection = () => {
  const { t, language } = useLanguage();

  return (
    <footer className="py-20 px-[6%] border-t border-equil-onyx/5 bg-equil-paper">
      <div className="max-w-[1240px] mx-auto grid grid-cols-1 md:grid-cols-4 gap-24 font-sans">
        <div className="md:col-span-2">
          <h3 className="text-4xl font-display font-black uppercase text-equil-onyx mb-10 tracking-tightest">
            EQUILIBRIUM<span className="text-equil-mint">/</span>
          </h3>
          <p className="text-equil-onyx/40 text-sm font-medium leading-[1.8] max-w-sm mb-16">
            {language === "id"
              ? "Rancang hidupmu dengan penuh kesadaran. Dibuat untuk Gen Z Indonesia menguasai keuangan, karier, dan kondisi mental."
              : "Design your life with intention. Built for Gen Z Indonesia to master finance, career, and mental state."}
          </p>
          <div className="status-label">
            © 2024 EQUIL // RE-ARCHITECTED V5.0 // ZEN EDITION
          </div>
        </div>

        <div className="flex flex-col gap-12">
          <span className="status-label">
            {language === "id" ? "NAVIGASI" : "NAVIGATION"}
          </span>
          <nav className="flex flex-col gap-6 font-display font-black text-[11px] uppercase tracking-[0.2em] text-equil-onyx/30">
            <a href="#" className="hover:text-equil-mint transition-colors">
              {t("header.home")}
            </a>
            <a
              href="/dashboard"
              className="hover:text-equil-mint transition-colors"
            >
              {t("header.dashboard")}
            </a>
            <a href="#" className="hover:text-equil-mint transition-colors">
              {t("header.manifes")}
            </a>
            <a href="#" className="hover:text-equil-mint transition-colors">
              {language === "id" ? "Arsitektur" : "Architecture"}
            </a>
          </nav>
        </div>

        <div className="flex flex-col gap-12">
          <span className="status-label">
            {language === "id" ? "KONEKSI" : "CONNECT"}
          </span>
          <div className="flex flex-col gap-6 font-display font-black text-[11px] uppercase tracking-[0.2em] text-equil-onyx/30">
            <a
              href="#"
              className="flex items-center gap-3 hover:text-equil-mint transition-colors"
            >
              <Instagram className="w-4 h-4" /> Instagram
            </a>
            <a
              href="#"
              className="flex items-center gap-3 hover:text-equil-mint transition-colors"
            >
              <Twitter className="w-4 h-4" /> Twitter/X
            </a>
            <a
              href="#"
              className="flex items-center gap-3 hover:text-equil-mint transition-colors"
            >
              <MessageSquare className="w-4 h-4" /> Community
            </a>
          </div>
        </div>
      </div>

      {/* Visual Accent */}
      <div className="mt-20 w-full h-[1px] bg-equil-onyx/5" />
      <div className="mt-10 flex justify-between items-center text-[8px] font-display font-black text-equil-onyx/10 tracking-[0.6em] uppercase">
        <span>Curated Sanctuary</span>
        <span>Jakarta // Tokyo // Paris</span>
      </div>
    </footer>
  );
};
