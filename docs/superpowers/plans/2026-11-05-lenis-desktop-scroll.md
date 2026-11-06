# Desktop Lenis Scroll Trial Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a local-only desktop Lenis scrolling trial without changing touch scrolling or committing the experiment.

**Architecture:** A singleton module owns Lenis creation, media-query fallback, and programmatic scrolling. Layout initializes it; BackToTop and both TOC components consume the same helpers so native scrolling and Lenis never compete.

**Tech Stack:** React 18, TypeScript, Vite 5, Lenis 1.3.x, Vitest 1.6.

## Global Constraints

- Enable only for `(pointer: fine)` and no `prefers-reduced-motion`.
- Use `lerp: 0.12`, `smoothWheel: true`, `syncTouch: false`, `anchors: true`, `autoRaf: true`, and `stopInertiaOnNavigate: true`.
- Do not add GSAP or enable `syncTouch`.
- Preserve ScrollRestoration, ScrollProgress, BackToTop, TOC jump/highlight, and the full-screen menu.
- Do not commit or push any changes.

---

### Task 1: Dependency and activation policy

**Files:**
- Modify: `package.json`, `package-lock.json`
- Create: `src/lib/smoothScroll.ts`
- Test: `tests/smoothScroll.test.ts`

**Interfaces:**
- Produces: `shouldEnableLenis(finePointer: boolean, reducedMotion: boolean): boolean`
- Produces: `initSmoothScroll(): () => void`

- [ ] **Step 1: Write the failing policy test**

```ts
import { describe, expect, it } from 'vitest'
import { shouldEnableLenis } from '@/lib/smoothScroll'

describe('shouldEnableLenis', () => {
  it('enables only fine-pointer devices without reduced motion', () => {
    expect(shouldEnableLenis(true, false)).toBe(true)
    expect(shouldEnableLenis(false, false)).toBe(false)
    expect(shouldEnableLenis(true, true)).toBe(false)
    expect(shouldEnableLenis(false, true)).toBe(false)
  })
})
```

- [ ] **Step 2: Run the test and verify it fails**

Run: `npm test -- tests/smoothScroll.test.ts`
Expected: FAIL because `src/lib/smoothScroll.ts` does not exist.

- [ ] **Step 3: Install Lenis and implement activation**

Run: `npm install lenis@^1.3.27`

Implement a module-level `lenis: Lenis | null`. `initSmoothScroll` watches fine-pointer and reduced-motion media queries, destroys an old instance before each policy change, and creates Lenis only when `shouldEnableLenis` returns true. Its returned cleanup removes both listeners and destroys the instance. Import `lenis/dist/lenis.css` once in this module.

- [ ] **Step 4: Run the test and verify it passes**

Run: `npm test -- tests/smoothScroll.test.ts`
Expected: 1 test passed.

### Task 2: Unified programmatic scrolling and integrations

**Files:**
- Modify: `src/lib/smoothScroll.ts`
- Modify: `src/components/layout/Layout.tsx`
- Modify: `src/hooks/useScrollAnimation.ts`
- Modify: `src/components/post/TableOfContents.tsx`
- Modify: `src/components/post/MobileToc.tsx`
- Modify: `src/components/layout/Header.tsx`

**Interfaces:**
- Consumes: `initSmoothScroll(): () => void`
- Produces: `scrollToTop(reducedMotion: boolean): void`
- Produces: `scrollToElement(target: HTMLElement, reducedMotion: boolean): void`

- [ ] **Step 1: Add programmatic scrolling helpers**

When Lenis is active, use `lenis.scrollTo(0)` for top and `lenis.scrollTo(target)` for an element. Otherwise preserve the current native `window.scrollTo` / `target.scrollIntoView` behavior with reduced-motion fallback.

- [ ] **Step 2: Initialize and clean up in Layout**

Call `initSmoothScroll()` in a Layout effect and return its cleanup. Keep `<ScrollRestoration />` unchanged.

- [ ] **Step 3: Route BackToTop and TOC jumps through helpers**

Replace direct programmatic scrolling in `useScrollAnimation`, `TableOfContents`, and `MobileToc`. Keep focus transfer, URL hash updates, and TOC highlight locking unchanged.

- [ ] **Step 4: Keep menu wheel events native**

Add `data-lenis-prevent` to the full-screen navigation dialog in `Header.tsx`; retain its existing body overflow lock and focus trap.

- [ ] **Step 5: Run automated checks**

Run: `npm test && npm run build`
Expected: all unit tests pass; TypeScript and Vite build complete without errors.

### Task 3: Local browser regression

**Files:**
- No intentional file changes.

- [ ] **Step 1: Start a bounded local development server**

Run `npm run dev -- --host 127.0.0.1 --port 7100` only for browser validation; stop it before final delivery.

- [ ] **Step 2: Verify desktop behavior**

Check wheel damping, progress bar movement, BackToTop, route navigation, browser back/forward restoration, TOC click and final highlight, and no duplicate RAF-driven jump.

- [ ] **Step 3: Verify fallback behavior**

Emulate coarse pointer/touch and reduced motion. Confirm native scrolling remains active and the mobile full-screen menu still locks background scrolling.

- [ ] **Step 4: Report local trial**

Provide the preview root and logical preview URL, summarize verification and any unverified physical-device behavior, and leave all changes uncommitted for user review.
