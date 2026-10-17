---
title: Performance improvements usually start as architecture decisions
date: 2026-10-08
category: Performance
summary: By the time you are tuning a component, the expensive decisions have already been made — in what ships, when it ships, and who has to pay for it.
tags: Performance, Core Web Vitals, Code splitting
---

Most performance work I have done was not optimisation. It was **sequencing**: deciding what a page truly needs before first paint, and moving everything else behind a boundary.

## Code splitting is an architecture decision

Route-based code splitting is not a build setting you flip at the end. It says each page pays only for itself, and it is far cheaper to design in than to retrofit onto a bundle that has already become one thing.

The order of operations matters:

1. Attribute cost to *bundles*, not to components.
2. Decide what genuinely belongs above the fold.
3. Move everything else behind an interaction or a route boundary.

## Where the numbers actually come from

Micro-optimisation has its place, but it is the last few percent. The first thirty usually come from deciding what **not** to ship.

Across the products I have worked on, the shape of the win was the same every time — and the percentage varied with how much had been allowed to accumulate:

- Largest Contentful Paint improved once the critical path stopped waiting on unrelated JavaScript.
- Interaction to Next Paint improved once non-urgent work stopped competing with input handling.
- The gains repeated project to project, which is the useful part.

## Make it a gate, not an aspiration

A budget that lives in a slide is a wish. A budget that fails a build is a decision. I would rather defend a number in review than explain a regression in a postmortem.
