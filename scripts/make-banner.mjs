// Generates public/images/outsideTheBob.svg in full: the box, the lettering as
// outlines, the blown-out wall, and the shrapnel.
//
//     npm run banner
//
// Why outlines rather than <text>: an SVG <text> element is a request, not a
// guarantee. The renderer picks whatever font satisfies the family list, so the
// wordmark was drawn in DejaVu Sans by librsvg here and in something else again
// by a browser elsewhere - different widths, different shapes, different
// kerning. textLength was meant to pin the width, but browsers honour it and
// librsvg ignores it, so it only ever half-worked, and forcing a width squeezed
// the glyphs and made a black weight look light. Outlines settle all of it.
//
// Why fontkit: Inter keeps its kerning in GPOS behind a type 9 extension
// lookup. opentype.js does not follow those and reports zero kerning for every
// pair, including AV and To. fontkit resolves them - eT is -230/2048 em.
//
// Everything below is computed from the font's real metrics. Change a constant
// and re-run; nothing is hand-placed, and the script refuses to emit shrapnel
// that would collide with the lettering.
import { existsSync, writeFileSync } from 'node:fs';
import { openSync } from 'fontkit';

const OUT = 'public/images/outsideTheBob.svg';

const CANDIDATES = [
	// InterDisplay is the display optical cut: tighter default spacing and finer
	// detail, drawn for large sizes. The plain Inter cut is spaced for body text
	// and looks loose at 96px.
	'/usr/share/fonts/opentype/inter/InterDisplay-Black.otf',
	'/usr/share/fonts/opentype/inter/Inter-Black.otf',
	'/usr/share/fonts/truetype/inter/Inter_28pt-Black.ttf',
];

// ---- Layout -----------------------------------------------------------------

const BOX = { x: 20, y: 70, w: 285, h: 180, r: 16, stroke: 6 };
const THINK = { size: 74, x: 47, baseline: 185 };
const WORD = { size: 96, x: 274, baseline: 195, angle: -8 };
const CANVAS = { w: 1000, h: 300 };

const HALO = 7; // half of the white outline stroke width
const WALL_PAD = 12; // extra clearance either side of the wall break
const BAND_PAD = 12; // keep shrapnel this far off the lettering

// Fragments: angle in degrees (0 = right, positive = down) from the rupture.
// Distances are deliberately uneven - equal distances from one origin draw an
// arc, which is the opposite of a debris field.
const FRAGMENTS = [
	{ ang: -88, dist: 115, r: 9, seed: 3 },
	{ ang: -70, dist: 85, r: 11, seed: 11 },
	{ ang: -58, dist: 150, r: 8, seed: 21 },
	{ ang: -45, dist: 100, r: 7, seed: 31 },
	{ ang: -34, dist: 190, r: 10, seed: 41 },
	{ ang: -25, dist: 250, r: 7, seed: 53 },
	{ ang: 30, dist: 100, r: 8, seed: 61 },
	{ ang: 45, dist: 78, r: 10, seed: 71 },
	{ ang: 55, dist: 128, r: 12, seed: 83 },
	{ ang: 38, dist: 180, r: 8, seed: 97 },
	{ ang: 70, dist: 98, r: 9, seed: 101 },
];

// ---- Font -------------------------------------------------------------------

const fontPath = CANDIDATES.find((p) => existsSync(p));
if (!fontPath) {
	console.error('Inter Black not found. Install it with:  apt-get install -y fonts-inter');
	process.exit(1);
}
const font = openSync(fontPath);

// Lay out a string with the shaper so GPOS kerning is applied, then emit the
// glyph outlines as one path with the baseline at y=0 and ink starting near x=0.
function outline(text, size) {
	const scale = size / font.unitsPerEm;
	const { glyphs, positions } = font.layout(text);

	let pen = 0;
	let data = '';
	const kerns = [];
	const ink = { x1: Infinity, y1: Infinity, x2: -Infinity, y2: -Infinity };

	for (let i = 0; i < glyphs.length; i++) {
		const pos = positions[i];
		const dx = (pen + pos.xOffset) * scale;
		// Font units are Y-up; SVG is Y-down, hence the negative vertical scale.
		data += glyphs[i].path.transform(scale, 0, 0, -scale, dx, -pos.yOffset * scale).toSVG() + ' ';

		const b = glyphs[i].bbox;
		if (Number.isFinite(b.minX)) {
			ink.x1 = Math.min(ink.x1, dx + b.minX * scale);
			ink.x2 = Math.max(ink.x2, dx + b.maxX * scale);
			ink.y1 = Math.min(ink.y1, -b.maxY * scale);
			ink.y2 = Math.max(ink.y2, -b.minY * scale);
		}

		const delta = pos.xAdvance - glyphs[i].advanceWidth;
		if (delta && i + 1 < glyphs.length) {
			kerns.push(`${text[i]}${text[i + 1]} ${delta} (${(delta * scale).toFixed(2)}px)`);
		}
		pen += pos.xAdvance;
	}

	return { d: data.trim().replace(/\s+/g, ' '), advance: pen * scale, kerns, ink };
}

