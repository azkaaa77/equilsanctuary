// app/dashboard/diary/[date]/page.tsx
// Daily Sanctuary Page with Zustand persistence.
// All data flows through useEquilStore (persisted to localStorage via zustand/persist).
// Historical routing: past/future context-aware Ara responses.

'use client';

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { format, parseISO, isValid, isToday, isPast } from 'date-fns';
import { id as localeID } from 'date-fns/locale';
import { useLanguage } from '@/components/providers/language-provider';
import { useAuth } from '@/components/providers/auth-provider';
import { useEquilStore } from '@/store/useEquilStore';
import DailyLogList from '@/components/dashboard/DailyLogList';
import { X } from 'lucide-react';

// ── MOOD EMOJIS ─────────────────────────────────────────────
const MOOD_EMOJIS = ['🫠', '✨', '😪', '💖', '🚀'];

// ── ARA RESPONSES ───────────────────────────────────────────
const ARA_DIARY_PRESENT = [
  'gapapa istirahat dulu aja, error laravelnya ga bakal lari kemana-mana kok 💖',
  'kamu udah nulis, itu langkah pertama yang bagus ✨',
  'perasaan itu valid. ga perlu dicari alasannya sekarang.',
  'makasih udah cerita. aku dengerin.',
  'kadang nulis itu lebih menyembuhkan dari ngoding 12 jam.',
];
const ARA_DIARY_PAST = [
  'ini catatanmu di masa lalu. kamu sudah sejauh ini loh 💖',
  'terima kasih sudah menoleh ke belakang. itu butuh keberanian.',
  'liat, kamu sudah berkembang dari hari itu ✨',
  'kenangan ini bukan beban, tapi bukti perjalanan.',
  'kamu yang dulu pasti bangga sama kamu yang sekarang.',
];
const ARA_DIARY_FUTURE = [
  'merencanakan itu bentuk self-care juga loh ✨',
  'satu langkah kecil hari itu sudah cukup.',
  'kamu sedang menyiapkan hadiah untuk dirimu di masa depan 💖',
];
const ARA_IDLE = [
  'tugas ngodingnya jangan lupa disentuh dikit ya hari ini 💖',
  'kalau belum sempat, catat aja dulu. nanti bisa dilanjutin.',
  'ada yang mau kamu ceritakan? tulis di sini.',
];

