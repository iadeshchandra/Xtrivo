# Contributing to XTRIVO

## Branching

- `main` — production. Protected: requires green CI + review. No direct pushes.
- `develop` — integration branch. Feature branches merge here via pull request.
- Feature branches: `feat/<short-name>`, `fix/<short-name>`, `docs/<short-name>`.

## Commits

Small, reviewable commits with descriptive messages:

```
feat(extension): detect downloadable links on page
fix(android): handle servers that ignore Range requests
docs: update architecture decision records
```

## Pull requests

1. Branch from `develop`.
2. Keep the PR focused; one concern per PR.
3. CI must be green (lint, typecheck, tests, builds).
4. No secrets in code, logs, or screenshots. Run the secret scan locally if unsure.
5. Never present placeholder UI as finished — label scaffolding honestly.

## Code standards

- TypeScript: strict mode, no `any` without justification.
- Kotlin: ktlint + detekt clean.
- Formatting: Prettier (JS/TS), enforced in CI.
- Tests: new download-engine/core logic ships with tests, including failure cases
  (redirects, errors, cancellation, resume, corrupt partial files).

## What not to do

- Never commit passwords, tokens, API keys, keystores, or certificates.
- Never invent build/test/deploy results — report what CI actually says.
- Never add DRM circumvention, paywall bypass, credential harvesting,
  or covert tracking. These are permanently out of scope.
