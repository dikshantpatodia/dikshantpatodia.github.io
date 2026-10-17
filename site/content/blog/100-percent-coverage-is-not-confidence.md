---
title: 100% coverage is not confidence
date: 2026-10-14
category: Testing
summary: Coverage measures which lines ran, not whether the behaviour is protected. A suite can be green and still tell you nothing.
tags: Testing, Jest, React Testing Library
---

I have seen suites with high coverage that would happily pass while the feature they covered was broken. The lines executed; the assertions protected nothing.

## The useful question

The useful question is not "what percentage?" but "what would break, and would a test tell me?" That reframes testing around the expensive failures rather than the easy lines.

Over eight years I have written more than a thousand tests. The ones that earned their place all had the same shape: they failed loudly when a real behaviour changed, and they stayed quiet when the implementation was refactored.

- Test behaviour and contracts, not implementation details.
- Start where a regression would be most expensive.
- Keep the suite fast enough that it stays in the loop.
- Delete tests that protect nothing.

## Coverage is a smell detector

Coverage is one input, and a weak one on its own. It is good at finding code that nothing exercises. It is bad at telling you whether what *is* exercised is verified.

Confidence is the ability to ship on a Friday. Coverage is a hint on the way there, not the destination.
