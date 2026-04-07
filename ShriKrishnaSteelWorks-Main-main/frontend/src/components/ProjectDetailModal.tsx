// src/components/ProjectDetailModal.tsx
// Reusable Project Detail Modal — inject any project data via props
import { useState, useEffect, useCallback } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────
export interface ProjectMaterial {
  name: string;
  quantity: string;
  unit: string;
  supplier: string;
  status: "Delivered" | "Pending" | "Partial";
}

export interface ProjectFinancial {
  totalBudget: number;
  amountSpent: number;
  pendingApprovals: number;
  currency?: string;
}

export interface ProjectUpdate {
  date: string;
  title: string;
  description: string;
  type?: "milestone" | "update" | "issue";
}

export interface TeamMember {
  role: string;
  name?: string;
  count?: number;
  phone?: string;
}

export interface ProjectDetailData {
  id: string;
  name: string;
  location: string;
  city: string;
  state: string;
  type: string;
  clientName: string;
  progress: number;
  startDate: string;
  expectedCompletion: string;
  status: "Ongoing" | "Completed" | "Planning" | "On Hold";
  description?: string;

  // Quick stats
  materialsCount: number;
  workersCount: number;
  updatesCount: number;
  pendingTasks: number;

  materials: ProjectMaterial[];
  financials: ProjectFinancial;
  updates: ProjectUpdate[];
  team: TeamMember[];
}

interface Props {
  project: ProjectDetailData;
  onClose: () => void;
}

type TabKey = "overview" | "materials" | "financials" | "updates" | "team";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (n: number, currency = "₹") =>
  `${currency}${n.toLocaleString("en-IN")}`;

const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  Ongoing:   { bg: "rgba(74,222,128,.12)",  color: "#4ADE80" },
  Completed: { bg: "rgba(74,144,217,.12)",  color: "#4A90D9" },
  Planning:  { bg: "rgba(251,191,36,.12)",  color: "#FBbF24" },
  "On Hold": { bg: "rgba(248,113,113,.12)", color: "#F87171" },
};

const MAT_STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  Delivered: { bg: "rgba(74,222,128,.15)", color: "#4ADE80" },
  Pending:   { bg: "rgba(248,113,113,.15)", color: "#F87171" },
  Partial:   { bg: "rgba(251,191,36,.15)",  color: "#FBbF24" },
};

const UPDATE_ICON: Record<string, string> = {
  milestone: "🏆",
  update:    "📌",
  issue:     "⚠️",
};

