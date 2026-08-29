import { resolveRuntimeConfigPolicy } from "../runtime-lifecycle-policy";
import { readRuntimeConfig } from "../readRuntimeConfig";

const REQUIRED_ENV = {
  NEXT_PUBLIC_DEX_AGGREGATOR_URL: "/dex-api",
  NEXT_PUBLIC_MEDIA_TRACK_URL: "/media-api",
  NEXT_PUBLIC_MEDIA_TRACK_STREAM_URL: "wss://stream.example.com",
  NEXT_PUBLIC_CHANNELS_URL: "/channels-api",
  NEXT_PUBLIC_PREDICT_URL: "/predict-api",
} as const;

describe("runtime configuration policy", () => {
  it("reads explicit environment and origin inputs without touching browser globals", () => {
    expect(readRuntimeConfig(REQUIRED_ENV, "").origin).toBe("");
  });

  it("reads public runtime env via static Next.js member access, not process.env as an object", async () => {
    const fs = await import("node:fs/promises");
    const path = await import("node:path");
    const source = await fs.readFile(path.resolve(__dirname, "../readRuntimeConfig.ts"), "utf8");
    expect(source).toContain("process.env.NEXT_PUBLIC_DEX_AGGREGATOR_URL");
    expect(source).not.toMatch(/=\s*process\.env[^.]/);
  });

  it("resolves relative HTTP endpoints against the browser origin", () => {
    expect(
      resolveRuntimeConfigPolicy({
        env: REQUIRED_ENV,
        origin: "https://app.example.com",
      }),
    ).toMatchObject({
      dexAggregatorUrl: "https://app.example.com/dex-api",
      mediaTrackUrl: "https://app.example.com/media-api",
      channelsUrl: "https://app.example.com/channels-api",
      predictUrl: "https://app.example.com/predict-api",
    });
  });

  it("names a missing required variable without exposing unrelated values", () => {
    const env = {
      ...REQUIRED_ENV,
      NEXT_PUBLIC_DEX_AGGREGATOR_URL: undefined,
      PRIVATE_TOKEN: "must-not-leak",
    };

    expect(() => resolveRuntimeConfigPolicy({ env, origin: "https://app.example.com" })).toThrow(
      "Missing required runtime variable: NEXT_PUBLIC_DEX_AGGREGATOR_URL",
    );

    try {
      resolveRuntimeConfigPolicy({ env, origin: "https://app.example.com" });
    } catch (error) {
      expect(String(error)).not.toContain("must-not-leak");
    }
  });

  it.each([
    [undefined, undefined, false, undefined],
    [undefined, "wss://predict.example.com", false, undefined],
    ["false", "wss://predict.example.com", false, undefined],
    ["true", "wss://predict.example.com", true, "wss://predict.example.com"],
  ] as const)(
    "applies the explicit Predict WS policy for enabled=%s and url=%s",
    (enabled, wsUrl, expectedEnabled, expectedUrl) => {
      const config = resolveRuntimeConfigPolicy({
        env: {
          ...REQUIRED_ENV,
          NEXT_PUBLIC_ENABLE_PREDICT_WS: enabled,
          NEXT_PUBLIC_PREDICT_WS_URL: wsUrl,
        },
        origin: "https://app.example.com",
      });

      expect(config.predictWsEnabled).toBe(expectedEnabled);
      expect(config.predictWsUrl).toBe(expectedUrl);
    },
  );

  it("rejects enabled Predict WS without a URL", () => {
    expect(() =>
      resolveRuntimeConfigPolicy({
        env: {
          ...REQUIRED_ENV,
          NEXT_PUBLIC_ENABLE_PREDICT_WS: "true",
        },
        origin: "https://app.example.com",
      }),
    ).toThrow("Missing required runtime variable: NEXT_PUBLIC_PREDICT_WS_URL");
  });

  it("rejects a non-WebSocket media stream endpoint", () => {
    expect(() =>
      resolveRuntimeConfigPolicy({
        env: {
          ...REQUIRED_ENV,
          NEXT_PUBLIC_MEDIA_TRACK_STREAM_URL: "https://stream.example.com",
        },
        origin: "https://app.example.com",
      }),
    ).toThrow(
      "Invalid runtime variable NEXT_PUBLIC_MEDIA_TRACK_STREAM_URL: expected ws:// or wss:// URL",
    );
  });

  it("keeps relative endpoints during SSR and leaves optional clients disabled", () => {
    expect(resolveRuntimeConfigPolicy({ env: REQUIRED_ENV, origin: "" })).toMatchObject({
      origin: "",
      dexAggregatorUrl: "/dex-api",
      predictWsUrl: undefined,
      predictWsEnabled: false,
      perpetualsApiUrl: undefined,
    });
  });

  it("rejects an enabled Predict endpoint that is not WebSocket-compatible", () => {
    expect(() =>
      resolveRuntimeConfigPolicy({
        env: {
          ...REQUIRED_ENV,
          NEXT_PUBLIC_ENABLE_PREDICT_WS: "true",
          NEXT_PUBLIC_PREDICT_WS_URL: "https://predict.example.com",
        },
        origin: "https://app.example.com",
      }),
    ).toThrow("Invalid runtime variable NEXT_PUBLIC_PREDICT_WS_URL: expected ws:// or wss:// URL");
  });
});
