# Glossary — link out, or write our own?

Companion to `docs/topics-in-timekeeping.md`, kept separate so the two can be
edited at once. Data lives in `src/data/glossary.yaml`; this file is the
editorial judgement behind it and is not rendered anywhere.

Same verification marks as `docs/references.md`: 📌 **verified** (read it),
⚠️ **unverified** (believed, not confirmed).

## The question each entry has to answer

Rule 4 of the topic is *be the 11th page on the web, not the 1001st*. A glossary
of standard terms is the single most 1001st thing it is possible to write, so
each entry has to earn its place one of two ways:

1. **As a hub.** It is short on purpose and sends you somewhere fuller — out to
   a canonical definition, or in to one of our pages.
2. **As a position.** The standard definitions conflict with common usage, and
   saying which is which is itself the value.

An entry that is neither is a dead end and should be cut.

## The find worth acting on: *trueness*

📌 **Verified.** The VIM (International Vocabulary of Metrology, JCGM 200:2012)
does not treat accuracy as one axis. It decomposes into two:

- **2.14 trueness** — closeness of the *average* of infinitely many measurements
  to the reference value. Inversely related to systematic error, and
  *"not related to random measurement error."*
- **2.15 precision** — closeness of repeated measurements to each other,
  irrespective of where they sit.
- **2.13 accuracy** — the combination of the two. The VIM explicitly warns that
  accuracy must not be used to mean trueness.

This matters beyond the glossary. Bob's LinkedIn answer — *"averaging removes
random errors, but not bias"* — is exactly the statement *"averaging improves
precision but never trueness,"* and the metrology vocabulary has had a word for
it since 2012. Naming it does two things: it gives the antenna page a term of
art to hang the argument on, and it lets one glossary entry carry an idea that
recurs across the whole garden.

**Bob's call:** does the prose adopt *trueness* as vocabulary, or keep saying
"bias" and mention trueness once in the glossary? Adopting it is more precise and
slightly more demanding of the reader.

## Visualising it: the archery target is already right, and mislabelled

Bob asked how to extend the usual archery-target picture to cover trueness. The
answer is that it does not need extending, it needs relabelling — which is a
better page than an extension would have been.

The classic 2×2 varies exactly two things:

- **how tight the group is** — precision, i.e. random error;
- **where the group's centre sits relative to the bullseye** — *trueness*,
  i.e. systematic error.

Those are the axes. Accuracy is not a third dimension; in the VIM's scheme it is
the **verdict** when both are good — the top-left cell. So the diagram everyone
has seen is a trueness × precision grid with one axis misnamed, and saying so is
the whole contribution. Rule 4 is satisfied not by drawing a new picture but by
correcting the caption on the most-drawn picture in metrology.

### What does need adding: motion

Four static quadrants cannot express the argument. One arrow can:

> **Averaging shrinks the group. It never moves the group's centre.**

An arrow that travels only along the precision axis, never sideways. That is the
GNSS survey story exactly — 24 h runs converge tidily and converge to the wrong
answer — and it is what the static grid has no way to say.

### The panel that makes it honest

The analogy quietly lies, and naming the lie is the strongest part of the page:
**on a real target you can see the bullseye; in measurement you cannot.** You see
your arrows and nothing else. From inside the picture a tight group offset by a
metre and a tight group dead centre are indistinguishable.

So a fourth panel — the same arrows, target removed — is the punchline. It is why
NIST could measure their bias and not explain it, and why the restart-the-survey
-fourteen-times diagnostic works at all: it is a way of interrogating your own
group when you cannot see the board.

It also earns the third term. **Traceability is how you find the bullseye** — an
unbroken chain to a reference is the only thing that says where the centre was.
Three glossary entries carried by one picture.

### The blob — Bob's refinement, and how to make it bite

Bob's instinct: drop the rings entirely and draw an amorphous blob, so precision
is visible and trueness is not. That is right, and there is a version of it that
does more than illustrate — it argues.

**Draw the same blob twice, side by side. Then reveal a different bullseye in
each.** Identical observations; two incompatible truths. Nothing about the blob
changed, because nothing about the blob *could* have told you. That converts
"trueness is unobservable" from a claim into something the reader works out for
themselves in about two seconds.

