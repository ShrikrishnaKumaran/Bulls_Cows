/**
 * Generate PWA icons from SVG
 * Run with: node scripts/generate-icons.js
 */
import sharp from 'sharp';
import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const iconsDir = join(__dirname, '../public/icons');

const sizes = [192, 512];

async function generateIcons() {
  const svg192 = readFileSync(join(iconsDir, 'icon-192.svg'));
  const svg512 = readFileSync(join(iconsDir, 'icon-512.svg'));

  // Generate 192x192 PNG
  await sharp(svg192)
    .resize(192, 192)
    .png()
    .toFile(join(iconsDir, 'icon-192.png'));
  console.log('Generated icon-192.png');

  // Generate 512x512 PNG
  await sharp(svg512)
    .resize(512, 512)
    .png()
    .toFile(join(iconsDir, 'icon-512.png'));
  console.log('Generated icon-512.png');

  console.log('Icon generation complete!');
}

generateIcons().catch(console.error);
