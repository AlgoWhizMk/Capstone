import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useProducts, useCategories } from "../../hooks/useProducts";
import { useAuth } from "../context/AuthContext";
import { createInquiry } from "../services/api";
import "../products-styles.css";

// ─── Hooks ────────────────────────────────────────────────────────────────────
function useInView(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setInView(true); obs.disconnect(); } },
      { threshold }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}

function useMouseParallax() {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  useEffect(() => {
    const handle = (e: MouseEvent) =>
      setPos({ x: (e.clientX / window.innerWidth - 0.5) * 2, y: (e.clientY / window.innerHeight - 0.5) * 2 });
    window.addEventListener("mousemove", handle);
    return () => window.removeEventListener("mousemove", handle);
  }, []);
  return pos;
}

// ─── Category Config ──────────────────────────────────────────────────────────
const CAT_CONFIG: Record<string, { icon: string; accent: string; glow: string }> = {
  "All": { icon: "◈", accent: "#4A90D9", glow: "rgba(74,144,217,0.4)" },
  "Steel Furniture Works": { icon: "🗄️", accent: "#E8B84B", glow: "rgba(232,184,75,0.4)" },
  "Home Steel Furnitures": { icon: "🏠", accent: "#E67E22", glow: "rgba(230,126,34,0.4)" },
  "Commercial Building Structures": { icon: "🏗️", accent: "#4A90D9", glow: "rgba(74,144,217,0.4)" },
  "SS Railing": { icon: "🔩", accent: "#2ECC71", glow: "rgba(46,204,113,0.4)" },
  "Kitchen Trolleys": { icon: "🛒", accent: "#E74C3C", glow: "rgba(231,76,60,0.4)" },
  "Hotel Furnitures": { icon: "🏨", accent: "#9B59B6", glow: "rgba(155,89,182,0.4)" },
  "Food Processing Machines": { icon: "⚙️", accent: "#1ABC9C", glow: "rgba(26,188,156,0.4)" },
  "Park Instruments": { icon: "🌿", accent: "#F39C12", glow: "rgba(243,156,18,0.4)" },
};
const getCfg = (cat: string) => CAT_CONFIG[cat] ?? CAT_CONFIG["All"];

type MappedProduct = {
  id: string; name: string; category: string; grade: string;
  price: string; unit: string; minOrder: string; lead: string;
  stock: string; stockQty: number; tag: string; rating: number;
  accentColor: string; glowColor: string; shortDesc: string;
  warranty: string; finish: string; specs: Record<string, string>;
  sizes: string[]; highlights: string[]; applications: string[];
  customizable: boolean;
  imageUrl: string;
};

const CUSTOMIZE_FIELDS = [
  { label: "Quantity Required", type: "number", name: "quantity", placeholder: "e.g. 5 units" },
  { label: "Phone Number", type: "tel", name: "phone", placeholder: "e.g. 9876543210", required: true },
  { label: "Custom Dimensions", type: "text", name: "size", placeholder: "e.g. 120×60×75 cm" },
  { label: "Delivery Location", type: "text", name: "location", placeholder: "e.g. Pune, Maharashtra" },
  { label: "Required By Date", type: "date", name: "date", placeholder: "" },
  { label: "Special Instructions", type: "textarea", name: "notes", placeholder: "Finish, colour, load specs..." },
];

function StatCounter({ end, suffix, label }: { end: number; suffix: string; label: string }) {
  const [val, setVal] = useState(0);
  const { ref, inView } = useInView(0.3);
  useEffect(() => {
    if (!inView) return;
    let v = 0; const step = end / 60;
    const t = setInterval(() => {
      v += step;
      if (v >= end) { setVal(end); clearInterval(t); } else setVal(Math.floor(v));
    }, 16);
    return () => clearInterval(t);
  }, [inView, end]);
  return (
    <div ref={ref} className="xstat">
      <span className="xstat-n">{val.toLocaleString()}<span className="xstat-s">{suffix}</span></span>
      <span className="xstat-l">{label}</span>
    </div>
  );
}

function Stars({ rating }: { rating: number }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: "1px" }}>
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} style={{ fontSize: "0.78rem", color: i <= Math.round(rating) ? "#E8B84B" : "rgba(220,232,245,0.18)" }}>★</span>
      ))}
      <span style={{ fontSize: "0.7rem", color: "rgba(220,232,245,0.45)", marginLeft: "0.28rem" }}>{rating.toFixed(1)}</span>
    </span>
  );
}

