const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
      results.push(file);
    }
  });
  return results;
}

const files = walk('frontend/src');
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  if (content.includes('api/axios')) {
    // Determine relative path based on directory depth from src
    const parts = file.split(path.sep);
    const depth = parts.length - 3; // e.g. frontend/src/pages/page.jsx -> 4 parts. depth = 1
    const prefix = '../'.repeat(depth) || './';
    const newPath = prefix + 'services/api';
    const replaced = content.replace(/import\s+api\s+from\s+['"][\.\/]+api\/axios['"];?/g, "import api from '" + newPath + "';");
    if (content !== replaced) {
        fs.writeFileSync(file, replaced);
        console.log('Updated', file);
    }
  }
});
