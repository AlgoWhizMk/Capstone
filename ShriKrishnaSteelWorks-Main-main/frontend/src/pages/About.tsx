import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import founderImg from "../assets/images/vijay.png";
import companyLogo from "../assets/SK-logo.png";

// ─── LOCAL ASSETS ─────────────────────────────────────────────────────────────
// STEP 1: Save your logo   → src/assets/logos/logo.png
// STEP 2: Save founder img → src/assets/images/founder.jpg
// STEP 3: Uncomment the two lines below:
// import companyLogo from "../assets/logos/logo.png";
// import founderImg  from "../assets/images/founder.jpg";

// ─── InView Hook ─────────────────────────────────────────────────────────────
function useInView(threshold = 0.12) {
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

// ─── Static Data ──────────────────────────────────────────────────────────────
const PILLARS = [
  { icon: "🏗️", label: "Steel Supply",        desc: "TMT bars, plates, pipes, structural sections — BIS certified, every batch." },
  { icon: "⚙️", label: "Custom Fabrication",  desc: "CAD/CAM precision cutting, bending & welding from uploaded DWG files." },
  { icon: "📐", label: "Project Execution",   desc: "End-to-end structural steel for industrial, commercial & civic projects." },
  { icon: "🚚", label: "Pan-MH Delivery",     desc: "Same-week delivery across Maharashtra with real-time order tracking." },
];

const NUMBERS = [
  { value: "18+",    label: "Years"    },
  { value: "200+",   label: "Projects" },
  { value: "400+",   label: "Clients"  },
  { value: "₹50Cr+", label: "Revenue"  },
];

const VALUES = [
  { icon: "🛡️", title: "Quality First",         desc: "Every batch tested against BIS and ISO standards before leaving our yard. Zero-compromise on material grade.",            color: "#4A90D9" },
  { icon: "⏱️", title: "On-Time Delivery",       desc: "98.4% on-time delivery rate across 200+ projects. We treat deadlines as commitments, not guidelines.",                   color: "#E8B84B" },
  { icon: "💰", title: "Transparent Pricing",    desc: "No hidden charges. B2C and B2B clients get clear itemised quotations with full cost breakdowns.",                         color: "#4ADE80" },
  { icon: "🔬", title: "Technical Expertise",    desc: "Certified metallurgists and structural engineers guiding clients from specification to delivery.",                         color: "#A78BFA" },
  { icon: "🌱", title: "Sustainable Practice",   desc: "Eco-certified mill sourcing and a commitment to carbon-neutral supply chain by 2030.",                                    color: "#34D399" },
  { icon: "🤝", title: "Long-Term Partnerships", desc: "80% of our B2B revenue comes from repeat clients — because we invest in relationships, not just transactions.",           color: "#F87171" },
];

// ─── Ticker ───────────────────────────────────────────────────────────────────
function Ticker() {
  const items = ["BIS Certified Steel","18+ Years of Excellence","200+ Projects Delivered",
    "ISO 9001:2015","Pan-Maharashtra Delivery","Custom Fabrication","400+ Happy Clients","CAD/CAM Precision"];
  const doubled = [...items, ...items];
  return (
    <div className="abt-ticker-wrap" aria-hidden="true">
      <div className="abt-ticker-track">
        {doubled.map((item, i) => (
          <span key={i} className="abt-ticker-item">
            <span className="abt-ticker-dot">◆</span>{item}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── Floating Particles ───────────────────────────────────────────────────────
function Particles() {
  return (
    <div className="abt-particles" aria-hidden="true">
      {Array.from({ length: 18 }).map((_, i) => (
        <div key={i} className="abt-particle" style={{
          left: `${(i * 5.7 + 3) % 97}%`,
          animationDelay: `${(i * 0.45) % 6}s`,
          animationDuration: `${6 + (i % 4)}s`,
        }} />
      ))}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function About() {
  const { ref: heroRef,    inView: heroInView    } = useInView(0.1);
  const { ref: companyRef, inView: companyInView } = useInView(0.08);
  const { ref: founderRef, inView: founderInView } = useInView(0.08);
  const { ref: mvRef,      inView: mvInView      } = useInView(0.1);
  const { ref: valuesRef,  inView: valuesInView  } = useInView(0.08);
  const { ref: whyRef,     inView: whyInView     } = useInView(0.1);

  const heroBgRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const fn = () => {
      if (heroBgRef.current)
        heroBgRef.current.style.transform = `translateY(${window.scrollY * 0.35}px)`;
    };
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const [activeTab, setActiveTab] = useState<"mission" | "vision">("mission");

  return (
    <div className="abt-page">

      {/* ══════════════════════════ HERO ══════════════════════════════════ */}
      <section className="abt-hero" ref={heroRef}>
        <div ref={heroBgRef} className="abt-hero-bg" />
        <div className="abt-hero-overlay" />
        <Particles />
        <div className="abt-grid-lines" aria-hidden="true">
          {Array.from({ length: 8 }).map((_, i) => <div key={i} className="abt-grid-col" />)}
        </div>
        <div className="abt-hero-content">
          <div className={`abt-hero-inner ${heroInView ? "abt-hero-visible" : ""}`}>
            <div className="abt-hero-tag"><span className="abt-pulse" />Our Story</div>
            <h1 className="abt-hero-title">
              <span>18 Years of</span>
              <span className="abt-stroke-text">Steel Excellence</span>
            </h1>
            <p className="abt-hero-sub">
              From a single trading desk in Nagpur to Maharashtra's most trusted industrial
              steel brand — built on precision, integrity, and an unshakeable commitment to quality.
            </p>
            <div className="abt-hero-stats">
              {NUMBERS.map((s) => (
                <div key={s.label} className="abt-mini-stat">
                  <span className="abt-mini-val">{s.value}</span>
                  <span className="abt-mini-label">{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="abt-scroll-cue"><div className="abt-scroll-line" /><span>SCROLL</span></div>
      </section>

      {/* ══════════════════════════ TICKER ════════════════════════════════ */}
      <Ticker />

      {/* ══════════════════ COMPANY IDENTITY ══════════════════════════════
           Logo · Who We Are · What We Do
      ════════════════════════════════════════════════════════════════════ */}
      <section className="abt-company-section" ref={companyRef}>
        <div className="abt-company-geo" aria-hidden="true">
          <div className="abt-geo-ring abt-geo-r1" />
          <div className="abt-geo-ring abt-geo-r2" />
          <div className="abt-geo-ring abt-geo-r3" />
        </div>

        <div className="abt-company-inner">

          {/* ── Brand column ── */}
          <div className={`abt-brand-col ${companyInView ? "abt-brand-visible" : ""}`}>
            <div className="abt-brand-logo-wrap">
              {/*
                ─── TO USE YOUR LOGO ──────────────────────────────────────
                1. Save logo as:  src/assets/logos/logo.png
                2. Uncomment at top of file:
                   import companyLogo from "../assets/logos/logo.png";
                3. Replace the placeholder div below with:
                   <img src={companyLogo} alt="ShriKrishnaSteelWorks" className="abt-brand-logo-img" />
                ──────────────────────────────────────────────────────────
              */}
              <img src={companyLogo} alt="ShriKrishnaSteelWorks" className="abt-brand-logo-img" />
              <div className="abt-brand-logo-glow" />
            </div>

            <div className="abt-brand-name-block">
              <h2 className="abt-brand-name">ShriKrishna<br />SteelWorks</h2>
              <div className="abt-brand-tagline">Forge. Build. Deliver.</div>
            </div>

            <div className="abt-brand-since">
              <span className="abt-since-line" />
              <span className="abt-since-text">Established 2006 · Satara, Maharashtra</span>
              <span className="abt-since-line" />
            </div>

            
          </div>

          {/* ── What We Do column ── */}
          <div className={`abt-whatwedo-col ${companyInView ? "abt-whatwedo-visible" : ""}`}>
            <div className="abt-section-tag-inline">Who We Are</div>
            <h3 className="abt-whatwedo-heading">
              Maharashtra's End-to-End<br />
              <span className="abt-highlight-text">Industrial Steel Partner</span>
            </h3>
            <p className="abt-whatwedo-body">
              ShriKrishnaSteelWorks is Central Maharashtra's most trusted steel supply and
              project fabrication company. Since 2006, we have supplied over{" "}
              <strong>1.8 lakh MT of certified steel</strong> to builders, contractors, and
              industrial clients — backed by BIS certification, ISO quality systems, and an
              in-house CAD/CAM fabrication unit.
            </p>
            <p className="abt-whatwedo-body">
              We are not just a steel dealer. We are your complete project partner — from raw
              material procurement to custom fabrication, structural erection, and real-time
              delivery tracking across Maharashtra.
            </p>

            <div className="abt-pillars-grid">
              {PILLARS.map((p, i) => (
                <div
                  key={p.label}
                  className={`abt-pillar-card ${companyInView ? "abt-pillar-visible" : ""}`}
                  style={{ animationDelay: `${0.3 + i * 0.1}s` }}
                >
                  <span className="abt-pillar-icon">{p.icon}</span>
                  <div>
                    <div className="abt-pillar-label">{p.label}</div>
                    <div className="abt-pillar-desc">{p.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Number strip */}
        <div className={`abt-number-strip ${companyInView ? "abt-strip-visible" : ""}`}>
          {NUMBERS.map((n, i) => (
            <div key={n.label} className="abt-num-item" style={{ animationDelay: `${0.5 + i * 0.12}s` }}>
              <span className="abt-num-value">{n.value}</span>
              <span className="abt-num-label">{n.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════ FOUNDER'S MESSAGE ═════════════════════════════ */}
      <section className="abt-founder-section" ref={founderRef}>
        <div className="abt-founder-bg-text" aria-hidden="true">FOUNDER</div>

        <div className="abt-founder-inner">

          {/* Photo column */}
          <div className={`abt-founder-photo-col ${founderInView ? "abt-founder-photo-visible" : ""}`}>
            <div className="abt-founder-frame">
              <div className="abt-frame-corner abt-fc-tl" />
              <div className="abt-frame-corner abt-fc-tr" />
              <div className="abt-frame-corner abt-fc-bl" />
              <div className="abt-frame-corner abt-fc-br" />

              {/*
                ─── TO USE FOUNDER PHOTO ──────────────────────────────────
                1. Save image as: src/assets/images/founder.jpg
                2. Uncomment at top of file:
                   import founderImg from "../assets/images/founder.jpg";
                3. Replace placeholder div below with:
                   <img src={founderImg} alt="Shri Krishna Agrawal" className="abt-founder-img" />
                ──────────────────────────────────────────────────────────
              */}
              <img src={founderImg} alt="Mr. Vijay Khambe" className="abt-founder-img" />

              <div className="abt-founder-nameplate">
                <div className="abt-nameplate-name">Mr. Vijay Khambe</div>
                <div className="abt-nameplate-role">Founder & Managing Director</div>
              </div>
            </div>

            <div className="abt-exp-badge">
              <div className="abt-exp-num">28+</div>
              <div className="abt-exp-label">Years in<br />Steel Industry</div>
            </div>
          </div>

          {/* Message column */}
          <div className={`abt-founder-msg-col ${founderInView ? "abt-founder-msg-visible" : ""}`}>
            <div className="abt-section-tag-inline">Founder's Message</div>
            <div className="abt-giant-quote" aria-hidden="true">"</div>

            <h2 className="abt-founder-heading">
              We Don't Just Supply Steel.<br />
              <span className="abt-highlight-text">We Build Maharashtra's Future.</span>
            </h2>

            <div className="abt-founder-text-blocks">
              <p>
                When I started ShriKrishnaSteelWorks in 2006, Nagpur was on the verge of
                an infrastructure revolution. I saw an opportunity not just to sell steel,
                but to become a <strong>trusted partner</strong> to every engineer, contractor,
                and builder who needed more than just a supplier — they needed a{" "}
                <strong>solution provider.</strong>
              </p>
              <p>
                Over 18 years, we grew from a small trading office to a full-stack steel company
                with fabrication, project execution, and now a digital platform. Every milestone
                was built on one principle:
              </p>
              <blockquote className="abt-founder-quote">
                "Never compromise on quality. Never break a promise."
              </blockquote>
              <p>
                Today, as we launch our digital ordering platform, I am proud to bring the same
                values of transparency and reliability online — making it easier for our clients
                to order, track, and customise with full confidence.
              </p>
            </div>

            <div className="abt-founder-sig">
              <div className="abt-sig-line" />
              <div className="abt-sig-name">Mr.Vijay Khambe</div>
              <div className="abt-sig-title">Founder, ShriKrishnaSteelWorks</div>
            </div>

            <div className="abt-founder-chips">
             
              <span className="abt-chip">🏗️ 200+ Projects</span>
              <span className="abt-chip">📍 Satara , MH</span>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════ MISSION & VISION — Tabbed ═════════════════════ */}
      <section className="abt-mv-section" ref={mvRef}>
        <div className="abt-mv-bg-geo" aria-hidden="true">
          <div className="abt-mv-hex" /><div className="abt-mv-hex abt-mv-hex2" />
        </div>

        <div className="abt-mv-inner">
          <div className="abt-mv-header">
            <div className="abt-section-tag-inline">Purpose & Direction</div>
            <h2 className="abt-mv-main-heading">
              What Drives<br />
              <span className="abt-stroke-text">ShriKrishnaSteelWorks</span>
            </h2>
          </div>

          {/* Tabs */}
          <div className={`abt-mv-tabs ${mvInView ? "abt-mv-tabs-visible" : ""}`}>
            <button
              className={`abt-mv-tab ${activeTab === "mission" ? "abt-tab-active" : ""}`}
              onClick={() => setActiveTab("mission")}
            >
              <span className="abt-tab-icon">🎯</span> Our Mission
            </button>
            <div className="abt-tab-divider">⚡</div>
            <button
              className={`abt-mv-tab ${activeTab === "vision" ? "abt-tab-active abt-tab-gold" : ""}`}
              onClick={() => setActiveTab("vision")}
            >
              <span className="abt-tab-icon">🔭</span> Our Vision
            </button>
          </div>

          {/* Panel */}
          <div className={`abt-mv-panel ${mvInView ? "abt-mv-panel-visible" : ""}`}>
            {activeTab === "mission" ? (
              <div className="abt-mv-content abt-mv-animate" key="mission">
                <div className="abt-mv-big-icon">🎯</div>
                <div className="abt-mv-split">
                  <div className="abt-mv-split-text">
                    <h3 className="abt-mv-card-heading">Forge Maharashtra's Infrastructure</h3>
                    <p className="abt-mv-card-body">
                      To be the most reliable steel supply and fabrication partner for
                      Maharashtra's builders, contractors, and industrialists — delivering
                      certified, precision-grade steel on time, every time, at transparent prices.
                    </p>
                  </div>
                  <div className="abt-mv-split-points">
                    {["Certified quality on every shipment","Pan-Maharashtra same-week delivery","Dedicated account support for B2B clients"].map((pt, i) => (
                      <div key={i} className="abt-mv-point" style={{ animationDelay: `${i * 0.12}s` }}>
                        <span className="abt-mv-point-icon">✦</span><span>{pt}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="abt-mv-metrics">
                  {[{ v: "98.4%", l: "On-Time Delivery" },{ v: "200+", l: "Projects Completed" },{ v: "Zero", l: "Quality Rejections*" }].map((m) => (
                    <div key={m.l} className="abt-mv-metric">
                      <span className="abt-mv-metric-val">{m.v}</span>
                      <span className="abt-mv-metric-label">{m.l}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="abt-mv-content abt-mv-animate" key="vision">
                <div className="abt-mv-big-icon">🔭</div>
                <div className="abt-mv-split">
                  <div className="abt-mv-split-text">
                    <h3 className="abt-mv-card-heading abt-heading-gold">India's Most Trusted Steel Platform</h3>
                    <p className="abt-mv-card-body">
                      To build a technology-driven industrial steel ecosystem that connects clients,
                      products, and projects seamlessly — making quality steel accessible, trackable,
                      and customisable for every Indian builder by 2030.
                    </p>
                  </div>
                  <div className="abt-mv-split-points">
                    {["Digital-first ordering and project tracking","Expand to 5 states by 2027","Carbon-neutral supply chain by 2030"].map((pt, i) => (
                      <div key={i} className="abt-mv-point" style={{ animationDelay: `${i * 0.12}s` }}>
                        <span className="abt-mv-point-icon" style={{ color: "var(--gold)" }}>✦</span><span>{pt}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="abt-mv-metrics">
                  {[{ v: "2027", l: "5-State Expansion" },{ v: "2030", l: "Carbon-Neutral" },{ v: "1M+", l: "MT Steel by 2030" }].map((m) => (
                    <div key={m.l} className="abt-mv-metric">
                      <span className="abt-mv-metric-val" style={{ color: "var(--gold)" }}>{m.v}</span>
                      <span className="abt-mv-metric-label">{m.l}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ══════════════════ CORE VALUES ════════════════════════════════════ */}
      <section className="abt-values-section" ref={valuesRef}>
        <div className="abt-values-bg-deco" aria-hidden="true">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className={`abt-val-bg-hex abt-vbh-${i + 1}`} />
          ))}
        </div>

        <div className="abt-values-inner">
          <div className="abt-section-header-centered">
            <div className="skw-section-tag skw-tag-light">Core Values</div>
            <h2 className="skw-section-heading skw-heading-light">What We Stand For</h2>
            <p className="skw-section-sub skw-sub-light">
              The principles guiding every decision — from mill procurement to last-mile delivery.
            </p>
          </div>

          <div className="abt-values-grid-new">
            {VALUES.map((v, i) => (
              <div
                key={v.title}
                className={`abt-val-card-new ${valuesInView ? "abt-val-new-visible" : ""}`}
                style={{ animationDelay: `${i * 0.11}s`, "--val-color": v.color } as React.CSSProperties}
              >
                <div className="abt-val-top-bar" />
                <div className="abt-val-icon-wrap">
                  <span className="abt-val-icon-new">{v.icon}</span>
                </div>
                <h3 className="abt-val-title-new">{v.title}</h3>
                <p className="abt-val-desc-new">{v.desc}</p>
                <div className="abt-val-corner-accent" aria-hidden="true" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════ WHY CHOOSE US ══════════════════════════════════ */}
      <section className="abt-why-section" ref={whyRef}>
        <div className="abt-why-inner">
          <div className={`abt-why-text ${whyInView ? "abt-why-visible" : ""}`}>
            <div className="skw-section-tag">Why ShriKrishnaSteelWorks</div>
            <h2 className="skw-section-heading">Maharashtra's Most Reliable Steel Partner</h2>
            <p className="abt-why-body">
              With 18 years of proven track record, BIS + ISO certifications, a full fabrication
              unit, and now a digital ordering platform — we are the only steel company in Central
              Maharashtra that offers end-to-end service from raw material to project completion.
            </p>
            <div className="abt-why-checklist">
              {["BIS-certified steel, every batch","ISO 9001:2015 quality processes","Custom CAD/CAM fabrication","B2B special pricing for contractors","Real-time project tracking","Pan-Maharashtra delivery network","Dedicated account manager for B2B","Digital ordering and invoicing"].map((item, i) => (
                <div key={item} className={`abt-check-item ${whyInView ? "abt-check-visible" : ""}`} style={{ animationDelay: `${0.2 + i * 0.07}s` }}>
                  <span className="abt-check-icon">✓</span><span>{item}</span>
                </div>
              ))}
            </div>
            <div className="abt-why-ctas">
              <Link to="/products" className="skw-btn-primary">Browse Products →</Link>
              <Link to="/contact" className="skw-btn-outline">Get a Quote</Link>
            </div>
          </div>

         <div className="abt-why-visual">
  <div className="abt-why-img-wrap">
    <img src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=700&q=80" alt="Steel facility" className="abt-why-img" />
    <div className="abt-why-img-overlay" />
  </div>
  <div className="abt-why-floating-card abt-wfc-1">
    <div className="abt-wfc-icon">🚚</div>
    <div className="abt-wfc-stat">98.4%</div>
    <div className="abt-wfc-label">On-Time Delivery</div>
  </div>
  <div className="abt-why-floating-card abt-wfc-2">
    <div className="abt-wfc-icon">⭐</div>
    <div className="abt-wfc-stat">4.9/5</div>
    <div className="abt-wfc-label">Client Satisfaction</div>
  </div>
</div>
        </div>
      </section>

      {/* ══════════════════ CTA ════════════════════════════════════════════ */}
      <section className="abt-cta">
        <div className="abt-cta-inner">
          <h2 className="abt-cta-heading">Ready to Work With Us?</h2>
          <p className="abt-cta-sub">Join 400+ builders and contractors who trust ShriKrishnaSteelWorks.</p>
          <div className="abt-cta-btns">
            <Link to="/contact" className="skw-btn-white">Start a Conversation</Link>
            <Link to="/projects" className="skw-btn-outline-white">View Our Projects</Link>
          </div>
        </div>
        <div className="abt-cta-deco" aria-hidden="true">STEEL</div>
      </section>
    </div>
  );
}