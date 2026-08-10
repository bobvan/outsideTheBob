#!/usr/bin/env node
// Which pages can we publish first, and what does each choice cost?
//
//     npm run publish-set                       # the ranking
//     npm run publish-set -- --set a,b,c        # cost of publishing exactly these
//     npm run publish-set -- --closure a,b,c    # smallest link-closed set containing these
//
// The constraint that makes this a graph problem rather than a judgement call:
// a published page must not link to an unpublished one. Every such link is
// either an edit now (remove or reword it) or a broken promise to a reader.
//
// So each candidate carries two numbers that point in opposite directions:
//
//   OUT to drafts — what publishing it costs today. Every one is an edit, and
//                   most will want re-editing when the target publishes.
//   IN from drafts — what publishing it is worth later. Those links come alive
//                    for free the day their source publishes, no edit at all.
//
// A good first batch is high IN, low OUT: pages the rest of the garden points
// at, which do not themselves depend on anything unwritten. Those are usually
// the concept Homes, which is not a coincidence — the H/S/M rule builds exactly
// that shape.
//
// The glossary is all-or-nothing (see docs/backlog.md P1), so its seeAlso links
// into pages are counted separately: they constrain which pages must ship, not
// which may.

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, basename } from 'node:path';

const argv = process.argv.slice(2);
const flag = (n) => { const i = argv.indexOf(`--${n}`); return i === -1 ? null : (argv[i + 1] ?? ''); };

const walk = (d) => readdirSync(d).flatMap((f) => {
	const p = join(d, f);
	return statSync(p).isDirectory() ? walk(p) : /\.mdx?$/.test(p) ? [p] : [];
});
const fld = (fm, k) => fm.match(new RegExp(`^${k}:\\s*"?(.*?)"?\\s*$`, 'm'))?.[1] ?? null;

