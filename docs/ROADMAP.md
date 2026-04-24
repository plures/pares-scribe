# ROADMAP — pares-scribe

## Role in OASIS
pares-scribe provides the **local-first code and document editing surface** inside the Pares platform. It is where OASIS operators and agents author, inspect, and transform artifacts (policies, workflows, proofs, datasets) without leaving the trusted local environment. It turns Pares into a practical workspace for privacy-preserving commerce operations.

## Current State
- Plugin scaffold and command registry in place
- Text manipulation commands implemented
- File system abstraction and file tree builder present
- Monaco editor + core UI components still incomplete

## Phase 1 — Ship the Core Editor Surface
**Goal:** A reliable, local-first editor usable for OASIS authoring tasks.
- Complete Monaco Editor integration (EditorPane)
- Editor tabs with dirty indicators + lifecycle
- File explorer sidebar panel + file ops UX
- Command palette UI (wired to registry)
- Find/replace, go to line/symbol, formatting on save

## Phase 2 — OASIS Workflow Integration
**Goal:** Editing that understands OASIS workflows, policies, and agent outputs.
- Structured file types for OASIS artifacts (policies, manifests, proofs)
- Agent-assisted edits (apply patches, summarize diffs)
- Workspace-aware linting/validation hooks
- Local provenance metadata for edits (who/what/when)

## Phase 3 — Collaboration + Provenance
**Goal:** OASIS-grade auditability and controlled collaboration.
- Reviewable change sets with diff history
- PluresDB-backed project snapshots
- Optional ZK-backed proof of authorship or integrity
- Secure sharing workflows (export with policy constraints)

## Non-Goals
- Full IDE (debugger, build pipelines, project templates)
- Heavy server-side editing; this is local-first by design
- TUI support (Monaco requires DOM)
