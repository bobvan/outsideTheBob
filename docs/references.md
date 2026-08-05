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

### The other half of the paper: what L1-only costs a common-view link

**Verified 2026-08-05**, on a second read, chasing Bob's recollection that the
paper says TMAS is single-frequency. It does, and more usefully than remembered
— the whole paper is a measured L1-vs-L1/L2 comparison:

> At all three locations, **a single-frequency common-view unit (as part of the
> TMAS network)** was either already available or was installed to provide a
> comparison for the dual-frequency prototype system.

So the deployed TMAS fleet the paper measured is L1 only, even though the current
NIST program page describes a tri-band receiver. Presumably mid-replacement;
worth re-checking before stating either as current.

The root cause of every difference below is that an L1-only receiver must
**model** the ionospheric delay, where a dual-frequency receiver forms the
ionosphere-free combination and **measures** it. Common view then cancels only
the part both ends share — so the penalty grows with baseline:

| baseline | single-frequency | dual-frequency |
|---|---|---|
| 2.4 m | lower TDEV at every τ for dual; converge after ~1 week | — |
| 78 km | — | up to **2×** better TDEV below 1 day; converge at 2–3 d |
| 5314 km | range up to **50 ns in a single day** | ~10 ns; up to **9×** better TDEV below 1 day |

Two things worth keeping straight when citing this:

1. **Averaging rescues it.** Single and dual converge after two to three days. A
   service quoting *frequency* uncertainty at one day of averaging is barely
   penalized by L1; a *time transfer* application that cares about the next hour
   is penalized heavily.
2. **The survey penalty is separate and additive.** A 24 h self-survey on a
   single-frequency receiver gets height "generally accurate within 10 m, but is
   sometimes greater than 15 m, leading to a timing error that approaches 50 ns."
   That is a position error, not an ionospheric one, and it does not average away.

**Use in:** Antennas → *Don't let the receiver survey itself* (Home, footnote).
UTC → *Choosing a GNSS timescale* (the TMAS callout). Possibly **S** from
Acquiring Time and The Datacenter Problem.

---

## 📌 Septentrio mosaic-T power table — the AtomiChron inference

**Verified 2026-08-05.** *Mosaic Hardware Manual* v1.3.0, §2.5 Power Consumption
(also §2.1–2.2 for the physical spec).
<https://media.digikey.com/pdf/Data%20Sheets/Septentrio%20PDFs/Mosaic_Hardware_Manual_v1.3.0.pdf>

- 31 × 31 mm LGA, 239 pads, **6.8 g**, single 3.3 V supply, −40 to +85 °C.
- The row matching AtomiChron exactly: **"GPS/GLONASS L1/L2 + L-band,
  PPP (1 Hz) — 760 mW, 230 mA."**
- Ceiling anywhere in the table: **1080 mW** (all signals + L-band, 100 Hz).
- Nothing in the manual about heatsinking; the module carries none.

**Why it is here:** Bob's argument that AtomiChron is *not* PPP-AR. Integer
ambiguity resolution means decorrelating and searching an integer lattice over
many satellites and frequencies, on top of a much larger filter state — real
vector floating-point work. A passively cooled module whose entire sub-watt
budget also feeds the RF chain, correlators, Ethernet, USB and SD card is not
shaped like a machine doing that.

⚠️ **The L-band data rate is Bob's figure, not a cited one.** He gives 1200 or
2400 baud; searching turned up no Septentrio or Fugro spec for the AtomiChron
channel, only a 2000 bps figure for the unrelated Japanese CLAS service as an
order-of-magnitude comparator. The page says "a couple of kilobits per second"
for that reason. If the exact number matters to an argument later, it still
needs a source.

**Use in:** UTC → *Choosing a GNSS timescale*, the "What the power budget
implies" callout. Explicitly labelled on the page as an inference rather than a
statement from Fugro.

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

📌 **Now read in the original, 2026-08-04.** Fourteen consecutive issues fetched
and parsed by `scripts/fetch-circular-t.mjs`, cached at
`src/data/circular-t-section4.json`. **Two corrections to the secondary-source
figures above.**

*The stated uncertainties are per edition and differ from the study figures.*
Circular T gives 5 ns for GPS, Galileo and BeiDou throughout the period, and for
GLONASS 7 ns rising to 10 and then 30 as its behaviour deteriorated — not the
4.1 / 3.7 / 4.1 / 6.6 above, which belong to that particular study.

*And the ranking is different.* Over 426 daily values, 2025-04-29 to 2026-06-28:

| | mean | sd | worst |
|---|---|---|---|
| GPS | +0.59 ns | 1.17 | +4.9 |
| Galileo | +0.62 ns | 1.95 | +5.0 |
| BeiDou | −0.10 ns | 1.04 | −4.8 |
| GLONASS | −6.36 ns | 9.50 | **−56.9** |

BeiDou is marginally the best on this measure and Galileo marginally the loosest
of the three good ones — so "Galileo is better for timing" is not supported *by
this metric*, though it remains true of broadcast orbit and clock accuracy, which
is a different measurement. Publication latency, measured: newest point in an
issue 8–16 days old (median 13), oldest 39–45 (median 42).

