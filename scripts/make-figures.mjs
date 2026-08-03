// Generates the comparison figures for Topics In Timekeeping into
// public/figures/.
//
//     npm run figures
//
// These are Tufte small multiples: the same frame repeated with exactly one
// variable changed, so the comparison is made by the eye rather than by the
// caption. That discipline is the whole point — if two panels differ in more
// than one way, the reader cannot tell which difference caused what.
//
// Rules followed throughout:
//   - Direct labeling on the panel. No legends.
//   - No fills, gradients or 3-D. The ink is the data.
//   - Panels adjacent in space, never stacked in sequence.
//   - Every figure has ONE sentence it is trying to make unavoidable.
//
// Point positions come from a seeded PRNG so a rebuild is byte-identical and a
// diff means something changed on purpose.
import { mkdirSync, writeFileSync } from 'node:fs';

const OUT = 'public/figures';
const INK = '#111';
const MUTED = '#777';
// Red is reserved for two things and nothing else: the X that marks a group's
// center, and the arrow that measures from truth to it. Readers already expect
// X-marks-the-spot to be red, and one accent color used for one idea stays
// readable where a second hue would just add noise.
const RED = '#c0392b';

// mulberry32 — small, fast, and deterministic. Math.random would make every
// rebuild a spurious diff.
function rng(seed) {
	return function () {
		seed |= 0;
		seed = (seed + 0x6d2b79f5) | 0;
		let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
		t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

// Box–Muller, so the scatter is genuinely Gaussian rather than uniform-in-a-
// circle. It matters: the distribution panels claim to show a normal, and the
// target panels should be showing the same thing in two dimensions.
function gauss(rand) {
	const u = Math.max(rand(), 1e-9);
	return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * rand());
}

const points = (seed, cx, cy, sigma, n = 22, clampTo = null) => {
	const rand = rng(seed);
	return Array.from({ length: n }, () => {
		let x = cx + gauss(rand) * sigma;
		let y = cy + gauss(rand) * sigma;
		// A Gaussian has no bounds, but a panel does. A dot outside its own frame
		// reads as a mistake rather than as data, so the tail gets pulled in.
		if (clampTo) {
			const dx = x - clampTo.cx, dy = y - clampTo.cy;
			const d = Math.hypot(dx, dy);
			if (d > clampTo.r) {
				x = clampTo.cx + (dx / d) * clampTo.r;
				y = clampTo.cy + (dy / d) * clampTo.r;
			}
		}
		return { x, y };
	});
};

const dots = (pts, r = 3.1) =>
	pts.map((p) => `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="${r}" fill="${INK}"/>`).join('');

const rings = (cx, cy, radii) =>
	radii
		.map((r) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${MUTED}" stroke-width="1"/>`)
		.join('') + `<circle cx="${cx}" cy="${cy}" r="2" fill="${MUTED}"/>`;

const text = (x, y, s, { size = 13, anchor = 'middle', fill = INK, weight = 400, style = '' } = {}) =>
	`<text x="${x}" y="${y}" text-anchor="${anchor}" font-family="system-ui, -apple-system, Segoe UI, Roboto, sans-serif" font-size="${size}" font-weight="${weight}" fill="${fill}"${style ? ` font-style="${style}"` : ''}>${s}</text>`;

const svg = (w, h, body) =>
	`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img">\n${body}\n</svg>\n`;

mkdirSync(OUT, { recursive: true });

// ---------------------------------------------------------------------------
// 1. Trueness × precision. The classic 2×2 with the axis everyone mislabels
//    corrected, and "accuracy" named as the corner rather than an axis.
//    Columns vary precision, rows vary trueness — one variable per direction,
//    which is the only thing that makes a small multiple readable.
// ---------------------------------------------------------------------------
{
	const R = 72, LEFT = 74, TOP = 52, GAP = 40;
	const panel = (col, row) => ({
		cx: LEFT + col * (2 * R + GAP) + R,
		cy: TOP + row * (2 * R + GAP + 8) + R,
	});
	const W = LEFT + 2 * (2 * R) + GAP + 34;
	const H = TOP + 2 * (2 * R) + GAP + 8 + 54;
	let b = '';
	const cases = [
		{ col: 0, row: 0, off: 0, sig: 8, seed: 11, accurate: true }, // precise + true
		{ col: 1, row: 0, off: 0, sig: 27, seed: 37 }, //                not precise + true
		{ col: 0, row: 1, off: 38, sig: 8, seed: 23 }, //                precise + not true
		{ col: 1, row: 1, off: 38, sig: 27, seed: 51 }, //               neither
	];
	for (const c of cases) {
		const p = panel(c.col, c.row);
		b += rings(p.cx, p.cy, [R, R * 0.66, R * 0.33]);
		b += dots(points(c.seed, p.cx + c.off, p.cy - c.off * 0.55, c.sig, 22, { cx: p.cx, cy: p.cy, r: R * 0.97 }));
		if (c.accurate) {
			// A bracket rather than a caption, so the claim sits ON the panel it
			// is about and cannot drift into a neighboring label.
			b += `<rect x="${p.cx - R - 8}" y="${p.cy - R - 8}" width="${2 * R + 16}" height="${2 * R + 16}" fill="none" stroke="${INK}" stroke-width="1.2" stroke-dasharray="5 4"/>`;
		}
	}
	// Columns vary precision; rows vary trueness. Each label appears once.
	b += text(panel(0, 0).cx, 30, 'precise', { size: 14, weight: 600 });
	b += text(panel(1, 0).cx, 30, 'not precise', { size: 14, weight: 600 });
	for (const [row, label] of [[0, 'true'], [1, 'not true']]) {
		const cy = panel(0, row).cy;
		b += text(26, cy, label, { size: 14, weight: 600 }).replace(
			'<text',
			`<text transform="rotate(-90 26 ${cy})"`,
		);
	}
	b += text(26, H - 24, 'Only the boxed panel is ACCURATE — the corner where both', {
		size: 12, anchor: 'start', fill: MUTED, style: 'italic',
	});
	b += text(26, H - 8, 'are good. Not a third axis, and not a synonym for either.', {
		size: 12, anchor: 'start', fill: MUTED, style: 'italic',
	});
	writeFileSync(`${OUT}/trueness-precision.svg`, svg(W, H, b));
}

// ---------------------------------------------------------------------------
// 2. Where is UTC? Bob's contrast. Left: no frame at all, and several candidate
//    centers, none preferred. Right: the frame you wish you had.
//    The points are IDENTICAL in both panels — that is the whole argument.
// ---------------------------------------------------------------------------
{
	const R = 82, W = 560, H = 250;
	const L = { cx: 145, cy: 118 }, Rt = { cx: 415, cy: 118 };
	const pts = points(7, 0, 0, 17);
	let b = '';
	// Left: an amorphous outline. Radii are seeded-random and then smoothed, so
	// the shape is irregular WITHOUT being symmetric about any axis — a shape with
	// a mirror line still implies a center, which is the one thing this panel must
	// not do.
	const brand = rng(1234);
	let radii = Array.from({ length: 26 }, () => 0.52 + brand() * 0.5);
	for (let pass = 0; pass < 2; pass++) {
		radii = radii.map((v, i, arr) => (arr[(i - 1 + arr.length) % arr.length] + v + arr[(i + 1) % arr.length]) / 3);
	}
	const hull = radii
		.map((rr, i, arr) => {
			const a = (i / arr.length) * Math.PI * 2;
			return `${(L.cx + Math.cos(a) * R * rr).toFixed(1)},${(L.cy + Math.sin(a) * R * rr).toFixed(1)}`;
		})
		.join(' ');
	b += `<polygon points="${hull}" fill="none" stroke="${MUTED}" stroke-width="1" stroke-dasharray="4 4"/>`;
	b += dots(pts.map((p) => ({ x: L.cx + p.x, y: L.cy + p.y })));
	for (const [dx, dy] of [[-48, -36], [50, -20], [10, 48], [-34, 38], [44, 26]]) {
		b += text(L.cx + dx, L.cy + dy, 'UTC?', { size: 12, fill: MUTED, style: 'italic' });
	}
	b += text(L.cx, 232, 'What you can observe', { size: 13, weight: 600 });

	// Right: same points, a frame, one answer.
	b += rings(Rt.cx, Rt.cy, [R, R * 0.66, R * 0.33]);
	b += dots(pts.map((p) => ({ x: Rt.cx + p.x, y: Rt.cy + p.y })));
	// paint-order puts the halo under the glyphs, so the label stays legible
	// where it necessarily overlaps the points it is labeling.
	b += `<text x="${Rt.cx}" y="${Rt.cy + 4}" text-anchor="middle" font-family="system-ui, sans-serif" font-size="14" font-weight="700" fill="${INK}" stroke="#fff" stroke-width="4" style="paint-order: stroke fill;">UTC!</text>`;
	b += text(Rt.cx, 232, 'What you would need', { size: 13, weight: 600 });
	writeFileSync(`${OUT}/where-is-utc.svg`, svg(W, H, b));
}

// ---------------------------------------------------------------------------
// 3. Resolution ladder. One set of points, four reporting grids. The last panel
//    is the point: coarse resolution does not merely limit precision, it
//    counterfeits it.
//
//    Every panel carries a grid, including the finest — otherwise the reader has
//    to work out that the first panel is also quantized, just not visibly. And
//    points snap to grid INTERSECTIONS throughout, never to cell centers: mixing
//    the two conventions between panels was the bug in the first draft, and it
//    made the progression look like two different ideas.
// ---------------------------------------------------------------------------
{
	const R = 62, GAP = 34, PAD = 22, TOP = 26;
	const W = PAD * 2 + 4 * (2 * R) + 3 * GAP;
	const H = TOP + 2 * R + 66;
	const cells = [8, 20, 40, R];
	const pts = points(19, 0, 0, 15);
	let b = '';
	cells.forEach((cell, i) => {
		const cx = PAD + R + i * (2 * R + GAP);
		const cy = TOP + R;
		b += rings(cx, cy, [R, R * 0.62]);
		// The last panel is a single cross — four squares, and therefore exactly ONE
		// intersection. That is what makes every point report the same value, and
		// it is the honest way to draw "coarser than the group": not a grid that
		// happens to be big, but a grid with nowhere else to land.
		const lines = i === 3 ? [0] : [];
		if (i < 3) for (let g = -Math.floor(R / cell) * cell; g <= R; g += cell) lines.push(g);
		for (const g of lines) {
			b += `<line x1="${cx + g}" y1="${cy - R}" x2="${cx + g}" y2="${cy + R}" stroke="${MUTED}" stroke-width="0.4"/>`;
			b += `<line x1="${cx - R}" y1="${cy + g}" x2="${cx + R}" y2="${cy + g}" stroke="${MUTED}" stroke-width="0.4"/>`;
		}
		const snap = (v) => Math.round(v / cell) * cell;
		const snapped = i === 3 ? pts.map(() => ({ x: 0, y: 0 })) : pts.map((p) => ({ x: snap(p.x), y: snap(p.y) }));
		// Coincident points would otherwise be drawn on top of each other and lie
		// about how many there are; dedupe so the count is honest.
		const seen = new Set();
		const shown = snapped.filter((p) => {
			const k = `${p.x},${p.y}`;
			if (seen.has(k)) return false;
			seen.add(k);
			return true;
		});
		b += dots(shown.map((p) => ({ x: cx + p.x, y: cy + p.y })), i === 3 ? 5 : 3.1);
		const labels = ['fine', 'coarser', 'coarser still', 'coarser than the group'];
		b += text(cx, TOP + 2 * R + 24, labels[i], { size: 12, weight: 600 });
		if (i === 3) {
			b += text(cx, TOP + 2 * R + 42, 'one value, every time.', { size: 11, fill: MUTED, style: 'italic' });
			b += text(cx, TOP + 2 * R + 55, 'looks flawless.', { size: 11, fill: MUTED, style: 'italic' });
		}
	});
	b += text(PAD, 16, 'resolution →', { size: 12, fill: MUTED, anchor: 'start' });
	writeFileSync(`${OUT}/resolution-ladder.svg`, svg(W, H, b));
}

// ---------------------------------------------------------------------------
// 4. The datacenter tradeoff, in both representations. Top row: two clock
//    ensembles as targets. Bottom row: the same two as distributions, for
//    readers who would rather see mu and sigma.
//
//    Each distribution sits on its OWN axis directly beneath its own target.
//    Overlaying them on one axis was the first attempt and it failed the only
//    job the bottom row has: you could not tell which curve belonged to which
//    panel without decoding a dash pattern.
// ---------------------------------------------------------------------------
{
	const R = 68, W = 580, H = 430;
	const A = { cx: 152, cy: 92 }, B = { cx: 428, cy: 92 };
	const cases = [
		[A, 44, 8, 5, 'off by 100 ns,', 'agreeing to 10 ns'],
		[B, 0, 22, 9, 'no average error,', 'agreeing to 25 ns'],
	];
	let b = '';
	for (const [p, off, sig, seed, top, bot] of cases) {
		b += rings(p.cx, p.cy, [R, R * 0.66, R * 0.33]);
		b += dots(points(seed, p.cx + off, p.cy, sig, 22, { cx: p.cx, cy: p.cy, r: R * 0.97 }));
		b += text(p.cx, p.cy + R + 22, top, { size: 12, weight: 600 });
		b += text(p.cx, p.cy + R + 38, bot, { size: 12, weight: 600 });
	}

	b += text(W / 2, 244, 'The same two clock ensembles, for readers who prefer μ and σ', {
		size: 12, fill: MUTED, style: 'italic',
	});

	// One axis per ensemble, each under its own target, both to the same scale
	// so the widths remain comparable.
	const axisY = 372, half = 118, sc = 2.0;
	for (const [p, off, sig] of cases) {
		b += `<line x1="${p.cx - half}" y1="${axisY}" x2="${p.cx + half}" y2="${axisY}" stroke="${MUTED}" stroke-width="1"/>`;
		b += `<line x1="${p.cx}" y1="${axisY - 78}" x2="${p.cx}" y2="${axisY + 6}" stroke="${MUTED}" stroke-width="1" stroke-dasharray="3 3"/>`;
		b += text(p.cx, axisY + 20, 'UTC', { size: 11, fill: MUTED });
		const pts = [];
		for (let x = p.cx - half; x <= p.cx + half; x += 2) {
			const z = (x - (p.cx + off * sc)) / (sig * sc);
			pts.push(`${x},${(axisY - 72 * Math.exp(-0.5 * z * z)).toFixed(1)}`);
		}
		b += `<polyline points="${pts.join(' ')}" fill="none" stroke="${INK}" stroke-width="1.8"/>`;
		// mu marked in red, to match X-marks-the-center in the targets above.
		const mx = p.cx + off * sc;
		b += `<line x1="${mx}" y1="${axisY}" x2="${mx}" y2="${axisY - 76}" stroke="${RED}" stroke-width="1.6"/>`;
		b += text(mx, axisY - 84, off === 0 ? 'μ = 0' : 'μ ≠ 0', { size: 11, weight: 600, fill: RED });
		b += text(p.cx, axisY + 38, off === 0 ? 'large σ' : 'small σ', { size: 11, weight: 600 });
	}
	writeFileSync(`${OUT}/agreement-vs-truth.svg`, svg(W, H, b));
}

// ---------------------------------------------------------------------------
// 5. The averaging arrow. The claim the static 2×2 cannot make: averaging
//    shrinks the group and never moves its center.
//
//    Both panels put the bullseye AND the group center at identical
//    coordinates, so "it has not moved" is something the reader verifies rather
//    than something the caption asserts. The dashed guides exist for exactly
//    that: they let the eye carry a position across the gap.
//
//    Deliberately NOT collapsed to a single dot in the right-hand panel, even
//    though the limit is tempting — the resolution ladder already ends on a
//    lone dot meaning something else entirely (scatter that cannot be seen,
//    rather than scatter that has been averaged away), and two figures in the
//    same set should not use one image for two different ideas.
// ---------------------------------------------------------------------------
{
	const R = 76, W = 560, H = 300;
	const A = { cx: 150, cy: 128 }, B = { cx: 410, cy: 128 };
	const OFF = { x: 36, y: -24 }; // identical in both panels. That is the point.
	let b = '';

	const arrow = (x1, y1, x2, y2, col, wid = 1.6) => {
		const a = Math.atan2(y2 - y1, x2 - x1), h = 7;
		const p1 = `${x2},${y2}`;
		const p2 = `${x2 - h * Math.cos(a - 0.4)},${y2 - h * Math.sin(a - 0.4)}`;
		const p3 = `${x2 - h * Math.cos(a + 0.4)},${y2 - h * Math.sin(a + 0.4)}`;
		return (
			`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${col}" stroke-width="${wid}"/>` +
			`<polygon points="${p1} ${p2} ${p3}" fill="${col}"/>`
		);
	};

	for (const [p, sig, seed, label] of [
		[A, 25, 61, 'each point: a 1-hour average'],
		[B, 8, 67, 'each point: a 24-hour average'],
	]) {
		const gx = p.cx + OFF.x, gy = p.cy + OFF.y;
		b += rings(p.cx, p.cy, [R, R * 0.66, R * 0.33]);
		b += dots(points(seed, gx, gy, sig, 22, { cx: p.cx, cy: p.cy, r: R * 0.97 }));
		// X marks the spot, in red and heavy enough to read straight through the
		// densest part of the cluster. The earlier white disc behind it worked but
		// punched a visible hole in the data, which is worse than the problem.
		b += `<line x1="${gx - 8}" y1="${gy - 8}" x2="${gx + 8}" y2="${gy + 8}" stroke="${RED}" stroke-width="3.4"/>`;
		b += `<line x1="${gx - 8}" y1="${gy + 8}" x2="${gx + 8}" y2="${gy - 8}" stroke="${RED}" stroke-width="3.4"/>`;
		b += arrow(p.cx, p.cy, gx - 10, gy + 7, RED, 2);
		b += text(p.cx, p.cy + R + 26, label, { size: 12, weight: 600 });
	}

	// Guides carrying the group center across the gap, so the claim is checkable.
	const gyA = A.cy + OFF.y;
	b += `<line x1="${A.cx + OFF.x}" y1="${gyA}" x2="${B.cx + OFF.x}" y2="${gyA}" stroke="${MUTED}" stroke-width="0.8" stroke-dasharray="3 4"/>`;
	b += text((A.cx + B.cx) / 2 + OFF.x, gyA - 10, 'same center', { size: 11, fill: MUTED, style: 'italic' });

	b += arrow(A.cx + R + 14, 40, B.cx - R - 14, 40, MUTED, 1.2);
	b += text((A.cx + B.cx) / 2, 32, 'longer averaging', { size: 12, fill: MUTED });

	b += text(30, H - 26, 'The scatter collapses. The bias does not move — the red arrow is the', {
		size: 12, anchor: 'start', fill: MUTED, style: 'italic',
	});
	b += text(30, H - 10, 'same length in both panels, and the red X has not shifted.', {
		size: 12, anchor: 'start', fill: MUTED, style: 'italic',
	});
	writeFileSync(`${OUT}/averaging-arrow.svg`, svg(W, H, b));
}

// ---------------------------------------------------------------------------
// 6. Deferred truth. The figure nobody outside this field can draw, because in
//    most disciplines the reference exists at the moment of measurement.
//
//    Left: what you have when you measure. Your points, the UTC(k) you steer to
//    — and no bullseye, because UTC for that instant has not been computed yet.
//    Right: the same points, unchanged, once Circular T arrives and the center
//    can finally be drawn.
//
//    The points are byte-identical between panels. Nothing about your clock
//    changed; what changed is that the target got painted.
//
//    The three marks are laid out as a spread triangle rather than stacked, so
//    every label has clear air. An earlier version put UTC(k) under the cluster
//    and it was unreadable.
// ---------------------------------------------------------------------------
{
	const W = 600, H = 288;
	const A = { cx: 158, cy: 136 }, B = { cx: 438, cy: 136 };
	const G = { x: -30, y: 14 };   // your points
	const K = { x: -30, y: 62 };   // UTC(k), directly below them
	const U = { x: 44, y: -34 };   // where UTC turns out to have been
	let b = '';

	const arrow = (x1, y1, x2, y2, col, wid = 1.6, dash = '') => {
		const a = Math.atan2(y2 - y1, x2 - x1), h = 7;
		return (
			`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${col}" stroke-width="${wid}"${dash ? ` stroke-dasharray="${dash}"` : ''}/>` +
			`<polygon points="${x2},${y2} ${x2 - h * Math.cos(a - 0.4)},${y2 - h * Math.sin(a - 0.4)} ${x2 - h * Math.cos(a + 0.4)},${y2 - h * Math.sin(a + 0.4)}" fill="${col}"/>`
		);
	};

	for (const [p, revealed] of [[A, false], [B, true]]) {
		const gx = p.cx + G.x, gy = p.cy + G.y;
		const kx = p.cx + K.x, ky = p.cy + K.y;
		const ux = p.cx + U.x, uy = p.cy + U.y;

		if (revealed) b += rings(ux, uy, [66, 42, 20]);

		b += dots(points(88, gx, gy, 11, 20));

		// What you steer to. Present in both panels, because it is available now.
		b += `<circle cx="${kx}" cy="${ky}" r="4.5" fill="${INK}"/>`;
		b += text(kx, ky + 18, 'UTC(k)', { size: 11, weight: 600 });
		// The offset you CAN measure at the time: dashed, ink, not red.
		b += arrow(kx, ky - 7, gx - 2, gy + 12, INK, 1.2, '3 3');

		// X marks your group.
		b += `<line x1="${gx - 8}" y1="${gy - 8}" x2="${gx + 8}" y2="${gy + 8}" stroke="${RED}" stroke-width="3.4"/>`;
		b += `<line x1="${gx - 8}" y1="${gy + 8}" x2="${gx + 8}" y2="${gy - 8}" stroke="${RED}" stroke-width="3.4"/>`;

		if (!revealed) {
			b += `<circle cx="${ux}" cy="${uy}" r="26" fill="none" stroke="${MUTED}" stroke-width="1" stroke-dasharray="3 5"/>`;
			b += text(ux, uy - 46, 'UTC', { size: 12, fill: MUTED, style: 'italic' });
			b += text(ux, uy - 33, 'not computed yet', { size: 10, fill: MUTED, style: 'italic' });
		} else {
			b += text(ux, uy - 76, 'UTC', { size: 12, weight: 700 });
			b += arrow(gx + 9, gy - 9, ux - 9, uy + 9, RED, 2);
		}
	}

	b += text(A.cx, 248, 'When you take the measurement', { size: 13, weight: 600 });
	b += text(B.cx, 248, 'A month later, in Circular T', { size: 13, weight: 600 });
	b += text(A.cx, 266, 'only your offset from UTC(k) is knowable', { size: 11, fill: MUTED, style: 'italic' });
	b += text(B.cx, 266, 'the red arrow — your trueness — can finally be drawn', { size: 11, fill: MUTED, style: 'italic' });
	writeFileSync(`${OUT}/deferred-truth.svg`, svg(W, H, b));
}

console.error(`wrote 6 figures to ${OUT}/`);
