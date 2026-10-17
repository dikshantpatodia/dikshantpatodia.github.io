import { posts } from 'virtual:blog'
import type { BlogCategory, BlogPost } from './types'

/** All posts, newest first (the build pipeline already sorts them). */
export const blogPosts: BlogPost[] = posts

export const blogCategories: BlogCategory[] = (() => {
  const byslug = new Map<string, BlogCategory>()
  for (const post of blogPosts) {
    const existing = byslug.get(post.categorySlug)
    if (existing) existing.count += 1
    else byslug.set(post.categorySlug, { name: post.category, slug: post.categorySlug, count: 1 })
  }
  return [...byslug.values()].sort((a, b) => a.name.localeCompare(b.name))
})()

export function getPost(slug: string): BlogPost | undefined {
  return blogPosts.find((post) => post.slug === slug)
}

export function getCategory(slug: string): BlogCategory | undefined {
  return blogCategories.find((category) => category.slug === slug)
}

export function postsInCategory(slug: string): BlogPost[] {
  return blogPosts.filter((post) => post.categorySlug === slug)
}

export function latestPosts(count: number): BlogPost[] {
  return blogPosts.slice(0, count)
}

/** Previous (older) and next (newer) posts, relative to `slug`. */
export function neighbours(slug: string): { older?: BlogPost; newer?: BlogPost } {
  const index = blogPosts.findIndex((post) => post.slug === slug)
  if (index === -1) return {}
  return { newer: blogPosts[index - 1], older: blogPosts[index + 1] }
}

const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
]

/** `2026-10-17` → `17 Oct 2026` (formatting stays stable between server and client). */
export function formatDate(iso: string): string {
  const [year, month, day] = iso.split('-').map(Number)
  if (!year || !month || !day) return iso
  return `${day} ${MONTHS[month - 1] ?? ''} ${year}`
}

// ---------------------------------------------------------------------------
// URLs.
//
// Every blog route is a directory holding an index.html, and GitHub Pages
// answers the slash-less form with a 301 redirect to the trailing-slash form.
// These helpers emit the URL that actually returns 200, so links, canonicals,
// structured data, and the sitemap never point at a redirect.
// ---------------------------------------------------------------------------

export const blogIndexHref = '/blog/'

export const categoryHref = (slug: string): string => `/blog/category/${slug}/`

export const postHref = (slug: string): string => `/blog/${slug}/`