The blob has one property the ringed target lacks: **there is no coordinate
frame at all.** A target with rings but no visible centre still implies a centre
exists somewhere on the page. A blob on blank paper does not even offer that,
which is the honest depiction of the epistemics — you have a spread and no
origin.

Worth keeping the ringed target for the four-quadrant relabelling and using the
blob for the reveal. They are doing different jobs: the grid names the axes, the
blob says which axis you can actually observe.

### Does UTC sit at the centre of the bullseye? Yes — but it is not painted yet

Bob's framing: for trading, and probably for all datacenter timing, truth **is**
UTC, or an analysis centre's prediction of it, and trueness is the distance to
it. That grounds the abstraction perfectly for the audience, and it breaks the
archery analogy in a way worth exploiting rather than hiding.

📌 **Verified.** BIPM's own wording: *"TAI and UTC are **deferred-time** time
scales that cannot be immediately available to real-time users."* Circular T is
monthly and gives [UTC − UTC(k)] at five-day intervals for about eighty
contributing institutes. UTCr, weekly since July 2013, is published explicitly
as *a prediction of UTC* for about fifty labs.

So the target has **three marks, not one**:

| Mark | What it is | When you can know it |
|---|---|---|
| Your group's centre | what you actually achieved | now, from your own data |
| **UTC(k)** | the lab realisation you steer to | now |
| **UTC** | the answer | next month, in Circular T |

And three distances, which is what makes it a diagram rather than a label:

- **group → UTC(k)** — your systematic error against the reference you can
  actually reach. Measurable in real time.
- **UTC(k) → UTC** — your reference's own offset. Published monthly at five-day
  granularity; unknowable at the instant, lookupable afterwards.
- **group → UTC** — your trueness. Only ever known in arrears.

This is the field-specific twist, and it is a strong 11th-page argument: **the
standard accuracy/trueness/precision picture silently assumes the reference
exists at the moment of measurement.** In timekeeping it does not. The centre is
determined later, by committee, from the contributing labs' own clocks — so for
national labs the bullseye is drawn partly *from where the arrows landed*, which
has no archery equivalent at all.

It also upgrades the earlier "you cannot see the bullseye" panel. That was an
epistemic limitation; this is a **temporal** one, which is both truer and more
interesting. And it gives traceability an obvious job: the documented chain is
precisely what lets you locate, afterwards, a centre that did not exist when you
fired.

⚠️ **One wording caution for the prose.** Bob writes "trueness is the absolute
value of the difference to UTC." Strictly the VIM says trueness *is not a
quantity* and cannot be expressed numerically — the quantity is the systematic
error, and trueness is the property of that error being small. So: *your offset
from UTC is the systematic error; trueness is how little of it you have.* One
clause, not a lecture, and worth getting right on a page that is otherwise
correcting everyone else's vocabulary.

### Resolution: pixelate, do not re-space the rings

📌 **Verified.** VIM 4.14 *resolution*: "smallest change in a quantity being
measured that causes a perceptible change in the corresponding indication."
Neighbours are 4.15 *resolution of a displaying device* and 4.16 *discrimination
threshold*, both with their own stable URLs.

Bob offered two visual options — ring spacing, or pixelation. **Pixelation is the
better one**, because resolution quantises the *report*, not the shot. Ring
spacing suggests the arrow landed on a ring; a grid says the arrow landed
wherever it landed and you are only told which cell.

So: overlay a grid on the shots. Every shot in a cell reports as that cell.

And then the demonstration that makes it a page rather than a definition —
**make the grid coarser than the group.** All the shots fall in one cell, the
blob collapses to a single point, and the instrument now reports the same number
every time. It looks like perfect precision. It is the absence of information.

That is the trap worth naming, and it lands squarely on the topic doc's existing
item *"quantization with digital clocks at reasonable speeds"*: a counter ticking
every 10 ns, watching a source that jitters by 1 ns, is flawlessly repeatable and
tells you nothing. Coarse resolution does not merely limit precision — it
*counterfeits* it.

