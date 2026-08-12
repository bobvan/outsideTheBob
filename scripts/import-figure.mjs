#!/usr/bin/env node
// Bring one of Bob's exported slides into src/assets/ at a sane width.
//
//   node scripts/import-figure.mjs /tmp/fastLoopSlowLoop.png FastLoopSlowLoop.png
//   node scripts/import-figure.mjs /tmp/ProtocolRangeBarGraph.pdf UtcDistributionAccuracy.png
//   node scripts/import-figure.mjs /tmp/Odd.pdf Odd.png --slide 4:3
//   node scripts/import-figure.mjs /tmp/Photo.png Photo.png --no-slide-crop
//
// **This script never trims by content, and that is the whole point of it.**
//
// A `.trim()` was added here once to strip the white letterboxing Keynote leaves
// when a 16:9 slide is exported onto US Letter. It worked, and it also quietly
// ate the deliberate margins of every 16:9 export that followed — because
// letterbox white and slide-margin white are the same white, and no
// content-based trim can tell them apart. `UtcDistributionAccuracy.png` was
// still carrying that damage months later: title jammed against the top edge,
// caption against the bottom.
//
// So letterbox removal is **geometric** instead. A slide exported onto a larger
// page sits centred in it, so the slide is the centred box of the slide's own
// aspect ratio — computable from the page size alone, with no reference to where
// the ink happens to be. And before cropping, the script checks that all the ink
// really does lie inside that box. If any escapes it, the assumption is wrong
// and the script refuses rather than cutting the picture.
//
// The margin report at the end exists so the failure this script was written for
// is visible at import time rather than months later on a slide someone is
// presenting from.

import sharp from 'sharp';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { basename, join } from 'node:path';
import { tmpdir } from 'node:os';

const [, , src, name, ...flags] = process.argv;
if (!src || !name) {
	console.error('usage: import-figure.mjs <source> <DestName.png> [--slide W:H] [--no-slide-crop] [--width N] [--dpi N]');
	process.exit(1);
}

const val = (f, d) => {
	const i = flags.indexOf(f);
	return i === -1 ? d : flags[i + 1];
};
const width = Number(val('--width', 1600));
const dpi = Number(val('--dpi', 300));
const slideCrop = !flags.includes('--no-slide-crop');
const [sw, sh] = String(val('--slide', '16:9')).split(':').map(Number);
const dest = `src/assets/${basename(name)}`;

// ---- get a raster, rendering the PDF ourselves if that is what we were given
let work = src;
let scratch = null;
if (/\.pdf$/i.test(src)) {
	scratch = mkdtempSync(join(tmpdir(), 'figure-'));
	execFileSync('pdftoppm', ['-r', String(dpi), '-png', '-singlefile', src, join(scratch, 'page')]);
	work = join(scratch, 'page.png');
}

const before = await sharp(work).metadata();

// ---- where is the ink? used to VERIFY the crop, never to choose it
const inkBox = async (file) => {
	const { data, info } = await sharp(file).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
	const { width: W, height: H, channels: C } = info;
	const white = (x, y) => {
		const i = (y * W + x) * C;
		return data[i] > 245 && data[i + 1] > 245 && data[i + 2] > 245 && data[i + 3] > 245;
	};
	let top = 0, bottom = H - 1, left = 0, right = W - 1;
	while (top < H && [...Array(W).keys()].every((x) => white(x, top))) top++;
	while (bottom > top && [...Array(W).keys()].every((x) => white(x, bottom))) bottom--;
	while (left < W && [...Array(H).keys()].every((y) => white(left, y))) left++;
	while (right > left && [...Array(H).keys()].every((y) => white(right, y))) right--;
	return { top, bottom, left, right, W, H };
};

let pipeline = sharp(work);
let cropped = null;

if (slideCrop) {
	const { W, H } = before.width && before.height ? { W: before.width, H: before.height } : {};
	const pageAR = W / H;
	const slideAR = sw / sh;
	if (Math.abs(pageAR - slideAR) > 0.01) {
		// The slide is the centred box of the requested aspect ratio, limited by
		// whichever page dimension runs out first.
		const boxW = pageAR > slideAR ? Math.round(H * slideAR) : W;
		const boxH = pageAR > slideAR ? H : Math.round(W / slideAR);
		const left = Math.round((W - boxW) / 2);
		const top = Math.round((H - boxH) / 2);

		const ink = await inkBox(work);
		const escapes =
			ink.top < top || ink.bottom > top + boxH - 1 || ink.left < left || ink.right > left + boxW - 1;
		if (escapes) {
			console.error(
				`✗ refusing to crop: content runs outside the centred ${sw}:${sh} box.\n` +
					`   page ${W}x${H}, box would be ${boxW}x${boxH} at (${left},${top}),\n` +
					`   ink is x ${ink.left}..${ink.right}, y ${ink.top}..${ink.bottom}.\n` +
					`   Either the slide is not ${sw}:${sh}, or it is not centred. Pass --slide W:H, or\n` +
					`   --no-slide-crop to import the page as it is. Nothing was written.`,
			);
			if (scratch) rmSync(scratch, { recursive: true, force: true });
			process.exit(1);
		}
		pipeline = pipeline.extract({ left, top, width: boxW, height: boxH });
		cropped = `${boxW}x${boxH}`;
	}
}

await pipeline.resize({ width, withoutEnlargement: true }).png({ compressionLevel: 9 }).toFile(dest);

// ---- report, including the margins, because a zero margin is the bug
const after = await sharp(dest).metadata();
const ink = await inkBox(dest);
const m = { top: ink.top, bottom: after.height - 1 - ink.bottom, left: ink.left, right: after.width - 1 - ink.right };

console.error(
	`${src} ${before.width}x${before.height}` +
		(cropped ? ` → slide ${cropped}` : '') +
		` → ${dest} ${after.width}x${after.height}`,
);
console.error(`  margins  top ${m.top}  bottom ${m.bottom}  left ${m.left}  right ${m.right}  (px)`);
if (Math.min(m.top, m.bottom) === 0 && Math.min(m.left, m.right) === 0) {
	console.error(`  ⚠ ink touches an edge on both axes. Fine for a photograph, a sign of a
    content-trimmed slide otherwise — compare against the original before shipping it.`);
}

if (scratch) rmSync(scratch, { recursive: true, force: true });
