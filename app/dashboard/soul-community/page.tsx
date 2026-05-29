'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/components/providers/language-provider';

// ─────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────
type Tab = 'battery' | 'bonds' | 'map' | 'rituals';
type EnergyType = 'giver' | 'neutral' | 'drainer';
type RelationCategory = 'family' | 'friend' | 'colleague' | 'romantic' | 'mentor' | 'acquaintance';
type BatteryLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

interface Bond {
  id: string;
  name: string;
  category: RelationCategory;
  energyType: EnergyType;
  energyScore: number; // -5 to +5
  lastInteraction: string; // date string
  notes: string;
  tags: string[];
}

interface BatteryLog {
  id: string;
  date: string;
  level: BatteryLevel;
  activities: string;
  note: string;
}

interface SocialRitual {
  id: string;
  title: string;
  frequency: string;
  lastDone: string;
  energyGain: number; // 1-5
  active: boolean;
}

// ─────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────
const CATEGORY_ICONS: Record<RelationCategory, string> = {
  family: '◐', friend: '◑', colleague: '◒', romantic: '◓', mentor: '◔', acquaintance: '○',
};

const ENERGY_CONFIG: Record<EnergyType, { dot: string; labelId: string; labelEn: string }> = {
  giver: { dot: '#2D6A4F', labelId: 'Pengisi Energi', labelEn: 'Energy Giver' },
  neutral: { dot: '#B5C4B1', labelId: 'Netral', labelEn: 'Neutral' },
  drainer: { dot: '#FF8A80', labelId: 'Penguras Energi', labelEn: 'Energy Drainer' },
};

const BATTERY_COLORS = ['#FF8A80', '#FF8A80', '#FFB347', '#FFB347', '#FFB347', '#74C69D', '#74C69D', '#2D6A4F', '#2D6A4F', '#2D6A4F'];

