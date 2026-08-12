# Backlog — the one place open work lives

**This file is live state. Reviews are dated evidence.** When a review lands
(`review-YYYY-MM-DD.md`), its findings get folded in here and the review is
annotated with ✅/⏳ so it stays readable as a snapshot. Do not track open work in
a review file — a second review would fork the truth.

Close an item by deleting its row and noting it in the commit message. If an item
turns out to be wrong, delete it and say why in the commit — do not leave
tombstones.

---

## 0. Publish plan

**[`publish-plan.md`](publish-plan.md)** — **rewritten 2026-08-11, and the
answer flipped.** Publishing all 30 pages now costs **zero** link edits and zero
glossary trims; deferring is the expensive option. The only deferral worth
considering is `measurement-resolution-and-accuracy`, the one page whose
`reviewNote` says it needs serious work, at 1 edit + 1 glossary trim. Recompute
any batch with `npm run publish-set`.

## 0b. URL structure — decisions before launch

**[`url-structure.md`](url-structure.md)** — the section-rename question is
**closed**: the 2026-08-10 reorganization replaced all eight sections with six,
and every path word now reads as ordinary English. Two open questions remain:
whether tier 1 stays `/timekeeping/`, and whether to **pin explicit slugs at
publication** so filenames stop being URLs. Both are free now and permanent
afterwards; the slug pinning is the one with teeth.

## 1. Publish gate — ✅ **passed, and the site is live** (2026-08-11)

All eight held at the flip and `publish-check --strict` exits 0. They are not
retired: every one of them still guards the *next* page, and P7 and P8 now guard
a live site rather than a hypothetical one.

**The rule that replaces them:** URLs are permanent now. A reslug is a broken
link unless it comes with a redirect.

| # | gate | state |
|---|---|---|
| P1 | **Topic pages and glossary entries flip in the same commit.** | ✅ done — 30 pages + 32 terms in one commit |
| P2 | **No `[[? … ?]]` blocks survive.** They render as ordinary body text — readers would see our questions to each other. | ✅ **0 pages** (was 9 on 2026-08-10) |
| P3 | **Every internal link and glossary anchor resolves.** | ✅ re-crawled 2026-08-10 after the reorganization — 73 routes, 0 broken |
| P4 | **Nav gate and `noindex`.** | ✅ both cleared themselves at the flip, as designed |
| P5 | **Sanitization pass on anything sourced from private work.** | ✅ for current content |
| P8 | **Short links resolve to a published page.** | ✅ quiet — `/sl/bp` verified live through both redirect hops |
| P7 | **No published page links to a draft page.** Each such link is a live 404. | ✅ enforced; the links it was holding are now added and live |
| P6 | **`section:` matches the file's directory.** Nothing enforced this; a page moved between sections without editing frontmatter would build a URL contradicting its own location. | ✅ enforced by `publish-check` |

## 2. Open findings — `review-2026-08-08.md` (bravo)

Ranked as the review ranked them. Section refs are that document's.

### Blocking the garden's own rules

*E1 (Holdover) closed 2026-08-08 — now `datacenters/how-gnss-holdover-works`.*
*E2 (Oscillators) closed 2026-08-08 — `do-i-need-an-ocxo`, since **held** out of the build.*
*E4 (silently wrong) closed 2026-08-08 — now `measuring-time/is-my-clock-right`; the three promising pages link to it.*

**This subsection is now empty — the garden no longer breaks its own H/S/M rule.**

| # | item | where |
|---|---|---|

### Technical, needs sources or a decision

*B5 closed 2026-08-09 — all three specs checked against primaries. All three were wrong; see `references.md`.*
*B4, B7, B8, B9 closed 2026-08-09 — sources in `references.md`.*
*B10 closed 2026-08-11 — the two unrelated 16 ns numbers are now explicitly
disambiguated in the sentence that introduces the second. The "BIPM's stated
10 000 km" wording was left alone; it reads correctly as theirs.*

**This subsection is now empty.**

| # | item | where |
|---|---|---|

### Internal contradictions

*C2 closed 2026-08-11 — "directly traceable to UTC" became "its chain to UTC is
short and free", with a pointer to the traceability page and one sentence saying
a short chain is the raw material for traceability rather than traceability
itself. The acquiring page now defers, as bravo asked.*

*C1 closed 2026-08-11 — the hard stop now names the price of walking through the
door: copy a published chain, inherit its 1–2 ns floor, add an unmeasured
per-unit term.*

| # | item | where |
|---|---|---|

### From the answers to our own open questions (§D)

Each of these is an edit bravo handed us with the reasoning attached.

*D3a and D3b closed 2026-08-11 — and D3a's premise was wrong. It assumed the
three-cornered hat was unavailable to us and that its unavailability was the
point; Bob uses it routinely in the lab. Kept the uncorrelated-errors caveat,
which is the real content, and added his observation that a two-channel counter
quietly supplies the third clock. D3b landed as the tee-connector zero-baseline
test, replacing "replaced by a short".*

