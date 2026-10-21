---
name: agents-md-structurer
description: Restructure a freshly generated CLAUDE.md or AGENTS.md into a lean, well-organised agent context file (overview, command palette, architecture boundaries, conventions, guardrails, docs index). Use right after the user runs /init (Claude Code, opencode, Codex or any other harness) or whenever a CLAUDE.md / AGENTS.md was just created, looks bloated or unstructured, or the user asks to clean up, reorganise, restructure, lint or improve their CLAUDE.md / AGENTS.md / agent instructions file. Trigger even if the user does not name the file explicitly, e.g. "I ran /init, clean it up", "structure my agent context".
---

# AGENTS.md / CLAUDE.md structurer

`/init` produces a file that is usually a prose dump: directory listings, obvious facts, generic advice. Agents load this file on every session, so each useless line costs tokens and dilutes the lines that matter. Goal: rewrite it into the fixed structure in `assets/template.md`, keeping only what the agent cannot infer by reading the code.

## Workflow

1. **Locate the file.** Check the repo root for `AGENTS.md` and `CLAUDE.md`. Read it fully.
   - Only one exists: restructure it in place.
   - Both exist: `AGENTS.md` is the canonical content; keep `CLAUDE.md` as a one-line pointer (`@AGENTS.md`) unless the user says otherwise.
   - Neither exists: tell the user, offer to generate one from the repo.
2. **Back up.** Copy the original to `<file>.bak` before touching it. The rewrite is lossy by design, so the user must be able to recover anything.
3. **Verify facts against the repo.** Do not trust the generated text and do not invent. Read `package.json` / `pyproject.toml` / `Makefile` / `pom.xml` / `go.mod`, CI config, lockfiles, top-level directories. Confirm each command actually exists in a script or Makefile target. A wrong command in this file is worse than a missing one.
4. **Map content to the template** (`assets/template.md`, 6 sections). Section purposes:
   - **1 Overview**: stack with versions + domain in 1-2 sentences.
   - **2 Command palette**: exact runnable commands, including how to run a single test file. Package manager must match the lockfile.
   - **3 Architecture**: pattern, directory roles, dependency rules that code alone would not reveal.
   - **4 Conventions**: only conventions not enforced by linter/formatter config.
   - **5 Guardrails**: keep the three default rules, add project-specific ones found in the original (e.g. "never edit generated files in `src/gen/`").
   - **6 Docs index**: pointers to existing docs only (see below).
5. **Prune.** Drop: file-by-file listings, README duplication, standard language/framework advice ("write clean code", "use TypeScript types"), style rules a formatter enforces, anything the agent finds in one `ls` or one read. Heuristic per line: "would the agent make a mistake without this?" If no, delete.
6. **Move bulk out (progressive disclosure).** Long architecture notes, DB schema, API contracts go into `docs/*.md` and are linked from section 6. Create the doc file with the moved content; link only files that exist. Skip section 6 entries with nothing behind them.
7. **Unknowns.** If a field cannot be verified from the repo, write `TODO: confirm with team` rather than guessing. Drop template lines that clearly do not apply (e.g. no DB, no state management) instead of leaving placeholders.
8. **Report.** Summarise to the user: what was kept, what was moved to `docs/`, what was deleted, which TODOs remain. Mention the `.bak` path.

## Output rules

- Target under ~150 lines; hard cap 200. Longer means content belongs in `docs/`.
- Keep the template's section numbering and headings so every project reads the same.
- Imperative, terse wording. Commands in backticks. Language: English.
- Preserve any user-written content that is clearly intentional (hand-written rules, team notes) even if it does not fit a section: put it under the closest section or a trailing `## Notes`.
- Never delete the `.bak`.

## Why this structure

Commands first because agents fail most often by running the wrong build/test command. Boundaries and invariants next because they are the knowledge that cannot be read from a single file. Guardrails explicit because they are the cheapest protection against destructive actions. Docs index last so the file stays small while deep context stays one read away.
