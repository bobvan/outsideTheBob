#!/usr/bin/env node
// Bob's review tracker.
//
//     npm run review                      # what still needs your eyes
//     npm run review -- --all             # every draft, including the done ones
//     npm run review -- --published       # include already-published pages too
//     npm run review -- --never           # only the ones you have never read
//     npm run review -- --stale           # only the ones that changed after you read them
//     npm run review -- --mark <slug>     # sign a page off, dated today
//     npm run review -- --mark <slug> --note "keep the archer paragraph"
//     npm run review -- --unmark <slug>
//
// The state lives in one optional frontmatter field, `reviewed:`, on the page
// itself. That placement is the whole design:
//
//   - it travels with the page through renames and retitles, which a separate
//     checklist would not;
//   - it never renders, so the published page is untouched;
//   - and it sits next to `updatedDate`, which is what makes the interesting
//     question computable.
//
// The interesting question is not "have I read this?" but **"has it changed
// since I read it?"** A page signed off on the 5th and edited on the 8th is
// not reviewed any more, and no checklist maintained by hand would notice.
//
// Bob edits these by hand in vi, which is the expected path — `--mark` is a
// convenience, not the interface. Two consequences the code has to carry:
//
//   - dates are PARSED, not string-compared, because a hand-typed `2026-8-8`
//     is reasonable and would sort wrong as a string;
//   - a mistyped key is reported, because Astro drops unknown frontmatter keys
//     without complaint and `reviwed:` would look like it had worked.

import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, basename } from 'node:path';

const argv = process.argv.slice(2);
const flag = (name) => {
	const i = argv.indexOf(`--${name}`);
	return i === -1 ? null : (argv[i + 1] ?? '');
};
const has = (name) => argv.includes(`--${name}`);

const walk = (dir) =>
	readdirSync(dir).flatMap((f) => {
		const p = join(dir, f);
		return statSync(p).isDirectory() ? walk(p) : /\.mdx?$/.test(p) ? [p] : [];
	});

const field = (fm, key) => fm.match(new RegExp(`^${key}:\\s*"?(.*?)"?\\s*$`, 'm'))?.[1] ?? null;

function load(file) {
	const src = readFileSync(file, 'utf8');
	const fm = src.split(/^---$/m)[1] ?? '';
	const slugField = field(fm, 'slug');
	return {
		file,
		src,
		slug: slugField || basename(file).replace(/\.mdx?$/, ''),
		title: field(fm, 'title') ?? '(untitled)',
		section: field(fm, 'section') ?? (file.includes('/blog/') ? 'blog' : '?'),
		updated: field(fm, 'updatedDate') ?? field(fm, 'pubDate'),
		reviewed: field(fm, 'reviewed'),
		note: field(fm, 'reviewNote'),
		// draft defaults to true in both schemas, so absent means draft.
		draft: (field(fm, 'draft') ?? 'true') !== 'false',
	};
}

// Only drafts are in scope. A published page has already had whatever review it
// was going to get, and counting nine shipped posts as "never reviewed" made the
// number useless — the question this tool answers is "what is not ready yet",
// not "what have I ever read". --published brings them back if you want a sweep.
const allPages = [...walk('src/content')].map(load);
const pages = has('published') ? allPages : allPages.filter((p) => p.draft);
const hiddenPublished = allPages.length - pages.length;

// Astro strips unknown frontmatter keys without complaint, so `reviwed:` would
// do nothing at all and look like it had worked. Catch the near misses.
const KNOWN = new Set(['reviewed', 'reviewNote']);
const typos = [];
for (const p of pages) {
	const fm = p.src.split(/^---$/m)[1] ?? '';
	for (const m of fm.matchAll(/^([A-Za-z]+):/gm)) {
		const k = m[1];
		if (KNOWN.has(k)) continue;
		const kl = k.toLowerCase();
		if (kl.startsWith('rev') || kl.includes('review')) typos.push(`${p.file}: "${k}:" — did you mean "reviewed:"?`);
	}
}
const today = new Date().toISOString().slice(0, 10);

