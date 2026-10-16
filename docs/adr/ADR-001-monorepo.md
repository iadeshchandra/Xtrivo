# ADR-001 — Monorepo with platform-specific apps and shared packages

**Status:** accepted (Stage 0)
**Date:** 2026-10-16

## Context

XTRIVO ships four products (Android, desktop, Chrome extension, web) that must share
branding, download semantics, and error behavior, while each remaining independently
buildable, testable, and releasable.

## Decision

One private GitHub repository, npm workspaces:

- `apps/*` — platform applications, each with its own build/packaging.
- `packages/*` — shared TypeScript: `core`, `download-engine`, `design-system`.

## Alternatives considered

- **Polyrepo (4 repos):** rejected — shared contracts would drift; a solo/AI team
  cannot afford cross-repo version choreography in v1.
- **Single cross-platform codebase (e.g., everything in Electron/Capacitor):**
  rejected — the directive requires a genuinely native Android app, not a wrapper.

## Consequences

- One CI pipeline with path-filtered jobs; one version tag releases everything.
- Android consumes shared logic via contract parity (ADR-003), not code sharing.
