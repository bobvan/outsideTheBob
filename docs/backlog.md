# Backlog — the one place open work lives

**This file is live state. Reviews are dated evidence.** When a review lands
(`review-YYYY-MM-DD.md`), its findings get folded in here and the review is
annotated with ✅/⏳ so it stays readable as a snapshot. Do not track open work in
a review file — a second review would fork the truth.

Close an item by deleting its row and noting it in the commit message. If an item
turns out to be wrong, delete it and say why in the commit — do not leave
tombstones.

---

## 0. Publish plan

**[`publish-plan.md`](publish-plan.md)** — which 25 pages ship first, which 6
defer, and the exact cost (3 link edits, 1 glossary trim). Computed with
`npm run publish-set`, which prices any batch you propose.

## 1. Publish gate

Everything here must be true before any `draft: true` becomes `draft: false`.
`npm run publish-check` verifies the mechanical ones.

| # | gate | state |
|---|---|---|
| P1 | **Topic pages and glossary entries flip in the same commit.** 60-odd body links point into `/timekeeping/glossary/#…`; flipping pages without the glossary lands every one of them on "nothing published here yet". | ⏳ 28 pages + 28 terms all `draft: true` |
| P2 | **No `[[? … ?]]` blocks survive.** They render as ordinary body text — readers would see our questions to each other. | ⏳ 9 pages |
| P3 | **Every internal link and glossary anchor resolves.** | ✅ 72 routes, 24 anchors, 0 broken |
| P4 | **Nav gate and `noindex` reviewed.** `/timekeeping/` is `noindex` and the nav entry is gated on `hasPublishedTopics()`; both flip implicitly when P1 does. | ⏳ |
| P5 | **Sanitization pass on anything sourced from private work.** | ✅ for current content |

## 2. Open findings — `review-2026-08-08.md` (bravo)

Ranked as the review ranked them. Section refs are that document's.

### Blocking the garden's own rules

*E1 (Holdover) closed 2026-08-08 — `acquiring/what-happens-when-i-lose-gps`.*
*E2 (Oscillators) closed 2026-08-08 — `acquiring/do-i-need-an-ocxo`.*
*E4 (silently wrong) closed 2026-08-08 — `two-clock/how-do-i-know-its-still-right`; the three promising pages now link to it.*

**This subsection is now empty — the garden no longer breaks its own H/S/M rule.**

| # | item | where |
|---|---|---|

### Technical, needs sources or a decision

*B5 closed 2026-08-09 — all three specs checked against primaries. All three were wrong; see `references.md`.*
*B4, B7, B8, B9 closed 2026-08-09 — sources in `references.md`. Only B10's two cosmetic items remain in this group.*

| # | item | where |
|---|---|---|
| B10 | Two unrelated 16 ns numbers four paragraphs apart read as connected; and consider "BIPM's stated 10 000 km" for the NIST–PTB baseline. | `can-i-build-my-own-link-to-utc-nist` |

### Internal contradictions

| # | item | where |
|---|---|---|
| C1 | **"You cannot download a travelling receiver"** is contradicted two sections later by Píriz's co-located method, which *is* the amateur path. State the price of walking through the door rather than closing it: you inherit that chain's floor, 1–2 ns. | `can-i-build-my-own-link-to-utc-nist` |
| C2 | **"Directly traceable to UTC"** is the usage the traceability page forbids. Traceability is the Home; the acquiring page should defer. | `acquiring-time` |

### From the answers to our own open questions (§D)

Each of these is an edit bravo handed us with the reasoning attached.

| # | item | where |
|---|---|---|
| D1a | Add one line to trait 4: *if you expect to still care in two years, weight this above its position on the list.* | receiver traits |
| D1b | **Seventh trait: does the firmware report quantization error?** A purchase-level trap — same silicon family, and the non-timing parts report zero. | receiver traits |
| D1c | Band pairs a part *supports* vs *lists* — L1/L2 **or** L1/L5, switchable, NAKing the other. | receiver traits |
| D3a | Three-cornered hat: keep it, and make its unavailability the point — it assumes uncorrelated errors, which a shared antenna/reference/room deliberately breaks. | `benchmarking-clocks` |
| D3b | Replace "replaced by a short" with the **zero-baseline counter test** — split one PPS into both channels; reproducible by any reader with a splitter. | `benchmarking-clocks` |
| D5 | **Tenth vendor question, and name the regulation** — MiFID II RTS 25. Ask not "are you compliant" but *what do you produce when a regulator asks me to demonstrate divergence over a past quarter?* | `buying-a-clock` |
| D6a | **Missing category: the actuator.** What are you steering with, how finely, over what range, and is the range symmetric? | `designing-a-clock` |
| D6b | Add a temperature question — ceiling fan, over-insulated oven, wind-driven limit cycle. | `designing-a-clock` |
| D7 | Gloss common-mode on **first** use, then let it carry the page. | `agreement-is-not-accuracy` |
| D8 | Move **one sentence** of the fairness section up, under the "why has BIPM stopped" heading, so the reader is not braced against us while reading the evidence. Leave the section where it is. | `comparing-two-distant-clocks` |
| E5 | Name a regulation somewhere — `a-means-to-an-end` builds its opening on requirements arriving from a regulator and never names one. Bravo argues this is the biggest hole in the search surface. | `a-means-to-an-end` |
| E6 | Two-Clock Agreement is a section of one, named after Bob's strongest original result. *What limits agreement* has the most unpublished evidence behind it. | new page |