const pages = walk('src/content/topics').map((file) => {
	const src = readFileSync(file, 'utf8');
	const fm = src.split(/^---$/m)[1] ?? '';
	const slug = fld(fm, 'slug') || basename(file).replace(/\.mdx?$/, '');
	const body = src.slice(src.indexOf('---', 4) + 3);
	return {
		file, slug,
		title: fld(fm, 'title') ?? slug,
		section: fld(fm, 'section') ?? '?',
		note: fld(fm, 'reviewNote') ?? '',
		draft: (fld(fm, 'draft') ?? 'true') !== 'false',
		// Outbound links to other topic pages, deduplicated: two links to the
		// same page are one decision, not two.
		out: [...new Set([...body.matchAll(/\/timekeeping\/([a-z-]+)\/([a-z0-9-]+)\//g)].map((m) => m[2]))],
	};
});
const bySlug = new Map(pages.map((p) => [p.slug, p]));
for (const p of pages) p.out = p.out.filter((s) => bySlug.has(s) && s !== p.slug);

// Glossary seeAlso links into pages — a separate constraint, because the
// glossary ships as one unit.
const gloss = readFileSync('src/data/glossary.yaml', 'utf8');
const glossTargets = new Set(
	[...gloss.matchAll(/href:\s*"\/timekeeping\/[a-z-]+\/([a-z0-9-]+)\//g)].map((m) => m[1]).filter((s) => bySlug.has(s)),
);

const inFrom = new Map(pages.map((p) => [p.slug, []]));
for (const p of pages) for (const t of p.out) inFrom.get(t).push(p.slug);

// --- evaluate an explicit set ---------------------------------------------
const evalSet = (set) => {
	const S = new Set(set);
	let edits = 0;
	const breaks = [];
	for (const s of S) {
		for (const t of bySlug.get(s).out) if (!S.has(t)) { edits++; breaks.push(`${s} → ${t}`); }
	}
	const glossMisses = [...glossTargets].filter((t) => !S.has(t));
	return { edits, breaks, glossMisses };
};

// --- what does DEFERRING a page cost? --------------------------------------
// Closure turned out to be the wrong lever: the garden is dense enough that
// almost any seed drags in 28 of 31 pages. So the useful question is inverted —
// pick the batch editorially, then price the pages you are leaving out. The
// price of deferring X is the number of links to X from pages you DO publish,
// because every one of those is an edit now and a re-edit when X lands.
const deferArg = flag('defer');
if (deferArg !== null) {
	const D = new Set(deferArg.split(',').map((x) => x.trim()).filter(Boolean));
	const bad = [...D].filter((s) => !bySlug.has(s));
	if (bad.length) { console.error('unknown slug(s): ' + bad.join(', ')); process.exit(1); }
	const S = pages.map((p) => p.slug).filter((s) => !D.has(s));
	const r = evalSet(S);
	console.error(`publish ${S.length}, defer ${D.size}`);
	console.error(`${r.edits} link(s) to edit now, and to revisit when the deferred pages land:`);
	const byTarget = new Map();
	for (const b of r.breaks) {
		const [from, to] = b.split(' → ');
		if (!byTarget.has(to)) byTarget.set(to, []);
		byTarget.get(to).push(from);
	}
	for (const [to, froms] of [...byTarget].sort((a, b) => b[1].length - a[1].length)) {
		console.error(`   ${String(froms.length).padStart(2)}  → ${to}`);
		for (const f of froms.sort()) console.error(`        from ${f}`);
	}
	if (r.glossMisses.length) {
		console.error(`\n⚠ ${r.glossMisses.length} glossary seeAlso entr(ies) point at deferred pages — trim those:`);
		for (const g of r.glossMisses) console.error('   ' + g);
	}
	process.exit(0);
}

const setArg = flag('set') ?? flag('closure');
if (setArg !== null) {
	let S = setArg.split(',').map((x) => x.trim()).filter(Boolean);
	const bad = S.filter((s) => !bySlug.has(s));
	if (bad.length) { console.error('unknown slug(s): ' + bad.join(', ')); process.exit(1); }
	if (argv.includes('--closure')) {
		// Pull in whatever the set points at, transitively, until it is closed.
		const seen = new Set(S);
		const q = [...S];
		while (q.length) for (const t of bySlug.get(q.pop()).out) if (!seen.has(t)) { seen.add(t); q.push(t); }
		S = [...seen];
		console.error(`link-closed set: ${S.length} pages\n  ${S.sort().join('\n  ')}\n`);
	}
	const r = evalSet(S);
	console.error(`${S.length} pages · ${r.edits} link(s) would need editing`);
	for (const b of r.breaks) console.error('   ✗ ' + b);
	if (r.glossMisses.length) {
		console.error(`\n⚠ glossary seeAlso points at ${r.glossMisses.length} unpublished page(s):`);
		for (const g of r.glossMisses) console.error('   ' + g);
		console.error('   (the glossary ships as one unit — these entries need their seeAlso trimmed)');
	}
	process.exit(0);
}

// --- the ranking -----------------------------------------------------------
const rows = pages.map((p) => ({
	slug: p.slug, section: p.section, title: p.title, note: p.note,
	out: p.out.length,
	in: inFrom.get(p.slug).length,
	glossary: glossTargets.has(p.slug),
})).sort((a, b) => a.out - b.out || b.in - a.in || a.slug.localeCompare(b.slug));

console.error('Cheapest to publish first. OUT is what it costs now; IN is what it is worth later.\n');
console.error('  OUT  IN  G  page');
for (const r of rows) {
	console.error(
		`  ${String(r.out).padStart(3)} ${String(r.in).padStart(3)}  ${r.glossary ? 'G' : ' '}  ${r.slug.padEnd(40)} ${r.note}`,
	);
}
console.error(`\n${rows.length} pages · ${rows.reduce((n, r) => n + r.out, 0)} internal page-to-page links`);
console.error(`${rows.filter((r) => r.out === 0).length} page(s) link to nothing else — publishable alone today`);
console.error(`glossary seeAlso reaches ${glossTargets.size} page(s), all of which must ship with it`);
console.error('\n  npm run publish-set -- --closure <slug>,<slug>   # smallest self-consistent set containing these');
