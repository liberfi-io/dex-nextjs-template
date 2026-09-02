import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const HOP_BY_HOP_HEADERS = new Set([
  "connection",
  "content-length",
  "content-encoding",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailer",
  "transfer-encoding",
  "upgrade",
]);

const BLOCKED_REQUEST_HEADERS = new Set([
  ...HOP_BY_HOP_HEADERS,
  "host",
  "x-forwarded-host",
]);

const TRANSIENT_NETWORK_ERROR_CODES = new Set([
  "ECONNRESET",
  "ECONNREFUSED",
  "EPIPE",
  "ETIMEDOUT",
  "UND_ERR_CONNECT_TIMEOUT",
  "UND_ERR_SOCKET",
]);

function cloneRequestHeaders(headers: Headers) {
  const result = new Headers();

  headers.forEach((value, key) => {
    if (!BLOCKED_REQUEST_HEADERS.has(key.toLowerCase())) {
      result.set(key, value);
    }
  });

  return result;
}

function cloneResponseHeaders(headers: Headers) {
  const result = new Headers();

  headers.forEach((value, key) => {
    if (!HOP_BY_HOP_HEADERS.has(key.toLowerCase())) {
      result.set(key, value);
    }
  });

  return result;
}

function isTransientNetworkError(error: unknown) {
  if (!error || typeof error !== "object") return false;
  const directCode = (error as { code?: unknown }).code;
  const cause = (error as { cause?: unknown }).cause;
  const causeCode =
    cause && typeof cause === "object"
      ? (cause as { code?: unknown }).code
      : undefined;
  const code = typeof directCode === "string" ? directCode : causeCode;

  return typeof code === "string" && TRANSIENT_NETWORK_ERROR_CODES.has(code);
}

async function fetchWithTransientRetry(
  url: string,
  init: RequestInit,
): Promise<Response> {
  try {
    return await fetch(url, init);
  } catch (error) {
    if (!isTransientNetworkError(error)) throw error;
    return await fetch(url, init);
  }
}

export async function POST(request: NextRequest) {
  const baseUrl = process.env.MEDIA_TRACK_URL;

  if (!baseUrl) {
    return NextResponse.json(
      { message: "MEDIA_TRACK_URL is not configured" },
      { status: 500 },
    );
  }

  const targetUrl = `${baseUrl.replace(/\/+$/, "")}/meme/generate`;
  const body = await request.arrayBuffer();

  try {
    const response = await fetchWithTransientRetry(targetUrl, {
      method: "POST",
      headers: cloneRequestHeaders(request.headers),
      body,
      redirect: "manual",
    });

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: cloneResponseHeaders(response.headers),
    });
  } catch (error) {
    console.error("[media-track-proxy] meme generation failed:", error);
    return NextResponse.json(
      { message: "Media generation service is temporarily unavailable" },
      { status: 502 },
    );
  }
}