export default function DailySanctuaryPage() {
  const params = useParams();
  const router = useRouter();
  const { mounted } = useAuth();
  const { language } = useLanguage();
  const dateStr = params.date as string;

  const parsedDate = useMemo(() => parseISO(dateStr), [dateStr]);
  const isValidDate = isValid(parsedDate);

  // ── Zustand store ──
  const {
    getTasksForDate, addTask, toggleTask, updateTask, deleteTask, setTaskDeadline,
    getDiary, setDiary,
    getBrainDump, setBrainDump,
    getExpensesForDate, addExpense, deleteExpense,
    getMood, setMood,
  } = useEquilStore();

  // Read reactive data from store
  // Ambil state utuh dari store (jangan lakukan filter/mapping di dalam selector)
  const allTasks = useEquilStore(s => s.tasks) || [];
  const allExpenses = useEquilStore(s => s.expenses) || [];

  // Lakukan filter di luar hook Zustand
  // Tampilkan tugas tanggal ini + tugas belum selesai dari hari-hari sebelumnya (rollover)
  const tasks = allTasks.filter(t => 
    t.dateCreated === dateStr || 
    (t.dateCreated < dateStr && !t.completed)
  );
  const expenses = allExpenses.filter(e => e.date === dateStr);

  const diaryContent = useEquilStore(s => s.diaries.find(d => d.date === dateStr)?.content || '');
  const brainDumpContent = useEquilStore(s => s.brainDumps.find(d => d.date === dateStr)?.content || '');
  const moodEmoji = useEquilStore(s => s.moods.find(m => m.date === dateStr)?.emoji || null);

  // Hydration guard for SSR
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);

  const dateContext = useMemo(() => {
    if (!isValidDate) return 'present' as const;
    if (isToday(parsedDate)) return 'present' as const;
    if (isPast(parsedDate)) return 'past' as const;
    return 'future' as const;
  }, [parsedDate, isValidDate]);

  // ── Timer ──
  const [timerActive, setTimerActive] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(25 * 60);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Ara ──
  const [araText, setAraText] = useState('');
  const [isAraTyping, setIsAraTyping] = useState(false);
  const araTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasTypedRef = useRef(false);

  // ── Expense input ──
  const [expLabel, setExpLabel] = useState('');
  const [expAmount, setExpAmount] = useState('');

  // Timer logic
  useEffect(() => {
    if (timerActive && timerSeconds > 0) {
      timerRef.current = setInterval(() => {
        setTimerSeconds(prev => {
          if (prev <= 1) { setTimerActive(false); if (timerRef.current) clearInterval(timerRef.current); return 0; }
          return prev - 1;
        });
      }, 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [timerActive]);

  // Reset typed status when date changes
  useEffect(() => {
    hasTypedRef.current = false;
  }, [dateStr]);

  // Debounced Ara response via useEffect
  useEffect(() => {
    if (!hasTypedRef.current) return;

    if (araTimeoutRef.current) clearTimeout(araTimeoutRef.current);

    if (!diaryContent.trim()) {
      setAraText("tugas ngodingnya jangan lupa disentuh dikit ya hari ini 💖");
      return;
    }

    araTimeoutRef.current = setTimeout(async () => {
      setIsAraTyping(true);
      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: diaryContent }),
        });
        if (!response.ok) {
          throw new Error(`API returned status ${response.status}`);
        }
        const data = await response.json();
        setAraText(data.reply || "aku dengerin kok...");
      } catch (error) {
        console.error(error);
        setAraText("koneksiku lagi agak penuh... coba kirim ulang pelan-pelan yaa.");
      } finally {
        setIsAraTyping(false);
      }
    }, 2000);

    return () => {
      if (araTimeoutRef.current) clearTimeout(araTimeoutRef.current);
    };
  }, [diaryContent]);

  // Ara auto-trigger for historical entries
  useEffect(() => {
    if (hydrated && diaryContent.trim() && dateContext === 'past') {
      setAraText(ARA_DIARY_PAST[Math.floor(Math.random() * ARA_DIARY_PAST.length)]);
    }
  }, [hydrated, dateStr]); // eslint-disable-line react-hooks/exhaustive-deps

  // Handlers
  const handleDiaryChange = (text: string) => {
    setDiary(dateStr, text);
    hasTypedRef.current = true;
  };
  const handleAddExpense = () => { if (!expLabel.trim()) return; addExpense(dateStr, expLabel, parseFloat(expAmount) || 0); setExpLabel(''); setExpAmount(''); };

  const timerDisplay = `${String(Math.floor(timerSeconds / 60)).padStart(2, '0')}:${String(timerSeconds % 60).padStart(2, '0')}`;
  const dateDisplay = isValidDate ? format(parsedDate, 'd MMMM yyyy', { locale: language === 'id' ? localeID : undefined }) : dateStr;
  const dayName = isValidDate ? format(parsedDate, 'EEEE', { locale: language === 'id' ? localeID : undefined }) : '';

  if (!mounted) return null;
  if (!isValidDate) return <div className="flex items-center justify-center min-h-[60vh]"><p className="text-equil-onyx/30 font-mono text-sm">tanggal tidak valid.</p></div>;
  if (!hydrated) return <div className="flex items-center justify-center min-h-[60vh]"><span className="text-[10px] font-mono tracking-[0.3em] text-equil-onyx/20 uppercase">LOADING...</span></div>;

  return (
    <div className="min-h-screen">
      {/* HEADER */}
      <header className="mb-16">
        <button onClick={() => router.push('/dashboard')} className="inline-flex items-center gap-2 text-equil-onyx/30 hover:text-equil-mint transition-colors group mb-10">
          <span className="text-lg group-hover:-translate-x-1 transition-transform">←</span>
          <span className="text-[10px] font-mono tracking-[0.25em] uppercase font-bold">{language === 'id' ? 'Kembali ke Dashboard' : 'Back to Dashboard'}</span>
        </button>

        <div className="flex items-end justify-between gap-6 flex-wrap">
          <div>
            {dateContext !== 'present' && (
              <span className={`text-[8px] font-mono tracking-[0.3em] uppercase mb-2 block ${dateContext === 'past' ? 'text-equil-forest/25' : 'text-equil-mint/40'}`}>
                {dateContext === 'past' ? (language === 'id' ? '◌ CATATAN MASA LALU' : '◌ PAST ENTRY') : (language === 'id' ? '◌ RENCANA MASA DEPAN' : '◌ FUTURE PLAN')}
              </span>
            )}
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-black tracking-tightest text-equil-onyx leading-[0.85]">{dateDisplay}</h1>
            <span className="text-base font-display italic text-equil-mint/50 mt-2 block capitalize">{dayName}</span>
          </div>
          <div className="flex items-center gap-2">
            {MOOD_EMOJIS.map((emoji) => (
              <button key={emoji} onClick={() => setMood(dateStr, emoji)} className={`w-11 h-11 rounded-2xl text-xl flex items-center justify-center transition-all duration-300 ${moodEmoji === emoji ? 'bg-equil-mint/10 ring-2 ring-equil-mint/30 scale-110' : 'hover:bg-equil-sage/40 hover:scale-105'}`}>{emoji}</button>
            ))}
          </div>
        </div>
      </header>

      {/* 2-COL LAYOUT */}
      <div className="flex flex-col lg:flex-row gap-16 lg:gap-20">

        {/* LEFT: Log & Timer */}
        <div className="w-full lg:w-[340px] shrink-0 space-y-12">
          <DailyLogList
            tasks={tasks}
            onAdd={(text, deadline) => addTask(dateStr, text, deadline)}
            onToggle={toggleTask}
            onUpdate={updateTask}
            onDelete={deleteTask}
            onSetDeadline={setTaskDeadline}
            language={language}
          />

          {/* Expense */}
          <div>
            <span className="text-[8px] font-mono tracking-[0.35em] text-equil-onyx/15 uppercase block mb-4">{language === 'id' ? 'CATAT PENGELUARAN' : 'QUICK EXPENSE'}</span>
            <div className="flex items-center gap-3">
              <input type="text" value={expLabel} onChange={(e) => setExpLabel(e.target.value)} placeholder={language === 'id' ? 'apa yang kamu beli...' : 'what did you buy...'} className="flex-1 bg-transparent text-sm text-equil-onyx placeholder:text-equil-onyx/10 outline-none border-b border-equil-forest/10 pb-1.5 focus:border-equil-mint/30 transition-colors" />
              <input type="number" value={expAmount} onChange={(e) => setExpAmount(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAddExpense()} placeholder="Rp" className="w-24 bg-transparent text-sm text-equil-onyx text-right placeholder:text-equil-onyx/10 outline-none border-b border-equil-forest/10 pb-1.5 focus:border-equil-mint/30 transition-colors font-mono" />
            </div>
            {expenses.length > 0 && (
              <div className="mt-4 flex flex-col gap-1.5">
                {expenses.map((exp) => (
                  <div key={exp.id} className="flex items-center justify-between text-xs text-equil-onyx/25 group/exp py-0.5">
                    <span className="truncate">{exp.label}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono shrink-0">Rp {exp.amount.toLocaleString('id-ID')}</span>
                      <button
                        onClick={() => deleteExpense(exp.id)}
                        className="opacity-0 group-hover/exp:opacity-100 transition-opacity duration-200 p-0.5 rounded hover:bg-equil-coral/10 shrink-0"
                        title={language === 'id' ? 'Hapus pengeluaran' : 'Delete expense'}
                      >
                        <X size={12} className="text-equil-onyx/30 hover:text-equil-coral transition-colors" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Timer */}
          <div>
            <span className="text-[8px] font-mono tracking-[0.35em] text-equil-onyx/15 uppercase block mb-4">{language === 'id' ? 'SESI FOKUS' : 'FOCUS SESSION'}</span>
            <AnimatePresence mode="wait">
              {!timerActive && timerSeconds === 25 * 60 ? (
                <motion.button key="start" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setTimerActive(true)} className="text-sm text-equil-onyx/25 hover:text-equil-mint font-display font-bold tracking-wide transition-colors">
                  {language === 'id' ? '▶ Mulai Sesi Fokus' : '▶ Start Focus Session'}
                </motion.button>
              ) : (
                <motion.div key="timer" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-4">
                  <span className="text-6xl font-display font-light text-equil-onyx tracking-tightest tabular-nums">{timerDisplay}</span>
                  <div className="flex gap-3">
                    <button onClick={() => setTimerActive(!timerActive)} className="text-[10px] font-mono font-bold tracking-[0.2em] uppercase text-equil-mint hover:text-equil-forest transition-colors">{timerActive ? (language === 'id' ? 'JEDA' : 'PAUSE') : (language === 'id' ? 'LANJUT' : 'RESUME')}</button>
                    <button onClick={() => { setTimerActive(false); setTimerSeconds(25 * 60); }} className="text-[10px] font-mono font-bold tracking-[0.2em] uppercase text-equil-onyx/15 hover:text-equil-coral transition-colors">RESET</button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* RIGHT: Diary Canvas */}
        <div className="flex-1 min-w-0 space-y-10">
          <div>
            <span className="text-[8px] font-mono tracking-[0.35em] text-equil-onyx/15 uppercase block mb-4">BRAIN DUMP</span>
            <textarea value={brainDumpContent} onChange={(e) => setBrainDump(dateStr, e.target.value)} placeholder={language === 'id' ? '// catat logic, ide, debug notes...' : '// logic, ideas, debug notes...'} className="w-full min-h-[120px] bg-transparent text-sm font-mono text-equil-onyx/50 placeholder:text-equil-onyx/10 outline-none resize-none border-b border-equil-forest/10 pb-4 focus:border-equil-mint/20 transition-colors leading-relaxed" />
          </div>

          <div>
            <span className="text-[8px] font-mono tracking-[0.35em] text-equil-onyx/15 uppercase block mb-4">SANCTUARY DIARY</span>
            <textarea value={diaryContent} onChange={(e) => handleDiaryChange(e.target.value)} placeholder={language === 'id' ? 'tumpahkan isi kepalamu di sini, tidak ada yang menghakimi...' : 'pour your thoughts here, no one is judging...'} className="w-full min-h-[300px] bg-transparent text-lg font-sans text-equil-onyx/60 placeholder:text-equil-onyx/8 outline-none resize-none border-none leading-[1.8] tracking-wide" />
          </div>

          {/* Ara's Whisper */}
          <div className="pt-8 border-t border-equil-forest/[0.05]">
            <span className="text-[8px] font-mono tracking-[0.3em] text-equil-forest/15 uppercase block mb-3">ARA&apos;S WHISPER</span>
            <div className="min-h-[32px]">
              <AnimatePresence mode="wait">
                {isAraTyping ? (
                  <motion.div key="typing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-equil-mint/30 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-equil-mint/30 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-equil-mint/30 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </motion.div>
                ) : araText ? (
                  <motion.p key={araText} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} className="text-sm italic text-equil-forest/30 leading-relaxed lowercase">{araText}</motion.p>
                ) : (
                  <motion.p key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm italic text-equil-forest/15">{language === 'id' ? 'ara menunggu... tulis sesuatu di diary untuk membangunkannya.' : 'ara is waiting... write something in your diary to wake her.'}</motion.p>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
