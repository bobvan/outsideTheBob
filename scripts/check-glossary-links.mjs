#!/usr/bin/env node
// Which glossary terms is a page leaning on without ever linking?
//
//     npm run glossary-links              # the actionable list
//     npm run glossary-links -- --first-use   # every unlinked first use
//     npm run glossary-links -- --strict      # exit 1 on the actionable list
//
// **100% compliance was never the goal**, and reporting every unlinked first use
// made that obvious: 113 hits, most of which read better plain. A list nobody
// can act on is the same as no list.
//
// So the default view is Bob's filter, and it is a much better question:
// **which pages use a term more than once and never link it at all?** One
// unlinked mention is a judgement call. A page that says "holdover" six times
// and never once tells the reader where to find out what it means is not
// exercising judgement — it is leaning on a term it never introduced.
//
// The house rule is "link a term to its glossary entry on first use per page,
// not every use" (docs/style-guide.md). That rule is easy to state and
// impossible to keep by hand across two dozen pages, because the failure is
// silent: nothing breaks, a reader just never discovers the entry exists.
//
// The payoff we are protecting is specific. A reader who hits an unfamiliar
// term, clicks, gets a two-sentence grounding, and hits Back has stayed on the
// site and learned something. A reader who hits the same term unlinked goes to
// a search engine and may not come back.
//
// What counts as "linked": the first occurrence falls inside a markdown link
// or an <a href> pointing at /timekeeping/glossary/#<id>. Any anchor counts —
// linking "trueness" to #accuracy is a judgement call, not an error.
//
// Deliberately not wired into prebuild. It is advisory: some terms are too
// common to link on every page that says them, and the right response to a hit
// is often "no, that reads better plain."

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const has = (f) => process.argv.includes(`--${f}`);
const strict = has('strict');

// A three-field scanner rather than a YAML dependency. The file is ours, its
// shape is fixed by the collection schema, and the three keys we need are all
// single-line scalars — so pulling in a parser to read them would be the more
// fragile choice, not the less.
const glossary = [];
for (const line of readFileSync('src/data/glossary.yaml', 'utf8').split('\n')) {
	let m;
	if ((m = line.match(/^- id:\s*(\S+)/))) glossary.push({ id: m[1], term: '', aliases: [] });
	else if ((m = line.match(/^\s+term:\s*"?(.*?)"?\s*$/))) glossary.at(-1).term = m[1];
	else if ((m = line.match(/^\s+aliases:\s*\[(.*)\]/)))
		glossary.at(-1).aliases = m[1].split(',').map((a) => a.trim().replace(/^"|"$/g, '')).filter(Boolean);
}

// Terms whose plain-English sense is so common that flagging every page would
// bury the real hits. They are still checked when they appear in their term-of-
// art spelling; this list only suppresses the bare word.
const TOO_COMMON = new Set(['accuracy', 'precision', 'resolution', 'stability', 'datum', 'baseline']);

const entries = glossary.map((g) => ({
	id: g.id,
	// Longest first, so "float PPP" wins over "PPP" at the same position.
	// "SPP (Single Point Positioning)" should match on "SPP", but "UTC(k)" must
	// not be shortened to "UTC" — that would make every page's first "UTC" a
	// false hit against #utc-k. A parenthetical containing a space is an
	// expansion; one without is part of the term.
	needles: [g.term.replace(/\s+\([^)]*\s[^)]*\)/g, '').trim(), ...(g.aliases ?? [])]
		.map((t) => t.trim())
		.filter(Boolean)
		.sort((a, b) => b.length - a.length),
}));

const walk = (dir) =>
	readdirSync(dir).flatMap((f) => {
		const p = join(dir, f);
		return statSync(p).isDirectory() ? walk(p) : p.endsWith('.mdx') || p.endsWith('.md') ? [p] : [];
	});

