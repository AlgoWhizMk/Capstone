/**
 * ShriKrishna SteelWorks — Bot Knowledge Base + Fallback Q&A Engine
 * Works WITHOUT a Gemini API key using keyword pattern matching.
 */

// ─── Fallback Q&A pairs (keyword → answer) ──────────────────────────────────
export const FALLBACK_QA = [
  // ── Greetings ──────────────────────────────────────────────────────────────
  {
    keywords: ["hi", "hello", "hey", "namaste", "namaskar", "jai", "greet"],
    answer: `Hello! Welcome to **ShriKrishna SteelWorks**. I'm your SKW assistant.\n\nI can help you with:\n- Product information (TMT bars, MS pipes, angles, channels, sheets)\n- Pricing & delivery details\n- How to place an order\n- Company & contact info\n\nWhat would you like to know?`,
  },

  // ── Orders ─────────────────────────────────────────────────────────────────
  {
    keywords: ["order", "buy", "purchase", "how to order", "place order", "ordering"],
    answer: `**How to Place an Order at SKW:**\n\n1. **Browse Products** — visit our /products page to see the full catalog\n2. **Add to Cart** — select your product, grade, size and quantity\n3. **Login / Sign Up** — create your account to proceed\n4. **Checkout** — provide delivery address and choose payment mode\n5. **Confirmation** — our team confirms your order within 2 hours\n\nFor large/bulk orders, we recommend contacting us directly via the **Contact page** for a custom quote.\n\n👉 Visit **/products** to start browsing.`,
  },

  // ── TMT Bars ───────────────────────────────────────────────────────────────
  {
    keywords: ["tmt", "tmt bar", "reinforcement", "rebar", "bar", "Fe-500", "Fe-550", "Fe-415", "Fe-600"],
    answer: `**TMT Bars at ShriKrishna SteelWorks:**\n\n**Grades Available:**\n- Fe-415, Fe-500, **Fe-500D** (earthquake resistant — most popular), Fe-550, Fe-550D, Fe-600\n\n**Sizes:** 8mm, 10mm, 12mm, 16mm, 20mm, 25mm, 32mm, 40mm\n\n**Standard Length:** 12 meters per bar\n\n**IS Standard:** IS 1786:2008 certified\n\n**Brands:** SAIL, TATA Tiscon, JSW Neosteel, Kamdhenu, Shyam Steel\n\n💡 *Fe-500D (12mm & 16mm) is best for residential construction — ductile and earthquake resistant.*\n\nVisit **/products** for current pricing.`,
  },

  // ── MS Pipes ───────────────────────────────────────────────────────────────
  {
    keywords: ["pipe", "ms pipe", "hollow", "shs", "rhs", "square pipe", "round pipe"],
    answer: `**MS Pipes at SKW:**\n\n**Types:**\n- Round Pipes (ERW & Seamless)\n- Square Hollow Sections (SHS): 12×12mm to 200×200mm\n- Rectangular Hollow Sections (RHS)\n\n**Sizes:** 15mm NB to 300mm NB (round)\n**Wall Thickness:** 1.6mm to 12mm\n**IS Standard:** IS 1239, IS 3589\n\n**Uses:** Plumbing, structural frameworks, fencing, scaffolding, gates, furniture.\n\nContact us for today's pricing — rates are market-linked.`,
  },

  // ── Angles ────────────────────────────────────────────────────────────────
  {
    keywords: ["angle", "ms angle", "equal angle", "unequal angle"],
    answer: `**MS Angles at SKW:**\n\n- **Equal Angles:** 25×25mm to 200×200mm\n- **Unequal Angles:** 40×25mm to 150×75mm\n- **Thickness:** 3mm to 20mm\n- IS Standard: IS 808\n\n**Uses:** Towers, trusses, shelves, frames, construction support.\n\nVisit the **Contact page** for current rates.`,
  },

  // ── Channels ─────────────────────────────────────────────────────────────
  {
    keywords: ["channel", "ms channel", "c-channel", "u-channel", "purlin"],
    answer: `**MS Channels (C/U Channels) at SKW:**\n\n- Sizes: 75mm to 400mm depth\n- IS Standard: IS 808\n\n**Uses:** Beams, purlins, crane rails, structural frameworks.\n\nContact us via the **Contact page** for pricing and availability.`,
  },

  // ── Sheets / Plates ───────────────────────────────────────────────────────
  {
    keywords: ["sheet", "plate", "hr plate", "cr sheet", "gp sheet", "galvanized", "roofing", "chequered"],
    answer: `**MS Sheets & Plates at SKW:**\n\n- **HR (Hot Rolled) Plates:** 6mm to 100mm thickness\n- **CR (Cold Rolled) Sheets:** 0.4mm to 4mm\n- **GP (Galvanized Plain):** 0.4mm to 2mm\n- **GC (Galvanized Corrugated):** Roofing & cladding\n- **Chequered Plates:** Anti-slip flooring\n\n**Uses:** Fabrication, roofing, automotive, storage tanks.\n\nVisit our **Contact page** for today's rates.`,
  },

  // ── Wire ──────────────────────────────────────────────────────────────────
  {
    keywords: ["wire", "binding wire", "wire rod", "gi wire"],
    answer: `**Wire Products at SKW:**\n\n- **Wire Rods:** 5.5mm to 14mm diameter\n- **Binding Wire (GI):** 16 gauge, 18 gauge\n\n**Uses:** Wire drawing, springs, mesh, binding in construction.\n\nContact us for bulk pricing.`,
  },

  // ── I-Beams, Flats ───────────────────────────────────────────────────────
  {
    keywords: ["beam", "i-beam", "ismb", "flat", "ms flat", "structural"],
    answer: `**Structural Steel at SKW:**\n\n- **I-Beams (ISMB/ISLB/ISWB):** 100mm to 600mm\n- **MS Flats:** Width 12mm–300mm, Thickness 3mm–50mm\n- **T-sections, Z-sections, Expanded metal mesh**\n\n**Uses:** Industrial structures, bridges, heavy fabrication.\n\nReach us via the **Contact page** for a custom quote.`,
  },

  // ── Pricing ───────────────────────────────────────────────────────────────
  {
    keywords: ["price", "rate", "cost", "how much", "pricing", "rupee", "₹", "per ton", "per kg"],
    answer: `**Pricing at ShriKrishna SteelWorks:**\n\nSteel prices are **market-linked** and change daily based on commodity rates.\n\n**Approximate ranges (market-dependent):**\n- TMT Bars: ₹55,000 – ₹70,000 per metric ton\n- MS Pipes: ₹60,000 – ₹85,000 per metric ton\n\n**Discounts available:**\n- Wholesale orders above 10 MT\n- Long-term contractor tie-ups\n- GST @18% applicable on all products\n\nFor today's exact rates, please contact our sales team via the **Contact page** or WhatsApp.`,
  },

  // ── Delivery ──────────────────────────────────────────────────────────────
  {
    keywords: ["delivery", "shipping", "dispatch", "deliver", "timeline", "how long", "when"],
    answer: `**Delivery at SKW:**\n\n- **Local city:** 1–2 business days\n- **Outstation:** 3–5 business days\n- **Same-day delivery** available for orders placed before 12:00 PM (local)\n- **Free delivery** on orders above ₹1 lakh within city limits\n\n**Modes:** Our own trucks for local, third-party logistics for long-distance.\n\nTrack your order anytime from your **Dashboard** after logging in.`,
  },

  // ── MOQ ──────────────────────────────────────────────────────────────────
  {
    keywords: ["minimum", "moq", "minimum order", "small order", "retail", "50 kg", "1 ton"],
    answer: `**Minimum Order Quantity (MOQ):**\n\n- **Standard/B2B:** 1 metric ton\n- **Retail/Small orders:** 50 kg minimum\n\nWe serve everyone — individual home builders, contractors, and large companies alike.\n\nQuestions? Visit our **Contact page**.`,
  },

  // ── Payment ───────────────────────────────────────────────────────────────
  {
    keywords: ["payment", "pay", "upi", "bank transfer", "cheque", "neft", "rtgs", "credit"],
    answer: `**Payment Modes at SKW:**\n\n- **UPI:** GPay, PhonePe, Paytm — instant\n- **Bank Transfer:** NEFT / RTGS / IMPS\n- **Cheque:** Account payee (3–5 day clearance before dispatch)\n- **Credit Terms:** 30/60 day credit for verified business customers\n\n⚠️ Cash not accepted above ₹2,00,000 (as per IT regulations).\n\nFor credit account setup, contact us via the **Contact page**.`,
  },

  // ── Quality / IS Certification ────────────────────────────────────────────
  {
    keywords: ["quality", "certified", "is standard", "certification", "mtr", "test report", "is 1786"],
    answer: `**Quality & Certification at SKW:**\n\n- All TMT bars conform to **IS 1786:2008**\n- **Mill Test Reports (MTR)** and IS certificates available on request\n- Products sourced from certified mills: SAIL, TATA Tiscon, JSW Neosteel\n- **Zero quality complaints** from our certified mill stock\n\nFor bulk orders, we always provide documentation. Contact us for details.`,
  },

  // ── Return / Warranty ─────────────────────────────────────────────────────
  {
    keywords: ["return", "refund", "replace", "warranty", "defect", "quality issue"],
    answer: `**Return Policy at SKW:**\n\n- **7-day return window** for quality issues from delivery date\n- Material must be in original condition and packaging\n- Arrange return pickup via our Contact page\n\nWe stand by our product quality — all stock is certified mill-grade.`,
  },

  // ── Services ──────────────────────────────────────────────────────────────
  {
    keywords: ["service", "cutting", "bending", "custom", "fabrication", "consultation"],
    answer: `**Services at ShriKrishna SteelWorks:**\n\n1. **Custom Cutting & Shearing** — cut to your exact specified lengths\n2. **Bending Services** — angle bending, ring-making for construction\n3. **Home/Site Delivery** — direct to your construction site\n4. **Bulk B2B Supply** — for contractors, builders, infrastructure companies\n5. **Online Order Tracking** — via your dashboard after login\n6. **Expert Consultation** — our team advises on the right grade & size for your project\n\nReach us via the **Contact page** for service queries.`,
  },

  // ── Bulk / B2B ───────────────────────────────────────────────────────────
  {
    keywords: ["bulk", "b2b", "wholesale", "large order", "contractor", "builder", "business"],
    answer: `**Bulk / B2B Orders at SKW:**\n\n- Dedicated pricing for orders above **10 metric tons**\n- Credit terms available (30/60 days) for verified businesses\n- Dedicated account manager for large project supplies\n- Free delivery within city limits on orders above ₹1 lakh\n- Can supply to multiple project sites under one account\n\nContact our B2B team directly via the **Contact page** for custom quotes.`,
  },

  // ── Contact ───────────────────────────────────────────────────────────────
  {
    keywords: ["contact", "reach", "phone", "whatsapp", "email", "address", "call", "support"],
    answer: `**Contact ShriKrishna SteelWorks:**\n\n- **Contact Form:** Available on our **/contact** page\n- **WhatsApp:** Link available on the Contact page\n- **Email:** Via contact form on the website\n- **Working Hours:** Monday–Saturday, 9:00 AM – 7:00 PM IST\n- **Emergency Supply:** 24/7 for large ongoing project queries\n\n👉 Visit **/contact** to get in touch with our team.`,
  },

  // ── Track Order ───────────────────────────────────────────────────────────
  {
    keywords: ["track", "tracking", "order status", "where is my order", "shipment"],
    answer: `**Track Your Order:**\n\nLog into your account on our website and go to your **Dashboard** — order status updates are shown in real-time.\n\nIf you're not registered yet, create an account at **/signup** and link your order.`,
  },

  // ── Best TMT grade recommendation ─────────────────────────────────────────
  {
    keywords: ["best", "recommend", "which grade", "home construction", "house", "residential", "earthquake"],
    answer: `**Best Steel for Home Construction:**\n\n**Fe-500D** is our top recommendation for residential buildings.\n\n- The **'D' stands for Ductile** — higher elongation, absorbs seismic energy\n- **Earthquake resistant** (TMH/EQ grade)\n- Most popular sizes: **12mm** (slabs) and **16mm** (columns/beams)\n- Meets IS 1786:2008 standards\n\nFor commercial/industrial projects, Fe-550D or Fe-600 may be preferred. Our team can advise based on your structural drawing.\n\nContact us or visit **/products** to order.`,
  },

  // ── Storage advice ────────────────────────────────────────────────────────
  {
    keywords: ["store", "storage", "rust", "shelf life", "expire", "keep"],
    answer: `**Steel Storage Advice:**\n\n- Store in a **dry, covered area** away from moisture\n- Apply **anti-rust oil** for long-term storage\n- TMT bars don't expire but use within **6–12 months** for best results\n- Avoid direct contact with soil — use wooden planks or pallets\n- Keep bundles stacked horizontally, not vertically`,
  },

  // ── Export ───────────────────────────────────────────────────────────────
  {
    keywords: ["export", "international", "outside india", "abroad", "foreign"],
    answer: `At present, ShriKrishna SteelWorks supplies across **India only**. International export is under consideration for the future.\n\nFor domestic bulk supply to any Indian state, contact us via the **Contact page**.`,
  },

  // ── About company ────────────────────────────────────────────────────────
  {
    keywords: ["about", "company", "skw", "shrikrishna", "who are you", "tell me about"],
    answer: `**About ShriKrishna SteelWorks (SKW):**\n\n- **Industry:** Steel trading & distribution\n- **Tagline:** *"Strength in Every Bar, Trust in Every Deal"*\n- We are a trusted B2B & B2C steel supplier for construction & infrastructure\n- Products: TMT bars, MS pipes, angles, channels, sheets, structural steel\n- Certified mill-grade stock with IS standard compliance\n- Track record of 100% on-time delivery for bulk orders\n\nLearn more on our **/about** page.`,
  },

  // ── Projects ─────────────────────────────────────────────────────────────
  {
    keywords: ["project", "past project", "portfolio", "supplied to", "achievement"],
    answer: `**Our Project Portfolio:**\n\n- Multiple **residential housing** projects supplied\n- Preferred vendor for **municipal infrastructure** works\n- Supplied to **commercial complexes**, factories, bridges\n- Track record of **100% on-time delivery** for bulk orders\n- Zero quality complaints from certified mill stock\n\nSee our project gallery at **/projects**.`,
  },

  // ── Website / how to use ─────────────────────────────────────────────────
  {
    keywords: ["website", "register", "login", "sign up", "account", "dashboard", "how to use"],
    answer: `**Using the SKW Website:**\n\n1. **Register:** Go to **/signup** to create your account\n2. **Browse:** Visit **/products** to view our catalog\n3. **Order:** Add to cart and checkout — our team confirms in 2 hours\n4. **Track:** Check **/dashboard** for real-time order status\n5. **Contact:** Use **/contact** for queries or custom orders\n\nFor admin access, contact our team.`,
  },

  // ── Generic fallback ─────────────────────────────────────────────────────
  {
    keywords: ["__fallback__"],
    answer: `🤖 **AI Offline Mode**:\nI am currently running in limited offline mode because my **Gemini API key is missing** in the backend.\n\nUntil the API key is added, I can only answer direct questions about:\n- Products, pricing & delivery\n- Orders & company info\n\n*(Admin: Please add the GEMINI_API_KEY to backend/.env to unlock intelligent capabilities)*`,
  },
];

