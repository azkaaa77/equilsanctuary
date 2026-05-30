'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '@/components/providers/language-provider';

// ─────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────
type Tab = 'vault' | 'tracker' | 'patterns' | 'rules';

type StressLevel = 1 | 2 | 3 | 4 | 5;
type ImpulseCategory = 'fashion' | 'food' | 'tech' | 'entertainment' | 'beauty' | 'other';

interface VaultItem {
  id: string;
  name: string;
  price: number;
  currency: string;
  category: ImpulseCategory;
  stressLevel: StressLevel;
  addedAt: number; // timestamp
  unlockAt: number; // timestamp (+24h)
  status: 'locked' | 'unlocked' | 'abandoned';
  reflection: string;
}

interface ImpulseLog {
  id: string;
  timestamp: number;
  trigger: string;
  stressLevel: StressLevel;
  resisted: boolean;
  note: string;
}

interface GuardRule {
  id: string;
  text: string;
  active: boolean;
}

// ─────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────
const CATEGORY_ICONS: Record<ImpulseCategory, string> = {
  fashion: '◐', food: '◑', tech: '◒', entertainment: '◓', beauty: '◔', other: '○',
};

const STRESS_COLORS: Record<StressLevel, string> = {
  1: '#74C69D', 2: '#B5C4B1', 3: '#FFB347', 4: '#FF8A80', 5: '#E57373',
};

const HOUR_MS = 3_600_000;
const VAULT_DURATION = 24 * HOUR_MS;