## 3. Waiting on someone else

| # | item | who |
|---|---|---|
| W1 | Correction-stream landscape figure — a `[[? ?]]` on `gnss-time-is-a-prediction` holds its place. For a self-consistent publish, land it or delete the marker; the page reads complete without it. | Agent delta |
| W2 | **`I-081901-blog`** — GNSSDO+ vs F9T, one antenna, 24 h, TDEV vs τ. The data for `plan-externally-clocked-receivers.md`. | Agent main |
| W3 | Nine `[[? ?]]` blocks are questions for Bob. Bravo answered all of them in §D; those answers are rows above, but the *decisions* are still Bob's. | Bob |

## 4. Future pages, ranked by how much of it only Bob has

From review §F. These are not debt — they are the reason the garden is worth
reading. Ordered as bravo ranked them.

0. **GPSDO architecture** — how the module, the oscillator and the discipline loop fit together. Promised in a callout on the receiver-traits page, and it is the page that explains why a network clock's PPS is quiet and a module's is not. Bob raised it 2026-08-09.
1. **The Goldilocks actuation interval** — drafted in the plan doc, figure exists, two-plant table in §D6. Generalizes past GPSDOs to any control loop with a noisy actuator.
2. **Known-good observations — grading your own chain.** Run the pipeline on a station whose clock *is* UTC(k); any wander cannot be the clock. Credit **Ole Petter Rønningen**. `can-i-build-my-own-link` already does half of it without naming it as a method.
3. **Fresher is not automatically steadier.** Broadcast ephemeris steadier at long τ than real-time IGS SSR, whose datum humped ~15 ns over three hours. Qualifies a claim `gnss-time-is-a-prediction` currently makes flatly.
4. **The expensive thermometer** — sawtooth, qErr, and the pattern that reversed when the air conditioning came on.
5. **Per-unit variance beats per-model difference** — two nominally identical F9Ts further apart than an F9T and an F9P.
6. **Actuator resolution and control authority** — §D6's missing category as a page.
7. **Datums, reference frames, and the ground moving** — Barrow, the Italian earthquake, 15 cm in seven years ≈ 500 ps.
8. **Spoofing, jamming, and OSNMA** — the acquiring page's authenticity section is a Summary looking for its Home.

## 5. Bob's review status

`npm run review` — what still needs his eyes, and what he signed off before it
changed. State lives in a `reviewed:` frontmatter field on each page; it never
renders. See `scripts/review-status.mjs`.

**Agents: never touch that field.**

## 6. Housekeeping

| # | item |
|---|---|
| H1 | **86 unlinked glossary first-uses** across 28 files — `npm run glossary-links`. Advisory; mostly `UTC` and `timescale`, which need judgement rather than a sweep. |
| H2 | **11 title retitles** outstanding in `title-audit.md`, now with proposed slugs. Strongest: *GNSS time is a prediction* → *Does the satellite know what time it is?* Cheap while everything is `draft: true`; expensive after. |
| H3 | Three empty sections: The Datacenter Problem, Benchmarking, Stories. |
| H6 | **Restart the dev server after any content-collection change that is not a body edit** — a new `glossary.yaml` entry, a renamed page, a changed slug. None of these hot-reload: the cache serves the old set, so the link checker reports the old URL as a 500 and the new one as a 404. Seen twice (2026-08-09, 2026-08-10). Body-text edits reload fine. |
| H4 | Restart the dev server occasionally — bravo found it at 7.5 days of uptime and warns against trusting a stale preview. **Restarted 2026-08-08.** Tailscale preview: `http://100.117.189.97:4321/` |

---

## Settled, so nobody re-asks

- **Chris Treichel is happy to be named** on the Claude Army post (confirmed by Bob, 2026-08-08).
- **The logo experiment is closed** — decided against change, 2026-08-07.
- **The GNSSDO+ oscillator** is an STP3593LF (ROX5242T1N family) double-oven OCXO from Rakon. Both PePPAR-Fix docs were right; there was no contradiction.
- **`dns1` and WBPC stay off the fleet map** — Bob confirmed both sanitization calls, 2026-08-08.
