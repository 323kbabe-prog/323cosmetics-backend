// female.js — 323drop Live (Female-Only Mode, TikTok Cosmetics Top 50)
// Node >= 20, CommonJS

const express = require("express");
const cors = require("cors");
const OpenAI = require("openai");
const textToSpeech = require("@google-cloud/text-to-speech");

const app = express();

/* ---------------- CORS ---------------- */
const ALLOW = ["https://1ai323.ai", "https://www.1ai323.ai"];
app.use(cors({
  origin: (origin, cb) =>
    !origin || ALLOW.includes(origin)
      ? cb(null, true)
      : cb(new Error("CORS: origin not allowed")),
  methods: ["GET", "OPTIONS"],
  allowedHeaders: ["Content-Type"],
  maxAge: 86400,
}));

/* ---------------- OpenAI ---------------- */
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/* ---------------- Google TTS ---------------- */
const googleTTSClient = new textToSpeech.TextToSpeechClient();

// ✅ Always female voice (Gen-Z style)
function pickFemaleVoice() {
  return { languageCode: "en-US", name: "en-US-Neural2-C", ssmlGender: "FEMALE" };
}

async function googleTTS(text) {
  try {
    const [response] = await googleTTSClient.synthesizeSpeech({
      input: { text },
      voice: pickFemaleVoice(),
      audioConfig: { audioEncoding: "MP3" }
    });
    if (!response.audioContent) return null;
    console.log("✅ Google TTS audio length:", response.audioContent.length, "voice: female");
    return Buffer.from(response.audioContent, "binary");
  } catch (e) {
    console.error("❌ Google TTS error:", e.message);
    return null;
  }
}

async function openaiTTS(text) {
  try {
    const out = await openai.audio.speech.create({
      model: "gpt-4o-mini-tts",
      voice: "shimmer", // ✅ female fallback
      input: text,
    });
    console.log("✅ OpenAI TTS generated female audio");
    return Buffer.from(await out.arrayBuffer());
  } catch (e) {
    console.error("❌ OpenAI TTS error:", e.message);
    return null;
  }
}

/* ---------------- State ---------------- */
let nextPickCache = null;
let generatingNext = false;
let lastImgErr = null;

/* ---------------- TikTok Top 50 Cosmetics ---------------- */
const TOP50_COSMETICS = [
  { brand: "Rhode", product: "Peptide Lip Tint", gender: "female" },
  { brand: "Fenty Beauty", product: "Gloss Bomb Lip Gloss", gender: "unisex" },
  { brand: "Anastasia Beverly Hills", product: "Clear Brow Gel", gender: "unisex" },
  { brand: "YSL", product: "Make Me Blush Baby Doll", gender: "female" },
  { brand: "Laura Mercier", product: "Loose Setting Powder", gender: "female" },
  { brand: "Beautyblender", product: "Blending Sponge", gender: "unisex" },
  { brand: "Givenchy", product: "Prisme Libre Blush", gender: "female" },
  { brand: "Sephora Collection", product: "Pro Brushes", gender: "unisex" },
  { brand: "COSRX", product: "Advanced Snail 96 Mucin Essence", gender: "unisex" },
  { brand: "Lush", product: "Dream Cream", gender: "unisex" },
  { brand: "Nyx", product: "Jumbo Eye Pencil", gender: "unisex" },
  { brand: "Nars", product: "Radiant Creamy Concealer", gender: "unisex" },
  { brand: "Too Faced", product: "Better Than Sex Mascara", gender: "female" },
  { brand: "Charlotte Tilbury", product: "Magic Cream", gender: "female" },
  { brand: "Haus Labs", product: "Triclone Foundation", gender: "unisex" },
  { brand: "Dior", product: "Lip Glow Oil", gender: "female" },
  { brand: "Freck Beauty", product: "Faux Freckle Pen", gender: "unisex" },
  { brand: "Sol de Janeiro", product: "Brazilian Crush Mist", gender: "unisex" },
  { brand: "Paula’s Choice", product: "2% BHA Liquid Exfoliant", gender: "unisex" },
  { brand: "Essence", product: "Lash Princess Mascara", gender: "female" },
  { brand: "Color Wow", product: "Dream Coat Spray", gender: "unisex" },
  { brand: "Laneige", product: "Lip Sleeping Mask", gender: "unisex" },
  { brand: "Maybelline", product: "Sky High Mascara", gender: "unisex" },
  { brand: "Kitsch", product: "Heatless Curl Set", gender: "unisex" },
  { brand: "Biodance", product: "Bio-Collagen Mask", gender: "unisex" },
  { brand: "MAC", product: "Squirt Plumping Gloss Stick", gender: "female" },
  { brand: "Clinique", product: "Black Honey Lipstick", gender: "unisex" },
  { brand: "L’Oréal Paris", product: "Infallible Foundation", gender: "unisex" },
  { brand: "Isle of Paradise", product: "Self-Tanning Drops", gender: "unisex" },
  { brand: "Rare Beauty", product: "Liquid Blush", gender: "unisex" },
  { brand: "SHEGLAM", product: "Makeup Essentials", gender: "unisex" },
  { brand: "Huda Beauty", product: "Concealer", gender: "female" },
  { brand: "Cécred", product: "Haircare Treatment", gender: "unisex" },
  { brand: "Medicube", product: "PDRN Pink Glass Glow Set", gender: "unisex" },
  { brand: "E.L.F.", product: "Halo Glow Powder", gender: "unisex" },
  { brand: "Bubble Skincare", product: "Gel Cleanser", gender: "unisex" },
  { brand: "Tower 28 Beauty", product: "SOS Spray", gender: "unisex" },
  { brand: "Olay", product: "Regenerist Cream", gender: "unisex" },
  { brand: "I’m From", product: "Rice Toner", gender: "unisex" },
  { brand: "DIBS Beauty", product: "Desert Island Duo", gender: "unisex" },
  { brand: "Milk Makeup", product: "Cooling Water Jelly Tint", gender: "unisex" },
  { brand: "Glow Recipe", product: "Watermelon Dew Drops", gender: "unisex" },
  { brand: "Danessa Myricks Beauty", product: "Yummy Skin Balm Powder", gender: "unisex" },
  { brand: "Refy", product: "Brow Sculpt", gender: "unisex" },
  { brand: "Kosas", product: "Revealer Concealer", gender: "unisex" },
  { brand: "Bioderma", product: "Micellar Water", gender: "unisex" },
  { brand: "Embryolisse", product: "Lait-Crème Concentré", gender: "unisex" },
  { brand: "CurrentBody", product: "LED Hair Growth Helmet", gender: "unisex" },
  { brand: "Dyson Beauty", product: "Airwrap Styler", gender: "unisex" }
];

