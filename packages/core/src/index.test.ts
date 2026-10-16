import { describe, expect, it } from "vitest";
import {
  canTransition,
  deduplicateFilename,
  httpStatusToError,
  normalizeDownloadUrl,
  progressOf,
  sanitizeFilename,
  type DownloadTask,
} from "./index.js";

describe("normalizeDownloadUrl", () => {
  it("accepts a plain https URL and drops the fragment", () => {
    const r = normalizeDownloadUrl("https://example.com/file.zip#frag");
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value.url).toBe("https://example.com/file.zip");
      expect(r.value.host).toBe("example.com");
    }
  });

  it("accepts http and upper-case schemes", () => {
    expect(normalizeDownloadUrl("HTTP://example.com/a").ok).toBe(true);
  });

  it("rejects empty input", () => {
    expect(normalizeDownloadUrl("   ")).toEqual({
      ok: false,
      problem: "EMPTY",
    });
  });

  it("rejects non-URLs", () => {
    expect(normalizeDownloadUrl("not a url").ok).toBe(false);
  });

  it("rejects non-http schemes (file, ftp, javascript)", () => {
    for (const u of [
      "file:///etc/passwd",
      "ftp://example.com/a",
      "javascript:alert(1)",
    ]) {
      const r = normalizeDownloadUrl(u);
      expect(r.ok).toBe(false);
      if (!r.ok) expect(r.problem).toBe("SCHEME_NOT_ALLOWED");
    }
  });

  it("rejects URLs with embedded credentials", () => {
    const r = normalizeDownloadUrl("https://user:pass@example.com/a");
    expect(r).toEqual({ ok: false, problem: "CREDENTIALS_IN_URL" });
  });
});

describe("sanitizeFilename", () => {
  it("strips path traversal", () => {
    expect(sanitizeFilename("../../etc/passwd")).toBe("passwd");
    expect(sanitizeFilename("..\\..\\secret.txt")).toBe("secret.txt");
  });

  it("replaces illegal characters", () => {
    expect(sanitizeFilename('a<b>c:"d"|e?f*g')).toBe("a_b_c__d__e_f_g");
  });

  it("never returns empty", () => {
    expect(sanitizeFilename("")).toBe("download");
    expect(sanitizeFilename("...")).toBe("download");
  });

  it("guards Windows reserved names", () => {
    expect(sanitizeFilename("CON.txt")).toBe("_CON.txt");
    expect(sanitizeFilename("nul")).toBe("_nul");
  });

  it("truncates very long names but keeps the extension", () => {
    const long = "a".repeat(300) + ".zip";
    const out = sanitizeFilename(long);
    expect(out.length).toBeLessThanOrEqual(200);
    expect(out.endsWith(".zip")).toBe(true);
  });
});

describe("deduplicateFilename", () => {
  it("appends numeric suffixes until free", () => {
    const taken = new Set(["a.zip", "a (1).zip"]);
    expect(deduplicateFilename("a.zip", (n) => taken.has(n))).toBe("a (2).zip");
    expect(deduplicateFilename("b.zip", (n) => taken.has(n))).toBe("b.zip");
  });
});

describe("httpStatusToError", () => {
  it("maps 404/403 to non-retryable errors", () => {
    expect(httpStatusToError(404).retryable).toBe(false);
    expect(httpStatusToError(403).retryable).toBe(false);
  });

  it("maps 429/5xx to retryable errors", () => {
    expect(httpStatusToError(429).retryable).toBe(true);
    expect(httpStatusToError(503).retryable).toBe(true);
  });
});

describe("canTransition", () => {
  it("allows the legal lifecycle", () => {
    expect(canTransition("queued", "active")).toBe(true);
    expect(canTransition("active", "paused")).toBe(true);
    expect(canTransition("paused", "queued")).toBe(true); // resume
    expect(canTransition("failed", "queued")).toBe(true); // retry
    expect(canTransition("active", "complete")).toBe(true);
  });

  it("rejects illegal jumps", () => {
    expect(canTransition("complete", "active")).toBe(false);
    expect(canTransition("queued", "complete")).toBe(false);
    expect(canTransition("cancelled", "queued")).toBe(false);
  });
});

describe("progressOf", () => {
  const base: DownloadTask = {
    id: "1",
    url: "https://example.com/a",
    filename: "a",
    state: "active",
    bytesReceived: 50,
    bytesTotal: 100,
  };
  it("computes fraction, clamps, handles unknown size", () => {
    expect(progressOf(base)).toBe(0.5);
    expect(progressOf({ ...base, bytesTotal: null })).toBeNull();
    expect(progressOf({ ...base, bytesReceived: 200 })).toBe(1);
  });
});
