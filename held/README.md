# Held pages — outside the build on purpose

These are complete drafts kept **outside `src/content/`** so the dev preview
answers one question honestly: *what does the site look like if I flip
everything to `draft: false` today?* Anything in here is invisible to Astro,
because the topics collection globs `src/content/topics` and nothing else.

Not a branch, deliberately. A branch would drift from main and need merging;
this is one `git mv` from returning, stays visible in the tree, and keeps its
review history.

## clock-building/

Both written for the clock builder rather than the datacenter buyer, and both
want rework before they ship — see `docs/publish-plan.md`.

| page | why held |
|---|---|
| `do-i-need-an-ocxo.mdx` | Wants redoing as *properties of GNSS receivers* for the dual audience, alongside the receiver-traits page |
| `designing-a-clock.mdx` | Builder-only, and Bob's own review note says it could need a lot of work |

**To bring one back:** `git mv held/clock-building/<page>.mdx src/content/topics/<section>/`,
set `section:` and `order:`, then restore the inbound links removed when it was
held — `git log -S<slug>` finds them.
