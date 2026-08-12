# Publish plan — shipping a self-consistent subset

**Rewritten 2026-08-11**, against current slugs and a fresh run of
`npm run publish-set`. The premise is still Bob's: **fewer self-consistent and
correctly-linked pages beat many inconsistent stubs.**

The conclusion has changed, and changed decisively.

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

## The one page carrying a quality flag

`measurement-resolution-and-accuracy` is the only page in the garden whose
`reviewNote` reads **"Likely needs serious work"**. Everything else says
"Ready" (8 pages) or some form of "within about an hour" (21 pages).

Deferring it costs **one link edit** — from
`visualizing-precision-trueness-accuracy` — plus **one glossary `seeAlso` trim**.
That is the entire price, and it is the only deferral this document actively
suggests considering.

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

## Order of operations on publication day

1. `npm run publish-set` — confirm the cost is still zero for the batch you want.
2. If deferring anything, make its link edits and glossary `seeAlso` trims first.
3. **Flip `draft: false` on the pages and the whole glossary in one commit.**
   `npm run publish-check` enforces this: the glossary's `seeAlso` alone reaches
   19 pages, and 60-odd body links point into `/timekeeping/glossary/#…`.
4. `npm run publish-check -- --strict`, then the link crawl.
5. The nav gate and `noindex` clear themselves once `hasPublishedTopics()` is
   true — no separate edit.
6. **Pin explicit slugs.** Every URL is currently derived from its filename, so
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
- **16 pages carry a `reviewed:` date older than their last edit.** That is Bob's
  reading queue, not a mechanical gate — and as of today it is the only thing
  standing between the current state and publication.
