// Generates responsive AVIF + WebP variants from source-images/ into img/.
// Run: npm run images
import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';

const SRC = 'source-images';
const OUT = 'img';

// name: [source file, widths, options]
const IMAGES = {
  hero:            ['hero.jpg',                  [800, 1280, 1920, 2880], { mono: true }],
  editorial:       ['editorial.jpg',             [800, 1280, 1920, 2880], { mono: true }],
  'rule-cut':      ['rule-cut.jpg',              [480, 800, 1200],        { mono: true, aspect: 4 / 5 }],
  'rule-cloth':    ['rule-cloth.jpg',            [480, 800, 1200],        { mono: true, aspect: 4 / 5 }],
  'rule-silence':  ['rule-silence.jpg',          [480, 800, 1200],        { mono: true, aspect: 4 / 5 }],
  'atelier-table': ['atelier-cutting-table.jpg', [640, 960, 1440],        { mono: true, aspect: 4 / 5 }],
  'atelier-seam':  ['atelier-seam.jpg',          [640, 960, 1440],        { mono: true, aspect: 3 / 2 }],
  'proof-portrait':['proof-portrait.jpg',        [480, 800, 1200],        { mono: true, aspect: 3 / 4 }],
  'ryke-front':    ['ryke-front.jpg',            [400, 600],              {}],
  'ryke-back':     ['ryke-back.jpg',             [400, 600],              {}],
  holm:            ['holm.png',                  [340],                   {}],
  vale:            ['vale.jpg',                  [400, 600],              {}],
  norr:            ['norr.jpg',                  [400, 690],              {}],
};

await mkdir(OUT, { recursive: true });

for (const [name, [file, widths, opts]] of Object.entries(IMAGES)) {
  for (const w of widths) {
    let img = sharp(`${SRC}/${file}`).rotate();
    const h = opts.aspect ? Math.round(w / opts.aspect) : undefined;
    img = img.resize({ width: w, height: h, fit: 'cover', position: 'attention', withoutEnlargement: !h });
    if (opts.mono) img = img.grayscale().linear(1.05, -6);
    await img.clone().avif({ quality: 52, effort: 6 }).toFile(`${OUT}/${name}-${w}.avif`);
    await img.clone().webp({ quality: 74 }).toFile(`${OUT}/${name}-${w}.webp`);
  }
  console.log('✓', name);
}

// Social share card (1200×630) from the hero.
await sharp(`${SRC}/hero.jpg`)
  .resize(1200, 630, { fit: 'cover', position: 'attention' })
  .grayscale()
  .composite([{
    input: Buffer.from(`<svg width="1200" height="630"><rect width="1200" height="630" fill="#111" fill-opacity=".35"/>
      <text x="600" y="345" text-anchor="middle" font-family="Georgia, serif" font-size="84" letter-spacing="34" fill="#F4EADE">HALDEN</text></svg>`),
  }])
  .jpeg({ quality: 82, mozjpeg: true })
  .toFile('og.jpg');
console.log('✓ og.jpg');
