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
import { join, dirname, basename } from 'node:path';

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

// P6 — the URL's middle tier comes from frontmatter while the file lives in a
// directory of the same name. Nothing enforces that they agree, so a page moved
// between sections without editing `section:` would build a URL that contradicts
// its own location. Cheap to check, silent if it ever happened.
for (const t of topics) {
	const fm = readFileSync(t.f, 'utf8').split(/^---$/m)[1] ?? '';
	const declared = fm.match(/^section:\s*"?(.*?)"?\s*$/m)?.[1];
	const actual = dirname(t.f).split('/').pop();
	if (declared && declared !== actual) {
		problems.push(`P6  ${t.f}: section: "${declared}" but the file is in ${actual}/ — the URL and the file disagree.`);
	}
}

// P7 — a published page linking to a draft page is a 404 on the live site, and
// nothing else here would notice. It has never fired, because no published blog
// post links into the garden yet — but the moment the garden publishes, the
// obvious links from the talk write-ups become worth adding, and the obvious
// mistake is adding one a week early. Cheap insurance for a live-site break.
const slugOf = (f) => basename(f).replace(/\.mdx?$/, '');
const draftSlugs = new Set(topics.filter((t) => t.draft).map((t) => slugOf(t.f)));
const publishedFiles = walk('src/content').filter((f) => !isDraft(readFileSync(f, 'utf8')));
const liveBreaks = [];
for (const f of publishedFiles) {
	for (const href of readFileSync(f, 'utf8').match(/\/timekeeping\/[a-z0-9/-]+/g) ?? []) {
		const target = href.replace(/\/$/, '').split('/').pop();
		if (draftSlugs.has(target)) liveBreaks.push(`${f} → ${href}`);
	}
}
if (liveBreaks.length) {
	problems.push(
		`P7  ${liveBreaks.length} link(s) from PUBLISHED pages into DRAFT topic pages — each is a 404 on the live site:\n      ` +
			liveBreaks.join('\n      '),
	);
}

// P8 — short links are printed on slides and photographed by strangers, so a
// broken one is discovered in a room rather than in a build log. Two ways to
// break: the target does not exist, or it exists but is still a draft, which is
// a 404 for everyone who scans the code.
const shortLinks = [...(readFileSync('src/data/short-links.yaml', 'utf8').matchAll(/^- id:\s*(\S+)[\s\S]*?^\s+to:\s*(\S+)/gm) ?? [])];
const allSlugs = new Map(topics.map((t) => [slugOf(t.f), t]));
for (const [, id, to] of shortLinks) {
	const slug = to.replace(/\/$/, '').split('/').pop();
	const page = allSlugs.get(slug);
	if (!page) problems.push(`P8  short link /sl/${id} points at ${to}, which is not a page.`);
	else if (page.draft) problems.push(`P8  short link /sl/${id} points at ${to}, which is still a DRAFT — a 404 for anyone who scans it.`);
}

console.error(`short:    ${shortLinks.length} short link(s)`);
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
