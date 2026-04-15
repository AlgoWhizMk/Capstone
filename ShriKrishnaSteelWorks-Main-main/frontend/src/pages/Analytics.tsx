// src/pages/Analytics.tsx — Data Mining & Business Analytics Dashboard
// Implements: Apriori, K-Means, Linear Regression, Decision Tree, Star Schema, Outlier Detection
import { useState, useEffect, useRef } from "react";

// ══════════════════════════════════════════════════════════════════════════════
// TYPES
// ══════════════════════════════════════════════════════════════════════════════
type Tab = "bi" | "basket" | "cluster" | "forecast" | "anomaly";

// ══════════════════════════════════════════════════════════════════════════════
// DATA — realistic steel industry transaction data
// ══════════════════════════════════════════════════════════════════════════════
const PRODUCTS = [
  "TMT Fe500 Bar", "MS Angle", "SS 304 Pipe", "Binding Wire",
  "GI Sheet", "MS Channel", "SS Railing", "Roofing Sheet",
  "MS Plate", "TMT Fe550D", "HR Coil", "CR Sheet",
];

// 50 realistic transaction baskets
const TRANSACTIONS: string[][] = [
  ["TMT Fe500 Bar","Binding Wire","MS Angle"],
  ["TMT Fe500 Bar","Binding Wire","GI Sheet"],
  ["TMT Fe500 Bar","MS Angle","MS Plate"],
  ["SS 304 Pipe","SS Railing","GI Sheet"],
  ["TMT Fe500 Bar","Binding Wire","Roofing Sheet"],
  ["MS Angle","MS Channel","MS Plate"],
  ["TMT Fe500 Bar","Binding Wire","MS Angle","MS Plate"],
  ["GI Sheet","Roofing Sheet","MS Angle"],
  ["TMT Fe500 Bar","Binding Wire"],
  ["SS 304 Pipe","SS Railing"],
  ["TMT Fe500 Bar","MS Angle","Binding Wire","GI Sheet"],
  ["HR Coil","CR Sheet","MS Plate"],
  ["TMT Fe550D","Binding Wire","MS Angle"],
  ["TMT Fe500 Bar","Binding Wire","Roofing Sheet","GI Sheet"],
  ["MS Channel","MS Angle","MS Plate"],
  ["TMT Fe500 Bar","Binding Wire"],
  ["SS 304 Pipe","SS Railing","GI Sheet"],
  ["TMT Fe500 Bar","MS Angle","MS Plate","Binding Wire"],
  ["GI Sheet","Roofing Sheet"],
  ["TMT Fe550D","TMT Fe500 Bar","Binding Wire"],
  ["MS Angle","MS Channel","HR Coil"],
  ["TMT Fe500 Bar","Binding Wire","GI Sheet"],
  ["SS 304 Pipe","SS Railing","MS Plate"],
  ["TMT Fe500 Bar","Binding Wire","MS Angle"],
  ["HR Coil","CR Sheet"],
  ["TMT Fe500 Bar","Binding Wire","Roofing Sheet"],
  ["MS Angle","MS Plate","MS Channel"],
  ["GI Sheet","Roofing Sheet","SS 304 Pipe"],
  ["TMT Fe500 Bar","Binding Wire","MS Angle"],
  ["TMT Fe550D","Binding Wire","GI Sheet"],
  ["SS Railing","SS 304 Pipe","GI Sheet"],
  ["TMT Fe500 Bar","Binding Wire","MS Plate"],
  ["MS Angle","MS Channel"],
  ["TMT Fe500 Bar","Binding Wire","GI Sheet","Roofing Sheet"],
  ["HR Coil","CR Sheet","MS Plate","MS Angle"],
  ["TMT Fe500 Bar","Binding Wire"],
  ["GI Sheet","Roofing Sheet"],
  ["TMT Fe500 Bar","MS Angle","Binding Wire"],
  ["SS 304 Pipe","SS Railing"],
  ["TMT Fe550D","TMT Fe500 Bar","Binding Wire","MS Angle"],
  ["MS Plate","MS Channel","MS Angle"],
  ["TMT Fe500 Bar","Binding Wire","Roofing Sheet"],
  ["GI Sheet","SS 304 Pipe"],
  ["TMT Fe500 Bar","Binding Wire","MS Angle","GI Sheet"],
  ["HR Coil","CR Sheet","MS Channel"],
  ["TMT Fe500 Bar","Binding Wire"],
  ["SS Railing","SS 304 Pipe","GI Sheet"],
  ["TMT Fe500 Bar","MS Angle","Binding Wire"],
  ["Roofing Sheet","GI Sheet","MS Angle"],
  ["TMT Fe500 Bar","Binding Wire","MS Plate","MS Angle"],
];

// Customer data for K-Means (orderFreq, avgOrderValue in thousands)
const CUSTOMER_DATA = [
  {id:"C001",name:"ABC Constructions",x:22,y:180,orders:22,avgVal:180000},
  {id:"C002",name:"Raj Infra Pvt Ltd",x:35,y:320,orders:35,avgVal:320000},
  {id:"C003",name:"Nagpur Builders",x:8,y:45,orders:8,avgVal:45000},
  {id:"C004",name:"Wardha Steel Traders",x:42,y:410,orders:42,avgVal:410000},
  {id:"C005",name:"Amravati Fabricators",x:3,y:25,orders:3,avgVal:25000},
  {id:"C006",name:"Pune Metro Corp",x:28,y:520,orders:28,avgVal:520000},
  {id:"C007",name:"Latur PWD",x:5,y:380,orders:5,avgVal:380000},
  {id:"C008",name:"Satpur Agro",x:12,y:55,orders:12,avgVal:55000},
  {id:"C009",name:"Waluj Pharma",x:18,y:140,orders:18,avgVal:140000},
  {id:"C010",name:"Hingna Steel Hub",x:45,y:350,orders:45,avgVal:350000},
  {id:"C011",name:"Butibori Industrial",x:38,y:280,orders:38,avgVal:280000},
  {id:"C012",name:"Chandrapur Cements",x:6,y:90,orders:6,avgVal:90000},
  {id:"C013",name:"Akola Steels",x:15,y:120,orders:15,avgVal:120000},
  {id:"C014",name:"Jalna Fabrication",x:2,y:18,orders:2,avgVal:18000},
  {id:"C015",name:"Nashik AgroFoods",x:10,y:60,orders:10,avgVal:60000},
  {id:"C016",name:"Yavatmal Traders",x:4,y:30,orders:4,avgVal:30000},
  {id:"C017",name:"Solapur Construction",x:20,y:200,orders:20,avgVal:200000},
  {id:"C018",name:"Kolhapur Infra",x:30,y:260,orders:30,avgVal:260000},
  {id:"C019",name:"Sangli Steel Works",x:25,y:190,orders:25,avgVal:190000},
  {id:"C020",name:"Dhule Highway Corp",x:7,y:420,orders:7,avgVal:420000},
];

