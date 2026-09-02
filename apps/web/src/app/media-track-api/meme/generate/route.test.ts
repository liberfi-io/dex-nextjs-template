/** @jest-environment node */

import { NextRequest } from "next/server";
import { POST } from "./route";

describe("media-track meme generation proxy", () => {
  const originalMediaTrackUrl = process.env.MEDIA_TRACK_URL;

  afterEach(() => {
    jest.restoreAllMocks();
    if (originalMediaTrackUrl === undefined) {
      Reflect.deleteProperty(process.env, "MEDIA_TRACK_URL");
    } else {
      process.env.MEDIA_TRACK_URL = originalMediaTrackUrl;
    }
  });

  it("forwards the authenticated request to the configured v1 endpoint without proxy host headers", async () => {
    process.env.MEDIA_TRACK_URL =
      "https://api.chainstream.io/api/x-monitor/v1";
    const upstreamResponse = new Response(
      JSON.stringify({
        code: "0",
        msg: "success",
        data: {
          ticker: "GDSD",
          coin_name: "Godspeed Coin",
          icon_url: "https://example.com/generated.png",
        },
      }),
      {
        status: 200,
        headers: { "content-type": "application/json" },
      },
    );
    const fetchSpy = jest
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(upstreamResponse);
    const request = new NextRequest(
      "http://localhost:3000/media-track-api/meme/generate",
      {
        method: "POST",
        headers: {
          authorization: "Bearer test-token",
          "content-type": "application/json",
          host: "localhost:3000",
          "x-forwarded-host": "localhost:3000",
        },
        body: JSON.stringify({ tweet_id: "tweet-1", tweet_info: "godspeed" }),
      },
    );

    const response = await POST(request);

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const [url, init] = fetchSpy.mock.calls[0];
    expect(url).toBe(
      "https://api.chainstream.io/api/x-monitor/v1/meme/generate",
    );
    const headers = new Headers(init?.headers);
    expect(headers.get("authorization")).toBe("Bearer test-token");
    expect(headers.has("host")).toBe(false);
    expect(headers.has("x-forwarded-host")).toBe(false);
    expect(await response.json()).toEqual({
      code: "0",
      msg: "success",
      data: {
        ticker: "GDSD",
        coin_name: "Godspeed Coin",
        icon_url: "https://example.com/generated.png",
      },
    });
  });

  it("retries one transient upstream connection failure", async () => {
    process.env.MEDIA_TRACK_URL =
      "https://api.chainstream.io/api/x-monitor/v1";
    const fetchSpy = jest
      .spyOn(globalThis, "fetch")
      .mockRejectedValueOnce(Object.assign(new TypeError("fetch failed"), {
        cause: { code: "ECONNRESET" },
      }))
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ code: "0", msg: "success", data: {} }), {
          status: 200,
          headers: { "content-type": "application/json" },
        }),
      );
    const request = new NextRequest(
      "http://localhost:3000/media-track-api/meme/generate",
      {
        method: "POST",
        headers: {
          authorization: "Bearer test-token",
          "content-type": "application/json",
        },
        body: JSON.stringify({ tweet_id: "tweet-1", tweet_info: "godspeed" }),
      },
    );

    const response = await POST(request);

    expect(fetchSpy).toHaveBeenCalledTimes(2);
    expect(response.status).toBe(200);
  });
});
