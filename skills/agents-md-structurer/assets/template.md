# [Project Name] - Agent Execution Context

## 1. Project Overview & Scope
- **Tech Stack**: [ex: Angular 18, NestJS 10, PostgreSQL, Docker]
- **Core Domain**: [1-2 sentence description of the project's role]

## 2. Command Palette (Non-negotiable)
- **Install**: `[package manager] install`
- **Build**: `[command]`
- **Dev Server**: `[command]`
- **Test Single File**: `[command] <file_path>`
- **Lint/Format**: `[command]`

## 3. Architecture & Code Boundaries
- **Project Pattern**: [ex: Hexagonal / Modular Monolith / Clean Architecture]
- **Key Directory Rules**:
  - `src/core/`: [role]
  - `src/features/`: [role]
- **Dependency Invariants**: [ex: Features must never import directly from other features]

## 4. Coding Standards & Conventions
- **Naming**: [ex: camelCase for vars, PascalCase for classes, kebab-case for files]
- **Error Handling**: [ex: Always use Result pattern / Custom Exceptions]
- **State Management**: [ex: Signals / NgRx / React Query]

## 5. Agent Operational Constraints (Guardrails)
- NEVER run destructive commands without validation (`rm -rf`, DB migrations down).
- NEVER introduce external libraries without explicit user request.
- Keep responses concise; implement logic without unnecessary refactoring of untouched files.

## 6. Extended Documentation Index (Progressive Disclosure)
- Architecture details: `./docs/architecture.md`
- DB Schema & Migrations: `./docs/db-schema.md`
- API Contracts: `./docs/api-spec.md`
