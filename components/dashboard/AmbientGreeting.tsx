// components/dashboard/AmbientGreeting.tsx
// Dynamic time-aware greeting with Google Auth name parsing.
// Pulls real name from session, parses first word, lowercases it.
// Falls back to "pengembara" if name is unavailable.

'use client';

import React, { useEffect, useState, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useCircadian } from '@/components/providers/circadian-provider';
import { useAuth } from '@/components/providers/auth-provider';

// ── TYPES ───────────────────────────────────────────────────
type TimeContext = 'morning' | 'day' | 'evening' | 'night';

interface GreetingLine {
  line: string;  // Main text (will have name appended)
  sub: string;   // Supporting whisper
}

// ── GREETING POOLS (name is injected dynamically) ───────────
const GREETINGS: Record<TimeContext, GreetingLine[]> = {
  morning: [
    { line: 'awali hari dengan tenang, {name}.', sub: 'kodenya jangan lupa di-compile.' },
    { line: 'pagi yang baik untuk menanam sesuatu, {name}.', sub: 'mungkin habits. mungkin harapan.' },
    { line: 'udara pagi membawa kejernihan, {name}.', sub: 'atur yang penting. sisanya bisa nanti.' },
  ],
  day: [
    { line: 'tetap bergerak, tapi jangan lupa bernapas, {name}.', sub: 'satu hal pada satu waktu.' },
    { line: 'siang ini milikmu, {name}.', sub: 'gunakan sesuai ritme — bukan ritme orang lain.' },
    { line: 'separuh hari sudah kamu lewati, {name}.', sub: 'rayakan hal kecil yang sudah selesai.' },
  ],
  evening: [
    { line: 'matahari mulai turun, {name}.', sub: 'saatnya mengurangi, bukan menambahkan.' },
    { line: 'transisi sore menuju malam, {name}.', sub: 'biarkan tubuhmu mulai melambat.' },
    { line: 'sore yang tenang untuk refleksi singkat, {name}.', sub: 'apa satu hal yang kamu syukuri hari ini?' },
  ],
  night: [
    { line: 'malam sudah tiba, {name}. istirahat itu produktif.', sub: 'tutup layar. buka ketenangan.' },
    { line: 'tidak semua harus selesai hari ini, {name}.', sub: 'besok masih ada, dengan energi yang utuh.' },
    { line: 'bintang-bintang tidak terburu-buru bersinar, {name}.', sub: 'kamu juga tidak perlu.' },
  ],
};

// Time context labels for the indicator
const TIME_LABELS: Record<TimeContext, string> = {
  morning: 'PAGI // 05:00–11:00',
  day:     'SIANG // 11:00–15:00',
  evening: 'SORE // 15:00–18:30',
  night:   'MALAM // 18:30–05:00',
};

// Dot colors per time
const DOT_COLORS: Record<TimeContext, string> = {
  morning: 'bg-equil-sunlight',
  day:     'bg-equil-mint',
  evening: 'bg-equil-coral',
  night:   'bg-equil-forest',
};

export default function AmbientGreeting() {
  const { timeContext } = useCircadian();
  const { user } = useAuth();

  // ── Parse name from Google Auth session ──
  const firstName = useMemo(() => {
    const fullName = user?.user_metadata?.full_name
      || user?.user_metadata?.name
      || user?.email?.split('@')[0]
      || null;

    if (!fullName) return 'pengembara';

    // Take first word, lowercase it
    return fullName.trim().split(/\s+/)[0].toLowerCase();
  }, [user]);

  // ── Select greeting based on minute (rotates ~20min) ──
  const greetingIndex = useMemo(() => {
    return Math.floor(new Date().getMinutes() / 20) % 3;
  }, []);

  const rawGreeting = GREETINGS[timeContext][greetingIndex];

  // Inject name into greeting template
  const greeting = useMemo(() => ({
    line: rawGreeting.line.replace('{name}', firstName),
    sub: rawGreeting.sub,
  }), [rawGreeting, firstName]);

  // ── Typewriter state ──
  const [displayedLine, setDisplayedLine] = useState('');
  const [showSub, setShowSub] = useState(false);
  const [isTyping, setIsTyping] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setDisplayedLine('');
    setShowSub(false);
    setIsTyping(true);

    let charIndex = 0;
    const fullText = greeting.line;

    intervalRef.current = setInterval(() => {
      charIndex++;
      setDisplayedLine(fullText.slice(0, charIndex));

      if (charIndex >= fullText.length) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setIsTyping(false);
        setTimeout(() => setShowSub(true), 600);
      }
    }, 40); // ~40ms per char — unhurried

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [greeting.line]);

  return (
    <section
      className="w-full pb-10 pt-2"
      aria-label="Ambient greeting"
    >
      {/* Time context indicator */}
      <div className="flex items-center gap-2.5 mb-5">
        <span className={`w-1.5 h-1.5 rounded-full ${DOT_COLORS[timeContext]} dot-pulse`} />
        <span className="text-[9px] font-mono tracking-[0.35em] text-equil-onyx/25 uppercase">
          {TIME_LABELS[timeContext]}
        </span>
      </div>

      {/* Main greeting — typewriter */}
      <h2 className="text-2xl md:text-3xl lg:text-[2.1rem] font-display font-black tracking-tightest leading-[1.2] text-equil-onyx/85 min-h-[2.8rem]">
        <span>{displayedLine}</span>
        {isTyping && <span className="typewriter-cursor" />}
      </h2>

      {/* Sub-line — gentle fade-in */}
      <AnimatePresence>
        {showSub && (
          <motion.p
            key={greeting.sub}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="mt-3 text-sm font-sans text-equil-forest/40 tracking-wide"
          >
            {greeting.sub}
          </motion.p>
        )}
      </AnimatePresence>
    </section>
  );
}
