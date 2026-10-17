#!/usr/bin/env node
/**
 * Turns the single-page client build into a fully prerendered static site.
 *
 * For every route it renders the app to HTML, writes a route-specific <head>
 * (title, description, canonical, Open Graph, JSON-LD), and writes the result
 * to a real file so GitHub Pages serves it directly:
 *
 *   /                       -> dist/index.html
 *   /blog                   -> dist/blog/index.html
 *   /blog/category/<cat>    -> dist/blog/category/<cat>/index.html
 *   /blog/<slug>            -> dist/blog/<slug>/index.html
 *
 * It also generates each post's social card and a sitemap listing every route.
 *
 * Run after both builds:
 *   vite build && vite build --ssr src/entry-server.tsx --outDir dist-ssr
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { loadPosts } from './blog-core.mjs'
import { renderOgPng } from './og-core.mjs'

const ORIGIN = 'https://www.dikshantpatodia.in'
const SITE_NAME = 'Dikshant Patodia'
const DEFAULT_DESCRIPTION =
  'Dikshant Patodia is a lead frontend engineer who architects systems that stay fast under load, scale across teams, and hold up in production — micro frontends, performance, design systems, and testing.'

const dist = fileURLToPath(new URL('../dist', import.meta.url))
const contentDir = fileURLToPath(new URL('../content/blog', import.meta.url))

const { render } = await import('../dist-ssr/entry-server.js')
const posts = await loadPosts(contentDir)

const categories = [...new Map(posts.map((post) => [post.categorySlug, post.category])).entries()]
  .map(([slug, name]) => ({ slug, name }))
  .sort((a, b) => a.name.localeCompare(b.name))

const escapeHtml = (value) =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

const jsonLd = (value) =>
  JSON.stringify(value).replace(/</g, '\\u003c').replace(/>/g, '\\u003e')

const formatDate = (iso) => {
  const [year, month, day] = iso.split('-').map(Number)
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  if (!year || !month || !day) return iso
  return `${day} ${months[month - 1]} ${year}`
}

/** A post's effective "last touched" date: its revision if it has one. */
const updatedOf = (post) => post.updated ?? post.date

/** Latest revision/publication among a set of posts. */
const latestActivity = (list) =>
  list.reduce((latest, post) => (updatedOf(post) > latest ? updatedOf(post) : latest), '')

/**
 * Absolute URL for a route.
 *
 * Every route here is a directory containing an index.html, and GitHub Pages
 * answers the slash-less form with a 301 to the trailing-slash form. Canonical
 * links, structured data, and the sitemap must therefore name the URL that
 * returns 200 — otherwise the declared canonical is itself a redirect.
 */
const url = (path) => (path === '/' ? `${ORIGIN}/` : `${ORIGIN}${path.replace(/\/+$/, '')}/`)

/** Builds the tags that go between the <!--seo--> markers. */
function head({ title, description, canonical, type = 'website', image, published, modified, structured }) {
  const tags = [
    `<title>${escapeHtml(title)}</title>`,
    `<meta name="description" content="${escapeHtml(description)}" />`,
    `<meta name="author" content="${SITE_NAME}" />`,
    `<link rel="canonical" href="${canonical}" />`,
    '',
    `<meta property="og:type" content="${type}" />`,
    `<meta property="og:site_name" content="${SITE_NAME}" />`,
    `<meta property="og:title" content="${escapeHtml(title)}" />`,
    `<meta property="og:description" content="${escapeHtml(description)}" />`,
    `<meta property="og:url" content="${canonical}" />`,
    `<meta property="og:image" content="${image}" />`,
    `<meta property="og:image:width" content="1200" />`,
    `<meta property="og:image:height" content="630" />`,
  ]

  if (published) {
    tags.push(`<meta property="article:published_time" content="${published}" />`)
  }
  if (modified) {
    tags.push(`<meta property="article:modified_time" content="${modified}" />`)
  }

  tags.push(
    '',
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${escapeHtml(title)}" />`,
    `<meta name="twitter:description" content="${escapeHtml(description)}" />`,
    `<meta name="twitter:image" content="${image}" />`,
  )

  for (const item of structured) {
    tags.push('', `<script type="application/ld+json">${jsonLd(item)}</script>`)
  }

  return tags.join('\n    ')
}

const breadcrumb = (items) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.name,
    item: url(item.path),
  })),
})

const PERSON = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: SITE_NAME,
  jobTitle: 'Lead Frontend Engineer',
  url: `${ORIGIN}/`,
  email: 'mailto:dikshantpatodia@gmail.com',
  sameAs: ['https://linkedin.com/in/dikshantpatodia', 'https://github.com/dikshantpatodia'],
  knowsAbout: [
    'Frontend architecture',
    'Micro frontends',
    'Web performance',
    'Design systems',
    'React',
    'TypeScript',
  ],
}

