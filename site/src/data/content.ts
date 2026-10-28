// Single source of truth for portfolio content.
//
// Every claim here traces back to documented experience. Client work is
// described in the abstract: no confidential interfaces, internal metrics, or
// invented outcomes are reproduced. Anything that would need information not
// available is written as a clearly marked placeholder instead of a guess.

import type {
  ArchNode,
  ArchTradeoff,
  CaseStudy,
  Decision,
  PerfRoute,
  Pillar,
  Profile,
  Signal,
  Social,
} from './types'

export const profile: Profile = {
  name: 'Dikshant Patodia',
  role: 'Senior Frontend Engineer',
  email: 'dikshantpatodia@gmail.com',
  linkedin: 'https://linkedin.com/in/dikshantpatodia',
  github: 'https://github.com/dikshantpatodia',
  location: 'India · IST (UTC+5:30)',
  headline: 'Good interfaces are engineered, not assembled.',
  lede: 'I develop frontend systems that stay fast under load, scale across teams, and hold up in production. Eight years of it: micro frontends many times over, Core Web Vitals moved on several products, and test suites measured in the thousands.',
}

export const signals: Signal[] = [
  { value: '8+', label: 'years in frontend engineering' },
  { value: 'Many', label: 'micro frontends shipped across products' },
  { value: '1000+', label: 'automated tests authored' },
  { value: '33.2%', label: 'LCP & INP gain, among several projects' },
]