// ─── Inline CSS ───────────────────────────────────────────────────────────────
const MODAL_CSS = `
  @keyframes pdm-backdrop-in { from{opacity:0} to{opacity:1} }
  @keyframes pdm-modal-in    { from{opacity:0;transform:translateY(40px) scale(.96)} to{opacity:1;transform:translateY(0) scale(1)} }
  @keyframes pdm-bar-fill    { from{width:0} to{width:var(--pct)} }

  .pdm-backdrop {
    position:fixed; inset:0; z-index:9000;
    background:rgba(4,8,20,.85); backdrop-filter:blur(10px);
    display:flex; align-items:center; justify-content:center; padding:20px;
    animation:pdm-backdrop-in .2s ease;
  }
  .pdm-modal {
    background:linear-gradient(145deg,#0d1b3e,#0a1228);
    border:1px solid rgba(74,144,217,.2); border-radius:24px;
    width:100%; max-width:860px; max-height:90vh;
    display:flex; flex-direction:column; overflow:hidden;
    box-shadow:0 32px 80px rgba(0,0,0,.6), 0 0 0 1px rgba(74,144,217,.08);
    animation:pdm-modal-in .3s cubic-bezier(.34,1.56,.64,1);
  }

  /* Header */
  .pdm-header {
    padding:28px 32px 0;
    background:linear-gradient(180deg,rgba(74,144,217,.06) 0%,transparent 100%);
    border-bottom:1px solid rgba(255,255,255,.06);
    flex-shrink:0;
  }
  .pdm-header-top { display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:18px; gap:16px; }
  .pdm-project-name {
    font-family:'Rajdhani',sans-serif; font-size:26px; font-weight:700;
    color:#fff; line-height:1.2; margin-bottom:8px;
  }
  .pdm-meta-row { display:flex; flex-wrap:wrap; gap:14px; align-items:center; margin-bottom:4px; }
  .pdm-meta-chip {
    display:inline-flex; align-items:center; gap:5px;
    font-size:12px; color:#9aa5bc; font-weight:500;
  }
  .pdm-meta-chip svg { opacity:.7; }
  .pdm-status-badge {
    display:inline-flex; align-items:center; gap:5px;
    padding:4px 12px; border-radius:999px; font-size:11px; font-weight:700;
    letter-spacing:.04em; text-transform:uppercase;
  }
  .pdm-close {
    width:36px; height:36px; border-radius:10px; border:1px solid rgba(255,255,255,.1);
    background:rgba(255,255,255,.04); color:#aaa; font-size:18px;
    cursor:pointer; display:flex; align-items:center; justify-content:center;
    transition:all .2s; flex-shrink:0;
  }
  .pdm-close:hover { background:rgba(248,113,113,.12); border-color:rgba(248,113,113,.3); color:#F87171; }

  /* Tabs */
  .pdm-tabs { display:flex; gap:4px; padding:0 32px; margin-top:0; }
  .pdm-tab {
    padding:12px 18px; font-size:13px; font-weight:600; border:none;
    background:transparent; cursor:pointer; color:#666;
    border-bottom:2px solid transparent; transition:all .2s;
    font-family:'Inter',sans-serif; white-space:nowrap;
  }
  .pdm-tab:hover { color:#aaa; }
  .pdm-tab.active { color:#4A90D9; border-bottom-color:#4A90D9; }

  /* Body */
  .pdm-body { flex:1; overflow-y:auto; padding:28px 32px 32px; display:flex; flex-direction:column; gap:20px; }
  .pdm-body::-webkit-scrollbar { width:4px; }
  .pdm-body::-webkit-scrollbar-thumb { background:rgba(74,144,217,.2); border-radius:4px; }

  /* Cards */
  .pdm-card {
    background:rgba(255,255,255,.03); border:1px solid rgba(255,255,255,.07);
    border-radius:14px; padding:20px;
  }
  .pdm-card-title {
    font-family:'Rajdhani',sans-serif; font-size:15px; font-weight:700;
    color:#c8d6f0; margin-bottom:16px; display:flex; align-items:center; gap:8px;
    text-transform:uppercase; letter-spacing:.06em;
  }

  /* Progress */
  .pdm-progress-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; }
  .pdm-progress-label { font-size:13px; color:#9aa5bc; }
  .pdm-progress-pct { font-family:'Rajdhani',sans-serif; font-size:22px; font-weight:700; color:#4A90D9; }
  .pdm-progress-bar { height:10px; background:rgba(255,255,255,.07); border-radius:999px; overflow:hidden; }
  .pdm-progress-fill {
    height:100%; border-radius:999px;
    background:linear-gradient(90deg,#2f6aad,#4A90D9,#6ab0f5);
    --pct:0%; width:var(--pct); animation:pdm-bar-fill .9s .2s ease both;
  }

  /* Quick stats */
  .pdm-stats-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:12px; }
  .pdm-stat-card {
    background:rgba(255,255,255,.03); border:1px solid rgba(255,255,255,.07);
    border-radius:12px; padding:16px 14px; text-align:center;
  }
  .pdm-stat-val { font-family:'Rajdhani',sans-serif; font-size:26px; font-weight:700; color:#4A90D9; line-height:1; }
  .pdm-stat-lbl { font-size:11px; color:#666; margin-top:5px; }

  /* Info grid */
  .pdm-info-grid { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
  .pdm-info-item { background:rgba(255,255,255,.03); border:1px solid rgba(255,255,255,.06); border-radius:10px; padding:14px; }
  .pdm-info-label { font-size:10px; color:#666; text-transform:uppercase; letter-spacing:.07em; margin-bottom:5px; }
  .pdm-info-value { font-size:14px; color:#e2e8f0; font-weight:600; }

  /* Materials */
  .pdm-mat-table { width:100%; border-collapse:collapse; }
  .pdm-mat-table th { text-align:left; font-size:10px; color:#666; text-transform:uppercase; letter-spacing:.07em; padding:0 0 10px; font-weight:600; }
  .pdm-mat-table td { padding:12px 0; border-top:1px solid rgba(255,255,255,.05); vertical-align:middle; }
  .pdm-mat-name { font-size:13.5px; color:#e2e8f0; font-weight:600; }
  .pdm-mat-qty { font-size:13px; color:#9aa5bc; }
  .pdm-mat-supplier { font-size:12px; color:#666; }
  .pdm-mat-status { display:inline-block; padding:3px 10px; border-radius:999px; font-size:10px; font-weight:700; }

  /* Financials */
  .pdm-fin-big { display:grid; grid-template-columns:repeat(3,1fr); gap:14px; margin-bottom:20px; }
  .pdm-fin-card {
    border-radius:14px; padding:20px; text-align:center;
    border:1px solid transparent;
  }
  .pdm-fin-amount { font-family:'Rajdhani',sans-serif; font-size:24px; font-weight:700; line-height:1; margin-bottom:6px; }
  .pdm-fin-label { font-size:12px; opacity:.75; }
  .pdm-fin-bar-wrap { margin-top:8px; }
  .pdm-fin-bar-label { display:flex; justify-content:space-between; font-size:11px; color:#666; margin-bottom:6px; }
  .pdm-fin-bar-bg { height:8px; background:rgba(255,255,255,.07); border-radius:999px; overflow:hidden; display:flex; }
  .pdm-fin-bar-seg { height:100%; transition:width .8s ease; }

  /* Updates */
  .pdm-timeline { display:flex; flex-direction:column; gap:0; }
  .pdm-timeline-item { display:flex; gap:16px; position:relative; }
  .pdm-timeline-item:not(:last-child)::before {
    content:''; position:absolute; left:19px; top:38px; bottom:0;
    width:2px; background:rgba(74,144,217,.15);
  }
  .pdm-tl-dot {
    width:38px; height:38px; border-radius:50%; background:rgba(74,144,217,.1);
    border:2px solid rgba(74,144,217,.3); display:flex; align-items:center;
    justify-content:center; font-size:16px; flex-shrink:0; z-index:1;
  }
  .pdm-tl-content { flex:1; padding-bottom:22px; }
  .pdm-tl-date { font-size:11px; color:#666; margin-bottom:4px; }
  .pdm-tl-title { font-size:14px; font-weight:700; color:#e2e8f0; margin-bottom:3px; }
  .pdm-tl-desc { font-size:12.5px; color:#9aa5bc; line-height:1.55; }

  /* Team */
  .pdm-team-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(200px,1fr)); gap:12px; }
  .pdm-team-card {
    background:rgba(74,144,217,.06); border:1px solid rgba(74,144,217,.15);
    border-radius:14px; padding:18px; display:flex; align-items:flex-start; gap:12px;
    transition:border-color .2s;
  }
  .pdm-team-card:hover { border-color:rgba(74,144,217,.35); }
  .pdm-team-icon { width:40px; height:40px; border-radius:10px; background:rgba(74,144,217,.15); display:flex; align-items:center; justify-content:center; font-size:18px; flex-shrink:0; }
  .pdm-team-role { font-size:11px; color:#4A90D9; font-weight:700; text-transform:uppercase; letter-spacing:.06em; margin-bottom:4px; }
  .pdm-team-name { font-size:14px; color:#e2e8f0; font-weight:600; }
  .pdm-team-count { font-size:11px; color:#666; margin-top:2px; }
  .pdm-team-phone { font-size:11px; color:#666; margin-top:3px; }

  @media(max-width:640px) {
    .pdm-header { padding:20px 18px 0; }
    .pdm-tabs { padding:0 18px; overflow-x:auto; }
    .pdm-body { padding:18px; }
    .pdm-stats-grid { grid-template-columns:repeat(2,1fr); }
    .pdm-info-grid { grid-template-columns:1fr; }
    .pdm-fin-big { grid-template-columns:1fr; }
    .pdm-project-name { font-size:20px; }
  }
`;

