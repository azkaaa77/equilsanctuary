"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useLanguage } from "@/components/providers/language-provider";

// ─────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────
type Role = "user" | "ai";
type StressReading = "calm" | "mild" | "moderate" | "high" | "critical";

interface Message {
  id: string;
  role: Role;
  content: string;
  timestamp: number;
  stressReading?: StressReading;
}

interface Session {
  id: string;
  startedAt: number;
  title: string;
  messages: Message[];
  avgStress: StressReading;
}

// ─────────────────────────────────────────────────────────────
// AI RESPONSE ENGINE — keyword-based empathetic responses
// ─────────────────────────────────────────────────────────────
const STRESS_KEYWORDS: Record<StressReading, { id: string[]; en: string[] }> = {
  critical: {
    id: [
      "tidak sanggup",
      "menyerah",
      "putus asa",
      "tidak ada harapan",
      "benci diri",
      "ingin menghilang",
      "tidak berguna sama sekali",
    ],
    en: [
      "cant go on",
      "giving up",
      "hopeless",
      "no hope",
      "hate myself",
      "want to disappear",
      "completely worthless",
    ],
  },
  high: {
    id: [
      "sangat stres",
      "panik",
      "cemas",
      "takut",
      "tertekan",
      "kewalahan",
      "lelah banget",
      "tidak kuat",
      "menangis",
      "marah",
      "frustrasi",
      "hancur",
    ],
    en: [
      "very stressed",
      "panic",
      "anxious",
      "afraid",
      "overwhelmed",
      "exhausted",
      "cant handle",
      "crying",
      "angry",
      "frustrated",
      "broken",
    ],
  },
  moderate: {
    id: [
      "stres",
      "khawatir",
      "galau",
      "bingung",
      "sedih",
      "tidak enak",
      "gelisah",
      "susah tidur",
      "tidak fokus",
      "beban",
    ],
    en: [
      "stressed",
      "worried",
      "confused",
      "sad",
      "uneasy",
      "restless",
      "cant sleep",
      "unfocused",
      "burden",
    ],
  },
  mild: {
    id: ["sedikit", "agak", "lumayan", "kurang", "capek", "bosen", "jenuh"],
    en: ["little", "slightly", "somewhat", "kind of", "tired", "bored", "dull"],
  },
  calm: { id: [], en: [] },
};

function detectStress(text: string, lang: string): StressReading {
  const lower = text.toLowerCase();
  const levels: StressReading[] = ["critical", "high", "moderate", "mild"];
  for (const level of levels) {
    const keywords =
      lang === "id" ? STRESS_KEYWORDS[level].id : STRESS_KEYWORDS[level].en;
    if (keywords.some((kw) => lower.includes(kw))) return level;
  }
  return "calm";
}

