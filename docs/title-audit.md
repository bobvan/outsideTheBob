# Title audit — Topics In Timekeeping

Every garden page assessed against the principle in
[`style-guide.md`](style-guide.md): *write each page from inside the head of
someone with a question, who does not know the lingo and will describe the
problem the way they experience it.*

Started 2026-08-05, kept current. **29 pages in six sections**, plus two
[held](../held/README.md) outside the build.

**Slug policy.** A slug changes when the old one carried jargon, an internal
name, or our conclusion rather than the reader's question. Prefer short and
keyword-dense over a literal transcription of the title.

---

## Scorecard

| | count |
|---|---|
| ✅ pass | **29** |
| ⏳ recommended, not done | **0** |

**Sections passed too**, as of the 2026-08-10 reorganization — `two-clock`,
`metrology`, `acquiring`, `transferring` and `questions` are gone, and the six
that remain (`datacenters`, `gnss`, `measuring-time`, `questions-to-ask`,
`time-distribution`, `utc`) all read as words a stranger would recognize.

---

## ✅ Passing — 29

### The ones that ask the reader's question

| page | slug |
|---|---|
| What are the limits of GNSS time accuracy? | `limits-of-gnss-time-accuracy` |
| Which GNSS constellation keeps the best time? | `which-constellation-keeps-best-time` |
| Can I sync my datacenter clocks to UTC? | `can-i-sync-datacenter-clocks-to-utc` |
| Can I build my own link to UTC(NIST)? | `can-i-build-my-own-link-to-utc-nist` |
| How does GNSS time relate to UTC? | `how-gnss-time-relates-to-utc` |
| What does "traceable to UTC" actually mean? | `what-does-traceable-to-utc-mean` |
| What happens when I lose GPS? | `what-happens-when-i-lose-gps` |
| What makes an accurate GNSS timing receiver? | `what-makes-an-accurate-timing-receiver` |
| How to configure antenna position for datacenter GNSS receivers? | `configuring-gnss-antenna-position` |
| How to configure feedline length for datacenter GNSS receivers? | `configuring-gnss-antenna-feedline` |
| How do I know my clock is still right? | `how-do-i-know-its-still-right` |
| Should I prioritize clock agreement or accuracy to UTC? | `prioritize-agreement-or-accuracy` |
| Do timestamp errors average out? | `do-timestamp-errors-average-out` |
| What are timestamps and timescales? | `what-are-timestamps-and-timescales` |
| Why do you want precise time? | `why-precise-time` |
| How big is a nanosecond? | `how-big-is-a-nanosecond` |
| How big is a degree? | `how-big-is-a-degree` |
| Visualizing precision, trueness, and accuracy | `visualizing-precision-trueness-accuracy` |

### Passing for the other reason

Task-shaped with no jargon, or Bob's explicit call that nothing better exists.

| page | why it works |
|---|---|
| Questions to ask a clock vendor | Task-shaped |
| Time Distribution Protocols | A statement, not a question — Bob's call. A compare/contrast page that search will read as one |
| Measurement resolution and accuracy | A statement, same reasoning. Names both halves of what the page relates |
| UTC(k), and who defines yesterday | Kept the title; slug is now `who-defines-utc`, which is the searchable half |
| Questions to ask when benchmarking clocks | Task-shaped |
| Accurately measuring elapsed time | Plain words, and the reframe puts the surprise in the first line |
| Comparing distant clocks | Plain words for the actual job |
| Choosing a GNSS timescale for syncing datacenter clocks | Task-shaped — see the caveat below |
| Matching acquisition and distribution | Bob's call: nothing better proposed |
| The limits of averaging | Bob's call: nothing better proposed |
| Ways to get time into a datacenter | Nearly there; the question form is all it lacks |

---

## ⏳ Recommended — none

**Every title has been through the principle.** Twenty-nine pages, six sections,
no outstanding recommendations. Anything further is a rewrite rather than a
retitle.

---

## Done so far

| was | is | slug |
|---|---|---|
| How UTC is actually made | Can I sync my datacenter clocks to UTC? | changed |
| The fast loop and the slow loop | How does GNSS time relate to UTC? | changed |
| BIPM publishes a GNSS prediction scorecard | Which GNSS constellation keeps the best time? | changed |
| Configuring GNSS antenna position for datacenter receivers | How to configure antenna position for datacenter GNSS receivers? | `configuring-gnss-antenna-position` |
| An uncalibrated antenna feedline is likely your largest source of error to UTC | How to configure feedline length for datacenter GNSS receivers? | `configuring-gnss-antenna-feedline` — old title now opens the page |
| No second chance | Do timestamp errors average out? | changed |
| "It matters more that my clocks agree…" | Should I prioritize clock agreement or accuracy to UTC? | `prioritize-agreement-or-accuracy` — quote moved into the body |
| What "traceable to UTC" actually requires | What does "traceable to UTC" actually mean? | `what-does-traceable-to-utc-mean` — meaning before requirements |
| GNSS time is a prediction | What are the limits of GNSS time accuracy? | `limits-of-gnss-time-accuracy` — reframed so the limits follow *from* the prediction |
| Elapsed time needs no timescale | Accurately measuring elapsed time | `measuring-elapsed-time` — leads with the surprise |
| Every timestamp is taken against a timescale | What are timestamps and timescales? | `what-are-timestamps-and-timescales` |
| Yeah, but why do you want precise time? | Why do you want precise time? | `why-precise-time` |
| Contrasting timing accuracy and precision | Visualizing precision, trueness, and accuracy | `visualizing-precision-trueness-accuracy` |
| Distributing time: the protocols | Time Distribution Protocols | `time-distribution-protocols` |
| *(kept)* UTC(k), and who defines yesterday | — | `who-defines-utc` |
| Relating timing accuracy with measurement resolution | Measurement resolution and accuracy | `measurement-resolution-and-accuracy` |
| How do you compare two clocks a thousand miles apart? | Comparing distant clocks | shortened at draft |

## One caveat on a title that passes

**Choosing a GNSS timescale for syncing datacenter clocks** is Bob's own title.
By this rule *GNSS timescale* is a term of art, and the reader is more likely
asking **which correction service do I actually need?** Worth revisiting; not
worth changing against the author's judgement.

## Method notes

- Retitling is cheap **while everything is `draft: true`**. It gets expensive the
  day the garden publishes — and as of 2026-08-10 the work is done, so that
  deadline no longer has anything riding on it.
- A retitle is frontmatter, filename, inbound link text, and this file. The link
  crawler catches anything missed, and `publish-check` P6 catches a section that
  drifts from its directory.
- Blog posts are exempt by the principle and are not audited here.
