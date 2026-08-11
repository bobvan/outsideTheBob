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

## Run 1 landed — 2026-08-10, from Agent main

**Experiment 1 is done.** One antenna through a splitter, one processing chain,
matched signals, both receivers logging raw observations simultaneously
2026-08-07/08. Both legs through PRIDE with the same products (WUM rapid,
DOY 220) and identical settings: `-m S -sys G -frq G15 -f -i 30`.

Two methodology notes that matter more than they look:

- **Float, not fixed**, because WUM publishes no phase biases for the L5 signals
  in play. Worth saying out loud on the page rather than in a footnote.
- **G15, and the signal sets were matched deliberately.** The F9T runs an L1/L5
  profile and carries no L2 data at all — counted observables actually present
  were C1C 3779, L1C 3729, C5Q 2966, L5Q 2787, and **zero** in the declared L2
  columns. Main enabled GPS L5 on the mosaic-T mid-run so the two match; before
  that it tracked L1/L2 only, and the comparison would have confounded *which
  oscillator* with *which signals*. That is the exact failure this page exists to
  avoid, and it was caught before it got into a figure.

### ADEV / TDEV vs τ

| τ (s) | free-run OCXO | disciplined OCXO | free-run TCXO |
|---|---|---|---|
| 30 | 1.06e−12 / 0.018 ns | 6.27e−13 / 0.011 ns | 3.99e−11 / 0.690 ns |
| 120 | 1.14e−12 / 0.067 | 2.78e−13 / 0.014 | 1.18e−10 / 8.069 |
| 480 | 1.25e−12 / 0.287 | 1.21e−13 / 0.021 | 4.26e−10 / 113.378 |
| 1920 | 1.29e−12 / 1.292 | 4.07e−14 / 0.029 | 1.13e−09 / 1096.757 |
| 3840 | 1.68e−12 / 2.942 | 2.96e−14 / 0.043 | 1.22e−09 / 2154.887 |

Frequency offset / RMS about fit: free-run OCXO **−1.18e−11 / 7.8 ns** (7.7 h) ·
disciplined **+7.64e−15 / 0.1 ns** (14.4 h) · free-run TCXO **+1.30e−08 /
7746.2 ns** (14.4 h).

### What we may and may not say about it

**The third column is not the oscillator-swap experiment.** The gap between the
two receivers widens monotonically — 64× at 30 s to 64,550× at 7680 s — and it
would be very easy, and wrong, to caption that as *a better oscillator buys you
64,000×*. It is not like-for-like: in this architecture the F9T's internal clock
is **not disciplined at all**, so divergence is the only possible outcome. Main
flagged this unprompted, and it is the same trap as the April closed-loop data
one section up, wearing different clothes.

What that column **is** good for is the second hop (experiment 3): +1.3e−08 and
7.7 µs of wander is a clean, quotable number for what an undisciplined receiver
clock does when left alone.

**The free-run OCXO curve is the characterization that did not exist before** —
flat at ~1.1–1.3e−12 from 30 s all the way to 2000 s, a clean flicker floor. That
is the honest floor to draw under the disciplined curve on any figure we publish.

**And the asterisk bit, exactly where it was predicted to.** Ours reads 1.87e−14
at 7680 s against SparkFun's "below 1 × 10⁻¹⁴ at 10 000 s" — close, but theirs is
quoted with a commercial correction service running and ours ran on our own
correction stream. Two different system numbers that look like one oscillator
number. The caution recorded above turns out to be the live issue rather than a
theoretical one.

**Settled from hardware:** the oscillator self-reports as an STP3593LF over the
console, so the part number is now confirmed by the device and not only by the
product page.

### Why the page still waits

**The crossover — the one publishable number — is not in this run.** Discipline
already wins at τ = 30 s (6.27e−13 against 1.06e−12 free-running), which means
the crossing is somewhere *below* our shortest bin and the −i 30 processing
binned it away. Both legs have 1 Hz data; main is reprocessing at `-i 1` to reach
τ = 1 s, ~52k epochs per leg, expected before 2026-08-12.

Main's recommendation, and it is right: **hold the page until that lands.** The
sentence a reader can act on — *below this averaging interval, a reference input
is worth paying for* — is precisely the sentence we cannot write yet. Everything
else in Run 1 is solid and none of it is the headline.

## Experiments that would make the page, in priority order

Each is a few days at most, and the GNSSDO+ is wired up and idle.

1. ✅ **Done — Run 1, above. The headline pair — 24 h, same antenna, split feed.** Run the GNSSDO+
   (mosaic-T on its OCXO) and a ZED-F9T from one antenna through a splitter.
   Log raw observations from both. Process both through the same correction
   stream and plot **TDEV of the receiver clock estimate vs τ** on one pair of
   axes. This is the entire page in one figure: two architectures, one sky, one
   antenna, one processing chain, one variable.
   *Bonus:* the splitter also makes it a
   [zero-baseline](/timekeeping/glossary/#baseline) experiment, so the antenna
   and feedline cancel exactly.

2. ⏳ **Reprocessing at 1 Hz. Where the curves cross.** The expected shape is that the externally clocked
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

`src/content/topics/datacenters/`, next to
[what-makes-an-accurate-timing-receiver](../src/content/topics/datacenters/what-makes-an-accurate-timing-receiver.mdx),
which sets up trait 6 and currently ends the argument with an assertion this
page would turn into a measurement.
