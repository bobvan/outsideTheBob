import type { APIRoute } from 'astro';

// Generated rather than dropped in public/ so the sitemap URL comes from `site:`
// in astro.config.mjs. A hardcoded copy in public/robots.txt would be one more
// place the domain could go stale.
export const GET: APIRoute = ({ site }) => {
	const sitemap = new URL('sitemap-index.xml', site);

	const body = `# Think Outside The Bob
#
# Everything here is static, public writing. Crawl it — search engines,
# archivers, and language models alike. Nothing here is private, and there
# is no content worth excluding anyone from.

User-agent: *
Allow: /

Sitemap: ${sitemap}
`;

	return new Response(body, {
		headers: { 'Content-Type': 'text/plain; charset=utf-8' },
	});
};
