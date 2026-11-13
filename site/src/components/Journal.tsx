import { ArrowRight } from 'lucide-react'
import { PostList } from './PostList'
import { SectionHead } from './ui/SectionHead'
import { blogIndexHref, blogPosts, latestPosts } from '@/data/blog'

export function Journal() {
  // The banner above the fold already carries the three newest posts, so this
  // section continues the archive instead of repeating them on the same page.
  const older = blogPosts.slice(3, 6)
  const posts = older.length > 0 ? older : latestPosts(3)

  return (
    <section className="section wrap" id="journal" aria-labelledby="journal-title">
      <SectionHead
        index="04"
        label="Journal"
        titleId="journal-title"
        title={<>Notes on frontend engineering.</>}
        lede="Short essays on the decisions that are easy to get wrong. New notes land on the blog, roughly every few days."
      />

      <PostList posts={posts} variant="teaser" />

      <p className="posts__more">
        <a className="btn btn--line" href={blogIndexHref}>
          Read the blog
          <ArrowRight aria-hidden="true" />
        </a>
      </p>
    </section>
  )
}