const ROLE_ICON: Record<string, string> = {
  "Project Manager": "👷",
  "Site Engineer":   "🏗",
  "Supervisor":      "📋",
  "Welder":          "🔥",
  "Fabricator":      "⚙️",
  "Safety Officer":  "🦺",
  "Electrician":     "⚡",
  "Driver":          "🚛",
  "Accountant":      "💼",
  "default":         "👤",
};

// ─── Component ────────────────────────────────────────────────────────────────
export default function ProjectDetailModal({ project, onClose }: Props) {
  const [activeTab, setActiveTab] = useState<TabKey>("overview");

  // Close on Escape
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  }, [onClose]);

  const statusStyle = STATUS_STYLE[project.status] ?? { bg: "rgba(100,100,100,.12)", color: "#aaa" };
  const { totalBudget, amountSpent, pendingApprovals, currency = "₹" } = project.financials;
  const remaining = totalBudget - amountSpent - pendingApprovals;
  const spentPct   = Math.round((amountSpent / totalBudget) * 100);
  const pendingPct = Math.round((pendingApprovals / totalBudget) * 100);
  const remPct     = Math.max(0, 100 - spentPct - pendingPct);

  const TABS: { key: TabKey; label: string; icon: string }[] = [
    { key: "overview",   label: "Overview",   icon: "📊" },
    { key: "materials",  label: "Materials",  icon: "🧱" },
    { key: "financials", label: "Financials", icon: "💰" },
    { key: "updates",    label: "Updates",    icon: "📅" },
    { key: "team",       label: "Team",       icon: "👥" },
  ];

  return (
    <>
      <style>{MODAL_CSS}</style>
      <div className="pdm-backdrop" onClick={handleBackdropClick}>
        <div className="pdm-modal">

          {/* ── HEADER ── */}
          <div className="pdm-header">
            <div className="pdm-header-top">
              <div style={{ minWidth: 0 }}>
                <div className="pdm-project-name">{project.name}</div>
                <div className="pdm-meta-row">
                  <span className="pdm-meta-chip">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/></svg>
                    {project.city}, {project.state}
                  </span>
                  <span className="pdm-meta-chip">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
                    {project.type}
                  </span>
                  <span className="pdm-meta-chip">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    {project.clientName}
                  </span>
                  <span className="pdm-status-badge" style={{ background: statusStyle.bg, color: statusStyle.color }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: statusStyle.color, display: "inline-block" }} />
                    {project.status}
                  </span>
                </div>
              </div>
              <button className="pdm-close" onClick={onClose} aria-label="Close">✕</button>
            </div>

            {/* Tabs */}
            <div className="pdm-tabs">
              {TABS.map(t => (
                <button
                  key={t.key}
                  className={`pdm-tab ${activeTab === t.key ? "active" : ""}`}
                  onClick={() => setActiveTab(t.key)}
                >
                  {t.icon} {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* ── BODY ── */}
          <div className="pdm-body">

            {/* ── TAB 1: OVERVIEW ── */}
            {activeTab === "overview" && (
              <>
                {/* Progress */}
                <div className="pdm-card">
                  <div className="pdm-card-title">🔧 Project Progress</div>
                  <div className="pdm-progress-header">
                    <span className="pdm-progress-label">Overall Completion</span>
                    <span className="pdm-progress-pct">{project.progress}%</span>
                  </div>
                  <div className="pdm-progress-bar">
                    <div className="pdm-progress-fill" style={{ "--pct": `${project.progress}%` } as React.CSSProperties} />
                  </div>
                </div>

                {/* Date + Status info */}
                <div className="pdm-info-grid">
                  <div className="pdm-info-item">
                    <div className="pdm-info-label">📅 Start Date</div>
                    <div className="pdm-info-value">{new Date(project.startDate).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</div>
                  </div>
                  <div className="pdm-info-item">
                    <div className="pdm-info-label">🏁 Expected Completion</div>
                    <div className="pdm-info-value">{new Date(project.expectedCompletion).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</div>
                  </div>
                  <div className="pdm-info-item" style={{ gridColumn: "1/-1" }}>
                    <div className="pdm-info-label">📝 Description</div>
                    <div className="pdm-info-value" style={{ fontWeight: 400, color: "#9aa5bc", fontSize: "13px" }}>
                      {project.description || "No description provided."}
                    </div>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="pdm-card">
                  <div className="pdm-card-title">⚡ Quick Stats</div>
                  <div className="pdm-stats-grid">
                    {[
                      { val: project.materialsCount, lbl: "Materials",    color: "#4A90D9" },
                      { val: project.workersCount,   lbl: "Workers",      color: "#4ADE80" },
                      { val: project.updatesCount,   lbl: "Updates",      color: "#FBbF24" },
                      { val: project.pendingTasks,   lbl: "Pending Tasks", color: "#F87171" },
                    ].map(s => (
                      <div className="pdm-stat-card" key={s.lbl}>
                        <div className="pdm-stat-val" style={{ color: s.color }}>{s.val}</div>
                        <div className="pdm-stat-lbl">{s.lbl}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* ── TAB 2: MATERIALS ── */}
            {activeTab === "materials" && (
              <div className="pdm-card">
                <div className="pdm-card-title">🧱 Materials List ({project.materials.length})</div>
                {project.materials.length === 0
                  ? <p style={{ color: "#666", fontSize: "13px" }}>No materials listed yet.</p>
                  : (
                    <table className="pdm-mat-table">
                      <thead>
                        <tr>
                          <th>Material</th>
                          <th>Quantity</th>
                          <th>Supplier</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {project.materials.map((m, i) => {
                          const ms = MAT_STATUS_STYLE[m.status] ?? { bg: "#333", color: "#aaa" };
                          return (
                            <tr key={i}>
                              <td><div className="pdm-mat-name">{m.name}</div></td>
                              <td><div className="pdm-mat-qty">{m.quantity} {m.unit}</div></td>
                              <td><div className="pdm-mat-supplier">{m.supplier}</div></td>
                              <td>
                                <span className="pdm-mat-status" style={{ background: ms.bg, color: ms.color }}>
                                  {m.status}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )
                }
              </div>
            )}

            {/* ── TAB 3: FINANCIALS ── */}
            {activeTab === "financials" && (
              <>
                <div className="pdm-fin-big">
                  {/* Total */}
                  <div className="pdm-fin-card" style={{ background: "rgba(74,144,217,.07)", borderColor: "rgba(74,144,217,.2)" }}>
                    <div className="pdm-fin-amount" style={{ color: "#4A90D9" }}>{fmt(totalBudget, currency)}</div>
                    <div className="pdm-fin-label" style={{ color: "#4A90D9" }}>Total Budget</div>
                  </div>
                  {/* Spent */}
                  <div className="pdm-fin-card" style={{ background: "rgba(248,113,113,.07)", borderColor: "rgba(248,113,113,.2)" }}>
                    <div className="pdm-fin-amount" style={{ color: "#F87171" }}>{fmt(amountSpent, currency)}</div>
                    <div className="pdm-fin-label" style={{ color: "#F87171" }}>Amount Spent</div>
                  </div>
                  {/* Remaining */}
                  <div className="pdm-fin-card" style={{ background: "rgba(74,222,128,.07)", borderColor: "rgba(74,222,128,.2)" }}>
                    <div className="pdm-fin-amount" style={{ color: "#4ADE80" }}>{fmt(remaining > 0 ? remaining : 0, currency)}</div>
                    <div className="pdm-fin-label" style={{ color: "#4ADE80" }}>Remaining</div>
                  </div>
                </div>

                <div className="pdm-card">
                  <div className="pdm-card-title">📊 Budget Breakdown</div>
                  <div className="pdm-fin-bar-wrap">
                    <div className="pdm-fin-bar-label">
                      <span>🔴 Spent {spentPct}%</span>
                      <span>🟡 Pending {pendingPct}%</span>
                      <span>🟢 Remaining {remPct}%</span>
                    </div>
                    <div className="pdm-fin-bar-bg">
                      <div className="pdm-fin-bar-seg" style={{ width: `${spentPct}%`, background: "#F87171" }} />
                      <div className="pdm-fin-bar-seg" style={{ width: `${pendingPct}%`, background: "#FBbF24" }} />
                      <div className="pdm-fin-bar-seg" style={{ width: `${remPct}%`, background: "#4ADE80" }} />
                    </div>
                  </div>
                </div>

                <div className="pdm-card">
                  <div className="pdm-card-title">⏳ Pending Approvals</div>
                  <div className="pdm-info-grid">
                    <div className="pdm-info-item">
                      <div className="pdm-info-label">Approval Amount</div>
                      <div className="pdm-info-value" style={{ color: "#FBbF24" }}>{fmt(pendingApprovals, currency)}</div>
                    </div>
                    <div className="pdm-info-item">
                      <div className="pdm-info-label">% of Total Budget</div>
                      <div className="pdm-info-value" style={{ color: "#FBbF24" }}>{pendingPct}%</div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* ── TAB 4: UPDATES ── */}
            {activeTab === "updates" && (
              <div className="pdm-card">
                <div className="pdm-card-title">📅 Project Timeline</div>
                {project.updates.length === 0
                  ? <p style={{ color: "#666", fontSize: "13px" }}>No updates recorded yet.</p>
                  : (
                    <div className="pdm-timeline">
                      {[...project.updates].reverse().map((u, i) => (
                        <div className="pdm-timeline-item" key={i}>
                          <div className="pdm-tl-dot">{UPDATE_ICON[u.type ?? "update"]}</div>
                          <div className="pdm-tl-content">
                            <div className="pdm-tl-date">{new Date(u.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</div>
                            <div className="pdm-tl-title">{u.title}</div>
                            <div className="pdm-tl-desc">{u.description}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                }
              </div>
            )}

            {/* ── TAB 5: TEAM ── */}
            {activeTab === "team" && (
              <div className="pdm-card">
                <div className="pdm-card-title">👥 Project Team ({project.team.length} roles)</div>
                {project.team.length === 0
                  ? <p style={{ color: "#666", fontSize: "13px" }}>No team members listed.</p>
                  : (
                    <div className="pdm-team-grid">
                      {project.team.map((m, i) => (
                        <div className="pdm-team-card" key={i}>
                          <div className="pdm-team-icon">{ROLE_ICON[m.role] ?? ROLE_ICON.default}</div>
                          <div>
                            <div className="pdm-team-role">{m.role}</div>
                            {m.name && <div className="pdm-team-name">{m.name}</div>}
                            {m.count && <div className="pdm-team-count">{m.count} person{m.count > 1 ? "s" : ""}</div>}
                            {m.phone && <div className="pdm-team-phone">📞 {m.phone}</div>}
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                }
              </div>
            )}

          </div>
        </div>
      </div>
    </>
  );
}
