import { getCollection } from 'astro:content';
import type { CollectionEntry } from 'astro:content';

export type Post = CollectionEntry<'blog'>;

// Drafts render in dev and vanish from the build, matching every other page.
const includeDrafts = import.meta.env.DEV;

/**
 * URLs stay lowercase - RFC 3986 lets anything in the chain normalise a host,
 * and a tag URL is machine-readable in the same way. The tag's own
 * capitalisation is preserved separately, for display.
 */
export const tagSlug = (tag: string) => tag.trim().toLowerCase().replace(/\s+/g, '-');

export const postSlug = (post: Post) => post.data.slug ?? post.id;

export async function publishedPosts(): Promise<Post[]> {
	const posts = await getCollection('blog', (post) => includeDrafts || !post.data.draft);
	return posts.sort((a, b) => +b.data.pubDate - +a.data.pubDate);
}

export interface Tag {
	/** As written in the frontmatter, e.g. "Proxmox", "ntpsec". */
	label: string;
	/** Lowercased form used in the URL. */
	slug: string;
	posts: Post[];
}

/**
 * Every tag in use, most-used first. Tags are grouped by their slug, so
 * "Proxmox" and "proxmox" would land on one page rather than two - the first
 * spelling encountered supplies the display label.
 */
export async function tagIndex(): Promise<Tag[]> {
	const posts = await publishedPosts();
	const byTag = new Map<string, Tag>();

	for (const post of posts) {
		for (const label of post.data.tags ?? []) {
			const slug = tagSlug(label);
			let tag = byTag.get(slug);
			if (!tag) byTag.set(slug, (tag = { label, slug, posts: [] }));
			tag.posts.push(post);
		}
	}

	return [...byTag.values()].sort(
		(a, b) => b.posts.length - a.posts.length || a.label.localeCompare(b.label),
	);
}

/**
 * A tag earns its own page only once it groups more than one post. A page
 * listing a single post is just a link wearing a page costume - one more click
 * for a reader, and a thin near-duplicate for a crawler.
 */
export const hasOwnPage = (tag: Tag) => tag.posts.length > 1;

/**
 * Where each tag should link, by slug: its own page when it has one, otherwise
 * straight to the only post carrying it.
 */
export async function tagLinks(): Promise<Map<string, string>> {
	const tags = await tagIndex();
	return new Map(
		tags.map((tag) => [
			tag.slug,
			hasOwnPage(tag) ? `/tags/${tag.slug}/` : `/blog/${postSlug(tag.posts[0])}/`,
		]),
	);
}
