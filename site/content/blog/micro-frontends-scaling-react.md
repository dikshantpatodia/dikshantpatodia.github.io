---
title: "Micro Frontends: Scaling React Applications Beyond a Monolith"
date: 2026-10-31
category: Architecture
summary: Module Federation makes the build easy and the contracts hard. A guide to shells, remotes, shared React, version skew and deployments that stay independent.
tags: Micro frontends, Module Federation, React, Architecture
---

The bundler configuration for micro frontends fits on one screen. I have watched teams get it working in an afternoon and then spend a quarter discovering that the hard part was never the bundler.

Micro frontends are an organisational solution wearing a technical costume. If five teams need to ship to production without coordinating a release train, the architecture follows. If one team owns the product, the same architecture buys you five deployment pipelines to babysit and a distributed monolith with worse observability.

I wrote separately about [when the complexity is worth paying for](/blog/when-micro-frontends-are-worth-their-complexity/). This is the other half: what it looks like when you have decided to pay, and what breaks first.

## The shape of the thing

There is a **shell** — the host application that owns the top-level route, the header, authentication, and the design system. It loads **remotes**: independently deployed React applications that expose route-level entry points. Between them sits a **contract**: props in, events out, plus a shared set of dependencies that must not be duplicated.

| Piece | Owns | Must not own |
|---|---|---|
| Shell | Routing, auth, layout, error boundaries | Feature business logic |
| Remote | One domain, its own data fetching | Global navigation |
| Contract | Props, events, version | Implementation details |
| Design system | Tokens, primitives, patterns | Feature components |

Everything that goes wrong later is a violation of that table.

## Module Federation, concretely

Webpack 5 ships federation in the box. A remote declares what it exposes and what it expects to share:

```js
// checkout/webpack.config.js
const { ModuleFederationPlugin } = require('webpack').container

module.exports = {
  output: { publicPath: 'https://cdn.example.com/checkout/', uniqueName: 'checkout' },
  plugins: [
    new ModuleFederationPlugin({
      name: 'checkout',
      filename: 'remoteEntry.js',
      exposes: {
        './Cart': './src/routes/Cart',
        './Checkout': './src/routes/Checkout',
      },
      shared: {
        react: { singleton: true, requiredVersion: '^19.0.0' },
        'react-dom': { singleton: true, requiredVersion: '^19.0.0' },
      },
    }),
  ],
}
```

The host consumes it at runtime:

```js
// shell/webpack.config.js
new ModuleFederationPlugin({
  name: 'shell',
  remotes: {
    checkout: 'checkout@https://cdn.example.com/checkout/remoteEntry.js',
  },
  shared: {
    react: { singleton: true, requiredVersion: '^19.0.0' },
    'react-dom': { singleton: true, requiredVersion: '^19.0.0' },
  },
})
```

On Vite the plugin names differ — `@module-federation/vite` and the older `vite-plugin-federation` both exist, and Module Federation 2.0 added a separate runtime package. Check which one your toolchain supports before you commit; this corner of the ecosystem moves faster than its documentation.

Loading a remote is a dynamic import, which means `React.lazy`, which means a boundary:

```tsx
const Checkout = lazy(() => import('checkout/Checkout'))

export function CheckoutRoute() {
  return (
    <RemoteBoundary name="checkout">
      <Suspense fallback={<RouteSkeleton />}>
        <Checkout currency="INR" onOrderPlaced={track} />
      </Suspense>
    </RemoteBoundary>
  )
}
```

`RemoteBoundary` is not optional decoration. A remote can fail to download, fail to initialise, or throw during render, and none of those should take down the shell. Give it a retry, a fallback route, and an error report tagged with the remote name — otherwise your 3 a.m. incident starts with "the whole site is down" instead of "checkout is down".

## The shared dependency trap

This is the failure that eats the most time, so it is worth being blunt.

React must be a singleton. Two copies of React in one page means two hook dispatchers, and the error you get is *"Invalid hook call"* — a message that sends people to check their imports for an hour before they look at the network tab.

```js
shared: {
  react: { singleton: true, requiredVersion: '^19.0.0' },
  'react-dom': { singleton: true, requiredVersion: '^19.0.0' },
  'react/jsx-runtime': { singleton: true },
}
```

Three rules I follow:

**Share the framework, not the state library.** Marking a state manager as shared looks appealing and creates a global store that every team writes to with different assumptions. Share React, share the design system, and let each remote own its state.

**Version with intent.** `requiredVersion` is a promise. If the shell runs React 19 and a remote demands 18, federation will either warn and load a second copy or fail at runtime, depending on configuration. Neither is a good afternoon. Align major versions organisationally, and treat a React upgrade as a coordinated release even though deploys are independent.

**Bootstrap through an async boundary.** The classic *"Shared module is not available for eager consumption"* error means your entry point imported something synchronously that federation needed to negotiate first. The fix is a tiny `bootstrap.ts` that does the real import:

```ts
// index.ts
import('./bootstrap')
```

That one line is the difference between an application that starts and an afternoon of reading webpack internals.

## Independent deployment is a contract problem

Two remotes can deploy independently only if the contract between them and the shell is stable. That means versioning the interface, not the bundle.

The pattern that has worked for me: the remote exposes a component with a documented prop shape, and it declares its contract version alongside the entry point.

```ts
// contract.ts — owned by the remote, consumed by the shell's type check
export const CONTRACT_VERSION = 3

export type CheckoutProps = {
  currency: 'INR' | 'USD' | 'EUR'
  onOrderPlaced: (orderId: string) => void
}
```

The shell checks the version it receives before rendering, and falls back rather than crashing on a mismatch:

```ts
const remote = await import('checkout/Checkout')
if (remote.CONTRACT_VERSION < MIN_SUPPORTED) {
  reportContractMismatch('checkout', remote.CONTRACT_VERSION)
  return <FeatureUnavailable />
}
```

This is unglamorous and it is the difference between "we deploy independently" and "we deploy independently as long as nobody changes a prop". Additive changes are safe: a new optional prop, a new event. Renaming an event or tightening a type is a breaking change, and it deserves the same ceremony as a public API change — because that is what it is.

Deployment hygiene that pays for itself: serve `remoteEntry.js` with a short cache and the chunks it references with a long one, keep the previous two remote versions addressable for instant rollback, and load remote configuration from a manifest rather than baking URLs into the shell build. That last one means you can turn a broken remote off without redeploying the host.

## Talking between applications

Three mechanisms, in order of preference.

**URL and router state.** Deep links are the most robust contract in the web platform. If the shell owns the route and passes params as props, nothing needs to be invented.

**Custom events with a typed wrapper.** Cheap, framework-agnostic, and it keeps teams from importing each other's internals:

```ts
type AppEvents = {
  'cart:item-added': { sku: string; quantity: number }
  'nav:request': { path: string }
}

export function emit<K extends keyof AppEvents>(type: K, detail: AppEvents[K]) {
  window.dispatchEvent(new CustomEvent(type, { detail }))
}

export function on<K extends keyof AppEvents>(type: K, fn: (detail: AppEvents[K]) => void) {
  const handler = (e: Event) => fn((e as CustomEvent<AppEvents[K]>).detail)
  window.addEventListener(type, handler)
  return () => window.removeEventListener(type, handler)
}
```

**Props from the shell.** Fine for a handful of callbacks. It stops being fine when the shell becomes a message bus with fourteen props because two teams could not agree on an event name.

What I would not do: share a global store across remotes. It couples releases back together, which is the exact thing you paid for, and it makes state ownership unanswerable in a bug report.

## The parts nobody demos

**Routing.** Two routers in one page will fight over history and both will try to handle the back button. Pick one: the shell owns the router and passes the matched route down, or the remote is mounted at a fixed base path and the shell never renders inside it. Mixing is how you get a URL that changes twice on click.

**Styling.** CSS modules and a prefixed utility build are the boring answer and usually the right one. Shadow DOM gives real isolation and takes away global theming, portal-based overlays, and some accessibility tooling behaviour. If you need isolation that badly, reconsider the split before you reach for shadow DOM.

**Accessibility.** Focus management across boundaries is not automatic. When a remote opens a modal, the shell's skip link and focus trap know nothing about it. Agree on a shared overlay primitive in the design system, or accept that every remote will implement focus differently.

**Observability.** Tag every error and performance mark with the remote name. Without that, a slow checkout looks like a slow site, and the team that owns the shell gets paged for someone else's regression.

## A real sequence of failures

A retail platform I worked on split into four remotes: catalog, cart, checkout, account. The first month looked successful — four pipelines, four teams, no release train.

Then the failures arrived in a predictable order. A cart deploy shipped with React 18 while the shell was on 19, producing an invalid hook call that only appeared on the cart route. Two remotes both mounted a router, so the back button started skipping pages. A shared date library was bundled in three places, adding weight to every route. The design system drifted because one team had forked a button to add a variant instead of contributing it.

Every one of those is a contract failure, not a bundler failure. The fixes were organisational: a version matrix in CI, a single router owned by the shell, a shared dependency allowlist, and a rule that a new variant goes into the design system or does not ship.

## So should you?

Split when all four are true: multiple teams need to deploy on different schedules, the domain boundaries are already clear in the product, you have the platform capacity to run a shell and a shared release process, and you can afford the integration testing.

Do not split when the driver is "the monolith feels big". A large codebase with clear module boundaries and a single deploy is cheaper to operate than four small ones with a contract to maintain. Micro frontends trade compile-time safety for deploy-time independence. Make sure you need the second thing before you give up the first.
