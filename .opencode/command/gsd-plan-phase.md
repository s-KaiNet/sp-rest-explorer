---
description: Create detailed execution plan for a phase (PLAN.md) with verification loop
argument-hint: "[phase] [--research] [--skip-research] [--gaps] [--skip-verify]"
agent: gsd-planner
tools:
  read: true
  write: true
  bash: true
  glob: true
  grep: true
  task: true
  webfetch: true
  mcp__context7__*: true
---
<objective>
Create executable phase prompts (PLAN.md files) for a roadmap phase with integrated research and verification.

**Default flow:** Research (if needed) → Plan → Verify → Done

**Orchestrator role:** Parse arguments, validate phase, research domain (unless skipped), spawn gsd-planner, verify with gsd-plan-checker, iterate until pass or max iterations, present results.
</objective>

<execution_context>
@./.opencode/get-shit-done/workflows/plan-phase.md
@./.opencode/get-shit-done/references/ui-brand.md
</execution_context>

<context>
Phase number: $ARGUMENTS (optional — auto-detects next unplanned phase if omitted)

**Flags:**
- `--research` — Force re-research even if RESEARCH.md exists
- `--skip-research` — Skip research, go straight to planning
- `--gaps` — Gap closure mode (reads VERIFICATION.md, skips research)
- `--skip-verify` — Skip verification loop

Normalize phase input in step 2 before any directory lookups.
</context>

<process>
Execute the plan-phase workflow from @./.opencode/get-shit-done/workflows/plan-phase.md end-to-end.
Preserve all workflow gates (validation, research, planning, verification loop, routing).
</process>
