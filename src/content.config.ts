import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
	// Load Markdown and MDX files in the `src/content/blog/` directory.
	loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),
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
	loader: glob({ base: './src/content/topics', pattern: '**/*.{md,mdx}' }),
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
			// Same default as blog: a new file is invisible until it is finished
			// on purpose, not published until it is hidden on purpose.
			draft: z.boolean().default(true),
		}),
});

export const collections = { blog, topics };
