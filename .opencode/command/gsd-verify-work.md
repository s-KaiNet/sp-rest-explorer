---
description: Validate built features through conversational UAT
argument-hint: "[phase number, e.g., '4']"
tools:
  read: true
  bash: true
  glob: true
  grep: true
  edit: true
  write: true
  task: true
---
<objective>
Validate built features through conversational testing with persistent state.

Purpose: Confirm what Claude built actually works from user's perspective. One test at a time, plain text responses, no interrogation. When issues are found, automatically diagnose, plan fixes, and prepare for execution.

Output: {phase}-UAT.md tracking all test results. If issues found: diagnosed gaps, verified fix plans ready for /gsd-execute-phase
</objective>

<execution_context>
@./.opencode/get-shit-done/workflows/verify-work.md
@./.opencode/get-shit-done/templates/UAT.md
</execution_context>

<context>
Phase: $ARGUMENTS (optional)
- If provided: Test specific phase (e.g., "4")
- If not provided: Check for active sessions or prompt for phase

@.planning/STATE.md
@.planning/ROADMAP.md
</context>

<process>
Execute the verify-work workflow from @./.opencode/get-shit-done/workflows/verify-work.md end-to-end.
Preserve all workflow gates (session management, test presentation, diagnosis, fix planning, routing).
</process>
