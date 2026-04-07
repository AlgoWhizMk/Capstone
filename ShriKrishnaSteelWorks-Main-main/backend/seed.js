// backend/seed.js  — run with: node seed.js
import mongoose from "mongoose";
import dotenv   from "dotenv";
import User     from "./models/User.js";
import Order    from "./models/Order.js";

dotenv.config();

await mongoose.connect(process.env.MONGO_URI);
console.log("✅ Connected to:", process.env.MONGO_URI);

await User.deleteMany({});
await Order.deleteMany({});
console.log("🗑  Cleared existing data");

// ⚠️ Replace with your real Firebase UID (get it from UIDFinder component or Firebase Console)
const YOUR_FIREBASE_UID = "9GP2jUAe4udylLK5IM15ZohY8Rx2";

// ── Users ─────────────────────────────────────────────────────────────────────
await User.insertMany([
  {
    firebaseUid: YOUR_FIREBASE_UID,
    name:        "Rajesh Sharma",
    email:       "your@gmail.com",   // ← your real login email
    role:        "user",
    company:     "ABC Constructions Pvt. Ltd.",
    phone:       "9876543210",
    photoURL:    "",
    address: { street:"Plot 12, MIDC", city:"Nagpur", state:"Maharashtra", pincode:"440016" },
  },
]);
console.log("👤 Users created");

// ── Orders ────────────────────────────────────────────────────────────────────
await Order.insertMany([
  {
    orderId: "SKW-2025-001", firebaseUid: YOUR_FIREBASE_UID,
    product: "TMT Steel Bars Fe-500 (12mm)", quantity: "5 MT", amount: "₹2,10,000",
    status: "Delivered",
    isCustomized: false,
    deliveredDate: new Date("2025-01-20"),
    deliveryAddress: { street:"Plot 12, MIDC", city:"Nagpur", state:"Maharashtra", pincode:"440016" },
    notes: "Standard delivery",
    createdAt: new Date("2025-01-12"),
  },
  {
    orderId: "SKW-2025-002", firebaseUid: YOUR_FIREBASE_UID,
    product: "Custom MS Gate with Grill Work", quantity: "1 set", amount: "₹85,000",
    status: "Processing",
    isCustomized: true,
    customDetails: {
      specifications: "MS Square Pipe 40x40, ornamental design, 12ft x 4ft",
      materials:       "MS Square Pipe, Flat Bar, Decorative Scrolls",
      designNotes:     "Client approved 3D mockup on 28 Jan 2025",
      agreedTerms:     "50% advance paid. Balance on installation.",
    },
    deliveryAddress: { street:"Dharampeth", city:"Nagpur", state:"Maharashtra", pincode:"440010" },
    createdAt: new Date("2025-01-28"),
  },
  {
    orderId: "SKW-2025-003", firebaseUid: YOUR_FIREBASE_UID,
    product: "Structural Angles 50x50x5mm", quantity: "1 MT", amount: "₹42,500",
    status: "Shipped",
    isCustomized: false,
    deliveryAddress: { street:"Ring Road, Site B", city:"Amravati", state:"Maharashtra", pincode:"444601" },
    createdAt: new Date("2025-02-05"),
  },
  {
    orderId: "SKW-2025-004", firebaseUid: YOUR_FIREBASE_UID,
    product: "Custom Staircase Railing (Spiral)", quantity: "1 unit", amount: "₹1,35,000",
    status: "Pending",
    isCustomized: true,
    customDetails: {
      specifications: "Stainless steel 304, spiral design, 3m height, 1.2m dia",
      materials:       "SS 304 pipe 2 inch, handrail, balusters",
      designNotes:     "Design finalized on 18 Feb 2025. Owner approved sketch.",
      agreedTerms:     "40% advance, 60% on delivery. 1 year warranty included.",
    },
    deliveryAddress: { street:"Plot 12, MIDC", city:"Nagpur", state:"Maharashtra", pincode:"440016" },
    createdAt: new Date("2025-02-18"),
  },
  {
    orderId: "SKW-2025-005", firebaseUid: YOUR_FIREBASE_UID,
    product: "Chequered Plates 6mm", quantity: "3 MT", amount: "₹1,35,000",
    status: "Delivered",
    isCustomized: false,
    deliveredDate: new Date("2025-03-08"),
    deliveryAddress: { street:"Survey No. 45, Butibori", city:"Nagpur", state:"Maharashtra", pincode:"441108" },
    createdAt: new Date("2025-03-01"),
  },
]);
console.log("📦 Orders created (2 customized, 3 standard)");

console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
console.log("✅ Seed complete! Open MongoDB Compass to verify.");
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

await mongoose.disconnect();
process.exit(0);