export const caseStudies: CaseStudy[] = [
  {
    id: 'architecture-of-scale',
    index: '01',
    kicker: 'Architecture',
    title: 'The architecture of scale',
    summary:
      'Micro frontends many times over: host shells, independently deployable remotes, and a shared design system that kept separate teams from rebuilding the same interface.',
    problem:
      'Several product teams were shipping into one large frontend. Independent release cadences collided, shared code drifted into copies, and the same components were being rebuilt in parallel across modules.',
    mattered:
      'Every duplicated component is a future bug fixed in the wrong place. The architecture had to let teams move independently without fragmenting the experience a user actually sees.',
    contribution: [
      'Defined the host and remote boundaries and the integration contract between them',
      'Implemented Module Federation across independently deployable applications, on several products',
      'Established the shared component and design-token layer every remote depends on',
      'Published the shared webpack build configuration and internal npm packages teams consume',
      'Set the versioning and compatibility rules so remotes could upgrade on their own schedule',
    ],
    constraints: [
      'Teams on different release cadences',
      'Enterprise review and compliance gates on changes',
      'No big-bang rewrite — the system had to ship incrementally',
    ],
    approach: [
      'Federated remotes loaded at the route boundary, so unrelated areas never share a bundle',
      'A shared design system consumed as a versioned dependency instead of copied code',
      'Contract-first integration so one remote can fail without taking the host down',
    ],
    outcome: [
      { value: 'Multiple', label: 'micro frontends in production' },
      { value: 'Shared', label: 'design system & webpack config' },
      { value: 'Independent', label: 'release cadence per team' },
    ],
    demonstrates:
      'That the hard part of micro frontends is not the tooling — it is drawing boundaries teams can actually own.',
    tags: ['Module Federation', 'Webpack', 'npm packages', 'Design tokens', 'Monorepo'],
    motif: 'architecture',
  },
  {
    id: 'performance-is-a-decision',
    index: '02',
    kicker: 'Performance',
    title: 'Performance is an engineering decision',
    summary:
      'Double-digit LCP and INP gains across several products — earned by changing what ships and when, not by micro-optimising render code.',
    problem:
      'Core Web Vitals were failing on the routes that mattered. The instinct was to tune components; the real cost was in what loaded, when it loaded, and how much of it a page genuinely needed up front.',
    mattered:
      'Performance is a product decision. A slow first paint costs conversions, trust, and every downstream metric the team is measured on.',
    contribution: [
      'Profiled the critical path and attributed cost to bundles rather than components',
      'Introduced route-based code splitting and deferred non-critical work',
      'Right-sized assets and removed render-blocking work from first paint',
      'Repeated the approach across several products instead of one lucky route',
      'Set a performance budget the team could defend in review',
    ],
    constraints: [
      'Feature teams still shipping weekly',
      'Third-party scripts outside direct control',
      'No visual regression allowed while the work landed',
    ],
    approach: [
      'Route-level splitting so each page paid only for itself',
      'Prioritised above-the-fold work and deferred the rest behind interaction',
      'Made an explicit budget a merge gate instead of an aspiration',
    ],
    outcome: [
      { value: '33.2%', label: 'LCP & INP — one product, of several' },
      { value: 'Route-based', label: 'code splitting' },
      { value: 'Budgeted', label: 'performance in review' },
    ],
    demonstrates:
      'That most performance wins come from architecture and sequencing long before they come from micro-optimisation.',
    tags: ['Core Web Vitals', 'Code splitting', 'Webpack', 'Bundle analysis'],
    motif: 'performance',
  },
  {
    id: 'quality-that-ships',
    index: '03',
    kicker: 'Quality',
    title: 'Quality that ships',
    summary:
      '1000+ automated tests authored over eight years, and an engagement that moved coverage from 78% to 93% — written to catch regressions, not to raise a number.',
    problem:
      'Releases depended on manual verification. Confidence lived in people’s heads, so it left when they did, and regressions reached production.',
    mattered:
      'Coverage is a proxy. The real goal is the ability to change code quickly without fear — and to know, before shipping, what broke.',
    contribution: [
      'Authored 1000+ unit, integration, and end-to-end tests across products',
      'Introduced Jest and React Testing Library patterns the team reused',
      'Raised coverage from 78% to 93% in a separate engagement',
      'Made failing tests a merge gate rather than a suggestion',
    ],
    constraints: [
      'Legacy code with low testability',
      'Delivery deadlines that could not slip',
      'The suite had to be fast enough to run on every push',
    ],
    approach: [
      'Tested behaviour and contracts rather than implementation details',
      'Started where a regression would be most expensive',
      'Kept the suite fast so it stayed in the loop',
    ],
    outcome: [
      { value: '1000+', label: 'automated tests authored' },
      { value: '93%', label: 'coverage, up from 78%' },
      { value: 'Merge gate', label: 'tests block regressions' },
    ],
    demonstrates:
      'That coverage is only worth what it protects — the point is confidence, not the percentage.',
    tags: ['Jest', 'React Testing Library', 'Integration tests', 'CI'],
    motif: 'quality',
  },
  {
    id: 'systems-that-multiply',
    index: '04',
    kicker: 'Systems',
    title: 'Design systems that multiply teams',
    summary:
      'A 60+ component library, distributed across five product modules, built so teams stop rebuilding the same interface.',
    problem:
      'Every product module had its own buttons, inputs, and layouts. The interface drifted, accessibility was inconsistent, and each team paid the same cost again.',
    mattered:
      'A design system is leverage. Build the interface once, correctly, and every team downstream inherits the quality for free.',
    contribution: [
      'Built a 60+ component library on Atomic Design principles',
      'Documented and distributed it across five product modules',
      'Used Storybook as the living contract between design and engineering',
      'Standardised async state and data-fetching patterns alongside the components',
    ],
    constraints: [
      'Design and engineering on separate timelines',
      'Modules on different dependency versions',
      'Adoption had to be voluntary — the library had to be better, not mandated',
    ],
    approach: [
      'Atomic Design from primitives up, with tokens as the foundation',
      'Storybook stories as documentation and a review surface',
      'Shared async state patterns so components behaved the same everywhere',
    ],
    outcome: [
      { value: '60+', label: 'components in the library' },
      { value: '5', label: 'modules using it' },
      { value: 'shared', label: 'state & data patterns' },
    ],
    demonstrates:
      'That a design system is an organisational tool as much as a technical one — it is how one team’s quality reaches five.',
    tags: ['Atomic Design', 'Storybook', 'npm packages', 'Design tokens'],
    motif: 'system',
  },
]

