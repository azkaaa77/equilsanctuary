"use client";

import React, { useState, useEffect, useRef } from "react";
import { useLanguage } from "@/components/providers/language-provider";

// ─────────────────────────────────────────────────────────────
// TYPE DEFINITIONS
// ─────────────────────────────────────────────────────────────
type MoodLevel = 1 | 2 | 3 | 4 | 5;
type Tab = "journal" | "mood" | "breathe" | "reflect";

interface JournalEntry {
  id: string;
  date: string;
  text: string;
  mood: MoodLevel;
  timestamp: number;
}

// ─────────────────────────────────────────────────────────────
// DICT
// ─────────────────────────────────────────────────────────────
const dict = {
  id: {
    pageLabel: "03 // MENTAL SANCTUARY",
    headline1: "Ruang",
    headline2: "Jiwa.",
    subtitle: "Tempat di mana ketenangan adalah rumahmu.",
    tabs: {
      journal: "JURNAL",
      mood: "MOOD",
      breathe: "NAFAS",
      reflect: "REFLEKSI",
    },
    journal: {
      title: "Tulis Hari Ini",
      placeholder:
        "Apa yang sedang kamu rasakan? Biarkan kata-kata mengalir tanpa penghakiman...",
      save: "SIMPAN ENTRI",
      saved: "TERSIMPAN",
      entries: "Entri Sebelumnya",
      moodLabel: "Bagaimana perasaanmu?",
      empty: "Belum ada entri. Mulai menulis hari ini.",
    },
    mood: {
      title: "Lacak Suasana Hati",
      subtitle: "Rekam fluktuasi emosi harianmu",
      levels: ["Berat", "Lelah", "Netral", "Baik", "Luar Biasa"],
      history: "Riwayat 7 Hari",
      log: "CATAT MOOD",
    },
    breathe: {
      title: "Latihan Nafas",
      subtitle: "Teknik Box Breathing untuk kejernihan pikiran",
      inhale: "Tarik Nafas",
      hold: "Tahan",
      exhale: "Hembuskan",
      rest: "Istirahat",
      start: "MULAI",
      stop: "BERHENTI",
      cycles: "Siklus Selesai",
    },
    reflect: {
      title: "Ruang Refleksi",
      subtitle: "Pertanyaan untuk mengenali dirimu lebih dalam",
      questions: [
        "Apa satu hal yang membuatku bersyukur hari ini?",
        "Apa yang menguras energiku? Apa yang mengisi ulang energiku?",
        "Apakah tindakanku hari ini selaras dengan nilaiku?",
        "Apa yang perlu aku lepaskan agar lebih ringan?",
        "Bagaimana aku ingin merasa besok?",
      ],
      answer: "Tulis jawabanmu...",
      next: "PERTANYAAN BERIKUTNYA",
    },
  },
  en: {
    pageLabel: "03 // MENTAL SANCTUARY",
    headline1: "Soul",
    headline2: "Space.",
    subtitle: "A place where stillness is your home.",
    tabs: {
      journal: "JOURNAL",
      mood: "MOOD",
      breathe: "BREATHE",
      reflect: "REFLECT",
    },
    journal: {
      title: "Write Today",
      placeholder:
        "What are you feeling right now? Let the words flow without judgment...",
      save: "SAVE ENTRY",
      saved: "SAVED",
      entries: "Previous Entries",
      moodLabel: "How are you feeling?",
      empty: "No entries yet. Start writing today.",
    },
    mood: {
      title: "Track Your Mood",
      subtitle: "Record your daily emotional fluctuations",
      levels: ["Heavy", "Tired", "Neutral", "Good", "Extraordinary"],
      history: "7-Day History",
      log: "LOG MOOD",
    },
    breathe: {
      title: "Breathing Exercise",
      subtitle: "Box Breathing technique for mental clarity",
      inhale: "Inhale",
      hold: "Hold",
      exhale: "Exhale",
      rest: "Rest",
      start: "START",
      stop: "STOP",
      cycles: "Cycles Complete",
    },
    reflect: {
      title: "Reflection Space",
      subtitle: "Questions to know yourself more deeply",
      questions: [
        "What is one thing I am grateful for today?",
        "What drains my energy? What recharges it?",
        "Did my actions today align with my values?",
        "What do I need to release to feel lighter?",
        "How do I want to feel tomorrow?",
      ],
      answer: "Write your answer...",
      next: "NEXT QUESTION",
    },
  },
};

