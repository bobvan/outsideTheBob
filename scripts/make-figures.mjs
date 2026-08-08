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
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';

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

// ---------------------------------------------------------------------------
// 7. Any two timescales are related by a straight line. Plot one against the
//    other and you get y = mx + b, where the slope is the ratio of tick lengths
//    and the intercept is the difference in origins.
//
//    Two lines, because one parameter each would take two figures: the solid
//    line differs from UTC only in origin (slope 1), the dashed one only in tick
//    length (slope != 1). Between them the reader sees which parameter does what.
// ---------------------------------------------------------------------------
{
	const W = 560, H = 350;
	const x0 = 78, x1 = 500, y0 = 268, y1 = 44;
	const X = (yr) => x0 + ((yr - 1800) / 250) * (x1 - x0);   // UTC years 1800..2050
	const Y = (v) => y0 - (v / 220) * (y0 - y1);              // ticks 0..220
	let b = '';

	b += `<line x1="${x0}" y1="${y0}" x2="${x1}" y2="${y0}" stroke="${INK}" stroke-width="1.2"/>`;
	b += `<line x1="${x0}" y1="${y0}" x2="${x0}" y2="${y1}" stroke="${INK}" stroke-width="1.2"/>`;
	for (const yr of [1800, 1850, 1900, 1950, 2000, 2050]) {
		b += `<line x1="${X(yr)}" y1="${y0}" x2="${X(yr)}" y2="${y0 + 4}" stroke="${INK}" stroke-width="1"/>`;
		b += text(X(yr), y0 + 18, String(yr), { size: 10, fill: MUTED });
	}
	for (const v of [0, 50, 100, 150, 200]) {
		b += `<line x1="${x0 - 4}" y1="${Y(v)}" x2="${x0}" y2="${Y(v)}" stroke="${INK}" stroke-width="1"/>`;
		b += text(x0 - 9, Y(v) + 3.5, String(v), { size: 10, fill: MUTED, anchor: 'end' });
	}
	b += text((x0 + x1) / 2, y0 + 36, 'UTC (year)', { size: 12, weight: 600 });
	b += text(20, (y0 + y1) / 2, 'ticks on the other timescale', { size: 12, weight: 600 })
		.replace('<text', `<text transform="rotate(-90 20 ${(y0 + y1) / 2})"`);

	// Victoria: same tick (a year), different origin. Slope 1, intercept -1837.
	b += `<line x1="${X(1837)}" y1="${Y(0)}" x2="${X(2050)}" y2="${Y(213)}" stroke="${INK}" stroke-width="2"/>`;
	b += `<circle cx="${X(1837)}" cy="${Y(0)}" r="4" fill="${RED}"/>`;
	b += text(X(1837) + 8, Y(0) - 10, 'b — origin, 1837', { size: 11, weight: 600, fill: RED, anchor: 'start' });
	b += text(X(1980), Y(160), 'years since Victoria', { size: 11, weight: 600, anchor: 'start' });
	b += text(X(1980), Y(146), 'm = 1 (same tick)', { size: 10, fill: MUTED, anchor: 'start' });

	// A timescale whose tick is longer: same origin idea, shallower slope.
	b += `<line x1="${X(1900)}" y1="${Y(0)}" x2="${X(2050)}" y2="${Y(75)}" stroke="${INK}" stroke-width="1.6" stroke-dasharray="6 4"/>`;
	b += `<circle cx="${X(1900)}" cy="${Y(0)}" r="4" fill="${RED}"/>`;
	b += text(X(1902), Y(0) - 12, 'b — origin, 1900', { size: 11, weight: 600, fill: RED, anchor: 'start' });
	b += text(X(1955), Y(38) + 20, 'half-decades since 1900', { size: 11, weight: 600, anchor: 'start' });
	b += text(X(1955), Y(38) + 33, 'm = 0.2 (longer tick)', { size: 10, fill: MUTED, anchor: 'start' });

	b += text(x0, 24, 'y = mx + b', { size: 13, weight: 700, anchor: 'start' });
	b += text(x0 + 78, 24, '— slope is the ratio of tick lengths, intercept is the difference in origins', {
		size: 11, fill: MUTED, anchor: 'start', style: 'italic',
	});
	writeFileSync(`${OUT}/timescale-relation.svg`, svg(W, H, b));
}

