# ADR-002 — Desktop framework: Electron

**Status:** accepted (Stage 0)
**Date:** 2026-10-16

## Context

The desktop app needs a real download manager (queue, pause/resume, integrity),
native installers for Windows/macOS/Linux, and auto-update — built by a small
AI-assisted team with a $0 tooling budget.

## Decision

**Electron + TypeScript**, reusing `@xtrivo/download-engine` directly in the main
process.

## Alternatives considered

- **Tauri (Rust):** smaller binaries (~10 MB vs ~80–150 MB) and a strong capability
  security model. Rejected for v1 because the download engine — the most
  security-critical code in the product — would need a second, independent Rust
  implementation. Two engines means two test suites, two bug surfaces, and parity
  drift. Revisit if binary size becomes a blocker.
- **Flutter desktop:** rejected — no code sharing with the TS engine either, and a
  weaker desktop packaging story.

## Consequences

- One engine, one test suite, shared with the extension's background logic.
- `electron-updater` for safe auto-updates; `electron-builder` produces
  NSIS (Windows), DMG (macOS), AppImage/deb (Linux) in CI.
- Binary size accepted as the trade-off; documented, not hidden.
