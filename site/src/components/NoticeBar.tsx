import { ArrowRight } from 'lucide-react'
import {
  blogIndexHref,
  blogPosts,
  featuredPost,
  formatDate,
  postHref,
} from '@/data/blog'

/**
 * Site-wide announcement strip pinned under the header. It advertises the
 * featured note (the newest one when nothing is pinned) on every page, which
 * gives that article the strongest internal link the site can offer. Rendered
 * on the server as a real anchor.
 */
export function NoticeBar({ currentSlug }: { currentSlug?: string }) {
  const post = featuredPost()
  if (!post || post.slug === currentSlug) return null

  const pinned = Boolean(post.featured)

  return (
    <aside className="notice" aria-label={pinned ? 'Featured article' : 'Latest article'}>
      <div className="wrap notice__inner">
        <span className="notice__tag">
          <span className="notice__pulse" aria-hidden="true" />
          {pinned ? 'Featured' : 'New'}
        </span>

        <a className="notice__link" href={postHref(post.slug)}>
          <span className="notice__title">{post.title}</span>
          <ArrowRight className="notice__arrow" size={14} aria-hidden="true" />
        </a>

        <time className="notice__date" dateTime={post.date}>
          {formatDate(post.date)}
        </time>

        <a className="notice__all" href={blogIndexHref}>
          All {blogPosts.length} notes
        </a>
      </div>
    </aside>
  )
}