// ---------------------------------------------------------------------------
// 8. How well each constellation predicts UTC — real BIPM Circular T Section 4
//    data, 426 daily values cached by scripts/fetch-circular-t.mjs.
//
//    Two panels sharing one x-axis, because GLONASS excursions past -55 ns
//    would flatten the other three into a single line. Top shows everything;
//    bottom zooms to ±5 ns, where the other three actually live. Reading them
//    together is the point: one constellation is playing a different game.
//
//    Okabe-Ito palette, which is the colorblind-safe qualitative standard and
//    keeps faith with the two-color scheme used elsewhere in the garden.
//
//    Four thin lines is more than hue alone can carry, even for a reader with
//    ordinary color vision: the first cut used blue/green for GPS/Galileo and
//    purple/vermillion for BeiDou/GLONASS, and each pair read as one line at
//    1 px in the upper panel. So each series now differs in three ways at once
//    — hue, lightness, and dash — and the four hues chosen are as far apart as
//    the palette allows. Never distinguish series by hue alone at this weight.
// ---------------------------------------------------------------------------
{
	const d = JSON.parse(readFileSync('src/data/circular-t-section4.json', 'utf8'));
	const S = d.series;
	const CONST = [
		{ k: 'GPS', label: 'GPS', color: '#0072B2', dash: '', w: 1.4 },
		{ k: 'GAL', label: 'Galileo', color: '#E69F00', dash: '6 3', w: 1.5 },
		{ k: 'BDS', label: 'BeiDou', color: '#CC79A7', dash: '1.6 2.4', w: 1.8 },
		{ k: 'GLO', label: 'GLONASS', color: '#111111', dash: '', w: 1.4 },
	];
	const stat = (k) => {
		const v = S.map((r) => r[k]);
		const mean = v.reduce((a, b) => a + b, 0) / v.length;
		const sd = Math.sqrt(v.reduce((a, b) => a + (b - mean) ** 2, 0) / (v.length - 1));
		return { mean, sd };
	};

	const W = 900, H = 600;
	const L = 66, R = 168, TOP = 62, MID = 300, GAP = 58, BOT = 512;
	const mjd0 = S[0].mjd, mjd1 = S.at(-1).mjd;
	const X = (m) => L + ((m - mjd0) / (mjd1 - mjd0)) * (W - L - R);

	// Top: full range. Bottom: the ±5 ns window.
	const yTop = (v) => MID - ((v - -60) / 70) * (MID - TOP);
	const yBot = (v) => BOT - ((v - -5) / 10) * (BOT - (MID + GAP));

	let b = '';
	const axis = (y0, y1, ticks, Y, label) => {
		let o = `<line x1="${L}" y1="${y0}" x2="${L}" y2="${y1}" stroke="${INK}" stroke-width="1"/>`;
		for (const t of ticks) {
			o += `<line x1="${L - 4}" y1="${Y(t)}" x2="${W - R}" y2="${Y(t)}" stroke="${t === 0 ? MUTED : '#e8e8e8'}" stroke-width="${t === 0 ? 1 : 0.7}"${t === 0 ? ' stroke-dasharray="4 3"' : ''}/>`;
			o += text(L - 8, Y(t) + 3.5, String(t), { size: 10, fill: MUTED, anchor: 'end' });
		}
		o += text(18, (y0 + y1) / 2, label, { size: 11, weight: 600 })
			.replace('<text', `<text transform="rotate(-90 18 ${(y0 + y1) / 2})"`);
		return o;
	};

	b += axis(TOP, MID, [10, 0, -20, -40, -60], yTop, 'UTC − broadcast prediction  (ns)');
	b += axis(MID + GAP, BOT, [5, 2.5, 0, -2.5, -5], yBot, 'detail, ±5 ns  (ns)');

	for (const c of CONST) {
		// GLONASS is deliberately absent from the lower panel. It spends most of
		// the period outside ±5 ns, so it would enter and leave the frame
		// constantly and obscure the three constellations the panel exists to
		// show — while adding nothing, since its behaviour is already the whole
		// story of the panel above.
		const panels = c.k === 'GLO' ? [[yTop, TOP, MID]] : [[yTop, TOP, MID], [yBot, MID + GAP, BOT]];
		for (const [Y, y0, y1] of panels) {
			const pts = S.map((r) => {
				const v = Math.max(Math.min(r[c.k], Y === yTop ? 10 : 5), Y === yTop ? -60 : -5);
				return `${X(r.mjd).toFixed(1)},${Y(v).toFixed(1)}`;
			});
			b += `<clipPath id="clip-${c.k}-${y0}"><rect x="${L}" y="${y0}" width="${W - L - R}" height="${y1 - y0}"/></clipPath>`;
			b += `<polyline points="${pts.join(' ')}" fill="none" stroke="${c.color}" stroke-width="${c.w}"${c.dash ? ` stroke-dasharray="${c.dash}"` : ''} stroke-linecap="round" clip-path="url(#clip-${c.k}-${y0})"/>`;
		}
	}

	// x-axis: month ticks along the bottom panel.
	b += `<line x1="${L}" y1="${BOT}" x2="${W - R}" y2="${BOT}" stroke="${INK}" stroke-width="1"/>`;
	let last = '';
	for (const r of S) {
		const mo = r.date.slice(0, 7);
		if (mo === last) continue;
		last = mo;
		const x = X(r.mjd);
		b += `<line x1="${x}" y1="${BOT}" x2="${x}" y2="${BOT + 4}" stroke="${INK}" stroke-width="1"/>`;
		if (mo.endsWith('-01') || mo.endsWith('-04') || mo.endsWith('-07') || mo.endsWith('-10')) {
			b += text(x, BOT + 17, mo, { size: 9.5, fill: MUTED });
		}
	}

	// Legend doubles as the statistics table — the numbers people actually want.
	let ly = TOP + 6;
	b += text(W - R + 12, ly, 'mean ± sd, whole period', { size: 10, weight: 600, anchor: 'start', fill: MUTED });
	ly += 18;
	for (const c of CONST) {
		const st = stat(c.k);
		// The swatch carries the dash pattern too, or the legend would be a
		// hue-only key to a chart that is deliberately not hue-only.
		b += `<line x1="${W - R + 12}" y1="${ly - 4}" x2="${W - R + 30}" y2="${ly - 4}" stroke="${c.color}" stroke-width="${c.w + 1}"${c.dash ? ` stroke-dasharray="${c.dash}"` : ''} stroke-linecap="round"/>`;
		b += text(W - R + 36, ly, c.label, { size: 11, weight: 600, anchor: 'start' });
		b += text(W - R + 36, ly + 14, `${st.mean >= 0 ? '+' : ''}${st.mean.toFixed(2)} ± ${st.sd.toFixed(2)} ns`, {
			size: 10.5, anchor: 'start', fill: MUTED,
		});
		ly += 40;
	}

	b += text(L, 26, 'How well each constellation predicts UTC', { size: 15, weight: 700, anchor: 'start' });
	b += text(L, 44, `BIPM Circular T Section 4 · ${S.length} daily values · ${S[0].date} to ${S.at(-1).date}`, {
		size: 11, fill: MUTED, anchor: 'start',
	});
	b += text(L, H - 26, 'Each value is published weeks after the fact: the newest point in an issue is a median 13 days old, the oldest 42.', {
		size: 10.5, fill: MUTED, anchor: 'start', style: 'italic',
	});
	b += text(L, H - 11, 'Upper panel is clipped at −60 ns; GLONASS reaches −56.9, and is omitted below because it rarely stays in frame.', {
		size: 10.5, fill: MUTED, anchor: 'start', style: 'italic',
	});
	writeFileSync(`${OUT}/utc-prediction-scoreboard.svg`, svg(W, H, b));
}

