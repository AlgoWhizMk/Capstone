import 'dotenv/config';
import mongoose from 'mongoose';
import fs from 'fs';
import path, { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import Product from '../models/Product.js';
import Project from '../models/Project.js';

const require = createRequire(import.meta.url);
const XLSX = require('xlsx');

const __dirname = dirname(fileURLToPath(import.meta.url));

// Paths to the datasets and image directories
const PRODUCTS_CSV_PATH = join(__dirname, '../ProductData_Enhanced.csv');
const PROJECTS_CSV_PATH = join(__dirname, '../Project Dataset.csv');

const FRONTEND_PUBLIC_DIR = join(__dirname, '../../frontend/public');
const PRODUCT_IMAGES_DIR = join(FRONTEND_PUBLIC_DIR, 'Product Images');
const PROJECT_IMAGES_DIR = join(FRONTEND_PUBLIC_DIR, 'Project Images');

// Format currency for projects
function formatCurrency(amount) {
  if (!amount) return "";
  const num = Number(String(amount).replace(/[^0-9.]/g, ''));
  if (isNaN(num)) return amount;
  if (num >= 10000000) return `₹${(num / 10000000).toFixed(1)} Cr`;
  if (num >= 100000) return `₹${(num / 100000).toFixed(1)} Lakh`;
  return `₹${num.toLocaleString('en-IN')}`;
}

async function importWithImages() {
  try {
    // 1. Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Make sure images directories exist to avoid crashes
    if (!fs.existsSync(PRODUCT_IMAGES_DIR)) fs.mkdirSync(PRODUCT_IMAGES_DIR, { recursive: true });
    if (!fs.existsSync(PROJECT_IMAGES_DIR)) fs.mkdirSync(PROJECT_IMAGES_DIR, { recursive: true });

    // Read all filenames from frontend/public folders
    const allProductImageFiles = fs.readdirSync(PRODUCT_IMAGES_DIR);
    const allProjectImageFiles = fs.readdirSync(PROJECT_IMAGES_DIR);

    // ==========================================
    // IMPORT PRODUCTS
    // ==========================================
    if (fs.existsSync(PRODUCTS_CSV_PATH)) {
      console.log('📦 Reading Products dataset...');
      const productWorkbook = XLSX.readFile(PRODUCTS_CSV_PATH);
      const productRows = XLSX.utils.sheet_to_json(productWorkbook.Sheets[productWorkbook.SheetNames[0]]);
      
      await Product.deleteMany({});
      console.log('🗑️ Cleared old products');

      const uniqueProductRows = Array.from(new Map(productRows.map(r => [r.productId, r])).values());
      const mappedProducts = uniqueProductRows.map(row => {
        // Find matching images for this productId (e.g. PRD00001)
        const matchingImages = allProductImageFiles
          .filter(file => file.startsWith(row.productId))
          .sort() // Ensure PRD00001A comes before PRD00001B
          .map(file => `/Product Images/${file}`);

        return {
          ...row,
          images: matchingImages // Grouped product images array!
        };
      });

      // Insert in batches
      const PRODUCT_BATCH = 500;
      for (let i = 0; i < mappedProducts.length; i += PRODUCT_BATCH) {
        await Product.insertMany(mappedProducts.slice(i, i + PRODUCT_BATCH), { ordered: false });
      }
      console.log(`✅ Successfully imported ${mappedProducts.length} PRODUCTS with their matched images.`);
    } else {
      console.warn('⚠️ Product CSV not found at backend/ProductData_Enhanced.csv');
    }

    // ==========================================
    // IMPORT PROJECTS
    // ==========================================
    if (fs.existsSync(PROJECTS_CSV_PATH)) {
      console.log('📦 Reading Projects dataset...');
      const projectWorkbook = XLSX.readFile(PROJECTS_CSV_PATH);
      const projectRows = XLSX.utils.sheet_to_json(projectWorkbook.Sheets[projectWorkbook.SheetNames[0]]);
      
      await Project.deleteMany({});
      console.log('🗑️ Cleared old projects');

      const uniqueProjectRows = Array.from(new Map(projectRows.map(r => [r.projectId, r])).values());
      const mappedProjects = uniqueProjectRows.map(row => {
        // Map status
        let status = "Planning";
        if (row.projectStatus === "Completed") status = "Completed";
        else if (row.projectStatus === "In Progress" || row.projectStatus === "Ongoing") status = "Ongoing";

        // Find matching images based on projectType (e.g. "Hygiene Compliance Project")
        const matchingImages = allProjectImageFiles
          .filter(file => file.startsWith(row.projectType))
          .sort()
          .map(file => `/Project Images/${file}`);

        return {
          projectId: row.projectId,
          title: row.projectName || "Untitled Project",
          name: row.projectName || "Untitled Project",
          category: row.category || "Industrial",
          client: row.clientName || "",
          location: row.projectCity || "",
          district: row.projectCity || "",
          status: status,
          description: row.projectDescription || row.majorChallenge || row.projectType || "",
          startDate: row.startDate || "",
          targetDate: row.plannedEndDate || "",
          endDate: row.actualEndDate || "",
          value: Number(String(row.finalContractValueINR).replace(/[^0-9.]/g, '')) || 0,
          budget: formatCurrency(row.finalContractValueINR),
          progress: Number(String(row.completionPercentage).replace(/%/g, '')) || 0,
          workers: Number(row.numberOfWorkers) || 0,
          steelUsed: row.totalSteelWeight_MT ? `${row.totalSteelWeight_MT} MT ${row.steelGrade}` : "",
          area: row.projectArea_sqft ? `${row.projectArea_sqft} sq ft` : "",
          images: matchingImages, // Automatically assigned!
          tags: [row.steelGrade, row.projectType].filter(Boolean),
          highlights: [
            row.customizationDone === 'Yes' ? "Customized Design" : "",
            row.qualityStandard,
            row.projectFeatures
          ].filter(Boolean),
          customizable: row.customizationDone === "Yes",
          customizationDetails: row.customizationDone === "Yes" ? "Custom requirements per client specifications" : "",
        };
      });

      // Insert in batches
      const BATCH = 500;
      for (let i = 0; i < mappedProjects.length; i += BATCH) {
        await Project.insertMany(mappedProjects.slice(i, i + BATCH), { ordered: false });
      }
      console.log(`✅ Successfully imported ${mappedProjects.length} PROJECTS with their matched images.`);
    } else {
      console.warn('⚠️ Project CSV not found at backend/Project Dataset.csv');
    }

    console.log('\n🎉 ALL DONE! The React frontend can now access these images using paths like /Product Images/shoe123A.jpg.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error during import:', err);
    process.exit(1);
  }
}

importWithImages();
