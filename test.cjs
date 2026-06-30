const fs = require('fs');
const path = require('path');

const dir = 'public/assets/characters';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.png'));

const sizeMap = new Map();
const duplicates = [];

for (const file of files) {
  const filePath = path.join(dir, file);
  const stat = fs.statSync(filePath);
  const size = stat.size;
  
  if (sizeMap.has(size)) {
    sizeMap.get(size).push(file);
  } else {
    sizeMap.set(size, [file]);
  }
}

let duplicateCount = 0;
for (const [size, list] of sizeMap.entries()) {
  if (list.length > 1) {
    duplicateCount += list.length;
    console.log(`Size ${size} bytes has ${list.length} duplicate files:`, list);
  }
}
console.log(`Total files: ${files.length}`);
console.log(`Total duplicate files: ${duplicateCount}`);
