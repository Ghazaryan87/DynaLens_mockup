---
name: avoid-empty-spacing
description: Use when sizing a container/box to fit variable-height content (fixed-height tab panels, accordions, card stacks) that must not overflow or shift the layout — measure the real content across the relevant breakpoint range instead of picking one conservative flat number.
---

# Avoid excessive empty vertical spacing

When a box needs a fixed/min height so switching its content (tabs, accordions,
carousels) doesn't reflow the page, don't pick one "safe" flat number sized to
the worst case and call it done. Content height for the same component often
varies a lot across the width range it has to cover — a single conservative
value that's safe at the narrow end wastes a lot of vertical space at the wide
end.

## What to do instead

1. **Measure, don't guess.** For each tab/panel/card whose content could be
   active, get its real rendered height (`scrollHeight`, not a value read off
   one screenshot) at several widths spanning the range this rule must cover —
   at minimum the narrow edge, the wide edge, and 2-3 points in between. A
   quick way: load the page in same-origin iframes at each width and toggle
   through every content state, reading `element.scrollHeight`.

2. **Watch for the two failure modes, not just one.**
   - Too small → content clips or overflows into whatever comes after it.
   - Too large (a single flat value sized for the worst case) → a big dead
     zone under shorter content, which reads as a layout bug even though
     nothing is technically broken.
   Fixing the first without checking for the second just trades one problem
   for the other.

3. **If content height changes meaningfully across the width range, tier the
   fix** — a few `@media(min-width: …)` steps that each shrink the min-height
   to that tier's own measured worst case, rather than one number for the
   whole range. Size each tier to its narrow edge (where content is tallest)
   plus a small buffer (~8-12px), not to the absolute global worst case.

4. **Percentage `max-height` as a "safety net" on an absolutely-positioned
   child does not reliably resolve against a `min-height`-only ancestor.**
   If the ancestor's `height` is otherwise `auto` (sized by content, floored
   by `min-height`), percentage heights on descendants can resolve against
   the ancestor's own natural/unconstrained content height instead of its
   rendered (min-height-clamped) height — silently clipping content instead
   of protecting it. Don't add this as a reflexive safety net; if you need a
   hard cap, use an explicit pixel `max-height` that matches your measured
   tiers, or skip it entirely once the tiers are measured tightly enough that
   overflow can't happen.

5. **After changing a fixed-size box, re-measure the gap to whatever comes
   after it.** A large visual gap below a box is often the box being
   oversized, not the section spacing itself — fix the box first, then only
   touch section padding/margin if a real gap remains.
