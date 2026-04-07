import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import "../contact-styles.css";

// ─── InView Hook ──────────────────────────────────────────────────────────────
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

// ─── Form Field ───────────────────────────────────────────────────────────────
function FormField({
  label, name, type = "text", placeholder, value, onChange, required, rows,
}: {
  label: string; name: string; type?: string;
  placeholder: string; value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  required?: boolean; rows?: number;
}) {
  const [focused, setFocused] = useState(false);
  const filled = value.length > 0;
  return (
    <div className={`ctc-field ${focused ? "ctc-field-focused" : ""} ${filled ? "ctc-field-filled" : ""}`}>
      <label className="ctc-label">{label}{required && <span className="ctc-required"> *</span>}</label>
      {rows ? (
        <textarea
          name={name} placeholder={placeholder} value={value} rows={rows}
          onChange={onChange} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          className="ctc-input ctc-textarea" required={required}
        />
      ) : (
        <input
          type={type} name={name} placeholder={placeholder} value={value}
          onChange={onChange} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          className="ctc-input" required={required}
        />
      )}
      <div className="ctc-field-line" />
    </div>
  );
}

// ─── Select Field ─────────────────────────────────────────────────────────────
function SelectField({
  label, name, value, onChange, options, required,
}: {
  label: string; name: string; value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: { value: string; label: string }[];
  required?: boolean;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div className={`ctc-field ctc-field-select ${focused ? "ctc-field-focused" : ""} ${value ? "ctc-field-filled" : ""}`}>
      <label className="ctc-label">{label}{required && <span className="ctc-required"> *</span>}</label>
      <select
        name={name} value={value} onChange={onChange}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        className="ctc-input ctc-select" required={required}
      >
        <option value="">Select an option</option>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      <div className="ctc-field-line" />
      <span className="ctc-select-arrow">▾</span>
    </div>
  );
}