// ---- mark / unmark --------------------------------------------------------
const mark = flag('mark');
const unmark = flag('unmark');
if (mark !== null || unmark !== null) {
	const want = mark ?? unmark;
	const hits = pages.filter((p) => p.slug === want || p.file.includes(want));
	if (hits.length !== 1) {
		console.error(
			hits.length ? `Ambiguous — matches:\n  ${hits.map((h) => h.slug).join('\n  ')}` : `No page matching "${want}".`,
		);
		process.exit(1);
	}
	const p = hits[0];
	let fm = p.src.split(/^---$/m)[1];
	let next = fm.replace(/^reviewed:.*$\n?/m, '').replace(/^reviewNote:.*$\n?/m, '');
	if (mark !== null) {
		const note = flag('note');
		next = next.replace(/\n$/, '\n') + `reviewed: ${today}\n` + (note ? `reviewNote: "${note.replace(/"/g, "'")}"\n` : '');
	}
	writeFileSync(p.file, p.src.replace(fm, next));
	console.error(`${mark !== null ? '✓ reviewed' : '↩ cleared'} ${p.slug}  (${p.file})`);
	process.exit(0);
}

// ---- report ---------------------------------------------------------------
// Parse rather than string-compare. A hand-typed `2026-8-8` is a perfectly
// reasonable thing to write in vi and would sort wrong as a string, which would
// quietly mark a stale page current — the one error this tool must not make.
const day = (v) => {
	if (!v) return null;
	const t = Date.parse(v);
	return Number.isNaN(t) ? NaN : t;
};
const state = (p) => {
	const r = day(p.reviewed);
	if (r === null) return 'never';
	if (Number.isNaN(r)) return 'bad';
	const u = day(p.updated);
	if (u !== null && !Number.isNaN(u) && u > r) return 'stale';
	return 'ok';
};
const MARK = { never: '·', stale: '!', ok: '✓', bad: '?' };

const rows = pages.map((p) => ({ ...p, state: state(p) }));
const only = has('never') ? 'never' : has('stale') ? 'stale' : null;
const shown = has('all') ? rows : rows.filter((r) => (only ? r.state === only : r.state !== 'ok'));

// Counted and printed BEFORE the listing. With forty pages the list can run off
// a terminal, and a summary you have to scroll past the answer to reach is a
// summary in the wrong place.
const n = (s) => rows.filter((r) => r.state === s).length;
const summary =
	`${n('ok')} current · ${n('stale')} changed since you read them · ${n('never')} never reviewed · ` +
	`${rows.length} draft${rows.length === 1 ? '' : 's'}` +
	(hiddenPublished ? ` (${hiddenPublished} published page${hiddenPublished === 1 ? '' : 's'} not counted — --published to include)` : '');
console.error(summary);
if (!has('all') && !only) console.error('listing everything that is not current:');

const bySection = new Map();
for (const r of shown) {
	if (!bySection.has(r.section)) bySection.set(r.section, []);
	bySection.get(r.section).push(r);
}

for (const [section, list] of [...bySection].sort()) {
	console.error(`\n${section}`);
	for (const r of list.sort((a, b) => a.slug.localeCompare(b.slug))) {
		const when =
			r.state === 'stale' ? `reviewed ${r.reviewed}, edited ${r.updated}` : r.state === 'ok' ? `reviewed ${r.reviewed}` : '';
		console.error(`  ${MARK[r.state]} ${r.slug.padEnd(40)} ${when}`);
		if (r.note) console.error(`      note: ${r.note}`);
	}
}

if (typos.length) {
	console.error('\n⚠ frontmatter keys that look like a typo — Astro ignores unknown keys silently:');
	for (const t of typos) console.error('   ' + t);
}
if (rows.some((r) => r.state === 'bad')) {
	console.error('\n⚠ unparseable review dates (use YYYY-MM-DD):');
	for (const r of rows.filter((x) => x.state === 'bad')) console.error(`   ${r.file}: reviewed: ${r.reviewed}`);
}

console.error('\n' + summary);
if (!has('all') && !shown.length) console.error('\n✓ everything is reviewed and nothing has changed since.');
console.error('\n  ✓ current   ! changed since review   · never reviewed');
console.error('  sign off in vi:  reviewed: YYYY-MM-DD   (reviewNote: "..." optional)');
console.error('  or from here:    npm run review -- --mark <slug>');
console.error('  narrow with:     --never   --stale   --all   --published');
