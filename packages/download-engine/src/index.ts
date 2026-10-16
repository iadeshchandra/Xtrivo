/**
 * @xtrivo/download-engine — Stage 3 will implement the full engine here.
 *
 * Contract (from docs/ARCHITECTURE.md):
 * - HTTP/HTTPS only; max 5 redirects; never forward Authorization across origins.
 * - Resume via Range only on proven 206 + matching validators; otherwise safe restart.
 * - Temp files; final file appears only after integrity verification.
 *
 * This stub exists so workspaces resolve in Stage 1. It is NOT a downloader yet.
 */
export const ENGINE_VERSION = "0.1.0-stub";

export function downloadNotImplemented(): never {
  throw new Error(
    "@xtrivo/download-engine is a Stage 1 stub — the real engine lands in Stage 3.",
  );
}
