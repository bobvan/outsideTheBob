# Topics In Timekeeping — structure draft

**Status: draft, not published.** Lives in `docs/` at the repo root. Astro builds
only `src/pages/` and declared collections, so nothing here reaches the site.

Collection title **Topics In Timekeeping**, nav label **Timekeeping**.

## Audience — settled 2026-07-26

> Bob: *I want to talk about the timekeeping problems shared by everyone working
> inside datacenters. I want search engines to bring traffic with questions about
> timekeeping in datacenters. But my first hand experience working inside data
> centers was with electronic trading applications. My voice will be coming from
> a trading point of view, but I want to reach the more general datacenter
> audience.*

So: **general subject, trading voice.** Topic titles and headings name the
datacenter problem, because that is what gets searched. The examples, the war
stories and the authority come from trading. Closes old question 1 — the entry
topic is **Timekeeping in Datacenters**, not "…for Traders".

## What this is

Narrow, cross-linked **reference material**, kept out of the blog RSS feed.
Written in bursts, then left to sit. See **Feeds**.

The talks themselves argue for this garden existing:

> Bob, dress rehearsal 1: *You don't want to watch someone read a slide. At
> least I don't. I'm happy to read a document at my speed, I'm happy to listen to
> a presentation at the presenter's speed.*

The garden is the document read at the reader's speed. The slides were never
meant to carry this.

## Rules

1. **Small pages.** One idea each.
2. **No topic runs more than a few pages.**
3. **Heavy linking.** Anywhere to what you needed in one hop.
4. **Be the 11th page on the web for a topic, not the 1001st.**
5. **Every topic is a valid entry point.** No forced order.

## Coverage notation

| Mark | Level | Means |
|---|---|---|
| **H** | Home | Full coverage. Exactly one per concept. |
| **S** | Summary | A paragraph, then a link to the Home. |
| **M** | Mention | The defining words are a link. |

---

## Sources

Two Zoom dress rehearsals, transcribed. Roughly 20 minutes of talk and an hour
of question-and-answer each, and the Q&A is where the unsaid things surface.

- **T1** — *The Last Nanoseconds to UTC*, autumn 2025. Talk 00:07–00:28, Q&A to 01:30.
- **T2** — *Sub-Nanosecond at Home*, July 2026. Talk 00:00–00:35, Q&A to 01:04.
- **L1** — LinkedIn exchange, 2026-08-01. A reader asked whether you can simply
  average a GNSS position over a couple of days, and what that costs in clock
  accuracy. Bob's answer is the clearest statement of the averaging-versus-bias
  argument we have, and the questioner's follow-up added the coax velocity-factor
  point. Same attribution rule as the rehearsals: **use the substance, not the
  name**, unless Bob clears it with them.

> ⚠️ **Attribution.** Both rehearsals had named colleagues on the call who asked
> sharp questions. Their words were given to a private review session, not for
> publication. **Use the substance, never the names**, unless Bob clears it with
> them individually. Where a question shaped a page, phrase it as "a reviewer
> asked" or simply answer it without staging the exchange.

---

## The structural split

> Bob: *I want to separate time acquisition from time transfer, or as most time
> users in datacenters would think of it: time distribution or clock sync.*

T1 already had the diagram that makes this concrete — the compensated and
uncompensated regions:

> T1: *In this yellow box, the delay in the network is compensated for by the
> transport protocol, so NTP or PTP will subtract out that delay, so time is seen
> as the same everywhere throughout this yellow area. However, this red area
> shows where delay is **not** compensated for. Pulse per second and the antenna
> feed line are the key variables there.*

That is the whole argument for the split in one paragraph, and it should open
**Transferring Time**.

## Images to be used

* It's all about the corrections. Doesn't exist yet. Realtime focus, but mention post-processing too. A continuum from broadcast to HAS to single-AC realtime.
* Years since Victoria's reign
* Old tyme surveyor
* Archery targets
* Mean and standard deviation around UTC
* Sawtooth
* Satellite laser ranging
* Evil GNSS clock
* UTC Distribution Accuracy
* Chain of UTC offset errors: AntPos, AntCalib, feedline, RX delay, PPS delay
* Log-log blobs
* Table contrasting SPP, RTK, and PPP & PPP-AR

## Glossary terms

* Timescale
* Accuracy
* Precision
* Stability
* Holdover
* Survey
* Repeatability
* RTK
* SPP
* PPP
* PPP-AR
* Traceability
* Bias
* Measurement error
* Measurement noise
* Sawtooth error
* ADEV, TDEV, MTIE
* Measuring form lastNs2Utc
* APC, ARP, PCO

## Possible sections

* Antennas
* GNSS
* Time Measurement
* Trading

## File me somewhere

* GNSS signal structure
  * PR
  * Carrier

* GNSS constellations and bands

* Project PePPAR-Fix

* GNSS support infrastrucutre
  * XXX

* Timkeeping basics
  * Contrast fast/slow clocks with ahead/behind clocks
  * Contrast step/slew adjustments with phase/frequency
  * Contrast disciplined with freerun and error logging
  * Contrast short-term stability with long-term stability
  * Contrast molecular clocks with atomic clocks