// Empathetic AI response pools per stress level
const AI_RESPONSES: Record<StressReading, { id: string[]; en: string[] }> = {
  critical: {
    id: [
      "Aku dengar kamu. Apa yang kamu rasakan sekarang sangat berat, dan kamu tidak harus menanggungnya sendirian. Bisakah kamu ceritakan lebih lanjut apa yang terjadi?",
      "Terima kasih sudah mempercayaiku dengan perasaan sedalam ini. Ini ruang yang aman. Aku ada di sini, tidak kemana-mana. Apa yang paling membuatmu merasa seperti ini?",
      "Kamu butuh keberanian yang besar untuk mengungkapkan ini. Aku ingin mendengar semuanya — tanpa penghakiman. Ceritakan perlahan.",
    ],
    en: [
      "I hear you. What you're feeling right now is immensely heavy, and you don't have to carry it alone. Can you tell me more about what's happening?",
      "Thank you for trusting me with something this deep. This is a safe space. I'm here, not going anywhere. What's making you feel this way most?",
      "It takes great courage to express this. I want to hear everything — without judgment. Tell me slowly.",
    ],
  },
  high: {
    id: [
      "Itu terdengar sangat melelahkan. Kamu sudah menanggung banyak. Mari kita urai satu per satu — apa yang paling berat saat ini?",
      "Wajar sekali merasa seperti itu dalam situasi seperti ini. Kamu tidak salah merasakannya. Apa satu hal yang paling ingin kamu lepaskan sekarang?",
      "Aku dengar betapa lelahnya kamu. Perasaan itu valid. Sebelum kita melangkah lebih jauh — sudahkah kamu minum air hari ini dan tarik napas sejenak?",
      "Tekanan itu nyata, dan aku tidak meremehkannya. Ceritakan lebih lanjut — sejak kapan perasaan ini mulai muncul?",
    ],
    en: [
      "That sounds incredibly exhausting. You've been carrying so much. Let's untangle this one by one — what feels heaviest right now?",
      "It's completely natural to feel this way in a situation like this. You're not wrong for feeling it. What's one thing you wish you could release right now?",
      "I hear how tired you are. That feeling is valid. Before we go further — have you had water today and taken a moment to breathe?",
      "That pressure is real, and I'm not dismissing it. Tell me more — when did this feeling start?",
    ],
  },
  moderate: {
    id: [
      "Aku mengerti. Perasaan itu tidak nyaman, dan kamu layak untuk membicarakannya. Apa yang paling banyak menempati pikiranmu sekarang?",
      "Terima kasih sudah berbagi. Terkadang mengucapkan sesuatu sudah cukup meringankan. Apa yang kamu harap bisa berbeda dari situasi ini?",
      "Aku di sini untuk mendengarmu. Tidak ada yang terlalu kecil atau terlalu besar untuk diceritakan. Lanjutkan saja.",
      "Kekhawatiran itu valid. Mari kita lihat bersama apa yang bisa diurai dari situasi ini. Dari mana kamu ingin mulai?",
    ],
    en: [
      "I understand. That feeling is uncomfortable, and you deserve to talk about it. What's occupying your mind the most right now?",
      "Thank you for sharing. Sometimes saying something out loud already lightens the load. What do you wish could be different about this situation?",
      "I'm here to listen. Nothing is too small or too big to share. Just continue.",
      "That worry is valid. Let's look together at what can be untangled from this situation. Where do you want to start?",
    ],
  },
  mild: {
    id: [
      'Aku mendengarmu. Bahkan perasaan yang "biasa-biasa saja" layak untuk diakui. Apa yang sedang berlangsung hari ini?',
      "Kadang perasaan yang samar-samar itu justru paling sulit dijelaskan. Tidak apa-apa jika kamu belum tahu kata pastinya. Ceritakan saja apa yang ada di pikiranmu.",
      "Senang kamu mau berbagi. Hari-hari yang biasa pun punya beratnya sendiri. Ada yang ingin kamu ceritakan lebih dalam?",
    ],
    en: [
      'I hear you. Even feelings that feel "ordinary" deserve to be acknowledged. What\'s going on today?',
      "Sometimes those vague feelings are the hardest to explain. It's okay if you don't know the exact words yet. Just share what's on your mind.",
      "Glad you're sharing. Even ordinary days have their own weight. Is there something you'd like to explore more deeply?",
    ],
  },
  calm: {
    id: [
      "Halo. Aku di sini kapanpun kamu ingin berbicara. Ada yang ingin kamu ceritakan hari ini?",
      "Selamat datang di ruang ini. Tidak ada agenda, tidak ada penilaian — hanya kamu dan pikiranmu. Mulai dari mana saja.",
      "Aku siap mendengarkan. Bagaimana keadaanmu hari ini — sungguh-sungguh?",
      "Ruang ini milikmu sepenuhnya. Apa yang ada di benakmu saat ini?",
    ],
    en: [
      "Hello. I'm here whenever you want to talk. Is there something you'd like to share today?",
      "Welcome to this space. No agenda, no judgment — just you and your thoughts. Start anywhere.",
      "I'm ready to listen. How are you really doing today?",
      "This space is entirely yours. What's on your mind right now?",
    ],
  },
};

// Follow-up probes
const FOLLOW_UPS: { id: string[]; en: string[] } = {
  id: [
    "Bagaimana kamu biasanya menghadapi situasi seperti ini?",
    "Sudah berapa lama perasaan ini bersamamu?",
    "Ada satu orang yang bisa kamu ceritakan tentang ini?",
    "Apa yang menurutmu paling membantu saat kamu merasa seperti ini?",
    "Jika kamu bisa memberi satu nasihat untuk dirimu sendiri saat ini, apa yang akan kamu katakan?",
  ],
  en: [
    "How do you usually handle situations like this?",
    "How long has this feeling been with you?",
    "Is there one person you can talk to about this?",
    "What do you think helps you most when you feel this way?",
    "If you could give yourself one piece of advice right now, what would you say?",
  ],
};

