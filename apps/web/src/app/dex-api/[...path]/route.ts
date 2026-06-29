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

type DexApiRouteContext = {
  params: Promise<{
    path?: string[];
  }>;
};

function buildTargetUrl(baseUrl: string, path: string[], search: string) {
  const normalizedBaseUrl = baseUrl.replace(/\/+$/, "");
  const normalizedPath = path.map(encodeURIComponent).join("/");

  return `${normalizedBaseUrl}/${normalizedPath}${search}`;
}

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

async function proxyDexApi(
  request: NextRequest,
  { params }: DexApiRouteContext,
) {
  const baseUrl = process.env.DEX_AGGREGATOR_URL;

  if (!baseUrl) {
    return NextResponse.json(
      { error: "DEX_AGGREGATOR_URL is not configured" },
      { status: 500 },
    );
  }

  const { path = [] } = await params;
  const targetUrl = buildTargetUrl(baseUrl, path, request.nextUrl.search);
  const hasBody = request.method !== "GET" && request.method !== "HEAD";
  const init: RequestInit & { duplex?: "half" } = {
    method: request.method,
    headers: cloneRequestHeaders(request.headers),
    redirect: "manual",
  };

  if (hasBody) {
    init.body = request.body;
    init.duplex = "half";
  }

  const response = await fetch(targetUrl, init);

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: cloneResponseHeaders(response.headers),
  });
}

export const GET = proxyDexApi;
export const POST = proxyDexApi;
export const PUT = proxyDexApi;
export const PATCH = proxyDexApi;
export const DELETE = proxyDexApi;
export const OPTIONS = proxyDexApi;