// ─────────────────────────────────────────────────────────────
// DICT
// ─────────────────────────────────────────────────────────────
const dict = {
  id: {
    pageLabel: '07 // SOUL COMMUNITY',
    headline1: 'Energi',
    headline2: 'Sosialmu.',
    subtitle: 'Peta relasi dan manajemen baterai sosial untuk menjaga kejernihan hubungan.',
    statusLabel: 'SOCIAL ENERGY MAPPED',
    tabs: { battery: 'BATERAI', bonds: 'HUBUNGAN', map: 'PETA ENERGI', rituals: 'RITUAL' },

    battery: {
      title: 'Baterai Sosialmu Hari Ini',
      subtitle: 'Seberapa banyak energi sosial yang kamu miliki? Catat secara jujur setiap hari.',
      logLabel: 'Aktivitas sosial hari ini',
      logPlaceholder: 'Apa saja interaksi sosialmu hari ini? (rapat, hang out, telepon...)',
      notePlaceholder: 'Catatan singkat tentang perasaanmu...',
      log: 'CATAT',
      history: 'Riwayat Baterai',
      emptyHistory: 'Belum ada catatan. Mulai catat level bateraimu hari ini.',
      levelLabels: ['Kosong', 'Kritis', 'Rendah', 'Rendah', 'Setengah', 'Setengah', 'Baik', 'Baik', 'Penuh', 'Penuh'],
      hint: 'Ketuk angka untuk memilih level baterai',
      todayLabel: 'LEVEL HARI INI',
    },

    bonds: {
      title: 'Daftar Hubungan',
      subtitle: 'Katalog orang-orang dalam hidupmu — siapa yang mengisi dan siapa yang menguras energimu.',
      addTitle: 'Tambah Orang',
      namePlaceholder: 'Nama atau inisial',
      notesPlaceholder: 'Catatan tentang orang ini (opsional)',
      tagsPlaceholder: 'Tag: pisahkan dengan koma (cth: supportif, introvert)',
      categories: { family: 'Keluarga', friend: 'Teman', colleague: 'Rekan', romantic: 'Romantis', mentor: 'Mentor', acquaintance: 'Kenalan' },
      energyLabel: 'Dampak Energi',
      energyScore: 'Skor Energi',
      scoreMinus: 'Menguras',
      scorePlus: 'Mengisi',
      lastInteraction: 'Terakhir bertemu / berinteraksi',
      add: 'TAMBAH',
      empty: 'Belum ada hubungan tercatat. Mulai petakan orang-orang di sekitarmu.',
      delete: 'hapus',
    },

    map: {
      title: 'Peta Energi Sosial',
      subtitle: 'Gambaran visual tentang ekosistem relasi dan keseimbangan energimu.',
      givers: 'PENGISI ENERGI',
      drainers: 'PENGURAS ENERGI',
      neutral: 'NETRAL',
      noData: 'Belum ada hubungan. Tambahkan orang di tab Hubungan.',
      totalGain: 'Total Energi Masuk',
      totalDrain: 'Total Energi Keluar',
      netEnergy: 'Energi Bersih',
      balanceGood: 'Ekosistem relasionalmu cukup sehat.',
      balancePoor: 'Hati-hati — lebih banyak penguras daripada pengisi energimu.',
      topGiver: 'Pengisi Terbesar',
      topDrainer: 'Penguras Terbesar',
    },

    rituals: {
      title: 'Ritual Sosial',
      subtitle: 'Kebiasaan dan ritme sosial yang secara aktif mengisi ulang baterai jiwamu.',
      addPlaceholder: 'Nama ritual (cth: Jalan pagi sendiri, Makan malam keluarga)',
      freqPlaceholder: 'Frekuensi (cth: Setiap Minggu)',
      energyGain: 'Efek Pengisian Energi',
      add: 'TAMBAH RITUAL',
      done: 'SELESAI HARI INI',
      undone: 'BELUM',
      empty: 'Belum ada ritual. Rancang ritme sosialmu sendiri.',
      defaultRituals: [
        { title: 'Waktu sendiri tanpa gangguan', frequency: 'Setiap hari', energyGain: 5 },
        { title: 'Percakapan mendalam dengan sahabat', frequency: 'Seminggu sekali', energyGain: 4 },
        { title: 'Digital detox selama 1 jam', frequency: 'Setiap hari', energyGain: 4 },
        { title: 'Makan bersama keluarga', frequency: 'Seminggu sekali', energyGain: 3 },
      ],
    },
  },

  en: {
    pageLabel: '07 // SOUL COMMUNITY',
    headline1: 'Your Social',
    headline2: 'Energy.',
    subtitle: 'Relationship mapping and social battery management for relationship clarity.',
    statusLabel: 'SOCIAL ENERGY MAPPED',
    tabs: { battery: 'BATTERY', bonds: 'BONDS', map: 'ENERGY MAP', rituals: 'RITUALS' },

    battery: {
      title: 'Your Social Battery Today',
      subtitle: 'How much social energy do you have? Log it honestly every day.',
      logLabel: 'Social activities today',
      logPlaceholder: 'What social interactions did you have today? (meetings, hangouts, calls...)',
      notePlaceholder: 'A short note about how you feel...',
      log: 'LOG',
      history: 'Battery History',
      emptyHistory: 'No logs yet. Start tracking your battery level today.',
      levelLabels: ['Empty', 'Critical', 'Low', 'Low', 'Half', 'Half', 'Good', 'Good', 'Full', 'Full'],
      hint: 'Tap a number to select your battery level',
      todayLabel: 'TODAY\'S LEVEL',
    },

    bonds: {
      title: 'Relationship Catalog',
      subtitle: 'The people in your life — who fills and who drains your energy.',
      addTitle: 'Add a Person',
      namePlaceholder: 'Name or initials',
      notesPlaceholder: 'Notes about this person (optional)',
      tagsPlaceholder: 'Tags: separate with commas (e.g., supportive, introvert)',
      categories: { family: 'Family', friend: 'Friend', colleague: 'Colleague', romantic: 'Romantic', mentor: 'Mentor', acquaintance: 'Acquaintance' },
      energyLabel: 'Energy Impact',
      energyScore: 'Energy Score',
      scoreMinus: 'Drains',
      scorePlus: 'Fills',
      lastInteraction: 'Last met / interacted',
      add: 'ADD',
      empty: 'No bonds recorded yet. Start mapping the people around you.',
      delete: 'delete',
    },

    map: {
      title: 'Social Energy Map',
      subtitle: 'A visual overview of your relationship ecosystem and energy balance.',
      givers: 'ENERGY GIVERS',
      drainers: 'ENERGY DRAINERS',
      neutral: 'NEUTRAL',
      noData: 'No bonds yet. Add people in the Bonds tab.',
      totalGain: 'Total Energy In',
      totalDrain: 'Total Energy Out',
      netEnergy: 'Net Energy',
      balanceGood: 'Your relationship ecosystem is fairly healthy.',
      balancePoor: 'Careful — more drainers than givers in your circle.',
      topGiver: 'Biggest Giver',
      topDrainer: 'Biggest Drainer',
    },

    rituals: {
      title: 'Social Rituals',
      subtitle: 'Social habits and rhythms that actively recharge your soul battery.',
      addPlaceholder: 'Ritual name (e.g., Morning walk alone, Family dinner)',
      freqPlaceholder: 'Frequency (e.g., Every Sunday)',
      energyGain: 'Energy Recharge Effect',
      add: 'ADD RITUAL',
      done: 'DONE TODAY',
      undone: 'PENDING',
      empty: 'No rituals yet. Design your own social rhythm.',
      defaultRituals: [
        { title: 'Uninterrupted alone time', frequency: 'Every day', energyGain: 5 },
        { title: 'Deep conversation with a close friend', frequency: 'Once a week', energyGain: 4 },
        { title: '1-hour digital detox', frequency: 'Every day', energyGain: 4 },
        { title: 'Shared meal with family', frequency: 'Once a week', energyGain: 3 },
      ],
    },
  },
};

