---
targets: ["claudecode", "opencode"]
description: Review current changes with the code-reviewer and architecture-guardian subagents
claudecode:
  allowed-tools: Bash(git diff:*), Bash(git status:*)
---

# Review

## Context

Changed files (tracked and untracked):

!`git status --short`

Diff summary:

!`git diff HEAD --stat`

## Instructions

Launch the two subagents in parallel (two subagent calls in a single message). Tell each one to read the changes itself with `git diff HEAD` and to open the untracked files listed above, instead of passing it the full diff.

- `code-reviewer`: bugs, security, performance, quality, tests.
- `architecture-guardian`: boundaries, layering, coupling, dependencies.

Team standards: `docs/coding-standards.md` and `docs/architecture.md` (adapt the paths to the project).

Both subagents use the same severity scale (Critical / High / Medium / Low). If one of them reports `blocker` / `major` / `minor`, map them to Critical / High / Medium.

Merge both reports into the output format below, dropping duplicates. Keep the "Not verified" items from both reports. If subagents cannot be spawned, review the code yourself and state that the architecture check was not done.

## Output Format

Produce review comments organized by:

1. **Critical Issues**: Bugs, security vulnerabilities, breaking changes (must fix)
2. **Architectural Concerns**: Pattern violations, coupling issues (should fix)
3. **Code Quality**: Readability, maintainability, test coverage (nice to have)
4. **Suggestions**: Performance optimizations, refactoring opportunities (optional)
5. **Not verified**: What could not be checked (tests not run, cycles, missing docs)

Each comment includes:

- **File and line reference**
- **Severity**: Critical / High / Medium / Low
- **Category**: Bug / Security / Architecture / Style / Performance / Test
- **Description**: What the issue is and why it matters
- **Recommendation**: Specific action to address the issue