*D5 and E5 declined by Bob, 2026-08-11 — **do not name specific regulations.**
His reason: the topic invites "IANAL, but here is why you are wrong and I am
right", which is an argument this site cannot win and does not want. The
requirement framing stays; the citation does not. Treat this as standing policy,
not a one-off, and do not re-propose naming MiFID II RTS 25 or its equivalents.*

*D1c, D7 and D8 closed 2026-08-11. D1c became a callout asking which pairs a part
can run **simultaneously** — and connected it to calibration validity, since
switching pairs invalidates any delay figure. D7 glosses common-mode inline at
first use. D8 put one sentence under the BIPM heading and turned the fairness
section into the promise being kept, rather than repeating itself.*

| # | item | where |
|---|---|---|
| D6a | **Missing category: the actuator.** What are you steering with, how finely, over what range, and is the range symmetric? | `designing-a-clock` — **held**, so this waits for the rework |
| D6b | Add a temperature question — ceiling fan, over-insulated oven, wind-driven limit cycle. | `designing-a-clock` — **held** |
| E6 | Two-Clock Agreement is a section of one, named after Bob's strongest original result. *What limits agreement* has the most unpublished evidence behind it. | new page |

## 2b. Search engine discovery — started 2026-08-11

Bob's call: invite the crawlers rather than wait. The old anonymous sitemap ping
is retired at both Google and Bing, so this splits in two.

| | state |
|---|---|
| **IndexNow** — Bing, and therefore Yahoo, DuckDuckGo and Ecosia; plus Yandex, Naver, Seznam, Yep | ✅ **done.** 75 URLs submitted, 202 Accepted. Re-run `npm run indexnow` after adding pages, or pass specific paths |
| **Google Search Console** | ✅ verified by DNS (Google installed the record) and `sitemap-index.xml` submitted, status Success. **Discovered pages sat at 0 on day one, which is normal** — that count is a separate asynchronous pass. Checked the things that would make it *not* normal: sitemap 200 + `application/xml`, 75 URLs, each matching its page's own canonical exactly, no stray `noindex`, Googlebot allowed. If it is still 0 in three or four days, look at the **Pages** report rather than Sitemaps |
| **Bing Webmaster Tools** | optional. IndexNow already gets Bing crawling; the tool is for *reporting*, and it can import the property from Search Console rather than verifying again |
| **Cloudflare Crawler Hints** | ✅ **on for both zones** (2026-08-11). Cloudflare now fires IndexNow itself when content changes, using its own key. `npm run indexnow` is no longer needed after a routine deploy — keep it for forcing a full re-submit |

**Verification, when Bob is ready.** DNS TXT is the one to prefer — he controls
the Cloudflare zone, it covers the whole domain including subdomains, and it
needs no repo change. If he would rather do it in the repo, an HTML meta tag in
`BaseLayout` or a file in `public/` both work and are a one-line change here.

## 2c. Bottom lines on long pages — started 2026-08-12

Bob's alternative to a parallel summarized site, and a better one: no duplicate
URLs, no second copy to keep in sync, and the summary is edited alongside the
page that owns it. See the style-guide entry for the rule and the reasoning.

`npm run bottom-line`. **4 of 9 long pages have one.** Five to write, in
descending order of how much they need it:

| words | page |
|---|---|
| 3416 | `can-i-build-my-own-link-to-utc-nist` |
| 3034 | `comparing-distant-clocks` |
| 3010 | `what-makes-an-accurate-timing-receiver` |
| 2195 | `how-gnss-holdover-works` |
| 1525 | `limits-of-gnss-time-accuracy` |

These are Bob's voice and go on live pages, so each wants his eye before it
ships rather than a batch of five landing at once.

*The parallel-site idea is closed — see the `summaries-prototype` branch for what
it looked like and why inline won. Kept unmerged; the branch's one summary is
already stale, which was the argument against it arriving on day one.*

## 3. Waiting on someone else

| # | item | who |
|---|---|---|
| W1 | ✅ **Landed 2026-08-11.** Delta's correction-stream landscape figure is embedded on `limits-of-gnss-time-accuracy` with the measured-vs-published split, the per-satellite caveat and the one-window caveat carried in prose, as delta asked. Source commit `120fa3e` is on `delta/gnssdoFastFollow` in PePPAR-Fix, **not on main** — if that branch is ever discarded, `public/figures/correction-stream-landscape.svg` here is the only surviving copy. | Agent delta |
| W2 | **`I-081901-blog` Run 1 landed 2026-08-10** — results and caveats folded into `plan-externally-clocked-receivers.md`. Still waiting on the **1 Hz reprocess** (`-i 1`, τ = 1 s), because discipline already wins at τ = 30 s and the crossover — the only number a reader can act on — is below our shortest bin. Main expects it before 2026-08-12 and recommends holding the page until then. Agreed. | Agent main |
| W3 | ✅ **Closed 2026-08-11 — zero `[[? ?]]` blocks left in the garden.** Every question we raised has been answered. | Bob |

