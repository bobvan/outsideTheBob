# Topics In Timekeeping — structure draft

**Status: draft, not published.** This file lives in `docs/` at the repo root.
Astro only builds `src/pages/` and the collections declared in
`src/content.config.ts`, so nothing here reaches the site no matter how long it
sits. It is version-controlled so we can argue about it across sessions.

Collection title **Topics In Timekeeping**, nav label **Timekeeping**. The two
differ on purpose — nav sits beside five other items and has a space budget.

## What this is

Narrow, cross-linked **reference material**, kept out of the blog RSS feed.

> Bob, 2026-07-26: *the emphasis might be more on creating and curating linkable
> reference material rather than editing as I learn. I'm envisioning a burst of
> writing in the coming days, fleshing out the outline. Then it'll probably sit
> a while.*

That reframing matters more than it looks, and it reverses an earlier decision.
See **Feeds** below — a garden written in bursts and then left to sit should
announce *new pages*, not revisions.

## Rules we're drafting against

1. **Small pages.** One idea per page. If a page needs subheadings to stay
   navigable, it is probably two pages.
2. **No topic runs more than a few pages.**
3. **Heavy linking.** A reader should be able to arrive anywhere and reach what
   they actually needed in one hop.
4. **Be the 11th page, not the 1001st.** Anything covered well elsewhere gets
   framed for this audience or gets a link, never a re-explanation.
5. **Every topic is a valid entry point.** No forced reading order; the
   cross-links do the work. *(Bob, closing old question 6.)*

## Coverage notation

| Mark | Level | Means |
|------|-------|-------|
| **H** | Home | Full coverage lives here. Exactly one Home per concept. |
| **S** | Summary | A paragraph or two of framing, then a link to the Home. |
| **M** | Mention | The defining words are a link. No explanation. |

The load-bearing rule is **one Home per concept**. Two Homes drift apart, and the
reader who lands on the stale one cannot tell.

---

## The structural split

Bob's biggest change to this draft:

> *I want to separate time acquisition from time transfer, or as most time users
> in datacenters would think of it: time distribution or clock sync.*

That is the right top-level cut, and it exposed a hole — there was no transfer
topic at all. The outline below is reorganised around it.

- **Acquiring time** — getting a good copy of time *into* the building. GNSS,
  national labs, GPSDOs, antennas.
- **Transferring time** — moving it *around* once you have it. PTP, NTP, and the
  network in between.

Most confusion in datacenter timekeeping is someone solving an acquisition
problem with a transfer tool, or the reverse.

---

## The hierarchy

### 1. Timekeeping in Datacenters

*The entry point. Mostly S and M — frames the problem and routes onward.*

Bob renamed this from *Precise Time for Traders* and left a sentence unfinished:
"I want to generalize ", followed by *all electronic trading takes place in
datacenters, but there are many timekeeping uses beyond just trading in
datacenters.*

**Proposed resolution:** title it **Timekeeping in Datacenters** and make trading
the *sharpest instance* rather than the subject. Trading supplies the hardest
requirement, a regulator forcing the issue, and Bob's credibility. The mechanics —
timestamping at volume, distributing time to many machines — are identical for
anyone in a datacenter. Naming the general case makes it findable by the wider
audience without diluting the authority. *(New question 1.)*

- **A means to an end** — **H**. Nobody wants precise time; they want something
  that requires it. **Often a regulatory requirement** — worth naming the
  specific regimes so a reader can locate their own obligation. *(New question 2.)*
- **It's event timestamping — there's no second chance** — **H**. A trade
  happens once and the timestamp is taken once. That is what separates this from
  most measurement, where you can simply measure again.
- **The scale of it** — **H**. Bob: *how many trillion market data messages are
  generated each day? How many orders sent? Each must be timestamped.* A short
  page whose entire job is making the volume land. Numbers needed —
  *(new question 4)*.
- **Timestamps are taken against a timescale** — **H** for the concept.
  - A defined tick length
  - A defined starting point, the 0th tick
  - A timestamp is a count of elapsed ticks since then
  - **Example timescales** — UTC **M**, TAI **M**, and *years since Victoria's
    reign began* — absurd but perfectly valid, and it makes the three-part
    definition concrete precisely because nothing about it is familiar enough to
    skate past. Illustrated by `public/images/victorian-timescale.png`.
  - **S** to *UTC(k) and who defines yesterday* — Home moved to **What Is UTC**,
    where Bob's new material now lives. Duplicating it here would create a
    second Home.