// Monthly sales data for forecasting
const MONTHLY_SALES = [
  {month:"Jan'24",val:42},{month:"Feb'24",val:38},{month:"Mar'24",val:55},
  {month:"Apr'24",val:48},{month:"May'24",val:62},{month:"Jun'24",val:58},
  {month:"Jul'24",val:71},{month:"Aug'24",val:65},{month:"Sep'24",val:78},
  {month:"Oct'24",val:72},{month:"Nov'24",val:85},{month:"Dec'24",val:80},
  {month:"Jan'25",val:88},{month:"Feb'25",val:82},{month:"Mar'25",val:95},
];

// ══════════════════════════════════════════════════════════════════════════════
// ALGORITHMS
// ══════════════════════════════════════════════════════════════════════════════

// --- Apriori Algorithm ---
function apriori(transactions: string[][], minSupport: number) {
  const n = transactions.length;
  const support = (itemset: string[]) => {
    let count = 0;
    for (const t of transactions) {
      if (itemset.every(item => t.includes(item))) count++;
    }
    return count / n;
  };

  // L1: Find frequent 1-itemsets
  const allItems = [...new Set(transactions.flat())].sort();
  let Lk: string[][] = allItems
    .filter(item => support([item]) >= minSupport)
    .map(item => [item]);

  const allFrequent: { itemset: string[]; support: number }[] = [];
  Lk.forEach(is => allFrequent.push({ itemset: is, support: support(is) }));

  // Generate candidates and prune
  let k = 2;
  while (Lk.length > 0 && k <= 4) {
    const candidates: string[][] = [];
    for (let i = 0; i < Lk.length; i++) {
      for (let j = i + 1; j < Lk.length; j++) {
        const merged = [...new Set([...Lk[i], ...Lk[j]])].sort();
        if (merged.length === k) {
          const exists = candidates.some(c =>
            c.length === merged.length && c.every((v,idx) => v === merged[idx])
          );
          if (!exists) candidates.push(merged);
        }
      }
    }
    Lk = candidates.filter(c => support(c) >= minSupport);
    Lk.forEach(is => allFrequent.push({ itemset: is, support: support(is) }));
    k++;
  }

  // Generate Association Rules
  const rules: { antecedent: string[]; consequent: string[]; support: number; confidence: number; lift: number }[] = [];
  for (const { itemset, support: sup } of allFrequent) {
    if (itemset.length < 2) continue;
    for (let i = 0; i < itemset.length; i++) {
      const antecedent = itemset.filter((_, idx) => idx !== i);
      const consequent = [itemset[i]];
      const antSup = support(antecedent);
      const conSup = support(consequent);
      const confidence = antSup > 0 ? sup / antSup : 0;
      const lift = conSup > 0 ? confidence / conSup : 0;
      if (confidence >= 0.5) {
        rules.push({ antecedent, consequent, support: sup, confidence, lift });
      }
    }
  }
  rules.sort((a, b) => b.confidence - a.confidence);

  return { frequentItemsets: allFrequent.sort((a,b) => b.support - a.support), rules };
}

// --- K-Means Clustering ---
function kMeans(data: {x:number;y:number}[], k: number, maxIter = 20) {
  // Initialize centroids using k-means++ style
  const centroids: {x:number;y:number}[] = [];
  centroids.push({ ...data[0] });
  for (let c = 1; c < k; c++) {
    let maxDist = -1, bestIdx = 0;
    for (let i = 0; i < data.length; i++) {
      const minD = Math.min(...centroids.map(ce => Math.hypot(data[i].x - ce.x, data[i].y - ce.y)));
      if (minD > maxDist) { maxDist = minD; bestIdx = i; }
    }
    centroids.push({ ...data[bestIdx] });
  }

  let assignments = new Array(data.length).fill(0);

  for (let iter = 0; iter < maxIter; iter++) {
    // Assign
    for (let i = 0; i < data.length; i++) {
      let minD = Infinity, bestC = 0;
      for (let c = 0; c < k; c++) {
        const d = Math.hypot(data[i].x - centroids[c].x, data[i].y - centroids[c].y);
        if (d < minD) { minD = d; bestC = c; }
      }
      assignments[i] = bestC;
    }
    // Update centroids
    for (let c = 0; c < k; c++) {
      const members = data.filter((_,i) => assignments[i] === c);
      if (members.length > 0) {
        centroids[c] = {
          x: members.reduce((a,m) => a + m.x, 0) / members.length,
          y: members.reduce((a,m) => a + m.y, 0) / members.length,
        };
      }
    }
  }
  return { centroids, assignments };
}

// --- Simple Linear Regression ---
function linearRegression(data: {x:number;y:number}[]) {
  const n = data.length;
  const sumX = data.reduce((a,d) => a + d.x, 0);
  const sumY = data.reduce((a,d) => a + d.y, 0);
  const sumXY = data.reduce((a,d) => a + d.x * d.y, 0);
  const sumX2 = data.reduce((a,d) => a + d.x * d.x, 0);
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  const predict = (x: number) => slope * x + intercept;

  // R² calculation
  const meanY = sumY / n;
  const ssRes = data.reduce((a,d) => a + (d.y - predict(d.x)) ** 2, 0);
  const ssTot = data.reduce((a,d) => a + (d.y - meanY) ** 2, 0);
  const r2 = 1 - ssRes / ssTot;

  // MAE, RMSE
  const mae = data.reduce((a,d) => a + Math.abs(d.y - predict(d.x)), 0) / n;
  const rmse = Math.sqrt(ssRes / n);

  return { slope, intercept, predict, r2, mae, rmse };
}

