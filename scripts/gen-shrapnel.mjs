// Generates asteroid-style shrapnel radiating from the rupture point, plus
// cartoon motion lines trailing back toward it. Prints an SVG fragment.

const R = { x: 272, y: 155 };          // where the "O" breaks the wall

// Wordmark occupies a rotated band; keep fragments clear of it.
const TOP = (x) => 125.7 - 0.14054 * (x - 238.3);  // top edge of wordmark
const BOT = (x) => 195.0 - 0.14054 * (x - 248.0);  // baseline of wordmark
const PAD = 12;

const CANVAS = { w: 933, h: 293 };
const BOX = { x0: 20, y0: 70, x1: 270, y1: 250 };

// Deterministic PRNG so re-running gives the same art.
function rng(seed) {
	let s = seed >>> 0;
	return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}

// An Asteroids rock: vertices around a circle at jittered angles, radii varying
// a lot, with one or two pulled deep inward to make a concave bite.
function rock(cx, cy, r, seed) {
	const rand = rng(seed);
	const n = 7 + Math.floor(rand() * 4);
	const bite = Math.floor(rand() * n);
	const bite2 = (bite + 3 + Math.floor(rand() * 2)) % n;
	const pts = [];
	for (let i = 0; i < n; i++) {
		const a = (i / n) * Math.PI * 2 + (rand() - 0.5) * 0.45;
		let rr = r * (0.72 + rand() * 0.38);
		if (i === bite) rr = r * 0.36;
		if (i === bite2) rr = r * 0.46;
		pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]);
	}
	return pts.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ');
}

// angle: degrees, 0 = right, positive = down (SVG convention)
// Distances deliberately uneven. Equal distances read as an arc, which is the
// opposite of the debris field we want.
const frags = [
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

const rocks = [];
const lines = [];
for (const f of frags) {
	const a = (f.ang * Math.PI) / 180;
	const cx = R.x + Math.cos(a) * f.dist;
	const cy = R.y + Math.sin(a) * f.dist;

	// Validate: clear of the wordmark, clear of the box, inside the canvas.
	const aboveBand = cy + f.r < TOP(cx) - PAD;
	const belowBand = cy - f.r > BOT(cx) + PAD;
	const clearBox = cx - f.r > BOX.x1 + 8 || cy + f.r < BOX.y0 - 4;
	const inCanvas =
		cx - f.r > 14 && cx + f.r < CANVAS.w - 14 && cy - f.r > 12 && cy + f.r < CANVAS.h - 12;
	const ok = (aboveBand || belowBand) && clearBox && inCanvas;
	if (!ok) {
		console.error(
			`  !! ang=${f.ang} dist=${f.dist} -> (${cx.toFixed(0)},${cy.toFixed(0)}) ` +
				`band=${aboveBand || belowBand} box=${clearBox} canvas=${inCanvas}`,
		);
		continue;
	}

	rocks.push(`    <polygon points="${rock(cx, cy, f.r, f.seed)}"/>`);

	// Motion line: walk out from the rupture until the ray is clear of the
	// wordmark and the box, so a trail never crosses the "O" it came from.
	let t0 = 14;
	for (; t0 < f.dist; t0 += 1) {
		const px = R.x + Math.cos(a) * t0;
		const py = R.y + Math.sin(a) * t0;
		const clearBand = py < TOP(px) - 8 || py > BOT(px) + 8;
		const outOfBox = px > BOX.x1 + 6 || py < BOX.y0 - 3;
		if (clearBand && outOfBox) break;
	}
	const x1 = R.x + Math.cos(a) * t0;
	const y1 = R.y + Math.sin(a) * t0;
	const x2 = R.x + Math.cos(a) * (f.dist - f.r - 7);
	const y2 = R.y + Math.sin(a) * (f.dist - f.r - 7);
	lines.push(
		`    <line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}"/>`,
	);
}

console.log(`  <!-- Motion trails back to the rupture -->
  <g stroke="#111" stroke-width="1.6" stroke-linecap="round" opacity="0.5">
${lines.join('\n')}
  </g>

  <!-- Shrapnel: irregular fragments radiating from the break -->
  <g fill="#111">
${rocks.join('\n')}
  </g>`);
console.error(`kept ${rocks.length}/${frags.length} fragments`);
