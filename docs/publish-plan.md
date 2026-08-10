# Publish plan — shipping a self-consistent subset

Written 2026-08-10 against a near publication date. The premise, from Bob:
**fewer self-consistent and correctly-linked pages beat many inconsistent
stubs.** Publish a batch, then revise it later with links to the pages that
follow.

Costs below are computed, not estimated: `npm run publish-set`.

---

## The finding that shapes everything

**Link closure is not a usable selection mechanism here.** The garden is dense —
31 pages, 133 internal page-to-page links — and the transitive closure of almost
any seed pulls in **28 of the 31**. Publishing "just the metrology cluster" or
"just the antennas pages" is not a smaller decision than publishing nearly
everything.

So the lever is inverted. **Choose the batch editorially, then price what you
left out.** The price of deferring a page is the number of links to it from
pages you *do* publish — each one an edit now, and a second edit when the page
finally lands.

That price is startlingly low, because the H/S/M discipline built the right
shape: most inbound links point at concept Homes, and the Homes are the pages
most ready to go.

## Not considered for first publication

Bob's list, 2026-08-10 — held back for reasons of *scope* rather than quality:

| page | why |
|---|---|
| `do-i-need-an-ocxo` | Written for clock builders. Wants redoing as *important properties of GNSS receivers* for the dual audience — buyers and builders — alongside the receiver-traits page |
| `designing-a-clock` | Builder-only, and Bob's own note says it could need a lot of work |

## The recommended batch — publish 25, defer 6

**Total cost: 3 link edits, plus 1 glossary `seeAlso` trim.**

Deferred:

| page | inbound links to fix | why defer |
|---|---|---|
| `benchmarking-clocks` | 2 | Bob: *"could need a lot of work"* |
| `designing-a-clock` | 0 | Bob: *"could need a lot of work"*; nothing links to it |
| `accuracy-and-resolution-in-pictures` | 1 | Bob: *"likely needs serious work"* — the only page he flagged that hard |
| `how-big-is-a-degree` | 0 | The most-covered-elsewhere page in the garden: decimal degrees and an xkcd. Nothing links to it |
| `a-means-to-an-end` | 0 | Good page, but the "why do you want precise time" argument is the least differentiated thing here. Nothing links to it |
| `do-timestamp-errors-average-out` | 0 | ~~Nothing links to it~~ — **now cross-linked with the averaging page (2026-08-10), so deferring it costs 1 edit. Reconsider: it is retitled, reviewed and cheap to keep.** |

**Four of the six have zero inbound links.** They are free to defer — not one
published page would notice, and no revision is owed when they land.

The three edits, all trivial:

```
buying-a-clock                     → benchmarking-clocks
what-happens-when-i-lose-gps       → benchmarking-clocks
accuracy-and-precision-in-pictures → accuracy-and-resolution-in-pictures
```

Each is a "where to go next" bullet or a single in-sentence link. Remove it,
publish, and put it back in the second batch.

## Why not go leaner

A tighter batch of 21 — additionally deferring the four newest pages
(`can-i-build-my-own-link-to-utc-nist`, `comparing-two-distant-clocks`,
`how-do-i-know-its-still-right`, `do-i-need-an-ocxo`) — costs **12 edits and 4
glossary trims**, four times the churn for four fewer pages.

And it is the wrong four. Those are the pages carrying material nobody else
has: our own UTC(NIST) numbers, BIPM's retirement of common view, the
shared-antenna monitoring argument, the crossover model. **Deferring them keeps
the saturated pages and drops the differentiated ones** — precisely backwards by
the be-the-11th-page rule.

## Deferring by "well covered elsewhere"

Bob's second criterion, applied. Ranked most-saturated first — this is the order
to cut in if the batch has to shrink further.

| page | how saturated | inbound |
|---|---|---|
| `how-big-is-a-degree` | very — every GIS blog has this | 0 |
| `a-means-to-an-end` | high — "why does timing matter" is a genre | 0 |
| `how-big-is-a-nanosecond` | high — Grace Hopper's nanosecond is famous | 2 |
| `timescales` | moderate — but our Victoria example is ours | 3 |
| `distribution` | moderate — NTP-vs-PTP comparisons are everywhere | 4 |
| `elapsed-time` | low-moderate | 3 |
| everything else | **low — first-hand or first-published** | — |

Note what this table says about the batch: after the first two, saturation and
inbound-links move in opposite directions. The saturated pages are also the
well-connected ones, so cutting further gets expensive fast. **Stop at six.**

## Order of operations on publication day

1. `npm run publish-set -- --defer <the six>` — confirm the cost has not moved.
2. Make the 3 link edits and the 1 glossary `seeAlso` trim.
3. Resolve `[[? ?]]` blocks on the 25 — they render as body text (P2).
4. Flip `draft: false` on the 25 pages **and the whole glossary in one commit** —
   `npm run publish-check` enforces this; 60-odd body links depend on it.
5. `npm run publish-check --strict`, then the link crawl.
6. The nav gate and `noindex` clear themselves once `hasPublishedTopics()` is true.

## And afterwards

The deferred six land as a second batch, at which point the 3 edits get reverted
and the new pages get their inbound links. That is the *only* revision debt this
plan creates — three sentences. The alternative, publishing everything now,
trades that for shipping a page Bob has flagged as needing serious work.