**The older secondary figures below are left for provenance.** They come from Before citing them directly, read either an actual Circular
T (the interactive HTML version exposes the sections) or:

> *Monitoring of the offset between UTC and its prediction broadcast by the
> GNSS* — <https://arxiv.org/abs/2503.02914>, and apparently also in *Metrologia*
> (<https://doi.org/10.1088/1681-7575/ad0562>). ⚠️ The arXiv ID and the DOI were
> found together in search results and may be different papers with the same
> title; confirm before citing both as one.

**Use in:** *BIPM publishes a GNSS prediction scorecard*; and Acquiring Time,
where it is evidence rather than folklore about which constellation to prefer.

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

---

## 📌 Rolling your own UTC(NIST) link — the public data exists

**Verified 2026-08-05** by fetching every file named below. Bob's question was
whether NIST publishes observations the way PTBB and BRUX do, i.e. whether the
common-view service is inseparable from the TMAS hardware bundle. It is not.

### NIST00USA is an IGS station on UTC(NIST)

Site log: <https://files.igs.org/pub/station/log/nist00usa_20260630.log>

- **SEPT POLARX5TR**, serial 3069423, fw 5.7.0, GPS+GLO+GAL+BDS+QZSS+SBAS
- Antenna NOV750.R4; IERS DOMES 49507M002
- §6.1 Frequency Standard — **EXTERNAL H-MASER, 5.0 MHz**, and the note is the
  whole answer:

  > Input signal is **UTC(NIST)**. It is generated by an Auxiliary Output
  > Generator (AOG) steered to UTC(NIST) from one of five H-masers in our
  > ensemble.

  That is exactly the PTBB/BRUX arrangement: the receiver's clock *is* the lab's
  realization of UTC, which is what makes the observations usable for time
  transfer rather than merely for geodesy.

Daily 30 s multi-GNSS RINEX, **anonymous, no login**, from BKG:
`https://igs.bkg.bund.de/root_ftp/IGS/obs/2026/216/NIST00USA_R_20262160000_01D_30S_MO.crx.gz`
(4.7 MB/day, Hatanaka-compressed). CDDIS carries it too but wants Earthdata
credentials; BKG does not.

### And the BIPM time-transfer tree, on the server we already use

Same host as *Circular T*: `webtai.bipm.org/ftp/pub/tai/data/<year>/time_transfer/`
— `raw_gps_data/`, `corrected_gps_data/`, `ppp/`, `twstft/`. Around 40 labs in
the CGGTTS tree and 60-odd in the PPP tree, `nist` among them, monthly files.

`nist2606.p3` header — a calibrated link laid open:

```
RCVR = PolaRx5TR (5.4.0)     LAB = nist      REF = UTC(NIST)
X = -1288398.600 m  Y = -4721697.050 m  Z = 4078625.450 m   FRAME = ITRF
INT DLY = 28.8 ns (GPS P1),  26.6 ns (GPS P2)     CAL_ID = 1001-2022
CAB DLY = 275.5 ns
REF DLY = 115.3 ns
```

### So what is TMAS selling? Three things, one of which is the measurement

1. **Calibration of the customer's end** — the real gate. Common view hands you
   *stability* for free; *accuracy* needs the delays known at both ends. NIST's
   side is BIPM-calibrated (CAL_ID 1001-2022). A home-built end is not, and a
   275 ns cable delay guessed instead of measured is a beautiful, stable,
   completely wrong answer.
2. **Latency** — BIPM files are monthly batches published weeks late. TMAS is a
   10-minute feed in a browser. Useless vs indispensable depending on whether the
   clock is being disciplined live or checked in arrears.
3. **The calibration report.** Traceability cannot be self-issued.

### Refines the L1-only note above

NIST's *own* reference receiver is a PolaRx5TR — multi-frequency,
multi-constellation. It is the **customer end** of the TMAS fleet that is L1
only. Which is why NIST reportedly advises TMAS customers to hire a surveyor for
the antenna elevation: on an L1-only field unit the self-survey height error
alone approaches 50 ns, and a surveyed elevation removes the one error term that
neither averaging nor common view can touch.

**Use in:** UTC → *Choosing a GNSS timescale* (the TMAS section). Possibly its
own page — "can I build my own link to UTC(NIST)?" is a good reader question and
we now have a sourced answer.

---

## 📌 Ricardo Píriz (GMV) — the F9T calibration series

**Verified 2026-08-05.** Four LinkedIn articles by Ricardo Píriz of GMV, who
calibrates mass-market timing receivers against GMV's own UTC realization
(*WANTime*, based on passive hydrogen masers). Bob supplied part 2; the series
is more useful than the one article.

| article | date | what it gives us |
|---|---|---|
| [Ublox F9T: testing in the lab](https://www.linkedin.com/pulse/f9t-testing-lab-ricardo-p%C3%ADriz/) | 2019-09-09 | the limiting-error finding, below |
| [Testing the new ublox F9T (part 2)](https://www.linkedin.com/pulse/testing-new-ublox-f9t-part-2-ricardo-p%C3%ADriz) | 2019-08-23 | **F9T internal delay = 28 ns** |
| [Ublox F9T: adding Galileo](https://www.linkedin.com/pulse/ublox-f9t-adding-galileo-ricardo-p%C3%ADriz) | — | not yet read |
| [Calibrating mass-market GNSS timing receivers](https://www.linkedin.com/pulse/calibrating-mass-market-gnss-timing-receivers-ricardo-p%C3%ADriz) | 2020-04-05 | the method, and the uncertainty floor |

### The number Bob wanted

Part 2 decomposes a measured 96 ns total against UTC, using a Keysight 53230A
TIC over 24 h:

> We had calibrated beforehand the delay of the antenna (**16 ns**) and the delay
> of the 10-meter antenna cable (**52 ns**). This leaves a delay of **28 ns** for
> the F9T device.

— "a value similar to other ublox receiver models that we have calibrated in the
past." Compare NIST's PolaRx5TR at **INT DLY 28.8 ns (P1)**: the same order, which
is a quietly encouraging thing for anyone building on an F9T.

### The method, and what it costs

The 2020 article gives the recipe. Run the receiver's 1 PPS against a reference
UTC realization on a TIC for several days while a **calibrated time-transfer
receiver** collects CGGTTS on the same antenna, then subtract:

> TIC − CGGTTS = **D**

which removes any dependence on the stability of UTC or GPS time. Results:

| receiver | calibration value | day-to-day repeatability |
|---|---|---|
| u-blox F9T | 93.9 ns | **0.3 ns** (1σ) |
| Septentrio mosaic | 77.9 ns | **0.28 ns** (1σ) |

Same antenna; the 16 ns difference is the receivers'.

### Two caveats that answer "what is still missing?"

1. **The uncertainty floor is not yours to set.** Calibration uncertainty is
   > ultimately limited by the calibration uncertainty of the co-located
   > time-transfer receiver chain, normally at the level of **1–2 ns**.

   So even a perfectly executed home calibration inherits somebody else's 1–2 ns,
   and BIPM's own campaign uncertainty is 0.9 ns. Repeatability of 0.3 ns is
   *precision*, not trueness.

2. **A calibration is per constellation and per signal combination.** Values
   "apply exclusively to specific GNSS constellations and signal combinations;
   different configurations require recalibration." There is no such thing as
   "the F9T delay" — only the F9T delay for GPS L1/L2 P3, or for E1/E5a.

Also worth carrying: part 1 moved the F9T from an office with a low-cost Harxon
antenna to a temperature-stabilized server room with a Leica AR20, and found

> the results are very similar… This seems to indicate that the F9T timing
> accuracy is limited by GNSS orbit and clock errors and by the **local multipath
> error**, and not by thermal stability or antenna quality.

Which is a useful corrective to the instinct that a better antenna is the next
upgrade.

**Use in:** UTC → *Can I build my own link to UTC(NIST)?*; Antennas →
*feedline*. Part 3 (Galileo) still unread.

---

## 📌 US IGS stations with atomic frequency standards

**Verified 2026-08-05** by fetching all 72 `*00USA` IGS site logs and parsing
§6.1. Distances are from a generic Chicago reference point, for baseline
shortlisting only.

| station | km | standard | referenced to |
|---|---|---|---|
| NLIB00USA | 327 | H-maser | *no note* — free-running VLBA maser |
| MRC100USA | 948 | H-maser | *no note* — NRL Midway Research Center |
| USN700USA / USN800USA / USN900USA | 952 | H-maser | **USNO Master Clock MC2, "the primary realization of UTC(USNO)"** |
| WDC500USA / WDC600USA | 952 | H-maser | USNO MC2 |
| GODE00USA | 967 | H-maser | Goddard GGAO |
| WES200USA | 1329 | H-maser | Westford |
| AMC400USA | 1470 | H-maser | **USNO Alternate Master Clock #1, backup UTC(USNO)** |
| NIST00USA | 1493 | H-maser | **UTC(NIST)** |
| PIE100USA | 1975 | H-maser | Pie Town VLBA |
| BREW00USA | 2593 | H-maser | Brewster VLBA |
| GOLD/GOL200USA | 2626 | H-maser | Goldstone |
| JPLM00USA | 2791 | rubidium | JPL Mesa |
| STFU00USA | 2978 | rubidium | Stanford |
| EIL300USA / EIL400USA | 4457 | cesium (HP 5071A) | Alaska NGA |
| MKEA / KOKB / KOKV | 6741–6932 | H-maser | Hawaii |

**The distinction that matters:** a station with an H-maser and *no note* has a
free-running maser. Superb short-term stability, no defined relationship to any
UTC(k) — useful for testing a method or characterizing stability, useless for
anchoring a claim. Only NIST, the USN\* group, WDC5/6 and AMC4 name a
realization.

⚠️ Site logs are a snapshot; equipment sections carry effective dates and
several of these stations have changed standards over time. Re-read §6.1 before
relying on any row.

**Use in:** UTC → *Can I build my own link to UTC(NIST)?* (a shorter-baseline
sidebar), and the PePPAR-Fix dayplan item I-114801-blog.
