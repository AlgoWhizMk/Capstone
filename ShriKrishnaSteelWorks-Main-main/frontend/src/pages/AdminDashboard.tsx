// src/pages/AdminDashboard.tsx
import { useState, useEffect } from "react";
import { useNavigate, useLocation }    from "react-router-dom";
import { useAuth }                     from "../context/AuthContext";
import { logOut }                      from "../services/firebase";
import {
  getAllOrders,
  getAllUsers,
  getUser,
  updateUser,
} from "../services/api";
import type {
  MongoUser, MongoOrder,
} from "../services/api";
import ProjectDetailModal from "../components/ProjectDetailModal";
import type { ProjectDetailData } from "../components/ProjectDetailModal";

// ─── Types ────────────────────────────────────────────────────────────────────
type Tab = "overview" | "orders" | "projects" | "users" | "profile" | "settings";

type EditProfileForm = {
  name: string;
  phone: string;
  company: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
};

type DashboardSettings = {
  emailNotify: boolean;
  smsNotify: boolean;
  orderUpdates: boolean;
  newsletter: boolean;
  twoFactor: boolean;
};

type NotifyToggleKey = "emailNotify" | "smsNotify" | "orderUpdates" | "newsletter";

interface Project {
  id: string;
  title: string;
  type: "standard" | "customized";
  status: "ongoing" | "completed" | "planning";
  description: string;
  location: string;
  startDate: string;
  completedDate?: string;
  value: string;
  progress: number;
  customDetails?: {
    specifications: string;
    materials: string;
    agreedTerms: string;
    ownerNotes: string;
  };
  image?: string;
}

// ─── Mock projects (replace with MongoDB later) ───────────────────────────────
const MOCK_PROJECTS: Project[] = [
  {
    id: "PRJ-001",
    title: "Industrial Warehouse Steel Framework",
    type: "customized",
    status: "completed",
    description: "Custom heavy-duty steel framework for 5000 sq ft warehouse",
    location: "Butibori MIDC, Nagpur",
    startDate: "2024-09-01",
    completedDate: "2025-01-15",
    value: "₹18,50,000",
    progress: 100,
    customDetails: {
      specifications: "IS:2062 Grade A steel, 8mm thickness, hot-dip galvanized",
      materials: "TMT Fe-500, MS Channels 150x75, Roof Purlins Z-200",
      agreedTerms: "Design + supply + installation. Payment: 40% advance, 60% on completion",
      ownerNotes: "Client requested extra wind bracing on north side. Completed ahead of schedule.",
    },
  },
  {
    id: "PRJ-002",
    title: "Residential Gate & Grill Work",
    type: "customized",
    status: "ongoing",
    description: "Decorative MS gate with artistic grill pattern for bungalow",
    location: "Dharampeth, Nagpur",
    startDate: "2025-02-10",
    value: "₹2,20,000",
    progress: 65,
    customDetails: {
      specifications: "MS Square Pipe 40x40, Ornamental Design, Powder coated matte black",
      materials: "MS Square Pipe, Flat Bar, Decorative Scrolls",
      agreedTerms: "Design approval → fabrication → installation. 50% advance paid.",
      ownerNotes: "Design finalized on 12 Feb 2025. Client approved 3D mockup.",
    },
  },
  {
    id: "PRJ-003",
    title: "Factory Mezzanine Floor",
    type: "standard",
    status: "planning",
    description: "Standard mezzanine floor structure for storage expansion",
    location: "Hingna Road, Nagpur",
    startDate: "2025-03-20",
    value: "₹6,80,000",
    progress: 15,
  },
];

// ─── Rich detail data for each project (modal) ─────────────────────────────
const PROJECT_DETAIL_MAP: Record<string, import("../components/ProjectDetailModal").ProjectDetailData> = {
  "PRJ-001": {
    id: "PRJ-001",
    name: "Industrial Warehouse Steel Framework",
    location: "Butibori MIDC, Nagpur",
    city: "Nagpur", state: "Maharashtra",
    type: "Industrial",
    clientName: "Butibori Enterprises Pvt. Ltd.",
    status: "Completed",
    progress: 100,
    startDate: "2024-09-01",
    expectedCompletion: "2025-01-15",
    description: "Custom heavy-duty steel framework for 5000 sq ft warehouse. IS:2062 Grade A steel, hot-dip galvanized. Completed ahead of schedule.",
    materialsCount: 6, workersCount: 24, updatesCount: 5, pendingTasks: 0,
    materials: [
      { name: "TMT Fe-500 Bars",    quantity: "45",  unit: "MT",   supplier: "SAIL Nagpur Depot",      status: "Delivered" },
      { name: "MS Channels 150×75", quantity: "18",  unit: "MT",   supplier: "Shree Steel Traders",    status: "Delivered" },
      { name: "Roof Purlins Z-200", quantity: "12",  unit: "MT",   supplier: "Bhilai Steel House",     status: "Delivered" },
      { name: "Anchor Bolts M24",   quantity: "320", unit: "Pcs",  supplier: "Nagpur Bolt Works",      status: "Delivered" },
      { name: "Primer Paint",       quantity: "180", unit: "Ltrs", supplier: "Asian Paints Industrial",status: "Delivered" },
      { name: "Welding Rods E6013", quantity: "5",   unit: "Boxes",supplier: "D&H Secheron",           status: "Delivered" },
    ],
    financials: { totalBudget: 1850000, amountSpent: 1720000, pendingApprovals: 0 },
    updates: [
      { date: "2025-01-15", title: "Project Completed",     description: "All work completed and handed over to client. Certificate issued.", type: "milestone" },
      { date: "2024-12-20", title: "Final Inspection Passed", description: "Third-party QC inspection passed with zero defects.", type: "milestone" },
      { date: "2024-11-10", title: "Roofing Completed",     description: "Roof purlins and sheeting installed. Gutter work finished.", type: "update" },
      { date: "2024-10-05", title: "Steel Erection 80%",    description: "All columns and primary beams erected on site.", type: "update" },
      { date: "2024-09-15", title: "Foundation Ready",       description: "Concrete foundation and anchor bolt placement completed.", type: "milestone" },
    ],
    team: [
      { role: "Project Manager",  name: "Rajesh Bhide",     phone: "+91 98230 11111" },
      { role: "Site Engineer",    name: "Amol Kulkarni",    phone: "+91 94201 22222" },
      { role: "Supervisor",       name: "Santosh Wankhede", phone: "+91 90210 33333" },
      { role: "Welder",           count: 8 },
      { role: "Fabricator",       count: 6 },
      { role: "Safety Officer",   name: "Priya Deshpande"  },
    ],
  },
  "PRJ-002": {
    id: "PRJ-002",
    name: "Residential Gate & Grill Work",
    location: "Dharampeth, Nagpur",
    city: "Nagpur", state: "Maharashtra",
    type: "Commercial",
    clientName: "Mr. Arvind Soni",
    status: "Ongoing",
    progress: 65,
    startDate: "2025-02-10",
    expectedCompletion: "2025-04-30",
    description: "Decorative MS gate with artistic grill pattern for bungalow. Powder-coated matte black finish. Design approved on 12 Feb 2025.",
    materialsCount: 4, workersCount: 6, updatesCount: 3, pendingTasks: 2,
    materials: [
      { name: "MS Square Pipe 40×40",  quantity: "1.2", unit: "MT",   supplier: "Kamla Steel Pvt.",     status: "Delivered" },
      { name: "Flat Bar 50×6",         quantity: "0.4", unit: "MT",   supplier: "Nagpur Steel Mart",    status: "Delivered" },
      { name: "Decorative Scrolls",    quantity: "48",  unit: "Pcs",  supplier: "Art Iron Fabricators", status: "Partial"   },
      { name: "Powder Coat (Black)",   quantity: "12",  unit: "Ltrs", supplier: "Berger Industrial",    status: "Pending"   },
    ],
    financials: { totalBudget: 220000, amountSpent: 110000, pendingApprovals: 30000 },
    updates: [
      { date: "2025-03-20", title: "Frame Fabrication Done",  description: "Main gate frame fully welded and primed. Grill panels in progress.", type: "update" },
      { date: "2025-03-01", title: "Material Delivered",      description: "MS Square Pipe and Flat Bars received at site. Quality checked.", type: "update" },
      { date: "2025-02-12", title: "Design Approved",         description: "Client approved final 3D design mockup. Work order signed.", type: "milestone" },
    ],
    team: [
      { role: "Fabricator",     name: "Deepak Meshram",  phone: "+91 94050 44444" },
      { role: "Welder",         count: 3 },
      { role: "Supervisor",     name: "Yogesh Thakre" },
    ],
  },
  "PRJ-003": {
    id: "PRJ-003",
    name: "Factory Mezzanine Floor",
    location: "Hingna Road, Nagpur",
    city: "Nagpur", state: "Maharashtra",
    type: "Industrial",
    clientName: "Patel Plastic Industries",
    status: "Planning",
    progress: 15,
    startDate: "2025-03-20",
    expectedCompletion: "2025-07-31",
    description: "Standard mezzanine floor structure for 1200 sq ft storage expansion inside existing factory. Design phase in progress.",
    materialsCount: 5, workersCount: 14, updatesCount: 1, pendingTasks: 5,
    materials: [
      { name: "H-Beam ISMB 300", quantity: "8",  unit: "MT",  supplier: "TBA",               status: "Pending" },
      { name: "Chequered Plate",  quantity: "5",  unit: "MT",  supplier: "TBA",               status: "Pending" },
      { name: "Grating Panels",   quantity: "20", unit: "Pcs", supplier: "TBA",               status: "Pending" },
      { name: "Staircase",        quantity: "1",  unit: "Set", supplier: "Standard Steel Fab",status: "Pending" },
      { name: "Anchor Bolts",     quantity: "80", unit: "Pcs", supplier: "TBA",               status: "Pending" },
    ],
    financials: { totalBudget: 680000, amountSpent: 50000, pendingApprovals: 80000 },
    updates: [
      { date: "2025-03-25", title: "Site Survey Completed", description: "Structural survey of factory floor done. Load capacity confirmed at 500 kg/sq.m.", type: "milestone" },
    ],
    team: [
      { role: "Site Engineer",  name: "Nikhil Desai",   phone: "+91 99700 55555" },
      { role: "Supervisor",     name: "Manoj Pawar" },
      { role: "Fabricator",     count: 5 },
      { role: "Welder",         count: 4 },
      { role: "Safety Officer", name: "TBD" },
    ],
  },
};