// ---------------------------------------------------------------------------
// 9. Three ways to remove satellite_clock_error.
//
//    Comparing two distant clocks means measuring both against a third clock
//    they can both see — which drags that third clock's error into the answer.
//    Every technique here is a different way of getting it back out. One models
//    it, one cancels it against a second station, one does both. The bottom
//    band is the payoff: what each answer is referenced to, and whether that
//    reference continues anywhere.
//
//    Naming discipline: the figure and the prose use the SAME token,
//    satellite_clock_error, so a reader can move between them without
//    translating. No dt-superscript-s anywhere.
//
//    Deliberately schematic. This is a slide, not a plot: no data, three
//    columns on one grammar, differences carried by what is present.
// ---------------------------------------------------------------------------
{
	const W = 990, H = 524;
	const COLW = 310, GAP = 15, LEFT = 12;
	const cx = (i) => LEFT + i * (COLW + GAP) + COLW / 2;
	const BLUE = '#0072B2';   // computed on the ground, as everywhere else here
	const ORANGE = '#E69F00'; // signal from space
	const PANY = 34, PANH = 360, SATY = 116, STAY = 252, BANDY = 418;

	let b = '';

	const sat = (x, y, s = 1) =>
		`<g transform="translate(${x} ${y}) scale(${s})">` +
		`<rect x="-9" y="-7" width="18" height="14" rx="2" fill="${INK}"/>` +
		`<rect x="-26" y="-4" width="14" height="8" fill="${INK}"/>` +
		`<rect x="12" y="-4" width="14" height="8" fill="${INK}"/>` +
		`</g>`;

	const station = (x, y, label, sub) => {
		let o = `<g transform="translate(${x} ${y})">` +
			`<path d="M -11 0 A 11 11 0 0 1 11 0 Z" fill="${INK}" transform="rotate(-20)"/>` +
			`<rect x="-1.5" y="0" width="3" height="13" fill="${INK}"/>` +
			`<rect x="-9" y="13" width="18" height="3" fill="${INK}"/></g>`;
		o += text(x, y + 33, label, { size: 12.5, weight: 700 });
		if (sub) o += text(x, y + 48, sub, { size: 10.5, fill: MUTED });
		return o;
	};

	const arrow = (x1, y1, x2, y2, color, dash = '') =>
		`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="2"` +
		`${dash ? ` stroke-dasharray="${dash}"` : ''} marker-end="url(#ah-${color.slice(1)})"/>`;

	// A dimension line between the two stations, because the quantity that
	// separates them is the baseline and the baseline is what decides how well
	// the middle panel works.
	const dimension = (x, y, half, label) =>
		`<line x1="${x - half}" y1="${y}" x2="${x + half}" y2="${y}" stroke="${MUTED}" stroke-width="1.2" ` +
		`marker-start="url(#ah-777)" marker-end="url(#ah-777)"/>` +
		`<rect x="${x - 30}" y="${y - 8}" width="60" height="16" fill="#fff"/>` +
		text(x, y + 4, label, { size: 11, fill: MUTED, style: 'italic' });

	// The term being removed, shown struck through — the strike is on the TERM,
	// never on a sentence about it, or the reader cannot tell what is cancelled.
	const removed = (x, y, term, note) => {
		const w = term.length * 3.9;
		return text(x, y, term, { size: 12, fill: RED, weight: 700 }) +
			`<line x1="${x - w}" y1="${y - 4}" x2="${x + w}" y2="${y - 4}" stroke="${RED}" stroke-width="1.6"/>` +
			text(x, y + 17, note, { size: 10.5, fill: RED });
	};

	b += '<defs>' +
		[INK, BLUE, ORANGE, RED, MUTED].map((c) =>
			`<marker id="ah-${c.slice(1)}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">` +
			`<path d="M 0 0 L 10 5 L 0 10 z" fill="${c}"/></marker>`).join('') +
		'</defs>';

	const TITLES = [
		['PPP solution', 'model satellite_clock_error'],
		['Common view, with NIST', 'cancel satellite_clock_error'],
		['PPP time transfer, with NIST', ['model satellite_clock_error,', 'then cancel the model’s datum']],
	];
	for (let i = 0; i < 3; i++) {
		b += `<rect x="${LEFT + i * (COLW + GAP)}" y="${PANY}" width="${COLW}" height="${PANH}" rx="6" fill="none" stroke="#dcdcdc"/>`;
		b += text(cx(i), PANY + 26, TITLES[i][0], { size: 14.5, weight: 700 });
		// A subtitle may be two lines where naming the term in full beats an
		// ambiguous "it" — which is the whole reason these read as they do.
		const subs = Array.isArray(TITLES[i][1]) ? TITLES[i][1] : [TITLES[i][1]];
		subs.forEach((line, k) => {
			b += text(cx(i), PANY + 44 + k * 14, line, { size: 11.5, fill: MUTED, style: 'italic' });
		});
	}

	// --- Panel 1: one station, the error supplied by a correction stream -----
	b += sat(cx(0) - 72, SATY);
	b += text(cx(0) - 26, SATY + 4, 'satellite_', { size: 10.5, fill: MUTED, anchor: 'start' });
	b += text(cx(0) - 26, SATY + 17, 'clock_error = ?', { size: 10.5, fill: MUTED, anchor: 'start' });
	b += arrow(cx(0) - 74, SATY + 14, cx(0) - 80, STAY - 22, ORANGE);
	b += station(cx(0) - 82, STAY, 'YOU', null);
	b += `<rect x="${cx(0) + 6}" y="${SATY + 40}" width="140" height="44" rx="4" fill="#fff" stroke="${BLUE}" stroke-width="1.6"/>`;
	b += text(cx(0) + 76, SATY + 58, 'correction stream', { size: 11, fill: BLUE, weight: 700 });
	b += text(cx(0) + 76, SATY + 73, 'supplies the error', { size: 10.5, fill: BLUE });
	b += arrow(cx(0) + 26, SATY + 86, cx(0) - 64, STAY - 14, BLUE, '5 3');
	b += text(cx(0), STAY + 84, 'one station, no second opinion', { size: 10.5, fill: MUTED, style: 'italic' });

	// --- Panel 2: two stations, ONE satellite, the error struck out ----------
	b += sat(cx(1), SATY);
	b += text(cx(1), SATY - 20, 'both stations see the same error', { size: 10.5, fill: MUTED });
	b += arrow(cx(1) - 10, SATY + 14, cx(1) - 78, STAY - 22, ORANGE);
	b += arrow(cx(1) + 10, SATY + 14, cx(1) + 78, STAY - 22, ORANGE);
	b += station(cx(1) - 88, STAY, 'YOU', null);
	b += station(cx(1) + 88, STAY, 'NIST', 'UTC(NIST)');
	b += dimension(cx(1), STAY + 4, 70, 'baseline');
	b += removed(cx(1), STAY + 78, 'satellite_clock_error', 'subtracts out exactly');
	b += text(cx(1), STAY + 112, 'needs the same satellite,', { size: 10.5, fill: MUTED, style: 'italic' });
	b += text(cx(1), STAY + 125, 'at the same instant', { size: 10.5, fill: MUTED, style: 'italic' });

	// --- Panel 3: two stations, DIFFERENT satellites, ONE shared stream ------
	b += sat(cx(2) - 112, SATY - 12, 0.78);
	b += sat(cx(2) - 78, SATY + 8, 0.78);
	b += sat(cx(2) + 78, SATY + 8, 0.78);
	b += sat(cx(2) + 112, SATY - 12, 0.78);
	b += arrow(cx(2) - 104, SATY + 22, cx(2) - 108, STAY - 20, ORANGE);
	b += arrow(cx(2) + 104, SATY + 22, cx(2) + 108, STAY - 20, ORANGE);
	// One stream feeding both, because the cancellation only works if the two
	// solutions were computed against the SAME datum. That is the condition the
	// panel exists to show, so it gets the center of the frame.
	b += `<rect x="${cx(2) - 82}" y="${SATY + 34}" width="164" height="26" rx="4" fill="#fff" stroke="${BLUE}" stroke-width="1.6"/>`;
	b += text(cx(2), SATY + 51, 'the same correction stream', { size: 11, fill: BLUE, weight: 700 });
	b += arrow(cx(2) - 66, SATY + 60, cx(2) - 86, STAY - 14, BLUE, '5 3');
	b += arrow(cx(2) + 66, SATY + 60, cx(2) + 86, STAY - 14, BLUE, '5 3');
	b += station(cx(2) - 94, STAY, 'YOU', 'own PPP');
	b += station(cx(2) + 94, STAY, 'NIST', 'own PPP');
	b += dimension(cx(2), STAY + 4, 62, 'baseline');
	b += removed(cx(2), STAY + 78, 'the stream’s datum', 'subtracts out instead');
	b += text(cx(2), STAY + 112, 'no shared satellite needed —', { size: 10.5, fill: MUTED, style: 'italic' });
	b += text(cx(2), STAY + 125, 'what BIPM and NIST use for TAI', { size: 10.5, fill: MUTED, style: 'italic' });

	// --- The band that is the actual argument -------------------------------
	b += text(LEFT, BANDY - 12, 'and your answer is referenced to —', { size: 12, weight: 700, anchor: 'start' });
	const LAND = [
		['the correction stream’s datum', 'stable, but unpublished', 'the traceability chain stops here', false],
		['UTC(NIST)', 'a named realization of UTC', 'Circular T continues the traceability chain', true],
		['UTC(NIST)', 'a named realization of UTC', 'Circular T continues the traceability chain', true],
	];
	for (let i = 0; i < 3; i++) {
		const [a, c, d, ok] = LAND[i];
		const col = ok ? BLUE : MUTED;
		b += `<rect x="${LEFT + i * (COLW + GAP)}" y="${BANDY}" width="${COLW}" height="64" rx="6" fill="none" stroke="${col}" stroke-width="${ok ? 1.8 : 1}"${ok ? '' : ' stroke-dasharray="5 4"'}/>`;
		b += text(cx(i), BANDY + 22, a, { size: 13, weight: 700, fill: ok ? BLUE : INK });
		b += text(cx(i), BANDY + 38, c, { size: 10.5, fill: MUTED });
		b += text(cx(i), BANDY + 54, d, { size: 10, fill: ok ? INK : MUTED, weight: ok ? 700 : 400 });
	}

	b += text(LEFT, 22, 'Three ways to remove satellite_clock_error', { size: 15, weight: 700, anchor: 'start' });
	b += text(W - LEFT, 22, 'orange: signal from space  ·  blue: computed on the ground', {
		size: 10.5, fill: MUTED, anchor: 'end',
	});
	writeFileSync(`${OUT}/time-transfer-techniques.svg`, svg(W, H, b));
}

