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
//   - Direct labelling on the panel. No legends.
//   - No fills, gradients or 3-D. The ink is the data.
//   - Panels adjacent in space, never stacked in sequence.
//   - Every figure has ONE sentence it is trying to make unavoidable.
//
// Shot positions come from a seeded PRNG so a rebuild is byte-identical and a
// diff means something changed on purpose.
import { mkdirSync, writeFileSync } from 'node:fs';

const OUT = 'public/figures';
const INK = '#111';
const MUTED = '#777';

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

const shots = (seed, cx, cy, sigma, n = 22, clampTo = null) => {
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
		b += dots(shots(c.seed, p.cx + c.off, p.cy - c.off * 0.55, c.sig, 22, { cx: p.cx, cy: p.cy, r: R * 0.97 }));
		if (c.accurate) {
			// A bracket rather than a caption, so the claim sits ON the panel it
			// is about and cannot drift into a neighbouring label.
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
//    centres, none preferred. Right: the frame you wish you had.
//    The shots are IDENTICAL in both panels — that is the whole argument.
// ---------------------------------------------------------------------------
{
	const R = 82, W = 560, H = 250;
	const L = { cx: 145, cy: 118 }, Rt = { cx: 415, cy: 118 };
	const pts = shots(7, 0, 0, 17);
	let b = '';
	// Left: an amorphous outline round the group, no rings, no centre.
	const hull = pts
		.map((p, i) => {
			const a = (i / pts.length) * Math.PI * 2;
			const rr = R * 0.62 + (i % 5) * 4;
			return `${(L.cx + Math.cos(a) * rr).toFixed(1)},${(L.cy + Math.sin(a) * rr).toFixed(1)}`;
		})
		.join(' ');
	b += `<polygon points="${hull}" fill="none" stroke="${MUTED}" stroke-width="1" stroke-dasharray="4 4"/>`;
	b += dots(pts.map((p) => ({ x: L.cx + p.x, y: L.cy + p.y })));
	for (const [dx, dy] of [[-46, -34], [52, -18], [14, 46], [-30, 40], [40, 30]]) {
		b += text(L.cx + dx, L.cy + dy, 'UTC?', { size: 12, fill: MUTED, style: 'italic' });
	}
	b += text(L.cx, 232, 'What you can observe', { size: 13, weight: 600 });

	// Right: same shots, a frame, one answer.
	b += rings(Rt.cx, Rt.cy, [R, R * 0.66, R * 0.33]);
	b += dots(pts.map((p) => ({ x: Rt.cx + p.x, y: Rt.cy + p.y })));
	// paint-order puts the halo under the glyphs, so the label stays legible
	// where it necessarily overlaps the shots it is labelling.
	b += `<text x="${Rt.cx}" y="${Rt.cy + 4}" text-anchor="middle" font-family="system-ui, sans-serif" font-size="14" font-weight="700" fill="${INK}" stroke="#fff" stroke-width="4" style="paint-order: stroke fill;">UTC!</text>`;
	b += text(Rt.cx, 232, 'What you would need', { size: 13, weight: 600 });
	writeFileSync(`${OUT}/where-is-utc.svg`, svg(W, H, b));
}

// ---------------------------------------------------------------------------
// 3. Resolution ladder. One shot pattern, four reporting grids. The last panel
//    is the point: coarse resolution does not merely limit precision, it
//    counterfeits it.
// ---------------------------------------------------------------------------
{
	const R = 62, GAP = 34, PAD = 22, TOP = 26;
	const W = PAD * 2 + 4 * (2 * R) + 3 * GAP;
	const H = TOP + 2 * R + 66;
	const cells = [0, 14, 30, 999];
	const pts = shots(19, 0, 0, 15);
	let b = '';
	cells.forEach((cell, i) => {
		const cx = PAD + R + i * (2 * R + GAP);
		const cy = TOP + R;
		b += rings(cx, cy, [R, R * 0.62]);
		if (cell > 0 && cell < 900) {
			for (let g = -R; g <= R; g += cell) {
				b += `<line x1="${cx + g}" y1="${cy - R}" x2="${cx + g}" y2="${cy + R}" stroke="${MUTED}" stroke-width="0.4"/>`;
				b += `<line x1="${cx - R}" y1="${cy + g}" x2="${cx + R}" y2="${cy + g}" stroke="${MUTED}" stroke-width="0.4"/>`;
			}
		}
		const snap = (v) => (cell > 0 && cell < 900 ? Math.round(v / cell) * cell + cell / 2 : v);
		const shown = cell >= 900 ? [{ x: 0, y: 0 }] : pts.map((p) => ({ x: snap(p.x), y: snap(p.y) }));
		b += dots(shown.map((p) => ({ x: cx + p.x, y: cy + p.y })), cell >= 900 ? 5 : 3.1);
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
// 4. The datacenter trade, in both representations. Top row: two ensembles as
//    targets. Bottom row: the same two as distributions, for readers who would
//    rather see mu and sigma. Same data, two languages.
// ---------------------------------------------------------------------------
{
	const R = 70, W = 560, H = 400;
	const A = { cx: 150, cy: 96 }, B = { cx: 410, cy: 96 };
	const offA = 46, sigA = 8, offB = 0, sigB = 22;
	let b = '';
	for (const [p, off, sig, seed, top, bot] of [
		[A, offA, sigA, 5, 'off by 100 ns,', 'agreeing to 10 ns'],
		[B, offB, sigB, 9, 'no average error,', 'agreeing to 25 ns'],
	]) {
		b += rings(p.cx, p.cy, [R, R * 0.66, R * 0.33]);
		b += dots(shots(seed, p.cx + off, p.cy, sig));
		b += text(p.cx, p.cy + R + 22, top, { size: 12, weight: 600 });
		b += text(p.cx, p.cy + R + 38, bot, { size: 12, weight: 600 });
	}
	// Distributions, same parameters, drawn to the same horizontal scale.
	const axisY = 330, x0 = 60, x1 = 500, mid = (x0 + x1) / 2, sc = 2.2;
	b += `<line x1="${x0}" y1="${axisY}" x2="${x1}" y2="${axisY}" stroke="${MUTED}" stroke-width="1"/>`;
	b += `<line x1="${mid}" y1="${axisY - 76}" x2="${mid}" y2="${axisY + 6}" stroke="${MUTED}" stroke-width="1" stroke-dasharray="3 3"/>`;
	b += text(mid, axisY + 20, 'UTC', { size: 12, fill: MUTED });
	const curve = (mu, sigma, dash) => {
		const pts = [];
		for (let x = x0; x <= x1; x += 3) {
			const z = (x - (mid + mu * sc)) / (sigma * sc);
			pts.push(`${x},${(axisY - 72 * Math.exp(-0.5 * z * z)).toFixed(1)}`);
		}
		return `<polyline points="${pts.join(' ')}" fill="none" stroke="${INK}" stroke-width="1.6"${dash ? ` stroke-dasharray="${dash}"` : ''}/>`;
	};
	b += curve(offA, sigA, '');
	b += curve(offB, sigB, '5 4');
	b += text(mid + offA * sc, axisY - 84, 'μ ≠ 0, small σ', { size: 11, weight: 600 });
	b += text(mid, axisY - 96, 'μ = 0, large σ', { size: 11, weight: 600 });
	b += text(x0, 244, 'The same two ensembles, for readers who prefer μ and σ', {
		size: 12, fill: MUTED, anchor: 'start', style: 'italic',
	});
	writeFileSync(`${OUT}/agreement-vs-truth.svg`, svg(W, H, b));
}

console.error(`wrote 4 figures to ${OUT}/`);
