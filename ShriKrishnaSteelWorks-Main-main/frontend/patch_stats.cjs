const fs = require('fs');
let content = fs.readFileSync('src/pages/Projects.tsx', 'utf8');

// Fix hero chips using actual raw content
const oldChipsExact = `  {["200+ Projects", "6 Districts", "₹26Cr+ Value", "Ongoing & Completed"].map((c, i) => (\r\n                <span key={c} className="prj-hero-chip" style={{ animationDelay: \`\${0.6 + i * 0.08}s\` }}>{c}</span>\r\n              ))}`;

const newChipsExact = `  {[\r\n                \`\${siteStats.totalProjects > 0 ? siteStats.totalProjects : allProjects.length}+ Projects\`,\r\n                \`\${siteStats.totalDistricts > 0 ? siteStats.totalDistricts : 4} Districts\`,\r\n                siteStats.totalValueINR > 0 ? \`₹\${(siteStats.totalValueINR / 10000000).toFixed(0)}Cr+ Value\` : "₹26Cr+ Value",\r\n                "Ongoing & Completed",\r\n              ].map((c, i) => (\r\n                <span key={c} className="prj-hero-chip" style={{ animationDelay: \`\${0.6 + i * 0.08}s\` }}>{c}</span>\r\n              ))}`;

if (content.includes(oldChipsExact)) {
    content = content.replace(oldChipsExact, newChipsExact);
    console.log('Hero chips updated successfully!');
} else {
    console.log('Exact chips string not found. Trying trimmed match...');
    const match = content.match(/\{(\[.*?"200\+ Projects".*?\]\.map)/s);
    if (match) {
        console.log('Found via regex:', JSON.stringify(match[0].substring(0, 100)));
    }
}

fs.writeFileSync('src/pages/Projects.tsx', content, 'utf8');
console.log('Done.');