// ---------------------------------------------------------------------------
// 10. How long a prompt actually takes.
//
//     Measured, not remembered: 1595 prompts across the whole agent fleet,
//     extracted from session transcripts by timing each prompt to the last
//     record written before the next one. That end point is when the agent went
//     idle, not when Bob came back, so it measures the agent working rather
//     than the human away.
//
//     The figure exists to justify a habit. A median of three minutes sounds
//     like something you could sit and watch. The tail is the whole point: one
//     prompt in ten runs past a quarter of an hour, and one in twenty past half
//     an hour. That is what makes checking in episodically the right posture
//     rather than a lazy one.
// ---------------------------------------------------------------------------
{
	const d = JSON.parse(readFileSync('src/data/prompt-durations.json', 'utf8'));
	const W = 760, H = 400;
	const L = 62, R = 22, TOP = 96, BOT = 316;
	const bins = d.bins;
	const maxN = Math.max(...bins.map((b) => b.n));
	const bw = (W - L - R) / bins.length;
	const y = (n) => BOT - (n / maxN) * (BOT - TOP);
	let b = '';

	// Horizontal guides only — the eye compares bar heights, so vertical rules
	// would be ink competing with the data.
	for (const t of [0, 100, 200, 300, 400, 500]) {
		if (t > maxN) continue;
		b += `<line x1="${L}" y1="${y(t)}" x2="${W - R}" y2="${y(t)}" stroke="${t ? '#ececec' : INK}" stroke-width="${t ? 0.8 : 1}"/>`;
		b += text(L - 8, y(t) + 3.5, String(t), { size: 10, fill: MUTED, anchor: 'end' });
	}

	bins.forEach((bin, i) => {
		const x = L + i * bw;
		// The long-tail bins are the argument, so they carry the accent colour
		// and everything else stays quiet.
		const tail = bin.lo >= 10;
		b += `<rect x="${x + 5}" y="${y(bin.n)}" width="${bw - 10}" height="${BOT - y(bin.n)}" fill="${tail ? RED : '#0072B2'}" opacity="${tail ? 0.9 : 0.78}"/>`;
		b += text(x + bw / 2, y(bin.n) - 7, String(bin.n), { size: 10.5, weight: 600, fill: tail ? RED : INK });
		b += text(x + bw / 2, BOT + 16, bin.hi ? `${bin.lo}–${bin.hi}` : `${bin.lo}+`, { size: 10.5 });
	});
	b += text((L + W - R) / 2, BOT + 34, 'minutes from my prompt to the agent going idle', { size: 11, fill: MUTED });
	b += text(16, (TOP + BOT) / 2, 'prompts', { size: 11, weight: 600 })
		.replace('<text', `<text transform="rotate(-90 16 ${(TOP + BOT) / 2})"`);

	// The percentiles say what the bars cannot: where the tail starts to hurt.
	const facts = [
		['median', `${d.p50.toFixed(1)} min`],
		['1 in 10 longer than', `${d.p90.toFixed(0)} min`],
		['1 in 20 longer than', `${d.p95.toFixed(0)} min`],
		['longest', `${(d.max / 60).toFixed(1)} h`],
	];
	facts.forEach(([k, v], i) => {
		const x = L + i * ((W - L - R) / 4);
		b += text(x, BOT + 62, k, { size: 10.5, fill: MUTED, anchor: 'start' });
		b += text(x, BOT + 78, v, { size: 14, weight: 700, anchor: 'start', fill: i >= 1 ? RED : INK });
	});

	b += text(L, 26, 'How long a prompt actually takes', { size: 15, weight: 700, anchor: 'start' });
	b += text(L, 44, `${d.n} prompts across the whole fleet, from session transcript timestamps`, {
		size: 11, fill: MUTED, anchor: 'start',
	});
	b += text(L, 58, 'Red is everything past ten minutes — the reason to check in rather than sit and watch.', {
		size: 10.5, fill: MUTED, anchor: 'start', style: 'italic',
	});
	writeFileSync(`${OUT}/prompt-durations.svg`, svg(W, H, b));
}

