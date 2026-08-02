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
