import { auth0Client } from "@/libs/auth0Client";
import { NextRequest, NextResponse } from "next/server";

export async function POST(_request: NextRequest) {
  try {
    const oauthResp = await auth0Client.oauth.clientCredentialsGrant({
      audience: process.env.DEX_AUTH0_AUDIENCE,
    });
    return NextResponse.json({ accessToken: oauthResp.data.access_token });
  } catch (e: unknown) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Unknown error" },
      { status: 500 },
    );
  }
}
