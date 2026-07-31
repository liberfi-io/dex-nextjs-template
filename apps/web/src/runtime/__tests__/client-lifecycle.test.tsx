import { RuntimeConfig } from "../app-runtime.types";
import { getChangedRuntimeClients } from "../runtime-lifecycle-policy";
import { renderHook } from "@testing-library/react";
import { useAppClientBundle } from "../useAppClientBundle";

const CONFIG: RuntimeConfig = {
  origin: "https://app.example.com",
  dexAggregatorUrl: "https://app.example.com/dex-api",
  mediaTrackUrl: "https://app.example.com/media-api",
  mediaTrackStreamUrl: "wss://stream.example.com",
  channelsUrl: "https://app.example.com/channels-api",
  predictUrl: "https://app.example.com/predict-api",
  predictWsUrl: undefined,
  predictWsEnabled: false,
  perpetualsApiUrl: undefined,
  perpetualsEnvironment: "mainnet",
};

const DEX_TOKEN_PROVIDER = {};

function lifecycleInput(overrides: Record<string, unknown> = {}) {
  return {
    config: CONFIG,
    dexTokenProvider: DEX_TOKEN_PROVIDER,
    channelsAccessToken: null,
    chain: "solana",
    walletAddress: "wallet-a",
    ...overrides,
  };
}

describe("application client lifecycle policy", () => {
  it("keeps every client stable when hook inputs are referentially stable", () => {
    const dexTokenProvider = { getToken: async () => "dex-token" };
    const channelsTokenProvider = { getToken: async () => "channels-token" };
    const { result, rerender } = renderHook(() =>
      useAppClientBundle({
        config: CONFIG,
        dexTokenProvider,
        channelsTokenProvider,
      }),
    );
    const first = result.current;

    rerender();

    expect(result.current).toBe(first);
    for (const key of Object.keys(first) as Array<keyof typeof first>) {
      expect(result.current[key]).toBe(first[key]);
    }
    expect(result.current.capabilities.token).toBe(result.current.api);
    expect(result.current.capabilities.subscription.activity).toBe(
      result.current.api,
    );
  });

  it("rebuilds only the Channels member when its token provider changes", () => {
    const dexTokenProvider = { getToken: async () => "dex-token" };
    const firstChannelsTokenProvider = {
      getToken: async () => "first-channels-token",
    };
    const nextChannelsTokenProvider = {
      getToken: async () => "next-channels-token",
    };
    const { result, rerender } = renderHook(
      ({ channelsTokenProvider }) =>
        useAppClientBundle({
          config: CONFIG,
          dexTokenProvider,
          channelsTokenProvider,
        }),
      {
        initialProps: { channelsTokenProvider: firstChannelsTokenProvider },
      },
    );
    const first = result.current;

    rerender({ channelsTokenProvider: nextChannelsTokenProvider });

    expect(result.current).not.toBe(first);
    expect(result.current.channels).not.toBe(first.channels);
    for (const key of Object.keys(first) as Array<keyof typeof first>) {
      if (key !== "channels") expect(result.current[key]).toBe(first[key]);
    }
  });

  it("does not rebuild clients for an ordinary rerender", () => {
    const before = lifecycleInput();
    const after = lifecycleInput();

    expect(getChangedRuntimeClients(before, after)).toEqual([]);
  });

  it("rebuilds only dex-authenticated clients when the dex token provider changes", () => {
    expect(
      getChangedRuntimeClients(lifecycleInput(), lifecycleInput({ dexTokenProvider: {} })),
    ).toEqual(["chainStream", "api", "mediaTrack"]);
  });

  it("rebuilds only Channels when its access token value changes", () => {
    expect(
      getChangedRuntimeClients(
        lifecycleInput(),
        lifecycleInput({ channelsAccessToken: "next-token" }),
      ),
    ).toEqual(["channels"]);
  });

  it("updates portfolio props without rebuilding any client", () => {
    expect(
      getChangedRuntimeClients(
        lifecycleInput(),
        lifecycleInput({ chain: "ethereum", walletAddress: "wallet-b" }),
      ),
    ).toEqual([]);
  });

  it.each([
    ["dexAggregatorUrl", ["chainStream", "api", "portfolio"]],
    ["mediaTrackUrl", ["mediaTrack"]],
    ["mediaTrackStreamUrl", ["mediaTrack"]],
    ["channelsUrl", ["channels"]],
    ["predictUrl", ["predict"]],
    ["predictWsUrl", ["predictWs"]],
    ["predictWsEnabled", ["predictWs"]],
    ["perpetualsApiUrl", ["perpetualDeposit"]],
  ] as const)("rebuilds only endpoint owners when %s changes", (field, expected) => {
    const nextValue = field === "predictWsEnabled" ? true : "https://next.example.com";
    const nextConfig = { ...CONFIG, [field]: nextValue };

    expect(
      getChangedRuntimeClients(lifecycleInput(), lifecycleInput({ config: nextConfig })),
    ).toEqual(expected);
  });
});
