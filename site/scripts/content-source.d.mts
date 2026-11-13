import type { BlogPost } from '../src/data/types'

export declare class ContentError extends Error {
  details?: unknown
  constructor(message: string, details?: unknown)
}

export interface ApiSourceConfig {
  baseUrl: string
  path: string
  token: string
  timeoutMs: number
  attempts: number
}

export interface ContentConfig {
  source: 'markdown' | 'api'
  dir: string
  api: ApiSourceConfig
}

/** Validates BLOG_* configuration; throws `ContentError` when it is unusable. */
export function resolveConfig(env?: Record<string, string | undefined>): ContentConfig

/** Every post, newest first, from Markdown or the configured API. */
export function loadContent(options?: {
  env?: Record<string, string | undefined>
  fetchImpl?: typeof fetch
}): Promise<BlogPost[]>