// ─────────────────────────────────────────────────────────────
// DICT
// ─────────────────────────────────────────────────────────────
const dict = {
  id: {
    pageLabel: '05 // IMPULSE SHIELD',
    headline1: 'Benteng',
    headline2: 'Finansial.',
    subtitle: 'Jeda 24 jam sebelum keputusan yang mungkin kamu sesali.',
    statusLabel: 'SHIELD ACTIVE',
    tabs: { vault: 'VAULT', tracker: 'TRACKER', patterns: 'POLA', rules: 'ATURAN' },

    vault: {
      title: '24-Hour Cooling Vault',
      subtitle: 'Kunci keinginan belanjamu di sini. Jika setelah 24 jam kamu masih menginginkannya — barulah pikirkan lebih lanjut.',
      addTitle: 'Masukkan ke Vault',
      namePlaceholder: 'Apa yang ingin kamu beli?',
      pricePlaceholder: 'Harga',
      stressLabel: 'Seberapa tinggi tekananmu saat ini?',
      stressLevels: ['Santai', 'Sedikit Stres', 'Lumayan Stres', 'Stres', 'Sangat Stres'],
      reflectionPlaceholder: 'Kenapa kamu ingin ini sekarang? (opsional)',
      lockBtn: 'KUNCI DI VAULT',
      categories: { fashion: 'Fashion', food: 'Makanan', tech: 'Teknologi', entertainment: 'Hiburan', beauty: 'Kecantikan', other: 'Lainnya' },
      lockedLabel: 'DIKUNCI',
      unlockedLabel: 'TERBUKA',
      abandonedLabel: 'DITINGGALKAN',
      timeLeft: 'tersisa',
      unlockNow: 'Buka Kunci',
      abandon: 'Tinggalkan',
      confirmAbandon: 'Tandai sebagai tidak jadi dibeli',
      emptyVault: 'Vault kosong. Dorongan belanja berikutnya? Kunci di sini dulu.',
      savedAmount: 'Berhasil Tidak Terbelanjakan',
      insight_high: 'Stres tinggi saat memasukkan item ini. Pertimbangkan dengan hati-hati.',
      insight_low: 'Kamu masuk dengan kepala cukup dingin. Keputusan terasa lebih jernih.',
    },

    tracker: {
      title: 'Catat Dorongan Belanja',
      subtitle: 'Setiap kali kamu merasakan dorongan belanja emosional, catat di sini — bahkan jika kamu berhasil menahannya.',
      triggerPlaceholder: 'Apa yang memicunya? (kebosanan, sedih, scroll media sosial...)',
      notePlaceholder: 'Catatan singkat (opsional)',
      resisted: 'Berhasil Ditahan',
      notResisted: 'Tidak Ditahan',
      log: 'CATAT',
      history: 'Riwayat Dorongan',
      emptyLog: 'Belum ada catatan. Mulai pantau pola dorongamu.',
      resistedTag: 'DITAHAN',
      notResistedTag: 'TERJADI',
    },

    patterns: {
      title: 'Pola & Wawasan',
      subtitle: 'Lihat kapan dan mengapa dorongan belanjamu paling kuat.',
      totalImpulses: 'Total Dorongan',
      resisted: 'Berhasil Ditahan',
      notResisted: 'Terjadi',
      resistRate: 'Tingkat Pertahanan',
      avgStress: 'Rata-rata Stres',
      topTrigger: 'Pemicu Terbanyak',
      noTrigger: '—',
      stressChart: 'Distribusi Stres saat Dorongan',
      noData: 'Belum cukup data. Mulai catat doronganmu di Tracker.',
      savedTotal: 'Total Berhasil Tidak Terbelanjakan',
      encouragement: [
        'Setiap dorongan yang berhasil ditahan adalah kemenangan kecil yang nyata.',
        'Kesadaran adalah pertahanan pertama. Kamu sudah selangkah lebih jauh.',
        'Pola adalah guru. Kenali siklus emosimu, lalu kuasai.',
      ],
    },

    rules: {
      title: 'Aturan Keuangan Pribadi',
      subtitle: 'Buat guardrail finansial yang bisa kamu pegang saat dorongan datang.',
      addPlaceholder: 'Tulis aturanmu sendiri... (cth: Tidak belanja > 100K saat stres)',
      add: 'TAMBAH',
      defaultRules: [
        'Tidak membeli apapun di atas Rp 200.000 dalam 24 jam pertama menemukan produk.',
        'Jika stres di atas 3/5, tunda semua keputusan pembelian non-esensial.',
        'Cek saldo rekening sebelum setiap pembelian impulsif.',
        'Tanya diri sendiri: "Apakah aku akan bahagia setelah 30 menit membeli ini?"',
      ],
      delete: 'hapus',
      noRules: 'Belum ada aturan. Buat pagar keuanganmu sendiri.',
      activeLabel: 'AKTIF',
    },
  },

  en: {
    pageLabel: '05 // IMPULSE SHIELD',
    headline1: 'Financial',
    headline2: 'Fortress.',
    subtitle: 'A 24-hour pause before a decision you might regret.',
    statusLabel: 'SHIELD ACTIVE',
    tabs: { vault: 'VAULT', tracker: 'TRACKER', patterns: 'PATTERNS', rules: 'RULES' },

    vault: {
      title: '24-Hour Cooling Vault',
      subtitle: 'Lock your purchase desire here. If after 24 hours you still want it — then think it over.',
      addTitle: 'Add to Vault',
      namePlaceholder: 'What do you want to buy?',
      pricePlaceholder: 'Price',
      stressLabel: 'How stressed are you right now?',
      stressLevels: ['Relaxed', 'Slightly Stressed', 'Somewhat Stressed', 'Stressed', 'Very Stressed'],
      reflectionPlaceholder: 'Why do you want this right now? (optional)',
      lockBtn: 'LOCK IN VAULT',
      categories: { fashion: 'Fashion', food: 'Food', tech: 'Technology', entertainment: 'Entertainment', beauty: 'Beauty', other: 'Other' },
      lockedLabel: 'LOCKED',
      unlockedLabel: 'UNLOCKED',
      abandonedLabel: 'ABANDONED',
      timeLeft: 'remaining',
      unlockNow: 'Unlock',
      abandon: 'Abandon',
      confirmAbandon: 'Mark as decided not to buy',
      emptyVault: 'Vault is empty. Next impulse? Lock it here first.',
      savedAmount: 'Successfully Not Spent',
      insight_high: 'High stress when adding this item. Consider carefully.',
      insight_low: 'You entered with a fairly clear head. Decision feels more rational.',
    },

    tracker: {
      title: 'Log a Spending Impulse',
      subtitle: 'Every time you feel an emotional spending urge, log it here — even if you successfully resisted.',
      triggerPlaceholder: 'What triggered it? (boredom, sadness, social media scrolling...)',
      notePlaceholder: 'Short note (optional)',
      resisted: 'Successfully Resisted',
      notResisted: 'Did Not Resist',
      log: 'LOG',
      history: 'Impulse History',
      emptyLog: 'No logs yet. Start tracking your impulse patterns.',
      resistedTag: 'RESISTED',
      notResistedTag: 'OCCURRED',
    },

    patterns: {
      title: 'Patterns & Insights',
      subtitle: 'See when and why your spending impulses are strongest.',
      totalImpulses: 'Total Impulses',
      resisted: 'Successfully Resisted',
      notResisted: 'Occurred',
      resistRate: 'Resistance Rate',
      avgStress: 'Average Stress',
      topTrigger: 'Top Trigger',
      noTrigger: '—',
      stressChart: 'Stress Distribution During Impulses',
      noData: 'Not enough data yet. Start logging impulses in Tracker.',
      savedTotal: 'Total Successfully Not Spent',
      encouragement: [
        'Every resisted impulse is a small but real victory.',
        'Awareness is the first defense. You are already one step ahead.',
        'Patterns are teachers. Know your emotional cycle, then master it.',
      ],
    },

    rules: {
      title: 'Personal Financial Rules',
      subtitle: 'Create financial guardrails you can hold on to when impulses arise.',
      addPlaceholder: 'Write your own rule... (e.g., No purchase over $20 when stressed)',
      add: 'ADD',
      defaultRules: [
        'Do not buy anything over $15 within the first 24 hours of discovering a product.',
        'If stress is above 3/5, defer all non-essential purchase decisions.',
        'Check bank balance before every impulsive purchase.',
        'Ask yourself: "Will I be happy 30 minutes after buying this?"',
      ],
      delete: 'delete',
      noRules: 'No rules yet. Build your own financial guardrails.',
      activeLabel: 'ACTIVE',
    },
  },
};

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────
function formatTimeLeft(ms: number, language: string): string {
  if (ms <= 0) return language === 'id' ? 'Terbuka' : 'Unlocked';
  const h = Math.floor(ms / HOUR_MS);
  const m = Math.floor((ms % HOUR_MS) / 60_000);
  return `${h}j ${m}m`;
}

function formatCurrency(amount: number, currency: string): string {
  if (currency === 'IDR') return `Rp ${amount.toLocaleString('id-ID')}`;
  return `$${amount.toLocaleString('en-US')}`;
}