// ─────────────────────────────────────────────────────────────
// MOOD EMOJI MAP
// ─────────────────────────────────────────────────────────────
const moodColors: Record<MoodLevel, string> = {
  1: "#FF8A80",
  2: "#FFB347",
  3: "#B5C4B1",
  4: "#74C69D",
  5: "#2D6A4F",
};
const moodGlyphs: Record<MoodLevel, string> = {
  1: "◌",
  2: "◔",
  3: "◑",
  4: "◕",
  5: "●",
};

// ─────────────────────────────────────────────────────────────
// BREATHE PHASES
// ─────────────────────────────────────────────────────────────
const breathePhases = ["inhale", "hold", "exhale", "rest"] as const;
type BreathePhase = (typeof breathePhases)[number];

export default function MentalSanctuaryPage() {
  const { language } = useLanguage();
  const t = dict[language as keyof typeof dict] || dict.id;

  const [activeTab, setActiveTab] = useState<Tab>("journal");
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // ── Journal State ──
  const [journalText, setJournalText] = useState("");
  const [selectedMood, setSelectedMood] = useState<MoodLevel>(3);
  const [saved, setSaved] = useState(false);
  const [entries, setEntries] = useState<JournalEntry[]>([]);

  // ── Mood State ──
  const [moodHistory, setMoodHistory] = useState<
    { day: string; mood: MoodLevel }[]
  >([]);
  const [currentMood, setCurrentMood] = useState<MoodLevel>(3);
  const [moodLogged, setMoodLogged] = useState(false);

  // ── Breathe State ──
  const [isBreathing, setIsBreathing] = useState(false);
  const [breathePhase, setBreathePhase] = useState<BreathePhase>("inhale");
  const [breatheCount, setBreatheCount] = useState(4);
  const [cycles, setCycles] = useState(0);
  const breatheRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const phaseIndexRef = useRef(0);

  // ── Reflect State ──
  const [questionIndex, setQuestionIndex] = useState(0);
  const [reflectAnswer, setReflectAnswer] = useState("");
  const [savedReflects, setSavedReflects] = useState<
    { q: string; a: string }[]
  >([]);

  // ── CRUD State ──
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);
  const [editEntryText, setEditEntryText] = useState("");

  // Parallax
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      setMousePos({
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: (e.clientY / window.innerHeight) * 2 - 1,
      });
    };
    window.addEventListener("mousemove", handler);
    return () => window.removeEventListener("mousemove", handler);
  }, []);

  // Load from localStorage
  useEffect(() => {
    const storedEntries = localStorage.getItem("sanctuary_journal");
    if (storedEntries) setEntries(JSON.parse(storedEntries));
    const storedMoods = localStorage.getItem("sanctuary_moods");
    if (storedMoods) setMoodHistory(JSON.parse(storedMoods));
  }, []);

  // ── JOURNAL SAVE ──
  const handleSaveJournal = () => {
    if (!journalText.trim()) return;
    const entry: JournalEntry = {
      id: Date.now().toString(),
      date: new Date().toLocaleDateString(
        language === "id" ? "id-ID" : "en-US",
        {
          weekday: "long",
          day: "numeric",
          month: "long",
        },
      ),
      text: journalText,
      mood: selectedMood,
      timestamp: Date.now(),
    };
    const updated = [entry, ...entries];
    setEntries(updated);
    localStorage.setItem("sanctuary_journal", JSON.stringify(updated));
    setSaved(true);
    setJournalText("");
    setTimeout(() => setSaved(false), 2000);
  };

  // ── JOURNAL CRUD ──
  const deleteEntry = (id: string) => {
    const updated = entries.filter((e) => e.id !== id);
    setEntries(updated);
    localStorage.setItem("sanctuary_journal", JSON.stringify(updated));
  };

  const saveEditEntry = (id: string) => {
    if (!editEntryText.trim()) return;
    const updated = entries.map((e) =>
      e.id === id ? { ...e, text: editEntryText } : e,
    );
    setEntries(updated);
    localStorage.setItem("sanctuary_journal", JSON.stringify(updated));
    setEditingEntryId(null);
  };

  const deleteReflect = (index: number) => {
    setSavedReflects((prev) => prev.filter((_, i) => i !== index));
  };

  // ── LOG MOOD ──
  const handleLogMood = () => {
    const day = new Date().toLocaleDateString(
      language === "id" ? "id-ID" : "en-US",
      { weekday: "short" },
    );
    const updated = [{ day, mood: currentMood }, ...moodHistory].slice(0, 7);
    setMoodHistory(updated);
    localStorage.setItem("sanctuary_moods", JSON.stringify(updated));
    setMoodLogged(true);
    setTimeout(() => setMoodLogged(false), 2000);
  };

  // ── BREATHE ENGINE ──
  const phaseDurations: Record<BreathePhase, number> = {
    inhale: 4,
    hold: 4,
    exhale: 4,
    rest: 4,
  };

  const runPhase = (phaseIdx: number, cycleCount: number) => {
    const phase = breathePhases[phaseIdx];
    setBreathePhase(phase);
    setBreatheCount(phaseDurations[phase]);

    let counter = phaseDurations[phase];
    const tick = setInterval(() => {
      counter--;
      setBreatheCount(counter);
      if (counter <= 0) {
        clearInterval(tick);
        const nextIdx = (phaseIdx + 1) % 4;
        const newCycles = nextIdx === 0 ? cycleCount + 1 : cycleCount;
        if (nextIdx === 0) setCycles(newCycles);
        phaseIndexRef.current = nextIdx;
        breatheRef.current = setTimeout(
          () => runPhase(nextIdx, newCycles),
          100,
        );
      }
    }, 1000);
    breatheRef.current = tick as unknown as ReturnType<typeof setTimeout>;
  };

  const startBreathing = () => {
    setIsBreathing(true);
    setCycles(0);
    phaseIndexRef.current = 0;
    runPhase(0, 0);
  };

  const stopBreathing = () => {
    setIsBreathing(false);
    if (breatheRef.current)
      clearInterval(breatheRef.current as unknown as number);
    setBreathePhase("inhale");
    setBreatheCount(4);
  };

  useEffect(
    () => () => {
      if (breatheRef.current)
        clearInterval(breatheRef.current as unknown as number);
    },
    [],
  );

  // ── REFLECT SAVE ──
  const handleNextQuestion = () => {
    if (reflectAnswer.trim()) {
      setSavedReflects((prev) => [
        ...prev,
        { q: t.reflect.questions[questionIndex], a: reflectAnswer },
      ]);
    }
    setReflectAnswer("");
    setQuestionIndex((prev) => (prev + 1) % t.reflect.questions.length);
  };

  // ─────────────────────────────────────────────────────────────
  // COMPUTED BREATHE VISUAL
  // ─────────────────────────────────────────────────────────────
  const breatheScale =
    breathePhase === "inhale"
      ? 1 + (1 - breatheCount / 4) * 0.5
      : breathePhase === "exhale"
        ? 0.7 + (breatheCount / 4) * 0.5
        : breathePhase === "hold"
          ? 1.5
          : 0.7;

  const breathePhaseLabel = {
    inhale: t.breathe.inhale,
    hold: t.breathe.hold,
    exhale: t.breathe.exhale,
    rest: t.breathe.rest,
  }[breathePhase];

  // ─────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────
  return (
    <div className="space-y-10 pb-20">
      {/* ── HERO HEADER ── */}
      <section className="relative w-full overflow-hidden">
        {/* Floating orbs */}
        <div
          className="absolute -top-8 -right-16 w-64 h-64 rounded-full opacity-[0.06] pointer-events-none"
          style={{
            background: "radial-gradient(circle, #2D6A4F 0%, transparent 70%)",
            transform: `translate(${mousePos.x * -20}px, ${mousePos.y * -10}px)`,
            transition: "transform 0.15s ease-out",
          }}
        />
        <div
          className="absolute top-16 -left-8 w-40 h-40 rounded-full opacity-[0.04] pointer-events-none"
          style={{
            background: "radial-gradient(circle, #74C69D 0%, transparent 70%)",
            transform: `translate(${mousePos.x * 15}px, ${mousePos.y * 8}px)`,
            transition: "transform 0.15s ease-out",
          }}
        />

        {/* Section label */}
        <span className="block text-[10px] font-mono tracking-[0.3em] text-[#141313]/40 uppercase mb-4">
          {t.pageLabel}
        </span>

        {/* Main headline */}
        <div
          style={{
            transform: `translate(${mousePos.x * 8}px, ${mousePos.y * 4}px)`,
            transition: "transform 0.12s ease-out",
          }}
        >
          <h1 className="text-[4.5rem] md:text-[6.5rem] font-extrabold tracking-[-0.05em] leading-[0.85] text-slate-900">
            {t.headline1}
            <br />
            <span className="font-serif italic font-normal text-emerald-700">
              {t.headline2}
            </span>
          </h1>
        </div>

        <p className="mt-6 text-sm font-mono tracking-[0.15em] text-[#141313]/60 uppercase">
          {t.subtitle}
        </p>

        {/* Decorative horizontal rule */}
        <div className="mt-8 flex items-center gap-4">
          <div className="h-[1px] w-16 bg-[#2D6A4F]/40" />
          <span className="text-[9px] font-mono tracking-[0.3em] text-[#2D6A4F]/60 uppercase">
            SANCTUARY ACTIVE
          </span>
          <div className="h-[1px] flex-1 bg-black/5" />
        </div>
      </section>

      {/* ── TAB NAVIGATION ── */}
      <section>
        <div className="flex bg-gray-100/60 p-1 rounded-full gap-1">
          {(["journal", "mood", "breathe", "reflect"] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2.5 text-[9px] font-mono font-bold tracking-[0.3em] uppercase transition-all duration-300 rounded-full ${
                activeTab === tab
                  ? "bg-white text-emerald-800 shadow-sm"
                  : "text-[#141313]/40 hover:text-[#141313]"
              }`}
            >
              {t.tabs[tab]}
            </button>
          ))}
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────── */}
      {/* TAB: JOURNAL */}
      {/* ─────────────────────────────────────────────────────── */}
      {activeTab === "journal" && (
        <section className="space-y-8">
          {/* Write panel */}
          <div className="bg-white shadow-sm ring-1 ring-gray-200/50 p-8 rounded-2xl space-y-6">
            <h2 className="text-xs font-mono font-bold tracking-[0.3em] uppercase text-[#141313]/60">
              {t.journal.title}
            </h2>

            {/* Mood selector */}
            <div>
              <p className="text-[9px] font-mono tracking-[0.25em] uppercase text-[#141313]/60 mb-3">
                {t.journal.moodLabel}
              </p>
              <div className="flex gap-3">
                {([1, 2, 3, 4, 5] as MoodLevel[]).map((m) => (
                  <button
                    key={m}
                    onClick={() => setSelectedMood(m)}
                    className={`w-10 h-10 rounded-full border flex items-center justify-center text-lg transition-all duration-200 ${
                      selectedMood === m
                        ? "border-[#2D6A4F] scale-110"
                        : "border-black/10 hover:border-black/20"
                    }`}
                    style={{
                      backgroundColor:
                        selectedMood === m
                          ? moodColors[m] + "20"
                          : "transparent",
                      color: moodColors[m],
                    }}
                    title={t.mood.levels[m - 1]}
                  >
                    {moodGlyphs[m]}
                  </button>
                ))}
              </div>
            </div>

            {/* Textarea */}
            <textarea
              value={journalText}
              onChange={(e) => setJournalText(e.target.value)}
              placeholder={t.journal.placeholder}
              rows={6}
              className="w-full bg-transparent border-b border-black/10 focus:border-[#2D6A4F] outline-none resize-none text-sm text-[#141313]/80 placeholder:text-[#141313]/40 py-3 transition-colors font-sans leading-relaxed"
            />

            {/* Save button */}
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-mono text-[#141313]/30 tracking-widest">
                {new Date().toLocaleDateString(
                  language === "id" ? "id-ID" : "en-US",
                  {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  },
                )}
              </span>
              <button
                onClick={handleSaveJournal}
                disabled={!journalText.trim()}
                className={`px-8 py-3 text-[9px] font-mono font-bold tracking-[0.3em] uppercase transition-all duration-300 rounded-xl ${
                  saved
                    ? "bg-emerald-600 text-white"
                    : journalText.trim()
                      ? "bg-emerald-700 text-white hover:bg-emerald-800"
                      : "bg-black/5 text-[#141313]/20 cursor-not-allowed"
                }`}
              >
                {saved ? t.journal.saved : t.journal.save}
              </button>
            </div>
          </div>

          {/* Previous entries */}
          <div>
            <h3 className="text-[9px] font-mono tracking-[0.3em] uppercase text-[#141313]/40 mb-4">
              {t.journal.entries}
            </h3>
            {entries.length === 0 ? (
              <p className="text-xs text-[#141313]/30 font-mono italic">
                {t.journal.empty}
              </p>
            ) : (
              <div className="space-y-3">
                {entries.map((entry) => (
                  <div
                    key={entry.id}
                    className="group bg-white shadow-sm ring-1 ring-gray-100 hover:shadow-md transition-all flex flex-row items-center justify-between p-4 rounded-2xl"
                  >
                    {editingEntryId === entry.id ? (
                      <div className="flex-1 space-y-3">
                        <textarea
                          value={editEntryText}
                          onChange={(e) => setEditEntryText(e.target.value)}
                          rows={4}
                          className="w-full bg-white border border-gray-200 shadow-sm rounded-xl px-3 py-2 outline-none resize-none text-sm text-[#141313]/80 font-sans leading-relaxed focus:border-emerald-400 transition-colors"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => saveEditEntry(entry.id)}
                            className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-[8px] font-mono font-bold tracking-widest uppercase rounded-full transition-colors"
                          >
                            {language === "id" ? "SIMPAN" : "SAVE"}
                          </button>
                          <button
                            onClick={() => setEditingEntryId(null)}
                            className="px-4 py-1.5 border border-gray-200 text-gray-500 text-[8px] font-mono font-bold tracking-widest uppercase rounded-full hover:bg-gray-50 transition-colors"
                          >
                            {language === "id" ? "BATAL" : "CANCEL"}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex-1 pr-4">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-[9px] font-mono tracking-widest text-[#141313]/60 uppercase">
                              {entry.date}
                            </span>
                            <span
                              className="text-lg"
                              style={{ color: moodColors[entry.mood] }}
                            >
                              {moodGlyphs[entry.mood]}
                            </span>
                          </div>
                          <p className="text-sm text-[#141313]/70 leading-relaxed line-clamp-3 font-sans">
                            {entry.text}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2 shrink-0 m-0">
                          <button
                            onClick={() => {
                              setEditingEntryId(entry.id);
                              setEditEntryText(entry.text);
                            }}
                            className="flex items-center justify-center w-10 h-10 rounded-xl text-emerald-600 hover:bg-emerald-50 transition-colors m-0 p-0 opacity-0 group-hover:opacity-100 duration-200"
                            title="Edit"
                          >
                            ✎
                          </button>
                          <button
                            onClick={() => deleteEntry(entry.id)}
                            className="flex items-center justify-center w-10 h-10 rounded-xl text-rose-500 hover:bg-rose-50 transition-colors m-0 p-0 text-lg opacity-0 group-hover:opacity-100 duration-200"
                            title="Delete"
                          >
                            ×
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ─────────────────────────────────────────────────────── */}
      {/* TAB: MOOD */}
      {/* ─────────────────────────────────────────────────────── */}
      {activeTab === "mood" && (
        <section className="space-y-8">
          <div className="bg-white shadow-sm ring-1 ring-gray-200/50 p-8 rounded-2xl">
            <h2 className="text-xs font-mono font-bold tracking-[0.3em] uppercase text-[#141313]/60 mb-1">
              {t.mood.title}
            </h2>
            <p className="text-[9px] font-mono text-[#141313]/50 tracking-widest mb-8">
              {t.mood.subtitle}
            </p>

            {/* Big mood selector */}
            <div className="grid grid-cols-5 gap-3 mb-8">
              {([1, 2, 3, 4, 5] as MoodLevel[]).map((m) => (
                <button
                  key={m}
                  onClick={() => setCurrentMood(m)}
                  className={`flex flex-col items-center gap-3 py-6 border rounded-2xl transition-all duration-300 group ${
                    currentMood === m
                      ? "border-[#2D6A4F] bg-[#2D6A4F]/5 scale-[1.02] shadow-sm"
                      : "border-gray-100 bg-white shadow-sm hover:border-gray-200 hover:shadow-md"
                  }`}
                >
                  <span
                    className="text-3xl transition-transform duration-300 group-hover:scale-110"
                    style={{ color: moodColors[m] }}
                  >
                    {moodGlyphs[m]}
                  </span>
                  <span
                    className="text-[8px] font-mono tracking-[0.2em] uppercase"
                    style={{
                      color:
                        currentMood === m
                          ? moodColors[m]
                          : "rgba(20,19,19,0.3)",
                    }}
                  >
                    {t.mood.levels[m - 1]}
                  </span>
                </button>
              ))}
            </div>

            <button
              onClick={handleLogMood}
              className={`w-full py-4 text-[9px] font-mono font-bold tracking-[0.3em] uppercase transition-all duration-300 rounded-xl ${
                moodLogged
                  ? "bg-emerald-600 text-white"
                  : "bg-emerald-700 text-white hover:bg-emerald-800"
              }`}
            >
              {moodLogged ? "✓ LOGGED" : t.mood.log}
            </button>
          </div>

          {/* 7-day history */}
          <div>
            <h3 className="text-[9px] font-mono tracking-[0.3em] uppercase text-[#141313]/60 mb-4">
              {t.mood.history}
            </h3>
            {moodHistory.length === 0 ? (
              <p className="text-xs text-[#141313]/50 font-mono italic">
                {language === "id"
                  ? "Belum ada riwayat mood."
                  : "No mood history yet."}
              </p>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 p-4">
                {/* Bar chart */}
                <div className="flex items-end gap-3 h-24">
                  {moodHistory.map((entry, i) => (
                    <div
                      key={i}
                      className="flex flex-col items-center gap-2 flex-1"
                    >
                      <div
                        className="w-full rounded-[2px] transition-all duration-500"
                        style={{
                          height: `${(entry.mood / 5) * 80}px`,
                          backgroundColor: moodColors[entry.mood],
                          opacity: 0.7 + i * 0.04,
                        }}
                      />
                      <span className="text-[8px] font-mono text-[#141313]/30">
                        {entry.day}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Legend */}
                <div className="flex items-center gap-6 mt-6 flex-wrap">
                  {([1, 2, 3, 4, 5] as MoodLevel[]).map((m) => (
                    <div key={m} className="flex items-center gap-2">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: moodColors[m] }}
                      />
                      <span className="text-[8px] font-mono text-[#141313]/60 uppercase">
                        {t.mood.levels[m - 1]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ─────────────────────────────────────────────────────── */}
      {/* TAB: BREATHE */}
      {/* ─────────────────────────────────────────────────────── */}
      {activeTab === "breathe" && (
        <section className="space-y-8">
          <div className="bg-white shadow-sm ring-1 ring-gray-200/50 p-8 rounded-2xl text-center">
            <h2 className="text-xs font-mono font-bold tracking-[0.3em] uppercase text-[#141313]/60 mb-1">
              {t.breathe.title}
            </h2>
            <p className="text-[9px] font-mono text-[#141313]/50 tracking-widest mb-12">
              {t.breathe.subtitle}
            </p>

            {/* Breathing circle */}
            <div className="flex flex-col items-center justify-center gap-8">
              <div className="relative w-48 h-48 flex items-center justify-center">
                {/* Outer ring */}
                <div
                  className="absolute inset-0 rounded-full border border-[#2D6A4F]/20 transition-all duration-1000 ease-in-out"
                  style={{
                    transform: isBreathing
                      ? `scale(${breatheScale * 1.15})`
                      : "scale(1)",
                  }}
                />
                {/* Mid ring */}
                <div
                  className="absolute inset-4 rounded-full border border-[#2D6A4F]/30 transition-all duration-1000 ease-in-out"
                  style={{
                    transform: isBreathing
                      ? `scale(${breatheScale * 1.05})`
                      : "scale(1)",
                  }}
                />
                {/* Core circle */}
                <div
                  className="rounded-full transition-all duration-1000 ease-in-out flex items-center justify-center"
                  style={{
                    width: "80px",
                    height: "80px",
                    transform: isBreathing
                      ? `scale(${breatheScale})`
                      : "scale(1)",
                    backgroundColor: isBreathing
                      ? moodColors[5] + "30"
                      : "rgba(20,19,19,0.04)",
                    border: `1px solid ${isBreathing ? moodColors[5] + "60" : "rgba(20,19,19,0.08)"}`,
                  }}
                >
                  <span className="text-2xl font-light text-[#2D6A4F]/70">
                    {isBreathing ? breatheCount : "◎"}
                  </span>
                </div>
              </div>

              {/* Phase label */}
              <div className="h-8 flex items-center justify-center">
                {isBreathing && (
                  <span className="text-[9px] font-mono tracking-[0.4em] uppercase text-[#2D6A4F] animate-pulse">
                    {breathePhaseLabel}
                  </span>
                )}
              </div>

              {/* Cycles */}
              {cycles > 0 && (
                <span className="text-[9px] font-mono text-[#141313]/40 tracking-widest">
                  {cycles} {t.breathe.cycles}
                </span>
              )}

              {/* Control button */}
              <button
                onClick={isBreathing ? stopBreathing : startBreathing}
                className={`px-12 py-4 text-[9px] font-mono font-bold tracking-[0.4em] uppercase transition-all duration-300 rounded-full ${
                  isBreathing
                    ? "bg-rose-100 text-rose-500 border border-rose-200 hover:bg-rose-200"
                    : "bg-emerald-700 text-white hover:bg-emerald-800"
                }`}
              >
                {isBreathing ? t.breathe.stop : t.breathe.start}
              </button>
            </div>
          </div>

          {/* Phase guide */}
          <div className="grid grid-cols-4 gap-3">
            {breathePhases.map((phase) => (
              <div
                key={phase}
                className={`border rounded-2xl p-4 text-center transition-all duration-500 ${
                  isBreathing && breathePhase === phase
                    ? "border-[#2D6A4F]/40 bg-[#2D6A4F]/5 shadow-sm"
                    : "border-gray-100 bg-white shadow-sm"
                }`}
              >
                <div
                  className="text-2xl mb-2 transition-all duration-300"
                  style={{
                    opacity: isBreathing && breathePhase === phase ? 1 : 0.3,
                    color: "#2D6A4F",
                  }}
                >
                  {phase === "inhale"
                    ? "↑"
                    : phase === "hold"
                      ? "◉"
                      : phase === "exhale"
                        ? "↓"
                        : "○"}
                </div>
                <span className="text-[8px] font-mono tracking-[0.2em] uppercase text-[#141313]/60">
                  {t.breathe[phase as keyof typeof t.breathe] as string} · 4s
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ─────────────────────────────────────────────────────── */}
      {/* TAB: REFLECT */}
      {/* ─────────────────────────────────────────────────────── */}
      {activeTab === "reflect" && (
        <section className="space-y-8">
          <div className="bg-white shadow-sm ring-1 ring-gray-200/50 p-8 rounded-2xl space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xs font-mono font-bold tracking-[0.3em] uppercase text-[#141313]/60 mb-1">
                  {t.reflect.title}
                </h2>
                <p className="text-[9px] font-mono text-[#141313]/50 tracking-widest">
                  {t.reflect.subtitle}
                </p>
              </div>
              <span className="text-[9px] font-mono text-[#141313]/30">
                {questionIndex + 1} / {t.reflect.questions.length}
              </span>
            </div>

            {/* Question */}
            <div className="border-l-2 border-[#2D6A4F]/40 pl-6 py-2">
              <p className="text-lg font-serif italic font-light text-[#141313]/80 leading-relaxed">
                {t.reflect.questions[questionIndex]}
              </p>
            </div>

            {/* Answer area */}
            <textarea
              value={reflectAnswer}
              onChange={(e) => setReflectAnswer(e.target.value)}
              placeholder={t.reflect.answer}
              rows={5}
              className="w-full bg-transparent border-b border-black/10 focus:border-[#2D6A4F] outline-none resize-none text-sm text-[#141313]/80 placeholder:text-[#141313]/40 py-3 transition-colors font-sans leading-relaxed"
            />

            <div className="flex items-center justify-between">
              {/* Progress dots */}
              <div className="flex gap-2">
                {t.reflect.questions.map((_, i) => (
                  <div
                    key={i}
                    className="w-1.5 h-1.5 rounded-full transition-colors duration-300"
                    style={{
                      backgroundColor:
                        i === questionIndex
                          ? "#2D6A4F"
                          : i < questionIndex
                            ? "rgba(45,106,79,0.3)"
                            : "rgba(20,19,19,0.1)",
                    }}
                  />
                ))}
              </div>

              <button
                onClick={handleNextQuestion}
                className="px-8 py-3 bg-emerald-700 text-white text-[9px] font-mono font-bold tracking-[0.3em] uppercase transition-all duration-300 hover:bg-emerald-800 rounded-xl"
              >
                {t.reflect.next} →
              </button>
            </div>
          </div>

          {/* Saved reflections */}
          {savedReflects.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-[9px] font-mono tracking-[0.3em] uppercase text-[#141313]/40">
                {language === "id" ? "Refleksi Tersimpan" : "Saved Reflections"}
              </h3>
              {savedReflects.map((r, i) => (
                <div
                  key={i}
                  className="group bg-white shadow-sm ring-1 ring-gray-100 hover:shadow-md transition-all flex flex-row items-center justify-between p-4 rounded-2xl"
                >
                  <div className="flex-1 pr-4">
                    <p className="text-[9px] font-mono tracking-widest text-emerald-700/70 uppercase italic mb-1">
                      {r.q}
                    </p>
                    <p className="text-sm text-[#141313]/70 leading-relaxed font-sans">
                      {r.a}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2 shrink-0 m-0">
                    <button
                      onClick={() => deleteReflect(i)}
                      className="flex items-center justify-center w-10 h-10 rounded-xl text-rose-500 hover:bg-rose-50 transition-colors m-0 p-0 text-lg opacity-0 group-hover:opacity-100 duration-200"
                      title="Delete"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
