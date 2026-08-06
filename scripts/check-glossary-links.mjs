#!/usr/bin/env node
// Check that the FIRST use of every glossary term on a page links to the
// glossary.
//
//     npm run glossary-links            # report
//     npm run glossary-links -- --strict  # exit 1 if anything is unlinked
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

const strict = process.argv.includes('--strict');

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
const findings = [];

for (const file of files) {
	const raw = readFileSync(file, 'utf8');
	const text = proseOnly(raw);
	const spans = glossarySpans(text);
	const inLink = (i) => spans.some(([a, b]) => i >= a && i < b);

	for (const { id, needles } of entries) {
		let first = null;
		for (const needle of needles) {
			if (TOO_COMMON.has(needle.toLowerCase())) continue;
			// Word boundaries only where the edge is alphanumeric — "UTC(k)" and
			// "PPP-AR" end in characters \b would not fire on.
			const l = /^\w/.test(needle) ? '\\b' : '';
			const r = /\w$/.test(needle) ? '\\b' : '';
			const re = new RegExp(`${l}${escape(needle)}${r}`, 'gi');
			for (const m of text.matchAll(re)) {
				if (first === null || m.index < first.index) first = { index: m.index, needle };
			}
		}
		if (first && !inLink(first.index)) {
			const line = text.slice(0, first.index).split('\n').length;
			findings.push({ file, id, needle: first.needle, line });
		}
	}
}

const byFile = new Map();
for (const f of findings) {
	if (!byFile.has(f.file)) byFile.set(f.file, []);
	byFile.get(f.file).push(f);
}

if (!findings.length) {
	console.error(`✓ every glossary term's first use is linked (${files.length} files)`);
	process.exit(0);
}

for (const [file, hits] of [...byFile].sort()) {
	console.error(`\n${file}`);
	for (const h of hits.sort((a, b) => a.line - b.line)) {
		console.error(`  :${String(h.line).padEnd(4)} "${h.needle}" — not linked to #${h.id}`);
	}
}
console.error(
	`\n${findings.length} unlinked first use(s) across ${byFile.size} file(s), ${files.length} checked.`,
);
console.error('Advisory: some of these read better plain. Judgement, not a build failure.');
process.exit(strict ? 1 : 0);
