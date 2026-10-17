# dikshantpatodia.github.io

Portfolio of **Dikshant Patodia** — Lead Frontend Engineer. A deliberately
minimal, typography-led studio site, not a résumé: editorial case studies, an
interactive engineering playground, and a blog of short engineering notes.

Live at **https://www.dikshantpatodia.in** (GitHub Pages, `master` branch root).

## Stack

- **React 19 + TypeScript (strict)** with **Vite 8**
- **Tailwind CSS 4** (via `@tailwindcss/vite`) for the design system, with a
  hand-written token layer in `site/src/styles/index.css`
- **Motion for React** and **Lucide React** — used sparingly (see below)
- **marked** (dev-only) — renders blog Markdown to HTML at build time
- Self-hosted variable fonts: Inter, Fraunces (roman + italic), JetBrains Mono
- Static output only. No server, database, or runtime SSR.

## Structure

- `site/` — source of the live site.
  - `site/src/data/content.ts` — single source of truth for every word and
    number shown on the home page. Nothing is invented elsewhere; edit copy here.
  - `site/src/data/types.ts` — the shape of the content model.
  - `site/src/routes.ts` — maps a pathname to a page (`/`, `/blog`,
    `/blog/category/<cat>`, `/blog/<slug>`).
  - `site/src/pages/` — `Home`, `BlogIndex`, `BlogPost`, `BlogCategory`,
    `NotFound`.
  - `site/src/components/` — one section per file (`Hero`, `Work`,
    `Playground`, `ArchitectureExplorer`, `PerformanceLab`, `Decisions`,
    `Leadership`, `Journal`, `Contact`, `PostList`, `SiteHeader`, `SiteFooter`),
    plus small `ui/` primitives (`Reveal`, `Term`, `SectionHead`, `Breadcrumbs`,
    `CopyEmail`, `EasterEgg`, `CaseMotif`).
  - `site/src/styles/index.css` — design tokens, base styles, and every
    component class (progressive-enhancement rules live here too).
  - `site/src/entry-server.tsx` + `site/scripts/prerender.mjs` — build-time
    prerender pipeline (below).
  - `site/src/main.tsx` — hydrates prerendered HTML when present, otherwise
    mounts fresh.
  - `site/content/blog/` — the blog, one Markdown file per post (see below).
  - `site/public/` — `favicon.*`, `apple-touch-icon.png`, `og.png`,
    `robots.txt`, `404.html`, résumé PDF. (`sitemap.xml` is generated.)
  - `site/scripts/` — `blog-core.mjs` (Markdown → post data, shared by the Vite
    plugin and the prerenderer), `og-core.mjs`, `make-og.mjs`, `make-favicon.mjs`.
- `_old/` — archived legacy site (`/projects`, `/file-uploader`).
- `css/` — legacy stylesheet used by the archived `_old/projects` pages.
- `CNAME` — `www.dikshantpatodia.in`.
- `.nojekyll` — lets GitHub Pages serve `_old/*` and other underscore paths.
- `deploy.mjs` — builds and publishes (see Deploy).

## Writing a blog post

Drop a Markdown file into `site/content/blog/`. The filename becomes the URL:
`when-micro-frontends-are-worth-their-complexity.md` →
`/blog/when-micro-frontends-are-worth-their-complexity`.

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

Rules:

- `title`, `date` (`YYYY-MM-DD`), `category`, and `summary` are required;
  `tags` is optional and comma-separated.
- `updated` (`YYYY-MM-DD`, alias `modified`) is optional. Add it when you revise
  a post and the article shows **Updated <date>** next to the publication date.
  It also feeds `dateModified`, `article:modified_time`, and the sitemap
  `<lastmod>`. It is ignored if it matches `date`.
- Categories are derived from the posts — adding a new `category:` value
  creates its `/blog/category/<slug>` page on the next build.
- Posts are listed newest first. Reading time is estimated automatically.
- Nothing else to register: the Vite plugin and the prerenderer both read the
  directory, so `npm run dev` and `npm run build` always agree.

