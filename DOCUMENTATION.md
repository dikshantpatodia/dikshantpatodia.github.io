# Documentation

Everything about this repository: how it is built, how it is deployed, how to
write for it, and the rules it is held to. For a one-paragraph overview, see
[README.md](./README.md).

- [Overview](#overview)
- [Stack](#stack)
- [Repository layout](#repository-layout)
- [Getting started](#getting-started)
- [Scripts](#scripts)
- [Build pipeline](#build-pipeline)
- [Deploying](#deploying)
- [Writing content](#writing-content)
- [New-post alerts](#new-post-alerts)
- [Backend integration](#backend-integration)
- [SEO](#seo)
- [Performance](#performance)
- [Design system and styling](#design-system-and-styling)
- [Accessibility](#accessibility)
- [Configuration reference](#configuration-reference)
- [Conventions](#conventions)

## Overview

A static, prerendered portfolio and blog for **Dikshant Patodia**, Senior
Frontend Engineer. Every route is rendered to HTML at build time and served as
plain files from GitHub Pages at **https://www.dikshantpatodia.in**. There is no
runtime server, no database, and no client-side routing.

The home page is a single editorial page: hero, a latest-posts banner, case
studies, an interactive engineering playground, leadership notes, the journal,
and contact. The blog lives at `/blog` with per-category and per-post pages.

## Stack

| Concern | Choice |
| --- | --- |
| UI | React 19 + TypeScript |
| Build | Vite 8 (client + SSR bundles) |
| Styling | Tailwind CSS v4 (`@theme` tokens) plus hand-written component CSS |
| Motion | `motion/react`, disabled under `prefers-reduced-motion` |
| Icons | `lucide-react` |
| Content | Markdown + `marked` at build time, optionally an HTTP JSON API |
| Social cards | `@resvg/resvg-js` rendering SVG to PNG at build time |
| Hosting | GitHub Pages, `master` branch root, custom domain |

## Repository layout

```
site/                      Vite application (the source of truth)
  content/blog/            Markdown posts; filename = URL slug
  scripts/                 Build pipeline
    blog-core.mjs          Frontmatter parser, Markdown rendering, reading time
    blog-schema.mjs        Canonical post shape, normalisation, validation
    content-source.mjs     Markdown or API source selection (build time)
    prerender.mjs          Route enumeration, head tags, JSON-LD, sitemap, OG cards
    og-core.mjs            SVG → PNG social card renderer
    make-og.mjs            Home page social card
    make-favicon.mjs       Favicons and apple-touch icon
  src/
    App.tsx                Route switch shared by SSR and the browser
    components/            Page sections, header/footer, notice bar, cards
    pages/                 Home, blog index, category, post, 404
    data/                  Typed site copy, post helpers, shared types
    lib/                   Head sync, API client, resource hook, class helper
    styles/index.css       Tokens, base styles, every component style
  public/                  Files copied verbatim into the build (og.png, icons, sw.js)
  dist/                    Client build output (gitignored)
  dist-ssr/                Server bundle used only by prerender (gitignored)
  .env.example             Every supported environment variable
  vite.config.ts           Virtual `virtual:blog` module + build config
deploy.mjs                 Build and publish site/dist to the repo root
_old/                      Archived pages, served as-is — do not delete
css/                       Stylesheet used by the archived pages — do not delete
CNAME, .nojekyll           GitHub Pages configuration
index.html, blog/, assets/, sitemap.xml, robots.txt, ...
                           Generated output committed at the root
```

The repository root is also the published site, which is why generated files
sit next to the source. Only `site/` is edited by hand; the root HTML, `assets/`,
`blog/`, `sitemap.xml`, `robots.txt`, and icons are build output.

## Getting started

Requires Node.js `^20.19.0` or `>=22.12.0` (the range Vite supports).

```bash
cd site
npm install
npm run dev        # http://localhost:5173
```

Other useful commands:

```bash
npm run typecheck  # TypeScript only, no emit
npm run build      # full prerender into site/dist
npm run preview    # serve site/dist at http://localhost:4173
```

The dev server serves one shell for every URL; per-route `<title>`, canonical,
and Open Graph tags are only correct in `npm run preview` or the built site,
because they are injected by the prerender step.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Vite dev server with HMR, including live Markdown reloads |
| `npm run build` | Typecheck, client build, SSR build, prerender, OG cards, sitemap |
| `npm run preview` | Serves `site/dist` exactly as deployed |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run assets` | Regenerates favicons and the home social card into `public/` |
| `npm run deploy` | Runs `../deploy.mjs` (build + publish to the repo root) |

## Build pipeline

`npm run build` runs four steps:

1. **Typecheck** — `tsc --noEmit`.
2. **Client build** — `vite build` into `site/dist`.
3. **SSR build** — `vite build --ssr src/entry-server.tsx --outDir dist-ssr`,
   used only by the next step.
4. **Prerender** — `node scripts/prerender.mjs`:
   - loads every post through `scripts/content-source.mjs`;
   - renders each route with `renderToString` from the SSR bundle;
   - injects that route's `<title>`, description, canonical, Open Graph,
     Twitter, and JSON-LD between the `<!--seo-->` markers;
   - writes `<route>/index.html`, so GitHub Pages serves it directly;
   - renders a 1200×630 social card per post;
   - writes `sitemap.xml`.

A current build produces **21 routes** (13 posts, 6 categories, home, blog index)
plus **13 post social cards**. The 404 page is intentionally excluded from the
sitemap and marked `noindex`.

The Vite plugin exposes the same posts to the app as the virtual module
`virtual:blog`, so the client bundle, the SSR render, and the prerender step can
never disagree about content.

## Deploying

From the repository root:

```bash
node deploy.mjs
```

This builds the site and copies `site/dist/*` over the repository root. Before
copying it removes the previous `assets/`, `blog/`, `_next/`, and `_not-found/`
so stale hashed files never accumulate; removing `blog/` also drops pages and
cards for deleted posts.

Preserved deliberately:

- `_old/` — archived pages, linked from the live site;
- `css/` — stylesheet used by those archived pages;
- `CNAME`, `.nojekyll`, `.htaccess`.

The script does **not** commit or push. Review the diff, then:

```bash
git add -A && git commit -m "..." && git push origin master
```

GitHub Pages serves the `master` branch root and redeploys in roughly one to
three minutes. There is no GitHub Actions workflow, by design.

## Writing content

Create a Markdown file in `site/content/blog/`. The filename is the URL:

```
site/content/blog/when-micro-frontends-are-worth-their-complexity.md
→ /blog/when-micro-frontends-are-worth-their-complexity/
```

```markdown
---
title: When micro frontends are worth their complexity
date: 2026-10-05
updated: 2026-10-12
category: Architecture
summary: One or two sentences used for the listing and meta description.
tags: Micro frontends, Architecture, Module Federation
---

Body in Markdown. Headings, lists, links, quotes, images, and fenced code
blocks are all supported.
```

| Field | Required | Notes |
| --- | --- | --- |
| `title` | yes | Visible heading and document title |
| `date` | yes | `YYYY-MM-DD`; drives ordering and `datePublished` |
| `updated` | no | Enables "Updated …" and `dateModified` |
| `category` | yes | Category pages are generated from the values in use |
| `summary` | yes | Listing copy and meta description; keep it under ~160 characters |
| `tags` | no | Comma-separated; used in JSON-LD keywords |

Behaviour worth knowing:

- Posts are sorted newest first everywhere.
- Reading time is calculated at roughly 200 words per minute.
- The slug is the filename, so renaming a file changes the URL.
- The document title keeps a `| Dikshant Patodia` suffix only when the whole
  string fits in 60 characters; longer headlines drop the suffix rather than be
  truncated in search results.
- Mermaid diagrams are not rendered; they ship as labelled ```mermaid code
  blocks.
- Every post gets its own social card automatically.
- New posts appear in the header notice bar, the home banner, and the journal
  archive without further edits.

## New-post alerts

Readers can opt in to browser notifications from the button under the blog
index header. Nothing is requested automatically; permission is asked for on
that click only.

How it works today, without a server:

1. The reader clicks **Notify me of new notes** and grants permission.
2. `public/sw.js` is registered and the newest post's date is stored in
   `localStorage` as "seen".
3. On later visits, `NewPostAlerts` (mounted on every page) compares the newest
   post with that stored date. If it is newer, the service worker raises a
   system notification; clicking it opens the article.
4. **Turn off** stops alerts locally without revoking the browser permission.

Files: `site/src/lib/notifications.ts`, `site/src/components/NotifyToggle.tsx`,
`site/src/components/NewPostAlerts.tsx`, `site/public/sw.js`.

### Honest limitations

The site is static, so **there is no push sender**: notifications appear the next
time the reader visits the site, not the moment a post ships. True background
push needs a small endpoint that stores subscriptions and sends with VAPID keys
(and, on iOS, a reader who has added the site to the home screen). The service
worker already handles `push` and `notificationclick`, so adding that endpoint
later requires no change to the client beyond subscribing with the public key.

The worker deliberately has **no fetch handler and no cache** — pages stay
static and fingerprinted, and a caching worker would only risk stale content.

Storage is a single `localStorage` key (`dp:blog-alerts:v1`): a mute flag and
the last seen post. No account, no third party, no tracking.

## Backend integration

The site is prerendered, so it keeps a hard line between the two kinds of data:

- **Indexable content is fetched at build time** and written to static HTML.
  Search engines, social cards, the sitemap, and JSON-LD all see real markup,
  and the deployed site needs no server.
- **Interactive data uses a runtime client** (`site/src/lib/api.ts`), only for
  features that need it — comments, forms, search, reactions.

Neither layer knows which language or framework the backend uses. Both speak
JSON over HTTP, so REST, GraphQL, serverless functions, and BFFs all fit.

### Content from an API (build time)

Markdown is the default. To build the same site from an API instead:

```bash
cd site
BLOG_SOURCE=api BLOG_API_URL=https://api.example.com npm run build
```

`GET <BLOG_API_URL><BLOG_API_POSTS_PATH>` (default `/posts`) must return either
an array or an envelope:
`{ "posts" | "items" | "data" | "results" | "records": [...] }`.
An optional `BLOG_API_TOKEN` is sent as `Authorization: Bearer <token>`.

Each record is normalised in `site/scripts/blog-schema.mjs` into the `BlogPost`
shape used everywhere (`site/src/data/types.ts`):

| Field | Accepted names | Notes |
| --- | --- | --- |
| `title` | `title` | Required |
| `html` | `html`, `body`, `content` | Required — rendered HTML, not Markdown |
| `date` | `date`, `publishedAt`, `published_at`, `createdAt` | Required; any parseable date becomes `YYYY-MM-DD` |
| `slug` | `slug`, `id` | Derived from the title when absent |
| `category` | `category` (string or `{ name, slug }`), `categoryName`, `section` | Slug derived from the name |
| `summary` | `summary`, `excerpt`, `description` | Falls back to an excerpt of the body |
| `tags` | `tags`, `keywords` | Array or comma-separated string |
| `minutes` | `minutes`, `readingTime` | Calculated from the body when absent |
| `updated` | `updated`, `updatedAt`, `modifiedAt` | Optional |

The build fails — naming the offending record — if a post is missing a required
field, has an unparseable date, or duplicates another post's slug. It never
silently ships an empty or half-broken page.

Configuration is read from the environment or from `site/.env` /
`site/.env.local` (real environment variables win, and secrets stay build-side).
Copy `site/.env.example` to start. The Markdown and API sources produce
byte-identical output for the same content.

### Runtime API (optional)

Set `VITE_API_BASE_URL` to enable client-side calls:

```ts
import { getApiClient } from '@/lib/api'
import { useResource } from '@/lib/use-resource'

const client = getApiClient()
const posts = await client.get<Post[]>('/search', { query: { q: term } })

const result = useResource((signal) => client.get('/comments', { query: { slug }, signal }), [slug])
```

`ApiError` normalises every failure (`status`, stable `code`, parsed body,
`requestId`, `isTimeout`, `isNotFound`, `isRetryable`). Requests time out,
retries back off and honour `Retry-After`, and in-flight calls abort on unmount
or dependency change. `useResource` exposes `idle / loading / success / error`
plus `reload()`, and keeps the previous data during a refetch.

Only `VITE_*` variables reach the browser, and they are inlined at build time —
never put secrets in them. Do not gate indexable content on runtime requests;
fetch that at build time so pages stay crawlable. The runtime modules are
tree-shaken out until a feature imports them, so they add nothing to today's
bundle.

## SEO

Every indexable route is generated with:

- a unique `<title>` and meta description (aim: title ≤ 60 characters,
  description 50–160);
- a self-referencing canonical URL with a trailing slash, always on
  `https://www.dikshantpatodia.in`;
- Open Graph and Twitter tags, including a per-post 1200×630 image and image alt
  text;
- `robots` set to `index, follow, max-image-preview:large`;
- structured data:
  - home — `Person` and an `ItemList` of the three newest posts;
  - blog index — `Blog` with every `BlogPosting` and a `BreadcrumbList`;
  - post — `BlogPosting` (headline, dates, author, image, keywords,
    `wordCount`, section) and a `BreadcrumbList`;
  - category — `CollectionPage` and a `BreadcrumbList`.

Supporting files:

- `sitemap.xml` lists every indexable URL with a `lastmod`; the 404 is excluded.
- `robots.txt` allows everything and points at the sitemap.
- `404.html` is a self-contained, noindex page.

On-page rules:

- One `<h1>` per page; headings never skip a level. Blog and category listings
  use `<h2>` per post, the home journal uses `<h3>` under its section heading.
- Internal links are root-relative, trailing-slashed, and always real anchors —
  the notice bar, latest-posts banner, journal, and blog lists are prerendered.
- The home page links to six posts (the three newest in the banner, the next
  three in the journal), so no listing is repeated on the same page.
- Dates are marked up with `<time datetime>`.

## Performance

- Content is rendered at build time; there is no client-side fetch for anything
  indexable and no hydration-blocking data request.
- One JavaScript bundle (roughly 160 KB gzipped) and one CSS file (roughly 8 KB
  gzipped). Assets are fingerprinted, so they are cached permanently.
- Fonts are self-hosted variable WOFF2 files with `font-display: swap`.
- The home page contains no raster images; social cards are separate files.
- The notice bar and latest-posts banner are plain markup with no images, so
  they cannot cause layout shift.

## Design system and styling

All styling lives in `site/src/styles/index.css`. Tailwind v4 exposes design
tokens through `@theme`:

| Token | Value / role |
| --- | --- |
| `--color-paper` | `#f6f4ef` — page background |
| `--color-paper-2`, `--color-paper-3` | Panel and inset surfaces |
| `--color-ink`, `--color-ink-soft` | Text and secondary text |
| `--color-muted`, `--color-faint` | Meta text |
| `--color-line`, `--color-line-strong` | Borders and rules |
| `--color-accent` | `#2440e0` — the single cobalt accent |
| `--color-accent-ink`, `--color-accent-soft` | Accent text and wash |
| `--font-display` | Fraunces variable, headings and display type |
| `--font-sans` | Inter variable, body |
| `--font-mono` | JetBrains Mono, labels and metadata |
| `--radius` | 2px, used almost everywhere |

Layout constants live on `:root`: `--max` (1180px content width), `--gutter`,
`--section-y`, and `--header-h`. Article typography is handled by `.prose`,
which styles headings, lists, quotes, tables, code blocks, and the labelled
`mermaid` block.

The visual language is editorial: warm paper, near-black ink, serif display
type, mono labels, hairline rules, and one accent colour. New UI should reuse
these tokens rather than introducing new colours or type sizes.

## Accessibility

- A skip link precedes the header on every page.
- Visible `:focus-visible` outlines everywhere, including a paper-on-cobalt
  outline inside the notice bar.
- `prefers-reduced-motion` removes reveal animations, hover transforms, and the
  notice bar pulse.
- The playground uses real `role="tab"`, `role="tabpanel"`, and `aria-selected`
  semantics with keyboard support.
- Decorative SVG and iconography are `aria-hidden`; meaningful diagrams carry
  `role="img"` and a label.
- Landmarks are explicit: `header`, `nav`, `main`, `footer`, and a labelled
  `aside` for the latest-article notice.
- Status changes (copy-email confirmation, playground detail) use `aria-live`.

## Configuration reference

Build-time (Node, never exposed to the browser):

| Variable | Default | Purpose |
| --- | --- | --- |
| `BLOG_SOURCE` | `markdown` | `markdown` or `api` |
| `BLOG_DIR` | `site/content/blog` | Markdown directory override |
| `BLOG_API_URL` | — | Required when `BLOG_SOURCE=api` |
| `BLOG_API_POSTS_PATH` | `/posts` | Path appended to the API URL |
| `BLOG_API_TOKEN` | — | Sent as a bearer token |
| `BLOG_API_TIMEOUT_MS` | `15000` | Request deadline |

Runtime (inlined into the client bundle):

| Variable | Default | Purpose |
| --- | --- | --- |
| `VITE_API_BASE_URL` | — | Enables the runtime API client |
| `VITE_API_TIMEOUT_MS` | `15000` | Per-request deadline |

Environment values are read from `site/.env` and `site/.env.local`, with real
environment variables taking precedence. `.env` is gitignored; only
`.env.example` is committed.

## Conventions

- **Voice.** First person, specific, and unhyped. The author develops; he does
  not claim to design.
- **No invented numbers.** Metrics on the site are limited to documented
  production work: 8+ years, many micro frontends, 33.2% LCP/INP improvement on
  one of several projects, 1000+ tests, 78% → 93% coverage, 60+ components
  across five modules, teams of three and six.
- **British spelling.** *Memoisation*, *behaviour*, *colour* — except where a
  quoted title uses US spelling.
- **No analytics, trackers, or cookies.** The footer says so, and it must stay
  true.
- **No résumé.** The site describes problems and decisions, never an employer
  timeline.
- **Static only.** No GitHub Actions and no runtime server; publishing is a
  branch push.
- **Never delete `_old/` or `css/`.** Archived pages depend on them.
- **Review before pushing.** Build scripts write to the working tree but never
  commit.
