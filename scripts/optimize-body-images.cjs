// ══ OPTIMIZE BODY IMAGES — neutral anatomy bases → shipped WebP ════════════════
// Andura's MuscleBodyMap renders a photoreal grey-anatomy body (sex + view) with
// per-muscle recovery glow on top. The source renders shipped to public/body/ are
// large JPGs (~250KB, 1024-wide). This script downsizes the FOUR NEUTRAL bases to
// ~640px-wide WebP (~50-150KB) for shipping. Only the neutral bases are emitted;
// the ref-* color guides are placement references and are never shipped.
//
// sharp is also our future tool for exercise-image processing — same pipeline.
//
// Run:  node scripts/optimize-body-images.cjs
// Emits: public/body/<name>.webp for male/female × front/back.

const path = require('node:path');
const sharp = require('sharp');

const DIR = path.join(__dirname, '..', 'public', 'body');
const BASES = ['male-front', 'male-back', 'female-front', 'female-back'];
const WIDTH = 640; // 2× the ~140px CSS render box → crisp on retina, still tiny.
const QUALITY = 80;

async function run() {
  for (const name of BASES) {
    const src = path.join(DIR, `${name}.jpg`);
    const out = path.join(DIR, `${name}.webp`);
    const info = await sharp(src)
      .resize({ width: WIDTH, withoutEnlargement: true })
      .webp({ quality: QUALITY, effort: 6 })
      .toFile(out);
    const kb = (info.size / 1024).toFixed(1);
    console.log(`${name}.webp  ${info.width}x${info.height}  ${kb} KB`);
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
