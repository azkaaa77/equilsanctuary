"use client";

import React, { useState, useEffect } from "react";
import { useLanguage } from "@/components/providers/language-provider";

// ─────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────
type Tab = "pathfinder" | "roadmap" | "blueprint";
type SkillLevel = 0 | 1 | 2 | 3;

interface GoalEntry {
  id: string;
  text: string;
  year: number;
  quarter: string;
  category: string;
  done: boolean;
}

// ─────────────────────────────────────────────────────────────
// PATHFINDER — universal SPV data
// ─────────────────────────────────────────────────────────────
type DomainId =
  | "creative"
  | "analytical"
  | "social"
  | "technical"
  | "entrepreneurial"
  | "academic";

const SPV: {
  id: string;
  labelId: string;
  labelEn: string;
  category: "skill" | "passion" | "value";
  weights: Partial<Record<DomainId, number>>;
}[] = [
  // SKILL
  {
    id: "communication",
    labelId: "Komunikasi & Presentasi",
    labelEn: "Communication & Presentation",
    category: "skill",
    weights: { social: 4, creative: 2, entrepreneurial: 2 },
  },
  {
    id: "critical_thinking",
    labelId: "Berpikir Kritis & Analitis",
    labelEn: "Critical Thinking & Analysis",
    category: "skill",
    weights: { analytical: 4, academic: 3, technical: 2 },
  },
  {
    id: "creativity",
    labelId: "Kreativitas & Estetika",
    labelEn: "Creativity & Aesthetics",
    category: "skill",
    weights: { creative: 5, entrepreneurial: 2 },
  },
  {
    id: "problem_solving",
    labelId: "Pemecahan Masalah",
    labelEn: "Problem Solving",
    category: "skill",
    weights: { technical: 4, analytical: 3, entrepreneurial: 3 },
  },
  {
    id: "leadership",
    labelId: "Kepemimpinan & Organisasi",
    labelEn: "Leadership & Organization",
    category: "skill",
    weights: { social: 3, entrepreneurial: 4 },
  },
  {
    id: "technical_skill",
    labelId: "Keahlian Teknis / Digital",
    labelEn: "Technical / Digital Skills",
    category: "skill",
    weights: { technical: 5, analytical: 2 },
  },

  // PASSION
  {
    id: "helping",
    labelId: "Membantu & Mendampingi Orang Lain",
    labelEn: "Helping & Supporting Others",
    category: "passion",
    weights: { social: 5, academic: 1 },
  },
  {
    id: "building",
    labelId: "Membangun & Menciptakan Sesuatu",
    labelEn: "Building & Creating Things",
    category: "passion",
    weights: { technical: 3, creative: 4, entrepreneurial: 3 },
  },
  {
    id: "researching",
    labelId: "Meneliti & Mempelajari Hal Baru",
    labelEn: "Researching & Learning New Things",
    category: "passion",
    weights: { academic: 5, analytical: 3 },
  },
  {
    id: "storytelling",
    labelId: "Bercerita, Menulis & Seni",
    labelEn: "Storytelling, Writing & Arts",
    category: "passion",
    weights: { creative: 5, social: 2 },
  },
  {
    id: "strategizing",
    labelId: "Merancang Strategi & Bisnis",
    labelEn: "Strategizing & Business Design",
    category: "passion",
    weights: { entrepreneurial: 5, analytical: 3 },
  },
  {
    id: "systems",
    labelId: "Merancang Sistem & Teknologi",
    labelEn: "Designing Systems & Technology",
    category: "passion",
    weights: { technical: 5, analytical: 3 },
  },

  // VALUE
  {
    id: "impact",
    labelId: "Dampak Nyata bagi Masyarakat",
    labelEn: "Real Impact on Society",
    category: "value",
    weights: { social: 4, entrepreneurial: 3, academic: 2 },
  },
  {
    id: "autonomy",
    labelId: "Kebebasan & Kemandirian Kerja",
    labelEn: "Autonomy & Work Independence",
    category: "value",
    weights: { creative: 3, entrepreneurial: 4, technical: 2 },
  },
  {
    id: "mastery",
    labelId: "Penguasaan Keahlian Mendalam",
    labelEn: "Deep Mastery of a Craft",
    category: "value",
    weights: { academic: 4, technical: 3, analytical: 2 },
  },
  {
    id: "stability",
    labelId: "Stabilitas & Keamanan Finansial",
    labelEn: "Financial Stability & Security",
    category: "value",
    weights: { analytical: 3, social: 2, technical: 3 },
  },
  {
    id: "recognition",
    labelId: "Pengakuan & Pengaruh",
    labelEn: "Recognition & Influence",
    category: "value",
    weights: { creative: 3, social: 3, entrepreneurial: 4 },
  },
  {
    id: "growth_value",
    labelId: "Pertumbuhan & Eksplorasi Terus-menerus",
    labelEn: "Continuous Growth & Exploration",
    category: "value",
    weights: { academic: 4, analytical: 2, entrepreneurial: 3 },
  },
];

const DOMAINS: {
  id: DomainId;
  icon: string;
  labelId: string;
  labelEn: string;
  descId: string;
  descEn: string;
  paths: { labelId: string; labelEn: string }[];
}[] = [
  {
    id: "creative",
    icon: "◐",
    labelId: "Kreatif & Artistik",
    labelEn: "Creative & Artistic",
    descId: "Ekspresi, estetika, dan storytelling sebagai kekuatan utama.",
    descEn: "Expression, aesthetics, and storytelling as your core strength.",
    paths: [
      { labelId: "Desainer Visual / UX", labelEn: "Visual / UX Designer" },
      {
        labelId: "Content Creator & Strategi Konten",
        labelEn: "Content Creator & Strategy",
      },
      { labelId: "Penulis & Jurnalis", labelEn: "Writer & Journalist" },
      {
        labelId: "Fotografer & Videografer",
        labelEn: "Photographer & Videographer",
      },
    ],
  },
  {
    id: "analytical",
    icon: "◑",
    labelId: "Analitis & Riset",
    labelEn: "Analytical & Research",
    descId:
      "Berpikir mendalam, mengolah data, dan menarik kesimpulan dari kompleksitas.",
    descEn:
      "Deep thinking, processing data, and drawing insight from complexity.",
    paths: [
      {
        labelId: "Analis Data & Business Intelligence",
        labelEn: "Data Analyst & Business Intelligence",
      },
      { labelId: "Konsultan Strategi", labelEn: "Strategy Consultant" },
      { labelId: "Peneliti Akademis", labelEn: "Academic Researcher" },
      { labelId: "Financial Analyst", labelEn: "Financial Analyst" },
    ],
  },
  {
    id: "social",
    icon: "◒",
    labelId: "Sosial & Humanis",
    labelEn: "Social & Humanistic",
    descId:
      "Energi dan tujuan yang berpusat pada orang, komunitas, dan hubungan.",
    descEn:
      "Energy and purpose centered on people, community, and relationships.",
    paths: [
      { labelId: "Psikolog & Konselor", labelEn: "Psychologist & Counselor" },
      { labelId: "Pendidik & Fasilitator", labelEn: "Educator & Facilitator" },
      {
        labelId: "HR & People Development",
        labelEn: "HR & People Development",
      },
      { labelId: "Social Worker & NGO", labelEn: "Social Worker & NGO" },
    ],
  },
  {
    id: "technical",
    icon: "◓",
    labelId: "Teknikal & Digital",
    labelEn: "Technical & Digital",
    descId:
      "Membangun, mengoptimalkan, dan merancang sistem yang bekerja secara presisi.",
    descEn:
      "Building, optimizing, and designing systems that work with precision.",
    paths: [
      {
        labelId: "Software Engineer / Developer",
        labelEn: "Software Engineer / Developer",
      },
      {
        labelId: "Cybersecurity Specialist",
        labelEn: "Cybersecurity Specialist",
      },
      {
        labelId: "Cloud & DevOps Engineer",
        labelEn: "Cloud & DevOps Engineer",
      },
      {
        labelId: "AI / Machine Learning Engineer",
        labelEn: "AI / Machine Learning Engineer",
      },
    ],
  },
  {
    id: "entrepreneurial",
    icon: "◕",
    labelId: "Wirausaha & Inovator",
    labelEn: "Entrepreneurial & Innovator",
    descId:
      "Menciptakan peluang, mengambil risiko terukur, dan mendorong perubahan.",
    descEn:
      "Creating opportunities, taking calculated risks, and driving change.",
    paths: [
      { labelId: "Founder / Entrepreneur", labelEn: "Founder / Entrepreneur" },
      { labelId: "Product Manager", labelEn: "Product Manager" },
      { labelId: "Business Development", labelEn: "Business Development" },
      {
        labelId: "Growth & Marketing Strategist",
        labelEn: "Growth & Marketing Strategist",
      },
    ],
  },
  {
    id: "academic",
    icon: "●",
    labelId: "Akademis & Spesialis",
    labelEn: "Academic & Specialist",
    descId:
      "Kedalaman pengetahuan, riset lanjutan, dan otoritas di bidang tertentu.",
    descEn:
      "Depth of knowledge, advanced research, and authority in a specific field.",
    paths: [
      { labelId: "Dosen & Peneliti", labelEn: "Lecturer & Researcher" },
      {
        labelId: "Dokter & Tenaga Medis",
        labelEn: "Doctor & Medical Professional",
      },
      {
        labelId: "Lawyer & Legal Specialist",
        labelEn: "Lawyer & Legal Specialist",
      },
      {
        labelId: "Ilmuwan & Insinyur Riset",
        labelEn: "Scientist & Research Engineer",
      },
    ],
  },
];

