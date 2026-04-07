
import fs from 'fs';
import path from 'path';

const brainDir = 'C:\\Users\\Suppa\\.gemini\\antigravity\\brain\\434f6c70-ea04-4441-aafe-b1a303313e1d';
const logoSrc = 'tomi_film_logo_1775474145113.png';
const publicDir = path.join(process.cwd(), 'public');

if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });

const srcPath = path.join(brainDir, logoSrc);
const destPath = path.join(publicDir, 'logo.png');

if (fs.existsSync(srcPath)) {
  fs.copyFileSync(srcPath, destPath);
  console.log('Logo copied to public/logo.png');
} else {
  console.error('Source logo not found');
}
