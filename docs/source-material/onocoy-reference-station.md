# Source material — standing up an Onocoy reference station

**Not a post.** Raw material for one, captured 2026-08-26 while the details were
fresh. Written by charlie (PePPAR-Fix agent); the narrative voice is deliberately
neutral — Bob's voice and the editorial shape are the blog agent's job.

**No credentials appear in this file, and none should be added.** The station's
username/password/mountpoint live only in `~/opt/ntrip-relay/relay.env` on gt.

Operational runbooks (the "how to redo it" versions) live in PePPAR-Fix:
`deploy/ntrip-relay/README.md`, `docs/local-caster-onocoy-plan.md`, and
`~/opt/ntrip-relay/onocoy-activation-README.md`.

---

## What was built

A GNSS reference station contributing to **onocoy**, a decentralised network
that collects RTK correction data from volunteer stations and pays contributors
in tokens. The hardware was already in the lab for timing work; the question was
whether it could also serve as a reference station, and what an independent
third party would say about our data quality.

The chain: a **SparkPNT SXT-D** (Septentrio mosaic-T receiver + Rakon
double-oven OCXO) on a rooftop **SFESPK6618H** antenna → a transcoding relay on
a home server → onocoy's caster.

## The narrative arc, in the order the surprises arrived

### 1. The receiver could not do the obvious thing

The mosaic-T inside the SXT-D is a **timing SKU**. Its permission file reads
`dgnssbase=0`, `rtkbase=0` — it physically cannot emit RTCM3 base-station
messages. Every `setRTCMv3Output` returns "Invalid command!".

So the plan of "point the receiver's built-in NTRIP server at onocoy" was dead
on arrival. This is a nice, concrete lesson about SKU permissions: the hardware
is identical, the firmware licence is not.

**The workaround is better than the original plan.** `str2str` (from RTKLIB)
reads the receiver's native SBF observation stream and transcodes it to RTCM3
MSM7. Crucially, it *synthesises* the station-position messages (1005/1006) and
the antenna descriptor (1033) from values we supply on the command line — so the
station broadcasts **our own surveyed coordinates**, independent of whatever the
receiver believes about itself. That turned out to matter (see §3).

### 2. The antenna was invisible to the receiver

The receiver's antenna database returned `<Antenna ID="UNKNOWN"/>` with **zero
phase-centre offset** for our antenna. It ships with a 2023 snapshot of the NGS
antenna catalogue; ours was published to NGS in August 2023 and missed the cut.

Zero PCO is not a small thing. From the antenna's own NGS calibration the true
vertical offset is **48.0 mm at L1** — about **160 picoseconds** of range error,
against a per-clock timing budget of 350 ps.

Fixing it meant installing a newer *Antenna Information* package. Three
sub-surprises:

- The file is **not on GitHub**, despite a runbook saying so. It is a Septentrio
  product, downloadable only from their support portal behind a login.
- The current version is **26.1.0** (NGS snapshot April 2026, 1118 antennas),
  not the 25.1.0 the notes expected.
- **Septentrio's own release notes suggest the wrong verification.** They say to
  cross-check against the IGS antenna list. For an NGS-only antenna like ours
  that gives a **false negative** — it is genuinely absent from the IGS list
  (verified: zero hits, while TRM59800/LEIAR25/ASH701945 are all present) but
  present in NGS ANTCAL, which is what the release notes elsewhere say the data
  is actually derived from. The right check is to ask the receiver.

After the upgrade the receiver returned real offsets — **N=0.5, E=−1.3, U=48.0
mm** — matching our own independent copy of the NGS calibration **exactly**. Two
unrelated sources agreeing is the moment you know it worked.

### 3. A landmine: the receiver still thought it was in London

Pinning the surveyed coordinate looked like one command. It was not.

The receiver's static-position slot already held a coordinate — **51.4946 °N,
0.0613 °W**: London, left over from a deployment months earlier. It was inert
only because the receiver was configured to use an auto-survey instead of that
slot. Issuing the obvious single command — "use static position slot 1" — would
have teleported the station **6400 km**.

The fix is ordering: **write the coordinate into the slot first, then point the
receiver at the slot.** A good general lesson — check what a slot contains
before selecting it, because stale state from a previous deployment is inert
right up until something selects it.

### 4. A hardcoded IP died mid-project

The relay pointed at the receiver by IP address. The receiver was on a **dynamic
DHCP lease** — confirmed by asking it directly (`IPSettings, DHCP, "0.0.0.0"`),
and by a reverse-DNS name that literally began `Dyn`.

While the project was in progress the box was given a static address and a DNS
name, and the old IP went dead within minutes. Had the feed been live it would
have gone **silently** off the air — the relay would have retried a dead address
for ever, and (see §6) onocoy has no mechanism to tell it you are down.

It failed safe — no bad data, just silence — but silence is the worst kind of
fine. **Reference lab instruments by name in anything long-running.** The IP had
been baked into eight places across two repositories and a diagram.

### 5. The credential mapping is genuinely confusing

This cost three attempts and is probably the single most useful thing to publish,
because the field labels actively mislead.

Onocoy's dashboard shows a **"Credential"** and a **"Mountpoint"**. Neither is
used where its name suggests:

| Dashboard label | What it actually is | Where it goes |
|---|---|---|
| "Credential" | the auto-generated NTRIP **username** | the **mountpoint** field |
| "Mountpoint" | cosmetic — "only informative, not public" | **unused** |
| password | chosen by you on the *NTRIP Credentials* tab | password field |

The reason is protocol history. `str2str` pushes using **NTRIP v1**, whose
handshake is `SOURCE <password> <mountpoint>` — there is **no username field at
all**. Onocoy documents exactly this workaround for v1 devices: *"enter the NTRIP
username as MOUNTPOINT and password into the password field. Leave the device's
username field, if any, empty."*

