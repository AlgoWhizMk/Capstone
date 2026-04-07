import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

// ─── InView Hook ─────────────────────────────────────────────────────────────
function useInView(threshold = 0.08) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setInView(true); },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}

// ─── Types ────────────────────────────────────────────────────────────────────
interface Project {
  id: number;
  name: string;
  location: string;
  district: string;
  category: string;
  budget: string;
  progress: number;
  status: "Ongoing" | "Completed" | "Planning";
  workers: number;
  startDate: string;
  targetDate: string;
  client: string;
  steelUsed: string;
  area: string;
  images: string[];
  tags: string[];
  description: string;
  highlights: string[];
}

// ─── Data ─────────────────────────────────────────────────────────────────────
const PROJECTS: Project[] = [
  {
    id: 1,
    name: "Nagpur Industrial Warehouse Complex",
    location: "MIDC Butibori, Nagpur",
    district: "Nagpur",
    category: "Industrial",
    budget: "₹4.2 Cr",
    progress: 74,
    status: "Ongoing",
    workers: 128,
    startDate: "Jan 2024",
    targetDate: "Oct 2025",
    client: "Nagpur Industrial Corp Ltd.",
    steelUsed: "315 MT",
    area: "2.4 Lakh sq ft",
    images: [
      "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=900&q=80",
      "https://images.unsplash.com/photo-1565008447742-97f6f38c985c?w=900&q=80",
      "https://images.unsplash.com/photo-1590859808308-3d2d9c515b1a?w=900&q=80",
    ],
    tags: ["TMT Fe500D", "Structural Sections", "Fabrication"],
    description: "Large-scale industrial warehouse development with 12 bays covering 2.4 lakh sq ft. Complete structural steel fabrication, erection, and roofing by ShriKrishnaSteelWorks.",
    highlights: ["12 warehouse bays", "Zero-defect structural erection", "ISO-compliant quality process", "On-site fabrication unit deployed"],
  },
  {
    id: 2,
    name: "Pune Metro Rail Station Structure",
    location: "Pimpri-Chinchwad, Pune",
    district: "Pune",
    category: "Infrastructure",
    budget: "₹9.8 Cr",
    progress: 91,
    status: "Ongoing",
    workers: 342,
    startDate: "Mar 2023",
    targetDate: "Dec 2024",
    client: "Pune Metro Rail Corporation",
    steelUsed: "625 MT",
    area: "3 Stations",
    images: [
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=900&q=80",
      "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=900&q=80",
      "https://images.unsplash.com/photo-1518709766631-a6a7f45921c3?w=900&q=80",
    ],
    tags: ["ISMB Beams", "TMT Fe550D", "Canopy Structure"],
    description: "Structural steel supply and fabrication for 3 metro stations on Pune Metro Line 2. Includes canopy structures, platform framing, and station roofing systems.",
    highlights: ["3 metro stations", "Seismic-resistant design", "Night-shift delivery schedule", "625 MT steel supplied"],
  },
  {
    id: 4,
    name: "Amravati Commercial Tower Frame",
    location: "Badnera Road, Amravati",
    district: "Amravati",
    category: "Commercial",
    budget: "₹3.6 Cr",
    progress: 55,
    status: "Ongoing",
    workers: 96,
    startDate: "Aug 2024",
    targetDate: "Jun 2025",
    client: "Amravati Builders Consortium",
    steelUsed: "220 MT",
    area: "68,000 sq ft",
    images: [
      "https://images.unsplash.com/photo-1590859808308-3d2d9c515b1a?w=900&q=80",
      "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=900&q=80",
      "https://images.unsplash.com/photo-1581093450021-4a7360e9a6b5?w=900&q=80",
    ],
    tags: ["TMT Fe500", "Steel Columns", "Composite Slabs"],
    description: "G+8 commercial tower with full structural steel framework. Custom-designed composite floor system with integrated TMT rebar and structural steel columns.",
    highlights: ["G+8 composite frame", "Custom column design", "BIM-integrated erection", "220 MT structural steel"],
  },
  {
    id: 6,
    name: "Latur Bridge Approach Structure",
    location: "Udgir Road, Latur",
    district: "Latur",
    category: "Infrastructure",
    budget: "₹5.2 Cr",
    progress: 30,
    status: "Planning",
    workers: 0,
    startDate: "Mar 2025",
    targetDate: "Dec 2025",
    client: "Maharashtra PWD",
    steelUsed: "380 MT (est.)",
    area: "Bridge span: 140m",
    images: [
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=900&q=80",
      "https://images.unsplash.com/photo-1590859808308-3d2d9c515b1a?w=900&q=80",
      "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=900&q=80",
    ],
    tags: ["Bridge Steel", "IS 2062 E350", "Corrosion Resistant"],
    description: "Steel supply and erection for a 140m approach bridge on Udgir Road. Corrosion-resistant IS 2062 E350 grade steel with protective coating system as per IRC standards.",
    highlights: ["140m span bridge approach", "IS 2062 E350 high-strength", "IRC-compliant design", "380 MT estimated supply"],
  },
  {
    id: 3,
    name: "Aurangabad Pharma Plant Fabrication",
    location: "MIDC Waluj, Aurangabad",
    district: "Chhatrapati Sambhajinagar",
    category: "Pharmaceutical",
    budget: "₹2.1 Cr",
    progress: 100,
    status: "Completed",
    workers: 87,
    startDate: "Sep 2022",
    targetDate: "Apr 2023",
    client: "Aurangabad BioPharm Pvt. Ltd.",
    steelUsed: "70 MT",
    area: "42,000 sq ft",
    images: [
      "https://images.unsplash.com/photo-1581093450021-4a7360e9a6b5?w=900&q=80",
      "https://images.unsplash.com/photo-1565016791693-3b8bd09aa3cd?w=900&q=80",
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=900&q=80",
    ],
    tags: ["SS 316L Pipes", "Custom Fabrication", "GMP Grade"],
    description: "Complete structural and process steel fabrication for a pharmaceutical manufacturing facility. Delivered ahead of schedule with zero quality rejections under GMP standards.",
    highlights: ["Delivered ahead of schedule", "Zero QC rejections", "GMP-compliant fabrication", "SS 316L grade throughout"],
  },
  {
    id: 5,
    name: "Nashik Food Processing Shed",
    location: "Satpur MIDC, Nashik",
    district: "Nashik",
    category: "Industrial",
    budget: "₹1.4 Cr",
    progress: 100,
    status: "Completed",
    workers: 54,
    startDate: "Feb 2022",
    targetDate: "Jul 2022",
    client: "Nashik AgroFoods Pvt. Ltd.",
    steelUsed: "95 MT",
    area: "28,000 sq ft",
    images: [
      "https://images.unsplash.com/photo-1565016791693-3b8bd09aa3cd?w=900&q=80",
      "https://images.unsplash.com/photo-1518709766631-a6a7f45921c3?w=900&q=80",
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=900&q=80",
    ],
    tags: ["Pre-Engineered", "Roofing Steel", "Structural Angles"],
    description: "Pre-engineered steel structure for a food processing unit with hygienic-grade internal finishing requirements and seismic zone III compliance.",
    highlights: ["Pre-engineered PEB structure", "Seismic Zone III compliant", "5-month delivery", "Hygienic-grade interior"],
  },
];

