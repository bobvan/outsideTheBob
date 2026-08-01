// Fails the build if an inline prompt survives into a publishable post.
//
// Bob marks up drafts with prompts for me, in place, using:
//
//     [[? rewrite this para to lead with the archer ?]]
//
// The notation is deliberate. Single square brackets collide with Markdown link
// syntax. Curly braces — single or doubled — are JSX expressions in MDX and blow
// the build up on sight. `[[? ?]]` is not syntax in either language, so it
// survives as literal text rather than breaking anything or vanishing.
//
// It renders *visibly* if it escapes, which is the safe failure: an unanswered
// prompt on a live page is embarrassing, an invisible one is undetectable. This
// check exists so neither happens. Drafts may contain prompts freely; anything
// with `draft: false` may not.
//
// Wired to `prebuild`, so `npm run build` refuses to produce a dist/ containing
// one — locally and in CI alike.
import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';

const DIRS = ['src/content/blog', 'src/content/topics', 'src/pages'];
const PROMPT = /\[\[\?([\s\S]*?)\?\]\]/g;

let publishable = 0;
const offences = [];

async function walk(dir) {
	for (const entry of await readdir(dir, { withFileTypes: true })) {
		const path = join(dir, entry.name);
		if (entry.isDirectory()) {
			await walk(path);
		} else if (/\.mdx?$/.test(entry.name)) {
			await check(path);
		}
	}
}

async function check(path) {
	const text = await readFile(path, 'utf8');

	// A page with no frontmatter `draft:` at all is a standalone page like
	// about.mdx, which is always live.
	const draft = /^draft:\s*true\s*$/m.test(text);
	if (draft) return;
	publishable++;

	for (const match of text.matchAll(PROMPT)) {
		const line = text.slice(0, match.index).split('\n').length;
		const body = match[1].trim().replace(/\s+/g, ' ');
		offences.push(`${path}:${line}  ${body.slice(0, 90)}${body.length > 90 ? '…' : ''}`);
	}
}

for (const dir of DIRS) await walk(dir);

if (offences.length) {
	console.error(`\n✗ ${offences.length} unanswered prompt(s) in publishable content:\n`);
	for (const o of offences) console.error(`   ${o}`);
	console.error(
		`\n  Answer them and delete the markers, or set draft: true while you work.\n`,
	);
	process.exit(1);
}

console.log(`✓ no unanswered prompts (${publishable} publishable file(s) checked)`);