// ─────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────
export default function ImpulseShieldPage() {
  const { language } = useLanguage();
  const t = dict[language as keyof typeof dict] || dict.id;

  const [activeTab, setActiveTab] = useState<Tab>('vault');
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [now, setNow] = useState(Date.now());
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Vault state
  const [vaultItems, setVaultItems] = useState<VaultItem[]>([]);
  const [itemName, setItemName] = useState('');
  const [itemPrice, setItemPrice] = useState('');
  const [itemCurrency] = useState('IDR');
  const [itemCategory, setItemCategory] = useState<ImpulseCategory>('other');
  const [itemStress, setItemStress] = useState<StressLevel>(3);
  const [itemReflection, setItemReflection] = useState('');
  const [addingToVault, setAddingToVault] = useState(false);

  // Tracker state
  const [impulseLog, setImpulseLog] = useState<ImpulseLog[]>([]);
  const [trigger, setTrigger] = useState('');
  const [logStress, setLogStress] = useState<StressLevel>(3);
  const [logResisted, setLogResisted] = useState(true);
  const [logNote, setLogNote] = useState('');
  const [editingLogId, setEditingLogId] = useState<string | null>(null);
  const [editLogTrigger, setEditLogTrigger] = useState('');
  const [editLogNote, setEditLogNote] = useState('');

  // Rules state
  const [rules, setRules] = useState<GuardRule[]>([]);
  const [newRule, setNewRule] = useState('');
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null);
  const [editRuleText, setEditRuleText] = useState('');

  // Encouragement quote rotation
  const [quoteIdx, setQuoteIdx] = useState(0);

  // Parallax
  useEffect(() => {
    const h = (e: MouseEvent) =>
      setMousePos({ x: (e.clientX / window.innerWidth) * 2 - 1, y: (e.clientY / window.innerHeight) * 2 - 1 });
    window.addEventListener('mousemove', h);
    return () => window.removeEventListener('mousemove', h);
  }, []);

  // Live timer — update every minute
  useEffect(() => {
    timerRef.current = setInterval(() => setNow(Date.now()), 60_000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  // Quote rotation
  useEffect(() => {
    const i = setInterval(() => setQuoteIdx(p => (p + 1) % 3), 8000);
    return () => clearInterval(i);
  }, []);

  // Persist load
  useEffect(() => {
    const v = localStorage.getItem('is_vault'); if (v) setVaultItems(JSON.parse(v));
    const l = localStorage.getItem('is_log'); if (l) setImpulseLog(JSON.parse(l));
    const r = localStorage.getItem('is_rules');
    if (r) {
      setRules(JSON.parse(r));
    } else {
      // seed default rules
      const defaults: GuardRule[] = t.rules.defaultRules.map((text, i) => ({
        id: `default-${i}`,
        text,
        active: true,
      }));
      setRules(defaults);
      localStorage.setItem('is_rules', JSON.stringify(defaults));
    }
  }, []);

  // ── VAULT ACTIONS ──
  const lockItem = () => {
    if (!itemName.trim()) return;
    const item: VaultItem = {
      id: Date.now().toString(),
      name: itemName,
      price: parseFloat(itemPrice) || 0,
      currency: itemCurrency,
      category: itemCategory,
      stressLevel: itemStress,
      addedAt: Date.now(),
      unlockAt: Date.now() + VAULT_DURATION,
      status: 'locked',
      reflection: itemReflection,
    };
    const updated = [item, ...vaultItems];
    setVaultItems(updated);
    localStorage.setItem('is_vault', JSON.stringify(updated));
    setItemName(''); setItemPrice(''); setItemReflection('');
    setItemStress(3); setAddingToVault(false);
  };

  const updateVaultStatus = (id: string, status: 'unlocked' | 'abandoned') => {
    const updated = vaultItems.map(i => i.id === id ? { ...i, status } : i);
    setVaultItems(updated);
    localStorage.setItem('is_vault', JSON.stringify(updated));
  };

  const savedTotal = vaultItems
    .filter(i => i.status === 'abandoned')
    .reduce((sum, i) => sum + i.price, 0);

  // ── TRACKER ACTIONS ──
  const logImpulse = () => {
    if (!trigger.trim()) return;
    const entry: ImpulseLog = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      trigger,
      stressLevel: logStress,
      resisted: logResisted,
      note: logNote,
    };
    const updated = [entry, ...impulseLog];
    setImpulseLog(updated);
    localStorage.setItem('is_log', JSON.stringify(updated));
    setTrigger(''); setLogNote(''); setLogStress(3); setLogResisted(true);
  };

  // ── PATTERNS COMPUTED ──
  const totalImpulses = impulseLog.length;
  const resistedCount = impulseLog.filter(l => l.resisted).length;
  const resistRate = totalImpulses > 0 ? Math.round((resistedCount / totalImpulses) * 100) : 0;
  const avgStress = totalImpulses > 0
    ? (impulseLog.reduce((s, l) => s + l.stressLevel, 0) / totalImpulses).toFixed(1)
    : '—';
  const triggerCounts: Record<string, number> = {};
  impulseLog.forEach(l => {
    const word = l.trigger.split(' ')[0].toLowerCase();
    triggerCounts[word] = (triggerCounts[word] || 0) + 1;
  });
  const topTrigger = Object.entries(triggerCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || t.patterns.noTrigger;
  const stressDist: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  impulseLog.forEach(l => stressDist[l.stressLevel]++);

  // ── RULES ACTIONS ──
  const addRule = () => {
    if (!newRule.trim()) return;
    const r: GuardRule = { id: Date.now().toString(), text: newRule, active: true };
    const updated = [...rules, r];
    setRules(updated);
    localStorage.setItem('is_rules', JSON.stringify(updated));
    setNewRule('');
  };
  const toggleRule = (id: string) => {
    const updated = rules.map(r => r.id === id ? { ...r, active: !r.active } : r);
    setRules(updated);
    localStorage.setItem('is_rules', JSON.stringify(updated));
  };
  const deleteRule = (id: string) => {
    const updated = rules.filter(r => r.id !== id);
    setRules(updated);
    localStorage.setItem('is_rules', JSON.stringify(updated));
  };

  const saveEditRule = (id: string) => {
    if (!editRuleText.trim()) return;
    const updated = rules.map(r => r.id === id ? { ...r, text: editRuleText } : r);
    setRules(updated);
    localStorage.setItem('is_rules', JSON.stringify(updated));
    setEditingRuleId(null);
  };

  const deleteImpulseLog = (id: string) => {
    const updated = impulseLog.filter(l => l.id !== id);
    setImpulseLog(updated);
    localStorage.setItem('is_log', JSON.stringify(updated));
  };

  const saveEditImpulseLog = (id: string) => {
    if (!editLogTrigger.trim()) return;
    const updated = impulseLog.map(l => l.id === id ? { ...l, trigger: editLogTrigger, note: editLogNote } : l);
    setImpulseLog(updated);
    localStorage.setItem('is_log', JSON.stringify(updated));
    setEditingLogId(null);
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
            background: 'radial-gradient(circle, rgba(255,138,128,0.04) 0%, transparent 70%)',
            transform: `translate(${mousePos.x * -18}px, ${mousePos.y * -8}px)`,
            transition: 'transform 0.18s ease-out',
          }}
        />

        <span className="block text-[10px] font-mono tracking-[0.3em] text-[#141313]/35 uppercase mb-5">
          {t.pageLabel}
        </span>

        <div style={{ transform: `translate(${mousePos.x * 7}px, ${mousePos.y * 3}px)`, transition: 'transform 0.12s ease-out' }}>
          <h1 className="text-[4.5rem] md:text-[6.5rem] font-extrabold tracking-[-0.05em] leading-[0.85] text-slate-900">
            {t.headline1}<br />
            <span className="font-serif italic font-normal text-emerald-700">{t.headline2}</span>
          </h1>
        </div>

        <p className="mt-5 text-[11px] font-mono tracking-[0.2em] text-[#141313]/60 uppercase">{t.subtitle}</p>

        {/* Rotating encouragement quote */}
        <div className="mt-6 flex items-center gap-4">
          <div className="h-px w-12 bg-[#141313]/10" />
          <p className="text-[10px] font-sans italic text-[#141313]/50 transition-all duration-700">
            {t.patterns.encouragement[quoteIdx]}
          </p>
        </div>

        <div className="mt-4 flex items-center gap-4">
          <div className="h-px w-12 bg-[#141313]/15" />
          <span className="text-[8px] font-mono tracking-[0.35em] text-[#141313]/30 uppercase">{t.statusLabel}</span>
          <div className="h-px flex-1 bg-black/5" />
        </div>
      </section>

      {/* ── TABS ── */}
      <div className="flex bg-gray-100/50 p-1 rounded-full gap-1">
        {(['vault', 'tracker', 'patterns', 'rules'] as Tab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2.5 text-[9px] font-mono font-bold tracking-[0.3em] uppercase transition-all duration-300 rounded-full ${
              activeTab === tab
                ? 'bg-white text-emerald-800 shadow-sm'
                : 'text-[#141313]/40 hover:text-[#141313]'
            }`}
          >
            {t.tabs[tab]}
          </button>
        ))}
      </div>

      {/* ══════════════════════════════════════════ */}
      {/* VAULT                                      */}
      {/* ══════════════════════════════════════════ */}
      {activeTab === 'vault' && (
        <section className="space-y-10">
          <div>
            <h2 className="text-sm font-bold tracking-tight text-[#141313] mb-1">{t.vault.title}</h2>
            <p className="text-[10px] font-mono text-[#141313]/60 tracking-widest max-w-lg">{t.vault.subtitle}</p>
          </div>

          {/* Saved total */}
          {savedTotal > 0 && (
            <div className="flex items-center gap-4">
              <div className="h-px w-8 bg-[#2D6A4F]/30" />
              <span className="text-[9px] font-mono text-[#2D6A4F]/70 tracking-widest uppercase">
                {t.vault.savedAmount}: {formatCurrency(savedTotal, itemCurrency)}
              </span>
            </div>
          )}

          {/* Add to vault toggle */}
          <div>
            <button
              onClick={() => setAddingToVault(!addingToVault)}
              className={`px-8 py-3 rounded-full text-[9px] font-mono font-bold tracking-[0.35em] uppercase transition-all duration-200 ${
                addingToVault
                  ? 'border border-black/15 text-[#141313]/40 hover:text-[#141313]'
                  : 'bg-emerald-700 text-white hover:bg-emerald-800'
              }`}
            >
              {addingToVault ? '× BATAL' : `+ ${t.vault.addTitle}`}
            </button>
          </div>

          {/* Add form */}
          {addingToVault && (
            <div className="space-y-6 border-t border-black/6 pt-6">
              {/* Item name */}
              <div>
                <input
                  type="text"
                  placeholder={t.vault.namePlaceholder}
                  value={itemName}
                  onChange={e => setItemName(e.target.value)}
                  className="w-full bg-white border border-gray-200 shadow-sm rounded-xl px-4 py-3 outline-none text-base text-[#141313]/80 placeholder:text-[#141313]/40 font-sans focus:border-slate-400 transition-colors"
                />
              </div>

              {/* Price + Category row */}
              <div className="flex gap-4 flex-wrap">
                <div className="flex items-end gap-2">
                  <span className="text-[10px] font-mono text-[#141313]/30 pb-2">Rp</span>
                  <input
                    type="number"
                    placeholder={t.vault.pricePlaceholder}
                    value={itemPrice}
                    onChange={e => setItemPrice(e.target.value)}
                    className="w-32 bg-white border border-gray-200 shadow-sm rounded-xl px-3 py-2 outline-none text-sm text-[#141313]/70 placeholder:text-[#141313]/40 font-mono focus:border-slate-400 transition-colors"
                  />
                </div>

                <div className="flex gap-2 flex-wrap">
                  {(Object.keys(CATEGORY_ICONS) as ImpulseCategory[]).map(cat => (
                    <button
                      key={cat}
                      onClick={() => setItemCategory(cat)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[8px] font-mono tracking-widest uppercase transition-all duration-200 border ${
                        itemCategory === cat
                          ? 'border-[#141313] text-[#141313] bg-[#141313]/5'
                          : 'border-black/8 text-[#141313]/35 hover:border-black/20'
                      }`}
                    >
                      <span>{CATEGORY_ICONS[cat]}</span>
                      {(t.vault.categories as Record<ImpulseCategory, string>)[cat]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Stress level */}
              <div>
                <p className="text-[9px] font-mono tracking-[0.3em] text-[#141313]/60 uppercase mb-4">
                  {t.vault.stressLabel}
                </p>
                <div className="flex items-center gap-5">
                  {([1, 2, 3, 4, 5] as StressLevel[]).map(lv => (
                    <button
                      key={lv}
                      onClick={() => setItemStress(lv)}
                      className="flex flex-col items-center gap-1.5 group"
                    >
                      <div
                        className="rounded-full transition-all duration-200"
                        style={{
                          width: itemStress === lv ? '14px' : '10px',
                          height: itemStress === lv ? '14px' : '10px',
                          backgroundColor: itemStress >= lv ? STRESS_COLORS[lv] : 'rgba(20,19,19,0.07)',
                        }}
                      />
                      <span className={`text-[7px] font-mono tracking-widest transition-colors ${
                        itemStress === lv ? 'text-[#141313]/50' : 'text-[#141313]/15'
                      }`}>
                        {t.vault.stressLevels[lv - 1]}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Reflection */}
              <textarea
                placeholder={t.vault.reflectionPlaceholder}
                value={itemReflection}
                onChange={e => setItemReflection(e.target.value)}
                rows={2}
                className="w-full bg-white border border-gray-200 shadow-sm rounded-xl px-4 py-3 outline-none resize-none text-sm text-[#141313]/60 placeholder:text-[#141313]/40 font-sans focus:border-slate-400 transition-colors leading-relaxed"
              />

              <button
                onClick={lockItem}
                disabled={!itemName.trim()}
                className={`px-10 py-3.5 rounded-full text-[9px] font-mono font-bold tracking-[0.4em] uppercase transition-all duration-200 ${
                  itemName.trim()
                    ? 'bg-emerald-700 text-white hover:bg-emerald-800'
                    : 'bg-black/5 text-[#141313]/20 cursor-not-allowed'
                }`}
              >
                🔒 {t.vault.lockBtn}
              </button>
            </div>
          )}

          {/* Vault items list */}
          <div className="space-y-0">
            {vaultItems.length === 0 ? (
              <p className="text-[10px] font-mono text-[#141313]/25 italic pt-4">{t.vault.emptyVault}</p>
            ) : (
              vaultItems.map((item) => {
                const msLeft = item.unlockAt - now;
                const isLocked = item.status === 'locked' && msLeft > 0;
                const isUnlocked = item.status === 'locked' && msLeft <= 0;
                const isAbandoned = item.status === 'abandoned';
                const isDone = item.status === 'unlocked';
                const pct = Math.max(0, Math.min(100, ((VAULT_DURATION - msLeft) / VAULT_DURATION) * 100));

                return (
                  <div key={item.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-3 group">
                    <div className="flex items-start gap-4">
                      {/* Category icon */}
                      <span className="text-base text-[#141313]/30 shrink-0 mt-0.5">{CATEGORY_ICONS[item.category]}</span>

                      <div className="flex-1 min-w-0">
                        {/* Name + status */}
                        <div className="flex items-start gap-3 mb-1">
                          <p className={`text-sm font-sans font-medium flex-1 ${
                            isAbandoned ? 'line-through text-[#141313]/30' : isDone ? 'text-[#141313]/50' : 'text-[#141313]/80'
                          }`}>
                            {item.name}
                          </p>
                          <span className={`text-[7px] font-mono tracking-[0.3em] uppercase shrink-0 ${
                            isLocked ? 'text-[#141313]/40'
                            : isUnlocked ? 'text-[#2D6A4F]/60'
                            : isAbandoned ? 'text-[#141313]/20'
                            : 'text-[#141313]/25'
                          }`}>
                            {isLocked ? `🔒 ${t.vault.lockedLabel}` : isUnlocked ? `✓ ${t.vault.unlockedLabel}` : isAbandoned ? t.vault.abandonedLabel : t.vault.unlockedLabel}
                          </span>
                        </div>

                        {/* Price + stress */}
                        <div className="flex items-center gap-3 mb-2">
                          {item.price > 0 && (
                            <span className="text-[9px] font-mono text-[#141313]/40">
                              {formatCurrency(item.price, item.currency)}
                            </span>
                          )}
                          <span className="w-0.5 h-0.5 rounded-full bg-[#141313]/15" />
                          <span className="text-[8px] font-mono" style={{ color: STRESS_COLORS[item.stressLevel] + 'CC' }}>
                            {t.vault.stressLevels[item.stressLevel - 1]}
                          </span>
                        </div>

                        {/* Cooling progress bar */}
                        {isLocked && (
                          <div className="mb-2">
                            <div className="h-[2px] w-full bg-black/5 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-[#141313]/20 rounded-full transition-all duration-1000"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <span className="text-[7px] font-mono text-[#141313]/25 mt-1 block">
                              {formatTimeLeft(msLeft, language)} {t.vault.timeLeft}
                            </span>
                          </div>
                        )}

                        {/* Insight */}
                        {item.stressLevel >= 4 && isLocked && (
                          <p className="text-[8px] font-mono text-[#FF8A80]/60 italic mb-2">
                            {t.vault.insight_high}
                          </p>
                        )}

                        {/* Reflection */}
                        {item.reflection && (
                          <p className="text-[9px] font-sans italic text-[#141313]/30 mb-2">
                            "{item.reflection}"
                          </p>
                        )}

                        {/* Actions */}
                        {(isUnlocked) && !isDone && !isAbandoned && (
                          <div className="flex gap-4 mt-2">
                            <button
                              onClick={() => updateVaultStatus(item.id, 'unlocked')}
                              className="text-[8px] font-mono text-[#141313]/40 hover:text-[#141313] transition-colors tracking-widest uppercase"
                            >
                              {t.vault.unlockNow}
                            </button>
                            <button
                              onClick={() => updateVaultStatus(item.id, 'abandoned')}
                              className="text-[8px] font-mono text-[#2D6A4F]/50 hover:text-[#2D6A4F] transition-colors tracking-widest uppercase"
                            >
                              {t.vault.confirmAbandon}
                            </button>
                          </div>
                        )}
                        {isLocked && (
                          <button
                            onClick={() => updateVaultStatus(item.id, 'abandoned')}
                            className="mt-2 text-[8px] font-mono text-[#141313]/20 hover:text-[#141313]/50 transition-colors tracking-widest uppercase opacity-0 group-hover:opacity-100 duration-200"
                          >
                            {t.vault.abandon}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════════ */}
      {/* TRACKER                                    */}
      {/* ══════════════════════════════════════════ */}
      {activeTab === 'tracker' && (
        <section className="space-y-10">
          <div>
            <h2 className="text-sm font-bold tracking-tight text-[#141313] mb-1">{t.tracker.title}</h2>
            <p className="text-[10px] font-mono text-[#141313]/60 tracking-widest max-w-lg">{t.tracker.subtitle}</p>
          </div>

          {/* Log form */}
          <div className="space-y-6 pb-8 border-b border-black/6">
            <input
              type="text"
              placeholder={t.tracker.triggerPlaceholder}
              value={trigger}
              onChange={e => setTrigger(e.target.value)}
              className="w-full bg-white border border-gray-200 shadow-sm rounded-xl px-4 py-3 outline-none text-sm text-[#141313]/80 placeholder:text-[#141313]/40 font-sans focus:border-slate-400 transition-colors"
            />

            {/* Stress level */}
            <div className="flex items-center gap-5">
              {([1, 2, 3, 4, 5] as StressLevel[]).map(lv => (
                <button key={lv} onClick={() => setLogStress(lv)} className="flex flex-col items-center gap-1.5">
                  <div
                    className="rounded-full transition-all duration-200"
                    style={{
                      width: logStress === lv ? '14px' : '10px',
                      height: logStress === lv ? '14px' : '10px',
                      backgroundColor: logStress >= lv ? STRESS_COLORS[lv] : 'rgba(20,19,19,0.07)',
                    }}
                  />
                  <span className={`text-[7px] font-mono ${logStress === lv ? 'text-[#141313]/40' : 'text-[#141313]/15'}`}>
                    {lv}
                  </span>
                </button>
              ))}
              <span className="text-[9px] font-mono text-[#141313]/30 ml-2">
                {t.vault.stressLevels[logStress - 1]}
              </span>
            </div>

            {/* Resisted toggle */}
            <div className="flex gap-3">
              <button
                onClick={() => setLogResisted(true)}
                className={`px-5 py-2 rounded-xl text-[8px] font-mono tracking-widest uppercase transition-all duration-200 border ${
                  logResisted
                    ? 'border-emerald-200 text-emerald-700 bg-emerald-50'
                    : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
                }`}
              >
                ✓ {t.tracker.resisted}
              </button>
              <button
                onClick={() => setLogResisted(false)}
                className={`px-5 py-2 rounded-xl text-[8px] font-mono tracking-widest uppercase transition-all duration-200 border ${
                  !logResisted
                    ? 'border-rose-200 text-rose-700 bg-rose-50'
                    : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
                }`}
              >
                × {t.tracker.notResisted}
              </button>
            </div>

            <textarea
              placeholder={t.tracker.notePlaceholder}
              value={logNote}
              onChange={e => setLogNote(e.target.value)}
              rows={2}
              className="w-full bg-white border border-gray-200 shadow-sm rounded-xl px-4 py-3 outline-none resize-none text-sm text-[#141313]/60 placeholder:text-[#141313]/40 font-sans focus:border-slate-400 transition-colors"
            />

            <button
              onClick={logImpulse}
              disabled={!trigger.trim()}
              className={`px-8 py-3 rounded-full text-[9px] font-mono font-bold tracking-[0.4em] uppercase transition-all duration-200 ${
                trigger.trim() ? 'bg-emerald-700 text-white hover:bg-emerald-800' : 'bg-black/5 text-[#141313]/20 cursor-not-allowed'
              }`}
            >
              {t.tracker.log}
            </button>
          </div>

          {/* History */}
          <div>
            <span className="text-[8px] font-mono tracking-[0.4em] text-[#141313]/60 uppercase block mb-5">
              {t.tracker.history}
            </span>
            {impulseLog.length === 0 ? (
              <p className="text-[10px] font-mono text-[#141313]/25 italic">{t.tracker.emptyLog}</p>
            ) : (
              <div className="space-y-0">
                {impulseLog.map((log) => (
                  <div key={log.id} className="group bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-row items-center justify-between p-4 mb-3">
                    {editingLogId === log.id ? (
                      <div className="flex-1 space-y-3">
                        <input
                          value={editLogTrigger}
                          onChange={e => setEditLogTrigger(e.target.value)}
                          className="w-full bg-white border border-gray-200 shadow-sm rounded-xl px-3 py-2 text-xs text-[#141313]/80 font-sans outline-none focus:border-emerald-400 transition-colors"
                          placeholder={t.tracker.triggerPlaceholder}
                        />
                        <input
                          value={editLogNote}
                          onChange={e => setEditLogNote(e.target.value)}
                          className="w-full bg-white border border-gray-200 shadow-sm rounded-xl px-3 py-2 text-xs text-[#141313]/80 font-sans outline-none focus:border-emerald-400 transition-colors"
                          placeholder={t.tracker.notePlaceholder}
                        />
                        <div className="flex gap-2">
                          <button onClick={() => saveEditImpulseLog(log.id)} className="px-4 py-1.5 bg-emerald-700 text-white text-[8px] font-mono font-bold tracking-widest uppercase rounded-full hover:bg-emerald-800 transition-colors">
                            {language === 'id' ? 'SIMPAN' : 'SAVE'}
                          </button>
                          <button onClick={() => setEditingLogId(null)} className="px-4 py-1.5 border border-gray-200 text-gray-500 text-[8px] font-mono font-bold tracking-widest uppercase rounded-full hover:bg-gray-50 transition-colors">
                            {language === 'id' ? 'BATAL' : 'CANCEL'}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex-1 pr-4 flex items-start gap-4">
                          <div
                            className="w-2 h-2 rounded-full shrink-0 mt-1.5"
                            style={{ backgroundColor: log.resisted ? '#2D6A4F' : '#FF8A80', opacity: 0.8 }}
                          />
                          <div className="min-w-0 flex-1">
                            <p className="text-[11px] font-sans text-[#141313]/70 mb-1">{log.trigger}</p>
                            {log.note && <p className="text-[9px] font-sans italic text-[#141313]/50 mb-1">"{log.note}"</p>}
                            <div className="flex items-center gap-3">
                              <span className="text-[7px] font-mono tracking-widest text-[#141313]/40">
                                {new Date(log.timestamp).toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                              </span>
                              <span className="w-0.5 h-0.5 rounded-full bg-[#141313]/15" />
                              <span
                                className="text-[7px] font-mono tracking-widest"
                                style={{ color: log.resisted ? '#2D6A4F' : '#FF8A80', opacity: 0.9 }}
                              >
                                {log.resisted ? t.tracker.resistedTag : t.tracker.notResistedTag}
                              </span>
                              <span className="w-0.5 h-0.5 rounded-full bg-[#141313]/15" />
                              <span className="text-[8px] font-mono" style={{ color: STRESS_COLORS[log.stressLevel], opacity: 0.9 }}>
                                {log.stressLevel}/5
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 shrink-0 m-0">
                          <button
                            onClick={() => { setEditingLogId(log.id); setEditLogTrigger(log.trigger); setEditLogNote(log.note || ''); }}
                            className="flex items-center justify-center w-10 h-10 rounded-xl text-emerald-600 hover:bg-emerald-50 transition-colors m-0 p-0 opacity-0 group-hover:opacity-100 duration-200"
                            title="Edit"
                          >
                            ✎
                          </button>
                          <button
                            onClick={() => deleteImpulseLog(log.id)}
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

      {/* ══════════════════════════════════════════ */}
      {/* PATTERNS                                   */}
      {/* ══════════════════════════════════════════ */}
      {activeTab === 'patterns' && (
        <section className="space-y-10">
          <div>
            <h2 className="text-sm font-bold tracking-tight text-[#141313] mb-1">{t.patterns.title}</h2>
            <p className="text-[10px] font-mono text-[#141313]/60 tracking-widest">{t.patterns.subtitle}</p>
          </div>

          {totalImpulses === 0 ? (
            <p className="text-[10px] font-mono text-[#141313]/25 italic">{t.patterns.noData}</p>
          ) : (
            <>
              {/* Stats row */}
              <div className="flex gap-10 flex-wrap border-b border-black/6 pb-8">
                {[
                  { value: totalImpulses, label: t.patterns.totalImpulses },
                  { value: resistedCount, label: t.patterns.resisted },
                  { value: totalImpulses - resistedCount, label: t.patterns.notResisted },
                  { value: `${resistRate}%`, label: t.patterns.resistRate },
                  { value: avgStress, label: t.patterns.avgStress },
                ].map((s, i) => (
                  <div key={i}>
                    <span className="block text-3xl font-extrabold tracking-tighter text-slate-800 leading-none mb-1">
                      {s.value}
                    </span>
                    <span className="text-[8px] font-mono tracking-widest text-[#141313]/60 uppercase">{s.label}</span>
                  </div>
                ))}
              </div>

              {/* Saved total */}
              {savedTotal > 0 && (
                <div className="flex items-center gap-3">
                  <div className="h-px w-8 bg-[#2D6A4F]/20" />
                  <span className="text-[9px] font-mono text-[#2D6A4F]/60 tracking-widest uppercase">
                    {t.patterns.savedTotal}: {formatCurrency(savedTotal, 'IDR')}
                  </span>
                </div>
              )}

              {/* Stress distribution chart */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <span className="text-[8px] font-mono tracking-[0.4em] text-[#141313]/60 uppercase block mb-5">
                  {t.patterns.stressChart}
                </span>
                <div className="flex items-end gap-4 h-20">
                  {([1, 2, 3, 4, 5] as StressLevel[]).map(lv => {
                    const count = stressDist[lv];
                    const maxCount = Math.max(...Object.values(stressDist));
                    const h = maxCount > 0 ? (count / maxCount) * 64 : 0;
                    return (
                      <div key={lv} className="flex flex-col items-center gap-1.5 flex-1">
                        <span className="text-[8px] font-mono text-[#141313]/50">{count}</span>
                        <div
                          className="w-full rounded-sm transition-all duration-500"
                          style={{ height: `${h}px`, backgroundColor: STRESS_COLORS[lv], opacity: 0.6 }}
                        />
                        <span className="text-[7px] font-mono text-[#141313]/50">{lv}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Top trigger */}
              <div className="flex items-center gap-4 pt-2">
                <div className="h-px w-8 bg-[#141313]/10" />
                <div>
                  <span className="text-[8px] font-mono text-[#141313]/25 tracking-widest uppercase block mb-1">
                    {t.patterns.topTrigger}
                  </span>
                  <span className="text-base font-serif italic text-[#141313]/50">
                    {topTrigger}
                  </span>
                </div>
              </div>

              {/* Resist rate bar */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[8px] font-mono text-[#141313]/60 tracking-widest uppercase">{t.patterns.resistRate}</span>
                  <span className="text-[9px] font-mono font-bold text-slate-800">{resistRate}%</span>
                </div>
                <div className="h-[3px] bg-black/5 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${resistRate}%`,
                      backgroundColor: resistRate >= 70 ? '#2D6A4F' : resistRate >= 40 ? '#FFB347' : '#FF8A80',
                      opacity: 0.5,
                    }}
                  />
                </div>
              </div>
            </>
          )}
        </section>
      )}

      {/* ══════════════════════════════════════════ */}
      {/* RULES                                      */}
      {/* ══════════════════════════════════════════ */}
      {activeTab === 'rules' && (
        <section className="space-y-10">
          <div>
            <h2 className="text-sm font-bold tracking-tight text-[#141313] mb-1">{t.rules.title}</h2>
            <p className="text-[10px] font-mono text-[#141313]/60 tracking-widest max-w-lg">{t.rules.subtitle}</p>
          </div>

          {/* Add rule */}
          <div className="flex items-end gap-4 border-b border-black/6 pb-6">
            <input
              type="text"
              placeholder={t.rules.addPlaceholder}
              value={newRule}
              onChange={e => setNewRule(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addRule()}
              className="flex-1 bg-white border border-gray-200 shadow-sm rounded-xl px-4 py-3 outline-none text-sm text-[#141313]/80 placeholder:text-[#141313]/40 font-sans focus:border-slate-400 transition-colors"
            />
            <button
              onClick={addRule}
              disabled={!newRule.trim()}
              className={`px-5 py-3 rounded-full text-[9px] font-mono font-bold tracking-[0.3em] uppercase transition-colors ${
                newRule.trim() ? 'bg-emerald-700 text-white hover:bg-emerald-800' : 'bg-gray-100 text-[#141313]/20 cursor-not-allowed'
              }`}
            >
              + {t.rules.add}
            </button>
          </div>

          {/* Rules list */}
          {rules.length === 0 ? (
            <p className="text-[10px] font-mono text-[#141313]/25 italic">{t.rules.noRules}</p>
          ) : (
            <div className="space-y-0">
              {rules.map((rule, i) => (
                <div key={rule.id} className="group bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-row items-center justify-between p-4 mb-3">
                  {editingRuleId === rule.id ? (
                    <div className="flex-1 space-y-2">
                      <input
                        value={editRuleText}
                        onChange={e => setEditRuleText(e.target.value)}
                        className="w-full bg-white border border-gray-200 shadow-sm rounded-xl px-3 py-2 text-xs text-[#141313]/80 font-sans outline-none focus:border-emerald-400"
                      />
                      <div className="flex gap-2">
                        <button onClick={() => saveEditRule(rule.id)} className="px-4 py-1.5 bg-emerald-700 text-white text-[8px] font-mono font-bold tracking-widest uppercase rounded-full hover:bg-emerald-800 transition-colors">
                          {language === 'id' ? 'SIMPAN' : 'SAVE'}
                        </button>
                        <button onClick={() => setEditingRuleId(null)} className="px-4 py-1.5 border border-gray-200 text-gray-500 text-[8px] font-mono font-bold tracking-widest uppercase rounded-full hover:bg-gray-50 transition-colors">
                          {language === 'id' ? 'BATAL' : 'CANCEL'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex-1 pr-4 flex items-start gap-3">
                        {/* Toggle */}
                        <button
                          onClick={() => toggleRule(rule.id)}
                          className={`w-3.5 h-3.5 rounded-full border mt-0.5 shrink-0 transition-all duration-200 ${
                            rule.active ? 'bg-emerald-700 border-emerald-700' : 'border-gray-300 hover:border-gray-500'
                          }`}
                        />
                        <p className={`flex-1 text-[11px] font-sans leading-relaxed transition-colors ${
                          rule.active ? 'text-[#141313]/70' : 'text-[#141313]/30 line-through'
                        }`}>
                          {rule.text}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2 shrink-0 m-0">
                        <button
                          onClick={() => { setEditingRuleId(rule.id); setEditRuleText(rule.text); }}
                          className="flex items-center justify-center w-10 h-10 rounded-xl text-emerald-600 hover:bg-emerald-50 transition-colors m-0 p-0 opacity-0 group-hover:opacity-100 duration-200"
                          title="Edit"
                        >
                          ✎
                        </button>
                        <button
                          onClick={() => deleteRule(rule.id)}
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

          {/* Rule count */}
          {rules.length > 0 && (
            <div className="flex items-center gap-3 pt-2">
              <span className="text-[8px] font-mono text-[#141313]/50 tracking-widest">
                {rules.filter(r => r.active).length} / {rules.length} {language === 'id' ? 'aturan aktif' : 'rules active'}
              </span>
            </div>
          )}
        </section>
      )}

    </div>
  );
}
