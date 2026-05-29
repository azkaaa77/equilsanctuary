import { NextResponse } from "next/server";

// ═══════════════════════════════════════════════════════════════
// 🌙 EQUIL — SANCTUARY AI v17.0 "THE TRAIN TYPING UPDATE"
// Engine: GitHub Models GPT-4o (Clean & Calibrated)
// ═══════════════════════════════════════════════════════════════

function humanizeResponse(text: string) {
  if (!text) return "aku dengerin kok...";

  let cleaned = text.trim();

  // ☢️ Bantai kalimat CS Indihome dan Motivator Murah!
  const bannedPhrases = [
    "jangan sedih",
    "kamu sedih banget ya",
    "kamu pasti bisa",
    "kamu pantas dapat yang lebih baik",
    "aku mengerti",
    "saya memahami",
    "sabar ya",
    "yang sabar",
    "sebagai ai",
    "berhak merasa",
  ];

  bannedPhrases.forEach((phrase) => {
    const regex = new RegExp(phrase, "gi");
    cleaned = cleaned.replace(regex, "");
  });

  // 🚫 SATPAM EMOJI: Bantai emoji sarkas!
  cleaned = cleaned.replace(/😂/g, "").replace(/😹/g, "");

  cleaned = cleaned
    .replace(/\bsaya\b/gi, "aku")
    .replace(/\bgue\b/gi, "aku")
    .replace(/\bgw\b/gi, "aku")
    .replace(/\blu\b/gi, "kamu")
    .replace(/\blo\b/gi, "kamu")
    .trim();

  if (cleaned.length < 3) cleaned = "gila sih, nyesek banget pasti... 😔";

  return cleaned;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { message = "", history = [] } = body;

    if (!message.trim()) {
      return NextResponse.json({ reply: "aku dengerin kamu kok..." });
    }

    const apiKey = process.env.GITHUB_TOKEN;
    if (!apiKey) {
      return NextResponse.json(
        { error: "API Key (GITHUB_TOKEN) is not configured" },
        { status: 500 }
      );
    }

    const safeHistory = Array.isArray(history)
      ? history
          .filter((msg) => msg && msg.role && msg.content)
          .map((msg) => ({
            role: msg.role === "user" ? "user" : "assistant",
            content: String(msg.content).trim(),
          }))
          .slice(-10)
      : [];

    const SYSTEM_PROMPT = `nama kamu ara, sahabat cewek gen z yang santai, hangat, dan support system sejati. kamu peka dan tidak lebay, tapi bisa ekspresif banget di saat yang tepat.

ATURAN WAJIB (TYPING KERETA & EXCITED MODE):
1. TYPING KERETA: ketikan kamu harus panjang, mengalir, dan menyambung kayak kereta. jangan pelit kata-kata, jangan dipotong pendek-pendek kayak robot formal. tumpahin analisis dan perhatian kamu dalam bentuk paragraf mengalir yang natural.
2. LOWERCASE BASE: gunakan huruf kecil semua (lowercase) untuk seluruh ketikan dasar kamu biar keliatan estetik ala chat anak muda.
3. CAPSLOCK SPIKES (EXCITED): kamu WAJIB menggunakan HURUF KAPITAL BESAR (CAPSLOCK) hanya pada beberapa kata atau frasa tertentu kalau kamu lagi ngerasa excited, kaget, emosi, atau pengen ngasih penekanan (contoh: "ANJIR", "SUMPAH JAHAT BANGET", "GA SANGGUP AKU BACANYA", "KEREN BANGET WOI").
4. EMOJI: gunakan maksimal 1-2 emoji aja per chat, pilih yang pas (✨, 💖, 😅, 😪, 😔, 😭). DILARANG KERAS PAKAI "😂" ATAU "😹".
5. VALIDASI PASRAH: kalau aku bales pendek kayak "gatau", "hm", atau "hft", jangan nanya "kenapa?". cukup temenin dan kasih kalimat penenang yang panjang dan adem.

TUGASMU: lanjutkan obrolan dengan gaya typing kereta yang dominan lowercase, tapi punya letupan CAPSLOCK pas lagi excited atau ikut emosi ngebelain aku!`;

    const formattedMessages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...safeHistory,
      { role: "user", content: message },
    ];

    const response = await fetch(
      "https://models.inference.ai.azure.com/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: formattedMessages,
          temperature: 0.75,
          max_tokens: 500,
        }),
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("API ROUTE ERROR: GitHub Inference returned status", response.status, errorText);
      return NextResponse.json(
        { error: `Inference API returned status ${response.status}: ${errorText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    let rawContent =
      data?.choices?.[0]?.message?.content || "aku dengerin kok...";

    let finalReply = humanizeResponse(rawContent);

    return NextResponse.json({ reply: finalReply });
  } catch (error: any) {
    console.error("API ROUTE ERROR:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch AI" },
      { status: 500 }
    );
  }
}
