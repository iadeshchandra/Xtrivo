# ADR-003 — Android: Kotlin port of core contracts (no shared runtime)

**Status:** accepted (Stage 0)
**Date:** 2026-10-16

## Context

`@xtrivo/core` (task state machine, error taxonomy, URL validation, filename safety)
is TypeScript. Android must be genuinely native Kotlin with correct lifecycle,
scoped storage, and background-transfer behavior.

## Decision

Implement the download engine **natively in Kotlin**, following the contracts in
`@xtrivo/core` exactly. Parity is enforced by **mirrored tests**: every contract
test in `packages/core` has a JUnit counterpart in `apps/android` covering the same
cases (redirects, Range resume, error mapping, filename sanitization).

## Alternatives considered

- **Kotlin Multiplatform (KMP):** rejected for v1 — doubles build complexity
  (Gradle + Kotlin/Native toolchains in CI) for a team that needs velocity.
- **Running the TS engine on Android (JS runtime):** rejected — overhead,
  lifecycle mismatch, and debugging cost outweigh the sharing benefit.

## Consequences

- Two implementations, one contract, mirrored tests. Contract changes require
  updating both test suites — enforced by CI job naming, not by hope.
