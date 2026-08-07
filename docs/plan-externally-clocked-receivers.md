# Plan — a page on measurements with externally clocked receivers

**Status: planned, not drafted.** Written 2026-08-07 so that
`can-i-build-my-own-link-to-utc-nist.mdx` can be left at a good stopping point
instead of being reopened every time a new measurement lands.

## Why it is a separate page

The UTC(NIST) link page answers "can I build the measurement?" and stops where
it stops — at frequency without time, and at a receiver whose observations are
timed by its own TCXO. That is a complete argument and it should stay one.

The interesting *next* question is a different one:

> **What changes when the receiver's ticks come from an oscillator you chose?**

That is a measurement story, not a how-to, and it needs data we do not yet have.
It also needs a longer run than a single afternoon, because the whole claim is
about stability over τ.

## Working title

By the [reader's-question rule](style-guide.md): something like
**"Does feeding the receiver your own oscillator actually help?"** — because
that is what somebody who has read the receiver-traits page will want to know
next, and because the honest answer may be *it depends on τ*, which is a good
page.

Avoid "externally clocked receivers" as a title. It is our phrase, not theirs.

## The hardware that makes it possible

The **SparkFun GNSSDO+ (SXT-D)** is the whole reason this page is reachable:
one enclosure containing a Septentrio **mosaic-T** and a double-oven OCXO, with
the mosaic-T taking that OCXO as its **external frequency reference** rather
than using its internal TCXO. So the oscillator being disciplined and the
oscillator timing the carrier-phase observations are *the same oscillator* —
the single-oscillator case.

The contrast piece is the ZED-F9T, which has no reference input at all. Same
sky, same antenna if we split it, two architectures.

A **NetRS** externally clocked is the third leg, and the one that reaches
furthest back — a geodetic receiver of an older generation doing the same trick.

✅ **Oscillator settled 2026-08-07**, from
[SparkFun's own product page](https://www.sparkfun.com/sparkpnt-gnss-disciplined-oscillator-plus.html):
the GNSSDO+ carries an **STP3593LF (ROX5242T1N family) double-oven OCXO from
Rakon**. Both PePPAR-Fix docs were right and neither was complete —
`receiver-clock-hierarchy.md` named the maker, `gnssdo-plus-integration.md`
named the part. There was no contradiction to resolve.

Specs worth having to hand when the page is written:

| | |
|---|---|
| frequency calibration at 25 °C | better than 50 ppb |
| aging | ±0.2 ppb/day |
| stability over −32 to +70 °C | ±0.03 ppb |
| ADEV at 10 000 s | below 1 × 10⁻¹⁴ *(with AtomiChron enabled)* |

Note the asterisk on that last one: **the 1 × 10⁻¹⁴ figure is quoted with a
commercial correction service running**, so it is a system number and not the
oscillator's. Worth being careful about, since it is exactly the kind of spec
that gets repeated without its condition. The plain GNSSDO (non-plus) carries a
DCTCXO instead and is a different animal.

## What we already have, and why it is not enough

`data/disc-2h-*.csv` in PePPAR-Fix (April 2026) has paired two-hour runs
labelled `-ocxo` (GNSSDO+) and `-th` (ZED-F9T), which look at first glance like
exactly the comparison this page wants. **They are not usable for it**, for two
reasons worth recording so nobody re-derives them:

1. The obvious column, `dt_rx_sigma_ns`, comes out at **0.123 ns median for the
   OCXO-clocked mosaic-T and 0.109 ns for the F9T** — essentially identical, and
   if anything backwards. That is because it is the filter's *formal* uncertainty
   on the clock estimate, set by observation noise, not by which oscillator the
   receiver is clocked to. It does not measure the thing the page is about.
2. They are **closed-loop discipline logs**, recorded while PePPAR-Fix was
   actively steering. The residual is the servo's residual, not the oscillator's
   behaviour. You cannot recover an open-loop stability curve from it.

The measurement this page needs is **ADEV/TDEV of the receiver's own clock
estimate against a common reference**, over a day or more, with the loop's
influence either absent or accounted for.

## Experiments that would make the page, in priority order

Each is a few days at most, and the GNSSDO+ is wired up and idle.

1. **The headline pair — 24 h, same antenna, split feed.** Run the GNSSDO+
   (mosaic-T on its OCXO) and a ZED-F9T from one antenna through a splitter.
   Log raw observations from both. Process both through the same correction
   stream and plot **TDEV of the receiver clock estimate vs τ** on one pair of
   axes. This is the entire page in one figure: two architectures, one sky, one
   antenna, one processing chain, one variable.
   *Bonus:* the splitter also makes it a
   [zero-baseline](/timekeeping/glossary/#baseline) experiment, so the antenna
   and feedline cancel exactly.

2. **Where the curves cross.** The expected shape is that the externally clocked
   receiver wins at short τ and the two converge once GNSS discipline dominates.
   **Finding the crossover is the publishable result** — it tells a reader the
   averaging interval below which the reference input is worth paying for, which
   is a decision they can act on. Nobody else seems to have published this for
   hardware at this price.

3. **The second hop, measured.** Take the F9T and bolt the disciplined
   oscillator on externally via the TICC, exactly as the argument on the receiver
   page describes. How much worse is that than having the oscillator inside the
   loop? This puts a number on "you are limited by how tightly you can tie the
   TCXO to your oscillator", which is currently an assertion.

4. **Holdover, both ways.** Pull the antenna and watch each architecture coast.
   Cheap to run, easy to read, and it connects to
   [holdover](/timekeeping/glossary/#holdover), which readers already argue
   about.

5. **NetRS as the third leg** — worth one run to show the trait is generational,
   not a new invention, and that the price of it has collapsed.

## What the page must not do

- **No closed-loop residual presented as oscillator performance.** That is the
  trap the April data falls into, and it would be an easy figure to draw wrongly.
- **No internal host names.** The PePPAR-Fix fleet's machine names are not for
  publication; describe hardware by what it is.
- **No claim the reference input always wins.** If the curves converge by 100 s,
  say so — the useful page is the one that tells a reader when *not* to spend the
  money.

## Where it would live

`src/content/topics/acquiring/`, next to
[what-makes-an-accurate-timing-receiver](../src/content/topics/acquiring/what-makes-an-accurate-timing-receiver.mdx),
which sets up trait 6 and currently ends the argument with an assertion this
page would turn into a measurement.
