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

And these stay two words:

- **feed line** — see the open question below
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

## Headings

**Sentence case**, always. *How UTC is actually made*, not *How UTC Is Actually
Made*. Page titles included.

Headings should be claims or questions rather than labels where possible — *Why
that is seldom the default* beats *Defaults*.

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

Link a term to its glossary entry **on first use per page**, not every use.

---

## Open questions

**`feed line` or `feedline`?** Currently split, and it is a genuine fork:

- The garden uses **feed line** (two words), 13 uses, and the page slug is
  `/timekeeping/antennas/feed-line/`.
- The published post *The Last Nanoseconds to UTC* uses **feedline** (one word),
  5 uses. That is Bob's own voice, in public, and predates the garden.

Both are attested — *feedline* is standard in amateur radio and RF, *feed line*
is more common in general technical writing. **Bob's call**, and whichever way it
goes, the other should be swept. If *feedline* wins, the page title and slug
change too, which is free while nothing is published but not later.
