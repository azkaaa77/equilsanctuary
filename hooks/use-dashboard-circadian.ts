// hooks/use-dashboard-circadian.ts
// Dashboard-specific circadian hook — wraps the global useCircadian()
// and adds personalized poetic greetings for the ambient greeting section.

'use client';

import { useMemo } from 'react';
import { useCircadian } from '@/components/providers/circadian-provider';

type TimeContext = 'morning' | 'day' | 'evening' | 'night';

interface DashboardGreeting {
  line: string;
  sub: string;
}

// Poetic greetings pool — lowercase, never aggressive
const GREETINGS: Record<TimeContext, DashboardGreeting[]> = {
  morning: [
    { line: 'awali hari dengan tenang, azka.', sub: 'kodenya jangan lupa di-compile.' },
    { line: 'pagi yang baik untuk menanam sesuatu.', sub: 'mungkin habits. mungkin harapan.' },
    { line: 'udara pagi membawa kejernihan.', sub: 'atur yang penting. sisanya bisa nanti.' },
  ],
  day: [
    { line: 'tetap bergerak, tapi jangan lupa bernapas.', sub: 'satu hal pada satu waktu.' },
    { line: 'siang ini milikmu, azka.', sub: 'gunakan sesuai ritme — bukan ritme orang lain.' },
    { line: 'separuh hari sudah kamu lewati.', sub: 'rayakan hal kecil yang sudah selesai.' },
  ],
  evening: [
    { line: 'matahari mulai turun, azka.', sub: 'saatnya mengurangi, bukan menambahkan.' },
    { line: 'sore yang tenang untuk refleksi singkat.', sub: 'apa satu hal yang kamu syukuri hari ini?' },
    { line: 'transisi sore menuju malam.', sub: 'biarkan tubuhmu mulai melambat.' },
  ],
  night: [
    { line: 'malam sudah tiba. istirahat itu produktif.', sub: 'tutup layar. buka ketenangan.' },
    { line: 'tidak semua harus selesai hari ini, azka.', sub: 'besok masih ada, dengan energi yang utuh.' },
    { line: 'bintang-bintang tidak terburu-buru bersinar.', sub: 'kamu juga tidak perlu.' },
  ],
};

export interface DashboardCircadian {
  timeContext: TimeContext;
  greeting: DashboardGreeting;
  greetingIndex: number;
}

export function useDashboardCircadian(): DashboardCircadian {
  const { timeContext } = useCircadian();

  // Pick a greeting based on the current minute — changes every ~20 min
  const greetingIndex = useMemo(() => {
    const minute = new Date().getMinutes();
    return Math.floor(minute / 20) % 3;
  }, []);

  const greeting = GREETINGS[timeContext][greetingIndex];

  return { timeContext, greeting, greetingIndex };
}
