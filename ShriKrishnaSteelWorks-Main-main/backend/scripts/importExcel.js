import 'dotenv/config';
import mongoose from 'mongoose';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import Product from '../models/Product.js';

const require = createRequire(import.meta.url);
const XLSX = require('xlsx');

const __dirname = dirname(fileURLToPath(import.meta.url));

// Adjust this path to where your xlsx file actually is
const EXCEL_PATH = join(__dirname, 'ShriKrishnaSteelWorks_Industrial_ProductCatalog_10000.xlsx');

async function importData() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const workbook = XLSX.readFile(EXCEL_PATH);
    const rows = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
    console.log(`📦 Found ${rows.length} rows`);

    await Product.deleteMany({});
    console.log('🗑️  Cleared old data');

    const BATCH = 500;
    for (let i = 0; i < rows.length; i += BATCH) {
      await Product.insertMany(rows.slice(i, i + BATCH), { ordered: false });
      console.log(`  ↳ Inserted ${Math.min(i + BATCH, rows.length)}/${rows.length}`);
    }

    console.log('🎉 Import complete!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

importData();