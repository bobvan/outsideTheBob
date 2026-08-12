#!/usr/bin/env node
// Has a figure had its margins shaved?
//
//   npm run figures:check
//
// `import-figure.mjs` reports margins as it writes, which catches this going
// forward. This catches what is already in the repo — which is how the bug was
// actually found: `UtcDistributionAccuracy.png` sat in `src/assets/` for over a
// week with its title jammed against the top edge, and it surfaced because Bob
// looked at the page, not because anything checked.
//
// The test is crude on purpose: does ink touch an edge on *both* axes? A slide
// exported from Keynote has margins on all four sides, so a slide that touches
// top-and-bottom as well as left-and-right has been trimmed by something.
//
// Photographs and screenshot crops legitimately run to the edge, so they are
// listed below by name. The list is the point: adding to it should be a decision
// somebody makes, not a threshold that quietly absorbs the next casualty.

import sharp from 'sharp';
import { readdirSync } from 'node:fs';

// Content reaches the edge by design. Photographs, and screenshots Bob cropped
// to the region worth showing.
const EDGE_TO_EDGE_ON_PURPOSE = new Set([
	'CableDelayByDelay.png', // screenshot crop of a clock's web UI
	'CableDelayByLength.png', // the same, other radio button
	'PostfixQueueWarning.png', // screenshot crop of a log
	'ManhattanBlockLatency.jpg', // photograph
	'SecaucusCampus.jpg', // photograph
	'lastNs2utcLondon.jpg', // photograph
]);

const inkMargins = async (file) => {
	const { data, info } = await sharp(file).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
	const { width: W, height: H, channels: C } = info;
	const white = (x, y) => {
		const i = (y * W + x) * C;
		return data[i] > 245 && data[i + 1] > 245 && data[i + 2] > 245 && data[i + 3] > 245;
	};
	const xs = [...Array(W).keys()];
	const ys = [...Array(H).keys()];
	let top = 0, bottom = H - 1, left = 0, right = W - 1;
	while (top < H && xs.every((x) => white(x, top))) top++;
	while (bottom > top && xs.every((x) => white(x, bottom))) bottom--;
	while (left < W && ys.every((y) => white(left, y))) left++;
	while (right > left && ys.every((y) => white(right, y))) right--;
	return { top, bottom: H - 1 - bottom, left, right: W - 1 - right, W, H };
};

const files = readdirSync('src/assets')
	.filter((f) => /\.(png|jpe?g)$/i.test(f))
	.sort();

const suspect = [];
for (const f of files) {
	const m = await inkMargins(`src/assets/${f}`);
	const tight = Math.min(m.top, m.bottom) === 0 && Math.min(m.left, m.right) === 0;
	const known = EDGE_TO_EDGE_ON_PURPOSE.has(f);
	const mark = !tight ? '  ok  ' : known ? ' edge ' : 'CHECK ';
	if (tight && !known) suspect.push({ f, m });
	console.error(
		`${mark} ${`${m.top}/${m.bottom}/${m.left}/${m.right}`.padEnd(18)} ${`${m.W}x${m.H}`.padStart(10)}  ${f}`,
	);
}

console.error('\n  margins are top/bottom/left/right in pixels');
console.error('  ok = has margins   edge = reaches the edge on purpose (see the list in this script)');

if (!suspect.length) {
	console.error('\n✓ no figure looks content-trimmed');
	process.exit(0);
}
console.error(`\n✗ ${suspect.length} figure(s) reach the edge on both axes and are not on the list:`);
for (const { f } of suspect) console.error(`   ${f}`);
console.error(
	'\n  Either re-import from the original with scripts/import-figure.mjs, or add it to\n' +
		'  EDGE_TO_EDGE_ON_PURPOSE with a comment saying why.',
);
process.exit(1);
