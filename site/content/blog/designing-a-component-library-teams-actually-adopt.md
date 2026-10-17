---
title: Designing a component library teams actually adopt
date: 2026-10-11
category: Design systems
summary: A component library succeeds or fails on adoption. If teams route around it, the API is the problem — not their discipline.
tags: Design systems, Storybook, npm packages
---

Adoption is voluntary in practice, even when it is mandated in principle. Teams will build around a library that fights them, and the drift returns.

## The API is the product

Components that are hard to compose, that leak their internals, or that force a style on a screen that needs something else will be copied instead of used. That is not a discipline problem. It is a design problem.

A few rules I keep coming back to:

- Compose from primitives; do not ship a component that only fits one screen.
- Keep the public surface small and the internals private.
- Make the default correct, so the easy path is the right one.

## Distribution is part of the design

A library nobody can install is a demo. Versioning, changelogs, and a clear upgrade path are what turn a folder of components into something a team can depend on.

```bash
npm install @acme/ui@3
```

The package is the contract. If upgrading it is scary, teams will pin an old version and drift anyway.

## Storybook as the review surface

Storybook earns its place as the contract between design and engineering: it makes the component reviewable *as a component*, not as a screenshot in a ticket. That is where accessibility states, edge cases, and empty states get seen before production does.