const LEVEL_LABELS_ID = ["Belum", "Dasar", "Menengah", "Mahir"];
const LEVEL_LABELS_EN = ["None", "Basic", "Intermediate", "Advanced"];

// ─────────────────────────────────────────────────────────────
// ROADMAP — general learning resources per domain
// ─────────────────────────────────────────────────────────────
const ROADMAP_STEPS: Record<
  DomainId,
  {
    phase: string;
    phaseEn: string;
    items: { labelId: string; labelEn: string; type: string }[];
  }[]
> = {
  creative: [
    {
      phase: "Fondasi",
      phaseEn: "Foundation",
      items: [
        {
          labelId: "Prinsip Desain & Komposisi",
          labelEn: "Design Principles & Composition",
          type: "core",
        },
        {
          labelId: "Storytelling & Narasi Visual",
          labelEn: "Storytelling & Visual Narrative",
          type: "core",
        },
      ],
    },
    {
      phase: "Portofolio",
      phaseEn: "Portfolio",
      items: [
        {
          labelId: "Bangun 5 Proyek Nyata",
          labelEn: "Build 5 Real Projects",
          type: "milestone",
        },
        {
          labelId: "Aktif di Platform (Behance, Dribbble)",
          labelEn: "Active on Platforms (Behance, Dribbble)",
          type: "action",
        },
      ],
    },
    {
      phase: "Karier",
      phaseEn: "Career",
      items: [
        {
          labelId: "Magang / Freelance Pertama",
          labelEn: "First Internship / Freelance",
          type: "milestone",
        },
        {
          labelId: "Kembangkan Personal Brand",
          labelEn: "Develop Personal Brand",
          type: "action",
        },
      ],
    },
  ],
  analytical: [
    {
      phase: "Fondasi",
      phaseEn: "Foundation",
      items: [
        {
          labelId: "Statistik & Probabilitas Dasar",
          labelEn: "Basic Statistics & Probability",
          type: "core",
        },
        {
          labelId: "Spreadsheet & SQL",
          labelEn: "Spreadsheet & SQL",
          type: "core",
        },
      ],
    },
    {
      phase: "Sertifikasi",
      phaseEn: "Certification",
      items: [
        {
          labelId: "Google Data Analytics (Coursera)",
          labelEn: "Google Data Analytics (Coursera)",
          type: "cert",
        },
        {
          labelId: "CFA Level 1 (jika Finance)",
          labelEn: "CFA Level 1 (if Finance)",
          type: "cert",
        },
      ],
    },
    {
      phase: "Karier",
      phaseEn: "Career",
      items: [
        {
          labelId: "Case Competition / Riset",
          labelEn: "Case Competition / Research",
          type: "milestone",
        },
        {
          labelId: "Publikasi atau Portofolio Analisis",
          labelEn: "Publication or Analysis Portfolio",
          type: "action",
        },
      ],
    },
  ],
  social: [
    {
      phase: "Fondasi",
      phaseEn: "Foundation",
      items: [
        {
          labelId: "Psikologi Dasar & Perilaku Manusia",
          labelEn: "Basic Psychology & Human Behavior",
          type: "core",
        },
        {
          labelId: "Komunikasi Efektif & Empati",
          labelEn: "Effective Communication & Empathy",
          type: "core",
        },
      ],
    },
    {
      phase: "Pengalaman",
      phaseEn: "Experience",
      items: [
        {
          labelId: "Volunteering / Komunitas",
          labelEn: "Volunteering / Community",
          type: "action",
        },
        {
          labelId: "Peer Counseling / Mentoring",
          labelEn: "Peer Counseling / Mentoring",
          type: "milestone",
        },
      ],
    },
    {
      phase: "Karier",
      phaseEn: "Career",
      items: [
        {
          labelId: "Sertifikasi HR (CHRP) / Konseling",
          labelEn: "HR Certification (CHRP) / Counseling",
          type: "cert",
        },
        {
          labelId: "Network Komunitas Profesional",
          labelEn: "Professional Community Network",
          type: "action",
        },
      ],
    },
  ],
  technical: [
    {
      phase: "Fondasi",
      phaseEn: "Foundation",
      items: [
        {
          labelId: "Logika Pemrograman & Algoritma",
          labelEn: "Programming Logic & Algorithms",
          type: "core",
        },
        {
          labelId: "Jaringan & Sistem Operasi Dasar",
          labelEn: "Basic Networks & Operating Systems",
          type: "core",
        },
      ],
    },
    {
      phase: "Sertifikasi",
      phaseEn: "Certification",
      items: [
        {
          labelId: "CompTIA A+ / AWS Cloud Practitioner",
          labelEn: "CompTIA A+ / AWS Cloud Practitioner",
          type: "cert",
        },
        {
          labelId: "Google / Meta Professional Certificate",
          labelEn: "Google / Meta Professional Certificate",
          type: "cert",
        },
      ],
    },
    {
      phase: "Karier",
      phaseEn: "Career",
      items: [
        {
          labelId: "Proyek Open Source / Hackathon",
          labelEn: "Open Source Projects / Hackathon",
          type: "milestone",
        },
        {
          labelId: "Bangun GitHub Portfolio",
          labelEn: "Build GitHub Portfolio",
          type: "action",
        },
      ],
    },
  ],
  entrepreneurial: [
    {
      phase: "Fondasi",
      phaseEn: "Foundation",
      items: [
        {
          labelId: "Lean Startup & Business Model Canvas",
          labelEn: "Lean Startup & Business Model Canvas",
          type: "core",
        },
        {
          labelId: "Dasar Marketing & Growth Hacking",
          labelEn: "Marketing Basics & Growth Hacking",
          type: "core",
        },
      ],
    },
    {
      phase: "Eksekusi",
      phaseEn: "Execution",
      items: [
        {
          labelId: "Validasi Ide dengan MVP",
          labelEn: "Validate Idea with MVP",
          type: "milestone",
        },
        {
          labelId: "Ikut Program Inkubator / Kompetisi",
          labelEn: "Join Incubator / Competition Program",
          type: "action",
        },
      ],
    },
    {
      phase: "Skalabilitas",
      phaseEn: "Scale",
      items: [
        {
          labelId: "Bangun Tim Inti",
          labelEn: "Build Core Team",
          type: "milestone",
        },
        {
          labelId: "Pitching ke Investor / Grant",
          labelEn: "Pitch to Investors / Grant",
          type: "action",
        },
      ],
    },
  ],
  academic: [
    {
      phase: "Fondasi",
      phaseEn: "Foundation",
      items: [
        {
          labelId: "Metodologi Penelitian",
          labelEn: "Research Methodology",
          type: "core",
        },
        {
          labelId: "Penulisan Ilmiah & Citation",
          labelEn: "Academic Writing & Citation",
          type: "core",
        },
      ],
    },
    {
      phase: "Publikasi",
      phaseEn: "Publication",
      items: [
        {
          labelId: "Tulis & Submit Paper Pertama",
          labelEn: "Write & Submit First Paper",
          type: "milestone",
        },
        {
          labelId: "Konferensi / Seminar Akademis",
          labelEn: "Academic Conference / Seminar",
          type: "action",
        },
      ],
    },
    {
      phase: "Spesialisasi",
      phaseEn: "Specialization",
      items: [
        {
          labelId: "Program S2 / Beasiswa Riset",
          labelEn: "Graduate Program / Research Scholarship",
          type: "cert",
        },
        {
          labelId: "Kolaborasi Lab / Institusi",
          labelEn: "Lab / Institution Collaboration",
          type: "action",
        },
      ],
    },
  ],
};