function generateAIResponse(
  text: string,
  stress: StressReading,
  lang: string,
  messageCount: number,
): string {
  const pool = AI_RESPONSES[stress][lang === "id" ? "id" : "en"];
  const base = pool[Math.floor(Math.random() * pool.length)];

  if (messageCount > 1 && messageCount % 2 === 0) {
    const followUps = FOLLOW_UPS[lang === "id" ? "id" : "en"];
    const probe = followUps[Math.floor(Math.random() * followUps.length)];
    return `${base}\n\n${probe}`;
  }

  return base;
}

// ─────────────────────────────────────────────────────────────
// STRESS CONFIG
// ─────────────────────────────────────────────────────────────
const STRESS_CONFIG: Record<
  StressReading,
  { dot: string; labelId: string; labelEn: string; barWidth: string }
> = {
  calm: { dot: "#B5C4B1", labelId: "Tenang", labelEn: "Calm", barWidth: "10%" },
  mild: { dot: "#74C69D", labelId: "Ringan", labelEn: "Mild", barWidth: "30%" },
  moderate: {
    dot: "#FFB347",
    labelId: "Sedang",
    labelEn: "Moderate",
    barWidth: "55%",
  },
  high: { dot: "#FF8A80", labelId: "Tinggi", labelEn: "High", barWidth: "78%" },
  critical: {
    dot: "#E57373",
    labelId: "Kritis",
    labelEn: "Critical",
    barWidth: "100%",
  },
};

const STRESS_ORDER: StressReading[] = [
  "calm",
  "mild",
  "moderate",
  "high",
  "critical",
];

function avgStressLevel(messages: Message[]): StressReading {
  const withStress = messages.filter(
    (m) => m.role === "user" && m.stressReading,
  );
  if (!withStress.length) return "calm";
  const avg =
    withStress.reduce((s, m) => s + STRESS_ORDER.indexOf(m.stressReading!), 0) /
    withStress.length;
  return STRESS_ORDER[Math.min(4, Math.round(avg))];
}

// ─────────────────────────────────────────────────────────────
// DICT
// ─────────────────────────────────────────────────────────────
const dict = {
  id: {
    pageLabel: "06 // SANCTUARY AI",
    headline1: "Ruang",
    headline2: "Bercerita.",
    subtitle:
      "Pendamping refleksi emosional yang tersedia 24/7 — tanpa penghakiman.",
    statusLabel: "AI ACTIVE · ZERO JUDGMENT",
    tabs: { chat: "PERCAKAPAN", history: "RIWAYAT", insights: "WAWASAN" },
    chat: {
      inputPlaceholder: "Ceritakan apa yang sedang kamu rasakan...",
      send: "KIRIM",
      typing: "Sedang merespons...",
      stressLabel: "Indikator Emosi Terdeteksi",
      newSession: "PERCAKAPAN BARU",
      disclaimer:
        "Sanctuary AI bukan pengganti profesional kesehatan mental. Jika kamu membutuhkan bantuan segera, hubungi tenaga kesehatan mental atau hotline terdekat.",
      emptyState:
        "Mulai percakapan kapanpun kamu siap. Tidak ada yang terlalu besar atau terlalu kecil untuk diceritakan di sini.",
    },
    history: {
      title: "Riwayat Percakapan",
      subtitle: "Setiap sesi tersimpan sebagai catatan perjalanan emosionalmu.",
      empty: "Belum ada riwayat percakapan. Mulai sesi pertamamu.",
      messages: "pesan",
      avgStress: "Rata-rata emosi",
    },
    insights: {
      title: "Wawasan Emosional",
      subtitle: "Pola dari semua percakapanmu dengan Sanctuary AI.",
      totalSessions: "Total Sesi",
      totalMessages: "Total Pesan",
      dominantStress: "Emosi Dominan",
      mostActive: "Sesi Terpanjang",
      noData:
        "Belum cukup data. Mulai bercerita untuk melihat pola emosionalmu.",
      stressDistribution: "Distribusi Level Emosi",
      timeline: "Timeline Sesi",
    },
  },
  en: {
    pageLabel: "06 // SANCTUARY AI",
    headline1: "Space to",
    headline2: "Be Heard.",
    subtitle:
      "An emotional reflection companion available 24/7 — zero judgment.",
    statusLabel: "AI ACTIVE · ZERO JUDGMENT",
    tabs: { chat: "CHAT", history: "HISTORY", insights: "INSIGHTS" },
    chat: {
      inputPlaceholder: "Tell me what you're feeling right now...",
      send: "SEND",
      typing: "Responding...",
      stressLabel: "Detected Emotional Indicator",
      newSession: "NEW SESSION",
      disclaimer:
        "Sanctuary AI is not a replacement for a mental health professional. If you need immediate help, please contact a mental health professional or a crisis hotline.",
      emptyState:
        "Start a conversation whenever you're ready. Nothing is too big or too small to share here.",
    },
    history: {
      title: "Conversation History",
      subtitle: "Each session is saved as a record of your emotional journey.",
      empty: "No conversation history yet. Start your first session.",
      messages: "messages",
      avgStress: "Avg emotion",
    },
    insights: {
      title: "Emotional Insights",
      subtitle: "Patterns from all your conversations with Sanctuary AI.",
      totalSessions: "Total Sessions",
      totalMessages: "Total Messages",
      dominantStress: "Dominant Emotion",
      mostActive: "Longest Session",
      noData:
        "Not enough data yet. Start sharing to see your emotional patterns.",
      stressDistribution: "Emotion Level Distribution",
      timeline: "Session Timeline",
    },
  },
};