export const archNodes: ArchNode[] = [
  {
    id: 'host',
    title: 'Host shell',
    kind: 'host',
    role: 'Routing, auth, frame',
    detail:
      'Owns routing, authentication, and the application frame. It loads remotes on demand and is never allowed to depend on their internals — only on the contract.',
  },
  {
    id: 'remote-catalog',
    title: 'Remote · Catalog',
    kind: 'remote',
    role: 'Independently deployable',
    detail:
      'A product area that ships on its own cadence behind a federated entry point. Deploys without waiting on the host or on other remotes.',
  },
  {
    id: 'remote-checkout',
    title: 'Remote · Checkout',
    kind: 'remote',
    role: 'Independently deployable',
    detail:
      'Same contract, different team. Its release schedule is decoupled from Catalog’s, which is the entire point of the boundary.',
  },
  {
    id: 'remote-insights',
    title: 'Remote · Insights',
    kind: 'remote',
    role: 'Independently deployable',
    detail:
      'A heavier, data-dense area. Loading it at its own route keeps its cost away from the rest of the application.',
  },
  {
    id: 'design-system',
    title: 'Shared design system',
    kind: 'shared',
    role: 'Versioned dependency',
    detail:
      'The one thing every remote is allowed to share: a versioned component and token library. Shared code is a coupling decision, so it is kept small and deliberate.',
  },
  {
    id: 'api-boundary',
    title: 'API boundary',
    kind: 'boundary',
    role: 'Contract-first access',
    detail:
      'Remotes talk to capabilities through a shared access layer, not to each other. Direct remote-to-remote calls are forbidden — they turn boundaries back into a monolith.',
  },
  {
    id: 'resilience',
    title: 'Failure isolation',
    kind: 'resilience',
    role: 'Degrade, don’t collapse',
    detail:
      'If a remote fails to load, one route degrades. The host and every other route keep working, because failure was designed for rather than discovered in production.',
  },
]

export const archTradeoffs: ArchTradeoff[] = [
  {
    id: 'independence',
    title: 'Deployment independence',
    body: 'Teams release on their own schedule. This is the benefit that justifies the cost — if you do not need it, you do not need micro frontends.',
  },
  {
    id: 'shared',
    title: 'Shared dependency cost',
    body: 'Every shared package is a version contract. Share too much and you have a distributed monolith; share too little and you rebuild the same components forever.',
  },
  {
    id: 'isolation',
    title: 'Failure isolation',
    body: 'A failing remote should degrade one route, not the whole application. That requires loading strategy and error boundaries designed up front.',
  },
  {
    id: 'coordination',
    title: 'Coordination cost',
    body: 'Boundaries are not free. They add contracts, versioning, and cross-team conversation. The architecture only pays off if that cost is lower than the coupling it removes.',
  },
]

// Illustrative model for the performance lab. These are representative
// figures for a demonstration, not measurements of any specific site.
export const perfRoutes: PerfRoute[] = [
  { id: 'home', label: 'Home', eager: 412, split: 138 },
  { id: 'catalog', label: 'Catalog', eager: 588, split: 214 },
  { id: 'checkout', label: 'Checkout', eager: 476, split: 172 },
]

export const decisions: Decision[] = [
  {
    id: 'mfe-vs-monolith',
    question: 'Micro frontends, or a modular monolith?',
    a: {
      title: 'Modular monolith',
      when: 'One team, one release train, and boundaries you can enforce inside a single codebase.',
      cost: 'Boundaries are conventions. Nothing stops a shortcut except review discipline.',
    },
    b: {
      title: 'Micro frontends',
      when: 'Multiple teams need to deploy independently, and the coupling cost is genuinely lower than the coordination cost.',
      cost: 'Contracts, versioning, and cross-team coordination. Real, ongoing overhead.',
    },
    verdict:
      'Default to the monolith. Earn the micro frontend with an organisational need, never with a diagram.',
  },
  {
    id: 'ssr-vs-csr',
    question: 'Server rendering, or client rendering?',
    a: {
      title: 'Server rendering',
      when: 'First paint, SEO, or slow devices matter, and the page is largely content.',
      cost: 'Infrastructure, caching, and a harder mental model for interactive state.',
    },
    b: {
      title: 'Client rendering',
      when: 'The page is an application behind auth, where first paint is less important than interaction.',
      cost: 'A slower first meaningful paint and more work pushed onto the device.',
    },
    verdict:
      'Choose per route, not per application. The right answer is usually both, on the routes that deserve each.',
  },
  {
    id: 'shared-vs-local',
    question: 'Shared state, or local state?',
    a: {
      title: 'Local state',
      when: 'The state belongs to one screen or one interaction. Most state does.',
      cost: 'None, until two distant components genuinely need the same truth.',
    },
    b: {
      title: 'Shared state',
      when: 'Multiple, distant parts of the UI must agree — session, filters, a cart.',
      cost: 'Global coupling and re-render costs that are easy to create and hard to undo.',
    },
    verdict:
      'Keep state as local as it can be and as shared as it must be. Reach for the store last, not first.',
  },
  {
    id: 'system-vs-abstraction',
    question: 'A reusable system, or less abstraction?',
    a: {
      title: 'Less abstraction',
      when: 'The pattern appears once or twice, or the abstraction is still being discovered.',
      cost: 'Some duplication now, in exchange for the freedom to change your mind.',
    },
    b: {
      title: 'Reusable system',
      when: 'The pattern is proven, repeated, and the cost of drift is real.',
      cost: 'A public interface you now have to maintain and version for other teams.',
    },
    verdict:
      'Duplication is cheaper than the wrong abstraction. Extract after the third real use, not the first guess.',
  },
  {
    id: 'coverage-vs-confidence',
    question: 'Test coverage, or test confidence?',
    a: {
      title: 'Coverage as a target',
      when: 'Almost never on its own. It measures execution, not protection.',
      cost: 'Tests that pass while the behaviour they were meant to protect breaks.',
    },
    b: {
      title: 'Confidence as a target',
      when: 'Always. Tests exist to make change safe, not to move a number.',
      cost: 'More thought per test, and a willingness to delete tests that protect nothing.',
    },
    verdict:
      'Coverage is a smell detector, not a goal. I aim for the confidence to ship on a Friday.',
  },
]

