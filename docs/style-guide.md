# Style guide

House rules for prose on **Think Outside The Bob**, covering the blog and
Topics In Timekeeping alike. Kept in `docs/` with the other working notes.

This is a *decisions* file, not a grammar textbook. It records what we settled
and why, so the same question does not get re-answered differently in six
months. Where usage was already consistent, that consistency is recorded rather
than invented.

Voice and structure rules for the garden live in
[`topics-in-timekeeping.md`](topics-in-timekeeping.md) — small pages, heavy
linking, be the 11th page not the 1001st. This file is about mechanics.

---

## Spelling: US English

Bob lives in the US and writes for a largely US audience. **center**, **meter**,
**color**, **labeled**, **analyze**, **favor**, **realize**.

> ⚠️ **Learned the hard way.** A bulk find-and-replace of `centre → center`
> turns *centred* into *centerd*, which is a word in no language. Any spelling
> sweep must check for malformed output afterwards, not just for the pattern it
> was hunting. Two shipped in alt text before a style audit caught them.

## Compound modifiers — the rule that settles most questions

**Hyphenate a compound when it modifies a noun. Leave it open otherwise.**

| | |
|---|---|
| noun | "the clock cannot be disciplined **in real time**" |
| modifier | "a **real-time** prediction of UTC" |

Same rule everywhere: *deferred-time scale*, *sub-nanosecond timing*,
*single-shot resolution*, *round-trip time* — but *the round trip took 4 ms*.

Never **realtime**. It is not a word in this house.

## Closed compounds we have settled

These are one word, everywhere, with no hyphen:

- **datacenter** (not *data center*, never *data centre*)
- **timescale** (not *time scale*)
- **timestamp**, **grandmaster**, **holdover**, **multipath**

- **feedline** — settled 2026-08-04. Bob is a ham and an RF guy, where one word
  is standard, and it parses fine for everyone else. The published *Last
  Nanoseconds to UTC* already used it, so this brought the garden into line
  rather than the other way round. Page title and slug moved with it, while
  nothing was published and it was still free.

And these stay two words:

- **sky view**, **error budget**, **service loop**

## Units and numbers

- **Space between number and unit**: `15 ns`, `30 cm`, `2.5 µs`. Always.
- **Real micro sign**: `µs`, not `us`. Copy it rather than typing `u`.
- **Real plus-minus**: `±15 ns`, not `+/-`.
- **Numerals for measurements**, always — `1 ns`, not *one nanosecond* — because
  the whole point of a measurement is that it is a number.
- **Words for counts up to ten** in ordinary prose: *three things are true*,
  *four unknowns*, *eighty institutes*. Numerals above that.
- **Ranges** take an en dash with spaces when units are involved: `50 ps – 1 ns`.

## Standards and product names

Name the version when there is more than one and the difference matters:

- **IEEE 1588-2008** for PTP, **IEEE 1588-2019** for White Rabbit. These are
  genuinely different capabilities, and the page says so.
- **RFC 5905** (NTP), **RFC 8915** (NTS).
- **VIM 2.13** style for the metrology vocabulary — clause number, not page.

**UTC(k)** with parentheses and no space. Specific realizations spell out the
institute: **UTC(NIST)**, **UTC(USNO)**, **UTC(PTB)**.

## Punctuation

- **Serial comma: yes.** *hardware, configuration, and people.* Usage was 5–3 in
  favor before this was written down; now it is a rule.
- **Em dash — spaced.** Used freely, because the prose is conversational.
- **Curly quotes** in prose, straight quotes in code. MDX handles this.
- **Bare `<https://…>` autolinks do not work in MDX** — they parse as JSX tags
  and fail the build. Use `[text](url)`.
- **Nor does a bare `<` before a digit**, for the same reason: `<5 ns` is read as
  an opening tag and breaks the build with a message about JSX. Write `&lt;5 ns`
  when quoting a vendor's specification verbatim, or reword to *under 5 ns*,
  which is usually better prose anyway.

## Titles: write for the person with the problem

The rule that outranks every other rule in this file, and the one that decides
what a garden page is called.

**Write each page from inside the head of someone with a question to be
answered. Assume they do not know the lingo of the field, and will describe the
problem the way they experience it.** What words would they use for their
situation, and for the way out of it? Those words are the title, and they are
the story the page tells.

Bob learned this attracting traffic to niche technical content in 2005. The
search machinery has changed beyond recognition since; the principle has not,
because it was never really about search engines. A page titled with a term of
art can only be found by someone who already knows the term — which is precisely
the reader who does not need the page.

| instead of | write |
|---|---|
| How UTC is actually made | Can I sync my datacenter clocks to UTC? |
| The fast loop and the slow loop | How does GNSS time relate to UTC? |

Two corollaries:

- **Lead with the answer, then earn it.** *Literally no, but practically yes* —
  Bob's hook from the *Last Nanoseconds to UTC* talk — tells the reader in six
  words that they are in the right place.
- **Terms of art still belong in the body.** That is where a reader picks up the
  vocabulary they arrived without. Gloss on first use, link the glossary, and
  never make the jargon a precondition for arriving.

**Blog posts are exempt.** They are allowed to be episodic and told from Bob's
point of view — stories, not answers to questions somebody might be asking. This
rule governs the garden.

## Two audiences, and never blur them

The garden serves two readers who both say "GNSS timing receiver" and mean
opposite things. Be explicit about which one a passage is for.