**The failure modes are cleanly distinguishable**, which turns three baffling
attempts into a two-step diagnosis:

| What is wrong | The caster's reply |
|---|---|
| wrong value in the mountpoint field | **nothing at all**, connection dropped |
| right mountpoint, wrong password | **HTTP/1.1 401** |
| both correct | **HTTP/1.1 200 OK** |

(A plain `GET /` returns **403 Forbidden** — they publish no sourcetable — which
is a handy check that the caster is reachable before you blame your credentials.)

An empty reply means the *username* is wrong. A 401 means only the *password*
is. Nobody documents this ladder; it is worth the paragraph.

### 6. Once it is running, you cannot tell them anything

Two operational gaps worth a paragraph each:

- **There is no way to announce planned maintenance.** No dashboard control, no
  API flag. What exists instead is an automatic daily allowance baked into the
  availability score: `(uptime_seconds + 300) / 86400`. So **300 seconds a day**
  is free, and the score falls away steeply past it — below 80 % scores zero,
  90 % scores 0.25, 99 % scores 0.90.
- **There is no self-service way to say "I moved the antenna."** Onocoy monitors
  position continuously and degrades rewards when a station moves; validation
  takes 24–36 hours and there is no documented way to request a re-run.
  `support@onocoy.com` is the only channel for both.

The second has a sting specific to this design. Because `str2str` *synthesises*
the position message from a fixed coordinate on its command line, **the reported
position does not follow the antenna**. Move the antenna without updating that
value and the station keeps asserting a position it is not at, into a network
other people navigate with. The discipline that follows: stop the feed *before*
touching the antenna, re-survey, update the coordinate, mail support, restart.

### 7. It worked, and then the API said no

The push connected on the first try once the credentials were mapped correctly,
and has held since — around 13 kbps, zero restarts.

Onocoy has a **public API** (`api-hub.onocoy.com`), which is worth knowing
because their support documentation says one does not exist. Finding the
specification took a small detour: it is not served at any conventional path
(`/openapi.json` and friends all 404) — it is inlined inside the documentation
page's own configuration attribute.

Then the API returned **403 access denied** for the first day. That is not a
misconfiguration: a station credential is only honoured once the station "has a
successful validation within the last 7 days", and validation takes 24–36 hours.
Confirming this was a permission gate rather than a credential problem took one
comparison — the real credential returned **403 "access denied"** while a
deliberately wrong password returned **401 "invalid credentials"**. Different
error, different meaning.

## The punchline: an independent verdict on our own antenna

The reason a timing project bothers with a crypto-adjacent RTK network is that
onocoy **grades every contributing station** on signal quality, using metrics
with published thresholds, computed by a party with no stake in our results.

Their score combines four things:
`(RMS Code² + RMS Phase² + Cycle-slip ratio² + Sky visibility²) / 4`.

Our station's first twelve hours:

| Metric | Ours | Top-tier threshold | Verdict |
|---|---|---|---|
| **Phase RMS** | ~1.2 mm | ≤ 1.4 mm | **passes** (marginally) |
| **Code RMS** | ~0.23 m | ≤ 0.14 m | **fails**, ~1.6× over |

Two things make this genuinely interesting rather than just a scorecard.

**First, the numbers can be independently reproduced.** Because the relay logs
the observations it sends, the same quantities can be recomputed from scratch.
Doing so with the standard multipath combination gave **1.00 mm** phase noise
against onocoy's ~1.2 mm — agreement within 20 % from completely separate
mathematics. The code figure appeared to disagree badly (0.79 m versus 0.23 m)
until it was broken down by signal strength:

```
C/N0  0-38 dBHz : 0.799 m
C/N0 38-44 dBHz : 0.416 m
C/N0 44-50 dBHz : 0.305 m   ← onocoy's 0.23 m sits between
C/N0 50-99 dBHz : 0.191 m   ←  these two buckets
```

Our figure was an unweighted average over all satellites including low ones near
the horizon; theirs plainly weights or masks by elevation. Same physical
quantity, different treatment. **The disagreement was the interesting part** —
it identified what they were doing.

**Second, the diagnosis follows from the pattern.** Code multipath scaling
strongly with signal strength, while phase stays clean, is the textbook multipath
signature — code multipath reaches metres, phase multipath is capped near a
quarter wavelength and is usually millimetres. So it is the antenna's view of the
sky, not the receiver. No firmware setting fixes it.

**And the failing metric is the one that matters least here.** For a
carrier-phase timing system, phase noise and cycle slips are what predict
performance; code enters only through coarse synchronisation and ambiguity
resolution. Onocoy's 1.2 mm phase RMS converts to **4.0 picoseconds** — which is
precisely the noise on the observable a carrier-phase clock rides on. An RTK
network's quality score turns out to contain, almost incidentally, a
continuously-updated third-party measurement of the thing a timing project cares
about most.

## Suggested angles for the post

- **The strongest single hook:** a crypto-token RTK network turns out to be a
  free, continuous, independent instrument for measuring your antenna — and the
  metric it scores you worst on is the one you should care about least.
- **The credential-mapping ladder** (§5) is the most immediately useful thing to
  anyone else setting one of these up, and is not documented anywhere.
- **"Check what the slot contains before you select it"** (§3) generalises well
  beyond GNSS.
- **Two independent sources agreeing** — the antenna calibration matching, and
  the phase noise matching — is the emotional beat of the piece. Getting the
  same number twice by different routes is the thing that makes you believe it.
- Worth being honest that the elevation-masking conclusion is an *inference*
  from the numbers, not something onocoy documents. Their sky-map page documents
  sky visibility (149 sectors across 9 elevation bands) but not how Code/Phase
  RMS are computed.
