# Topics In Time — structure draft

**Status: draft, not published.** This file lives in `docs/` at the repo root.
Astro only builds `src/pages/` and the collections declared in
`src/content.config.ts`, so nothing here reaches the site no matter how long it
sits. It is version-controlled so we can argue about it across sessions.

## What this is

The garden: narrow, cross-linked pages that get **tended rather than published**.
A blog post is dated and finished. These are revised as Bob learns more, so they
are sorted by reading order rather than date, headlined by an `updated` date, and
kept out of the RSS feed.

## Rules we're drafting against

1. **Small pages.** One idea per page. If a page needs subheadings to stay
   navigable, it is probably two pages.
2. **No topic runs more than a few pages.** A topic that wants ten pages is
   either a book or badly scoped.
3. **Heavy linking.** A reader should be able to arrive anywhere and get to the
   thing they actually needed in one hop.
4. **Be the 11th page, not the 1001st.** Anything covered well elsewhere gets
   framed for this audience or gets a link, never a re-explanation.

## Coverage notation

The thing Bob asked to sort out — where a concept is explained fully, where it is
summarised, and where it is only a link. Three levels:

| Mark | Level | Means |
|------|-------|-------|
| **H** | Home | Full coverage lives here. Exactly one Home per concept. |
| **S** | Summary | A paragraph or two of framing, then a link to the Home. Used when a reader needs *enough* to keep going but not the whole thing. |
| **M** | Mention | The defining words are a link. No explanation at all. |

The discipline is the **one Home per concept** rule. The moment a concept has two
Homes they drift apart, and the reader who lands on the stale one has no way to
know. Everything else points at the Home.

---

## The hierarchy

### Precise Time for Traders

*The entry point. Mostly S and M — it frames the problem and routes onward.*

- **A means to an end** — **H**. Why a trading firm cares about time at all.
  Nobody wants precise time; they want something else that requires it.
- **It's event timestamping — there's no second chance** — **H**. The
  defining constraint. A trade happens once, and the timestamp is taken
  once. This is what separates the problem from most measurement.
- **Timestamps are taken against a timescale** — **H** for the concept.
  - Defined length of a tick
  - Defined starting time, or 0th tick
  - A timestamp is a count of elapsed ticks
  - **Example timescales** — UTC **M**, TAI **M**, *Years since
    Victoria's reign* — the absurd-but-valid one that makes the definition
    concrete. Illustrated by the reigns graphic.
- **Elapsed time** — **H**.
  - Doesn't need a full timescale — only a tick length and a counter.
  - Tick length errors can be ignored when the accumulated error is small
    relative to **?** *(see open question 1)*.
- **Best practices** — **H**. The takeaways slide, expanded.

### Precise Time from GNSS

*Currently a stub in the outline. The talk material makes it the richest topic.*

- **How long you watch the sky** — **H**. The accuracy ladder: seconds on a
  phone to a two-week post-processed answer. Home for the blobs figure, which
  carries the whole argument on its own.
- **Satellites aren't master clocks** — **H**. The abstraction that breaks:
  the earthbound infrastructure is what limits accuracy.
- **Same signals, better answers** — **H**. A phone and a precision clock
  receive identical signals and differ only in processing. Two to three orders
  of magnitude.
- **The small effects** — **H**. Intersystem bias, datum offsets, solid-Earth
  tides. One short page, not three.
- Antennas — **S**, linking out. *(Open question 3.)*

### What Is UTC

*Covered well elsewhere. Earns its place only through the trader framing.*

- **What UTC is, briefly** — **S**, linking to BIPM and NIST for the real
  definition. The value added here is that it is **a virtual timescale computed
  after the fact**, which is the part that matters and the part general
  explanations bury.
- **Traceability** — **H**. What it means, what it costs, when a trading firm
  actually needs it.
- **When you can just call it GPS Time** — **H**. If ±15 ns is good enough, the
  whole UTC question dissolves. Probably the single most useful page here.

### Time Metrology

*Same situation: definitions are covered everywhere. Frame or link.*

- **Accuracy, precision, resolution** — **H** for the trader framing, **M** to
  the standard definitions. The framing is what earns it: which of the three
  your compliance obligation actually names, and which one your engineers are
  optimising.
- UTC — **M** (Home is *What Is UTC*).
- GNSS — **M** (Home is *Precise Time from GNSS*).

### Two-Clock Agreement

*Bob's originally-named topic. The mechanism.*

- **Agreement is not accuracy** — **H**. Two receivers agreed to 550 ps while
  both sat behind a 5 ns floor, because a constellation's offset from UTC is
  common-mode and cancels. The load-bearing idea of the whole garden.
- **Which one do you actually need?** — **H**. Proving compliance versus
  ordering events. Most confusion in this area is these two questions wearing
  each other's clothes.
- **What limits agreement** — **H**. Where the 550 ps came from and what stands
  between it and better.

### Precision Time Benchmarking

*Stub in the outline. Proposed shape below — needs Bob's intent.*

- **What to measure** — **H**. Deviation plots, what TDEV and ADEV tell you,
  what a single number cannot.
- **How to measure it without lying to yourself** — **H**. Comparing two clocks
  when you have no reference better than either.
- Links out to the PePPAR-Fix results.

---

## Cross-link map

The concepts that get referenced from several places, and where their Home is:

| Concept | Home | Referenced from |
|---|---|---|
| Timescale (tick + epoch + count) | Precise Time for Traders | What Is UTC (S), Metrology (M) |
| UTC | What Is UTC | Traders (S), Metrology (M), GNSS (M) |
| Traceability | What Is UTC | Traders (S), Benchmarking (M) |
| Accuracy vs precision vs resolution | Time Metrology | Traders (S), Two-Clock (S) |
| Agreement vs accuracy | Two-Clock Agreement | Traders (S), GNSS (S), Benchmarking (S) |
| The accuracy ladder + figure | Precise Time from GNSS | Traders (M), Two-Clock (M) |
| The 5 ns floor | Two-Clock Agreement | What Is UTC (S), GNSS (M) |

---

## Open questions

1. **Fill the blank.** "Tick length errors can be ignored when the elapsed time
   is small relative to ___." Proposed: *the tolerance you're claiming* — a
   fractional frequency error ε over an interval Δt accumulates εΔt, so it is
   ignorable while εΔt stays under your stated tolerance. Is that the point you
   were making, or was it about something narrower?

2. **Does the name commit the garden to time?** "Topics In Time" is good, and it
   excludes a future Proxmox or homelab topic. Options: accept the commitment,
   or make the nav label "Topics" with *Topics In Time* as the first collection.
   I lean toward accepting it — the time material is the reason to build this,
   and a second garden can exist later.

3. **Antennas: page or link?** The talk gives them a visual section and calls
   them critical. That suggests a Home, not a Summary — but antenna selection is
   also well covered elsewhere. Which way?

4. **Where does PePPAR-Fix itself live?** Not in the outline. It is the
   implementation, and the "trail of crumbs" you wanted to leave. Own collection
   (*Building a GNSS Clock*), a topic under *Precise Time from GNSS*, or stay in
   the repo with only links from here?

5. **Rename the reigns graphic.** It is `public/images/drift.png`, which is
   misleading — it illustrates a timescale, not drift. Suggest
   `victorian-timescale.png` when it lands on its page.

6. **Reading order.** Should *Precise Time for Traders* be explicitly page 1
   with the others sequenced after it, or is every topic a valid entry point
   with the cross-links doing the work?