* Position survey accuracy limits

* Timekeeping myths
  * Master clocks are in space
  * Some atomic clocks are so accurate they never need adjustment
    * You just count cycles of some atomic resonance and you're done

* GPSDO basics
  * Components
  * Architecture

* Best practices

* Ionospheric/tropospheric compensation

* Antenna feedlines
  * Sat signals combine at APC
  * Feedline doesn't change signal mixing position
  * Feedline adds delay from UTC

* GNSS clock benchmarking
  * Good images in lastNs2Utc

* Time acquisiton vs time distribution (AKA clock sync or time transfer)
  * Length compensated
  * Uncompensated

* Ways a clock can be wrong

* Two-clock agreement CDF

* Contrast GNSS receiver types
  * Positioning
  * RTK positioning
  * Timing
  * Automotive
  * Geodetic
  * PPS IN vs PPS OUT

* GNSS processing techniques
  * SPP
  * RTK
  * PPP
  * PPP-AR
  * Tradeoffs in observatoin time and precision

* Timelab equipment
  * TIC
  * Frequency standard
  * Distribution amplifier
  * Geodetic GNSS receiver
  * Calibrated antenna
  * Wide sky view with low multipath

* Related but distinct and not covered
  * Host timestamping
  * Slave following master
  * Holdover
  * Elapsed time
  * MiFID 2 compliance

* Spoofing, jaming, meaconing
  * Calling BS on your GM

* Feasibility of Sub-ns UTC Sync
  * Literally no
  * Practically yes

* Accuracy and precision challenges
  * Quantization with digital clocks at reasonable speeds
  * Oscillator stability

* GNSS infrastructure
  * BIPM
  * National labs (MRIs)
  * Stable clocks
  * Observation stations
  * Analysis centers
  * Constellations

* Sources of GNSS UTC error
  * Antenna position error
  * Feedline length error
  * Receiver clock drift
  * Ionosphere
  * Troposphere
  * Coarse corrections

* Matching time acquisition and distribution
  * Comparison table
  * Order of magnitude difference
  * Maybe Secaucus aerial photo
  

---

## The hierarchy

### Level definition

- timekeeping
  - section
    - page
      - point

### 1. Timekeeping in Datacenters

*Entry point. Mostly S and M.*

- **A means to an end** — **H**. Nobody wants precise time; they want something
  that requires it. Often regulatory. *(Question 2.)*
- **No second chance** — **H**. A trade happens once; the timestamp is taken
  once. Contrast with the archer below, who gets ten arrows.
- **The scale of it** — **H**. T1: *trillions of timestamps per day*. Numbers
  still needed. *(Question 4.)*
- **How big is a nanosecond?** — **H**. **New.** T1 spent real effort making the
  units physical, and it is the most reusable thing in either talk.
  - 1 ns ≈ 30 cm ≈ a foot. 1 ps ≈ 0.3 mm. So 30 ps ≈ 9 mm ≈ a little finger's
    width.
  - **You were right and the objection was wrong.** A reviewer challenged the
    picosecond scale, but was converting 1 ps, not 30 ps. 30 × 0.3 mm = 9 mm.
    Worth stating carefully on the page precisely because it tripped a room full
    of experts.
  - T1: *we do lose a little bit of precision when we get to a half-mile campus
    like this one in New Jersey — maybe only within 200 picoseconds over a
    half-mile campus. But that's two orders of magnitude better than the accuracy
    of our clocks.*
- **Timestamps are taken against a timescale** — **H**.
  - Tick length, 0th tick, count of ticks since.
  - **Example timescales** — UTC **M**, TAI **M**, *years since Victoria's reign*
    (`public/images/victorian-timescale.png`) — absurd, valid, and unfamiliar
    enough that nobody skates past the definition.
  - **S** to *UTC(k) and who defines yesterday*. Home in **What Is UTC**.
- **Elapsed time** — **H**.
  - Needs no timescale — a tick length and a counter.
  - Bob's example: *a trader measures 2.5 µs between a market data tick and an
    order going out. A 1 ppm frequency error contributes 2.5 ps.*
  - The corollary is where it stops being true. *(Question 5.)*
- **Realtime versus after-the-fact** — **H**. T2: *figuring out where you are in
  real time is always harder than taking measurements from all over the earth,
  taking two weeks to put them together, and then saying where you were two weeks
  ago.*
- **What this is not about** — **S**. T1 scoped out host timing, GNSS holdover,
  and spoofing/jamming. Saying so up front is a service; each could be a topic
  later.
- **Best practices** — **H**.

### 2. Acquiring Time

- **How long you watch the sky** — **H**. The accuracy ladder. Home for the blobs
  figure. T2 gives the table in words: SPP is one receiver, anywhere, seconds,
  metres. RTK adds a base within ~10 km for centimetres. PPP uses *your antenna
  plus hundreds of other antennas worldwide, and together we're figuring out what
  time it is* — slower, sub-centimetre.
