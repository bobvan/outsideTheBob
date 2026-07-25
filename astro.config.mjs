// @ts-check

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
	site: 'https://thinkoutsidethebob.com',
	integrations: [mdx(), sitemap()],
	devToolbar: {
		enabled: false,
	},
	// Bind dev/preview to all interfaces so the site is reachable from other
	// devices; `allowedHosts` because Vite otherwise 403s any request that
	// arrives by hostname rather than by raw IP. Dev-only — `astro build`
	// emits static files and never runs a server.
	server: {
		host: true,
		port: 4321,
		allowedHosts: true,
	},
});
