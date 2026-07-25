# Think Outside The Bob

Source for **Think Outside The Bob** — Bob Van Valzah's blog, at
[thinkoutsidethebob.com](https://thinkoutsidethebob.com). Built with
[Astro](https://astro.build), published as a static site to GitHub Pages.

`OutsideTheBob.com` redirects to the canonical `ThinkOutsideTheBob.com`.

## Status

**Not live.** The Pages deploy is gated behind a repo variable — see
[Deploying](#deploying). Pushing to `main` builds the site but publishes nothing.

## Requirements

Node **22.12 or newer** (required by Astro 7). Developed on Node 24 LTS; Debian's
packaged Node 20 is too old and needs replacing from NodeSource.

## Local development

```sh
npm ci
npm run dev
```

The dev server listens on port 4321 on all interfaces, so you can preview from a
phone, tablet, or another machine on the same private network. `astro.config.mjs`
sets both `server.host` and `server.allowedHosts`; the latter matters because
Astro otherwise rejects any request that arrives by hostname rather than by raw
IP, returning a 403 that looks exactly like a dead port.

Astro 7 runs the dev server as a **background daemon**, so it survives the shell
that started it:

```sh
npx astro dev status    # is one running, and where
npx astro dev logs
npx astro dev stop
```

If a preview looks stale or ignores your edits, check for an older daemon still
holding the port.

| Command           | Does                                                  |
| ----------------- | ----------------------------------------------------- |
| `npm run dev`     | Dev server, drafts visible, hot reload                |
| `npm run build`   | Static build to `dist/`, drafts excluded              |
| `npm run preview` | Serve `dist/` — what visitors would actually get      |
| `npm run og`      | Regenerate the social card from the banner SVG        |

## Writing a post

Add a `.md` or `.mdx` file under `src/content/blog/`. Frontmatter is
schema-checked at build time by `src/content.config.ts`, so a typo in a field
name fails the build rather than silently doing nothing.

| Field         | Required | Notes                                                     |
| ------------- | -------- | --------------------------------------------------------- |
| `title`       | yes      |                                                           |
| `description` | yes      | Does triple duty — see below                              |
| `pubDate`     | yes      | `2026-07-25`                                              |
| `updatedDate` | no       | Shown alongside `pubDate` when present                    |
| `slug`        | no       | Overrides the URL; otherwise derived from the filename     |
| `tags`        | no       | Array of strings                                          |
| `heroImage`   | no       | Imported image, shown on the blog index                   |
| `draft`       | no       | **Defaults to `true`**                                    |

Two things worth knowing:

**`description` is not decoration.** It becomes the page's meta description, its
`og:description` for link previews, and its summary in the RSS feed. Write it for
someone who has never heard of the post.

**`draft` defaults to `true`,** which is the safe direction — a new post cannot
publish by accident. Drafts render in `npm run dev` and are excluded from the
build, the sitemap, and the feed. Flip it to `false` when a post is finished.

Dates are bare calendar days, which parse as UTC midnight. `FormattedDate`
formats them in UTC on purpose: formatting in the build host's local zone
rendered every post a day early anywhere west of UTC.

## Images

**Put images in `src/assets/`, not `public/`.** Astro only optimizes images it
can see at build time. Anything under `src/` is resized and converted to WebP by
sharp; anything under `public/` is copied byte-for-byte and never touched.

```mdx
import shot from "../../assets/shot.png";

<ZoomableImage
  src={shot}
  alt="What the reader is looking at"
  caption="Optional caption."
  width={1000}
/>
```

`ZoomableImage` shows a resized copy inline and the full-resolution original on
click, which is what screenshots with small type need. The zoom uses the native
HTML `popover` attribute — no JavaScript — and shows the original at natural size
with scrolling rather than scaling it to fit, since shrinking it again would
defeat the point.

## Post components

In `src/components/post/`, imported per post as needed:

- **`CalloutBox`** — set-off note, e.g. which software versions a procedure was tested against
- **`ZoomableImage`** — resized image with click-to-zoom, optional caption
- **`ImageAndText`** — image beside prose; pass `img` for an imported image, or `imgSrc` for one in `public/`
- **`ChartEmbed`** — Chart.js canvas

## Branding

`public/images/outsideTheBob.svg` is the header banner: "Think" inside a box,
"OutsideTheBob" smashing out through the right wall. It is hand-editable, and the
file's own comments explain the geometry — including why the wall is a path with
a gap rather than a rectangle with something drawn over it.

`scripts/gen-shrapnel.mjs` regenerates the debris field and its motion trails. It
is seeded, so re-running reproduces the same art; change a seed to reshuffle.
Paste its output over the shrapnel block in the SVG.

`npm run og` renders `public/images/og-banner.png`, the 1200×630 card social sites
show for a shared link. It inlines the banner's markup rather than redrawing it,
so **re-run it after editing the SVG** to keep the two in step.

## Layout

`src/layouts/BaseLayout.astro` is the only layout. It owns the entire document
head — title, description, canonical URL, sitemap and feed links, OpenGraph and
Twitter tags — plus the header, nav, and footer. Pages pass `title` and
optionally `description` and `image`. Markdown and MDX pages can use it directly
via `layout:` in frontmatter.

Site name and tagline live in `src/consts.ts`.

## Deploying

Two workflows:

- **`.github/workflows/build.yml`** — builds on every push to `main`. No deploy.
- **`.github/workflows/deploy.yml`** — deploys to GitHub Pages, but only when the
  repo variable **`PAGES_DEPLOY`** is `true`. It defaults to `false`, so nothing
  publishes until it is set deliberately.

To go live:

1. Point DNS for `thinkoutsidethebob.com` at GitHub Pages.
2. Add `public/CNAME` containing the domain, and set the custom domain in the
   repo's Pages settings.
3. Set `OutsideTheBob.com` to redirect to the canonical domain.
4. `gh variable set PAGES_DEPLOY --body true`

`site:` in `astro.config.mjs` is already the canonical domain. It has to be
correct before publishing, because canonical URLs, the sitemap, and RSS links are
all generated from it.

## Notes

npm 11 declines to run install scripts it has not been told to trust, so
`npm ci` warns about `esbuild`. Harmless here — the build and image pipeline both
work without it.
