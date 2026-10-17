import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

interface RevealProps {
  children: ReactNode
  className?: string
  delay?: number
}

/**
 * Reveals content as it scrolls into view.
 *
 * The hidden state is scoped to the `js` class on <html>, so with JavaScript
 * disabled the content is simply visible. Uses IntersectionObserver + CSS
 * rather than an animation library, keeping the client bundle small.
 */
export function Reveal({ children, className, delay = 0 }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      element.classList.add('is-in')
      return
    }

    if (typeof IntersectionObserver === 'undefined') {
      element.classList.add('is-in')
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            element.classList.add('is-in')
            observer.disconnect()
          }
        })
      },
      { rootMargin: '0px 0px -12% 0px' },
    )
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={cn('reveal', className)}
      style={delay ? { transitionDelay: `${delay}s` } : undefined}
    >
      {children}
    </div>
  )
}
