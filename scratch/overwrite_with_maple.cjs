const fs = require('fs');
const path = require('path');

// Target directory
const charsDir = 'public/assets/characters';

// Mapping of template keys to the newly generated maple PNG files in artifacts
// Since they are saved in C:\Users\kks37\.gemini\antigravity\brain\f7e63d29-842f-4b12-b6c8-e8afd6707026\
// We find them by reading the directory
const artifactsDir = 'C:\\Users\\kks37\\.gemini\\antigravity\\brain\\f7e63d29-842f-4b12-b6c8-e8afd6707026';

const files = fs.readdirSync(artifactsDir);

const mappings = {
  'cook.png': 'cook_army_maple', // fallback for general cook
  'cook_army.png': 'cook_army_maple',
  'driver.png': 'driver_army_maple',
  'driver_army.png': 'driver_army_maple',
  'infantry.png': 'army_infantry_maple',
  'infantry_army.png': 'army_infantry_maple',
  'infantry_marine.png': 'marine_soldier_maple',
  'maintenance_airforce.png': 'airforce_maintenance_maple',
  'medic.png': 'medic_army_maple',
  'medic_army.png': 'medic_army_maple',
  'recon_army.png': 'recon_army_maple',
  'recon_marine.png': 'recon_marine_maple',
  'sailor.png': 'navy_sailor_maple',
  'sailor_navy.png': 'navy_sailor_maple',
  'signals.png': 'signals_army_maple',
  'signals_army.png': 'signals_army_maple',
  'sonar_navy.png': 'sonar_navy_maple',
  'weather_airforce.png': 'airforce_weather_maple'
};

// Resolve the actual filenames in artifacts
const templatePaths = {};
for (const [tplFile, searchKey] of Object.entries(mappings)) {
  const matched = files.find(f => f.startsWith(searchKey) && f.endsWith('.png'));
  if (matched) {
    templatePaths[tplFile] = path.join(artifactsDir, matched);
  } else {
    console.log('No artifact matched for:', searchKey);
  }
}

// 1. Overwrite the 18 master template files in public/assets/characters/
for (const [tplFile, fullPath] of Object.entries(templatePaths)) {
  const destPath = path.join(charsDir, tplFile);
  fs.copyFileSync(fullPath, destPath);
  console.log(`Copied new template ${tplFile} to ${destPath}`);
}

// 2. Re-populate the 128 individualized character files from the new templates
const rolesList = JSON.parse(fs.readFileSync('scratch/roles_list.json', 'utf8'));

// Recreate the get_template function logic from populate_characters.py in JS
function getTemplateFile(role) {
  const branch = role.branch;
  const roleId = role.id;
  const name = role.name;
  
  if (branch === '공통') {
    if (roleId.includes('cook') || name.includes('조리')) return 'cook_army.png';
    if (roleId.includes('driver') || name.includes('운전')) return 'driver_army.png';
    if (roleId.includes('medic') || name.includes('의무')) return 'medic_army.png';
    if (roleId.includes('signals') || name.includes('통신')) return 'signals_army.png';
  }
  
  if (branch === '육군') {
    if (roleId.includes('cook') || name.includes('조리')) return 'cook_army.png';
    if (['driver', 'tank', 'apc', 'transport', 'mechanic', 'maintenance'].some(x => roleId.includes(x))) return 'driver_army.png';
    if (['medic', 'lab', 'cbrn-lab'].some(x => roleId.includes(x))) return 'medic_army.png';
    if (['recon', 'sdt', 'jsa', 'mp', 'guard', 'sports', 'instructor'].some(x => roleId.includes(x))) return 'recon_army.png';
    if (['signals', 'cyber', 'sw-dev', 'info', 'intel', 'sig-int', 'admin', 'supply', 'ip', 'cost'].some(x => roleId.includes(x))) return 'signals_army.png';
    return 'infantry_army.png';
  }
  
  if (branch === '해군') {
    if (roleId.includes('cook') || name.includes('조리')) return 'cook_army.png';
    if (['udt', 'ssu'].some(x => roleId.includes(x))) return 'recon_marine.png';
    if (['medic', 'special-medic', 'hygiene'].some(x => roleId.includes(x))) return 'medic_army.png';
    if (['sonar', 'radar', 'navigation', 'steer', 'sailor', 'ordnance', 'electric', 'engine'].some(x => roleId.includes(x))) {
      return (roleId.includes('sonar') || roleId.includes('radar')) ? 'sonar_navy.png' : 'sailor_navy.png';
    }
    if (['cyber', 'ai', 'sw-dev', 'science-lab', 'bigdata', 'ip', 'cbt'].some(x => roleId.includes(x))) return 'sonar_navy.png';
    return 'sailor_navy.png';
  }
  
  if (branch === '해병대') {
    if (roleId.includes('recon') || name.includes('수색')) return 'recon_marine.png';
    if (roleId.includes('signals') || name.includes('통신')) return 'signals_army.png';
    return 'infantry_marine.png';
  }
  
  if (branch === '공군') {
    if (roleId.includes('weather') || name.includes('관측')) return 'weather_airforce.png';
    if (['maintenance', 'facility', 'avionics', 'hydraulic', 'weapons', 'ammo', 'arresting', 'ground'].some(x => roleId.includes(x))) return 'maintenance_airforce.png';
    if (roleId.includes('medic') || name.includes('의무')) return 'medic_army.png';
    if (roleId.includes('driver') || name.includes('운전')) return 'driver_army.png';
    if (['control', 'tower', 'radar', 'control-radar', 'signals', 'ops-signals', 'infra-signals', 'it'].some(x => roleId.includes(x))) return 'weather_airforce.png';
    return 'weather_airforce.png';
  }
  
  return 'infantry_army.png';
}

let populated = 0;
for (const role of rolesList) {
  const tplFile = getTemplateFile(role);
  const src = path.join(charsDir, tplFile);
  const dest = path.join(charsDir, `${role.character}.png`);
  
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
    populated++;
  } else {
    console.log('Missing source template file:', src);
  }
}

console.log(`Successfully repopulated ${populated} individualized character files with high-quality MapleStory transparent images.`);
