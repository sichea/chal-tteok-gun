const fs = require('fs');
const content = fs.readFileSync('src/data/militaryRoles.js', 'utf8');
const rx = /character:\s*"([^"]+)"/g;
const set = new Set();
let match;
while ((match = rx.exec(content)) !== null) {
  set.add(match[1]);
}
console.log('Characters in JS:', Array.from(set));

const files = fs.readdirSync('public/assets/characters');
console.log('Files in directory:', files);
