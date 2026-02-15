---
status: diagnosed
trigger: "Architecture diagram on How It Works page overflows 720px content area, clipping labels on left and right"
created: 2026-02-15T00:00:00Z
updated: 2026-02-15T00:00:00Z
---

## Current Focus

hypothesis: The diagram's flex row of 4 nodes (min-w-[120px] each) + 3 arrows (min-w-[80px] each) + padding exceeds the 720px container
test: Calculate total minimum width of diagram contents vs available width
expecting: Total min-width > available width inside the card
next_action: Calculate exact widths

## Symptoms

expected: Architecture diagram fits within the 720px max-width content container without clipping
actual: Diagram overflows on both left and right sides; "Targeted release" label clipped on left, "Explorer App" text clipped on right
errors: none (visual layout issue)
reproduction: Navigate to /how-it-works page, observe the architecture diagram
started: unknown

## Eliminated

## Evidence

- timestamp: 2026-02-15T00:01:00Z
  checked: Width calculation of diagram contents vs available space
  found: |
    - Page container: max-w-[720px] with px-6 (24px each side) → 672px available
    - Card wrapper: p-8 (32px each side) → 608px available for diagram
    - 4 nodes with min-w-[120px] = 480px
    - 3 arrows with min-w-[80px] = 240px
    - Total minimum diagram width: 720px
    - Overflow: 720px - 608px = 112px
  implication: Diagram intrinsic minimum width exceeds available space by 112px

- timestamp: 2026-02-15T00:02:00Z
  checked: Whether overflow is clipped or scrollable
  found: |
    - Line 53: outer div has overflow-y-auto which implicitly sets overflow-x to auto
    - Line 146: flex container uses justify-center, centering the overflowing content
    - When content overflows a centered flex container, overflow is distributed equally on both sides
    - rounded-xl on card (line 145) creates an overflow clipping context due to border-radius
  implication: Content is clipped symmetrically on both sides because justify-center distributes overflow equally, and the parent chain clips it

## Resolution

root_cause: The architecture diagram's 4 nodes (min-w-[120px] each = 480px) + 3 arrows (min-w-[80px] each = 240px) have a combined minimum width of 720px, which exceeds the 608px available inside the card (720px container - 48px page padding - 64px card padding), causing 112px of overflow that is symmetrically clipped by justify-center on the flex container.
fix: Remove or reduce min-w constraints on nodes and arrows so the diagram can shrink to fit; alternatively scale down the diagram or allow the card to overflow visibly with overflow-x-auto.
verification:
files_changed: []
