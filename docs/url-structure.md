# URL structure — paths, sections, slugs

Working notes, 2026-08-10, ahead of publication. Terminology for the three tiers
lives in the local `glossary.md`; this file is the analysis and the open
decisions.

---

## What we have

```
/timekeeping/<section>/<slug>/
   tier 1        tier 2    tier 3
 garden root   section    page slug
```

- **Tier 1** is fixed — the garden's mount point, and what separates it from
  `/blog/`.
- **Tier 2** comes from `section:` in frontmatter, and is also the directory
  name under `src/content/topics/`. They agree everywhere today; `npm run
  publish-check` now enforces it (P6), because nothing else did.
- **Tier 3** is the filename. No page sets `slug:` — `topicSlug()` falls back to
  the filename, so rename the file and the URL follows.

Median URL is 43 characters; the longest is 64
(`/timekeeping/time-distribution/matching-acquisition-and-distribution/`).

## On the SEO premise

Bob's recollection is right about 2005 and worth updating for now.

Exact keywords in a path are a **weak** ranking signal today — Google has said as
much repeatedly. What paths still genuinely do:

- **They are displayed.** The URL appears in results and in shared links, and a
  legible one gets clicked more than an opaque one.
- **They generate breadcrumbs.** Search results show a path-derived breadcrumb,
  so tier 2 is read by humans scanning results whether or not it is ranked.
- **They express the information architecture**, which shapes crawling and how
  internal link weight distributes.

And alignment between path, title, H1 and body still matters — not as a keyword
trick, but because it is what a coherent page looks like. So the instinct is
sound; the mechanism has moved from *ranking* to *comprehension*.

## The finding: tier 2 is our weakest words

Slugs are strong, because the [title audit](title-audit.md) already forced them
to be the reader's question. Sections were named for our internal taxonomy and
never audited at all.

| section | as a path word | pages |
|---|---|---|
| `utc` | ✅ excellent — high-value term, and short | 9 |
| `antennas` | ✅ excellent | 2 |
| `datacenters` | ✅ excellent | 6 |
| `metrology` | ✅ good — a real search term | 3 |
| `acquiring` | ⚠️ vague alone. *Acquiring what?* | 4 |
| `transferring` | ⚠️ same problem, and collides with "time transfer" | 2 |
| `two-clock` | ❌ meaningless outside this site | 2 |
| `questions` | ❌ generic; says nothing about the subject | 3 |

Four of eight are strong. The other four are our own filing system leaking into
the URL.

### Proposed renames

Free today, permanent after publication.

| now | proposed | why |
|---|---|---|
| `acquiring` | `acquiring-time` | Completes the phrase; matches the section title *Acquiring Time* |
| `transferring` | `distributing-time` | Completes the phrase, and picks the word datacenter readers use. *Time transfer* is the metrologist's term and is already glossed as a synonym |
| `two-clock` | `clock-agreement` | Says what the section is about to somebody who has never read us |
| `questions` | `questions-to-ask` | Marginal, but it reads as a phrase rather than a label |

Unbuilt sections worth fixing before they acquire pages: `datacenter-problem`
(→ `datacenter-timing`?), `benchmarking` (→ `benchmarking-clocks`), `stories`
(fine).

**Cost:** a section rename moves every page in it — the directory, the
`section:` line, and every inbound link. The link checker and P6 catch mistakes.
Nine pages would move under the four renames above.

## Redundancy between tiers

Six slugs repeat a word already in their section:

```
/acquiring/acquiring-time/                 repeats "acquiring"
/antennas/antenna-position/                repeats "antenna"
/utc/utc-k/                                repeats "utc"
/utc/how-gnss-time-relates-to-utc/         repeats "utc"
/utc/can-i-sync-datacenter-clocks-to-utc/  repeats "utc"
/utc/can-i-build-my-own-link-to-utc-nist/  repeats "utc"
```

**Recommendation: leave them.** The repetition costs nothing, and slugs travel
alone — pasted into chat, shown in a result, read aloud — where the section is
not present to supply the context. `can-i-sync-datacenter-clocks-to-utc` has to
make sense without `/utc/` in front of it, and it does. Optimising the *pair* at
the expense of the *part* is the wrong trade.

## Slug vs filename — the decision that changes at launch

They are the same thing today. That is right for now and wrong later.

**Before publication:** filename-derived is better. One source of truth, they
cannot disagree, and renames stay cheap — which matters with ten retitles still
on the audit list.

**After publication:** URLs must not change. A filename-derived slug means any
editorial file move silently relocates a live URL, and the only thing standing
between you and a broken link is remembering. An explicit `slug:` decouples the
two and pins the URL.

**The move:** at publication, one commit that writes each published page's
current slug explicitly into its frontmatter. Filenames then become an internal
concern; URLs are frozen. Deferred pages stay filename-derived until they ship,
and get pinned in the same way as they go.

## Open questions for Bob

1. **Take the four section renames?** Cheapest before launch, and `two-clock`
   and `questions` are the two that will look odd in a search result.
2. **Should tier 1 stay `/timekeeping/`?** It is a good keyword and it earns its
   place separating the garden from the blog — but it also puts *timekeeping*
   in front of every URL, and the median URL is already 43 characters. My view:
   keep it. The alternative is a flat namespace shared with blog posts, which is
   worse for both.
3. **Pin slugs at publication?** Recommended above; costs one commit.

---

## Multi-garden readiness — audited 2026-08-10

Bob's question: what would make it hard to stand up a second garden on an
unrelated subject?

**Nothing structural.** The content model generalizes cleanly — `section`,
`order`, `coverage`, `draft` carry no timekeeping assumptions. What exists is a
scatter of hardcoded names, each individually trivial:

| where | what is hardcoded | fix when the time comes |
|---|---|---|
| `src/topics.ts` | ~~`/timekeeping/` in `topicPath`~~ | ✅ **done** — now `GARDEN_ROOT`, one constant |
| `src/topics.ts` | one `SECTIONS` array, one `topics` collection | parameterize by garden, or one module per garden |
| `src/pages/timekeeping/` | route directory named literally | copy the tree, or add a `[garden]` segment |
| `src/content.config.ts` | one `topics` collection at one base path | a second collection, or a `garden:` field |
| `src/data/glossary.yaml` | one glossary, mounted per garden | almost certainly one glossary **per** garden |
| `BaseLayout.astro` | one nav entry, gated on `hasPublishedTopics()` | a list of gardens |
| `scripts/*.mjs` | `/timekeeping/` in four scripts | one constant each |

**The only genuinely structural decision is the glossary.** A second garden on
an unrelated subject should not inherit a glossary full of ADEV and UTC(k), so
`glossary.yaml` becomes per-garden and anchors become
`/<garden>/glossary/#term`. That is worth deciding *before* the second garden
exists, because it changes every glossary link that already works.

Everything else is a rename, and the cheapest insurance available today —
naming the root once — is already taken.

**Recommendation:** do nothing further now. A second garden is speculative, the
work is mechanical, and doing it in the abstract risks building the wrong
abstraction. But keep the glossary question in mind whenever glossary structure
is touched.
