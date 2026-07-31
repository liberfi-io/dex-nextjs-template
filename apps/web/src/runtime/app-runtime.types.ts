export type RuntimeEnvironment = Readonly<Record<string, string | undefined>>;

export interface RuntimeConfig {
  origin: string;
  dexAggregatorUrl: string;
  mediaTrackUrl: string;
  mediaTrackStreamUrl: string;
  channelsUrl: string;
  predictUrl: string;
  predictWsUrl: string | undefined;
  predictWsEnabled: boolean;
  perpetualsApiUrl: string | undefined;
  perpetualsEnvironment: "mainnet";
}

export interface RuntimeConfigPolicyInput {
  env: RuntimeEnvironment;
  origin: string;
}

export interface RuntimeLifecycleInput {
  config: RuntimeConfig;
  dexTokenProvider: unknown;
  channelsAccessToken: string | null;
  chain: string;
  walletAddress: string;
}

export type RuntimeClientKey =
  | "chainStream"
  | "api"
  | "mediaTrack"
  | "channels"
  | "predict"
  | "predictWs"
  | "portfolio"
  | "perpetuals"
  | "perpetualDeposit";

export type RuntimeProviderKey =
  | "query-client"
  | "auth"
  | "locale"
  | "app-runtime"
  | "pinata"
  | "application-adapters"
  | "chainstream-client"
  | "api-client"
  | "media-track"
  | "channels"
  | "predict"
  | "polymarket"
  | "portfolio-client"
  | "portfolio-account"
  | "perpetuals"
  | "dex-data-runtime"
  | "dex-data"
  | "application-shell";

export interface PredictWsLifecycleClient {
  connect(): void;
  disconnect(): void;
}

export interface PredictWsRouteLifecycle {
  enter(): void;
  leave(): void;
}