- **The master clocks are on Earth** — **H**. **New, and the best idea in T2.**
  > *There's 120-some atomic clocks circling the Earth. How would you synchronise
  > clocks you can't touch? The surprising answer is you don't even try. You get
  > them started at about the same time, let them drift, measure the error
  > against good clocks on Earth, predict what the future error will be, and
  > broadcast that error through the satellites.*

  One Galileo satellite runs 5 ms off. The satellites are a broadcast mechanism,
  not a clock. This reframes everything downstream and belongs early.
- **Sizes you can hold** — **H**. **New.** T2's tactile ladder: pseudorange gets
  you a beach ball (~1 m), carrier phase a softball, more processing a ping-pong
  ball, and the limit is *a green pea* — sub-centimetre. Pairs with the blobs
  figure; one is precise, the other is felt.
- **Same signals, better answers** — **H**. T2's equation: *better corrections
  and better models and more code and a little patience → three orders of
  magnitude more precision.*
- **The monitoring network** — **H**. **New.** ~800 stations feeding analysis
  centres, about one in eight with an atomic clock. Barrow, Alaska as the
  picturesque example — and the payoff: *that station moved south about 15
  centimetres in 7 years… the clock would be off by 500 picoseconds if you
  weren't correcting for the fact that the position has moved.* This is the
  cleanest possible motivation for datum offsets.
- **Why below 15 ns is hard** — **H**, then one page per effect. T2's own summary
  is the framing: *below 15 nanos in real time you can ignore a lot of these
  errors because they average out to zero over 24 hours.* Above that line they
  stop averaging out.
  - **Sawtooth jitter** — **H**. 8 ns peak-to-peak on PPS; compensating gets
    below 200 ps second-to-second. And the story that makes it stick:
    > T2: *over the course of eight minutes the sawtooth pattern went one way and
    > then started going down… Probably because I switched on the aircon.
    > The lesson learned is that when you compare GPS time to quartz time, you've
    > built a very expensive thermometer.*
  - **Constellations don't agree** — **H**. ~5 ns spread over 24 h; Galileo
    tracks GPS closely, GLONASS peaks 7.6 ns. Individual satellite clocks worse —
    some GLONASS 40 ns in a day.
  - **Zenith tropospheric delay** — **H**. Up to 2 ns. Bob is candid that he
    *still doesn't have a good feel for it*, which is worth keeping — it tells a
    reader which parts are genuinely hard.
  - **Orbit prediction versus reality** — **H**. Predicted orbits corrected by
    observation, including satellite laser ranging. T1 adds the detail that
    delights: they correct for the offset between a satellite's centre of mass
    and its antenna phase centre, per satellite type.
  - **Solid-Earth tides** — **H**. 1.1 ns/day if uncorrected. T2's framing:
    *the ground underneath my house is moving up and down by about a foot a day.*
  - **Multipath** — **H**. **New, from Q&A.** Urban environments wreck results;
    mitigations include elevation and signal-strength masks. Bob's counterpoint
    is the datacenter-specific one worth keeping: NY4 is *the size of 4 football
    fields*, in a swamp, sky visible to the horizon.
  - **Dual frequency** — **H**. **New, and Bob flagged it as omitted.** In Q&A:
    *the only way to get the performance numbers I showed was to choose one
    constellation and use dual frequency. I didn't mention either of those
    facts.* Enables ionospheric correction. This was the single largest hole in
    T1 and the garden should close it.
- **GPSDOs** — **H**. What disciplining means; **PePPAR-Fix as the example**.
  - Terminology, from T2 and too good to paraphrase: *deviation measures how an
    unstable clock ticks irregularly… disciplining that clock is the process of
    pushing those ticks back into a perfectly stable pattern where every tick is
    exactly one second long.*
  - TCXO is not enough; OCXO required.
  - Inside: a position Kalman filter (~70 states) feeding a time Kalman filter
    (4 states — frequency and phase of each of two oscillators), closed by an LQR
    controller with separate short- and long-term paths.
  - Parts under $1000.
  - Results framing: *these plots you're going to hate if you're a business guy,
    because down and to the right is good.*
