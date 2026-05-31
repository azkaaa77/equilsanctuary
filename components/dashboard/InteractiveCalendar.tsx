// components/dashboard/InteractiveCalendar.tsx
// Real-time calendar with date-fns + Zustand store integration.
// Clicking a date → router.push('/dashboard/diary/[date]').
// Shows dots: Mint = all tasks done, Coral = pending/deadline.

"use client";

import React, {
  useRef,
  useState,
  useCallback,
  useMemo,
  useEffect,
} from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/components/providers/language-provider";
import { useEquilStore, type Task } from "@/store/useEquilStore";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isToday,
  isSunday,
  addMonths,
  subMonths,
  isPast,
  parseISO,
} from "date-fns";
import { id as localeID } from "date-fns/locale";

// ── DOT STATUS ──────────────────────────────────────────────
type DotStatus = "mint" | "coral" | "deadline" | "none";

const DOT_CLASS: Record<DotStatus, string> = {
  mint: "bg-equil-mint",
  coral: "bg-equil-coral",
  deadline: "bg-equil-coral ring-2 ring-equil-coral/20",
  none: "",
};

// ── DAY CELL ────────────────────────────────────────────────
function DayCell({
  date,
  currentMonth,
  dotStatus,
  deadlineTasks,
  onSelect,
  language,
}: {
  date: Date;
  currentMonth: boolean;
  dotStatus: DotStatus;
  deadlineTasks: Task[];
  onSelect: (d: Date) => void;
  language: string;
}) {
  const cellRef = useRef<HTMLDivElement>(null);
  const [glow, setGlow] = useState({ x: 50, y: 50 });
  const [isHovered, setIsHovered] = useState(false);
  const isCurrentDay = isToday(date);
  const isSun = isSunday(date);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!cellRef.current) return;
    const r = cellRef.current.getBoundingClientRect();
    setGlow({
      x: ((e.clientX - r.left) / r.width) * 100,
      y: ((e.clientY - r.top) / r.height) * 100,
    });
  }, []);

  return (
    <motion.div
      ref={cellRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => currentMonth && onSelect(date)}
      className={`calendar-cell relative min-h-[42px] md:min-h-[50px] p-1 md:p-1.5 rounded-xl cursor-pointer group flex flex-col items-center justify-center
        ${!currentMonth ? "opacity-20 pointer-events-none" : ""}
        ${isCurrentDay ? "bg-equil-mint/[0.08] ring-1 ring-equil-mint/25" : "bg-white/30"}
        border border-equil-forest/[0.04]
      `}
      whileHover={{ y: -2, scale: 1.05 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
    >
      {/* Background glow in its own overflow-hidden div to prevent cutting off tooltips */}
      <div className="absolute inset-0 overflow-hidden rounded-xl pointer-events-none">
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{
            background: `radial-gradient(circle at ${glow.x}% ${glow.y}%, ${
              isCurrentDay ? "rgba(45,106,79,0.12)" : "var(--color-equil-sage)"
            } 0%, transparent 70%)`,
          }}
        />
      </div>

      <div className="flex flex-col items-center justify-center relative z-10">
        <span
          className={`text-xs md:text-sm font-medium tracking-wide ${
            isCurrentDay
              ? "text-equil-mint font-bold"
              : isSun
                ? "text-equil-coral"
                : "text-equil-onyx/50"
          }`}
        >
          {format(date, "d")}
        </span>
      </div>

      {/* Dot indicator (absolute bottom center or bottom right) */}
      {dotStatus !== "none" && currentMonth && (
        <span
          className={`absolute bottom-1 block w-1.5 h-1.5 rounded-full ${DOT_CLASS[dotStatus]} dot-pulse z-20`}
        />
      )}

      {/* Tooltip on Hover */}
      <AnimatePresence>
        {isHovered && currentMonth && deadlineTasks.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 5, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.95 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute bottom-full mb-2 z-[999] pointer-events-none cursor-default"
          >
            <div className="crystal-glass bg-white/95 backdrop-blur-md border border-equil-forest/10 shadow-lg rounded-xl p-2.5 min-w-[150px] max-w-[220px]">
              <span className="text-[8px] font-mono tracking-wider text-equil-onyx/40 uppercase block mb-1">
                {format(date, "d MMMM", { locale: language === "id" ? localeID : undefined })}
              </span>
              <div className="space-y-1">
                {deadlineTasks.map((t) => (
                  <div
                    key={t.id}
                    className={`text-[9px] leading-tight truncate px-1.5 py-0.5 rounded-md font-sans ${
                      t.completed
                        ? "bg-equil-mint/10 text-equil-mint/80 line-through"
                        : "bg-equil-coral/10 text-equil-coral"
                    }`}
                  >
                    {t.text}
                  </div>
                ))}
              </div>
            </div>
            {/* Tooltip arrow */}
            <div className="w-1.5 h-1.5 bg-white border-r border-b border-equil-forest/10 rotate-45 mx-auto -mt-[3px]" />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── DEADLINE DRAWER (Hydration-safe via React Portal) ────────
function DeadlineDrawer({
  isOpen,
  onClose,
  activeDeadlines,
  language,
}: {
  isOpen: boolean;
  onClose: () => void;
  activeDeadlines: Task[];
  language: string;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen, mounted]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex justify-end">
          {/* Backdrop */}
          <motion.div
            key="deadline-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
            className="absolute inset-0 bg-equil-paper/60 backdrop-blur-sm"
          />

          {/* Drawer Panel */}
          <motion.aside
            key="deadline-drawer"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="relative h-screen w-full md:w-[450px] bg-equil-paper shadow-2xl overflow-y-auto flex flex-col z-10 custom-scrollbar"
          >
            <div className="flex flex-col h-full px-8 md:px-10 py-12">
              {/* Header */}
              <div className="flex items-start justify-between mb-10 shrink-0">
                <div>
                  <span className="text-[9px] font-mono tracking-[0.3em] text-equil-forest/30 uppercase block mb-1">
                    {language === "id"
                      ? "TINJAUAN BATAS WAKTU"
                      : "DEADLINE REVIEW"}
                  </span>
                  <h2 className="text-4xl font-display font-black tracking-tightest text-equil-onyx leading-none">
                    {language === "id" ? "Daftar Tugas." : "Deadline Task."}
                  </h2>
                </div>
                <button
                  onClick={onClose}
                  className="w-10 h-10 rounded-full border border-equil-onyx/[0.06] flex items-center justify-center hover:bg-equil-sage/50 transition-all group shrink-0 mt-1"
                  aria-label="Close drawer"
                >
                  <span className="text-equil-onyx/30 group-hover:text-equil-onyx transition-colors text-lg leading-none">
                    ×
                  </span>
                </button>
              </div>

              {/* Deadlines List */}
              <div className="flex-1 overflow-y-auto pr-2 -mr-2 space-y-6">
                {activeDeadlines.length === 0 ? (
                  <p className="text-xs text-equil-onyx/30 font-mono italic">
                    {language === "id"
                      ? "tidak ada tugas aktif."
                      : "no active deadlines."}
                  </p>
                ) : (
                  <div className="divide-y divide-equil-forest/[0.05]">
                    {activeDeadlines.map((task) => {
                      const parsedDeadline = parseISO(task.deadline!);
                      const isOverdue =
                        isPast(parsedDeadline) && !isToday(parsedDeadline);
                      const isDueToday = isToday(parsedDeadline);
                      const isUrgent = isOverdue || isDueToday;

                      // Format due date elegantly
                      const dueDateFormatted = format(
                        parsedDeadline,
                        "d MMMM yyyy",
                        {
                          locale: language === "id" ? localeID : undefined,
                        },
                      );

                      return (
                        <div
                          key={task.id}
                          className="py-4 flex flex-col gap-1.5 first:pt-0 last:pb-0"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <span className="text-sm text-equil-onyx/80 font-medium leading-snug">
                              {task.text}
                            </span>
                            <span
                              className={`text-[8px] font-mono tracking-wider shrink-0 px-2 py-0.5 rounded-sm uppercase ${
                                isUrgent
                                  ? "text-equil-coral bg-equil-coral/10 font-bold"
                                  : "text-equil-mint bg-equil-mint/10"
                              }`}
                            >
                              {isOverdue
                                ? language === "id"
                                  ? "Terlewat"
                                  : "Overdue"
                                : isDueToday
                                  ? language === "id"
                                    ? "Hari Ini"
                                    : "Today"
                                  : language === "id"
                                    ? "Aktif"
                                    : "Active"}
                            </span>
                          </div>
                          <span
                            className={`text-[10px] font-mono tracking-wide ${
                              isUrgent
                                ? "text-equil-coral"
                                : "text-equil-onyx/40"
                            }`}
                          >
                            {language === "id" ? "Jatuh tempo: " : "Due: "}{" "}
                            {dueDateFormatted}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

// ── MAIN ────────────────────────────────────────────────────
export default function InteractiveCalendar() {
  const { language } = useLanguage();
  const router = useRouter();

  // Hydration guard
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);

  // State to track current navigated month
  const [currentMonthDate, setCurrentMonthDate] = useState(new Date());

  // State to track if deadline drawer is open
  const [isDeadlineDrawerOpen, setIsDeadlineDrawerOpen] = useState(false);

  const handlePrevMonth = () =>
    setCurrentMonthDate((prev) => subMonths(prev, 1));
  const handleNextMonth = () =>
    setCurrentMonthDate((prev) => addMonths(prev, 1));

  // Read store data for dot computation
  const tasks = useEquilStore((s) => s.tasks) || [];
  const diaries = useEquilStore((s) => s.diaries) || [];
  const expenses = useEquilStore((s) => s.expenses) || [];
  const moods = useEquilStore((s) => s.moods) || [];

  // Compute active deadlines: incomplete tasks with a deadline sorted ascending (nearest first)
  const activeDeadlines = useMemo(() => {
    return tasks
      .filter((t) => t.deadline && !t.completed)
      .sort((a, b) => {
        const dateA = a.deadline || "";
        const dateB = b.deadline || "";
        return dateA.localeCompare(dateB);
      });
  }, [tasks]);

  // Escape key handler to close drawer
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsDeadlineDrawerOpen(false);
    };
    if (isDeadlineDrawerOpen) window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isDeadlineDrawerOpen]);

  // Compute dot status per date
  const dotMap = useMemo(() => {
    if (!hydrated) return new Map<string, DotStatus>();
    const map = new Map<string, DotStatus>();

    // 1. Group tasks by dateCreated
    const tasksByDate = new Map<string, typeof tasks>();
    tasks.forEach((t) => {
      const arr = tasksByDate.get(t.dateCreated) || [];
      arr.push(t);
      tasksByDate.set(t.dateCreated, arr);
    });

    // 2. Collect all dates that have any daily log entries
    const activeDates = new Set<string>();
    tasks.forEach((t) => activeDates.add(t.dateCreated));
    diaries.forEach((d) => {
      if (d.content.trim()) activeDates.add(d.date);
    });
    expenses.forEach((e) => activeDates.add(e.date));
    moods.forEach((m) => {
      if (m.emoji) activeDates.add(m.date);
    });

    // 3. Set status for each active date
    activeDates.forEach((date) => {
      const dateTasks = tasksByDate.get(date) || [];
      if (dateTasks.length > 0) {
        const allDone = dateTasks.every((t) => t.completed);
        map.set(date, allDone ? "mint" : "coral");
      } else {
        // If there are no tasks, but there is other activity (diary, mood, or expense),
        // we treat it as completed (mint dot) because there are no pending tasks!
        map.set(date, "mint");
      }
    });

    // 4. Set deadline dots (override with 'deadline' if incomplete task has deadline on that date)
    tasks.forEach((t) => {
      if (t.deadline && !t.completed) {
        const existing = map.get(t.deadline);
        // Deadline dot takes priority unless it's already coral from its own tasks
        if (!existing || existing === "none") {
          map.set(t.deadline, "deadline");
        }
      }
    });

    return map;
  }, [tasks, diaries, expenses, moods, hydrated]);

  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonthDate);
    const monthEnd = endOfMonth(currentMonthDate);
    const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
    return eachDayOfInterval({ start: gridStart, end: gridEnd });
  }, [currentMonthDate]);

  const handleDateSelect = useCallback(
    (date: Date) => {
      router.push(`/dashboard/diary/${format(date, "yyyy-MM-dd")}`);
    },
    [router],
  );

  const dayHeaders =
    language === "en"
      ? ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
      : ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];

  const monthLabel = format(currentMonthDate, "MMMM yyyy", {
    locale: language === "id" ? localeID : undefined,
  });

  return (
    <section
      className="w-full relative"
      aria-label="Interactive calendar"
    >
      <div className="flex items-end justify-between mb-6">
        <div>
          <span className="text-[9px] font-mono tracking-[0.3em] text-equil-onyx/25 uppercase block mb-1">
            02 // {language === "id" ? "PEMANTAUAN TUGAS" : "TASK MONITORING"}
          </span>
          <h3 className="text-xl md:text-2xl font-display font-black tracking-tightest text-equil-onyx leading-none">
            {language === "id" ? "Jadwal & " : "Schedule & "}
            <span className="italic font-normal text-equil-mint/70">
              {language === "id" ? "pemantauan." : "monitoring."}
            </span>
          </h3>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevMonth}
              className="w-7 h-7 rounded-full border border-equil-onyx/5 flex items-center justify-center hover:bg-equil-sage/40 transition-colors text-equil-onyx/40 hover:text-equil-onyx text-xs font-bold"
              title={language === "id" ? "Bulan Sebelumnya" : "Previous Month"}
            >
              ←
            </button>
            <span className="text-[11px] font-display font-black tracking-tightest text-equil-onyx/60 uppercase min-w-[95px] text-center select-none">
              {monthLabel}
            </span>
            <button
              onClick={handleNextMonth}
              className="w-7 h-7 rounded-full border border-equil-onyx/5 flex items-center justify-center hover:bg-equil-sage/40 transition-colors text-equil-onyx/40 hover:text-equil-onyx text-xs font-bold"
              title={language === "id" ? "Bulan Berikutnya" : "Next Month"}
            >
              →
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-7 mb-2">
        {dayHeaders.map((d, i) => (
          <div
            key={d}
            className={`text-[9px] font-mono font-bold tracking-[0.25em] uppercase text-center py-2 ${i === 6 ? "text-equil-coral/50" : "text-equil-onyx/20"}`}
          >
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1 md:gap-3 w-full">
        {calendarDays.map((day) => {
          const key = format(day, "yyyy-MM-dd");
          const dayDeadlineTasks = tasks.filter((t) => t.deadline === key);
          return (
            <DayCell
              key={key}
              date={day}
              currentMonth={isSameMonth(day, currentMonthDate)}
              dotStatus={dotMap.get(key) || "none"}
              deadlineTasks={dayDeadlineTasks}
              onSelect={handleDateSelect}
              language={language}
            />
          );
        })}
      </div>

      {/* Trigger Button to Open Drawer */}
      <div className="flex justify-center mt-6">
        <button
          onClick={() => setIsDeadlineDrawerOpen(true)}
          className="text-[9px] font-mono font-bold tracking-[0.25em] uppercase text-equil-onyx/30 hover:text-equil-mint hover:underline transition-all duration-300 py-1.5 border-b border-transparent hover:border-equil-mint/30"
        >
          {language === "id"
            ? "Tinjau semua Batas waktu →"
            : "Review all deadlines →"}
        </button>
      </div>

      {/* Deadline Drawer slide-over */}
      <DeadlineDrawer
        isOpen={isDeadlineDrawerOpen}
        onClose={() => setIsDeadlineDrawerOpen(false)}
        activeDeadlines={activeDeadlines}
        language={language}
      />
    </section>
  );
}
