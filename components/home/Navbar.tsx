"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { useLanguage } from "@/components/providers/language-provider";

export const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const { user, signInWithGoogle, isLoading } = useAuth();
  const { language, setLanguage, t } = useLanguage();

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Scrolled state for background change
      setIsScrolled(currentScrollY > 40);

      // Visibility state for hide/show on scroll direction
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-[100] h-20 flex items-center px-[6%] transition-all duration-500 ease-in-out ${
        isVisible ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"
      } ${
        isScrolled
          ? "bg-white/90 backdrop-blur-3xl h-16 border-b border-equil-onyx/5 shadow-sm"
          : "bg-transparent"
      }`}
    >
      <div className="w-full max-w-[1240px] mx-auto flex items-center justify-between">
        {/* Branding Cluster */}
        <div className="flex items-center gap-12">
          <a
            href="/"
            className="font-display font-black text-2xl tracking-tightest text-equil-onyx group"
          >
            EQUIL
            <span className="text-equil-mint group-hover:pl-1 transition-all">
              /
            </span>
          </a>

          <div className="hidden lg:flex items-center gap-6 pl-12 border-l border-equil-onyx/10 h-6">
            {/* <div className="flex items-center gap-2">
               <div className="w-2 h-2 rounded-full bg-equil-mint animate-pulse" />
               <span className="text-[10px] font-display font-black tracking-[0.2em] uppercase text-equil-onyx/50">SYSTEM_LIVE</span>
             </div>
             <span className="text-[10px] font-display font-black tracking-[0.2em] uppercase text-equil-onyx/20">V5.0</span> */}
          </div>
        </div>

        {/* Global Navigation */}
        <div className="hidden md:flex items-center gap-16">
          {[
            { label: t("header.home"), href: "/" },
            { label: t("header.dashboard"), href: "/dashboard" },
            { label: t("header.manifes"), href: "#" },
          ].map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="font-display text-[10px] font-black uppercase tracking-[0.3em] text-equil-onyx/40 hover:text-equil-onyx transition-colors relative group py-2"
            >
              {item.label}
              <span className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-equil-mint group-hover:w-full transition-all duration-500" />
            </a>
          ))}
        </div>

        {/* Action Cluster (Separated zones) */}
        <div className="flex items-center gap-6">
          {/* 1. Language Toggle Zone */}
          <button
            onClick={() => setLanguage(language === "id" ? "en" : "id")}
            className="h-8 px-4 rounded-full border border-equil-onyx/10 font-display font-black text-[8px] tracking-[0.15em] uppercase hover:bg-equil-onyx hover:text-white transition-all duration-500 cursor-pointer flex items-center gap-2 bg-white/60 backdrop-blur-md"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-equil-mint animate-pulse" />
            <span>{language === "id" ? "ID" : "EN"}</span>
          </button>

          {/* 2. Balance & Status Zone */}
          <div className="hidden lg:flex flex-col items-end gap-0.5 px-6 border-x border-equil-onyx/5">
            <span className="text-[8px] font-display font-black tracking-[0.25em] text-equil-onyx/20 uppercase">
              BALANCE
            </span>
            <span className="text-sm font-display font-black text-equil-onyx leading-none">
              95 <span className="text-[9px] text-equil-mint italic">EQ</span>
            </span>
          </div>

          {/* 3. Utility Icons (Notification) */}
          <button className="relative w-10 h-10 rounded-full flex items-center justify-center hover:bg-equil-onyx/5 transition-all text-equil-onyx">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M18 8C18 6.4087 17.3679 4.88258 16.2426 3.75736C15.1174 2.63214 13.5913 2 12 2C10.4087 2 8.88258 2.63214 7.75736 3.75736C6.63214 4.88258 6 6.4087 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M13.73 21C13.5542 21.3031 13.3019 21.5547 12.9982 21.7295C12.6946 21.9044 12.3504 21.9965 12 21.9965C11.6496 21.9965 11.3054 21.9044 11.0018 21.7295C10.6981 21.5547 10.4458 21.3031 10.27 21"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="absolute top-4 right-4 w-1.5 h-1.5 bg-equil-mint rounded-full shadow-[0_0_10px_rgba(45,106,79,0.5)]" />
          </button>

          {/* 4. Auth/Profile Zone */}
          <div className="pl-2">
            {isLoading ? (
              <div className="h-10 w-10 bg-equil-onyx/5 rounded-full animate-pulse" />
            ) : user ? (
              <button
                onClick={() => (window.location.href = "/dashboard")}
                className="w-10 h-10 rounded-full overflow-hidden border-2 border-equil-mint ring-2 ring-equil-mint/10 transition-all hover:ring-equil-mint/20"
              >
                {user.user_metadata?.avatar_url ? (
                  <img
                    src={user.user_metadata.avatar_url}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-equil-onyx flex items-center justify-center text-white font-display font-black text-xs">
                    {user.user_metadata?.full_name?.[0] ||
                      user.email?.[0] ||
                      "U"}
                  </div>
                )}
              </button>
            ) : (
              <button
                onClick={signInWithGoogle}
                className="h-9 px-7 rounded-full bg-equil-onyx text-white font-display font-black text-[9px] tracking-widest uppercase hover:bg-equil-mint transition-all duration-500 cursor-pointer"
              >
                MASUK
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
