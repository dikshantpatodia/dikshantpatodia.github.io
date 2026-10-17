import type { CaseMotif as MotifKind } from '@/data/types'

const stroke = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.25 } as const
const faint = { fill: 'none', stroke: 'var(--color-line-strong)', strokeWidth: 1 } as const

function ArchitectureMotif() {
  return (
    <svg viewBox="0 0 420 140" role="img" aria-label="A host shell loading three independently deployed remotes over a shared design system.">
      <g {...stroke}>
        <rect x="160" y="8" width="100" height="28" rx="2" />
        <rect x="24" y="72" width="96" height="28" rx="2" />
        <rect x="162" y="72" width="96" height="28" rx="2" />
        <rect x="300" y="72" width="96" height="28" rx="2" />
      </g>
      <g {...faint}>
        <line x1="210" y1="36" x2="72" y2="72" />
        <line x1="210" y1="36" x2="210" y2="72" />
        <line x1="210" y1="36" x2="348" y2="72" />
      </g>
      <line x1="24" y1="122" x2="396" y2="122" stroke="var(--color-accent)" strokeWidth="1.25" strokeDasharray="4 5" />
      <circle cx="210" cy="122" r="3" fill="var(--color-accent)" />
    </svg>
  )
}

function PerformanceMotif() {
  return (
    <svg viewBox="0 0 420 140" role="img" aria-label="Three routes shipping less JavaScript after splitting by route and deferring the rest.">
      <line x1="16" y1="124" x2="404" y2="124" stroke="var(--color-line-strong)" />
      <g fill="var(--color-paper-3)">
        <rect x="28" y="34" width="34" height="90" />
        <rect x="74" y="22" width="34" height="102" />
        <rect x="120" y="28" width="34" height="96" />
      </g>
      <g fill="var(--color-accent)">
        <rect x="228" y="86" width="34" height="38" />
        <rect x="274" y="66" width="34" height="58" />
        <rect x="320" y="78" width="34" height="46" />
      </g>
      <line x1="210" y1="12" x2="210" y2="124" stroke="var(--color-line)" strokeDasharray="3 4" />
    </svg>
  )
}

function QualityMotif() {
  const cells = Array.from({ length: 70 }, (_, index) => index)
  return (
    <svg viewBox="0 0 420 140" role="img" aria-label="A grid of tests: most lines covered, the critical paths marked.">
      {cells.map((index) => {
        const column = index % 14
        const row = Math.floor(index / 14)
        const critical = index % 9 === 4 || index % 13 === 7
        return (
          <rect
            key={index}
            x={20 + column * 28}
            y={12 + row * 24}
            width="16"
            height="16"
            rx="1.5"
            fill={critical ? 'var(--color-accent)' : 'var(--color-paper-3)'}
          />
        )
      })}
    </svg>
  )
}

function SystemMotif() {
  return (
    <svg viewBox="0 0 420 140" role="img" aria-label="Components composed from primitives into larger interface blocks.">
      <g {...stroke}>
        <rect x="24" y="24" width="372" height="92" rx="2" />
        <rect x="40" y="40" width="120" height="60" rx="2" />
        <rect x="172" y="40" width="100" height="26" rx="2" />
        <rect x="172" y="74" width="100" height="26" rx="2" />
        <rect x="284" y="40" width="96" height="60" rx="2" />
      </g>
      <g fill="var(--color-accent)">
        <circle cx="62" cy="60" r="3" />
        <circle cx="78" cy="60" r="3" />
      </g>
      <line x1="40" y1="116" x2="160" y2="116" stroke="var(--color-accent)" strokeWidth="1.25" />
    </svg>
  )
}

export function CaseMotif({ motif }: { motif: MotifKind }) {
  switch (motif) {
    case 'architecture':
      return <ArchitectureMotif />
    case 'performance':
      return <PerformanceMotif />
    case 'quality':
      return <QualityMotif />
    case 'system':
      return <SystemMotif />
  }
}
