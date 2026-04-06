
import fs from 'fs';
import path from 'path';

const brainDir = 'C:\\Users\\Suppa\\.gemini\\antigravity\\brain\\434f6c70-ea04-4441-aafe-b1a303313e1d';
const publicDir = path.join(process.cwd(), 'public', 'blog');

const files = [
  { src: 'modern_building_film_1775455548436.png', dest: 'house-film.png' },
  { src: 'car_ppf_protection_1775455514452.png', dest: 'car-ppf.png' },
  { src: 'ceramic_film_car_interior_1775455529802.png', dest: 'ceramic-film.png' }
];

if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

files.forEach(f => {
  const srcPath = path.join(brainDir, f.src);
  const destPath = path.join(publicDir, f.dest);
  try {
    if (fs.existsSync(srcPath)) {
      fs.copyFileSync(srcPath, destPath);
      console.log(`Copied ${f.src} to ${f.dest}`);
    } else {
      console.error(`Source not found: ${srcPath}`);
    }
  } catch (err) {
    console.error(`Error copying ${f.src}:`, err);
  }
});

console.log('Finished fixing images');