// ─── Info Card ────────────────────────────────────────────────────────────────
function InfoCard({ icon, label, value, sub, href, delay }: {
  icon: string; label: string; value: string; sub?: string; href?: string; delay: number;
}) {
  const { ref, inView } = useInView(0.1);
  return (
    <div ref={ref} className={`ctc-info-card ${inView ? "ctc-info-card-visible" : ""}`} style={{ animationDelay: `${delay}s` }}>
      <span className="ctc-info-icon-emoji">{icon}</span>
      <div className="ctc-info-body">
        <div className="ctc-info-label">{label}</div>
        {href
          ? <a href={href} className="ctc-info-value ctc-info-link">{value}</a>
          : <div className="ctc-info-value">{value}</div>
        }
        {sub && <div className="ctc-info-sub">{sub}</div>}
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function Contact() {
  const [form, setForm] = useState({
    name: "", company: "", phone: "", email: "",
    enquiryType: "", projectType: "", steelGrade: "",
    quantity: "", message: "", timeline: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [enquiryRef, setEnquiryRef] = useState<string | null>(null);
  const heroBgRef = useRef<HTMLDivElement>(null);

  const { ref: heroRef, inView: heroInView } = useInView(0.1);
  const { ref: formRef, inView: formInView } = useInView(0.05);
  const { ref: infoRef, inView: infoInView } = useInView(0.05);
  const { ref: officeRef, inView: officeInView } = useInView(0.08);

  useEffect(() => {
    const fn = () => {
      if (heroBgRef.current)
        heroBgRef.current.style.transform = `translateY(${window.scrollY * 0.28}px)`;
    };
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 1800));
    setSubmitting(false);
    setEnquiryRef(String(Date.now()).slice(-6));
    setSubmitted(true);
  };

  const formFilled = [form.name, form.email, form.phone, form.enquiryType, form.message].filter(Boolean).length;
  const formProgress = Math.round((formFilled / 5) * 100);

  return (
    <div className="ctc-page">

      {/* ══ HERO ══════════════════════════════════════════════════════════ */}
      <section className="ctc-hero" ref={heroRef}>
        <div ref={heroBgRef} className="ctc-hero-bg" />
        <div className="ctc-hero-overlay" />

        <div className="ctc-grid-lines" aria-hidden="true">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="ctc-grid-col" style={{ animationDelay: `${i * 0.1}s` }} />
          ))}
        </div>

        {/* Deco elements */}
        <div className="ctc-hero-deco" aria-hidden="true">
          <div className="ctc-deco-ring ctc-deco-r1" />
          <div className="ctc-deco-ring ctc-deco-r2" />
          <div className="ctc-deco-tag">EST. 1998 · VIRĀR, MAHARASHTRA</div>
        </div>

        {/* Vertical label */}
        <div className="ctc-hero-vertical" aria-hidden="true">CONTACT</div>

        <div className="ctc-hero-content">
          <div className={`ctc-hero-inner ${heroInView ? "ctc-hero-visible" : ""}`}>
            <div className="ctc-hero-badge">
              <span className="ctc-badge-dot" />
              Get In Touch
            </div>
            <h1 className="ctc-hero-title">
              <span>Let's Build</span>
              <span className="ctc-title-outline">Together</span>
            </h1>
            <p className="ctc-hero-sub">
              From structural steel supply to complete fabrication and erection —
              our team is ready for your project. <strong>Response within 24 hours.</strong>
            </p>
            <div className="ctc-hero-quick-links">
              {[
                { icon: "📞", label: "Call Now", href: "tel:+919876543210", text: "+91 98765 43210" },
                { icon: "💬", label: "WhatsApp", href: "https://wa.me/919876543210", text: "Chat with us" },
                { icon: "✉️", label: "Email", href: "mailto:info@shrikrishnasteelworks.com", text: "Send Email" },
              ].map((q, i) => (
                <a key={i} href={q.href} className="ctc-quick-link" style={{ animationDelay: `${0.4 + i * 0.1}s` }} target={q.href.startsWith("http") ? "_blank" : undefined} rel="noreferrer">
                  <span className="ctc-ql-icon">{q.icon}</span>
                  <div>
                    <div className="ctc-ql-label">{q.label}</div>
                    <div className="ctc-ql-text">{q.text}</div>
                  </div>
                  <span className="ctc-ql-arrow">→</span>
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="ctc-scroll-cue"><div className="ctc-scroll-line" /><span>SCROLL</span></div>
      </section>

      {/* ══ MARQUEE ═══════════════════════════════════════════════════════ */}
      <div className="ctc-marquee-wrap">
        <div className="ctc-marquee-track">
          {[...Array(2)].map((_, rep) =>
            ["Steel Supply", "Fabrication", "Erection", "BIS Certified", "ISO 9001",
              "24hr Response", "Maharashtra", "Pan-India", "Since 1998"].map((item, i) => (
                <span key={`${rep}-${i}`} className="ctc-marquee-item">
                  <span className="ctc-marquee-dot">◆</span>{item}
                </span>
              ))
          )}
        </div>
      </div>

      {/* ══ MAIN SPLIT LAYOUT ═════════════════════════════════════════════ */}
      <section className="ctc-main">
        <div className="ctc-main-inner">

          {/* ── LEFT: FORM ─────────────────────────────────────────────── */}
          <div ref={formRef} className={`ctc-form-col ${formInView ? "ctc-form-col-visible" : ""}`}>

            <div className="ctc-form-header">
              <div className="ctc-section-tag">Project Enquiry</div>
              <h2 className="ctc-form-heading">
                Tell Us About<br />
                <span className="ctc-accent">Your Project</span>
              </h2>
              <p className="ctc-form-sub">
                Fill in your details and we'll prepare a custom quote within 24 hours.
              </p>

              {/* Progress bar */}
              {!submitted && formFilled > 0 && (
                <div className="ctc-form-progress">
                  <div className="ctc-fp-bar">
                    <div className="ctc-fp-fill" style={{ width: `${formProgress}%` }} />
                  </div>
                  <span className="ctc-fp-label">{formProgress}% complete</span>
                </div>
              )}
            </div>

            {submitted ? (
              <div className="ctc-success">
                <div className="ctc-success-icon-wrap">
                  <div className="ctc-success-ring" />
                  <div className="ctc-success-ring ctc-success-ring2" />
                  <span className="ctc-success-check">✓</span>
                </div>
                <h3 className="ctc-success-title">Enquiry Sent!</h3>
                <p className="ctc-success-msg">
                  Thank you, <strong>{form.name}</strong>. Our team will reach out within <strong>24 hours</strong> with a tailored quote.
                </p>
                <div className="ctc-success-ref">
                  Ref: <strong>SKW-{enquiryRef ?? "------"}</strong>
                </div>
                <button className="ctc-success-reset" onClick={() => { setSubmitted(false); setEnquiryRef(null); setForm({ name: "", company: "", phone: "", email: "", enquiryType: "", projectType: "", steelGrade: "", quantity: "", message: "", timeline: "" }); }}>
                  Submit Another Enquiry
                </button>
              </div>
            ) : (
              <form className="ctc-form" onSubmit={handleSubmit} noValidate>

                {/* Step labels */}
                <div className="ctc-steps">
                  {[
                    { num: "01", label: "Contact Info", done: !!(form.name && form.email) },
                    { num: "02", label: "Project Details", done: !!form.enquiryType },
                    { num: "03", label: "Message", done: !!form.message },
                  ].map(s => (
                    <div key={s.num} className={`ctc-step ${s.done ? "ctc-step-done" : ""}`}>
                      <div className="ctc-step-dot">{s.done ? "✓" : s.num}</div>
                      <span>{s.label}</span>
                    </div>
                  ))}
                </div>

                {/* ── 01: Contact Info */}
                <fieldset className="ctc-fieldset">
                  <legend className="ctc-fieldset-legend">
                    <span className="ctc-legend-num">01</span> Contact Information
                  </legend>
                  <div className="ctc-row">
                    <FormField label="Full Name" name="name" placeholder="Rajesh Sharma" value={form.name} onChange={handleChange} required />
                    <FormField label="Company" name="company" placeholder="ABC Constructions Pvt. Ltd." value={form.company} onChange={handleChange} />
                  </div>
                  <div className="ctc-row">
                    <FormField label="Phone Number" name="phone" type="tel" placeholder="+91 98765 43210" value={form.phone} onChange={handleChange} required />
                    <FormField label="Email Address" name="email" type="email" placeholder="you@company.com" value={form.email} onChange={handleChange} required />
                  </div>
                </fieldset>

                {/* ── 02: Project Details */}
                <fieldset className="ctc-fieldset">
                  <legend className="ctc-fieldset-legend">
                    <span className="ctc-legend-num">02</span> Project Details
                  </legend>
                  <div className="ctc-row">
                    <SelectField label="Enquiry Type" name="enquiryType" value={form.enquiryType} onChange={handleChange} required options={[
                      { value: "supply", label: "Steel Supply" },
                      { value: "fabrication", label: "Fabrication" },
                      { value: "erection", label: "Erection & Installation" },
                      { value: "full", label: "Supply + Fab + Erection" },
                      { value: "consultation", label: "Technical Consultation" },
                    ]} />
                    <SelectField label="Project Type" name="projectType" value={form.projectType} onChange={handleChange} options={[
                      { value: "industrial", label: "Industrial / Warehouse" },
                      { value: "commercial", label: "Commercial Building" },
                      { value: "infrastructure", label: "Infrastructure / Bridge" },
                      { value: "residential", label: "Residential" },
                      { value: "pharma", label: "Pharmaceutical / Lab" },
                      { value: "other", label: "Other" },
                    ]} />
                  </div>
                  <div className="ctc-row">
                    <SelectField label="Steel Grade" name="steelGrade" value={form.steelGrade} onChange={handleChange} options={[
                      { value: "tmt500", label: "TMT Fe500" },
                      { value: "tmt500d", label: "TMT Fe500D" },
                      { value: "tmt550d", label: "TMT Fe550D" },
                      { value: "structural", label: "Structural Sections (IS 2062)" },
                      { value: "ss316", label: "SS 316L (Stainless)" },
                      { value: "unsure", label: "Not Sure / Need Advice" },
                    ]} />
                    <FormField label="Quantity (MT)" name="quantity" placeholder="e.g. 50 MT" value={form.quantity} onChange={handleChange} />
                  </div>
                  <SelectField label="Timeline" name="timeline" value={form.timeline} onChange={handleChange} options={[
                    { value: "immediate", label: "Immediate (within 1 month)" },
                    { value: "short", label: "Short-term (1–3 months)" },
                    { value: "medium", label: "Medium-term (3–6 months)" },
                    { value: "long", label: "Long-term (6+ months)" },
                    { value: "planning", label: "Still Planning" },
                  ]} />
                </fieldset>

                {/* ── 03: Message */}
                <fieldset className="ctc-fieldset">
                  <legend className="ctc-fieldset-legend">
                    <span className="ctc-legend-num">03</span> Additional Details
                  </legend>
                  <FormField
                    label="Project Description" name="message"
                    placeholder="Describe your project — location, scope, standards (BIS, IRC), site conditions, delivery requirements..."
                    value={form.message} onChange={handleChange}
                    rows={5} required
                  />
                </fieldset>

                <button type="submit" disabled={submitting} className={`ctc-submit ${submitting ? "ctc-submit-loading" : ""}`}>
                  {submitting ? (
                    <><span className="ctc-spinner" />Sending Enquiry…</>
                  ) : (
                    <>Send Project Enquiry <span className="ctc-submit-arrow">→</span></>
                  )}
                </button>

                <p className="ctc-disclaimer">
                  We typically respond within <strong>24 hours</strong>. Your information is confidential and never shared.
                </p>
              </form>
            )}
          </div>

          {/* ── RIGHT: INFO PANEL ─────────────────────────────────────── */}
          <div ref={infoRef} className={`ctc-info-col ${infoInView ? "ctc-info-col-visible" : ""}`}>

            {/* Office Card */}
            <div className="ctc-office-card">
              <div className="ctc-oc-top">
                <div className="ctc-oc-status">
                  <span className="ctc-oc-dot" />
                  Open Now · Mon–Sat
                </div>
                <h3 className="ctc-oc-name">ShriKrishna SteelWorks</h3>
                <address className="ctc-oc-address">
                  Plot No. 42, MIDC Industrial Area,<br />
                  Virār (East), Palghar — 401 305<br />
                  Maharashtra, India
                </address>
              </div>

              {/* Google Map */}
              <div className="ctc-map-wrap" id="location">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d60185.3!2d72.791!3d19.459!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7a9b3c5e8c345%3A0x4e2321b9d12b3e2a!2sVirar%2C+Maharashtra!5e0!3m2!1sen!2sin!4v1"
                  width="100%" height="200"
                  style={{ border: 0 }}
                  allowFullScreen loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="ShriKrishna SteelWorks"
                />
                <div className="ctc-map-pin-label">📍 Virār, Maharashtra</div>
              </div>

              <div className="ctc-timings">
                {[
                  { day: "Mon – Fri", time: "9:00 AM – 6:30 PM", open: true },
                  { day: "Saturday", time: "9:00 AM – 4:00 PM", open: true },
                  { day: "Sunday", time: "Closed", open: false },
                ].map(t => (
                  <div key={t.day} className={`ctc-timing-row ${!t.open ? "ctc-timing-off" : ""}`}>
                    <span className="ctc-timing-day">{t.day}</span>
                    <span className={`ctc-timing-time ${t.open ? "ctc-timing-open" : ""}`}>{t.time}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Contact Info */}
            <div className="ctc-info-cards">
              <InfoCard icon="📞" label="Sales & Enquiry" value="+91 98765 43210" sub="WhatsApp enabled" href="tel:+919876543210" delay={0.1} />
              <InfoCard icon="🔧" label="Technical / Projects" value="+91 87654 32109" sub="For project support" href="tel:+918765432109" delay={0.2} />
              <InfoCard icon="✉️" label="Email" value="info@shrikrishnasteelworks.com" sub="Response within 24 hours" href="mailto:info@shrikrishnasteelworks.com" delay={0.3} />
            </div>

            {/* Action Buttons */}
            <div className="ctc-action-btns">
              <a href="https://wa.me/919876543210" className="ctc-action-wa" target="_blank" rel="noreferrer">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
                </svg>
                Chat on WhatsApp
              </a>
              <a href="tel:+919876543210" className="ctc-action-call">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.38a2 2 0 0 1 1.99-2.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.96a16 16 0 0 0 6 6l.94-.94a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
                Call Directly
              </a>
            </div>

            {/* Trust Strip */}
            <div ref={officeRef} className={`ctc-trust-strip ${officeInView ? "ctc-trust-visible" : ""}`}>
              {[
                { icon: "🏆", val: "ISO 9001", label: "Certified" },
                { icon: "⚙️", val: "BIS", label: "Certified Steel" },
                { icon: "📋", val: "25+", label: "Years Exp." },
                { icon: "✅", val: "Zero", label: "QC Rejections" },
              ].map((b, i) => (
                <div key={b.val} className="ctc-trust-item" style={{ animationDelay: `${i * 0.08}s` }}>
                  <span className="ctc-trust-icon">{b.icon}</span>
                  <span className="ctc-trust-val">{b.val}</span>
                  <span className="ctc-trust-label">{b.label}</span>
                </div>
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* ══ BOTTOM CTA ════════════════════════════════════════════════════ */}
      <section className="ctc-bottom-cta">
        <div className="ctc-bottom-cta-inner">
          <div>
            <h3 className="ctc-bcta-title">Looking for our product catalog?</h3>
            <p className="ctc-bcta-sub">Browse TMT bars, structural sections, pipes and more with full specs.</p>
          </div>
          <div className="ctc-bcta-btns">
            <Link to="/products" className="skw-btn-primary">Browse Products →</Link>
            <Link to="/projects" className="skw-btn-ghost">View Projects</Link>
          </div>
        </div>
      </section>

    </div>
  );
}