"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

type Language = "id" | "en";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  id: {
    "hero.headline": "Temukan titik teduhmu di tengah dunia yang riuh.",
    "hero.headline.alt": "TITIK TEDUHMU",
    "hero.subheadline":
      "Bukan sekadar app. EQUIL adalah cerminmu — tempat ambisi bertemu ketenangan, dan tindakan lahir dari kejernihan.",
    "hero.cta": "MULAI PERJALANAN",
    "hero.goDashboard": "KE DASHBOARD",
    "hero.welcome": "SELAMAT DATANG DI SANCTUARY ANDA",
    "hero.misi": "Arsitektur Hidup Terpadu",
    "hero.misi.label": "Misi Kami",
    "hero.scroll": "Scroll untuk Merasakan",
    "hero.v5": "V5.0 Established",
    "hero.pristine": "95 PRISTINE STATE",
    "header.home": "HOME",
    "header.dashboard": "DASHBOARD",
    "header.manifes": "MANIFES",
    "header.support": "SUPPORT",
    "header.lang": "ID / EN",
    "data.label": "Data Index",
    "data.headline": "About Us",
    "data.mental": "Mental Stability",
    "data.finance": "Financial Clarity",
    "data.career": "Future Architecture",
    "data.mood": "Mood Stability",
    "data.spending": "Spending Intent",
    "data.clarity": "Future Clarity",
    "narrative.text":
      "Utang bukan sekadar angka. Ia adalah beban di pikiran yang mengganggu langkahmu.",
    "pillars.sanctuary.title": "Sanctuary AI",
    "pillars.sanctuary.desc":
      "Asisten dan teman refleksi emosional berbasis AI yang tersedia 24/7. Membantu memproses emosi negatif, mengurai pikiran yang kusut, dan menyediakan ruang aman tanpa penghakiman.",
    "pillars.label": "LAYANAN KAMI",
    "pillars.headline.part1": "LAYANAN",
    "pillars.headline.part2": "KAMI.",
    "pillars.headline.part3": "",
    "pillars.index.title": "Equilibrium Index",
    "pillars.index.desc":
      "Sistem penilaian eksklusif untuk melacak harmoni hidup secara real-time. Mengukur tingkat keseimbangan aktivitas harian pengguna.",
    "pillars.career.title": "Future Architecture",
    "pillars.career.desc":
      "Navigasi rancangan karier masa depan dengan pathfinding terstruktur berdasarkan kombinasi Skill-Passion-Value.",
    "pillars.shield.title": "Impulse Shield",
    "pillars.shield.desc":
      "Benteng pertahanan finansial dari perilaku belanja impulsif dengan fitur 24-Hour Cooling Vault.",
    "pillars.mental.title": "Mental Sanctuary",
    "pillars.mental.desc":
      "Area pelacakan kesehatan mental harian untuk menulis jurnal, evaluasi diri dalam keheningan, dan memetakan fluktuasi emosi.",
    "pillars.community.title": "Soul Community",
    "pillars.community.desc":
      "Ruang interaksi sosial yang menghubungkan pengguna dengan lingkaran berfrekuensi dan bervisi sama untuk saling bertukar energi positif.",
    "footer.init": "Inisialisasi Sistem",
    "footer.fase": "Fase 01 : Aktif",
    "footer.infra": "Infrastruktur Teknik",
    "footer.audit": "Pristine Audit v5.0",
    "footer.circadian": "Circadian Sync",
    "footer.state.day": "Siang Hari",
    "footer.soul": "Soul UI State",
    "footer.breathing": "Breathing : Stabil",
    "header.engine": "Equilibrium Engine",
    "manifesto.label": "MANIFESTO ENGINE",
    "logic.title": "Equilibrium Logic",
    "logic.subtitle": "Satu angka yang merangkum kondisi hidupmu.",
    "logic.formula":
      "E = ((Mood × Healing) + (100 - Spending) + (Purpose × 10)) / 30",
    "logic.mood": "Suasana Hati",
    "logic.spending": "Pengeluaran Impulsif",
    "logic.purpose": "Arah Tujuan",
    "cta.final.title": "Siap Menemukan Keseimbanganmu?",
    "cta.final.desc":
      "Bergabunglah dengan sanctuary digital yang dirancang untuk masa depanmu.",
    "cta.final.button": "MULAI PERJALANANMU",
    "cta.final.goDashboard": "KE DASHBOARD",
    "dashboard.welcome": "Sanctuary Entry",
    "dashboard.hello": "Halo",
    "dashboard.backHome": "← KEMBALI KE HOME",
  },
  en: {
    "hero.headline": "Find your serene point in the midst of a noisy world.",
    "hero.headline.alt": "YOUR SERENE POINT",
    "hero.subheadline":
      "Not just an app. EQUIL is your mirror — where ambition meets stillness, and action is born from clarity.",
    "hero.cta": "START YOUR JOURNEY",
    "hero.goDashboard": "GO TO DASHBOARD",
    "hero.welcome": "WELCOME TO YOUR SANCTUARY",
    "hero.misi": "Integrated Life Architecture",
    "hero.misi.label": "Our Mission",
    "hero.scroll": "Scroll to Experience",
    "hero.v5": "V5.0 Established",
    "hero.pristine": "95 PRISTINE STATE",
    "header.home": "HOME",
    "header.dashboard": "DASHBOARD",
    "header.manifes": "MANIFES",
    "header.support": "SUPPORT",
    "header.lang": "ID / EN",
    "data.label": "Data Index",
    "data.headline": "About Us",
    "data.mental": "Mental Stability",
    "data.finance": "Financial Clarity",
    "data.career": "Future Architecture",
    "data.mood": "Mood Stability",
    "data.spending": "Spending Intent",
    "data.clarity": "Future Clarity",
    "narrative.text":
      "Debt is not just a number. It is a burden in the mind that hinders your steps.",
    "pillars.sanctuary.title": "Sanctuary AI",
    "pillars.sanctuary.desc":
      "A 24/7 AI-based assistant and emotional reflection companion. Helps process negative emotions, untangle complex thoughts, and provides a safe space without judgment.",
    "pillars.label": "OUR SERVICES",
    "pillars.headline.part1": "OUR",
    "pillars.headline.part2": "SERVICES.",
    "pillars.headline.part3": "",
    "pillars.index.title": "Equilibrium Index",
    "pillars.index.desc":
      "An exclusive scoring system to track life harmony in real-time, measuring the balance of users daily activities.",
    "pillars.career.title": "Future Architecture",
    "pillars.career.desc":
      "Future career design navigation with structured pathfinding based on Skill-Passion-Value combination.",
    "pillars.shield.title": "Impulse Shield",
    "pillars.shield.desc":
      "Financial defense fortress against impulsive shopping behavior featuring a 24-Hour Cooling Vault.",
    "pillars.mental.title": "Mental Sanctuary",
    "pillars.mental.desc":
      "Daily mental health tracking area for journaling, self-evaluation in silence, and mapping emotional fluctuations.",
    "pillars.community.title": "Soul Community",
    "pillars.community.desc":
      "A measured social interaction space connecting users with a circle of similar frequency and vision to exchange positive energy.",
    "footer.init": "System Initialization",
    "footer.fase": "Phase 01 : Active",
    "footer.infra": "Technical Infrastructure",
    "footer.audit": "Pristine Audit v5.0",
    "footer.circadian": "Circadian Sync",
    "footer.state.day": "Daylight",
    "footer.soul": "Soul UI State",
    "footer.breathing": "Breathing : Stable",
    "header.engine": "Equilibrium Engine",
    "manifesto.label": "MANIFESTO ENGINE",
    "logic.title": "Equilibrium Logic",
    "logic.subtitle": "One number that summarizes your life condition.",
    "logic.formula":
      "E = ((Mood × Healing) + (100 - Spending) + (Purpose × 10)) / 30",
    "logic.mood": "Mood State",
    "logic.spending": "Impulsive Spending",
    "logic.purpose": "Purpose Clarity",
    "cta.final.title": "Ready to Find Your Equilibrium?",
    "cta.final.desc": "Join the digital sanctuary designed for your future.",
    "cta.final.button": "START YOUR JOURNEY",
    "cta.final.goDashboard": "GO TO DASHBOARD",
    "dashboard.welcome": "Sanctuary Entry",
    "dashboard.hello": "Hello",
    "dashboard.backHome": "← EXIT TO HOME",
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined,
);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("equil_lang") as Language;
      if (saved) return saved;
      if (
        typeof navigator !== "undefined" &&
        !navigator.language.startsWith("id")
      ) {
        return "en";
      }
    }
    return "id";
  });

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem("equil_lang", lang);
  };

  const t = (key: string) => {
    return (translations[language] as any)[key] || key;
  };

  return (
    <LanguageContext.Provider
      value={{ language, setLanguage: handleSetLanguage, t }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context)
    throw new Error("useLanguage must be used within LanguageProvider");
  return context;
};
