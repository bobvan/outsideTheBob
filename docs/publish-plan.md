# Publish plan — **executed 2026-08-11**

> **✅ DONE. Topics In Timekeeping is live.** 30 pages and 32 glossary entries
> flipped in one commit, slugs pinned first, blog → garden links added in the
> same commit. Verified against the production build and then against the live
> site: 72 routes, nothing broken, `/sl/bp` resolving through both hops.
>
> **What changed the moment it shipped: URLs are now permanent.** Retitling was
> free while everything was a draft and is now a broken link for anybody who
> saved one. A reslug from here needs a redirect — add an entry to
> `src/data/short-links.yaml` or a Cloudflare rule — not just a `git mv`.
>
> The rest of this file is kept as the record of how the decision was made.

---

## The finding: the cheapest batch is now everything

```
publish all 30  →  0 link edits, 0 glossary trims
```

That is not a rounding. **Publishing the whole garden costs nothing**, because
there is no longer anything outside it to point at. Two changes got us here:

- **The two clock-builder pages moved to `held/`** on 2026-08-10, outside
  `src/content/`, and their four inbound links were removed at the time. They are
  no longer drafts a published page might link to — they are not in the build at
  all, so they cost zero.
- **Every `[[? ?]]` block is closed** as of 2026-08-11, so P2 gates nothing.

The previous version of this document recommended publishing 25 and deferring 6
for 3 link edits. Rerun today, **that same deferral costs more than it used to
(4 edits and 2 glossary trims) while publishing everything costs less than it
used to (zero). Deferring is now the expensive option.**

Still true, and still the reason this document is short: **link closure is not a
usable selection mechanism here.** The garden is dense — 30 pages, 135 internal
page-to-page links — and the closure of almost any seed pulls in nearly all of
it. The lever was always to choose editorially and price what you leave out.
Today that price is the only interesting number left.

## What deferral costs, if you want it anyway

| batch | pages | link edits | glossary trims |
|---|---|---|---|
| **everything** | **30** | **0** | **0** |
| defer `measurement-resolution-and-accuracy` | 29 | 1 | 1 |
| …and `how-big-is-a-degree` as well | 28 | 1 | 1 |
| the old plan's six, retranslated | 25 | 4 | 2 |

**Three pages are free to defer** — nothing links to them, so no published page
would notice and no revision is owed when they land: `how-big-is-a-degree`,
`why-precise-time`, and `datacenter-gnss-time-best-practices`. If the batch has
to shrink for editorial reasons, those cost nothing to remove.

## No page carries a quality flag any more

**Updated later on 2026-08-11.** `measurement-resolution-and-accuracy` was the
last page whose `reviewNote` said "Likely needs serious work"; Bob has signed it
off as **Ready**. Every one of the 30 pages now reads "Ready" (9) or some form of
"within about an hour" (21).

So the deferral this document previously suggested considering has gone away
too, and **there is now no recommended deferral at all**. Publish 30, cost zero.

If you still want a smaller batch for editorial reasons rather than quality
ones, `how-big-is-a-degree`, `why-precise-time` and
`datacenter-gnss-time-best-practices` remain free — nothing links to them.

## Slug corrections since the last version

The old plan named pages that no longer exist, which is how it came to be
rewritten. Recorded so nothing downstream re-derives the wrong list:

| old name | now |
|---|---|
| `a-means-to-an-end` | `why-precise-time` |
| `accuracy-and-resolution-in-pictures` | `measurement-resolution-and-accuracy` |
| `accuracy-and-precision-in-pictures` | `visualizing-precision-trueness-accuracy` |
| `benchmarking-clocks` | `benchmarking-datacenter-gnss-clocks` |
| `buying-a-clock` | `buying-a-datacenter-gnss-clock` |
| `no-second-chance` | `do-timestamp-errors-average-out` |
| `what-happens-when-i-lose-gps` | `how-gnss-holdover-works` |
| `how-do-i-know-its-still-right` | `is-my-clock-right` |
| `comparing-two-distant-clocks` | `comparing-distant-clocks` |
| `gnss-time-is-a-prediction` | `limits-of-gnss-time-accuracy` |
| `do-i-need-an-ocxo`, `designing-a-clock` | **held**, outside the build |

## Held, not deferred

`held/clock-building/` keeps two pages outside `src/content/` so the dev preview
answers "what does the site look like at `draft: false`?" honestly — see
`held/README.md`. They are not part of any batch decision. Bringing one back is a
separate act with its own inbound-link cost, recorded there.

| page | why |
|---|---|
| `do-i-need-an-ocxo` | Written for clock builders. Wants redoing as *important properties of GNSS receivers* for the dual audience, alongside the receiver-traits page |
| `designing-a-clock` | Builder-only, and Bob's own note says it could need a lot of work. Carries open items D6a and D6b |

