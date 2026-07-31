import {
  PredictWsLifecycleClient,
  PredictWsRouteLifecycle,
  RuntimeConfig,
  RuntimeConfigPolicyInput,
  RuntimeClientKey,
  RuntimeEnvironment,
  RuntimeLifecycleInput,
  RuntimeProviderKey,
} from "./app-runtime.types";

export const APP_RUNTIME_PROVIDER_ORDER: readonly RuntimeProviderKey[] = [
  "query-client",
  "auth",
  "locale",
  "app-runtime",
  "pinata",
  "application-adapters",
  "chainstream-client",
  "api-client",
  "media-track",
  "channels",
  "predict",
  "polymarket",
  "portfolio-client",
  "portfolio-account",
  "perpetuals",
  "dex-data-runtime",
  "dex-data",
  "application-shell",
];

export function validateRuntimeProviderOrder(order: readonly RuntimeProviderKey[]): boolean {
  return (
    order.length === APP_RUNTIME_PROVIDER_ORDER.length &&
    order.every((provider, index) => provider === APP_RUNTIME_PROVIDER_ORDER[index])
  );
}

export function createPredictWsRouteLifecycle(
  client: PredictWsLifecycleClient | null,
): PredictWsRouteLifecycle {
  let active = false;

  return {
    enter() {
      if (!client || active) return;
      client.connect();
      active = true;
    },
    leave() {
      if (!client || !active) return;
      client.disconnect();
      active = false;
    },
  };
}

function requireRuntimeVariable(env: RuntimeEnvironment, name: string): string {
  const value = env[name];
  if (!value) {
    throw new Error(`Missing required runtime variable: ${name}`);
  }
  return value;
}

function resolveHttpEndpoint(value: string, origin: string): string {
  if (!origin || !value.startsWith("/")) return value;
  return new URL(value, origin).toString();
}

function requireWebSocketUrl(value: string, name: string): string {
  if (!value.startsWith("ws://") && !value.startsWith("wss://")) {
    throw new Error(`Invalid runtime variable ${name}: expected ws:// or wss:// URL`);
  }
  return value;
}

export function resolveRuntimeConfigPolicy({
  env,
  origin,
}: RuntimeConfigPolicyInput): RuntimeConfig {
  const dexAggregatorUrl = requireRuntimeVariable(env, "NEXT_PUBLIC_DEX_AGGREGATOR_URL");
  const mediaTrackUrl = requireRuntimeVariable(env, "NEXT_PUBLIC_MEDIA_TRACK_URL");
  const mediaTrackStreamUrl = requireRuntimeVariable(env, "NEXT_PUBLIC_MEDIA_TRACK_STREAM_URL");
  const channelsUrl = requireRuntimeVariable(env, "NEXT_PUBLIC_CHANNELS_URL");
  const predictUrl = requireRuntimeVariable(env, "NEXT_PUBLIC_PREDICT_URL");
  const predictWsEnabled = env.NEXT_PUBLIC_ENABLE_PREDICT_WS === "true";
  const predictWsUrl = predictWsEnabled
    ? requireWebSocketUrl(
        requireRuntimeVariable(env, "NEXT_PUBLIC_PREDICT_WS_URL"),
        "NEXT_PUBLIC_PREDICT_WS_URL",
      )
    : undefined;

  return {
    origin,
    dexAggregatorUrl: resolveHttpEndpoint(dexAggregatorUrl, origin),
    mediaTrackUrl: resolveHttpEndpoint(mediaTrackUrl, origin),
    mediaTrackStreamUrl: requireWebSocketUrl(
      mediaTrackStreamUrl,
      "NEXT_PUBLIC_MEDIA_TRACK_STREAM_URL",
    ),
    channelsUrl: resolveHttpEndpoint(channelsUrl, origin),
    predictUrl: resolveHttpEndpoint(predictUrl, origin),
    predictWsUrl,
    predictWsEnabled,
    perpetualsApiUrl: env.NEXT_PUBLIC_PERPETUALS_API_PATH
      ? resolveHttpEndpoint(env.NEXT_PUBLIC_PERPETUALS_API_PATH, origin)
      : undefined,
    perpetualsEnvironment: "mainnet",
  };
}

export function getChangedRuntimeClients(
  before: RuntimeLifecycleInput,
  after: RuntimeLifecycleInput,
): RuntimeClientKey[] {
  const dexTokenChanged = !Object.is(before.dexTokenProvider, after.dexTokenProvider);
  const configChanged = <K extends keyof RuntimeConfig>(key: K) =>
    !Object.is(before.config[key], after.config[key]);

  const changes: Array<[RuntimeClientKey, boolean]> = [
    ["chainStream", dexTokenChanged || configChanged("dexAggregatorUrl")],
    ["api", dexTokenChanged || configChanged("dexAggregatorUrl")],
    [
      "mediaTrack",
      dexTokenChanged || configChanged("mediaTrackUrl") || configChanged("mediaTrackStreamUrl"),
    ],
    [
      "channels",
      !Object.is(before.channelsAccessToken, after.channelsAccessToken) ||
        configChanged("channelsUrl"),
    ],
    ["predict", configChanged("predictUrl")],
    ["predictWs", configChanged("predictWsEnabled") || configChanged("predictWsUrl")],
    ["portfolio", configChanged("dexAggregatorUrl")],
    ["perpetuals", configChanged("perpetualsEnvironment")],
    ["perpetualDeposit", configChanged("perpetualsApiUrl")],
  ];

  return changes.filter(([, changed]) => changed).map(([client]) => client);
}