- **How often should you correct?** — **H**. **New. The Goldilocks interval.**
  A hidden slide in T2, never spoken aloud. Sources:
  `PePPAR-Fix/docs/goldilocks-update-rate-review-2026-06-15.md` and the figure
  `PePPAR-Fix/data/goldilocks_cadence.png`.

  The shape of the idea, which is a genuinely satisfying one:

  - Every correction **injects** the actuator's quantisation noise σ_q. Correct
    more often and you inject more often — that contribution falls as σ_q/√τ.
  - Between corrections the oscillator **coasts** and wanders freely — that
    contribution grows as σ_DO(1 s)·√τ.
  - One curve falls, the other rises, and the total is the root-sum-square.
    **There is a minimum, and it is not at either end.** Correct too often and
    quantisation noise dominates; too rarely and free-running drift does.

  The counterintuitive payoff: **more often is not better.** On the lab OCXO,
  1 Hz correction was *worse* than coasting, because the actuator's own noise
  exceeded what the drift would have cost.

  τ\* depends entirely on the actuator's resolution, and the figure's two panels
  make that vivid:

  | Plant | σ_q | σ_DO(1 s) | τ\* |
  |---|---|---|---|
  | OCXO + 16-bit DAC | ≈18 ps | ≈18 ps | **≈1 s** — knee sits in the operating range |
  | TCXO + PHC `adjfine` | ≈15 fs | ≈1.17 ns | **≈13 µs** — knee far below; coast never wins, so fire as fast as data arrives |

  Six orders of magnitude of actuator resolution move the answer from "coast
  between corrections" to "correct as fast as you can". Same control problem,
  opposite conclusion, and the deciding parameter is one most people never
  think about.

  **The distinction that unlocks it** — and the reason the question is confusing
  before you see it — is that *update rate* bundles two independent levers:

  - **Observation rate** — how often you *estimate*. More is better, and it
    costs nothing at the actuator.
  - **Actuation rate** — how often you *correct*. Each one injects σ_q.

  Goldilocks is only ever about the second. This generalises well beyond
  GPSDOs, to any control loop whose actuator is noisy — which is a good reason
  to give it a page rather than bury it in a GPSDO footnote.

  **Keep the honesty.** The review is candid that σ_q was assumed from the
  datasheet LSB rather than measured, and that if σ_q scales with correction
  *size* the whole breakeven model changes sign. It also notes the model ignores
  how a faster loop tracks more reference noise into the oscillator. Publishing
  the open questions alongside the result is the whole difference between the
  11th page and the 1001st.
- **Sources other than GNSS** — **S**.

### 3. Antennas

*Bob: "I want one or more antenna pages… antennas are a critical, and often
under-appreciated part of precision timekeeping."*

- **Why the antenna is not an accessory** — **H**.
- **Choosing one** — **H**. UFO patch antennas versus choke rings, and what the
  difference buys.
- **Surveying its position precisely** — **H**. T2's pencil-eraser scale: east-west
  known to about the width of a pencil eraser, north-south better, up-down about
  one and a half. *Up and down is the harder way to get a precise position.*
- **Don't let the receiver survey itself** — **H**. **New, and probably the most
  practically useful page in the topic**, because the trap is built into the
  product and looks like a feature.

  Timing receivers offer to "survey in" their own position: leave it running,
  and it averages a fix and adopts the answer. It is genuinely convenient, and
  for most timing work it is fine. **It is not good enough for sub-nanosecond
  work**, and the reason is a mismatch of purpose — these are modules built to
  deliver excellent *time*, and resolving *position* to the precision that
  sub-nanosecond timing needs is simply not what they are for.

  The consequence is a **static position bias** that no amount of averaging
  removes, because it is not noise. Cross-link to the datacenter post's bound:
  a foot of position error is worth up to about a nanosecond, and vertical error
  is the direction that couples hardest.

  **Open the page with the averaging argument (L1), because it is the question
  people actually arrive with** — *can I just average for a couple of days?*

  > L1: *Averaging removes random errors, but not bias. If half your position
  > fixes are 30 cm too far east and the other half are too far west, that
  > averages out. But if all your position fixes are 1 m too far north, that
  > never goes away with averaging.*

  That is the whole idea in three sentences and it needs no arithmetic to follow.
  The arithmetic then answers the second half of the question — *what does it
  cost in clock accuracy?* — and the conversion is the spine of the page:
  **light moves about 30 cm per nanosecond**, so a position error and a time
  error are the same error in different units. That is *why* NIST's goal is
  30 cm: 30 cm **is** a nanosecond. Their 3.3 ns/m is the same constant lying on
  its side.

  Which gives the reader a decision rule rather than a warning (L1):

  - **Position to a few metres, time to ±15 ns** → averaging is fine, given a
    good antenna and a good sky view. (And note the two halves agree: 15 ns of
    vertical error *is* about 4.5 m. Same statement twice.)
  - **Position to a few centimetres, sub-nanosecond time** → receiver bias
    defeats you, and no amount of patience fixes it.

  **The diagnostic is the best thing in the L1 answer and belongs on the page as
  the thing a reader can go and do:**

  > L1: *If you just start the averaging process over again every 24 hours for
  > 14 days, you get 14 different averages, instead of converging on the same
  > answer 14 times.*

  That is how you tell noise from bias *with the equipment you already own* — no
  reference receiver, no PPP service, no survey. Restart it and see whether the
  answers pile up in one place or wander. It converts the page from "trust NIST"
  into "here is an experiment," which is the whole ethos of the topic.

  ⚠️ **One correction to carry into the prose.** L1 describes the NIST work as
  studying *"high-quality timing receivers."* The paper's own title is
  *Evaluating Common-View Time Transfer Using a **Low-Cost** Dual-Frequency GNSS
  Receiver*, and the unit is the ZED-F9T. Anyone who follows the link will notice.
  Say *a low-cost dual-frequency timing receiver* — which is also the stronger
  framing, because the point is that this trap ships in the receivers people
  actually deploy, not in exotic ones.

  Two pieces of evidence:

  - **NIST measured exactly this**, on exactly this receiver, and published it.
    Montare, Novick & Sherman, *Evaluating Common-View Time Transfer Using a
    Low-Cost Dual-Frequency GNSS Receiver* (NIST, 2024) — they wanted height to
    30 cm, evaluated the ZED-F9T's own built-in survey mode, and found the
    results *"biased high relative to the PPP solution, the cause of which has
    not yet been identified and thus do not meet the ±30 cm accuracy goal."*
    Full quotes and the citation are in `docs/references.md`.
  - **Bob's own lab measurements of F9T position bias** show the same effect.
    First-hand and unpublished.

  Three details make this a better page than "the survey isn't accurate enough":

  1. **The bias is directional** — biased *high*, not scattered. Their 24-hour
     surveys converge tidily, and converge to the wrong answer. Averaging longer
     does not help, which is exactly the trap.
  2. **NIST could not explain it either.** The cause "has not yet been
     identified." Bob independently reproducing an *unexplained* result is
     stronger than confirming a known one, and is worth publishing as such.
  3. **Their fix is the same as ours** — compute a PPP solution afterwards and
     configure it in.

  **The practical takeaway the page exists for:** survey the antenna properly,
  by post-processing or a professional survey, and *configure* the result into
  the receiver. Do not accept the receiver's own answer. This is the same
  configure-don't-guess point the datacenter section makes about feedline delay,
  which is worth linking rather than repeating.
