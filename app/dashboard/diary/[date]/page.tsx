// app/dashboard/diary/[date]/page.tsx
// Daily Sanctuary Page — Prisine v5.0 Aesthetic Overhaul
// Grid layout, two-tone editorial typography, improved textarea, mobile-first.

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
import { X, ArrowLeft } from 'lucide-react';

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

  const allTasks = useEquilStore(s => s.tasks) || [];
  const allExpenses = useEquilStore(s => s.expenses) || [];

  const tasks = allTasks.filter(t =>
    t.dateCreated === dateStr ||
    (t.dateCreated < dateStr && !t.completed)
  );
  const expenses = allExpenses.filter(e => e.date === dateStr);

  const diaryContent = useEquilStore(s => s.diaries.find(d => d.date === dateStr)?.content || '');
  const brainDumpContent = useEquilStore(s => s.brainDumps.find(d => d.date === dateStr)?.content || '');
  const moodEmoji = useEquilStore(s => s.moods.find(m => m.date === dateStr)?.emoji || null);

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

  useEffect(() => {
    hasTypedRef.current = false;
  }, [dateStr]);

  useEffect(() => {
    if (!hasTypedRef.current) return;

    if (araTimeoutRef.current) clearTimeout(araTimeoutRef.current);

    if (!diaryContent.trim()) {
      setAraText('tugas ngodingnya jangan lupa disentuh dikit ya hari ini 💖');
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
        if (!response.ok) throw new Error(`API returned status ${response.status}`);
        const data = await response.json();
        setAraText(data.reply || 'aku dengerin kok...');
      } catch (error) {
        console.error(error);
        setAraText('koneksiku lagi agak penuh... coba kirim ulang pelan-pelan yaa.');
      } finally {
        setIsAraTyping(false);
      }
    }, 2000);

    return () => { if (araTimeoutRef.current) clearTimeout(araTimeoutRef.current); };
  }, [diaryContent]);

  useEffect(() => {
    if (hydrated && diaryContent.trim() && dateContext === 'past') {
      setAraText(ARA_DIARY_PAST[Math.floor(Math.random() * ARA_DIARY_PAST.length)]);
    }
  }, [hydrated, dateStr]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleDiaryChange = (text: string) => {
    setDiary(dateStr, text);
    hasTypedRef.current = true;
  };
  const handleAddExpense = () => {
    if (!expLabel.trim()) return;
    addExpense(dateStr, expLabel, parseFloat(expAmount) || 0);
    setExpLabel(''); setExpAmount('');
  };

  const timerDisplay = `${String(Math.floor(timerSeconds / 60)).padStart(2, '0')}:${String(timerSeconds % 60).padStart(2, '0')}`;
  const dateDisplay = isValidDate ? format(parsedDate, 'd MMMM yyyy', { locale: language === 'id' ? localeID : undefined }) : dateStr;
  const dayName = isValidDate ? format(parsedDate, 'EEEE', { locale: language === 'id' ? localeID : undefined }) : '';

  if (!mounted) return null;
  if (!isValidDate) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <p className="text-equil-onyx/30 font-mono text-sm">tanggal tidak valid.</p>
    </div>
  );
  if (!hydrated) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <span className="text-[10px] font-mono tracking-[0.3em] text-equil-onyx/20 uppercase">LOADING...</span>
    </div>
  );

  return (
    <div className="pb-24">
      {/* ── HEADER ── */}
      <header className="mb-10 md:mb-16">
        <button
          onClick={() => router.push('/dashboard')}
          className="inline-flex items-center gap-2 text-equil-onyx/30 hover:text-equil-mint transition-colors group mb-8"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform duration-200" />
          <span className="text-[10px] font-mono tracking-[0.25em] uppercase font-bold">
            {language === 'id' ? 'Kembali ke Dashboard' : 'Back to Dashboard'}
          </span>
        </button>

        {/* Two-tone editorial date header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 flex-wrap">
          <div>
            {dateContext !== 'present' && (
              <span className={`text-[8px] font-mono tracking-[0.35em] uppercase mb-3 block ${
                dateContext === 'past' ? 'text-equil-forest/25' : 'text-equil-mint/40'
              }`}>
                {dateContext === 'past'
                  ? (language === 'id' ? '◌ CATATAN MASA LALU' : '◌ PAST ENTRY')
                  : (language === 'id' ? '◌ RENCANA MASA DEPAN' : '◌ FUTURE PLAN')}
              </span>
            )}
            <h1 className="text-5xl md:text-7xl font-black tracking-tight text-equil-onyx leading-[0.85]">
              {dateDisplay}
            </h1>
            <span className="font-serif italic text-equil-mint/60 mt-2 block capitalize text-lg">
              {dayName}
            </span>
          </div>

          {/* Mood selector */}
          <div className="flex items-center gap-2 flex-wrap">
            {MOOD_EMOJIS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => setMood(dateStr, emoji)}
                className={`w-11 h-11 rounded-2xl text-xl flex items-center justify-center transition-all duration-300 ${
                  moodEmoji === emoji
                    ? 'bg-equil-mint/10 ring-2 ring-equil-mint/30 scale-110'
                    : 'hover:bg-equil-sage/40 hover:scale-105'
                }`}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>

        {/* Archive divider */}
        <div className="mt-8 flex items-center gap-4">
          <div className="h-px w-16 bg-equil-onyx/10" />
          <span className="text-[8px] font-mono tracking-[0.35em] text-equil-onyx/20 uppercase">
            {language === 'id' ? 'SANCTUARY ARCHIVE' : 'SANCTUARY ARCHIVE'}
          </span>
          <div className="h-px flex-1 bg-equil-onyx/5" />
        </div>
      </header>

      {/* ── CSS GRID: 12-col editorial layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">

        {/* LEFT COLUMN — Tasks, Expense, Timer (cols 1-4) */}
        <aside className="lg:col-span-4 space-y-10">
          {/* Tasks */}
          <div>
            <span className="text-[10px] font-mono tracking-widest uppercase text-gray-500 block mb-4">
              {language === 'id' ? 'DAFTAR TUGAS' : 'TASK LIST'}
            </span>
            <DailyLogList
              tasks={tasks}
              onAdd={(text, deadline) => addTask(dateStr, text, deadline)}
              onToggle={toggleTask}
              onUpdate={updateTask}
              onDelete={deleteTask}
              onSetDeadline={setTaskDeadline}
              language={language}
            />
          </div>

          {/* Quick Expense */}
          <div>
            <span className="text-[10px] font-mono tracking-widest uppercase text-gray-500 block mb-4">
              {language === 'id' ? 'CATAT PENGELUARAN' : 'QUICK EXPENSE'}
            </span>
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={expLabel}
                onChange={(e) => setExpLabel(e.target.value)}
                placeholder={language === 'id' ? 'apa yang kamu beli...' : 'what did you buy...'}
                className="flex-1 bg-transparent text-sm text-equil-onyx placeholder:text-equil-onyx/20 outline-none border-b-2 border-gray-200 focus:border-equil-mint pb-1.5 transition-colors font-sans"
              />
              <input
                type="number"
                value={expAmount}
                onChange={(e) => setExpAmount(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddExpense()}
                placeholder="Rp"
                className="w-24 bg-transparent text-sm text-equil-onyx text-right placeholder:text-equil-onyx/20 outline-none border-b-2 border-gray-200 focus:border-equil-mint pb-1.5 transition-colors font-mono"
              />
            </div>
            {expenses.length > 0 && (
              <div className="mt-4 flex flex-col gap-1.5">
                {expenses.map((exp) => (
                  <div key={exp.id} className="flex items-center justify-between text-xs text-equil-onyx/35 group/exp py-0.5">
                    <span className="truncate font-sans">{exp.label}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono shrink-0">Rp {exp.amount.toLocaleString('id-ID')}</span>
                      <button
                        onClick={() => deleteExpense(exp.id)}
                        className="transition-all duration-200 p-0.5 rounded hover:bg-equil-coral/10 text-equil-onyx/20 hover:text-equil-coral shrink-0"
                        title={language === 'id' ? 'Hapus pengeluaran' : 'Delete expense'}
                      >
                        <X size={12} />
                      </button>
                    </div>
                  </div>
                ))}
                <div className="mt-1 pt-1 border-t border-equil-onyx/5 flex justify-between text-[9px] font-mono text-equil-onyx/25">
                  <span>TOTAL</span>
                  <span>Rp {expenses.reduce((s, e) => s + e.amount, 0).toLocaleString('id-ID')}</span>
                </div>
              </div>
            )}
          </div>

          {/* Focus Timer */}
          <div>
            <span className="text-[10px] font-mono tracking-widest uppercase text-gray-500 block mb-4">
              {language === 'id' ? 'SESI FOKUS' : 'FOCUS SESSION'}
            </span>
            <AnimatePresence mode="wait">
              {!timerActive && timerSeconds === 25 * 60 ? (
                <motion.button
                  key="start"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setTimerActive(true)}
                  className="text-sm text-equil-onyx/30 hover:text-equil-mint font-sans font-medium tracking-wide transition-colors"
                >
                  {language === 'id' ? '▶ Mulai Sesi Fokus' : '▶ Start Focus Session'}
                </motion.button>
              ) : (
                <motion.div
                  key="timer"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col gap-4"
                >
                  <span className="text-6xl font-black text-equil-onyx tracking-tighter tabular-nums leading-none">
                    {timerDisplay}
                  </span>
                  <div className="flex gap-4">
                    <button
                      onClick={() => setTimerActive(!timerActive)}
                      className="text-[10px] font-mono font-bold tracking-[0.2em] uppercase text-equil-mint hover:text-equil-forest transition-colors"
                    >
                      {timerActive
                        ? (language === 'id' ? 'JEDA' : 'PAUSE')
                        : (language === 'id' ? 'LANJUT' : 'RESUME')}
                    </button>
                    <button
                      onClick={() => { setTimerActive(false); setTimerSeconds(25 * 60); }}
                      className="text-[10px] font-mono font-bold tracking-[0.2em] uppercase text-equil-onyx/20 hover:text-equil-coral transition-colors"
                    >
                      RESET
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </aside>

        {/* RIGHT COLUMN — Brain Dump + Diary (cols 5-12) */}
        <main className="lg:col-span-8 space-y-10">

          {/* Brain Dump Section */}
          <div className="border-b border-equil-onyx/5 pb-8">
            <span className="text-[10px] font-mono tracking-widest uppercase text-gray-500 block mb-4">
              BRAIN DUMP
            </span>
            <textarea
              value={brainDumpContent}
              onChange={(e) => setBrainDump(dateStr, e.target.value)}
              placeholder={language === 'id' ? '// catat logic, ide, debug notes...' : '// logic, ideas, debug notes...'}
              className="w-full min-h-[120px] bg-transparent text-sm font-mono text-equil-onyx/60 placeholder:text-equil-onyx/15 outline-none resize-y border-b-2 border-gray-200 focus:border-equil-mint pb-4 transition-colors leading-relaxed p-2"
            />
          </div>

          {/* Sanctuary Diary — main editorial section */}
          <div>
            <div className="flex items-baseline gap-4 mb-6">
              <span className="text-[10px] font-mono tracking-widest uppercase text-gray-500">
                SANCTUARY DIARY
              </span>
              <span className="font-serif italic text-equil-mint/50 text-sm">
                {dateContext === 'past'
                  ? (language === 'id' ? '— kenangan' : '— memories')
                  : dateContext === 'future'
                  ? (language === 'id' ? '— rencana' : '— intentions')
                  : (language === 'id' ? '— hari ini' : '— today')}
              </span>
            </div>
            <textarea
              value={diaryContent}
              onChange={(e) => handleDiaryChange(e.target.value)}
              placeholder={
                language === 'id'
                  ? 'tumpahkan isi kepalamu di sini, tidak ada yang menghakimi...'
                  : 'pour your thoughts here, no one is judging...'
              }
              className="w-full min-h-[300px] bg-transparent text-[1.05rem] font-sans text-gray-700 placeholder:text-equil-onyx/10 outline-none resize-y border-b-2 border-gray-200 focus:border-emerald-700 transition-colors leading-[1.85] tracking-wide p-2"
            />
          </div>

          {/* Ara's Whisper */}
          <div className="pt-6 border-t border-equil-forest/[0.06]">
            <span className="text-[10px] font-mono tracking-widest uppercase text-gray-500 block mb-3">
              ARA&apos;S WHISPER
            </span>
            <div className="min-h-[36px] pl-2 border-l-2 border-equil-mint/20">
              <AnimatePresence mode="wait">
                {isAraTyping ? (
                  <motion.div
                    key="typing"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex gap-1 items-center h-6"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-equil-mint/40 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-equil-mint/40 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-equil-mint/40 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </motion.div>
                ) : araText ? (
                  <motion.p
                    key={araText}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="text-sm italic text-equil-forest/40 leading-relaxed lowercase font-serif"
                  >
                    {araText}
                  </motion.p>
                ) : (
                  <motion.p
                    key="idle"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-sm italic text-equil-forest/20 font-serif"
                  >
                    {language === 'id'
                      ? 'ara menunggu... tulis sesuatu di diary untuk membangunkannya.'
                      : 'ara is waiting... write something in your diary to wake her.'}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
