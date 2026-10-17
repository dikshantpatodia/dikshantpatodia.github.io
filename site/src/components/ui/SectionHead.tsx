import type { ReactNode } from 'react'
import { Reveal } from './Reveal'

interface SectionHeadProps {
  index: string
  label: string
  title: ReactNode
  lede?: ReactNode
  titleId?: string
}

/** Consistent editorial section header: mono label on the left, title on the right. */
export function SectionHead({ index, label, title, lede, titleId }: SectionHeadProps) {
  return (
    <Reveal>
      <div className="section-head">
        <div className="section-head__label">
          <span className="idx">{index}</span>
          <span className="eyebrow">{label}</span>
        </div>
        <div>
          <h2 className="section-title" id={titleId}>
            {title}
          </h2>
          {lede ? <p className="section-lede">{lede}</p> : null}
        </div>
      </div>
    </Reveal>
  )
}