// Stats are defined in case we need to render them in the future.
// const STATS: {
//   value: string;
//   label: string;
//   icon: string;
// }[] = [
//   { value: "₹26Cr+", label: "Total Project Value", icon: "💰" },
//   { value: "200+", label: "Projects Delivered", icon: "🏗️" },
//   { value: "6", label: "Districts Covered", icon: "📍" },
//   { value: "1705 MT", label: "Steel Supplied", icon: "⚙️" },
// ];

const ONGOING = PROJECTS.filter(p => p.status === "Ongoing" || p.status === "Planning");
const COMPLETED = PROJECTS.filter(p => p.status === "Completed");

// ─── Modal ────────────────────────────────────────────────────────────────────
function ProjectModal({ project, onClose }: { project: Project; onClose: () => void }) {
  const [imgIdx, setImgIdx] = useState(0);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const changeImg = (i: number) => {
    setFading(true);
    setTimeout(() => { setImgIdx(i); setFading(false); }, 220);
  };

  const statusColor =
    project.status === "Completed" ? "#4ADE80" :
      project.status === "Ongoing" ? "#4A90D9" : "#E8B84B";

  const statusLabel =
    project.status === "Completed" ? "✓ Completed" :
      project.status === "Ongoing" ? "● Ongoing" : "◐ Planning";

  return (
    <div className="prj-modal-overlay" onClick={onClose}>
      <div className="prj-modal" onClick={e => e.stopPropagation()}>
        <button className="prj-modal-close" onClick={onClose}>✕</button>

        <div className="prj-modal-gallery">
          <img src={project.images[imgIdx]} alt={project.name} className={`prj-modal-main-img ${fading ? "prj-img-fade" : ""}`} />
          <div className="prj-modal-gallery-overlay" />
          <div className="prj-modal-img-badge" style={{ background: `${statusColor}22`, borderColor: `${statusColor}55`, color: statusColor }}>{statusLabel}</div>
          <div className="prj-modal-cat-pill">{project.category}</div>
          <div className="prj-modal-thumbs">
            {project.images.map((img, i) => (
              <button key={i} className={`prj-modal-thumb ${i === imgIdx ? "prj-thumb-active" : ""}`} onClick={() => changeImg(i)}>
                <img src={img} alt="" />
              </button>
            ))}
          </div>
        </div>

        <div className="prj-modal-content">
          <div className="prj-modal-header">
            <div>
              <h2 className="prj-modal-title">{project.name}</h2>
              <div className="prj-modal-loc">📍 {project.location}</div>
            </div>
            <div className="prj-modal-budget">{project.budget}</div>
          </div>

          <p className="prj-modal-desc">{project.description}</p>

          <div className="prj-modal-grid">
            {[
              { label: "Client", value: project.client },
              { label: "Steel Used", value: project.steelUsed },
              { label: "Area / Scope", value: project.area },
              { label: "Workers", value: project.workers > 0 ? `${project.workers} deployed` : "TBD" },
              { label: "Start Date", value: project.startDate },
              { label: "Target Date", value: project.targetDate },
            ].map(({ label, value }) => (
              <div key={label} className="prj-modal-info-item">
                <div className="prj-modal-info-label">{label}</div>
                <div className="prj-modal-info-val">{value}</div>
              </div>
            ))}
          </div>

          <div className="prj-modal-progress-section">
            <div className="prj-modal-prog-header">
              <span>Overall Progress</span>
              <span style={{ color: statusColor }}>{project.progress}%</span>
            </div>
            <div className="prj-modal-prog-track">
              <div className="prj-modal-prog-fill" style={{ width: `${project.progress}%`, background: statusColor }} />
            </div>
          </div>

          <div className="prj-modal-highlights">
            <div className="prj-modal-hl-label">Project Highlights</div>
            <div className="prj-modal-hl-grid">
              {project.highlights.map((h, i) => (
                <div key={i} className="prj-modal-hl-item">
                  <span className="prj-hl-icon">✦</span><span>{h}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="prj-modal-tags">
            {project.tags.map(t => <span key={t} className="prj-tag">{t}</span>)}
          </div>

          <Link to="/contact" className="skw-btn-primary" onClick={onClose} style={{ display: "inline-flex", marginTop: "0.5rem" }}>
            Enquire About Similar Project →
          </Link>
        </div>
      </div>
    </div>
  );
}

// ─── Ongoing Card — larger, more dramatic ────────────────────────────────────
function OngoingCard({ project, index, inView, onOpen }: {
  project: Project; index: number; inView: boolean; onOpen: (p: Project) => void;
}) {
  const [hovered, setHovered] = useState(false);
  const isPlanning = project.status === "Planning";
  const accentColor = isPlanning ? "#E8B84B" : "#4A90D9";
  const statusLabel = isPlanning ? "◐ Planning" : "● Live";

  return (
    <div
      className={`ong-card ${inView ? "ong-card-visible" : ""}`}
      style={{ animationDelay: `${index * 0.14}s`, "--ong-color": accentColor } as React.CSSProperties}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="ong-img-panel">
        <img
          src={project.images[0]}
          alt={project.name}
          className={`ong-img ${hovered ? "ong-img-zoom" : ""}`}
        />
        <div className="ong-img-overlay" />
        <div className="ong-live-badge" style={{ color: accentColor, borderColor: `${accentColor}55`, background: `${accentColor}15` }}>
          {!isPlanning && <span className="ong-live-dot" style={{ background: accentColor }} />}
          {statusLabel}
        </div>
        <div className="ong-cat">{project.category}</div>
        <div className="ong-district">{project.district}</div>
      </div>

      <div className="ong-details">
        <div className="ong-top">
          <div>
            <h3 className="ong-title">{project.name}</h3>
            <div className="ong-location">📍 {project.location}</div>
          </div>
          <div className="ong-budget">{project.budget}</div>
        </div>

        <p className="ong-desc">{project.description}</p>

        <div className="ong-meta-row">
          <div className="ong-meta-chip"><span>⚙️</span><span>{project.steelUsed}</span></div>
          <div className="ong-meta-chip"><span>👷</span><span>{project.workers > 0 ? `${project.workers} workers` : "Mobilising"}</span></div>
          <div className="ong-meta-chip"><span>📐</span><span>{project.area}</span></div>
          <div className="ong-meta-chip"><span>📅</span><span>Target: {project.targetDate}</span></div>
        </div>

        <div className="ong-progress-wrap">
          <div className="ong-prog-header">
            <span className="ong-prog-label">Construction Progress</span>
            <span className="ong-prog-pct" style={{ color: accentColor }}>{project.progress}%</span>
          </div>
          <div className="ong-prog-track">
            <div
              className={`ong-prog-fill ${inView ? "ong-prog-animate" : ""}`}
              style={{
                "--prog-w": `${project.progress}%`,
                background: `linear-gradient(90deg, ${accentColor}88, ${accentColor})`,
                animationDelay: `${0.5 + index * 0.14}s`,
              } as React.CSSProperties}
            />
            {!isPlanning && (
              <div
                className="ong-prog-tip"
                style={{ left: `${project.progress}%`, background: accentColor, boxShadow: `0 0 8px ${accentColor}` }}
              />
            )}
          </div>
          <div className="ong-milestones">
            {["25%", "50%", "75%", "100%"].map((m, i) => (
              <div key={m} className="ong-milestone" style={{ left: `${(i + 1) * 25}%` }}>
                <div className="ong-ms-tick" />
                <div className="ong-ms-label">{m}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="ong-footer">
          <div className="ong-tags">
            {project.tags.map(t => <span key={t} className="prj-tag-sm">{t}</span>)}
          </div>
          <button className="ong-cta" onClick={() => onOpen(project)}>
            Full Details
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Completed Card ───────────────────────────────────────────────────────────
function CompletedCard({ project, index, inView, onOpen }: {
  project: Project; index: number; inView: boolean; onOpen: (p: Project) => void;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className={`cmp-card ${inView ? "cmp-card-visible" : ""}`}
      style={{ animationDelay: `${index * 0.13}s` }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="cmp-img-wrap">
        <img src={project.images[0]} alt={project.name} className={`cmp-img ${hovered ? "cmp-img-zoom" : ""}`} />
        <div className="cmp-img-overlay" />
        <div className="cmp-ribbon"><span className="cmp-ribbon-check">✓</span>Completed</div>
        <div className="cmp-cat">{project.category}</div>
        <div className={`cmp-hover-panel ${hovered ? "cmp-hover-visible" : ""}`}>
          <div className="cmp-hover-stat">
            <span className="cmp-hs-icon">⚙️</span>
            <span className="cmp-hs-val">{project.steelUsed}</span>
            <span className="cmp-hs-label">Steel Used</span>
          </div>
          <div className="cmp-hover-divider" />
          <div className="cmp-hover-stat">
            <span className="cmp-hs-icon">📐</span>
            <span className="cmp-hs-val">{project.area}</span>
            <span className="cmp-hs-label">Scope</span>
          </div>
          <div className="cmp-hover-divider" />
          <div className="cmp-hover-stat">
            <span className="cmp-hs-icon">👷</span>
            <span className="cmp-hs-val">{project.workers}</span>
            <span className="cmp-hs-label">Workers</span>
          </div>
        </div>
      </div>

      <div className="cmp-body">
        <div className="cmp-header-row">
          <div>
            <h3 className="cmp-title">{project.name}</h3>
            <div className="cmp-location">📍 {project.location}</div>
          </div>
          <div className="cmp-budget-pill">{project.budget}</div>
        </div>
        <div className="cmp-timeline-row">
          <div className="cmp-tl-item">
            <span className="cmp-tl-label">Started</span>
            <span className="cmp-tl-val">{project.startDate}</span>
          </div>
          <div className="cmp-tl-arrow">→</div>
          <div className="cmp-tl-item">
            <span className="cmp-tl-label">Delivered</span>
            <span className="cmp-tl-val cmp-tl-green">{project.targetDate}</span>
          </div>
        </div>
        <div className="cmp-highlights">
          {project.highlights.slice(0, 2).map((h, i) => (
            <div key={i} className="cmp-hl-item">
              <span className="cmp-hl-dot" />
              <span>{h}</span>
            </div>
          ))}
        </div>
        <div className="cmp-footer">
          <div className="cmp-tags">
            {project.tags.slice(0, 2).map(t => <span key={t} className="prj-tag-sm">{t}</span>)}
          </div>
          <button className="cmp-cta" onClick={() => onOpen(project)}>Case Study →</button>
        </div>
      </div>
    </div>
  );
}

// ─── Map Project Data ─────────────────────────────────────────────────────────
const MAP_PROJECTS = [
  {
    id: 1,
    name: "Nagpur Industrial Warehouse Complex",
    location: "MIDC Butibori, Nagpur, Maharashtra",
    city: "Nagpur",
    progress: 74,
    startDate: "Jan 2024",
    expectedCompletion: "Oct 2025",
    type: "Industrial",
    client: "Nagpur Industrial Corp Ltd.",
    coordinates: [21.1458, 79.0882] as [number, number],
    budget: "₹4.2 Cr",
    steelUsed: "315 MT",
    workers: 128,
    status: "Ongoing" as const,
  },
  {
    id: 2,
    name: "Pune Metro Rail Station Structure",
    location: "Pimpri-Chinchwad, Pune, Maharashtra",
    city: "Pune",
    progress: 91,
    startDate: "Mar 2023",
    expectedCompletion: "Dec 2024",
    type: "Infrastructure",
    client: "Pune Metro Rail Corporation",
    coordinates: [18.5204, 73.8567] as [number, number],
    budget: "₹9.8 Cr",
    steelUsed: "625 MT",
    workers: 342,
    status: "Ongoing" as const,
  },
  {
    id: 3,
    name: "Aurangabad Pharma Plant Fabrication",
    location: "MIDC Waluj, Aurangabad, Maharashtra",
    city: "Aurangabad",
    progress: 100,
    startDate: "Sep 2022",
    expectedCompletion: "Apr 2023",
    type: "Pharmaceutical",
    client: "Aurangabad BioPharm Pvt. Ltd.",
    coordinates: [19.8762, 75.3433] as [number, number],
    budget: "₹2.1 Cr",
    steelUsed: "70 MT",
    workers: 87,
    status: "Completed" as const,
  },
  {
    id: 4,
    name: "Amravati Commercial Tower Frame",
    location: "Badnera Road, Amravati, Maharashtra",
    city: "Amravati",
    progress: 55,
    startDate: "Aug 2024",
    expectedCompletion: "Jun 2025",
    type: "Commercial",
    client: "Amravati Builders Consortium",
    coordinates: [20.9320, 77.7523] as [number, number],
    budget: "₹3.6 Cr",
    steelUsed: "220 MT",
    workers: 96,
    status: "Ongoing" as const,
  },
  {
    id: 5,
    name: "Nashik Food Processing Shed",
    location: "Satpur MIDC, Nashik, Maharashtra",
    city: "Nashik",
    progress: 100,
    startDate: "Feb 2022",
    expectedCompletion: "Jul 2022",
    type: "Industrial",
    client: "Nashik AgroFoods Pvt. Ltd.",
    coordinates: [19.9975, 73.7898] as [number, number],
    budget: "₹1.4 Cr",
    steelUsed: "95 MT",
    workers: 54,
    status: "Completed" as const,
  },
  {
    id: 6,
    name: "Latur Bridge Approach Structure",
    location: "Udgir Road, Latur, Maharashtra",
    city: "Latur",
    progress: 30,
    startDate: "Mar 2025",
    expectedCompletion: "Dec 2025",
    type: "Infrastructure",
    client: "Maharashtra PWD",
    coordinates: [18.4088, 76.5604] as [number, number],
    budget: "₹5.2 Cr",
    steelUsed: "380 MT (est.)",
    workers: 0,
    status: "Planning" as const,
  },
];

/** Leaflet CDN loads `window.L` at runtime; types cover only what this map uses. */
interface LeafletMapInstance {
  remove: () => void;
}
interface LeafletMarker {
  addTo: (map: unknown) => LeafletMarker;
  bindPopup: (html: string, opts: { maxWidth?: number; className?: string }) => LeafletMarker;
  on: (ev: string, fn: () => void) => void;
  openPopup: () => void;
}
interface LeafletAPI {
  map: (el: HTMLElement, opts: { zoomControl?: boolean; scrollWheelZoom?: boolean }) => LeafletMapInstance & {
    setView: (c: [number, number], z: number) => unknown;
  };
  tileLayer: (url: string, opts: { attribution?: string; maxZoom?: number }) => { addTo: (m: unknown) => unknown };
  divIcon: (opts: Record<string, unknown>) => unknown;
  marker: (coords: [number, number], opts: { icon: unknown }) => LeafletMarker;
}

declare global {
  interface Window {
    L?: LeafletAPI;
    skwOpenProject?: (projectId: number) => void;
  }
}

// ─── Maharashtra Map Component ────────────────────────────────────────────────
function MaharashtraMap({ inView }: { inView: boolean }) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<LeafletMapInstance | null>(null);
  const [selectedMapProject, setSelectedMapProject] = useState<typeof MAP_PROJECTS[0] | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  const statusColor = (s: string) =>
    s === "Completed" ? "#4ADE80" : s === "Ongoing" ? "#4A90D9" : "#E8B84B";

  const statusLabel = (s: string) =>
    s === "Completed" ? "✓ Completed" : s === "Ongoing" ? "● Ongoing" : "◐ Planning";

  const typeColor = (t: string) => {
    const map: Record<string, string> = {
      "Industrial": "#F97316",
      "Infrastructure": "#4A90D9",
      "Commercial": "#A78BFA",
      "Pharmaceutical": "#4ADE80",
    };
    return map[t] || "#4A90D9";
  };

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const linkEl = document.createElement("link");
    linkEl.rel = "stylesheet";
    linkEl.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    document.head.appendChild(linkEl);

    const scriptEl = document.createElement("script");
    scriptEl.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    scriptEl.onload = () => {
      if (!mapRef.current || mapInstanceRef.current) return;
      const L = window.L;
      if (!L) return;

      const map = L.map(mapRef.current, {
        zoomControl: true,
        scrollWheelZoom: true,
      }).setView([19.7515, 75.7139], 7);

      L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        { attribution: "© OpenStreetMap contributors", maxZoom: 19 }
      ).addTo(map);

      // No border polygon — markers only

      // Custom pulsing marker icons
      MAP_PROJECTS.forEach((project, index) => {
        const col = statusColor(project.status);
        const isOngoing = project.status === "Ongoing";

        const markerIcon = L.divIcon({
          html: `
            <div style="position:relative;width:40px;height:40px;display:flex;align-items:center;justify-content:center;">
              ${isOngoing ? `
                <div style="
                  position:absolute;width:36px;height:36px;
                  background:${col};border-radius:50%;opacity:0.25;
                  animation:skwPing 2s cubic-bezier(0,0,0.2,1) infinite;
                  animation-delay:${index * 0.3}s;
                "></div>
              ` : ""}
              <div style="
                position:relative;z-index:10;
                width:22px;height:22px;
                background:${col};
                border:3px solid ${col === "#4ADE80" ? "#071529" : "#0B1F3A"};
                border-radius:50%;
                box-shadow:0 0 14px ${col}88, 0 2px 8px rgba(0,0,0,0.5);
                display:flex;align-items:center;justify-content:center;
              ">
                <div style="
                  width:7px;height:7px;background:white;border-radius:50%;opacity:0.9;
                  animation:skwPulse 1.5s cubic-bezier(0.4,0,0.6,1) infinite;
                "></div>
              </div>
              <div style="
                position:absolute;top:calc(100% + 2px);left:50%;transform:translateX(-50%);
                font-family:'Rajdhani',sans-serif;font-size:9px;font-weight:700;
                color:${col};white-space:nowrap;letter-spacing:0.06em;
                text-shadow:0 1px 4px rgba(0,0,0,0.95),0 0 8px rgba(0,0,0,0.8);
              ">${project.city}</div>
            </div>
            <style>
              @keyframes skwPing{0%{transform:scale(1);opacity:0.25}75%,100%{transform:scale(2.2);opacity:0}}
              @keyframes skwPulse{0%,100%{opacity:1}50%{opacity:0.4}}
            </style>
          `,
          iconSize: [40, 52],
          iconAnchor: [20, 20],
          popupAnchor: [0, -24],
          className: "skw-map-marker",
        });

        const marker = L.marker(project.coordinates, { icon: markerIcon }).addTo(map);

        const popupContent = `
          <div style="padding:0;min-width:220px;font-family:'Rajdhani',sans-serif;">
            <div style="padding:0.9rem 1rem 0.65rem;border-left:3px solid ${col};border-bottom:1px solid rgba(255,255,255,0.07);">
              <div style="font-weight:700;color:#F5F7FA;font-size:0.92rem;line-height:1.3;margin-bottom:0.3rem;">${project.name}</div>
              <div style="font-size:0.68rem;color:${col};font-weight:700;letter-spacing:0.14em;text-transform:uppercase;">${statusLabel(project.status)}</div>
            </div>
            <div style="padding:0.65rem 1rem;">
              <div style="display:flex;justify-content:space-between;padding:0.28rem 0;border-bottom:1px solid rgba(255,255,255,0.05);font-size:0.76rem;">
                <span style="color:rgba(245,247,250,0.5);">Type</span>
                <span style="color:#F5F7FA;font-weight:700;">${project.type}</span>
              </div>
              <div style="display:flex;justify-content:space-between;padding:0.28rem 0;border-bottom:1px solid rgba(255,255,255,0.05);font-size:0.76rem;">
                <span style="color:rgba(245,247,250,0.5);">Budget</span>
                <span style="color:#F5F7FA;font-weight:700;">${project.budget}</span>
              </div>
              <div style="display:flex;justify-content:space-between;padding:0.28rem 0;border-bottom:1px solid rgba(255,255,255,0.05);font-size:0.76rem;">
                <span style="color:rgba(245,247,250,0.5);">Steel Used</span>
                <span style="color:#F5F7FA;font-weight:700;">${project.steelUsed}</span>
              </div>
              ${project.workers > 0 ? `
              <div style="display:flex;justify-content:space-between;padding:0.28rem 0;border-bottom:1px solid rgba(255,255,255,0.05);font-size:0.76rem;">
                <span style="color:rgba(245,247,250,0.5);">Workers</span>
                <span style="color:#F5F7FA;font-weight:700;">${project.workers}</span>
              </div>` : ""}
              <div style="display:flex;justify-content:space-between;font-size:0.73rem;color:rgba(245,247,250,0.5);margin-top:0.6rem;margin-bottom:0.3rem;">
                <span>Progress</span>
                <span style="color:${col};font-weight:700;">${project.progress}%</span>
              </div>
              <div style="width:100%;height:5px;background:rgba(255,255,255,0.08);border-radius:3px;overflow:hidden;margin-bottom:0.85rem;">
                <div style="background:${col};height:100%;width:${project.progress}%;border-radius:3px;"></div>
              </div>
              <button
                onclick="window.skwOpenProject(${project.id})"
                style="width:100%;background:#0B1F3A;color:#F5F7FA;padding:0.55rem 1rem;border-radius:8px;font-family:'Rajdhani',sans-serif;font-size:0.8rem;font-weight:700;letter-spacing:0.06em;border:1px solid rgba(74,144,217,0.35);cursor:pointer;transition:background 0.2s;"
                onmouseover="this.style.background='#4A90D9'"
                onmouseout="this.style.background='#0B1F3A'"
              >View Details →</button>
            </div>
          </div>
        `;

        marker.bindPopup(popupContent, {
          maxWidth: 260,
          className: "skw-popup-wrapper",
        });

        marker.on("mouseover", () => marker.openPopup());
        marker.on("click", () => {
          marker.openPopup();
          window.skwOpenProject?.(project.id);
        });
      });

      mapInstanceRef.current = map as LeafletMapInstance;
      setMapLoaded(true);
    };

    document.head.appendChild(scriptEl);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    window.skwOpenProject = (projectId: number) => {
      const project = MAP_PROJECTS.find(p => p.id === projectId);
      if (project) setSelectedMapProject(project);
    };
    return () => { delete window.skwOpenProject; };
  }, []);

  return (
    <section className="mhmap-section">
      <div className={`mhmap-section-header ${inView ? "mhmap-header-visible" : ""}`}>
        <div className="prj-section-tag prj-tag-center">Maharashtra Footprint</div>
        <h2 className="mhmap-main-heading">
          Project Locations<br />
          <span className="mhmap-heading-accent">Across Maharashtra</span>
        </h2>
        <p className="mhmap-section-sub">
          Interactive live map — hover any marker to preview, click for full details.
          Zoom and pan freely across the state.
        </p>
      </div>

      <div className={`mhmap-card-wrap ${inView ? "mhmap-canvas-visible" : ""}`}>
        <div className="mhmap-card-header">
          <div className="mhmap-card-title-block">
            <h3 className="mhmap-card-title">PROJECT LOCATIONS</h3>
            <p className="mhmap-card-sub">Markers zoom with map · Click for project details</p>
          </div>
          <div className="mhmap-card-badge">
            <span className="mhmap-sb-live-dot" />
            {MAP_PROJECTS.filter(p => p.status === "Ongoing").length} Active Sites
          </div>
        </div>

        <div className="mhmap-map-container">
          {!mapLoaded && (
            <div className="mhmap-loading">
              <div className="mhmap-load-spinner" />
              <span>Loading map…</span>
            </div>
          )}
          <div ref={mapRef} className="mhmap-leaflet" />
        </div>

        <div className={`mhmap-below-grid ${inView ? "mhmap-below-visible" : ""}`}>
          {MAP_PROJECTS.map((project, i) => {
            const col = statusColor(project.status);
            const tcol = typeColor(project.type);
            const isActive = selectedMapProject?.id === project.id;
            return (
              <div
                key={project.id}
                className={`mhmap-proj-card ${isActive ? "mhmap-proj-card-active" : ""} ${inView ? "mhmap-proj-card-visible" : ""}`}
                style={{
                  animationDelay: `${0.15 + i * 0.08}s`,
                  "--proj-col": col,
                } as React.CSSProperties}
                onClick={() => setSelectedMapProject(isActive ? null : project)}
              >
                <div className="mhmap-pc-dot-wrap">
                  <div className="mhmap-pc-dot" style={{ background: col }} />
                  {project.status === "Ongoing" && (
                    <div className="mhmap-pc-ping" style={{ background: col }} />
                  )}
                </div>
                <div className="mhmap-pc-body">
                  <div className="mhmap-pc-name">{project.name}</div>
                  <div className="mhmap-pc-city">📍 {project.city}</div>
                  <div className="mhmap-pc-prog-row">
                    <div className="mhmap-pc-track">
                      <div
                        className={`mhmap-pc-fill ${inView ? "mhmap-pc-fill-anim" : ""}`}
                        style={{
                          "--fill-w": `${project.progress}%`,
                          background: col,
                          animationDelay: `${0.5 + i * 0.1}s`,
                        } as React.CSSProperties}
                      />
                    </div>
                    <span className="mhmap-pc-pct" style={{ color: col }}>{project.progress}%</span>
                  </div>
                </div>
                <div className="mhmap-pc-type" style={{ color: tcol, borderColor: `${tcol}44`, background: `${tcol}11` }}>
                  {project.type}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className={`mhmap-legend-row ${inView ? "mhmap-legend-visible" : ""}`}>
        {[
          { color: "#4A90D9", label: "Ongoing" },
          { color: "#4ADE80", label: "Completed" },
          { color: "#E8B84B", label: "Planning" },
        ].map(l => (
          <div key={l.label} className="mhmap-legend-item">
            <span className="mhmap-legend-dot" style={{ background: l.color, boxShadow: `0 0 5px ${l.color}` }} />
            <span>{l.label}</span>
          </div>
        ))}
        <div className="mhmap-hint-inline">🖱 Scroll to zoom · Drag to pan</div>
      </div>

      {selectedMapProject && (
        <div className="mhmap-modal-overlay" onClick={() => setSelectedMapProject(null)}>
          <div className="mhmap-modal" onClick={e => e.stopPropagation()}>
            <div className="mhmap-modal-head" style={{ borderTop: `3px solid ${statusColor(selectedMapProject.status)}` }}>
              <div>
                <div className="mhmap-modal-status" style={{ color: statusColor(selectedMapProject.status) }}>
                  {statusLabel(selectedMapProject.status)}
                </div>
                <h3 className="mhmap-modal-name">{selectedMapProject.name}</h3>
                <div className="mhmap-modal-loc">📍 {selectedMapProject.location}</div>
              </div>
              <button className="mhmap-modal-close" onClick={() => setSelectedMapProject(null)}>✕</button>
            </div>
            <div className="mhmap-modal-body">
              <div className="mhmap-modal-prog-section">
                <div className="mhmap-modal-prog-row">
                  <span>Overall Progress</span>
                  <span style={{ color: statusColor(selectedMapProject.status), fontWeight: 700 }}>
                    {selectedMapProject.progress}%
                  </span>
                </div>
                <div className="mhmap-modal-track">
                  <div
                    className="mhmap-modal-fill"
                    style={{ width: `${selectedMapProject.progress}%`, background: statusColor(selectedMapProject.status) }}
                  />
                </div>
                <div className="mhmap-modal-dates">
                  <span>Started: {selectedMapProject.startDate}</span>
                  <span>Target: {selectedMapProject.expectedCompletion}</span>
                </div>
              </div>
              <div className="mhmap-modal-stats">
                {[
                  { label: "Budget", value: selectedMapProject.budget },
                  { label: "Steel Used", value: selectedMapProject.steelUsed },
                  { label: "Workers", value: selectedMapProject.workers > 0 ? `${selectedMapProject.workers}` : "TBD" },
                  { label: "Client", value: selectedMapProject.client },
                ].map(({ label, value }) => (
                  <div key={label} className="mhmap-modal-stat">
                    <div className="mhmap-modal-stat-label">{label}</div>
                    <div className="mhmap-modal-stat-val">{value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

// ─── Marquee ──────────────────────────────────────────────────────────────────
function Marquee() {
  const items = ["Industrial", "Infrastructure", "Commercial", "Pharmaceutical", "Fabrication", "BIS Certified", "ISO 9001", "Maharashtra", "Pan-India Vision"];
  const doubled = [...items, ...items];
  return (
    <div className="prj-marquee-wrap">
      <div className="prj-marquee-track">
        {doubled.map((item, i) => (
          <span key={i} className="prj-marquee-item">
            <span className="prj-marquee-dot">◆</span>{item}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function Projects() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const heroBgRef = useRef<HTMLDivElement>(null);

  const { ref: heroRef, inView: heroInView } = useInView(0.1);
  const { ref: mapSRef, inView: mapSInView } = useInView(0.08);
  const { ref: ongRef, inView: ongInView } = useInView(0.05);
  const { ref: cmpRef, inView: cmpInView } = useInView(0.05);
  const { ref: processRef, inView: processInView } = useInView(0.1);
  const { ref: ctaRef, inView: ctaInView } = useInView(0.15);

  useEffect(() => {
    const fn = () => {
      if (heroBgRef.current)
        heroBgRef.current.style.transform = `translateY(${window.scrollY * 0.32}px)`;
    };
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <div className="prj-page">

      {/* ══ HERO ══════════════════════════════════════════════════════════ */}
      <section className="prj-hero" ref={heroRef}>
        <div ref={heroBgRef} className="prj-hero-bg" />
        <div className="prj-hero-overlay" />
        <div className="prj-grid-lines" aria-hidden="true">
          {Array.from({ length: 8 }).map((_, i) => <div key={i} className="prj-grid-col" />)}
        </div>
        <div className="prj-particles" aria-hidden="true">
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className="prj-particle" style={{
              left: `${(i * 5.1 + 2) % 96}%`,
              animationDelay: `${(i * 0.4) % 7}s`,
              animationDuration: `${5 + (i % 5)}s`,
            }} />
          ))}
        </div>
        <div className="prj-hero-content">
          <div className={`prj-hero-inner ${heroInView ? "prj-hero-visible" : ""}`}>
            <div className="prj-hero-badge">
              <span className="prj-badge-dot" />
              Live Projects Across Maharashtra
            </div>
            <h1 className="prj-hero-title">
              <span>Steel</span>
              <span className="prj-title-outline">in Motion</span>
              <span>Across the State</span>
            </h1>
            <p className="prj-hero-sub">
              From metro rail stations in Pune to industrial complexes in Nagpur —
              ShriKrishnaSteelWorks is the structural backbone behind Maharashtra's
              fastest-growing infrastructure.
            </p>
            <div className="prj-hero-chips">
              {["200+ Projects", "6 Districts", "₹26Cr+ Value", "Ongoing & Completed"].map((c, i) => (
                <span key={c} className="prj-hero-chip" style={{ animationDelay: `${0.6 + i * 0.08}s` }}>{c}</span>
              ))}
            </div>
            <div className="prj-hero-ctas">
              <a href="#ongoing-section" className="prj-cta-btn prj-cta-primary">View Ongoing Projects →</a>
              <a href="#completed-section" className="prj-cta-btn prj-cta-ghost">Completed Portfolio</a>
            </div>
          </div>
        </div>
        <div className="prj-scroll-cue"><div className="prj-scroll-line" /><span>SCROLL</span></div>
      </section>

      {/* ══ MARQUEE ═══════════════════════════════════════════════════════ */}
      <Marquee />

      {/* ══ MAHARASHTRA MAP ═══════════════════════════════════════════════ */}
      <div ref={mapSRef}>
        <MaharashtraMap inView={mapSInView} />
      </div>

      {/* ══ ONGOING PROJECTS ══════════════════════════════════════════════ */}
      <section className="ong-section" id="ongoing-section" ref={ongRef}>
        <div className="ong-section-bg" aria-hidden="true">
          <div className="ong-bg-ring ong-bg-r1" />
          <div className="ong-bg-ring ong-bg-r2" />
        </div>
        <div className="ong-section-inner">
          <div className={`ong-header ${ongInView ? "ong-header-visible" : ""}`}>
            <div className="ong-header-left">
              <div className="ong-section-tag">
                <span className="ong-tag-pulse" />
                Currently Active
              </div>
              <h2 className="ong-section-heading">
                Ongoing &<br />
                <span className="ong-heading-accent">Planning Stage</span>
              </h2>
              <p className="ong-section-sub">
                Live construction sites and projects in mobilisation — track real-time progress
                across Maharashtra's fastest-growing infrastructure corridors.
              </p>
            </div>
            <div className="ong-live-widget">
              <div className="ong-live-header">
                <span className="ong-live-indicator" />
                <span>Live Updates</span>
              </div>
              <div className="ong-live-stats">
                <div className="ong-ls-item">
                  <span className="ong-ls-val">{ONGOING.length}</span>
                  <span className="ong-ls-label">Active Sites</span>
                </div>
                <div className="ong-ls-divider" />
                <div className="ong-ls-item">
                  <span className="ong-ls-val">{ONGOING.reduce((a, p) => a + p.workers, 0)}</span>
                  <span className="ong-ls-label">Workers Deployed</span>
                </div>
                <div className="ong-ls-divider" />
                <div className="ong-ls-item">
                  <span className="ong-ls-val">
                    {Math.round(ONGOING.reduce((a, p) => a + p.progress, 0) / ONGOING.length)}%
                  </span>
                  <span className="ong-ls-label">Avg. Progress</span>
                </div>
              </div>
            </div>
          </div>
          <div className="ong-cards-list">
            {ONGOING.map((project, i) => (
              <OngoingCard key={project.id} project={project} index={i} inView={ongInView} onOpen={setSelectedProject} />
            ))}
          </div>
        </div>
      </section>

      {/* ══ DIVIDER ═══════════════════════════════════════════════════════ */}
      <div className="prj-section-divider">
        <div className="prj-divider-line" />
        <div className="prj-divider-badge">
          <span>✓</span><span>Completed Portfolio</span><span>✓</span>
        </div>
        <div className="prj-divider-line" />
      </div>

      {/* ══ COMPLETED PROJECTS ════════════════════════════════════════════ */}
      <section className="cmp-section" id="completed-section" ref={cmpRef}>
        <div className="cmp-section-inner">
          <div className={`cmp-header ${cmpInView ? "cmp-header-visible" : ""}`}>
            <div className="cmp-header-left">
              <div className="cmp-section-tag">Proven Track Record</div>
              <h2 className="cmp-section-heading">
                Completed<br />
                <span className="cmp-heading-accent">Projects</span>
              </h2>
              <p className="cmp-section-sub">
                Every delivered project is a testament to our zero-compromise approach —
                on time, within budget, and to the highest quality standard.
              </p>
            </div>
            <div className="cmp-stats-widget">
              <div className="cmp-sw-badge">
                <div className="cmp-sw-checkmark">✓</div>
                <div className="cmp-sw-number">{COMPLETED.length * 30}+</div>
                <div className="cmp-sw-label">Projects Delivered</div>
              </div>
              <div className="cmp-sw-rows">
                <div className="cmp-sw-row"><span>On-Time Delivery</span><span className="cmp-sw-green">98.4%</span></div>
                <div className="cmp-sw-row"><span>Quality Rejections</span><span className="cmp-sw-green">Zero</span></div>
                <div className="cmp-sw-row"><span>Client Satisfaction</span><span className="cmp-sw-green">4.9 / 5</span></div>
              </div>
            </div>
          </div>
          <div className="cmp-cards-grid">
            {COMPLETED.map((project, i) => (
              <CompletedCard key={project.id} project={project} index={i} inView={cmpInView} onOpen={setSelectedProject} />
            ))}
          </div>
        </div>
      </section>

      {/* ══ PROCESS STRIP ═════════════════════════════════════════════════ */}
      <section className="prj-process-strip" ref={processRef}>
        <div className="prj-process-inner">
          <div className="prj-section-tag prj-tag-center">How We Execute Projects</div>
          <div className="prj-process-steps">
            {[
              { num: "01", title: "Site Survey", desc: "Our engineers assess structural requirements and soil conditions." },
              { num: "02", title: "Design & Quote", desc: "Detailed BOM, fabrication drawings, and transparent pricing." },
              { num: "03", title: "Fabrication", desc: "In-house CAD/CAM cutting, bending, and welding to specifications." },
              { num: "04", title: "Erection", desc: "Certified erection crews with quality inspection at every stage." },
            ].map((step, i) => (
              <div key={step.num} className={`prj-process-step ${processInView ? "prj-step-visible" : ""}`} style={{ animationDelay: `${i * 0.15}s` }}>
                <div className="prj-process-node"><span className="prj-node-num">{step.num}</span></div>
                {i < 3 && <div className="prj-process-connector" />}
                <h4 className="prj-process-title">{step.title}</h4>
                <p className="prj-process-desc">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ CTA ═══════════════════════════════════════════════════════════ */}
      <section className="prj-cta" ref={ctaRef}>
        <div className="prj-cta-bg-text" aria-hidden="true">PROJECT</div>
        <div className={`prj-cta-inner ${ctaInView ? "prj-cta-visible" : ""}`}>
          <div className="prj-cta-tag">Start Your Project</div>
          <h2 className="prj-cta-heading">Have a Structural<br />Steel Requirement?</h2>
          <p className="prj-cta-sub">
            From small industrial sheds to multi-crore infrastructure contracts —
            we supply, fabricate, and erect. Get a free project consultation today.
          </p>
          <div className="prj-cta-btns">
            <Link to="/contact" className="skw-btn-white">Request a Project Quote</Link>
            <Link to="/products" className="skw-btn-outline-white">Browse Steel Products</Link>
          </div>
        </div>
      </section>

      {selectedProject && (
        <ProjectModal project={selectedProject} onClose={() => setSelectedProject(null)} />
      )}
    </div>
  );
}
