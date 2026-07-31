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

export interface AppClientBundle {
  chainStream: ChainStreamClient;
  api: Client;
  mediaTrack: MediaTrackClient;
  channels: ChannelsClient;
  predict: PredictClient;
  predictWs: PredictWsClient | null;
  portfolio: PortfolioClient;
  perpetuals: HyperliquidPerpetualsClient;
  perpetualDeposit: LiberFiPerpDepositClient | undefined;
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
import type { ChainStreamClient } from "@chainstream-io/sdk";
import type { Client } from "@liberfi.io/client";
import type { PredictClient, PredictWsClient } from "@liberfi.io/react-predict";
import type { ChannelsClient } from "@liberfi.io/ui-channels/client";
import type { MediaTrackClient } from "@liberfi.io/ui-media-track/client";
import type {
  HyperliquidPerpetualsClient,
  LiberFiPerpDepositClient,
} from "@liberfi.io/ui-perpetuals";
import type { PortfolioClient } from "@liberfi.io/ui-portfolio/client";
