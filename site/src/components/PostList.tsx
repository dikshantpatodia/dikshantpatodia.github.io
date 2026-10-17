import { ArrowRight } from 'lucide-react'
import { formatDate } from '@/data/blog'
import type { BlogPost } from '@/data/types'

interface PostListProps {
  posts: BlogPost[]
  /** `teaser` trims each row to title, category and date for the home page. */
  variant?: 'full' | 'teaser'
}

export function PostList({ posts, variant = 'full' }: PostListProps) {
  if (posts.length === 0) {
    return <p className="posts__empty">Nothing published here yet.</p>
  }

  return (
    <ol className="posts">
      {posts.map((post) => (
        <li className="post-item" key={post.slug}>
          <a className="post-item__link" href={`/blog/${post.slug}`}>
            <span className="post-item__meta">
              <span className="post-item__cat">{post.category}</span>
              <span className="idx">{formatDate(post.date)}</span>
            </span>
            <h3 className="post-item__title">{post.title}</h3>
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
