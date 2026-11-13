/**
 * The contract between the site and whatever produces its content.
 *
 * Markdown and a remote API both have to yield the same `BlogPost` shape
 * (`src/data/types.ts`), because every page, the sitemap, and the social cards
 * are generated from it. This module is the single place that turns an
 * untrusted record into that shape, so a backend can change without any
 * component changing, and a bad payload fails the build with a message that
 * names the offending record instead of rendering an empty page.
 *
 * Only build-time code imports this file (it never reaches the browser).
 */
import { slugify } from './blog-core.mjs'

export class ContentError extends Error {
  constructor(message, details) {
    super(message)
    this.name = 'ContentError'
    this.details = details
  }
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/

/** First defined, non-empty field among `keys`. */
function pick(source, keys) {
  for (const key of keys) {
    const value = source[key]
    if (value !== undefined && value !== null && value !== '') return value
  }
  return undefined
}

function asDate(value, where) {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 10)
  }

  const text = String(value ?? '').trim()
  if (ISO_DATE.test(text)) return text

  const parsed = new Date(text)
  if (Number.isNaN(parsed.getTime())) {
    throw new ContentError(`${where}: expected a date, received "${text}"`)
  }
  return parsed.toISOString().slice(0, 10)
}

function asTags(value) {
  if (Array.isArray(value)) return value.map((tag) => String(tag).trim()).filter(Boolean)
  if (typeof value === 'string') {
    return value
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean)
  }
  return []
}

function asCategory(value) {
  if (value && typeof value === 'object') {
    const name = String(value.name ?? value.title ?? 'Uncategorised').trim()
    const slug = String(value.slug ?? slugify(name))
    return { name: name || 'Uncategorised', slug: slug || slugify(name) }
  }

  const name = String(value ?? 'Uncategorised').trim() || 'Uncategorised'
  return { name, slug: slugify(name) }
}

/** Plain-text words in rendered HTML, for reading time. */
function wordCount(html) {
  return html
    .replace(/<(script|style)[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z#0-9]+;/gi, ' ')
    .split(/\s+/)
    .filter(Boolean).length
}

export const readingMinutes = (html) => Math.max(1, Math.round(wordCount(html) / 200))

/** First sentence-ish slice of the body, used only when no summary is sent. */
function excerpt(html, max = 155) {
  const text = html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z#0-9]+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  if (text.length <= max) return text

  const cut = text.slice(0, max + 1)
  const lastSpace = cut.lastIndexOf(' ')
  return `${cut.slice(0, lastSpace > 40 ? lastSpace : max).trimEnd()}…`
}

/**
 * Turns one record into a `BlogPost`. Accepts the field names most content
 * systems already use, so an integration is a config change rather than a
 * rewrite: `html`/`body`/`content`, `summary`/`excerpt`/`description`,
 * `date`/`publishedAt`, and so on.
 */
export function normalizePost(input, index = 0) {
  const where = `post[${index}]`

  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw new ContentError(`${where}: expected an object, received ${Array.isArray(input) ? 'an array' : typeof input}`)
  }

  const title = String(pick(input, ['title', 'name']) ?? '').trim()
  if (!title) throw new ContentError(`${where}: "title" is required`)

  const html = pick(input, ['html', 'body', 'content'])
  if (typeof html !== 'string' || !html.trim()) {
    throw new ContentError(`${where} ("${title}"): "html" is required — send rendered HTML, not raw Markdown`)
  }

  const date = asDate(pick(input, ['date', 'publishedAt', 'published_at', 'createdAt', 'created_at']), where)
  const category = asCategory(pick(input, ['category', 'categoryName', 'category_name', 'section']))
  const categorySlug = String(
    pick(input, ['categorySlug', 'category_slug']) ?? category.slug,
  ).trim()

  const summary = String(pick(input, ['summary', 'excerpt', 'description']) ?? '').trim()
  const minutesValue = Number(pick(input, ['minutes', 'readingTime', 'reading_time']))

  const post = {
    slug: slugify(String(pick(input, ['slug', 'id']) ?? title)),
    title,
    date,
    category: category.name,
    categorySlug: categorySlug || slugify(category.name),
    summary: summary || excerpt(html),
    tags: asTags(pick(input, ['tags', 'keywords'])),
    minutes: Number.isFinite(minutesValue) && minutesValue > 0 ? Math.round(minutesValue) : readingMinutes(html),
    html,
  }

  const updated = pick(input, ['updated', 'updatedAt', 'updated_at', 'modifiedAt', 'modified_at'])
  if (updated !== undefined) post.updated = asDate(updated, where)

  if (!post.slug) throw new ContentError(`${where} ("${title}"): could not derive a slug; send one explicitly`)

  return post
}

/** Normalises a list, rejects duplicate URLs, and sorts newest first. */
export function normalizePosts(records) {
  if (!Array.isArray(records)) {
    throw new ContentError(
      `expected an array of posts, received ${records === null ? 'null' : typeof records}`,
    )
  }

  const posts = records.map((record, index) => normalizePost(record, index))

  const seen = new Map()
  for (const post of posts) {
    const existing = seen.get(post.slug)
    if (existing) {
      throw new ContentError(`duplicate slug "${post.slug}" (${existing} and "${post.title}")`)
    }
    seen.set(post.slug, post.title)
  }

  return posts.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0))
}
