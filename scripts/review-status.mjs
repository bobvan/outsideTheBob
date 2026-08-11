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
import { execFileSync } from 'node:child_process';
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
// Everything here is compared as a LOCAL calendar day. `reviewed: 2026-08-08`
// parses as UTC midnight, while a git author timestamp is a real instant with an
// offset — mixing the two silently shifts the same-day boundary by however far
// Bob is from Greenwich, which is exactly how a 21:03 edit came back labelled the
// 11th. So: bare dates are read as local midnight, and both sides are reduced to
// a day number before anything is compared.
const day = (v) => {
	if (!v) return null;
	const bare = String(v).trim().match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
	if (bare) return new Date(+bare[1], +bare[2] - 1, +bare[3]).getTime();
	const t = Date.parse(v);
	return Number.isNaN(t) ? NaN : t;
};
const dayIdx = (ms) => {
	const d = new Date(ms);
	return Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 86_400_000);
};
const localISO = (ms) => {
	const d = new Date(ms);
	const p2 = (n) => String(n).padStart(2, '0');
	return `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())}`;
};
// `updatedDate` is the honest answer only when somebody remembered to bump it,
// and on 2026-08-10 a day of retitles, reslugs and a terminology sweep went by
// without one — so this tool reported "0 changed since you read them" while a
// page Bob signed off on the 8th had been substantially rewritten. That is
// precisely the error the header promises not to make, arriving through the
// input rather than the comparison.
//
// So the edit date is no longer taken on trust. Git knows when each file last
// changed whatever the frontmatter claims, and an uncommitted edit shows up in
// the working tree. Take the LATEST of the three: frontmatter can only ever
// make a page look staler than git says, never fresher.
const gitTouched = (() => {
	const m = new Map();
	try {
		const out = execFileSync('git', ['log', '--pretty=format:%x00%aI', '--name-only', '--', 'src/content'], {
			encoding: 'utf8',
			maxBuffer: 64 * 1024 * 1024,
		});
		let when = null;
		for (const line of out.split('\n')) {
			if (line.startsWith('\0')) when = Date.parse(line.slice(1));
			// First mention wins: git log walks newest-first, so the first time a
			// path appears is the last time it was touched.
			else if (line && when !== null && !m.has(line)) m.set(line, when);
		}
		const dirty = execFileSync('git', ['status', '--porcelain', '--', 'src/content'], { encoding: 'utf8' });
		for (const line of dirty.split('\n')) {
			const f = line.slice(3).split(' -> ').pop().trim();
			if (f) m.set(f, Math.max(m.get(f) ?? 0, statSync(f).mtimeMs));
		}
	} catch {
		// Not a repo, or git unavailable — fall back to frontmatter alone.
	}
	return m;
})();

const edited = (p) => {
	const declared = day(p.updated);
	const fromGit = gitTouched.get(p.file) ?? null;
	const candidates = [declared, fromGit].filter((v) => v !== null && !Number.isNaN(v));
	return candidates.length ? Math.max(...candidates) : null;
};

// `reviewed:` is a date typed by hand; git carries a real timestamp. So a page
// read and then edited on the same day is genuinely UNDECIDABLE — we cannot know
// which came first. It gets its own state rather than being forced into one of
// the two confident ones, because guessing "stale" nags on every page Bob signs
// off today, and guessing "current" hides a rewrite that landed an hour after he
// read it.
const state = (p) => {
	const r = day(p.reviewed);
	if (r === null) return 'never';
	if (Number.isNaN(r)) return 'bad';
	const u = edited(p);
	if (u === null) return 'ok';
	const [ri, ui] = [dayIdx(r), dayIdx(u)];
	return ui < ri ? 'ok' : ui === ri ? 'sameday' : 'stale';
};

// How much moved since the sign-off. Twenty-one stale pages is not an actionable
// list; twenty-one stale pages sorted by churn is, because a section rename that
// touched three lines and a rewrite that touched three hundred should not be
// asking for the same amount of Bob's evening.
const churn = (p) => {
	const r = day(p.reviewed);
	if (r === null || Number.isNaN(r)) return null;
	try {
		const out = execFileSync(
			'git',
			['log', `--since=${localISO(r)} 00:00`, '--numstat', '--pretty=format:', '--', p.file],
			{ encoding: 'utf8' },
		);
		let n = 0;
		for (const line of out.split('\n')) {
			const [a, d] = line.split('\t');
			if (a !== undefined && d !== undefined) n += (parseInt(a, 10) || 0) + (parseInt(d, 10) || 0);
		}
		return n;
	} catch {
		return null;
	}
};
const MARK = { never: '·', stale: '!', sameday: '~', ok: '✓', bad: '?' };

const rows = pages
	.map((p) => ({ ...p, state: state(p) }))
	.map((p) => ({ ...p, churn: p.state === 'stale' ? churn(p) : null }));
const only = has('never') ? 'never' : has('stale') ? 'stale' : null;
const shown = has('all') ? rows : rows.filter((r) => (only ? r.state === only : r.state !== 'ok'));

// Counted and printed BEFORE the listing. With forty pages the list can run off
// a terminal, and a summary you have to scroll past the answer to reach is a
// summary in the wrong place.
const n = (s) => rows.filter((r) => r.state === s).length;
const summary =
	`${n('ok')} current · ${n('stale')} changed since you read them · ${n('sameday')} read and edited the same day · ` +
	`${n('never')} never reviewed · ` +
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
	for (const r of list.sort((a, b) => (b.churn ?? -1) - (a.churn ?? -1) || a.slug.localeCompare(b.slug))) {
		const when =
			r.state === 'stale'
					? `reviewed ${r.reviewed}, edited ${localISO(edited(r))}` +
						(r.churn ? ` · ${r.churn} line${r.churn === 1 ? '' : 's'} changed since` : '')
					: r.state === 'sameday'
						? `reviewed and edited the same day (${r.reviewed}) — cannot tell which came first` : r.state === 'ok' ? `reviewed ${r.reviewed}` : '';
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
console.error('\n  ✓ current   ! changed since review   ~ same day, undecidable   · never reviewed');
console.error('  sign off in vi:  reviewed: YYYY-MM-DD   (reviewNote: "..." optional)');
console.error('  or from here:    npm run review -- --mark <slug>');
console.error('  narrow with:     --never   --stale   --all   --published');
