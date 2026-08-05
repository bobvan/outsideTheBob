#!/usr/bin/env node
// Bring one of Bob's exported slides into src/assets/ at a sane width.
//
//   node scripts/import-figure.mjs /tmp/fastLoopSlowLoop.png FastLoopSlowLoop.png
//   node scripts/import-figure.mjs /tmp/Old.png Old.png --trim
//
// The default is NOT to trim. This script exists because the default used to be
// the other way round: a `.trim()` was added once to strip the white
// letterboxing Keynote leaves when a 16:9 slide is exported onto US Letter, and
// it then quietly ate the margins of every 16:9 PNG that followed. Bob draws
// those margins on purpose — a figure with its whitespace shaved sits jammed
// against its own frame. Pass --trim only for a genuinely letterboxed export,
// and look at the result.

import sharp from 'sharp';
import { basename } from 'node:path';

const [, , src, name, ...flags] = process.argv;
if (!src || !name) {
	console.error('usage: import-figure.mjs <source> <DestName.png> [--trim] [--width=N]');
	process.exit(1);
}

const trim = flags.includes('--trim');
const width = Number(flags.find((f) => f.startsWith('--width='))?.slice(8) ?? 1600);
const dest = `src/assets/${basename(name)}`;

let img = sharp(src);
const before = await img.metadata();
if (trim) img = img.trim({ threshold: 6 });

await img.resize({ width, withoutEnlargement: true }).png({ compressionLevel: 9 }).toFile(dest);

const after = await sharp(dest).metadata();
console.error(
	`${src} ${before.width}x${before.height} -> ${dest} ${after.width}x${after.height}` +
		(trim ? ' (trimmed)' : ''),
);
