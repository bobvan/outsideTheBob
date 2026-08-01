import rss from '@astrojs/rss';
import { publishedTopics, topicPath } from '../../topics';
import { SITE_TITLE } from '../../consts';

// A feed of its own, separate from /rss.xml, for two reasons.
//
// First, the audiences differ: blog posts are events, garden pages are
// reference. Someone who wants to hear when a page on antenna surveying is
// revised does not necessarily want every Proxmox post, and vice versa.
//
// Second, and the reason it cannot simply be folded in: these entries are
// REVISED rather than republished. Each item's guid is its permanent URL, so a
// reader's copy is updated in place when a page changes instead of arriving as
// a new item every time a sentence is fixed. Astro defaults the guid to the
// link, but it is set explicitly here because that behaviour is load-bearing
// rather than incidental — a future change to how links are built must not
// silently change the guids and re-notify every subscriber about everything.
export async function GET(context) {
	const pages = await publishedTopics();
	return rss({
		title: `${SITE_TITLE} — Topics In Timekeeping`,
		description:
			'Evergreen pages on precision timekeeping. Revised in place; the feed reflects updates rather than announcing new posts.',
		site: context.site,
		items: pages
			.slice()
			.sort((a, b) => +b.data.updatedDate - +a.data.updatedDate)
			.map((page) => {
				const link = topicPath(page);
				return {
					title: page.data.title,
					description: page.data.description,
					link,
					guid: new URL(link, context.site).toString(),
					pubDate: page.data.updatedDate,
					categories: page.data.tags,
				};
			}),
	});
}