export default function Products() {
  const mouse = useMouseParallax();
  const [activeCategory, setActiveCategory] = useState("All");
  const [catDropdownOpen, setCatDropdownOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [detailProduct, setDetailProduct] = useState<MappedProduct | null>(null);
  const [customizeProduct, setCustomizeProduct] = useState<MappedProduct | null>(null);
  const [showLogin, setShowLogin] = useState(false);
  const [customizeForm, setCustomizeForm] = useState<Record<string, string>>({});
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [cartItems, setCartItems] = useState<string[]>([]);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"specs" | "sizes" | "highlights" | "applications">("specs");
  const [heroLoaded, setHeroLoaded] = useState(false);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { ref: heroSectionRef } = useInView(0.05);
  const { ref: gridSectionRef, inView: gridSectionInView } = useInView();

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    void Promise.resolve().then(() => setPage(1));
  }, [debouncedSearch, activeCategory]);

  const { products: apiProducts, total, loading } = useProducts(debouncedSearch, activeCategory, 12, page);
  const dbCategories = useCategories();

  const CATEGORIES = [
    { id: "All", label: "All Products", count: total },
    ...dbCategories.map(c => ({ id: c._id, label: c._id, count: c.count })),
  ];

  const filtered: MappedProduct[] = apiProducts.map(p => {
    const cfg = getCfg(p.category);
    return {
      id: p.productId, name: p.productName, category: p.category,
      grade: p.steelGrade || p.furnitureType || "—",
      price: `₹${Number(p.finalPriceINR).toLocaleString("en-IN")}`,
      unit: "/piece", minOrder: "1 piece",
      lead: `${p.leadTimeDays} days`,
      stock: p.stockQuantity > 50 ? "In Stock" : p.stockQuantity > 0 ? "Low Stock" : "Made to Order",
      stockQty: p.stockQuantity, tag: p.availability || "Available",
      rating: p.rating ?? 4.5,
      accentColor: cfg.accent, glowColor: cfg.glow,
      warranty: `${p.warrantyYears ?? 1} yr warranty`,
      finish: p.surfaceFinish || "Standard",
      shortDesc: (p.productDescription || "").substring(0, 128) + "…",
      specs: {
        "Steel Grade": p.steelGrade || "—",
        "Frame Thickness": p.frameThickness || "—",
        "Surface Finish": p.surfaceFinish || "—",
        "Load Capacity": p.loadCapacityKg ? `${p.loadCapacityKg} kg` : "—",
        "Dimensions": `${p.length_cm}×${p.width_cm}×${p.height_cm} cm`,
        "Weight": p.weight_kg ? `${p.weight_kg} kg` : "—",
        "Color": p.color || "—",
        "Usage Area": p.usageArea || "—",
      },
      sizes: [`${p.length_cm}×${p.width_cm}×${p.height_cm} cm`],
      highlights: (p.features || "").split(",").map((f: string) => f.trim()).filter(Boolean),
      applications: [p.usageArea, p.recommendedFor].filter(Boolean) as string[],
      customizable: p.customizationAvailable === "Yes",
      imageUrl: `/product-images/${p.productId}A.jpg`,
    };
  });

  useEffect(() => { setTimeout(() => setHeroLoaded(true), 100); }, []);
  useEffect(() => {
    const kh = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setDetailProduct(null); setCustomizeProduct(null); setShowLogin(false); setCatDropdownOpen(false); }
    };
    window.addEventListener("keydown", kh);
    return () => window.removeEventListener("keydown", kh);
  }, []);
  useEffect(() => {
    const cm = (e: MouseEvent) => setCursorPos({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", cm);
    return () => window.removeEventListener("mousemove", cm);
  }, []);
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setCatDropdownOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  useEffect(() => {
    document.body.style.overflow = (detailProduct || customizeProduct || showLogin) ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [detailProduct, customizeProduct, showLogin]);

  function addToCart(p: MappedProduct) {
    setCartItems(prev => [...prev, p.id]);
  }

  const handleCustomizeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setShowLogin(true);
      return;
    }
    if (!customizeProduct) return;
    
    setSubmitting(true);
    try {
      await createInquiry({
        name: user.displayName || "Customer",
        email: user.email || "",
        phone: customizeForm.phone || "", // If they didn't add phone
        firebaseUid: user.uid,
        productId: customizeProduct.id,
        enquiryType: "fabrication",
        type: "customization",
        quantity: customizeForm.quantity || "1",
        customDimensions: customizeForm.size,
        timeline: customizeForm.date,
        customNotes: customizeForm.notes,
        message: `Delivery Location: ${customizeForm.location || "Not specified"}`
      });
      alert("Customization request submitted successfully!");
      setCustomizeProduct(null);
      setCustomizeForm({});
      setUploadedFiles([]);
    } catch (err) {
      console.error(err);
      alert("Failed to submit request.");
    } finally {
      setSubmitting(false);
    }
  };

  const particles = Array.from({ length: 26 }, (_, i) => ({
    left: `${(i * 3.9 + 1.4) % 100}%`, top: `${(i * 5.7 + 2.8) % 100}%`,
    size: `${(i % 3) + 1.1}px`, dur: `${(i % 9) + 7}s`, del: `${(i % 7) * 0.7}s`,
  }));

  const CSS = `
    :root{--bg0:#020b16;--bg1:#050e1c;--bg2:#081525;--bg3:#0c1d30;--blue:#4A90D9;--gold:#E8B84B;--green:#2ECC71;--red:#E74C3C;--text:#dce8f5;--muted:rgba(220,232,245,0.44);--border:rgba(74,144,217,0.13);--fh:'Bebas Neue',cursive;--fu:'Rajdhani',sans-serif;--fb:'Inter','Segoe UI',sans-serif;--r:20px;}
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
    .xpage{background:var(--bg0);color:var(--text);font-family:var(--fb);overflow-x:hidden;min-height:100vh;}
    .xwrap{max-width:1320px;margin:0 auto;padding:0 1.5rem;}

    /* cursor */
    .xcursor{position:fixed;pointer-events:none;z-index:9999;width:360px;height:360px;border-radius:50%;background:radial-gradient(circle,rgba(74,144,217,0.05) 0%,transparent 70%);transform:translate(-50%,-50%);transition:left .18s ease,top .18s ease;}

    /* toast */
    .xtoast{position:fixed;bottom:2rem;right:2rem;z-index:9998;background:linear-gradient(135deg,#0a2240,#060f1e);border:1px solid rgba(74,144,217,0.3);border-left:4px solid var(--gold);border-radius:16px;padding:1rem 1.3rem;display:flex;align-items:center;gap:.85rem;min-width:260px;max-width:340px;box-shadow:0 20px 60px rgba(0,0,0,.6),0 0 40px rgba(232,184,75,.07);animation:toastIn .5s cubic-bezier(.17,.67,.44,1.3);overflow:hidden;}
    @keyframes toastIn{from{opacity:0;transform:translateX(60px) scale(.9)}to{opacity:1;transform:none}}
    .xtoast-ico{font-size:1.5rem}
    .xtoast-h{font-family:var(--fu);font-weight:700;font-size:.82rem;letter-spacing:.06em;color:var(--gold);}
    .xtoast-s{font-size:.78rem;color:var(--muted);margin-top:2px;}
    .xtoast-bar{position:absolute;bottom:0;left:0;height:3px;background:linear-gradient(90deg,var(--gold),var(--blue));animation:toastShrink 3.2s linear forwards;}
    @keyframes toastShrink{from{width:100%}to{width:0}}

    /* hero */
    .xhero{position:relative;min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;overflow:hidden;}
    .xhero-bg{position:absolute;inset:0;background:linear-gradient(180deg,rgba(2,11,22,0) 0%,rgba(2,11,22,.75) 65%,#020b16 100%),url('https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=1800&q=70') center/cover no-repeat;filter:brightness(.26) saturate(.55);transform:scale(1.07);animation:heroKB 20s ease-in-out infinite alternate;}
    @keyframes heroKB{from{transform:scale(1.07)}to{transform:scale(1.15)}}
    .xhero-ov{position:absolute;inset:0;background:radial-gradient(ellipse 80% 55% at 50% 38%,rgba(74,144,217,.1) 0%,transparent 70%),linear-gradient(160deg,rgba(2,11,22,.94) 0%,rgba(10,25,45,.58) 50%,rgba(2,11,22,.97) 100%);}
    .xgrid-bg{position:absolute;inset:0;background-image:linear-gradient(rgba(74,144,217,.055) 1px,transparent 1px),linear-gradient(90deg,rgba(74,144,217,.055) 1px,transparent 1px);background-size:64px 64px;animation:gridDrift 26s linear infinite;}
    @keyframes gridDrift{from{background-position:0 0}to{background-position:64px 64px}}
    .xorb{position:absolute;border-radius:50%;filter:blur(90px);pointer-events:none;transition:transform .14s ease-out;}
    .xorb1{width:560px;height:560px;background:radial-gradient(circle,rgba(74,144,217,.18) 0%,transparent 70%);top:-80px;left:-100px;}
    .xorb2{width:450px;height:450px;background:radial-gradient(circle,rgba(232,184,75,.12) 0%,transparent 70%);bottom:0;right:-80px;}
    .xorb3{width:320px;height:320px;background:radial-gradient(circle,rgba(26,188,156,.1) 0%,transparent 70%);top:42%;left:44%;}
    .xpt{position:absolute;border-radius:50%;background:rgba(74,144,217,.48);pointer-events:none;animation:ptUp linear infinite;}
    @keyframes ptUp{0%{opacity:0;transform:translateY(0) scale(1)}15%{opacity:1}85%{opacity:.5}100%{opacity:0;transform:translateY(-110px) scale(.4)}}
    .xline1{position:absolute;top:0;right:8%;width:2px;height:110%;background:linear-gradient(to bottom,transparent 0%,rgba(232,184,75,.5) 35%,rgba(74,144,217,.5) 65%,transparent 100%);transform:rotate(-10deg);transform-origin:top center;}
    .xline2{position:absolute;top:0;left:12%;width:1px;height:110%;background:linear-gradient(to bottom,transparent 0%,rgba(74,144,217,.22) 50%,transparent 100%);transform:rotate(8deg);transform-origin:top center;}
    .xhero-body{position:relative;z-index:5;text-align:center;padding:8rem 1.5rem 7rem;opacity:0;transform:translateY(50px);transition:opacity 1.1s cubic-bezier(.16,1,.3,1),transform 1.1s cubic-bezier(.16,1,.3,1);}
    .xhero-body.loaded{opacity:1;transform:none;}
    .xeyebrow{display:inline-flex;align-items:center;gap:.75rem;font-family:var(--fu);font-size:.7rem;font-weight:700;letter-spacing:.22em;text-transform:uppercase;color:var(--muted);margin-bottom:2.2rem;}
    .xebar{display:block;width:42px;height:1px;}
    .xebar1{background:linear-gradient(90deg,transparent,var(--gold));}
    .xebar2{background:linear-gradient(90deg,var(--gold),transparent);}
    .xhero-title{font-family:var(--fh);font-size:clamp(4.5rem,13vw,10.5rem);line-height:.87;letter-spacing:.03em;margin-bottom:1.6rem;animation:titleRise 1s cubic-bezier(.16,1,.3,1) .12s both;}
    @keyframes titleRise{from{opacity:0;transform:translateY(55px)}to{opacity:1;transform:none}}
    .xt1{display:block;color:#fff;}
    .xt2{display:inline-block;background:linear-gradient(135deg,var(--blue) 0%,rgba(74,144,217,.5) 100%);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;}
    .xt-badge{display:inline-block;font-family:var(--fu);font-size:.98rem;font-weight:700;letter-spacing:.2em;color:var(--gold);border:1px solid rgba(232,184,75,.4);background:rgba(232,184,75,.07);padding:.28rem .8rem;border-radius:8px;margin-left:1.2rem;vertical-align:middle;animation:titleRise 1s cubic-bezier(.16,1,.3,1) .22s both;}
    .xhero-sub{font-size:1.02rem;color:var(--muted);max-width:540px;margin:0 auto 2.5rem;line-height:1.72;animation:titleRise 1s cubic-bezier(.16,1,.3,1) .32s both;}
    .xhero-ctas{display:flex;gap:1rem;justify-content:center;flex-wrap:wrap;animation:titleRise 1s cubic-bezier(.16,1,.3,1) .44s both;}
    .xbtn-p{display:inline-flex;align-items:center;gap:.5rem;background:linear-gradient(135deg,var(--blue),#2560a8);color:#fff;padding:.95rem 2.1rem;border-radius:14px;font-family:var(--fu);font-weight:700;font-size:1rem;letter-spacing:.05em;text-decoration:none;border:none;cursor:pointer;box-shadow:0 10px 36px rgba(74,144,217,.38);transition:all .28s ease;position:relative;overflow:hidden;}
    .xbtn-p::before{content:'';position:absolute;inset:0;background:linear-gradient(135deg,rgba(255,255,255,.18) 0%,transparent 60%);opacity:0;transition:opacity .28s;}
    .xbtn-p:hover{transform:translateY(-4px);box-shadow:0 18px 52px rgba(74,144,217,.55);}
    .xbtn-p:hover::before{opacity:1;}
    .xbtn-g{display:inline-flex;align-items:center;gap:.5rem;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.18);color:rgba(220,232,245,.8);padding:.95rem 1.8rem;border-radius:14px;font-family:var(--fu);font-weight:700;font-size:1rem;letter-spacing:.05em;text-decoration:none;cursor:pointer;backdrop-filter:blur(10px);transition:all .25s ease;}
    .xbtn-g:hover{background:rgba(255,255,255,.1);border-color:rgba(232,184,75,.5);color:var(--gold);transform:translateY(-3px);}

    /* stats */
    .xstats{position:absolute;bottom:0;left:0;right:0;background:rgba(2,11,22,.87);backdrop-filter:blur(20px);border-top:1px solid rgba(74,144,217,.14);display:flex;justify-content:center;flex-wrap:wrap;z-index:6;}
    .xstat{display:flex;flex-direction:column;align-items:center;gap:.15rem;padding:1.1rem 3rem;border-right:1px solid rgba(74,144,217,.11);}
    .xstat:last-child{border-right:none;}
    .xstat-n{font-family:var(--fh);font-size:2rem;color:#fff;line-height:1;}
    .xstat-s{color:var(--gold);font-size:1.4rem;}
    .xstat-l{font-family:var(--fu);font-size:.68rem;font-weight:700;letter-spacing:.15em;text-transform:uppercase;color:var(--muted);}

    /* scroll indicator */
    .xscroll{position:absolute;bottom:5.8rem;left:50%;transform:translateX(-50%);display:flex;flex-direction:column;align-items:center;gap:.4rem;z-index:6;}
    .xscroll span{font-family:var(--fu);font-size:.6rem;font-weight:700;letter-spacing:.22em;color:rgba(220,232,245,.26);}
    .xscroll-line{width:1.5px;height:48px;background:rgba(74,144,217,.2);border-radius:2px;overflow:hidden;}
    .xscroll-dot{width:100%;height:50%;background:var(--blue);border-radius:2px;animation:scrollAnim 2s ease-in-out infinite;}
    @keyframes scrollAnim{0%{transform:translateY(-100%);opacity:0}30%{opacity:1}100%{transform:translateY(200%);opacity:0}}
    .xhero-cut{position:absolute;bottom:0;left:0;right:0;height:80px;background:var(--bg0);clip-path:polygon(0 100%,100% 0,100% 100%);}

    /* filter bar */
    .xfilter{position:sticky;top:68px;z-index:400;background:rgba(2,11,22,.97);backdrop-filter:blur(24px);border-bottom:1px solid var(--border);padding:1rem 0;}
    .xshimmer-line{position:absolute;bottom:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,var(--blue),var(--gold),var(--blue),transparent);background-size:250% 100%;opacity:.38;animation:shimmer 5s linear infinite;}
    @keyframes shimmer{from{background-position:-250% 0}to{background-position:250% 0}}
    .xfilter-in{display:flex;flex-direction:column;gap:.75rem;}
    .xfilter-r1{display:flex;gap:.75rem;align-items:center;flex-wrap:wrap;}
    .xsearch-wrap{position:relative;flex:1;min-width:220px;}
    .xsearch-ico{position:absolute;left:1rem;top:50%;transform:translateY(-50%);color:var(--muted);display:flex;}
    .xsearch-inp{width:100%;background:rgba(255,255,255,.04);border:1px solid rgba(74,144,217,.17);border-radius:12px;color:var(--text);font-family:var(--fb);font-size:.9rem;padding:.8rem 2.8rem .8rem 2.9rem;outline:none;transition:all .28s;}
    .xsearch-inp::placeholder{color:rgba(220,232,245,.27);}
    .xsearch-inp:focus{border-color:rgba(74,144,217,.55);background:rgba(74,144,217,.06);box-shadow:0 0 0 3px rgba(74,144,217,.08);}
    .xsearch-x{position:absolute;right:.85rem;top:50%;transform:translateY(-50%);background:none;border:none;color:var(--muted);cursor:pointer;font-size:.82rem;transition:color .2s;}
    .xsearch-x:hover{color:var(--red);}
    .xdd-wrap{position:relative;flex-shrink:0;}
    .xdd-trig{display:flex;align-items:center;gap:.55rem;background:rgba(74,144,217,.07);border:1px solid rgba(74,144,217,.24);color:var(--text);border-radius:12px;padding:.77rem 1.1rem;font-family:var(--fu);font-size:.9rem;font-weight:700;letter-spacing:.03em;cursor:pointer;white-space:nowrap;min-width:210px;transition:all .25s;}
    .xdd-trig:hover,.xdd-trig.open{background:rgba(74,144,217,.14);border-color:var(--blue);box-shadow:0 4px 20px rgba(74,144,217,.2);}
    .xdd-sym{font-size:1.05rem;}
    .xdd-lbl{flex:1;text-align:left;}
    .xdd-cnt{background:rgba(74,144,217,.22);color:var(--blue);font-size:.68rem;font-weight:700;border-radius:100px;padding:.12rem .5rem;}
    .xdd-chev{transition:transform .3s cubic-bezier(.16,1,.3,1);color:var(--muted);}
    .xdd-chev.open{transform:rotate(180deg);color:var(--blue);}
    .xdd-panel{position:absolute;top:calc(100% + 10px);left:0;min-width:270px;background:linear-gradient(160deg,#0d2444,#060f1e);border:1px solid rgba(74,144,217,.27);border-radius:18px;overflow:hidden;box-shadow:0 28px 70px rgba(0,0,0,.65);animation:ddIn .28s cubic-bezier(.16,1,.3,1);z-index:500;}
    @keyframes ddIn{from{opacity:0;transform:translateY(-10px) scale(.96)}to{opacity:1;transform:none}}
    .xdd-hdr{padding:.8rem 1.2rem .5rem;font-family:var(--fu);font-size:.62rem;font-weight:700;letter-spacing:.2em;text-transform:uppercase;color:rgba(74,144,217,.55);border-bottom:1px solid rgba(74,144,217,.1);margin-bottom:.3rem;}
    .xdd-item{display:flex;align-items:center;gap:.7rem;width:100%;background:none;border:none;padding:.78rem 1.2rem;cursor:pointer;color:rgba(220,232,245,.66);font-family:var(--fu);font-size:.9rem;font-weight:600;position:relative;text-align:left;transition:all .18s;}
    .xdd-item:hover{background:rgba(74,144,217,.09);color:#fff;}
    .xdd-item.active{background:rgba(74,144,217,.14);color:var(--blue);}
    .xdd-item.active::before{content:'';position:absolute;left:0;top:20%;bottom:20%;width:3px;background:var(--blue);border-radius:0 2px 2px 0;}
    .xdd-item-cnt{background:rgba(255,255,255,.06);color:var(--muted);font-size:.67rem;font-weight:700;border-radius:100px;padding:.1rem .5rem;margin-left:auto;}
    .xdd-item.active .xdd-item-cnt{background:rgba(74,144,217,.2);color:var(--blue);}
    .xdd-check{color:var(--blue);font-size:.8rem;font-weight:700;flex-shrink:0;}
    .xfilter-r2{display:flex;align-items:center;justify-content:space-between;gap:1rem;flex-wrap:wrap;}
    .xresult{display:flex;align-items:center;gap:.5rem;font-size:.82rem;color:var(--muted);}
    .xresult-n{color:var(--blue);font-weight:700;font-size:.96rem;}
    .xclear-btn{background:rgba(231,76,60,.1);border:1px solid rgba(231,76,60,.3);color:var(--red);font-family:var(--fu);font-size:.7rem;font-weight:700;letter-spacing:.04em;padding:.2rem .65rem;border-radius:100px;cursor:pointer;transition:all .2s;margin-left:.4rem;}
    .xclear-btn:hover{background:rgba(231,76,60,.2);}
    .xview-toggle{display:flex;gap:.3rem;}
    .xvbtn{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.09);color:var(--muted);width:36px;height:36px;border-radius:9px;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all .2s;}
    .xvbtn.on{background:rgba(74,144,217,.14);border-color:rgba(74,144,217,.4);color:var(--blue);}

    /* grid */
    .xsection{padding:3rem 0 6rem;background:linear-gradient(180deg,var(--bg0),var(--bg1));}
    .xgrid{display:grid;grid-template-columns:repeat(3,1fr);gap:1.6rem;}
    .xgrid.list{grid-template-columns:1fr;}
    @media(max-width:1100px){.xgrid:not(.list){grid-template-columns:repeat(2,1fr);}}
    @media(max-width:640px){.xgrid:not(.list){grid-template-columns:1fr;}}

    /* loading */
    .xloading{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1rem;padding:6rem 2rem;}
    .xloader{width:48px;height:48px;border:3px solid rgba(74,144,217,.15);border-top-color:var(--blue);border-radius:50%;animation:spin .9s linear infinite;}
    @keyframes spin{to{transform:rotate(360deg)}}
    .xloading-t{font-family:var(--fu);font-size:.85rem;letter-spacing:.12em;text-transform:uppercase;color:var(--muted);}

    /* empty */
    .xempty{text-align:center;padding:6rem 2rem;}
    .xempty-ico{font-size:4rem;margin-bottom:1rem;display:block;animation:floatY 2.5s ease-in-out infinite;}
    @keyframes floatY{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
    .xempty h3{font-family:var(--fu);font-size:1.35rem;font-weight:700;margin-bottom:.5rem;}
    .xempty p{color:var(--muted);margin-bottom:1.5rem;}
    .xempty-btn{background:rgba(74,144,217,.12);border:1px solid rgba(74,144,217,.38);color:var(--blue);padding:.7rem 1.6rem;border-radius:11px;cursor:pointer;font-family:var(--fu);font-weight:700;letter-spacing:.05em;transition:all .22s;}
    .xempty-btn:hover{background:var(--blue);color:#fff;}

    /* card */
    .xcard{position:relative;border-radius:var(--r);overflow:hidden;background:linear-gradient(160deg,rgba(12,30,56,.58),rgba(5,10,22,.96));border:1px solid rgba(74,144,217,.1);opacity:0;transform:translateY(32px) scale(.97);transition:transform .4s ease,box-shadow .4s ease,border-color .4s ease;cursor:default;}
    .xcard.vis{animation:cardIn .72s cubic-bezier(.16,1,.3,1) forwards;}
    @keyframes cardIn{from{opacity:0;transform:translateY(32px) scale(.97)}to{opacity:1;transform:none}}
    .xcard.hov{transform:translateY(-10px) scale(1.015)!important;box-shadow:0 30px 72px rgba(0,0,0,.58),0 0 0 1px var(--ca),0 0 52px -12px var(--cg);border-color:var(--ca)!important;}
    .xcard-ring{position:absolute;inset:-1px;border-radius:calc(var(--r) + 1px);background:linear-gradient(135deg,var(--ca),transparent 40%,transparent 60%,var(--ca));opacity:0;transition:opacity .45s;pointer-events:none;z-index:0;}
    .xcard.hov .xcard-ring{opacity:.22;}
    .xcard-img{position:relative;height:200px;overflow:hidden;}
    .xcard-img img{width:100%;height:100%;object-fit:cover;transition:transform .65s cubic-bezier(.16,1,.3,1);}
    .xcard.hov .xcard-img img{transform:scale(1.12);}
    .xcard-shade{position:absolute;inset:0;background:linear-gradient(to top,rgba(5,10,22,.97) 0%,rgba(5,10,22,.14) 55%,transparent 100%);}
    .xav{position:absolute;top:.75rem;right:.75rem;display:flex;align-items:center;gap:.35rem;font-family:var(--fu);font-size:.64rem;font-weight:700;letter-spacing:.07em;text-transform:uppercase;padding:.22rem .7rem;border-radius:100px;border:1px solid;backdrop-filter:blur(8px);}
    .av-in{color:#2ECC71;border-color:rgba(46,204,113,.38);background:rgba(46,204,113,.1);}
    .av-low{color:var(--gold);border-color:rgba(232,184,75,.38);background:rgba(232,184,75,.1);}
    .av-mto{color:#9B59B6;border-color:rgba(155,89,182,.38);background:rgba(155,89,182,.1);}
    .xav-dot{width:6px;height:6px;border-radius:50%;background:currentColor;animation:dotP 1.8s ease-in-out infinite;}
    @keyframes dotP{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.4;transform:scale(.65)}}
    .xtag{position:absolute;top:.75rem;left:.75rem;color:#fff;font-family:var(--fu);font-size:.63rem;font-weight:700;letter-spacing:.09em;text-transform:uppercase;padding:.22rem .72rem;border-radius:100px;box-shadow:0 4px 14px rgba(0,0,0,.3);}
    .xcust-badge{position:absolute;bottom:.75rem;left:.75rem;display:flex;align-items:center;gap:.3rem;background:rgba(232,184,75,.13);border:1px solid rgba(232,184,75,.38);color:var(--gold);font-family:var(--fu);font-size:.6rem;font-weight:700;letter-spacing:.08em;text-transform:uppercase;padding:.2rem .65rem;border-radius:100px;backdrop-filter:blur(6px);}
    .xqv{position:absolute;inset:0;background:rgba(2,11,22,.5);backdrop-filter:blur(3px);display:flex;align-items:center;justify-content:center;opacity:0;transition:opacity .3s;}
    .xcard.hov .xqv{opacity:1;}
    .xqv-btn{background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.28);color:#fff;padding:.62rem 1.3rem;border-radius:100px;font-family:var(--fu);font-weight:700;font-size:.85rem;letter-spacing:.05em;cursor:pointer;transform:translateY(10px);transition:all .32s cubic-bezier(.16,1,.3,1);backdrop-filter:blur(8px);}
    .xcard.hov .xqv-btn{transform:none;}
    .xqv-btn:hover{background:rgba(255,255,255,.22);transform:translateY(-2px) scale(1.04)!important;}
    .xcard-body{padding:1.3rem 1.4rem 1rem;position:relative;z-index:1;}
    .xcard-cat{display:flex;align-items:center;gap:.4rem;font-family:var(--fu);font-size:.67rem;font-weight:700;letter-spacing:.15em;text-transform:uppercase;margin-bottom:.38rem;}
    .xcard-cat::before{content:'';display:block;width:14px;height:1.5px;background:currentColor;opacity:.7;}
    .xcard-name{font-family:var(--fu);font-size:1.17rem;font-weight:700;color:var(--text);line-height:1.28;margin-bottom:.24rem;}
    .xcard-grade{display:flex;align-items:center;gap:.4rem;font-size:.75rem;color:var(--muted);margin-bottom:.58rem;}
    .xgdot{width:6px;height:6px;border-radius:50%;flex-shrink:0;}
    .xcard-desc{font-size:.81rem;color:rgba(220,232,245,.5);line-height:1.62;margin-bottom:.82rem;}
    .xspec-pills{display:flex;gap:.42rem;flex-wrap:wrap;margin-bottom:.88rem;}
    .xspec-pill{display:flex;flex-direction:column;gap:1px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.07);border-radius:9px;padding:.35rem .65rem;flex:1;min-width:0;}
    .xspk{font-size:.59rem;color:var(--muted);font-family:var(--fu);font-weight:600;letter-spacing:.07em;text-transform:uppercase;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
    .xspv{font-size:.75rem;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
    .xprice-row{display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:.82rem;gap:.5rem;}
    .xprice-main{display:flex;align-items:baseline;gap:.2rem;}
    .xprice-v{font-family:var(--fh);font-size:1.52rem;line-height:1;}
    .xprice-u{font-size:.74rem;color:var(--muted);}
    .xprice-meta{display:flex;flex-direction:column;gap:.22rem;align-items:flex-end;}
    .xmchip{font-size:.69rem;color:var(--muted);background:rgba(255,255,255,.04);padding:.16rem .52rem;border-radius:6px;border:1px solid rgba(255,255,255,.06);white-space:nowrap;}
    .xcard-acts{display:flex;gap:.5rem;align-items:center;padding-top:.82rem;border-top:1px solid rgba(255,255,255,.05);}
    .xbtn-detail{flex:1;display:flex;align-items:center;justify-content:center;gap:.4rem;background:rgba(74,144,217,.1);border:1px solid var(--ca);color:var(--ca);padding:.62rem .8rem;border-radius:10px;font-family:var(--fu);font-weight:700;font-size:.83rem;letter-spacing:.03em;cursor:pointer;transition:all .25s;}
    .xbtn-detail:hover{background:var(--ca);color:#fff;border-color:transparent;box-shadow:0 6px 22px rgba(0,0,0,.3);transform:translateY(-1px);}
    .xicobtn{position:relative;width:40px;height:40px;flex-shrink:0;display:flex;align-items:center;justify-content:center;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.09);border-radius:10px;color:rgba(220,232,245,.54);cursor:pointer;transition:all .22s;}
    .xicobtn.cust:hover{background:rgba(232,184,75,.12);border-color:rgba(232,184,75,.45);color:var(--gold);transform:rotate(45deg) scale(1.06);}
    .xicobtn.cart:hover{background:rgba(46,204,113,.12);border-color:rgba(46,204,113,.45);color:var(--green);transform:scale(1.1);}
    .xcart-badge{position:absolute;top:-7px;right:-7px;background:var(--red);color:#fff;font-size:.58rem;font-weight:700;width:17px;height:17px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:2px solid var(--bg0);animation:badgePop .35s cubic-bezier(.17,.67,.44,1.4);}
    @keyframes badgePop{from{transform:scale(0)}to{transform:scale(1)}}
    .xcard-bar{height:3px;transform:scaleX(0);transform-origin:left;transition:transform .48s cubic-bezier(.16,1,.3,1);}
    .xcard.hov .xcard-bar{transform:scaleX(1);}
    .xlist .xcard{display:grid;grid-template-columns:220px 1fr;}
    .xlist .xcard-img{height:100%;min-height:160px;}
    @media(max-width:640px){.xlist .xcard{grid-template-columns:1fr}.xlist .xcard-img{height:180px;}}

    /* pagination */
    .xpager{display:flex;justify-content:center;align-items:center;gap:.6rem;margin-top:3rem;flex-wrap:wrap;}
    .xpager-btn{background:rgba(74,144,217,.1);border:1px solid rgba(74,144,217,.27);color:var(--blue);border-radius:10px;padding:.6rem 1.2rem;font-family:var(--fu);font-weight:700;font-size:.88rem;cursor:pointer;transition:all .22s;}
    .xpager-btn:disabled{color:rgba(220,232,245,.22);cursor:not-allowed;border-color:rgba(74,144,217,.1);}
    .xpager-btn:not(:disabled):hover{background:var(--blue);color:#fff;}
    .xpager-info{font-family:var(--fu);color:var(--muted);font-size:.84rem;}

    /* cta */
    .xcta{position:relative;padding:6rem 0;background:linear-gradient(135deg,var(--bg2),#0e2e52,var(--bg2));border-top:1px solid var(--border);overflow:hidden;}
    .xcta-orb{position:absolute;width:600px;height:600px;border-radius:50%;background:radial-gradient(circle,rgba(74,144,217,.1) 0%,transparent 65%);top:-200px;right:-200px;animation:orbP 7s ease-in-out infinite;pointer-events:none;}
    @keyframes orbP{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(1.18);opacity:.65}}
    .xcta-wm{position:absolute;font-family:var(--fh);font-size:clamp(8rem,18vw,15rem);color:rgba(74,144,217,.035);right:-1rem;top:50%;transform:translateY(-50%);pointer-events:none;user-select:none;}
    .xcta-inner{display:flex;align-items:center;justify-content:space-between;gap:2.5rem;flex-wrap:wrap;}
    .xcta-ey{font-family:var(--fu);font-size:.7rem;font-weight:700;letter-spacing:.22em;text-transform:uppercase;color:var(--gold);margin-bottom:.65rem;}
    .xcta-title{font-family:var(--fh);font-size:clamp(2rem,4vw,3.4rem);line-height:1.05;margin-bottom:.9rem;}
    .xcta-hl{color:transparent;-webkit-text-stroke:2px var(--blue);display:block;}
    .xcta-desc{font-size:.94rem;color:var(--muted);line-height:1.72;max-width:420px;}
    .xcta-btns{display:flex;gap:1rem;flex-wrap:wrap;align-items:center;}
    .xcta-main{display:inline-flex;align-items:center;gap:.5rem;background:linear-gradient(135deg,var(--blue),#2060a5);color:#fff;padding:1rem 2.2rem;border-radius:13px;font-family:var(--fu);font-weight:700;font-size:1rem;letter-spacing:.05em;text-decoration:none;box-shadow:0 10px 36px rgba(74,144,217,.38);transition:all .28s;}
    .xcta-main:hover{transform:translateY(-3px);box-shadow:0 20px 52px rgba(74,144,217,.55);}
    .xcta-out{display:inline-flex;align-items:center;background:transparent;border:1.5px solid rgba(220,232,245,.22);color:rgba(220,232,245,.7);padding:1rem 1.8rem;border-radius:13px;font-family:var(--fu);font-weight:700;font-size:1rem;letter-spacing:.05em;text-decoration:none;transition:all .25s;}
    .xcta-out:hover{border-color:var(--gold);color:var(--gold);background:rgba(232,184,75,.06);transform:translateY(-2px);}

    /* overlay & modals */
    .xoverlay{position:fixed;inset:0;background:rgba(0,0,0,.88);backdrop-filter:blur(10px);z-index:1000;display:flex;align-items:center;justify-content:center;padding:1.5rem;animation:ovIn .3s ease;}
    @keyframes ovIn{from{opacity:0}to{opacity:1}}
    .xmodal{background:linear-gradient(160deg,#0c2240,#060e1c);border:1px solid rgba(74,144,217,.22);border-radius:24px;width:100%;max-height:90vh;overflow-y:auto;position:relative;animation:modIn .42s cubic-bezier(.16,1,.3,1);scrollbar-width:thin;scrollbar-color:rgba(74,144,217,.22) transparent;box-shadow:0 44px 100px rgba(0,0,0,.72);}
    @keyframes modIn{from{opacity:0;transform:scale(.93) translateY(32px)}to{opacity:1;transform:none}}
    .xmod-bar{height:4px;border-radius:24px 24px 0 0;position:sticky;top:0;z-index:10;}
    .xclose{position:absolute;top:1.1rem;right:1.1rem;z-index:20;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.12);color:rgba(220,232,245,.6);width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:.85rem;cursor:pointer;transition:all .2s;}
    .xclose:hover{background:rgba(231,76,60,.18);border-color:rgba(231,76,60,.45);color:var(--red);transform:rotate(90deg);}

    /* detail modal */
    .xdmod{max-width:920px;}
    .xdmod-top{display:grid;grid-template-columns:320px 1fr;min-height:280px;}
    @media(max-width:680px){.xdmod-top{grid-template-columns:1fr;}}
    .xdmod-imgbox{position:relative;overflow:hidden;}
    .xdmod-imgbox img{width:100%;height:100%;object-fit:cover;min-height:250px;transition:transform .5s ease;}
    .xdmod:hover .xdmod-imgbox img{transform:scale(1.05);}
    .xdmod-imgtag{position:absolute;top:1rem;left:1rem;color:#fff;font-family:var(--fu);font-size:.64rem;font-weight:700;letter-spacing:.09em;text-transform:uppercase;padding:.22rem .72rem;border-radius:100px;}
    .xdmod-info{padding:2.2rem 2rem 1.5rem 1.8rem;}
    .xdmod-cat{font-family:var(--fu);font-size:.7rem;font-weight:700;letter-spacing:.15em;text-transform:uppercase;display:block;margin-bottom:.42rem;}
    .xdmod-name{font-family:var(--fu);font-size:1.8rem;font-weight:700;line-height:1.18;margin-bottom:.3rem;}
    .xdmod-grade{display:flex;align-items:center;gap:.4rem;font-size:.79rem;color:var(--muted);margin-bottom:.5rem;}
    .xdmod-gdot{width:6px;height:6px;border-radius:50%;flex-shrink:0;}
    .xdmod-desc{font-size:.88rem;color:rgba(220,232,245,.6);line-height:1.68;margin-bottom:1.1rem;}
    .xdmod-price-row{display:flex;align-items:center;gap:1rem;margin-bottom:.8rem;flex-wrap:wrap;}
    .xdmod-price{font-family:var(--fh);font-size:2rem;line-height:1;}
    .xdmod-unit{font-size:.88rem;color:var(--muted);margin-left:2px;}
    .xdmod-stock{display:flex;align-items:center;gap:.38rem;font-family:var(--fu);font-size:.67rem;font-weight:700;letter-spacing:.09em;text-transform:uppercase;padding:.25rem .78rem;border-radius:100px;border:1px solid;}
    .xdmod-meta{display:flex;gap:1rem;flex-wrap:wrap;}
    .xdmod-mi{display:flex;align-items:center;gap:.5rem;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.07);border-radius:11px;padding:.55rem .9rem;}
    .xdmi-ico{font-size:1rem;}
    .xdmi-lbl{font-size:.62rem;color:var(--muted);font-family:var(--fu);font-weight:600;text-transform:uppercase;letter-spacing:.07em;}
    .xdmi-val{font-size:.84rem;font-weight:600;}

    /* tabs */
    .xtabs{display:flex;border-bottom:1px solid rgba(255,255,255,.07);padding:0 1.8rem;background:rgba(0,0,0,.15);}
    .xtab{padding:.9rem 1.1rem;font-family:var(--fu);font-size:.79rem;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--muted);background:none;border:none;border-bottom:2px solid transparent;cursor:pointer;transition:all .2s;margin-bottom:-1px;}
    .xtab:hover{color:var(--text);}
    .xtab.on{font-weight:700;}
    .xtab-body{padding:1.8rem;min-height:180px;}
    .xspecs-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:.52rem;}
    @media(max-width:520px){.xspecs-grid{grid-template-columns:1fr;}}
    .xspec-row{display:flex;justify-content:space-between;align-items:center;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.05);border-radius:10px;padding:.6rem .95rem;transition:background .2s;}
    .xspec-row:hover{background:rgba(255,255,255,.055);}
    .xsk{font-size:.78rem;color:var(--muted);}
    .xsv{font-size:.84rem;font-weight:700;}
    .xsizes{display:flex;flex-wrap:wrap;gap:.65rem;}
    .xsize-chip{background:transparent;border:1.5px solid;border-radius:10px;padding:.48rem 1rem;font-family:var(--fu);font-size:.84rem;font-weight:700;letter-spacing:.04em;cursor:default;transition:all .2s;}
    .xsize-chip:hover{background:rgba(255,255,255,.05);transform:translateY(-2px) scale(1.04);}
    .xhl-list{display:flex;flex-direction:column;gap:.65rem;}
    .xhl-row{display:flex;align-items:center;gap:.9rem;padding:.68rem .95rem;background:rgba(255,255,255,.03);border-radius:11px;border:1px solid rgba(255,255,255,.05);font-size:.9rem;animation:hlSlide .42s cubic-bezier(.16,1,.3,1) both;}
    @keyframes hlSlide{from{opacity:0;transform:translateX(-18px)}to{opacity:1;transform:none}}
    .xhl-num{color:#fff;font-family:var(--fh);font-size:.95rem;padding:.2rem .52rem;border-radius:7px;flex-shrink:0;min-width:34px;text-align:center;}
    .xapps{display:flex;flex-wrap:wrap;gap:.7rem;}
    .xapp-chip{display:flex;align-items:center;gap:.5rem;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:11px;padding:.62rem 1.05rem;font-size:.87rem;cursor:default;transition:all .22s;}
    .xapp-chip:hover{background:rgba(255,255,255,.07);transform:translateY(-2px);}
    .xapp-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0;}
    .xmod-footer{padding:1.25rem 1.8rem;border-top:1px solid rgba(255,255,255,.07);display:flex;gap:.75rem;flex-wrap:wrap;}
    .xmf-btn{display:inline-flex;align-items:center;gap:.5rem;border-radius:12px;padding:.85rem 1.55rem;font-family:var(--fu);font-weight:700;font-size:.95rem;letter-spacing:.04em;cursor:pointer;transition:all .26s;border:none;}
    .xmf-btn.cart{color:#fff;}
    .xmf-btn.cart:hover{filter:brightness(1.15);transform:translateY(-2px);box-shadow:0 12px 32px rgba(0,0,0,.4);}
    .xmf-btn.cust{background:rgba(232,184,75,.12);border:1px solid rgba(232,184,75,.4);color:var(--gold);}
    .xmf-btn.cust:hover{background:var(--gold);color:#040f1c;transform:translateY(-2px);}
    .xmf-link{display:inline-flex;align-items:center;background:rgba(74,144,217,.12);border:1px solid rgba(74,144,217,.35);color:var(--blue);border-radius:12px;padding:.85rem 1.55rem;font-family:var(--fu);font-weight:700;font-size:.95rem;letter-spacing:.04em;text-decoration:none;transition:all .25s;}
    .xmf-link:hover{background:var(--blue);color:#fff;transform:translateY(-2px);}

    /* customize modal */
    .xcmod{max-width:520px;}
    .xcmod-head{display:flex;align-items:center;gap:1.1rem;padding:2rem 2rem 1.2rem;border-bottom:1px solid rgba(255,255,255,.07);}
    .xcgear{animation:gearSpin 9s linear infinite;}
    @keyframes gearSpin{to{transform:rotate(360deg)}}
    .xcmod-title{font-family:var(--fu);font-size:1.4rem;font-weight:700;}
    .xcmod-sub{font-size:.84rem;font-weight:600;margin-top:2px;}
    .xcform{padding:1.5rem 2rem 2rem;display:flex;flex-direction:column;gap:1rem;}
    .xcfield{display:flex;flex-direction:column;gap:.4rem;animation:hlSlide .4s cubic-bezier(.16,1,.3,1) both;}
    .xclabel{font-family:var(--fu);font-size:.72rem;font-weight:700;letter-spacing:.09em;text-transform:uppercase;color:var(--muted);display:flex;align-items:center;gap:0;}
    .xcinput{width:100%;background:rgba(255,255,255,.04);border:1px solid rgba(74,144,217,.17);border-radius:11px;color:var(--text);font-family:var(--fb);font-size:.9rem;padding:.78rem 1rem;outline:none;box-sizing:border-box;transition:all .26s;}
    .xcinput::placeholder{color:rgba(220,232,245,.25);}
    .xcinput:focus{border-color:var(--ca,#4A90D9);background:rgba(74,144,217,.05);box-shadow:0 0 0 3px rgba(74,144,217,.08);}
    .xctarea{resize:vertical;min-height:80px;}
    .xupload-hint{margin-left:auto;font-size:.62rem;color:rgba(74,144,217,.5);font-family:var(--fu);font-weight:600;letter-spacing:.06em;text-transform:uppercase;}
    .xupzone{border:2px dashed;border-radius:14px;padding:1.6rem 1.2rem;display:flex;flex-direction:column;align-items:center;gap:.5rem;cursor:pointer;background:rgba(74,144,217,.025);transition:all .26s;position:relative;overflow:hidden;}
    .xupzone:hover,.xupzone.drag{background:rgba(74,144,217,.07);transform:scale(1.01);box-shadow:0 8px 28px rgba(0,0,0,.25);}
    .xupzone-ico{opacity:.65;transition:all .3s;}
    .xupzone:hover .xupzone-ico{opacity:1;transform:translateY(-3px);}
    .xupzone-lbl{font-family:var(--fu);font-size:.9rem;font-weight:600;}
    .xupzone-act{font-weight:700;}
    .xupzone-or{color:var(--muted);}
    .xupzone-info{font-size:.7rem;color:rgba(220,232,245,.3);font-family:var(--fu);letter-spacing:.04em;}
    .xfile-list{display:flex;flex-direction:column;gap:.45rem;margin-top:.3rem;}
    .xfile-item{display:flex;align-items:center;gap:.6rem;background:rgba(255,255,255,.04);border:1px solid rgba(74,144,217,.17);border-radius:10px;padding:.55rem .85rem;animation:hlSlide .3s cubic-bezier(.16,1,.3,1);}
    .xfile-ico{font-size:1rem;flex-shrink:0;}
    .xfile-name{flex:1;font-size:.79rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0;}
    .xfile-size{font-size:.7rem;color:var(--muted);font-family:var(--fu);flex-shrink:0;}
    .xfile-rm{background:none;border:none;color:rgba(231,76,60,.5);cursor:pointer;font-size:.7rem;padding:.15rem .3rem;border-radius:4px;transition:all .18s;flex-shrink:0;}
    .xfile-rm:hover{color:var(--red);background:rgba(231,76,60,.1);}
    .xcsubmit{display:flex;align-items:center;justify-content:center;gap:.6rem;border:none;border-radius:13px;padding:.92rem;font-family:var(--fu);font-weight:700;font-size:1rem;letter-spacing:.05em;color:#fff;cursor:pointer;margin-top:.5rem;transition:all .26s;box-shadow:0 8px 28px rgba(0,0,0,.3);}
    .xcsubmit:hover{filter:brightness(1.12);transform:translateY(-2px);box-shadow:0 14px 40px rgba(0,0,0,.4);}

    /* login modal */
    .xlmod{max-width:420px;padding:3rem 2.5rem 2.5rem;text-align:center;}
    .xlstrip{position:absolute;top:0;left:0;right:0;height:4px;background:linear-gradient(90deg,var(--blue),var(--gold),var(--blue));border-radius:24px 24px 0 0;background-size:200% 100%;animation:shimmer 3.5s linear infinite;}
    .xlico-wrap{position:relative;width:72px;height:72px;margin:0 auto 1.2rem;display:flex;align-items:center;justify-content:center;}
    .xlico{font-size:2.6rem;position:relative;z-index:1;}
    .xlring{position:absolute;inset:0;border-radius:50%;border:2px solid rgba(74,144,217,.4);animation:ringP 2.2s ease-in-out infinite;}
    @keyframes ringP{0%,100%{transform:scale(1);opacity:.5}50%{transform:scale(1.25);opacity:.12}}
    .xltitle{font-family:var(--fu);font-size:1.5rem;font-weight:700;margin-bottom:.6rem;}
    .xldesc{font-size:.87rem;color:var(--muted);line-height:1.65;margin-bottom:1.75rem;}
    .xlacts{display:flex;flex-direction:column;gap:.65rem;margin-bottom:1rem;}
    .xlprimary{display:block;background:linear-gradient(135deg,var(--blue),#2460a5);color:#fff;padding:.92rem;border-radius:13px;font-family:var(--fu);font-weight:700;font-size:1rem;letter-spacing:.05em;text-decoration:none;transition:all .26s;box-shadow:0 8px 26px rgba(74,144,217,.32);}
    .xlprimary:hover{transform:translateY(-2px);filter:brightness(1.1);}
    .xlghost{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.1);color:rgba(220,232,245,.58);padding:.88rem;border-radius:13px;font-family:var(--fu);font-weight:600;font-size:.95rem;cursor:pointer;transition:all .22s;}
    .xlghost:hover{background:rgba(255,255,255,.08);color:var(--text);}
    .xlnote{font-size:.8rem;color:rgba(220,232,245,.36);}
    .xlnote a{color:var(--blue);text-decoration:none;font-weight:600;}
    .xlnote a:hover{text-decoration:underline;}

    @media(max-width:640px){
      .xstat{padding:.9rem 1.5rem;}
      .xfilter-r1{flex-direction:column;}
      .xdd-trig{min-width:unset;width:100%;}
      .xdd-panel{min-width:unset;width:100%;}
    }
  `;

  return (
    <div className="xpage">
      <style>{CSS}</style>

      {/* Cursor */}
      <div className="xcursor" style={{ left: cursorPos.x, top: cursorPos.y }} />

      {/* Toast removed - cart no longer used */}

      {/* ═══════════════ HERO ═══════════════ */}
      <section className="xhero" ref={heroSectionRef}>
        <div className="xhero-bg" />
        <div className="xhero-ov" />
        <div className="xgrid-bg" />
        <div className="xorb xorb1" style={{ transform: `translate(${mouse.x * -28}px,${mouse.y * -18}px)` }} />
        <div className="xorb xorb2" style={{ transform: `translate(${mouse.x * 22}px,${mouse.y * 22}px)` }} />
        <div className="xorb xorb3" style={{ transform: `translate(${mouse.x * -14}px,${mouse.y * 14}px)` }} />
        {particles.map((p, i) => (
          <div key={i} className="xpt" style={{ left: p.left, top: p.top, width: p.size, height: p.size, animationDuration: p.dur, animationDelay: p.del }} />
        ))}
        <div className="xline1" /><div className="xline2" />

        <div className={`xhero-body ${heroLoaded ? "loaded" : ""}`}>
          <div className="xeyebrow">
            <span className="xebar xebar1" />
            ShriKrishnaSteelWorks · Est. 2006 · Maharashtra
            <span className="xebar xebar2" />
          </div>
          <h1 className="xhero-title">
            <span className="xt1">PRODUCT</span>
            <span className="xt2">CATALOG</span>
            <span className="xt-badge">2024–25</span>
          </h1>
          <p className="xhero-sub">
            Premium steel furniture, railings, kitchen trolleys, hotel furniture &amp; structural solutions.
            10,000+ products across 7 categories — built for industry, designed for life.
          </p>
          <div className="xhero-ctas">
            <a href="#xcat" className="xbtn-p">
              Browse Catalog
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M7 17l9.2-9.2M17 17V7H7" /></svg>
            </a>
            <Link to="/contact" className="xbtn-g">Get Custom Quote →</Link>
          </div>
        </div>

        <div className="xscroll">
          <div className="xscroll-line"><div className="xscroll-dot" /></div>
          <span>SCROLL</span>
        </div>

        <div className="xstats">
          <StatCounter end={10000} suffix="+" label="Products" />
          <StatCounter end={7} suffix="" label="Categories" />
          <StatCounter end={18} suffix="+" label="Years Experience" />
          <StatCounter end={5000} suffix="+" label="Happy Clients" />
          <StatCounter end={99} suffix="%" label="On-Time Delivery" />
        </div>
        <div className="xhero-cut" />
      </section>

      {/* ═══════════════ FILTER ═══════════════ */}
      <section className="xfilter" id="xcat">
        <div className="xshimmer-line" />
        <div className="xwrap">
          <div className="xfilter-in">
            <div className="xfilter-r1">
              {/* Search */}
              <div className="xsearch-wrap">
                <span className="xsearch-ico">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>
                </span>
                <input className="xsearch-inp" placeholder="Search by name, category, grade, features…" value={search} onChange={e => setSearch(e.target.value)} />
                {search && <button className="xsearch-x" onClick={() => setSearch("")}>✕</button>}
              </div>

              {/* Category dropdown */}
              <div className="xdd-wrap" ref={dropdownRef}>
                <button className={`xdd-trig ${catDropdownOpen ? "open" : ""}`} onClick={() => setCatDropdownOpen(v => !v)}>
                  <span className="xdd-sym">{getCfg(activeCategory).icon}</span>
                  <span className="xdd-lbl">{activeCategory === "All" ? "All Products" : activeCategory}</span>
                  <span className="xdd-cnt">{total.toLocaleString()}</span>
                  <svg className={`xdd-chev ${catDropdownOpen ? "open" : ""}`} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 9l6 6 6-6" /></svg>
                </button>
                {catDropdownOpen && (
                  <div className="xdd-panel">
                    <div className="xdd-hdr">Filter by Category</div>
                    {CATEGORIES.map(cat => (
                      <button key={cat.id} className={`xdd-item ${activeCategory === cat.id ? "active" : ""}`}
                        onClick={() => { setActiveCategory(cat.id); setCatDropdownOpen(false); }}>
                        <span style={{ fontSize: "1rem", width: "24px", textAlign: "center", flexShrink: 0 }}>{getCfg(cat.id).icon}</span>
                        <span style={{ flex: 1, textAlign: "left" }}>{cat.label}</span>
                        <span className="xdd-item-cnt">{cat.count.toLocaleString()}</span>
                        {activeCategory === cat.id && <span className="xdd-check">✓</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="xfilter-r2">
              <div className="xresult">
                <span className="xresult-n">{total.toLocaleString()}</span>
                <span>product{total !== 1 ? "s" : ""} found</span>
                {activeCategory !== "All" && <button className="xclear-btn" onClick={() => setActiveCategory("All")}>Clear ✕</button>}
                {debouncedSearch && <button className="xclear-btn" onClick={() => setSearch("")}>Clear Search ✕</button>}
              </div>
              <div className="xview-toggle">
                <button className={`xvbtn ${viewMode === "grid" ? "on" : ""}`} onClick={() => setViewMode("grid")} title="Grid">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg>
                </button>
                <button className={`xvbtn ${viewMode === "list" ? "on" : ""}`} onClick={() => setViewMode("list")} title="List">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════ GRID ═══════════════ */}
      <section className="xsection" ref={gridSectionRef}>
        <div className="xwrap">
          {loading ? (
            <div className="xloading"><div className="xloader" /><span className="xloading-t">Loading products…</span></div>
          ) : filtered.length === 0 ? (
            <div className="xempty">
              <span className="xempty-ico">🔩</span>
              <h3>No products found</h3>
              <p>Try a different search term or browse all categories</p>
              <button className="xempty-btn" onClick={() => { setSearch(""); setActiveCategory("All"); }}>Reset Filters</button>
            </div>
          ) : (
            <div className={`xgrid ${viewMode === "list" ? "xlist" : ""}`}>
              {filtered.map((product, i) => {
                const avClass = product.stock === "In Stock" ? "av-in" : product.stock === "Low Stock" ? "av-low" : "av-mto";
                const cartCount = cartItems.filter(id => id === product.id).length;
                return (
                  <div key={product.id}
                    className={`xcard ${gridSectionInView ? "vis" : ""} ${hoveredCard === product.id ? "hov" : ""}`}
                    style={{ "--ca": product.accentColor, "--cg": product.glowColor, animationDelay: `${Math.min(i, 8) * 0.055}s` } as React.CSSProperties}
                    onMouseEnter={() => setHoveredCard(product.id)}
                    onMouseLeave={() => setHoveredCard(null)}>
                    <div className="xcard-ring" />

                    <div className="xcard-img">
                      <img
                        src={product.imageUrl}
                        alt={product.name} loading="lazy"
                      />
                      <div className="xcard-shade" />
                      <span className="xtag" style={{ background: product.accentColor }}>{product.tag}</span>
                      <div className={`xav ${avClass}`}><span className="xav-dot" />{product.stock}</div>
                      {product.customizable && (
                        <div className="xcust-badge">
                          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="3" /><path d="M12 2v2M12 20v2M2 12h2M20 12h2" /></svg>
                          Customizable
                        </div>
                      )}
                      <div className="xqv">
                        <button className="xqv-btn" onClick={() => { setDetailProduct(product); setActiveTab("specs"); }}>👁 Quick View</button>
                      </div>
                    </div>

                    <div className="xcard-body">
                      <div className="xcard-cat" style={{ color: product.accentColor }}>{product.category}</div>
                      <h3 className="xcard-name">{product.name}</h3>
                      <div className="xcard-grade">
                        <span className="xgdot" style={{ background: product.accentColor }} />
                        {product.grade}
                        <span style={{ marginLeft: "auto" }}><Stars rating={product.rating} /></span>
                      </div>
                      <p className="xcard-desc">{product.shortDesc}</p>
                      <div className="xspec-pills">
                        {Object.entries(product.specs).slice(0, 2).map(([k, v]) => (
                          <div key={k} className="xspec-pill">
                            <span className="xspk">{k}</span>
                            <span className="xspv" style={{ color: product.accentColor }}>{v}</span>
                          </div>
                        ))}
                      </div>
                      <div className="xprice-row">
                        <div className="xprice-main">
                          <span className="xprice-v" style={{ color: product.accentColor }}>{product.price}</span>
                          <span className="xprice-u">{product.unit}</span>
                        </div>
                        <div className="xprice-meta">
                          <span className="xmchip">⏱ {product.lead}</span>
                          <span className="xmchip">🛡 {product.warranty}</span>
                        </div>
                      </div>
                      <div className="xcard-acts">
                        <button className="xbtn-detail" style={{ "--ca": product.accentColor } as React.CSSProperties}
                          onClick={() => { setDetailProduct(product); setActiveTab("specs"); }}>
                          View Details
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                        </button>
                        <button className="xicobtn cust" title="Customize"
                          onClick={() => { setCustomizeProduct(product); setCustomizeForm({}); setUploadedFiles([]); }}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3" /><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" /></svg>
                        </button>
                      </div>
                    </div>
                    <div className="xcard-bar" style={{ background: `linear-gradient(90deg,${product.accentColor},transparent)` }} />
                  </div>
                );
              })}
            </div>
          )}

          {!loading && total > 12 && (
            <div className="xpager">
              <button className="xpager-btn" disabled={page === 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
              <span className="xpager-info">Page <strong>{page}</strong> of <strong>{Math.ceil(total / 12)}</strong></span>
              <button className="xpager-btn" disabled={page >= Math.ceil(total / 12)} onClick={() => setPage(p => p + 1)}>Next →</button>
            </div>
          )}
        </div>
      </section>

      {/* ═══════════════ CTA ═══════════════ */}
      <section className="xcta">
        <div className="xcta-orb" />
        <div className="xcta-wm">STEEL</div>
        <div className="xwrap">
          <div className="xcta-inner">
            <div>
              <div className="xcta-ey">Start a Project</div>
              <h2 className="xcta-title">Need a Custom<span className="xcta-hl">Steel Solution?</span></h2>
              <p className="xcta-desc">Share your requirements — our engineers respond within 24 hours with grade, size and pricing tailored to your project.</p>
            </div>
            <div className="xcta-btns">
              <Link to="/contact" className="xcta-main">Get a Quote <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M7 17l9.2-9.2M17 17V7H7" /></svg></Link>
              <Link to="/projects" className="xcta-out">View Projects</Link>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════ DETAIL MODAL ═══════════════ */}
      {detailProduct && (
        <div className="xoverlay" onClick={() => setDetailProduct(null)}>
          <div className="xmodal xdmod" onClick={e => e.stopPropagation()} style={{ "--ca": detailProduct.accentColor, "--cg": detailProduct.glowColor } as React.CSSProperties}>
            <button className="xclose" onClick={() => setDetailProduct(null)}>✕</button>
            <div className="xmod-bar" style={{ background: detailProduct.accentColor }} />
            <div className="xdmod-top">
              <div className="xdmod-imgbox">
                <img src={detailProduct.imageUrl} alt={detailProduct.name} />
                <div className="xdmod-imgtag" style={{ background: detailProduct.accentColor }}>{detailProduct.tag}</div>
              </div>
              <div className="xdmod-info">
                <span className="xdmod-cat" style={{ color: detailProduct.accentColor }}>{detailProduct.category}</span>
                <h2 className="xdmod-name">{detailProduct.name}</h2>
                <div className="xdmod-grade">
                  <span className="xdmod-gdot" style={{ background: detailProduct.accentColor }} />
                  {detailProduct.grade}
                  <span style={{ marginLeft: ".5rem" }}><Stars rating={detailProduct.rating} /></span>
                </div>
                <p className="xdmod-desc">{detailProduct.shortDesc}</p>
                <div className="xdmod-price-row">
                  <span className="xdmod-price" style={{ color: detailProduct.accentColor }}>{detailProduct.price}<span className="xdmod-unit">{detailProduct.unit}</span></span>
                  <span className={`xdmod-stock ${detailProduct.stock === "In Stock" ? "av-in" : detailProduct.stock === "Low Stock" ? "av-low" : "av-mto"}`}>
                    <span className="xav-dot" />{detailProduct.stock}
                  </span>
                </div>
                <div className="xdmod-meta">
                  {[["📦", "Min. Order", detailProduct.minOrder], ["⏱", "Lead Time", detailProduct.lead], ["🛡", "Warranty", detailProduct.warranty], ["✨", "Finish", detailProduct.finish]].map(([ic, lbl, val]) => (
                    <div key={String(lbl)} className="xdmod-mi">
                      <span className="xdmi-ico">{ic}</span>
                      <div><div className="xdmi-lbl">{lbl}</div><div className="xdmi-val">{val}</div></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="xtabs">
              {(["specs", "sizes", "highlights", "applications"] as const).map(tab => (
                <button key={tab} className={`xtab ${activeTab === tab ? "on" : ""}`}
                  style={activeTab === tab ? { borderBottomColor: detailProduct.accentColor, color: detailProduct.accentColor } : {}}
                  onClick={() => setActiveTab(tab)}>{tab.charAt(0).toUpperCase() + tab.slice(1)}</button>
              ))}
            </div>
            <div className="xtab-body">
              {activeTab === "specs" && (
                <div className="xspecs-grid">
                  {Object.entries(detailProduct.specs).map(([k, v]) => (
                    <div key={k} className="xspec-row"><span className="xsk">{k}</span><span className="xsv" style={{ color: detailProduct.accentColor }}>{v}</span></div>
                  ))}
                </div>
              )}
              {activeTab === "sizes" && (
                <div className="xsizes">
                  {detailProduct.sizes.map(s => <div key={s} className="xsize-chip" style={{ borderColor: detailProduct.accentColor, color: detailProduct.accentColor }}>{s}</div>)}
                </div>
              )}
              {activeTab === "highlights" && (
                <div className="xhl-list">
                  {detailProduct.highlights.map((h, idx) => (
                    <div key={h} className="xhl-row" style={{ animationDelay: `${idx * 0.07}s` }}>
                      <div className="xhl-num" style={{ background: detailProduct.accentColor }}>0{idx + 1}</div>
                      <span>{h}</span>
                    </div>
                  ))}
                </div>
              )}
              {activeTab === "applications" && (
                <div className="xapps">
                  {detailProduct.applications.map(a => (
                    <div key={a} className="xapp-chip"><div className="xapp-dot" style={{ background: detailProduct.accentColor }} /><span>{a}</span></div>
                  ))}
                </div>
              )}
            </div>
            <div className="xmod-footer">
              <button className="xmf-btn cust"
                onClick={() => { setCustomizeProduct(detailProduct); setDetailProduct(null); setCustomizeForm({}); setUploadedFiles([]); }}>⚙️ Customize</button>
              <Link to="/contact" className="xmf-link" onClick={() => setDetailProduct(null)}>📋 Get Quotation →</Link>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════ CUSTOMIZE MODAL ═══════════════ */}
      {customizeProduct && (
        <div className="xoverlay" onClick={() => setCustomizeProduct(null)}>
          <div className="xmodal xcmod" onClick={e => e.stopPropagation()} style={{ "--ca": customizeProduct.accentColor } as React.CSSProperties}>
            <button className="xclose" onClick={() => setCustomizeProduct(null)}>✕</button>
            <div className="xmod-bar" style={{ background: customizeProduct.accentColor }} />
            <div className="xcmod-head">
              <div className="xcgear" style={{ color: customizeProduct.accentColor }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="3" /><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" /></svg>
              </div>
              <div>
                <div className="xcmod-title">Customize Order</div>
                <div className="xcmod-sub" style={{ color: customizeProduct.accentColor }}>{customizeProduct.name}</div>
              </div>
            </div>
            <form className="xcform" onSubmit={handleCustomizeSubmit}>
              {CUSTOMIZE_FIELDS.map((f, idx) => (
                <div key={f.name} className="xcfield" style={{ animationDelay: `${idx * 0.07}s` }}>
                  <label className="xclabel">{f.label}</label>
                  {f.type === "textarea"
                    ? <textarea className="xcinput xctarea" placeholder={f.placeholder} required={f.required} rows={3} value={customizeForm[f.name] || ""} onChange={e => setCustomizeForm(p => ({ ...p, [f.name]: e.target.value }))} />
                    : <input className="xcinput" type={f.type} placeholder={f.placeholder} required={f.required} value={customizeForm[f.name] || ""} onChange={e => setCustomizeForm(p => ({ ...p, [f.name]: e.target.value }))} />
                  }
                </div>
              ))}
              <div className="xcfield" style={{ animationDelay: `${CUSTOMIZE_FIELDS.length * 0.07}s` }}>
                <label className="xclabel">Upload Reference Files<span className="xupload-hint">PDF · PNG · DWG</span></label>
                <div className="xupzone" style={{ borderColor: `${customizeProduct.accentColor}55` }}
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={e => { e.preventDefault(); e.currentTarget.classList.add("drag"); }}
                  onDragLeave={e => e.currentTarget.classList.remove("drag")}
                  onDrop={e => { e.preventDefault(); e.currentTarget.classList.remove("drag"); if (e.dataTransfer.files) setUploadedFiles(p => [...p, ...Array.from(e.dataTransfer.files)]); }}>
                  <div className="xupzone-ico" style={{ color: customizeProduct.accentColor }}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="12" y1="18" x2="12" y2="12" /><line x1="9" y1="15" x2="15" y2="15" /></svg>
                  </div>
                  <div className="xupzone-lbl">
                    <span className="xupzone-act" style={{ color: customizeProduct.accentColor }}>Click to upload</span>
                    <span className="xupzone-or"> or drag &amp; drop</span>
                  </div>
                  <div className="xupzone-info">PDF · PNG · JPG · DWG · Max 10MB each</div>
                </div>
                <input ref={fileInputRef} type="file" accept=".pdf,.png,.jpg,.jpeg,.dwg,.dxf" multiple style={{ display: "none" }} onChange={e => { if (e.target.files) setUploadedFiles(p => [...p, ...Array.from(e.target.files!)]); }} />
                {uploadedFiles.length > 0 && (
                  <div className="xfile-list">
                    {uploadedFiles.map((file, idx) => (
                      <div key={idx} className="xfile-item">
                        <span className="xfile-ico">{file.type === "application/pdf" ? "📄" : file.type.startsWith("image/") ? "🖼️" : "📐"}</span>
                        <span className="xfile-name">{file.name}</span>
                        <span className="xfile-size">{(file.size / 1024).toFixed(0)} KB</span>
                        <button type="button" className="xfile-rm" onClick={() => setUploadedFiles(p => p.filter((_, i) => i !== idx))}>✕</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <button type="submit" className="xcsubmit" style={{ background: customizeProduct.accentColor }} disabled={submitting}>
                {submitting ? "Submitting..." : "Submit Customization Request →"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ═══════════════ LOGIN MODAL ═══════════════ */}
      {showLogin && (
        <div className="xoverlay" onClick={() => setShowLogin(false)}>
          <div className="xmodal xlmod" onClick={e => e.stopPropagation()}>
            <button className="xclose" onClick={() => setShowLogin(false)}>✕</button>
            <div className="xlstrip" />
            <div className="xlico-wrap"><div className="xlico">🔐</div><div className="xlring" /></div>
            <h2 className="xltitle">Login Required</h2>
            <p className="xldesc">To submit a customization request, please log in or create a free account.</p>
            <div className="xlacts">
              <Link to="/login" className="xlprimary" onClick={() => setShowLogin(false)}>Login to Account</Link>
              <button className="xlghost" onClick={() => setShowLogin(false)}>Continue as Guest</button>
            </div>
            <div className="xlnote">New user? <Link to="/login" onClick={() => setShowLogin(false)}>Register free →</Link></div>
          </div>
        </div>
      )}
    </div>
  );
}