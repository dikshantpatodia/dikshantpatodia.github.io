/**
 * Build-time blog pipeline. Reads Markdown files from site/content/blog,
 * parses YAML-ish frontmatter, renders the body with marked, and returns a
 * plain data array.
 *
 * Used by two consumers so they can never disagree:
 *   - the Vite plugin in vite.config.ts (exposes `virtual:blog` to the app)
 *   - scripts/prerender.mjs (enumerates routes and writes per-route HTML)
 */
import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { marked } from 'marked'

marked.setOptions({ gfm: true, breaks: false })

export function slugify(value) {
  return String(value)
    .toLowerCase()
    .trim()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/** Minimal frontmatter parser: `key: value` lines between `---` fences. */
function parseFrontmatter(raw) {
  if (!raw.startsWith('---')) return { data: {}, body: raw }

  const end = raw.indexOf('\n---', 3)
  if (end === -1) return { data: {}, body: raw }

  const head = raw.slice(3, end)
  const body = raw.slice(end + 4).replace(/^\s+/, '')
  const data = {}

  for (const line of head.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue

    const separator = trimmed.indexOf(':')
    if (separator === -1) continue

    const key = trimmed.slice(0, separator).trim()
    let value = trimmed.slice(separator + 1).trim()

    const quoted =
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    if (quoted) value = value.slice(1, -1)

    data[key] = value
  }

  return { data, body }
}

function readingMinutes(markdown) {
  const words = markdown.trim().split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.ceil(words / 200))
}

function toPost(fileName, raw) {
  const { data, body } = parseFrontmatter(raw)
  const slug = data.slug ? slugify(data.slug) : slugify(fileName.replace(/\.md$/, ''))
  const category = data.category ?? 'Notes'
  const date = (data.date ?? '').trim()

  // `updated:` (or its `modified:` alias) marks a revision. It is dropped when
  // it matches the publication date, so it only ever signals a real change.
  const revised = (data.updated ?? data.modified ?? '').trim()

  return {
    slug,
    title: data.title ?? slug,
    date,
    updated: revised && revised !== date ? revised : undefined,
    category,
    categorySlug: slugify(category),
    summary: data.summary ?? '',
    tags: data.tags
      ? data.tags
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean)
      : [],
    minutes: readingMinutes(body),
    html: marked.parse(body).trim(),
  }
}

/** Returns all posts, newest first. */
export async function loadPosts(contentDir) {
  let files
  try {
    files = await readdir(contentDir)
  } catch {
    return []
  }

  const markdown = files.filter((file) => file.endsWith('.md')).sort()
  const posts = await Promise.all(
    markdown.map(async (file) => toPost(file, await readFile(join(contentDir, file), 'utf8'))),
  )

  return posts.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0))
}
