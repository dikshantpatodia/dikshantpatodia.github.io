---
title: "React 19: What's Changed and What Frontend Developers Should Know"
date: 2026-10-29
category: Engineering practice
summary: React 19 moves the data layer into the component tree. Actions, useOptimistic, server components and the removals that quietly delete code — with the caveats.
tags: React, React 19, Server Components, Actions, TypeScript
---

Every React release gets sold on hooks. React 19 is sold on forms, which sounds like a downgrade until you notice what it replaces: the four-state dance around every mutation, rewritten in a hundred components, slightly differently each time.

That is the actual story of this release. React stopped being a view library with opinions about state and started having opinions about data. Some of that is genuinely good. Some of it only works if you also adopt a framework that can run the other half. And a few of the changes will delete code you have been maintaining for years without anyone noticing.

## Actions replace the pending-and-error dance

Before 19, a submit handler looked like this in every codebase I have worked in: a `pending` boolean, an `error` string, a `try/catch`, a manual disable, a manual reset, and a `revalidate` call somewhere near the bottom. Five states that all have to agree.

```tsx
import { useActionState } from 'react'

type State = { ok: boolean; message?: string }

async function updateProfile(_prev: State, formData: FormData): Promise<State> {
  const res = await fetch('/api/profile', { method: 'POST', body: formData })
  if (!res.ok) return { ok: false, message: 'Could not save. Try again.' }
  return { ok: true, message: 'Saved.' }
}

export function ProfileForm() {
  const [state, submit, pending] = useActionState(updateProfile, { ok: true })

  return (
    <form action={submit}>
      <input name="name" required />
      <button disabled={pending}>{pending ? 'Saving…' : 'Save'}</button>
      {state.message && <p role="status">{state.message}</p>}
    </form>
  )
}
```

`pending` is derived, not managed. The form element owns submission. Any child can read the same state with `useFormStatus` without prop drilling, which is the part that actually pays off in a real design system — the submit button in your component library can show a spinner without every caller wiring it up.

The productivity gain is real. The architectural gain is bigger: actions are a boundary. Once mutations go through a function with a known signature, you can wrap it with logging, retries, analytics, or authorization checks in one place instead of a hundred.

## `useOptimistic` makes the common case boring

Optimistic updates used to mean keeping a shadow copy of the server state, a rollback path, and a bug where the two diverged. React 19 reduces it to a reducer over a temporary value:

```tsx
const [optimisticTodos, addOptimisticTodo] = useOptimistic(
  todos,
  (current, next: Todo) => [...current, next],
)

async function addTodo(formData: FormData) {
  const draft: Todo = {
    id: crypto.randomUUID(),
    text: String(formData.get('text') ?? ''),
    pending: true,
  }
  addOptimisticTodo(draft)
  await saveTodo(draft)
}
```

Two things to internalise. First, `addOptimisticTodo` only works inside an action or a transition — calling it from an arbitrary event handler throws. Second, the optimistic value is discarded when the action settles, by design. There is no "commit" step; you update the real state in the action and React reconciles.

That means it is the wrong tool for anything you cannot afford to have snap back. Adding a row is fine. Sending money is not. If a user can see an optimistic state and act on it before it is confirmed, you have built a race condition with a nice animation.

## `use()` is small and stranger than it looks

`use` reads a promise or a context value. The context half is the underrated part: it is the only hook that can be called conditionally.

```tsx
function ThemeLabel({ isThemed }: { isThemed: boolean }) {
  if (!isThemed) return <span>Default theme</span>
  const theme = use(ThemeContext) // legal, unlike useContext
  return <span>{theme.name}</span>
}
```

The promise half suspends the component until it resolves, which is convenient and easy to misuse. If you create the promise during render, you create a new promise on every render, which suspends forever. The promise has to be cached — by a framework, by a module-level map keyed by id, or by a `cache()` helper in a server environment:

```tsx
const cache = new Map<string, Promise<User>>()

function getUser(id: string) {
  if (!cache.has(id)) cache.set(id, fetchUser(id))
  return cache.get(id)!
}
```

That cache never evicts, so it is fine for a demo and wrong for a long-lived session. In production, key it by request or use your framework's cache primitive. This is the kind of detail the announcement post does not emphasise and production will.

## The deletions matter more than the additions

These are the changes that show up in a diff on day one.

**`ref` is a normal prop.** `forwardRef` is no longer required for DOM pass-through, and ref callbacks can return a cleanup function:

```tsx
function Field({ ref, ...props }: FieldProps) {
  return <input ref={ref} {...props} />
}

<input
  ref={(node) => {
    const id = setInterval(() => measure(node), 500)
    return () => clearInterval(id) // cleanup on unmount
  }}
/>
```

