const fs = require('fs');
const path = require('path');

const rootFiles = fs.readdirSync(path.join(__dirname, '..'));
console.log('Root files:', rootFiles);

const backendFiles = fs.readdirSync(__dirname);
console.log('Backend files:', backendFiles);
