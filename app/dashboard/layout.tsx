"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { useRouter, usePathname } from "next/navigation";
import { useLanguage } from "@/components/providers/language-provider";
import { Menu, X } from "lucide-react";

const navDict = {
  id: {
    home: "BERANDA",
    dashboard: "DASHBOARD",
    manifest: "MANIFESTO",
    architecture: "ARSITEKTUR",
    profile: "PROFIL",
    systemInit: "SISTEM // MENGINISIASI",
    signOut: "KELUAR",
  },
  en: {
    home: "HOME",
    dashboard: "DASHBOARD",
    manifest: "MANIFEST",
    architecture: "ARCHITECTURE",
    profile: "PROFILE",
    systemInit: "SYSTEM // INITIALIZING",
    signOut: "SIGN OUT",
  },
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading, mounted, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { language, setLanguage } = useLanguage();

  const [showFallback, setShowFallback] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (!mounted) return;
    const t = setTimeout(() => setShowFallback(true), 5000);
    return () => clearTimeout(t);
  }, [mounted]);

  useEffect(() => {
    if (!mounted) return;

    const hasAuthFragment =
      typeof window !== "undefined" &&
      window.location.hash.includes("access_token");
    if (hasAuthFragment) return;

    const redirectTimer = setTimeout(() => {
      if (!isLoading && !user) {
        router.push("/");
      }
    }, 3000);

    return () => clearTimeout(redirectTimer);
  }, [user, isLoading, router, mounted]);

  const t = navDict[language as keyof typeof navDict] || navDict.id;

  if (!mounted || isLoading || !user) {
    return (
      <div className="min-h-screen bg-[#FFFFFF] text-[#141313] flex items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <div className="w-16 h-16 border border-black/10 flex items-center justify-center">
            <div className="w-1 h-1 bg-[#2D6A4F]" />
          </div>
          <span
            suppressHydrationWarning
            className="text-[10px] tracking-[0.3em] font-mono text-[#141313]/40 uppercase"
          >
            {t.systemInit}
          </span>
                 {" "}
        </div>
             {" "}
      </div>
    );
  }

  // ── NAV STRUCTURE ──
  const mainNav = [
    { label: language === "id" ? "BERANDA" : "HOME", path: "/", icon: "○" },
    { label: "DASHBOARD", path: "/dashboard", icon: "◈" },
  ];

  const moduleNav = [
    {
      label: "MENTAL SANCTUARY",
      path: "/dashboard/mental-sanctuary",
      icon: "◌",
      desc:
        language === "id" ? "Jurnal & Zen Tracker" : "Journal & Zen Tracker",
      disabled: false,
    },
    {
      label: "FUTURE ARCHITECTURE",
      path: "/dashboard/future-architecture",
      icon: "◆",
      desc:
        language === "id" ? "Karier & Sertifikasi" : "Career & Certifications",
      disabled: false,
    },
    {
      label: "IMPULSE SHIELD",
      path: "/dashboard/impulse-shield",
      icon: "◎",
      desc:
        language === "id"
          ? "Vault & Pertahanan Finansial"
          : "Vault & Financial Defense",
      disabled: false,
    },
    {
      label: "SANCTUARY AI",
      path: "/dashboard/sanctuary-ai",
      icon: "◉",
      desc:
        language === "id"
          ? "Refleksi Emosional 24/7"
          : "Emotional Reflection 24/7",
      disabled: false,
    },
    {
      label: "SOUL COMMUNITY",
      path: "/dashboard/soul-community",
      icon: "◔",
      desc: language === "id" ? "Peta Energi Sosial" : "Social Energy Map",
      disabled: false,
    },
  ];

  const isActivePath = (path: string) => {
    if (path === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(path);
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-equil-paper text-equil-onyx relative font-sans overflow-x-hidden w-full max-w-full">
      {/* ── MOBILE TOP NAVIGATION BAR ── */}
      <div className="flex items-center justify-between p-4 border-b border-equil-forest/10 md:hidden bg-equil-paper sticky top-0 z-40">
        <a
          href="/"
          className="text-lg font-black tracking-tighter text-[#141313]"
        >
          EQUIL.
        </a>
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="p-1 rounded hover:bg-black/5 transition-colors"
          aria-label="Open menu"
        >
          <Menu size={20} className="text-[#141313]" />
        </button>
      </div>

      {/* ── MOBILE OVERLAY (Backdrop Click-to-Close) ── */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-equil-onyx/20 backdrop-blur-sm md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* ── SIDEBAR (RESPONSIVE) ── */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-equil-paper border-r border-equil-forest/10 transform transition-transform duration-300 ease-in-out md:sticky md:top-0 md:h-screen md:translate-x-0 flex flex-col overflow-y-auto custom-scrollbar shrink-0 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        {/* Logo block with close button on mobile */}
        <div className="px-6 pt-10 pb-6 border-b border-black/5 shrink-0 flex items-center justify-between">
          <div>
            <a
              href="/"
              className="text-xl font-black tracking-tighter text-[#141313] hover:text-[#2D6A4F] transition-colors"
            >
              EQUIL.
            </a>
            <span className="mt-1 block text-[9px] font-mono tracking-[0.2em] text-[#141313]/30 uppercase">
              SYSTEM ARCHIVE // V5.0
            </span>
          </div>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="md:hidden p-1 rounded hover:bg-black/5 transition-colors"
            aria-label="Close menu"
          >
            <X size={18} className="text-[#141313]" />
          </button>
        </div>

        {/* Main nav */}
        <div className="px-4 pt-5 pb-2 shrink-0">
          <span className="text-[8px] font-mono tracking-[0.35em] text-[#141313]/25 uppercase mb-2 block px-2">
            {language === "id" ? "NAVIGASI" : "NAVIGATION"}
          </span>
          <div className="flex flex-col gap-0.5">
            {mainNav.map((item) => {
              const active = isActivePath(item.path);
              return (
                <a
                  key={item.path}
                  href={item.path}
                  onClick={() => setIsSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-[4px] text-[10px] font-mono font-bold tracking-[0.2em] uppercase transition-all duration-200 group ${
                    active
                      ? "bg-[#141313] text-[#F9F9F9]"
                      : "text-[#141313]/50 hover:text-[#141313] hover:bg-black/[0.03]"
                  }`}
                >
                  <span
                    className={`text-sm transition-colors ${active ? "text-[#F9F9F9]/50" : "text-[#141313]/20 group-hover:text-[#141313]/40"}`}
                  >
                    {item.icon}
                  </span>
                  {item.label}
                </a>
              );
            })}
          </div>
        </div>

        {/* Divider */}
        <div className="mx-4 my-3 h-[1px] bg-black/5 shrink-0" />

        {/* Module nav */}
        <div className="px-4 pb-4 flex-1 overflow-y-auto">
          <span className="text-[8px] font-mono tracking-[0.35em] text-[#141313]/25 uppercase mb-2 block px-2">
            {language === "id" ? "MODUL" : "MODULES"}
          </span>
          <div className="flex flex-col gap-0.5">
            {moduleNav.map((item) => {
              const active = !item.disabled && isActivePath(item.path);
              return (
                <a
                  key={item.path + item.label}
                  href={item.disabled ? undefined : item.path}
                  onClick={() => !item.disabled && setIsSidebarOpen(false)}
                  className={`flex items-start gap-3 px-3 py-3 rounded-[4px] transition-all duration-200 group ${
                    item.disabled
                      ? "cursor-not-allowed opacity-35"
                      : active
                        ? "bg-[#141313]"
                        : "hover:bg-black/[0.03] cursor-pointer"
                  }`}
                >
                  <span
                    className={`text-sm mt-0.5 shrink-0 transition-colors ${
                      active
                        ? "text-[#F9F9F9]/50"
                        : "text-[#141313]/20 group-hover:text-[#141313]/40"
                    }`}
                  >
                    {item.icon}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p
                      className={`text-[10px] font-mono font-bold tracking-[0.15em] uppercase leading-tight ${
                        active
                          ? "text-[#F9F9F9]"
                          : "text-[#141313]/60 group-hover:text-[#141313]"
                      }`}
                    >
                      {item.label}
                    </p>
                    <p
                      className={`text-[8px] font-mono tracking-wider mt-0.5 ${
                        active ? "text-[#F9F9F9]/40" : "text-[#141313]/25"
                      }`}
                    >
                      {item.desc}
                    </p>
                  </div>

                  {/* Active dot on hover (non-active items only) */}
                  {!item.disabled && !active && (
                    <span className="w-1 h-1 rounded-full bg-[#2D6A4F] self-center opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                  )}
                </a>
              );
            })}
          </div>
        </div>

        {/* Bottom block — isolated stacking context to prevent render duplication */}
        <div className="px-6 py-6 border-t border-black/5 shrink-0 isolate">
          {/* Lang toggle */}
          <button
            onClick={() => setLanguage(language === "id" ? "en" : "id")}
            className="text-[9px] tracking-[0.25em] font-bold text-[#141313]/30 hover:text-[#141313] transition-colors uppercase mb-5 block"
          >
            {language === "id" ? "ID // EN" : "EN // ID"}
          </button>

          {/* User — single instance, no duplication */}
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-full bg-equil-onyx/90 flex items-center justify-center shrink-0 overflow-hidden">
              <span className="text-white font-display font-black text-[9px] uppercase leading-none">
                {user.user_metadata?.full_name?.[0] || user.email?.[0] || "U"}
              </span>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-mono text-[9px] text-[#141313]/50 tracking-wider uppercase truncate">
                {user.user_metadata?.full_name?.split(" ")[0] || "USER"}
              </span>
              <button
                onClick={() => signOut()}
                className="text-left text-[9px] font-bold tracking-widest text-[#141313]/30 hover:text-[#FF8A80] uppercase transition-colors"
              >
                {t.signOut}
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* ── MAIN PANEL ── */}
      <main className="flex-1 flex flex-col min-w-0">
        <div className="flex-1 bg-equil-paper px-4 sm:px-8 md:px-16 py-12 max-w-[1200px] w-full mx-auto overflow-x-hidden relative">
          {/* Organic Ambient Blobs */}
          <div
            className="pointer-events-none fixed top-[15%] right-[5%] w-[500px] h-[500px] rounded-full bg-equil-sage/[0.07] blur-[80px] -z-10 hidden md:block"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none fixed bottom-[10%] left-[30%] w-[400px] h-[400px] rounded-full bg-equil-coral/[0.04] blur-[90px] -z-10 hidden md:block"
            aria-hidden="true"
          />
          {children}
        </div>
      </main>
    </div>
  );
}
