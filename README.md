# XTRIVO

**Fast, dependable, privacy-conscious download and media management — for everyday users, everywhere.**

XTRIVO is a product family built from one monorepo:

| Product          | Directory        | Tech                                               |
| ---------------- | ---------------- | -------------------------------------------------- |
| Android app      | `apps/android`   | Native Kotlin (no WebView wrapper)                 |
| Desktop app      | `apps/desktop`   | Electron + TypeScript                              |
| Chrome extension | `apps/extension` | Manifest V3 + TypeScript                           |
| Web site         | `apps/web`       | Astro (static: marketing, docs, release downloads) |

Shared code lives in `packages/`:

| Package                   | Purpose                                                                             |
| ------------------------- | ----------------------------------------------------------------------------------- |
| `@xtrivo/core`            | URL validation, download task state machine, error taxonomy, filename safety        |
| `@xtrivo/download-engine` | Node HTTP(S) download engine (redirects, Range resume, integrity) — used by desktop |
| `@xtrivo/design-system`   | Design tokens (colors, type, spacing) + logo assets                                 |

## Principles

- **Local-first.** Downloads, history, bookmarks stay on the user's device. No account required.
- **Honest software.** No fake buttons, no placeholder features presented as complete, no invented results.
- **Privacy as a feature.** Minimal data collection, HTTPS everywhere, secure storage for secrets.
- **Legal by design.** General-purpose HTTP/HTTPS downloads only. No DRM circumvention, no paywall bypass, no deceptive downloads. Unsupported links get a clear message — never a fake success.

## Repository layout

```
xtrivo/
├── apps/           # android, desktop, extension, web
├── packages/       # core, download-engine, design-system
├── docs/           # architecture, ADRs, security & privacy docs
├── .github/        # workflows (CI, builds, security, deploy, release)
├── .env.example    # documented env names only — never real secrets
└── package.json    # npm workspaces
```

Branches: `main` (production, protected) ← `develop` (integration) ← feature branches.
Releases: SemVer tags `vX.Y.Z` trigger the release workflow.

## Quickstart (no local installs needed for builds)

Everything heavy runs in GitHub Actions — open the **Actions** tab, pick a workflow, click **Run workflow**.

Local development (Node 20+):

```bash
npm install          # install all workspaces
npm test             # run all workspace tests
npm run typecheck    # typecheck all workspaces
npm run lint         # lint all workspaces
```

## Build stages

| Stage | Name                                | Status         |
| ----- | ----------------------------------- | -------------- |
| 0     | Feasibility & architecture          | ✅ done        |
| 1     | Foundation & CI                     | 🏗 in progress |
| 2     | Branding & core UI                  | planned        |
| 3     | Shared download engine              | planned        |
| 4     | Android product                     | planned        |
| 5     | Chrome extension                    | planned        |
| 6     | Desktop product                     | planned        |
| 7     | Web product                         | planned        |
| 8     | Shared services (only if justified) | planned        |
| 9     | Monetization & privacy controls     | planned        |
| 10    | Production hardening                | planned        |
| 11    | Release & deployment                | planned        |

A stage is complete only when its acceptance tests pass in CI. See `docs/ARCHITECTURE.md` and `docs/adr/`.

## Security

See `docs/SECURITY.md` (Stage 10). To report a vulnerability, see `SECURITY.md` at the repo root (added in Stage 10).