- **The phase centre is not the antenna** — **H**. **New and important.** The
  surveyed point sits about 5 cm up **inside** the antenna, higher in a choke
  ring. So an antenna far larger than a pencil eraser is located to a pencil
  eraser — of a point you cannot see. Plus antenna calibration: patterns
  measured by *a robot on a building in Germany* moving the antenna while the
  satellites appear to stand still.
- **Your feed line is likely your largest source of error** — **H**. **New, promoted out of *Siting,
  cabling, multipath* on the strength of L1**, where Bob makes a claim big enough
  to carry a page on its own:

  > L1: *I'd bet the largest source of bias in typical data center applications
  > is incorrect compensation for antenna feed line length. Unless you've measured
  > it with a TDR or have coax with length markings on the jacket, it's really hard
  > to get that right.*

  If that bet is right — and the arithmetic below says it is — then the ordering
  of this whole topic is counter-intuitive and worth saying out loud: people
  agonise over a receiver survey that is wrong by tens of centimetres while
  a feed line quietly costs them **tens of nanoseconds**. The survey page argues
  over a nanosecond. This one is two orders of magnitude bigger, and it is almost
  never checked.

  The questioner's reply added the second half, and it is the better half:

  > L1 (questioner): *Almost all coax is marked, but nobody checks it. Coax types
  > also differ in propagation velocity, not allowed for either.*

  So there are **two independent errors that compound**, and the page should
  separate them cleanly because the fixes differ:

  1. **Wrong length.** The markings are usually right there on the jacket. The
     failure is not that the information is unavailable, it is that nobody walks
     the cable. That is a much better story than "measure your coax" — the data
     was printed on the thing the whole time.
  2. **Wrong velocity factor.** Worse, because it is silent. Nothing on the
     install tells you the assumption was wrong, and a plausible default is
     plausibly wrong.

  Worked numbers to make the second one land — ⚠️ **check against real datasheets
  before publishing**, but the algebra is just *length ÷ (VF × c)*:

  | | VF 0.66 (solid PE, RG-58/213) | VF 0.85 (foam, LMR-400/RG-6) |
  |---|---|---|
  | Delay down a 30 m run | ≈ 152 ns | ≈ 118 ns |

  **≈ 34 ns of error from one wrong assumption about a cable**, on a run length
  a datacenter would consider unremarkable. For scale, that is roughly the entire
  error budget the self-survey page spends nine pages of NIST worrying about,
  arriving from a completely different direction. A length error is gentler but
  not gentle: at VF 0.8, every metre you are wrong about is **≈ 4.2 ns**.

  Ends on the same conclusion as the survey page, which is why they cross-link:
  **measure it and configure it — do not accept a default and do not guess.**
  Cross-link to **Transferring Time**, since the feed line is the canonical
  uncompensated path in T1's diagram.

- **Siting and multipath** — **H** or folded in. What is left of the original
  entry once the feed line moved out.

### 4. Transferring Time

*The hole the split exposed.*

- **Acquisition versus distribution** — **H**. Open with T1's compensated /
  uncompensated diagram, quoted above.
- **What is not compensated** — **H**. The antenna feed line and PPS. *If you
  want reliable UTC, which is happening at the antenna, you have to subtract out
  the length of the feed line delay.*
- **NTP** — **S**, linking out.
- **PTP** — **H** for datacenter framing. T2: *you have to use PPS. Regular old
  PTP isn't good enough* — worth unpacking, since it is a strong claim.
