// Renders public/images/og-banner.png from public/images/outsideTheBob.svg.
//
// An OG image is the preview card social sites show when someone pastes a link.
// It has to be a raster format (SVG is not reliably supported) at a fixed size,
// which is why it cannot just be the banner SVG itself.
//
// The banner is the single source of truth: its markup is inlined here rather
// than redrawn, so editing the SVG and re-running this keeps the two in step.
//
// The banner's ink is currentColor so it can follow the site's light/dark theme.
// A social card has no theme to follow — it is a fixed PNG on a white plate — so
// the group below pins `color` to the banner's original ink. The halo keeps its
// literal white attribute, which is already right against that plate.
//
//     npm run og
//
import { readFile, writeFile } from 'node:fs/promises';
import sharp from 'sharp';

const WIDTH = 1200;
const HEIGHT = 630;

const TAGLINE = "Bob's Blog and Distilled Thoughts";
// Rendered text, so it carries the intended capitalisation. DNS is
// case-insensitive; the camel case is for the reader's parsing, not the
// resolver's.
const DOMAIN = 'ThinkOutsideTheBob.Com';

const FONT = 'Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif';

const banner = await readFile('public/images/outsideTheBob.svg', 'utf8');

// Read the banner's own dimensions rather than assuming them - make-banner.mjs
// sizes the canvas to whatever the lettering needs, so they change.
const BANNER_W = Number(banner.match(/\bwidth="(\d+)"/)?.[1]);
const BANNER_H = Number(banner.match(/\bheight="(\d+)"/)?.[1]);
if (!BANNER_W || !BANNER_H) throw new Error('could not read banner dimensions');

// Take everything inside the banner's root <svg> element so it can be placed as
// a group. Comments and all - they are only a few hundred bytes.
const inner = banner.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '');

// Scale the banner to a comfortable width and centre it in the upper half.
const scale = 1040 / BANNER_W;
const x = (WIDTH - BANNER_W * scale) / 2;
const y = 140;

const composed = `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
  <rect width="${WIDTH}" height="${HEIGHT}" fill="#ffffff"/>
  <g color="#111" transform="translate(${x} ${y}) scale(${scale})">${inner}</g>
  <text x="${WIDTH / 2}" y="${y + BANNER_H * scale + 70}" text-anchor="middle"
        font-family="${FONT}" font-size="40" font-weight="600" fill="#555">${TAGLINE}</text>
  <text x="${WIDTH / 2}" y="${y + BANNER_H * scale + 130}" text-anchor="middle"
        font-family="${FONT}" font-size="30" font-weight="400" fill="#888">${DOMAIN}</text>
</svg>`;

const out = 'public/images/og-banner.png';
await sharp(Buffer.from(composed), { density: 144 })
	.resize(WIDTH, HEIGHT)
	.png({ compressionLevel: 9 })
	.toFile(out);

const { width, height, size } = await sharp(out).metadata();
console.log(`wrote ${out} — ${width}x${height}, ${Math.round(size / 1024)} KB`);