- **Elapsed time** — **H**.
  - Needs no timescale at all — only a tick length and a counter.
  - **Tick length errors can be ignored when the accumulated error is small
    relative to the resolution you are reporting.** Bob's example, which is
    better than the rule: *a trader measures 2.5 µs between a market data tick
    and an order going out. A 1 ppm frequency error contributes 2.5 ps. The
    interval is short enough that the frequency error is irrelevant.*
  - The corollary is the useful half: this stops being true as the interval
    grows, and the page should say roughly where the crossover lands.
    *(New question 5.)*
  - **S** to *when you can just call it UTC* — Bob: *you can say your timescale
    is UTC if you only care about elapsed time, or absolute time to ±15 ns.*
    Home in **What Is UTC**.
- **Realtime versus after-the-fact** — **H**. Bob: *our domain here is realtime
  time.* Worth its own page — it is the distinction that makes UTC's virtual
  nature matter rather than being trivia.
- **Best practices** — **H**. The takeaways slide, expanded.

### 2. Acquiring Time

*Getting a good copy of time into the building. Bob: "there should be a group of
topics on acquiring time via GNSS."*

- **How long you watch the sky** — **H**. The accuracy ladder, from a phone's
  blue dot in seconds to a two-week post-processed answer. Home for the blobs
  figure, which carries the argument by itself.
- **Satellites aren't master clocks** — **H**. The abstraction that breaks: the
  earthbound infrastructure is what limits accuracy.
- **Same signals, better answers** — **H**. A phone and a precision clock receive
  identical signals and differ only in processing — two to three orders of
  magnitude apart.
- **The small effects** — **H**. Intersystem bias, datum offsets, solid-Earth
  tides. One short page, not three.
- **GPSDOs** — **H**. What disciplining an oscillator means and why you want one.
  **PePPAR-Fix is an example here**, not a topic of its own. *(Bob, closing old
  question 4.)*
- **Sources other than GNSS** — **H** or **S**. A national lab feed, a commercial
  traceable service. Sets up why GNSS is usually the answer.

### 3. Antennas

*Promoted to its own topic. Bob: "I want one or more antenna pages. Partly
because I'm an antenna lover, but also because antennas are a critical, and often
under-appreciated part of precision timekeeping."*

- **Why the antenna is not an accessory** — **H**. The under-appreciation
  argument, which is the reason this topic exists.
- **Choosing one** — **H**. What matters for timing as opposed to navigation.
- **Surveying its position precisely** — **H**. Bob: *related to this, we need a
  section on precisely surveying antenna position.* For a fixed-position clock,
  knowing where the antenna is *is* the measurement — the neatest illustration in
  the garden that position and time are one problem.
- Siting, cabling, multipath — **H**, or folded into *Choosing one*.

### 4. Transferring Time

*The hole the acquisition/transfer split exposed. Nothing existed here.*

- **Acquisition versus distribution** — **H**. The distinction itself, and why
  conflating them wastes money.
- **NTP** — **S**, linking out. Exhaustively covered elsewhere; the value added
  is what it can and cannot do in a datacenter.
- **PTP** — **H** for the datacenter framing. Where the accuracy actually goes.
- **What the network does to your time** — **H**. Switches, asymmetry, queueing.
  The part that surprises people who assumed the protocol handled it.

*This is the topic where I have least sense of intended depth.
(New question 3.)*

### 5. What Is UTC

*Covered well elsewhere. Earns its place through framing.*

- **What UTC is, briefly** — **S**, linking to BIPM and NIST. The value added is
  that it is **a virtual timescale computed after the fact**, which general
  explanations bury.
- **UTC(k), and who defines yesterday** — **H**. Bob's material, moved here:
  *the national labs compete to have the most stable clocks, establishing their
  own UTC(k) timescales, where k is the name of the lab. The winners define
  exactly when yesterday was.* That last line is the best sentence in the draft
  and should reach publication intact.
- **GPS time is a prediction** — **H**. Bob: *GPS time is a realtime prediction
  of what USNO will eventually define as UTC(USNO).* This is the bridge between
  acquisition and this topic — it explains why a realtime source can only ever
  approximate a retrospective timescale.
- **Traceability** — **H**. What it means, what it costs, when it is actually
  required.