- **White Rabbit** — **H**. A couple of hundred picoseconds. Cite Serrano's
  history (`docs/references.md`). Note the correction recorded there: OPERA did
  not start White Rabbit, which was already four years old and originally aimed
  at only ~1 µs. OPERA forced its **first operational deployment**, in parallel
  with OPERA's own timing at Gran Sasso, so the chain could be independently
  checked. That is the stronger argument, and it belongs on this page: the value
  of a second, independent timing path is exactly what the story demonstrates.
- **What the network does to your time** — **H**. Asymmetry, queueing, switches.

### 5. The Datacenter Problem

**New topic.** T1 poses it and T2 proposes the fix; neither had room to join
them, and nothing else in the outline holds it.

- **The roof blocks the sky** — **H**. Antenna must go above the roof — yours or
  theirs — and *you may or may not know the length of that feed line, and you may
  not know an accurate location for the antenna.* Both are exactly the quantities
  you need.
- **But the datacenter doesn't move** — **H**. From Q&A, and it is the redeeming
  fact: *you do have the luxury — install the clock on Monday and don't expect
  reliable data until maybe the following Monday. You can do all the
  post-processing you want in the first 7 days, and the antenna's not moving.*
  Fixed position converts a hard realtime problem into an easy offline one.
- **The atomic backpack** — **H**. Carry a calibrated portable clock in, measure,
  carry it out, re-calibrate under open sky. T2 has the concrete version using
  TimeBeat's portable unit: *calibrated in a car park, carried into the data
  centre, measurements made, carried back out to the car park, and then
  recalibrated.*
- **A prototype looks alarming** — a light touch to attach to any photo of a
  clock prototype: it *could be mistaken for a bomb that must be carefully
  defused in a Hollywood movie*. This is the sanctioned version of a longer
  story Bob tells in person and does not publish. **Do not reconstruct that
  story from the transcripts.**
- **Disclosure** — Bob has invested in TimeBeat and borrowed hardware from them.
  Stated in T1; must be stated anywhere they are mentioned.

### 6. What Is UTC

- **What UTC is, briefly** — **S**, linking to BIPM and NIST.
- **How UTC is actually made** — **H**. T1 tells it better than a diagram would:
  labs worldwide compare their clocks to the satellites, report to BIPM in Paris,
  and *literally weeks to months after they report what they saw, BIPM defines
  what UTC was in the past. That's the reason you really can't synchronise to UTC
  today.*
  > *The attitude the BIPM guys have is that everybody else on Earth is
  > predicting UTC, while we at the BIPM are defining what it is.*
- **UTC(k), and who defines yesterday** — **H**. Bob's line, which should survive
  to publication intact: *the winners define exactly when yesterday was.*
- **GPS time is a prediction** — **H**. *A realtime prediction of what USNO will
  eventually define as UTC(USNO).*
- **Traceability** — **H**.
- **When you can just call it GPS Time** — **H**. ±15 ns and the question
  dissolves. T1's version: you cannot get below 5 ns *to UTC*, but you can align
  to GPS time or Galileo time specifically, far below that.
- **The first atomic clock** — **M** or a short aside. NPL, now at the London
  Science Museum.

### 7. Time Metrology

- **Accuracy versus precision** — **H**. **The archer**, from T1, and the best
  teaching device in either talk:
  > *If you saw an archer take one shot and hit the bullseye, you'd think maybe
  > they got lucky. If you saw him do ten arrows all right in the centre, you'd
  > know that was skill.*
- **Average error hides everything** — **H**. T1's worked example: 1 ns/s fast for
  half a day, 1 ns/s slow for the other half. *Zero average error over the day,
  but off by 43 microseconds at the worst case.* Devastating against anyone
  quoting a mean.
- **Mean offset versus instantaneous error** — **H**. The two components of
  uncertainty; sawtooth is a component of the second.
- **Finagle's variable constant** — **H**. *The correct answer minus my answer.*
  A stable clock with a known offset is a solved problem — subtract it. Easier
  than reducing instantaneous error, and it is why Bob's next goal is the offset,
  not the variance.
- Resolution, TDEV/ADEV — **M** to **Benchmarking**.

### 8. Two-Clock Agreement

- **Agreement is not accuracy** — **H**. 550 ps between two clocks over half a
  day while each wandered 6–7 ns against GPS.
  - A reviewer pushed hard here: agreeing to 500 ps does **not** imply either is
    synchronised to the GNSS timebase. Bob conceded the talk had not made it
    clear enough. **The page must not repeat that mistake** — it is the whole
    reason this topic exists.
- **Which one do you actually need?** — **H**. A reviewer asked it exactly:
  if the exchange and everyone trading with it agree on the same reference, does
  UTC matter at all, as long as a correction can be applied later? Answer that
  head-on.
- **Receivers that trade accuracy for agreement** — **H**. **New, from Q&A.**
  The F9T has a common-sky-view mode that makes two receivers agree more closely
  while making each *less* accurate to UTC. A shipping product that embodies the
  distinction — the perfect closing example.
