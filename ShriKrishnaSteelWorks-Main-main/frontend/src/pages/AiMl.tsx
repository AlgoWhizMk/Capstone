// src/pages/AiMl.tsx — AI & Machine Learning Intelligence Center
// Practical AI tools: NLP Sentiment, Customer Segmentation, Quality Prediction
import { useState, useMemo } from "react";

// ══════════════════════════════════════════════════════════════════════════════
// TYPES
// ══════════════════════════════════════════════════════════════════════════════
type Tab = "sentiment" | "segmentation" | "quality";

// ══════════════════════════════════════════════════════════════════════════════
// STYLES
// ══════════════════════════════════════════════════════════════════════════════
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@500;600;700&family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');
@keyframes fadeUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
@keyframes slideR{from{opacity:0;transform:translateX(-12px)}to{opacity:1;transform:translateX(0)}}
@keyframes glow{0%,100%{box-shadow:0 0 8px rgba(139,92,246,.3)}50%{box-shadow:0 0 20px rgba(139,92,246,.6)}}
.ai-page{font-family:'Inter',sans-serif;min-height:100vh;background:#030712;padding:90px 24px 60px;color:#e2e8f0}
.ai-max{max-width:1340px;margin:0 auto}
.ai-hero{text-align:center;margin-bottom:32px;animation:fadeUp .5s ease both}
.ai-hero h1{font-family:'Rajdhani',sans-serif;font-size:36px;font-weight:800;background:linear-gradient(135deg,#8B5CF6,#06B6D4,#10B981);-webkit-background-clip:text;-webkit-text-fill-color:transparent;margin-bottom:6px}
.ai-hero p{color:#64748B;font-size:14px;max-width:600px;margin:0 auto}
.ai-tabs{display:flex;gap:8px;justify-content:center;margin-bottom:28px;animation:fadeUp .5s .1s ease both}
.ai-tab{padding:14px 28px;border-radius:14px;border:1px solid rgba(139,92,246,.15);background:rgba(139,92,246,.04);color:#94A3B8;font-size:13px;font-weight:600;cursor:pointer;transition:all .25s;font-family:'Inter',sans-serif;display:flex;align-items:center;gap:10px}
.ai-tab:hover{border-color:rgba(139,92,246,.3);color:#C4B5FD;transform:translateY(-1px)}
.ai-tab.active{background:linear-gradient(135deg,rgba(139,92,246,.15),rgba(6,182,212,.1));border-color:rgba(139,92,246,.4);color:#A78BFA;animation:glow 2s infinite}
.ai-tab-icon{font-size:20px}
.ai-card{background:linear-gradient(145deg,rgba(255,255,255,.03),rgba(255,255,255,.01));border:1px solid rgba(139,92,246,.1);border-radius:18px;padding:24px;margin-bottom:18px;animation:fadeUp .4s ease both}
.ai-card-title{font-family:'Rajdhani',sans-serif;font-size:18px;font-weight:700;color:#E2E8F0;margin-bottom:4px;display:flex;align-items:center;gap:8px}
.ai-card-sub{font-size:12px;color:#475569;margin-bottom:16px}
.ai-grid2{display:grid;grid-template-columns:1fr 1fr;gap:18px}
.ai-grid3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:14px}
.ai-badge{display:inline-flex;padding:5px 12px;border-radius:8px;font-size:11px;font-weight:600;background:rgba(139,92,246,.08);border:1px solid rgba(139,92,246,.15);color:#A78BFA;font-family:'JetBrains Mono',monospace}
.ai-mono{font-family:'JetBrains Mono',monospace}
.ai-slider{width:100%;accent-color:#8B5CF6;margin:8px 0}
.ai-kpi{text-align:center;padding:14px;background:rgba(255,255,255,.02);border:1px solid rgba(255,255,255,.05);border-radius:12px}
.ai-kpi-val{font-family:'Rajdhani',sans-serif;font-size:28px;font-weight:800}
.ai-kpi-lbl{font-size:11px;color:#64748B;margin-top:2px}
.ai-table{width:100%;border-collapse:collapse;font-size:12px}
.ai-table th{text-align:left;padding:8px 10px;color:#64748B;border-bottom:1px solid rgba(255,255,255,.08);font-weight:600}
.ai-table td{padding:8px 10px;border-bottom:1px solid rgba(255,255,255,.04);color:#CBD5E1}
.ai-btn{padding:8px 16px;border-radius:10px;border:1px solid rgba(139,92,246,.25);background:rgba(139,92,246,.1);color:#A78BFA;font-size:12px;font-weight:600;cursor:pointer;font-family:'Inter',sans-serif;transition:all .2s}
.ai-btn:hover{background:rgba(139,92,246,.2)}
.ai-btn.active{background:rgba(139,92,246,.25);border-color:#8B5CF6}
.ai-input{width:100%;padding:10px 14px;background:rgba(255,255,255,.04);border:1px solid rgba(139,92,246,.15);border-radius:10px;color:#E2E8F0;font-size:13px;font-family:'Inter',sans-serif;outline:none;resize:vertical;transition:border-color .2s}
.ai-input:focus{border-color:rgba(139,92,246,.4)}
@media(max-width:768px){.ai-grid2,.ai-grid3{grid-template-columns:1fr}.ai-tabs{flex-direction:column}.ai-tab{justify-content:center}}
`;

// ══════════════════════════════════════════════════════════════════════════════
// ALGORITHMS
// ══════════════════════════════════════════════════════════════════════════════

// -- Bayes Theorem --
function bayesTheorem(pA: number, pBgivenA: number, pBgivenNotA: number) {
  const pB = pBgivenA * pA + pBgivenNotA * (1 - pA);
  const pAgivenB = pB > 0 ? (pBgivenA * pA) / pB : 0;
  return { posterior: pAgivenB, pB, likelihood: pBgivenA, prior: pA };
}

// -- Sentiment Analysis (bag-of-words + scored lexicon) --
const POS_WORDS: Record<string, number> = {
  good:1, great:2, excellent:3, best:3, quality:2, strong:2, durable:2, fast:1,
  reliable:2, happy:1, perfect:3, amazing:3, love:2, recommend:2, satisfied:2,
  premium:2, solid:2, sturdy:2, professional:2, impressive:2, outstanding:3,
  brilliant:2, wonderful:2, superb:3, fantastic:3, exceptional:3, trust:2,
};
const NEG_WORDS: Record<string, number> = {
  bad:1, poor:2, worst:3, weak:2, broken:3, slow:1, late:1, damaged:3,
  rusty:3, terrible:3, horrible:3, awful:3, disappointed:2, waste:2, defective:3,
  cheap:1, flimsy:2, complaint:1, problem:1, issue:1, delay:1, missing:2,
  pathetic:3, useless:3, fraud:3, scam:3, rude:2, unprofessional:2,
};

function analyzeSentiment(text: string) {
  const words = text.toLowerCase().replace(/[^a-z\s]/g, "").split(/\s+/).filter(Boolean);
  const posFound: { word: string; weight: number }[] = [];
  const negFound: { word: string; weight: number }[] = [];
  for (const w of words) {
    if (POS_WORDS[w]) posFound.push({ word: w, weight: POS_WORDS[w] });
    if (NEG_WORDS[w]) negFound.push({ word: w, weight: NEG_WORDS[w] });
  }
  const posScore = posFound.reduce((s, p) => s + p.weight, 0);
  const negScore = negFound.reduce((s, p) => s + p.weight, 0);
  const total = posScore + negScore || 1;
  const normalizedScore = (posScore - negScore) / total; // -1 to +1
  const confidence = Math.min((posScore + negScore) / (words.length * 0.5), 1);
  let label: string, emoji: string, color: string;
  if (normalizedScore > 0.2) { label = "Positive"; emoji = "😊"; color = "#22C55E"; }
  else if (normalizedScore < -0.2) { label = "Negative"; emoji = "😠"; color = "#EF4444"; }
  else { label = "Neutral"; emoji = "😐"; color = "#F59E0B"; }
  return { score: normalizedScore, posFound, negFound, label, emoji, color, confidence, wordCount: words.length };
}

// -- Customer Segmentation (Decision Tree) --
interface TreeNode {
  feature?: string; threshold?: number; label?: string;
  left?: TreeNode; right?: TreeNode;
  description?: string; color?: string;
}
const CUSTOMER_TREE: TreeNode = {
  feature: "Total Spend (₹)", threshold: 100000,
  left: {
    feature: "Order Count", threshold: 3,
    left: { label: "New / One-time", description: "Low value, infrequent buyer. Send introductory offers.", color: "#94A3B8" },
    right: { label: "Regular", description: "Moderate spender with repeat purchases. Offer loyalty discounts.", color: "#FBbF24" },
  },
  right: {
    feature: "Order Count", threshold: 5,
    left: { label: "High-Value", description: "Large orders but infrequent. Assign dedicated account manager.", color: "#22C55E" },
    right: {
      feature: "Days Since Last Order", threshold: 60,
      left: { label: "Premium VIP 👑", description: "Top customer. Priority support, bulk pricing, credit terms.", color: "#A78BFA" },
      right: { label: "At-Risk VIP ⚠️", description: "Was VIP but inactive. Trigger re-engagement campaign NOW.", color: "#EF4444" },
    },
  },
};

function predictSegment(node: TreeNode, data: Record<string, number>): { label: string; path: string[]; description: string; color: string } {
  const path: string[] = [];
  let current = node;
  while (!current.label) {
    const val = data[current.feature!] ?? 0;
    const goRight = val >= (current.threshold ?? 0);
    path.push(`${current.feature} = ${val.toLocaleString()} ${goRight ? "≥" : "<"} ${current.threshold!.toLocaleString()}`);
    current = goRight ? (current.right ?? { label: "Unknown", description: "", color: "#666" }) : (current.left ?? { label: "Unknown", description: "", color: "#666" });
  }
  return { label: current.label!, path, description: current.description ?? "", color: current.color ?? "#94A3B8" };
}

// -- Batch Sentiment for Table --
const REVIEW_BANK = [
  { customer: "Rajesh Patel", text: "TMT bars are excellent quality. Very strong and durable. Fast delivery, highly recommend ShriKrishna!", date: "2 days ago" },
  { customer: "Priya Deshmukh", text: "Poor quality steel plates. They arrived damaged and rusty. Terrible packaging. Very disappointed.", date: "5 days ago" },
  { customer: "Amit Shah", text: "Good product, decent quality for the price. Delivery was a bit slow but acceptable.", date: "1 week ago" },
  { customer: "Sunita Naik", text: "Amazing quality stainless steel railings! Best in Nagpur. Love the premium finish. Professional service.", date: "3 days ago" },
  { customer: "Vikram Joshi", text: "Worst experience. Defective MS angles, broken and flimsy. Waste of money. Will not buy again.", date: "4 days ago" },
  { customer: "Meera Kulkarni", text: "Outstanding service and brilliant quality. The GI sheets are perfect for our project. Superb!", date: "1 day ago" },
  { customer: "Santosh Wagh", text: "Product is okay, nothing exceptional. Average quality steel. Took 2 weeks for delivery.", date: "6 days ago" },
  { customer: "Neha Patil", text: "Excellent TMT Fe550D bars. Very reliable supplier. Strong material, great for construction. Highly satisfied!", date: "2 days ago" },
];

// ══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════════════════════════════════════════
export default function AiMl() {
  const [tab, setTab] = useState<Tab>("sentiment");

  // -- Sentiment state --
  const [customReview, setCustomReview] = useState("");
  const [selectedReview, setSelectedReview] = useState<number | null>(null);

  // -- Segmentation state --
  const [segInput, setSegInput] = useState({ totalSpend: 120000, orderCount: 6, daysSinceLast: 30 });

  // -- Quality state --
  const [prior, setPrior] = useState(0.05);
  const [sensitivity, setSensitivity] = useState(0.92);
  const [falsePos, setFalsePos] = useState(0.06);

  // Computed
  const allSentiments = useMemo(() => REVIEW_BANK.map(r => ({ ...r, ...analyzeSentiment(r.text) })), []);
  const customSentiment = useMemo(() => customReview.trim() ? analyzeSentiment(customReview) : null, [customReview]);
  const sentimentSummary = useMemo(() => {
    const pos = allSentiments.filter(s => s.label === "Positive").length;
    const neg = allSentiments.filter(s => s.label === "Negative").length;
    const neu = allSentiments.filter(s => s.label === "Neutral").length;
    const avg = allSentiments.reduce((s, a) => s + a.score, 0) / allSentiments.length;
    return { pos, neg, neu, avg, total: allSentiments.length };
  }, [allSentiments]);

  const segResult = useMemo(() => predictSegment(CUSTOMER_TREE, {
    "Total Spend (₹)": segInput.totalSpend,
    "Order Count": segInput.orderCount,
    "Days Since Last Order": segInput.daysSinceLast,
  }), [segInput]);

  const bayesResult = useMemo(() => bayesTheorem(prior, sensitivity, falsePos), [prior, sensitivity, falsePos]);

  const TABS: { id: Tab; label: string; icon: string; desc: string }[] = [
    { id: "sentiment", label: "Customer Sentiment", icon: "💬", desc: "Analyze feedback with NLP" },
    { id: "segmentation", label: "Customer Segmentation", icon: "👥", desc: "Classify customers with Decision Tree" },
    { id: "quality", label: "Quality Prediction", icon: "🔬", desc: "Defect risk with Bayes' Theorem" },
  ];

  return (
    <>
      <style>{CSS}</style>
      <div className="ai-page">
        <div className="ai-max">
          {/* Hero */}
          <div className="ai-hero">
            <h1>🧠 AI/ML Intelligence Center</h1>
            <p>Operational AI tools for ShriKrishna SteelWorks — real insights from customer data, quality control, and smart segmentation</p>
          </div>

          {/* Tabs */}
          <div className="ai-tabs">
            {TABS.map(t => (
              <button key={t.id} className={`ai-tab ${tab === t.id ? "active" : ""}`} onClick={() => setTab(t.id)}>
                <span className="ai-tab-icon">{t.icon}</span>
                <div style={{ textAlign: "left" }}>
                  <div>{t.label}</div>
                  <div style={{ fontSize: 10, color: "#475569", fontWeight: 400 }}>{t.desc}</div>
                </div>
              </button>
            ))}
          </div>

          {/* ═══════════════════════════════════════════════════════════════════ */}
          {/* TAB 1: CUSTOMER SENTIMENT ANALYSIS (NLP) */}
          {/* ═══════════════════════════════════════════════════════════════════ */}
          {tab === "sentiment" && (
            <>
              {/* KPI Row */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 18 }}>
                {[
                  { label: "Overall Score", val: sentimentSummary.avg > 0 ? "+" + sentimentSummary.avg.toFixed(2) : sentimentSummary.avg.toFixed(2), color: sentimentSummary.avg > 0 ? "#22C55E" : "#EF4444" },
                  { label: "Positive", val: sentimentSummary.pos.toString(), color: "#22C55E" },
                  { label: "Negative", val: sentimentSummary.neg.toString(), color: "#EF4444" },
                  { label: "Neutral", val: sentimentSummary.neu.toString(), color: "#F59E0B" },
                ].map(k => (
                  <div className="ai-kpi" key={k.label} style={{ animation: "fadeUp .4s ease both" }}>
                    <div className="ai-kpi-val" style={{ color: k.color }}>{k.val}</div>
                    <div className="ai-kpi-lbl">{k.label} ({sentimentSummary.total} reviews)</div>
                  </div>
                ))}
              </div>

              {/* Analyze Custom Review */}
              <div className="ai-card">
                <div className="ai-card-title">✍️ Analyze Customer Feedback</div>
                <div className="ai-card-sub">Paste a customer review to instantly classify sentiment using NLP bag-of-words scoring</div>
                <div className="ai-grid2">
                  <div>
                    <textarea className="ai-input" value={customReview}
                      onChange={e => setCustomReview(e.target.value)}
                      placeholder="Paste or type a customer review here..."
                      style={{ minHeight: 100 }} />
                    <div style={{ fontSize: 10, color: "#475569", marginTop: 6 }}>
                      Algorithm: Lexicon-based sentiment · Weighted bag-of-words · {Object.keys(POS_WORDS).length + Object.keys(NEG_WORDS).length} word vocabulary
                    </div>
                  </div>
                  <div>
                    {customSentiment ? (
                      <div style={{ background: "#0A0F1E", borderRadius: 14, padding: 20, textAlign: "center", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                        <div style={{ fontSize: 48, marginBottom: 4 }}>{customSentiment.emoji}</div>
                        <div style={{ fontSize: 28, fontWeight: 800, fontFamily: "'Rajdhani'", color: customSentiment.color }}>
                          {customSentiment.label}
                        </div>
                        <div style={{ fontSize: 12, color: "#64748B", marginTop: 2 }}>
                          Score: <span className="ai-mono" style={{ color: customSentiment.color }}>{customSentiment.score > 0 ? "+" : ""}{customSentiment.score.toFixed(3)}</span>
                          {" · "}Confidence: <span className="ai-mono">{(customSentiment.confidence * 100).toFixed(0)}%</span>
                        </div>
                        <div style={{ display: "flex", gap: 8, marginTop: 12, justifyContent: "center", flexWrap: "wrap" }}>
                          {customSentiment.posFound.length > 0 && (
                            <span className="ai-badge" style={{ color: "#22C55E" }}>
                              ✓ {customSentiment.posFound.map(p => p.word).join(", ")}
                            </span>
                          )}
                          {customSentiment.negFound.length > 0 && (
                            <span className="ai-badge" style={{ color: "#EF4444" }}>
                              ✗ {customSentiment.negFound.map(p => p.word).join(", ")}
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: 10, color: "#475569", marginTop: 8 }}>
                          {customSentiment.wordCount} words analyzed · {customSentiment.posFound.length} positive · {customSentiment.negFound.length} negative matches
                        </div>
                      </div>
                    ) : (
                      <div style={{ background: "#0A0F1E", borderRadius: 14, padding: 20, textAlign: "center", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <div style={{ color: "#334155", fontSize: 13 }}>← Type a review to see instant AI analysis</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* All Reviews Table */}
              <div className="ai-card">
                <div className="ai-card-title">📊 Customer Feedback Analysis Report</div>
                <div className="ai-card-sub">All recent reviews auto-classified · Click any row to see detailed breakdown</div>
                <div style={{ overflowX: "auto" }}>
                  <table className="ai-table">
                    <thead>
                      <tr>
                        <th>Customer</th>
                        <th>Review</th>
                        <th>When</th>
                        <th style={{ textAlign: "center" }}>Sentiment</th>
                        <th style={{ textAlign: "center" }}>Score</th>
                        <th>Key Words</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allSentiments.map((r, i) => (
                        <tr key={i} onClick={() => setSelectedReview(selectedReview === i ? null : i)}
                          style={{ cursor: "pointer", background: selectedReview === i ? "rgba(139,92,246,.06)" : "transparent", transition: "background .2s" }}>
                          <td style={{ fontWeight: 600, color: "#E2E8F0", whiteSpace: "nowrap" }}>{r.customer}</td>
                          <td style={{ maxWidth: 280, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.text}</td>
                          <td style={{ whiteSpace: "nowrap", color: "#475569" }}>{r.date}</td>
                          <td style={{ textAlign: "center" }}>
                            <span style={{ padding: "3px 10px", borderRadius: 999, fontSize: 11, fontWeight: 700,
                              background: r.color + "18", color: r.color, border: `1px solid ${r.color}30` }}>
                              {r.emoji} {r.label}
                            </span>
                          </td>
                          <td className="ai-mono" style={{ textAlign: "center", color: r.color, fontWeight: 700, fontSize: 13 }}>
                            {r.score > 0 ? "+" : ""}{r.score.toFixed(2)}
                          </td>
                          <td>
                            {r.posFound.slice(0, 2).map(p => (
                              <span key={p.word} style={{ color: "#22C55E", fontSize: 10, marginRight: 4 }}>+{p.word}</span>
                            ))}
                            {r.negFound.slice(0, 2).map(p => (
                              <span key={p.word} style={{ color: "#EF4444", fontSize: 10, marginRight: 4 }}>-{p.word}</span>
                            ))}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {selectedReview !== null && (
                  <div style={{ marginTop: 14, padding: 16, background: "#0A0F1E", borderRadius: 12, animation: "fadeUp .3s ease both" }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#E2E8F0", marginBottom: 6 }}>
                      {allSentiments[selectedReview].emoji} {allSentiments[selectedReview].customer}'s Review — Detail
                    </div>
                    <div style={{ fontSize: 12, color: "#94A3B8", marginBottom: 10, lineHeight: 1.7, fontStyle: "italic" }}>
                      "{allSentiments[selectedReview].text}"
                    </div>
                    <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                      <div>
                        <span style={{ fontSize: 10, color: "#64748B" }}>Positive matches: </span>
                        {allSentiments[selectedReview].posFound.map(p => (
                          <span key={p.word} className="ai-badge" style={{ color: "#22C55E", marginRight: 4, marginBottom: 4 }}>
                            {p.word} (+{p.weight})
                          </span>
                        ))}
                        {allSentiments[selectedReview].posFound.length === 0 && <span style={{ color: "#475569", fontSize: 11 }}>none</span>}
                      </div>
                      <div>
                        <span style={{ fontSize: 10, color: "#64748B" }}>Negative matches: </span>
                        {allSentiments[selectedReview].negFound.map(p => (
                          <span key={p.word} className="ai-badge" style={{ color: "#EF4444", marginRight: 4, marginBottom: 4 }}>
                            {p.word} (-{p.weight})
                          </span>
                        ))}
                        {allSentiments[selectedReview].negFound.length === 0 && <span style={{ color: "#475569", fontSize: 11 }}>none</span>}
                      </div>
                    </div>
                    <div style={{ marginTop: 10, padding: "8px 14px", background: "rgba(139,92,246,.06)", borderRadius: 8, fontSize: 11, color: "#94A3B8" }}>
                      <strong style={{ color: "#A78BFA" }}>AI Recommendation:</strong>{" "}
                      {allSentiments[selectedReview].label === "Positive"
                        ? "Request a Google/Justdial review from this customer. Add to VIP mailing list."
                        : allSentiments[selectedReview].label === "Negative"
                          ? "⚠️ Flag for immediate follow-up. Assign to customer support team. Offer resolution/replacement."
                          : "No action needed. Monitor for follow-up feedback."}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {/* ═══════════════════════════════════════════════════════════════════ */}
          {/* TAB 2: CUSTOMER SEGMENTATION (Decision Tree + Ensemble) */}
          {/* ═══════════════════════════════════════════════════════════════════ */}
          {tab === "segmentation" && (
            <>
              <div className="ai-card">
                <div className="ai-card-title">🌳 Customer Segmentation Engine</div>
                <div className="ai-card-sub">Decision Tree classifier that segments customers into actionable tiers · Adjust inputs to see real-time classification</div>
                <div className="ai-grid2">
                  <div>
                    {/* Inputs */}
                    <div style={{ marginBottom: 16 }}>
                      <label style={{ fontSize: 12, color: "#94A3B8", display: "block", marginBottom: 6 }}>
                        Total Spend: <strong style={{ color: "#A78BFA" }}>₹{segInput.totalSpend.toLocaleString()}</strong>
                      </label>
                      <input type="range" className="ai-slider" min={5000} max={500000} step={5000}
                        value={segInput.totalSpend} onChange={e => setSegInput(p => ({ ...p, totalSpend: +e.target.value }))} />
                    </div>
                    <div style={{ marginBottom: 16 }}>
                      <label style={{ fontSize: 12, color: "#94A3B8", display: "block", marginBottom: 6 }}>
                        Order Count: <strong style={{ color: "#06B6D4" }}>{segInput.orderCount} orders</strong>
                      </label>
                      <input type="range" className="ai-slider" min={1} max={15} step={1}
                        value={segInput.orderCount} onChange={e => setSegInput(p => ({ ...p, orderCount: +e.target.value }))} />
                    </div>
                    <div style={{ marginBottom: 16 }}>
                      <label style={{ fontSize: 12, color: "#94A3B8", display: "block", marginBottom: 6 }}>
                        Days Since Last Order: <strong style={{ color: "#F59E0B" }}>{segInput.daysSinceLast} days</strong>
                      </label>
                      <input type="range" className="ai-slider" min={1} max={180} step={1}
                        value={segInput.daysSinceLast} onChange={e => setSegInput(p => ({ ...p, daysSinceLast: +e.target.value }))} />
                    </div>

                    {/* Result */}
                    <div style={{ background: "#0A0F1E", borderRadius: 14, padding: 20, borderLeft: `4px solid ${segResult.color}` }}>
                      <div style={{ fontSize: 10, color: "#475569", marginBottom: 8 }}>Decision Path:</div>
                      {segResult.path.map((p, i) => (
                        <div key={i} style={{ fontSize: 11, color: "#CBD5E1", marginBottom: 4, paddingLeft: i * 14, animation: `slideR .3s ${i * 0.08}s ease both` }}>
                          <span style={{ color: "#8B5CF6" }}>→</span> {p}
                        </div>
                      ))}
                      <div style={{ fontSize: 26, fontWeight: 800, fontFamily: "'Rajdhani'", color: segResult.color, marginTop: 12 }}>
                        {segResult.label}
                      </div>
                      <div style={{ fontSize: 12, color: "#94A3B8", marginTop: 4, lineHeight: 1.6 }}>
                        {segResult.description}
                      </div>
                    </div>
                  </div>

                  {/* Tree Visualization */}
                  <div style={{ display: "flex", justifyContent: "center", alignItems: "flex-start" }}>
                    <svg width={420} height={380} viewBox="0 0 420 380">
                      {/* Edges */}
                      <line x1={210} y1={45} x2={110} y2={120} stroke="#8B5CF650" strokeWidth={2} />
                      <line x1={210} y1={45} x2={310} y2={120} stroke="#8B5CF650" strokeWidth={2} />
                      <line x1={110} y1={150} x2={55} y2={230} stroke="#06B6D440" strokeWidth={1.5} />
                      <line x1={110} y1={150} x2={165} y2={230} stroke="#06B6D440" strokeWidth={1.5} />
                      <line x1={310} y1={150} x2={255} y2={230} stroke="#06B6D440" strokeWidth={1.5} />
                      <line x1={310} y1={150} x2={365} y2={230} stroke="#06B6D440" strokeWidth={1.5} />
                      <line x1={365} y1={260} x2={325} y2={330} stroke="#F59E0B40" strokeWidth={1.5} />
                      <line x1={365} y1={260} x2={400} y2={330} stroke="#F59E0B40" strokeWidth={1.5} />
                      {/* Root */}
                      <rect x={140} y={15} width={140} height={38} rx={10} fill="rgba(139,92,246,.12)" stroke="#8B5CF6" strokeWidth={1.5} />
                      <text x={210} y={32} textAnchor="middle" fill="#C4B5FD" fontSize={9} fontWeight={600}>Total Spend ≥ ₹1L?</text>
                      <text x={210} y={46} textAnchor="middle" fill="#64748B" fontSize={7}>Root decision</text>
                      {/* Level 2 */}
                      {[
                        { x: 110, label: "Orders ≥ 3?" },
                        { x: 310, label: "Orders ≥ 5?" },
                      ].map((n, i) => (
                        <g key={i}>
                          <rect x={n.x - 55} y={118} width={110} height={38} rx={8} fill="rgba(6,182,212,.08)" stroke="#06B6D4" strokeWidth={1.5} />
                          <text x={n.x} y={141} textAnchor="middle" fill="#67E8F9" fontSize={9}>{n.label}</text>
                        </g>
                      ))}
                      {/* Level 3 - leaves */}
                      {[
                        { x: 55, label: "New/One-time", color: "#94A3B8" },
                        { x: 165, label: "Regular", color: "#FBbF24" },
                        { x: 255, label: "High-Value", color: "#22C55E" },
                      ].map((l, i) => (
                        <g key={i}>
                          <rect x={l.x - 42} y={225} width={84} height={30} rx={8}
                            fill={segResult.label.includes(l.label.split("/")[0]) ? l.color + "25" : "#0A0F1E"}
                            stroke={segResult.label.includes(l.label.split("/")[0]) ? l.color : "#33415580"} strokeWidth={segResult.label.includes(l.label.split("/")[0]) ? 2.5 : 1} />
                          <text x={l.x} y={244} textAnchor="middle" fill={l.color} fontSize={8} fontWeight={600}>{l.label}</text>
                        </g>
                      ))}
                      {/* Days node */}
                      <rect x={310} y={225} width={110} height={38} rx={8} fill="rgba(245,158,11,.08)" stroke="#F59E0B" strokeWidth={1.5} />
                      <text x={365} y={248} textAnchor="middle" fill="#FBBF24" fontSize={9}>Last Order {"<"} 60d?</text>
                      {/* Final leaves */}
                      {[
                        { x: 325, label: "Premium VIP 👑", color: "#A78BFA" },
                        { x: 400, label: "At-Risk ⚠️", color: "#EF4444" },
                      ].map((l, i) => (
                        <g key={i}>
                          <rect x={l.x - 42} y={325} width={84} height={30} rx={8}
                            fill={segResult.label.includes(l.label.split(" ")[0]) ? l.color + "25" : "#0A0F1E"}
                            stroke={segResult.label.includes(l.label.split(" ")[0]) ? l.color : "#33415580"} strokeWidth={segResult.label.includes(l.label.split(" ")[0]) ? 2.5 : 1} />
                          <text x={l.x} y={344} textAnchor="middle" fill={l.color} fontSize={7} fontWeight={600}>{l.label}</text>
                        </g>
                      ))}
                    </svg>
                  </div>
                </div>
              </div>

              {/* Segment Distribution */}
              <div className="ai-card">
                <div className="ai-card-title">📊 Segment Actions & Business Impact</div>
                <div className="ai-card-sub">What to do with each customer segment — actionable playbook</div>
                <div className="ai-grid2">
                  {[
                    { seg: "New / One-time", pct: 35, action: "Send welcome email with 10% first-reorder coupon. Show product recommendations.", icon: "🆕", color: "#94A3B8" },
                    { seg: "Regular", pct: 30, action: "Enroll in loyalty program. Offer volume discounts. Monthly product newsletter.", icon: "🔁", color: "#FBbF24" },
                    { seg: "High-Value", pct: 20, action: "Assign dedicated account manager. Offer credit terms. Priority order processing.", icon: "💎", color: "#22C55E" },
                    { seg: "Premium VIP", pct: 10, action: "Quarterly business review calls. Custom pricing. Free delivery. Festival gifts.", icon: "👑", color: "#A78BFA" },
                    { seg: "At-Risk VIP", pct: 5, action: "⚠️ URGENT: Personal call within 24h. Exclusive re-engagement offer. Exit survey.", icon: "🚨", color: "#EF4444" },
                  ].map((s, i) => (
                    <div key={i} style={{ display: "flex", gap: 12, padding: "14px 16px",
                      background: "#0A0F1E", borderRadius: 12, borderLeft: `4px solid ${s.color}`,
                      animation: `slideR .3s ${i * 0.06}s ease both` }}>
                      <span style={{ fontSize: 24, flexShrink: 0 }}>{s.icon}</span>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                          <span style={{ fontSize: 13, fontWeight: 700, color: s.color }}>{s.seg}</span>
                          <span className="ai-badge" style={{ fontSize: 9 }}>{s.pct}% of customers</span>
                        </div>
                        <div style={{ fontSize: 11, color: "#94A3B8", lineHeight: 1.6 }}>{s.action}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* ═══════════════════════════════════════════════════════════════════ */}
          {/* TAB 3: QUALITY PREDICTION (Bayesian) */}
          {/* ═══════════════════════════════════════════════════════════════════ */}
          {tab === "quality" && (
            <>
              <div className="ai-card">
                <div className="ai-card-title">🔬 Bayesian Defect Detection — Quality Control</div>
                <div className="ai-card-sub">
                  Given a positive quality test, what's the actual probability of a real defect?
                  P(Defect | Test+) = P(Test+ | Defect) × P(Defect) / P(Test+)
                </div>
                <div className="ai-grid2">
                  <div>
                    <div style={{ marginBottom: 16 }}>
                      <label style={{ fontSize: 12, color: "#94A3B8", display: "block", marginBottom: 6 }}>
                        P(Defect) — Base defect rate in factory: <strong style={{ color: "#A78BFA" }}>{(prior * 100).toFixed(1)}%</strong>
                      </label>
                      <input type="range" className="ai-slider" min={0.01} max={0.3} step={0.005} value={prior} onChange={e => setPrior(+e.target.value)} />
                      <div style={{ fontSize: 10, color: "#475569" }}>How often do defects actually occur? (Industry avg: 3-8%)</div>
                    </div>
                    <div style={{ marginBottom: 16 }}>
                      <label style={{ fontSize: 12, color: "#94A3B8", display: "block", marginBottom: 6 }}>
                        P(Test+ | Defect) — Test catches defects: <strong style={{ color: "#22C55E" }}>{(sensitivity * 100).toFixed(0)}%</strong>
                      </label>
                      <input type="range" className="ai-slider" min={0.5} max={1} step={0.01} value={sensitivity} onChange={e => setSensitivity(+e.target.value)} />
                      <div style={{ fontSize: 10, color: "#475569" }}>Sensitivity — how good is our QC test at finding real defects?</div>
                    </div>
                    <div style={{ marginBottom: 16 }}>
                      <label style={{ fontSize: 12, color: "#94A3B8", display: "block", marginBottom: 6 }}>
                        P(Test+ | No Defect) — False alarms: <strong style={{ color: "#EF4444" }}>{(falsePos * 100).toFixed(0)}%</strong>
                      </label>
                      <input type="range" className="ai-slider" min={0.01} max={0.25} step={0.005} value={falsePos} onChange={e => setFalsePos(+e.target.value)} />
                      <div style={{ fontSize: 10, color: "#475569" }}>How often does the test flag good products as defective?</div>
                    </div>
                  </div>

                  <div>
                    <div style={{ background: "#0A0F1E", borderRadius: 16, padding: 24, textAlign: "center",
                      border: `1px solid ${bayesResult.posterior > 0.5 ? "rgba(239,68,68,.3)" : "rgba(34,197,94,.2)"}` }}>
                      <div className="ai-mono" style={{ fontSize: 11, color: "#475569", marginBottom: 14, lineHeight: 1.8 }}>
                        P(Defect|Test+) = ({sensitivity.toFixed(2)} × {prior.toFixed(3)}) / {bayesResult.pB.toFixed(4)}
                      </div>
                      <div style={{ fontSize: 56, fontWeight: 800, fontFamily: "'Rajdhani'",
                        color: bayesResult.posterior > 0.5 ? "#EF4444" : bayesResult.posterior > 0.3 ? "#F59E0B" : "#22C55E" }}>
                        {(bayesResult.posterior * 100).toFixed(1)}%
                      </div>
                      <div style={{ fontSize: 14, color: "#94A3B8", marginTop: 4 }}>
                        Actual defect probability when test says "positive"
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginTop: 18 }}>
                        <div className="ai-kpi">
                          <div className="ai-kpi-val" style={{ color: "#A78BFA", fontSize: 20 }}>{(bayesResult.pB * 100).toFixed(1)}%</div>
                          <div className="ai-kpi-lbl">P(Test+) overall</div>
                        </div>
                        <div className="ai-kpi">
                          <div className="ai-kpi-val" style={{ color: "#F59E0B", fontSize: 20 }}>{(bayesResult.posterior / prior).toFixed(1)}x</div>
                          <div className="ai-kpi-lbl">Risk multiplier</div>
                        </div>
                        <div className="ai-kpi">
                          <div className="ai-kpi-val" style={{ color: "#06B6D4", fontSize: 20 }}>{((1 - bayesResult.posterior) * 100).toFixed(0)}%</div>
                          <div className="ai-kpi-lbl">False alarm rate</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* What this means */}
              <div className="ai-card">
                <div className="ai-card-title">📋 Decision Guide — What To Do</div>
                <div className="ai-card-sub">Bayesian decision theory — cost-benefit analysis for quality control actions</div>
                <div className="ai-grid3">
                  <div style={{ padding: 16, background: "#0A0F1E", borderRadius: 12,
                    borderLeft: `4px solid ${bayesResult.posterior > 0.5 ? "#EF4444" : bayesResult.posterior > 0.3 ? "#F59E0B" : "#22C55E"}` }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: bayesResult.posterior > 0.5 ? "#EF4444" : bayesResult.posterior > 0.3 ? "#F59E0B" : "#22C55E", marginBottom: 8 }}>
                      {bayesResult.posterior > 0.5 ? "🚨 High Risk — Reject Batch" : bayesResult.posterior > 0.3 ? "⚠️ Medium Risk — Re-test" : "✅ Low Risk — Accept"}
                    </div>
                    <div style={{ fontSize: 11, color: "#94A3B8", lineHeight: 1.7 }}>
                      {bayesResult.posterior > 0.5
                        ? "Defect probability exceeds 50%. Pull the batch immediately. Full re-inspection required before shipping."
                        : bayesResult.posterior > 0.3
                          ? "Moderate risk. Run a secondary independent test. Consider sampling 20% of the batch for manual inspection."
                          : "Low probability of actual defect. The positive test is likely a false alarm. Safe to proceed with standard checks."}
                    </div>
                  </div>
                  <div style={{ padding: 16, background: "#0A0F1E", borderRadius: 12, borderLeft: "4px solid #8B5CF6" }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#A78BFA", marginBottom: 8 }}>💰 Cost Analysis</div>
                    <div style={{ fontSize: 11, color: "#94A3B8", lineHeight: 1.7 }}>
                      <div>Rejecting good batch: ~₹{(50000 * (1 - bayesResult.posterior)).toFixed(0)} loss</div>
                      <div>Shipping defective: ~₹{(200000 * bayesResult.posterior).toFixed(0)} liability</div>
                      <div style={{ marginTop: 6, fontWeight: 600, color: "#E2E8F0" }}>
                        Optimal action: {bayesResult.posterior > 0.2 ? "Re-test (₹5,000)" : "Accept (₹0)"}
                      </div>
                    </div>
                  </div>
                  <div style={{ padding: 16, background: "#0A0F1E", borderRadius: 12, borderLeft: "4px solid #06B6D4" }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#06B6D4", marginBottom: 8 }}>🎯 Improve Accuracy</div>
                    <div style={{ fontSize: 11, color: "#94A3B8", lineHeight: 1.7 }}>
                      <div>→ Reduce false positive rate below 5%</div>
                      <div>→ Increase sensitivity above 95%</div>
                      <div>→ Use sequential testing (test twice)</div>
                      <div style={{ marginTop: 6 }}>
                        Sequential Bayes: P after 2nd test = <span className="ai-mono" style={{ color: "#A78BFA" }}>
                          {(bayesTheorem(bayesResult.posterior, sensitivity, falsePos).posterior * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bayesian Network for context */}
              <div className="ai-card">
                <div className="ai-card-title">🔗 Quality Factor Network</div>
                <div className="ai-card-sub">Bayesian Network showing conditional dependencies affecting steel quality</div>
                <div style={{ display: "flex", justifyContent: "center", padding: "10px 0" }}>
                  <svg width={550} height={220} viewBox="0 0 550 220">
                    <line x1={120} y1={55} x2={275} y2={130} stroke="#8B5CF640" strokeWidth={1.5} />
                    <line x1={430} y1={55} x2={275} y2={130} stroke="#06B6D440" strokeWidth={1.5} />
                    <line x1={80} y1={130} x2={200} y2={190} stroke="#F59E0B40" strokeWidth={1.5} />
                    <line x1={275} y1={150} x2={275} y2={180} stroke="#22C55E40" strokeWidth={1.5} />
                    <line x1={470} y1={130} x2={350} y2={190} stroke="#EF444440" strokeWidth={1.5} />
                    {[
                      { x: 120, y: 45, label: "Raw Material", sub: "Grade/Purity", color: "#8B5CF6" },
                      { x: 430, y: 45, label: "Process Temp", sub: "°C Control", color: "#06B6D4" },
                      { x: 80, y: 130, label: "Rust Risk", sub: "Humidity dep.", color: "#F59E0B" },
                      { x: 275, y: 130, label: "Hardness", sub: "Temp dep.", color: "#22C55E" },
                      { x: 470, y: 130, label: "Crack Risk", sub: "Cooling rate", color: "#EF4444" },
                      { x: 275, y: 195, label: "Final Quality", sub: "All factors", color: "#A78BFA" },
                    ].map((n, i) => (
                      <g key={i}>
                        <circle cx={n.x} cy={n.y} r={28} fill={n.color + "12"} stroke={n.color} strokeWidth={1.5} />
                        <text x={n.x} y={n.y - 3} textAnchor="middle" fill={n.color} fontSize={8} fontWeight={600}>{n.label}</text>
                        <text x={n.x} y={n.y + 8} textAnchor="middle" fill="#475569" fontSize={7}>{n.sub}</text>
                      </g>
                    ))}
                  </svg>
                </div>
                <div style={{ textAlign: "center" }}>
                  <span className="ai-badge">P(Quality | RawMaterial, Temperature, Humidity) — Conditional probability inference</span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
