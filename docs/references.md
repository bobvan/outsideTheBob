# References

Sources worth citing, and where they are used. **Status: draft, not published** —
`docs/` is invisible to the Astro build.

Keep this honest. A reference listed here has been **read and verified to say
what we claim it says**, or it is marked otherwise. Anything unverified is
flagged rather than quietly cited.

| Status | Means |
|---|---|
| ✅ **used** | Cited in published content |
| 📌 **pending** | Verified, not yet cited anywhere |
| ⚠️ **unverified** | We believe it exists but have not confirmed the claim |

---

## 📌 Montare, Novick & Sherman (NIST, 2024)

**Evaluating Common-View Time Transfer Using a Low-Cost Dual-Frequency GNSS
Receiver.** Aidan A. Montare, Andrew N. Novick, Jeff A. Sherman, Time and
Frequency Division, National Institute of Standards and Technology.
<https://tf.nist.gov/general/pdf/3280.pdf> — 9 pp., PDF dated 2024-02-05.

**Verified 2026-07-27.** Read in full. This is the paper behind the
receiver-self-survey page, and it says what Bob remembered.

Why they wanted 30 cm:

> Accurately determining antenna position is important for a common-view system,
> as errors in position translate into timing errors. Due to the geometry of the
> problem, vertical (height) positioning errors are the most detrimental to
> timing performance. Since each meter of vertical error corresponds to up to
> 3.3 ns of timing error, we desired a height accuracy of 30 cm or less for our
> system.

That they evaluated the built-in survey specifically:

> The receiver under study features a built-in configurable survey mode that
> produces a weighted-average position, after which the receiver fixes its
> position estimate and uses GNSS signals for a timing-only solution; **it was
> this method that we evaluated.**

The finding:

> In the multiple cold-start surveys performed, the receiver reliably gets within
> 2 m of the PPP solution after about 6 h, and within 1 m after 18 h. The final
> results of these surveys have a total dispersion of about 0.5 m… The maximum
> excursions in the first few minutes of surveying were up to 18 m.

> **The final results are biased high relative to the PPP solution, the cause of
> which has not yet been identified and thus do not meet the ±30 cm accuracy
> goal stated earlier.** However, the dual-frequency receiver is clearly superior
> to a single frequency receiver in height determination. **For users desiring
> greater position accuracy, a PPP solution can be computed after the fact.**

Three things worth drawing out on the page:

1. **The bias is directional** — *biased high*, not scattered. So it is not
   noise, and no amount of survey time removes it. Their 24 h runs converge
   nicely and converge to the wrong answer.
2. **NIST could not explain it either** — "the cause of which has not yet been
   identified". Bob seeing the same effect independently in his lab is
   corroboration of an *unexplained* result, which is more interesting than
   confirming a known one, and is genuinely publishable observation.
3. **Their recommendation is ours** — compute a PPP solution after the fact and
   configure it. Same configure-don't-guess conclusion the datacenter section
   reaches about feedline delay.

