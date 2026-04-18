// backend/seedFromCSV.js — run with: node seedFromCSV.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import Product from "./models/Product.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ── Simple CSV parser (handles quoted fields with commas) ──────────────────
function parseCSV(text) {
  const lines = text.split("\n").map(l => l.replace(/\r$/, ""));
  if (lines.length < 2) return [];

  const headers = parseCSVLine(lines[0]);
  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const values = parseCSVLine(line);
    const obj = {};
    headers.forEach((h, idx) => {
      obj[h] = values[idx] ?? "";
    });
    rows.push(obj);
  }
  return rows;
}

function parseCSVLine(line) {
  const result = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"' && line[i + 1] === '"') {
        current += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        current += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ',') {
        result.push(current);
        current = "";
      } else {
        current += ch;
      }
    }
  }
  result.push(current);
  return result;
}

// ── Category-based image mapping ──────────────────────────────────────────
const CATEGORY_IMAGES = {
  "Steel Furniture Works": [
    "https://images.unsplash.com/photo-1541123437800-1bb1317badc2?w=700&q=80",
    "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=700&q=80",
    "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=700&q=80",
    "https://images.unsplash.com/photo-1497366216548-37526070297c?w=700&q=80",
  ],
  "SS Railing": [
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=700&q=80",
    "https://images.unsplash.com/photo-1565538810643-b5bdb714032a?w=700&q=80",
    "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=700&q=80",
  ],
  "Kitchen Trolleys": [
    "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=700&q=80",
    "https://images.unsplash.com/photo-1565183928294-7063f23ce0f8?w=700&q=80",
    "https://images.unsplash.com/photo-1590846406792-0adc7f938f1d?w=700&q=80",
  ],
  "Hotel Furnitures": [
    "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=700&q=80",
    "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=700&q=80",
    "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=700&q=80",
  ],
  "Food Processing Machines": [
    "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=700&q=80",
    "https://images.unsplash.com/photo-1581093450021-4a7360e9a6b5?w=700&q=80",
  ],
  "Park Instruments": [
    "https://images.unsplash.com/photo-1575783970733-1aaedde1db74?w=700&q=80",
    "https://images.unsplash.com/photo-1519331379826-f10be5486c6f?w=700&q=80",
    "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=700&q=80",
  ],
  "Commercial Building Structures": [
    "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=700&q=80",
    "https://images.unsplash.com/photo-1590859808308-3d2d9c515b1a?w=700&q=80",
    "https://images.unsplash.com/photo-1565008447742-97f6f38c985c?w=700&q=80",
  ],
  "Home Steel Furnitures": [
    "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=700&q=80",
    "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=700&q=80",
    "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=700&q=80",
    "https://images.unsplash.com/photo-1497366216548-37526070297c?w=700&q=80",
  ],
};

function getImage(category, index) {
  const imgs = CATEGORY_IMAGES[category] || CATEGORY_IMAGES["Steel Furniture Works"];
  return imgs[index % imgs.length];
}

// ── Main seed function ────────────────────────────────────────────────────
async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("✅ Connected to MongoDB");

  // Read CSV
  const csvPath = path.join(__dirname, "ProductData_Enhanced.csv");
  const csvText = fs.readFileSync(csvPath, "utf-8");
  const rows = parseCSV(csvText);
  console.log(`📄 Parsed ${rows.length} products from CSV`);

  // Track per-category indices for image assignment
  const catCount = {};

  // Map CSV rows to Product schema
  const products = rows.map(row => {
    const cat = row.category || "Steel Furniture Works";
    catCount[cat] = (catCount[cat] || 0) + 1;

    return {
      productId:                row.productId,
      productName:              row.productName,
      category:                 cat,
      furnitureType:            row.furnitureType || "",
      modelNumber:              row.modelNumber || "",
      brandName:                row.brandName || "ShriKrishnaSteelWorks",
      availability:             row.availability || "In Stock",
      steelGrade:               row.steelGrade || "",
      topMaterial:              row.topMaterial || "",
      frameMaterial:            row.frameMaterial || "",
      frameThickness:           row.frameThickness || "",
      surfaceFinish:            row.surfaceFinish || "",
      enclosureMaterial:        row.enclosureMaterial || "",
      color:                    row.color || "",
      corrosionResistanceLevel: row.corrosionResistanceLevel || "",
      loadCapacityKg:           parseFloat(row.loadCapacityKg) || 0,
      seatingCapacity:          row.seatingCapacity || null,
      usageArea:                row.usageArea || "",
      recommendedFor:           row.recommendedFor || "",
      length_cm:                parseFloat(row.length_cm) || 0,
      width_cm:                 parseFloat(row.width_cm) || 0,
      height_cm:                parseFloat(row.height_cm) || 0,
      weight_kg:                parseFloat(row.weight_kg) || 0,
      maximumWeightRecommendation_kg: parseFloat(row.maximumWeightRecommendation_kg) || 0,
      basePriceINR:             parseFloat(row.basePriceINR) || 0,
      discountPercentage:       parseFloat(row.discountPercentage) || 0,
      finalPriceINR:            parseFloat(row.finalPriceINR) || 0,
      stockQuantity:            parseInt(row.stockQuantity) || 0,
      rating:                   parseFloat(row.rating) || 4.0,
      reviewsCount:             parseInt(row.reviewsCount) || 0,
      salesCount:               parseInt(row.salesCount) || 0,
      warrantyYears:            parseInt(row.warrantyYears) || 1,
      productDescription:       row.productDescription || "",
      features:                 row.features || "",
      leadTimeDays:             parseInt(row.leadTimeDays) || 7,
      installationSupport:      row.installationSupport || "No",
      maintenanceRequired:      row.maintenanceRequired || "Low",
      countryOfOrigin:          row.countryOfOrigin || "India",
      createdAt:                row.createdAt || new Date().toISOString().slice(0, 10),
      customizationAvailable:   row.installationSupport || "No",
      imageUrl:                 getImage(cat, catCount[cat] - 1),
    };
  });

  // Clear and insert
  await Product.deleteMany({});
  console.log("🗑  Cleared existing products");

  // Use insertMany with ordered:false to skip duplicate productId errors
  // First deduplicate by productId (CSV has some duplicates like PRD00002)
  const uniqueMap = new Map();
  products.forEach(p => {
    if (!uniqueMap.has(p.productId)) {
      uniqueMap.set(p.productId, p);
    }
  });
  const uniqueProducts = Array.from(uniqueMap.values());

  await Product.insertMany(uniqueProducts);
  console.log(`✅ Seeded ${uniqueProducts.length} products from CSV!`);

  // Summary
  const cats = {};
  uniqueProducts.forEach(p => { cats[p.category] = (cats[p.category] || 0) + 1; });
  Object.entries(cats).forEach(([c, n]) => console.log(`  • ${c}: ${n} products`));

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch(err => {
  console.error("❌ Seed error:", err);
  process.exit(1);
});
