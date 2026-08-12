import { defineCollection, z } from 'astro:content';
import { file, glob } from 'astro/loaders';

const blog = defineCollection({
	// Load Markdown and MDX files in the `src/content/blog/` directory.
	loader: glob({ base: './src/content/blog', pattern: ['**/*.{md,mdx}', '!**/*.bob.{md,mdx}'] }),
	// Type-check frontmatter using a schema
		schema: ({ image }) =>
			z.object({
				title: z.string(),
				description: z.string(),
				// Transform string to Date object
				pubDate: z.coerce.date(),
				updatedDate: z.coerce.date().optional(),
				heroImage: image().optional(),
				slug: z.string().optional(),
				tags: z.array(z.string()).optional(),
				// See the note on the topics collection — Bob's, not ours.
				reviewed: z.coerce.date().optional(),
				reviewNote: z.string().optional(),
				draft: z.boolean().default(true),
			}),
});

// Topics In Timekeeping — an evergreen garden rather than a stream of posts.
// It differs from `blog` in three ways that the schema has to carry:
//
//  - Pages are REVISED, not republished, so `updatedDate` is the date that
//    matters and there is no pubDate. The feed uses fixed URLs as guids for the
//    same reason: an edit should update a reader's copy, not appear as a new
//    item.
//  - Pages belong to a `section` (one of the ten in docs/topics-in-timekeeping.md)
//    and carry an `order` within it, because "no forced reading order" is about
//    the reader, not about the index — an index still has to list them in some
//    sequence, and alphabetical would be worse than deliberate.
//  - `coverage` records the H/S/M notation from the planning doc: exactly one
//    Home per concept, Summaries and Mentions link to it. Keeping it in
//    frontmatter means the "exactly one H" rule can eventually be checked
//    rather than remembered.
const topics = defineCollection({
	// `!**/*.bob.*` so Bob can keep a working copy beside the real file. Without
	// it, any .mdx dropped in here becomes a page — a scratch copy would have
	// built its own route, escaped the title audit, and published as a duplicate
	// at the flip, carrying whatever was mid-edit in it.
	loader: glob({ base: './src/content/topics', pattern: ['**/*.{md,mdx}', '!**/*.bob.{md,mdx}'] }),
	schema: () =>
		z.object({
			title: z.string(),
			description: z.string(),
			section: z.string(),
			order: z.number().default(100),
			updatedDate: z.coerce.date(),
			coverage: z.enum(['H', 'S', 'M']).default('H'),
			tags: z.array(z.string()).optional(),
			slug: z.string().optional(),
			// Bob's own review tracking. Deliberately NOT `updatedDate`: that is the
			// reader-facing date, and it moves for a typo fix. `reviewed` is the
			// date Bob last read the page top to bottom and was happy with it.
			//
			// The pairing is what makes it useful. If `updatedDate` is later than
			// `reviewed`, the page changed after he signed it off and wants another
			// look; `npm run review` computes exactly that. Nothing renders it, so
			// it cannot affect the published page.
			//
			// AGENTS: this field is Bob's. Never set it, clear it, or "helpfully"
			// bring it forward — doing so would silently mark your own work as
			// reviewed by him.
			reviewed: z.coerce.date().optional(),
			reviewNote: z.string().optional(),
			// Same default as blog: a new file is invisible until it is finished
			// on purpose, not published until it is hidden on purpose.
			draft: z.boolean().default(true),
		}),
});

// The glossary is one YAML file rather than a file per term, because entries
// are two or three sentences and a directory of eight-line files would be all
// ceremony. It is a data collection, not content: there is no body to render,
// so nothing here goes through Markdown.
//
// An entry earns its place by pointing somewhere — `authority` out to a
// canonical definition, `seeAlso` in to one of our own pages. One with neither
// is a dead end, and the page it sits on becomes the 1001st glossary on the web.
const glossary = defineCollection({
	loader: file('src/data/glossary.yaml'),
	schema: z.object({
		term: z.string(),
		definition: z.string(),
		aliases: z.array(z.string()).default([]),
		// Stable external definition. Prefer sources with a per-term URL — the
		// VIM gives one per clause — over a good article you would have to
		// deep-link by anchor and hope.
		authority: z.object({ label: z.string(), url: z.string().url() }).optional(),
		// Internal links. A bare "#anchor" points within the glossary itself.
		seeAlso: z.array(z.object({ label: z.string(), href: z.string() })).default([]),
		draft: z.boolean().default(true),
	}),
});

// Short links exist so a QR code on a slide can be small enough to scan from the
// back of a room. The length of the URL decides the QR version, and the version
// decides the module size — /sl/bp is a 29x29 code where the full path is 49x49,
// which is a 55% larger module for the same slide area.
const shortLinks = defineCollection({
	loader: file('src/data/short-links.yaml'),
	schema: z.object({
		// Site-absolute path, trailing slash, matching how the rest of the site links.
		to: z.string().startsWith('/'),
		// Who it is for and when. Short links outlive the occasion that created
		// them and there is no other way to tell a live one from a dead one.
		note: z.string(),
	}),
});

export const collections = { blog, topics, glossary, shortLinks };
