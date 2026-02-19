---
phase: quick-1
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - app/src/components/loading/ContentSkeleton.tsx
  - app/src/components/loading/index.ts
  - app/src/App.tsx
autonomous: true
must_haves:
  truths:
    - "Initial app loading shows a simple centered spinner instead of blinking skeleton blocks"
    - "Loading indicator matches the app's existing visual language (sp-spinner style via Tailwind)"
    - "No animate-pulse skeleton elements remain in the initial loading path"
  artifacts:
    - path: "app/src/components/loading/ContentSkeleton.tsx"
      provides: "Simple centered loading spinner component"
    - path: "app/src/App.tsx"
      provides: "Renders loading component for non-ready/non-error status"
  key_links:
    - from: "app/src/App.tsx"
      to: "app/src/components/loading/ContentSkeleton.tsx"
      via: "import and render in status ternary"
      pattern: "ContentSkeleton|LoadingState"
---

<objective>
Replace the blinking skeleton loading screen (ContentSkeleton) with a simple centered spinner that matches the app's existing loading pattern.

Purpose: The current ContentSkeleton uses ~20 animate-pulse elements that create unnecessary visual noise/blinking during the brief metadata load. The app already uses a simple CSS spinner in index.html for pre-React loading and plain "Loading..." text in TypesPage — the skeleton is inconsistent and distracting.

Output: A clean, centered loading spinner replacing the skeleton, matching the existing sp-spinner visual style.
</objective>

<execution_context>
@./.Claude/get-shit-done/workflows/execute-plan.md
@./.Claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@app/src/App.tsx
@app/src/components/loading/ContentSkeleton.tsx
@app/src/components/loading/ErrorState.tsx
@app/src/components/loading/index.ts
@app/index.html
</context>

<tasks>

<task type="auto">
  <name>Task 1: Replace ContentSkeleton with simple spinner loading state</name>
  <files>
    app/src/components/loading/ContentSkeleton.tsx
    app/src/components/loading/index.ts
    app/src/App.tsx
  </files>
  <action>
    Replace the ContentSkeleton component with a simple centered loading spinner. Two options (pick the simpler one):

    **Approach:** Rewrite ContentSkeleton.tsx (or rename to LoadingState.tsx) to render a centered spinner using Tailwind — a `div` with `size-8 border-3 border-muted border-t-muted-foreground rounded-full animate-spin`. This mirrors the `.sp-spinner` CSS in index.html but uses Tailwind classes and theme tokens instead of hardcoded oklch values. Layout: `flex flex-1 items-center justify-center` (same pattern as ErrorState.tsx and TypesPage loading state).

    Specifically:
    1. **Rewrite `ContentSkeleton.tsx`** — rename export to `LoadingState`. Replace the entire skeleton DOM with:
       - Outer: `<div className="flex flex-1 items-center justify-center">`
       - Inner: `<div className="size-8 rounded-full border-3 border-muted border-t-muted-foreground animate-spin" />`
       - That's it. No text, no skeleton blocks, no animate-pulse.

    2. **Update `index.ts`** — change export from `ContentSkeleton` to `LoadingState`. Keep `ErrorState` export.

    3. **Update `App.tsx`** — change import from `ContentSkeleton` to `LoadingState`. Update the JSX usage on the status ternary (line 74) from `<ContentSkeleton />` to `<LoadingState />`.

    The spinner should feel like a continuation of the index.html sp-spinner (same size, same animation) but using theme-aware Tailwind tokens so it works in both light and dark mode automatically.
  </action>
  <verify>
    - `npx tsc --noEmit` passes (no type errors)
    - `npm run build` succeeds
    - Visually: app shows a single centered spinner during metadata load, no blinking skeleton bars
  </verify>
  <done>
    Initial loading screen shows a single centered spinning circle instead of the multi-element blinking skeleton. No animate-pulse elements in the loading path. The spinner uses theme tokens and works in both light and dark mode.
  </done>
</task>

</tasks>

<verification>
- Build succeeds: `npm run build`
- No TypeScript errors: `npx tsc --noEmit`
- No references to old `ContentSkeleton` name remain (grep confirms)
- Visual check: loading state is a clean centered spinner, not a blinking skeleton
</verification>

<success_criteria>
- The initial app loading shows a simple centered spinner (not skeleton blocks)
- animate-pulse skeleton blocks are removed from the loading path
- Spinner visually matches the index.html sp-spinner style
- Works in both light and dark mode
- Build passes clean
</success_criteria>

<output>
After completion, create `.planning/quick/1-replace-initial-screen-loading-skeleton-/1-SUMMARY.md`
</output>
