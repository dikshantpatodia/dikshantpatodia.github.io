---
title: The hidden cost of one more abstraction
date: 2026-10-17
category: Architecture
summary: Every abstraction is a public interface you now owe to everyone who uses it. The cost arrives later, and it arrives quietly.
tags: Architecture, Design systems
---

An abstraction is a promise: *this shape will hold, and you may build on it*. Make the promise too early and you are maintaining a guess.

## Duplication is cheap and reversible

Duplication is cheap and reversible. The wrong abstraction is expensive and sticky, because removing it means touching everything that trusted it.

I have spent more time unwinding an early abstraction than I would have spent writing the duplicated code three times over. The duplication would have shown me the real shape; the abstraction hid it behind a plausible name.

## Extract on the third use

I extract on the third real use, not the first imagined one. The wait costs a little repetition and saves a lot of undoing.

- First use: write it inline.
- Second use: copy it, and notice the difference.
- Third use: now the shared shape is real, and worth naming.

That is not a rule about counting. It is a rule about evidence. Wait until the code has told you what it wants to be.
