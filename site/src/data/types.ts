// Domain types for the portfolio content. Kept separate from the content
// itself so components depend on the shape, not the values (DIP).

export interface Profile {
  name: string
  role: string
  email: string
  linkedin: string
  github: string
  location: string
  resumeHref: string
  headline: string
  lede: string
}

export interface Signal {
  value: string
  label: string
}

export type CaseMotif = 'architecture' | 'performance' | 'quality' | 'system'

export interface CaseOutcome {
  value: string
  label: string
}

export interface CaseStudy {
  id: string
  index: string
  kicker: string
  title: string
  summary: string
  problem: string
  mattered: string
  contribution: string[]
  constraints: string[]
  approach: string[]
  outcome: CaseOutcome[]
  demonstrates: string
  tags: string[]
  motif: CaseMotif
}

export type ArchKind = 'host' | 'remote' | 'shared' | 'boundary' | 'resilience'

export interface ArchNode {
  id: string
  title: string
  kind: ArchKind
  role: string
  detail: string
}

export interface ArchTradeoff {
  id: string
  title: string
  body: string
}

export interface PerfRoute {
  id: string
  label: string
  /** Illustrative initial JS shipped, in KB, when everything loads up front. */
  eager: number
  /** Illustrative initial JS shipped when split by route and deferred. */
  split: number
}

export interface DecisionOption {
  title: string
  when: string
  cost: string
}

export interface Decision {
  id: string
  question: string
  a: DecisionOption
  b: DecisionOption
  verdict: string
}

export interface Pillar {
  id: string
  title: string
  body: string
  evidence: string
}

export interface Social {
  label: string
  href: string
  handle: string
}

/** A blog post, produced at build time from a Markdown file in site/content/blog. */
export interface BlogPost {
  slug: string
  title: string
  /** ISO date, e.g. 2026-10-17. */
  date: string
  /** ISO date of the last revision. Rendered as "Updated …" when newer than `date`. */
  updated?: string
  category: string
  categorySlug: string
  summary: string
  tags: string[]
  /** Estimated reading time in minutes. */
  minutes: number
  /** Rendered article body (HTML). */
  html: string
}

export interface BlogCategory {
  name: string
  slug: string
  count: number
}
