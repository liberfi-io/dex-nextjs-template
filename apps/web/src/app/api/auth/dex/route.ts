import { auth0Client } from "../../../../libs/auth0Client";
import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";

const TOKEN_EXPIRY_SAFETY_WINDOW_MS = 5 * 60 * 1000;
const PROCESS_BOOT_ID = randomUUID();

type DexTokenSource = "l1" | "grant";

type DexTokenErrorCode =
  | "DEX_TOKEN_UNAVAILABLE"
  | "DEX_TOKEN_INTERNAL";

type CachedDexToken = {
  accessToken: string;
  refreshAtMs: number;
  tokenExpiresAtMs: number;
};

let cachedDexToken: CachedDexToken | undefined;
let inFlightGrantPromise:
  | Promise<CachedDexToken & { grantDurationMs: number }>
  | undefined;

class DexTokenRouteError extends Error {
  constructor(
    readonly code: DexTokenErrorCode,
    readonly upstreamStatus?: number,
  ) {
    super(code);
    this.name = "DexTokenRouteError";
  }
}

function readUpstreamStatus(error: unknown): number | undefined {
  if (!error || typeof error !== "object") return undefined;

  for (const key of ["statusCode", "status"] as const) {
    const value = Reflect.get(error, key);
    if (typeof value === "number" && Number.isInteger(value)) return value;
  }

  return undefined;
}

function readJwtExpiryMs(token: string): number | undefined {
  try {
    const encodedPayload = token.split(".")[1];
    if (!encodedPayload) return undefined;
    const normalizedPayload = encodedPayload
      .replace(/-/g, "+")
      .replace(/_/g, "/")
      .padEnd(Math.ceil(encodedPayload.length / 4) * 4, "=");
    const payload = JSON.parse(atob(normalizedPayload)) as { exp?: unknown };
    return typeof payload.exp === "number" ? payload.exp * 1000 : undefined;
  } catch {
    return undefined;
  }
}

async function requestDexToken(): Promise<CachedDexToken> {
  const audience = process.env.DEX_AUTH0_AUDIENCE;
  if (!audience) {
    throw new DexTokenRouteError("DEX_TOKEN_INTERNAL");
  }

  let oauthResp: Awaited<
    ReturnType<typeof auth0Client.oauth.clientCredentialsGrant>
  >;
  try {
    oauthResp = await auth0Client.oauth.clientCredentialsGrant({ audience });
  } catch (error: unknown) {
    const upstreamStatus = readUpstreamStatus(error);
    const isNonRetryableClientError =
      upstreamStatus !== undefined &&
      upstreamStatus >= 400 &&
      upstreamStatus < 500 &&
      upstreamStatus !== 429;
    throw new DexTokenRouteError(
      isNonRetryableClientError
        ? "DEX_TOKEN_INTERNAL"
        : "DEX_TOKEN_UNAVAILABLE",
      upstreamStatus,
    );
  }

  const data = oauthResp.data as {
    access_token?: unknown;
    expires_in?: number;
  };
  if (typeof data.access_token !== "string" || !data.access_token.trim()) {
    throw new DexTokenRouteError("DEX_TOKEN_INTERNAL");
  }

  const issuedAtMs = Date.now();
  const tokenExpiresAtMs =
    typeof data.expires_in === "number"
      ? issuedAtMs + data.expires_in * 1000
      : readJwtExpiryMs(data.access_token);
  if (!tokenExpiresAtMs || tokenExpiresAtMs <= issuedAtMs) {
    throw new DexTokenRouteError("DEX_TOKEN_INTERNAL");
  }

  return {
    accessToken: data.access_token,
    refreshAtMs: Math.max(
      issuedAtMs,
      tokenExpiresAtMs - TOKEN_EXPIRY_SAFETY_WINDOW_MS,
    ),
    tokenExpiresAtMs,
  };
}

async function getDexToken(): Promise<
  CachedDexToken & { source: DexTokenSource; grantDurationMs: number }
> {
  const now = Date.now();
  if (cachedDexToken && cachedDexToken.refreshAtMs > now) {
    return { ...cachedDexToken, source: "l1", grantDurationMs: 0 };
  }

  if (!inFlightGrantPromise) {
    const grantStartedAtMs = Date.now();
    const grantPromise = requestDexToken().then((token) => {
      cachedDexToken = token.refreshAtMs > Date.now() ? token : undefined;
      return {
        ...token,
        grantDurationMs: Date.now() - grantStartedAtMs,
      };
    });
    const trackedGrantPromise = grantPromise.finally(() => {
      if (inFlightGrantPromise === trackedGrantPromise) {
        inFlightGrantPromise = undefined;
      }
    });
    inFlightGrantPromise = trackedGrantPromise;
  }

  return { ...(await inFlightGrantPromise), source: "grant" };
}

function createResponseHeaders(source: DexTokenSource | "error", durationMs: number) {
  return {
    "Cache-Control": "private, no-store",
    "Server-Timing": `dex-token;desc="${source}";dur=${durationMs}`,
    "X-Dex-Token-Source": source,
  };
}

export async function POST(_request: NextRequest) {
  const routeStartedAtMs = Date.now();
  const requestId = randomUUID();
  const region = process.env.VERCEL_REGION ?? "unknown";

  try {
    const token = await getDexToken();
    const routeDurationMs = Date.now() - routeStartedAtMs;
    const status = 200;
    console.info("dex_token_request", {
      source: token.source,
      routeDurationMs,
      grantDurationMs: token.grantDurationMs,
      tokenRemainingLifetimeSeconds: Math.max(
        0,
        Math.floor((token.tokenExpiresAtMs - Date.now()) / 1000),
      ),
      status,
      region,
      bootId: PROCESS_BOOT_ID,
      requestId,
    });
    return NextResponse.json(
      { accessToken: token.accessToken },
      {
        status,
        headers: createResponseHeaders(token.source, routeDurationMs),
      },
    );
  } catch (error: unknown) {
    const routeError =
      error instanceof DexTokenRouteError
        ? error
        : new DexTokenRouteError("DEX_TOKEN_INTERNAL");
    const status = routeError.code === "DEX_TOKEN_UNAVAILABLE" ? 503 : 500;
    const routeDurationMs = Date.now() - routeStartedAtMs;
    console.error("dex_token_request_error", {
      errorCategory: routeError.code,
      upstreamStatus: routeError.upstreamStatus,
      routeDurationMs,
      status,
      region,
      bootId: PROCESS_BOOT_ID,
      requestId,
    });
    return NextResponse.json(
      { error: { code: routeError.code } },
      {
        status,
        headers: createResponseHeaders("error", routeDurationMs),
      },
    );
  }
}
