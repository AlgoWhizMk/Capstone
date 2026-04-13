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

// ─── POST /api/chat ──────────────────────────────────────────────────────────
router.post("/", async (req, res) => {
  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "messages array is required." });
    }

    const latest = messages[messages.length - 1];
    if (!latest || !latest.text) {
      return res.status(400).json({ error: "Last message must have text." });
    }

    // ── Mode 1: Fallback (no Gemini key) ──────────────────────────────────
    if (!isGeminiConfigured()) {
      console.log("ℹ️  Using offline fallback Q&A (GEMINI_API_KEY not set)");
      const answer = getFallbackAnswer(latest.text);
      return res.json({ reply: answer, mode: "fallback" });
    }

    // ── Mode 2: Gemini AI (key configured) ────────────────────────────────
    try {
      const geminiModel = getModel();

      // Build history (all messages except the last one)
      const history = messages.slice(0, -1).map((m) => ({
        role: m.role,
        parts: [{ text: m.text }],
      }));

      const chat = geminiModel.startChat({ history });
      const result = await chat.sendMessage(latest.text);
      const reply = result.response.text();

      if (!reply) throw new Error("Empty Gemini response");

      return res.json({ reply, mode: "gemini" });

    } catch (geminiErr) {
      // Gemini failed — gracefully fall back to Q&A
      console.warn("⚠️  Gemini failed, falling back to Q&A:", geminiErr.message);
      const answer = getFallbackAnswer(latest.text);
      return res.json({ reply: answer, mode: "fallback" });
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

export default router;
