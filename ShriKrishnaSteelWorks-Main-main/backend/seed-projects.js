import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import csvParser from "csv-parser";
import dotenv from "dotenv";
import Project from "./models/Project.js";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/CapStoneProject";

const parseCurrency = (str) => {
  if (!str) return 0;
  const numStr = str.replace(/[^\d.-]/g, '');
  return parseFloat(numStr) || 0;
};

const mapStatus = (statusStr) => {
  if (!statusStr) return "Planning";
  const str = statusStr.trim();
  if (str === "Onngoing" || str === "Ongoing") return "Ongoing";
  if (["Planning", "In Progress", "Completed", "On Hold"].includes(str)) return str;
  return "Planning";
};

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB.");

    const imagesDir = path.resolve(process.cwd(), "../frontend/public/Project Images");
    let availableImages = [];
    if (fs.existsSync(imagesDir)) {
      availableImages = fs.readdirSync(imagesDir);
    }

    const projects = [];

    fs.createReadStream("Project Dataset.csv")
      .pipe(csvParser())
      .on("data", (row) => {
        // Derive base name for images
        let rawName = row.projectName || "";
        let cleanName = rawName.replace(/\uFFFD/g, "-");
        
        let baseName = cleanName.replace(/[^\w\s].*$/, '').trim();

        // Match images
        const rowImages = availableImages
          .filter(img => img.startsWith(baseName))
          .map(img => `/Project Images/${img}`);

        // Tags and Highlights
        const tags = [row.steelGrade, row.surfaceFinish, row.projectType, row.qualityStandard]
          .filter(t => t && t.trim() !== "");
        
        const highlights = row.projectFeatures 
          ? row.projectFeatures.split(",").map(f => f.trim()).filter(f => f !== "")
          : [];

        const projectDoc = {
          projectId: row.projectId,
          title: cleanName,
          name: cleanName,
          category: row.category,
          client: row.clientName,
          location: row.projectCity + (row.projectState ? ", " + row.projectState : ""),
          district: row.projectCity,
          status: mapStatus(row.projectStatus),
          description: row.projectDescription,
          startDate: row.startDate,
          targetDate: row.plannedEndDate,
          endDate: row.actualEndDate,
          budget: row.finalContractValueINR, // Text format
          value: parseCurrency(row.finalContractValueINR), // Numeric
          progress: parseFloat(row.completionPercentage) || 0,
          workers: parseInt(row.numberOfWorkers, 10) || 0,
          steelUsed: row.totalSteelWeight_MT ? `${row.totalSteelWeight_MT} MT` : "",
          area: row.projectArea_sqft ? `${row.projectArea_sqft} sqft` : "",
          images: rowImages,
          tags: tags,
          highlights: highlights,
          customizable: row.customizationDone === "Yes"
        };

        projects.push(projectDoc);
      })
      .on("end", async () => {
        console.log(`Parsed ${projects.length} rows from CSV.`);
        for (const proj of projects) {
          await Project.findOneAndUpdate(
            { projectId: proj.projectId },
            proj,
            { upsert: true, new: true }
          );
        }
        console.log("Successfully seeded project dataset!");
        mongoose.disconnect();
      });

  } catch (error) {
    console.error("Error during seeding:", error);
    mongoose.disconnect();
  }
}

seed();