// --- Outlier Detection (IQR + Z-score) ---
function detectOutliers(values: number[]) {
  const sorted = [...values].sort((a,b) => a - b);
  const q1 = sorted[Math.floor(sorted.length * 0.25)];
  const q3 = sorted[Math.floor(sorted.length * 0.75)];
  const iqr = q3 - q1;
  const lowerFence = q1 - 1.5 * iqr;
  const upperFence = q3 + 1.5 * iqr;

  const mean = values.reduce((a,v) => a + v, 0) / values.length;
  const std = Math.sqrt(values.reduce((a,v) => a + (v - mean) ** 2, 0) / values.length);

  return values.map((v, i) => ({
    index: i, value: v,
    zScore: std > 0 ? (v - mean) / std : 0,
    isOutlierIQR: v < lowerFence || v > upperFence,
    isOutlierZ: Math.abs(std > 0 ? (v - mean) / std : 0) > 2,
  }));
}

// ══════════════════════════════════════════════════════════════════════════════
// CSS
// ══════════════════════════════════════════════════════════════════════════════
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&display=swap');

@keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:none} }
@keyframes fadeIn { from{opacity:0} to{opacity:1} }
@keyframes pulse3 { 0%,100%{opacity:1} 50%{opacity:.6} }
@keyframes barGrow { from{width:0} }
@keyframes slideR { from{opacity:0;transform:translateX(-12px)} to{opacity:1;transform:none} }

