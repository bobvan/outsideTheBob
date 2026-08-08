#!/usr/bin/env node
// Bob's review tracker.
//
//     npm run review                      # what still needs your eyes
//     npm run review -- --all             # every page, including the done ones
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
// --mark exists so signing off is never a hand-edit of frontmatter. Read on
// whatever device you like; mark from a terminal afterwards.

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
	};
}

const pages = [...walk('src/content')].map(load);
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
const state = (p) => {
	if (!p.reviewed) return 'never';
	if (p.updated && p.updated > p.reviewed) return 'stale';
	return 'ok';
};
const MARK = { never: '·', stale: '!', ok: '✓' };

const rows = pages.map((p) => ({ ...p, state: state(p) }));
const shown = has('all') ? rows : rows.filter((r) => r.state !== 'ok');

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

const n = (s) => rows.filter((r) => r.state === s).length;
console.error(
	`\n${n('ok')} current · ${n('stale')} changed since you read them · ${n('never')} never reviewed · ${rows.length} pages`,
);
if (!has('all') && !shown.length) console.error('\n✓ everything is reviewed and nothing has changed since.');
console.error('\n  ✓ current   ! changed since review   · never reviewed');
console.error('  sign off with:  npm run review -- --mark <slug>');
