import { markHomepageCriticalPath } from "../performance/homepageCriticalPath";

export class DexTokenRequestError extends Error {
  readonly code: string;
  readonly status: number;

  constructor(code: string, status: number) {
    super(code);
    this.name = "DexTokenRequestError";
    this.code = code;
    this.status = status;
  }
}

function readErrorCode(value: unknown): string {
  if (typeof value !== "object" || value === null) {
    return "DEX_TOKEN_REQUEST_FAILED";
  }

  const error = (value as { error?: unknown }).error;
  if (typeof error === "object" && error !== null) {
    const code = (error as { code?: unknown }).code;
    if (typeof code === "string" && code.length > 0) return code;
  }

  return "DEX_TOKEN_REQUEST_FAILED";
}

export async function fetchDexToken(signal?: AbortSignal) {
  const startedAt = Date.now();
  let status = 0;
  let source: "l1" | "grant" | "error" | "unknown" = "unknown";
  markHomepageCriticalPath("dex_request_start");

  try {
    const res = await fetch("/api/auth/dex", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      signal,
    });
    status = res.status;
    const responseSource = res.headers?.get("X-Dex-Token-Source");
    if (
      responseSource === "l1" ||
      responseSource === "grant" ||
      responseSource === "error"
    ) {
      source = responseSource;
    }

    let data: unknown;
    try {
      data = (await res.json()) as unknown;
    } catch {
      throw new DexTokenRequestError("DEX_TOKEN_INVALID_RESPONSE", res.status);
    }
    if (!res.ok) {
      throw new DexTokenRequestError(readErrorCode(data), res.status);
    }
    if (typeof data !== "object" || data === null) {
      throw new DexTokenRequestError("DEX_TOKEN_INVALID_RESPONSE", res.status);
    }
    const accessToken = (data as { accessToken?: unknown }).accessToken;
    if (typeof accessToken !== "string" || accessToken.trim().length === 0) {
      throw new DexTokenRequestError("DEX_TOKEN_INVALID_RESPONSE", res.status);
    }
    return accessToken;
  } catch (error: unknown) {
    if (error instanceof DexTokenRequestError || signal?.aborted) throw error;
    throw new DexTokenRequestError("DEX_TOKEN_REQUEST_FAILED", status);
  } finally {
    markHomepageCriticalPath("dex_request_end", {
      source,
      status,
      durationMs: Date.now() - startedAt,
    });
  }
}