// ---------------------------------------------------------------------------
// 11. The fleet map — three ways to organize a Claude army.
//
//     Redrawn from ~/meta/fleet-map.html, which the meta agent authored as an
//     interactive page. There is no headless browser on this box, and a
//     screenshot of a web page would look like a screenshot next to ten native
//     figures — so it is rebuilt here in the house idiom instead.
//
//     Zone headings are VERBATIM from that map, and the post's section names
//     match them word for word. A reader moving between prose and picture must
//     see the same language or the whole device fails. If any of the three is
//     reworded, the other two have to move with it.
//
//     Two dimensions at once, which is the point: the columns sort by how much
//     each group SHARES, and the badge above each agent shows how far it can
//     REACH. Those are independent, and conflating them is the mistake the
//     figure exists to prevent.
// ---------------------------------------------------------------------------
{
	const W = 1000, H = 548;
	const BLUE = '#0072B2', GREEN = '#009E73', AMBER = '#E69F00';
	const COLW = 316, GAP = 16, LEFT = 16;
	const cx = (i) => LEFT + i * (COLW + GAP) + COLW / 2;
	const x0 = (i) => LEFT + i * (COLW + GAP);
	let b = '';

	const box = (x, y, w, h, stroke, dash) =>
		`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="5" fill="#fff" stroke="${stroke}"` +
		`${dash ? ` stroke-dasharray="${dash}"` : ''} stroke-width="1.3"/>`;

	// Reach badge — colour IS the blast radius, so it carries meaning, not decoration.
	const badge = (x, y, w, label, level) => {
		const c = level === 'read-only' ? GREEN : level === 'admin' ? AMBER : RED;
		return `<rect x="${x}" y="${y}" width="${w}" height="15" rx="7.5" fill="${c}" opacity="0.14"/>` +
			`<circle cx="${x + 9}" cy="${y + 7.5}" r="3.2" fill="${c}"/>` +
			text(x + 17, y + 11, label, { size: 9, anchor: 'start', fill: '#333' });
	};

	const agent = (x, y, w, name, sub) =>
		box(x, y, w, 32, INK) +
		text(x + 8, y + 14, name, { size: 11.5, weight: 700, anchor: 'start' }) +
		text(x + 8, y + 26, sub, { size: 9, anchor: 'start', fill: MUTED });

	const pool = (x, y, w, label, sub, shared) =>
		box(x, y, w, 34, shared ? BLUE : MUTED, shared ? '' : '4 3') +
		text(x + w / 2, y + 15, label, { size: 10.5, weight: 700, fill: shared ? BLUE : INK }) +
		text(x + w / 2, y + 27, sub, { size: 9, fill: MUTED });

	const ZONES = [
		['1  Hive mind — everything shared', 'PePPAR-Fix · four worktrees of one repo'],
		['2  Independent — one shared database', 'ops · seven specialists'],
		['3  Fully independent — nothing shared', 'meta · blog · and one more'],
	];
	for (let i = 0; i < 3; i++) {
		b += `<rect x="${x0(i)}" y="52" width="${COLW}" height="440" rx="7" fill="none" stroke="#dcdcdc"/>`;
		b += text(x0(i) + 12, 74, ZONES[i][0], { size: 12.5, weight: 700, anchor: 'start' });
		b += text(x0(i) + 12, 89, ZONES[i][1], { size: 9.5, fill: MUTED, anchor: 'start' });
	}

	// --- Zone 1: four agents over three shared pools ------------------------
	b += badge(x0(0) + 12, 102, 200, 'commit + root on lab hosts', 'full');
	['Main', 'Bravo', 'Charlie', 'Delta'].forEach((n, k) => {
		b += agent(x0(0) + 12 + (k % 2) * 148, 128 + Math.floor(k / 2) * 40, 140, n, 'own worktree · own transcript');
	});
	b += text(cx(0), 222, 'all four read / write ↓', { size: 9.5, fill: MUTED, style: 'italic' });
	[['Shared memory store', 'one .git → one pool'],
	 ['Shared repo · docs/', 'one .git, four worktrees'],
	 ['Shared state · day plan', 'append-only, all four append']].forEach(([l, sub], k) => {
		b += pool(x0(0) + 12, 232 + k * 42, 288, l, sub, true);
	});
	b += text(cx(0), 372, 'The shared .git is what pools the knowledge.', { size: 9.5, fill: BLUE, style: 'italic' });

	// --- Zone 2: seven private-memory agents over one shared database -------
	const OPS = [
		['proxmox', 'read-only'], ['ntp', 'read-only'], ['ups', 'read-only'], ['homebridge', 'read-only'],
		['checkmk', 'admin'], ['unifi', 'admin'], ['dns', 'admin'],
	];
	OPS.forEach(([n, lvl], k) => {
		const y = 104 + k * 38;
		b += badge(x0(1) + 12, y, 96, lvl, lvl);
		b += box(x0(1) + 116, y - 3, 184, 22, INK);
		b += text(x0(1) + 124, y + 12, n, { size: 10.5, weight: 700, anchor: 'start' });
		b += text(x0(1) + 292, y + 12, 'private memory', { size: 8.5, anchor: 'end', fill: MUTED });
	});
	b += text(cx(1), 386, 'all seven read / write ↓', { size: 9.5, fill: MUTED, style: 'italic' });
	b += pool(x0(1) + 12, 396, 288, 'Shared homelab database', 'referenced, not launched from', true);
	b += text(cx(1), 450, 'A data repo they reference rather than launch', { size: 9.5, fill: BLUE, style: 'italic' });
	b += text(cx(1), 463, 'from — so private memory stays private.', { size: 9.5, fill: BLUE, style: 'italic' });

	// --- Zone 3: nothing shared ---------------------------------------------
	const SOLO = [
		['meta', 'the fleet itself', 'GitHub · repo admin', 'admin'],
		['blog', 'the public surface', 'publishes to the web · Bob-gated', 'full'],
		['one more', 'a private, non-technical domain', 'scoped, and not described here', 'read-only'],
	];
	SOLO.forEach(([n, role, reach, lvl], k) => {
		const y = 108 + k * 74;
		b += badge(x0(2) + 12, y, 288, reach, lvl);
		b += box(x0(2) + 12, y + 20, 288, 34, INK);
		b += text(x0(2) + 20, y + 34, n, { size: 11.5, weight: 700, anchor: 'start' });
		b += text(x0(2) + 20, y + 47, role, { size: 9, anchor: 'start', fill: MUTED });
		b += pool(x0(2) + 12, y + 20, 0, '', '', false); // spacer, keeps the idiom honest
		b += text(x0(2) + 292, y + 47, 'own memory', { size: 8.5, anchor: 'end', fill: MUTED });
	});
	b += box(x0(2) + 12, 336, 288, 34, MUTED, '4 3');
	b += text(cx(2), 351, 'no shared pool at all', { size: 10.5, weight: 700, fill: MUTED });
	b += text(cx(2), 363, 'separate dirs, separate everything', { size: 9, fill: MUTED });
	b += text(cx(2), 396, 'Different domains that should never', { size: 9.5, fill: BLUE, style: 'italic' });
	b += text(cx(2), 409, 'bleed into one another.', { size: 9.5, fill: BLUE, style: 'italic' });

	// --- Legend --------------------------------------------------------------
	const ly = 522;
	b += text(LEFT, ly, 'reach:', { size: 10, weight: 700, anchor: 'start', fill: MUTED });
	[['read-only', GREEN], ['admin', AMBER], ['full — commit / root', RED]].forEach(([l, c], k) => {
		const x = LEFT + 46 + k * 132;
		b += `<circle cx="${x}" cy="${ly - 3.5}" r="3.4" fill="${c}"/>`;
		b += text(x + 9, ly, l, { size: 10, anchor: 'start', fill: '#333' });
	});
	b += text(W - LEFT, ly, 'Every agent runs as the same user — reach is scoped credentials, not a sandbox.', {
		size: 9.5, fill: MUTED, anchor: 'end', style: 'italic',
	});

	b += text(LEFT, 24, 'Three ways to organize a Claude army', { size: 15.5, weight: 700, anchor: 'start' });
	b += text(LEFT, 41, 'One fleet, three organizations — sorted by how much each group shares. Above each agent, a second and independent dimension: its reach.', {
		size: 10, fill: MUTED, anchor: 'start',
	});
	writeFileSync(`${OUT}/fleet-map.svg`, svg(W, H, b));
}

console.error(`wrote 11 figures to ${OUT}/`);