Also useful: their reference and PPP solutions agreed to **2.4 cm**, so the
yardstick was sound; and the 3.3 ns/m figure is 1/*c*, i.e. the same worst-case
bound *The Last Nanoseconds to UTC* arrives at from the other direction.

**Use in:** Antennas → *Don't let the receiver survey itself* (Home, footnote).
Possibly **S** from Acquiring Time and The Datacenter Problem.

---

## 📌 Circular T Section 4 — UTC vs the GNSS broadcast prediction

**Found 2026-08-04, partially verified.** BIPM *Circular T* carries a **Section 4**
giving [UTC − bUTC_GNSS]: the difference between UTC as computed by the BIPM and
the **prediction of UTC broadcast by the satellites**, for GPS, GLONASS, Galileo
and BeiDou, **daily** for every day of the monthly reporting period. Derived from
a robust combination of four multi-GNSS calibrated receivers in group-G1 UTC
laboratories.

Figures reported for a July 2022 – January 2023 study period:

| Constellation | [UTC − bUTC] | stated uncertainty |
|---|---|---|
| GPS | −5 to +5 ns | 4.1 ns |
| Galileo | −5 to +5 ns | 3.7 ns |
| BeiDou | 5 to 20 ns | 4.1 ns |
| GLONASS | 30 to 50 ns | 6.6 ns |

**Why this matters to the garden.** It converts "GNSS time is a prediction of
UTC" from a philosophical claim into one with a published track record, per
constellation, updated monthly. It is the bridge between the slow BIPM loop and
the fast correction loop — the slow loop cannot correct anything in real time,
but it *calibrates the prior*.

⚠️ **Three caveats to carry into any prose.**

1. **The measurement floor is close to the signal.** For GPS and Galileo the
   uncertainty (≈4 ns) is comparable to the offset (±5 ns), so Circular T bounds
   those constellations without resolving them. The bound is sharpest where the
   error is largest, which is the opposite of convenient.
2. **It bounds the constellation-to-UTC term only** — the common-mode offset all
   users of that constellation share. Antenna position, feedline, receiver and
   multipath are not in it.
3. **It measures the *broadcast* prediction.** A receiver using HAS or SSR
   corrections is not on that path, so this does not bound it.

**Not yet read in the original.** The numbers above come from secondary sources
describing Section 4. Before citing them directly, read either an actual Circular
T (the interactive HTML version exposes the sections) or:

> *Monitoring of the offset between UTC and its prediction broadcast by the
> GNSS* — <https://arxiv.org/abs/2503.02914>, and apparently also in *Metrologia*
> (<https://doi.org/10.1088/1681-7575/ad0562>). ⚠️ The arXiv ID and the DOI were
> found together in search results and may be different papers with the same
> title; confirm before citing both as one.

**Use in:** What Is UTC → a new page on what the slow loop is good for; and
Acquiring Time, where it is evidence rather than folklore for preferring Galileo.

---

## ❌ Lombardi (NIST) — position error and timing — DROPPED

Cited within the Montare paper for the single-frequency comparison: height
determination generally within 10 m, sometimes worse than 15 m, "leading to a
timing error that approaches 50 ns".

**Dropped 2026-08-03, by Bob.** Hunted and not verifiable without paid access.
The 2016 citation is confirmed as Lombardi, M., *Evaluating the Frequency and
Time Uncertainty of GPS Disciplined Oscillators and Clocks*, Measure: The
Journal of Measurement Science — but that abstract mentions neither height nor
survey periods, so the figure is either in the body or in the 2014 paper. NCSLI
Measure is paywalled; NIST's page carries no PDF.

**Kept here, deliberately, as a tombstone.** The number is easy to re-find in
Montare's bibliography and looks citable. It is not. If it comes back, it comes
back with someone having read the original.

---

## 📌 Ackermann (N8UR, 2020)

**Timing and Location Performance of Recent u-blox GNSS Receiver Modules.**
John Ackermann N8UR, TAPR Digital Communications Conference, August 2020.
<https://hamsci.org/sites/default/files/publications/2020_TAPR_DCC/N8UR_GPS_Evaluation_August2020.pdf>

⚠️ Not yet read. Surfaced while hunting the NIST paper. Directly on u-blox timing
*and location* performance, and Ackermann is already credited in the
sub-nanosecond talk for the time-interval counter and divider, so citing his
measurement work is natural.

**Use in:** Antennas, and possibly *Choosing a receiver* on the someday list.

---

## 📌 NIST — self-survey altitude error in practice

A documented case of a 23.2 m altitude error from antenna self-survey producing
a **−57.62 ns** mean offset against UTC(NIST). Surfaced in search; **source not
yet pinned down** — likely one of the NIST remote-calibration papers
(<https://tf.nist.gov/general/pdf/1824.pdf> or
<https://tf.nist.gov/general/pdf/3167.pdf>). Verify before use.

**Use in:** Antennas → *Don't let the receiver survey itself*, as the vivid
worked number.

---

## 📌 Serrano — a history of White Rabbit

**White Rabbit history, by Javier Serrano.** Written 25 January 2024, covering
mid-2007 to end-2023. <https://www.white-rabbit.tech/wr-history-by-javier/>

**Verified 2026-07-27.**

Milestones worth having: first meeting on renovating CERN's accelerator timing
in **July 2007**; first workshop introducing PTP plus Synchronous Ethernet in
February 2008; a working fibre-link demonstrator by October 2008; Spanish
government funding for commercial switch development in 2009–2010; the WR High
Accuracy profile folded into **IEEE 1588-2019**; and the White Rabbit
Collaboration formally established in 2023.

⚠️ **One correction to Bob's recollection.** OPERA did not kick off White
Rabbit — WR was already four years old by 2011, and its original target was only
*"around 1 μs"*, which the account says proved insufficient. What OPERA did was
create pressure to **deploy** it: there was, per Serrano, *"a lot of pressure to
deploy WR in parallel with the OPERA timing system in Gran Sasso"* so the
timing could be independently verified. That became **White Rabbit's first
operational deployment, in 2011**.

So the accurate version is better than the remembered one. OPERA did not inspire
White Rabbit; it put an unproven project into production under pressure, because
suddenly nobody trusted a timing chain that nothing else could check. That is a
sharper argument for independent verification than "it motivated the work".

**Use in:** Transferring Time → White Rabbit (Home), and *Stories* → OPERA.

---

## 📌 The OPERA timing fault

**Verified 2026-07-27** against the encyclopaedic account and contemporary press.

- **23 September 2011** — OPERA reports neutrinos arriving from CERN at Gran
  Sasso about **60.7 ns earlier** than light would.
- **February 2012** — two hardware faults found in the timing chain.
- **12 July 2012** — final result **6.5 ± 15 ns**, consistent with the speed of
  light.

**Two faults, pulling in opposite directions** — which is the detail that makes
the story worth telling:

| Fault | Magnitude | Effect |
|---|---|---|
| Fibre from the GPS receiver to the OPERA master clock not fully seated, increasing delay through the fibre | **73 ns** | Made neutrinos appear **faster** |
| Clock on an electronic board ticking above its nominal 10 MHz | partially offsetting | Made neutrinos appear **slower** |

The two partially cancelled, leaving the ~60 ns anomaly. So the headline number
was never one error — it was the residue of two, and the smaller one was busy
hiding some of the larger.

⚠️ **Bob's mechanism is not in the popular accounts.** In the T1 Q&A he
described the loose connector producing low light levels on an analogue signal,
whose rise time then shifted the apparent phase. That is a physical explanation
of *why* a loose connector changes apparent delay, and it is consistent with the
reported effect — but the press coverage says only "loose cable, 73 ns". Before
publishing the mechanism, source it from the OPERA collaboration's own account
rather than from recollection.

Press: [Live Science](https://www.livescience.com/18603-error-faster-light-neutrinos.html) ·
[Space.com](https://www.space.com/14654-error-faster-light-neutrinos.html) ·
[Wikipedia](https://en.wikipedia.org/wiki/2011_OPERA_faster-than-light_neutrino_anomaly).
Bob also has **two screenshots from CERN press releases** in the *Last
Nanoseconds* deck — the announcement and the retraction — which are better
primary illustration than any of the above.

**Use in:** *Stories* → OPERA, feeding Transferring Time.

---

## ✅ Already cited in published posts

- **BIPM Circular T** — <https://webtai.bipm.org/ftp/pub/tai/Circular-T/cirt/cirt.454>
  for `sigma_GPS`. In *The Last Nanoseconds to UTC*.
- **NIST, UTC(NIST) introduction** —
  <https://www.nist.gov/pml/time-and-frequency-division/time-realization/utcnist-time-scale-0/introduction-utcnist>
  for UTC as a virtual timescale computed after the fact. In *The Last
  Nanoseconds to UTC*.
- **Galileo HAS** —
  <https://www.gsc-europa.eu/galileo/services/galileo-high-accuracy-service-has>.
  In *The Last Nanoseconds to UTC*.
- **Fugro AtomiChron** —
  <https://www.fugro.com/expertise/satellite-positioning/atomichron>.
  In *The Last Nanoseconds to UTC*.
- **Ole Petter Rønningen, the first PPP GPSDO** —
  <https://www.efos3.com/GPSDO/GPSDO.html>. In *Sub-Nanosecond at Home*.

---

## Wanted

Sources we need and do not have:

- **Regulatory clock-sync requirements** for the *A means to an end* page —
  the specific regimes, so a reader can find their own obligation.
- **Message-volume figures** for *The scale of it* — trillions of market data
  messages per day, orders per day, ideally citable.
- **OPERA collaboration's own technical account** — to source the *mechanism*
  by which a loose connector shifted apparent delay, which the press coverage
  does not explain. See the OPERA entry above.
