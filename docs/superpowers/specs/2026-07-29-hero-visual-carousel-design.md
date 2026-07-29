# Hero visual carousel — design spec

Date: 2026-07-29
Scope: `index.html` hero section (`.card-fan` / `.fan-card` visual, currently a static 5-card perspective fan with "Screenshot coming soon" placeholders).

## Goal

Replace the current static fan deck with a responsive, cycling image system:

- Desktop: bigger fan deck, pulled closer to the hero copy, cycling automatically and scrubbable by scroll.
- Tablet: three flat cards shown side by side, cycling automatically.
- Mobile: one card at a time, swipeable by touch, cycling automatically when idle.

All three breakpoints share one underlying set of 5 "slides" (currently placeholders numbered 01–05; real screenshots drop in later without any behavior change).

## Breakpoints

Reuse the site's existing hero-visual breakpoints:

- **Desktop:** `min-width: 901px`
- **Tablet:** `461px–900px`
- **Mobile:** `max-width: 460px`

## Shared data model

5 slide elements, each the existing card markup (`.card-bar` dots + `.card-ph` placeholder label `NN Screenshot coming soon`). All three breakpoint layouts read from the same 5 DOM nodes — no separate content per breakpoint. An `activeIndex` (0–4) is the single source of truth per layout mode; only its presentation differs.

## Desktop layout & behavior (>900px)

- Card width increases from the current 380px to ~440–460px (final value tuned against the copy column so the deck sits closer to the text, per the approved mockup).
- Perspective fan stack unchanged in spirit (5 cards, `rotateY(-24deg)`, staggered `translateY`/`translateZ`), front card = `activeIndex`.
- **Autoplay:** advances `activeIndex` every 4s by default, looping 0→4→0. Cross-fade/re-stack transition reuses the existing `.fan-card` CSS transition (transform + opacity, ~0.5–0.6s).
- **Scroll-scrub:** while the user is actively scrolling, `activeIndex` is instead driven by scroll position:
  - Progress is measured over a fixed 600px scroll window starting when the hero visual's top crosses the viewport top.
  - `progress = clamp((scrollY - startY) / 600, 0, 1)`, mapped to `activeIndex = floor(progress * 5)` (clamped 0–4).
  - A scroll listener (rAF-throttled) updates `activeIndex` directly while scroll events are firing.
  - 150ms after the last scroll event, scrubbing is considered "stopped"; autoplay resumes from the current `activeIndex` after an additional ~1.5s pause.
- No layout shift: the fan stage keeps a fixed height/width regardless of which slide is active (same technique as the current implementation).

## Tablet layout & behavior (461–900px)

- No perspective/rotation tilt. 3 cards horizontally aligned in a row (flex or grid, all sharing the same vertical center — no stagger), sliding window over the 5 slides keyed off `activeIndex`: visible = `[activeIndex-1, activeIndex, activeIndex+1] mod 5`.
- **Center card is the active one, and it's visually emphasized**: sized ~1.12–1.15× the two side cards and horizontally centered in the row; the two side (neighbor) cards are the same smaller size as each other, optionally slightly dimmed (lower opacity, e.g. ~0.75) to reinforce which one is active. All three still share one common vertical center line (per the "horizontally aligned" requirement — the size difference is handled by the center card growing symmetrically, not by shifting the row's alignment).
- 5 dots below the row show position; the dot matching `activeIndex` is highlighted (elongated pill, matching existing dot patterns used elsewhere on the site, e.g. `.ps-dots`).
- **Autoplay:** advances `activeIndex` every 4s, same loop as desktop/mobile.
- **Touch swipe, in addition to autoplay:** drag left/right on the card row (`touchstart`/`touchmove`/`touchend`, ~40px horizontal threshold, same mechanics as mobile) advances/reverses `activeIndex` by 1, wrapping at the ends. A swipe pauses autoplay, which resumes ~1.5s after the last swipe (same idle-resume pattern used elsewhere). The swipe listener is scoped to the card row itself (not the full page) so it doesn't collide with normal vertical page-scroll touch gestures.
- No scroll-scrub on tablet (unchanged from before — scroll-scrub stays a desktop-only behavior; touch-scroll of the page and touch-swipe of the carousel are two distinct, non-conflicting gestures here since swipe is horizontal and page-scroll is vertical).
- Dots are clickable in addition to being status indicators, consistent with adding direct touch interaction at this breakpoint.

## Mobile layout & behavior (≤460px)

- Single card, same visual style, sized to the existing mobile card width. Sits below the hero copy, above the CTA — matching the existing mobile ordering already in place.
- **Touch swipe:** drag left/right (via `touchstart`/`touchmove`/`touchend`, horizontal delta threshold ~40px) advances/reverses `activeIndex` by 1, wrapping at the ends.
- 5 dots below the card, same active-dot styling as tablet.
- **Autoplay when idle:** advances every 4s; any user swipe pauses autoplay, which resumes ~1.5s after the last swipe (same idle-resume pattern as desktop's scroll-scrub).
- No scroll-scrub on mobile (scroll is the page-navigation gesture; swipe is the slide-navigation gesture — kept separate to avoid gesture collision).

## Accessibility & motion

- Respect the site's existing `prefers-reduced-motion` handling (`@media(prefers-reduced-motion:reduce)` already disables `.reveal` transitions globally) — autoplay interval and CSS transitions for the fan/slide should be skipped or instant under reduced motion; slides can still be advanced by scroll/swipe/dots.
- Dots get accessible labels (`aria-label="Slide N of 5"`), and the slide container gets `aria-live="off"` (autoplay shouldn't spam screen readers) with each slide's placeholder text remaining in the accessibility tree.
- Touch targets (dots) sized ≥24px hit area even if visually smaller, consistent with existing patterns like `.ps-dot`.

## Implementation notes

- Vanilla JS, no new dependencies — consistent with the rest of `index.html` (see the existing `.ps-track` partner-badge autoplay carousel for the pattern to mirror: interval-based `active` class toggling, dot sync).
- One shared `activeIndex` state + render function per breakpoint mode; a single `matchMedia` check (mirroring the existing `isAccordion()` pattern used for the "Why DynaLens" tabs) selects which behavior (fan/scrub, row-of-3, swipe) is active, and re-evaluates on resize.
- Placeholder content (`Screenshot coming soon`, numbered 01–05) stays as-is; swapping in real screenshots later is a content change only, not a behavior change.

## Testing / verification plan

- Visual check at representative widths (desktop ~1440, tablet ~768–820, mobile ~390) via the existing local-server + iframe technique used earlier in this session.
- Verify autoplay cycles all 5 slides at each breakpoint without layout shift.
- Verify desktop scroll-scrub: scrolling through the hero moves `activeIndex` forward/back correctly, and autoplay resumes after scrolling stops.
- Verify mobile touch swipe (simulated via Chrome DevTools touch emulation or Playwright touch events) advances/reverses correctly and wraps at both ends.
- Verify `prefers-reduced-motion` disables automatic motion but leaves manual controls (dots/swipe/scroll) working.
- Re-run the existing responsive pass (this session's earlier iframe-based check) to confirm no regressions elsewhere on the page.