Which also gives the trio its ordering. Resolution bounds what you can see;
precision is what you see once resolution stops hiding it; trueness is what no
amount of seeing will reveal.

### Concrete examples, best first for this audience

1. **A watch that keeps perfect time but is set three minutes fast.** Stability
   flawless, trueness three minutes out. Comparing it with itself forever never
   reveals it.
2. **A bathroom scale reading 2 kg heavy.** Ten weighings, one number, ten times.
   More weighings never find the 2 kg.
3. **The feed line.** Every timestamp late by the same amount; a million
   timestamps will not show it, only a TDR or a marking on the jacket will.

Lead with the watch, because it lands a bonus: **time and frequency already makes
this distinction under other names.** Stability versus accuracy *is* precision
versus trueness, in the field's own vocabulary. So the garden is not importing a
foreign idea — it is pointing out that two communities named the same distinction
differently, and that the metrology pair generalises.

## Verdicts

The VIM is close to an ideal link-out target: free, authoritative, and with a
**stable URL per clause** (`https://jcgm.bipm.org/vim/en/2.13.html`), so entries
can deep-link to exactly the definition rather than at a PDF and a page number.

| Term | Canonical source | Verdict |
|---|---|---|
| Accuracy | 📌 VIM 2.13 | **Link out** for the definition. The *application* is ours — see below. |
| Trueness | 📌 VIM 2.14 | **Link out**, and adopt as vocabulary. |
| Precision | 📌 VIM 2.15 | **Link out.** |
| Repeatability | 📌 VIM 2.21 | **Link out only.** Well covered, and we have nothing to add. |
| Traceability | 📌 VIM 2.41 | **Our own page — strongest candidate.** See below. |
| Stability | ⚠️ NIST SP 1065 (Riley, 2008) | **Link out, plus a page eventually.** See below. |
| Holdover | — none found | **Ours by default.** No canonical definition exists. |
| Timescale | — | **Ours.** Already an H page under *Timekeeping in Datacenters*. |
| Resolution | 📌 VIM 4.14 | **Link out**, but the *counterfeit-precision* trap is ours — see below. |

### Why traceability is the strongest own-page candidate

The VIM defines it rigorously and unhelpfully. The question a datacenter
actually has is *what does "traceable to UTC" require of me* — which chain,
which records, which uncertainty — and that is regulatory-adjacent, which is
precisely the audience the topic is aimed at. It is also the place where the
gap between the formal definition and what vendors claim is widest. Nobody has
written that page well, and Bob is unusually placed to.

### Stability needs care, because the VIM sense is the wrong one

VIM 4.19 defines *stability of a measuring instrument* — a general metrology
notion, not the time-and-frequency one. In this field stability means the Allan
deviation family, and it is a **function of averaging interval**, not a number.
The glossary entry currently links VIM 4.19 with that caveat stated; if that
reads as more confusing than helpful, drop the link and point at Riley instead.

⚠️ **Verify before citing directly.** W. J. Riley, *Handbook of Frequency
Stability Analysis*, NIST Special Publication 1065 (2008), appears at
<https://tf.nist.gov/general/pdf/2220.pdf> and is indexed by NIST, but I have
not read it and have not confirmed that URL serves that document.

### Holdover has no canonical definition, which is itself the story

Nothing authoritative pins it down; it is vendor-defined and the specs are not
comparable with each other. That makes the entry unusually valuable — a short
page saying *a holdover figure is meaningless without both the error threshold
and the oscillator* would be genuinely useful, and would have no competition.
Note the topic doc scopes holdover **out** of T1 and parks it on the someday
list, so this is a decision to revisit, not a contradiction to fix.

## Not yet researched

The GNSS cluster from the topic doc's glossary list — **Survey, RTK, SPP, PPP,
PPP-AR** — is untouched. Expect these to lean *link out*, since the IGS and the
constellation operators document them well, with the possible exception of the
distinction between them, which is exactly the kind of thing that is well
documented one term at a time and badly documented as a comparison.

Also unstarted from the same list: nothing else. The eight terms above plus
those five are the whole list as it stood.
