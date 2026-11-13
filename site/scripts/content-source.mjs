/**
 * Where the site's content comes from.
 *
 * Everything downstream (the app, the sitemap, per-post social cards, JSON-LD)
 * consumes the same `BlogPost[]`, so switching from Markdown to an API is one
 * environment variable, not a refactor. The HTTP branch deliberately makes no
 * assumptions about the server: any stack that returns JSON over HTTPS works.
 *
 *   BLOG_SOURCE=markdown                        (default) site/content/blog
 *   BLOG_SOURCE=api BLOG_API_URL=https://...    GET <url><path> -> JSON
 *
 * Optional: BLOG_API_TOKEN, BLOG_API_POSTS_PATH (default /posts),
 * BLOG_API_TIMEOUT_MS (default 15000), BLOG_DIR (markdown directory).
 *
 * Values may come from the environment or from site/.env / site/.env.local.
 */
import { readFile } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { loadPosts } from './blog-core.mjs'
import { ContentError, normalizePosts } from './blog-schema.mjs'

const SITE_ROOT = fileURLToPath(new URL('..', import.meta.url))
const DEFAULT_CONTENT_DIR = join(SITE_ROOT, 'content', 'blog')

const ENV_PATTERN = /^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/

/** Minimal .env reader: KEY=value lines, optional quotes, no interpolation. */
async function readDotEnv() {
  const values = {}

  for (const name of ['.env', '.env.local']) {
    let text
    try {
      text = await readFile(join(SITE_ROOT, name), 'utf8')
    } catch {
      continue
    }

    for (const line of text.split('\n')) {
      const match = ENV_PATTERN.exec(line)
      if (!match) continue
      let value = match[2].trim()
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1)
      }
      values[match[1]] = value
    }
  }

  // Real environment variables always win over files.
  for (const [key, value] of Object.entries(process.env)) {
    if (value !== undefined) values[key] = value
  }

  return values
}

const positiveInt = (value, fallback) => {
  const number = Number(value)
  return Number.isFinite(number) && number > 0 ? Math.round(number) : fallback
}

const normalisePath = (value, fallback) => {
  const path = String(value ?? fallback).trim() || fallback
  return path.startsWith('/') ? path : `/${path}`
}

/**
 * Validates the configuration up front. A half-configured API source is a
 * build-time error with a readable message, not a silently empty blog.
 */
export function resolveConfig(env = {}) {
  const source = String(env.BLOG_SOURCE ?? 'markdown').trim().toLowerCase()

  if (source !== 'markdown' && source !== 'api') {
    throw new ContentError(`BLOG_SOURCE must be "markdown" or "api", received "${source}"`)
  }

  const baseUrl = String(env.BLOG_API_URL ?? '')
    .trim()
    .replace(/\/+$/, '')

  if (source === 'api' && !baseUrl) {
    throw new ContentError('BLOG_SOURCE=api requires BLOG_API_URL')
  }
  if (source === 'api' && !/^https?:\/\//.test(baseUrl)) {
    throw new ContentError(`BLOG_API_URL must start with http:// or https://, received "${baseUrl}"`)
  }

  return {
    source,
    dir: env.BLOG_DIR ? resolve(String(env.BLOG_DIR)) : DEFAULT_CONTENT_DIR,
    api: {
      baseUrl,
      path: normalisePath(env.BLOG_API_POSTS_PATH, '/posts'),
      token: String(env.BLOG_API_TOKEN ?? '').trim(),
      timeoutMs: positiveInt(env.BLOG_API_TIMEOUT_MS, 15_000),
      attempts: 3,
    },
  }
}

/** Accepts a bare array or the envelopes most APIs wrap lists in. */
function unwrap(payload) {
  if (Array.isArray(payload)) return payload

  for (const key of ['posts', 'items', 'data', 'results', 'records']) {
    const value = payload?.[key]
    if (Array.isArray(value)) return value
    if (value && Array.isArray(value.items)) return value.items
    if (value && Array.isArray(value.posts)) return value.posts
  }

  throw new ContentError(
    'API response did not contain an array of posts. Expected [...] or { posts | items | data | results | records: [...] }.',
  )
}

const sleep = (ms) => new Promise((done) => setTimeout(done, ms))

async function fetchPosts(api, fetchImpl) {
  if (typeof fetchImpl !== 'function') {
    throw new ContentError('No fetch implementation available to load content from the API')
  }

  const url = `${api.baseUrl}${api.path}`
  let lastError

  for (let attempt = 1; attempt <= api.attempts; attempt += 1) {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), api.timeoutMs)

    try {
      const response = await fetchImpl(url, {
        headers: {
          accept: 'application/json',
          ...(api.token ? { authorization: `Bearer ${api.token}` } : {}),
        },
        signal: controller.signal,
      })

      if (!response.ok) {
        const detail = await response.text().catch(() => '')
        const suffix = detail ? `: ${detail.slice(0, 300)}` : ''
        throw new ContentError(`GET ${url} responded ${response.status}${suffix}`)
      }

      return normalizePosts(unwrap(await response.json()))
    } catch (error) {
      lastError = error

      const retryable =
        !(error instanceof ContentError) &&
        (error?.name === 'AbortError' || !error?.status || error.status >= 500)

      if (!retryable || attempt === api.attempts) break
      await sleep(400 * attempt)
    } finally {
      clearTimeout(timer)
    }
  }

  throw lastError
}

/**
 * Loads every post, newest first, from Markdown or an API.
 * Both branches return the exact same shape, so callers never branch again.
 */
export async function loadContent({ env, fetchImpl = globalThis.fetch } = {}) {
  const config = resolveConfig(env ?? (await readDotEnv()))

  if (config.source === 'markdown') return loadPosts(config.dir)

  return fetchPosts(config.api, fetchImpl)
}