## 4. Future pages, ranked by how much of it only Bob has

From review §F. These are not debt — they are the reason the garden is worth
reading. Ordered as bravo ranked them.

0. **GPSDO architecture** — how the module, the oscillator and the discipline loop fit together. Promised in a callout on the receiver-traits page, and it is the page that explains why a network clock's PPS is quiet and a module's is not. Bob raised it 2026-08-09.
1. **The Goldilocks actuation interval** — drafted in the plan doc, figure exists, two-plant table in §D6. Generalizes past GPSDOs to any control loop with a noisy actuator.
2. **Known-good observations — grading your own chain.** Run the pipeline on a station whose clock *is* UTC(k); any wander cannot be the clock. Credit **Ole Petter Rønningen**. `can-i-build-my-own-link` already does half of it without naming it as a method.
3. **Fresher is not automatically steadier.** Broadcast ephemeris steadier at long τ than real-time IGS SSR, whose datum humped ~15 ns over three hours. Qualifies a claim `gnss-time-is-a-prediction` currently makes flatly.
4. **The expensive thermometer** — sawtooth, qErr, and the pattern that reversed when the air conditioning came on.
5. **Per-unit variance beats per-model difference** — two nominally identical F9Ts further apart than an F9T and an F9P.
6. **Actuator resolution and control authority** — §D6's missing category as a page.
7. **Datums, reference frames, and the ground moving** — Barrow, the Italian earthquake, 15 cm in seven years ≈ 500 ps.
8. **Spoofing, jamming, and OSNMA** — the acquiring page's authenticity section is a Summary looking for its Home.

## 5. Bob's review status

`npm run review` — what still needs his eyes, and what he signed off before it
changed. State lives in a `reviewed:` frontmatter field on each page; it never
renders. See `scripts/review-status.mjs`.

**Agents: never touch that field.**

## 6. Housekeeping

| # | item |
|---|---|
| H1 | **Glossary linking is reachability-based now, not compliance-based** (2026-08-11). `npm run glossary-links` reports UNREACHABLE entries — leaned on somewhere and linked from nowhere — separately from style calls. **UNREACHABLE is currently empty.** The remaining ~114 unlinked first uses are advisory and dominated by `UTC` and `timescale`, which read better plain. |
| H8 | **One figure in `public/figures/` is not generated by `npm run figures`.** `correction-stream-landscape.svg` comes from PePPAR-Fix (`tools/plot_correction_stream_landscape.py`), so `make-figures.mjs` will never rebuild it and nothing here would notice if it went stale. Refresh it by copying from that repo. |
| H3 | **One** empty section left: `stories` — declared in `SECTIONS` with no pages. The other two went away in the reorganization. Either fill it or drop the key before launch. |
| H6 | **Restart the dev server after any content-collection change that is not a body edit** — a new `glossary.yaml` entry, a renamed page, a changed slug. None of these hot-reload: the cache serves the old set, so the link checker reports the old URL as a 500 and the new one as a 404. Seen twice (2026-08-09, 2026-08-10). Body-text edits reload fine. |
| H4 | Restart the dev server occasionally — bravo found it at 7.5 days of uptime and warns against trusting a stale preview. **Restarted 2026-08-08.** Tailscale preview: `http://100.117.189.97:4321/` |

---

## Settled, so nobody re-asks

- **Chris Treichel is happy to be named** on the Claude Army post (confirmed by Bob, 2026-08-08).
- **The logo experiment is closed** — decided against change, 2026-08-07.
- **The GNSSDO+ oscillator** is an STP3593LF (ROX5242T1N family) double-oven OCXO from Rakon. Both PePPAR-Fix docs were right; there was no contradiction.
- **`dns1` and WBPC stay off the fleet map** — Bob confirmed both sanitization calls, 2026-08-08.

- **Section names are settled** — six sections as of 2026-08-10, and the
  [title audit](title-audit.md) closed with 30 of 30 passing and nothing
  recommended. Retitling is done; do not reopen it without a reason.
- **The review tracker reads git, not `updatedDate`** (fixed 2026-08-10). It had
  been reporting "0 changed since you read them" while pages Bob signed off on
  the 8th had been rewritten, because nothing bumped the frontmatter date. It now
  takes the later of the frontmatter date and the file's last commit, sorts stale
  pages by how many lines moved since the sign-off, and reports *read and edited
  the same day* as its own undecidable state rather than guessing.