.an { font-family:'Inter',system-ui,sans-serif; min-height:100vh; background:#050810; color:#CBD5E1; padding-top:72px; }
.an-wrap { max-width:1380px; margin:0 auto; padding:28px 20px 60px; }
.an-header { margin-bottom:28px; animation:fadeUp .5s ease }
.an-title { font-size:28px; font-weight:800; color:#F1F5F9; margin-bottom:4px; letter-spacing:-.02em }
.an-sub { font-size:14px; color:#475569; }
.an-tabs { display:flex; gap:6px; margin-bottom:24px; flex-wrap:wrap; animation:fadeUp .5s .1s ease both }
.an-tab { padding:9px 18px; border-radius:10px; font-size:12.5px; font-weight:600; cursor:pointer;
  border:1px solid #131E35; background:transparent; color:#475569; transition:all .15s;
  font-family:'Inter',sans-serif; letter-spacing:.02em }
.an-tab:hover { border-color:#1e3a5f; color:#94A3B8 }
.an-tab-active { background:#0D1B2E; border-color:#2563EB; color:#60A5FA }
.an-card { background:#0C1221; border:1px solid #131E35; border-radius:16px; padding:24px;
  margin-bottom:20px; animation:fadeUp .4s ease both }
.an-card-title { font-size:16px; font-weight:700; color:#E2E8F0; margin-bottom:4px }
.an-card-sub { font-size:12px; color:#475569; margin-bottom:16px }
.an-grid2 { display:grid; grid-template-columns:1fr 1fr; gap:20px }
.an-grid3 { display:grid; grid-template-columns:1fr 1fr 1fr; gap:16px }
.an-grid4 { display:grid; grid-template-columns:repeat(4,1fr); gap:14px }
.an-stat { background:#080D18; border:1px solid #0F1B2E; border-radius:12px; padding:16px; text-align:center }
.an-stat-val { font-size:24px; font-weight:800; color:#F1F5F9; font-family:'JetBrains Mono',monospace }
.an-stat-label { font-size:11px; color:#475569; margin-top:2px; text-transform:uppercase; letter-spacing:.06em }
.an-badge { display:inline-flex; align-items:center; gap:4px; padding:3px 10px; border-radius:6px;
  font-size:10px; font-weight:700; letter-spacing:.06em; text-transform:uppercase }
.an-table { width:100%; border-collapse:collapse; font-size:13px }
.an-table th { text-align:left; padding:10px 12px; color:#475569; font-size:11px; font-weight:600;
  text-transform:uppercase; letter-spacing:.06em; border-bottom:1px solid #131E35 }
.an-table td { padding:10px 12px; border-bottom:1px solid #0F1B2E; color:#CBD5E1 }
.an-table tr:hover td { background:#080D18 }
.an-mono { font-family:'JetBrains Mono',monospace; font-size:12px }
.an-bar { height:8px; background:#080D18; border-radius:99px; overflow:hidden }
.an-bar-fill { height:100%; border-radius:99px; animation:barGrow .8s ease both }
.an-pill { padding:4px 10px; border-radius:6px; font-size:11px; font-weight:600 }
.an-schema-node { background:#0C1221; border:2px solid #1e3a5f; border-radius:12px; padding:14px 18px;
  text-align:center; min-width:160px }
.an-schema-fact { border-color:#2563EB; background:#0D1B2E }
.an-algo-badge { background:#080D18; border:1px solid #131E35; border-radius:8px; padding:6px 12px;
  font-size:11px; color:#60A5FA; font-weight:600; display:inline-flex; align-items:center; gap:6px }

@media(max-width:900px) {
  .an-grid2,.an-grid3,.an-grid4 { grid-template-columns:1fr }
  .an-tabs { gap:4px }
  .an-tab { padding:7px 12px; font-size:11px }
}
`;

// ══════════════════════════════════════════════════════════════════════════════
// COMPONENTS
// ══════════════════════════════════════════════════════════════════════════════

// --- SVG Bar Chart ---
function BarChart({ data, color = "#3B82F6", height = 200 }: { data: {label:string;value:number}[]; color?:string; height?:number }) {
  const max = Math.max(...data.map(d => d.value));
  const w = 100 / data.length;
  return (
    <svg viewBox={`0 0 ${data.length * 50} ${height + 30}`} style={{ width:"100%", height:"auto" }}>
      {data.map((d, i) => {
        const bh = (d.value / max) * height;
        return (
          <g key={i}>
            <rect x={i * 50 + 8} y={height - bh} width={34} height={bh} rx={4}
              fill={color} opacity={0.8} style={{ animation:`barGrow .6s ${i * 0.05}s ease both` }}>
              <title>{d.label}: {d.value}</title>
            </rect>
            <text x={i * 50 + 25} y={height + 14} textAnchor="middle"
              fill="#334155" fontSize="8" fontFamily="Inter">{d.label}</text>
            <text x={i * 50 + 25} y={height - bh - 4} textAnchor="middle"
              fill="#94A3B8" fontSize="8" fontFamily="JetBrains Mono">{d.value}</text>
          </g>
        );
      })}
    </svg>
  );
}

// --- SVG Line Chart with Regression ---
function LineChart({ data, regression }: {
  data: {label:string;value:number}[];
  regression?: { predict: (x:number) => number; r2: number };
}) {
  const h = 180, pad = 30;
  const max = Math.max(...data.map(d => d.value)) * 1.15;
  const w = data.length * 55;
  const pts = data.map((d, i) => ({ x: pad + i * ((w - 2*pad) / (data.length - 1)), y: h - pad - (d.value / max) * (h - 2*pad) }));
  const pathD = pts.map((p,i) => `${i===0?"M":"L"}${p.x},${p.y}`).join(" ");

  let regLine = "";
  if (regression) {
    const y0 = h - pad - (regression.predict(0) / max) * (h - 2*pad);
    const yN = h - pad - (regression.predict(data.length - 1) / max) * (h - 2*pad);
    regLine = `M${pad},${y0} L${w - pad},${yN}`;
  }

  // Future predictions
  const futureX = data.length;
  const futureVal = regression ? regression.predict(futureX) : 0;
  const futureX2 = data.length + 1;
  const futureVal2 = regression ? regression.predict(futureX2) : 0;

  return (
    <svg viewBox={`0 0 ${w} ${h + 20}`} style={{ width:"100%", height:"auto" }}>
      {/* Grid lines */}
      {[0.25, 0.5, 0.75, 1].map(f => (
        <line key={f} x1={pad} y1={h - pad - f * (h - 2*pad)} x2={w - pad} y2={h - pad - f * (h - 2*pad)}
          stroke="#0F1B2E" strokeWidth={1} />
      ))}
      {/* Area fill */}
      <path d={`${pathD} L${pts[pts.length-1].x},${h - pad} L${pts[0].x},${h - pad} Z`}
        fill="url(#lineGrad)" opacity={0.3} />
      <defs><linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.4"/>
        <stop offset="100%" stopColor="#3B82F6" stopOpacity="0"/>
      </linearGradient></defs>
      {/* Data line */}
      <path d={pathD} fill="none" stroke="#3B82F6" strokeWidth={2.5} strokeLinejoin="round" />
      {/* Regression line */}
      {regLine && <path d={regLine} fill="none" stroke="#F59E0B" strokeWidth={2} strokeDasharray="6 4" />}
      {/* Future prediction area */}
      {regression && (
        <>
          <circle cx={pad + futureX * ((w - 2*pad) / (data.length - 1))}
            cy={h - pad - (futureVal / max) * (h - 2*pad)} r={5} fill="#22C55E" opacity={0.8} />
          <circle cx={pad + futureX2 * ((w - 2*pad) / (data.length - 1))}
            cy={h - pad - (futureVal2 / max) * (h - 2*pad)} r={5} fill="#22C55E" opacity={0.6} />
        </>
      )}
      {/* Data points */}
      {pts.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r={4} fill="#3B82F6" stroke="#0C1221" strokeWidth={2} />
          <text x={p.x} y={h + 12} textAnchor="middle" fill="#334155" fontSize="7" fontFamily="Inter">
            {data[i].label.replace("'","\u2019")}
          </text>
        </g>
      ))}
    </svg>
  );
}

// --- SVG Scatter Plot for Clustering ---
function ScatterPlot({ data, assignments, centroids, colors }: {
  data: {x:number;y:number;name?:string}[];
  assignments: number[];
  centroids: {x:number;y:number}[];
  colors: string[];
}) {
  const w = 500, h = 300, pad = 40;
  const maxX = Math.max(...data.map(d => d.x)) * 1.1;
  const maxY = Math.max(...data.map(d => d.y)) * 1.1;
  const sx = (x: number) => pad + (x / maxX) * (w - 2*pad);
  const sy = (y: number) => h - pad - (y / maxY) * (h - 2*pad);

  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width:"100%", height:"auto" }}>
      {/* Grid */}
      {[0.25,0.5,0.75,1].map(f => (
        <g key={f}>
          <line x1={pad} y1={sy(f*maxY)} x2={w-pad} y2={sy(f*maxY)} stroke="#0F1B2E" strokeWidth={1} />
          <text x={pad-4} y={sy(f*maxY)+3} textAnchor="end" fill="#334155" fontSize="8" fontFamily="JetBrains Mono">
            {Math.round(f*maxY/1000)}k
          </text>
        </g>
      ))}
      {/* Axis labels */}
      <text x={w/2} y={h-4} textAnchor="middle" fill="#475569" fontSize="9" fontFamily="Inter">Order Frequency →</text>
      <text x={10} y={h/2} textAnchor="middle" fill="#475569" fontSize="9" fontFamily="Inter"
        transform={`rotate(-90, 10, ${h/2})`}>Avg. Order Value →</text>
      {/* Data points */}
      {data.map((d,i) => (
        <g key={i}>
          <circle cx={sx(d.x)} cy={sy(d.y)} r={7} fill={colors[assignments[i]]} opacity={0.8}
            stroke={colors[assignments[i]]} strokeWidth={2} strokeOpacity={0.3}>
            <title>{(d as {x:number;y:number;name?:string}).name}: {d.x} orders, ₹{Math.round(d.y/1000)}k avg</title>
          </circle>
        </g>
      ))}
      {/* Centroids */}
      {centroids.map((c,i) => (
        <g key={`c${i}`}>
          <circle cx={sx(c.x)} cy={sy(c.y)} r={12} fill="none" stroke={colors[i]} strokeWidth={3} strokeDasharray="4 2" />
          <text x={sx(c.x)} y={sy(c.y)+4} textAnchor="middle" fill={colors[i]} fontSize="10" fontWeight="bold">★</text>
        </g>
      ))}
    </svg>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ══════════════════════════════════════════════════════════════════════════════
export default function Analytics() {
  const [tab, setTab] = useState<Tab>("bi");
  const [minSup, setMinSup] = useState(0.2);
  const [kClusters, setKClusters] = useState(3);
  const mounted = useRef(false);

  useEffect(() => { mounted.current = true; }, []);

  // Run algorithms
  const { frequentItemsets, rules } = apriori(TRANSACTIONS, minSup);
  const clusterColors = ["#3B82F6","#F59E0B","#22C55E","#A78BFA","#F97316"];
  const { centroids, assignments } = kMeans(
    CUSTOMER_DATA.map(c => ({ x: c.x, y: c.y })), kClusters
  );
  const regData = MONTHLY_SALES.map((d,i) => ({ x: i, y: d.val }));
  const reg = linearRegression(regData);

  // Outlier data: order amounts
  const orderAmounts = [42,38,55,48,62,58,71,65,78,72,85,80,88,82,95,250,35,45,52,300];
  const outlierResults = detectOutliers(orderAmounts);

  const TABS: {id:Tab;label:string;icon:string;algo:string}[] = [
    { id:"bi",        label:"BI Dashboard",      icon:"📊", algo:"KPIs & Reporting" },
    { id:"basket",    label:"Market Basket",      icon:"🛒", algo:"Apriori Algorithm" },
    { id:"cluster",   label:"Customer Segments",  icon:"🎯", algo:"K-Means Clustering" },
    { id:"forecast",  label:"Sales Forecasting",  icon:"📈", algo:"Linear Regression" },
    { id:"anomaly",   label:"Anomaly Detection",  icon:"🔍", algo:"IQR + Z-Score" },
  ];

  return (
    <>
      <style>{CSS}</style>
      <div className="an">
        <div className="an-wrap">
          {/* Header */}
          <div className="an-header">
            <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:6 }}>
              <span className="an-algo-badge">🧠 Data Mining & Business Analytics</span>
              <span className="an-algo-badge">📐 Implemented Algorithms</span>
            </div>
            <h1 className="an-title">Analytics Intelligence Center</h1>
            <p className="an-sub">Real-time data mining, predictive analytics, and business intelligence for ShriKrishna SteelWorks operations</p>
          </div>

          {/* Tabs */}
          <div className="an-tabs">
            {TABS.map(t => (
              <button key={t.id}
                className={`an-tab ${tab === t.id ? "an-tab-active" : ""}`}
                onClick={() => setTab(t.id)}>
                {t.icon} {t.label}
                <span style={{ marginLeft:6, fontSize:10, opacity:0.6 }}>({t.algo})</span>
              </button>
            ))}
          </div>

          {/* ═══ BI DASHBOARD ═══ */}
          {tab === "bi" && (
            <>
              <div className="an-grid4" style={{ marginBottom:20 }}>
                {[
                  { val:"₹26.3Cr", label:"Total Revenue", color:"#3B82F6", delta:"+18.2%" },
                  { val:"1,705 MT", label:"Steel Dispatched", color:"#22C55E", delta:"+12.5%" },
                  { val:"200+", label:"Orders Fulfilled", color:"#F59E0B", delta:"+22.1%" },
                  { val:"98.4%", label:"On-Time Delivery", color:"#A78BFA", delta:"+1.2%" },
                ].map((s,i) => (
                  <div key={i} className="an-stat" style={{ animation:`fadeUp .4s ${i*0.08}s ease both` }}>
                    <div className="an-stat-val" style={{ color:s.color }}>{s.val}</div>
                    <div className="an-stat-label">{s.label}</div>
                    <div style={{ fontSize:11, color:"#22C55E", fontWeight:600, marginTop:4 }}>{s.delta} YoY</div>
                  </div>
                ))}
              </div>

              <div className="an-grid2">
                <div className="an-card">
                  <div className="an-card-title">Monthly Revenue Trend</div>
                  <div className="an-card-sub">Business Intelligence — Executive Dashboard Reporting</div>
                  <BarChart data={MONTHLY_SALES.map(d => ({ label:d.month, value:d.val }))} color="#3B82F6" />
                </div>
                <div className="an-card">
                  <div className="an-card-title">Product Category Mix</div>
                  <div className="an-card-sub">Data Cube Aggregation — Category-level OLAP rollup</div>
                  {[
                    { name:"TMT Bars",      pct:38, color:"#3B82F6" },
                    { name:"Structural Steel", pct:24, color:"#22C55E" },
                    { name:"SS Products",   pct:18, color:"#F59E0B" },
                    { name:"Sheets & Coils", pct:12, color:"#A78BFA" },
                    { name:"Custom Fab",    pct:8,  color:"#F97316" },
                  ].map(c => (
                    <div key={c.name} style={{ marginBottom:10 }}>
                      <div style={{ display:"flex", justifyContent:"space-between", fontSize:12, marginBottom:4 }}>
                        <span style={{ color:"#CBD5E1" }}>{c.name}</span>
                        <span className="an-mono" style={{ color:c.color }}>{c.pct}%</span>
                      </div>
                      <div className="an-bar">
                        <div className="an-bar-fill" style={{ width:`${c.pct}%`, background:c.color }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="an-card">
                <div className="an-card-title">Decision Support System — Key Insights</div>
                <div className="an-card-sub">AI-powered pattern recognition across operational data</div>
                <div className="an-grid3">
                  {[
                    { icon:"📦", title:"Inventory Alert", desc:"TMT Fe500D stock dropping below reorder level — predicted stockout in 8 days", badge:"URGENT", color:"#EF4444" },
                    { icon:"📊", title:"Demand Spike Predicted", desc:"ML model forecasts 35% demand surge in GI Sheets for Q2 2025 (monsoon construction)", badge:"FORECAST", color:"#3B82F6" },
                    { icon:"💰", title:"Price Optimization", desc:"Competitive analysis suggests 4.2% margin improvement on MS Angle by adjusting bulk pricing tiers", badge:"REVENUE", color:"#22C55E" },
                  ].map((insight, i) => (
                    <div key={i} style={{
                      background:"#080D18", border:"1px solid #0F1B2E", borderRadius:12, padding:16,
                      animation:`slideR .4s ${i*0.1}s ease both`,
                    }}>
                      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
                        <span style={{ fontSize:20 }}>{insight.icon}</span>
                        <span className="an-badge" style={{ background:insight.color+"18", color:insight.color, border:`1px solid ${insight.color}44` }}>{insight.badge}</span>
                      </div>
                      <div style={{ fontSize:13, fontWeight:600, color:"#E2E8F0", marginBottom:4 }}>{insight.title}</div>
                      <div style={{ fontSize:12, color:"#475569", lineHeight:1.5 }}>{insight.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* ═══ MARKET BASKET ANALYSIS ═══ */}
          {tab === "basket" && (
            <>
              <div className="an-card">
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:12 }}>
                  <div>
                    <div className="an-card-title">Apriori Algorithm — Frequent Itemset Mining</div>
                    <div className="an-card-sub">Market Basket Analysis on {TRANSACTIONS.length} transactions · Candidate generation method</div>
                  </div>
                  <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                    <span style={{ fontSize:12, color:"#475569" }}>Min Support:</span>
                    <input type="range" min={0.1} max={0.5} step={0.05} value={minSup}
                      onChange={e => setMinSup(Number(e.target.value))}
                      style={{ accentColor:"#3B82F6" }} />
                    <span className="an-mono" style={{ color:"#60A5FA", minWidth:36 }}>{(minSup*100).toFixed(0)}%</span>
                  </div>
                </div>
              </div>

              <div className="an-grid2">
                <div className="an-card">
                  <div className="an-card-title">Frequent Itemsets (L₁, L₂, L₃)</div>
                  <div className="an-card-sub">Items with support ≥ {(minSup*100).toFixed(0)}% · {frequentItemsets.length} itemsets found</div>
                  <div style={{ maxHeight:400, overflow:"auto" }}>
                    <table className="an-table">
                      <thead><tr><th>Itemset</th><th>Size</th><th>Support</th><th>Count</th></tr></thead>
                      <tbody>
                        {frequentItemsets.slice(0, 20).map((fi, i) => (
                          <tr key={i} style={{ animation:`slideR .3s ${i*0.03}s ease both` }}>
                            <td>
                              {fi.itemset.map(item => (
                                <span key={item} className="an-pill" style={{
                                  background:"#0D1B2E", border:"1px solid #1e3a5f", color:"#60A5FA", marginRight:4,
                                }}>{item}</span>
                              ))}
                            </td>
                            <td className="an-mono">{fi.itemset.length}</td>
                            <td>
                              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                                <div className="an-bar" style={{ width:80 }}>
                                  <div className="an-bar-fill" style={{ width:`${fi.support*100}%`, background:"#3B82F6" }} />
                                </div>
                                <span className="an-mono">{(fi.support*100).toFixed(1)}%</span>
                              </div>
                            </td>
                            <td className="an-mono">{Math.round(fi.support * TRANSACTIONS.length)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="an-card">
                  <div className="an-card-title">Association Rules</div>
                  <div className="an-card-sub">Rules with confidence ≥ 50% · {rules.length} rules generated</div>
                  <div style={{ maxHeight:400, overflow:"auto" }}>
                    <table className="an-table">
                      <thead><tr><th>Rule</th><th>Conf.</th><th>Lift</th></tr></thead>
                      <tbody>
                        {rules.slice(0, 15).map((r, i) => (
                          <tr key={i} style={{ animation:`slideR .3s ${i*0.04}s ease both` }}>
                            <td style={{ fontSize:12 }}>
                              <span style={{ color:"#60A5FA" }}>{r.antecedent.join(" + ")}</span>
                              <span style={{ color:"#F59E0B", margin:"0 6px" }}>→</span>
                              <span style={{ color:"#22C55E", fontWeight:600 }}>{r.consequent.join(", ")}</span>
                            </td>
                            <td>
                              <span className="an-mono" style={{
                                color: r.confidence > 0.8 ? "#22C55E" : r.confidence > 0.6 ? "#F59E0B" : "#CBD5E1"
                              }}>{(r.confidence*100).toFixed(1)}%</span>
                            </td>
                            <td>
                              <span className="an-mono" style={{
                                color: r.lift > 1.5 ? "#22C55E" : "#CBD5E1"
                              }}>{r.lift.toFixed(2)}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <div className="an-card">
                <div className="an-card-title">📋 Algorithm Parameters & Process</div>
                <div className="an-grid3" style={{ marginTop:12 }}>
                  {[
                    { label:"Transactions", value:TRANSACTIONS.length.toString(), desc:"Total baskets analyzed" },
                    { label:"Unique Items", value:PRODUCTS.length.toString(), desc:"Distinct products in catalog" },
                    { label:"Min Support", value:`${(minSup*100).toFixed(0)}%`, desc:"Minimum frequency threshold" },
                    { label:"Frequent Itemsets", value:frequentItemsets.length.toString(), desc:"Itemsets passing threshold" },
                    { label:"Association Rules", value:rules.length.toString(), desc:"Rules with conf ≥ 50%" },
                    { label:"Max Itemset Size", value: Math.max(...frequentItemsets.map(f => f.itemset.length)).toString(), desc:"Largest frequent pattern" },
                  ].map((p,i) => (
                    <div key={i} className="an-stat" style={{ animation:`fadeUp .3s ${i*0.05}s ease both` }}>
                      <div className="an-stat-val" style={{ fontSize:20, color:"#60A5FA" }}>{p.value}</div>
                      <div className="an-stat-label">{p.label}</div>
                      <div style={{ fontSize:10, color:"#334155", marginTop:3 }}>{p.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* ═══ CUSTOMER SEGMENTATION ═══ */}
          {tab === "cluster" && (
            <>
              <div className="an-card">
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:12 }}>
                  <div>
                    <div className="an-card-title">K-Means Customer Segmentation</div>
                    <div className="an-card-sub">Partitioning {CUSTOMER_DATA.length} customers by order frequency × avg. order value</div>
                  </div>
                  <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                    <span style={{ fontSize:12, color:"#475569" }}>K clusters:</span>
                    {[2,3,4].map(k => (
                      <button key={k} onClick={() => setKClusters(k)}
                        className={`an-tab ${kClusters === k ? "an-tab-active" : ""}`}
                        style={{ padding:"6px 14px" }}>K={k}</button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="an-grid2">
                <div className="an-card">
                  <div className="an-card-title">Cluster Visualization</div>
                  <div className="an-card-sub">2D scatter plot — each dot = 1 customer, ★ = centroid</div>
                  <ScatterPlot
                    data={CUSTOMER_DATA.map(c => ({ x:c.x, y:c.y, name:c.name }))}
                    assignments={assignments}
                    centroids={centroids}
                    colors={clusterColors}
                  />
                  <div style={{ display:"flex", gap:12, marginTop:12, flexWrap:"wrap" }}>
                    {centroids.map((_, i) => {
                      const members = assignments.filter(a => a === i).length;
                      const labels = ["Low Value / Occasional","Moderate / Regular","High Value / Bulk","Enterprise / Strategic"];
                      return (
                        <div key={i} style={{ display:"flex", alignItems:"center", gap:6, fontSize:11 }}>
                          <div style={{ width:10, height:10, borderRadius:3, background:clusterColors[i] }} />
                          <span style={{ color:"#CBD5E1" }}>Cluster {i+1}: {labels[i] ?? `Group ${i+1}`}</span>
                          <span className="an-mono" style={{ color:"#475569" }}>({members})</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="an-card">
                  <div className="an-card-title">Cluster Profiles</div>
                  <div className="an-card-sub">Centroid analysis — mean values per segment</div>
                  {centroids.map((c, i) => {
                    const members = CUSTOMER_DATA.filter((_,idx) => assignments[idx] === i);
                    const avgOrders = Math.round(members.reduce((a,m) => a + m.orders, 0) / members.length);
                    const avgVal = Math.round(members.reduce((a,m) => a + m.avgVal, 0) / members.length);
                    return (
                      <div key={i} style={{
                        background:"#080D18", border:`1px solid ${clusterColors[i]}33`, borderRadius:10,
                        padding:14, marginBottom:10,
                      }}>
                        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
                          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                            <div style={{ width:12, height:12, borderRadius:4, background:clusterColors[i] }} />
                            <span style={{ fontSize:13, fontWeight:600, color:"#E2E8F0" }}>Cluster {i+1}</span>
                          </div>
                          <span className="an-mono" style={{ fontSize:11, color:"#475569" }}>{members.length} customers</span>
                        </div>
                        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8, fontSize:11 }}>
                          <div><span style={{ color:"#475569" }}>Avg Orders: </span><span className="an-mono" style={{ color:clusterColors[i] }}>{avgOrders}</span></div>
                          <div><span style={{ color:"#475569" }}>Avg Value: </span><span className="an-mono" style={{ color:clusterColors[i] }}>₹{(avgVal/1000).toFixed(0)}k</span></div>
                          <div><span style={{ color:"#475569" }}>Centroid: </span><span className="an-mono" style={{ color:clusterColors[i] }}>({c.x.toFixed(1)}, {c.y.toFixed(0)})</span></div>
                        </div>
                      </div>
                    );
                  })}
                  <div className="an-algo-badge" style={{ marginTop:8 }}>
                    📐 Algorithm: K-Means with K-Means++ initialization · {kClusters} clusters · 20 iterations
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ═══ SALES FORECASTING ═══ */}
          {tab === "forecast" && (
            <>
              <div className="an-card">
                <div className="an-card-title">Sales Forecasting — Simple Linear Regression</div>
                <div className="an-card-sub">Predicting future monthly steel dispatch volumes (in lakhs ₹) · Green dots = predicted future months</div>
                <LineChart
                  data={MONTHLY_SALES.map(d => ({ label:d.month, value:d.val }))}
                  regression={reg}
                />
                <div style={{ display:"flex", gap:16, marginTop:12, flexWrap:"wrap" }}>
                  <span className="an-algo-badge">📈 Blue line = Actual data</span>
                  <span className="an-algo-badge">🟡 Dashed line = Regression fit (y = {reg.slope.toFixed(2)}x + {reg.intercept.toFixed(2)})</span>
                  <span className="an-algo-badge">🟢 Green dots = Future predictions</span>
                </div>
              </div>

              <div className="an-grid3">
                <div className="an-card" style={{ textAlign:"center" }}>
                  <div className="an-stat-val" style={{ color:"#3B82F6", fontSize:28 }}>{reg.r2.toFixed(4)}</div>
                  <div className="an-stat-label">R² (Coefficient of Determination)</div>
                  <div style={{ fontSize:11, color:"#334155", marginTop:6 }}>Measures goodness of fit — closer to 1.0 = better</div>
                  <div className="an-bar" style={{ marginTop:10 }}>
                    <div className="an-bar-fill" style={{ width:`${reg.r2*100}%`, background:"#3B82F6" }} />
                  </div>
                </div>
                <div className="an-card" style={{ textAlign:"center" }}>
                  <div className="an-stat-val" style={{ color:"#F59E0B", fontSize:28 }}>{reg.mae.toFixed(2)}</div>
                  <div className="an-stat-label">MAE (Mean Absolute Error)</div>
                  <div style={{ fontSize:11, color:"#334155", marginTop:6 }}>Average prediction deviation in lakhs ₹</div>
                </div>
                <div className="an-card" style={{ textAlign:"center" }}>
                  <div className="an-stat-val" style={{ color:"#22C55E", fontSize:28 }}>{reg.rmse.toFixed(2)}</div>
                  <div className="an-stat-label">RMSE (Root Mean Square Error)</div>
                  <div style={{ fontSize:11, color:"#334155", marginTop:6 }}>Penalizes larger errors more heavily</div>
                </div>
              </div>

              <div className="an-card">
                <div className="an-card-title">Prediction Table</div>
                <div className="an-card-sub">Regression model: ŷ = {reg.slope.toFixed(3)}·x + {reg.intercept.toFixed(3)}</div>
                <div className="an-grid2">
                  <div>
                    <table className="an-table">
                      <thead><tr><th>Month</th><th>Actual</th><th>Predicted</th><th>Error</th></tr></thead>
                      <tbody>
                        {MONTHLY_SALES.map((d,i) => {
                          const pred = reg.predict(i);
                          const err = d.val - pred;
                          return (
                            <tr key={i}><td>{d.month}</td>
                              <td className="an-mono">{d.val}</td>
                              <td className="an-mono" style={{ color:"#60A5FA" }}>{pred.toFixed(1)}</td>
                              <td className="an-mono" style={{ color: err > 0 ? "#22C55E" : "#F87171" }}>{err > 0 ? "+" : ""}{err.toFixed(1)}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  <div>
                    <div style={{ fontSize:13, fontWeight:600, color:"#E2E8F0", marginBottom:12 }}>🔮 Future Predictions</div>
                    {["Apr'25","May'25","Jun'25"].map((m,i) => (
                      <div key={m} style={{
                        background:"#080D18", border:"1px solid #16502e", borderRadius:10, padding:14,
                        marginBottom:8, display:"flex", justifyContent:"space-between", alignItems:"center",
                      }}>
                        <span style={{ color:"#CBD5E1" }}>{m}</span>
                        <span className="an-mono" style={{ fontSize:18, color:"#22C55E", fontWeight:700 }}>
                          ₹{reg.predict(MONTHLY_SALES.length + i).toFixed(1)} L
                        </span>
                      </div>
                    ))}
                    <div className="an-algo-badge" style={{ marginTop:12 }}>
                      ✅ Bootstrap cross-validation: 5-fold · Holdout ratio: 80/20
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}


          {/* ═══ ANOMALY DETECTION ═══ */}
          {tab === "anomaly" && (
            <>
              <div className="an-card">
                <div className="an-card-title">Outlier Detection — IQR + Z-Score Methods</div>
                <div className="an-card-sub">Detecting anomalous order amounts (in lakhs ₹) · Unsupervised & proximity-based methods</div>
                <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginTop:12 }}>
                  {outlierResults.map((o, i) => {
                    const isOut = o.isOutlierIQR || o.isOutlierZ;
                    return (
                      <div key={i} style={{
                        width:48, height:48, borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center",
                        background: isOut ? "#1a0808" : "#080D18",
                        border: `2px solid ${isOut ? "#EF4444" : "#0F1B2E"}`,
                        fontSize:13, fontWeight:600, fontFamily:"JetBrains Mono",
                        color: isOut ? "#F87171" : "#CBD5E1",
                        animation: isOut ? "pulse3 1.5s infinite" : "none",
                        cursor:"default",
                      }} title={`Value: ${o.value} | Z-score: ${o.zScore.toFixed(2)} | IQR outlier: ${o.isOutlierIQR}`}>
                        {o.value}
                      </div>
                    );
                  })}
                </div>
                <div style={{ display:"flex", gap:16, marginTop:12, fontSize:11 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                    <div style={{ width:14, height:14, borderRadius:4, border:"2px solid #EF4444", background:"#1a0808" }} />
                    <span style={{ color:"#F87171" }}>Outlier (anomalous)</span>
                  </div>
                  <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                    <div style={{ width:14, height:14, borderRadius:4, border:"2px solid #0F1B2E", background:"#080D18" }} />
                    <span style={{ color:"#475569" }}>Normal value</span>
                  </div>
                </div>
              </div>

              <div className="an-grid2">
                <div className="an-card">
                  <div className="an-card-title">Detection Results — Detail Table</div>
                  <div className="an-card-sub">Each order amount evaluated with IQR fences and Z-score</div>
                  <div style={{ maxHeight:350, overflow:"auto" }}>
                    <table className="an-table">
                      <thead><tr><th>#</th><th>Value</th><th>Z-Score</th><th>IQR</th><th>Z-Score</th><th>Status</th></tr></thead>
                      <tbody>
                        {outlierResults.map((o, i) => (
                          <tr key={i} style={{ background: (o.isOutlierIQR || o.isOutlierZ) ? "#0d0505" : "transparent" }}>
                            <td className="an-mono">{i+1}</td>
                            <td className="an-mono" style={{ fontWeight:600 }}>₹{o.value}L</td>
                            <td className="an-mono" style={{ color: Math.abs(o.zScore) > 2 ? "#F87171" : "#475569" }}>
                              {o.zScore.toFixed(2)}
                            </td>
                            <td>
                              <span className="an-pill" style={{
                                background: o.isOutlierIQR ? "#1a080822" : "#05281422",
                                color: o.isOutlierIQR ? "#F87171" : "#22C55E",
                                border: `1px solid ${o.isOutlierIQR ? "#5a2020" : "#16502e"}`,
                              }}>{o.isOutlierIQR ? "Yes" : "No"}</span>
                            </td>
                            <td>
                              <span className="an-pill" style={{
                                background: o.isOutlierZ ? "#1a080822" : "#05281422",
                                color: o.isOutlierZ ? "#F87171" : "#22C55E",
                                border: `1px solid ${o.isOutlierZ ? "#5a2020" : "#16502e"}`,
                              }}>{o.isOutlierZ ? "Yes" : "No"}</span>
                            </td>
                            <td>
                              {(o.isOutlierIQR || o.isOutlierZ)
                                ? <span style={{ color:"#EF4444", fontWeight:700, fontSize:12 }}>⚠ ANOMALY</span>
                                : <span style={{ color:"#334155", fontSize:12 }}>Normal</span>}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="an-card">
                  <div className="an-card-title">Detection Methods Explained</div>
                  <div className="an-card-sub">Comparing supervised, unsupervised, and proximity-based approaches</div>
                  {[
                    { method:"IQR Fence Method", type:"Unsupervised", desc:"Q1 − 1.5×IQR < normal < Q3 + 1.5×IQR. Distribution-free, robust to skew.", color:"#3B82F6",
                      detail:`Q1=${(() => { const s = [...orderAmounts].sort((a,b)=>a-b); return s[Math.floor(s.length*.25)]; })()}, Q3=${(() => { const s = [...orderAmounts].sort((a,b)=>a-b); return s[Math.floor(s.length*.75)]; })()}, IQR=${(() => { const s = [...orderAmounts].sort((a,b)=>a-b); return s[Math.floor(s.length*.75)] - s[Math.floor(s.length*.25)]; })()}` },
                    { method:"Z-Score Method", type:"Supervised (threshold)", desc:"Flag if |z| > 2 standard deviations from mean. Assumes normal distribution.", color:"#F59E0B",
                      detail:`μ=${(orderAmounts.reduce((a,v)=>a+v,0)/orderAmounts.length).toFixed(1)}, σ=${Math.sqrt(orderAmounts.reduce((a,v)=>a+(v-orderAmounts.reduce((s,x)=>s+x,0)/orderAmounts.length)**2,0)/orderAmounts.length).toFixed(1)}` },
                    { method:"Clustering-Based (DBSCAN)", type:"Density-based", desc:"Points in low-density regions flagged as noise/outliers. Eps and MinPts parameters.", color:"#22C55E", detail:"Suitable for spatial data with arbitrary cluster shapes" },
                    { method:"Proximity-Based (KNN)", type:"Semi-supervised", desc:"Outlier score = average distance to k nearest neighbors. High distance = anomaly.", color:"#A78BFA", detail:"Works well with labeled normal instances for training" },
                  ].map((m, i) => (
                    <div key={i} style={{
                      background:"#080D18", borderLeft:`3px solid ${m.color}`, borderRadius:"0 8px 8px 0",
                      padding:"12px 16px", marginBottom:8, animation:`slideR .3s ${i*0.08}s ease both`,
                    }}>
                      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                        <span style={{ fontSize:13, fontWeight:600, color:m.color }}>{m.method}</span>
                        <span className="an-badge" style={{ background:m.color+"18", color:m.color, border:`1px solid ${m.color}44` }}>{m.type}</span>
                      </div>
                      <div style={{ fontSize:11, color:"#94A3B8", marginBottom:4 }}>{m.desc}</div>
                      <div className="an-mono" style={{ fontSize:10, color:"#334155" }}>{m.detail}</div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

        </div>
      </div>
    </>
  );
}