export const pillars: Pillar[] = [
  {
    id: 'direction',
    title: 'Architecture and technical direction',
    body: 'Setting the boundaries, contracts, and defaults that a team builds against — and writing them down so the decision survives the meeting.',
    evidence:
      'Host/remote contracts, versioning rules, and shared webpack and design-system packages consumed across applications.',
  },
  {
    id: 'review',
    title: 'Code review as a teaching tool',
    body: 'Review is where standards are transmitted. The goal is a team that makes the same call without me in the room.',
    evidence: 'Reusable patterns for testing, state, and data-fetching adopted beyond the original change.',
  },
  {
    id: 'mentoring',
    title: 'Mentoring and pairing',
    body: 'Growing engineers by working on real problems with them, not by handing out reading lists.',
    evidence: 'Led teams of three and six engineers, and mentored frontend engineers across engagements.',
  },
  {
    id: 'cross-team',
    title: 'Cross-team collaboration',
    body: 'Translating between design, backend, product, and other frontend teams so the interface stays coherent end to end.',
    evidence: 'Design-system distribution across product modules and shared API contracts.',
  },
  {
    id: 'leverage',
    title: 'Systems that make teams faster',
    body: 'Preferring the fix that helps everyone next time over the fix that helps this ticket today.',
    evidence: 'A 60+ component library and shared async state patterns reused across modules.',
  },
  {
    id: 'delivery',
    title: 'Delivery and maintainability',
    body: 'Shipping in slices that stay reviewable, and leaving the codebase easier to change than I found it.',
    evidence: 'Incremental delivery under enterprise review gates, without a big-bang rewrite.',
  },
]

export const socials: Social[] = [
  { label: 'Email', href: 'mailto:dikshantpatodia@gmail.com', handle: 'dikshantpatodia@gmail.com' },
  { label: 'LinkedIn', href: 'https://linkedin.com/in/dikshantpatodia', handle: '/in/dikshantpatodia' },
  { label: 'GitHub', href: 'https://github.com/dikshantpatodia', handle: '@dikshantpatodia' },
]

// Short explanations surfaced through inline <Term> tooltips.
export const glossary: Record<string, string> = {
  'Micro frontend':
    'An architecture where independent frontend applications are composed into one product, usually so separate teams can deploy on their own schedule.',
  'Module Federation':
    'A Webpack feature that lets one build consume code from another at runtime, which is what makes independently deployed remotes practical.',
  Webpack:
    'The module bundler behind most of my micro frontend setups, and the build configuration I have shared across teams.',
  'npm package':
    'A versioned, publishable unit of shared code. Internal packages are how a design system, build config, or utility layer reaches many applications without copy-paste.',
  LCP: 'Largest Contentful Paint — how long until the largest visible element has rendered. A Core Web Vital.',
  INP: 'Interaction to Next Paint — how responsive the page feels to input. A Core Web Vital.',
  'Core Web Vitals':
    'Google’s set of real-world loading, interactivity, and visual-stability metrics used as a quality bar.',
  'Atomic Design':
    'A method of building interfaces from primitives upward: atoms, molecules, organisms, templates, pages.',
  'Design token':
    'A named, shared design decision — colour, spacing, type — expressed as a value both design and code can consume.',
  'Code splitting':
    'Splitting a bundle so a page only downloads the code it needs, instead of everything up front.',
  SSR: 'Server-side rendering — generating HTML on the server so the first paint does not wait for JavaScript.',
  'Test coverage':
    'The share of code executed by tests. A useful signal, but not a measure of whether behaviour is protected.',
}
