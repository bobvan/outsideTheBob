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

/**
 * One tagged thing, from either collection. Tags are the garden's cross-cutting
 * index — rule 3 of the topic is "anywhere to what you needed in one hop" — so a
 * tag page that listed only blog posts would strand every reader who arrived
 * from a topic page, which is where the tag they clicked was displayed.
 */
export interface TaggedItem {
	kind: 'post' | 'topic';
	title: string;
	description: string;
	href: string;
	/** pubDate for a post, updatedDate for a topic. Only used for sorting. */
	date: Date;
}

export interface Tag {
	/** As written in the frontmatter, e.g. "Proxmox", "ntpsec". */
	label: string;
	/** Lowercased form used in the URL. */
	slug: string;
	items: TaggedItem[];
}

/**
 * Every tag in use across both collections, most-used first. Tags are grouped by
 * their slug, so "Proxmox" and "proxmox" would land on one page rather than two
 * - the first spelling encountered supplies the display label.
 */
export async function tagIndex(): Promise<Tag[]> {
	const posts: TaggedItem[] = (await publishedPosts()).map((p) => ({
		kind: 'post' as const,
		title: p.data.title,
		description: p.data.description,
		href: `/blog/${postSlug(p)}/`,
		date: p.data.pubDate,
	}));

	// Imported lazily so tags.ts and topics.ts do not import each other.
	const { publishedTopics, topicPath } = await import('./topics');
	const topics: TaggedItem[] = (await publishedTopics()).map((t) => ({
		kind: 'topic' as const,
		title: t.data.title,
		description: t.data.description,
		href: topicPath(t),
		date: t.data.updatedDate,
	}));

	const tagsOf = async () => {
		const all = await publishedPosts();
		const tks = await publishedTopics();
		return [
			...all.map((p, i) => [posts[i], p.data.tags ?? []] as const),
			...tks.map((t, i) => [topics[i], t.data.tags ?? []] as const),
		];
	};

	const byTag = new Map<string, Tag>();
	for (const [item, labels] of await tagsOf()) {
		for (const label of labels) {
			const slug = tagSlug(label);
			let tag = byTag.get(slug);
			if (!tag) byTag.set(slug, (tag = { label, slug, items: [] }));
			tag.items.push(item);
		}
	}

	// Newest first within a tag, so a page does not lead with something stale.
	for (const tag of byTag.values()) tag.items.sort((a, b) => +b.date - +a.date);

	return [...byTag.values()].sort(
		(a, b) => b.items.length - a.items.length || a.label.localeCompare(b.label),
	);
}

/**
 * A tag earns its own page only once it groups more than one thing. A page
 * listing a single item is just a link wearing a page costume - one more click
 * for a reader, and a thin near-duplicate for a crawler.
 */
export const hasOwnPage = (tag: Tag) => tag.items.length > 1;

/**
 * Where each tag should link, by slug: its own page when it has one, otherwise
 * straight to the only thing carrying it.
 */
export async function tagLinks(): Promise<Map<string, string>> {
	const tags = await tagIndex();
	return new Map(
		tags.map((tag) => [tag.slug, hasOwnPage(tag) ? `/tags/${tag.slug}/` : tag.items[0].href]),
	);
}
