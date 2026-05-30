// /app/page.tsx
"use client";

import React, { useEffect } from "react";
import { Preloader } from "@/components/home/Preloader";
import { Navbar } from "@/components/home/Navbar";
import { Hero } from "@/components/home/Hero";
import { DataIndex } from "@/components/home/DataIndex";
import { QuoteSection } from "@/components/home/QuoteSection";
import { PillarsSection } from "@/components/home/PillarsSection";
import { CompanionReveal } from "@/components/home/CompanionReveal";
import { FinalCTA } from "@/components/home/FinalCTA";
import { FooterSection } from "@/components/home/FooterSection";
import { useLenis } from "@/hooks/use-lenis";
import { useAuth } from "@/components/providers/auth-provider";

export default function Home() {
  const { mounted } = useAuth();
  useLenis(); // Initialize Smooth Scroll

  if (!mounted) return null;

  return (
    <div className="relative w-full bg-equil-paper overflow-x-hidden">
      <Preloader />
      <Navbar />

      <main className="relative">
        <Hero />
        <DataIndex />
        <QuoteSection />
        <PillarsSection />
        <CompanionReveal />
        <FinalCTA />
      </main>

      <FooterSection />

      {/* Circadian Overlay - Subtle hue based on time */}
      <CircadianOverlay />
    </div>
  );
}

function CircadianOverlay() {
  // Simple overlay for subtle atmosphere
  return (
    <div className="fixed inset-0 pointer-events-none z-[999] opacity-[0.03] mix-blend-multiply bg-equil-sunlight" />
  );
}
