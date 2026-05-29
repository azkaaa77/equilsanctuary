// hooks/use-daily-log.ts
// Custom hook for per-date data persistence via localStorage.
// Key structure: "equil-diary-{YYYY-MM-DD}" → JSON
// Returns reactive state that auto-saves on every mutation.

'use client';

import { useState, useEffect, useCallback } from 'react';

// ── TYPES ───────────────────────────────────────────────────
export interface DayTask {
  id: string;
  title: string;
  done: boolean;
}

export interface DayExpense {
  label: string;
  amount: number;
}

export interface DailyLogData {
  tasks: DayTask[];
  mood: string | null;
  brainDump: string;
  diary: string;
  expenses: DayExpense[];
}

const STORAGE_PREFIX = 'equil-diary-';

function getStorageKey(dateKey: string): string {
  return `${STORAGE_PREFIX}${dateKey}`;
}

function loadFromStorage(dateKey: string): DailyLogData {
  if (typeof window === 'undefined') return createBlank();
  try {
    const raw = localStorage.getItem(getStorageKey(dateKey));
    if (!raw) return createBlank();
    return JSON.parse(raw) as DailyLogData;
  } catch {
    return createBlank();
  }
}

function saveToStorage(dateKey: string, data: DailyLogData): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(getStorageKey(dateKey), JSON.stringify(data));
  } catch {
    // localStorage full or unavailable — silently fail
  }
}

function createBlank(): DailyLogData {
  return {
    tasks: [],
    mood: null,
    brainDump: '',
    diary: '',
    expenses: [],
  };
}

// ── HOOK ────────────────────────────────────────────────────
export function useDailyLog(dateKey: string) {
  const [data, setData] = useState<DailyLogData>(() => loadFromStorage(dateKey));
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from localStorage on mount / date change
  useEffect(() => {
    const loaded = loadFromStorage(dateKey);
    setData(loaded);
    setHydrated(true);
  }, [dateKey]);

  // Auto-save on every data change (after hydration)
  useEffect(() => {
    if (!hydrated) return;
    saveToStorage(dateKey, data);
  }, [data, dateKey, hydrated]);

  // ── Task CRUD ──
  const addTask = useCallback((title: string) => {
    if (!title.trim()) return;
    setData(prev => ({
      ...prev,
      tasks: [...prev.tasks, { id: `t-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, title: title.trim(), done: false }],
    }));
  }, []);

  const toggleTask = useCallback((taskId: string) => {
    setData(prev => ({
      ...prev,
      tasks: prev.tasks.map(t => t.id === taskId ? { ...t, done: !t.done } : t),
    }));
  }, []);

  const updateTask = useCallback((taskId: string, newTitle: string) => {
    if (!newTitle.trim()) return;
    setData(prev => ({
      ...prev,
      tasks: prev.tasks.map(t => t.id === taskId ? { ...t, title: newTitle.trim() } : t),
    }));
  }, []);

  const deleteTask = useCallback((taskId: string) => {
    setData(prev => ({
      ...prev,
      tasks: prev.tasks.filter(t => t.id !== taskId),
    }));
  }, []);

  // ── Mood ──
  const setMood = useCallback((emoji: string) => {
    setData(prev => ({ ...prev, mood: prev.mood === emoji ? null : emoji }));
  }, []);

  // ── Text fields ──
  const setBrainDump = useCallback((text: string) => {
    setData(prev => ({ ...prev, brainDump: text }));
  }, []);

  const setDiary = useCallback((text: string) => {
    setData(prev => ({ ...prev, diary: text }));
  }, []);

  // ── Expenses ──
  const addExpense = useCallback((label: string, amount: number) => {
    if (!label.trim()) return;
    setData(prev => ({
      ...prev,
      expenses: [...prev.expenses, { label: label.trim(), amount }],
    }));
  }, []);

  return {
    data,
    hydrated,
    addTask,
    toggleTask,
    updateTask,
    deleteTask,
    setMood,
    setBrainDump,
    setDiary,
    addExpense,
  };
}