- **The clock builder** wires into a **GNSS receiver module** (u-blox ZED-F9T,
  Septentrio mosaic-T) or a **geodetic receiver** (Trimble NetRS, Septentrio
  PolaRx), takes its PPS and serial stream, and supplies the oscillator, the
  discipline loop and the protocols. *They are building the clock.*
- **The datacenter buyer** racks a **[GPS network clock](/timekeeping/glossary/#gps-network-clock)**
  and gets NTP and PTP. There is a module inside, but as a hidden component.
  *They are buying the clock.*

**Both get a PPS. Only a network clock speaks a protocol; only a module hands
over the parts.** So a capability can be essential to one and meaningless to the
other — raw observations, quantization error and a reference-frequency input are
module concerns; a smoothed PPS that stays quiet through holdover is what a
network clock is *for*.

The failure mode this rule prevents: advice written for one audience read by
somebody holding the other, which is where half the confusion in this subject
comes from. When a page speaks to only one of them, say so in the sentence
rather than leaving the reader to work it out.

## Headings

**Sentence case**, always. *How UTC is actually made*, not *How UTC Is Actually
Made*. Page titles included.

Headings should be claims or questions rather than labels where possible — *Why
that is seldom the default* beats *Defaults*.

## Two words we retired

- **measurand.** Correct, and nobody outside metrology says it. Write *the thing
  you are measuring*, *the quantity*, or recast the sentence. Removed from all
  pages 2026-08-10.
- **ensemble**, except where it is literally true. An ensemble is a set of clocks
  **combined into one result** — BIPM's, or a national lab's. Ten GNSS clocks in
  ten racks, each authoritative for its own rack, are not an ensemble; they are
  *your clocks*, a *set of clocks*, or your *estate*. Bob's test: an ensemble
  plays together to make music. Somebody who grabs time from whichever clock is
  nearest does not have one.

## Terms of art

Use the precise word when the page is about the distinction, and gloss it once:

- **trueness** vs **precision** vs **accuracy** — the whole metrology section
  turns on these, so they are used strictly. Do not write *accuracy* meaning
  *trueness*.
- **off frequency** rather than *off* — a clock can be off in two independent
  ways, and the prose should say which.
- **time transfer** is the metrologist's term for what datacenters call *time
  distribution* and applications call *clock sync*. All three appear; the
  distribution page names them as synonyms once.

### An oscillator with nothing steering it

Four words get used for this and they are not interchangeable.

- **free-running** — the adjective, hyphenated by the compound-modifier rule
  above: *a free-running oscillator*, *the satellites are free-running*.
- **runs free** — the verb form. *It runs free and drifts.* Not *free-runs*,
  which reads as jargon for no gain.
- **undisciplined** — use when the contrast with *disciplined* is the actual
  point, which in the GPSDO world it usually is. It is the more precise word
  because it says what is absent rather than what is happening.
- **`freerun`** — only when naming a state a device actually reports, in code
  font, quoting the device's own vocabulary. Never in prose.

**And keep [holdover](/timekeeping/glossary/#holdover) separate from all of
them**, because the difference is real and load-bearing. A holdover clock is
free-running *after having been disciplined*, so it knows its own frequency
offset and can correct for it. A clock that was never disciplined does not, and
drifts much faster. Writing *free-running* where *holdover* is meant throws that
distinction away — and it is the distinction that decides whether a specification
means anything.

Link a term to its glossary entry **on first use per page**, not every use.

---

## Figures

**Never distinguish series by hue alone.** The first cut of the UTC prediction
scorecard used four Okabe-Ito hues at 1.1 px, and Bob — who is not colorblind —
read GPS/Galileo as one line and BeiDou/GLONASS as another. Four thin traces
need **hue, weight, and dash varying together**, and the legend swatch has to
carry the dash too or it is a hue-only key to a chart that deliberately is not.
Colorblind-safe is the floor, not the goal.

**Do not trim Bob's slide exports.** His Keynote figures come in at 1920×1080
with margins he drew on purpose. A `sharp.trim()` was added once to strip the
white letterboxing of a 16:9 slide exported onto US Letter, and it then quietly
shaved the margins off every PNG that followed, leaving each figure jammed
against its own frame. `scripts/import-figure.mjs` defaults to no trim; pass
`--trim` only for a genuinely letterboxed export, and look at the result.

**Every figure should zoom.** Diagrams and plots go through
`ZoomableImage`, which opens the original — the `.svg` for generated figures, so
zooming into a plot is resolution-free. Pass `plate` for line art authored on
white, which keeps its light background in dark mode.

---

## Open questions

*None currently.* When one appears, it goes here rather than being resolved
silently in one file and contradicted in the next.

## A note on sweeping

Two of these decisions were applied by bulk replacement, and both bit:

- `centre → center` turned *centred* into *centerd*.
- The `feed line → feedline` sweep rewrote this file's own open-question section
  into *"feedline or feedline?"*, which is not a question.

**Always read the diff after a sweep**, and be wary of running one over a
document that discusses the very strings being replaced.

## Do not name specific regulations

Bob's call, 2026-08-11. Pages may say a requirement **arrived from** a regulator,
a counterparty, an auditor or a contract — that framing is doing real work and
stays. What they must not do is cite the regulation by name.

**Why:** naming one invites "IANAL, but here is why you are wrong and I am
right." That is an argument with no technical content, no way to win, and no
version of it that improves the page. The reader who is subject to a regulation
already knows its number; the reader who is not gains nothing from it.

Applies to MiFID II RTS 25 and every equivalent. Declined twice already — do not
re-propose it.