const think = outline('Think', THINK.size);
const word = outline('OutsideTheBob', WORD.size);

// ---- Geometry ---------------------------------------------------------------

const rad = (WORD.angle * Math.PI) / 180;
const slope = Math.tan(rad);

function rotate(x, y) {
	const dx = x - WORD.x;
	const dy = y - WORD.baseline;
	return {
		x: WORD.x + dx * Math.cos(rad) - dy * Math.sin(rad),
		y: WORD.baseline + dx * Math.sin(rad) + dy * Math.cos(rad),
	};
}

// The wordmark's ink box is horizontal before rotation, so each of its edges
// becomes a straight line of the same slope afterwards. One rotated point per
// edge is enough to define it.
const topAnchor = rotate(WORD.x + word.ink.x1, WORD.baseline + word.ink.y1);
const botAnchor = rotate(WORD.x + word.ink.x1, WORD.baseline + word.ink.y2);
const topAt = (x) => topAnchor.y + slope * (x - topAnchor.x);
const botAt = (x) => botAnchor.y + slope * (x - botAnchor.x);

const wallX = BOX.x + BOX.w;
const breakTop = topAt(wallX) - HALO - WALL_PAD;
const breakBot = botAt(wallX) + HALO + WALL_PAD;

const r = BOX.r;
const boxPath = [
	`M ${BOX.x + r},${BOX.y}`,
	`L ${wallX - r},${BOX.y}`,
	`A ${r},${r} 0 0 1 ${wallX},${BOX.y + r}`,
	`L ${wallX},${(breakTop - 10).toFixed(1)}`,
	// The broken ends bend outward, the way a wall gives when something goes
	// through it rather than being cut.
	`L ${wallX + 8},${breakTop.toFixed(1)}`,
	`M ${wallX + 8},${breakBot.toFixed(1)}`,
	`L ${wallX},${(breakBot + 10).toFixed(1)}`,
	`L ${wallX},${BOX.y + BOX.h - r}`,
	`A ${r},${r} 0 0 1 ${wallX - r},${BOX.y + BOX.h}`,
	`L ${BOX.x + r},${BOX.y + BOX.h}`,
	`A ${r},${r} 0 0 1 ${BOX.x},${BOX.y + BOX.h - r}`,
	`L ${BOX.x},${BOX.y + r}`,
	`A ${r},${r} 0 0 1 ${BOX.x + r},${BOX.y}`,
].join(' ');

// ---- Shrapnel ---------------------------------------------------------------

const rupture = { x: wallX, y: (topAt(wallX) + botAt(wallX)) / 2 };

function rng(seed) {
	let s = seed >>> 0;
	return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}

// An Asteroids rock: vertices around a circle at jittered angles, radii varying
// a lot, with a couple pulled deep inward to make a concave bite.
function rock(cx, cy, radius, seed) {
	const rand = rng(seed);
	const n = 7 + Math.floor(rand() * 4);
	const bite = Math.floor(rand() * n);
	const bite2 = (bite + 3 + Math.floor(rand() * 2)) % n;
	const pts = [];
	for (let i = 0; i < n; i++) {
		const a = (i / n) * Math.PI * 2 + (rand() - 0.5) * 0.45;
		let rr = radius * (0.72 + rand() * 0.38);
		if (i === bite) rr = radius * 0.36;
		if (i === bite2) rr = radius * 0.46;
		pts.push(`${(cx + Math.cos(a) * rr).toFixed(1)},${(cy + Math.sin(a) * rr).toFixed(1)}`);
	}
	return pts.join(' ');
}

const rocks = [];
const trails = [];
let rejected = 0;

