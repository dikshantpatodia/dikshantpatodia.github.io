---
title: Reverse engineer anything
date: 2026-10-22
category: Engineering practice
summary: You do not need a tour guide to understand a system you did not write. Change one thing, predict what will happen, and let the result teach you how it actually works.
tags: Reverse engineering, Debugging, DevTools
---

Most systems are legible long before they are readable. You can learn what a page, a bundle, or a library really does without reading it end to end — but only if you stop trying to read and start asking it questions.

I have spent more hours than I would like reading a minified bundle before accepting that reading was the slowest available way to understand it.

## Start with the behaviour, not the entry point

When I inherit an unfamiliar frontend, the instinct is to open the entry file and read downward. That works for a to-do app. It fails for anything that has survived contact with a real product, because the entry point describes the happy path — the route somebody remembered to keep simple.

The better question is smaller:

> What must be true for this behaviour to happen?

"What does this code do?" asks you to hold the whole system in your head before you can answer. "What must be true?" asks for one observation and one guess. That difference is the entire method.

## Five moves

**Observe.** One behaviour, stated precisely. "It feels slow" is a mood, not a measurement. "The page paints, then the hero image arrives and pushes the headline down" is something you can work with.

**Hypothesise.** The smallest mechanism that would produce exactly that, and nothing more. One cause, phrased so that it could be wrong. A hypothesis you cannot lose is not a hypothesis.

**Perturb.** Change one thing. One. Change three and you have learned that *something* happened, not which.

**Predict.** Say what should change if you are right — out loud, in the commit message, to whoever is nearby. This is the step everyone skips, and the only one that converts fiddling into knowledge.

**Confirm.** If the prediction holds, you have a mechanism rather than a coincidence. If it does not, you have something better than a wrong guess: a ruled-out family of explanations.

Two failed predictions in a row mean your *model of the shape* is wrong, not your guess. Stop tuning the detail and go up a level. Is this even the layer that owns the behaviour?

## On a page you have never seen

Take a route you did not build. Before opening a single component:

- Disable JavaScript. What still renders is the server's contribution; what disappears is the client's.
- Block one third-party domain at a time. The page will tell you which vendor it cannot live without.
- Throttle the network and reload. Whatever appears last is on the critical path, whether or not anyone intended it to be.

Each of those is a perturbation with an obvious prediction. You are not guessing at the architecture; you are asking it questions and writing down the answers.

The same loop applies to a bundle that has quietly become one thing. Move one import behind a route boundary. If the first-load graph for a neighbouring route shrinks, you found a real edge. If it does not, the module you moved was not the one loading it — something else was pulling it in transitively. That negative result is usually the more valuable one, because transitive dependencies are exactly where bundles go to hide.

## On a library you are adopting

Read the public API, not the source. Then write the smallest program that uses it, and break it on purpose: empty state, one item, ten thousand items, the error path, the prop that is technically optional but obviously is not.

The edges are the contract. Documentation describes the happy path, because that is what the author was thinking about while writing it. The behaviour at the edges is what you will actually have to live with.

## The trap

Reverse engineering tells you what **is**. It cannot tell you what was **meant**.

That strange conditional with the `// do not remove` above it usually has a reason, and the reason may have retired three years ago. Do not preserve a bug because you found it in the code. That is cargo-culting with extra steps.

And keep the scope honest: this is a method for systems you own, are employed to work on, or are explicitly allowed to inspect. Understanding how something works is not the same as copying it. The goal is a model you can reason with, not an implementation you can paste.

## What you are actually building

A model with edges — one that can tell you not only how the system behaves, but where it will break.

The test of understanding is not whether you can describe the system. It is whether you can predict it. That is the same skill you need before you change it, and the reason I trust a prediction over a walkthrough every time.

The best codebase knowledge is not the kind you read your way into. It is the kind you earn one prediction at a time.
