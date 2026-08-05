// Fetches BIPM Circular T Section 4 and caches it as data for the figure.
//
//     node scripts/fetch-circular-t.mjs
//
// Section 4 is "Relations of UTC with predictions of UTC broadcast by GNSS":
// the daily difference between UTC as BIPM later computed it and the UTC
// prediction each constellation was broadcasting at the time. It is, in effect,
// a scoreboard of how well each constellation forecast UTC.
//
// The result is written to src/data/circular-t-section4.json and committed, so
// the site builds offline and a rebuild cannot silently change the figure. Rerun
// this deliberately when you want newer data.
import { mkdir, writeFile } from 'node:fs/promises';

const BASE = 'https://webtai.bipm.org/ftp/pub/tai/Circular-T/cirt';
const ISSUES = Number(process.env.ISSUES ?? 14);
const LATEST = Number(process.env.LATEST ?? 462);

const rows = [];
const editions = [];

for (let n = LATEST - ISSUES + 1; n <= LATEST; n++) {
	const res = await fetch(`${BASE}/cirt.${n}`);
	if (!res.ok) { console.error(`  cirt.${n}: HTTP ${res.status}, skipped`); continue; }
	const text = await res.text();

	// Header line 2 carries the publication moment, e.g. "2026 JULY 10, 11h UTC".
	const pub = text.split('\n')[1]?.match(/^(\d{4})\s+([A-Z]+)\s+(\d{1,2})/);
	const MONTHS = ['JANUARY','FEBRUARY','MARCH','APRIL','MAY','JUNE','JULY',
	                'AUGUST','SEPTEMBER','OCTOBER','NOVEMBER','DECEMBER'];
	const published = pub
		? `${pub[1]}-${String(MONTHS.indexOf(pub[2]) + 1).padStart(2,'0')}-${pub[3].padStart(2,'0')}`
		: null;

	// Per-edition uncertainties, which change from issue to issue.
	const sigma = {};
	for (const m of text.matchAll(/sigma_(GPS|GLO|GAL|BDS)\s*=\s*([\d.]+)\s*ns/g)) {
		sigma[m[1]] = Number(m[2]);
	}

	// Section 4's daily table: date, MJD, then one column per constellation.
	const sec4 = text.slice(text.indexOf('4 - Relations of UTC with predictions'));
	const end = sec4.search(/\n\s*5 - /);
	const body = end > 0 ? sec4.slice(0, end) : sec4;

	let n4 = 0;
	for (const m of body.matchAll(
		/^(\d{4}-\d{2}-\d{2})\s+(\d{5})\s+(-?[\d.]+)\s+(-?[\d.]+)\s+(-?[\d.]+)\s+(-?[\d.]+)/gm)) {
		rows.push({
			date: m[1], mjd: Number(m[2]),
			GPS: Number(m[3]), GLO: Number(m[4]), GAL: Number(m[5]), BDS: Number(m[6]),
			issue: n,
		});
		n4++;
	}
	editions.push({ issue: n, published, sigma, days: n4 });
	console.error(`  cirt.${n}  published ${published}  ${n4} days  sigma ${JSON.stringify(sigma)}`);
}

rows.sort((a, b) => a.mjd - b.mjd);
// Later editions can restate a day; keep the most recent statement of it.
const byMjd = new Map();
for (const r of rows) byMjd.set(r.mjd, r);
const series = [...byMjd.values()].sort((a, b) => a.mjd - b.mjd);

await mkdir('src/data', { recursive: true });
await writeFile('src/data/circular-t-section4.json',
	JSON.stringify({
		source: 'BIPM Circular T, Section 4 — Relations of UTC with predictions of UTC broadcast by GNSS',
		url: `${BASE}/`,
		fetched: process.env.FETCH_DATE ?? null,
		editions, series,
	}, null, '\t') + '\n');

console.error(`\nwrote src/data/circular-t-section4.json — ${series.length} days from ${series[0]?.date} to ${series.at(-1)?.date}`);
