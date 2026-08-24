# Redirect `www.ThinkOutsideTheBob.Com` to the apex

**Status: written up, not applied.** Bob's call. Nothing is broken without it —
see the reasoning at the bottom.

## What it changes

Today `www.thinkoutsidethebob.com` is a **Custom Domain on the `outsidethebob`
Worker**, exactly like the apex. It therefore serves the entire site at HTTP 200
and does **not** redirect. Deduplication is handled by each page's
`<link rel="canonical">`, which points at the apex.

This rule replaces that with a real 301, so `www` stops being a second copy of
the site and becomes a signpost to the first one.

## The rule

Cloudflare dashboard → the **thinkoutsidethebob.com** zone → **Rules** →
**Redirect Rules** → **Create rule**.

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

## Verify after creating it

The uncertainty worth testing: `www` is a Worker Custom Domain, and this rule has
to fire **before** the Worker gets the request. Cloudflare's own
[redirect-a-domain guide](https://developers.cloudflare.com/fundamentals/manage-domains/redirect-domain/)
gives exactly this rule shape, but does not spell out the interaction with a
Custom Domain, so confirm rather than assume:

```bash
UA='Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36'
for p in / /timekeeping/ /blog/volume-knob-for-the-macos-music-app/; do
  curl -sS -m 10 -o /dev/null -A "$UA" \
    -w "%{http_code} -> %{redirect_url}\n" "https://www.thinkoutsidethebob.com$p"
done
```

Want: `301 -> https://thinkoutsidethebob.com<same path>` on all three.
Still seeing `200` means the Worker answered first — in that case remove `www`
from the Worker's Custom Domains (Workers & Pages → `outsidethebob` → Settings →
Domains & Routes), leave a proxied placeholder record for `www` in DNS, and the
rule will have nothing competing with it.

Also check the query string survives:

```bash
curl -sSI -m 10 "https://www.thinkoutsidethebob.com/blog/?utm_source=test" | grep -i '^location'
```

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