## The best inbound link we cannot add yet

**`LastNanosecondsToUTC` should link to
`datacenter-gnss-time-best-practices`**, and it is the most natural link in the
whole garden: that page *is* the talk's closing slide unpacked, and the post
already tells the reader "the live audiences never had enough screen time to sit
with the final Takeaways and Best Practices slides, and you do."

**It cannot be added before the flip.** The post is published; the garden page is
a draft; the link would be a live 404. `npm run publish-check` now catches this
as **P7** — it has never fired, and it exists so that this specific good idea
cannot be acted on a week early.

Add it in step 7 below, along with any other blog → garden links worth making.
`SubNanosecondAtHome` is the other obvious candidate.

## Publishing a post that an existing post should point at

Learned 2026-08-13. When a new post is a follow-up, the forward link from the
older post **cannot go in until the new one ships** — the older post is live, so
the link is a 404 the moment it is pushed. P7 catches it, but only since it was
widened to cover blog posts as well as topic pages.

So the sequence is: write the new post with its backward link (safe — the older
post is already published), ship it, *then* add the forward link to the older
post. Two commits, and the second one is easy to forget, which is why it is
written down here.

## Order of operations on publication day

1. `npm run publish-set` — confirm the cost is still zero for the batch you want.
2. If deferring anything, make its link edits and glossary `seeAlso` trims first.
3. **Flip `draft: false` on the pages and the whole glossary in one commit.**
   `npm run publish-check` enforces this: the glossary's `seeAlso` alone reaches
   19 pages, and 60-odd body links point into `/timekeeping/glossary/#…`.
4. `npm run publish-check -- --strict`, then the link crawl.
5. The nav gate and `noindex` clear themselves once `hasPublishedTopics()` is
   true — no separate edit.
6. **Add the blog → garden links** that P7 has been holding back — starting with
   `LastNanosecondsToUTC` → `datacenter-gnss-time-best-practices`. Re-run
   `publish-check` afterwards; it should stay silent, and **P8 should stop
   complaining about `/sl/bp`** in the same moment.
7. **Verify the short links against the live site**, not the dev server:
   `curl -sSL -o /dev/null -w '%{http_code} %{url_effective}\n' https://outsidethebob.com/sl/bp`
   should end 200 on the best-practices page. Two redirects are involved — the
   short domain to the canonical one, then the meta refresh — and only the first
   can be tested before deploying.
8. **Pin explicit slugs.** Every URL is currently derived from its filename, so
   after publication an editorial file rename silently relocates a live URL. One
   commit writing each page's current slug into its frontmatter freezes them.
   See `url-structure.md`.

## What is not a publication blocker

Recorded because they look like blockers and are not:

- **113 unlinked glossary first-uses** (H1). Advisory. Mostly `UTC` and
  `timescale`, which read better plain in most positions.
- **The `stories` section is empty** (H3). Declared in `SECTIONS` with no pages,
  so it renders nothing. Dropping the key is cleaner than shipping it, but
  neither is urgent.
- **19 pages carry a `reviewed:` date older than their last edit.** That is Bob's
  reading queue, not a mechanical gate — and as of today it is the only thing
  standing between the current state and publication. Only three of them have
  substantial new prose; the rest are terminology sweeps and link repointing.

## Short links

`src/data/short-links.yaml` → `/sl/<id>`, one entry per link. Said aloud as
**OutsideTheBob.Com/sl/bp**, because dropping "think" is worth four characters in
a QR code and a syllable in a room.

`npm run qr -- https://outsidethebob.com/sl/bp --name BestPractices` writes the
code into `qr/`, which is excluded from git.

**Why the short link is worth the machinery.** URL length sets the QR version and
the version sets the module size, which is what decides whether a phone at the
back of a room locks on:

| encoded | chars | version | modules | module at 1080p |
|---|---|---|---|---|
| full path on the canonical domain | 91 | 8 | 49×49 | 18.9 px |
| `outsidethebob.com/sl/bp` | 31 | **3** | **29×29** | **29.2 px** |

A 55% larger module for the same slide area. The `/sl/` directory is free —
`/bp` alone is also version 3, so the namespace costs nothing.

**P8 guards them.** A short link whose target does not exist, or is still a
draft, is a 404 for everyone who scans the code — discovered in a room rather
than in a build log.

## Orphan pages — none left

Bob's rule, 2026-08-11: **a page with no inbound link is a missed opportunity,
not a neutral fact.** Three pages had none — `how-big-is-a-degree`,
`why-precise-time` and `datacenter-gnss-time-best-practices` — and all three now
have two or three. The garden has no orphans.
