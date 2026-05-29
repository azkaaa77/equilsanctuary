// store/useEquilStore.ts
// Global Zustand store with persist middleware for reliable data persistence.
// Stores tasks (with optional deadline), diaries, moods, expenses per date.

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ── TYPES ───────────────────────────────────────────────────
export interface Task {
  id: string;
  text: string;
  completed: boolean;
  deadline?: string;      // "YYYY-MM-DD" — shows as Coral dot on calendar
  dateCreated: string;    // "YYYY-MM-DD" — the day this task belongs to
}

export interface Diary {
  date: string;           // "YYYY-MM-DD"
  content: string;
}

export interface BrainDump {
  date: string;
  content: string;
}

export interface Expense {
  id: string;
  date: string;
  label: string;
  amount: number;
}

export interface MoodEntry {
  date: string;
  emoji: string;
}

// ── STORE STATE ─────────────────────────────────────────────
interface EquilState {
  tasks: Task[];
  diaries: Diary[];
  brainDumps: BrainDump[];
  expenses: Expense[];
  moods: MoodEntry[];

  // ── Task CRUD ──
  addTask: (dateCreated: string, text: string, deadline?: string) => void;
  toggleTask: (id: string) => void;
  updateTask: (id: string, text: string) => void;
  setTaskDeadline: (id: string, deadline: string | undefined) => void;
  deleteTask: (id: string) => void;
  getTasksForDate: (date: string) => Task[];
  getDeadlinesForDate: (date: string) => Task[];

  // ── Diary ──
  setDiary: (date: string, content: string) => void;
  getDiary: (date: string) => string;

  // ── Brain Dump ──
  setBrainDump: (date: string, content: string) => void;
  getBrainDump: (date: string) => string;

  // ── Expenses ──
  addExpense: (date: string, label: string, amount: number) => void;
  deleteExpense: (id: string) => void;
  getExpensesForDate: (date: string) => Expense[];

  // ── Mood ──
  setMood: (date: string, emoji: string) => void;
  getMood: (date: string) => string | null;

  // ── Calendar helpers ──
  /** Returns dates (YYYY-MM-DD) that have incomplete tasks created on that date */
  getDatesWithPendingTasks: () => Set<string>;
  /** Returns dates (YYYY-MM-DD) that have all tasks completed */
  getDatesWithCompletedTasks: () => Set<string>;
  /** Returns dates (YYYY-MM-DD) that have deadlines falling on them */
  getDatesWithDeadlines: () => Set<string>;
}

// ── STORE ────────────────────────────────────────────────────
export const useEquilStore = create<EquilState>()(
  persist(
    (set, get) => ({
      tasks: [],
      diaries: [],
      brainDumps: [],
      expenses: [],
      moods: [],

      // ── Task CRUD ──
      addTask: (dateCreated, text, deadline) => {
        if (!text.trim()) return;
        set(state => ({
          tasks: [
            ...state.tasks,
            {
              id: `t-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
              text: text.trim(),
              completed: false,
              deadline,
              dateCreated,
            },
          ],
        }));
      },

      toggleTask: (id) => {
        set(state => ({
          tasks: state.tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t),
        }));
      },

      updateTask: (id, text) => {
        if (!text.trim()) return;
        set(state => ({
          tasks: state.tasks.map(t => t.id === id ? { ...t, text: text.trim() } : t),
        }));
      },

      setTaskDeadline: (id, deadline) => {
        set(state => ({
          tasks: state.tasks.map(t => t.id === id ? { ...t, deadline } : t),
        }));
      },

      deleteTask: (id) => {
        set(state => ({
          tasks: state.tasks.filter(t => t.id !== id),
        }));
      },

      getTasksForDate: (date) => {
        return get().tasks.filter(t => t.dateCreated === date);
      },

      getDeadlinesForDate: (date) => {
        return get().tasks.filter(t => t.deadline === date && !t.completed);
      },

      // ── Diary ──
      setDiary: (date, content) => {
        set(state => {
          const existing = state.diaries.findIndex(d => d.date === date);
          if (existing >= 0) {
            const updated = [...state.diaries];
            updated[existing] = { date, content };
            return { diaries: updated };
          }
          return { diaries: [...state.diaries, { date, content }] };
        });
      },

      getDiary: (date) => {
        return get().diaries.find(d => d.date === date)?.content || '';
      },

      // ── Brain Dump ──
      setBrainDump: (date, content) => {
        set(state => {
          const existing = state.brainDumps.findIndex(d => d.date === date);
          if (existing >= 0) {
            const updated = [...state.brainDumps];
            updated[existing] = { date, content };
            return { brainDumps: updated };
          }
          return { brainDumps: [...state.brainDumps, { date, content }] };
        });
      },

      getBrainDump: (date) => {
        return get().brainDumps.find(d => d.date === date)?.content || '';
      },

      // ── Expenses ──
      addExpense: (date, label, amount) => {
        if (!label.trim()) return;
        set(state => ({
          expenses: [
            ...state.expenses,
            { id: `exp-${Date.now()}`, date, label: label.trim(), amount },
          ],
        }));
      },

      getExpensesForDate: (date) => {
        return get().expenses.filter(e => e.date === date);
      },

      deleteExpense: (id) => {
        set(state => ({
          expenses: state.expenses.filter(e => e.id !== id),
        }));
      },

      // ── Mood ──
      setMood: (date, emoji) => {
        set(state => {
          const existing = state.moods.findIndex(m => m.date === date);
          // Toggle: if same emoji, remove
          if (existing >= 0 && state.moods[existing].emoji === emoji) {
            return { moods: state.moods.filter(m => m.date !== date) };
          }
          if (existing >= 0) {
            const updated = [...state.moods];
            updated[existing] = { date, emoji };
            return { moods: updated };
          }
          return { moods: [...state.moods, { date, emoji }] };
        });
      },

      getMood: (date) => {
        return get().moods.find(m => m.date === date)?.emoji || null;
      },

      // ── Calendar helpers ──
      getDatesWithPendingTasks: () => {
        const dates = new Set<string>();
        get().tasks.forEach(t => {
          if (!t.completed) dates.add(t.dateCreated);
        });
        return dates;
      },

      getDatesWithCompletedTasks: () => {
        const tasksByDate = new Map<string, Task[]>();
        get().tasks.forEach(t => {
          const arr = tasksByDate.get(t.dateCreated) || [];
          arr.push(t);
          tasksByDate.set(t.dateCreated, arr);
        });
        const dates = new Set<string>();
        tasksByDate.forEach((tasks, date) => {
          if (tasks.length > 0 && tasks.every(t => t.completed)) {
            dates.add(date);
          }
        });
        return dates;
      },

      getDatesWithDeadlines: () => {
        const dates = new Set<string>();
        get().tasks.forEach(t => {
          if (t.deadline && !t.completed) dates.add(t.deadline);
        });
        return dates;
      },
    }),
    {
      name: 'equil-sanctuary-store',
      version: 1,
    }
  )
);
