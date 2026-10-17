import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { Menu, X } from 'lucide-react'
import { profile } from '@/data/content'

const NAV = [
  { href: '/#work', label: 'Work', index: '01' },
  { href: '/#playground', label: 'Playground', index: '02' },
  { href: '/#leadership', label: 'Leadership', index: '03' },
  { href: '/#journal', label: 'Journal', index: '04' },
  { href: '/#contact', label: 'Contact', index: '05' },
  { href: '/blog/', label: 'Blog', index: '06' },
] as const

export function SiteHeader({ currentPath = '/' }: { currentPath?: string }) {
  const [open, setOpen] = useState(false)
  const reduce = useReducedMotion()
  const onBlog = currentPath.startsWith('/blog')

  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open])

  return (
    <header className="site-header">
      <div className="wrap site-header__inner">
        <a className="brand" href="/" aria-label={`${profile.name} — home`}>
          <span className="brand__mark" aria-hidden="true">
            DP
          </span>
          <span>{profile.name}</span>
        </a>

        <nav className="nav" aria-label="Primary">
          {NAV.map((item) => {
            const isBlog = item.href === '/blog/'
            return (
              <a
                key={item.href}
                className="nav__link"
                href={item.href}
                aria-current={isBlog && onBlog ? 'page' : undefined}
              >
                {item.label}
                <sup aria-hidden="true">{item.index}</sup>
              </a>
            )
          })}
        </nav>

        <button
          type="button"
          className="nav__toggle"
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X size={16} aria-hidden="true" /> : <Menu size={16} aria-hidden="true" />}
          {open ? 'Close' : 'Menu'}
        </button>
      </div>

      <AnimatePresence>
        {open ? (
          <motion.div
            id="mobile-nav"
            className="nav-panel"
            initial={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
            animate={reduce ? { opacity: 1 } : { height: 'auto', opacity: 1 }}
            exit={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <nav className="wrap nav-panel__list" aria-label="Primary mobile">
              {NAV.map((item) => (
                <a
                  key={item.href}
                  className="nav-panel__link"
                  href={item.href}
                  onClick={() => setOpen(false)}
                >
                  <span>{item.label}</span>
                  <span className="idx">{item.index}</span>
                </a>
              ))}
            </nav>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  )
}