const routes = [
  {
    path: '/',
    file: 'index.html',
    lastmod: latestActivity(posts),
    seo: () =>
      head({
        title: 'Dikshant Patodia — Lead Frontend Engineer',
        description: DEFAULT_DESCRIPTION,
        canonical: `${ORIGIN}/`,
        image: `${ORIGIN}/og.png`,
        structured: [PERSON],
      }),
  },
  {
    path: '/blog',
    file: 'blog/index.html',
    lastmod: latestActivity(posts),
    seo: () =>
      head({
        title: `Blog — notes on frontend engineering | ${SITE_NAME}`,
        description:
          'Short essays on architecture, performance, design systems, and testing — the frontend decisions that are easy to get wrong.',
        canonical: url('/blog'),
        image: `${ORIGIN}/og.png`,
        structured: [
          {
            '@context': 'https://schema.org',
            '@type': 'Blog',
            name: `Notes on frontend engineering — ${SITE_NAME}`,
            url: url('/blog'),
            description: DEFAULT_DESCRIPTION,
            blogPost: posts.map((post) => ({
              '@type': 'BlogPosting',
              headline: post.title,
              url: url(`/blog/${post.slug}`),
              datePublished: post.date,
            })),
          },
          breadcrumb([
            { name: 'Home', path: '/' },
            { name: 'Blog', path: '/blog' },
          ]),
        ],
      }),
  },
  ...categories.map((category) => ({
    path: `/blog/category/${category.slug}`,
    file: `blog/category/${category.slug}/index.html`,
    lastmod: latestActivity(posts.filter((post) => post.categorySlug === category.slug)),
    seo: () =>
      head({
        title: `${category.name} — blog | ${SITE_NAME}`,
        description: `Frontend notes filed under ${category.name} by ${SITE_NAME}.`,
        canonical: url(`/blog/category/${category.slug}`),
        image: `${ORIGIN}/og.png`,
        structured: [
          {
            '@context': 'https://schema.org',
            '@type': 'CollectionPage',
            name: `${category.name} — ${SITE_NAME}`,
            url: url(`/blog/category/${category.slug}`),
          },
          breadcrumb([
            { name: 'Home', path: '/' },
            { name: 'Blog', path: '/blog' },
            { name: category.name, path: `/blog/category/${category.slug}` },
          ]),
        ],
      }),
  })),
  ...posts.map((post) => ({
    path: `/blog/${post.slug}`,
    file: `blog/${post.slug}/index.html`,
    lastmod: updatedOf(post),
    seo: () =>
      head({
        title: `${post.title} | ${SITE_NAME}`,
        description: post.summary,
        canonical: url(`/blog/${post.slug}`),
        type: 'article',
        image: `${ORIGIN}/blog/${post.slug}/og.png`,
        published: post.date,
        modified: post.updated,
        structured: [
          {
            '@context': 'https://schema.org',
            '@type': 'BlogPosting',
            headline: post.title,
            description: post.summary,
            datePublished: post.date,
            dateModified: updatedOf(post),
            author: { '@type': 'Person', name: SITE_NAME, url: `${ORIGIN}/` },
            publisher: { '@type': 'Person', name: SITE_NAME },
            mainEntityOfPage: url(`/blog/${post.slug}`),
            image: `${ORIGIN}/blog/${post.slug}/og.png`,
            keywords: post.tags.join(', '),
            articleSection: post.category,
            wordCount: post.html.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length,
          },
          breadcrumb([
            { name: 'Home', path: '/' },
            { name: 'Blog', path: '/blog' },
            { name: post.category, path: `/blog/category/${post.categorySlug}` },
            { name: post.title, path: `/blog/${post.slug}` },
          ]),
        ],
      }),
  })),
]

// ---------------------------------------------------------------------------

const template = await readFile(`${dist}/index.html`, 'utf8')
const SEO_BLOCK = /<!--seo-->[\s\S]*?<!--\/seo-->/
const ROOT_MARKER = '<div id="root"></div>'

if (!SEO_BLOCK.test(template)) throw new Error('Could not find the <!--seo--> block in dist/index.html')
if (!template.includes(ROOT_MARKER)) throw new Error('Could not find the #root marker in dist/index.html')

let written = 0

for (const route of routes) {
  const markup = render(route.path)
  const html = template
    .replace(SEO_BLOCK, `<!--seo-->\n    ${route.seo()}\n    <!--/seo-->`)
    .replace(ROOT_MARKER, `<div id="root">${markup}</div>`)

  const target = `${dist}/${route.file}`
  await mkdir(dirname(target), { recursive: true })
  await writeFile(target, html)
  written += 1
}

// Per-post social cards.
for (const post of posts) {
  const png = renderOgPng({
    eyebrow: `${SITE_NAME.toUpperCase()} — ${post.category.toUpperCase()}`,
    title: post.title,
    meta: `${formatDate(post.date)} · ${post.minutes} min read`,
    subline: post.tags.join(' · ') || 'Notes on frontend engineering',
    url: 'dikshantpatodia.in/blog',
  })
  const target = `${dist}/blog/${post.slug}/og.png`
  await mkdir(dirname(target), { recursive: true })
  await writeFile(target, png)
}

// Sitemap.
const lastmod = latestActivity(posts) || new Date().toISOString().slice(0, 10)
const urlEntries = [
  { loc: url('/'), priority: '1.0', changefreq: 'monthly', lastmod },
  { loc: url('/blog'), priority: '0.9', changefreq: 'weekly', lastmod },
  ...categories.map((category) => ({
    loc: url(`/blog/category/${category.slug}`),
    priority: '0.5',
    changefreq: 'monthly',
    lastmod,
  })),
  ...posts.map((post) => ({
    loc: url(`/blog/${post.slug}`),
    priority: '0.7',
    changefreq: 'monthly',
    lastmod: updatedOf(post),
  })),
]

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries
  .map(
    (entry) => `  <url>
    <loc>${entry.loc}</loc>
    <lastmod>${entry.lastmod}</lastmod>
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`,
  )
  .join('\n')}
</urlset>
`
await writeFile(`${dist}/sitemap.xml`, sitemap)

console.log(
  `Prerendered ${written} routes (${posts.length} posts, ${categories.length} categories) + ${posts.length} OG cards + sitemap`,
)