// Strip everything a reader never reads as prose. Replacing with spaces rather
// than deleting keeps every surviving offset honest, which is the whole basis
// of the "is this occurrence inside a link" test below.
// Newlines survive, so every line number stays true to the source file.
const blank = (s) => s.replace(/[^\n]/g, ' ');
function proseOnly(src) {
	let t = src;
	t = t.replace(/^---\n[\s\S]*?\n---\n/, blank); // frontmatter
	t = t.replace(/```[\s\S]*?```/g, blank); //        fenced code
	t = t.replace(/`[^`\n]*`/g, blank); //             inline code
	t = t.replace(/\[\[\?[\s\S]*?\?\]\]/g, blank); //  prompts to Bob
	t = t.replace(/^import .*$/gm, blank); //          MDX imports
	t = t.replace(/\balt="[^"]*"/g, blank); //         alt text is not prose
	return t;
}

// Spans covered by a link whose target is the glossary.
function glossarySpans(text) {
	const spans = [];
	for (const m of text.matchAll(/\[([^\]]+)\]\(\/timekeeping\/glossary\/#[a-z0-9-]*\)/g)) {
		spans.push([m.index, m.index + m[0].length]);
	}
	for (const m of text.matchAll(/<a\s+href="\/timekeeping\/glossary\/#[a-z0-9-]*"[^>]*>([\s\S]*?)<\/a>/g)) {
		spans.push([m.index, m.index + m[0].length]);
	}
	return spans;
}

const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const files = [...walk('src/content')].sort();

// The glossary's own seeAlso links. A term whose entry points back at this page
// is one this page is the home for, which is the commonest legitimate reason not
// to link it — so the report marks those rather than hiding them.
const homes = new Map();
{
	let current = null;
	for (const line of readFileSync('src/data/glossary.yaml', 'utf8').split('\n')) {
		let m;
		if ((m = line.match(/^- id:\s*(\S+)/))) current = m[1];
		else if (current && (m = line.match(/^\s+href:\s*"(\/timekeeping\/[^"#]+)\/"/)))
			homes.set(`${current}|${m[1].split('/').pop()}`, true);
	}
}

const rows = [];

for (const file of files) {
	const raw = readFileSync(file, 'utf8');
	const text = proseOnly(raw);
	const spans = glossarySpans(text);
	const inLink = (i) => spans.some(([a, b]) => i >= a && i < b);
	const slug = file.split('/').pop().replace(/\.mdx?$/, '');

	for (const { id, needles } of entries) {
		const hits = [];
		const seen = new Set();
		for (const needle of needles) {
			if (TOO_COMMON.has(needle.toLowerCase())) continue;
			const l = /^\w/.test(needle) ? '\\b' : '';
			// Allow a simple plural. "GNSS Analysis Centers" is the same term as
			// "GNSS Analysis Center", and treating it as a different string was
			// enough to hide a real link from this report.
			const r = /\w$/.test(needle) ? '(?:e?s)?\\b' : '';
			const re = new RegExp(`${l}${escape(needle)}${r}`, 'gi');
			for (const m of text.matchAll(re)) {
				// Longest-needle-first means a shorter alias can re-match inside a
				// span already claimed. Count each position once.
				if (seen.has(m.index)) continue;
				seen.add(m.index);
				hits.push({ index: m.index, needle });
			}
		}
		if (!hits.length) continue;
		hits.sort((a, b) => a.index - b.index);
		const linked = hits.filter((h) => inLink(h.index)).length;
		rows.push({
			file,
			slug,
			id,
			needle: hits[0].needle,
			uses: hits.length,
			linked,
			line: text.slice(0, hits[0].index).split('\n').length,
			firstLinked: inLink(hits[0].index),
			isHome: homes.has(`${id}|${slug}`),
		});
	}
}

// ---- the actionable list: leaned on, never linked ---------------------------
const leaned = rows
	.filter((r) => r.uses >= 2 && r.linked === 0)
	.sort((a, b) => b.uses - a.uses || a.file.localeCompare(b.file));

// The sharper cut. A term linked from *somewhere* is discoverable — leaving it
// plain on one more page is a style call. A term linked from **nowhere** is a
// glossary entry no reader can reach by reading, which is a hole rather than a
// judgement.
// Read reachability off the LINKS, not off term detection. Deriving it from
// detected occurrences was wrong in both directions: "Allan deviation" links to
// #adev without ever spelling "ADEV", and "GNSS Analysis Centers" is a plural the
// matcher missed — so two entries were reported unreachable while a perfectly
// good link sat in the source. A link is a link whatever its anchor text says.
const linkedSomewhere = new Set();
for (const file of files) {
	for (const m of readFileSync(file, 'utf8').matchAll(/\/timekeeping\/glossary\/#([a-z0-9-]+)/g)) {
		linkedSomewhere.add(m[1]);
	}
}
const orphanRows = leaned.filter((r) => !linkedSomewhere.has(r.id));
const orphanTerms = [...new Set(orphanRows.map((r) => r.id))];

const firstUseOnly = rows.filter((r) => !r.firstLinked);

if (has('first-use')) {
	const byFile = new Map();
	for (const r of firstUseOnly) {
		if (!byFile.has(r.file)) byFile.set(r.file, []);
		byFile.get(r.file).push(r);
	}
	for (const [file, hits] of [...byFile].sort()) {
		console.error(`\n${file}`);
		for (const h of hits.sort((a, b) => a.line - b.line))
			console.error(`  :${String(h.line).padEnd(4)} "${h.needle}" — first use not linked to #${h.id}` +
				(h.linked ? ` (linked ${h.linked}x later)` : ''));
	}
	console.error(`\n${firstUseOnly.length} unlinked first use(s) across ${byFile.size} file(s).`);
	console.error('Advisory, and mostly noise — see the default view for what is worth acting on.');
	process.exit(0);
}

