# Project Instructions

## Windows Shell Safety Rules

### Rule 1

**CRITICAL**: Never use `findstr` or `find` commands on Windows.

These commands are dangerous because malformed quoting or escaping can cause them to search from the root of the C: drive, consuming system resources and producing incorrect results. For example, this command is problematic:

```
findstr /c:"\"isRoot\": true" "E:\path\to\file.json" | find /c /v ""
```

### Alternatives

Instead of `findstr` / `find`, use one of these approaches:

1. **Use the built-in Grep and Glob tools** — prefer these for all file searching and pattern matching.

2. **Use Node.js one-liners** when you need to search file contents or count matches:
   ```
   node -e "const fs=require('fs'); const d=fs.readFileSync('file.json','utf8'); console.log((d.match(/pattern/g)||[]).length)"
   ```

3. **Use PowerShell cmdlets** like `Select-String` which handle escaping reliably:
   ```
   Select-String -Path "file.json" -Pattern 'pattern' | Measure-Object | Select-Object -ExpandProperty Count
   ```

4. **Never pipe Windows `find` or `findstr`** — these have unreliable quoting semantics on Windows and fail silently or dangerously when special characters are involved.

### Rule 2

**CRITICAL**: Never use 2>nul in shell commands, always use 2>/dev/null instead

# Project Knowledge Base

This project uses [memsearch](https://github.com/zilliztech/memsearch) as its
knowledge base.

## Search Before Acting

Before starting ANY task — implementation, bug fix, refactoring, planning, or answering questions about the project — you MUST think and reason whether you should search the knowledge base to find the relevant context. If it makes sense - always search first.

You don't need to search for trivial changes like typo fixes, formatting, or simple one-line edits.

### What to search for

**Before writing new code:**

- Search for the feature or module name to find existing patterns
- Search for the technology or library you plan to use — there may be project-specific preferences or past decisions about it
- Search for "convention" or "pattern" related to the area you're working in
- Search for similar features that were already implemented to follow
  established patterns

**Before modifying existing code:**

- Search for the module or component name to understand why it was built that way
- Search for related design decisions or constraints that may not be obvious from the code alone
- Search for known issues or limitations mentioned in planning docs
- Search for the original requirement or milestone that introduced the code

**Before planning or estimating work:**

- Search for prior discussions or rejected approaches — avoid repeating work that was already considered and dismissed
- Search for related milestones to understand how the task fits into the bigger picture
- Search for dependencies or blockers mentioned in research notes
- Search for scope definitions or acceptance criteria

**Before answering questions about the project:**

- Always search before relying on your own understanding of the codebase
- Search for architectural decisions, trade-offs, and rationale
- Search for terminology specific to this project — it may have domain-specific meaning

**Search strategy tips:**

- Run 2-3 searches with different phrasings — semantic search is good but not perfect, and different wording may surface different results
- Start broad ("authentication"), then narrow ("OAuth token refresh flow")
  if the broad search returns too many results
- If a search returns a relevant snippet, read the full source file for
  complete context
- Search for both the problem and the solution — e.g., search for
  "rate limiting" but also "API performance" or "request throttling"
- Use `--top-k 10` when exploring a new area to get a wider view

### How to search

Use the `memsearch` CLI via bash:

```bash
# Semantic search (primary method)
memsearch search "your query"

# More results when needed
memsearch search "your query" --top-k 10

# JSON output for structured processing
memsearch search "your query" --json-output
```

### Example

```
Task: "Add rate limiting to the API endpoints"

1. memsearch search "rate limiting"
2. memsearch search "API middleware patterns"
3. memsearch search "request throttling performance"
4. Read the full source file if a search result points to a relevant document
5. Now start planning/implementing with context
```


# Project Rules & AI Agent Guidelines

## MANDATORY: Pre-Coding Protocol

**CRITICAL: Before writing ANY code, you MUST complete the following steps in order.**

### Step 1 — Analyze the Task

Before touching any file, stop and think:

1. What is being asked? (new feature, refactor, bug fix, styling, API work, etc.)
2. Which technologies and layers does this task touch? (React components, TypeScript types, API integration, styling with Tailwind/shadcn, design patterns, etc.)
3. Is this a single-file change or does it span multiple files/layers?

### Step 2 — Select and Load Skills

Review the available skills listed in your `<available_skills>` block. For each skill, evaluate:

- **Does this skill's description match any aspect of the current task?**
- **Could this skill prevent a mistake I might otherwise make?**

Load **every skill that is relevant** — err on the side of loading more, not fewer. A task often touches multiple concerns. For example:

- Building a new UI component → load skills for React patterns, composition, design system, and TypeScript types
- Styling work → load Tailwind and/or shadcn and web design skills
- Refactoring → load composition patterns and the skill closest to the code being changed
- API integration → load API design skill and any relevant React data-fetching patterns
- Brainstorming or planning → load the brainstorming skill

**Do NOT skip this step.** Do NOT rely on your training knowledge alone when a relevant skill exists. Skills contain project-specific conventions that override general best practices.

### Step 3 — Review Existing Code

Before creating new files:

1. Search the codebase for similar patterns (components, hooks, utilities)
2. Match the naming conventions, file structure, and export style already in use
3. If the project has no precedent, follow the loaded skills strictly

### Step 4 — Plan Before Implementing

For any task involving more than a single-file change:

1. State which skills you loaded and why
2. List which files you will create or modify
3. Describe the approach in 2-3 sentences
4. Confirm the approach aligns with loaded skills and existing codebase patterns
5. Only then begin writing code