const STEP_TYPE_COLORS: Record<string, string> = {
  core: "#141313",
  cert: "#2D6A4F",
  milestone: "#1A2421",
  action: "#141313",
};

// ─────────────────────────────────────────────────────────────
// DICT
// ─────────────────────────────────────────────────────────────
const dict = {
  id: {
    pageLabel: "04 // FUTURE ARCHITECTURE",
    headline1: "Rancang",
    headline2: "Masa Depan.",
    subtitle: "Navigator karier universal berbasis Skill · Passion · Nilai",
    statusLabel: "PATHFINDING ACTIVE",
    tabs: {
      pathfinder: "PATHFINDER",
      roadmap: "ROADMAP",
      blueprint: "BLUEPRINT",
    },
    pathfinder: {
      title: "Temukan Orientasi Kariermu",
      subtitle:
        "Asesmen SPV ini dirancang untuk semua bidang — bukan hanya teknologi. Jawab sejujurnya.",
      catSkill: "KEAHLIAN",
      catPassion: "MINAT",
      catValue: "NILAI HIDUP",
      catHint: "Apa yang kamu bisa?",
      catHintP: "Apa yang kamu suka?",
      catHintV: "Apa yang penting bagimu?",
      analyze: "LIHAT ORIENTASIKU",
      resultTitle: "Orientasi Kariermu",
      resultSub: "Klik domain untuk melihat jalur yang bisa kamu eksplorasi.",
      matchLabel: "RESONANSI",
      reset: "ULANGI ASESMEN",
      levelLabels: LEVEL_LABELS_ID,
      notEnough: "Isi setidaknya 9 dari 18 item untuk hasil yang akurat.",
    },
    roadmap: {
      title: "Peta Langkah",
      subtitle:
        "Pilih domain karier untuk melihat langkah pembelajaran yang disarankan.",
      selectPrompt: "Pilih domain karier di bawah ini.",
      phase: "FASE",
      typeLabel: {
        core: "FONDASI",
        cert: "SERTIFIKASI",
        milestone: "MILESTONE",
        action: "AKSI",
      },
    },
    blueprint: {
      title: "Blueprint Karier",
      subtitle: "Rancang target dan manifesto masa depanmu.",
      addGoal: "Tulis targetmu...",
      add: "TAMBAH",
      yearLabel: "TAHUN",
      categoryLabel: "KATEGORI",
      categories: [
        "Pendidikan",
        "Karier",
        "Sertifikasi",
        "Personal",
        "Keuangan",
      ],
      manifesto: "MANIFESTO KARIERKU",
      manifestoPlaceholder:
        "Tuliskan visi hidupmu dalam satu paragraf yang kuat dan jujur...",
      saveManifesto: "SIMPAN MANIFESTO",
      manifestoSaved: "TERSIMPAN",
      noGoals: "Belum ada target. Mulai rancang masa depanmu.",
      done: "SELESAI",
      pending: "AKTIF",
    },
  },
  en: {
    pageLabel: "04 // FUTURE ARCHITECTURE",
    headline1: "Architect",
    headline2: "Your Future.",
    subtitle: "Universal career navigator based on Skill · Passion · Value",
    statusLabel: "PATHFINDING ACTIVE",
    tabs: {
      pathfinder: "PATHFINDER",
      roadmap: "ROADMAP",
      blueprint: "BLUEPRINT",
    },
    pathfinder: {
      title: "Find Your Career Orientation",
      subtitle:
        "This SPV assessment is designed for all fields — not just tech. Answer honestly.",
      catSkill: "SKILLS",
      catPassion: "PASSIONS",
      catValue: "VALUES",
      catHint: "What can you do?",
      catHintP: "What do you love?",
      catHintV: "What matters to you?",
      analyze: "SEE MY ORIENTATION",
      resultTitle: "Your Career Orientation",
      resultSub: "Click a domain to explore matching career paths.",
      matchLabel: "RESONANCE",
      reset: "RETAKE ASSESSMENT",
      levelLabels: LEVEL_LABELS_EN,
      notEnough: "Fill at least 9 of 18 items for an accurate result.",
    },
    roadmap: {
      title: "Learning Roadmap",
      subtitle: "Select a career domain to see recommended learning steps.",
      selectPrompt: "Choose a career domain below.",
      phase: "PHASE",
      typeLabel: {
        core: "FOUNDATION",
        cert: "CERTIFICATION",
        milestone: "MILESTONE",
        action: "ACTION",
      },
    },
    blueprint: {
      title: "Career Blueprint",
      subtitle: "Design your goals and future manifesto.",
      addGoal: "Write your goal...",
      add: "ADD",
      yearLabel: "YEAR",
      categoryLabel: "CATEGORY",
      categories: [
        "Education",
        "Career",
        "Certification",
        "Personal",
        "Finance",
      ],
      manifesto: "MY CAREER MANIFESTO",
      manifestoPlaceholder:
        "Write your life vision in one powerful and honest paragraph...",
      saveManifesto: "SAVE MANIFESTO",
      manifestoSaved: "SAVED",
      noGoals: "No goals yet. Start designing your future.",
      done: "DONE",
      pending: "ACTIVE",
    },
  },
};

