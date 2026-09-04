import { auth0Client } from "../../../../libs/auth0Client";
import { NextRequest, NextResponse } from "next/server";

const TOKEN_EXPIRY_SAFETY_WINDOW_MS = 5 * 60 * 1000;

type CachedDexToken = {
  accessToken: string;
  expiresAtMs: number;
};

let cachedDexToken: CachedDexToken | undefined;
let inFlightGrantPromise: Promise<CachedDexToken> | undefined;

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
  const oauthResp = await auth0Client.oauth.clientCredentialsGrant({
    audience: process.env.DEX_AUTH0_AUDIENCE,
  });
  const data = oauthResp.data as {
    access_token: string;
    expires_in?: number;
  };
  const issuedAtMs = Date.now();
  const tokenExpiresAtMs =
    typeof data.expires_in === "number"
      ? issuedAtMs + data.expires_in * 1000
      : readJwtExpiryMs(data.access_token) ?? issuedAtMs;

  return {
    accessToken: data.access_token,
    expiresAtMs: Math.max(
      issuedAtMs,
      tokenExpiresAtMs - TOKEN_EXPIRY_SAFETY_WINDOW_MS,
    ),
  };
}

async function getDexToken(): Promise<string> {
  const now = Date.now();
  if (cachedDexToken && cachedDexToken.expiresAtMs > now) {
    return cachedDexToken.accessToken;
  }

  if (!inFlightGrantPromise) {
    const grantPromise = requestDexToken().then((token) => {
      cachedDexToken = token.expiresAtMs > Date.now() ? token : undefined;
      return token;
    });
    const trackedGrantPromise = grantPromise.finally(() => {
      if (inFlightGrantPromise === trackedGrantPromise) {
        inFlightGrantPromise = undefined;
      }
    });
    inFlightGrantPromise = trackedGrantPromise;
  }

  return (await inFlightGrantPromise).accessToken;
}

export async function POST(_request: NextRequest) {
  try {
    return NextResponse.json({ accessToken: await getDexToken() });
  } catch (e: unknown) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Unknown error" },
      { status: 500 },
    );
  }
}