## Design constraints (intentional, hard to copy)

- No phone number anywhere in the HTML — it lives only in the résumé PDF.
- No About/Skills/Experience/Projects/Contact template, no job-title timeline.
  Impact is shown through architecture, decisions, and documented outcomes.
- One restrained accent colour, thin separators, generous whitespace,
  asymmetric typography-led layouts. No gradients, blobs, glassmorphism, or
  stock imagery.
- Interactive but understated: contextual tooltips, a copy-email interaction,
  an Easter egg, and an interactive architecture/performance/decisions
  playground — all reduced-motion aware and touch-friendly.
- **No fabricated content.** Metrics, responsibilities, and outcomes come from
  documented work. Missing information is left out or clearly framed, never
  invented.

## Progressive enhancement, SEO & accessibility

- **Every route is prerendered.** `npm run build` runs the client build, an SSR
  build, then writes real HTML per route (`/`, `/blog`,
  `/blog/category/<cat>`, `/blog/<slug>`) with route-specific `<title>`,
  description, canonical, Open Graph tags, and JSON-LD (`Person`, `Blog`,
  `CollectionPage`, `BlogPosting`, `BreadcrumbList`). `main.tsx` hydrates it.
- Blog navigation is ordinary links, so each page is a full static document —
  no client router needed, and crawlers see the finished article.
- `sitemap.xml` is generated from the route list; `robots.txt` points at it.
- Each post gets its own Open Graph card at `/blog/<slug>/og.png`, rendered at
  build time from its title.
- A `js` class is set before first paint, so scroll reveals only hide content
  when JavaScript is available. Reveals use CSS + `IntersectionObserver` (with a
  fallback that reveals everything if `IntersectionObserver` is missing).
- Case studies use native `<details>`/`<summary>`, so they work without
  JavaScript. Playground panels are all present in the DOM; `<noscript>` reveals
  every panel and hides the tab list when JS is off.
- Motion is used only for three client-only, non-initial animations (mobile
  nav, Easter egg toast, decision verdict), so nothing animated renders during
  prerender or hydration.
- Semantic landmarks, keyboard-navigable tabs and disclosures, visible focus
  states, sufficient contrast, and `prefers-reduced-motion` support.

## Regenerating static assets

Favicons and the default social card are committed to `site/public/`. Regenerate
them after changing the design tokens:

```bash
cd site
npm run assets     # make-favicon.mjs (svg/ico/apple-touch) + make-og.mjs (og.png)
```

Per-post social cards are generated automatically during `npm run build`.

## Deploy (GitHub Pages, `master` branch root)

GitHub Pages serves the repository root, so the built site must live at root
next to `_old/`, `css/`, `CNAME`, and `.nojekyll`. This is a **branch-based**
deploy (no GitHub Actions): an Actions deploy from `site/dist` alone would break
`/_old/projects` and `/_old/file-uploader`, which must keep being served.

```bash
cd /Users/dikshantpatodia/code2/dikshantpatodia.github.io
npm install --prefix site          # first time only
npm run dev --prefix site          # preview at http://localhost:5173
node deploy.mjs                    # builds site/dist and copies it to the repo root
```

`node deploy.mjs` runs `npm run build` in `site/`, removes superseded build
directories (`_next/`, `_not-found/`, `assets/`, `blog/`), and copies
`site/dist/*` to the root, preserving `_old/`, `css/`, `CNAME`, `.nojekyll`, and
`.htaccess`. Removing `blog/` first also drops the pages and social cards of
deleted posts. It only touches the working tree — **it does not commit or
push.** Review locally, then:

```bash
git add -A
git commit -m "…"
git push
```

No GitHub repository settings need changing: Pages is already configured for the
`master` branch root with the custom domain from `CNAME`.

## Résumé PDF

Place the latest résumé at
`site/public/dikshant_patodia_lead_frontend_engineer.pdf` before building.
The file currently in the repo is a **placeholder** — replace it with the real
PDF before deploying.
