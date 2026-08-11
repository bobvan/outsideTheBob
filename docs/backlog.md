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

## 0b. URL structure — decisions before launch

**[`url-structure.md`](url-structure.md)** — the section-rename question is
**closed**: the 2026-08-10 reorganization replaced all eight sections with six,
and every path word now reads as ordinary English. Two open questions remain:
whether tier 1 stays `/timekeeping/`, and whether to **pin explicit slugs at
publication** so filenames stop being URLs. Both are free now and permanent
afterwards; the slug pinning is the one with teeth.

## 1. Publish gate

Everything here must be true before any `draft: true` becomes `draft: false`.
`npm run publish-check` verifies the mechanical ones.

| # | gate | state |
|---|---|---|
| P1 | **Topic pages and glossary entries flip in the same commit.** 60-odd body links point into `/timekeeping/glossary/#…`; flipping pages without the glossary lands every one of them on "nothing published here yet". | ⏳ 30 pages + 30 terms all `draft: true` |
| P2 | **No `[[? … ?]]` blocks survive.** They render as ordinary body text — readers would see our questions to each other. | ⏳ **7 pages** (was 9) |
| P3 | **Every internal link and glossary anchor resolves.** | ✅ re-crawled 2026-08-10 after the reorganization — 73 routes, 0 broken |
| P4 | **Nav gate and `noindex` reviewed.** `/timekeeping/` is `noindex` and the nav entry is gated on `hasPublishedTopics()`; both flip implicitly when P1 does. | ⏳ |
| P5 | **Sanitization pass on anything sourced from private work.** | ✅ for current content |
| P6 | **`section:` matches the file's directory.** Nothing enforced this; a page moved between sections without editing frontmatter would build a URL contradicting its own location. | ✅ enforced by `publish-check` |

## 2. Open findings — `review-2026-08-08.md` (bravo)

Ranked as the review ranked them. Section refs are that document's.

### Blocking the garden's own rules

*E1 (Holdover) closed 2026-08-08 — now `datacenters/how-gnss-holdover-works`.*
*E2 (Oscillators) closed 2026-08-08 — `do-i-need-an-ocxo`, since **held** out of the build.*
*E4 (silently wrong) closed 2026-08-08 — now `measuring-time/is-my-clock-right`; the three promising pages link to it.*

**This subsection is now empty — the garden no longer breaks its own H/S/M rule.**

| # | item | where |
|---|---|---|

### Technical, needs sources or a decision

*B5 closed 2026-08-09 — all three specs checked against primaries. All three were wrong; see `references.md`.*
*B4, B7, B8, B9 closed 2026-08-09 — sources in `references.md`.*
*B10 closed 2026-08-11 — the two unrelated 16 ns numbers are now explicitly
disambiguated in the sentence that introduces the second. The "BIPM's stated
10 000 km" wording was left alone; it reads correctly as theirs.*

**This subsection is now empty.**

| # | item | where |
|---|---|---|

### Internal contradictions

*C1 closed 2026-08-11 — the hard stop now names the price of walking through the
door: copy a published chain, inherit its 1–2 ns floor, add an unmeasured
per-unit term.*

| # | item | where |
|---|---|---|
| C2 | **"Directly traceable to UTC"** is the usage the traceability page forbids. Traceability is the Home; the acquiring page should defer. One occurrence, confirmed still there 2026-08-10. | `datacenters/acquiring-time` |

### From the answers to our own open questions (§D)

Each of these is an edit bravo handed us with the reasoning attached.

*D5 and E5 declined by Bob, 2026-08-11 — **do not name specific regulations.**
His reason: the topic invites "IANAL, but here is why you are wrong and I am
right", which is an argument this site cannot win and does not want. The
requirement framing stays; the citation does not. Treat this as standing policy,
not a one-off, and do not re-propose naming MiFID II RTS 25 or its equivalents.*

| # | item | where |
|---|---|---|
| D1c | Band pairs a part *supports* vs *lists* — L1/L2 **or** L1/L5, switchable, NAKing the other. **Still open** — the page names the pairs but never says a part may refuse to run both. | `what-makes-an-accurate-timing-receiver` |
| D3a | Three-cornered hat: keep it, and make its unavailability the point — it assumes uncorrelated errors, which a shared antenna/reference/room deliberately breaks. | `benchmarking-clocks` |
| D3b | Replace "replaced by a short" with the **zero-baseline counter test** — split one PPS into both channels; reproducible by any reader with a splitter. | `benchmarking-clocks` |
| D6a | **Missing category: the actuator.** What are you steering with, how finely, over what range, and is the range symmetric? | `designing-a-clock` — **held**, so this waits for the rework |
| D6b | Add a temperature question — ceiling fan, over-insulated oven, wind-driven limit cycle. | `designing-a-clock` — **held** |
| D7 | Gloss common-mode on **first** use. Still open: first use is the pull-quote translation, and the explanation does not arrive until 24 lines later. | `measuring-time/prioritize-agreement-or-accuracy` |
| D8 | Move **one sentence** of the fairness section up, under the "why has BIPM stopped" heading, so the reader is not braced against us while reading the evidence. Leave the section where it is. | `comparing-distant-clocks` |
| E6 | Two-Clock Agreement is a section of one, named after Bob's strongest original result. *What limits agreement* has the most unpublished evidence behind it. | new page |