/* ---------------- Helpers ---------------- */
async function makeFirstPersonDescription(brand, product) {
  try {
    const prompt = `
      Write a minimum 70-word first-person description of using "${product}" by ${brand}.
      Speak as if I’m applying the product myself.
      Make it sensory, Gen-Z relatable, and authentic.
    `;
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.9,
      messages: [
        { role: "system", content: "You are a beauty lover speaking in first person about using trending products." },
        { role: "user", content: prompt }
      ]
    });
    return completion.choices[0].message.content.trim();
  } catch (e) {
    console.error("❌ Description failed:", e.message);
    return `Using ${product} by ${brand} feels unforgettable and addictive.`;
  }
}

function pickProductAlgorithm() {
  const femalePool = TOP50_COSMETICS.filter(p => p.gender === "female" || p.gender === "unisex");
  const weightTop = 0.7;
  let pool = Math.random() < weightTop ? femalePool.slice(0, 20) : femalePool.slice(20);
  if (!pool.length) pool = femalePool;
  return pool[Math.floor(Math.random() * pool.length)];
}

function stylizedPrompt(brand, product) {
  return `Create a photocard of a young female Korean idol using ${product} by ${brand}, pastel background, K-beauty glow, no logos.`;
}

async function generateImageUrl(brand, product) {
  try {
    const out = await openai.images.generate({
      model: "gpt-image-1", prompt: stylizedPrompt(brand, product), size: "1024x1024"
    });
    const d = out?.data?.[0];
    if (d?.b64_json) return `data:image/png;base64,${d.b64_json}`;
    if (d?.url) return d.url;
  } catch (e) {
    console.error("❌ Image gen error:", e.message);
  }
  return "https://placehold.co/600x600?text=No+Image";
}

async function generateNextPick() {
  if (generatingNext) return;
  generatingNext = true;
  try {
    const pick = pickProductAlgorithm();
    const description = await makeFirstPersonDescription(pick.brand, pick.product);
    const imageUrl = await generateImageUrl(pick.brand, pick.product);

    let audioBuffer = await googleTTS(description);
    if (!audioBuffer) audioBuffer = await openaiTTS(description);

    let voiceBase64 = null;
    if (audioBuffer) voiceBase64 = `data:audio/mpeg;base64,${audioBuffer.toString("base64")}`;

    nextPickCache = {
      brand: pick.brand,
      product: pick.product,
      gender: "female",
      description,
      hashtags: ["#TikTokMadeMeBuyIt", "#BeautyTok", "#NowTrending"],
      image: imageUrl,
      voice: voiceBase64,
      refresh: voiceBase64 ? 3000 : null
    };
  } finally {
    generatingNext = false;
  }
}

/* ---------------- API ---------------- */
app.get("/api/trend", async (req, res) => {
  if (!nextPickCache) await generateNextPick();
  const result = nextPickCache;
  nextPickCache = null;
  generateNextPick();
  res.json(result);
});

app.get("/api/voice", async (req, res) => {
  const text = req.query.text || "";
  if (!text) return res.status(400).json({ error: "Missing text" });

  let audioBuffer = await googleTTS(text);
  if (!audioBuffer) audioBuffer = await openaiTTS(text);
  if (!audioBuffer) return res.status(500).json({ error: "No audio generated" });
  res.setHeader("Content-Type", "audio/mpeg");
  res.send(audioBuffer);
});

app.get("/health", (_req, res) => res.json({ ok: true, time: Date.now() }));

/* ---------------- Start ---------------- */
const PORT = process.env.PORT || 10000;
app.listen(PORT, async () => {
  console.log(`✅ 323drop backend running on :${PORT}`);
  await generateNextPick();
});
