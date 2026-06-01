const fs = require('fs');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const https = require('https');
const path = require('path');

// Configure API Key (from GitHub Secret environment variable)
const apiKey = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error('Error: GEMINI_API_KEY is not set.');
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);

// Helper to download image from URL to local file
function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close(resolve);
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => reject(err));
    });
  });
}

// Function to wait
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function run() {
  const rolesList = JSON.parse(fs.readFileSync('scratch/roles_list.json', 'utf8'));
  const targetDir = 'public/assets/characters';
  
  // Get day index from argument (1 to 7)
  const dayArg = process.argv[2];
  const day = dayArg ? parseInt(dayArg, 10) : 1;
  console.log(`=== STARTING IMAGE GENERATION BATCH - DAY ${day} ===`);
  
  // Split roles into 7 chunks (roughly 18-19 roles per day)
  const chunkSize = Math.ceil(rolesList.length / 7);
  const startIdx = (day - 1) * chunkSize;
  const endIdx = Math.min(startIdx + chunkSize, rolesList.length);
  
  const dailyRoles = rolesList.slice(startIdx, endIdx);
  console.log(`Processing roles index ${startIdx} to ${endIdx - 1} (${dailyRoles.length} roles total).`);
  
  for (let i = 0; i < dailyRoles.length; i++) {
    const role = dailyRoles[i];
    const roleId = role.id;
    const roleName = role.name;
    const branch = role.branch;
    const destPath = path.join(targetDir, `${role.character}.png`);
    
    console.log(`[${i+1}/${dailyRoles.length}] Generating for: ${roleName} (${branch}) -> ${destPath}`);
    
    // Construct rich visual prompts detailing specific military gear and tools
    let gearDetail = 'carrying a standard combat rifle';
    if (roleId.includes('cook')) gearDetail = 'wearing a chef hat and holding a cooking ladle';
    else if (roleId.includes('driver') || roleId.includes('tank') || roleId.includes('apc')) gearDetail = 'wearing a vehicle driver helmet and tactical goggles';
    else if (roleId.includes('signals') || roleId.includes('sw-dev') || roleId.includes('cyber')) gearDetail = 'wearing communications headphones and holding a digital pad';
    else if (roleId.includes('medic') || roleId.includes('special-medic')) gearDetail = 'wearing a red-cross helmet and holding a medical bag';
    else if (roleId.includes('music') || roleId.includes('band')) gearDetail = 'holding a brass trumpet or instrument';
    else if (roleId.includes('recon') || roleId.includes('udt')) gearDetail = 'wearing tactical spec-ops gear and dark beret';
    else if (roleId.includes('weather')) gearDetail = 'holding weather tools and maps';
    else if (roleId.includes('maintenance') || roleId.includes('mechanic')) gearDetail = 'holding a mechanical wrench tool';
    
    const prompt = `MapleStory pixel art style character sprite, chibi, 2D game asset, male Korean military soldier in ${branch} theme, ${gearDetail}, clean pixel art details, high resolution 512x512, transparent background, alpha channel transparent, no white background borders.`;
    
    try {
      // Use Imagen model through Gemini API
      const model = genAI.getGenerativeModel({ model: 'imagen-3.0-generate-002' });
      const result = await model.generateImages({
        prompt: prompt,
        numberOfImages: 1,
        outputMimeType: 'image/png',
        aspectRatio: '1:1',
      });
      
      const base64Image = result.generatedImages[0].image.imageBytes;
      fs.writeFileSync(destPath, Buffer.from(base64Image, 'base64'));
      console.log(`-> Success: Saved ${destPath}`);
      
      // Delay 30 seconds to bypass API rate limit
      await sleep(30000);
      
    } catch (err) {
      console.error(`-> Failed to generate image for ${roleName}:`, err.message);
      // fallback copy standard branch placeholder to ensure app never crashes on missing assets
      const fallbackSrc = path.join(targetDir, branch === '육군' ? 'infantry_army.png' : branch === '해군' ? 'sailor_navy.png' : branch === '해병대' ? 'infantry_marine.png' : 'weather_airforce.png');
      if (fs.existsSync(fallbackSrc) && !fs.existsSync(destPath)) {
        fs.copyFileSync(fallbackSrc, destPath);
        console.log(`-> Copied fallback image from ${fallbackSrc}`);
      }
    }
  }
  
  console.log(`=== COMPLETED IMAGE GENERATION BATCH - DAY ${day} ===`);
}

run().catch(console.error);
