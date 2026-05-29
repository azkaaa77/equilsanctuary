// components/providers/sanctuary-day-provider.tsx
// Context API for the Daily Sanctuary system.
// Lifts per-day task/mood/expense data to dashboard level.
// Both SanctuaryDrawer and InteractiveCalendar read/write from this context.

'use client';

import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { format } from 'date-fns';

// ── TYPES ───────────────────────────────────────────────────
export interface DayTask {
  id: string;
  title: string;
  done: boolean;
}

export interface DayExpense {
  id: string;
  label: string;
  amount: number;
}

export interface DayData {
  tasks: DayTask[];
  mood: string | null;           // Emoji string or null
  brainDump: string;
  diary: string;
  expenses: DayExpense[];
}

/** Computed dot status for the calendar: 'mint' | 'coral' | 'none' */
export type DotStatus = 'mint' | 'coral' | 'none';

// ── DEFAULT DATA GENERATOR ──────────────────────────────────
const y = new Date().getFullYear();
const m = new Date().getMonth();

function createDefaultDayStore(): Map<string, DayData> {
  const store = new Map<string, DayData>();

  // Pre-populate some days with mock data
  const mockDays: Array<{ day: number; tasks: Array<{ title: string; done: boolean }> }> = [
    { day: 2,  tasks: [{ title: 'Morning Journaling', done: true }] },
    { day: 5,  tasks: [{ title: 'UI Review Sprint', done: true }, { title: 'Fix sidebar bugs', done: true }] },
    { day: 7,  tasks: [{ title: 'Meditation 30 min', done: true }] },
    { day: 9,  tasks: [{ title: 'Budget Tracking', done: true }, { title: 'Update spreadsheet', done: true }] },
    { day: 12, tasks: [{ title: 'Career Plan Update', done: false }, { title: 'Review portfolio', done: false }] },
    { day: 14, tasks: [{ title: 'Project Milestone Alpha', done: false }, { title: 'Submit PR', done: false }] },
    { day: 16, tasks: [{ title: 'Evening Reflection', done: true }] },
    { day: 18, tasks: [{ title: 'Financial Health Check', done: false }, { title: 'Track subscriptions', done: true }] },
    { day: 21, tasks: [{ title: 'Sprint Close', done: false }] },
    { day: 23, tasks: [{ title: 'Gratitude Journaling', done: true }] },
    { day: 25, tasks: [{ title: 'Cert Exam Prep', done: false }, { title: 'Practice questions', done: false }] },
    { day: 28, tasks: [{ title: 'Monthly Reflection Day', done: false }] },
  ];

  mockDays.forEach(({ day, tasks }) => {
    const key = format(new Date(y, m, day), 'yyyy-MM-dd');
    store.set(key, {
      tasks: tasks.map((t, i) => ({ id: `${key}-${i}`, title: t.title, done: t.done })),
      mood: null,
      brainDump: '',
      diary: '',
      expenses: [],
    });
  });

  return store;
}

// ── CONTEXT TYPE ────────────────────────────────────────────
interface SanctuaryDayContextType {
  /** Currently selected date key (yyyy-MM-dd) for the drawer */
  selectedDateKey: string | null;
  /** Open drawer for a specific date */
  openDrawer: (date: Date) => void;
  /** Close drawer */
  closeDrawer: () => void;
  /** Get data for a specific day */
  getDayData: (dateKey: string) => DayData;
  /** Get computed dot status for a day */
  getDotStatus: (dateKey: string) => DotStatus;
  /** Toggle a task's done state */
  toggleTask: (dateKey: string, taskId: string) => void;
  /** Add a new task */
  addTask: (dateKey: string, title: string) => void;
  /** Set mood for a day */
  setMood: (dateKey: string, emoji: string) => void;
  /** Update brain dump text */
  setBrainDump: (dateKey: string, text: string) => void;
  /** Update diary text */
  setDiary: (dateKey: string, text: string) => void;
  /** Add an expense */
  addExpense: (dateKey: string, label: string, amount: number) => void;
}

const SanctuaryDayContext = createContext<SanctuaryDayContextType | undefined>(undefined);

