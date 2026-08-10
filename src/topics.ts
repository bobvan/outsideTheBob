import { getCollection } from 'astro:content';
import type { CollectionEntry } from 'astro:content';

export type Topic = CollectionEntry<'topics'>;

// Drafts render in dev and vanish from the build, matching every other page.
const includeDrafts = import.meta.env.DEV;

/**
 * The ten sections, in the order they are meant to be offered. Kept here rather
 * than derived from the pages so the shape of the garden is stable while it is
 * still mostly empty — an index assembled purely from existing files would
 * reorder itself every time a page landed.
 *
 * `key` is what a page puts in its `section` frontmatter, and what appears in
 * the URL: /timekeeping/<section>/<page>/.
 */
export const SECTIONS = [
	// PROVISIONAL placement, pending Bob's hierarchy work. These three pages are
	// the practical front door: they ask the reader's question rather than
	// teaching a vocabulary, and pick the vocabulary up in passing. Moving the
	// section is one line here plus a frontmatter edit per page.
	{ key: 'questions-to-ask', title: 'Asking the Right Questions' },
	{ key: 'datacenters', title: 'Timekeeping in Datacenters' },
	{ key: 'gnss', title: 'GNSS' },
	{ key: 'utc', title: 'What Is UTC' },
	{ key: 'measuring-time', title: 'Measuring Time' },
	{ key: 'time-distribution', title: 'Time Distribution' },
	{ key: 'stories', title: 'Stories' },
] as const;

export const sectionTitle = (key: string) =>
	SECTIONS.find((s) => s.key === key)?.title ?? key;

/** A page's slug within its section. Mirrors postSlug in tags.ts. */
export const topicSlug = (t: Topic) => t.data.slug ?? t.id.split('/').pop();

/** Full path, which is also the feed guid — see the note in content.config.ts. */
/** The garden's mount point. Named once so a second garden is a copy of this
    module rather than a hunt through it — see docs/url-structure.md. */
export const GARDEN_ROOT = 'timekeeping';

export const topicPath = (t: Topic) => `/${GARDEN_ROOT}/${t.data.section}/${topicSlug(t)}/`;

export async function publishedTopics(): Promise<Topic[]> {
	const topics = await getCollection('topics', (t) => includeDrafts || !t.data.draft);
	return topics.sort((a, b) => a.data.order - b.data.order);
}

export interface Section {
	key: string;
	title: string;
	pages: Topic[];
}

/** Sections that actually have pages, in SECTIONS order. Empty ones are omitted
    rather than shown as headings with nothing under them. */
export async function sectionsWithPages(): Promise<Section[]> {
	const pages = await publishedTopics();
	return SECTIONS.map(({ key, title }) => ({
		key,
		title,
		pages: pages.filter((p) => p.data.section === key),
	})).filter((s) => s.pages.length > 0);
}

/** Drives the nav entry. The Timekeeping link stays hidden until something is
    actually published there, so the section can be built in the open on main
    without a half-finished garden appearing in the navigation. */
export async function hasPublishedTopics(): Promise<boolean> {
	return (await publishedTopics()).length > 0;
}
