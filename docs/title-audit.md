# Title audit — Topics In Timekeeping

A pass over all 24 garden pages against the principle recorded in
[`style-guide.md`](style-guide.md): *write each page from inside the head of
someone with a question, who does not know the lingo and will describe the
problem the way they experience it.*

Done 2026-08-05, after the principle was written down. Kept current as titles
are fixed — three so far, each at Bob's instruction.

The test applied to each title: **would somebody who has the problem, but not
the vocabulary, type these words?** A title that only a person who already knows
the term can find is a title serving the audience that does not need the page.

---

## The scorecard

**9 of 24 already pass.** They pass for one of two reasons, both worth naming
because they are reusable: they either ask the reader's literal question, or
they quote the reader's own sentence back at them.

| page | why it works |
|---|---|
| Yeah, but why do you want precise time? | The question a skeptical colleague actually asks, punctuation and all |
| "It matters more that my clocks agree than that they're right" | The reader's own sentence, in quotes |
| How big is a nanosecond? | Plain words, real question |
| How big is a degree? | Same |
| Questions to ask a clock vendor | Task-shaped, no jargon |
| Questions to ask when benchmarking clocks | Same |
| Questions to ask when designing a clock | Same |
| What "traceable to UTC" actually requires | *Traceable to UTC* is the phrase a regulator hands the reader — so it is their words, not ours |
| An uncalibrated antenna feedline is likely your largest source of error to UTC | A claim about the reader's situation. Long, but it promises a payoff |

**3 fixed so far**, at Bob's instruction:

| was | is |
|---|---|
| How UTC is actually made | Can I sync my datacenter clocks to UTC? |
| The fast loop and the slow loop | How does GNSS time relate to UTC? |
| BIPM publishes a GNSS prediction scorecard | Which GNSS constellation keeps the best time? *(2026-08-07)* |

**12 still fail.** They divide into three failure modes.

---

## Failure mode 1 — the title is our conclusion, not their question

The commonest one, and the most seductive, because these are *good sentences*.
They are the thing the reader should believe when they finish. Putting the
conclusion in the title asks them to have read the page in order to want to.

| current title | what the reader would ask | note |
|---|---|---|
| GNSS time is a prediction | **Does the satellite know what time it is?** | The page's whole arc is demolishing that assumption in three steps. The naive question is a far better door than the sophisticated answer. Strongest recommendation on this list. |
| Elapsed time needs no timescale | **Do I need an accurate clock to measure how long something took?** | The answer is a money-saving no, and the current title hides it behind a term the reader does not have yet. |
| Every timestamp is taken against a timescale | **What is a timestamp actually measured against?** | |
| The limits of averaging | **Will averaging longer make my clock more accurate?** | Answer: no, and that is genuinely surprising. |
| No second chance | **Why can't I just average the error away?** | Currently a pun — opaque until read. The page is about a trade happening once, where the archer gets ten arrows. |
| Matching acquisition and distribution | **Does a better GPS receiver help if I hand the time out over NTP?** | Insider framing of a question people ask constantly. |

## Failure mode 2 — the title leads with an acronym or a term of art

Findable only by the initiated.

| current title | what the reader would ask | note |
|---|---|---|
| ~~BIPM publishes a GNSS prediction scorecard~~ | ✅ **Which GNSS constellation keeps the best time?** — *done 2026-08-07* | Probably the highest-traffic real question in the whole garden, and we answer it with fourteen months of BIPM data. Leading with *BIPM* wasted that. |
| UTC(k), and who defines yesterday | **If nobody has UTC, whose time am I actually getting?** | *UTC(k)* is unsearchable by anyone who needs the page. |
| Contrasting timing accuracy and precision | **What does "accurate to 15 ns" actually mean?** | That ambiguity is the page's entire argument, and it is a phrase the reader has been handed by a vendor. |
| Relating timing accuracy with measurement resolution | **My clock reports the same number every time — is it that good?** | Worse than the one above: both *contrasting* and *relating* are essay verbs, not reader words. |
| Distributing time: the protocols | **NTP or PTP — which do I need?** | |

## Failure mode 3 — nearly there, one word short

Not wrong, just not yet in the reader's mouth.

| current title | suggestion | note |
|---|---|---|
| Ways to get time into a datacenter | **How do I get accurate time into my datacenter?** | Already plain; the question form and *accurate* are what a searcher adds. |
| Configuring GNSS antenna position for datacenter receivers | **What do I put in for my antenna's position?** | The current title is the task; the suggestion is the moment of confusion, which is when someone goes looking. |

---

## One caveat about the new page

**Choosing a GNSS timescale for syncing datacenter clocks** is Bob's title and is
kept as given, but by this rule *GNSS timescale* is a term of art — the reader
with the problem is more likely to be asking **which correction service do I
actually need?** Worth revisiting once the page settles.

## What this pass did not do

Change any title Bob did not name. The 12 remaining are recommendations only;
every retitle so far was instructed. Blog posts were not audited, since the
principle deliberately exempts them.