- **What limits agreement** — **H**.

### 9. Benchmarking

- **What to measure** — **H**. TDEV, ADEV, deviation plots, why one number lies.
- **Measuring without lying to yourself** — **H**. Comparing two clocks with no
  better reference.
- **What nobody has tested** — **H**. T1: capture-device resolution (~15 ps) and
  holdover are covered by existing benchmarks, but *as far as I know there hasn't
  been any work so far on the accuracy of UTC.* The proposed testbed: model an
  exchange and a trader, timestamp market data on the way out and on receipt, and
  the difference *should end up a positive constant* — but is not.

### 10. Stories

*Not a topic. A list of things worth telling somewhere, tagged with where they
belong. Bob's style is visual and anecdotal; these carry the load pictures did.*

- **The OPERA neutrinos** — CERN to Gran Sasso, apparently 60.7 ns faster than
  light in September 2011; two faults found in February 2012; final answer
  6.5 ± 15 ns in July 2012. **Two faults pulling opposite ways**: an unseated
  fibre from the GPS receiver worth 73 ns of apparent speed-up, and a clock
  ticking fast that hid part of it. The headline anomaly was the residue of two
  errors, not one — which is the version worth telling. Dates, magnitudes and
  the caveat about Bob's rise-time mechanism are in `docs/references.md`. Bob
  has CERN press-release screenshots of both the claim and the retraction.
  → *Transferring Time* / *White Rabbit*.
- **The Italian earthquake** — plate motion at millimetres per month, then 8 cm
  overnight. → *Datum offsets*.
- **The market that isn't ours** — GNSS is a $260 bn market, 92 % of it precise
  positioning for consumer and automotive. Precise time is *a fraction of a
  fraction*. → *Timekeeping in Datacenters*.
- **The vodka** — PePPAR-Fix named for Precise Point Positioning with Ambiguity
  Resolution, then a Swedish pepper vodka. With the house rules: *no atomics or
  vacuum pumps or lasers or cryogenics around the house.* → *GPSDOs*.
- **The roof** — antennas hidden behind rooflines *so the neighbours don't think
  I'm as nutty as I really am.* → *Antennas*.
- **The blind squirrels** — Bravo and Charlie, drawn by an AI on a frustrating
  day. → the AI blog post, not the garden.
- **Naming the first talk** — an early title contained a number, and *people got
  focused on that number: no, it's not the last 5, it's the last 3.5. Or 10. Or
  1.27.* So the number went. → a note on writing, or the AI post.
- **"For every complex problem there is an answer that is clear, simple, and
  wrong"** — applied to strapping a GPS lawnmower on the rack. → *Best practices*.
- **"Basic research is what I'm doing when I don't know what I'm doing"** —
  von Braun, quoted in T1.
- **"People who are really serious about software should make their own
  hardware"** — Alan Kay, quoted in T2 to justify building a clock.

---

## Cross-link map

| Concept | Home | Referenced from |
|---|---|---|
| How big a nanosecond is | Datacenters | Metrology (M), Two-Clock (M) |
| Timescale (tick + epoch + count) | Datacenters | UTC (S), Metrology (M) |
| Master clocks are on Earth | Acquiring Time | UTC (S), Datacenter Problem (M) |
| UTC(k), who defines yesterday | What Is UTC | Datacenters (S), Acquiring (M) |
| GPS time as a prediction | What Is UTC | Acquiring (S), Two-Clock (M) |
| Accuracy vs precision (archer) | Time Metrology | Datacenters (S), Two-Clock (S), Benchmarking (S) |
| Agreement vs accuracy | Two-Clock Agreement | Datacenters (S), Acquiring (S), Benchmarking (S) |
| The 5 ns floor | Two-Clock Agreement | What Is UTC (S), Acquiring (M) |
| Accuracy ladder + blobs figure | Acquiring Time | Datacenters (M), Two-Clock (M) |
| Sawtooth jitter | Acquiring Time | GPSDOs (S), Metrology (M) |
| Antenna phase centre | Antennas | Acquiring (S), Datacenter Problem (S) |
| Antenna position survey | Antennas | Acquiring (S), Datacenter Problem (S) |
| Receiver self-survey is not enough | Antennas | Acquiring (S), Datacenter Problem (S), Benchmarking (M) |
| Uncompensated feed line | Transferring Time | Antennas (S), Datacenter Problem (H-adjacent) |
| Acquisition vs distribution | Transferring Time | Datacenters (S) |
| Fixed position as an advantage | Datacenter Problem | Acquiring (S), GPSDOs (S) |
| Goldilocks actuation interval | Acquiring Time (GPSDOs) | Benchmarking (S), Metrology (M) |
| Observation rate vs actuation rate | Acquiring Time (GPSDOs) | Benchmarking (M) |

---

## Feeds

Blog keeps `/rss.xml`; the garden gets its own.

**`guid` = page URL, fixed.** Reversed earlier this round: "burst then sit" means
a revision-based guid would fire constantly during a burst and never after —
loudest exactly when a reader can least keep up. New pages get announced;
revisions stay quiet. If a revision deserves announcing, that is a blog post's
job.

