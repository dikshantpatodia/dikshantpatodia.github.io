import { profile } from '@/data/content'

export function SiteFooter() {
  const year = new Date().getFullYear()

  return (
    <footer className="site-footer wrap">
      <div className="site-footer__grid">
        <p className="colophon">
          © {year} {profile.name}. Set in Fraunces, Inter, and JetBrains Mono. Built with Vite, React,
          and Tailwind CSS, and served as static files from GitHub Pages. No trackers, no analytics,
          no cookies.
        </p>
        <nav className="footer-links" aria-label="Footer">
          <a href="/#top">Back to top</a>
          <a href="/blog/">Blog</a>
          <a href={profile.github} target="_blank" rel="noreferrer noopener">
            GitHub
          </a>
          <a href={profile.linkedin} target="_blank" rel="noreferrer noopener">
            LinkedIn
          </a>
          <a href={`mailto:${profile.email}`}>Email</a>
        </nav>
      </div>
    </footer>
  )
}