## 3. Waiting on someone else

| # | item | who |
|---|---|---|
| W1 | ✅ **Landed 2026-08-11.** Delta's correction-stream landscape figure is embedded on `limits-of-gnss-time-accuracy` with the measured-vs-published split, the per-satellite caveat and the one-window caveat carried in prose, as delta asked. Source commit `120fa3e` is on `delta/gnssdoFastFollow` in PePPAR-Fix, **not on main** — if that branch is ever discarded, `public/figures/correction-stream-landscape.svg` here is the only surviving copy. | Agent delta |
| W2 | **`I-081901-blog` Run 1 landed 2026-08-10** — results and caveats folded into `plan-externally-clocked-receivers.md`. Still waiting on the **1 Hz reprocess** (`-i 1`, τ = 1 s), because discipline already wins at τ = 30 s and the crossover — the only number a reader can act on — is below our shortest bin. Main expects it before 2026-08-12 and recommends holding the page until then. Agreed. | Agent main |
| W3 | **Seven** `[[? ?]]` blocks are questions for Bob — `buying-a-clock`, `benchmarking-clocks`, `choosing-a-gnss-timescale`, `limits-of-gnss-time-accuracy`, `can-i-build-my-own-link-to-utc-nist`, `is-my-clock-right`, `how-gnss-holdover-works`. | Bob |

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
| H8 | **One figure in `public/figures/` is not generated by `npm run figures`.** `correction-stream-landscape.svg` comes from PePPAR-Fix (`tools/plot_correction_stream_landscape.py`), so `make-figures.mjs` will never rebuild it and nothing here would notice if it went stale. Refresh it by copying from that repo. |
| H7 | **`updatedDate` is not being maintained**, and it is an input to the publish-facing page as well as to the review tracker. On 2026-08-10 a day of retitles, reslugs and a terminology sweep touched ~25 pages and bumped `updatedDate` on none of them. The tracker no longer depends on it (it reads git), but the *reader-visible* date is now wrong on those pages. Decide: bump them all to the reorganization date, or leave them at the date the prose last changed in substance. |
| H3 | **One** empty section left: `stories` — declared in `SECTIONS` with no pages. The other two went away in the reorganization. Either fill it or drop the key before launch. |
| H6 | **Restart the dev server after any content-collection change that is not a body edit** — a new `glossary.yaml` entry, a renamed page, a changed slug. None of these hot-reload: the cache serves the old set, so the link checker reports the old URL as a 500 and the new one as a 404. Seen twice (2026-08-09, 2026-08-10). Body-text edits reload fine. |
| H4 | Restart the dev server occasionally — bravo found it at 7.5 days of uptime and warns against trusting a stale preview. **Restarted 2026-08-08.** Tailscale preview: `http://100.117.189.97:4321/` |

---

## Settled, so nobody re-asks

- **Chris Treichel is happy to be named** on the Claude Army post (confirmed by Bob, 2026-08-08).
- **The logo experiment is closed** — decided against change, 2026-08-07.
- **The GNSSDO+ oscillator** is an STP3593LF (ROX5242T1N family) double-oven OCXO from Rakon. Both PePPAR-Fix docs were right; there was no contradiction.
- **`dns1` and WBPC stay off the fleet map** — Bob confirmed both sanitization calls, 2026-08-08.

- **Section names are settled** — six sections as of 2026-08-10, and the
  [title audit](title-audit.md) closed with 30 of 30 passing and nothing
  recommended. Retitling is done; do not reopen it without a reason.
- **The review tracker reads git, not `updatedDate`** (fixed 2026-08-10). It had
  been reporting "0 changed since you read them" while pages Bob signed off on
  the 8th had been rewritten, because nothing bumped the frontmatter date. It now
  takes the later of the frontmatter date and the file's last commit, sorts stale
  pages by how many lines moved since the sign-off, and reports *read and edited
  the same day* as its own undecidable state rather than guessing.
