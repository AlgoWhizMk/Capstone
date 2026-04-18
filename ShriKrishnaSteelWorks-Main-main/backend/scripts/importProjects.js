import 'dotenv/config';
import mongoose from 'mongoose';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import Project from '../models/Project.js';

const require = createRequire(import.meta.url);
const XLSX = require('xlsx');

const __dirname = dirname(fileURLToPath(import.meta.url));
const EXCEL_PATH = join(__dirname, '../Project Dataset.csv');

function formatCurrency(amount) {
  if (!amount) return "";
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)} Cr`;
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)} Lakh`;
  return `₹${amount.toLocaleString('en-IN')}`;
}

async function importProjects() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const workbook = XLSX.readFile(EXCEL_PATH);
    const rows = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
    console.log(`📦 Found ${rows.length} rows`);

    await Project.deleteMany({});
    console.log('🗑️  Cleared old data in projects collection');

    const BATCH = 500;
    for (let i = 0; i < rows.length; i += BATCH) {
      const batchRows = rows.slice(i, i + BATCH).map(row => {
        // Map excel data to mongo schema
        let status = "Planning";
        if (row.projectStatus === "Completed") status = "Completed";
        else if (row.projectStatus === "In Progress" || row.projectStatus === "Ongoing") status = "Ongoing";

        return {
          projectId: row.projectId,
          title: row.projectName || "Untitled Project",
          name: row.projectName || "Untitled Project",
          category: row.category || "Industrial",
          client: row.clientName || "",
          location: row.projectCity || "",
          district: row.projectCity || "",
          status: status,
          description: row.majorChallenge || row.projectType || "",
          startDate: row.startDate || "",
          targetDate: row.plannedEndDate || "",
          endDate: row.actualEndDate || "",
          value: row.finalContractValueINR || 0,
          budget: formatCurrency(row.finalContractValueINR),
          progress: Number(row.completionPercentage) || 0,
          workers: Number(row.numberOfWorkers) || 0,
          steelUsed: row.totalSteelWeight_MT ? `${row.totalSteelWeight_MT} MT ${row.steelGrade}` : "",
          area: row.projectArea_sqft ? `${row.projectArea_sqft} sq ft` : "",
          images: [],
          tags: [row.steelGrade, row.projectType].filter(Boolean),
          highlights: [
            row.customizationDone === 'Yes' ? "Customized Design" : "",
            row.qualityStandard,
          ].filter(Boolean),
          customizable: row.customizationDone === "Yes",
          customizationDetails: row.customizationDone === "Yes" ? "Custom requirements per client specifications" : "",
        };
      });

      await Project.insertMany(batchRows, { ordered: false });
      console.log(`  ↳ Inserted ${Math.min(i + BATCH, rows.length)}/${rows.length}`);
    }

    console.log('🎉 Project import complete!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

importProjects();