This also removes the reason to hand-roll Atom, so `@astrojs/rss` serves.

---

## Open questions

1. ~~Rename the entry topic?~~ **Closed** — *Timekeeping in Datacenters*.
2. **Which regulations to name?** Still needed, and better from you than guessed.
3. **How deep does Transferring Time go?** It grew this round — PTP, White
   Rabbit, uncompensated paths. Still needs a ceiling.
4. **Numbers for the scale page.** T1 says "trillions of timestamps per day".
   Sourceable, or from memory?
5. ~~The NIST F9T citation.~~ **Closed** — Montare, Novick & Sherman (NIST,
   2024), verified and quoted in `docs/references.md`.

6. **Elapsed-time crossover table?** Interval versus contributed error at 1 ppm.
6. ~~Publish the anecdote about the confiscated prototype?~~ **Closed — no.**
   Bob keeps it for in-person telling. The published substitute is the
   Hollywood-bomb line above.
7. **Is "you have to use PPS, regular PTP isn't good enough" as absolute as it
   sounds?** As stated it will draw argument. Worth softening or defending
   explicitly.
8. **How much of the Q&A becomes content?** Several pages here exist *because*
   reviewers found gaps — dual frequency, multipath, common-sky-view mode. That
   is the outline's best material and also the part where attribution matters
   most. See the warning under **Sources**.

## Someday / parked

Things worth a page eventually, not now. Add freely.

- **Host timing**, **GNSS holdover**, **spoofing and jamming** — all three
  explicitly scoped *out* of T1. Each is a topic in its own right.
- **Galileo HAS** — T2 calls the corrections *very good* and offers to go
  deeper; nobody took him up on it.
- **Fugro AtomiChron** and other commercial traceable services.
- **White Rabbit in depth** — currently one page under Transferring Time.
- **Choosing a receiver** — the F9T/F10T capability matrices in PePPAR-Fix docs
  are already most of a page.
- **"Is it up" is not "does it work"** — ⚠️ *a standalone blog post, not a
  timekeeping topic; parked here because this is where post ideas land.*
  Wait for ops/dns and ops/checkmk to finish, so the post can name the actual
  cause rather than gesture at one.

  The subsistence resolver built in *Subsistence Internet* — the survivor, the
  whole point of the rebuild — turned out to be **silently broken**. It answered
  its authoritative internal zones perfectly and **SERVFAILed on every external
  name**, with the `ra` flag set, so it believed it was offering recursion. It
  was trying and failing, not refusing.

  What makes it a post rather than a war story is the shape of the blind spot:

  - **Every cheap check passes.** Port 53 answers. The process is running. A
    query for a local name returns. Ping — where it works at all — is fine. The
    check that catches this has to ask for something the server must *leave the
    building* to answer.
  - **The failure is invisible by construction.** It is fourth in the DHCP list,
    so nothing reaches it while the cluster is healthy. It would have surfaced
    at the exact moment of an outage, which is the one moment you cannot debug.
  - **It is one level deeper than the post already published.** *Subsistence
    Internet* argues that monitoring must not share fate with what it monitors.
    This says the surviving monitor must also be asked the right question — and
    that "responds" and "works" are different claims about a service.

  Ties back to the callout already written: *split the alarm from the dashboard*.
  The alarm survived. It just was not being asked anything that could fail.

## Done this round

- **L1 (LinkedIn, 2026-08-01) mined into Antennas.** *Don't let the receiver
  survey itself* gains the averaging-versus-bias opening, the 30 cm = 1 ns spine,
  a two-line decision rule, and — the best of it — a **diagnostic the reader can
  run with the equipment they already own**: restart the survey every 24 h for
  14 days and see whether the answers converge or wander.
- **New topic promoted: *Your feed line is likely your largest source of error*.** Bob's bet that
  feedline compensation is the largest bias in typical datacenter deployments,
  plus the questioner's velocity-factor point, is too big to stay a clause inside
  *Siting, cabling, multipath*. Arithmetic verified: 30 m of coax costs 152 ns at
  VF 0.66 and 118 ns at VF 0.85, so **one wrong assumption about a cable is ≈34 ns**
  — about two orders of magnitude past what the self-survey page argues over.
- **Correction logged:** L1 calls the NIST subject "high-quality timing
  receivers"; the paper says *low-cost*, and the unit is the ZED-F9T. Prose must
  follow the paper.
- **Goldilocks actuation interval** added under GPSDOs, from the hidden slide
  and the PePPAR-Fix review. Includes the observation-vs-actuation distinction,
  the two-plant table, and the open questions the review is candid about.
- Someday list started.
- Audience settled; entry topic renamed.
- Both transcripts mined; **~25 topics added** that the slides alone did not
  reveal, including three Bob explicitly said he had no time for.
- Two new topics: **The Datacenter Problem**, **Stories**.
- Quotes captured verbatim where they beat paraphrase.
- Attribution warning added for the other voices on those calls.
