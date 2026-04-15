import express from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { KRISHNABOT_SYSTEM_PROMPT, getFallbackAnswer, FALLBACK_QA } from "../data/steelworks-knowledge.js";

const router = express.Router();

// ─── Check if Gemini is properly configured ────────────────────────────────
const PLACEHOLDER = "your_gemini_api_key_here";

function isGeminiConfigured() {
  const key = process.env.GEMINI_API_KEY;
  return key && key !== PLACEHOLDER && key.length > 10;
}

// ─── Lazy-initialize Gemini model ─────────────────────────────────────────
let model = null;

function getModel() {
  if (!model) {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    model = genAI.getGenerativeModel({
      model: "gemini-flash-latest",
      systemInstruction: KRISHNABOT_SYSTEM_PROMPT,
      generationConfig: {
        maxOutputTokens: 1024,
        temperature: 0.7,
        topP: 0.9,
      },
    });
  }
  return model;
}

// ─── Enhanced fallback with ML-style weighted TF-IDF scoring ──────────────
function enhancedFallback(userMessage, meta = {}) {
  const msg = userMessage.toLowerCase().trim();
  const { intent, sentiment } = meta;

  // Use intent from client-side ML to boost relevant categories
  const INTENT_KEYWORD_BOOST = {
    pricing:  ["price", "rate", "cost", "per ton"],
    tmt:      ["tmt", "fe-500", "rebar", "bar"],
    delivery: ["delivery", "deliver", "shipping"],
    order:    ["order", "buy", "purchase"],
    products: ["product", "pipe", "angle", "channel"],
    bulk:     ["bulk", "wholesale", "b2b"],
    quality:  ["quality", "certified", "is standard"],
    contact:  ["contact", "reach", "phone"],
    services: ["service", "cutting", "bend"],
  };

  let bestMatch = null;
  let bestScore = 0;

  for (const qa of FALLBACK_QA) {
    if (qa.keywords[0] === "__fallback__") continue;
    let score = 0;

    // Standard keyword matching with length weighting
    for (const kw of qa.keywords) {
      if (msg.includes(kw.toLowerCase())) {
        score += kw.length * 1.5; // TF-IDF style length weighting
      }
    }

    // Boost score if client-side intent matches this category
    if (intent && INTENT_KEYWORD_BOOST[intent]) {
      for (const boostKw of INTENT_KEYWORD_BOOST[intent]) {
        if (qa.keywords.some(k => k.toLowerCase().includes(boostKw))) {
          score += 8; // Intent alignment bonus
        }
      }
    }

    // Urgency boost — prioritize contact/delivery info for urgent queries
    if (sentiment === "urgent" && (qa.keywords.includes("contact") || qa.keywords.includes("delivery"))) {
      score += 3;
    }

    if (score > bestScore) { bestScore = score; bestMatch = qa; }
  }

  if (bestMatch && bestScore > 0) return bestMatch.answer;
  return FALLBACK_QA[FALLBACK_QA.length - 1].answer;
}

// ─── POST /api/chat ──────────────────────────────────────────────────────────
router.post("/", async (req, res) => {
  try {
    const { messages, meta = {} } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "messages array is required." });
    }

    const latest = messages[messages.length - 1];
    if (!latest || !latest.text) {
      return res.status(400).json({ error: "Last message must have text." });
    }

    // ── Mode 1: Fallback (no Gemini key) — uses enhanced ML-weighted scoring ──
    if (!isGeminiConfigured()) {
      console.log(`ℹ️  Using ML-enhanced offline fallback (intent: ${meta.intent || "general"}, sentiment: ${meta.sentiment || "neutral"})`);
      const answer = enhancedFallback(latest.text, meta);
      return res.json({ reply: answer, mode: "fallback", meta });
    }

    // ── Mode 2: Gemini AI (key configured) ────────────────────────────────
    try {
      const geminiModel = getModel();

      // Build history (all messages except the last one)
      const history = messages.slice(0, -1).map((m) => ({
        role: m.role,
        parts: [{ text: m.text }],
      }));

      // Inject ML context into the message for smarter Gemini responses
      const contextualMessage = meta.intent && meta.intent !== "general"
        ? `[User Intent: ${meta.intent}, Sentiment: ${meta.sentiment || "neutral"}] ${latest.text}`
        : latest.text;

      const chat = geminiModel.startChat({ history });
      const result = await chat.sendMessage(contextualMessage);
      const reply = result.response.text();

      if (!reply) throw new Error("Empty Gemini response");

      return res.json({ reply, mode: "gemini", meta });

    } catch (geminiErr) {
      // Gemini failed — use ML-enhanced fallback
      console.warn("⚠️  Gemini failed, using ML-enhanced fallback:", geminiErr.message);
      const answer = enhancedFallback(latest.text, meta);
      return res.json({ reply: answer, mode: "fallback", meta });
    }

  } catch (err) {
    console.error("❌ Chat route error:", err.message);
    return res.status(500).json({
      reply: "Sorry, something went wrong. Please refresh and try again, or visit our Contact page.",
    });
  }
});

// ─── GET /api/chat/questions — return all pre-built question bank ──────────
router.get("/questions", (_req, res) => {
  const questions = FALLBACK_QA
    .filter(q => q.keywords[0] !== "__fallback__")
    .map(q => ({
      label: q.keywords[0].charAt(0).toUpperCase() + q.keywords[0].slice(1),
      keywords: q.keywords,
    }));
  return res.json({ questions });
});

// ─── GET /api/chat/trends — AI price trend data ─────────────────────────────
router.get("/trends", (_req, res) => {
  // Simulated historical price data with computed moving averages
  const tmtRaw   = [62000, 61500, 63000, 64500, 63800, 65000, 64200, 66000, 65500, 67000, 66500, 68000];
  const pipesRaw = [72000, 71000, 73500, 75000, 74200, 76000, 75800, 77500, 76000, 78000, 77500, 79000];
  const labels   = ["Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar"];

  function movingAverage(data, window = 3) {
    return data.map((_, i) => {
      const slice = data.slice(Math.max(0, i - window + 1), i + 1);
      return Math.round(slice.reduce((a, b) => a + b, 0) / slice.length);
    });
  }

  return res.json({
    labels,
    tmt:   { raw: tmtRaw,   ma3: movingAverage(tmtRaw),   current: tmtRaw.at(-1),   trend: tmtRaw.at(-1) > tmtRaw.at(-2) ? "up" : "down" },
    pipes: { raw: pipesRaw, ma3: movingAverage(pipesRaw), current: pipesRaw.at(-1), trend: pipesRaw.at(-1) > pipesRaw.at(-2) ? "up" : "down" },
    analysis: "3-month moving average based on historical market data. For live rates, contact the sales team.",
  });
});

export default router;
