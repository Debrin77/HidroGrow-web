/**
 * Regenera icon-192.png, icon-512.png, icon-maskable-512.png, apple-touch-icon.png
 * desde icons/splash-brand-gold.png (emblema HidroGrow).
 *
 * Uso: node scripts/resize-icons.js
 *      node scripts/resize-icons.js "ruta\\otro-maestro.png"
 */
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');

const ROOT = path.join(__dirname, '..');
const ICONS = path.join(ROOT, 'icons');
const DEFAULT_MASTER = path.join(ICONS, 'splash-brand-gold.png');

async function main() {
  const arg = process.argv[2];
  const input = arg && fs.existsSync(arg) ? arg : DEFAULT_MASTER;
  if (!fs.existsSync(input)) {
    console.error('No existe el maestro:', input);
    process.exit(1);
  }
  await sharp(input).resize(180, 180).png().toFile(path.join(ICONS, 'apple-touch-icon.png'));
  await sharp(input).resize(180, 180).png().toFile(path.join(ICONS, 'icon-180.png'));
  await sharp(input).resize(192, 192).png().toFile(path.join(ICONS, 'icon-192.png'));
  await sharp(input).resize(512, 512).png().toFile(path.join(ICONS, 'icon-512.png'));
  await sharp(input).resize(512, 512).png().toFile(path.join(ICONS, 'icon-maskable-512.png'));
  console.log('Iconos HidroGrow escritos en', ICONS, 'desde', path.basename(input));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
