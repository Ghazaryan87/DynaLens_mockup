# Hero Visual Carousel Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the static 5-card perspective fan in the homepage hero (`index.html`) with a single cycling carousel component that renders three different ways depending on viewport — a bigger, scroll-scrubbable fan on desktop, a 3-across "center emphasized" row on tablet, and a single swipeable card on mobile — all driven by one shared `activeIndex` state.

**Architecture:** One self-contained vanilla-JS IIFE (`heroCarousel`) owns a single `activeIndex` over 5 slide elements and a `render()` function that assigns different CSS state classes to those slides depending on which of three modes (`desktop`/`tablet`/`mobile`) `matchMedia` currently reports. CSS per mode interprets those state classes differently (fan transform vs. 3-across flex row vs. single visible card) — the JS never branches on layout math, only on which classes to apply.

**Tech Stack:** Plain HTML/CSS/JS inline in `index.html` (no build step, no framework, no test runner) — matches every existing interactive component on this site (partner-badge carousel, "Why DynaLens" tabs, mobile nav).

## Global Constraints

- No new dependencies, no build tooling, no separate JS/CSS files — this is a single static `index.html` file and every existing interactive widget on the page is inline `<style>`/`<script>`. Follow that pattern exactly.
- This project has **no automated test suite**. "Testing" in this plan means deterministic browser verification: serve the directory locally and run JS assertions via the browser console (or the `mcp__claude-in-chrome__javascript_tool` tool if the executor has it) against a real DOM. Every verification step below gives the exact JS to run and the exact expected result — treat these with the same rigor as an automated test.
- Reuse existing design tokens/classes instead of inventing new ones: `var(--cyan)`, `var(--line-strong)`, `var(--line)`, `.fan-bar`/`.d`/`.d1`/`.d2`/`.d3`/`.fan-ph` (the little "browser chrome" traffic lights + placeholder label — keep these exactly as they are, only the outer slide/stage/dots wrapper classes are new).
- Breakpoints for this feature: **desktop** `min-width:901px`, **tablet** `461px–900px`, **mobile** `max-width:460px` (matches the site's existing hero-visual breakpoints).
- Respect `prefers-reduced-motion`: the site already has a global rule (`index.html:556`, `@media(prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}...}`) that kills CSS transitions site-wide under reduced motion — the only additional thing this feature must do is not *start the autoplay timer* under reduced motion (manual controls — dots, swipe, scroll-scrub — must still work).
- Local dev server for verification: `python3 -m http.server 8973` from `/home/gevorg/Desktop/DynaLens_FrontEnd` (an instance may already be running from earlier work in this project — check with `curl -sI http://localhost:8973/index.html` before starting a second one).

---

## File Structure

Everything lives in `/home/gevorg/Desktop/DynaLens_FrontEnd/index.html`. No new files.

- **HTML** (`index.html:867–888`): replace the existing `.card-fan.hero-visual` block with the new `#heroCarousel` markup (5 `.hc-slide`s + `.hc-dots`).
- **CSS — remove**: the entire "HERO CARD FAN" block (`index.html:221–253`, the `.card-fan`/`.fan-card` rules and their two `@media` blocks) — fully superseded.
- **CSS — add**: a new "HERO CAROUSEL" block in the same location with shared rules + one `@media` block per mode (desktop/tablet/mobile), plus a small `.hero-visual.hero-carousel` min-height override block placed after the existing generic `.hero-visual` min-height rules (`index.html:215–219`) so it doesn't touch other reused instances of `.hero-visual` (the FinOps/Assist mini-hero dash panels also use that class).
- **CSS — modify**: `.hero-grid` (`index.html:202`) — tighten `column-gap` and rebalance the column ratio so the bigger carousel sits closer to the copy on desktop.
- **JS — add**: a new `heroCarousel` IIFE in the existing `<script>` block at the bottom of the page (near the other IIFEs — partner-badge carousel at `index.html:1272`, tabs at `index.html:1287`-ish after earlier edits). Self-contained, no globals leaked, matches the existing IIFE style exactly.

## Interfaces (shared across all tasks)

**HTML contract every task relies on:**
```html
<div class="hero-visual hero-carousel reveal" id="heroCarousel">
  <div class="hc-stage" id="hcStage" aria-hidden="true">
    <div class="hc-slide" data-idx="0"> ... </div>
    <!-- ... data-idx 1..4 ... -->
  </div>
  <div class="hc-dots" id="hcDots">
    <button class="hc-dot active" data-idx="0" aria-label="Slide 1 of 5"></button>
    <!-- ... data-idx 1..4 ... -->
  </div>
</div>
```

**CSS state-class contract the JS assigns and the CSS interprets per mode:**
- Desktop: each `.hc-slide` gets exactly one of `hc-pos-0` (front/active) through `hc-pos-4` (back-most), computed as `(i - activeIndex + 5) % 5`.
- Tablet: the 3 currently-visible slides get `hc-t-vis` plus exactly one of `hc-t-center` / `hc-t-left` / `hc-t-right`; the other 2 slides get neither (hidden).
- Mobile: the 1 currently-visible slide gets `hc-m-vis`; the other 4 get nothing (hidden).
- All modes: `.hc-dot.active` marks the dot matching `activeIndex`.

**JS contract:** a single closure-scoped `active` integer (0–4) is the source of truth; `goTo(i)`, `next()`, `prev()` mutate it and call `render()`; `render()` reads `matchMedia` to decide which class set to apply. No task after Task 1 needs to touch this contract — they only add CSS that gives meaning to classes Task 1's `render()` already assigns.

---

### Task 1: Replace hero markup, add the carousel engine (JS), desktop mode CSS

**Files:**
- Modify: `index.html:202` (`.hero-grid`)
- Modify: `index.html:221–253` (delete old fan CSS, add new shared + desktop CSS)
- Modify: `index.html:867–888` (hero visual markup)
- Modify: `index.html` `<script>` block — add `heroCarousel` IIFE near `index.html:1272`

**Interfaces:**
- Produces: the full HTML/CSS/JS contract described above (all of it — `render()` handles all three modes' class assignment from the start, even though tablet/mobile CSS doesn't exist until Tasks 2–3, so those modes are inert-but-correct until then).

- [ ] **Step 1: Confirm current baseline still matches expectations**

Run: `curl -s http://localhost:8973/index.html | sed -n '867,888p'`
Expected: prints the existing `<div class="card-fan hero-visual reveal">` block with 5 `.fan-card` children numbered 01–05 — confirms nothing else changed this block since the plan was written.

- [ ] **Step 2: Replace the hero visual markup**

In `index.html`, replace lines 867–888:

```html
      <div class="card-fan hero-visual reveal">
        <div class="fan-card">
          <div class="fan-bar"><span class="d d1"></span><span class="d d2"></span><span class="d d3"></span></div>
          <div class="fan-ph"><span>01</span>Screenshot coming soon</div>
        </div>
        <div class="fan-card">
          <div class="fan-bar"><span class="d d1"></span><span class="d d2"></span><span class="d d3"></span></div>
          <div class="fan-ph"><span>02</span>Screenshot coming soon</div>
        </div>
        <div class="fan-card">
          <div class="fan-bar"><span class="d d1"></span><span class="d d2"></span><span class="d d3"></span></div>
          <div class="fan-ph"><span>03</span>Screenshot coming soon</div>
        </div>
        <div class="fan-card">
          <div class="fan-bar"><span class="d d1"></span><span class="d d2"></span><span class="d d3"></span></div>
          <div class="fan-ph"><span>04</span>Screenshot coming soon</div>
        </div>
        <div class="fan-card">
          <div class="fan-bar"><span class="d d1"></span><span class="d d2"></span><span class="d d3"></span></div>
          <div class="fan-ph"><span>05</span>Screenshot coming soon</div>
        </div>
      </div>
```

with:

```html
      <div class="hero-visual hero-carousel reveal" id="heroCarousel">
        <div class="hc-stage" id="hcStage" aria-hidden="true">
          <div class="hc-slide" data-idx="0">
            <div class="fan-bar"><span class="d d1"></span><span class="d d2"></span><span class="d d3"></span></div>
            <div class="fan-ph"><span>01</span>Screenshot coming soon</div>
          </div>
          <div class="hc-slide" data-idx="1">
            <div class="fan-bar"><span class="d d1"></span><span class="d d2"></span><span class="d d3"></span></div>
            <div class="fan-ph"><span>02</span>Screenshot coming soon</div>
          </div>
          <div class="hc-slide" data-idx="2">
            <div class="fan-bar"><span class="d d1"></span><span class="d d2"></span><span class="d d3"></span></div>
            <div class="fan-ph"><span>03</span>Screenshot coming soon</div>
          </div>
          <div class="hc-slide" data-idx="3">
            <div class="fan-bar"><span class="d d1"></span><span class="d d2"></span><span class="d d3"></span></div>
            <div class="fan-ph"><span>04</span>Screenshot coming soon</div>
          </div>
          <div class="hc-slide" data-idx="4">
            <div class="fan-bar"><span class="d d1"></span><span class="d d2"></span><span class="d d3"></span></div>
            <div class="fan-ph"><span>05</span>Screenshot coming soon</div>
          </div>
        </div>
        <div class="hc-dots" id="hcDots">
          <button class="hc-dot active" data-idx="0" aria-label="Slide 1 of 5"></button>
          <button class="hc-dot" data-idx="1" aria-label="Slide 2 of 5"></button>
          <button class="hc-dot" data-idx="2" aria-label="Slide 3 of 5"></button>
          <button class="hc-dot" data-idx="3" aria-label="Slide 4 of 5"></button>
          <button class="hc-dot" data-idx="4" aria-label="Slide 5 of 5"></button>
        </div>
      </div>
```

(`aria-hidden="true"` on `#hcStage`: this deck is currently 100% placeholder text — "Screenshot coming soon" — so it's decorative until real screenshots land; the dots are the real, labeled interactive control. See Task 5 for the full accessibility rationale.)

- [ ] **Step 3: Tighten the hero grid so the (bigger) carousel sits closer to the copy**

Replace `index.html:202`:

```css
  .hero-grid{display:grid;grid-template-columns:1.05fr .95fr;grid-template-areas:"intro visual" "cta visual";column-gap:54px;row-gap:0;align-items:center}
```

with:

```css
  .hero-grid{display:grid;grid-template-columns:1fr 1.05fr;grid-template-areas:"intro visual" "cta visual";column-gap:36px;row-gap:0;align-items:center}
```

- [ ] **Step 4: Delete the old fan CSS and add the new shared + desktop CSS**

Replace `index.html:221–253` (the whole "HERO CARD FAN" comment block through the closing `}` of the `@media(max-width:460px)` rule) with:

```css
  /* ---------- HERO CAROUSEL (shared) ---------- */
  .hc-stage{position:relative}
  .hc-slide{position:absolute;top:50%;left:50%;border-radius:14px;overflow:hidden;display:flex;flex-direction:column;background:linear-gradient(165deg,rgba(20,30,110,.92),rgba(7,11,46,.97));border:1px solid var(--line-strong);box-shadow:0 30px 60px -20px rgba(0,0,0,.65);transition:transform .5s cubic-bezier(.2,.8,.2,1),box-shadow .5s ease;will-change:transform}
  .hc-slide:hover{box-shadow:0 40px 80px -20px rgba(0,0,0,.75)}
  .fan-bar{display:flex;gap:5px;padding:9px 12px;border-bottom:1px solid var(--line);flex-shrink:0}
  .fan-bar .d{width:6px;height:6px;border-radius:50%}
  .fan-bar .d1{background:#FF5F57}.fan-bar .d2{background:#FEBC2E}.fan-bar .d3{background:#28C840}
  .fan-ph{flex:1;display:flex;flex-direction:row;align-items:center;justify-content:center;gap:10px;text-align:left;padding:10px 16px;font-family:'JetBrains Mono';font-size:9.5px;letter-spacing:.05em;text-transform:uppercase;color:var(--text-faint)}
  .fan-ph span{font-family:'Space Grotesk';font-size:17px;font-weight:700;color:var(--text-dim);letter-spacing:0;flex-shrink:0}
  .hc-dots{display:none;justify-content:center;gap:4px;margin-top:18px}
  .hc-dot{width:24px;height:24px;background:transparent;border:none;padding:0;cursor:pointer;display:flex;align-items:center;justify-content:center}
  .hc-dot::after{content:"";width:8px;height:8px;border-radius:4px;background:rgba(255,255,255,.28);transition:all .25s ease}
  .hc-dot:hover::after{background:rgba(255,255,255,.45)}
  .hc-dot.active::after{background:var(--cyan);width:20px}

  /* ---------- HERO CAROUSEL — desktop (fan) ---------- */
  @media(min-width:901px){
    .hc-stage{perspective:600px;height:460px}
    .hc-slide{width:440px;aspect-ratio:16/9}
    .hc-slide.hc-pos-0{transform:translate(-50%,-50%) translateY(-92px) translateX(0) translateZ(15px) rotateY(-24deg);z-index:5}
    .hc-slide.hc-pos-1{transform:translate(-50%,-50%) translateY(-46px) translateX(-23px) translateZ(7px) rotateY(-24deg);z-index:4}
    .hc-slide.hc-pos-2{transform:translate(-50%,-50%) translateY(0) translateX(-46px) translateZ(0) rotateY(-24deg);z-index:3}
    .hc-slide.hc-pos-3{transform:translate(-50%,-50%) translateY(46px) translateX(-69px) translateZ(-7px) rotateY(-24deg);z-index:2}
    .hc-slide.hc-pos-4{transform:translate(-50%,-50%) translateY(92px) translateX(-92px) translateZ(-15px) rotateY(-24deg);z-index:1}
  }
```

- [ ] **Step 5: Add the `heroCarousel` JS engine**

In the `<script>` block, immediately before the `// ---------- PARTNER BADGE CAROUSEL ----------` comment (`index.html:1271` in the pre-Task-1 file), add:

```javascript
  // ---------- HERO CAROUSEL ----------
  (function(){
    const root = document.getElementById('heroCarousel');
    if(!root) return;
    const stage = document.getElementById('hcStage');
    const slides = Array.from(root.querySelectorAll('.hc-slide'));
    const dots = Array.from(root.querySelectorAll('.hc-dot'));
    const n = slides.length;
    if(!n) return;
    let active = 0;
    let autoplayTimer = null;
    let idleTimer = null;

    function mode(){
      if(window.matchMedia('(min-width:901px)').matches) return 'desktop';
      if(window.matchMedia('(max-width:460px)').matches) return 'mobile';
      return 'tablet';
    }

    function reducedMotion(){
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }

    function clearStateClasses(el){
      el.classList.remove('hc-pos-0','hc-pos-1','hc-pos-2','hc-pos-3','hc-pos-4',
        'hc-t-vis','hc-t-center','hc-t-left','hc-t-right','hc-m-vis');
    }

    function render(){
      const m = mode();
      slides.forEach((el,i)=>{
        clearStateClasses(el);
        const offset = (i - active + n) % n;
        if(m === 'desktop'){
          el.classList.add('hc-pos-'+offset);
        } else if(m === 'tablet'){
          if(offset === 0){ el.classList.add('hc-t-vis','hc-t-center'); }
          else if(offset === 1){ el.classList.add('hc-t-vis','hc-t-right'); }
          else if(offset === n-1){ el.classList.add('hc-t-vis','hc-t-left'); }
        } else {
          if(offset === 0){ el.classList.add('hc-m-vis'); }
        }
      });
      dots.forEach((d,i)=>d.classList.toggle('active', i === active));
    }

    function goTo(i){
      active = (i + n) % n;
      render();
    }
    function next(){ goTo(active + 1); }
    function prev(){ goTo(active - 1); }

    function startAutoplay(){
      stopAutoplay();
      if(reducedMotion()) return;
      autoplayTimer = setInterval(next, 4000);
    }
    function stopAutoplay(){
      if(autoplayTimer) clearInterval(autoplayTimer);
      autoplayTimer = null;
    }
    function pauseThenResume(){
      stopAutoplay();
      if(idleTimer) clearTimeout(idleTimer);
      idleTimer = setTimeout(startAutoplay, 1500);
    }

    dots.forEach(d=>d.addEventListener('click', ()=>{
      goTo(parseInt(d.dataset.idx, 10));
      pauseThenResume();
    }));

    // ---- desktop scroll-scrub (wired here, populated fully in Task 2) ----
    let scrubStartY = null;
    let scrollIdleTimer = null;
    let rafPending = false;
    function onScroll(){
      if(mode() !== 'desktop') return;
      if(scrubStartY === null){
        const rect = root.getBoundingClientRect();
        scrubStartY = window.scrollY + rect.top;
      }
      if(rafPending) return;
      rafPending = true;
      requestAnimationFrame(()=>{
        rafPending = false;
        const progress = Math.min(1, Math.max(0, (window.scrollY - scrubStartY) / 600));
        const idx = Math.min(n - 1, Math.floor(progress * n));
        stopAutoplay();
        goTo(idx);
        if(scrollIdleTimer) clearTimeout(scrollIdleTimer);
        scrollIdleTimer = setTimeout(()=>{ setTimeout(startAutoplay, 1500); }, 150);
      });
    }
    window.addEventListener('scroll', onScroll, {passive:true});

    // ---- touch swipe (tablet + mobile; populated fully in Tasks 2-3) ----
    let touchStartX = null;
    stage.addEventListener('touchstart', (e)=>{
      if(mode() === 'desktop') return;
      touchStartX = e.touches[0].clientX;
    }, {passive:true});
    stage.addEventListener('touchend', (e)=>{
      if(mode() === 'desktop' || touchStartX === null) return;
      const dx = e.changedTouches[0].clientX - touchStartX;
      touchStartX = null;
      if(Math.abs(dx) < 40) return;
      if(dx < 0){ next(); } else { prev(); }
      pauseThenResume();
    }, {passive:true});

    window.addEventListener('resize', render);

    render();
    startAutoplay();
  })();

```

- [ ] **Step 6: Verify desktop behavior**

Run: `python3 -m http.server 8973 & sleep 1; curl -sI http://localhost:8973/index.html | head -1` (skip the server start if one is already running on 8973). Open `http://localhost:8973/index.html` in a browser at ≥901px width, open devtools console, and run:

```javascript
document.querySelectorAll('.hc-slide.hc-pos-0').length
```
Expected: `1` (exactly one slide is currently "front").

```javascript
document.querySelector('.hc-slide[data-idx="0"]').className
```
Expected includes `hc-pos-0` (slide 0 starts active).

Then run:
```javascript
document.querySelector('.hc-dot[data-idx="2"]').click();
document.querySelector('.hc-slide[data-idx="2"]').className
```
Expected includes `hc-pos-0`, and `document.querySelectorAll('.hc-dot.active')[0].dataset.idx` is `"2"`.

Visually: the fan should look like the old one (5 stacked, tilted cards) but larger and closer to the copy; it should auto-advance every ~4s without you touching anything (watch for ~9s and confirm the front card's number label changes at least once).

- [ ] **Step 7: Commit**

```bash
git add index.html
git commit -m "Replace static hero fan deck with carousel engine (desktop mode)"
```

---

### Task 2: Desktop scroll-scrub verification (logic already added in Task 1)

Task 1 already wired the full scroll-scrub listener. This task is purely verification plus a small fix-forward step if the check fails — do not re-add code that's already present.

**Files:**
- Verify only: `index.html` (no changes expected unless Step 1 finds a bug)

- [ ] **Step 1: Verify scroll-scrub drives `activeIndex`**

With the hero visible at the top of the page (desktop width, ≥901px), run in the console:

```javascript
window.scrollTo(0, 0);
```
then
```javascript
window.scrollTo(0, 300);
document.querySelectorAll('.hc-dot.active')[0] // note: dots are display:none on desktop, this just confirms internal state via class, so instead check slide state directly:
document.querySelector('.hc-slide.hc-pos-0').dataset.idx
```
Expected: a middle-ish index (300/600 progress × 5 slides ≈ index 2), and it should differ from whatever the autoplay had landed on before scrolling.

```javascript
window.scrollTo(0, 600);
document.querySelector('.hc-slide.hc-pos-0').dataset.idx
```
Expected: `"4"` (progress clamped to 1 → last slide).

- [ ] **Step 2: Verify autoplay resumes after scrolling stops**

```javascript
window.scrollTo(0, 300);
```
Wait ~2 seconds (150ms scroll-idle + 1.5s resume delay), then confirm the front slide's index changes on its own within the next 5 seconds without further scrolling (autoplay resumed and is advancing).

- [ ] **Step 3: If either check fails, fix forward**

If Step 1 shows no change, the most likely cause is `scrubStartY` being computed once and never reset when the user scrolls back above the hero and down again — that's expected/acceptable (it's a one-shot scrub window per page load, matching the spec's "fixed 600px scroll window starting when the hero visual's top crosses the viewport top"). If the index doesn't move at all even on the first scroll, check `mode()` is returning `'desktop'` at your test width and that `onScroll` isn't erroring (check the console for exceptions) before changing any code.

- [ ] **Step 4: Commit (only if a fix was needed)**

```bash
git add index.html
git commit -m "Fix desktop scroll-scrub behavior"
```

---

### Task 3: Tablet layout — 3-across, center-emphasized row, with touch swipe

**Files:**
- Modify: `index.html` — add a new `@media(max-width:900px)` rule inside the "HERO CAROUSEL" CSS block added in Task 1 (place it directly after the desktop `@media(min-width:901px)` block).

**Interfaces:**
- Consumes: `.hc-t-vis`, `.hc-t-center`, `.hc-t-left`, `.hc-t-right` classes already assigned by Task 1's `render()`; touch swipe handlers already wired in Task 1 (gated on `mode() !== 'desktop'`, so they already fire in tablet mode).
- Produces: nothing new for later tasks to consume — this is a leaf CSS addition.

- [ ] **Step 1: Add tablet CSS**

Add immediately after the `@media(min-width:901px){...}` block from Task 1:

```css
  /* ---------- HERO CAROUSEL — tablet (3-across, center emphasized) ---------- */
  @media(max-width:900px){
    .hc-stage{position:static;display:flex;align-items:center;justify-content:center;gap:14px;perspective:none;height:auto}
    .hc-slide{position:static;top:auto;left:auto;width:220px;aspect-ratio:4/3;transform:none!important;display:none;flex-shrink:0;opacity:.75}
    .hc-slide.hc-t-vis{display:flex}
    .hc-slide.hc-t-center{opacity:1;width:250px;order:2}
    .hc-slide.hc-t-left{order:1}
    .hc-slide.hc-t-right{order:3}
    .hc-dots{display:flex}
  }
```

(`.hc-dots{display:flex}` here overrides the shared `display:none` default from Task 1 — tablet and mobile both need dots visible; desktop stays hidden since only the `min-width:901px` block exists for it and never sets `display:flex`.)

- [ ] **Step 2: Verify tablet layout at 768px width**

Open `http://localhost:8973/index.html` in an iframe or window sized to 768px width (reuse the session's established iframe-at-fixed-width technique if you don't have real device emulation), and run:

```javascript
document.querySelectorAll('.hc-slide.hc-t-vis').length
```
Expected: `3`.

```javascript
document.querySelector('.hc-slide.hc-t-center').offsetWidth > document.querySelector('.hc-slide.hc-t-left').offsetWidth
```
Expected: `true` (center card is visibly bigger than its neighbors).

```javascript
getComputedStyle(document.querySelector('.hc-dots')).display
```
Expected: `"flex"` (dots visible at this width, unlike desktop).

- [ ] **Step 3: Verify touch swipe advances/reverses and wraps**

Real touch events can't be typed from a keyboard-driven console easily; simulate by calling the same handlers the touch listeners would trigger, via synthetic `TouchEvent`s if the browser supports constructing them, or more simply by driving `next()`/`prev()` indirectly through the dot click path already verified in Task 1 Step 6 (dots and swipe both funnel into the same `goTo`/`pauseThenResume` — swipe correctness is really about the `touchstart`/`touchend` delta math, which is pure and doesn't depend on layout). Verify the delta math directly:

```javascript
// Simulate what the swipe handler computes for a 60px leftward drag:
const dx = 40 - 100; // touchStartX=100, end clientX=40
Math.abs(dx) >= 40 && dx < 0
```
Expected: `true` — confirms a ≥40px leftward drag would call `next()` per the handler logic in Task 1.

If a real device or Chrome DevTools touch emulation is available, drag left/right across the card row and confirm the center card's number changes and wraps from `05`→`01` when swiping past the last slide.

- [ ] **Step 4: Commit**

```bash
git add index.html
git commit -m "Add tablet 3-across carousel layout with touch swipe"
```

---

### Task 4: Mobile layout — single card, touch swipe

**Files:**
- Modify: `index.html` — add a new `@media(max-width:460px)` rule directly after the tablet block from Task 3.

**Interfaces:**
- Consumes: `.hc-m-vis` class already assigned by Task 1's `render()`; touch swipe already wired in Task 1 (fires for any non-desktop mode, including mobile).
- Produces: nothing new for later tasks.

- [ ] **Step 1: Add mobile CSS**

Note before you add this: `max-width:460px` is a *subset* of Task 3's `max-width:900px` range, so at mobile widths **both** blocks apply — this rule intentionally only overrides the handful of properties that differ (`width`, `aspect-ratio`, `opacity`), relying on Task 3's block for `position:static`, the `transform:none!important` reset, and the `display:none` default (which stays correct at mobile since JS never applies `hc-t-vis` in `'mobile'` mode — only `hc-m-vis`). This isn't a bug to "fix" by duplicating those properties; it's why this block must stay physically *after* Task 3's block in source order (later wins the cascade at equal specificity).

Add immediately after the tablet `@media(max-width:900px){...}` block:

```css
  /* ---------- HERO CAROUSEL — mobile (single card) ---------- */
  @media(max-width:460px){
    .fan-bar{padding:7px 10px}
    .fan-ph{padding:8px 12px;font-size:8.5px;gap:7px}
    .fan-ph span{font-size:14px}
    .hc-stage{display:flex;justify-content:center}
    .hc-slide{width:230px;aspect-ratio:16/9;opacity:1}
    .hc-slide.hc-m-vis{display:flex}
  }
```

- [ ] **Step 2: Verify mobile layout at 390px width**

At 390px width, run:

```javascript
document.querySelectorAll('.hc-slide.hc-m-vis').length
```
Expected: `1`.

```javascript
getComputedStyle(document.querySelector('.hc-dots')).display
```
Expected: `"flex"`.

```javascript
document.querySelector('.hc-slide.hc-m-vis').getBoundingClientRect().width
```
Expected: `230` (matches the fixed mobile card width — confirms no layout shift as `activeIndex` changes, since every slide shares the same CSS rule).

- [ ] **Step 3: Verify autoplay pauses on swipe and resumes**

```javascript
// grab current active index
document.querySelectorAll('.hc-dot.active')[0].dataset.idx
```
Note the value, then simulate a swipe by directly exercising the dot-click path (same underlying `goTo`+`pauseThenResume` the swipe handler calls):
```javascript
document.querySelector('.hc-dot[data-idx="3"]').click();
document.querySelectorAll('.hc-dot.active')[0].dataset.idx
```
Expected: `"3"`. Then wait ~5 seconds without further interaction and confirm the active dot changes again on its own (autoplay resumed after the 1.5s idle delay).

- [ ] **Step 4: Commit**

```bash
git add index.html
git commit -m "Add mobile single-card carousel layout with touch swipe"
```

---

### Task 5: Right-size `.hero-visual` min-height for the new carousel (avoid excessive empty space)

The site already has generic `.hero-visual{min-height:...}` rules (`index.html:215–219`) sized for the *old* fan deck's vertical footprint, and that class is reused by other unrelated components (the FinOps/Assist mini-hero "dash" panels via `.finops-visual.hero-visual` / other combos). Don't touch the generic rule — add a more specific override scoped to `.hero-visual.hero-carousel` only, sized to the new carousel's actual content height at each breakpoint. This directly applies the project's `avoid-empty-spacing` skill/memory: measure real content, don't reuse an old flat value.

**Files:**
- Modify: `index.html` — add new rules directly after the existing `index.html:218-219` generic `.hero-visual` media queries.

- [ ] **Step 1: Measure real content height at tablet and mobile widths**

At 768px width (tablet), run:
```javascript
document.getElementById('heroCarousel').scrollHeight
```
Record the value (expect roughly 220–240px: ~188px for the 250×187.5 center card at 4:3 plus ~32px for the dots row with its 18px top margin).

At 390px width (mobile), run the same:
```javascript
document.getElementById('heroCarousel').scrollHeight
```
Record the value (expect roughly 160–180px: 230×~129 card at 16:9 plus the dots row).

- [ ] **Step 2: Add the scoped override, sized to what Step 1 measured (+ a small buffer)**

Add directly after `index.html:219` (`@media(max-width:400px){.hero-visual{min-height:700px}}`):

```css
  @media(max-width:900px){.hero-visual.hero-carousel{min-height:250px}}
  @media(max-width:460px){.hero-visual.hero-carousel{min-height:180px}}
```

(Adjust these two numbers to match whatever Step 1 actually measured plus ~10px buffer, if it differs meaningfully from the estimates above — don't just paste the estimate blindly.)

- [ ] **Step 3: Verify the override wins and there's no overflow or excess space**

At 768px:
```javascript
getComputedStyle(document.getElementById('heroCarousel')).minHeight
```
Expected: `"250px"` (or whatever value Step 2 used), not the generic `"660px"` from the old rule.

```javascript
const el = document.getElementById('heroCarousel');
el.getBoundingClientRect().height - el.scrollHeight
```
Expected: a small positive number (a few px of slack from the buffer), not close to 400+ (which would mean the old oversized value leaked through) and not negative (which would mean content is clipped).

Repeat both checks at 390px width against the mobile override.

- [ ] **Step 4: Visual check — no dead zone before the CTA button**

At both widths, confirm visually (screenshot or direct look) that the "Book a Demo" button sits reasonably close below the carousel, without a large empty gap — this was the exact failure mode fixed for the "Why DynaLens" tabs earlier in this project; the same anti-pattern must not reappear here.

- [ ] **Step 5: Commit**

```bash
git add index.html
git commit -m "Right-size hero carousel min-height per breakpoint, avoid dead space"
```

---

### Task 6: Accessibility pass + full regression check

**Files:**
- Verify only, unless Step 1 or Step 2 turn up a real gap (then modify `index.html` accordingly).

- [ ] **Step 1: Verify dot accessibility**

```javascript
Array.from(document.querySelectorAll('.hc-dot')).map(d => d.getAttribute('aria-label'))
```
Expected: `["Slide 1 of 5", "Slide 2 of 5", "Slide 3 of 5", "Slide 4 of 5", "Slide 5 of 5"]`.

```javascript
const r = document.querySelector('.hc-dot').getBoundingClientRect();
r.width >= 24 && r.height >= 24
```
Expected: `true` (24×24 touch target, even though the visible dot inside is smaller).

- [ ] **Step 2: Verify the stage is correctly marked decorative**

```javascript
document.getElementById('hcStage').getAttribute('aria-hidden')
```
Expected: `"true"`. This is intentional: every slide is currently placeholder text ("Screenshot coming soon") with no real information — the dots (properly labeled, and the real interactive control) are the accessible surface. When real screenshots replace the placeholders later, revisit whether `aria-hidden` should be removed in favor of real `alt` text on the images and a live-region announcement — that's a follow-up, not part of this plan.

- [ ] **Step 3: Verify reduced-motion disables autoplay but not manual controls**

Enable "prefers-reduced-motion: reduce" via browser devtools rendering emulation, reload the page, and run:
```javascript
// wait ~5s doing nothing, then:
document.querySelectorAll('.hc-dot.active')[0].dataset.idx
```
Note the value, wait another 5s, check again — expected: **unchanged** (autoplay never started).

```javascript
document.querySelector('.hc-dot[data-idx="1"]').click();
document.querySelectorAll('.hc-dot.active')[0].dataset.idx
```
Expected: `"1"` — manual dot-click still works under reduced motion.

- [ ] **Step 4: Full responsive regression pass**

Re-run the project's established iframe-based check (desktop 1440×900, tablet 768×1024, mobile 390×844 — same technique used throughout this project's session history) against the full page, and confirm:
- Nav bar, "Why DynaLens" tabs, and suite-apps cards all still look correct at all three widths (unrelated sections this feature shouldn't have touched).
- No horizontal scrollbar appears at any of the three widths (the new carousel doesn't overflow its column).
- The hero copy, carousel, and "Book a Demo" CTA all appear in the correct stacking order at each width (unchanged from before this feature: side-by-side on desktop; intro → visual → CTA stacked on tablet/mobile).

- [ ] **Step 5: Update the design spec's status**

Add a short line at the top of `docs/superpowers/specs/2026-07-29-hero-visual-carousel-design.md` (directly under the `Date:`/`Scope:` lines) noting implementation is complete and pointing at this plan file, e.g.:

```markdown
**Status:** Implemented — see `docs/superpowers/plans/2026-07-29-hero-visual-carousel.md`.
```

- [ ] **Step 6: Commit**

```bash
git add index.html docs/superpowers/specs/2026-07-29-hero-visual-carousel-design.md
git commit -m "Verify hero carousel accessibility and full responsive regression"
```
