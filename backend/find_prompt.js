const fs = require('fs');
const path = require('path');

const brainDir = 'C:/Users/jguad/.gemini/antigravity/brain';

function searchDir(dir) {
  if (!fs.existsSync(dir)) return;
  const items = fs.readdirSync(dir);
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      searchDir(fullPath);
    } else if (item.endsWith('.txt') || item.endsWith('.md')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      if (content.toLowerCase().includes('promp') || content.toLowerCase().includes('prompt')) {
        console.log('Match found in:', fullPath);
        // Find matching lines
        const lines = content.split('\n');
        lines.forEach((line, idx) => {
          if (line.toLowerCase().includes('promp') || line.toLowerCase().includes('prompt')) {
            console.log(`  Line ${idx + 1}: ${line.trim().slice(0, 300)}`);
          }
        });
      }
    }
  }
}

searchDir(brainDir);
