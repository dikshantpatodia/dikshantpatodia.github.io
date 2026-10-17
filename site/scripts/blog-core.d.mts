import type { BlogPost } from '../src/data/types'

/** Normalises a title or filename into a URL-safe slug. */
export function slugify(value: string): string

/** Reads every Markdown file in `contentDir`, newest first. */
export function loadPosts(contentDir: string): Promise<BlogPost[]>
