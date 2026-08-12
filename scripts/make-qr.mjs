#!/usr/bin/env node
// A QR code for a page on this site, sized for a projector or a screen share.
//
//   npm run qr -- /timekeeping/datacenters/datacenter-gnss-time-best-practices/
//   npm run qr -- /timekeeping/ --name Garden --ec H --px 3000
//   npm run qr -- https://example.com/elsewhere --name Elsewhere
//
// Writes <name>.svg and <name>.png into qr/, which is excluded from git —
// these are presentation assets, not blog content, and one command rebuilds
// them.
//
// Three decisions are baked in because getting them wrong is what makes a code
// fail from the back of a room:
//
//   - **Dark on white, always.** Inverted codes (light modules on a dark slide)
//     are legal and many scanners refuse them anyway. If the slide is dark, put
//     the code on a white card rather than inverting it.
//   - **The quiet zone is not optional.** Four modules of white all the way
//     round is part of the symbol, not padding, and a slide layout that crops
//     it produces a code that scans on your laptop and not from a sofa.
//   - **Error correction trades robustness against module size**, and on a
//     screen share module size usually wins. A shorter URL is worth more than a
//     higher EC level: it lowers the version, which makes every module bigger,
//     which is the thing that actually decides whether a phone across the room
//     locks on.

import QRCode from 'qrcode';
import sharp from 'sharp';
import { mkdirSync, writeFileSync } from 'node:fs';

const SITE = 'https://thinkoutsidethebob.com';

const argv = process.argv.slice(2);
const flag = (n, d) => {
	const i = argv.indexOf(`--${n}`);
	return i === -1 ? d : (argv[i + 1] ?? d);
};
const positional = argv.filter((a, i) => !a.startsWith('--') && !argv[i - 1]?.startsWith('--'));
const target = positional[0];

if (!target) {
	console.error('usage: make-qr.mjs <path-or-url> [--name Name] [--ec L|M|Q|H] [--px 2000]');
	process.exit(1);
}

const url = /^https?:/.test(target) ? target : SITE + (target.startsWith('/') ? target : `/${target}`);
const ec = String(flag('ec', 'Q')).toUpperCase();
const px = Number(flag('px', 2000));
const name =
	flag('name', null) ??
	(url.replace(/\/$/, '').split('/').pop() || 'qr')
		.split('-')
		.map((w) => w[0].toUpperCase() + w.slice(1))
		.join('');

mkdirSync('qr', { recursive: true });

const opts = { errorCorrectionLevel: ec, margin: 4, color: { dark: '#000000', light: '#ffffff' } };
const svg = await QRCode.toString(url, { ...opts, type: 'svg' });
writeFileSync(`qr/${name}.svg`, svg);
await sharp(Buffer.from(svg)).resize(px, px, { kernel: 'nearest' }).png().toFile(`qr/${name}.png`);

// Report the version, because it is the number that predicts scannability and
// nothing else in the output shows it. Each version step adds 4 modules per
// side; a version 3 code has 29 and a version 10 has 57, so the same slide area
// gives you modules half the size.
const modules = QRCode.create(url, { errorCorrectionLevel: ec }).modules.size;
const version = (modules - 17) / 4;

console.error(`${url}`);
console.error(`  ${url.length} chars → version ${version} (${modules}×${modules} modules), EC ${ec}`);
console.error(`  qr/${name}.svg   vector, for Keynote`);
console.error(`  qr/${name}.png   ${px}×${px}`);
console.error(`  module size at 1080p full-height: ~${(1080 / (modules + 8)).toFixed(1)} px`);
if (version > 6) {
	console.error(
		`\n  ⚠ version ${version} is dense for a screen share. A shorter URL would help more\n` +
			`    than a lower EC level — every 4 versions halves the module size.`,
	);
}
