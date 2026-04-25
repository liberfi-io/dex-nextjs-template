/**
 * Hyperunit API proxy.
 *
 * `https://api.hyperunit.xyz` is fronted by Cloudflare with strict bot
 * protection — direct browser requests are rejected with HTTP 403 (the
 * upstream also does not return CORS headers).  All Hyperunit calls from
 * the web client therefore go through this same-origin proxy.
 *
 * Forwards any GET path under `/api/hyperunit/*` to the matching path on
 * `api.hyperunit.xyz`, preserving the query string.  No request body is
 * forwarded; only `GET` is supported (Hyperunit's public API is read-only
 * for our flows: gen-address + operations).
 */

import { NextRequest, NextResponse } from "next/server";

const UPSTREAM = "https://api.hyperunit.xyz";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params;
  if (!path?.length) {
    return NextResponse.json({ error: "Missing path" }, { status: 400 });
  }

  const search = request.nextUrl.search ?? "";
  const upstreamUrl = `${UPSTREAM}/${path.map(encodeURIComponent).join("/")}${search}`;

  try {
    const res = await fetch(upstreamUrl, {
      method: "GET",
      headers: {
        accept: "application/json",
        // Server-side fetch does not trigger Cloudflare bot challenges.
      },
      cache: "no-store",
    });

    const contentType = res.headers.get("content-type") ?? "application/json";
    const body = await res.text();
    return new NextResponse(body, {
      status: res.status,
      headers: {
        "content-type": contentType,
        "cache-control": "no-store",
      },
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Upstream fetch failed" },
      { status: 502 },
    );
  }
}
