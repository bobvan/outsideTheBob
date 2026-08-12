#!/usr/bin/env node
// Which long pages end with a bottom line, and which do not?
//
//   npm run bottom-line                 # report against the 1500-word soft threshold
//   npm run bottom-line -- --words 1200 # try a different one
//
// The house rule (docs/style-guide.md): **a page over about 1500 prose words
// should end with a section that states its conclusions on their own**, and set
// `bottomLine:` in frontmatter to that section's anchor. The page then shows a
// "skip the details" jump near the top.
//
// The threshold is soft and high on purpose. The median garden page is under a
// thousand words and needs no summary at all — if a third of the site carried
// one, the jump link would stop meaning "this page is long" and start meaning
// nothing. It marks the outliers, or it marks nothing.
//
// This does not check that a bottom line is any *good*. It checks that long
// pages have one and that the anchor resolves; the build fails on a dead anchor,
// which is the error that would otherwise reach a reader.

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import GithubSlugger from 'github-slugger';

const argv = process.argv.slice(2);
const threshold = Number(argv[argv.indexOf('--words') + 1]) || 1500;

const walk = (d) =>
	readdirSync(d).flatMap((f) => {
		const p = join(d, f);
		return statSync(p).isDirectory() ? walk(p) : /\.mdx?$/.test(p) ? [p] : [];
	});

const field = (fm, k) => fm.match(new RegExp(`^${k}:\\s*"?(.*?)"?\\s*$`, 'm'))?.[1] ?? null;

// Prose only. Component tags carry alt text and captions a reader never meets as
// running prose, and counting them would push short pages over for the wrong
// reason.
const prose = (body) =>
	body
		.replace(/```[\s\S]*?```/g, ' ')
		.replace(/<[^>]+>/g, ' ')
		.replace(/^import .*$/gm, '')
		.split(/\s+/)
		.filter(Boolean).length;

const rows = [...walk('src/content/topics'), ...walk('src/content/blog')].map((f) => {
	const src = readFileSync(f, 'utf8');
	const fm = src.split(/^---$/m)[1] ?? '';
	const body = src.split(/\n---/).slice(1).join('\n---');
	const slugger = new GithubSlugger();
	const headings = [...body.matchAll(/^##+ (.+)$/gm)].map((m) => ({
		text: m[1].trim(),
		slug: slugger.slug(m[1].trim()),
	}));
	return {
		name: f.split('/').pop().replace(/\.mdx?$/, ''),
		kind: f.includes('/blog/') ? 'blog' : 'garden',
		words: prose(body),
		bottomLine: field(fm, 'bottomLine'),
		headings,
	};
});

const long = rows.filter((r) => r.words >= threshold).sort((a, b) => b.words - a.words);
const missing = [];
const broken = [];

console.error(`Pages over ${threshold} prose words — ${long.length} of ${rows.length}\n`);
console.error(`${'words'.padStart(5)}  ${'bottom line'.padEnd(46)} page`);
for (const r of long) {
	if (!r.bottomLine) {
		missing.push(r);
		console.error(`${String(r.words).padStart(5)}  ${'— none'.padEnd(46)} ${r.name}`);
		continue;
	}
	const h = r.headings.find((x) => x.slug === r.bottomLine);
	if (!h) broken.push(r);
	console.error(
		`${String(r.words).padStart(5)}  ${(h ? h.text : `✗ #${r.bottomLine} — NO SUCH HEADING`).slice(0, 46).padEnd(46)} ${r.name}`,
	);
}

// A bottom line on a *short* page is not an error — some short pages earn one —
// but it is worth surfacing, because it dilutes what the jump link signals.
const shortWithOne = rows.filter((r) => r.words < threshold && r.bottomLine);
if (shortWithOne.length) {
	console.error(`\nUnder the threshold but carrying one anyway (fine, just noting it):`);
	for (const r of shortWithOne) console.error(`  ${String(r.words).padStart(5)}  ${r.name}`);
}

console.error(
	`\n${long.length - missing.length}/${long.length} long pages end with a bottom line.` +
		(missing.length ? ` ${missing.length} to write:` : ''),
);
for (const r of missing) console.error(`   ${r.name}`);
if (broken.length) {
	console.error(`\n✗ ${broken.length} page(s) point at a heading that does not exist — the build will fail.`);
	process.exit(1);
}
process.exit(0);