// ─────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────
export default function SoulCommunityPage() {
  const { language } = useLanguage();
  const t = dict[language as keyof typeof dict] || dict.id;

  const [activeTab, setActiveTab] = useState<Tab>('battery');
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Battery state
  const [batteryLevel, setBatteryLevel] = useState<BatteryLevel>(7);
  const [batteryActivity, setBatteryActivity] = useState('');
  const [batteryNote, setBatteryNote] = useState('');
  const [batteryLogs, setBatteryLogs] = useState<BatteryLog[]>([]);

  // Bonds state
  const [bonds, setBonds] = useState<Bond[]>([]);
  const [addingBond, setAddingBond] = useState(false);
  const [bondName, setBondName] = useState('');
  const [bondCategory, setBondCategory] = useState<RelationCategory>('friend');
  const [bondEnergyType, setBondEnergyType] = useState<EnergyType>('neutral');
  const [bondScore, setBondScore] = useState(0);
  const [bondLastSeen, setBondLastSeen] = useState('');
  const [bondNotes, setBondNotes] = useState('');
  const [bondTags, setBondTags] = useState('');

  // Rituals state
  const [rituals, setRituals] = useState<SocialRitual[]>([]);
  const [newRitualTitle, setNewRitualTitle] = useState('');
  const [newRitualFreq, setNewRitualFreq] = useState('');
  const [newRitualEnergy, setNewRitualEnergy] = useState(3);
  const [todayDoneRituals, setTodayDoneRituals] = useState<string[]>([]);

  // Parallax
  useEffect(() => {
    const h = (e: MouseEvent) =>
      setMousePos({ x: (e.clientX / window.innerWidth) * 2 - 1, y: (e.clientY / window.innerHeight) * 2 - 1 });
    window.addEventListener('mousemove', h);
    return () => window.removeEventListener('mousemove', h);
  }, []);

  // Persist load
  useEffect(() => {
    const bl = localStorage.getItem('sc_battery'); if (bl) setBatteryLogs(JSON.parse(bl));
    const bd = localStorage.getItem('sc_bonds'); if (bd) setBonds(JSON.parse(bd));
    const rt = localStorage.getItem('sc_rituals');
    if (rt) {
      setRituals(JSON.parse(rt));
    } else {
      const defaults: SocialRitual[] = t.rituals.defaultRituals.map((r, i) => ({
        id: `default-${i}`,
        title: r.title,
        frequency: r.frequency,
        lastDone: '',
        energyGain: r.energyGain,
        active: true,
      }));
      setRituals(defaults);
      localStorage.setItem('sc_rituals', JSON.stringify(defaults));
    }
    const td = localStorage.getItem('sc_today_rituals');
    if (td) {
      const { date, ids } = JSON.parse(td);
      if (date === new Date().toDateString()) setTodayDoneRituals(ids);
    }
  }, []);

  // ── BATTERY ACTIONS ──
  const logBattery = () => {
    const entry: BatteryLog = {
      id: Date.now().toString(),
      date: new Date().toDateString(),
      level: batteryLevel,
      activities: batteryActivity,
      note: batteryNote,
    };
    const updated = [entry, ...batteryLogs].slice(0, 30);
    setBatteryLogs(updated);
    localStorage.setItem('sc_battery', JSON.stringify(updated));
    setBatteryActivity(''); setBatteryNote('');
  };

  // ── BOND ACTIONS ──
  const addBond = () => {
    if (!bondName.trim()) return;
    const bond: Bond = {
      id: Date.now().toString(),
      name: bondName,
      category: bondCategory,
      energyType: bondEnergyType,
      energyScore: bondScore,
      lastInteraction: bondLastSeen || new Date().toISOString().split('T')[0],
      notes: bondNotes,
      tags: bondTags.split(',').map(t => t.trim()).filter(Boolean),
    };
    const updated = [...bonds, bond];
    setBonds(updated);
    localStorage.setItem('sc_bonds', JSON.stringify(updated));
    setBondName(''); setBondNotes(''); setBondTags(''); setBondScore(0);
    setBondEnergyType('neutral'); setBondCategory('friend'); setBondLastSeen('');
    setAddingBond(false);
  };

  const deleteBond = (id: string) => {
    const updated = bonds.filter(b => b.id !== id);
    setBonds(updated);
    localStorage.setItem('sc_bonds', JSON.stringify(updated));
  };

  // ── RITUAL ACTIONS ──
  const addRitual = () => {
    if (!newRitualTitle.trim()) return;
    const ritual: SocialRitual = {
      id: Date.now().toString(),
      title: newRitualTitle,
      frequency: newRitualFreq,
      lastDone: '',
      energyGain: newRitualEnergy,
      active: true,
    };
    const updated = [...rituals, ritual];
    setRituals(updated);
    localStorage.setItem('sc_rituals', JSON.stringify(updated));
    setNewRitualTitle(''); setNewRitualFreq(''); setNewRitualEnergy(3);
  };

  const toggleRitualDone = (id: string) => {
    const isNowDone = !todayDoneRituals.includes(id);
    const updated = isNowDone
      ? [...todayDoneRituals, id]
      : todayDoneRituals.filter(r => r !== id);
    setTodayDoneRituals(updated);
    localStorage.setItem('sc_today_rituals', JSON.stringify({ date: new Date().toDateString(), ids: updated }));

    if (isNowDone) {
      const updatedRituals = rituals.map(r => r.id === id ? { ...r, lastDone: new Date().toISOString().split('T')[0] } : r);
      setRituals(updatedRituals);
      localStorage.setItem('sc_rituals', JSON.stringify(updatedRituals));
    }
  };

  // ── MAP COMPUTED ──
  const givers = bonds.filter(b => b.energyType === 'giver');
  const drainers = bonds.filter(b => b.energyType === 'drainer');
  const neutrals = bonds.filter(b => b.energyType === 'neutral');
  const totalGain = givers.reduce((s, b) => s + b.energyScore, 0);
  const totalDrain = drainers.reduce((s, b) => s + Math.abs(b.energyScore), 0);
  const netEnergy = totalGain - totalDrain;
  const topGiver = [...givers].sort((a, b) => b.energyScore - a.energyScore)[0];
  const topDrainer = [...drainers].sort((a, b) => a.energyScore - b.energyScore)[0];

  // ── BATTERY LAST ENTRY ──
  const todayLog = batteryLogs[0];
  const avgBattery = batteryLogs.length > 0
    ? Math.round(batteryLogs.slice(0, 7).reduce((s, l) => s + l.level, 0) / Math.min(7, batteryLogs.length))
    : null;

  // ─────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────
  return (
    <div className="space-y-12 pb-24">

      {/* ── HERO ── */}
      <section className="relative w-full">
        <div
          className="absolute -top-10 -right-16 w-72 h-72 rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(45,106,79,0.035) 0%, transparent 70%)',
            transform: `translate(${mousePos.x * -15}px, ${mousePos.y * -7}px)`,
            transition: 'transform 0.18s ease-out',
          }}
        />
        <span className="block text-[10px] font-mono tracking-[0.3em] text-[#141313]/35 uppercase mb-5">
          {t.pageLabel}
        </span>
        <div style={{ transform: `translate(${mousePos.x * 6}px, ${mousePos.y * 3}px)`, transition: 'transform 0.12s ease-out' }}>
          <h1 className="text-[4.5rem] md:text-[6.5rem] font-extrabold tracking-[-0.05em] leading-[0.85] text-[#141313]">
            {t.headline1}<br />
            <span className="font-serif italic font-normal text-[#141313]/60">{t.headline2}</span>
          </h1>
        </div>
        <p className="mt-5 text-[11px] font-mono tracking-[0.2em] text-[#141313]/40 uppercase">{t.subtitle}</p>
        <div className="mt-6 flex items-center gap-4">
          <div className="h-px w-12 bg-[#141313]/10" />
          <span className="text-[8px] font-mono tracking-[0.35em] text-[#141313]/25 uppercase">{t.statusLabel}</span>
          <div className="h-px flex-1 bg-black/5" />
        </div>
      </section>

      {/* ── TABS ── */}
      <div className="flex gap-0 border-b border-black/8">
        {(['battery', 'bonds', 'map', 'rituals'] as Tab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-3 text-[9px] font-mono font-bold tracking-[0.3em] uppercase transition-all duration-200 border-b-2 -mb-px ${
              activeTab === tab
                ? 'border-[#141313] text-[#141313]'
                : 'border-transparent text-[#141313]/30 hover:text-[#141313]/60'
            }`}
          >
            {t.tabs[tab]}
          </button>
        ))}
      </div>

      {/* ═══════════════════════════════════ */}
      {/* BATTERY                             */}
      {/* ═══════════════════════════════════ */}
      {activeTab === 'battery' && (
        <section className="space-y-10">
          <div>
            <h2 className="text-sm font-bold tracking-tight text-[#141313] mb-1">{t.battery.title}</h2>
            <p className="text-[10px] font-mono text-[#141313]/40 tracking-widest">{t.battery.subtitle}</p>
          </div>

          {/* Battery level selector */}
          <div>
            <span className="text-[8px] font-mono tracking-[0.35em] text-[#141313]/25 uppercase block mb-5">
              {t.battery.hint}
            </span>

            {/* Big battery visual */}
            <div className="flex items-end gap-2 mb-4">
              {([1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as BatteryLevel[]).map((lv) => (
                <button
                  key={lv}
                  onClick={() => setBatteryLevel(lv)}
                  className="flex flex-col items-center gap-1.5 flex-1 group"
                >
                  <div
                    className="w-full rounded-sm transition-all duration-200"
                    style={{
                      height: `${20 + lv * 6}px`,
                      backgroundColor: batteryLevel >= lv ? BATTERY_COLORS[lv - 1] : 'rgba(20,19,19,0.06)',
                      opacity: batteryLevel === lv ? 1 : batteryLevel > lv ? 0.5 : 0.3,
                    }}
                  />
                  <span className={`text-[8px] font-mono transition-colors ${
                    batteryLevel === lv ? 'text-[#141313]/50' : 'text-[#141313]/15'
                  }`}>{lv}</span>
                </button>
              ))}
            </div>

            {/* Level label */}
            <div className="flex items-center gap-3 mb-6">
              <div
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: BATTERY_COLORS[batteryLevel - 1], opacity: 0.7 }}
              />
              <span className="text-sm font-serif italic text-[#141313]/50">
                {t.battery.levelLabels[batteryLevel - 1]}
              </span>
              <span className="text-[9px] font-mono text-[#141313]/20">{batteryLevel}/10</span>
            </div>
          </div>

          {/* Log form */}
          <div className="space-y-4 border-t border-black/6 pt-6">
            <textarea
              placeholder={t.battery.logPlaceholder}
              value={batteryActivity}
              onChange={e => setBatteryActivity(e.target.value)}
              rows={2}
              className="w-full bg-transparent outline-none resize-none text-sm text-[#141313]/70 placeholder:text-[#141313]/15 font-sans leading-relaxed border-b border-black/8 focus:border-[#141313] pb-2 transition-colors"
            />
            <input
              type="text"
              placeholder={t.battery.notePlaceholder}
              value={batteryNote}
              onChange={e => setBatteryNote(e.target.value)}
              className="w-full bg-transparent outline-none text-sm text-[#141313]/70 placeholder:text-[#141313]/15 font-sans border-b border-black/8 focus:border-[#141313] pb-2 transition-colors"
            />
            <button
              onClick={logBattery}
              className="px-8 py-3 rounded-full bg-[#141313] text-[#F9F9F9] text-[9px] font-mono font-bold tracking-[0.4em] uppercase hover:bg-[#1A2421] transition-colors"
            >
              {t.battery.log}
            </button>
          </div>

          {/* Stats */}
          {batteryLogs.length > 0 && (
            <div className="flex gap-8 pt-2 border-t border-black/5">
              {avgBattery !== null && (
                <div>
                  <span className="block text-3xl font-extrabold tracking-tighter leading-none mb-1" style={{ color: BATTERY_COLORS[avgBattery - 1], opacity: 0.4 }}>
                    {avgBattery}
                  </span>
                  <span className="text-[8px] font-mono tracking-widest text-[#141313]/25 uppercase">
                    {language === 'id' ? 'Rata-rata 7 Hari' : '7-Day Average'}
                  </span>
                </div>
              )}
              <div>
                <span className="block text-3xl font-extrabold tracking-tighter text-[#141313]/15 leading-none mb-1">
                  {batteryLogs.length}
                </span>
                <span className="text-[8px] font-mono tracking-widest text-[#141313]/25 uppercase">
                  {language === 'id' ? 'Total Catatan' : 'Total Logs'}
                </span>
              </div>
            </div>
          )}

          {/* History */}
          <div>
            <span className="text-[8px] font-mono tracking-[0.4em] text-[#141313]/25 uppercase block mb-4">
              {t.battery.history}
            </span>
            {batteryLogs.length === 0 ? (
              <p className="text-[10px] font-mono text-[#141313]/25 italic">{t.battery.emptyHistory}</p>
            ) : (
              <div className="space-y-0">
                {batteryLogs.slice(0, 14).map((log) => (
                  <div key={log.id} className="flex items-start gap-4 py-3.5 border-b border-black/5">
                    <div
                      className="w-6 h-6 rounded flex items-center justify-center shrink-0"
                      style={{ backgroundColor: BATTERY_COLORS[log.level - 1] + '20' }}
                    >
                      <span className="text-[9px] font-mono font-bold" style={{ color: BATTERY_COLORS[log.level - 1] }}>
                        {log.level}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      {log.activities && <p className="text-[10px] font-sans text-[#141313]/60 mb-0.5">{log.activities}</p>}
                      {log.note && <p className="text-[9px] font-sans italic text-[#141313]/30">"{log.note}"</p>}
                      <span className="text-[7px] font-mono text-[#141313]/20 tracking-widest mt-1 block">{log.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════ */}
      {/* BONDS                               */}
      {/* ═══════════════════════════════════ */}
      {activeTab === 'bonds' && (
        <section className="space-y-8">
          <div>
            <h2 className="text-sm font-bold tracking-tight text-[#141313] mb-1">{t.bonds.title}</h2>
            <p className="text-[10px] font-mono text-[#141313]/40 tracking-widest">{t.bonds.subtitle}</p>
          </div>

          {/* Add button */}
          <button
            onClick={() => setAddingBond(!addingBond)}
            className={`px-8 py-3 rounded-full text-[9px] font-mono font-bold tracking-[0.35em] uppercase transition-all duration-200 ${
              addingBond
                ? 'border border-black/15 text-[#141313]/40 hover:text-[#141313]'
                : 'bg-[#141313] text-[#F9F9F9] hover:bg-[#1A2421]'
            }`}
          >
            {addingBond ? '× BATAL' : `+ ${t.bonds.addTitle}`}
          </button>

          {/* Add form */}
          {addingBond && (
            <div className="space-y-5 border-t border-black/6 pt-6">
              <input
                type="text"
                placeholder={t.bonds.namePlaceholder}
                value={bondName}
                onChange={e => setBondName(e.target.value)}
                className="w-full bg-transparent outline-none text-base text-[#141313]/80 placeholder:text-[#141313]/20 font-sans pb-2 border-b border-black/10 focus:border-[#141313] transition-colors"
              />

              {/* Category */}
              <div className="flex flex-wrap gap-2">
                {(Object.keys(CATEGORY_ICONS) as RelationCategory[]).map(cat => (
                  <button
                    key={cat}
                    onClick={() => setBondCategory(cat)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[8px] font-mono tracking-widest uppercase transition-all duration-200 border ${
                      bondCategory === cat
                        ? 'border-[#141313] text-[#141313] bg-[#141313]/5'
                        : 'border-black/8 text-[#141313]/30 hover:border-black/20'
                    }`}
                  >
                    <span>{CATEGORY_ICONS[cat]}</span>
                    {(t.bonds.categories as Record<RelationCategory, string>)[cat]}
                  </button>
                ))}
              </div>

              {/* Energy type */}
              <div>
                <p className="text-[8px] font-mono tracking-[0.3em] text-[#141313]/30 uppercase mb-3">{t.bonds.energyLabel}</p>
                <div className="flex gap-3">
                  {(['giver', 'neutral', 'drainer'] as EnergyType[]).map(type => (
                    <button
                      key={type}
                      onClick={() => setBondEnergyType(type)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-full text-[8px] font-mono tracking-widest uppercase border transition-all duration-200 ${
                        bondEnergyType === type
                          ? 'border-transparent text-[#F9F9F9]'
                          : 'border-black/8 text-[#141313]/30 hover:border-black/20'
                      }`}
                      style={bondEnergyType === type ? { backgroundColor: ENERGY_CONFIG[type].dot + 'CC' } : {}}
                    >
                      {language === 'id' ? ENERGY_CONFIG[type].labelId : ENERGY_CONFIG[type].labelEn}
                    </button>
                  ))}
                </div>
              </div>

              {/* Energy score */}
              <div>
                <p className="text-[8px] font-mono tracking-[0.3em] text-[#141313]/30 uppercase mb-3">
                  {t.bonds.energyScore}
                </p>
                <div className="flex items-center gap-3">
                  <span className="text-[8px] font-mono text-[#FF8A80]/60">{t.bonds.scoreMinus}</span>
                  <div className="flex gap-1 flex-1">
                    {[-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5].map((score) => (
                      <button
                        key={score}
                        onClick={() => setBondScore(score)}
                        className={`flex-1 h-6 rounded-sm transition-all duration-200 flex items-center justify-center text-[7px] font-mono ${
                          bondScore === score ? 'text-[#F9F9F9]' : 'text-transparent'
                        }`}
                        style={{
                          backgroundColor: bondScore === score
                            ? score > 0 ? '#2D6A4F' : score < 0 ? '#FF8A80' : '#B5C4B1'
                            : 'rgba(20,19,19,0.05)',
                        }}
                      >
                        {score}
                      </button>
                    ))}
                  </div>
                  <span className="text-[8px] font-mono text-[#2D6A4F]/60">{t.bonds.scorePlus}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <input
                  type="date"
                  value={bondLastSeen}
                  onChange={e => setBondLastSeen(e.target.value)}
                  className="bg-transparent outline-none text-[10px] font-mono text-[#141313]/40 border-b border-black/8 focus:border-[#141313] pb-1 transition-colors"
                />
                <input
                  type="text"
                  placeholder={t.bonds.tagsPlaceholder}
                  value={bondTags}
                  onChange={e => setBondTags(e.target.value)}
                  className="bg-transparent outline-none text-sm text-[#141313]/60 placeholder:text-[#141313]/15 font-sans border-b border-black/8 focus:border-[#141313] pb-1 transition-colors"
                />
              </div>

              <textarea
                placeholder={t.bonds.notesPlaceholder}
                value={bondNotes}
                onChange={e => setBondNotes(e.target.value)}
                rows={2}
                className="w-full bg-transparent outline-none resize-none text-sm text-[#141313]/60 placeholder:text-[#141313]/15 font-sans border-b border-black/8 focus:border-[#141313] pb-2 transition-colors"
              />

              <button
                onClick={addBond}
                disabled={!bondName.trim()}
                className={`px-10 py-3.5 rounded-full text-[9px] font-mono font-bold tracking-[0.4em] uppercase transition-all duration-200 ${
                  bondName.trim() ? 'bg-[#141313] text-[#F9F9F9] hover:bg-[#1A2421]' : 'bg-black/5 text-[#141313]/20 cursor-not-allowed'
                }`}
              >
                {t.bonds.add}
              </button>
            </div>
          )}

          {/* Bonds list */}
          {bonds.length === 0 && !addingBond ? (
            <p className="text-[10px] font-mono text-[#141313]/25 italic">{t.bonds.empty}</p>
          ) : (
            <div className="space-y-0">
              {bonds.map((bond) => {
                const energyCfg = ENERGY_CONFIG[bond.energyType];
                return (
                  <div key={bond.id} className="flex items-start gap-4 py-5 border-b border-black/5 group">
                    {/* Energy dot */}
                    <div
                      className="w-2 h-2 rounded-full shrink-0 mt-1.5"
                      style={{ backgroundColor: energyCfg.dot, opacity: 0.6 }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-3 mb-1">
                        <p className="text-sm font-sans font-medium text-[#141313]/80 flex-1">{bond.name}</p>
                        <span className="text-[8px] font-mono tracking-widest text-[#141313]/20 shrink-0">
                          {CATEGORY_ICONS[bond.category]} {(t.bonds.categories as Record<RelationCategory, string>)[bond.category]}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mb-1.5">
                        <span className="text-[8px] font-mono" style={{ color: energyCfg.dot, opacity: 0.8 }}>
                          {language === 'id' ? energyCfg.labelId : energyCfg.labelEn}
                        </span>
                        {bond.energyScore !== 0 && (
                          <>
                            <span className="w-0.5 h-0.5 rounded-full bg-[#141313]/15" />
                            <span className="text-[8px] font-mono text-[#141313]/25">
                              {bond.energyScore > 0 ? '+' : ''}{bond.energyScore}
                            </span>
                          </>
                        )}
                        {bond.lastInteraction && (
                          <>
                            <span className="w-0.5 h-0.5 rounded-full bg-[#141313]/15" />
                            <span className="text-[7px] font-mono text-[#141313]/20">{bond.lastInteraction}</span>
                          </>
                        )}
                      </div>
                      {bond.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-1">
                          {bond.tags.map((tag, i) => (
                            <span key={i} className="text-[7px] font-mono text-[#141313]/25 border border-black/8 px-2 py-0.5 rounded-full">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                      {bond.notes && <p className="text-[9px] font-sans italic text-[#141313]/25">"{bond.notes}"</p>}
                    </div>
                    <button
                      onClick={() => deleteBond(bond.id)}
                      className="text-[9px] font-mono text-[#141313]/10 hover:text-[#FF8A80]/50 transition-colors opacity-0 group-hover:opacity-100 duration-200 shrink-0"
                    >
                      ×
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* ═══════════════════════════════════ */}
      {/* MAP                                 */}
      {/* ═══════════════════════════════════ */}
      {activeTab === 'map' && (
        <section className="space-y-10">
          <div>
            <h2 className="text-sm font-bold tracking-tight text-[#141313] mb-1">{t.map.title}</h2>
            <p className="text-[10px] font-mono text-[#141313]/40 tracking-widest">{t.map.subtitle}</p>
          </div>

          {bonds.length === 0 ? (
            <p className="text-[10px] font-mono text-[#141313]/25 italic">{t.map.noData}</p>
          ) : (
            <>
              {/* Net energy stats */}
              <div className="flex gap-10 flex-wrap border-b border-black/6 pb-8">
                {[
                  { value: `+${totalGain}`, label: t.map.totalGain, color: '#2D6A4F' },
                  { value: `-${totalDrain}`, label: t.map.totalDrain, color: '#FF8A80' },
                  {
                    value: netEnergy >= 0 ? `+${netEnergy}` : `${netEnergy}`,
                    label: t.map.netEnergy,
                    color: netEnergy >= 0 ? '#2D6A4F' : '#FF8A80',
                  },
                ].map((s, i) => (
                  <div key={i}>
                    <span className="block text-3xl font-extrabold tracking-tighter leading-none mb-1" style={{ color: s.color, opacity: 0.35 }}>
                      {s.value}
                    </span>
                    <span className="text-[8px] font-mono tracking-widest text-[#141313]/25 uppercase">{s.label}</span>
                  </div>
                ))}
              </div>

              {/* Balance indicator */}
              <div className="flex items-center gap-3">
                <div
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: netEnergy >= 0 ? '#2D6A4F' : '#FF8A80', opacity: 0.6 }}
                />
                <p className="text-[10px] font-sans italic text-[#141313]/40">
                  {netEnergy >= 0 ? t.map.balanceGood : t.map.balancePoor}
                </p>
              </div>

              {/* Visual map — 3 columns */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Givers */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#2D6A4F] opacity-60" />
                    <span className="text-[8px] font-mono tracking-[0.35em] text-[#141313]/30 uppercase">{t.map.givers}</span>
                    <span className="text-[8px] font-mono text-[#141313]/20">({givers.length})</span>
                  </div>
                  {givers.length === 0 ? (
                    <p className="text-[9px] font-mono text-[#141313]/15 italic">—</p>
                  ) : (
                    <div className="space-y-2">
                      {givers.sort((a, b) => b.energyScore - a.energyScore).map(b => (
                        <div key={b.id} className="flex items-center gap-3">
                          <div className="flex-1 h-[2px] bg-black/5 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full"
                              style={{ width: `${(b.energyScore / 5) * 100}%`, backgroundColor: '#2D6A4F', opacity: 0.4 }}
                            />
                          </div>
                          <span className="text-[10px] font-sans text-[#141313]/60 min-w-0 truncate">{b.name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Neutral */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#B5C4B1] opacity-60" />
                    <span className="text-[8px] font-mono tracking-[0.35em] text-[#141313]/30 uppercase">{t.map.neutral}</span>
                    <span className="text-[8px] font-mono text-[#141313]/20">({neutrals.length})</span>
                  </div>
                  {neutrals.length === 0 ? (
                    <p className="text-[9px] font-mono text-[#141313]/15 italic">—</p>
                  ) : (
                    <div className="space-y-2">
                      {neutrals.map(b => (
                        <div key={b.id} className="flex items-center gap-2">
                          <div className="w-1 h-1 rounded-full bg-[#B5C4B1] opacity-40 shrink-0" />
                          <span className="text-[10px] font-sans text-[#141313]/40 truncate">{b.name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Drainers */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#FF8A80] opacity-60" />
                    <span className="text-[8px] font-mono tracking-[0.35em] text-[#141313]/30 uppercase">{t.map.drainers}</span>
                    <span className="text-[8px] font-mono text-[#141313]/20">({drainers.length})</span>
                  </div>
                  {drainers.length === 0 ? (
                    <p className="text-[9px] font-mono text-[#141313]/15 italic">—</p>
                  ) : (
                    <div className="space-y-2">
                      {drainers.sort((a, b) => a.energyScore - b.energyScore).map(b => (
                        <div key={b.id} className="flex items-center gap-3">
                          <div className="flex-1 h-[2px] bg-black/5 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full"
                              style={{ width: `${(Math.abs(b.energyScore) / 5) * 100}%`, backgroundColor: '#FF8A80', opacity: 0.35 }}
                            />
                          </div>
                          <span className="text-[10px] font-sans text-[#141313]/60 min-w-0 truncate">{b.name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Top highlights */}
              {(topGiver || topDrainer) && (
                <div className="flex gap-10 pt-2 border-t border-black/5">
                  {topGiver && (
                    <div>
                      <span className="text-[7px] font-mono tracking-widest text-[#141313]/20 uppercase block mb-1">{t.map.topGiver}</span>
                      <span className="text-sm font-sans text-[#2D6A4F]/60">{topGiver.name}</span>
                    </div>
                  )}
                  {topDrainer && (
                    <div>
                      <span className="text-[7px] font-mono tracking-widest text-[#141313]/20 uppercase block mb-1">{t.map.topDrainer}</span>
                      <span className="text-sm font-sans text-[#FF8A80]/60">{topDrainer.name}</span>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </section>
      )}

      {/* ═══════════════════════════════════ */}
      {/* RITUALS                             */}
      {/* ═══════════════════════════════════ */}
      {activeTab === 'rituals' && (
        <section className="space-y-8">
          <div>
            <h2 className="text-sm font-bold tracking-tight text-[#141313] mb-1">{t.rituals.title}</h2>
            <p className="text-[10px] font-mono text-[#141313]/40 tracking-widest">{t.rituals.subtitle}</p>
          </div>

          {/* Add ritual form */}
          <div className="flex flex-wrap items-end gap-3 border-b border-black/6 pb-6">
            <div className="flex-1 min-w-40">
              <input
                type="text"
                placeholder={t.rituals.addPlaceholder}
                value={newRitualTitle}
                onChange={e => setNewRitualTitle(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addRitual()}
                className="w-full bg-transparent outline-none text-sm text-[#141313]/80 placeholder:text-[#141313]/20 font-sans pb-2 border-b border-black/10 focus:border-[#141313] transition-colors"
              />
            </div>
            <input
              type="text"
              placeholder={t.rituals.freqPlaceholder}
              value={newRitualFreq}
              onChange={e => setNewRitualFreq(e.target.value)}
              className="bg-transparent outline-none text-[10px] font-mono text-[#141313]/40 placeholder:text-[#141313]/15 pb-2 border-b border-black/8 focus:border-[#141313] transition-colors w-32"
            />
            {/* Energy gain dots */}
            <div className="flex items-center gap-2 pb-2">
              {[1, 2, 3, 4, 5].map(n => (
                <button
                  key={n}
                  onClick={() => setNewRitualEnergy(n)}
                  className="w-3 h-3 rounded-full transition-all duration-200"
                  style={{
                    backgroundColor: newRitualEnergy >= n ? '#2D6A4F' : 'rgba(20,19,19,0.07)',
                    opacity: newRitualEnergy >= n ? 0.6 : 1,
                  }}
                />
              ))}
            </div>
            <button
              onClick={addRitual}
              disabled={!newRitualTitle.trim()}
              className={`text-[9px] font-mono font-bold tracking-[0.3em] uppercase transition-colors pb-2 ${
                newRitualTitle.trim() ? 'text-[#141313] hover:text-[#2D6A4F]' : 'text-[#141313]/15 cursor-not-allowed'
              }`}
            >
              + {t.rituals.add}
            </button>
          </div>

          {/* Today's progress */}
          {rituals.length > 0 && (
            <div className="flex items-center gap-4">
              <div className="flex-1 h-[2px] bg-black/5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#2D6A4F]/30 rounded-full transition-all duration-700"
                  style={{ width: `${(todayDoneRituals.length / rituals.length) * 100}%` }}
                />
              </div>
              <span className="text-[8px] font-mono text-[#141313]/25 shrink-0">
                {todayDoneRituals.length}/{rituals.length} {language === 'id' ? 'hari ini' : 'today'}
              </span>
            </div>
          )}

          {/* Rituals list */}
          {rituals.length === 0 ? (
            <p className="text-[10px] font-mono text-[#141313]/25 italic">{t.rituals.empty}</p>
          ) : (
            <div className="space-y-0">
              {rituals.map((ritual) => {
                const done = todayDoneRituals.includes(ritual.id);
                return (
                  <div key={ritual.id} className="flex items-start gap-4 py-4 border-b border-black/5 group">
                    <button
                      onClick={() => toggleRitualDone(ritual.id)}
                      className={`w-3.5 h-3.5 rounded-full border mt-0.5 shrink-0 transition-all duration-200 ${
                        done ? 'bg-[#2D6A4F]/50 border-[#2D6A4F]/50' : 'border-black/15 hover:border-[#2D6A4F]/30'
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <p className={`text-[11px] font-sans transition-all duration-200 mb-1 ${
                        done ? 'line-through text-[#141313]/25' : 'text-[#141313]/70'
                      }`}>
                        {ritual.title}
                      </p>
                      <div className="flex items-center gap-3">
                        {ritual.frequency && (
                          <span className="text-[7px] font-mono text-[#141313]/20 tracking-widest">{ritual.frequency}</span>
                        )}
                        {ritual.lastDone && (
                          <>
                            <span className="w-0.5 h-0.5 rounded-full bg-[#141313]/15" />
                            <span className="text-[7px] font-mono text-[#141313]/15">
                              {language === 'id' ? 'Terakhir:' : 'Last:'} {ritual.lastDone}
                            </span>
                          </>
                        )}
                        {/* Energy dots */}
                        <span className="w-0.5 h-0.5 rounded-full bg-[#141313]/15" />
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map(n => (
                            <div
                              key={n}
                              className="w-1.5 h-1.5 rounded-full"
                              style={{ backgroundColor: ritual.energyGain >= n ? '#2D6A4F' : 'rgba(20,19,19,0.07)', opacity: ritual.energyGain >= n ? 0.5 : 1 }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    <span className={`text-[7px] font-mono tracking-widest shrink-0 mt-0.5 ${
                      done ? 'text-[#2D6A4F]/50' : 'text-[#141313]/15'
                    }`}>
                      {done ? t.rituals.done : t.rituals.undone}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

    </div>
  );
}
