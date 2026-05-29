// components/dashboard/SanctuaryDrawer.tsx
// Premium slide-over drawer from the right side.
// Glassmorphism overlay + spring-animated panel.
// All 5 sections will be built incrementally in subsequent steps.

'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { format, parseISO } from 'date-fns';
import { id as localeID } from 'date-fns/locale';
import { useSanctuaryDay } from '@/components/providers/sanctuary-day-provider';
import { useLanguage } from '@/components/providers/language-provider';

// ── MOOD EMOJIS ─────────────────────────────────────────────
const MOOD_EMOJIS = ['🫠', '✨', '😪', '💖', '🚀'];

// ── ARA RESPONSES ───────────────────────────────────────────
const ARA_IDLE_RESPONSES = [
  'tugas ngodingnya jangan lupa disentuh dikit ya hari ini 💖',
  'kalau belum sempat, catat aja dulu. nanti bisa dilanjutin.',
  'hari ini ada yang mau kamu selesaikan? tulis di sini aja.',
  'jangan lupa minum air putih, azka.',
];

const ARA_DIARY_RESPONSES = [
  'gapapa istirahat dulu aja, error laravelnya ga bakal lari kemana-mana kok 💖',
  'kamu udah nulis, itu langkah pertama yang bagus ✨',
  'perasaan itu valid. ga perlu dicari alasannya sekarang.',
  'makasih udah cerita. aku dengerin.',
  'kadang nulis itu lebih menyembuhkan dari ngoding 12 jam.',
];

