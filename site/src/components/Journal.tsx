import { ArrowRight } from 'lucide-react'
import { PostList } from './PostList'
import { SectionHead } from './ui/SectionHead'
import { blogIndexHref, blogPosts, homeHighlights, latestPosts } from '@/data/blog'

export function Journal() {
  // The banner above the fold already carries the featured post and the newest
  // ones, so this section continues the archive without repeating them.
  const banner = homeHighlights(3)
  const rest = blogPosts.filter((post) => !banner.some((shown) => shown.slug === post.slug))
  const posts = rest.length > 0 ? rest.slice(0, 3) : latestPosts(3)

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
