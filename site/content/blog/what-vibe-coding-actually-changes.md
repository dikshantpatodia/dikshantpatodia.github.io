---
title: What vibe coding actually changes
date: 2026-10-25
category: AI
summary: The prompt is not the work. Vibe coding moves the expensive decisions earlier — intent, constraints, review — and leaves syntax where it belongs.
tags: AI coding, Cursor, GitHub Copilot, v0
---

Most engineers have a flexbox story. A row that wrapped in one browser and not the other. A dropdown clipped by an `overflow: hidden` three components above it. An afternoon spent on `align-items` against a container that already had an `align-items`. That was the job for a long time: know the syntax, remember the quirks, type it out, repeat.

Now you describe a card — a sparkline, a delta badge, an overflow menu that must not clip — and the component renders before your coffee stops steaming.

The interesting part is not the speed. It is that the bottleneck moved, and a lot of teams have not noticed where it went.

## Three layers, three failure modes

"AI-driven frontend" is not one tool. It is at least three, stacked, and each fails in a different way.

**Intent.** Natural language is now an interface. A prompt is a specification with worse grammar. When it is vague, the output is plausible and wrong, and nothing throws an error. Silent failure is the default.

**Iteration.** Cursor and Copilot turned autocomplete into a diff engine with your repository as context. They are strongest where they can read the surrounding code — the types, the imports, the test sitting next to the file. They get strange when the surrounding code is inconsistent, because they learn your inconsistencies too.

**Generation.** v0 and its peers produce components: React, Tailwind, a set of primitives, and a live preview. The output is real code you can read and diff, not a screenshot you have to rebuild.

Intent fails at the edge of what you said. Iteration fails at the edge of what you meant. Generation fails at the edge of what you tested. Knowing which layer is lying to you is most of the skill now.

## What a usable prompt looks like

The prompt that produces something shippable is not "build me a dashboard". It reads like a ticket:

> Build a revenue widget for an analytics dashboard. Fixed height 280px. Header: label, current value, percentage delta with an up or down arrow and a colour that does not rely on colour alone. Body: 30-day sparkline. Footer: timestamp and a "View report" link.
>
> States: loading (skeleton, not spinner), empty (message plus primary action), error (retry), and a compact variant below 480px.
>
> Constraints: menu is keyboard operable with visible focus, no fixed pixel widths, numbers use tabular figures.

That is not a prompt. That is a design review that happens to be written in English. Which is the point: the tool did not raise the bar, it stopped hiding it.

Notice where the words go. Not colours, not class names. States, constraints, and failure behaviour. Those are the parts a fast generator gets wrong, and the parts you cannot review afterwards in five seconds.

## The reality check

Here is the uncomfortable part, and it is not that the model is bad. It is what the model is optimised for: the median of the internet. That median ships a `div` with an `onClick`, closes a modal without restoring focus, and sprinkles `aria-label` on elements that already have a visible label.

**Accessibility is verification work, not generation work.** A generated component looks accessible. The markup is there, the labels are there, the tab order is plausible. What you have to check only exists at runtime: focus after a route change, a menu that closes on Escape, a dialog that returns focus to the button that opened it, a carousel that respects `prefers-reduced-motion`. None of that shows up in a screenshot, and all of it is your problem.

**State is a design decision, and the model will happily make three.** Ask for a filter bar and you may get local state in the bar, a copy in the parent, and a URL parameter that disagrees with both. The code compiles. The bug surfaces a week later, in a different component. Ownership of state depends on your product's invariants, not on the shape of the code, so no generator can decide it for you.

**Edge cases are where generated code goes to die.** The happy path is the only path in the training data. Look at this:

```tsx
useEffect(() => {
  fetch(`/api/metrics?range=${range}`)
    .then((res) => res.json())
    .then(setData)
}, [range])
```

Read it as a reviewer, not as a reader. There is no abort, so toggling quickly from 30 days to 7 can land the 30-day response last. There is no error branch, so a failed request leaves stale data on screen with no explanation. There is no loading reset, so the skeleton flickers backwards. It runs. It is wrong in three ways that will each cost you an hour.

Then there is the layer no prompt sees: the bundle. A generated widget that imports a charting library costs whatever that library costs on every route that mounts it. You cannot vibe your way to a code-split boundary. That is a sentence in a plan, not a line in a component.

## From syntax to systems

The job is not disappearing. It is moving up a level, and it is less forgiving up there.

**You become the person who specifies.** Not in a document nobody reads — in the prompt, the ticket, the acceptance criteria, the type signature. Ambiguity used to cost you a meeting. Now it costs you four components that all disagree.

**You review more than you write.** Reading code you did not write is the core skill. Not style nits: ownership, failure modes, whether the abstraction survives its third user. A generated pull request is a set of decisions someone else made quickly. Your job is to find the one that will be expensive in six months.

**You encode judgement so it runs on every prompt.** Types, lint rules, design tokens, primitives, tests, a performance budget. A model with a well-defined component library converges on it; a model with a fuzzy one invents a sixty-first variant and you now maintain it. Your design system stops being a nicety and becomes the guardrail that keeps generated code inside your architecture.

**You write the test first, then let the model make it pass.** A failing test is an unambiguous specification. It cannot be misinterpreted, it cannot be flattered, and it tells you immediately when the implementation is wrong. Pair it with a prompt and you have moved the model's job from "guess what I want" to "satisfy this contract".

Taste becomes a technical skill. It is the ability to look at code that works and say no.

## Does it kill frontend? No. It kills transcription.

The part of the job that was mostly typing — boilerplate, prop plumbing, a table that sorts, a modal that opens — is being absorbed. That was never the interesting part, and pretending otherwise is why the panic sounds hollow.

What survives is the part that was always hard: deciding what the system should do, where the boundaries belong, what happens when the network is slow, who owns the truth, and how you will know it works. Those questions do not get easier when code appears faster. They get more expensive, because there is more code to be wrong.

The engineer who only knew syntax is in trouble. The engineer who knew why is in demand, because they are the only one who can tell a plausible diff from a correct one.

So no, this does not end frontend development. It ends the idea that frontend development was mostly transcription.

The prompt is not the work. It is the brief. The work is knowing what to ask for, what to refuse, and how to prove it holds. That was always the job. Vibe coding just stopped paying a premium for the typing.
