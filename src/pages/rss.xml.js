import { getCollection } from 'astro:content';
import rss from '@astrojs/rss';
import { SITE_DESCRIPTION, SITE_TITLE } from '../consts';

const includeDrafts = import.meta.env.DEV;

export async function GET(context) {
	const posts = await getCollection('blog', (post) => includeDrafts || !post.data.draft);
	return rss({
		title: SITE_TITLE,
		description: SITE_DESCRIPTION,
		site: context.site,
		items: posts.map((post) => ({
			...post.data,
			link: `/blog/${post.data.slug ?? post.id}/`,
		})),
	});
}
