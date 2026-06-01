const fs = require('fs');

let content = fs.readFileSync('src/data/militaryRoles.js', 'utf8');

// The file has LF line breaks ('\n') instead of CRLF ('\r\n')
const objectBlocks = content.split('  {\n    id:');
const header = objectBlocks[0];
const updatedBlocks = [];

for (let i = 1; i < objectBlocks.length; i++) {
  let block = objectBlocks[i];
  // extract ID
  const idMatch = block.match(/^\s*"([^"]+)"/);
  if (idMatch) {
    const id = idMatch[1];
    // replace character field
    block = block.replace(/character:\s*"([^"]+)"/, `character: "${id}"`);
  }
  updatedBlocks.push('  {\n    id:' + block);
}

const finalContent = header + updatedBlocks.join('');
fs.writeFileSync('src/data/militaryRoles.js', finalContent, 'utf8');
console.log('Successfully updated 128 role character mappings in DB.');
