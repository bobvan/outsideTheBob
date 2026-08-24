# Redirect `www.ThinkOutsideTheBob.Com` to the apex

**Status: ✅ applied and verified 2026-08-24.** `www` now 301s to the apex with
the path and query string preserved.

**The durable finding:** a Redirect Rule **does** fire ahead of a Worker, even
when the hostname is a Worker Custom Domain. Cloudflare's docs do not say so, and
the dashboard actively warns that it will not work (see below). It works.

## What it changed

`www.thinkoutsidethebob.com` was a **Custom Domain on the `outsidethebob`
Worker**, exactly like the apex, so it served the entire site at HTTP 200 and did
**not** redirect. Deduplication rested on each page's `<link rel="canonical">`.

This rule replaces that with a real 301, so `www` stops being a second copy of
the site and becomes a signpost to the first one.

## The rule

Cloudflare dashboard → the **thinkoutsidethebob.com** zone → **Rules** →
**Overview** → **Create rule** → **Redirect Rule**.

### Easiest: use the template

Cloudflare ships a **"Redirect from WWW to root"** template that fills the whole
form. Take it. It configures:

| field | value |
|---|---|
| Request URL | `https://www.*` |
| Target URL | `https://${1}` |
| Status code | **301** |
| Preserve query string | **Enabled** |

The wildcard captures everything after `www.`, so `${1}` expands to
`thinkoutsidethebob.com/<path>` and the path is preserved without a `concat()`.

Check three things before saving: the status really is **301** and not 302 (302
tells Google not to consolidate, which defeats the point), the zone is
**thinkoutsidethebob.com** and not the other one, and the rule is **enabled**
after save.

### Or by hand, if the template is gone

| field | value |
|---|---|
| Rule name | `www to apex` |
| If incoming requests match | **Custom filter expression** |
| Expression | `(http.host eq "www.thinkoutsidethebob.com")` |
| Then | **Dynamic** redirect |
| URL expression | `concat("https://thinkoutsidethebob.com", http.request.uri.path)` |
| Status code | **301** (permanent) |
| Preserve query string | **Enabled** |

Two things that bite:

- **Choose Dynamic, not Static.** A static redirect sends every request to one
  fixed URL, so all of `www` would land on the home page and every deep link
  would lose its path.
- **Do not put the query string in the expression as well as ticking the box.**
  `http.request.uri.path` is path-only and the toggle re-attaches the query.
  Using `http.request.uri` (path *and* query) *and* the toggle duplicates it.

## The deploy-time warning is a false negative

Clicking **Deploy** raises:

> Your DNS configuration may not be proxying traffic for www, which means
> requests may not match this rule.

**Ignore it and deploy anyway.** The validator looks for a conventional proxied
A/AAAA/CNAME record named `www` and does not find one, because the hostname is
claimed by the **Worker Custom Domain** binding instead. Traffic is proxied
regardless — `www` resolves to the same Cloudflare anycast IPs as the apex and
answers with `server: cloudflare` and a `cf-ray`.

**Do not take the "Create a new proxied DNS record" offer.** The Worker already
owns that hostname; a competing record is refused or leaves two things claiming
one name.

## Verify after creating it

```bash
UA='Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36'
for p in / /timekeeping/ /blog/volume-knob-for-the-macos-music-app/; do
  curl -sS -m 10 -o /dev/null -A "$UA" \
    -w "%{http_code} -> %{redirect_url}\n" "https://www.thinkoutsidethebob.com$p"
done
```

Want: `301 -> https://thinkoutsidethebob.com<same path>` on all three. All three
returned 301 on 2026-08-24, and the query string survives:

```
https://www.thinkoutsidethebob.com/blog/?utm_source=test&x=1
  -> 301 location: https://thinkoutsidethebob.com/blog/?utm_source=test&x=1
```

Had it returned `200`, the Worker would have answered first, and the fallback was
to remove `www` from the Worker's Custom Domains (Workers & Pages →
`outsidethebob` → Settings → Domains & Routes) so the rule had nothing competing
with it. Not needed — recorded in case a future Cloudflare change reverses this.

### ⚠ The rule is HTTPS-only

The template's match is `https://www.*`, so **plain-HTTP `www` does not match it**
and is served directly instead. That is not a flaw in the rule — it is a symptom
of **Always Use HTTPS being off for this zone**, which is tracked separately in
[`backlog.md`](backlog.md) §2b. Once that is on, `http://www/…` takes two hops
(→ `https://www/…` → apex), which is normal and fine.

## Why bother, and why it can also wait

**Not required.** Google's *Alternate page with proper canonical tag* is a
success state — the canonical was found and honored, and the apex page is the one
indexed. Nothing about the current setup costs a ranking.

**The one real argument:** every page on the site currently has a second
crawlable URL. On a property that went live 2026-08-11 and is still working
through its first 84 pages, halving the crawl surface is worth a five-minute
rule. A 301 is also unambiguous in a way a canonical tag is not — a canonical is
a *hint* that a crawler may disregard, while a 301 is an instruction.

**After applying**, `CLAUDE.md` and the `canonical-domain` memory both need the
⚠ note about `www` serving 200 removed, since it would no longer be true.