Watch the TypeScript trap: an arrow function with a concise body returns the assignment expression, and React 19 treats a returned value as a cleanup function. Use a block body, or you will get a runtime warning and a subtle bug.

**`<Context>` is the provider.** `<ThemeContext value={theme}>` replaces `<ThemeContext.Provider>`. The old form still works, so this is a codemod, not a migration project.

**Metadata hoists.** A `<title>`, `<meta>` or `<link>` rendered anywhere in the tree is moved into the document head. That is genuinely nice for route components, and genuinely dangerous if two components disagree — the result is not always the one you expect. Keep a single owner per tag.

**Resource hints are components.** `preload`, `preinit`, `prefetchDNS` and `preconnect` are exported from `react-dom` and can be called during render, where React can dedupe them and order them correctly. Better than hand-managing `<link>` tags in a `useEffect`.

**Error reporting is configurable.** `createRoot(container, { onCaughtError, onUncaughtError, onRecoverableError })` lets you route errors by kind instead of catching everything in one handler. Error boundaries still do the rendering fallback; this is the reporting channel.

**Gone:** `propTypes`, `defaultProps` on function components, string refs, `findDOMNode`, `ReactDOM.render`, and `react-dom/test-utils`. The `act` import moved to `react`. Most of these have been warning for years, so the upgrade is usually mechanical — but `defaultProps` is the one that bites, because a default that silently disappears turns into `undefined` in a component that assumed a string.

## Server components are the real architecture shift

Actions work in a plain client app. Server components do not — they need a bundler and a server runtime that understand the `"use client"` and `"use server"` directives. That means a framework, not a Vite plugin you add on a Friday.

The mental model is worth learning regardless, because it changes how you split code:

```tsx
// app/invoices/page.tsx — server component, never shipped to the browser
import { db } from '@/lib/db'
import { InvoiceTable } from './invoice-table'

export default async function Invoices() {
  const invoices = await db.invoice.findMany({ where: { status: 'open' } })
  return <InvoiceTable invoices={invoices} />
}
```

```tsx
// app/invoices/actions.ts
'use server'

export async function markPaid(id: string) {
  await db.invoice.update({ where: { id }, data: { status: 'paid' } })
  revalidatePath('/invoices')
}
```

Three rules that matter more than the syntax. Everything crossing the boundary must be serializable — no functions, no class instances, no Dates if your serializer does not handle them. The `"use server"` file is a public HTTP endpoint, so every exported function needs its own authorization check; the fact that it is only called from your UI is not a security control. And the client boundary is viral in one direction: a client component cannot import a server component, only render one passed as a child.

The payoff is real for data-heavy screens: the query runs next to the data, the component tree that formats it never ships, and the bundle shrinks by whatever that formatting code weighed. The cost is a deployment topology that now includes a server, and a debugging story where "where did this render" is a legitimate question.

## Performance: separate the release from the marketing

React 19 did not make your app faster by existing. What actually changed:

- **Hydration errors are diffed**, so a mismatch points at the element instead of dumping two trees.
- **Suspense siblings prerender** before the suspended boundary resolves, which improves perceived load on pages with several boundaries.
- **The compiler** removes most manual memoisation, but it is a separate build plugin with its own adoption story, and its status has moved since the 19.0 release. Check the current docs rather than a blog post — including this one.

What did not change: waterfalls, bundle size, and the cost of rendering a 10,000-row table without virtualisation. Those are architecture, and no release note fixes them.

## The migration order I would actually use

1. **Upgrade and delete deprecated APIs.** `propTypes`, `defaultProps`, string refs, `ReactDOM.render`, `findDOMNode`, and the `act` import. Expect a day, not a sprint.
2. **Adopt actions for new forms only.** Do not rewrite working forms to prove a point; let them migrate when touched.
3. **Replace `forwardRef` where it exists purely for DOM pass-through.** Keep it where you rely on the ref object identity.
4. **Add root error callbacks** before you need them. The first production error you cannot reproduce is the one that justifies the half hour.
5. **Evaluate server components with one screen**, behind a real data need. Not as a rewrite.

The teams that get value from 19 quickly are the ones that treat actions as a boundary and leave the rest alone. The teams that struggle are the ones that adopt every feature at once and then cannot tell which change broke the form.

## What I am still unsure about

Point releases since 19.0 have added APIs I would not quote from memory — `<Activity>` and `useEffectEvent` are the two I would verify against the version you actually run, along with the compiler's current status. The core model above is stable: actions, optimistic state, `use`, ref-as-prop, and the server/client split.

React 19 is not the release that makes frontend easier. It is the release that moves the hard part — where data lives, who is allowed to change it, and what ships to the browser — into the component tree where you can see it. That is a better place for it to live, even when it is less comfortable.