const ORDER_STAGES = [
  { key: "placed",       label: "Order Placed",      icon: "📋" },
  { key: "preparing",    label: "Preparing",          icon: "⚙️" },
  { key: "midway",       label: "In Progress",        icon: "🔧" },
  { key: "finishing",    label: "Finishing",          icon: "✨" },
  { key: "ready",        label: "Ready",              icon: "📦" },
  { key: "out_delivery", label: "Out for Delivery",   icon: "🚚" },
  { key: "delivered",    label: "Delivered",          icon: "✅" },
];

const STATUS_TO_STAGE: Record<string, number> = {
  Pending:    0,
  Processing: 2,
  Shipped:    5,
  Delivered:  6,
  Cancelled:  -1,
};

const STATUS_COLORS: Record<string, { bg: string; color: string; dot: string }> = {
  Delivered:  { bg: "rgba(74,222,128,0.12)",  color: "#4ADE80", dot: "#4ADE80"  },
  Processing: { bg: "rgba(251,191,36,0.12)",  color: "#FBbF24", dot: "#FBbF24"  },
  Shipped:    { bg: "rgba(96,165,250,0.12)",  color: "#60A5FA", dot: "#60A5FA"  },
  Pending:    { bg: "rgba(248,113,113,0.12)", color: "#F87171", dot: "#F87171"  },
  Cancelled:  { bg: "rgba(156,163,175,0.12)", color: "#9CA3AF", dot: "#9CA3AF"  },
};

