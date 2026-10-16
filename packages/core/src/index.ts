/**
 * @xtrivo/core — shared contracts for the XTRIVO product family.
 *
 * Everything in this module is platform-agnostic and fully unit-tested.
 * Android mirrors these contracts in Kotlin with mirrored JUnit tests (ADR-003).
 */

// ---------------------------------------------------------------------------
// URL validation & normalization
// ---------------------------------------------------------------------------

/** Schemes XTRIVO is ever allowed to download from. Nothing else. */
export const ALLOWED_SCHEMES = ["http:", "https:"] as const;
export type AllowedScheme = (typeof ALLOWED_SCHEMES)[number];

export interface NormalizedUrl {
  /** Canonical URL string safe to request. */
  url: string;
  scheme: AllowedScheme;
  host: string;
}

export type UrlProblem =
  | "EMPTY"
  | "NOT_A_URL"
  | "SCHEME_NOT_ALLOWED"
  | "MISSING_HOST"
  | "CREDENTIALS_IN_URL";

export type UrlResult =
  | { ok: true; value: NormalizedUrl }
  | { ok: false; problem: UrlProblem };

/**
 * Validate and normalize a user-supplied URL for downloading.
 * Rejects anything that is not an http(s) URL, strips fragments,
 * and refuses URLs that embed credentials (phishing / leak risk).
 */
export function normalizeDownloadUrl(input: string): UrlResult {
  const trimmed = input.trim();
  if (!trimmed) return { ok: false, problem: "EMPTY" };

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return { ok: false, problem: "NOT_A_URL" };
  }

  const scheme = parsed.protocol.toLowerCase();
  if (scheme !== "http:" && scheme !== "https:") {
    return { ok: false, problem: "SCHEME_NOT_ALLOWED" };
  }
  if (!parsed.hostname) return { ok: false, problem: "MISSING_HOST" };
  if (parsed.username || parsed.password)
    return { ok: false, problem: "CREDENTIALS_IN_URL" };

  parsed.hash = ""; // fragments are never sent to servers; drop them
  return {
    ok: true,
    value: {
      url: parsed.toString(),
      scheme: scheme as AllowedScheme,
      host: parsed.hostname,
    },
  };
}

// ---------------------------------------------------------------------------
// Filename safety
// ---------------------------------------------------------------------------

const WINDOWS_RESERVED = new Set([
  "CON",
  "PRN",
  "AUX",
  "NUL",
  "COM1",
  "COM2",
  "COM3",
  "COM4",
  "COM5",
  "COM6",
  "COM7",
  "COM8",
  "COM9",
  "LPT1",
  "LPT2",
  "LPT3",
  "LPT4",
  "LPT5",
  "LPT6",
  "LPT7",
  "LPT8",
  "LPT9",
]);

/**
 * Sanitize a server- or URL-suggested filename so it cannot escape the
 * destination directory or break the filesystem. Never returns an empty string.
 */
export function sanitizeFilename(raw: string, fallback = "download"): string {
  // Strip path components — only the final segment survives.
  let name = raw.split(/[\\/]/).pop() ?? "";
  // Remove control characters and trim dots/spaces (Windows-unfriendly edges).
  // eslint-disable-next-line no-control-regex
  name = name.replace(/[\x00-\x1f\x7f]/g, "").replace(/^[.\s]+|[.\s]+$/g, "");
  // Replace characters illegal on common filesystems.
  name = name.replace(/[<>:"|?*]/g, "_");
  if (!name) name = fallback;
  // Avoid Windows reserved device names (CON.txt -> _CON.txt).
  const stem = name.split(".")[0].toUpperCase();
  if (WINDOWS_RESERVED.has(stem)) name = "_" + name;
  // Keep it filesystem-friendly in length.
  if (name.length > 200) {
    const dot = name.lastIndexOf(".");
    const ext = dot > 0 ? name.slice(dot) : "";
    name = name.slice(0, 200 - ext.length) + ext;
  }
  return name;
}

/** Suggest a non-colliding filename: `a.zip`, `a (1).zip`, `a (2).zip`, … */
export function deduplicateFilename(
  desired: string,
  exists: (name: string) => boolean,
): string {
  if (!exists(desired)) return desired;
  const dot = desired.lastIndexOf(".");
  const stem = dot > 0 ? desired.slice(0, dot) : desired;
  const ext = dot > 0 ? desired.slice(dot) : "";
  let i = 1;
  for (;;) {
    const candidate = `${stem} (${i})${ext}`;
    if (!exists(candidate)) return candidate;
    i++;
  }
}

// ---------------------------------------------------------------------------
// Error taxonomy — every platform maps failures to these codes.
// ---------------------------------------------------------------------------

export type DownloadErrorCode =
  | "INVALID_URL"
  | "UNSUPPORTED_SCHEME"
  | "DNS_FAILURE"
  | "CONNECTION_REFUSED"
  | "CONNECTION_TIMEOUT"
  | "TLS_ERROR"
  | "TOO_MANY_REDIRECTS"
  | "UNSAFE_REDIRECT"
  | "HTTP_ERROR" // 4xx/5xx — status attached
  | "RANGE_NOT_SUPPORTED" // server ignored Range; safe restart required
  | "CHECKSUM_MISMATCH"
  | "INSUFFICIENT_STORAGE"
  | "PERMISSION_DENIED"
  | "CANCELLED_BY_USER"
  | "INTERRUPTED" // recoverable: retry/resume allowed
  | "UNKNOWN";

export interface DownloadError {
  code: DownloadErrorCode;
  message: string; // user-facing, no sensitive URL parts
  httpStatus?: number;
  retryable: boolean;
}

/** Map an HTTP status to the taxonomy. 5xx and 429 are retryable; 4xx are not. */
export function httpStatusToError(status: number): DownloadError {
  const retryable = status === 429 || status >= 500;
  return {
    code: "HTTP_ERROR",
    httpStatus: status,
    message:
      status === 404
        ? "The file was not found on the server."
        : status === 403
          ? "The server refused access to this file."
          : status === 429
            ? "The server asked us to slow down. You can retry shortly."
            : status >= 500
              ? "The server had a problem. Retrying may help."
              : `The server responded with an error (${status}).`,
    retryable,
  };
}

// ---------------------------------------------------------------------------
// Task state machine — the single contract every platform implements.
// ---------------------------------------------------------------------------

export type DownloadState =
  | "queued"
  | "active"
  | "paused"
  | "failed"
  | "complete"
  | "cancelled";

const TRANSITIONS: Record<DownloadState, readonly DownloadState[]> = {
  queued: ["active", "cancelled"],
  active: ["paused", "failed", "complete", "cancelled"],
  paused: ["queued", "cancelled"], // resume re-queues
  failed: ["queued", "cancelled"], // retry re-queues
  complete: [],
  cancelled: [],
};

/** True if a state transition is legal. Illegal transitions are rejected, never forced. */
export function canTransition(from: DownloadState, to: DownloadState): boolean {
  return TRANSITIONS[from].includes(to);
}

export interface DownloadTask {
  id: string;
  url: string; // normalized
  filename: string; // sanitized
  state: DownloadState;
  bytesReceived: number;
  bytesTotal: number | null; // null when the server hides the size
  error?: DownloadError;
}

/** Fraction 0..1, or null when the total size is unknown. */
export function progressOf(task: DownloadTask): number | null {
  if (task.bytesTotal == null || task.bytesTotal <= 0) return null;
  return Math.min(1, task.bytesReceived / task.bytesTotal);
}