- **When you can just call it GPS Time** — **H**. If ±15 ns is good enough the
  whole question dissolves. Probably the most immediately useful page here.

### 6. Time Metrology

- **Accuracy, precision, resolution** — **H** for the framing, **M** to the
  standard definitions. Which of the three your obligation names, and which one
  your engineers are optimising — frequently not the same one.
- UTC — **M**. GNSS — **M**.

### 7. Two-Clock Agreement

- **Agreement is not accuracy** — **H**. Two receivers agreed to 550 ps while
  both sat behind a 5 ns floor, because a constellation's offset from UTC is
  common-mode and cancels between them. The load-bearing idea of the garden.
- **Which one do you actually need?** — **H**. Proving compliance versus ordering
  events.
- **What limits agreement** — **H**.

### 8. Benchmarking

- **What to measure** — **H**. Deviation plots, what TDEV and ADEV each tell you,
  what a single number cannot.
- **Measuring without lying to yourself** — **H**. Comparing two clocks when you
  have no reference better than either.

---

## Cross-link map

| Concept | Home | Referenced from |
|---|---|---|
| Timescale (tick + epoch + count) | Datacenters | UTC (S), Metrology (M) |
| UTC(k), who defines yesterday | What Is UTC | Datacenters (S), Acquiring (M) |
| GPS time as a prediction | What Is UTC | Acquiring (S), Two-Clock (M) |
| Traceability | What Is UTC | Datacenters (S), Benchmarking (M) |
| Accuracy vs precision vs resolution | Time Metrology | Datacenters (S), Two-Clock (S) |
| Agreement vs accuracy | Two-Clock Agreement | Datacenters (S), Acquiring (S), Benchmarking (S) |
| The accuracy ladder + figure | Acquiring Time | Datacenters (M), Two-Clock (M) |
| The 5 ns floor | Two-Clock Agreement | What Is UTC (S), Acquiring (M) |
| Antenna position survey | Antennas | Acquiring (S) |
| Acquisition vs distribution | Transferring Time | Datacenters (S) |

---

## Feeds

**Reversed, because "burst then sit" changes the answer.**

The blog keeps `/rss.xml`. The garden gets its own, so a reader choosing
reference-material notices is not the same as a reader choosing new writing.

Earlier I recommended a `guid` of *URL + updated date*, so every revision
resurfaced as unread. That suited continuous tending. It does not suit writing in
bursts and then sitting: it would fire constantly during a burst and never
afterwards — noisiest exactly when a reader is least able to keep up, silent the
rest of the time.

**Now recommended: `guid` = page URL, fixed.** The garden feed announces **new
pages** and stays quiet about revisions. If a revision is ever substantial enough
to deserve announcing, that is what a blog post is for, and it can link to the
page.

This also removes the argument for hand-rolling Atom. RSS 2.0's missing `updated`
field only mattered while we intended to broadcast updates, so `@astrojs/rss` can
generate the garden feed unchanged.

---

## Open questions

1. **Rename the entry topic?** Your *Timekeeping for Traders in Datacenters*
   versus my *Timekeeping in Datacenters*, with trading as the leading example.
   The unfinished "I want to generalize " suggests the latter; the trader framing
   is the differentiator. Which?

2. **Which regulations to name?** "Often a regulatory requirement" wants
   specifics so a reader can locate their own obligation. I know the shape of
   this but not well enough to write it without checking — better from you than
   guessed by me.

3. **How deep does Transferring Time go?** PTP in a datacenter could be one page
   or six. Given "no topic runs more than a few pages", where does it stop?

4. **The scale page needs numbers.** Messages per day, orders per day. Figures
   you trust, or should it cite a source?

5. **Does the elapsed-time crossover get a number?** Your 2.5 µs example makes
   frequency error vanish. Saying where it stops vanishing would double the
   page's usefulness — a small table of interval versus contributed error at
   1 ppm, perhaps.

## Done this round

- `drift.png` renamed to `victorian-timescale.png`.
- Restructured around your acquisition/transfer split; **Transferring Time**
  added as a topic, since nothing covered it.
- UTC(k) and GPS-time material moved into **What Is UTC** to preserve one Home
  per concept, with a Summary left behind in **Timekeeping in Datacenters**.
- Antennas promoted from a bullet to a topic, with position survey added.
- PePPAR-Fix placed as an example under GPSDOs.
- Elapsed-time blank filled with your 2.5 µs example.
- Feed recommendation reversed.
