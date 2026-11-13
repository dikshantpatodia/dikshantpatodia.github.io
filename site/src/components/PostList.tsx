import { ArrowRight } from 'lucide-react'
import { formatDate, postHref } from '@/data/blog'
import type { BlogPost } from '@/data/types'

interface PostListProps {
  posts: BlogPost[]
  /** `teaser` trims each row to title, category and date for the home page. */
  variant?: 'full' | 'teaser'
  /**
   * Heading rank for each title. Blog index and category pages sit directly
   * under their `h1`, so they use 2; the home page nests the list under a
   * section heading and keeps 3.
   */
  headingLevel?: 2 | 3
}

export function PostList({ posts, variant = 'full', headingLevel = 3 }: PostListProps) {
  if (posts.length === 0) {
    return <p className="posts__empty">Nothing published here yet.</p>
  }

  const Heading = headingLevel === 2 ? 'h2' : 'h3'

  return (
    <ol className="posts">
      {posts.map((post) => (
        <li className="post-item" key={post.slug}>
          <a className="post-item__link" href={postHref(post.slug)}>
            <span className="post-item__meta">
              <span className="post-item__cat">{post.category}</span>
              <span className="idx">{formatDate(post.date)}</span>
            </span>
            <Heading className="post-item__title">{post.title}</Heading>
            {variant === 'full' ? <span className="post-item__summary">{post.summary}</span> : null}
            <span className="post-item__more">
              {post.minutes} min read
              <ArrowRight size={14} aria-hidden="true" />
            </span>
          </a>
        </li>
      ))}
    </ol>
  )
}