// ─── Keyframe injection ───────────────────────────────────────────────────────
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@500;600;700&family=Inter:wght@300;400;500;600;700&display=swap');

  @keyframes fadeUp   { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
  @keyframes fadeIn   { from { opacity:0; } to { opacity:1; } }
  @keyframes shimmer  { 0%,100% { opacity:.4; } 50% { opacity:1; } }
  @keyframes spin     { to { transform:rotate(360deg); } }
  @keyframes pulse    { 0%,100% { transform:scale(1); } 50% { transform:scale(1.05); } }
  @keyframes slideIn  { from { transform:translateX(40px); opacity:0; } to { transform:translateX(0); opacity:1; } }
  @keyframes progressFill { from { width:0; } to { width:var(--w); } }
  @keyframes stageGlow { 0%,100%{box-shadow:0 0 8px rgba(74,144,217,.4)} 50%{box-shadow:0 0 20px rgba(74,144,217,.8)} }
  @keyframes trackFill { from{width:0} to{width:var(--pct)} }

  * { box-sizing:border-box; margin:0; padding:0; }

  .dash-page { font-family:'Inter',sans-serif; min-height:100vh; background:#060a1a;
    padding-top:80px; color:#e8e8e8; position:relative; overflow-x:hidden; }

  .dash-bg-grid {
    position:fixed; inset:0; pointer-events:none; z-index:0;
    background-image:
      linear-gradient(rgba(74,144,217,.025) 1px,transparent 1px),
      linear-gradient(90deg,rgba(74,144,217,.025) 1px,transparent 1px);
    background-size:48px 48px;
  }
  .dash-bg-orb1 {
    position:fixed; top:-200px; left:-200px; width:600px; height:600px; border-radius:50%;
    background:radial-gradient(circle,rgba(74,144,217,.07) 0%,transparent 70%);
    pointer-events:none; z-index:0;
  }
  .dash-bg-orb2 {
    position:fixed; bottom:-200px; right:-200px; width:500px; height:500px; border-radius:50%;
    background:radial-gradient(circle,rgba(74,144,217,.05) 0%,transparent 70%);
    pointer-events:none; z-index:0;
  }

  .dash-layout { display:flex; gap:28px; max-width:1380px; margin:0 auto; padding:32px 24px; position:relative; z-index:1; }

  /* ── Sidebar ── */
  .sidebar { width:268px; flex-shrink:0; display:flex; flex-direction:column; gap:14px; animation:fadeUp .5s ease both; }

  .side-profile-card {
    background:linear-gradient(145deg,rgba(255,255,255,.05),rgba(255,255,255,.02));
    border:1px solid rgba(255,255,255,.08); border-radius:20px; padding:28px 20px 22px;
    text-align:center; position:relative; overflow:hidden;
  }
  .side-profile-card::before {
    content:''; position:absolute; top:0; left:0; right:0; height:3px;
    background:linear-gradient(90deg,#4A90D9,#6ab0f5,#4A90D9);
    background-size:200% 100%; animation:shimmer 2s infinite;
  }

  .avatar-ring {
    width:80px; height:80px; border-radius:50%; margin:0 auto 14px;
    background:linear-gradient(135deg,#4A90D9,#2f6aad,#6ab0f5);
    padding:2px; position:relative;
  }
  .avatar-ring img, .avatar-ring .avatar-fallback {
    width:100%; height:100%; border-radius:50%; object-fit:cover;
    background:linear-gradient(135deg,#0c1535,#0a0f2e);
  }
  .avatar-fallback { display:flex; align-items:center; justify-content:center;
    font-family:'Rajdhani',sans-serif; font-size:26px; font-weight:700; color:#4A90D9; }
  .avatar-online { position:absolute; bottom:4px; right:4px; width:14px; height:14px;
    border-radius:50%; background:#4ADE80; border:2.5px solid #080c08; }

  .side-name { font-family:'Rajdhani',sans-serif; font-size:17px; font-weight:700; color:#fff; margin-bottom:4px; }
  .side-email { font-size:11px; color:#666; margin-bottom:10px; word-break:break-all; }
  .side-role  { display:inline-flex; align-items:center; gap:5px;
    background:rgba(74,144,217,.12); border:1px solid rgba(74,144,217,.25);
    color:#4A90D9; border-radius:999px; padding:3px 12px; font-size:11px; font-weight:600; }

  .side-nav { display:flex; flex-direction:column; gap:3px; }
  .side-nav-btn {
    display:flex; align-items:center; gap:11px; padding:12px 15px; border-radius:12px;
    background:transparent; border:1px solid transparent; color:#666; font-size:13.5px;
    font-weight:500; cursor:pointer; text-align:left; position:relative; overflow:hidden;
    transition:all .2s; font-family:'Inter',sans-serif;
  }
  .side-nav-btn:hover { background:rgba(255,255,255,.04); color:#aaa; }
  .side-nav-btn.active { background:rgba(74,144,217,.1); border-color:rgba(74,144,217,.2); color:#4A90D9; }
  .side-nav-btn.active::before { content:''; position:absolute; left:0; top:20%; height:60%;
    width:3px; background:#4A90D9; border-radius:0 3px 3px 0; }
  .side-nav-icon { font-size:16px; width:20px; text-align:center; }
  .side-badge { margin-left:auto; background:#4A90D9; color:#000; border-radius:999px;
    padding:1px 7px; font-size:10px; font-weight:700; }

  .side-logout {
    display:flex; align-items:center; gap:10px; padding:12px 15px; border-radius:12px;
    background:rgba(248,113,113,.06); border:1px solid rgba(248,113,113,.15);
    color:#F87171; font-size:13.5px; font-weight:500; cursor:pointer;
    transition:all .2s; font-family:'Inter',sans-serif; margin-top:4px;
  }
  .side-logout:hover { background:rgba(248,113,113,.12); }

  /* ── Main content ── */
  .dash-main { flex:1; min-width:0; display:flex; flex-direction:column; gap:22px; }

  .dash-header { animation:fadeUp .5s .1s ease both; }
  .dash-title { font-family:'Rajdhani',sans-serif; font-size:30px; font-weight:700;
    color:#fff; margin-bottom:5px; letter-spacing:0.03em; }
  .dash-sub { font-size:13.5px; color:#666; }

  /* ── Cards ── */
  .glass-card {
    background:linear-gradient(145deg,rgba(255,255,255,.04),rgba(255,255,255,.02));
    border:1px solid rgba(255,255,255,.07); border-radius:18px; padding:24px;
    animation:fadeUp .5s .2s ease both;
  }
  .card-title { font-family:'Rajdhani',sans-serif; font-size:15px; font-weight:700;
    color:#fff; margin-bottom:18px; display:flex; align-items:center; gap:8px; }

  /* ── Stats grid ── */
  .stats-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:16px; animation:fadeUp .5s .15s ease both; }
  .stat-card {
    background:linear-gradient(145deg,rgba(255,255,255,.04),rgba(255,255,255,.02));
    border:1px solid rgba(255,255,255,.07); border-radius:16px; padding:20px;
    display:flex; align-items:center; gap:14px; cursor:default;
    transition:transform .2s, border-color .2s;
  }
  .stat-card:hover { transform:translateY(-2px); border-color:rgba(74,144,217,.2); }
  .stat-icon { width:48px; height:48px; border-radius:13px;
    display:flex; align-items:center; justify-content:center; font-size:22px; flex-shrink:0; }
  .stat-val { font-family:'Rajdhani',sans-serif; font-size:23px; font-weight:800; margin-bottom:2px; }
  .stat-lbl { font-size:12px; color:#666; }

  /* ── Product cards (Amazon-style) ── */
  .products-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(240px,1fr)); gap:18px; }
  .product-card {
    background:linear-gradient(145deg,rgba(255,255,255,.05),rgba(255,255,255,.02));
    border:1px solid rgba(255,255,255,.08); border-radius:16px; overflow:hidden;
    transition:transform .25s, box-shadow .25s, border-color .25s; cursor:pointer;
  }
  .product-card:hover { transform:translateY(-4px); box-shadow:0 16px 40px rgba(0,0,0,.4);
    border-color:rgba(74,144,217,.3); }
  .product-img-wrap { height:160px; background:linear-gradient(135deg,#1a1a2e,#16213e);
    display:flex; align-items:center; justify-content:center; position:relative; overflow:hidden; }
  .product-img-wrap img { width:100%; height:100%; object-fit:cover; }
  .product-img-placeholder { font-size:48px; opacity:.4; }
  .product-status-pill {
    position:absolute; top:10px; right:10px; padding:3px 10px; border-radius:999px;
    font-size:10px; font-weight:700; backdrop-filter:blur(8px);
  }
  .product-body { padding:14px; }
  .product-name { font-size:13px; font-weight:600; color:#e8e8e8; margin-bottom:6px;
    display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; }
  .product-meta { display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; }
  .product-price { font-family:'Rajdhani',sans-serif; font-size:15px; font-weight:700; color:#4A90D9; }
  .product-date  { font-size:11px; color:#666; }
  .product-actions { display:flex; gap:8px; }
  .product-btn {
    flex:1; padding:8px; border-radius:8px; font-size:11px; font-weight:600;
    cursor:pointer; transition:all .2s; font-family:'Inter',sans-serif; border:none;
  }
  .product-btn-primary { background:rgba(74,144,217,.15); color:#4A90D9; border:1px solid rgba(74,144,217,.25); }
  .product-btn-primary:hover { background:rgba(74,144,217,.25); }
  .product-btn-outline { background:rgba(255,255,255,.05); color:#888; border:1px solid rgba(255,255,255,.1); }
  .product-btn-outline:hover { background:rgba(255,255,255,.1); color:#ccc; }

  /* ── Order tracker ── */
  .order-list { display:flex; flex-direction:column; gap:16px; }
  .order-item {
    background:linear-gradient(145deg,rgba(255,255,255,.04),rgba(255,255,255,.02));
    border:1px solid rgba(255,255,255,.07); border-radius:16px; overflow:hidden;
    transition:border-color .2s;
  }
  .order-item:hover { border-color:rgba(74,144,217,.2); }
  .order-header { padding:16px 20px; display:flex; align-items:center; gap:14px; cursor:pointer; }
  .order-thumb { width:60px; height:60px; border-radius:10px; background:#1a1a2e;
    display:flex; align-items:center; justify-content:center; font-size:24px; flex-shrink:0; overflow:hidden; }
  .order-thumb img { width:100%; height:100%; object-fit:cover; }
  .order-info { flex:1; min-width:0; }
  .order-product { font-size:13.5px; font-weight:600; color:#e8e8e8; margin-bottom:4px;
    white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .order-meta-row { display:flex; align-items:center; gap:10px; flex-wrap:wrap; }
  .order-id { font-size:11px; color:#666; font-family:monospace; }
  .order-price { font-size:12px; font-weight:700; color:#4A90D9; }
  .order-date  { font-size:11px; color:#666; }
  .order-chevron { color:#444; font-size:18px; transition:transform .3s; flex-shrink:0; }
  .order-chevron.open { transform:rotate(180deg); }
  .customized-tag { font-size:10px; font-weight:700; padding:2px 8px; border-radius:999px;
    background:rgba(168,85,247,.15); color:#a855f7; border:1px solid rgba(168,85,247,.25); }

  /* Progress tracker */
  .order-expanded { padding:0 20px 20px; border-top:1px solid rgba(255,255,255,.05); }
  .tracker-wrap { padding-top:20px; }
  .tracker-title { font-size:12px; font-weight:600; color:#888; text-transform:uppercase;
    letter-spacing:.08em; margin-bottom:16px; }
  .tracker-stages { display:flex; align-items:flex-start; gap:0; overflow-x:auto;
    padding-bottom:8px; }
  .tracker-stage { display:flex; flex-direction:column; align-items:center;
    flex:1; min-width:70px; position:relative; }
  .tracker-stage:not(:last-child)::after {
    content:''; position:absolute; top:16px; left:50%; width:100%; height:2px;
    background:rgba(255,255,255,.08); z-index:0;
  }
  .tracker-stage.done:not(:last-child)::after { background:linear-gradient(90deg,#4A90D9,rgba(74,144,217,.3)); }
  .tracker-dot {
    width:32px; height:32px; border-radius:50%; border:2px solid rgba(255,255,255,.1);
    background:#111; display:flex; align-items:center; justify-content:center;
    font-size:13px; z-index:1; position:relative; transition:all .3s;
  }
  .tracker-stage.done .tracker-dot {
    background:linear-gradient(135deg,#4A90D9,#2f6aad);
    border-color:#4A90D9; animation:stageGlow 2s infinite;
  }
  .tracker-stage.current .tracker-dot {
    background:rgba(74,144,217,.2); border-color:#4A90D9; animation:stageGlow 1.5s infinite;
  }
  .tracker-label { font-size:10px; color:#666; margin-top:6px; text-align:center; line-height:1.3; }
  .tracker-stage.done .tracker-label, .tracker-stage.current .tracker-label { color:#4A90D9; }

  .order-details-grid { display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-top:16px; }
  .detail-chip { background:rgba(255,255,255,.03); border:1px solid rgba(255,255,255,.06);
    border-radius:10px; padding:12px; }
  .detail-chip-label { font-size:10px; color:#666; text-transform:uppercase; letter-spacing:.06em; margin-bottom:4px; }
  .detail-chip-value { font-size:13px; color:#e8e8e8; font-weight:500; }

  .customized-details-box {
    margin-top:14px; background:rgba(168,85,247,.05); border:1px solid rgba(168,85,247,.15);
    border-radius:12px; padding:16px;
  }
  .custom-box-title { font-size:12px; font-weight:700; color:#a855f7; margin-bottom:10px;
    display:flex; align-items:center; gap:6px; }
  .custom-row { display:grid; grid-template-columns:1fr 1fr; gap:8px; }
  .custom-field { background:rgba(168,85,247,.05); border-radius:8px; padding:10px; }
  .custom-field-label { font-size:10px; color:#888; margin-bottom:3px; }
  .custom-field-value { font-size:12px; color:#d4b8f0; line-height:1.4; }

  /* ── Projects ── */
  .projects-grid { display:flex; flex-direction:column; gap:16px; }
  .project-card {
    background:linear-gradient(145deg,rgba(255,255,255,.04),rgba(255,255,255,.02));
    border:1px solid rgba(255,255,255,.07); border-radius:18px; overflow:hidden;
    transition:border-color .2s, transform .2s;
  }
  .project-card:hover { border-color:rgba(74,144,217,.2); transform:translateX(4px); }
  .project-top { padding:20px 22px 16px; display:flex; align-items:flex-start; gap:14px; }
  .project-icon-wrap { width:52px; height:52px; border-radius:14px; flex-shrink:0;
    display:flex; align-items:center; justify-content:center; font-size:24px; }
  .project-name { font-family:'Rajdhani',sans-serif; font-size:16px; font-weight:700;
    color:#fff; margin-bottom:5px; }
  .project-desc { font-size:13px; color:#888; margin-bottom:8px; }
  .project-tags { display:flex; gap:8px; flex-wrap:wrap; }
  .project-tag { font-size:10px; font-weight:600; padding:3px 10px; border-radius:999px; }
  .project-meta { padding:0 22px 16px; display:flex; gap:20px; flex-wrap:wrap; }
  .project-meta-item { font-size:12px; color:#666; display:flex; align-items:center; gap:5px; }
  .project-progress-wrap { padding:0 22px 20px; }
  .project-progress-label { display:flex; justify-content:space-between;
    font-size:11px; color:#888; margin-bottom:6px; }
  .project-progress-bar { height:6px; background:rgba(255,255,255,.07); border-radius:999px; overflow:hidden; }
  .project-progress-fill { height:100%; border-radius:999px; --w:0%;
    animation:progressFill 1.2s .4s ease both; width:var(--w); }
  .project-custom-section { padding:0 22px 20px; }

  /* ── Profile ── */
  .profile-layout { display:grid; grid-template-columns:1fr 1.4fr; gap:18px; }
  .profile-card {
    background:linear-gradient(145deg,rgba(255,255,255,.04),rgba(255,255,255,.02));
    border:1px solid rgba(255,255,255,.07); border-radius:18px; padding:24px;
  }
  .profile-avatar-big { width:100px; height:100px; border-radius:50%; margin:0 auto 14px;
    background:linear-gradient(135deg,#4A90D9,#2f6aad); padding:2px; }
  .profile-avatar-big img, .profile-avatar-big .avatar-big-fb {
    width:100%; height:100%; border-radius:50%; object-fit:cover;
    background:linear-gradient(135deg,#1a2a1a,#0d160d);
    display:flex; align-items:center; justify-content:center;
    font-family:'Rajdhani',sans-serif; font-size:32px; font-weight:800; color:#4A90D9;
  }
  .profile-fields-grid { display:flex; flex-direction:column; gap:10px; }
  .pf-item { background:rgba(255,255,255,.03); border:1px solid rgba(255,255,255,.06);
    border-radius:10px; padding:12px 14px; display:flex; align-items:center; gap:10px; }
  .pf-icon { font-size:18px; width:24px; text-align:center; }
  .pf-label { font-size:10px; color:#666; text-transform:uppercase; letter-spacing:.06em; margin-bottom:2px; }
  .pf-value { font-size:13px; color:#e8e8e8; font-weight:500; }

  /* Edit form */
  .edit-form-grid { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
  .form-field { display:flex; flex-direction:column; gap:5px; }
  .form-field.full { grid-column:1/-1; }
  .form-label { font-size:11px; color:#888; text-transform:uppercase; letter-spacing:.06em; font-weight:600; }
  .form-input, .form-textarea {
    background:rgba(255,255,255,.06); border:1px solid rgba(255,255,255,.1);
    border-radius:9px; padding:10px 13px; color:#fff; font-size:13.5px;
    font-family:'Inter',sans-serif; outline:none; transition:border-color .2s;
  }
  .form-input:focus, .form-textarea:focus { border-color:rgba(74,144,217,.5); }
  .form-textarea { resize:vertical; min-height:70px; }
  .form-actions { display:flex; gap:10px; margin-top:6px; grid-column:1/-1; }
  .btn-save { background:linear-gradient(135deg,#4A90D9,#2f6aad); border:none; color:#000;
    padding:10px 22px; border-radius:9px; font-size:13px; font-weight:700;
    cursor:pointer; transition:opacity .2s; font-family:'Inter',sans-serif; }
  .btn-save:hover { opacity:.9; }
  .btn-save:disabled { opacity:.5; cursor:not-allowed; }
  .btn-cancel { background:rgba(255,255,255,.06); border:1px solid rgba(255,255,255,.1);
    color:#888; padding:10px 18px; border-radius:9px; font-size:13px; cursor:pointer;
    font-family:'Inter',sans-serif; }

  /* ── Settings ── */
  .settings-section { margin-bottom:22px; }
  .settings-section-title { font-family:'Rajdhani',sans-serif; font-size:13px; font-weight:700;
    color:#666; text-transform:uppercase; letter-spacing:.1em; margin-bottom:10px; }
  .setting-row {
    display:flex; align-items:center; gap:14px; padding:16px 18px;
    background:rgba(255,255,255,.03); border:1px solid rgba(255,255,255,.06);
    border-radius:12px; margin-bottom:8px; transition:border-color .2s;
  }
  .setting-row:hover { border-color:rgba(74,144,217,.2); }
  .setting-icon-wrap { width:40px; height:40px; border-radius:10px; flex-shrink:0;
    display:flex; align-items:center; justify-content:center; font-size:18px; }
  .setting-info { flex:1; }
  .setting-row-title { font-size:13.5px; font-weight:600; color:#e8e8e8; margin-bottom:2px; }
  .setting-row-desc  { font-size:12px; color:#666; }
  .setting-toggle { width:44px; height:24px; border-radius:999px; cursor:pointer;
    border:none; position:relative; transition:background .2s; flex-shrink:0; }
  .setting-toggle.on  { background:linear-gradient(135deg,#4A90D9,#2f6aad); }
  .setting-toggle.off { background:rgba(255,255,255,.1); }
  .toggle-thumb { position:absolute; top:3px; width:18px; height:18px; border-radius:50%;
    background:#fff; transition:left .2s; }
  .setting-toggle.on  .toggle-thumb { left:23px; }
  .setting-toggle.off .toggle-thumb { left:3px; }
  .setting-btn-sm { background:rgba(74,144,217,.1); border:1px solid rgba(74,144,217,.2);
    color:#4A90D9; padding:7px 14px; border-radius:8px; font-size:12px; font-weight:600;
    cursor:pointer; white-space:nowrap; transition:background .2s; }
  .setting-btn-sm:hover { background:rgba(74,144,217,.2); }

  .danger-zone { background:rgba(248,113,113,.04); border:1px solid rgba(248,113,113,.12);
    border-radius:14px; padding:20px; }
  .danger-title { font-family:'Rajdhani',sans-serif; font-size:15px; font-weight:700;
    color:#F87171; margin-bottom:6px; }
  .danger-desc { font-size:13px; color:#888; margin-bottom:16px; }
  .btn-danger { background:rgba(248,113,113,.1); border:1px solid rgba(248,113,113,.25);
    color:#F87171; padding:10px 20px; border-radius:9px; font-size:13px; font-weight:700;
    cursor:pointer; transition:background .2s; }
  .btn-danger:hover { background:rgba(248,113,113,.2); }

  /* ── Toast ── */
  .dash-toast {
    position:fixed; top:90px; right:24px; z-index:9999;
    padding:13px 20px; border-radius:12px; font-size:13px; font-weight:600;
    border:1px solid; backdrop-filter:blur(12px); animation:slideIn .3s ease;
    display:flex; align-items:center; gap:8px;
  }

  /* ── Loading ── */
  .dash-loader { display:flex; align-items:center; justify-content:center;
    min-height:100vh; flex-direction:column; gap:16px; }
  .spinner { width:44px; height:44px; border:3px solid rgba(74,144,217,.15);
    border-top:3px solid #4A90D9; border-radius:50%; animation:spin .8s linear infinite; }

  /* ── Scrollbar ── */
  ::-webkit-scrollbar { width:5px; height:5px; }
  ::-webkit-scrollbar-track { background:transparent; }
  ::-webkit-scrollbar-thumb { background:rgba(74,144,217,.2); border-radius:999px; }
`;

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const { user, profile } = useAuth();
  const navigate          = useNavigate();
  const location          = useLocation();

  const [activeTab, setActiveTab]     = useState<Tab>("overview");
  const [mongoUser, setMongoUser]     = useState<MongoUser | null>(null);
  const [orders,    setOrders]        = useState<MongoOrder[]>([]);
  const [users,     setUsers]         = useState<MongoUser[]>([]);
  const [loadingUser,  setLoadingUser]    = useState(true);
  const [loadingOrders,setLoadingOrders]  = useState(true);
  const [error,        setError]          = useState("");
  const [expandedOrder,setExpandedOrder] = useState<string | null>(null);
  const [toast,        setToast]          = useState("");
  const [editMode,     setEditMode]       = useState(false);
  const [saving,       setSaving]         = useState(false);
  const [selectedProject, setSelectedProject] = useState<ProjectDetailData | null>(null);

  // Settings toggles
  const [settings, setSettings] = useState<DashboardSettings>({
    emailNotify:   true,
    smsNotify:     false,
    orderUpdates:  true,
    newsletter:    false,
    twoFactor:     false,
  });

  // Edit form
  const [editForm, setEditForm] = useState<EditProfileForm>({
    name: "", phone: "", company: "",
    street: "", city: "", state: "", pincode: "",
  });

  // Read tab from URL hash
  useEffect(() => {
    const hash = location.hash.replace("#", "") as Tab;
    if (["overview","orders","projects","users","profile","settings"].includes(hash)) {
      setActiveTab(hash);
    }
  }, [location.hash]);

  // Fetch data
  useEffect(() => {
    if (!user?.uid) return;
    setLoadingUser(true);
    getUser(user.uid)
      .then(u => {
        setMongoUser(u);
        setEditForm({
          name: u.name, phone: u.phone, company: u.company,
          street: u.address?.street || "", city: u.address?.city || "",
          state: u.address?.state || "", pincode: u.address?.pincode || "",
        });
      })
      .catch(() => setError("Backend offline — showing cached data"))
      .finally(() => setLoadingUser(false));
  }, [user?.uid]);

  // Fetch all orders and users
  useEffect(() => {
    if (!user) return;
    setLoadingOrders(true);
    Promise.all([getAllOrders(), getAllUsers()])
      .then(([ordersData, usersData]) => {
        setOrders(ordersData);
        setUsers(usersData);
      })
      .catch(console.error)
      .finally(() => setLoadingOrders(false));
  }, [user]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const handleLogout = async () => { await logOut(); navigate("/"); };

  const handleSave = async () => {
    if (!user?.uid) return;
    setSaving(true);
    try {
      const updated = await updateUser(user.uid, {
        name: editForm.name, phone: editForm.phone, company: editForm.company,
        address: { street: editForm.street, city: editForm.city, state: editForm.state, pincode: editForm.pincode },
      });
      setMongoUser(updated);
      setEditMode(false);
      showToast("✅ Profile updated successfully!");
    } catch {
      showToast("❌ Failed to save. Check backend.");
    } finally {
      setSaving(false);
    }
  };

  const goTab = (tab: Tab) => {
    setActiveTab(tab);
    navigate(`/dashboard#${tab}`, { replace: true });
  };

  const displayName  = mongoUser?.name     ?? profile?.name    ?? user?.displayName ?? "User";
  const displayEmail = mongoUser?.email    ?? user?.email      ?? "";
  const displayPhoto = mongoUser?.photoURL ?? user?.photoURL   ?? "";
  const initials     = displayName.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);
  
  // Derived stats
  const inProgress = orders.filter(o => ["Pending", "Processing", "Shipped"].includes(o.status)).length;

  const tabs = [
    { id: "overview"  as Tab, label: "Overview",   icon: "⊞" },
    { id: "users"     as Tab, label: "Manage Users", icon: "👥", badge: users.length },
    { id: "orders"    as Tab, label: "All Orders",   icon: "📦", badge: orders.length },
    { id: "projects"  as Tab, label: "All Projects", icon: "🏗",  badge: MOCK_PROJECTS.length },
    { id: "settings"  as Tab, label: "Settings",    icon: "⚙" },
  ];

  if (loadingUser) return (
    <>
      <style>{CSS}</style>
      <div className="dash-loader">
        <div className="spinner" />
        <p style={{ color: "#666", fontSize: "14px" }}>Loading your dashboard…</p>
      </div>
    </>
  );

  return (
    <>
      <style>{CSS}</style>
      {/* Project Detail Modal */}
      {selectedProject && (
        <ProjectDetailModal
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
        />
      )}
      <div className="dash-page">
        <div className="dash-bg-grid" />
        <div className="dash-bg-orb1" />
        <div className="dash-bg-orb2" />


        {/* Toast */}
        {toast && (
          <div className="dash-toast" style={{
            background: toast.startsWith("✅") ? "rgba(10,30,10,.9)" : "rgba(30,10,10,.9)",
            borderColor: toast.startsWith("✅") ? "#4ADE80" : "#F87171",
            color:       toast.startsWith("✅") ? "#4ADE80" : "#F87171",
          }}>{toast}</div>
        )}

        <div className="dash-layout">

          {/* ── SIDEBAR ─────────────────────────────────────────────────── */}
          <aside className="sidebar">
            <div className="side-profile-card">
              <div className="avatar-ring">
                {displayPhoto
                  ? <img src={displayPhoto} alt={displayName} />
                  : <div className="avatar-fallback">{initials}</div>
                }
                <div className="avatar-online" />
              </div>
              <p className="side-name">{displayName}</p>
              <p className="side-email">{displayEmail}</p>
              <span className="side-role">
                {mongoUser?.role === "admin" ? "🛡 Admin" : "✦ Customer"}
              </span>
            </div>

            <nav className="side-nav">
              {tabs.map(t => (
                <button
                  key={t.id}
                  className={`side-nav-btn ${activeTab === t.id ? "active" : ""}`}
                  onClick={() => goTab(t.id)}
                >
                  <span className="side-nav-icon">{t.icon}</span>
                  {t.label}
                  {t.badge ? <span className="side-badge">{t.badge}</span> : null}
                </button>
              ))}
            </nav>

            <button className="side-logout" onClick={handleLogout}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>
              </svg>
              Logout
            </button>
          </aside>

          {/* ── MAIN ────────────────────────────────────────────────────── */}
          <main className="dash-main">
            {error && (
              <div style={{ background:"rgba(248,113,113,.06)", border:"1px solid rgba(248,113,113,.2)",
                borderRadius:"10px", padding:"12px 16px", color:"#F87171", fontSize:"13px", marginBottom:"4px" }}>
                ⚠ {error}
              </div>
            )}

            <div className="dash-header">
              <h1 className="dash-title">
                {activeTab === "overview"  && `Admin Portal - Welcome ${displayName.split(" ")[0]} 👋`}
                {activeTab === "orders"    && "All Customer Orders"}
                {activeTab === "projects"  && "All Company Projects"}
                {activeTab === "users"   && "Manage Registered Users"}
                {activeTab === "settings"  && "System Settings"}
              </h1>
              <p className="dash-sub">
                {activeTab === "overview"  && "Overview of ShriKrishna SteelWorks portal metrics."}
                {activeTab === "orders"    && "Track and update statuses of all customer orders."}
                {activeTab === "projects"  && "Track ongoing and completed steel projects."}
                {activeTab === "users"   && "View and manage all registered clients."}
                {activeTab === "settings"  && "Adjust system preferences."}
              </p>
            </div>

            {/* ── OVERVIEW ──────────────────────────────────────────── */}
            {activeTab === "overview" && (
              <>
                {/* Stats */}
                <div className="stats-grid">
                  {[
                    { label:"Total Users",     val:String(users.length),    icon:"👥", color:"#4ADE80" },
                    { label:"All Orders",      val:String(orders.length),   icon:"📦", color:"#60A5FA" },
                    { label:"In Progress",     val:String(inProgress),      icon:"🔄", color:"#FBbF24" },
                    { label:"All Projects",    val:String(MOCK_PROJECTS.length), icon:"🏗", color:"#4A90D9" },
                  ].map(s => (
                    <div className="stat-card" key={s.label}>
                      <div className="stat-icon" style={{ background: s.color + "18" }}>
                        <span>{s.icon}</span>
                      </div>
                      <div>
                        <div className="stat-val" style={{ color: s.color }}>{s.val}</div>
                        <div className="stat-lbl">{s.label}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Recent Orders as product cards */}
                <div className="glass-card">
                  <div className="card-title">
                    📦 Recent Orders
                    <button onClick={() => goTab("orders")} style={{ marginLeft:"auto",
                      background:"none", border:"none", color:"#4A90D9", fontSize:"13px",
                      cursor:"pointer", fontWeight:600 }}>
                      View all →
                    </button>
                  </div>
                  {loadingOrders
                    ? <p style={{ color:"#666", fontSize:"13px" }}>Loading…</p>
                    : orders.length === 0
                      ? <EmptyState icon="📦" text="No orders yet" />
                      : <div className="products-grid">
                          {orders.slice(0,4).map(o => <ProductCard key={o._id} order={o} />)}
                        </div>
                  }
                </div>

                {/* Active Projects snippet */}
                <div className="glass-card">
                  <div className="card-title">
                    🏗 Active Projects
                    <button onClick={() => goTab("projects")} style={{ marginLeft:"auto",
                      background:"none", border:"none", color:"#4A90D9", fontSize:"13px",
                      cursor:"pointer", fontWeight:600 }}>
                      View all →
                    </button>
                  </div>
                  <div style={{ display:"flex", flexDirection:"column", gap:"10px" }}>
                    {MOCK_PROJECTS.filter(p => p.status !== "completed").map(p => (
                      <MiniProjectRow key={p.id} project={p} />
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* ── ORDERS ────────────────────────────────────────────── */}
            {activeTab === "orders" && (
              <div className="glass-card">
                <div className="card-title">📦 All Orders ({orders.length})</div>
                {loadingOrders
                  ? <p style={{ color:"#666", fontSize:"13px" }}>Loading orders…</p>
                  : orders.length === 0
                    ? <EmptyState icon="📦" text="No orders yet. Your orders will appear here." />
                    : <div className="order-list">
                        {orders.map(o => (
                          <OrderItem
                            key={o._id}
                            order={o}
                            expanded={expandedOrder === o._id}
                            onToggle={() => setExpandedOrder(expandedOrder === o._id ? null : o._id)}
                          />
                        ))}
                      </div>
                }
              </div>
            )}

            {/* ── PROJECTS ──────────────────────────────────────────── */}
            {activeTab === "projects" && (
              <div className="glass-card">
                <div className="card-title">🏗 All Projects ({MOCK_PROJECTS.length})</div>
                <div className="projects-grid">
                  {MOCK_PROJECTS.map(p => (
                    <div key={p.id} style={{ position: "relative" }}>
                      <ProjectCard project={p} />
                      <button
                        onClick={() => setSelectedProject(PROJECT_DETAIL_MAP[p.id] ?? null)}
                        style={{
                          position: "absolute", bottom: 16, right: 16,
                          background: "rgba(74,144,217,.15)", border: "1px solid rgba(74,144,217,.3)",
                          color: "#4A90D9", padding: "7px 16px", borderRadius: "8px",
                          fontSize: "12px", fontWeight: 700, cursor: "pointer", transition: "all .2s",
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = "rgba(74,144,217,.28)")}
                        onMouseLeave={e => (e.currentTarget.style.background = "rgba(74,144,217,.15)")}
                      >
                        View Details →
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── USERS ───────────────────────────────────────────── */}
            {activeTab === "users" && (
              <div className="glass-card">
                <div className="card-title">👥 All Registered Users</div>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px", marginTop: "1rem" }}>
                    <thead>
                      <tr style={{ borderBottom: "1px solid #333", textAlign: "left", color: "#888" }}>
                        <th style={{ padding: "12px 0" }}>Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Joined</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map(u => (
                        <tr key={u._id} style={{ borderBottom: "1px solid #222" }}>
                          <td style={{ padding: "12px 0", color: "#fff" }}>{u.name}</td>
                          <td style={{ color: "#aaa" }}>{u.email}</td>
                          <td>
                            <span style={{ 
                              padding: "4px 8px", 
                              borderRadius: "12px", 
                              fontSize: "12px",
                              background: u.role === "admin" ? "#4A90D922" : "#333",
                              color: u.role === "admin" ? "#4A90D9" : "#aaa"
                            }}>
                              {u.role}
                            </span>
                          </td>
                          <td style={{ color: "#666" }}>
                            {new Date(u.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                      {users.length === 0 && (
                        <tr><td colSpan={4} style={{ padding: "20px 0", textAlign: "center", color: "#666" }}>No users found.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ── PROFILE ───────────────────────────────────────────── */}
            {activeTab === "profile" && (
              <div className="profile-layout">
                {/* Left: avatar + read-only fields */}
                <div className="profile-card">
                  <div style={{ textAlign:"center", marginBottom:"20px" }}>
                    <div className="profile-avatar-big" style={{ margin:"0 auto 14px" }}>
                      {displayPhoto
                        ? <img src={displayPhoto} alt={displayName} style={{ width:"100%", height:"100%", borderRadius:"50%", objectFit:"cover" }} />
                        : <div className="avatar-big-fb">{initials}</div>
                      }
                    </div>
                    <p style={{ fontFamily:"'Rajdhani',sans-serif", fontWeight:700, fontSize:"18px", color:"#fff" }}>{displayName}</p>
                    <p style={{ fontSize:"12px", color:"#666", marginTop:"4px" }}>{displayEmail}</p>
                  </div>
                  <div className="profile-fields-grid">
                    {[
                      { icon:"✉",  label:"Email",        val: mongoUser?.email    || "—" },
                      { icon:"📞", label:"Phone",         val: mongoUser?.phone    || "Not set" },
                      { icon:"🏢", label:"Company",       val: mongoUser?.company  || "Not set" },
                      { icon:"🛡", label:"Role",           val: mongoUser?.role     || "user" },
                      { icon:"📍", label:"City",           val: mongoUser?.address?.city    || "Not set" },
                      { icon:"🗓", label:"Member Since",   val: mongoUser?.createdAt
                          ? new Date(mongoUser.createdAt).toLocaleDateString("en-IN",{ month:"long", year:"numeric" })
                          : "—" },
                    ].map(f => (
                      <div className="pf-item" key={f.label}>
                        <span className="pf-icon">{f.icon}</span>
                        <div>
                          <div className="pf-label">{f.label}</div>
                          <div className="pf-value">{f.val}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right: editable form */}
                <div className="profile-card">
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"18px" }}>
                    <span style={{ fontFamily:"'Rajdhani',sans-serif", fontWeight:700, fontSize:"15px", color:"#fff" }}>
                      {editMode ? "✏ Edit Profile" : "Account Details"}
                    </span>
                    {!editMode && (
                      <button className="btn-save" style={{ padding:"8px 16px", fontSize:"12px" }}
                        onClick={() => setEditMode(true)}>
                        ✏ Edit
                      </button>
                    )}
                  </div>

                  <div className="edit-form-grid">
                    {[
                      { key:"name",    label:"Full Name",    placeholder:"Your full name",    full:false },
                      { key:"phone",   label:"Phone Number", placeholder:"9876543210",         full:false },
                      { key:"company", label:"Company",      placeholder:"Company name",       full:true  },
                      { key:"street",  label:"Street Address",placeholder:"Plot/Street",       full:true  },
                      { key:"city",    label:"City",          placeholder:"City",              full:false },
                      { key:"state",   label:"State",         placeholder:"Maharashtra",       full:false },
                      { key:"pincode", label:"Pincode",       placeholder:"440001",            full:false },
                    ].map(f => (
                      <div className={`form-field ${f.full ? "full" : ""}`} key={f.key}>
                        <label className="form-label">{f.label}</label>
                        {editMode ? (
                          <input
                            className="form-input"
                            value={editForm[f.key as keyof EditProfileForm]}
                            onChange={e => setEditForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                            placeholder={f.placeholder}
                          />
                        ) : (
                          <div className="form-input" style={{ color: editForm[f.key as keyof EditProfileForm] ? "#e8e8e8" : "#444" }}>
                            {editForm[f.key as keyof EditProfileForm] || `— ${f.placeholder}`}
                          </div>
                        )}
                      </div>
                    ))}

                    {editMode && (
                      <div className="form-actions">
                        <button className="btn-save" onClick={handleSave} disabled={saving}>
                          {saving ? "Saving…" : "💾 Save Changes"}
                        </button>
                        <button className="btn-cancel" onClick={() => setEditMode(false)}>Cancel</button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ── SETTINGS ──────────────────────────────────────────── */}
            {activeTab === "settings" && (
              <div className="glass-card">
                {/* Notifications */}
                <div className="settings-section">
                  <div className="settings-section-title">🔔 Notifications</div>
                  {[
                    { key:"emailNotify",  title:"Email Notifications",  desc:"Receive order updates via email",         icon:"✉",  type:"toggle" },
                    { key:"smsNotify",    title:"SMS Alerts",            desc:"Get SMS for dispatch and delivery",       icon:"📱", type:"toggle" },
                    { key:"orderUpdates", title:"Order Status Updates",  desc:"Instant alerts when order status changes",icon:"📦", type:"toggle" },
                    { key:"newsletter",   title:"Newsletter",            desc:"Monthly steel market updates & offers",   icon:"📰", type:"toggle" },
                  ].map(s => (
                    <div className="setting-row" key={s.key}>
                      <div className="setting-icon-wrap" style={{ background:"rgba(74,144,217,.08)" }}>
                        <span>{s.icon}</span>
                      </div>
                      <div className="setting-info">
                        <div className="setting-row-title">{s.title}</div>
                        <div className="setting-row-desc">{s.desc}</div>
                      </div>
                      <ToggleSwitch
                        on={settings[s.key as NotifyToggleKey]}
                        onToggle={() => setSettings(prev => ({
                          ...prev,
                          [s.key]: !prev[s.key as NotifyToggleKey],
                        }))}
                      />
                    </div>
                  ))}
                </div>

                {/* Security */}
                <div className="settings-section">
                  <div className="settings-section-title">🔒 Security</div>
                  <div className="setting-row">
                    <div className="setting-icon-wrap" style={{ background:"rgba(96,165,250,.08)" }}>
                      <span>🔒</span>
                    </div>
                    <div className="setting-info">
                      <div className="setting-row-title">Two-Factor Authentication</div>
                      <div className="setting-row-desc">Add extra security to your account</div>
                    </div>
                    <ToggleSwitch on={settings.twoFactor}
                      onToggle={() => setSettings(p => ({ ...p, twoFactor: !p.twoFactor }))} />
                  </div>
                  <div className="setting-row">
                    <div className="setting-icon-wrap" style={{ background:"rgba(96,165,250,.08)" }}>
                      <span>🔑</span>
                    </div>
                    <div className="setting-info">
                      <div className="setting-row-title">Change Password</div>
                      <div className="setting-row-desc">Update your account password</div>
                    </div>
                    <button className="setting-btn-sm"
                      onClick={() => showToast("✅ Password reset email sent!")}>
                      Send Reset Email
                    </button>
                  </div>
                  <div className="setting-row">
                    <div className="setting-icon-wrap" style={{ background:"rgba(96,165,250,.08)" }}>
                      <span>📋</span>
                    </div>
                    <div className="setting-info">
                      <div className="setting-row-title">Active Sessions</div>
                      <div className="setting-row-desc">Manage devices logged into your account</div>
                    </div>
                    <button className="setting-btn-sm">View Sessions</button>
                  </div>
                </div>

                {/* Preferences */}
                <div className="settings-section">
                  <div className="settings-section-title">⚙ Preferences</div>
                  <div className="setting-row">
                    <div className="setting-icon-wrap" style={{ background:"rgba(74,222,128,.08)" }}>
                      <span>💱</span>
                    </div>
                    <div className="setting-info">
                      <div className="setting-row-title">Currency</div>
                      <div className="setting-row-desc">Currently set to Indian Rupee (₹)</div>
                    </div>
                    <button className="setting-btn-sm">₹ INR</button>
                  </div>
                  <div className="setting-row">
                    <div className="setting-icon-wrap" style={{ background:"rgba(74,222,128,.08)" }}>
                      <span>🌐</span>
                    </div>
                    <div className="setting-info">
                      <div className="setting-row-title">Language</div>
                      <div className="setting-row-desc">Currently set to English</div>
                    </div>
                    <button className="setting-btn-sm">English</button>
                  </div>
                </div>

                {/* Danger Zone */}
                <div className="danger-zone">
                  <div className="danger-title">⚠ Danger Zone</div>
                  <p className="danger-desc">
                    Permanently delete your account and all associated data. This action cannot be undone.
                  </p>
                  <button className="btn-danger"
                    onClick={() => { if (window.confirm("Are you sure? This cannot be undone.")) showToast("❌ Account deletion requested."); }}>
                    Delete My Account
                  </button>
                </div>
              </div>
            )}

          </main>
        </div>
      </div>
    </>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ProductCard({ order }: { order: MongoOrder }) {
  const sc = STATUS_COLORS[order.status] ?? STATUS_COLORS["Pending"];
  return (
    <div className="product-card">
      <div className="product-img-wrap">
        <span className="product-img-placeholder">🏗</span>
        <span className="product-status-pill"
          style={{ background: sc.bg, color: sc.color, border:`1px solid ${sc.color}30` }}>
          {order.status}
        </span>
      </div>
      <div className="product-body">
        <div className="product-name">{order.product}</div>
        <div className="product-meta">
          <span className="product-price">{order.amount}</span>
          <span className="product-date">{new Date(order.createdAt).toLocaleDateString("en-IN")}</span>
        </div>
        <div style={{ fontSize:"11px", color:"#666", marginBottom:"8px" }}>
          Qty: {order.quantity} · #{order.orderId}
        </div>
        <div className="product-actions">
          <button className="product-btn product-btn-primary">View Details</button>
          <button className="product-btn product-btn-outline">Buy Again</button>
        </div>
      </div>
    </div>
  );
}

function OrderItem({ order, expanded, onToggle }: { order: MongoOrder; expanded: boolean; onToggle: () => void }) {
  const sc       = STATUS_COLORS[order.status] ?? STATUS_COLORS["Pending"];
  const stageIdx = STATUS_TO_STAGE[order.status] ?? 0;
  const isCustom = order.isCustomized === true;

  const deliveryDate = order.status === "Delivered"
    ? new Date(new Date(order.createdAt).getTime() + 7 * 86400000).toLocaleDateString("en-IN",{ weekday:"long", day:"numeric", month:"long" })
    : new Date(new Date(order.createdAt).getTime() + 14 * 86400000).toLocaleDateString("en-IN",{ weekday:"long", day:"numeric", month:"long" });

  return (
    <div className="order-item">
      <div className="order-header" onClick={onToggle}>
        <div className="order-thumb">🏗</div>
        <div className="order-info">
          <div className="order-product">{order.product}</div>
          <div className="order-meta-row">
            <span className="order-id">{order.orderId}</span>
            <span className="order-price">{order.amount}</span>
            <span className="order-date">{new Date(order.createdAt).toLocaleDateString("en-IN")}</span>
            {isCustom && <span className="customized-tag">✦ Customized</span>}
            <span style={{ ...sc, padding:"2px 8px", borderRadius:"999px", fontSize:"10px",
              fontWeight:700, background: sc.bg, color: sc.color, border:`1px solid ${sc.color}30` }}>
              ● {order.status}
            </span>
          </div>
        </div>
        <span className={`order-chevron ${expanded ? "open" : ""}`}>⌄</span>
      </div>

      {expanded && (
        <div className="order-expanded">
          {/* Progress Tracker */}
          <div className="tracker-wrap">
            <div className="tracker-title">Order Progress</div>
            <div className="tracker-stages">
              {ORDER_STAGES.map((s, i) => (
                <div
                  key={s.key}
                  className={`tracker-stage ${i <= stageIdx ? "done" : ""} ${i === stageIdx ? "current" : ""}`}
                >
                  <div className="tracker-dot">{i <= stageIdx ? s.icon : "○"}</div>
                  <div className="tracker-label">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Details grid */}
          <div className="order-details-grid">
            <div className="detail-chip">
              <div className="detail-chip-label">Quantity</div>
              <div className="detail-chip-value">{order.quantity}</div>
            </div>
            <div className="detail-chip">
              <div className="detail-chip-label">Total Amount</div>
              <div className="detail-chip-value">{order.amount}</div>
            </div>
            <div className="detail-chip">
              <div className="detail-chip-label">Order Date</div>
              <div className="detail-chip-value">{new Date(order.createdAt).toLocaleDateString("en-IN",{ day:"numeric", month:"long", year:"numeric" })}</div>
            </div>
            <div className="detail-chip">
              <div className="detail-chip-label">{order.status === "Delivered" ? "Delivered On" : "Expected By"}</div>
              <div className="detail-chip-value" style={{ color: order.status === "Delivered" ? "#4ADE80" : "#FBbF24" }}>
                {deliveryDate}
              </div>
            </div>
          </div>

          {/* Customized details */}
          {isCustom && order.customDetails && (
            <div className="customized-details-box">
              <div className="custom-box-title">
                <span>✦</span> Customization Details
              </div>
              <div className="custom-row">
                {Object.entries(order.customDetails).map(([k, v]) => (
                  <div className="custom-field" key={k}>
                    <div className="custom-field-label">{k}</div>
                    <div className="custom-field-value">{v as string}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ProjectCard({ project }: { project: Project }) {
  const [expanded, setExpanded] = useState(false);
  const statusConf = {
    completed: { color:"#4ADE80", bg:"rgba(74,222,128,.12)", label:"✅ Completed" },
    ongoing:   { color:"#FBbF24", bg:"rgba(251,191,36,.12)",  label:"🔄 Ongoing"   },
    planning:  { color:"#60A5FA", bg:"rgba(96,165,250,.12)",  label:"📋 Planning"  },
  }[project.status];

  const progressColor = project.status === "completed" ? "#4ADE80"
    : project.status === "ongoing" ? "#4A90D9" : "#60A5FA";

  return (
    <div className="project-card">
      <div className="project-top">
        <div className="project-icon-wrap"
          style={{ background: project.type === "customized" ? "rgba(168,85,247,.12)" : "rgba(74,144,217,.1)" }}>
          {project.type === "customized" ? "✦" : "🏗"}
        </div>
        <div style={{ flex:1, minWidth:0 }}>
          <div className="project-name">{project.title}</div>
          <div className="project-desc">{project.description}</div>
          <div className="project-tags">
            <span className="project-tag"
              style={{ background: statusConf.bg, color: statusConf.color, border:`1px solid ${statusConf.color}30` }}>
              {statusConf.label}
            </span>
            {project.type === "customized" && (
              <span className="project-tag"
                style={{ background:"rgba(168,85,247,.12)", color:"#a855f7", border:"1px solid rgba(168,85,247,.25)" }}>
                ✦ Customized
              </span>
            )}
            <span className="project-tag"
              style={{ background:"rgba(74,144,217,.08)", color:"#4A90D9", border:"1px solid rgba(74,144,217,.2)" }}>
              💰 {project.value}
            </span>
          </div>
        </div>
      </div>

      <div className="project-meta">
        <span className="project-meta-item">📍 {project.location}</span>
        <span className="project-meta-item">📅 Started: {new Date(project.startDate).toLocaleDateString("en-IN",{ month:"short", year:"numeric" })}</span>
        {project.completedDate && (
          <span className="project-meta-item" style={{ color:"#4ADE80" }}>
            ✅ Completed: {new Date(project.completedDate).toLocaleDateString("en-IN",{ month:"short", year:"numeric" })}
          </span>
        )}
      </div>

      {/* Progress bar */}
      <div className="project-progress-wrap">
        <div className="project-progress-label">
          <span>Progress</span>
          <span style={{ color: progressColor, fontWeight:700 }}>{project.progress}%</span>
        </div>
        <div className="project-progress-bar">
          <div className="project-progress-fill"
            style={{ background:`linear-gradient(90deg,${progressColor},${progressColor}88)`, "--w":`${project.progress}%` } as React.CSSProperties} />
        </div>
      </div>

      {/* Customized details expandable */}
      {project.type === "customized" && project.customDetails && (
        <div className="project-custom-section">
          <button onClick={() => setExpanded(!expanded)} style={{
            background:"rgba(168,85,247,.08)", border:"1px solid rgba(168,85,247,.2)",
            color:"#a855f7", padding:"7px 14px", borderRadius:"8px", fontSize:"12px",
            fontWeight:600, cursor:"pointer", marginBottom: expanded ? "12px" : 0,
          }}>
            {expanded ? "▲ Hide" : "▼ View"} Customization Details
          </button>

          {expanded && (
            <div className="customized-details-box">
              <div className="custom-box-title"><span>✦</span> Finalized Customization</div>
              <div className="custom-row">
                {[
                  { label:"Specifications", val: project.customDetails.specifications },
                  { label:"Materials",       val: project.customDetails.materials      },
                  { label:"Agreed Terms",    val: project.customDetails.agreedTerms    },
                  { label:"Owner Notes",     val: project.customDetails.ownerNotes     },
                ].map(f => (
                  <div className="custom-field" key={f.label}>
                    <div className="custom-field-label">{f.label}</div>
                    <div className="custom-field-value">{f.val}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function MiniProjectRow({ project }: { project: Project }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:"12px", padding:"12px",
      background:"rgba(255,255,255,.02)", border:"1px solid rgba(255,255,255,.05)",
      borderRadius:"10px" }}>
      <div style={{ fontSize:"20px" }}>{project.type === "customized" ? "✦" : "🏗"}</div>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontSize:"13px", fontWeight:600, color:"#e8e8e8", marginBottom:"4px",
          whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{project.title}</div>
        <div style={{ height:"4px", background:"rgba(255,255,255,.06)", borderRadius:"999px", overflow:"hidden" }}>
          <div style={{ height:"100%", width:`${project.progress}%`, background:"linear-gradient(90deg,#4A90D9,#6ab0f5)", borderRadius:"999px" }} />
        </div>
      </div>
      <span style={{ fontSize:"12px", fontWeight:700, color:"#4A90D9" }}>{project.progress}%</span>
    </div>
  );
}

function ToggleSwitch({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button className={`setting-toggle ${on ? "on" : "off"}`} onClick={onToggle}>
      <div className="toggle-thumb" />
    </button>
  );
}

function EmptyState({ icon, text }: { icon: string; text: string }) {
  return (
    <div style={{ textAlign:"center", padding:"48px 24px" }}>
      <div style={{ fontSize:"40px", marginBottom:"12px" }}>{icon}</div>
      <p style={{ color:"#666", fontSize:"14px" }}>{text}</p>
    </div>
  );
}

