#!/usr/bin/env node
// The gate between "drafted" and "published".
//
//     npm run publish-check
//
// Three things have to be true before any draft flips, and all three are the
// kind a human forgets at eleven at night. They exist because a reviewer found
// the first one — the coupling in P1 — by reading the built output rather than
// the source, which is not a check anyone runs twice.
//
// This is advisory by default and exits non-zero with --strict, so it can go
// in front of a deploy later without breaking today's builds.

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const strict = process.argv.includes('--strict');
const walk = (dir) =>
	readdirSync(dir).flatMap((f) => {
		const p = join(dir, f);
		return statSync(p).isDirectory() ? walk(p) : /\.mdx?$/.test(p) ? [p] : [];
	});

const isDraft = (src) => /^draft:\s*true\s*$/m.test(src.split(/^---$/m)[1] ?? '');

const topics = walk('src/content/topics').map((f) => ({ f, draft: isDraft(readFileSync(f, 'utf8')) }));
const publishedTopics = topics.filter((t) => !t.draft);

// The glossary is one file of many entries rather than one file per entry, so
// it is counted by scanning for the flag rather than by reading frontmatter.
const gloss = readFileSync('src/data/glossary.yaml', 'utf8');
const glossTotal = (gloss.match(/^- id:/gm) ?? []).length;
const glossDraft = (gloss.match(/^\s+draft:\s*true\s*$/gm) ?? []).length;
const glossPublished = glossTotal - glossDraft;

const problems = [];

// P1 — the coupling. Published prose linking into an unpublished glossary is
// the failure that looks fine in source and is obviously broken in the build.
const glossLinks = publishedTopics.reduce(
	(n, t) => n + (readFileSync(t.f, 'utf8').match(/\/timekeeping\/glossary\/#/g) ?? []).length,
	0,
);
if (publishedTopics.length && glossPublished === 0) {
	problems.push(
		`P1  ${publishedTopics.length} topic page(s) are published while ALL ${glossTotal} glossary ` +
			`entries are drafts — ${glossLinks} link(s) would land on "nothing published here yet".`,
	);
}

// P2 — prompts render as body text, so a survivor is a reader-visible question.
const prompted = walk('src/content').filter((f) => readFileSync(f, 'utf8').includes('[[?'));
const promptedPublished = prompted.filter((f) => !isDraft(readFileSync(f, 'utf8')));
if (promptedPublished.length) {
	problems.push(`P2  ${promptedPublished.length} PUBLISHED file(s) still contain [[? ?]]:\n      ` +
		promptedPublished.join('\n      '));
}

console.error(`topics:   ${publishedTopics.length} published / ${topics.length} total`);
console.error(`glossary: ${glossPublished} published / ${glossTotal} total`);
console.error(`prompts:  ${prompted.length} file(s) carry [[? ?]] (${promptedPublished.length} of them published)`);

if (!problems.length) {
	console.error('\n✓ publish gate clear');
	process.exit(0);
}
console.error('\n' + problems.map((p) => '✗ ' + p).join('\n'));
console.error('\nSee docs/backlog.md §1.');
process.exit(strict ? 1 : 0);
