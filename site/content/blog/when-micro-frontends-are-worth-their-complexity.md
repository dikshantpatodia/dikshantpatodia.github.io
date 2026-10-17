---
title: When micro frontends are worth their complexity
date: 2026-10-05
category: Architecture
summary: Micro frontends are an organisational solution wearing a technical costume. If the teams do not need independent deploys, the architecture is just overhead.
tags: Micro frontends, Architecture, Module Federation
---

The question is rarely "can we split this into micro frontends?" Almost anything can be split. The real question is whether the **coordination cost of the split** is lower than the **coupling cost of staying together**.

## The benefit that pays for everything else

Independent deployment is the benefit that pays for everything else. If two teams can already ship together without blocking each other, you are buying contracts, versioning, and cross-team meetings in exchange for nothing.

I have worked on micro frontend setups where the boundary was earned, and on repositories where it was imposed. The difference was never the tooling. It was whether two teams genuinely needed to release on separate schedules.

## The failure mode: a distributed monolith

The failure mode is a distributed monolith — all the boundaries of micro frontends with all the coupling of a single app. It happens when shared code is allowed to grow without a budget.

- Share the design system and the contracts.
- Question everything else.
- If a shared package changes weekly, it is not a shared package. It is a coupling.

> Boundaries are not free. They add contracts, versioning, and conversation. The architecture only pays off if that cost is lower than the coupling it removes.

## What I would do first

1. Write down who needs to deploy independently, and how often.
2. Count the release collisions that actually happened, not the ones imagined.
3. Only then draw the boundary — and keep it small.