// ─── Keyword matching engine ─────────────────────────────────────────────────
export function getFallbackAnswer(userMessage) {
  const msg = userMessage.toLowerCase().trim();

  let bestMatch = null;
  let bestScore = 0;

  for (const qa of FALLBACK_QA) {
    if (qa.keywords[0] === "__fallback__") continue;
    let score = 0;
    for (const kw of qa.keywords) {
      if (msg.includes(kw.toLowerCase())) {
        score += kw.length; // longer keyword match = stronger signal
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestMatch = qa;
    }
  }

  if (bestMatch && bestScore > 0) return bestMatch.answer;

  // Return generic fallback
  return FALLBACK_QA[FALLBACK_QA.length - 1].answer;
}

// ─── Company Knowledge (injected into Gemini system prompt) ──────────────────
export const STEELWORKS_KNOWLEDGE = `
COMPANY: ShriKrishna SteelWorks (SKW)
TAGLINE: "Strength in Every Bar, Trust in Every Deal"
INDUSTRY: Steel trading & distribution

PRODUCTS:
1. TMT BARS — Fe-415, Fe-500, Fe-500D (earthquake-resistant), Fe-550, Fe-550D, Fe-600 | Sizes: 8mm–40mm | Length: 12m | IS 1786:2008
2. MS PIPES — Round/Square/Rectangular | 15mm–300mm NB | IS 1239, IS 3589
3. MS ANGLES — Equal (25×25 to 200×200mm), Unequal (40×25 to 150×75mm) | IS 808
4. MS CHANNELS — 75mm–400mm depth | IS 808
5. MS FLATS — Width 12–300mm, Thickness 3–50mm
6. MS PLATES & SHEETS — HR plates (6–100mm), CR sheets (0.4–4mm), GP & GC sheets (roofing)
7. WIRE RODS & BINDING WIRE — 5.5–14mm rods, GI binding wire 16/18 gauge
8. STRUCTURAL STEEL — I-Beams (ISMB/ISLB/ISWB) 100–600mm, chequered plates

SERVICES:
- Custom cutting & shearing to exact lengths
- Bending services (angle bending, rings)
- Home/site delivery (own trucks + 3PL)
- Bulk B2B supply for contractors/builders
- Online ordering via website dashboard
- Expert consultation on grade/size selection

PRICING (market-linked, changes daily):
- TMT bars: ₹55,000–₹70,000/MT (approx)
- MS pipes: ₹60,000–₹85,000/MT (approx)
- Wholesale discounts for orders >10 MT
- GST 18% applicable
- For exact rates: contact sales team / WhatsApp

DELIVERY:
- Local city: 1–2 days | Outstation: 3–5 days
- Same-day delivery for orders before 12 PM
- Free delivery >₹1 lakh within city
- MOQ: 1 MT standard, 50 kg for retail

PAYMENT: UPI (GPay/PhonePe/Paytm), NEFT/RTGS/IMPS, cheque, 30/60-day credit for verified businesses

QUALITY: IS 1786:2008 certified, Mill Test Reports available, brands include SAIL, TATA Tiscon, JSW Neosteel, Kamdhenu

RETURN POLICY: 7-day return for quality issues, original condition required

CONTACT: /contact page (Mon–Sat 9 AM–7 PM), WhatsApp available, 24/7 for large project emergencies

PROJECTS: Residential housing, municipal infrastructure, commercial complexes, bridges, factories
`;

export const KRISHNABOT_SYSTEM_PROMPT = `
You are the SKW Assistant — a professional, knowledgeable AI assistant for ShriKrishna SteelWorks.

IDENTITY:
- You represent ShriKrishna SteelWorks professionally
- Tone: helpful, clear, structured — like a knowledgeable sales executive
- You CAN answer general questions, but always relate back to steel/construction when relevant
- No excessive emojis. Use ** for bold key terms.

RULES:
1. Answer all steel/construction/company questions accurately using the knowledge base below
2. For general questions (greetings, GK, advice), be helpful and friendly, then offer to help with steel
3. For pricing, say rates are market-linked and recommend contacting sales for exact quotes
4. Always end with a clear next step (visit /products, /contact, or /dashboard)
5. Keep responses concise — use bullet points for multiple items
6. Never make up product specs or prices not in the knowledge base

KNOWLEDGE BASE:
${STEELWORKS_KNOWLEDGE}
`;
