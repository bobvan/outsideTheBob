#!/usr/bin/env node
// Tell the search engines that support IndexNow that pages have changed, instead
// of waiting for them to notice.
//
//   npm run indexnow -- --dry-run          # show what would be submitted
//   npm run indexnow                       # submit every URL in the sitemap
//   npm run indexnow -- /timekeeping/x/ /blog/y/   # submit specific paths
//
// **Google does not support IndexNow** (still true as of 2026) — Google is
// Search Console and nothing else, and its old anonymous sitemap ping was
// retired. What this reaches is Bing, and therefore Yahoo, DuckDuckGo and
// Ecosia, plus Yandex, Naver, Seznam and Yep. That is most of the non-Google
// web, for one HTTP request.
//
// **Cloudflare Crawler Hints is on for both zones** (2026-08-11), so Cloudflare
// already fires IndexNow itself when content changes, using its own key. This
// script is therefore not needed after a routine deploy. It stays for the case
// Crawler Hints does not cover: forcing a full re-submit of every URL, or
// pushing a specific page immediately rather than when the edge notices. The two
// keys are independent and coexist happily.
//
// The key lives at https://<host>/<key>.txt and must contain exactly the key.
// The script REFUSES to submit unless it can fetch that file from the live site
// and read the right value back, because a submission with an unverifiable key
// is silently discarded — you would get a 200 and nothing would happen. Checking
// first turns a silent no-op into a loud one.

import { readdirSync, readFileSync } from 'node:fs';

const HOST = 'thinkoutsidethebob.com';
const ENDPOINT = 'https://api.indexnow.org/indexnow';

const argv = process.argv.slice(2);
const dryRun = argv.includes('--dry-run');
const explicit = argv.filter((a) => a.startsWith('/'));

// The key is not a secret — it is published at a public URL by design, and the
// file that publishes it is committed. So there is nothing to keep out of git,
// and a second copy in a gitignored file would only mean the script broke on a
// fresh clone. Read it from the thing that already carries it.
const keyFile = readdirSync('public').find((f) => /^[0-9a-f]{8,32}\.txt$/.test(f));
if (!keyFile) {
	console.error('✗ no IndexNow key file in public/. Create one: a file named <key>.txt containing <key>.');
	process.exit(1);
}
const key = keyFile.replace(/\.txt$/, '');
const keyLocation = `https://${HOST}/${key}.txt`;

// ---- what to submit
let urls;
if (explicit.length) {
	urls = explicit.map((p) => `https://${HOST}${p}`);
} else {
	const res = await fetch(`https://${HOST}/sitemap-0.xml`);
	if (!res.ok) {
		console.error(`✗ could not read the live sitemap (${res.status}). Is the site deployed?`);
		process.exit(1);
	}
	urls = [...(await res.text()).matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
}

if (!urls.length) {
	console.error('✗ nothing to submit');
	process.exit(1);
}

// ---- refuse to submit with a key the engines cannot verify
const probe = await fetch(keyLocation).catch(() => null);
const served = probe && probe.ok ? (await probe.text()).trim() : null;
if (served !== key) {
	console.error(
		`✗ ${keyLocation} does not serve the key.\n` +
			`   got: ${served === null ? `HTTP ${probe ? probe.status : 'unreachable'}` : `"${served}"`}\n` +
			`   want: "${key}"\n\n` +
			`   The key file is in public/, so it ships with the next deploy. Push first,\n` +
			`   then run this. Submitting with an unverifiable key is accepted and ignored.`,
	);
	process.exit(1);
}
console.error(`✓ key verified at ${keyLocation}`);

const body = { host: HOST, key, keyLocation, urlList: urls };

if (dryRun) {
	console.error(`\nwould submit ${urls.length} URL(s) to ${ENDPOINT}:`);
	for (const u of urls) console.error('   ' + u);
	process.exit(0);
}

const res = await fetch(ENDPOINT, {
	method: 'POST',
	headers: { 'Content-Type': 'application/json; charset=utf-8' },
	body: JSON.stringify(body),
});

// 200 accepted · 202 accepted, key validation pending · 400 bad request
// 403 key not valid · 422 URLs do not belong to the host · 429 too many
console.error(`\n${res.status} ${res.statusText} — ${urls.length} URL(s) submitted to IndexNow`);
if (res.status === 200 || res.status === 202) {
	console.error('  Accepted. Bing, Yandex, Naver, Seznam and Yep take it from here.');
	console.error('  Google is not in that list and never was — use Search Console.');
	process.exit(0);
}
console.error('  ' + (await res.text()).slice(0, 400));
process.exit(1);
