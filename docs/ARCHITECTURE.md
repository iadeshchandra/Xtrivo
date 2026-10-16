# XTRIVO Architecture

## Overview

XTRIVO is a **monorepo** containing four independently buildable products that share
brand, design tokens, and core download logic. Platforms are not forced into one
codebase where that would compromise functionality: Android is genuinely native
(Kotlin); the desktop app, extension, and web share TypeScript.

## System map

```
┌─────────────┐   ┌──────────────┐   ┌────────────────┐   ┌───────────┐
│ apps/android │   │ apps/desktop │   │ apps/extension │   │ apps/web  │
│ Kotlin       │   │ Electron+TS  │   │ MV3 + TS       │   │ Astro     │
└──────┬───────┘   └──────┬───────┘   └───────┬────────┘   └───────────┘
       │                  │                   │
       │  contract parity │  direct reuse     │  message protocol
       ▼                  ▼                   ▼  (documented, v1)
┌──────────────────────────────────────────────────────┐
│ packages/core: URL validation, task state machine,   │
│   error taxonomy, filename sanitization (TS, tested) │
├──────────────────────────────────────────────────────┤
│ packages/download-engine: Node HTTP(S) downloader —  │
│   redirects, Range resume, integrity, retries (TS)   │
├──────────────────────────────────────────────────────┤
│ packages/design-system: tokens + logo assets         │
└──────────────────────────────────────────────────────┘
```

## Key decisions

- **ADR-001** — Monorepo with platform-specific apps + shared TS packages.
- **ADR-002** — Desktop: Electron over Tauri (single shared download engine).
- **ADR-003** — Android: Kotlin port of `@xtrivo/core` contracts (not KMP, not shared runtime).

## Data & privacy

- Local-first: downloads, history, bookmarks, file listings stay on-device by default.
- No backend in v1 (`services/api/` does not exist). Accounts/sync only as a
  separately approved, optional feature with informed consent and deletion support.
- HTTPS for all network traffic. No full URLs with secrets in logs or analytics.

## Download engine contract (Stage 3)

The engine (TS on desktop/Node; Kotlin port on Android) implements one task state
machine defined in `@xtrivo/core`:

`queued → active → paused | failed | complete`, plus `cancelled`.

Safety rules (tested, not just documented):

- HTTP/HTTPS only; scheme allow-list enforced before any socket opens.
- Redirects: max 5 hops, same-policy check, never forward `Authorization` across origins.
- **Segmented multi-connection downloads (P0):** dynamic segmentation with
  per-segment retry — IDM-class speed, pure engineering, no piracy involved.
- Resume via `Range` only when the server proves support (`Accept-Ranges` + `206`
  with matching validators); a server that ignores Range restarts the file safely —
  never appends to a mismatched partial.
- Writes go to temp files; the final file appears only after integrity verification.
- Filenames sanitized (no path traversal, no control chars, no reserved names);
  duplicates get numeric suffixes, never silent overwrites.

## Extension ↔ desktop handoff

Optional, versioned JSON message protocol over native messaging (`docs/api-contracts/`,
Stage 5/6). The host authenticates the caller; messages are validated against a
schema; failures are reported, never silent.

## Versioning & compatibility

- SemVer everywhere; extension↔desktop protocol versioned (`xtrivo/1`).
- Release tags `vX.Y.Z` build all artifacts from one commit.

## Environments

`development` → `staging` (Firebase preview channel / unsigned artifacts) →
`production` (protected environments, signed artifacts). Secrets only in GitHub
Actions secrets / environments — never in the repo.