if (!leaned.length) {
	console.error(`✓ no page leans on an unlinked glossary term (${files.length} files, ${rows.length} term-page pairs)`);
	console.error(`  ${firstUseOnly.length} first use(s) are unlinked — advisory, see --first-use.`);
	process.exit(0);
}

if (orphanRows.length) {
	console.error('UNREACHABLE — leaned on here, and linked from nowhere on the site.');
	console.error('A reader has no path to these entries at all.\n');
	console.error(`${'uses'.padStart(4)}  ${'term'.padEnd(22)} page`);
	for (const r of orphanRows) {
		console.error(
			`${String(r.uses).padStart(4)}  ${`"${r.needle}"`.padEnd(22)} ${r.slug}` +
				(r.isHome ? "   [this page is the term's home]" : ''),
		);
	}
	console.error(`\n${orphanTerms.length} glossary entr(ies) are unreachable: ${orphanTerms.join(', ')}\n`);
	console.error('─'.repeat(72) + '\n');
}

console.error('Leaned on here, but linked somewhere else — style calls, most-used first.\n');
console.error(`${'uses'.padStart(4)}  ${'term'.padEnd(22)} page`);
for (const r of leaned.filter((r) => linkedSomewhere.has(r.id))) {
	console.error(
		`${String(r.uses).padStart(4)}  ${`"${r.needle}"`.padEnd(22)} ${r.slug}` +
			(r.isHome ? "   [this page is the term's home]" : ''),
	);
}
console.error(
	`\n${leaned.length} term-page pair(s) leaned on and never linked, out of ${rows.length} pairs in ${files.length} files.` +
		`\n${firstUseOnly.length} unlinked first use(s) in total — the rest is advisory, see --first-use.`,
);
console.error(
	'\nRows marked [home] are the likeliest legitimate skips: the glossary entry points\n' +
		'back at that page, so it is the explanation rather than a place to send someone.\n' +
		'\nHow to use this: fix the UNREACHABLE block, browse the rest. 100% was never the\n' +
		'goal — a term that is linked somewhere is discoverable, and plain prose usually\n' +
		'reads better than a page peppered with the same link.',
);
process.exit(strict && orphanRows.length ? 1 : 0);