export default function SanctuaryDrawer() {
  const { selectedDateKey, closeDrawer, getDayData, toggleTask, addTask, setMood, setBrainDump, setDiary, addExpense } = useSanctuaryDay();
  const { language } = useLanguage();
  const isOpen = selectedDateKey !== null;

  // ── Day data ──
  const dayData = selectedDateKey ? getDayData(selectedDateKey) : null;

  // ── New task input ──
  const [newTaskText, setNewTaskText] = useState('');
  const taskInputRef = useRef<HTMLInputElement>(null);

  // ── Quick expense ──
  const [expenseLabel, setExpenseLabel] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');

  // ── Focus timer ──
  const [timerActive, setTimerActive] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(25 * 60);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Ara's Whisper ──
  const [araText, setAraText] = useState('');
  const [isAraTyping, setIsAraTyping] = useState(false);
  const araTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Reset state when drawer opens for a new date ──
  useEffect(() => {
    if (isOpen) {
      setNewTaskText('');
      setExpenseLabel('');
      setExpenseAmount('');
      setTimerActive(false);
      setTimerSeconds(25 * 60);
      setAraText('');
      setIsAraTyping(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  }, [selectedDateKey, isOpen]);

  // ── Focus timer logic ──
  useEffect(() => {
    if (timerActive && timerSeconds > 0) {
      timerRef.current = setInterval(() => {
        setTimerSeconds(prev => {
          if (prev <= 1) {
            setTimerActive(false);
            if (timerRef.current) clearInterval(timerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timerActive]);

  // ── Ara's Whisper debounce logic ──
  const triggerAra = useCallback((diaryText: string) => {
    if (araTimeoutRef.current) clearTimeout(araTimeoutRef.current);

    araTimeoutRef.current = setTimeout(() => {
      setIsAraTyping(true);
      // Simulate typing delay
      setTimeout(() => {
        setIsAraTyping(false);
        if (diaryText.trim()) {
          const idx = Math.floor(Math.random() * ARA_DIARY_RESPONSES.length);
          setAraText(ARA_DIARY_RESPONSES[idx]);
        } else {
          const idx = Math.floor(Math.random() * ARA_IDLE_RESPONSES.length);
          setAraText(ARA_IDLE_RESPONSES[idx]);
        }
      }, 1500);
    }, 2000); // 2s debounce
  }, []);

  // ── Handlers ──
  const handleAddTask = () => {
    if (!selectedDateKey || !newTaskText.trim()) return;
    addTask(selectedDateKey, newTaskText);
    setNewTaskText('');
    taskInputRef.current?.focus();
  };

  const handleAddExpense = () => {
    if (!selectedDateKey || !expenseLabel.trim()) return;
    addExpense(selectedDateKey, expenseLabel, parseFloat(expenseAmount) || 0);
    setExpenseLabel('');
    setExpenseAmount('');
  };

  const handleDiaryChange = (text: string) => {
    if (!selectedDateKey) return;
    setDiary(selectedDateKey, text);
    triggerAra(text);
  };

  // ── Timer display ──
  const timerMinutes = Math.floor(timerSeconds / 60);
  const timerSecs = timerSeconds % 60;
  const timerDisplay = `${String(timerMinutes).padStart(2, '0')}:${String(timerSecs).padStart(2, '0')}`;

  // ── Date display ──
  const dateDisplay = selectedDateKey
    ? format(parseISO(selectedDateKey), 'd MMMM yyyy', { locale: language === 'id' ? localeID : undefined })
    : '';
  const dayName = selectedDateKey
    ? format(parseISO(selectedDateKey), 'EEEE', { locale: language === 'id' ? localeID : undefined })
    : '';

  // ── Close on Escape ──
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeDrawer();
    };
    if (isOpen) window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, closeDrawer]);

  return (
    <AnimatePresence>
      {isOpen && dayData && (
        <>
          {/* ── OVERLAY ── */}
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 bg-equil-onyx/10 backdrop-blur-sm"
            onClick={closeDrawer}
          />

          {/* ── DRAWER PANEL ── */}
          <motion.aside
            key="drawer"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed top-0 right-0 h-screen w-full md:w-[600px] z-[60] bg-equil-paper shadow-[-20px_0_60px_-15px_rgba(0,0,0,0.08)] overflow-y-auto"
          >
            <div className="flex flex-col gap-10 px-8 md:px-12 py-10">

              {/* ═══ 1. HEADER & MOOD TRACKER ═══ */}
              <div>
                {/* Close button */}
                <div className="flex items-start justify-between mb-8">
                  <div>
                    <span className="text-[9px] font-mono tracking-[0.3em] text-equil-onyx/25 uppercase block mb-1">
                      DAILY SANCTUARY
                    </span>
                    <h2 className="text-4xl md:text-5xl font-display font-black tracking-tightest text-equil-onyx leading-[0.9]">
                      {dateDisplay}
                    </h2>
                    <span className="text-sm font-display italic text-equil-mint/60 mt-1 block capitalize">
                      {dayName}
                    </span>
                  </div>
                  <button
                    onClick={closeDrawer}
                    className="w-10 h-10 rounded-full border border-equil-onyx/[0.06] flex items-center justify-center hover:bg-equil-sage/50 transition-all group shrink-0 mt-1"
                    aria-label="Close drawer"
                  >
                    <span className="text-equil-onyx/30 group-hover:text-equil-onyx transition-colors text-lg leading-none">×</span>
                  </button>
                </div>

                {/* Mood tracker */}
                <div>
                  <span className="text-[8px] font-mono tracking-[0.3em] text-equil-onyx/20 uppercase block mb-3">
                    {language === 'id' ? 'BAGAIMANA PERASAANMU?' : 'HOW ARE YOU FEELING?'}
                  </span>
                  <div className="flex items-center gap-3">
                    {MOOD_EMOJIS.map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => selectedDateKey && setMood(selectedDateKey, emoji)}
                        className={`w-12 h-12 rounded-2xl text-2xl flex items-center justify-center transition-all duration-300 ${
                          dayData.mood === emoji
                            ? 'bg-equil-mint/10 ring-2 ring-equil-mint/30 shadow-[0_0_20px_rgba(45,106,79,0.15)] scale-110'
                            : 'bg-equil-sage/30 hover:bg-equil-sage/60 hover:scale-105'
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="w-full h-px bg-equil-onyx/[0.05]" />

              {/* ═══ 2. UNIFIED DAILY LOG ═══ */}
              <div>
                <span className="text-[8px] font-mono tracking-[0.3em] text-equil-onyx/20 uppercase block mb-4">
                  {language === 'id' ? 'LOG HARIAN' : 'DAILY LOG'}
                </span>

                {/* Task list */}
                <div className="flex flex-col gap-2 mb-4">
                  {dayData.tasks.map((task) => (
                    <label
                      key={task.id}
                      className="flex items-center gap-3 group cursor-pointer py-1.5"
                    >
                      {/* Custom Mint checkbox */}
                      <button
                        onClick={() => selectedDateKey && toggleTask(selectedDateKey, task.id)}
                        className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all duration-300 ${
                          task.done
                            ? 'bg-equil-mint border-equil-mint'
                            : 'border-equil-onyx/15 hover:border-equil-mint/50 group-hover:border-equil-mint/40'
                        }`}
                      >
                        {task.done && (
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                            <path d="M2.5 6L5 8.5L9.5 3.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </button>
                      <span className={`text-sm font-sans transition-all ${
                        task.done
                          ? 'text-equil-onyx/30 line-through'
                          : 'text-equil-onyx/70 group-hover:text-equil-onyx'
                      }`}>
                        {task.title}
                      </span>
                    </label>
                  ))}

                  {dayData.tasks.length === 0 && (
                    <p className="text-xs text-equil-onyx/20 italic py-2">
                      {language === 'id' ? 'belum ada tugas hari ini.' : 'no tasks for today.'}
                    </p>
                  )}
                </div>

                {/* New task input */}
                <div className="flex items-center gap-2 mb-6">
                  <span className="text-equil-onyx/15 text-lg">+</span>
                  <input
                    ref={taskInputRef}
                    type="text"
                    value={newTaskText}
                    onChange={(e) => setNewTaskText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
                    placeholder={language === 'id' ? 'tambah tugas baru...' : 'add new task...'}
                    className="flex-1 bg-transparent text-sm text-equil-onyx placeholder:text-equil-onyx/15 outline-none border-b border-equil-onyx/[0.05] pb-1 focus:border-equil-mint/30 transition-colors"
                  />
                </div>

                {/* Quick expense */}
                <div className="flex items-center gap-3 bg-equil-sage/20 rounded-xl px-4 py-3">
                  <span className="text-[9px] font-mono tracking-[0.2em] text-equil-onyx/25 uppercase shrink-0">IDR</span>
                  <input
                    type="text"
                    value={expenseLabel}
                    onChange={(e) => setExpenseLabel(e.target.value)}
                    placeholder={language === 'id' ? 'apa yang kamu beli...' : 'what did you buy...'}
                    className="flex-1 bg-transparent text-sm text-equil-onyx placeholder:text-equil-onyx/15 outline-none min-w-0"
                  />
                  <input
                    type="number"
                    value={expenseAmount}
                    onChange={(e) => setExpenseAmount(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddExpense()}
                    placeholder="0"
                    className="w-24 bg-transparent text-sm text-equil-onyx text-right placeholder:text-equil-onyx/15 outline-none font-mono"
                  />
                </div>

                {/* Expense list */}
                {dayData.expenses.length > 0 && (
                  <div className="mt-3 flex flex-col gap-1">
                    {dayData.expenses.map((exp) => (
                      <div key={exp.id} className="flex items-center justify-between text-xs text-equil-onyx/40">
                        <span>{exp.label}</span>
                        <span className="font-mono">Rp {exp.amount.toLocaleString('id-ID')}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Divider */}
              <div className="w-full h-px bg-equil-onyx/[0.05]" />

              {/* ═══ 3. FOCUS SESSION TRIGGER ═══ */}
              <div>
                <span className="text-[8px] font-mono tracking-[0.3em] text-equil-onyx/20 uppercase block mb-4">
                  {language === 'id' ? 'SESI FOKUS' : 'FOCUS SESSION'}
                </span>

                <AnimatePresence mode="wait">
                  {!timerActive && timerSeconds === 25 * 60 ? (
                    <motion.button
                      key="start-btn"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      onClick={() => setTimerActive(true)}
                      className="w-full py-4 rounded-2xl bg-equil-sage/40 hover:bg-equil-sage/70 text-equil-onyx/60 hover:text-equil-mint font-display font-bold text-sm tracking-wide transition-all duration-300"
                    >
                      {language === 'id' ? 'Mulai Sesi Fokus' : 'Start Focus Session'}
                    </motion.button>
                  ) : (
                    <motion.div
                      key="timer-ui"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="w-full py-8 rounded-2xl bg-equil-sage/30 flex flex-col items-center gap-4"
                    >
                      <span className="text-5xl md:text-6xl font-display font-black text-equil-onyx tracking-tightest tabular-nums">
                        {timerDisplay}
                      </span>
                      <div className="flex gap-3">
                        <button
                          onClick={() => setTimerActive(!timerActive)}
                          className="px-6 py-2 rounded-full bg-equil-mint text-white text-xs font-display font-bold tracking-widest uppercase hover:bg-equil-forest transition-colors"
                        >
                          {timerActive ? (language === 'id' ? 'JEDA' : 'PAUSE') : (language === 'id' ? 'LANJUT' : 'RESUME')}
                        </button>
                        <button
                          onClick={() => { setTimerActive(false); setTimerSeconds(25 * 60); }}
                          className="px-6 py-2 rounded-full border border-equil-onyx/10 text-equil-onyx/40 text-xs font-display font-bold tracking-widest uppercase hover:text-equil-coral hover:border-equil-coral/30 transition-colors"
                        >
                          RESET
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Divider */}
              <div className="w-full h-px bg-equil-onyx/[0.05]" />

              {/* ═══ 4. BRAIN DUMP & SANCTUARY DIARY ═══ */}
              <div className="flex flex-col gap-6">
                {/* Brain Dump */}
                <div>
                  <span className="text-[8px] font-mono tracking-[0.3em] text-equil-onyx/20 uppercase block mb-3">
                    BRAIN DUMP
                  </span>
                  <textarea
                    value={dayData.brainDump}
                    onChange={(e) => selectedDateKey && setBrainDump(selectedDateKey, e.target.value)}
                    placeholder={language === 'id' ? '// catat logic, ide, atau apapun yang ada di kepalamu...' : '// capture logic, ideas, anything on your mind...'}
                    className="w-full min-h-[100px] bg-equil-sage/20 rounded-2xl px-5 py-4 text-sm font-mono text-equil-onyx/70 placeholder:text-equil-onyx/15 outline-none resize-none focus:ring-1 focus:ring-equil-mint/20 transition-all"
                    style={{ fieldSizing: 'content' } as React.CSSProperties}
                  />
                </div>

                {/* Sanctuary Diary */}
                <div>
                  <span className="text-[8px] font-mono tracking-[0.3em] text-equil-onyx/20 uppercase block mb-3">
                    SANCTUARY DIARY
                  </span>
                  <textarea
                    value={dayData.diary}
                    onChange={(e) => handleDiaryChange(e.target.value)}
                    placeholder={language === 'id' ? 'tumpahkan isi kepalamu di sini, tidak ada yang menghakimi...' : 'pour your thoughts here, no one is judging...'}
                    className="w-full min-h-[120px] bg-equil-sage/20 rounded-2xl px-5 py-4 text-sm font-sans italic text-equil-onyx/60 placeholder:text-equil-onyx/12 placeholder:not-italic outline-none resize-none focus:ring-1 focus:ring-equil-mint/20 transition-all leading-relaxed"
                    style={{ fieldSizing: 'content' } as React.CSSProperties}
                  />
                </div>
              </div>

              {/* ═══ 5. ARA'S WHISPER ═══ */}
              <div className="pb-8">
                <span className="text-[8px] font-mono tracking-[0.3em] text-equil-forest/25 uppercase block mb-3">
                  ARA&apos;S WHISPER
                </span>
                <div className="min-h-[40px]">
                  <AnimatePresence mode="wait">
                    {isAraTyping ? (
                      <motion.p
                        key="ara-typing"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="text-sm italic text-equil-forest/40 tracking-wide"
                      >
                        <span className="inline-flex gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-equil-mint/40 animate-bounce" style={{ animationDelay: '0ms' }} />
                          <span className="w-1.5 h-1.5 rounded-full bg-equil-mint/40 animate-bounce" style={{ animationDelay: '150ms' }} />
                          <span className="w-1.5 h-1.5 rounded-full bg-equil-mint/40 animate-bounce" style={{ animationDelay: '300ms' }} />
                        </span>
                      </motion.p>
                    ) : araText ? (
                      <motion.p
                        key={`ara-${araText}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                        className="text-sm italic text-equil-forest/40 tracking-wide leading-relaxed lowercase"
                      >
                        {araText}
                      </motion.p>
                    ) : (
                      <motion.p
                        key="ara-default"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-sm italic text-equil-forest/20 tracking-wide"
                      >
                        {language === 'id'
                          ? 'ara menunggu... tulis sesuatu di diary untuk membangunkannya.'
                          : 'ara is waiting... write something in your diary to wake her up.'}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>
              </div>

            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
