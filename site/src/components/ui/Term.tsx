import { useId, useState } from 'react'
import type { ReactNode } from 'react'
import { glossary } from '@/data/content'

interface TermProps {
  /** Key into the glossary. */
  k: string
  children?: ReactNode
}

/**
 * Inline technical term with an accessible explanation. Opens on hover and
 * focus, and toggles on tap for touch devices.
 */
export function Term({ k, children }: TermProps) {
  const [open, setOpen] = useState(false)
  const id = useId()
  const tip = glossary[k]

  if (!tip) return <>{children ?? k}</>

  return (
    <button
      type="button"
      className="term"
      aria-describedby={open ? id : undefined}
      aria-expanded={open}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
      onClick={() => setOpen((value) => !value)}
    >
      {children ?? k}
      {open ? (
        <span role="tooltip" id={id} className="term__tip">
          {tip}
        </span>
      ) : null}
    </button>
  )
}