// ── PROVIDER ────────────────────────────────────────────────
export function SanctuaryDayProvider({ children }: { children: React.ReactNode }) {
  const [dayStore, setDayStore] = useState<Map<string, DayData>>(() => createDefaultDayStore());
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null);

  // Ensure a day entry exists, return it
  const ensureDay = useCallback((dateKey: string): DayData => {
    const existing = dayStore.get(dateKey);
    if (existing) return existing;
    const blank: DayData = {
      tasks: [],
      mood: null,
      brainDump: '',
      diary: '',
      expenses: [],
    };
    setDayStore(prev => {
      const next = new Map(prev);
      next.set(dateKey, blank);
      return next;
    });
    return blank;
  }, [dayStore]);

  const getDayData = useCallback((dateKey: string): DayData => {
    return dayStore.get(dateKey) || { tasks: [], mood: null, brainDump: '', diary: '', expenses: [] };
  }, [dayStore]);

  const getDotStatus = useCallback((dateKey: string): DotStatus => {
    const data = dayStore.get(dateKey);
    if (!data || data.tasks.length === 0) return 'none';
    const allDone = data.tasks.every(t => t.done);
    return allDone ? 'mint' : 'coral';
  }, [dayStore]);

  const openDrawer = useCallback((date: Date) => {
    const key = format(date, 'yyyy-MM-dd');
    ensureDay(key);
    setSelectedDateKey(key);
  }, [ensureDay]);

  const closeDrawer = useCallback(() => {
    setSelectedDateKey(null);
  }, []);

  const updateDay = useCallback((dateKey: string, updater: (prev: DayData) => DayData) => {
    setDayStore(prev => {
      const next = new Map(prev);
      const current = next.get(dateKey) || { tasks: [], mood: null, brainDump: '', diary: '', expenses: [] };
      next.set(dateKey, updater(current));
      return next;
    });
  }, []);

  const toggleTask = useCallback((dateKey: string, taskId: string) => {
    updateDay(dateKey, prev => ({
      ...prev,
      tasks: prev.tasks.map(t => t.id === taskId ? { ...t, done: !t.done } : t),
    }));
  }, [updateDay]);

  const addTask = useCallback((dateKey: string, title: string) => {
    if (!title.trim()) return;
    updateDay(dateKey, prev => ({
      ...prev,
      tasks: [...prev.tasks, { id: `${dateKey}-${Date.now()}`, title: title.trim(), done: false }],
    }));
  }, [updateDay]);

  const setMood = useCallback((dateKey: string, emoji: string) => {
    updateDay(dateKey, prev => ({
      ...prev,
      mood: prev.mood === emoji ? null : emoji, // Toggle
    }));
  }, [updateDay]);

  const setBrainDump = useCallback((dateKey: string, text: string) => {
    updateDay(dateKey, prev => ({ ...prev, brainDump: text }));
  }, [updateDay]);

  const setDiary = useCallback((dateKey: string, text: string) => {
    updateDay(dateKey, prev => ({ ...prev, diary: text }));
  }, [updateDay]);

  const addExpense = useCallback((dateKey: string, label: string, amount: number) => {
    if (!label.trim()) return;
    updateDay(dateKey, prev => ({
      ...prev,
      expenses: [...prev.expenses, { id: `exp-${Date.now()}`, label: label.trim(), amount }],
    }));
  }, [updateDay]);

  const value = useMemo(() => ({
    selectedDateKey,
    openDrawer,
    closeDrawer,
    getDayData,
    getDotStatus,
    toggleTask,
    addTask,
    setMood,
    setBrainDump,
    setDiary,
    addExpense,
  }), [selectedDateKey, openDrawer, closeDrawer, getDayData, getDotStatus, toggleTask, addTask, setMood, setBrainDump, setDiary, addExpense]);

  return (
    <SanctuaryDayContext.Provider value={value}>
      {children}
    </SanctuaryDayContext.Provider>
  );
}

// ── HOOK ────────────────────────────────────────────────────
export function useSanctuaryDay() {
  const context = useContext(SanctuaryDayContext);
  if (!context) throw new Error('useSanctuaryDay must be used within SanctuaryDayProvider');
  return context;
}
