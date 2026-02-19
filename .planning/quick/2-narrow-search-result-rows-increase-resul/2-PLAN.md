---
phase: quick
plan: 2
type: execute
wave: 1
depends_on: []
files_modified:
  - app/src/components/search/CommandPalette.tsx
  - app/src/components/ui/command.tsx
autonomous: true
must_haves:
  truths:
    - "Search result rows are visually narrower (less vertical padding)"
    - "Each group shows 7 results before 'Show more' instead of 5"
    - "The search dialog is taller, showing more content"
  artifacts:
    - path: "app/src/components/search/CommandPalette.tsx"
      provides: "Updated INITIAL_SHOW constant"
      contains: "INITIAL_SHOW = 7"
    - path: "app/src/components/ui/command.tsx"
      provides: "Taller dialog, narrower rows"
  key_links: []
---

<objective>
Make search result rows narrower, increase visible results per group from 5 to 7, and make the search dialog taller.

Purpose: More search results visible at once, improving scan-ability and reducing need to scroll or expand groups.
Output: Updated CommandPalette and command UI components.
</objective>

<execution_context>
@./.Claude/get-shit-done/workflows/execute-plan.md
@./.Claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@app/src/components/search/CommandPalette.tsx
@app/src/components/ui/command.tsx
</context>

<tasks>

<task type="auto">
  <name>Task 1: Narrow rows, increase results per group, make dialog taller</name>
  <files>app/src/components/search/CommandPalette.tsx, app/src/components/ui/command.tsx</files>
  <action>
Three coordinated changes:

**1. Increase INITIAL_SHOW (CommandPalette.tsx line 30):**
- Change `const INITIAL_SHOW = 5` → `const INITIAL_SHOW = 7`

**2. Narrow search result rows (command.tsx line 59):**
- In the CommandDialog's `<Command>` className, the override `[&_[cmdk-item]]:py-3` forces large vertical padding on every item. Change it to `[&_[cmdk-item]]:py-1.5` for tighter rows.
- This is the ONLY place row padding needs changing — the CommandItem base class has `py-1.5` and the CommandPalette render functions use `py-1`, but the `[&_[cmdk-item]]:py-3` selector in CommandDialog wins specificity. Reducing it to `py-1.5` will let the `py-1` from the render callbacks take effect.

**3. Make dialog taller (command.tsx line 56):**
- In DialogContent className, change `h-[66vh]` → `h-[80vh]` to make the dialog taller and show more results.
  </action>
  <verify>
Run `npx tsc --noEmit` from the app directory to verify no type errors.
Open the app in the browser, press Ctrl+K to open search, type a query with many results (e.g., "list"), and visually confirm:
- Rows are visibly narrower/tighter than before
- 7 results show per group before "Show N more…" link appears
- Dialog takes up more vertical space (~80vh)
  </verify>
  <done>Search dialog is 80vh tall, shows 7 results per group initially, and rows have reduced vertical padding (py-1.5 override instead of py-3).</done>
</task>

</tasks>

<verification>
- `INITIAL_SHOW = 7` in CommandPalette.tsx
- `h-[80vh]` in command.tsx DialogContent
- `[&_[cmdk-item]]:py-1.5` in command.tsx Command className (was py-3)
- No TypeScript errors
</verification>

<success_criteria>
Search dialog is taller, each group shows 7 results before "Show more", and rows are visibly narrower — all three changes ship together.
</success_criteria>

<output>
After completion, create `.planning/quick/2-narrow-search-result-rows-increase-resul/2-SUMMARY.md`
</output>