function getOpeningMessage(lang: string): Message {
  const content =
    lang === "id"
      ? "Halo. Aku Ara dari Equil — pendamping refleksimu. Ruang ini aman, privat, dan tanpa penghakiman.\nCeritakan apa yang sedang ada di pikiranmu hari ini. Tidak perlu rapi, tidak perlu lengkap. Mulai saja."
      : "Hello. I'm Ara from Equil — your reflection companion. This space is safe, private, and judgment-free.\nTell me what's on your mind today. It doesn't need to be perfect or complete. Just start.";
  return {
    id: "ai-opening",
    role: "ai",
    content,
    timestamp: Date.now(),
  };
}

// ─────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────
export default function SanctuaryAIPage() {
  const { language } = useLanguage();
  const t = dict[language as keyof typeof dict] || dict.id;

  const [activeTab, setActiveTab] = useState<"chat" | "history" | "insights">(
    "chat",
  );
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Chat state
  const [messages, setMessages] = useState<Message[]>([
    getOpeningMessage(language),
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [currentStress, setCurrentStress] = useState<StressReading>("calm");
  const [sessions, setSessions] = useState<Session[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const userMessageCount = useRef(0);
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editSessionTitle, setEditSessionTitle] = useState('');

  // CRUD state
  const deleteSession = (id: string) => {
    setSessions((prev) => {
      const updated = prev.filter((s) => s.id !== id);
      localStorage.setItem("ai_sessions", JSON.stringify(updated));
      return updated;
    });
  };

  const saveEditSession = (id: string) => {
    if (!editSessionTitle.trim()) return;
    setSessions(prev => {
      const updated = prev.map(s => s.id === id ? { ...s, title: editSessionTitle } : s);
      localStorage.setItem('ai_sessions', JSON.stringify(updated));
      return updated;
    });
    setEditingSessionId(null);
  };

  // Parallax
  useEffect(() => {
    const h = (e: MouseEvent) =>
      setMousePos({
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: (e.clientY / window.innerHeight) * 2 - 1,
      });
    window.addEventListener("mousemove", h);
    return () => window.removeEventListener("mousemove", h);
  }, []);

  // Load sessions
  useEffect(() => {
    const s = localStorage.getItem("ai_sessions");
    if (s) setSessions(JSON.parse(s));
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Persist current session on unmount
  const saveSession = useCallback(() => {
    const userMsgs = messages.filter((m) => m.role === "user");
    if (userMsgs.length === 0) return;
    const session: Session = {
      id: Date.now().toString(),
      startedAt: messages[0].timestamp,
      title:
        userMsgs[0].content.slice(0, 50) +
        (userMsgs[0].content.length > 50 ? "..." : ""),
      messages,
      avgStress: avgStressLevel(messages),
    };
    const updated = [session, ...sessions].slice(0, 20);
    setSessions(updated);
    localStorage.setItem("ai_sessions", JSON.stringify(updated));
  }, [messages, sessions]);

  // TUNING TERBARU: MENGHUBUNGKAN LANGSUNG KE JALUR PIPELINES /API/CHAT
  const handleSend = useCallback(async () => {
    if (!input.trim() || isTyping) return;
    const text = input.trim();
    setInput("");

    const stress = detectStress(text, language);
    setCurrentStress(stress);
    userMessageCount.current += 1;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text,
      timestamp: Date.now(),
      stressReading: stress,
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    let aiContent = "";
    try {
      // Tembak rahasia ke route handler yang sudah terpasang API Key Gemini 1.5 Flash
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: text }),
      });

      if (response.ok) {
        const data = await response.json();
        aiContent = data.reply;
      } else {
        // Fallback otomatis ke text pool bawaan jika API gagal merespons
        aiContent = generateAIResponse(
          text,
          stress,
          language,
          userMessageCount.current,
        );
      }
    } catch (error) {
      console.error("API Error, falling back to local simulation:", error);
      aiContent = generateAIResponse(
        text,
        stress,
        language,
        userMessageCount.current,
      );
    }

    const aiMsg: Message = {
      id: (Date.now() + 1).toString(),
      role: "ai",
      content: aiContent,
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, aiMsg]);
    setIsTyping(false);
  }, [input, isTyping, language]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const startNewSession = () => {
    saveSession();
    userMessageCount.current = 0;
    setMessages([getOpeningMessage(language)]);
    setCurrentStress("calm");
    setInput("");
  };

  // ── INSIGHTS COMPUTED ──
  const allMessages = sessions.flatMap((s) => s.messages);
  const userMessages = allMessages.filter((m) => m.role === "user");
  const stressDist: Partial<Record<StressReading, number>> = {};
  userMessages.forEach((m) => {
    if (m.stressReading)
      stressDist[m.stressReading] = (stressDist[m.stressReading] || 0) + 1;
  });
  const dominantStress =
    (Object.entries(stressDist) as [StressReading, number][]).sort(
      (a, b) => b[1] - a[1],
    )[0]?.[0] || "calm";
  const longestSession = [...sessions].sort(
    (a, b) => b.messages.length - a.messages.length,
  )[0];

  // ─────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────
  return (
    <div className="space-y-10 pb-24">
      {/* ── HERO ── */}
      <section className="relative w-full">
        <div
          className="absolute -top-12 -right-16 w-72 h-72 rounded-full pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, rgba(45,106,79,0.04) 0%, transparent 70%)",
            transform: `translate(${mousePos.x * -16}px, ${mousePos.y * -8}px)`,
            transition: "transform 0.18s ease-out",
          }}
        />
        <span className="block text-[10px] font-mono tracking-[0.3em] text-[#141313]/35 uppercase mb-5">
          {t.pageLabel}
        </span>
        <div
          style={{
            transform: `translate(${mousePos.x * 6}px, ${mousePos.y * 3}px)`,
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
        <p className="mt-5 text-[11px] font-mono tracking-[0.2em] text-[#141313]/60 uppercase">
          {t.subtitle}
        </p>
        <div className="mt-6 flex items-center gap-4">
          <div className="w-1.5 h-1.5 rounded-full bg-[#2D6A4F] animate-pulse shrink-0" />
          <span className="text-[8px] font-mono tracking-[0.35em] text-[#141313]/50 uppercase">
            {t.statusLabel}
          </span>
          <div className="h-px flex-1 bg-black/5" />
        </div>
      </section>

      {/* ── TABS ── */}
      <div className="flex bg-gray-100/50 p-1 rounded-full gap-1">
        {(["chat", "history", "insights"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2.5 text-[9px] font-mono font-bold tracking-[0.3em] uppercase transition-all duration-300 rounded-full ${
              activeTab === tab
                ? "bg-white text-emerald-800 shadow-sm"
                : "text-gray-500 hover:text-slate-700 px-4 py-2"
            }`}
          >
            {t.tabs[tab]}
          </button>
        ))}
      </div>

      {/* CHAT TAB */}
      {activeTab === "chat" && (
        <section className="space-y-6">
          <div className="flex items-center gap-4">
            <span className="text-[8px] font-mono tracking-[0.3em] text-[#141313]/60 uppercase shrink-0">
              {t.chat.stressLabel}
            </span>
            <div className="flex-1 h-[2px] bg-black/5 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-1000 ease-out"
                style={{
                  width: STRESS_CONFIG[currentStress].barWidth,
                  backgroundColor: STRESS_CONFIG[currentStress].dot,
                  opacity: 0.6,
                }}
              />
            </div>
            <span
              className="text-[8px] font-mono tracking-widest shrink-0 transition-all duration-500"
              style={{ color: STRESS_CONFIG[currentStress].dot }}
            >
              {language === "id"
                ? STRESS_CONFIG[currentStress].labelId
                : STRESS_CONFIG[currentStress].labelEn}
            </span>
          </div>

          <div className="space-y-1 min-h-[360px] max-h-[520px] overflow-y-auto pr-2">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} mb-4`}
              >
                {msg.role === "ai" && (
                  <div className="w-5 h-5 rounded-full bg-[#2D6A4F]/10 flex items-center justify-center shrink-0 mt-0.5 mr-3">
                    <span className="text-[7px] text-[#2D6A4F]/60">AI</span>
                  </div>
                )}
                <div
                  className={`max-w-[78%] ${
                    msg.role === "user"
                      ? "bg-emerald-700 text-white rounded-2xl rounded-br-sm px-4 py-3 shadow-sm"
                      : "bg-white border border-gray-100 shadow-sm text-slate-700 rounded-2xl rounded-bl-sm px-4 py-3"
                  }`}
                >
                  <p
                    className={`text-[12px] leading-relaxed font-sans whitespace-pre-wrap ${
                      msg.role === "ai" ? "text-slate-700" : "text-white"
                    }`}
                  >
                    {msg.content}
                  </p>
                  <p
                    className={`text-[7px] font-mono mt-1.5 ${
                      msg.role === "user"
                        ? "text-white/50 text-right"
                        : "text-slate-400"
                    }`}
                  >
                    {new Date(msg.timestamp).toLocaleTimeString(
                      language === "id" ? "id-ID" : "en-US",
                      { hour: "2-digit", minute: "2-digit" },
                    )}
                  </p>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-3 mb-4">
                <div className="w-5 h-5 rounded-full bg-[#2D6A4F]/10 flex items-center justify-center shrink-0">
                  <span className="text-[7px] text-[#2D6A4F]/60">AI</span>
                </div>
                <div className="flex items-center gap-1.5 bg-white border border-gray-100 shadow-sm rounded-2xl px-4 py-3">
                  {[0, 0.2, 0.4].map((delay, i) => (
                    <div
                      key={i}
                      className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce"
                      style={{ animationDelay: `${delay}s` }}
                    />
                  ))}
                  <span className="text-[8px] font-mono text-slate-500 ml-2">
                    {t.chat.typing}
                  </span>
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          <div className="border-t border-gray-100 pt-5 space-y-3">
            <div className="bg-white border border-gray-200 shadow-sm rounded-2xl px-4 py-3 flex items-end gap-3">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t.chat.inputPlaceholder}
                rows={2}
                disabled={isTyping}
                className="flex-1 bg-transparent outline-none resize-none text-sm text-[#141313]/80 placeholder:text-gray-400 font-sans leading-relaxed disabled:opacity-40"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
                className={`px-4 py-2 rounded-xl text-[8px] font-mono font-bold tracking-[0.3em] uppercase transition-all duration-200 shrink-0 font-medium ${
                  input.trim() && !isTyping
                    ? "bg-emerald-700 text-white hover:bg-emerald-800"
                    : "bg-gray-100 text-gray-400 cursor-not-allowed"
                }`}
              >
                {t.chat.send}
              </button>
            </div>

            <div className="flex items-center justify-between">
              <p className="text-[8px] font-sans text-[#141313]/40 italic max-w-sm leading-relaxed">
                {t.chat.disclaimer}
              </p>
              <button
                onClick={startNewSession}
                className="text-[8px] font-mono tracking-[0.25em] uppercase text-[#141313]/40 hover:text-[#141313]/60 transition-colors shrink-0 ml-4"
              >
                + {t.chat.newSession}
              </button>
            </div>
          </div>
        </section>
      )}

      {/* HISTORY TAB */}
      {activeTab === "history" && (
        <section className="space-y-8">
          <div>
            <h2 className="text-sm font-bold tracking-tight text-[#141313] mb-1">
              {t.history.title}
            </h2>
            <p className="text-[10px] font-mono text-[#141313]/60 tracking-widest">
              {t.history.subtitle}
            </p>
          </div>

          {sessions.length === 0 ? (
            <p className="text-[10px] font-mono text-[#141313]/50 italic">
              {t.history.empty}
            </p>
          ) : (
            <div className="space-y-0">
              {sessions.map((session) => {
                const cfg = STRESS_CONFIG[session.avgStress];
                return (
                  <div
                    key={session.id}
                    className="group bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-row items-center justify-between p-4 mb-3 hover:shadow-md transition-shadow"
                  >
                    {editingSessionId === session.id ? (
                      <div className="flex-1 space-y-3">
                        <input
                          value={editSessionTitle}
                          onChange={e => setEditSessionTitle(e.target.value)}
                          className="w-full bg-white border border-gray-200 shadow-sm rounded-xl px-3 py-2 text-xs text-[#141313]/80 font-sans outline-none focus:border-emerald-400 transition-colors"
                          placeholder="Session Title"
                        />
                        <div className="flex gap-2">
                          <button onClick={() => saveEditSession(session.id)} className="px-4 py-1.5 bg-emerald-700 text-white text-[8px] font-mono font-bold tracking-widest uppercase rounded-full hover:bg-emerald-800 transition-colors">
                            {language === 'id' ? 'SIMPAN' : 'SAVE'}
                          </button>
                          <button onClick={() => setEditingSessionId(null)} className="px-4 py-1.5 border border-gray-200 text-gray-500 text-[8px] font-mono font-bold tracking-widest uppercase rounded-full hover:bg-gray-50 transition-colors">
                            {language === 'id' ? 'BATAL' : 'CANCEL'}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex-1 pr-4 flex items-start gap-4">
                          <div
                            className="w-2 h-2 rounded-full shrink-0 mt-1.5"
                            style={{ backgroundColor: cfg.dot, opacity: 0.8 }}
                          />
                          <div className="min-w-0 flex-1">
                            <p className="text-[11px] font-sans text-[#141313]/70 mb-2 leading-snug">
                              "{session.title}"
                            </p>
                            <div className="flex items-center gap-3 flex-wrap">
                              <span className="text-[7px] font-mono text-[#141313]/50 tracking-widest">
                                {new Date(session.startedAt).toLocaleDateString(
                                  language === "id" ? "id-ID" : "en-US",
                                  {
                                    weekday: "long",
                                    day: "numeric",
                                    month: "short",
                                  },
                                )}
                              </span>
                              <span className="w-0.5 h-0.5 rounded-full bg-[#141313]/15" />
                              <span className="text-[7px] font-mono text-[#141313]/50 tracking-widest">
                                {
                                  session.messages.filter((m) => m.role === "user")
                                    .length
                                }{" "}
                                {t.history.messages}
                              </span>
                              <span
                                className="text-[7px] font-mono tracking-widest px-2 py-0.5 rounded-md"
                                style={{
                                  backgroundColor: cfg.dot + "20",
                                  color: cfg.dot,
                                }}
                              >
                                {t.history.avgStress}:{" "}
                                {language === "id" ? cfg.labelId : cfg.labelEn}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 shrink-0 m-0">
                          <button
                            onClick={() => { setEditingSessionId(session.id); setEditSessionTitle(session.title); }}
                            className="flex items-center justify-center w-10 h-10 rounded-xl text-emerald-600 hover:bg-emerald-50 transition-colors m-0 p-0 opacity-0 group-hover:opacity-100 duration-200"
                            title="Rename session"
                          >
                            ✎
                          </button>
                          <button
                            onClick={() => deleteSession(session.id)}
                            className="flex items-center justify-center w-10 h-10 rounded-xl text-rose-500 hover:bg-rose-50 transition-colors m-0 p-0 text-lg opacity-0 group-hover:opacity-100 duration-200"
                            title="Delete session"
                          >
                            ×
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* INSIGHTS TAB */}
      {activeTab === "insights" && (
        <section className="space-y-10">
          <div>
            <h2 className="text-sm font-bold tracking-tight text-[#141313] mb-1">
              {t.insights.title}
            </h2>
            <p className="text-[10px] font-mono text-[#141313]/60 tracking-widest">
              {t.insights.subtitle}
            </p>
          </div>

          {sessions.length < 2 ? (
            <p className="text-[10px] font-mono text-[#141313]/50 italic">
              {t.insights.noData}
            </p>
          ) : (
            <>
              <div className="flex gap-10 flex-wrap border-b border-black/6 pb-8">
                {[
                  { value: sessions.length, label: t.insights.totalSessions },
                  {
                    value: userMessages.length,
                    label: t.insights.totalMessages,
                  },
                  {
                    value:
                      language === "id"
                        ? STRESS_CONFIG[dominantStress].labelId
                        : STRESS_CONFIG[dominantStress].labelEn,
                    label: t.insights.dominantStress,
                  },
                  {
                    value: longestSession
                      ? `${longestSession.messages.filter((m) => m.role === "user").length} msg`
                      : "—",
                    label: t.insights.mostActive,
                  },
                ].map((s, i) => (
                  <div key={i}>
                    <span className="block text-2xl font-extrabold tracking-tighter text-slate-800 leading-none mb-1">
                      {s.value}
                    </span>
                    <span className="text-[8px] font-mono tracking-widest text-[#141313]/60 uppercase">
                      {s.label}
                    </span>
                  </div>
                ))}
              </div>

              <div>
                <span className="text-[8px] font-mono tracking-[0.4em] text-[#141313]/60 uppercase block mb-5">
                  {t.insights.stressDistribution}
                </span>
                <div className="space-y-3">
                  {STRESS_ORDER.map((level) => {
                    const count = stressDist[level] || 0;
                    const maxCount = Math.max(...Object.values(stressDist), 1);
                    const pct = (count / maxCount) * 100;
                    const cfg = STRESS_CONFIG[level];
                    return (
                      <div key={level} className="flex items-center gap-4">
                        <span className="w-20 text-[8px] font-mono text-[#141313]/60 uppercase shrink-0">
                          {language === "id" ? cfg.labelId : cfg.labelEn}
                        </span>
                        <div className="flex-1 h-[2px] bg-black/5 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{
                              width: `${pct}%`,
                              backgroundColor: cfg.dot,
                              opacity: 0.5,
                            }}
                          />
                        </div>
                        <span className="text-[8px] font-mono text-[#141313]/50 w-6 text-right shrink-0">
                          {count}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <span className="text-[8px] font-mono tracking-[0.4em] text-[#141313]/60 uppercase block mb-5">
                  {t.insights.timeline}
                </span>
                <div className="relative">
                  <div className="absolute left-[5px] top-0 bottom-0 w-px bg-black/5" />
                  <div className="space-y-4 pl-6">
                    {sessions.slice(0, 8).map((session) => {
                      const cfg = STRESS_CONFIG[session.avgStress];
                      return (
                        <div
                          key={session.id}
                          className="relative flex items-start gap-3"
                        >
                          <div
                            className="absolute -left-[19px] w-2.5 h-2.5 rounded-full border-2 border-[#F9F9F9] shrink-0 mt-0.5"
                            style={{ backgroundColor: cfg.dot, opacity: 0.6 }}
                          />
                          <div>
                            <p className="text-[10px] font-sans text-[#141313]/50 leading-snug">
                              "{session.title.slice(0, 40)}
                              {session.title.length > 40 ? "..." : ""}"
                            </p>
                            <span className="text-[7px] font-mono text-[#141313]/40">
                              {new Date(session.startedAt).toLocaleDateString(
                                language === "id" ? "id-ID" : "en-US",
                                { day: "numeric", month: "short" },
                              )}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </>
          )}
        </section>
      )}
    </div>
  );
}
