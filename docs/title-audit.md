# Title audit — Topics In Timekeeping

Every garden page assessed against the principle in
[`style-guide.md`](style-guide.md): *write each page from inside the head of
someone with a question, who does not know the lingo and will describe the
problem the way they experience it.*

Started 2026-08-05, kept current as titles are fixed. **31 pages.**

The test: **would somebody who has the problem, but not the vocabulary, type
these words?** A title only findable by someone who already knows the term is
serving the audience that does not need the page.

**Slug policy.** A slug changes only when the old one carried the jargon the
retitle removes. `antenna-position` stayed because it was already the plain
keyword a searcher types, and a seven-word slug would be worse on every axis.
Prefer short and keyword-dense over a literal transcription of the title.

---

## Scorecard

| | count |
|---|---|
| ✅ pass | **20** |
| ⏳ recommended, not done | **11** |

Five retitles done, all at Bob's instruction.

| # | was | is | slug |
|---|---|---|---|
| 1 | How UTC is actually made | Can I sync my datacenter clocks to UTC? | `can-i-sync-datacenter-clocks-to-utc` *(changed)* |
| 2 | The fast loop and the slow loop | How does GNSS time relate to UTC? | `how-gnss-time-relates-to-utc` *(changed)* |
| 3 | BIPM publishes a GNSS prediction scorecard | Which GNSS constellation keeps the best time? | `which-constellation-keeps-best-time` *(changed)* |
| 4 | Configuring GNSS antenna position for datacenter receivers | What do I put in for my antenna's position? | `antenna-position` *(kept — already the keyword)* |
| 5 | How do you compare two clocks a thousand miles apart? | Comparing distant clocks | `comparing-two-distant-clocks` *(shortened at draft)* |

---

## ✅ Passing — 20

**Born asking.** Written after the principle was recorded, plus the retitles.
These are the model: the title is the query.

| page | slug |
|---|---|
| Do I need an OCXO, or will a TCXO do? | `do-i-need-an-ocxo` |
| What happens when I lose GPS? | `what-happens-when-i-lose-gps` |
| What makes an accurate GNSS timing receiver? | `what-makes-an-accurate-timing-receiver` |
| How do I know my clock is still right? | `how-do-i-know-its-still-right` |
| Can I build my own link to UTC(NIST)? | `can-i-build-my-own-link-to-utc-nist` |
| Can I sync my datacenter clocks to UTC? | `can-i-sync-datacenter-clocks-to-utc` |
| How does GNSS time relate to UTC? | `how-gnss-time-relates-to-utc` |
| Which GNSS constellation keeps the best time? | `which-constellation-keeps-best-time` |
| What do I put in for my antenna's position? | `antenna-position` |
| How big is a nanosecond? | `how-big-is-a-nanosecond` |
| How big is a degree? | `how-big-is-a-degree` |
| Yeah, but why do you want precise time? | `a-means-to-an-end` |

**Passing for the other reason** — they quote the reader's own sentence, or they
are task-shaped with no jargon in the way.

| page | why it works |
|---|---|
| "It matters more that my clocks agree than that they're right" | The reader's sentence, in quotes |
| Questions to ask a clock vendor | Task-shaped |
| Questions to ask when benchmarking clocks | Task-shaped |
| Questions to ask when designing a clock | Task-shaped |
| What "traceable to UTC" actually requires | *Traceable to UTC* is the phrase a regulator hands them |
| An uncalibrated antenna feedline is likely your largest source of error to UTC | A claim about their situation; long, but promises a payoff |
| Comparing distant clocks | Plain words for the actual job |
| Choosing a GNSS timescale for syncing datacenter clocks | Task-shaped — but see the caveat below |

---

## ⏳ Recommended — 11

Slugs proposed. Nothing changed without Bob saying so.

### Failure mode 1 — the title is our conclusion, not their question

The commonest and most seductive, because these are *good sentences*. They are
what the reader should believe on finishing. Putting the conclusion in the title
asks them to have read the page in order to want to.

| current | proposed | proposed slug | note |
|---|---|---|---|
| GNSS time is a prediction | **Does the satellite know what time it is?** | `does-the-satellite-know-what-time-it-is` | The page demolishes exactly that assumption in three steps. The naive question is a far better door than the sophisticated answer. **Strongest recommendation on this list.** |
| Elapsed time needs no timescale | **Do I need an accurate clock to measure how long something took?** | `measuring-how-long-something-took` | The answer is a money-saving no, hidden behind a term the reader does not have yet. |
| The limits of averaging | **Will averaging longer make my clock more accurate?** | `will-averaging-help` | Answer: no, and it is genuinely surprising. |
| No second chance | **Why can't I just average the error away?** | `why-cant-i-average-it-away` | Currently a pun, opaque until read. The page is about a trade happening once, where the archer gets ten arrows. |
| Every timestamp is taken against a timescale | **What is a timestamp actually measured against?** | `what-is-a-timestamp-measured-against` | |
| Matching acquisition and distribution | **Does a better GPS receiver help if I hand the time out over NTP?** | `does-a-better-receiver-help` | Insider framing of a question people ask constantly. |

### Failure mode 2 — leads with an acronym or a term of art

Findable only by the initiated.

| current | proposed | proposed slug | note |
|---|---|---|---|
| UTC(k), and who defines yesterday | **If nobody has UTC, whose time am I actually getting?** | `whose-time-am-i-getting` | *UTC(k)* is unsearchable by anyone who needs the page. Strongest of this group. |
| Contrasting timing accuracy and precision | **What does "accurate to 15 ns" actually mean?** | `what-does-accurate-to-15-ns-mean` | That ambiguity is the page's entire argument, and it is a phrase a vendor handed them. |
| Relating timing accuracy with measurement resolution | **My clock reports the same number every time — is it that good?** | `same-number-every-time` | Worse than the one above: *contrasting* and *relating* are essay verbs, not reader words. |
| Distributing time: the protocols | **NTP or PTP — which do I need?** | `ntp-or-ptp` | Short, high-traffic, and exactly the question. |

### Failure mode 3 — nearly there, one word short

| current | proposed | proposed slug | note |
|---|---|---|---|
| Ways to get time into a datacenter | **How do I get accurate time into my datacenter?** | `acquiring-time` *(keep)* | Already plain; the question form and *accurate* are what a searcher adds. Slug is already the keyword. |

---

## One caveat on a title that passes

**Choosing a GNSS timescale for syncing datacenter clocks** is Bob's own title
and is listed as passing, but by this rule *GNSS timescale* is a term of art.
The reader with the problem is more likely asking **which correction service do
I actually need?** Worth revisiting once the page settles; not worth changing
against the author's judgement in the meantime.

## Method notes

- Retitling is cheap and safe **while everything is `draft: true`** — no
  external links exist yet. It gets expensive the day the garden publishes. If
  any of the eleven are going to happen, before publication is the moment.
- Every retitle so far has taken under ten minutes: frontmatter, slug, inbound
  link text, this file. Inbound *hrefs* only need touching when the slug moves,
  and the link checker catches anything missed.
- Blog posts are exempt by the principle and are not audited here.
