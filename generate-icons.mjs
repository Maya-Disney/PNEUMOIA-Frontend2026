// generate-icons.mjs — node generate-icons.mjs
import sharp from 'sharp';
import { existsSync } from 'fs';

const SOURCE = 'public/logo-pwa.png';

if (!existsSync(SOURCE)) {
  console.error(`❌ Fichier source introuvable : ${SOURCE}`);
  console.error('   → Sauvegarde l\'image dans Frontend/public/logo-pwa.png puis relance');
  process.exit(1);
}

// Icônes standard : logo sur fond blanc, carré
const ICONS = [
  { size: 96,  out: 'public/icon-96.png',           padding: 8,   bg: '#ffffff' },
  { size: 192, out: 'public/icon-192.png',           padding: 16,  bg: '#ffffff' },
  { size: 512, out: 'public/icon-512.png',           padding: 40,  bg: '#ffffff' },
  // Maskable : safe zone 20% → fond violet + logo centré avec plus de marge
  { size: 512, out: 'public/icon-512-maskable.png',  padding: 110, bg: '#6d28d9', tint: true },
];

for (const { size, out, padding, bg, tint } of ICONS) {
  const logoSize = size - padding * 2;

  // Redimensionner le logo
  let logoBuffer = await sharp(SOURCE)
    .resize(logoSize, logoSize, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  // Pour l'icône maskable : teinter le logo en blanc sur fond violet
  if (tint) {
    logoBuffer = await sharp(logoBuffer)
      .tint({ r: 255, g: 255, b: 255 })
      .png()
      .toBuffer();
  }

  // Fond carré de la bonne couleur
  const bgHex = bg.replace('#', '');
  const r = parseInt(bgHex.slice(0,2), 16);
  const g = parseInt(bgHex.slice(2,4), 16);
  const b = parseInt(bgHex.slice(4,6), 16);

  const canvas = sharp({
    create: { width: size, height: size, channels: 4, background: { r, g, b, alpha: 255 } }
  }).png();

  const result = await canvas.toBuffer();

  await sharp(result)
    .composite([{ input: logoBuffer, top: padding, left: padding }])
    .toFile(out);

  console.log(`✅ ${out} (${size}×${size})`);
}

console.log('\nDone — rechargez le manifest dans Chrome DevTools');