// ─────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────
export default function FutureArchitecturePage() {
  const { language } = useLanguage();
  const t = dict[language as keyof typeof dict] || dict.id;

  const [activeTab, setActiveTab] = useState<Tab>("pathfinder");
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Pathfinder
  const [scores, setScores] = useState<Record<string, SkillLevel>>({});
  const [analyzed, setAnalyzed] = useState(false);
  const [results, setResults] = useState<{ domain: DomainId; score: number }[]>(
    [],
  );
  const [expandedDomain, setExpandedDomain] = useState<DomainId | null>(null);
  const [quizStep, setQuizStep] = useState(0);

  // Roadmap
  const [selectedDomain, setSelectedDomain] = useState<DomainId | null>(null);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);

  // Blueprint
  const [goals, setGoals] = useState<GoalEntry[]>([]);
  const [newGoal, setNewGoal] = useState("");
  const [newYear, setNewYear] = useState(new Date().getFullYear() + 1);
  const [newQ, setNewQ] = useState("Q1");
  const [newCat, setNewCat] = useState(0);
  const [manifesto, setManifesto] = useState("");
  const [manifestoSaved, setManifestoSaved] = useState(false);
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);
  const [editGoalText, setEditGoalText] = useState("");

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

  // Persist
  useEffect(() => {
    const s = localStorage.getItem("fa2_scores");
    if (s) setScores(JSON.parse(s));
    const r = localStorage.getItem("fa2_results");
    if (r) {
      setResults(JSON.parse(r));
      setAnalyzed(true);
    }
    const cs = localStorage.getItem("fa2_steps");
    if (cs) setCompletedSteps(JSON.parse(cs));
    const g = localStorage.getItem("fa2_goals");
    if (g) setGoals(JSON.parse(g));
    const m = localStorage.getItem("fa2_manifesto");
    if (m) setManifesto(m);
  }, []);

  // ── Pathfinder ──
  const setScore = (id: string, level: SkillLevel) => {
    const u = { ...scores, [id]: level };
    setScores(u);
    localStorage.setItem("fa2_scores", JSON.stringify(u));
  };

  const handleAnalyze = () => {
    const domainScores: Record<DomainId, number> = {
      creative: 0,
      analytical: 0,
      social: 0,
      technical: 0,
      entrepreneurial: 0,
      academic: 0,
    };
    SPV.forEach(({ id, weights }) => {
      const level = scores[id] || 0;
      (Object.entries(weights) as [DomainId, number][]).forEach(([d, w]) => {
        domainScores[d] += level * w;
      });
    });
    const max = Math.max(...Object.values(domainScores));
    const sorted = (Object.entries(domainScores) as [DomainId, number][])
      .sort((a, b) => b[1] - a[1])
      .map(([domain, score]) => ({
        domain,
        score: max > 0 ? Math.round((score / max) * 100) : 0,
      }));
    setResults(sorted);
    setAnalyzed(true);
    localStorage.setItem("fa2_results", JSON.stringify(sorted));
  };

  const filledCount = Object.keys(scores).length;
  const canAnalyze = filledCount >= 9;

  // ── Roadmap ──
  const toggleStep = (key: string) => {
    const u = completedSteps.includes(key)
      ? completedSteps.filter((s) => s !== key)
      : [...completedSteps, key];
    setCompletedSteps(u);
    localStorage.setItem("fa2_steps", JSON.stringify(u));
  };

  // ── Blueprint ──
  const addGoal = () => {
    if (!newGoal.trim()) return;
    const entry: GoalEntry = {
      id: Date.now().toString(),
      text: newGoal,
      year: newYear,
      quarter: newQ,
      category: t.blueprint.categories[newCat],
      done: false,
    };
    const u = [...goals, entry];
    setGoals(u);
    localStorage.setItem("fa2_goals", JSON.stringify(u));
    setNewGoal("");
  };

  const toggleGoal = (id: string) => {
    const u = goals.map((g) => (g.id === id ? { ...g, done: !g.done } : g));
    setGoals(u);
    localStorage.setItem("fa2_goals", JSON.stringify(u));
  };

  const removeGoal = (id: string) => {
    const u = goals.filter((g) => g.id !== id);
    setGoals(u);
    localStorage.setItem("fa2_goals", JSON.stringify(u));
  };

  const saveEditGoal = (id: string) => {
    if (!editGoalText.trim()) return;
    const u = goals.map((g) => g.id === id ? { ...g, text: editGoalText } : g);
    setGoals(u);
    localStorage.setItem("fa2_goals", JSON.stringify(u));
    setEditingGoalId(null);
  };

  const saveManifesto = () => {
    localStorage.setItem("fa2_manifesto", manifesto);
    setManifestoSaved(true);
    setTimeout(() => setManifestoSaved(false), 2000);
  };

  // ─────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────
  return (
    <div className="space-y-12 pb-24">
      {/* ── HERO ── */}
      <section className="relative w-full">
        <div
          className="absolute -top-12 -right-20 w-80 h-80 rounded-full pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, rgba(26,36,33,0.04) 0%, transparent 70%)",
            transform: `translate(${mousePos.x * -18}px, ${mousePos.y * -8}px)`,
            transition: "transform 0.18s ease-out",
          }}
        />
        <span className="block text-[10px] font-mono tracking-[0.3em] text-[#141313]/35 uppercase mb-5">
          {t.pageLabel}
        </span>
        <div
          style={{
            transform: `translate(${mousePos.x * 7}px, ${mousePos.y * 3}px)`,
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
        <div className="mt-7 flex items-center gap-4">
          <div className="h-px w-12 bg-[#141313]/15" />
          <span className="text-[8px] font-mono tracking-[0.35em] text-[#141313]/30 uppercase">
            {t.statusLabel}
          </span>
          <div className="h-px flex-1 bg-black/5" />
        </div>
      </section>

      {/* ── TABS ── */}
      <div className="flex bg-gray-100/50 p-1 rounded-full gap-1 w-fit">
        {(["pathfinder", "roadmap", "blueprint"] as Tab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`text-[9px] font-mono font-bold tracking-[0.3em] uppercase transition-all duration-300 rounded-full ${
              activeTab === tab
                ? "bg-white rounded-full shadow-sm text-emerald-800 font-medium px-6 py-2"
                : "text-gray-500 hover:text-emerald-700 px-6 py-2 rounded-full transition-colors"
            }`}
          >
            {t.tabs[tab]}
          </button>
        ))}
      </div>

      {/* ═══════════════════════════════════ */}
      {/* PATHFINDER — Interactive Quiz        */}
      {/* ═══════════════════════════════════ */}
      {activeTab === "pathfinder" && (
        <section>
          {!analyzed ? (
            (() => {
              const currentItem = SPV[quizStep];
              const cat = currentItem?.category;
              const catLabel =
                cat === "skill"
                  ? t.pathfinder.catSkill
                  : cat === "passion"
                    ? t.pathfinder.catPassion
                    : t.pathfinder.catValue;
              const catHint =
                cat === "skill"
                  ? t.pathfinder.catHint
                  : cat === "passion"
                    ? t.pathfinder.catHintP
                    : t.pathfinder.catHintV;
              const lvls =
                language === "id" ? LEVEL_LABELS_ID : LEVEL_LABELS_EN;
              const currentAnswer = scores[currentItem?.id] as
                | SkillLevel
                | undefined;
              const progressPct = (quizStep / 18) * 100;

              // Scenario descriptions for richer UX
              const SCENARIO_ID: Record<string, string> = {
                communication:
                  "Bayangkan kamu diminta presentasi di depan 100 orang. Seberapa percaya diri kamu?",
                critical_thinking:
                  "Ada masalah rumit tanpa solusi jelas. Seberapa nyaman kamu mengurainya?",
                creativity:
                  "Kamu diberi kanvas kosong — fisik atau digital. Seberapa besar dorongan untuk menciptakan?",
                problem_solving:
                  "Sistem error, deadline besok. Seberapa tenang kamu menghadapinya?",
                leadership:
                  "Tim butuh arah dan keputusan cepat. Seberapa natural kamu mengambil peran itu?",
                technical_skill:
                  "Ada tools baru atau teknologi yang belum kamu kenal. Seberapa cepat kamu biasanya adaptasi?",
                helping:
                  "Seseorang curhat tentang masalahnya. Seberapa kuat doronganmu untuk membantu?",
                building:
                  "Kamu punya waktu luang 3 hari penuh. Apakah kamu ingin membuat sesuatu?",
                researching:
                  "Topik menarik muncul di timeline. Seberapa dalam kamu biasanya menggali?",
                storytelling:
                  "Kamu punya pengalaman unik. Seberapa besar keinginan untuk menuliskan atau menceritakannya?",
                strategizing:
                  "Ada peluang bisnis potensial. Seberapa cepat otakmu mulai menyusun strategi?",
                systems:
                  "Kamu melihat proses yang tidak efisien. Seberapa besar keinginan untuk merancang ulang sistemnya?",
                impact:
                  "Pekerjaan yang gajinya biasa tapi dampaknya besar vs gaji tinggi tanpa dampak — mana yang menarikmu?",
                autonomy:
                  "Kerja dari mana saja, jam sendiri, tanpa micromanagement. Seberapa penting itu buatmu?",
                mastery:
                  "Lebih baik tahu sedikit tentang banyak hal, atau sangat ahli di satu bidang?",
                stability:
                  "Gaji tetap vs potensi besar tapi tidak pasti. Seberapa penting rasa aman finansial?",
                recognition:
                  "Seberapa penting buatmu diakui dan didengar oleh orang lain?",
                growth_value:
                  "Rutinitas nyaman vs terus belajar hal baru yang menantang. Mana yang kamu pilih?",
              };
              const SCENARIO_EN: Record<string, string> = {
                communication:
                  "Imagine presenting to 100 people. How confident would you feel?",
                critical_thinking:
                  "A complex problem with no clear solution. How comfortable are you breaking it down?",
                creativity:
                  "You're given a blank canvas — physical or digital. How strong is your urge to create?",
                problem_solving:
                  "System error, deadline tomorrow. How calm are you handling it?",
                leadership:
                  "Your team needs direction and quick decisions. How naturally do you step up?",
                technical_skill:
                  "New tools or tech you haven't used before. How quickly do you usually adapt?",
                helping:
                  "Someone opens up about their problems. How strong is your urge to help?",
                building:
                  "You have 3 full free days. Would you want to build something?",
                researching:
                  "An interesting topic pops up. How deep do you usually dive?",
                storytelling:
                  "You have a unique experience. How much do you want to write about or share it?",
                strategizing:
                  "A potential business opportunity appears. How quickly does your mind start strategizing?",
                systems:
                  "You see an inefficient process. How much do you want to redesign the system?",
                impact:
                  "Average salary but high impact vs high salary with no impact — what draws you?",
                autonomy:
                  "Work from anywhere, your own hours, no micromanagement. How important is that to you?",
                mastery:
                  "Know a little about many things, or be deeply expert in one field?",
                stability:
                  "Stable salary vs high potential but uncertain. How important is financial security?",
                recognition:
                  "How important is it for you to be recognized and heard by others?",
                growth_value:
                  "Comfortable routine vs constantly learning challenging new things. Which do you choose?",
              };

              const scenario =
                language === "id"
                  ? SCENARIO_ID[currentItem?.id] || ""
                  : SCENARIO_EN[currentItem?.id] || "";

              const CHOICE_EMOJIS: Record<number, string> = {
                0: "○",
                1: "◔",
                2: "◑",
                3: "●",
              };

              return (
                <div className="space-y-0">
                  {/* ── TOP BAR ── */}
                  <div className="flex items-center gap-5 mb-10">
                    {/* Progress ring */}
                    <div className="relative w-14 h-14 shrink-0">
                      <svg viewBox="0 0 56 56" className="w-14 h-14 -rotate-90">
                        <circle
                          cx="28"
                          cy="28"
                          r="24"
                          fill="none"
                          stroke="rgba(20,19,19,0.04)"
                          strokeWidth="3"
                        />
                        <circle
                          cx="28"
                          cy="28"
                          r="24"
                          fill="none"
                          stroke="#141313"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeDasharray={`${2 * Math.PI * 24}`}
                          strokeDashoffset={`${2 * Math.PI * 24 * (1 - progressPct / 100)}`}
                          style={{
                            transition: "stroke-dashoffset 0.5s ease-out",
                          }}
                        />
                      </svg>
                      <span className="absolute inset-0 flex items-center justify-center text-[10px] font-mono font-bold text-[#141313]/60">
                        {quizStep + 1}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[8px] font-mono font-bold tracking-[0.4em] uppercase text-[#141313]/35">
                          {catLabel}
                        </span>
                        <span className="text-[8px] font-mono text-[#141313]/15">
                          —
                        </span>
                        <span className="text-[8px] font-sans italic text-[#141313]/25">
                          {catHint}
                        </span>
                      </div>
                      <span className="text-[9px] font-mono text-[#141313]/25">
                        {quizStep + 1} / 18
                      </span>
                    </div>

                    {/* Skip to results button */}
                    {canAnalyze && (
                      <button
                        onClick={handleAnalyze}
                        className="text-[8px] font-mono tracking-[0.25em] uppercase text-emerald-700/60 hover:text-emerald-800 transition-colors shrink-0 border border-emerald-200 px-4 py-2 rounded-full hover:border-emerald-400 hover:bg-emerald-50"
                      >
                        {language === "id" ? "LIHAT HASIL →" : "SEE RESULTS →"}
                      </button>
                    )}
                  </div>

                  {/* ── QUESTION CARD ── */}
                  <div
                    key={currentItem.id}
                    className="mb-10"
                    style={{
                      animation: "fadeSlideIn 0.4s ease-out",
                    }}
                  >
                    {/* Question label */}
                    <p className="text-lg md:text-xl font-bold tracking-tight text-[#141313] leading-snug mb-3">
                      {language === "id"
                        ? currentItem.labelId
                        : currentItem.labelEn}
                    </p>

                    {/* Scenario */}
                    <p className="text-[11px] font-sans italic text-slate-800/60 leading-relaxed mb-10 max-w-lg">
                      {scenario}
                    </p>

                    {/* Answer choices — big interactive cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {([0, 1, 2, 3] as SkillLevel[]).map((lv) => {
                        const isSelected = currentAnswer === lv;
                        return (
                          <button
                            key={lv}
                            onClick={() => {
                              setScore(currentItem.id, lv);
                              // Auto-advance after a short delay
                              setTimeout(() => {
                                if (quizStep < 17) {
                                  setQuizStep((prev) => prev + 1);
                                }
                              }, 400);
                            }}
                            className={`relative flex flex-col items-center gap-3 py-8 px-4 rounded-2xl border-2 transition-all duration-300 group ${
                              isSelected
                                ? "border-emerald-600 bg-emerald-50 text-emerald-800 scale-[1.02] shadow-sm"
                                : "border-gray-200 bg-white/50 text-gray-500 shadow-sm hover:bg-white hover:scale-[1.01]"
                            }`}
                          >
                            {/* Level indicator */}
                            <span
                              className={`text-2xl transition-all duration-300 ${
                                isSelected
                                  ? "opacity-100"
                                  : "opacity-20 group-hover:opacity-40"
                              }`}
                            >
                              {CHOICE_EMOJIS[lv]}
                            </span>

                            {/* Level name */}
                            <span
                              className={`text-[10px] font-mono font-bold tracking-[0.25em] uppercase transition-colors ${
                                isSelected
                                  ? "text-emerald-800"
                                  : "text-gray-500 group-hover:text-gray-700"
                              }`}
                            >
                              {lvls[lv]}
                            </span>

                            {/* Selected check */}
                            {isSelected && (
                              <div className="absolute top-2.5 right-2.5 w-4 h-4 rounded-full bg-emerald-100 flex items-center justify-center">
                                <span className="text-[8px] text-emerald-700">
                                  ✓
                                </span>
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* ── NAVIGATION ── */}
                  <div className="flex items-center justify-between pt-6 border-t border-slate-800/10">
                    <button
                      onClick={() => setQuizStep(Math.max(0, quizStep - 1))}
                      disabled={quizStep === 0}
                      className={`text-[9px] font-mono tracking-[0.3em] uppercase transition-colors ${
                        quizStep === 0
                          ? "text-emerald-800/20 cursor-not-allowed"
                          : "text-emerald-800/60 hover:text-emerald-900"
                      }`}
                    >
                      ← {language === "id" ? "SEBELUMNYA" : "PREVIOUS"}
                    </button>

                    {/* Step dots */}
                    <div className="flex gap-1">
                      {SPV.map((_, i) => {
                        const answered = scores[SPV[i].id] !== undefined;
                        const isCurrent = i === quizStep;
                        return (
                          <button
                            key={i}
                            onClick={() => setQuizStep(i)}
                            className={`rounded-full transition-all duration-200 ${
                              isCurrent
                                ? "w-5 h-1.5 bg-emerald-700"
                                : answered
                                  ? "w-1.5 h-1.5 bg-emerald-700/40 hover:bg-emerald-700/60"
                                  : "w-1.5 h-1.5 bg-emerald-700/10 hover:bg-emerald-700/20"
                            }`}
                          />
                        );
                      })}
                    </div>

                    {quizStep < 17 ? (
                      <button
                        onClick={() => setQuizStep(quizStep + 1)}
                        className="text-[9px] font-mono tracking-[0.3em] uppercase text-emerald-700/60 hover:text-emerald-800 transition-colors"
                      >
                        {language === "id" ? "SELANJUTNYA" : "NEXT"} →
                      </button>
                    ) : (
                      <button
                        onClick={handleAnalyze}
                        disabled={!canAnalyze}
                        className={`px-8 py-3 rounded-full text-[9px] font-mono font-bold tracking-[0.4em] uppercase transition-all duration-300 ${
                          canAnalyze
                            ? "bg-emerald-700 text-white hover:bg-emerald-800"
                            : "bg-emerald-50 text-emerald-800/30 cursor-not-allowed"
                        }`}
                      >
                        {t.pathfinder.analyze}
                      </button>
                    )}
                  </div>

                  {/* ── ANSWERED OVERVIEW ── */}
                  {filledCount > 0 && (
                    <div className="mt-8 pt-6 border-t border-slate-800/10">
                      <div className="flex items-center gap-3 mb-4">
                        <span className="text-[8px] font-mono tracking-[0.4em] text-slate-800/30 uppercase">
                          {language === "id" ? "DIJAWAB" : "ANSWERED"}
                        </span>
                        <span className="text-[9px] font-mono text-slate-800/40">
                          {filledCount}/18
                        </span>
                        {!canAnalyze && (
                          <span className="text-[8px] font-mono text-slate-800/30 italic">
                            —{" "}
                            {language === "id"
                              ? `${9 - filledCount} lagi untuk hasil`
                              : `${9 - filledCount} more for results`}
                          </span>
                        )}
                      </div>

                      {/* Mini answered grid */}
                      <div className="flex flex-wrap gap-2">
                        {SPV.map((s, i) => {
                          const ans = scores[s.id];
                          if (ans === undefined) return null;
                          return (
                            <button
                              key={s.id}
                              onClick={() => setQuizStep(i)}
                              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[7px] font-mono tracking-wider transition-all duration-200 ${
                                i === quizStep
                                  ? "bg-emerald-700 text-white"
                                  : "border border-emerald-700/10 text-emerald-800/60 hover:border-emerald-700/25"
                              }`}
                            >
                              <span>{CHOICE_EMOJIS[ans]}</span>
                              {
                                (language === "id"
                                  ? s.labelId
                                  : s.labelEn
                                ).split(" ")[0]
                              }
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* CSS animation */}
                  <style jsx>{`
                    @keyframes fadeSlideIn {
                      from {
                        opacity: 0;
                        transform: translateX(30px);
                      }
                      to {
                        opacity: 1;
                        transform: translateX(0);
                      }
                    }
                  `}</style>
                </div>
              );
            })()
          ) : (
            /* ── RESULTS — dramatic reveal ── */
            <div className="space-y-8">
              <div className="mb-2">
                <span className="text-[8px] font-mono tracking-[0.4em] text-slate-800/40 uppercase block mb-3">
                  {language === "id" ? "ANALISIS SELESAI" : "ANALYSIS COMPLETE"}
                </span>
                <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-800 leading-tight mb-2">
                  {t.pathfinder.resultTitle}
                </h2>
                <p className="text-[10px] font-mono text-slate-800/60 tracking-widest">
                  {t.pathfinder.resultSub}
                </p>
              </div>

              {/* Top 3 — feature cards */}
              <div className="space-y-4 mb-4">
                {results.slice(0, 3).map(({ domain, score }, idx) => {
                  const info = DOMAINS.find((d) => d.id === domain)!;
                  const isExpanded = expandedDomain === domain;
                  const isTop = idx === 0;
                  return (
                    <div
                      key={domain}
                      style={{
                        animation: `fadeSlideIn 0.5s ease-out ${idx * 0.15}s both`,
                      }}
                    >
                      <button
                        onClick={() =>
                          setExpandedDomain(isExpanded ? null : domain)
                        }
                        className={`w-full text-left rounded-2xl transition-all duration-300 group ${
                          isTop
                            ? "bg-emerald-800 text-white p-7"
                            : "bg-white border border-slate-800/10 shadow-sm hover:shadow-md p-6"
                        }`}
                      >
                        <div className="flex items-start gap-5">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-lg ${
                              isTop ? "bg-[#F9F9F9]/10" : "bg-black/[0.03]"
                            }`}
                          >
                            {info.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-1">
                              <span
                                className={`text-xs font-bold tracking-tight ${isTop ? "" : "text-[#141313]"}`}
                              >
                                {language === "id"
                                  ? info.labelId
                                  : info.labelEn}
                              </span>
                              {isTop && (
                                <span className="text-[7px] font-mono tracking-[0.3em] text-[#2D6A4F] uppercase bg-[#2D6A4F]/10 px-2 py-0.5 rounded-full">
                                  №1
                                </span>
                              )}
                            </div>
                            <p
                              className={`text-[10px] font-sans mb-3 ${
                                isTop
                                  ? "text-[#F9F9F9]/50"
                                  : "text-[#141313]/35"
                              }`}
                            >
                              {language === "id" ? info.descId : info.descEn}
                            </p>
                            {/* Score bar */}
                            <div className="flex items-center gap-3">
                              <div
                                className={`flex-1 h-[3px] rounded-full overflow-hidden ${isTop ? "bg-[#F9F9F9]/10" : "bg-black/5"}`}
                              >
                                <div
                                  className="h-full rounded-full transition-all duration-1000"
                                  style={{
                                    width: `${score}%`,
                                    backgroundColor: isTop
                                      ? "#F9F9F9"
                                      : "rgba(20,19,19,0.25)",
                                    transitionDelay: `${idx * 0.2}s`,
                                  }}
                                />
                              </div>
                              <span
                                className={`text-[9px] font-mono font-bold shrink-0 ${isTop ? "text-[#F9F9F9]/60" : "text-[#141313]/30"}`}
                              >
                                {score}%
                              </span>
                            </div>
                          </div>
                          <span
                            className={`text-xs transition-transform duration-300 shrink-0 ${isExpanded ? "rotate-90" : ""} ${
                              isTop ? "text-[#F9F9F9]/30" : "text-[#141313]/20"
                            }`}
                          >
                            ›
                          </span>
                        </div>
                      </button>

                      {/* Expanded paths */}
                      {isExpanded && (
                        <div
                          className={`mt-2 px-7 py-5 rounded-b-[12px] space-y-4 ${
                            isTop ? "bg-[#141313]/[0.03]" : ""
                          }`}
                        >
                          <span className="text-[8px] font-mono tracking-[0.3em] text-[#141313]/30 uppercase block">
                            {language === "id"
                              ? "JALUR YANG BISA DIEKSPLORASI"
                              : "PATHS TO EXPLORE"}
                          </span>
                          <div className="flex flex-wrap gap-2">
                            {info.paths.map((p, pi) => (
                              <span
                                key={pi}
                                className="text-[9px] font-mono text-[#141313]/60 border border-black/10 px-3 py-1.5 rounded-full hover:border-black/25 transition-colors"
                              >
                                {language === "id" ? p.labelId : p.labelEn}
                              </span>
                            ))}
                          </div>
                          <button
                            onClick={() => {
                              setSelectedDomain(domain);
                              setActiveTab("roadmap");
                            }}
                            className="text-[9px] font-mono text-[#141313]/40 hover:text-[#141313] transition-colors tracking-widest uppercase"
                          >
                            {language === "id"
                              ? "Lihat Peta Langkah →"
                              : "View Learning Roadmap →"}
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Remaining domains — compact */}
              {results.length > 3 && (
                <div className="space-y-0 pt-4 border-t border-black/5">
                  <span className="text-[8px] font-mono tracking-[0.4em] text-[#141313]/20 uppercase block mb-4">
                    {language === "id" ? "DOMAIN LAINNYA" : "OTHER DOMAINS"}
                  </span>
                  {results.slice(3).map(({ domain, score }) => {
                    const info = DOMAINS.find((d) => d.id === domain)!;
                    return (
                      <div
                        key={domain}
                        className="flex items-center gap-4 py-3 border-b border-black/[0.04]"
                      >
                        <span className="text-sm text-[#141313]/15">
                          {info.icon}
                        </span>
                        <span className="text-[10px] font-mono text-[#141313]/35 tracking-widest uppercase flex-1">
                          {language === "id" ? info.labelId : info.labelEn}
                        </span>
                        <div className="w-24 h-[2px] bg-black/5 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#141313]/15 rounded-full"
                            style={{ width: `${score}%` }}
                          />
                        </div>
                        <span className="text-[8px] font-mono text-[#141313]/20 w-8 text-right">
                          {score}%
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}

              <button
                onClick={() => {
                  setAnalyzed(false);
                  setExpandedDomain(null);
                  setQuizStep(0);
                }}
                className="text-[9px] font-mono tracking-[0.3em] uppercase text-[#141313]/30 hover:text-[#141313] transition-colors"
              >
                ← {t.pathfinder.reset}
              </button>

              <style jsx>{`
                @keyframes fadeSlideIn {
                  from {
                    opacity: 0;
                    transform: translateY(20px);
                  }
                  to {
                    opacity: 1;
                    transform: translateY(0);
                  }
                }
              `}</style>
            </div>
          )}
        </section>
      )}

      {/* ═══════════════════════════════════ */}
      {/* ROADMAP                             */}
      {/* ═══════════════════════════════════ */}
      {activeTab === "roadmap" && (
        <section className="space-y-8">
          <div>
            <h2 className="text-sm font-bold tracking-tight text-[#141313] mb-1">
              {t.roadmap.title}
            </h2>
            <p className="text-[10px] font-mono text-[#141313]/60 tracking-widest">
              {t.roadmap.subtitle}
            </p>
          </div>

          {/* Domain picker — pill style */}
          <div className="flex flex-wrap gap-2">
            {DOMAINS.map((d) => (
              <button
                key={d.id}
                onClick={() =>
                  setSelectedDomain(selectedDomain === d.id ? null : d.id)
                }
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-[9px] font-mono font-bold tracking-widest uppercase transition-all duration-200 ${
                  selectedDomain === d.id
                    ? "bg-emerald-700 text-white border-emerald-700 shadow-sm"
                    : "bg-white border border-gray-200 shadow-sm text-gray-700 hover:border-gray-300 hover:shadow-md"
                }`}
              >
                <span className="text-xs">{d.icon}</span>
                {language === "id" ? d.labelId : d.labelEn}
              </button>
            ))}
          </div>

          {/* Roadmap steps */}
          {selectedDomain ? (
            <div className="space-y-8">
              {ROADMAP_STEPS[selectedDomain].map((phase, pi) => (
                <div key={pi}>
                  {/* Phase header */}
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-[8px] font-mono tracking-[0.35em] text-[#141313]/60 uppercase">
                      {t.roadmap.phase} {pi + 1}
                    </span>
                    <span className="text-xs font-bold text-[#141313]">
                      {language === "id" ? phase.phase : phase.phaseEn}
                    </span>
                    <div className="h-px flex-1 bg-black/5" />
                  </div>

                  {/* Steps */}
                  <div className="space-y-3 pl-4">
                    {phase.items.map((item, ii) => {
                      const key = `${selectedDomain}-${pi}-${ii}`;
                      const done = completedSteps.includes(key);
                      return (
                        <div key={ii} className="flex items-start gap-4">
                          <button
                            onClick={() => toggleStep(key)}
                            className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 mt-0.5 transition-all duration-200 ${
                              done
                                ? "bg-emerald-600 border-emerald-600"
                                : "border-gray-300 hover:border-emerald-400"
                            }`}
                          >
                            {done && (
                              <span className="text-white text-[7px]">✓</span>
                            )}
                          </button>
                          <div className="flex-1 min-w-0">
                            <p
                              className={`text-[11px] font-sans transition-all duration-200 ${done ? "line-through text-[#141313]/25" : "text-[#141313]/70"}`}
                            >
                              {language === "id" ? item.labelId : item.labelEn}
                            </p>
                          </div>
                          <span
                            className="text-[7px] font-mono tracking-[0.2em] uppercase shrink-0 mt-0.5"
                            style={{
                              color: STEP_TYPE_COLORS[item.type] + "50",
                            }}
                          >
                            {
                              (t.roadmap.typeLabel as Record<string, string>)[
                                item.type
                              ]
                            }
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}

              {/* Progress */}
              {(() => {
                const allKeys = ROADMAP_STEPS[selectedDomain].flatMap((p, pi) =>
                  p.items.map((_, ii) => `${selectedDomain}-${pi}-${ii}`),
                );
                const done = allKeys.filter((k) =>
                  completedSteps.includes(k),
                ).length;
                return (
                  <div className="pt-4 flex items-center gap-4">
                    <div className="flex-1 h-px bg-black/5 overflow-hidden rounded-full">
                      <div
                        className="h-full bg-emerald-600/40 transition-all duration-700 rounded-full"
                        style={{ width: `${(done / allKeys.length) * 100}%` }}
                      />
                    </div>
                    <span className="text-[9px] font-mono text-[#141313]/30 shrink-0">
                      {done}/{allKeys.length}
                    </span>
                  </div>
                );
              })()}
            </div>
          ) : (
            <p className="text-[10px] font-mono text-[#141313]/50 tracking-widest italic">
              {t.roadmap.selectPrompt}
            </p>
          )}
        </section>
      )}

      {/* ═══════════════════════════════════ */}
      {/* BLUEPRINT                           */}
      {/* ═══════════════════════════════════ */}
      {activeTab === "blueprint" && (
        <section className="space-y-12">
          {/* ── Goals ── */}
          <div>
            <h2 className="text-sm font-bold tracking-tight text-[#141313] mb-1">
              {t.blueprint.title}
            </h2>
            <p className="text-[10px] font-mono text-[#141313]/60 tracking-widest mb-8">
              {t.blueprint.subtitle}
            </p>

            {/* Add form — inline, open */}
            <div className="flex items-end gap-3 flex-wrap border-b border-black/8 pb-6 mb-8">
              <div className="flex-1 min-w-48">
                <input
                  type="text"
                  placeholder={t.blueprint.addGoal}
                  value={newGoal}
                  onChange={(e) => setNewGoal(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addGoal()}
                  className="w-full bg-white border border-gray-200 shadow-sm rounded-xl px-4 py-2 outline-none text-sm text-[#141313]/80 placeholder:text-[#141313]/40 font-sans focus:border-slate-400 transition-colors"
                />
              </div>
              <select
                value={newYear}
                onChange={(e) => setNewYear(Number(e.target.value))}
                className="bg-white border border-gray-200 shadow-sm rounded-xl text-[9px] font-mono text-gray-600 outline-none px-3 py-2 cursor-pointer focus:border-slate-400 transition-colors"
              >
                {[0, 1, 2, 3, 4].map((o) => {
                  const y = new Date().getFullYear() + o;
                  return (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  );
                })}
              </select>
              <select
                value={newQ}
                onChange={(e) => setNewQ(e.target.value)}
                className="bg-white border border-gray-200 shadow-sm rounded-xl text-[9px] font-mono text-gray-600 outline-none px-3 py-2 cursor-pointer focus:border-slate-400 transition-colors"
              >
                {["Q1", "Q2", "Q3", "Q4"].map((q) => (
                  <option key={q} value={q}>
                    {q}
                  </option>
                ))}
              </select>
              <select
                value={newCat}
                onChange={(e) => setNewCat(Number(e.target.value))}
                className="bg-white border border-gray-200 shadow-sm rounded-xl text-[9px] font-mono text-gray-600 outline-none px-3 py-2 cursor-pointer focus:border-slate-400 transition-colors"
              >
                {t.blueprint.categories.map((c, i) => (
                  <option key={i} value={i}>
                    {c}
                  </option>
                ))}
              </select>
              <button
                onClick={addGoal}
                disabled={!newGoal.trim()}
                className={`px-6 py-2 rounded-full text-[9px] font-mono font-bold tracking-[0.3em] uppercase transition-colors ${
                  newGoal.trim()
                    ? "bg-emerald-700 text-white hover:bg-emerald-800"
                    : "bg-gray-100 text-[#141313]/20 cursor-not-allowed"
                }`}
              >
                + {t.blueprint.add}
              </button>
            </div>

            {/* Goals list — timeline style */}
            {goals.length === 0 ? (
              <p className="text-[10px] font-mono text-[#141313]/50 italic">
                {t.blueprint.noGoals}
              </p>
            ) : (
              <div className="space-y-3">
                {[...goals]
                  .sort(
                    (a, b) =>
                      a.year - b.year || a.quarter.localeCompare(b.quarter),
                  )
                  .map((g, i, arr) => {
                    const showHeader = i === 0 || g.year !== arr[i - 1].year;
                    return (
                      <div key={g.id} className="space-y-3">
                        {showHeader && (
                          <div className="flex items-center gap-3 pt-4 pb-1">
                            <span className="text-[8px] font-mono font-bold tracking-[0.4em] text-[#141313]/25 uppercase">
                              {g.year}
                            </span>
                            <div className="h-px flex-1 bg-black/5" />
                          </div>
                        )}
                        <div className="group bg-white shadow-sm ring-1 ring-gray-100 hover:shadow-md transition-all flex flex-row items-center justify-between p-4 rounded-2xl gap-4">
                          <button
                            onClick={() => toggleGoal(g.id)}
                            className={`w-3.5 h-3.5 rounded-full border shrink-0 transition-all duration-200 ${
                              g.done
                                ? "bg-emerald-600/60 border-emerald-600/60"
                                : "border-gray-300 hover:border-emerald-400"
                            }`}
                          />
                          <div className="flex-1 pr-4 min-w-0">
                            {editingGoalId === g.id ? (
                              <div className="space-y-2">
                                <input
                                  value={editGoalText}
                                  onChange={e => setEditGoalText(e.target.value)}
                                  className="w-full bg-white border border-gray-200 shadow-sm rounded-xl px-3 py-2 text-xs text-[#141313]/80 font-sans outline-none focus:border-emerald-400 transition-colors"
                                />
                                <div className="flex gap-2">
                                  <button onClick={() => saveEditGoal(g.id)} className="px-4 py-1.5 bg-emerald-700 text-white text-[8px] font-mono font-bold tracking-widest uppercase rounded-full hover:bg-emerald-800 transition-colors">
                                    {language === 'id' ? 'SIMPAN' : 'SAVE'}
                                  </button>
                                  <button onClick={() => setEditingGoalId(null)} className="px-4 py-1.5 border border-gray-200 text-gray-500 text-[8px] font-mono font-bold tracking-widest uppercase rounded-full hover:bg-gray-50 transition-colors">
                                    {language === 'id' ? 'BATAL' : 'CANCEL'}
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <>
                                <p
                                  className={`text-[11px] font-sans transition-all duration-200 ${g.done ? "line-through text-[#141313]/25" : "text-[#141313]/70"}`}
                                >
                                  {g.text}
                                </p>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-[7px] font-mono tracking-widest text-[#141313]/25 uppercase">
                                    {g.quarter}
                                  </span>
                                  <span className="w-0.5 h-0.5 rounded-full bg-[#141313]/15" />
                                  <span className="text-[7px] font-mono tracking-widest text-[#141313]/25 uppercase">
                                    {g.category ? g.category.toUpperCase() : 'GENERAL'}
                                  </span>
                                </div>
                              </>
                            )}
                          </div>
                          <div className="flex items-center space-x-2 shrink-0 m-0">
                            <button
                              onClick={() => { setEditingGoalId(g.id); setEditGoalText(g.text); }}
                              className="flex items-center justify-center w-10 h-10 rounded-xl text-emerald-600 hover:bg-emerald-50 transition-colors m-0 p-0 text-lg opacity-0 group-hover:opacity-100 duration-200"
                              title="Edit"
                            >
                              ✎
                            </button>
                            <button
                              onClick={() => removeGoal(g.id)}
                              className="flex items-center justify-center w-10 h-10 rounded-xl text-rose-500 hover:bg-rose-50 transition-colors m-0 p-0 text-lg opacity-0 group-hover:opacity-100 duration-200"
                              title="Delete"
                            >
                              ×
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>

          {/* ── Manifesto ── */}
          <div className="pt-4 border-t border-black/8 space-y-4">
            <div>
              <span className="text-[8px] font-mono tracking-[0.4em] text-[#141313]/60 uppercase block mb-4">
                {t.blueprint.manifesto}
              </span>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                <div className="text-[4rem] font-serif leading-none text-[#141313]/10 select-none -mb-4">
                  "
                </div>
                <textarea
                  value={manifesto}
                  onChange={(e) => setManifesto(e.target.value)}
                  placeholder={t.blueprint.manifestoPlaceholder}
                  rows={4}
                  className="w-full bg-transparent outline-none resize-none text-base font-serif italic text-[#141313]/75 placeholder:text-[#141313]/40 leading-relaxed focus:outline-none pb-2 transition-colors"
                />
              </div>
            </div>
            <button
              onClick={saveManifesto}
              disabled={!manifesto.trim()}
              className={`px-6 py-2 rounded-full text-[9px] font-mono font-bold tracking-[0.35em] uppercase transition-all duration-200 ${
                manifestoSaved
                  ? "bg-emerald-600 text-white"
                  : manifesto.trim()
                    ? "bg-emerald-700 text-white hover:bg-emerald-800"
                    : "bg-gray-100 text-[#141313]/20 cursor-not-allowed"
              }`}
            >
              {manifestoSaved
                ? `✓ ${t.blueprint.manifestoSaved}`
                : t.blueprint.saveManifesto}
            </button>
          </div>

          {/* ── Stats ── */}
          <div className="flex gap-8 pt-2">
            {[
              {
                n: goals.filter((g) => g.done).length,
                label: language === "id" ? "Target Selesai" : "Goals Completed",
              },
              {
                n: goals.filter((g) => !g.done).length,
                label: language === "id" ? "Sedang Berjalan" : "In Progress",
              },
              {
                n: results.length > 0 ? 1 : 0,
                label: language === "id" ? "Profil Karier" : "Career Profile",
              },
            ].map((s, i) => (
              <div key={i}>
                <span className="block text-3xl font-extrabold tracking-tighter text-slate-800">
                  {s.n}
                </span>
                <span className="text-[8px] font-mono tracking-widest text-[#141313]/60 uppercase">
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