for (const f of FRAGMENTS) {
	const a = (f.ang * Math.PI) / 180;
	const cx = rupture.x + Math.cos(a) * f.dist;
	const cy = rupture.y + Math.sin(a) * f.dist;

	const clearsBand = cy + f.r < topAt(cx) - BAND_PAD || cy - f.r > botAt(cx) + BAND_PAD;
	const clearsBox = cx - f.r > wallX + 8 || cy + f.r < BOX.y - 4;
	const inCanvas =
		cx - f.r > 14 && cx + f.r < CANVAS.w - 14 && cy - f.r > 12 && cy + f.r < CANVAS.h - 12;

	if (!(clearsBand && clearsBox && inCanvas)) {
		rejected++;
		console.error(
			`  rejected ang=${f.ang} dist=${f.dist} -> (${cx.toFixed(0)},${cy.toFixed(0)}) ` +
				`band=${clearsBand} box=${clearsBox} canvas=${inCanvas}`,
		);
		continue;
	}

	rocks.push(`    <polygon points="${rock(cx, cy, f.r, f.seed)}"/>`);

	// Walk out from the rupture until the ray clears the lettering, so no trail
	// ever crosses the "O" it came from.
	let t = 14;
	for (; t < f.dist; t++) {
		const px = rupture.x + Math.cos(a) * t;
		const py = rupture.y + Math.sin(a) * t;
		if ((py < topAt(px) - 8 || py > botAt(px) + 8) && (px > wallX + 6 || py < BOX.y - 3)) break;
	}
	const end = f.dist - f.r - 7;
	trails.push(
		`    <line x1="${(rupture.x + Math.cos(a) * t).toFixed(1)}" y1="${(rupture.y + Math.sin(a) * t).toFixed(1)}"` +
			` x2="${(rupture.x + Math.cos(a) * end).toFixed(1)}" y2="${(rupture.y + Math.sin(a) * end).toFixed(1)}"/>`,
	);
}

// ---- Emit -------------------------------------------------------------------

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${CANVAS.w}" height="${CANVAS.h}" viewBox="0 0 ${CANVAS.w} ${CANVAS.h}"
     role="img" aria-label="Think Outside The Bob">
  <!--
    GENERATED by scripts/make-banner.mjs - edit that, not this, and re-run
    "npm run banner". Then "npm run og" to refresh the social card from it.

    The name is the joke: "Think" sits inside the box, and "OutsideTheBob"
    smashes through the right wall and climbs away, scattering shrapnel.

    The lettering is Inter Display Black converted to outlines, so every
    renderer draws identical shapes and the kerning is Inter's own rather than
    whatever the viewer's fallback font happens to do. The wall is genuinely
    missing across the band the wordmark passes through, because a white halo
    only follows the outside of a glyph - the box line used to show through the
    counter of the "O".
  -->

  <!-- The box, with the right wall blown out between y=${breakTop.toFixed(0)} and y=${breakBot.toFixed(0)} -->
  <path d="${boxPath}"
        fill="none" stroke="#111" stroke-width="${BOX.stroke}"
        stroke-linecap="round" stroke-linejoin="round"/>

  <!-- Inside the box -->
  <path transform="translate(${THINK.x} ${THINK.baseline})" fill="#111"
        d="${think.d}"/>

  <!-- Motion trails back to the rupture -->
  <g stroke="#111" stroke-width="1.6" stroke-linecap="round" opacity="0.5">
${trails.join('\n')}
  </g>

  <!-- Shrapnel: irregular fragments radiating from the break -->
  <g fill="#111">
${rocks.join('\n')}
  </g>

  <!-- Through the wall and climbing. One path, stroked white then filled, so
       the halo cuts the wall where the two meet. -->
  <path transform="rotate(${WORD.angle} ${WORD.x} ${WORD.baseline}) translate(${WORD.x} ${WORD.baseline})"
        fill="#111" stroke="#fff" stroke-width="${HALO * 2}" stroke-linejoin="round"
        style="paint-order: stroke fill;"
        d="${word.d}"/>
</svg>
`;

writeFileSync(OUT, svg);

console.error(`font:      ${font.familyName} (${font.unitsPerEm} upem)  ${fontPath}`);
console.error(`Think:     ${think.advance.toFixed(1)}px advance at ${THINK.size}px`);
console.error(`wordmark:  ${word.advance.toFixed(1)}px advance at ${WORD.size}px`);
console.error(`kerns:     ${word.kerns.join('  ') || '(none)'}`);
console.error(`Think ink: x ${(THINK.x + think.ink.x1).toFixed(1)}..${(THINK.x + think.ink.x2).toFixed(1)}`);
console.error(`wall gap:  y ${breakTop.toFixed(1)}..${breakBot.toFixed(1)}  at x=${wallX}`);
console.error(`rupture:   (${rupture.x.toFixed(0)}, ${rupture.y.toFixed(0)})`);
console.error(`shrapnel:  ${rocks.length} kept, ${rejected} rejected`);
console.error(`wrote ${OUT}`);
